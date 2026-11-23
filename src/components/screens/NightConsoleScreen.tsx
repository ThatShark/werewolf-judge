import { useCallback, useEffect, useMemo, useState } from 'react';
import { ttsEngine } from '../../audio/ttsEngine';
import { getBoardById } from '../../data/boards';
import { getRoleById } from '../../data/roles';
import {
  applyMechWolfLearn,
  canDreamCatcherDream,
  canGuardTarget,
  canMechWolfLearn,
  canMechWolfUseLearnedSkill,
  canWitchUseAntidote,
  canWitchUsePoison,
  canWolfBeautyCharm,
  findMechWolfSeat,
  getNightSteps,
  getPsychicCheckResult,
  getSeerCheckResult,
  getStepClaimSummary,
  getUnclaimedSeatNumbers,
} from '../../logic';
import type { ActionCheckResult, NightActionDraft, NightActionType } from '../../logic/types';
import { useGameStore } from '../../store/gameStore';
import { ConfirmModal } from '../common/ConfirmModal';
import { SeatStatusDrawer } from '../common/SeatStatusDrawer';
import { SlideDrawer } from '../common/SlideDrawer';
import {
  formatSeatShort,
  getRoleBadgeClasses,
  splitSeatsIntoSymmetricColumns,
} from '../common/displayHelpers';
import {
  OnlineJudgeOverlay,
  type OnlineJudgeOverlayMode,
} from '../night/OnlineJudgeOverlay';

interface NightConsoleScreenProps {
  onOpenHistory?: () => void;
  onOpenQA?: () => void;
}

const BUFFER_PRESET_STEPS = [0, 3, 5, 8, 10];

function getInitialTargetForStep(
  actionType: NightActionType,
  draft: NightActionDraft,
): number | null {
  switch (actionType) {
    case 'wolf_kill':
      return draft.wolfTarget;
    case 'guard_protect':
      return draft.guardTarget;
    case 'witch_action':
      return draft.witchPoisonTarget;
    case 'seer_check':
      return draft.seerCheckTarget;
    case 'psychic_check':
      return draft.psychicCheckTarget;
    case 'mech_wolf_learn':
      return draft.mechWolfLearnTarget;
    case 'mech_wolf_night_action':
      return draft.mechWolfSkillTarget;
    case 'wolf_beauty_charm':
      return draft.wolfBeautyCharmTarget ?? null;
    case 'dream_catcher_dream':
      return draft.dreamCatcherTarget ?? null;
    default:
      return null;
  }
}

function getSeatActionIcons(
  seatNumber: number,
  draft: NightActionDraft,
  options: {
    isOnlineJudge: boolean;
    currentActionType: NightActionType;
    showWolfTargetToWitch: boolean;
  },
): string[] {
  const icons: string[] = [];
  if (options.isOnlineJudge) {
    if (
      options.currentActionType === 'witch_action' &&
      options.showWolfTargetToWitch &&
      draft.wolfTarget === seatNumber
    ) {
      icons.push('🐺');
    }
    return icons;
  }

  if (draft.wolfTarget === seatNumber) icons.push('🐺');
  if (draft.guardTarget === seatNumber) icons.push('🛡️');
  if (draft.witchUseAntidote && draft.wolfTarget === seatNumber) icons.push('💊');
  if (draft.witchPoisonTarget === seatNumber) icons.push('☠️');
  if (draft.seerCheckTarget === seatNumber || draft.psychicCheckTarget === seatNumber) {
    icons.push('🔮');
  }
  if (draft.wolfBeautyCharmTarget === seatNumber) icons.push('💘');
  if (draft.dreamCatcherTarget === seatNumber) icons.push('💤');
  if (draft.mechWolfLearnTarget === seatNumber || draft.mechWolfSkillTarget === seatNumber) {
    icons.push('🤖');
  }
  return icons;
}

export function NightConsoleScreen({ onOpenHistory, onOpenQA }: NightConsoleScreenProps) {
  const selectedBoardId = useGameStore((s) => s.selectedBoardId);
  const round = useGameStore((s) => s.round);
  const seats = useGameStore((s) => s.seats);
  const hostMode = useGameStore((s) => s.hostMode);
  const onlineJudgeSettings = useGameStore((s) => s.onlineJudgeSettings);
  const ruleOverrides = useGameStore((s) => s.ruleOverrides);
  const currentStepIndex = useGameStore((s) => s.currentStepIndex);
  const currentNightDraft = useGameStore((s) => s.currentNightDraft);
  const witchAntidoteUsed = useGameStore((s) => s.witchAntidoteUsed);
  const witchPoisonUsed = useGameStore((s) => s.witchPoisonUsed);
  const lastGuardedSeat = useGameStore((s) => s.lastGuardedSeat);
  const mechWolfState = useGameStore((s) => s.mechWolfState);
  const pendingSelfExplodeSeat = useGameStore((s) => s.pendingSelfExplodeSeat);
  const lastCharmedSeat = useGameStore((s) => s.lastCharmedSeat);
  const lastDreamTarget = useGameStore((s) => s.lastDreamTarget);

  const claimSeatRole = useGameStore((s) => s.claimSeatRole);
  const updateOnlineJudgeSettings = useGameStore((s) => s.updateOnlineJudgeSettings);
  const updateNightDraft = useGameStore((s) => s.updateNightDraft);
  const nextNightStep = useGameStore((s) => s.nextNightStep);
  const prevNightStep = useGameStore((s) => s.prevNightStep);
  const finishNight = useGameStore((s) => s.finishNight);

  const isOnlineJudge = hostMode.judgeMode === 'online_judge';
  const isPhysicalDealFirstNight = hostMode.dealMode === 'physical_deal' && round === 1;
  const ttsSupported = useMemo(() => ttsEngine.isSupported(), []);

  const board = getBoardById(selectedBoardId);
  const steps = useMemo(() => (board ? getNightSteps(board, round) : []), [board, round]);
  const currentStep = steps[currentStepIndex];

  // 防誤觸預選狀態（本地草稿，點擊「確認紀錄」才寫入 Store）
  const [pendingTarget, setPendingTarget] = useState<number | null>(() =>
    currentStep ? getInitialTargetForStep(currentStep.actionType, currentNightDraft) : null,
  );
  const [pendingUseAntidote, setPendingUseAntidote] = useState<boolean>(
    () => currentNightDraft.witchUseAntidote,
  );
  const [revealConfirmed, setRevealConfirmed] = useState(false);

  // 實體發牌首夜認領狀態
  const [activeClaimRoleId, setActiveClaimRoleId] = useState<string | null>(null);
  const [pendingClaimSeat, setPendingClaimSeat] = useState<number | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [forceEditClaims, setForceEditClaims] = useState(false);

  // 實體法官抽屜與遮罩
  const [maskSeatRoles, setMaskSeatRoles] = useState(false);
  const [confirmFinishOpen, setConfirmFinishOpen] = useState(false);
  const [confirmWitchPotionOpen, setConfirmWitchPotionOpen] = useState(false);
  const [seatDrawerOpen, setSeatDrawerOpen] = useState(false);
  const [scriptDrawerOpen, setScriptDrawerOpen] = useState(false);

  // 線上法官防窺過渡狀態機
  const [onlinePhase, setOnlinePhase] = useState<'blackout' | 'active' | 'buffer' | 'dawn'>(() =>
    isOnlineJudge ? 'blackout' : 'active',
  );
  const [bufferRemaining, setBufferRemaining] = useState(onlineJudgeSettings.stepBufferSeconds);

  const claimSummary = useMemo(() => {
    if (!board || !currentStep || !isPhysicalDealFirstNight) return null;
    return getStepClaimSummary(board, seats, currentStep.actorRoleIds);
  }, [board, currentStep, isPhysicalDealFirstNight, seats]);

  const isClaimStage = Boolean(
    isPhysicalDealFirstNight &&
      claimSummary &&
      claimSummary.requiresClaiming &&
      (!claimSummary.isComplete || forceEditClaims),
  );

  // 切換步驟或回合時重置本地預選與防窺狀態
  useEffect(() => {
    if (!currentStep) return;
    setPendingTarget(getInitialTargetForStep(currentStep.actionType, currentNightDraft));
    setPendingUseAntidote(currentNightDraft.witchUseAntidote);
    setRevealConfirmed(false);
    setPendingClaimSeat(null);
    setClaimError(null);
    setForceEditClaims(false);
    setOnlinePhase(isOnlineJudge ? 'blackout' : 'active');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, currentStepIndex, isOnlineJudge]);

  // 自動挑選尚待認領的角色分頁
  useEffect(() => {
    if (!claimSummary || claimSummary.roles.length === 0) {
      setActiveClaimRoleId(null);
      return;
    }
    const currentStillValid = claimSummary.roles.some((r) => r.roleId === activeClaimRoleId);
    const currentStatus = claimSummary.roles.find((r) => r.roleId === activeClaimRoleId);
    if (!currentStillValid || (currentStatus && currentStatus.remainingCount === 0)) {
      const nextUnfinished =
        claimSummary.roles.find((r) => r.remainingCount > 0) ?? claimSummary.roles[0];
      setActiveClaimRoleId(nextUnfinished.roleId);
    }
  }, [claimSummary, activeClaimRoleId]);

  // 線上法官：進入 blackout / dawn 時自動 TTS 播報
  useEffect(() => {
    if (!isOnlineJudge || !currentStep) return;
    if (onlinePhase === 'blackout') {
      ttsEngine.speak(currentStep.openPrompt, {
        enabled: onlineJudgeSettings.ttsEnabled,
        rate: onlineJudgeSettings.ttsRate,
      });
    } else if (onlinePhase === 'dawn') {
      ttsEngine.speak('天亮了，請睜眼', {
        enabled: onlineJudgeSettings.ttsEnabled,
        rate: onlineJudgeSettings.ttsRate,
      });
    }
  }, [
    isOnlineJudge,
    onlinePhase,
    currentStep,
    onlineJudgeSettings.ttsEnabled,
    onlineJudgeSettings.ttsRate,
  ]);

  // 元件卸載時停止語音與 iOS 音訊通道保活
  useEffect(() => {
    return () => {
      ttsEngine.cancel();
      ttsEngine.stopKeepAlive();
    };
  }, []);

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex >= steps.length - 1;

  const completeBufferTransition = useCallback(() => {
    if (isLastStep) {
      setOnlinePhase('dawn');
    } else {
      nextNightStep();
      setOnlinePhase('blackout');
    }
  }, [isLastStep, nextNightStep]);

  // 線上法官：閉眼緩衝倒數計時
  useEffect(() => {
    if (!isOnlineJudge || onlinePhase !== 'buffer') return;
    if (bufferRemaining <= 0) {
      completeBufferTransition();
      return;
    }
    const timer = window.setTimeout(() => {
      setBufferRemaining((prev) => prev - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [isOnlineJudge, onlinePhase, bufferRemaining, completeBufferTransition]);

  const matchingActorSeats = useMemo(() => {
    if (!currentStep || currentStep.actorRoleIds.length === 0) return [];
    return seats.filter(
      (seat) => Boolean(seat.roleId) && currentStep.actorRoleIds.includes(seat.roleId!),
    );
  }, [currentStep, seats]);

  const actorSeatsAlive = useMemo(() => {
    if (!currentStep || currentStep.actorRoleIds.length === 0) return true;
    return matchingActorSeats.some((seat) => seat.isAlive);
  }, [currentStep, matchingActorSeats]);

  const showDeadActorWarning =
    !isOnlineJudge &&
    !isClaimStage &&
    matchingActorSeats.length > 0 &&
    matchingActorSeats.every((seat) => !seat.isAlive);

  const relatedQAs = useMemo(() => {
    if (!board || !currentStep) return [];
    const roleSet = new Set(currentStep.actorRoleIds);
    return board.qaList.filter((qa) => qa.relatedRoleIds?.some((id) => roleSet.has(id)));
  }, [board, currentStep]);

  const effectiveMechWolfForPreview = useMemo(() => {
    if (round !== 1) return mechWolfState;
    return applyMechWolfLearn(mechWolfState, seats, currentNightDraft.mechWolfLearnTarget);
  }, [round, mechWolfState, seats, currentNightDraft.mechWolfLearnTarget]);

  const unclaimedSeats = useMemo(() => getUnclaimedSeatNumbers(seats), [seats]);

  if (!board || !currentStep) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center text-sm text-slate-300">
        無法載入夜間主持步驟，請重開新局。
      </div>
    );
  }

  const mechWolfSeat = findMechWolfSeat(seats);
  const dreamCatcherSeat = seats.find((s) => s.roleId === 'dream_catcher');
  const hunterSeat = seats.find((s) => s.roleId === 'hunter');

  const isInfoRevealStep =
    currentStep.actionType === 'seer_check' ||
    currentStep.actionType === 'psychic_check' ||
    (currentStep.actionType === 'mech_wolf_night_action' &&
      mechWolfState.learnedRoleId === 'psychic');

  // 女巫解藥檢核（以本地預選狀態評估互斥）
  const antidoteCheck = canWitchUseAntidote(
    seats,
    round,
    currentNightDraft.wolfTarget,
    witchAntidoteUsed,
    ruleOverrides,
  );
  const antidoteBlockedByPoison = pendingTarget !== null;

  // 確認紀錄前的純規則檢核（一律呼叫 src/logic/）
  const pendingValidation: ActionCheckResult = (() => {
    if (isClaimStage) return { allowed: true };
    switch (currentStep.actionType) {
      case 'guard_protect':
        return actorSeatsAlive
          ? canGuardTarget(lastGuardedSeat, pendingTarget, seats)
          : { allowed: true };
      case 'witch_action':
        if (pendingUseAntidote) {
          if (pendingTarget !== null) {
            return { allowed: false, reason: '女巫解藥與毒藥不可在同一晚同時使用' };
          }
          return antidoteCheck;
        }
        if (pendingTarget !== null) {
          return canWitchUsePoison(seats, pendingUseAntidote, pendingTarget, witchPoisonUsed);
        }
        return { allowed: true };
      case 'mech_wolf_learn':
        return round === 1 && mechWolfSeat?.isAlive
          ? canMechWolfLearn(seats, pendingTarget, ruleOverrides, round)
          : { allowed: true };
      case 'mech_wolf_night_action':
        return pendingTarget !== null
          ? canMechWolfUseLearnedSkill(mechWolfState, seats, pendingTarget, round)
          : { allowed: true };
      case 'wolf_beauty_charm':
        return actorSeatsAlive && pendingTarget !== null
          ? canWolfBeautyCharm(seats, lastCharmedSeat, pendingTarget)
          : { allowed: true };
      case 'dream_catcher_dream':
        return dreamCatcherSeat?.isAlive
          ? canDreamCatcherDream(seats, pendingTarget)
          : { allowed: true };
      default:
        return { allowed: true };
    }
  })();

  // 查驗即時結果（僅於點擊「確認紀錄」鎖定後揭曉）
  const seerOutcome =
    currentStep.actionType === 'seer_check' && revealConfirmed && pendingTarget !== null
      ? getSeerCheckResult(seats, pendingTarget)
      : null;

  const psychicOutcome =
    currentStep.actionType === 'psychic_check' && revealConfirmed && pendingTarget !== null
      ? getPsychicCheckResult(seats, effectiveMechWolfForPreview, pendingTarget)
      : null;

  const mechWolfPsychicOutcome =
    currentStep.actionType === 'mech_wolf_night_action' &&
    mechWolfState.learnedRoleId === 'psychic' &&
    revealConfirmed &&
    pendingTarget !== null
      ? getPsychicCheckResult(seats, mechWolfState, pendingTarget)
      : null;

  const isHunterPoisonedTonight =
    hunterSeat !== undefined &&
    (currentNightDraft.witchPoisonTarget === hunterSeat.seatNumber ||
      (round >= 2 &&
        mechWolfState.learnedRoleId === 'witch' &&
        currentNightDraft.mechWolfSkillTarget === hunterSeat.seatNumber));

  const wolfTargetSeat =
    currentNightDraft.wolfTarget !== null
      ? seats.find((s) => s.seatNumber === currentNightDraft.wolfTarget)
      : undefined;

  const mechLearnedTargetSeat =
    currentNightDraft.mechWolfLearnTarget !== null
      ? seats.find((s) => s.seatNumber === currentNightDraft.mechWolfLearnTarget)
      : undefined;

  const isSeatSelectableForSkill =
    currentStep.actionType !== 'hunter_gesture' &&
    currentStep.actionType !== 'mech_wolf_reveal_skill' &&
    currentStep.actionType !== 'confirm_only' &&
    !(isInfoRevealStep && revealConfirmed);

  // 判斷單一座位在「認領階段」或「技能階段」的按鈕狀態
  const getSeatControl = (
    seatNumber: number,
  ): {
    selected: boolean;
    disabled: boolean;
    reason?: string;
    onSelect: () => void;
  } => {
    const seat = seats.find((s) => s.seatNumber === seatNumber);

    if (isClaimStage) {
      const isClaimedByActive = seat?.roleId === activeClaimRoleId && activeClaimRoleId !== null;
      const isClaimedByOther =
        seat?.roleId !== null && seat?.roleId !== undefined && seat.roleId !== activeClaimRoleId;
      const activeRoleStatus = claimSummary?.roles.find((r) => r.roleId === activeClaimRoleId);
      const isRoleFull =
        !isClaimedByActive &&
        activeRoleStatus !== undefined &&
        activeRoleStatus.remainingCount <= 0 &&
        !board.isFlexibleComposition &&
        !board.presetPlayerCounts?.length &&
        !board.playerCountRange;

      const disabled = !activeClaimRoleId || isClaimedByOther || isRoleFull;
      const otherRoleName =
        isClaimedByOther && !isOnlineJudge
          ? (getRoleById(seat?.roleId)?.name ?? seat?.roleId ?? '其他身分')
          : '已認領';

      return {
        selected: pendingClaimSeat === seatNumber,
        disabled,
        reason: isClaimedByOther
          ? isOnlineJudge
            ? '已認領'
            : `已為${otherRoleName}`
          : isRoleFull
            ? '人數已滿'
            : undefined,
        onSelect: () => {
          setClaimError(null);
          setPendingClaimSeat((prev) => (prev === seatNumber ? null : seatNumber));
        },
      };
    }

    if (!isSeatSelectableForSkill) {
      return {
        selected: pendingTarget === seatNumber,
        disabled: true,
        onSelect: () => {},
      };
    }

    const isAlive = seat?.isAlive ?? false;
    const toggleTarget = () =>
      setPendingTarget((prev) => (prev === seatNumber ? null : seatNumber));

    switch (currentStep.actionType) {
      case 'wolf_kill': {
        const isWolfBeauty = isAlive && seat?.roleId === 'wolf_beauty';
        return {
          selected: pendingTarget === seatNumber,
          disabled: !isAlive || isWolfBeauty,
          reason: !isAlive ? '已出局' : isWolfBeauty ? '狼美禁自刀' : undefined,
          onSelect: toggleTarget,
        };
      }
      case 'guard_protect': {
        const check = canGuardTarget(lastGuardedSeat, seatNumber, seats);
        return {
          selected: pendingTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: toggleTarget,
        };
      }
      case 'witch_action': {
        const check = canWitchUsePoison(seats, pendingUseAntidote, seatNumber, witchPoisonUsed);
        return {
          selected: pendingTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: toggleTarget,
        };
      }
      case 'seer_check':
      case 'psychic_check':
        return {
          selected: pendingTarget === seatNumber,
          disabled: !isAlive,
          reason: !isAlive ? '已出局' : undefined,
          onSelect: toggleTarget,
        };
      case 'mech_wolf_learn': {
        const check = canMechWolfLearn(seats, seatNumber, ruleOverrides, round);
        return {
          selected: pendingTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: toggleTarget,
        };
      }
      case 'mech_wolf_night_action': {
        const check = canMechWolfUseLearnedSkill(mechWolfState, seats, seatNumber, round);
        return {
          selected: pendingTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: toggleTarget,
        };
      }
      case 'wolf_beauty_charm': {
        const check = canWolfBeautyCharm(seats, lastCharmedSeat, seatNumber);
        return {
          selected: pendingTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: toggleTarget,
        };
      }
      case 'dream_catcher_dream': {
        const check = canDreamCatcherDream(seats, seatNumber);
        return {
          selected: pendingTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: toggleTarget,
        };
      }
      default:
        return {
          selected: false,
          disabled: true,
          onSelect: () => {},
        };
    }
  };

  // 將預選寫入 Zustand Store 的 currentNightDraft
  const commitCurrentStepDraft = () => {
    switch (currentStep.actionType) {
      case 'wolf_kill':
        updateNightDraft({ wolfTarget: pendingTarget });
        break;
      case 'guard_protect':
        updateNightDraft({ guardTarget: pendingTarget });
        break;
      case 'witch_action':
        updateNightDraft({
          witchUseAntidote: pendingUseAntidote,
          witchPoisonTarget: pendingUseAntidote ? null : pendingTarget,
        });
        break;
      case 'seer_check':
        updateNightDraft({ seerCheckTarget: pendingTarget });
        break;
      case 'psychic_check':
        updateNightDraft({ psychicCheckTarget: pendingTarget });
        break;
      case 'mech_wolf_learn':
        updateNightDraft({ mechWolfLearnTarget: pendingTarget });
        break;
      case 'mech_wolf_night_action':
        updateNightDraft({ mechWolfSkillTarget: pendingTarget });
        break;
      case 'wolf_beauty_charm':
        updateNightDraft({ wolfBeautyCharmTarget: pendingTarget });
        break;
      case 'dream_catcher_dream':
        updateNightDraft({ dreamCatcherTarget: pendingTarget });
        break;
      default:
        break;
    }
  };

  // 推進步驟（實體法官直接推進 / 線上法官進入閉眼緩衝＋語音）
  const advanceAfterCommit = () => {
    if (isOnlineJudge) {
      ttsEngine.speakFromGesture(currentStep.closePrompt, {
        enabled: onlineJudgeSettings.ttsEnabled,
        rate: onlineJudgeSettings.ttsRate,
      });
      if (onlineJudgeSettings.stepBufferSeconds <= 0) {
        completeBufferTransition();
      } else {
        setBufferRemaining(onlineJudgeSettings.stepBufferSeconds);
        setOnlinePhase('buffer');
      }
      return;
    }

    if (isLastStep) {
      setConfirmFinishOpen(true);
    } else {
      nextNightStep();
    }
  };

  // 處理「認領階段」確認鍵
  const handleConfirmClaimAction = () => {
    if (!activeClaimRoleId) return;
    if (pendingClaimSeat !== null) {
      const targetSeat = seats.find((s) => s.seatNumber === pendingClaimSeat);
      const isUnclaiming = targetSeat?.roleId === activeClaimRoleId;
      const res = claimSeatRole(pendingClaimSeat, isUnclaiming ? null : activeClaimRoleId);
      if (!res.ok) {
        setClaimError(res.reason ?? '認領失敗');
        return;
      }
      setClaimError(null);
      setPendingClaimSeat(null);
      // 檢查認領後是否已全部達標，若是則自動退出編輯模式解鎖技能
      const updatedSeats = useGameStore.getState().seats;
      const nextSummary = getStepClaimSummary(board, updatedSeats, currentStep.actorRoleIds);
      if (nextSummary.isComplete) {
        setForceEditClaims(false);
      }
      return;
    }

    if (claimSummary?.isComplete || board.isFlexibleComposition) {
      setForceEditClaims(false);
    }
  };

  // 處理「技能階段」確認紀錄鍵
  const handleConfirmSkillAction = () => {
    if (!pendingValidation.allowed) return;

    // 查驗類步驟：若有選擇目標且尚未揭曉，先寫入草稿並鎖定揭曉查驗結果
    if (isInfoRevealStep && pendingTarget !== null && !revealConfirmed) {
      commitCurrentStepDraft();
      setRevealConfirmed(true);
      return;
    }

    // 女巫用藥（解藥或毒藥）屬於整局僅一次的不可逆動作，強制二次確認
    if (
      currentStep.actionType === 'witch_action' &&
      (pendingUseAntidote || pendingTarget !== null)
    ) {
      setConfirmWitchPotionOpen(true);
      return;
    }

    commitCurrentStepDraft();
    advanceAfterCommit();
  };

  // 線上法官：點擊全黑防窺畫面亮起操作盤（於使用者手勢內同步解鎖並播報）
  const handleWakeOnlineScreen = () => {
    setOnlinePhase('active');
    ttsEngine.speakFromGesture(currentStep.actionPrompt, {
      enabled: onlineJudgeSettings.ttsEnabled,
      rate: onlineJudgeSettings.ttsRate,
    });
  };

  const handleToggleTts = () => {
    const nextEnabled = !onlineJudgeSettings.ttsEnabled;
    if (!nextEnabled) {
      ttsEngine.cancel();
      ttsEngine.stopKeepAlive();
    } else {
      ttsEngine.unlockAudio();
      ttsEngine.startKeepAlive();
    }
    updateOnlineJudgeSettings({ ttsEnabled: nextEnabled });
  };

  const handleReplayTts = () => {
    if (!onlineJudgeSettings.ttsEnabled) return;
    const textToSpeak =
      onlinePhase === 'blackout'
        ? currentStep.openPrompt
        : onlinePhase === 'buffer'
          ? currentStep.closePrompt
          : onlinePhase === 'dawn'
            ? '天亮了，請睜眼'
            : currentStep.actionPrompt;
    ttsEngine.speakFromGesture(textToSpeak, {
      enabled: true,
      rate: onlineJudgeSettings.ttsRate,
    });
  };

  const handleCycleBufferSeconds = () => {
    const cur = onlineJudgeSettings.stepBufferSeconds;
    const nextIdx = BUFFER_PRESET_STEPS.findIndex((v) => v > cur);
    const nextVal = nextIdx === -1 ? BUFFER_PRESET_STEPS[0] : BUFFER_PRESET_STEPS[nextIdx];
    updateOnlineJudgeSettings({ stepBufferSeconds: nextVal });
  };

  // 夜間結算摘要（供實體法官最終確認彈窗）
  const hasWolfKillStep = steps.some((s) => s.actionType === 'wolf_kill');
  const hasWitchStep = steps.some((s) => s.actionType === 'witch_action');
  const hasGuardStep = steps.some((s) => s.actionType === 'guard_protect');
  const hasWolfBeautyStep = steps.some((s) => s.actionType === 'wolf_beauty_charm');
  const hasDreamCatcherStep = steps.some((s) => s.actionType === 'dream_catcher_dream');

  const summaryLines = [
    ...(round === 1 && mechWolfSeat
      ? [
          `機械狼首夜學習：${
            currentNightDraft.mechWolfLearnTarget !== null
              ? `${currentNightDraft.mechWolfLearnTarget} 號`
              : '未學習'
          }`,
        ]
      : []),
    ...(hasGuardStep
      ? [
          `守衛守護：${
            currentNightDraft.guardTarget !== null
              ? `${currentNightDraft.guardTarget} 號`
              : '空守'
          }`,
        ]
      : []),
    ...(hasDreamCatcherStep
      ? [
          `攝夢人攝夢：${
            currentNightDraft.dreamCatcherTarget != null
              ? `${currentNightDraft.dreamCatcherTarget} 號`
              : '未選擇'
          }`,
        ]
      : []),
    ...(round >= 2 && mechWolfSeat?.isAlive && mechWolfState.learnedRoleId
      ? [
          `機械狼技能（${getRoleById(mechWolfState.learnedRoleId)?.name ?? ''}）：${
            currentNightDraft.mechWolfSkillTarget !== null
              ? `${currentNightDraft.mechWolfSkillTarget} 號`
              : '未使用'
          }`,
        ]
      : []),
    ...(hasWolfKillStep
      ? [
          `狼人點刀：${
            currentNightDraft.wolfTarget !== null ? `${currentNightDraft.wolfTarget} 號` : '空刀'
          }`,
        ]
      : []),
    ...(hasWolfBeautyStep
      ? [
          `狼美人魅惑：${
            currentNightDraft.wolfBeautyCharmTarget != null
              ? `${currentNightDraft.wolfBeautyCharmTarget} 號`
              : '不魅惑'
          }`,
        ]
      : []),
    ...(hasWitchStep
      ? [
          `女巫用藥：${
            currentNightDraft.witchUseAntidote
              ? '使用解藥'
              : currentNightDraft.witchPoisonTarget !== null
                ? `毒殺 ${currentNightDraft.witchPoisonTarget} 號`
                : '雙藥皆未使用'
          }`,
        ]
      : []),
    ...(pendingSelfExplodeSeat !== null
      ? [`自爆出局：${pendingSelfExplodeSeat} 號將於結算後死亡`]
      : []),
  ];

  // 主確認按鈕文案
  const activeClaimRoleName = activeClaimRoleId
    ? (getRoleById(activeClaimRoleId)?.name ?? activeClaimRoleId)
    : '';
  const pendingClaimSeatObj =
    pendingClaimSeat !== null ? seats.find((s) => s.seatNumber === pendingClaimSeat) : undefined;
  const isPendingUnclaim =
    pendingClaimSeatObj?.roleId !== null &&
    pendingClaimSeatObj?.roleId === activeClaimRoleId &&
    activeClaimRoleId !== null;

  const primaryButtonLabel = (() => {
    if (isClaimStage) {
      if (pendingClaimSeat !== null) {
        return isPendingUnclaim
          ? `解除 ${pendingClaimSeat} 號的「${activeClaimRoleName}」認領`
          : `確認登錄 ${pendingClaimSeat} 號為「${activeClaimRoleName}」`;
      }
      if (claimSummary?.isComplete) {
        return '認領完成 ➜ 進入夜間技能';
      }
      if (board.isFlexibleComposition) {
        return '略過認領 ➜ 進入夜間技能';
      }
      return `請先點選座位認領「${activeClaimRoleName}」`;
    }

    if (isInfoRevealStep && pendingTarget !== null && !revealConfirmed) {
      return `確認查驗 ${pendingTarget} 號`;
    }
    if (isInfoRevealStep && revealConfirmed) {
      return isOnlineJudge
        ? '已查看結果 ➜ 確認閉眼'
        : isLastStep
          ? '確認紀錄 ➜ 天亮結算'
          : '已查看結果 ➜ 下一步';
    }
    if (isOnlineJudge) {
      return isLastStep ? '確認紀錄並閉眼（天亮）' : '確認紀錄並閉眼';
    }
    return isLastStep ? '確認紀錄 ➜ 天亮結算' : '確認紀錄 ➜ 下一步';
  })();

  const primaryButtonDisabled = isClaimStage
    ? pendingClaimSeat === null && !claimSummary?.isComplete && !board.isFlexibleComposition
    : !pendingValidation.allowed;

  const { left: leftSeats, right: rightSeats } = splitSeatsIntoSymmetricColumns(seats);

  const renderNightSeatButton = (seat: (typeof seats)[number]) => {
    const role = getRoleById(seat.roleId);
    const control = getSeatControl(seat.seatNumber);
    const actionIcons = getSeatActionIcons(seat.seatNumber, currentNightDraft, {
      isOnlineJudge,
      currentActionType: currentStep.actionType,
      showWolfTargetToWitch: !witchAntidoteUsed,
    });
    const isClaimedAsActive =
      isClaimStage && seat.roleId === activeClaimRoleId && activeClaimRoleId !== null;
    const showRoleBadge = !isOnlineJudge
      ? !maskSeatRoles && Boolean(role)
      : isClaimedAsActive && Boolean(role);

    return (
      <button
        key={seat.seatNumber}
        type="button"
        disabled={control.disabled}
        onClick={control.onSelect}
        className={`flex min-h-12 w-full flex-col justify-between rounded-xl border px-2.5 py-1.5 text-left transition ${
          control.selected
            ? 'border-amber-400 bg-amber-500/20 ring-2 ring-amber-400/50'
            : isClaimedAsActive
              ? 'border-emerald-400/60 bg-emerald-950/40'
              : control.disabled
                ? 'cursor-not-allowed border-slate-800/80 bg-slate-950/60 opacity-55'
                : 'border-slate-800 bg-slate-950/85 hover:border-slate-600 active:scale-[0.98]'
        }`}
      >
        <div className="flex w-full items-center justify-between gap-1">
          <span className="text-sm font-extrabold tabular-nums text-slate-50">
            {seat.seatNumber}號
          </span>
          <div className="flex items-center gap-0.5 text-xs">
            {!seat.isAlive && <span title="已出局">💀</span>}
            {seat.isAlive && seat.idiotRevealed && <span title="白痴已翻牌">🤡</span>}
            {actionIcons.map((icon, i) => (
              <span key={i}>{icon}</span>
            ))}
            {control.selected && (
              <span className="rounded bg-amber-400 px-1 py-0.5 text-[10px] font-black text-slate-950">
                預選
              </span>
            )}
            {!control.selected && isClaimedAsActive && (
              <span className="rounded bg-emerald-500/25 px-1 py-0.5 text-[10px] font-bold text-emerald-200">
                已認
              </span>
            )}
          </div>
        </div>

        <div className="mt-0.5 flex w-full items-center justify-between gap-1">
          {showRoleBadge && role ? (
            <span
              className={`truncate rounded border px-1.5 py-0.2 text-[10px] font-bold ${getRoleBadgeClasses(role.id)}`}
            >
              {role.name}
            </span>
          ) : (
            <span className="truncate text-[11px] text-slate-400">
              {seat.nickname.trim() || `${seat.seatNumber} 號`}
            </span>
          )}
          {control.disabled && control.reason && (
            <span className="shrink-0 truncate text-[10px] font-medium text-rose-300">
              🔒 {control.reason}
            </span>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
      {/* 1. 頂部狀態列：第 N 晚 ／ 當前睜眼角色 */}
      <section className="shrink-0 rounded-2xl border border-slate-800 bg-slate-900/95 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold">
              <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-indigo-200">
                第 {round} 晚
              </span>
              <span className="text-slate-400">
                步驟 {currentStepIndex + 1} / {steps.length}
              </span>
              {isClaimStage && (
                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-amber-200">
                  實體發牌認領
                </span>
              )}
            </div>
            <h1 className="mt-0.5 truncate text-base font-extrabold text-slate-50">
              {currentStep.actorLabel}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {isOnlineJudge ? (
              <>
                <button
                  type="button"
                  onClick={handleToggleTts}
                  aria-label="切換語音播報"
                  className={`min-h-10 rounded-xl border px-2.5 text-xs font-bold transition ${
                    onlineJudgeSettings.ttsEnabled
                      ? 'border-indigo-400/40 bg-indigo-950/50 text-indigo-200'
                      : 'border-slate-700 bg-slate-950 text-slate-500'
                  }`}
                >
                  {onlineJudgeSettings.ttsEnabled ? '🔊' : '🔇'}
                </button>
                <button
                  type="button"
                  disabled={!onlineJudgeSettings.ttsEnabled || !ttsSupported}
                  onClick={handleReplayTts}
                  aria-label="重播語音"
                  className="min-h-10 rounded-xl border border-slate-700 bg-slate-950 px-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 disabled:opacity-40"
                >
                  🔁
                </button>
                <button
                  type="button"
                  onClick={handleCycleBufferSeconds}
                  title="點擊切換閉眼緩衝秒數"
                  className="min-h-10 rounded-xl border border-slate-700 bg-slate-950 px-2.5 text-xs font-bold tabular-nums text-amber-200 hover:bg-slate-800"
                >
                  ⏱ {onlineJudgeSettings.stepBufferSeconds}s
                </button>
              </>
            ) : (
              <>
                <span
                  className={`rounded-xl border px-2 py-1 text-[11px] font-bold ${
                    actorSeatsAlive
                      ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
                      : 'border-slate-700 bg-slate-800 text-slate-400'
                  }`}
                >
                  {actorSeatsAlive ? '存活' : '已出局'}
                </span>
                {isPhysicalDealFirstNight && claimSummary?.requiresClaiming && !isClaimStage && (
                  <button
                    type="button"
                    onClick={() => setForceEditClaims(true)}
                    className="min-h-10 rounded-xl border border-amber-400/40 bg-amber-950/40 px-2.5 text-xs font-bold text-amber-200 hover:bg-amber-900/40"
                  >
                    ✏️ 認領
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSeatDrawerOpen(true)}
                  className="min-h-10 rounded-xl border border-indigo-400/40 bg-indigo-950/50 px-2.5 text-xs font-bold text-indigo-200 hover:bg-indigo-900/50"
                >
                  👥 座位
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-2 flex gap-1">
          {steps.map((step, idx) => (
            <div
              key={step.stepId}
              className={`h-1.5 flex-1 rounded-full transition ${
                idx < currentStepIndex
                  ? 'bg-emerald-500/75'
                  : idx === currentStepIndex
                    ? 'bg-amber-400'
                    : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. 中央座位區：緊湊網格＋小圖示標記 */}
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-2.5">
        <div className="mb-2 flex shrink-0 items-center justify-between gap-2 px-0.5">
          <div className="truncate text-xs font-bold text-slate-300">
            {isClaimStage
              ? `請點選座位預選「${activeClaimRoleName}」（再點取消）`
              : isSeatSelectableForSkill
                ? '點選座位預選目標（再點取消），按下方確認紀錄'
                : '本步驟檢視座位與狀態後，按下方確認繼續'}
          </div>
          {!isOnlineJudge && (
            <button
              type="button"
              onClick={() => setMaskSeatRoles((prev) => !prev)}
              className="shrink-0 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] font-bold text-slate-300 hover:bg-slate-800"
            >
              {maskSeatRoles ? '👁️ 顯示身分' : '🙈 遮罩身分'}
            </button>
          )}
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-2 overflow-y-auto pr-0.5">
          <div className="flex flex-col gap-1.5">{leftSeats.map(renderNightSeatButton)}</div>
          <div className="flex flex-col gap-1.5">{rightSeats.map(renderNightSeatButton)}</div>
        </div>
      </section>

      {/* 3. 底部操作區：步驟情境盤 ＋ 防誤觸確認鍵 */}
      <section className="shrink-0 space-y-2 rounded-2xl border border-slate-800 bg-slate-900/95 p-2.5">
        {/* 實體發牌首夜認領分頁列 */}
        {isClaimStage && claimSummary && (
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {claimSummary.roles.map((r) => {
                const roleName = getRoleById(r.roleId)?.name ?? r.roleId;
                const active = activeClaimRoleId === r.roleId;
                const done = r.remainingCount === 0;
                return (
                  <button
                    key={r.roleId}
                    type="button"
                    onClick={() => {
                      setActiveClaimRoleId(r.roleId);
                      setPendingClaimSeat(null);
                      setClaimError(null);
                    }}
                    className={`min-h-10 rounded-xl border px-3 text-xs font-bold transition ${
                      active
                        ? 'border-amber-400 bg-amber-500/20 text-amber-100'
                        : done
                          ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
                          : 'border-slate-700 bg-slate-950 text-slate-300'
                    }`}
                  >
                    {roleName} {r.claimedSeats.length}/{r.expectedCount}
                    {done ? ' ✓' : ''}
                  </button>
                );
              })}
            </div>
            {claimError && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 py-1.5 text-xs font-semibold text-rose-200">
                ⚠️ {claimError}
              </div>
            )}
          </div>
        )}

        {/* 技能階段專屬精簡提示盤 */}
        {!isClaimStage && (
          <div className="space-y-1.5">
            {/* 實體法官專屬：已出局角色假裝操作紅色警告（置於提詞機上方，絕不跳過步驟） */}
            {showDeadActorWarning && (
              <div
                role="alert"
                className="rounded-xl border border-rose-500/70 bg-rose-950/75 px-3 py-2 text-xs font-extrabold leading-relaxed text-rose-100 shadow-xs shadow-rose-500/20"
              >
                ⚠️ 該角色已出局！請照常唸詞並默數 5 秒假裝操作，切勿跳過暴露資訊
              </div>
            )}

            {/* 實體法官專屬：精簡台詞條（線上法官完全隱藏逐字稿） */}
            {!isOnlineJudge && (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-500/30 bg-amber-950/20 px-2.5 py-2">
                <p className="line-clamp-2 min-w-0 flex-1 text-xs font-semibold leading-snug text-amber-100">
                  🗣️ {currentStep.actionPrompt.replace(/\n+/g, ' ')}
                </p>
                <button
                  type="button"
                  onClick={() => setScriptDrawerOpen(true)}
                  className="min-h-10 shrink-0 rounded-lg border border-amber-400/40 bg-amber-500/15 px-2.5 text-[11px] font-bold text-amber-200 hover:bg-amber-500/25"
                >
                  📜 台詞
                </button>
              </div>
            )}

            {/* 步驟專屬操作快捷項 */}
            {currentStep.actionType === 'wolf_kill' && (
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="text-xs text-slate-300">
                  {pendingTarget !== null ? (
                    <span>
                      預選落刀：<strong className="text-rose-300">{pendingTarget} 號</strong>
                    </span>
                  ) : (
                    <span>
                      目前預選：<strong className="text-amber-200">空刀（不殺人）</strong>
                    </span>
                  )}
                  {pendingSelfExplodeSeat !== null && (
                    <span className="ml-2 text-amber-300">
                      💥 {pendingSelfExplodeSeat}號自爆
                    </span>
                  )}
                </div>
                {pendingTarget !== null && (
                  <button
                    type="button"
                    onClick={() => setPendingTarget(null)}
                    className="min-h-10 rounded-xl border border-slate-700 bg-slate-950 px-3 text-xs font-bold text-slate-200 hover:bg-slate-800"
                  >
                    改為空刀
                  </button>
                )}
              </div>
            )}

            {currentStep.actionType === 'guard_protect' && (
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="text-xs text-slate-300">
                  昨晚守：
                  <strong className="text-amber-300">
                    {lastGuardedSeat !== null ? `${lastGuardedSeat} 號` : '無'}
                  </strong>
                  {' · '}
                  預選：
                  <strong className="text-sky-300">
                    {pendingTarget !== null ? `${pendingTarget} 號` : '空守'}
                  </strong>
                </div>
                {pendingTarget !== null && (
                  <button
                    type="button"
                    onClick={() => setPendingTarget(null)}
                    className="min-h-10 rounded-xl border border-slate-700 bg-slate-950 px-3 text-xs font-bold text-slate-200 hover:bg-slate-800"
                  >
                    改為空守
                  </button>
                )}
              </div>
            )}

            {currentStep.actionType === 'witch_action' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-300">
                    今晚刀口：
                    <strong className="text-rose-300">
                      {!witchAntidoteUsed
                        ? wolfTargetSeat
                          ? formatSeatShort(wolfTargetSeat)
                          : '空刀（平安）'
                        : '解藥已用（無刀口資訊）'}
                    </strong>
                  </span>
                  <span className="text-[11px] font-bold">
                    <span className={witchAntidoteUsed ? 'text-slate-500 line-through' : 'text-emerald-300'}>
                      解{witchAntidoteUsed ? '×0' : '×1'}
                    </span>
                    {' / '}
                    <span className={witchPoisonUsed ? 'text-slate-500 line-through' : 'text-rose-300'}>
                      毒{witchPoisonUsed ? '×0' : '×1'}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!antidoteCheck.allowed || antidoteBlockedByPoison}
                    onClick={() => setPendingUseAntidote((prev) => !prev)}
                    className={`min-h-12 flex-1 rounded-xl border px-3 text-xs font-bold transition ${
                      pendingUseAntidote
                        ? 'border-emerald-400 bg-emerald-500/25 text-emerald-100'
                        : !antidoteCheck.allowed || antidoteBlockedByPoison
                          ? 'cursor-not-allowed border-slate-800 bg-slate-950 text-slate-500'
                          : 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200 hover:bg-emerald-900/40'
                    }`}
                  >
                    {pendingUseAntidote
                      ? `✓ 預選解藥救 ${currentNightDraft.wolfTarget} 號（再點取消）`
                      : antidoteBlockedByPoison
                        ? '已預選毒藥，不可同晚用解藥'
                        : !antidoteCheck.allowed
                          ? `解藥不可用：${antidoteCheck.reason}`
                          : `💊 預選解藥救 ${currentNightDraft.wolfTarget} 號`}
                  </button>
                  {pendingTarget !== null && (
                    <button
                      type="button"
                      onClick={() => setPendingTarget(null)}
                      className="min-h-12 shrink-0 rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 text-xs font-bold text-rose-200"
                    >
                      取消毒 {pendingTarget}號
                    </button>
                  )}
                </div>
              </div>
            )}

            {currentStep.actionType === 'seer_check' && (
              <div
                className={`rounded-xl border px-3 py-2 text-center text-xs font-bold ${
                  seerOutcome
                    ? seerOutcome.faction === 'wolf'
                      ? 'border-rose-500/50 bg-rose-950/50 text-rose-100'
                      : 'border-emerald-500/50 bg-emerald-950/50 text-emerald-100'
                    : 'border-slate-800 bg-slate-950 text-slate-300'
                }`}
              >
                {seerOutcome ? (
                  <span className="text-sm font-extrabold">
                    查驗結果：{seerOutcome.targetSeat} 號 ➜{' '}
                    {seerOutcome.faction === 'wolf' ? '👎 狼人陣營' : '👍 好人陣營'}
                  </span>
                ) : pendingTarget !== null ? (
                  `已預選查驗 ${pendingTarget} 號，點擊「確認查驗」揭曉結果`
                ) : (
                  '請點選上方座位預選查驗目標（或直接確認跳過）'
                )}
              </div>
            )}

            {currentStep.actionType === 'psychic_check' && (
              <div
                className={`rounded-xl border px-3 py-2 text-center text-xs font-bold ${
                  psychicOutcome
                    ? 'border-indigo-400/50 bg-indigo-950/50 text-indigo-100'
                    : 'border-slate-800 bg-slate-950 text-slate-300'
                }`}
              >
                {psychicOutcome ? (
                  <span className="text-sm font-extrabold">
                    查驗結果：{psychicOutcome.targetSeat} 號 ➜{' '}
                    {getRoleById(psychicOutcome.perceivedRoleId)?.name ??
                      psychicOutcome.perceivedRoleId}
                  </span>
                ) : pendingTarget !== null ? (
                  `已預選查驗 ${pendingTarget} 號，點擊「確認查驗」揭曉真實身分`
                ) : (
                  '請點選上方座位預選通靈查驗目標'
                )}
              </div>
            )}

            {currentStep.actionType === 'hunter_gesture' && (
              <div
                className={`rounded-xl border px-3 py-2 text-center text-sm font-extrabold ${
                  !hunterSeat || !hunterSeat.isAlive
                    ? 'border-slate-800 bg-slate-950 text-slate-400'
                    : isHunterPoisonedTonight
                      ? 'border-rose-500/50 bg-rose-950/50 text-rose-100'
                      : 'border-emerald-500/50 bg-emerald-950/40 text-emerald-100'
                }`}
              >
                {!hunterSeat || !hunterSeat.isAlive
                  ? isOnlineJudge
                    ? '請確認開槍狀態後點擊確認閉眼'
                    : '獵人已出局，無須比手勢'
                  : isHunterPoisonedTonight
                    ? '👎 今晚不可開槍（已中毒）'
                    : '👍 今晚可正常開槍'}
              </div>
            )}

            {currentStep.actionType === 'mech_wolf_learn' && (
              <div className="flex items-center justify-between gap-2 text-xs text-slate-300">
                <span>
                  {pendingTarget !== null
                    ? `預選學習：${pendingTarget} 號`
                    : ruleOverrides.mechWolfForceLearnNight1
                      ? '首夜強制學習：請點選機械狼以外一名玩家'
                      : '目前預選：不學習（跳過）'}
                </span>
                {!ruleOverrides.mechWolfForceLearnNight1 && pendingTarget !== null && (
                  <button
                    type="button"
                    onClick={() => setPendingTarget(null)}
                    className="min-h-10 rounded-xl border border-slate-700 bg-slate-950 px-3 text-xs font-bold text-slate-200"
                  >
                    改為跳過
                  </button>
                )}
              </div>
            )}

            {currentStep.actionType === 'mech_wolf_reveal_skill' && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 px-3 py-2 text-center text-xs font-bold text-amber-100">
                {mechLearnedTargetSeat && mechLearnedTargetSeat.roleId
                  ? `已學習 ${mechLearnedTargetSeat.seatNumber} 號 ➜ 習得【${
                      getRoleById(mechLearnedTargetSeat.roleId)?.name ??
                      mechLearnedTargetSeat.roleId
                    }】`
                  : '首夜未選擇學習對象'}
              </div>
            )}

            {currentStep.actionType === 'mech_wolf_night_action' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className={mechWolfState.hasJoinedWolfTeam ? 'font-bold text-rose-300' : 'text-amber-200'}>
                    {mechWolfState.hasJoinedWolfTeam ? '✅ 已入狼隊' : '⏳ 尚未入隊'}
                  </span>
                  <span className="text-slate-300">
                    所學：
                    <strong>
                      {mechWolfState.learnedRoleId
                        ? (getRoleById(mechWolfState.learnedRoleId)?.name ??
                          mechWolfState.learnedRoleId)
                        : '無'}
                    </strong>
                  </span>
                  {pendingTarget !== null && !revealConfirmed && (
                    <button
                      type="button"
                      onClick={() => setPendingTarget(null)}
                      className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] font-bold text-slate-200"
                    >
                      不使用
                    </button>
                  )}
                </div>
                {mechWolfPsychicOutcome && (
                  <div className="rounded-xl border border-indigo-400/50 bg-indigo-950/50 px-3 py-1.5 text-center text-sm font-extrabold text-indigo-100">
                    機械狼查驗：{mechWolfPsychicOutcome.targetSeat} 號 ➜{' '}
                    {getRoleById(mechWolfPsychicOutcome.perceivedRoleId)?.name ??
                      mechWolfPsychicOutcome.perceivedRoleId}
                  </div>
                )}
              </div>
            )}

            {currentStep.actionType === 'wolf_beauty_charm' && (
              <div className="flex items-center justify-between gap-2 text-xs text-slate-300">
                <span>
                  昨晚魅惑：{lastCharmedSeat !== null ? `${lastCharmedSeat} 號` : '無'} · 預選：
                  <strong className="text-rose-300">
                    {pendingTarget !== null ? `${pendingTarget} 號` : '空魅'}
                  </strong>
                </span>
                {pendingTarget !== null && (
                  <button
                    type="button"
                    onClick={() => setPendingTarget(null)}
                    className="min-h-10 rounded-xl border border-slate-700 bg-slate-950 px-3 text-xs font-bold text-slate-200"
                  >
                    改為空魅
                  </button>
                )}
              </div>
            )}

            {currentStep.actionType === 'dream_catcher_dream' && (
              <div className="text-xs text-slate-300">
                昨晚夢遊：{lastDreamTarget !== null ? `${lastDreamTarget} 號` : '無'} ·{' '}
                {pendingTarget !== null && pendingTarget === lastDreamTarget ? (
                  <span className="font-bold text-rose-300">
                    ⚠️ 連夢 {lastDreamTarget} 號將夢死！
                  </span>
                ) : pendingTarget !== null ? (
                  <span className="font-bold text-indigo-200">
                    💤 預選 {pendingTarget} 號為夢遊者
                  </span>
                ) : (
                  <span className="text-amber-200">請必選一名自己以外的存活玩家</span>
                )}
              </div>
            )}

            {!pendingValidation.allowed && pendingValidation.reason && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 py-1.5 text-xs font-semibold text-rose-200">
                ⚠️ {pendingValidation.reason}
              </div>
            )}
          </div>
        )}

        {/* 底部操作列：抽屜／上一步 ＋ 獨立確認紀錄鍵 */}
        <div className="flex items-center gap-2">
          {!isOnlineJudge && (
            <button
              type="button"
              disabled={isFirstStep}
              onClick={prevNightStep}
              aria-label="上一步"
              className={`min-h-12 shrink-0 rounded-xl border px-3 text-xs font-bold transition ${
                isFirstStep
                  ? 'cursor-not-allowed border-slate-800 bg-slate-950 text-slate-600'
                  : 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700'
              }`}
            >
              ←
            </button>
          )}

          {!isOnlineJudge && onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="min-h-12 shrink-0 rounded-xl border border-slate-700 bg-slate-950 px-3 text-xs font-bold text-slate-200 hover:bg-slate-800"
            >
              📋 紀錄
            </button>
          )}

          {onOpenQA && (
            <button
              type="button"
              onClick={onOpenQA}
              className="min-h-12 shrink-0 rounded-xl border border-slate-700 bg-slate-950 px-3 text-xs font-bold text-amber-200 hover:bg-slate-800"
            >
              ❓ 規則
            </button>
          )}

          <button
            type="button"
            disabled={primaryButtonDisabled}
            onClick={isClaimStage ? handleConfirmClaimAction : handleConfirmSkillAction}
            className={`min-h-12 flex-1 rounded-xl px-4 text-sm font-extrabold transition active:scale-[0.98] ${
              primaryButtonDisabled
                ? 'cursor-not-allowed bg-slate-800 text-slate-500'
                : isClaimStage && isPendingUnclaim
                  ? 'bg-rose-500 text-slate-950 hover:bg-rose-400'
                  : isLastStep && !isClaimStage && (!isInfoRevealStep || revealConfirmed)
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400'
                    : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
            }`}
          >
            {primaryButtonLabel}
          </button>
        </div>
      </section>

      {/* 線上法官全黑防窺／緩衝／天亮過渡畫面 */}
      {isOnlineJudge && onlinePhase !== 'active' && (
        <OnlineJudgeOverlay
          mode={onlinePhase as OnlineJudgeOverlayMode}
          round={round}
          actorLabel={currentStep.actorLabel}
          bufferRemainingSec={bufferRemaining}
          isLastStep={isLastStep}
          ttsEnabled={onlineJudgeSettings.ttsEnabled}
          ttsSupported={ttsSupported}
          onWakeScreen={handleWakeOnlineScreen}
          onSkipBuffer={completeBufferTransition}
          onConfirmDawn={() => {
            ttsEngine.cancel();
            ttsEngine.stopKeepAlive();
            finishNight();
          }}
          onToggleTts={handleToggleTts}
          onReplayTts={handleReplayTts}
        />
      )}

      {/* 實體法官：完整三段式主持台詞 SlideDrawer */}
      <SlideDrawer
        open={scriptDrawerOpen && !isOnlineJudge}
        onClose={() => setScriptDrawerOpen(false)}
        title={`${currentStep.actorLabel} · 主持逐字稿`}
        subtitle={`第 ${round} 晚 · 步驟 ${currentStepIndex + 1} / ${steps.length}`}
        placement="bottom"
      >
        <div className="space-y-3 pb-4">
          {!actorSeatsAlive && (
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-300">
              ⚠️ 此角色目前場上已無存活玩家。線下主持仍建議照常唸出台詞並默數 5 秒，避免場上聽出神職已出局。
            </div>
          )}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <div className="text-xs font-bold text-sky-300">👁️ 睜眼</div>
            <p className="mt-1 text-base font-bold text-slate-100">{currentStep.openPrompt}</p>
          </div>
          <div className="rounded-xl border border-amber-500/35 bg-amber-950/25 p-3.5">
            <div className="text-xs font-bold text-amber-300">🗣️ 引導台詞</div>
            <p className="mt-1.5 whitespace-pre-line text-base font-extrabold leading-relaxed text-amber-50">
              {currentStep.actionPrompt}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <div className="text-xs font-bold text-slate-400">🙈 閉眼</div>
            <p className="mt-1 text-base font-bold text-slate-200">{currentStep.closePrompt}</p>
          </div>
          {currentStep.judgeTips && currentStep.judgeTips.length > 0 && (
            <div className="space-y-1 rounded-xl border border-indigo-500/30 bg-indigo-950/25 p-3">
              <div className="text-xs font-bold text-indigo-300">法官即時提醒</div>
              {currentStep.judgeTips.map((tip, idx) => (
                <p key={idx} className="text-xs leading-relaxed text-slate-200">
                  • {tip}
                </p>
              ))}
            </div>
          )}
          {relatedQAs.length > 0 && (
            <div className="space-y-1.5 rounded-xl border border-amber-500/30 bg-slate-950 p-3">
              <div className="text-xs font-bold text-amber-300">相關 Q &amp; A</div>
              {relatedQAs.map((qa) => (
                <div key={qa.id} className="text-xs leading-relaxed text-slate-200">
                  <div className="font-bold text-amber-100">Q：{qa.question}</div>
                  <div className="mt-0.5 text-slate-300">A：{qa.answer}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SlideDrawer>

      {/* 女巫用藥不可逆二次確認彈窗 */}
      <ConfirmModal
        open={confirmWitchPotionOpen}
        title={pendingUseAntidote ? '確認使用女巫解藥？' : '確認使用女巫毒藥？'}
        description={
          pendingUseAntidote
            ? `確定消耗本局唯一一瓶【解藥】救起 ${currentNightDraft.wolfTarget} 號？（若與守衛同守將觸發奶穿）`
            : `確定消耗本局唯一一瓶【毒藥】毒殺 ${pendingTarget} 號？被毒殺者無法發動開槍等亡語技能。`
        }
        confirmLabel={pendingUseAntidote ? '💊 確認使用解藥' : '☠️ 確認使用毒藥'}
        cancelLabel="返回修改"
        tone={pendingUseAntidote ? 'warning' : 'danger'}
        onConfirm={() => {
          setConfirmWitchPotionOpen(false);
          commitCurrentStepDraft();
          advanceAfterCommit();
        }}
        onCancel={() => setConfirmWitchPotionOpen(false)}
      />

      {/* 實體法官：結束今夜結算確認彈窗 */}
      <ConfirmModal
        open={confirmFinishOpen}
        title={`確認結束第 ${round} 晚並天亮結算？`}
        description="請確認今晚各項行動紀錄無誤，按下確認後將立刻結算死亡與勝負結果："
        confirmLabel="確認結算"
        cancelLabel="返回修改"
        tone="warning"
        onConfirm={() => {
          setConfirmFinishOpen(false);
          finishNight();
        }}
        onCancel={() => setConfirmFinishOpen(false)}
      >
        <div className="space-y-2">
          <ul className="space-y-1.5 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200">
            {summaryLines.length > 0 ? (
              summaryLines.map((line, idx) => <li key={idx}>• {line}</li>)
            ) : (
              <li>• 已完成本晚 {steps.length} 個主持步驟</li>
            )}
          </ul>
          {isPhysicalDealFirstNight && unclaimedSeats.length > 0 && (
            <div className="rounded-xl border border-emerald-500/35 bg-emerald-950/30 p-2.5 text-xs text-emerald-200">
              🌾 實體發牌自動補平民：未認領的 {unclaimedSeats.join('、')} 號將於結算時自動判定為「平民」。
            </div>
          )}
        </div>
      </ConfirmModal>

      {/* 實體法官：座位總覽／手動標記抽屜 */}
      {!isOnlineJudge && (
        <SeatStatusDrawer
          open={seatDrawerOpen}
          board={board}
          onClose={() => setSeatDrawerOpen(false)}
        />
      )}
    </div>
  );
}
