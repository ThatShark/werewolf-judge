import { getRoleById } from '../data/roles';
import { isSeatWolfFaction } from './topFiveRoles';
import type {
  ActionCheckResult,
  CombatRuntimeState,
  NightActionDraft,
  NightActionType,
  NightStepScript,
  PlayerSeat,
  PumpkinGhostRuntimeState,
  RuleOverrides,
  ThirdPartySpecialRuntimeState,
} from './types';

export interface NightStepLockEvaluation {
  /** 是否強制鎖死所有座位點擊（不可使用技能） */
  locked: boolean;
  /** 上方顯示之鎖定原因 */
  reason: string | null;
  /** 若受寂夜導師／白晝學者影響，顯示調整後當晚可用次數（0=被削弱歸零, 2=被增幅為2次） */
  remainingSkillUses?: number;
  /** 寂夜導師／白晝學者影響提示（例如增幅提醒，不鎖死座位） */
  modifierNotice?: string | null;
}

export interface EvaluateNightStepLockInput {
  step: NightStepScript;
  round: number;
  seats: PlayerSeat[];
  draft: NightActionDraft;
  isClaimStage: boolean;
  witchAntidoteUsed: boolean;
  witchPoisonUsed: boolean;
  foxLostAbility: boolean;
  pumpkinGhostState: PumpkinGhostRuntimeState;
  combatState: CombatRuntimeState;
  thirdPartySpecialState?: ThirdPartySpecialRuntimeState;
  firstNightNoWolfKill?: boolean;
}

/**
 * 判斷指定夜晚出局的玩家在白天公布死訊後是否有遺言：
 * - 第一晚（round === 1）夜死有遺言。
 * - 第二晚起（round >= 2）夜死無遺言。
 */
export function shouldNightDeathHaveLastWords(round: number): boolean {
  return round === 1;
}

/**
 * 評估當前夜間步驟是否處於「強制無法使用技能」狀態（所有座位按鈕應鎖死禁用）：
 * 包含：角色已出局、血月封印、夢魘恐懼（狼隊或單體神職）、梅杜莎石化、企鵝冰凍、
 * 蝕時狼妃封鎖、睡美人沉睡、寂夜導師／白晝學者削弱導致次數歸零、技能永久失效／耗盡等。
 */
export function evaluateNightStepLockState(
  input: EvaluateNightStepLockInput,
): NightStepLockEvaluation {
  const {
    step,
    round,
    seats,
    draft,
    isClaimStage,
    witchAntidoteUsed,
    witchPoisonUsed,
    foxLostAbility,
    pumpkinGhostState,
    combatState,
    thirdPartySpecialState,
    firstNightNoWolfKill = false,
  } = input;

  if (isClaimStage) {
    return { locked: false, reason: null };
  }

  const matchingActorSeats =
    step.actorRoleIds.length === 0
      ? []
      : seats.filter((s) => Boolean(s.roleId) && step.actorRoleIds.includes(s.roleId!));
  const aliveActors = matchingActorSeats.filter((s) => s.isAlive);

  // 1. 角色已出局
  if (matchingActorSeats.length > 0 && aliveActors.length === 0) {
    return {
      locked: true,
      reason: '該角色已出局：請照常唸詞並停頓防暴露，技能操作已鎖死。',
    };
  }

  // 2. 血月封印（所有好人神職）
  const isGoodGodStep =
    step.actorRoleIds.length > 0 &&
    step.actorRoleIds.every((roleId) => {
      const role = getRoleById(roleId);
      return role?.faction === 'good' && role.category === 'god';
    });
  if (combatState.bloodMoonSealActiveTonight && isGoodGodStep) {
    return {
      locked: true,
      reason: '血月封印中：今晚所有好人神職技能全面封印，請照常唸詞，操作已鎖死。',
    };
  }

  // 3. 狼隊步驟：首夜無刀或夢魘恐懼到狼人
  if (step.actionType === 'wolf_kill') {
    if (firstNightNoWolfKill && round === 1) {
      return {
        locked: true,
        reason: '本板首夜狼人無刀：今晚狼隊無法落刀，請照常唸詞後推進。',
      };
    }
    const fearedSeat =
      draft.nightmareFearTarget != null
        ? seats.find((s) => s.seatNumber === draft.nightmareFearTarget)
        : undefined;
    if (fearedSeat && isSeatWolfFaction(fearedSeat)) {
      return {
        locked: true,
        reason: `狼隊遭夢魘恐懼（${fearedSeat.seatNumber} 號被恐懼）：今晚狼隊強制空刀，所有座位已鎖死。`,
      };
    }
  }

  // 以下單體角色封鎖檢查（排除資訊被動確認與夢魘自己）
  const isSingleActorAction =
    aliveActors.length > 0 &&
    step.actionType !== 'wolf_kill' &&
    step.actionType !== 'nightmare_fear' &&
    step.actionType !== 'confirm_only';

  if (isSingleActorAction) {
    // 4. 夢魘恐懼到當前行動角色
    if (
      draft.nightmareFearTarget != null &&
      aliveActors.every((s) => s.seatNumber === draft.nightmareFearTarget)
    ) {
      return {
        locked: true,
        reason: `遭夢魘恐懼（${draft.nightmareFearTarget} 號）：今晚無法使用技能，所有座位已鎖死。`,
      };
    }

    // 5. 梅杜莎石化（當晚或持續石化）
    if (
      step.actionType !== 'medusa_petrify' &&
      aliveActors.every(
        (s) => Boolean(s.petrified) || s.seatNumber === draft.medusaPetrifyTarget,
      )
    ) {
      return {
        locked: true,
        reason: '遭梅杜莎石化：今晚無法使用技能，所有座位已鎖死。',
      };
    }

    // 6. 企鵝冰凍
    if (
      step.actionType !== 'penguin_freeze' &&
      draft.penguinFreezeTarget != null &&
      aliveActors.every((s) => s.seatNumber === draft.penguinFreezeTarget)
    ) {
      return {
        locked: true,
        reason: `遭企鵝冰凍（${draft.penguinFreezeTarget} 號）：今晚無法使用技能，所有座位已鎖死。`,
      };
    }

    // 7. 蝕時狼妃封鎖
    if (
      step.actionType !== 'time_eclipse_lock' &&
      draft.timeEclipseTarget != null &&
      aliveActors.every((s) => s.seatNumber === draft.timeEclipseTarget)
    ) {
      return {
        locked: true,
        reason: `遭蝕時狼妃封鎖（${draft.timeEclipseTarget} 號）：今晚無法使用技能，所有座位已鎖死。`,
      };
    }

    // 8. 睡美人沉睡
    const sleepingSet = new Set(thirdPartySpecialState?.sleepingSeats ?? []);
    if (
      step.actionType !== 'sleeping_beauty_pick' &&
      sleepingSet.size > 0 &&
      aliveActors.every((s) => sleepingSet.has(s.seatNumber))
    ) {
      return {
        locked: true,
        reason: '處於沉睡狀態：今晚無法使用技能，所有座位已鎖死。',
      };
    }

    // 9. 寂夜導師／白晝學者 增幅／削弱（檢查是否導致剩餘技能次數歸零）
    if (
      step.actionType !== 'silent_night_mentor_action' &&
      step.actionType !== 'daylight_scholar_action'
    ) {
      let delta = 0;
      const sources: string[] = [];
      if (
        draft.silentNightMentorMode &&
        draft.silentNightMentorTarget != null &&
        aliveActors.every((s) => s.seatNumber === draft.silentNightMentorTarget)
      ) {
        if (draft.silentNightMentorMode === 'weaken') {
          delta -= 1;
          sources.push('寂夜導師削弱');
        } else if (draft.silentNightMentorMode === 'amplify') {
          delta += 1;
          sources.push('寂夜導師增幅');
        }
      }
      if (
        draft.daylightScholarMode &&
        draft.daylightScholarTarget != null &&
        aliveActors.every((s) => s.seatNumber === draft.daylightScholarTarget)
      ) {
        if (draft.daylightScholarMode === 'weaken') {
          delta -= 1;
          sources.push('白晝學者削弱');
        } else if (draft.daylightScholarMode === 'amplify') {
          delta += 1;
          sources.push('白晝學者增幅');
        }
      }
      if (sources.length > 0) {
        const remainingUses = Math.max(0, 1 + delta);
        if (remainingUses <= 0) {
          return {
            locked: true,
            remainingSkillUses: 0,
            reason: `受${sources.join('＋')}影響，今晚剩餘技能次數：0 次（所有座位已鎖死）。`,
          };
        }
        if (remainingUses > 1) {
          return {
            locked: false,
            remainingSkillUses: remainingUses,
            reason: null,
            modifierNotice: `受${sources.join('＋')}影響，今晚可用技能次數：${remainingUses} 次`,
          };
        }
      }
    }
  }

  // 10. 角色自身永久失能或藥水耗盡
  if (step.actionType === 'fox_check' && foxLostAbility) {
    return {
      locked: true,
      reason: '狐狸查驗能力已永久失效：請比失能手勢，所有座位已鎖死。',
    };
  }
  if (step.actionType === 'bee_wild_hunt_sting' && combatState.beeWildHuntLostAbility) {
    return {
      locked: true,
      reason: '蜂之狂獵技能已永久失效：所有座位已鎖死。',
    };
  }
  if (step.actionType === 'witch_action' && witchAntidoteUsed && witchPoisonUsed) {
    return {
      locked: true,
      reason: '女巫解藥與毒藥皆已耗盡：請照常唸詞，所有座位已鎖死。',
    };
  }
  if (step.actionType === 'pumpkin_ghost_check' && !pumpkinGhostState.hasInherited) {
    return {
      locked: true,
      reason: '石像鬼仍存活，南瓜鬼尚未繼承查驗能力：所有座位已鎖死。',
    };
  }

  return { locked: false, reason: null };
}

export interface MandatoryTargetCheckInput {
  actionType: NightActionType;
  round: number;
  ruleOverrides: RuleOverrides;
  pendingTarget: number | null;
  pendingDualTargets: [number | null, number | null];
  pendingMultiTargets: number[];
}

/**
 * 檢查「強制使用技能」步驟是否已選滿必要目標。
 * 未選滿時回傳 { allowed: false, reason }，UI 必須徹底禁用鎖死底部「下一步」按鈕。
 */
export function checkMandatoryNightTarget(
  input: MandatoryTargetCheckInput,
): ActionCheckResult {
  const {
    actionType,
    round,
    ruleOverrides,
    pendingTarget,
    pendingDualTargets,
    pendingMultiTargets,
  } = input;

  switch (actionType) {
    case 'mech_wolf_learn':
      if (round === 1 && ruleOverrides.mechWolfForceLearnNight1 && pendingTarget === null) {
        return { allowed: false, reason: '機械狼第一晚強制學習：請先選擇一名其他玩家' };
      }
      return { allowed: true };
    case 'hybrid_choose':
      if (round === 1 && pendingTarget === null) {
        return { allowed: false, reason: '混血兒第一晚必選一名榜樣' };
      }
      return { allowed: true };
    case 'dream_catcher_dream':
      if (pendingTarget === null) {
        return { allowed: false, reason: '攝夢人每晚必選一名自己以外的存活玩家' };
      }
      return { allowed: true };
    case 'awakened_dream_catcher_dream':
      if (pendingTarget === null) {
        return { allowed: false, reason: '覺醒攝夢人每晚必選一名夢語者' };
      }
      return { allowed: true };
    case 'wild_child_choose':
      if (round === 1 && pendingTarget === null) {
        return { allowed: false, reason: '野孩子第一晚必選一名榜樣' };
      }
      return { allowed: true };
    case 'shadow_choose':
      if (round === 1 && pendingTarget === null) {
        return { allowed: false, reason: '影子第一晚必選一名目標' };
      }
      return { allowed: true };
    case 'awakened_lonely_girl_choose':
      if (round === 1 && pendingTarget === null) {
        return { allowed: false, reason: '覺醒孤獨少女第一晚必選一名榜樣' };
      }
      return { allowed: true };
    case 'cupid_link':
      if (round === 1 && (pendingDualTargets[0] === null || pendingDualTargets[1] === null)) {
        return { allowed: false, reason: '邱比特第一晚必選 2 位情侶目標' };
      }
      return { allowed: true };
    case 'ghost_bride_link':
      if (round === 1 && (pendingDualTargets[0] === null || pendingDualTargets[1] === null)) {
        return { allowed: false, reason: '鬼魂新娘第一晚必選新郎與證婚人共 2 位' };
      }
      return { allowed: true };
    case 'scent_phantom_link':
      if (round === 1 && (pendingDualTargets[0] === null || pendingDualTargets[1] === null)) {
        return { allowed: false, reason: '尋香魅影第一晚必選 2 位連線目標' };
      }
      return { allowed: true };
    case 'dancer_dance':
      if (pendingMultiTargets.length > 0 && pendingMultiTargets.length < 3) {
        return { allowed: false, reason: '舞者舞池須選滿 3 位玩家（或取消改為不發動）' };
      }
      return { allowed: true };
    case 'alchemy_witch_fog':
      if (pendingMultiTargets.length > 0 && pendingMultiTargets.length < 3) {
        return { allowed: false, reason: '未明之霧須選滿 3 位玩家（或取消改為不發動）' };
      }
      return { allowed: true };
    default:
      return { allowed: true };
  }
}
