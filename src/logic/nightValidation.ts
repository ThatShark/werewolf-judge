import { getRoleById } from '../data/roles';
import { isSeatEffectiveWolf } from './factionHelpers';
import { isSeatAsleep } from './thirdPartySpecialRoles';
import { isSeatWolfFaction } from './topFiveRoles';
import type {
  ActionCheckResult,
  CombatRuntimeState,
  ConversionRuntimeState,
  FinalBatchRuntimeState,
  GargoyleRuntimeState,
  HiddenWolfRuntimeState,
  InterferenceRuntimeState,
  NightActionDraft,
  NightActionType,
  NightStepScript,
  PlayerSeat,
  PumpkinGhostRuntimeState,
  RuleOverrides,
  ThirdPartySpecialRuntimeState,
  TreasureMasterRuntimeState,
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
  conversionState?: ConversionRuntimeState;
  finalBatchState?: FinalBatchRuntimeState;
  interferenceState?: InterferenceRuntimeState;
  hiddenWolfState?: HiddenWolfRuntimeState;
  gargoyleState?: GargoyleRuntimeState;
  treasureMasterState?: TreasureMasterRuntimeState;
  boardId?: string;
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
    conversionState,
    finalBatchState,
    interferenceState,
    hiddenWolfState,
    gargoyleState,
    treasureMasterState,
    boardId,
  } = input;

  if (isClaimStage) {
    return { locked: false, reason: null };
  }

  const isJackSecondIdStep =
    step.actionType === 'jack_ripper_action' && boardId === '12p-jack-the-ripper-2';

  const matchingActorSeats = isJackSecondIdStep
    ? seats.filter((s) => s.secondRoleId === 'jack_the_ripper')
    : step.actorRoleIds.length === 0
      ? []
      : seats.filter((s) => Boolean(s.roleId) && step.actorRoleIds.includes(s.roleId!));
  const aliveActors = matchingActorSeats.filter((s) => s.isAlive);

  // 取得可落刀之有效狼人清單（排除尚未歸隊的孤狼：隱狼、石像鬼、未單獨執刀之盜寶大師）
  const aliveKnifeWolves =
    step.actionType === 'wolf_kill'
      ? seats.filter((s) => {
          if (!s.isAlive) return false;
          if (s.roleId === 'hidden_wolf' && !hiddenWolfState?.hasJoinedWolfTeam && !s.statuses.infectedBySeedWolf) {
            return false;
          }
          if (s.roleId === 'gargoyle' && !gargoyleState?.hasJoinedWolfTeam && !s.statuses.infectedBySeedWolf) {
            return false;
          }
          if (s.roleId === 'night_noble' && !s.statuses.infectedBySeedWolf) {
            return false;
          }
          if (s.roleId === 'wolf_girl' && !s.statuses.infectedBySeedWolf) {
            return false;
          }
          if (s.roleId === 'treasure_master' && !s.statuses.infectedBySeedWolf) {
            // 若場上尚有其他有效狼人，盜寶大師尚未歸隊執刀
            const hasOtherEffectiveWolf = seats.some(
              (other) =>
                other.isAlive &&
                other.seatNumber !== s.seatNumber &&
                other.roleId !== 'hidden_wolf' &&
                other.roleId !== 'gargoyle' &&
                other.roleId !== 'treasure_master' &&
                other.roleId !== 'night_noble' &&
                other.roleId !== 'wolf_girl' &&
                (isSeatWolfFaction(other) ||
                  isSeatEffectiveWolf(other, { conversionState, thirdPartySpecialState })),
            );
            if (hasOtherEffectiveWolf || !treasureMasterState) {
              return false;
            }
          }
          return (
            isSeatWolfFaction(s) ||
            isSeatEffectiveWolf(s, { conversionState, thirdPartySpecialState })
          );
        })
      : [];

  // 1. 角色已出局（狼人落刀改以有效可執刀狼人判定，避免隱狼/感染狼/覺醒狼已接刀卻被誤鎖）
  if (step.actionType === 'wolf_kill') {
    if (matchingActorSeats.length > 0 && aliveKnifeWolves.length === 0) {
      return {
        locked: true,
        reason: '場上可落刀狼人皆已出局（僅存未歸隊孤狼或無狼刀）：今晚無法落刀，操作已鎖死。',
      };
    }
  } else if (matchingActorSeats.length > 0 && aliveActors.length === 0) {
    return {
      locked: true,
      reason: '該角色已出局：請照常唸詞並停頓防暴露，技能操作已鎖死。',
    };
  }

  // 2. 血月封印（所有好人神職；雙子與異族王子屬於平民分類，不受影響）
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

  // 3. 狼隊步驟：首夜無刀、夢魘恐懼、全員沉睡，或僅存單狼遭冰凍／石化／魅惑／削弱歸零
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
    if (
      fearedSeat &&
      (isSeatWolfFaction(fearedSeat) ||
        isSeatEffectiveWolf(fearedSeat, { conversionState, thirdPartySpecialState }))
    ) {
      return {
        locked: true,
        reason: `狼隊遭夢魘恐懼（${fearedSeat.seatNumber} 號被恐懼）：今晚狼隊強制空刀，所有座位已鎖死。`,
      };
    }
    if (
      aliveKnifeWolves.length > 0 &&
      aliveKnifeWolves.every((w) => isSeatAsleep(seats, thirdPartySpecialState, w.seatNumber))
    ) {
      return {
        locked: true,
        reason: '所有存活狼人皆處於睡美人沉睡狀態：今晚狼隊強制空刀，所有座位已鎖死。',
      };
    }
    if (aliveKnifeWolves.length === 1) {
      const soleWolf = aliveKnifeWolves[0];
      if (soleWolf.statuses.petrified || draft.medusaPetrifyTarget === soleWolf.seatNumber) {
        return {
          locked: true,
          reason: `唯一執刀狼（${soleWolf.seatNumber} 號）遭梅杜莎石化：今晚無法落刀，所有座位已鎖死。`,
        };
      }
      if (draft.penguinFreezeTarget === soleWolf.seatNumber) {
        return {
          locked: true,
          reason: `唯一執刀狼（${soleWolf.seatNumber} 號）遭企鵝冰凍：今晚無法落刀，所有座位已鎖死。`,
        };
      }
      if (draft.foxCubCharmTarget === soleWolf.seatNumber) {
        return {
          locked: true,
          reason: `唯一執刀狼（${soleWolf.seatNumber} 號）遭狐妖魅惑：今晚無法落刀，所有座位已鎖死。`,
        };
      }
      const weakenedByMentor =
        draft.silentNightMentorMode === 'weaken' &&
        draft.silentNightMentorTarget === soleWolf.seatNumber;
      const weakenedByScholar =
        draft.daylightScholarMode === 'weaken' &&
        draft.daylightScholarTarget === soleWolf.seatNumber;
      const amplifiedByMentor =
        draft.silentNightMentorMode === 'amplify' &&
        draft.silentNightMentorTarget === soleWolf.seatNumber;
      const amplifiedByScholar =
        draft.daylightScholarMode === 'amplify' &&
        draft.daylightScholarTarget === soleWolf.seatNumber;
      const delta =
        (weakenedByMentor ? -1 : amplifiedByMentor ? 1 : 0) +
        (weakenedByScholar ? -1 : amplifiedByScholar ? 1 : 0);
      if (1 + delta <= 0) {
        return {
          locked: true,
          remainingSkillUses: 0,
          reason: `唯一執刀狼（${soleWolf.seatNumber} 號）技能被削弱至 0 次：今晚無法落刀，所有座位已鎖死。`,
        };
      }
    }
  }

  // 以下單體角色封鎖檢查（排除資訊被動確認與夢魘自己）
  const isSingleActorAction =
    aliveActors.length > 0 &&
    step.actionType !== 'wolf_kill' &&
    step.actionType !== 'nightmare_fear' &&
    step.actionType !== 'confirm_only';

  if (isSingleActorAction) {
    // 4. 夢魘恐懼到當前行動角色（混血兒與邱比特首夜選榜樣/連情侶不因恐懼鎖死選取）
    const isExemptFromFearLock =
      round === 1 &&
      (step.actionType === 'hybrid_choose' || step.actionType === 'cupid_link');
    if (
      !isExemptFromFearLock &&
      draft.nightmareFearTarget != null &&
      aliveActors.every((s) => s.seatNumber === draft.nightmareFearTarget)
    ) {
      return {
        locked: true,
        reason: `遭夢魘恐懼（${draft.nightmareFearTarget} 號）：今晚無法使用技能，所有座位已鎖死。`,
      };
    }

    // 5. 梅杜莎石化（當晚或持續石化；柏修斯免疫石化除非被種狼感染）
    const isPerseusExempt = (s: PlayerSeat) =>
      s.roleId === 'perseus' && !s.statuses.infectedBySeedWolf;
    if (
      step.actionType !== 'medusa_petrify' &&
      aliveActors.every(
        (s) =>
          !isPerseusExempt(s) &&
          (Boolean(s.statuses.petrified) || s.seatNumber === draft.medusaPetrifyTarget),
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

    // 7. 睡美人沉睡（使用 isSeatAsleep，外族王子先天免疫）
    if (
      step.actionType !== 'sleeping_beauty_pick' &&
      aliveActors.every((s) => isSeatAsleep(seats, thirdPartySpecialState, s.seatNumber))
    ) {
      return {
        locked: true,
        reason: '處於沉睡狀態：今晚無法使用技能，所有座位已鎖死。',
      };
    }

    // 8. 寂夜導師／白晝學者 增幅／削弱（覺醒石像鬼與尋香魅影不受削弱；女巫削弱仍可用解藥）
    const isExemptFromWeaken =
      step.actionType === 'awakened_gargoyle_convert' ||
      step.actionType === 'scent_phantom_link';
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
          if (!isExemptFromWeaken) {
            delta -= 1;
            sources.push('寂夜導師削弱');
          }
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
          if (!isExemptFromWeaken) {
            delta -= 1;
            sources.push('白晝學者削弱');
          }
        } else if (draft.daylightScholarMode === 'amplify') {
          delta += 1;
          sources.push('白晝學者增幅');
        }
      }
      if (sources.length > 0) {
        const remainingUses = Math.max(0, 1 + delta);
        if (remainingUses <= 0) {
          if (step.actionType === 'witch_action' && !witchAntidoteUsed) {
            return {
              locked: false,
              remainingSkillUses: 0,
              reason: null,
              modifierNotice: `受${sources.join('＋')}影響：今晚無法使用毒藥，但仍可使用解藥救人。`,
            };
          }
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
  if (
    step.actionType === 'awakened_witch_action' &&
    interferenceState?.awakenedWitchAntidoteUsed &&
    (interferenceState?.awakenedWitchPoisonsUsed ?? 0) >= 3
  ) {
    return {
      locked: true,
      reason: '覺醒女巫解藥與三瓶毒藥皆已耗盡：所有座位已鎖死。',
    };
  }
  if (step.actionType === 'fortune_teller_mark' && interferenceState?.fortuneTellerUsed) {
    return {
      locked: true,
      reason: '命運先知預言標記已使用過：本局無法重複發動，所有座位已鎖死。',
    };
  }
  if (
    step.actionType === 'police_dog_action' &&
    (!finalBatchState?.policeDogActivatedRound ||
      round < finalBatchState.policeDogActivatedRound ||
      finalBatchState?.policeDogUsed)
  ) {
    return {
      locked: true,
      reason:
        !finalBatchState?.policeDogActivatedRound || round < finalBatchState.policeDogActivatedRound
          ? '警犬尚未被偵探處決激活：今晚無法行動，所有座位已鎖死。'
          : '警犬技能已使用完畢：所有座位已鎖死。',
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
    case 'wolf_girl_confess':
      if (round === 1 && pendingTarget === null) {
        return { allowed: false, reason: '狼女孩第一晚必選一名告白對象' };
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
