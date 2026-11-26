import { useCallback, useEffect, useMemo, useState } from 'react';
import { ambientAudioEngine } from '../../audio/ambientAudioEngine';
import { ttsEngine } from '../../audio/ttsEngine';
import { getBoardById } from '../../data/boards';
import { getRoleById } from '../../data/roles';
import {
  applyMechWolfLearn,
  buildNightEndSpeech,
  buildNightStartSpeech,
  buildStepCloseSpeech,
  buildStepOpenSpeech,
  formatChineseDay,
  formatChineseNight,
  canAwakenedDreamCatcherDream,
  canAwakenedGargoyleConvert,
  canAwakenedIdiotShield,
  canAwakenedWolfBeautyCharm,
  canAwakenedWolfKingGiveGun,
  canBigBadWolfExtraKill,
  canBigGreyWolfKill,
  canBlackBatShield,
  canDarkNightEnvoyShield,
  canDaylightScholarAct,
  canDemonHunterHunt,
  canDemonWolfCheck,
  canDreamCatcherDream,
  canEnchanterBewitch,
  canFortuneTellerMark,
  canFoxCubCharm,
  canGuardTarget,
  canHybridChooseIdol,
  canJackRipperKill,
  canJackRipperSelectFanatic,
  canMechWolfLearn,
  canMechWolfUseLearnedSkill,
  canMedusaPetrify,
  canMuteElderMute,
  canNightNobleChooseServant,
  canNightmareFear,
  canPenguinFreeze,
  canPerseusExecute,
  canPuppetChoose,
  canRadiantEarlShield,
  canScarletAttach,
  canSeedWolfInfect,
  canSilentNightMentorAct,
  canSocialiteFavor,
  canSuperGravekeeperChooseHeir,
  canTimeEclipseLock,
  canTroublemakerPrank,
  canTwinsGuard,
  canWitchUseAntidote,
  canWitchUsePoison,
  canWolfBeautyCharm,
  canWolfRavenClawKill,
  canWolfYoungerBrotherAwakenedKill,
  areAllAliveWolvesAsleep,
  canPoisonerUsePoison,
  canThiefChooseCard,
  canTreasureMasterChooseCard,
  checkMandatoryNightTarget,
  createInitialCombatState,
  createInitialConversionState,
  createInitialFinalBatchState,
  createInitialGargoyleState,
  createInitialHiddenWolfState,
  createInitialInterferenceState,
  createInitialPumpkinGhostState,
  createInitialSeedWolfState,
  createInitialSuperGravekeeperState,
  createInitialTreasureMasterState,
  evaluateAwakenedDreamTargetActed,
  evaluateMoonSpiritHowl,
  evaluateNightStepLockState,
  evaluateNineTailedFoxTails,
  findMechWolfSeat,
  getAwakenedSeerCheckResult,
  getDemonWolfCheckResult,
  getDrunkSeerCheckResult,
  getFoolSeerCheckResult,
  getFoxCheckResult,
  getGargoyleCheckResult,
  getGravekeeperExileResult,
  getGravekeeperFactionForRecord,
  getLanternSeerCheckResult,
  getNightSteps,
  getPsychicCheckResult,
  getPumpkinGhostCheckResult,
  getPureWhiteCheckResult,
  getSeatTouchConfirmView,
  getSeerCheckResult,
  getStepClaimSummary,
  getTouchConfirmEventAfterStep,
  getTouchConfirmSeatOrder,
  getUnclaimedSeatNumbers,
  getWolfWitchCheckResult,
  isFirstNightNoWolfKillBoard,
  isJackSecondIdentityBoard,
  isSeatWolfFaction,
  resolveActiveLuckyActorForNight,
  type TouchConfirmEvent,
} from '../../logic';
import type { ActionCheckResult, MerchantGiftItem } from '../../logic/types';
import { useGameStore } from '../../store/gameStore';
import { ConfirmModal } from '../common/ConfirmModal';
import { InfoFlashcardModal, type InfoFlashcardData } from '../common/InfoFlashcardModal';
import { OnlineWolfRosterBar } from '../common/OnlineWolfRosterBar';
import { SeatStatusDrawer } from '../common/SeatStatusDrawer';
import { SlideDrawer } from '../common/SlideDrawer';
import {
  formatSeatNum,
  formatSeatShort,
  getRoleBadgeClasses,
  splitSeatsIntoSymmetricColumns,
} from '../common/displayHelpers';
import { NightStepMetroBar } from '../night/NightStepMetroBar';
import {
  OnlineJudgeOverlay,
  type OnlineJudgeOverlayMode,
} from '../night/OnlineJudgeOverlay';
import {
  getInitialTargetForStep,
  getSeatActionIcons,
  getSeatAttachedStatusTags,
  getSeatFactionChip,
} from '../night/nightStepConfig';

interface NightConsoleScreenProps {
  onOpenHistory?: () => void;
  onOpenQA?: () => void;
}

const BUFFER_PRESET_STEPS = [0, 3, 5, 8, 10];

export function NightConsoleScreen(_props: NightConsoleScreenProps) {
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
  const activeCharmedSeat = useGameStore((s) => s.activeCharmedSeat);
  const lastDreamTarget = useGameStore((s) => s.lastDreamTarget);
  const lastFearedSeat = useGameStore((s) => s.lastFearedSeat ?? null);
  const hybridState = useGameStore((s) => s.hybridState);
  const thirdPartySpecialState = useGameStore((s) => s.thirdPartySpecialState);
  const seedWolfState = useGameStore((s) => s.seedWolfState ?? createInitialSeedWolfState());
  const gargoyleState = useGameStore((s) => s.gargoyleState ?? createInitialGargoyleState());
  const pumpkinGhostState = useGameStore(
    (s) => s.pumpkinGhostState ?? createInitialPumpkinGhostState(),
  );
  const superGravekeeperState = useGameStore(
    (s) => s.superGravekeeperState ?? createInitialSuperGravekeeperState(),
  );
  const foxLostAbility = useGameStore((s) => s.foxLostAbility ?? false);
  const exiledHistory = useGameStore((s) => s.exiledHistory ?? []);
  const lastAwakenedDreamTarget = useGameStore((s) => s.lastAwakenedDreamTarget ?? null);
  const interferenceState = useGameStore(
    (s) => s.interferenceState ?? createInitialInterferenceState(),
  );
  const combatState = useGameStore((s) => s.combatState ?? createInitialCombatState());
  const conversionState = useGameStore(
    (s) => s.conversionState ?? createInitialConversionState(),
  );
  const hiddenWolfState = useGameStore(
    (s) => s.hiddenWolfState ?? createInitialHiddenWolfState(),
  );
  const treasureMasterState = useGameStore(
    (s) => s.treasureMasterState ?? createInitialTreasureMasterState(),
  );
  const finalBatchState = useGameStore(
    (s) => s.finalBatchState ?? createInitialFinalBatchState(),
  );
  const poisonerPoisonUsed = useGameStore((s) => s.poisonerPoisonUsed ?? false);
  const thiefBottomCards = useGameStore(
    (s) => s.thiefBottomCards ?? s.conversionState?.thiefBottomCards ?? [],
  );

  const claimSeatRole = useGameStore((s) => s.claimSeatRole);
  const updateOnlineJudgeSettings = useGameStore((s) => s.updateOnlineJudgeSettings);
  const updateNightDraft = useGameStore((s) => s.updateNightDraft);
  const nextNightStep = useGameStore((s) => s.nextNightStep);
  const prevNightStep = useGameStore((s) => s.prevNightStep);
  const checkEarlyNightVictory = useGameStore((s) => s.checkEarlyNightVictory);
  const finishNight = useGameStore((s) => s.finishNight);

  const isOnlineJudge = hostMode.judgeMode === 'online_judge';
  const isPhysicalDealFirstNight = hostMode.dealMode === 'physical_deal' && round === 1;
  const ttsSupported = useMemo(() => ttsEngine.isSupported(), []);

  const board = getBoardById(selectedBoardId);
  const steps = useMemo(() => (board ? getNightSteps(board, round) : []), [board, round]);
  const currentStep = steps[currentStepIndex];

  // 防誤觸預選狀態（本地草稿，點擊「確認紀錄」才寫入 Store）
  const [pendingTarget, setPendingTarget] = useState<number | null>(() => {
    if (!currentStep) return null;
    if (currentStep.actionType === 'ghost_bride_link' && round >= 2) {
      return currentNightDraft.ghostBrideKillTarget ?? null;
    }
    if (currentStep.actionType === 'poisoner_poison') {
      return currentNightDraft.poisonerTarget ?? null;
    }
    return getInitialTargetForStep(
      currentStep.actionType,
      currentNightDraft,
      isJackSecondIdentityBoard(seats, board?.id),
    );
  });
  const [pendingUseAntidote, setPendingUseAntidote] = useState<boolean>(
    () => currentNightDraft.witchUseAntidote,
  );
  const [pendingSeedWolfInfect, setPendingSeedWolfInfect] = useState<boolean>(
    () => currentNightDraft.seedWolfInfectTarget != null,
  );
  const [pendingDualTargets, setPendingDualTargets] = useState<[number | null, number | null]>(
    () => currentNightDraft.awakenedSeerTargets ?? [null, null],
  );
  const [pendingDrunkManual, setPendingDrunkManual] = useState<'good' | 'wolf' | null>(
    () => currentNightDraft.drunkSeerManualResult ?? null,
  );
  const [pendingAwakenedDreamKill, setPendingAwakenedDreamKill] = useState<boolean>(
    () => Boolean(currentNightDraft.awakenedDreamKillTarget),
  );
  const [pendingMultiTargets, setPendingMultiTargets] = useState<number[]>(
    () => currentNightDraft.alchemyFogTargets ?? [],
  );
  const [pendingAmplifyMode, setPendingAmplifyMode] = useState<'amplify' | 'weaken' | null>(null);
  const [pendingThiefRoleId, setPendingThiefRoleId] = useState<string | null>(
    () => currentNightDraft.thiefChosenRoleId ?? null,
  );
  const [pendingTreasureCardRoleId, setPendingTreasureCardRoleId] = useState<string | null>(
    () => currentNightDraft.treasureMasterCardRoleId ?? null,
  );
  const [pendingEvilPoisonTarget, setPendingEvilPoisonTarget] = useState<number | null>(
    () => currentNightDraft.evilMerchantPoisonActionTarget ?? null,
  );
  const [pendingMerchantItem, setPendingMerchantItem] = useState<MerchantGiftItem>(
    () =>
      currentNightDraft.miracleMerchantItem ??
      currentNightDraft.blackMarketItem ??
      'seer_check',
  );
  const [pendingAwHelpersApproved, setPendingAwHelpersApproved] = useState<boolean>(true);
  const [pendingAssassinRoleId, setPendingAssassinRoleId] = useState<string>('');
  const [pendingWardenChoices, setPendingWardenChoices] = useState<
    ['trade' | 'betray', 'trade' | 'betray']
  >(['trade', 'trade']);
  const [revealConfirmed, setRevealConfirmed] = useState(false);

  // 實體發牌首夜認領狀態（支援同角色多席次一次多選）
  const [activeClaimRoleId, setActiveClaimRoleId] = useState<string | null>(null);
  const [pendingClaimSeats, setPendingClaimSeats] = useState<number[]>([]);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [forceEditClaims, setForceEditClaims] = useState(false);

  // 實體法官抽屜與遮罩
  const [maskSeatRoles, setMaskSeatRoles] = useState(false);
  const [confirmFinishOpen, setConfirmFinishOpen] = useState(false);
  const [confirmWitchPotionOpen, setConfirmWitchPotionOpen] = useState(false);
  const [seatDrawerOpen, setSeatDrawerOpen] = useState(false);
  const [scriptDrawerOpen, setScriptDrawerOpen] = useState(false);
  const [flashcardData, setFlashcardData] = useState<InfoFlashcardData | null>(null);

  // 線上法官防窺過渡狀態機（含每晚開頭「天黑請閉眼」、輪流認附加身分、閉眼→睜眼緩衝與結尾倒數）
  const closeToOpenDelay = onlineJudgeSettings.closeToOpenDelaySeconds ?? 3;
  const [onlinePhase, setOnlinePhase] = useState<'active' | OnlineJudgeOverlayMode>(() =>
    isOnlineJudge ? (currentStepIndex === 0 ? 'night_intro' : 'blackout') : 'active',
  );
  const [bufferRemaining, setBufferRemaining] = useState(closeToOpenDelay);
  const [touchConfirmEvent, setTouchConfirmEvent] = useState<TouchConfirmEvent | null>(null);
  const [touchConfirmIdx, setTouchConfirmIdx] = useState(0);
  const [bufferTarget, setBufferTarget] = useState<'next_step' | 'touch_confirm' | 'first_step'>(
    () => (isOnlineJudge && currentStepIndex === 0 ? 'first_step' : 'next_step'),
  );
  const [dawnCountdownDigit, setDawnCountdownDigit] = useState<number | null>(null);
  const [introShownForRound, setIntroShownForRound] = useState<number | null>(() =>
    isOnlineJudge && currentStepIndex === 0 ? round : null,
  );

  const touchConfirmSeats = useMemo(() => getTouchConfirmSeatOrder(seats), [seats]);
  const activeTouchConfirmSeat =
    touchConfirmEvent && touchConfirmIdx < touchConfirmSeats.length
      ? touchConfirmSeats[touchConfirmIdx]
      : null;
  const activeTouchConfirmView = useMemo(
    () =>
      touchConfirmEvent && activeTouchConfirmSeat != null
        ? getSeatTouchConfirmView(activeTouchConfirmSeat, touchConfirmEvent)
        : null,
    [touchConfirmEvent, activeTouchConfirmSeat],
  );
  const dawnSpeechPlan = useMemo(
    () => buildNightEndSpeech(round, ruleOverrides.enableSheriff),
    [round, ruleOverrides.enableSheriff],
  );

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
    if (currentStep.actionType === 'ghost_bride_link' && round >= 2) {
      setPendingTarget(currentNightDraft.ghostBrideKillTarget ?? null);
    } else if (currentStep.actionType === 'poisoner_poison') {
      setPendingTarget(currentNightDraft.poisonerTarget ?? null);
    } else {
      setPendingTarget(
        getInitialTargetForStep(
          currentStep.actionType,
          currentNightDraft,
          isJackSecondIdentityBoard(seats, board?.id),
        ),
      );
    }
    setPendingUseAntidote(currentNightDraft.witchUseAntidote);
    setPendingSeedWolfInfect(currentNightDraft.seedWolfInfectTarget != null);
    setPendingDualTargets(
      currentStep.actionType === 'magician_swap'
        ? (currentNightDraft.magicianSwapPair ?? [null, null])
        : currentStep.actionType === 'wolf_warlock_swap'
          ? (currentNightDraft.wolfWarlockSwapPair ?? [null, null])
          : currentStep.actionType === 'trickster_wolf_swap'
            ? (currentNightDraft.tricksterSwapPair ?? [null, null])
            : currentStep.actionType === 'bee_wild_hunt_sting'
              ? (currentNightDraft.beeWildHuntTargets ?? [null, null])
              : currentStep.actionType === 'anubis_scale'
                ? [currentNightDraft.anubisDeadSeat ?? null, currentNightDraft.anubisAliveSeat ?? null]
                : currentStep.actionType === 'warden_wolf_trade'
                  ? (currentNightDraft.wardenTradePair ?? [null, null])
                  : currentStep.actionType === 'cupid_link'
                    ? (currentNightDraft.cupidLoversPair ?? [null, null])
                    : currentStep.actionType === 'ghost_bride_link'
                      ? [
                          currentNightDraft.ghostBrideGroomTarget ?? null,
                          currentNightDraft.ghostBrideWitnessTarget ?? null,
                        ]
                      : currentStep.actionType === 'scent_phantom_link'
                        ? (currentNightDraft.scentPhantomChainPair ?? [null, null])
                        : currentStep.actionType === 'xu_xian_action'
                          ? (currentNightDraft.xuXianBindPair ?? [null, null])
                          : (currentNightDraft.awakenedSeerTargets ?? [null, null]),
    );
    setPendingAssassinRoleId(currentNightDraft.assassinGuessedRoleId ?? '');
    setPendingWardenChoices(currentNightDraft.wardenTradeChoices ?? ['trade', 'trade']);
    setPendingDrunkManual(currentNightDraft.drunkSeerManualResult ?? null);
    setPendingAwakenedDreamKill(Boolean(currentNightDraft.awakenedDreamKillTarget));
    setPendingMultiTargets(
      currentStep.actionType === 'awakened_witch_action'
        ? (currentNightDraft.awakenedWitchHelpers ?? [])
        : currentStep.actionType === 'zombie_infect'
          ? (currentNightDraft.zombieInfectTargets ?? [])
          : (currentNightDraft.alchemyFogTargets ?? []),
    );
    setPendingAmplifyMode(
      currentStep.actionType === 'silent_night_mentor_action'
        ? (currentNightDraft.silentNightMentorMode ?? null)
        : currentStep.actionType === 'daylight_scholar_action'
          ? (currentNightDraft.daylightScholarMode ?? null)
          : null,
    );
    setPendingThiefRoleId(currentNightDraft.thiefChosenRoleId ?? null);
    setPendingTreasureCardRoleId(currentNightDraft.treasureMasterCardRoleId ?? null);
    setPendingEvilPoisonTarget(currentNightDraft.evilMerchantPoisonActionTarget ?? null);
    setPendingMerchantItem(
      currentStep.actionType === 'black_market_gift'
        ? (currentNightDraft.blackMarketItem ?? 'seer_check')
        : (currentNightDraft.miracleMerchantItem ?? 'seer_check'),
    );
    setPendingAwHelpersApproved(currentNightDraft.awakenedWitchHelpersApproved ?? true);
    setRevealConfirmed(false);
    setPendingClaimSeats([]);
    setClaimError(null);
    setForceEditClaims(false);
    setFlashcardData(null);
    setTouchConfirmEvent(null);
    setTouchConfirmIdx(0);
    setDawnCountdownDigit(null);
    if (isOnlineJudge) {
      if (currentStepIndex === 0 && introShownForRound !== round) {
        setIntroShownForRound(round);
        setBufferTarget('first_step');
        setBufferRemaining(closeToOpenDelay);
        setOnlinePhase('night_intro');
      } else if (currentStepIndex === 0 && onlinePhase === 'night_intro') {
        // 初次掛載已處於 night_intro，維持不動
      } else {
        setOnlinePhase('blackout');
      }
    } else {
      setOnlinePhase('active');
    }
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

  // 線上法官：進入 night_intro / blackout / touch_confirm_blackout / dawn 時自動 TTS 播報
  useEffect(() => {
    if (!isOnlineJudge || !currentStep) return;
    if (onlinePhase === 'night_intro') {
      ttsEngine.speak(buildNightStartSpeech(), {
        enabled: onlineJudgeSettings.ttsEnabled,
        rate: onlineJudgeSettings.ttsRate,
        warmupDelayMs: 300,
      });
    } else if (onlinePhase === 'blackout') {
      ttsEngine.speak(buildStepOpenSpeech(currentStep), {
        enabled: onlineJudgeSettings.ttsEnabled,
        rate: onlineJudgeSettings.ttsRate,
      });
    } else if (onlinePhase === 'touch_confirm_blackout' && activeTouchConfirmSeat != null) {
      ttsEngine.speak(`${formatSeatNum(activeTouchConfirmSeat)} 號請睜眼`, {
        enabled: onlineJudgeSettings.ttsEnabled,
        rate: onlineJudgeSettings.ttsRate,
      });
    } else if (onlinePhase === 'dawn') {
      setDawnCountdownDigit(null);
      ttsEngine.speakSequence(
        [
          { text: dawnSpeechPlan.introText, delayAfterMs: 1000 },
          { text: dawnSpeechPlan.countdown[0], delayAfterMs: 1000 },
          { text: dawnSpeechPlan.countdown[1], delayAfterMs: 1000 },
          { text: dawnSpeechPlan.countdown[2], delayAfterMs: 600 },
        ],
        {
          enabled: onlineJudgeSettings.ttsEnabled,
          rate: onlineJudgeSettings.ttsRate,
          onItemStart: (idx) => {
            if (idx === 0) setDawnCountdownDigit(null);
            else if (idx === 1) setDawnCountdownDigit(3);
            else if (idx === 2) setDawnCountdownDigit(2);
            else if (idx === 3) setDawnCountdownDigit(1);
          },
          onEnd: () => {
            setDawnCountdownDigit(null);
          },
        },
      );
    }
  }, [
    isOnlineJudge,
    onlinePhase,
    currentStep,
    activeTouchConfirmSeat,
    dawnSpeechPlan,
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
    if (bufferTarget === 'first_step') {
      setBufferTarget('next_step');
      setOnlinePhase('blackout');
      return;
    }
    if (bufferTarget === 'touch_confirm') {
      setOnlinePhase('touch_confirm_blackout');
      return;
    }
    if (isLastStep) {
      setOnlinePhase('dawn');
    } else {
      nextNightStep();
      setOnlinePhase('blackout');
    }
  }, [bufferTarget, isLastStep, nextNightStep]);

  // 線上法官：開頭「天黑請閉眼」與閉眼緩衝倒數計時
  useEffect(() => {
    if (!isOnlineJudge || (onlinePhase !== 'buffer' && onlinePhase !== 'night_intro')) return;
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

  // 雙向防呆：評估「強制無法使用技能」狀態（含已出局、血月封印、夢魘恐懼、石化、冰凍、沉睡、導師/學者削弱歸零等）
  const stepLockEval = useMemo(() => {
    if (!currentStep) return { locked: false, reason: null };
    return evaluateNightStepLockState({
      step: currentStep,
      round,
      seats,
      draft: currentNightDraft,
      isClaimStage,
      witchAntidoteUsed,
      witchPoisonUsed,
      foxLostAbility,
      pumpkinGhostState,
      combatState,
      thirdPartySpecialState,
      firstNightNoWolfKill: board ? isFirstNightNoWolfKillBoard(board) : false,
      conversionState,
      finalBatchState,
      interferenceState,
      hiddenWolfState,
      gargoyleState,
      treasureMasterState,
      boardId: board?.id,
    });
  }, [
    currentStep,
    round,
    seats,
    currentNightDraft,
    isClaimStage,
    witchAntidoteUsed,
    witchPoisonUsed,
    foxLostAbility,
    pumpkinGhostState,
    combatState,
    thirdPartySpecialState,
    board,
    conversionState,
    finalBatchState,
    interferenceState,
    hiddenWolfState,
    gargoyleState,
    treasureMasterState,
  ]);

  const isSkillLocked = !isClaimStage && stepLockEval.locked;

  // 線上語音模式：已出局神職或血月封印步驟，自動空等行動秒數後播報閉眼並進入靜音緩衝（防玩家聽出死訊）
  useEffect(() => {
    if (!isOnlineJudge || !isSkillLocked || onlinePhase !== 'active' || !currentStep) return;
    const waitMs = Math.max(1, onlineJudgeSettings.stepBufferSeconds) * 1000;
    const timer = window.setTimeout(() => {
      ttsEngine.speak(buildStepCloseSpeech(currentStep), {
        enabled: onlineJudgeSettings.ttsEnabled,
        rate: onlineJudgeSettings.ttsRate,
      });
      if (closeToOpenDelay <= 0) {
        completeBufferTransition();
      } else {
        setBufferRemaining(closeToOpenDelay);
        setOnlinePhase('buffer');
      }
    }, waitMs);
    return () => window.clearTimeout(timer);
  }, [
    isOnlineJudge,
    isSkillLocked,
    onlinePhase,
    currentStep,
    onlineJudgeSettings.stepBufferSeconds,
    onlineJudgeSettings.ttsEnabled,
    onlineJudgeSettings.ttsRate,
    closeToOpenDelay,
    completeBufferTransition,
  ]);

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

  const drunkSeerOutcome = useMemo(() => {
    if (
      !currentStep ||
      currentStep.actionType !== 'drunk_seer_check' ||
      !revealConfirmed ||
      pendingTarget === null
    ) {
      return null;
    }
    return getDrunkSeerCheckResult(seats, pendingTarget, { manualOverride: pendingDrunkManual });
  }, [currentStep, revealConfirmed, pendingTarget, seats, pendingDrunkManual]);

  if (!board || !currentStep) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-subtle bg-surface p-6 text-center text-sm text-secondary">
        無法載入夜間主持步驟，請重開新局。
      </div>
    );
  }

  const mechWolfSeat = findMechWolfSeat(seats);
  const dreamCatcherSeat = seats.find((s) => s.roleId === 'dream_catcher');
  const hunterSeat = seats.find((s) => s.roleId === 'hunter');

  const activeLuckyActor = useMemo(
    () =>
      resolveActiveLuckyActorForNight(
        currentNightDraft,
        thirdPartySpecialState,
        round,
        ruleOverrides,
      ),
    [currentNightDraft, thirdPartySpecialState, round, ruleOverrides],
  );

  const isInfoRevealStep =
    currentStep.actionType === 'seer_check' ||
    currentStep.actionType === 'psychic_check' ||
    currentStep.actionType === 'awakened_seer_check' ||
    currentStep.actionType === 'lantern_seer_check' ||
    currentStep.actionType === 'drunk_seer_check' ||
    currentStep.actionType === 'fool_seer_check' ||
    currentStep.actionType === 'fox_check' ||
    currentStep.actionType === 'gargoyle_check' ||
    currentStep.actionType === 'wolf_witch_check' ||
    currentStep.actionType === 'pure_white_check' ||
    currentStep.actionType === 'demon_wolf_check' ||
    currentStep.actionType === 'pumpkin_ghost_check' ||
    (currentStep.actionType === 'lucky_item_action' &&
      activeLuckyActor?.item === 'seer_check' &&
      activeLuckyActor.allowedThisRound) ||
    (currentStep.actionType === 'mech_wolf_night_action' &&
      mechWolfState.learnedRoleId === 'psychic');

  // 夢魘恐懼到狼人 → 整晚狼隊空刀；種狼開啟感染／首夜無刀／全狼沉睡／灰太狼偷小狼 → 女巫顯示空刀
  const fearedSeatObj =
    currentNightDraft.nightmareFearTarget != null
      ? seats.find((s) => s.seatNumber === currentNightDraft.nightmareFearTarget)
      : undefined;
  const wolfTeamFearedTonight = Boolean(fearedSeatObj && isSeatWolfFaction(fearedSeatObj));
  const seedWolfAliveCanInfect =
    seats.some((s) => s.roleId === 'seed_wolf' && s.isAlive) && !seedWolfState.infectUsed;
  const greyWolfStoleWolfRole =
    round >= 2 &&
    currentNightDraft.greyWolfBossStealTarget != null &&
    ['wolf', 'little_grey_wolf'].includes(
      seats.find((s) => s.seatNumber === currentNightDraft.greyWolfBossStealTarget)?.roleId ?? '',
    );
  const effectiveWolfTargetForWitch =
    wolfTeamFearedTonight ||
    currentNightDraft.seedWolfInfectTarget != null ||
    (board && isFirstNightNoWolfKillBoard(board) && round === 1) ||
    areAllAliveWolvesAsleep(seats, thirdPartySpecialState) ||
    greyWolfStoleWolfRole
      ? null
      : currentNightDraft.wolfTarget;

  // 女巫解藥檢核（以本地預選狀態評估互斥）
  const antidoteCheck = canWitchUseAntidote(
    seats,
    round,
    effectiveWolfTargetForWitch,
    witchAntidoteUsed,
    ruleOverrides,
  );
  const antidoteBlockedByPoison = pendingTarget !== null;

  // 確認紀錄前的純規則檢核（一律呼叫 src/logic/，含強制使用技能目標檢查）
  const pendingValidation: ActionCheckResult = (() => {
    if (isClaimStage || isSkillLocked) return { allowed: true };
    const mandatoryCheck = checkMandatoryNightTarget({
      actionType: currentStep.actionType,
      round,
      ruleOverrides,
      pendingTarget,
      pendingDualTargets,
      pendingMultiTargets,
    });
    if (!mandatoryCheck.allowed) {
      return mandatoryCheck;
    }
    switch (currentStep.actionType) {
      case 'wolf_kill':
        if (pendingSeedWolfInfect && pendingTarget !== null) {
          return canSeedWolfInfect(seats, seedWolfState, pendingTarget);
        }
        return { allowed: true };
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
      case 'poisoner_poison':
        return actorSeatsAlive
          ? canPoisonerUsePoison(seats, pendingTarget, poisonerPoisonUsed)
          : { allowed: true };
      case 'thief_choose':
        return round === 1 && actorSeatsAlive && thiefBottomCards.length === 2
          ? canThiefChooseCard(thiefBottomCards, pendingThiefRoleId)
          : { allowed: true };
      case 'treasure_master_choose':
        return actorSeatsAlive && treasureMasterState.bottomCards.length === 3
          ? canTreasureMasterChooseCard(treasureMasterState, seats, pendingTreasureCardRoleId, {
              allowSkip: false,
            })
          : { allowed: true };
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
      case 'nightmare_fear':
        return actorSeatsAlive
          ? canNightmareFear(seats, lastFearedSeat, pendingTarget, round, { allowSkip: true })
          : { allowed: true };
      case 'hybrid_choose':
        return round === 1 && actorSeatsAlive
          ? canHybridChooseIdol(seats, pendingTarget, round, { allowSkip: false })
          : { allowed: true };
      default:
        return { allowed: true };
    }
  })();

  // 查驗即時結果（僅於點擊「確認紀錄」鎖定後揭曉）
  const seerOutcome =
    currentStep.actionType === 'seer_check' && revealConfirmed && pendingTarget !== null
      ? getSeerCheckResult(seats, pendingTarget, { conversionState, thirdPartySpecialState })
      : null;

  const luckySeerOutcome =
    currentStep.actionType === 'lucky_item_action' &&
    activeLuckyActor?.item === 'seer_check' &&
    activeLuckyActor.allowedThisRound &&
    revealConfirmed &&
    pendingTarget !== null
      ? getSeerCheckResult(seats, pendingTarget, { conversionState, thirdPartySpecialState })
      : null;

  const psychicOutcome =
    currentStep.actionType === 'psychic_check' && revealConfirmed && pendingTarget !== null
      ? getPsychicCheckResult(seats, effectiveMechWolfForPreview, pendingTarget, treasureMasterState)
      : null;

  const mechWolfPsychicOutcome =
    currentStep.actionType === 'mech_wolf_night_action' &&
    mechWolfState.learnedRoleId === 'psychic' &&
    revealConfirmed &&
    pendingTarget !== null
      ? getPsychicCheckResult(seats, mechWolfState, pendingTarget, treasureMasterState)
      : null;

  // 第 1 批查驗與資訊感知即時結果
  const awakenedSeerOutcome =
    currentStep.actionType === 'awakened_seer_check' &&
    revealConfirmed &&
    pendingDualTargets[0] !== null &&
    pendingDualTargets[1] !== null
      ? getAwakenedSeerCheckResult(seats, [pendingDualTargets[0], pendingDualTargets[1]])
      : null;

  const lanternSeerOutcome =
    currentStep.actionType === 'lantern_seer_check' && revealConfirmed && pendingTarget !== null
      ? getLanternSeerCheckResult(seats, pendingTarget)
      : null;

  const foolSeerOutcome =
    currentStep.actionType === 'fool_seer_check' && revealConfirmed && pendingTarget !== null
      ? getFoolSeerCheckResult(seats, pendingTarget)
      : null;

  const foxOutcome =
    currentStep.actionType === 'fox_check' && revealConfirmed && pendingTarget !== null
      ? getFoxCheckResult(seats, pendingTarget, foxLostAbility)
      : null;

  const gargoyleOutcome =
    currentStep.actionType === 'gargoyle_check' && revealConfirmed && pendingTarget !== null
      ? getGargoyleCheckResult(seats, effectiveMechWolfForPreview, pendingTarget, treasureMasterState)
      : null;

  const wolfWitchOutcome =
    currentStep.actionType === 'wolf_witch_check' && revealConfirmed && pendingTarget !== null
      ? getWolfWitchCheckResult(seats, effectiveMechWolfForPreview, pendingTarget, treasureMasterState)
      : null;

  const pureWhiteOutcome =
    currentStep.actionType === 'pure_white_check' && revealConfirmed && pendingTarget !== null
      ? getPureWhiteCheckResult(seats, effectiveMechWolfForPreview, pendingTarget, treasureMasterState)
      : null;

  const demonWolfOutcome =
    currentStep.actionType === 'demon_wolf_check' && revealConfirmed && pendingTarget !== null
      ? getDemonWolfCheckResult(seats, pendingTarget)
      : null;

  const pumpkinGhostOutcome =
    currentStep.actionType === 'pumpkin_ghost_check' &&
    revealConfirmed &&
    pendingTarget !== null &&
    pumpkinGhostState.hasInherited
      ? getPumpkinGhostCheckResult(
          seats,
          pumpkinGhostState,
          effectiveMechWolfForPreview,
          pendingTarget,
          treasureMasterState,
        )
      : null;

  const gravekeeperOutcome =
    currentStep.actionType === 'gravekeeper_check' ||
    currentStep.actionType === 'super_gravekeeper_action' ||
    currentStep.actionType === 'super_gravekeeper_heir_check'
      ? getGravekeeperExileResult(exiledHistory, round)
      : null;

  const nineTailedFoxOutcome =
    currentStep.actionType === 'nine_tailed_fox_check'
      ? evaluateNineTailedFoxTails(seats, round)
      : null;

  const moonSpiritHowlPreview =
    currentStep.actionType === 'wolf_kill' && seats.some((s) => s.roleId === 'moon_spirit_wolf')
      ? evaluateMoonSpiritHowl(seats, currentNightDraft.nightmareFearTarget ?? null)
      : null;

  const awakenedDreamJudgeOutcome =
    currentStep.actionType === 'awakened_dream_catcher_judge' &&
    currentNightDraft.awakenedDreamTarget != null
      ? evaluateAwakenedDreamTargetActed(
          seats,
          currentNightDraft.awakenedDreamTarget,
          { ...currentNightDraft, awakenedDreamKillTarget: pendingAwakenedDreamKill },
          round,
          currentNightDraft.nightmareFearTarget ?? null,
        )
      : null;

  const isHunterPoisonedTonight =
    hunterSeat !== undefined &&
    (currentNightDraft.witchPoisonTarget === hunterSeat.seatNumber ||
      (round >= 2 &&
        mechWolfState.learnedRoleId === 'witch' &&
        currentNightDraft.mechWolfSkillTarget === hunterSeat.seatNumber));

  const wolfTargetSeat =
    effectiveWolfTargetForWitch !== null
      ? seats.find((s) => s.seatNumber === effectiveWolfTargetForWitch)
      : undefined;

  const mechLearnedTargetSeat =
    currentNightDraft.mechWolfLearnTarget !== null
      ? seats.find((s) => s.seatNumber === currentNightDraft.mechWolfLearnTarget)
      : undefined;

  const isSeatSelectableForSkill =
    currentStep.actionType !== 'hunter_gesture' &&
    currentStep.actionType !== 'mech_wolf_reveal_skill' &&
    currentStep.actionType !== 'gargoyle_team_status' &&
    currentStep.actionType !== 'gravekeeper_check' &&
    currentStep.actionType !== 'super_gravekeeper_heir_check' &&
    currentStep.actionType !== 'nine_tailed_fox_check' &&
    currentStep.actionType !== 'awakened_dream_catcher_judge' &&
    currentStep.actionType !== 'alchemy_witch_snake' &&
    currentStep.actionType !== 'thief_choose' &&
    currentStep.actionType !== 'treasure_master_choose' &&
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
      const isSelected = pendingClaimSeats.includes(seatNumber);
      const isFlexibleCount =
        board.isFlexibleComposition ||
        Boolean(board.presetPlayerCounts?.length) ||
        Boolean(board.playerCountRange);
      const pendingNewClaimsCount = pendingClaimSeats.filter((sn) => {
        const sObj = seats.find((x) => x.seatNumber === sn);
        return sObj?.roleId !== activeClaimRoleId;
      }).length;
      const remainingAfterPending = Math.max(
        0,
        (activeRoleStatus?.remainingCount ?? 0) - pendingNewClaimsCount,
      );
      const isRoleFull =
        !isClaimedByActive &&
        !isSelected &&
        !isFlexibleCount &&
        activeRoleStatus !== undefined &&
        remainingAfterPending <= 0;

      const disabled = !activeClaimRoleId || isClaimedByOther || isRoleFull;
      const otherRoleName =
        isClaimedByOther && !isOnlineJudge
          ? (getRoleById(seat?.roleId)?.name ?? seat?.roleId ?? '其他身分')
          : '已認領';

      return {
        selected: isSelected,
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
          setPendingClaimSeats((prev) => {
            if (prev.includes(seatNumber)) {
              return prev.filter((n) => n !== seatNumber);
            }
            const allowMulti =
              isFlexibleCount || (activeRoleStatus !== undefined && activeRoleStatus.expectedCount > 1);
            if (!allowMulti) {
              return [seatNumber];
            }
            return [...prev, seatNumber].sort((a, b) => a - b);
          });
        },
      };
    }

    if (!isSeatSelectableForSkill || isSkillLocked) {
      return {
        selected: pendingTarget === seatNumber,
        disabled: true,
        reason: isSkillLocked ? '技能鎖定' : undefined,
        onSelect: () => {},
      };
    }

    const isAlive = seat?.isAlive ?? false;
    const toggleTarget = () =>
      setPendingTarget((prev) => (prev === seatNumber ? null : seatNumber));

    switch (currentStep.actionType) {
      case 'wolf_kill': {
        if (pendingSeedWolfInfect) {
          const check = canSeedWolfInfect(seats, seedWolfState, seatNumber);
          return {
            selected: pendingTarget === seatNumber,
            disabled: !check.allowed,
            reason: check.allowed ? undefined : check.reason,
            onSelect: toggleTarget,
          };
        }
        const isWolfBeauty = isAlive && seat?.roleId === 'wolf_beauty';
        const isEvilKnight = isAlive && seat?.roleId === 'evil_knight';
        const isDemonWolf = isAlive && seat?.roleId === 'demon_wolf';
        return {
          selected: pendingTarget === seatNumber,
          disabled: !isAlive || isWolfBeauty || isEvilKnight || isDemonWolf,
          reason: !isAlive
            ? '已出局'
            : isWolfBeauty
              ? '狼美禁自刀'
              : isEvilKnight
                ? '惡靈禁自刀'
                : isDemonWolf
                  ? '惡魔禁自刀'
                  : undefined,
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
      case 'nightmare_fear': {
        const check = canNightmareFear(seats, lastFearedSeat, seatNumber, round);
        return {
          selected: pendingTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: toggleTarget,
        };
      }
      case 'hybrid_choose': {
        const check = canHybridChooseIdol(seats, seatNumber, round);
        return {
          selected: pendingTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: toggleTarget,
        };
      }
      case 'awakened_seer_check': {
        const [a, b] = pendingDualTargets;
        const isSelected = a === seatNumber || b === seatNumber;
        return {
          selected: isSelected,
          disabled: !isAlive,
          reason: !isAlive ? '已出局' : undefined,
          onSelect: () => {
            setPendingDualTargets(([first, second]) => {
              if (first === seatNumber) return [second, null];
              if (second === seatNumber) return [first, null];
              if (first === null) return [seatNumber, second];
              if (second === null) return [first, seatNumber];
              return [second, seatNumber];
            });
          },
        };
      }
      case 'lantern_seer_check':
      case 'drunk_seer_check':
      case 'fool_seer_check':
      case 'gargoyle_check':
      case 'wolf_witch_check':
      case 'pure_white_check':
        return {
          selected: pendingTarget === seatNumber,
          disabled: !isAlive,
          reason: !isAlive ? '已出局' : undefined,
          onSelect: toggleTarget,
        };
      case 'fox_check':
        return {
          selected: pendingTarget === seatNumber,
          disabled: !isAlive || foxLostAbility,
          reason: foxLostAbility ? '技能已失效' : !isAlive ? '已出局' : undefined,
          onSelect: toggleTarget,
        };
      case 'demon_wolf_check': {
        const check = canDemonWolfCheck(seats, seatNumber);
        return {
          selected: pendingTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: toggleTarget,
        };
      }
      case 'pumpkin_ghost_check':
        return {
          selected: pendingTarget === seatNumber,
          disabled: !isAlive || !pumpkinGhostState.hasInherited,
          reason: !pumpkinGhostState.hasInherited ? '尚未繼承石像鬼' : !isAlive ? '已出局' : undefined,
          onSelect: toggleTarget,
        };
      case 'super_gravekeeper_action': {
        const check = canSuperGravekeeperChooseHeir(seats, seatNumber);
        return {
          selected: pendingTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: toggleTarget,
        };
      }
      case 'awakened_dream_catcher_dream': {
        const check = canAwakenedDreamCatcherDream(seats, lastAwakenedDreamTarget, seatNumber);
        return {
          selected: pendingTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: toggleTarget,
        };
      }
      case 'magician_swap':
      case 'wolf_warlock_swap':
      case 'trickster_wolf_swap': {
        const [a, b] = pendingDualTargets;
        const isSelected = a === seatNumber || b === seatNumber;
        const alreadyUsed =
          currentStep.actionType === 'magician_swap'
            ? interferenceState.magicianSwappedSeats.includes(seatNumber)
            : currentStep.actionType === 'wolf_warlock_swap'
              ? interferenceState.wolfWarlockSwappedSeats.includes(seatNumber)
              : ((interferenceState.lastTricksterPair ?? []) as number[]).includes(seatNumber);
        return {
          selected: isSelected,
          disabled: !isAlive || alreadyUsed,
          reason: alreadyUsed ? '不可重複選擇' : !isAlive ? '已出局' : undefined,
          onSelect: () => {
            setPendingDualTargets(([first, second]) => {
              if (first === seatNumber) return [second, null];
              if (second === seatNumber) return [first, null];
              if (first === null) return [seatNumber, second];
              if (second === null) return [first, seatNumber];
              return [second, seatNumber];
            });
          },
        };
      }
      case 'alchemy_witch_fog': {
        const isSelected = pendingMultiTargets.includes(seatNumber);
        const disabled =
          !isAlive ||
          interferenceState.alchemyFogUsed ||
          (!isSelected && pendingMultiTargets.length >= 3);
        return {
          selected: isSelected,
          disabled,
          reason: interferenceState.alchemyFogUsed ? '已使用' : !isAlive ? '已出局' : undefined,
          onSelect: () => {
            setPendingMultiTargets((prev) =>
              prev.includes(seatNumber)
                ? prev.filter((n) => n !== seatNumber)
                : prev.length < 3
                  ? [...prev, seatNumber]
                  : prev,
            );
          },
        };
      }
      case 'troublemaker_prank': {
        const check = canTroublemakerPrank(
          seats,
          interferenceState.lastTroublemakerTarget,
          seatNumber,
        );
        return {
          selected: pendingTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: toggleTarget,
        };
      }
      case 'time_eclipse_lock': {
        const check = canTimeEclipseLock(seats, interferenceState, seatNumber);
        return {
          selected: pendingTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: toggleTarget,
        };
      }
      case 'penguin_freeze': {
        const check = canPenguinFreeze(seats, interferenceState.lastPenguinTarget, seatNumber);
        return {
          selected: pendingTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: toggleTarget,
        };
      }
      case 'fox_cub_charm': {
        const check = canFoxCubCharm(seats, interferenceState.foxCubUsed, seatNumber, round);
        return {
          selected: pendingTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: toggleTarget,
        };
      }
      case 'mute_elder_mute': {
        const check = canMuteElderMute(seats, seatNumber);
        return {
          selected: pendingTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: toggleTarget,
        };
      }
      case 'medusa_petrify': {
        const check = canMedusaPetrify(seats, interferenceState.lastMedusaTarget, seatNumber);
        return {
          selected: pendingTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: toggleTarget,
        };
      }
      case 'silent_night_mentor_action': {
        const check = canSilentNightMentorAct(
          seats,
          interferenceState,
          pendingAmplifyMode ?? 'amplify',
          seatNumber,
          round,
        );
        return {
          selected: pendingTarget === seatNumber,
          disabled: !pendingAmplifyMode || !check.allowed,
          reason: !pendingAmplifyMode ? '請先選增幅或削弱' : check.allowed ? undefined : check.reason,
          onSelect: toggleTarget,
        };
      }
      case 'daylight_scholar_action': {
        const check = canDaylightScholarAct(
          seats,
          interferenceState,
          pendingAmplifyMode ?? 'amplify',
          seatNumber,
          round,
        );
        return {
          selected: pendingTarget === seatNumber,
          disabled: !pendingAmplifyMode || !check.allowed,
          reason: !pendingAmplifyMode ? '請先選增幅或削弱' : check.allowed ? undefined : check.reason,
          onSelect: toggleTarget,
        };
      }
      case 'fortune_teller_mark': {
        const check = canFortuneTellerMark(seats, interferenceState.fortuneTellerUsed, seatNumber);
        return {
          selected: pendingTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: toggleTarget,
        };
      }
      case 'radiant_earl_shield': {
        const check = canRadiantEarlShield(
          seats,
          interferenceState.lastRadiantEarlTarget,
          seatNumber,
          round,
        );
        return {
          selected: pendingTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: toggleTarget,
        };
      }
      case 'socialite_favor': {
        const check = canSocialiteFavor(seats, interferenceState.lastSocialiteTarget, seatNumber);
        return {
          selected: pendingTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: toggleTarget,
        };
      }
      case 'enchanter_bewitch': {
        const check = canEnchanterBewitch(seats, seatNumber);
        return {
          selected: pendingTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: toggleTarget,
        };
      }
      case 'black_bat_shield': {
        const check = canBlackBatShield(seats, interferenceState, seatNumber);
        return {
          selected: pendingTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: toggleTarget,
        };
      }
      case 'dark_night_envoy_shield': {
        const check = canDarkNightEnvoyShield(
          seats,
          interferenceState.lastDarkNightEnvoyTarget,
          seatNumber,
        );
        return {
          selected: pendingTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: toggleTarget,
        };
      }
      case 'awakened_witch_action': {
        const disabled =
          !isAlive || pendingUseAntidote || interferenceState.awakenedWitchPoisonsUsed >= 3;
        return {
          selected: pendingTarget === seatNumber,
          disabled,
          reason: pendingUseAntidote
            ? '已選解藥'
            : interferenceState.awakenedWitchPoisonsUsed >= 3
              ? '毒藥已用盡'
              : !isAlive
                ? '已出局'
                : undefined,
          onSelect: toggleTarget,
        };
      }
      case 'demon_hunter_hunt': {
        const check = canDemonHunterHunt(seats, seatNumber, round);
        return { selected: pendingTarget === seatNumber, disabled: !check.allowed, reason: check.reason, onSelect: toggleTarget };
      }
      case 'wolf_raven_claw_kill': {
        const check = canWolfRavenClawKill(seats, combatState, seatNumber);
        return { selected: pendingTarget === seatNumber, disabled: !check.allowed, reason: check.reason, onSelect: toggleTarget };
      }
      case 'assassin_wolf_assassinate': {
        return { selected: pendingTarget === seatNumber, disabled: !isAlive || round < 2, reason: round < 2 ? '第 2 晚起' : !isAlive ? '已出局' : undefined, onSelect: toggleTarget };
      }
      case 'big_bad_wolf_kill': {
        const check = canBigBadWolfExtraKill(seats, seatNumber);
        return { selected: pendingTarget === seatNumber, disabled: !check.allowed, reason: check.reason, onSelect: toggleTarget };
      }
      case 'big_grey_wolf_kill': {
        const check = canBigGreyWolfKill(seats, combatState, seatNumber, round);
        return { selected: pendingTarget === seatNumber, disabled: !check.allowed, reason: check.reason, onSelect: toggleTarget };
      }
      case 'wolf_younger_brother_kill': {
        const check = canWolfYoungerBrotherAwakenedKill(seats, combatState, seatNumber);
        return { selected: pendingTarget === seatNumber, disabled: !check.allowed, reason: check.reason, onSelect: toggleTarget };
      }
      case 'bee_wild_hunt_sting': {
        const [a, b] = pendingDualTargets;
        const disabled = !isAlive || round < 2 || combatState.beeWildHuntLostAbility;
        return {
          selected: a === seatNumber || b === seatNumber,
          disabled,
          reason: combatState.beeWildHuntLostAbility ? '技能失效' : round < 2 ? '第 2 晚起' : !isAlive ? '已出局' : undefined,
          onSelect: () => {
            setPendingDualTargets(([first, second]) => {
              if (first === null) return [seatNumber, second];
              if (second === null) return [first, seatNumber];
              if (first === seatNumber && second === seatNumber) return [null, null];
              return [second, seatNumber];
            });
          },
        };
      }
      case 'perseus_execute': {
        const check = canPerseusExecute(seats, combatState, seatNumber, round);
        return { selected: pendingTarget === seatNumber, disabled: !check.allowed, reason: check.reason, onSelect: toggleTarget };
      }
      case 'anubis_scale': {
        const [deadSeat, aliveSeat] = pendingDualTargets;
        const used = combatState.anubisUsedSeats.includes(seatNumber);
        return {
          selected: deadSeat === seatNumber || aliveSeat === seatNumber,
          disabled: round < 2 || used,
          reason: round < 2 ? '第 2 晚起' : used ? '已上天平' : undefined,
          onSelect: () => {
            setPendingDualTargets(([d, a]) =>
              !isAlive
                ? [d === seatNumber ? null : seatNumber, a]
                : [d, a === seatNumber ? null : seatNumber],
            );
          },
        };
      }
      case 'awakened_wolf_king_give_gun': {
        const check = canAwakenedWolfKingGiveGun(seats, combatState, seatNumber);
        return { selected: pendingTarget === seatNumber, disabled: !check.allowed, reason: check.reason, onSelect: toggleTarget };
      }
      case 'awakened_wolf_beauty_charm': {
        const check = canAwakenedWolfBeautyCharm(seats, combatState, seatNumber, round);
        return { selected: pendingTarget === seatNumber, disabled: !check.allowed, reason: check.reason, onSelect: toggleTarget };
      }
      case 'scarlet_wolf_king_attach': {
        const check = canScarletAttach(seats, combatState, seatNumber);
        return { selected: pendingTarget === seatNumber, disabled: !check.allowed, reason: check.reason, onSelect: toggleTarget };
      }
      case 'night_noble_servant': {
        const check = canNightNobleChooseServant(seats, combatState, seatNumber, round);
        return { selected: pendingTarget === seatNumber, disabled: !check.allowed, reason: check.reason, onSelect: toggleTarget };
      }
      case 'awakened_idiot_shield': {
        const check = canAwakenedIdiotShield(seats, combatState, seatNumber);
        return { selected: pendingTarget === seatNumber, disabled: !check.allowed, reason: check.reason, onSelect: toggleTarget };
      }
      case 'warden_wolf_trade': {
        const [a, b] = pendingDualTargets;
        const used = combatState.wardenTradedSeats.includes(seatNumber);
        return {
          selected: a === seatNumber || b === seatNumber,
          disabled: !isAlive || round < 2 || used,
          reason: round < 2 ? '第 2 晚起' : used ? '已交易過' : !isAlive ? '已出局' : undefined,
          onSelect: () => {
            setPendingDualTargets(([first, second]) => {
              if (first === seatNumber) return [second, null];
              if (second === seatNumber) return [first, null];
              if (first === null) return [seatNumber, second];
              if (second === null) return [first, seatNumber];
              return [second, seatNumber];
            });
          },
        };
      }
      case 'ghost_bride_link': {
        if (round >= 2) {
          return {
            selected: pendingTarget === seatNumber,
            disabled: !isAlive,
            reason: !isAlive ? '已出局' : undefined,
            onSelect: toggleTarget,
          };
        }
        const [a, b] = pendingDualTargets;
        return {
          selected: a === seatNumber || b === seatNumber,
          disabled: !isAlive,
          reason: !isAlive ? '已出局' : undefined,
          onSelect: () => {
            setPendingDualTargets(([first, second]) => {
              if (first === seatNumber) return [second, null];
              if (second === seatNumber) return [first, null];
              if (first === null) return [seatNumber, second];
              if (second === null) return [first, seatNumber];
              return [second, seatNumber];
            });
          },
        };
      }
      case 'cupid_link':
      case 'scent_phantom_link':
      case 'xu_xian_action': {
        const [a, b] = pendingDualTargets;
        return {
          selected: a === seatNumber || b === seatNumber,
          disabled: !isAlive,
          reason: !isAlive ? '已出局' : undefined,
          onSelect: () => {
            setPendingDualTargets(([first, second]) => {
              if (first === seatNumber) return [second, null];
              if (second === seatNumber) return [first, null];
              if (first === null) return [seatNumber, second];
              if (second === null) return [first, seatNumber];
              return [second, seatNumber];
            });
          },
        };
      }
      case 'zombie_infect': {
        const alreadyInf = conversionState.zombieInfectedSeats.includes(seatNumber);
        const isZombie = seat?.roleId === 'zombie';
        const isSelected = pendingMultiTargets.includes(seatNumber);
        const disabled =
          !isAlive || alreadyInf || isZombie || (!isSelected && pendingMultiTargets.length >= 2);
        return {
          selected: isSelected,
          disabled,
          reason: isZombie ? '殭屍本人' : alreadyInf ? '已感染' : !isAlive ? '已出局' : undefined,
          onSelect: () => {
            setPendingMultiTargets((prev) =>
              prev.includes(seatNumber)
                ? prev.filter((n) => n !== seatNumber)
                : prev.length < 2
                  ? [...prev, seatNumber]
                  : prev,
            );
          },
        };
      }
      case 'twins_guard': {
        const check = canTwinsGuard(seats, conversionState, seatNumber, round);
        return { selected: pendingTarget === seatNumber, disabled: !check.allowed, reason: check.reason, onSelect: toggleTarget };
      }
      case 'awakened_gargoyle_convert': {
        const check = canAwakenedGargoyleConvert(seats, seatNumber, round);
        return { selected: pendingTarget === seatNumber, disabled: !check.allowed, reason: check.reason, onSelect: toggleTarget };
      }
      case 'puppet_wolf_choose': {
        const check = canPuppetChoose(seats, seatNumber, round);
        return { selected: pendingTarget === seatNumber, disabled: !check.allowed, reason: check.reason, onSelect: toggleTarget };
      }
      case 'jack_ripper_action': {
        const isSecondId = isJackSecondIdentityBoard(seats, board.id);
        const check =
          isSecondId && round === 1
            ? canJackRipperSelectFanatic(seats, seatNumber, round, board.id)
            : canJackRipperKill(
                seats,
                conversionState ?? createInitialConversionState(),
                seatNumber,
                round,
                board.id,
              );
        return { selected: pendingTarget === seatNumber, disabled: !check.allowed, reason: check.reason, onSelect: toggleTarget };
      }
      case 'white_snake_action':
      case 'awakened_lonely_girl_choose':
      case 'wild_child_choose':
      case 'shadow_choose':
      case 'chameleon_wolf_choose':
      case 'pandora_gift':
      case 'pandora_knife':
      case 'sleeping_beauty_pick':
      case 'exotic_prince_check':
      case 'nine_tails_mark':
      case 'bai_ze_clear':
      case 'crow_curse':
      case 'miracle_merchant_gift':
      case 'black_market_gift':
      case 'evil_merchant_gift':
      case 'butler_tea':
      case 'wolf_maid_tea':
      case 'lucky_item_action': {
        const luckyNight1Blocked =
          round === 1 && activeLuckyActor !== null && !activeLuckyActor.allowedThisRound;
        return {
          selected: !luckyNight1Blocked && pendingTarget === seatNumber,
          disabled: !isAlive || luckyNight1Blocked,
          reason: luckyNight1Blocked ? '依房規首夜不可使用' : !isAlive ? '已出局' : undefined,
          onSelect: toggleTarget,
        };
      }
      case 'happy_sheep_action':
      case 'police_dog_action':
      case 'little_girl_identify':
        return {
          selected: pendingTarget === seatNumber,
          disabled: !isAlive,
          reason: !isAlive ? '已出局' : undefined,
          onSelect: toggleTarget,
        };
      case 'eclipse_maid_devour':
      case 'grey_wolf_boss_steal':
      case 'masked_wolf_action':
      case 'medium_channel':
        return {
          selected: pendingDualTargets.includes(seatNumber),
          disabled: currentStep.actionType === 'masked_wolf_action' ? !isAlive : false,
          onSelect: () => {
            setPendingDualTargets(([first, second]) => {
              if (first === seatNumber) return [second, null];
              if (second === seatNumber) return [first, null];
              if (first === null) return [seatNumber, second];
              if (second === null) return [first, seatNumber];
              return [second, seatNumber];
            });
          },
        };
      case 'dancer_dance':
      case 'super_black_market_gift':
        return {
          selected: pendingMultiTargets.includes(seatNumber),
          disabled: !isAlive,
          reason: !isAlive ? '已出局' : undefined,
          onSelect: () => {
            setPendingMultiTargets((prev) => {
              if (prev.includes(seatNumber)) {
                return prev.filter((n) => n !== seatNumber);
              }
              if (prev.length >= 3) {
                return [...prev.slice(1), seatNumber];
              }
              return [...prev, seatNumber];
            });
          },
        };
      case 'poisoner_poison': {
        const check = canPoisonerUsePoison(seats, seatNumber, poisonerPoisonUsed);
        return {
          selected: pendingTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: toggleTarget,
        };
      }
      case 'wolf_girl_confess': {
        const isSelf = seat?.roleId === 'wolf_girl';
        const isWolf = seat ? isSeatWolfFaction(seat) : false;
        return {
          selected: pendingTarget === seatNumber,
          disabled: !isAlive || isSelf || isWolf,
          reason: !isAlive ? '已出局' : isSelf ? '不可選自己' : isWolf ? '不可表白狼人' : undefined,
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
        if (pendingSeedWolfInfect && pendingTarget !== null) {
          updateNightDraft({ wolfTarget: null, seedWolfInfectTarget: pendingTarget });
        } else {
          updateNightDraft({ wolfTarget: pendingTarget, seedWolfInfectTarget: null });
        }
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
      case 'poisoner_poison':
        updateNightDraft({ poisonerTarget: pendingTarget });
        break;
      case 'wolf_girl_confess':
        updateNightDraft({ wolfGirlConfessTarget: pendingTarget });
        break;
      case 'thief_choose':
        updateNightDraft({ thiefChosenRoleId: pendingThiefRoleId });
        break;
      case 'treasure_master_choose':
        updateNightDraft({ treasureMasterCardRoleId: pendingTreasureCardRoleId });
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
      case 'nightmare_fear':
        updateNightDraft({ nightmareFearTarget: pendingTarget });
        break;
      case 'hybrid_choose':
        updateNightDraft({ hybridIdolTarget: pendingTarget });
        break;
      case 'awakened_seer_check':
        updateNightDraft({ awakenedSeerTargets: pendingDualTargets });
        break;
      case 'lantern_seer_check':
        updateNightDraft({ lanternSeerCheckTarget: pendingTarget });
        break;
      case 'drunk_seer_check':
        updateNightDraft({
          drunkSeerCheckTarget: pendingTarget,
          drunkSeerManualResult: pendingDrunkManual,
        });
        break;
      case 'fool_seer_check':
        updateNightDraft({ foolSeerCheckTarget: pendingTarget });
        break;
      case 'fox_check':
        updateNightDraft({ foxCheckTarget: pendingTarget });
        break;
      case 'gargoyle_check':
        updateNightDraft({ gargoyleCheckTarget: pendingTarget });
        break;
      case 'wolf_witch_check':
        updateNightDraft({ wolfWitchCheckTarget: pendingTarget });
        break;
      case 'pure_white_check':
        updateNightDraft({ pureWhiteCheckTarget: pendingTarget });
        break;
      case 'demon_wolf_check':
        updateNightDraft({ demonWolfCheckTarget: pendingTarget });
        break;
      case 'pumpkin_ghost_check':
        updateNightDraft({ pumpkinGhostCheckTarget: pendingTarget });
        break;
      case 'super_gravekeeper_action':
        updateNightDraft({ superGravekeeperHeirTarget: pendingTarget });
        break;
      case 'awakened_dream_catcher_dream':
        updateNightDraft({ awakenedDreamTarget: pendingTarget });
        break;
      case 'awakened_dream_catcher_judge':
        updateNightDraft({ awakenedDreamKillTarget: round >= 2 ? pendingAwakenedDreamKill : false });
        break;
      case 'magician_swap':
        updateNightDraft({ magicianSwapPair: pendingDualTargets });
        break;
      case 'wolf_warlock_swap':
        updateNightDraft({ wolfWarlockSwapPair: pendingDualTargets });
        break;
      case 'trickster_wolf_swap':
        updateNightDraft({ tricksterSwapPair: pendingDualTargets });
        break;
      case 'troublemaker_prank':
        updateNightDraft({ troublemakerTarget: pendingTarget });
        break;
      case 'time_eclipse_lock':
        updateNightDraft({ timeEclipseTarget: pendingTarget });
        break;
      case 'penguin_freeze':
        updateNightDraft({ penguinFreezeTarget: pendingTarget });
        break;
      case 'fox_cub_charm':
        updateNightDraft({ foxCubCharmTarget: pendingTarget });
        break;
      case 'mute_elder_mute':
        updateNightDraft({ muteElderTarget: pendingTarget });
        break;
      case 'medusa_petrify':
        updateNightDraft({ medusaPetrifyTarget: pendingTarget });
        break;
      case 'silent_night_mentor_action':
        updateNightDraft({
          silentNightMentorMode: pendingAmplifyMode,
          silentNightMentorTarget: pendingAmplifyMode ? pendingTarget : null,
        });
        break;
      case 'daylight_scholar_action':
        updateNightDraft({
          daylightScholarMode: pendingAmplifyMode,
          daylightScholarTarget: pendingAmplifyMode ? pendingTarget : null,
        });
        break;
      case 'fortune_teller_mark':
        updateNightDraft({ fortuneTellerMarkTarget: pendingTarget });
        break;
      case 'radiant_earl_shield':
        updateNightDraft({ radiantEarlTarget: pendingTarget });
        break;
      case 'socialite_favor':
        updateNightDraft({ socialiteTarget: pendingTarget });
        break;
      case 'enchanter_bewitch':
        updateNightDraft({ enchanterTarget: pendingTarget });
        break;
      case 'black_bat_shield':
        updateNightDraft({ blackBatTarget: pendingTarget });
        break;
      case 'dark_night_envoy_shield':
        updateNightDraft({ darkNightEnvoyTarget: pendingTarget });
        break;
      case 'alchemy_witch_fog':
        updateNightDraft({ alchemyFogTargets: pendingMultiTargets });
        break;
      case 'awakened_witch_action':
        updateNightDraft({
          awakenedWitchUseAntidote: pendingUseAntidote,
          awakenedWitchPoisonTarget: pendingUseAntidote ? null : pendingTarget,
          awakenedWitchHelpers: pendingUseAntidote ? [] : pendingMultiTargets,
          awakenedWitchHelpersApproved: pendingAwHelpersApproved,
        });
        break;
      case 'demon_hunter_hunt':
        updateNightDraft({ demonHunterTarget: pendingTarget });
        break;
      case 'wolf_raven_claw_kill':
        updateNightDraft({ wolfRavenClawKillTarget: pendingTarget });
        break;
      case 'assassin_wolf_assassinate':
        updateNightDraft({
          assassinTarget: pendingTarget,
          assassinGuessedRoleId: pendingTarget !== null ? pendingAssassinRoleId || null : null,
        });
        break;
      case 'big_bad_wolf_kill':
        updateNightDraft({ bigBadWolfKillTarget: pendingTarget });
        break;
      case 'big_grey_wolf_kill':
        updateNightDraft({ bigGreyWolfKillTarget: pendingTarget });
        break;
      case 'wolf_younger_brother_kill':
        updateNightDraft({ wolfYoungerBrotherKillTarget: pendingTarget });
        break;
      case 'bee_wild_hunt_sting':
        updateNightDraft({ beeWildHuntTargets: pendingDualTargets });
        break;
      case 'perseus_execute':
        updateNightDraft({ perseusExecuteTarget: pendingTarget });
        break;
      case 'anubis_scale':
        updateNightDraft({
          anubisDeadSeat: pendingDualTargets[0],
          anubisAliveSeat: pendingDualTargets[1],
        });
        break;
      case 'awakened_wolf_king_give_gun':
        updateNightDraft({ awakenedWolfKingGiveGunTarget: pendingTarget });
        break;
      case 'awakened_wolf_beauty_charm':
        updateNightDraft({ awakenedWolfBeautyCharmTarget: pendingTarget });
        break;
      case 'scarlet_wolf_king_attach':
        updateNightDraft({ scarletAttachTarget: pendingTarget });
        break;
      case 'night_noble_servant':
        updateNightDraft({ nightNobleServantTarget: pendingTarget });
        break;
      case 'awakened_idiot_shield':
        updateNightDraft({ awakenedIdiotShieldTarget: pendingTarget });
        break;
      case 'warden_wolf_trade':
        updateNightDraft({
          wardenTradePair: pendingDualTargets,
          wardenTradeChoices: pendingWardenChoices,
        });
        break;
      case 'cupid_link':
        updateNightDraft({ cupidLoversPair: pendingDualTargets });
        break;
      case 'ghost_bride_link':
        if (round >= 2) {
          updateNightDraft({ ghostBrideKillTarget: pendingTarget });
        } else {
          updateNightDraft({
            ghostBrideGroomTarget: pendingDualTargets[0],
            ghostBrideWitnessTarget: pendingDualTargets[1],
          });
        }
        break;
      case 'scent_phantom_link':
        updateNightDraft({ scentPhantomChainPair: pendingDualTargets });
        break;
      case 'twins_guard':
        updateNightDraft({ twinsGuardTarget: pendingTarget });
        break;
      case 'white_snake_action':
        updateNightDraft({ whiteSnakeTarget: pendingTarget });
        break;
      case 'xu_xian_action':
        updateNightDraft({ xuXianBindPair: pendingDualTargets });
        break;
      case 'awakened_gargoyle_convert':
        updateNightDraft({ awakenedGargoyleConvertTarget: pendingTarget });
        break;
      case 'awakened_lonely_girl_choose':
        updateNightDraft({ awakenedLonelyGirlIdolTarget: pendingTarget });
        break;
      case 'wild_child_choose':
        updateNightDraft({ wildChildIdolTarget: pendingTarget });
        break;
      case 'shadow_choose':
        updateNightDraft({ shadowMasterTarget: pendingTarget });
        break;
      case 'puppet_wolf_choose':
        updateNightDraft({ puppetTarget: pendingTarget });
        break;
      case 'zombie_infect':
        updateNightDraft({ zombieInfectTargets: pendingMultiTargets });
        break;
      case 'chameleon_wolf_choose':
        updateNightDraft({ chameleonWolfTarget: pendingTarget });
        break;
      case 'jack_ripper_action':
        if (isJackSecondIdentityBoard(seats, board.id) && round === 1) {
          updateNightDraft({ jackRipperFanaticTarget: pendingTarget });
        } else {
          updateNightDraft({ jackRipperKillTarget: pendingTarget });
        }
        break;
      case 'pandora_gift':
        updateNightDraft({ pandoraGiftTarget: pendingTarget });
        break;
      case 'pandora_knife':
        updateNightDraft({ pandoraKnifeTarget: pendingTarget });
        break;
      case 'sleeping_beauty_pick':
        updateNightDraft({ sleepingBeautyPickSeat: pendingTarget });
        break;
      case 'exotic_prince_check':
        updateNightDraft({ exoticPrinceCheckTarget: pendingTarget });
        break;
      case 'nine_tails_mark':
        updateNightDraft({ nineTailsMarkTarget: pendingTarget });
        break;
      case 'bai_ze_clear':
        updateNightDraft({ baiZeClearTarget: pendingTarget });
        break;
      case 'dancer_dance':
        updateNightDraft({ dancerFloorTargets: pendingMultiTargets });
        break;
      case 'masked_wolf_action':
        updateNightDraft({
          maskedWolfCheckTarget: pendingDualTargets[0],
          maskedWolfAlterTarget: pendingDualTargets[1],
        });
        break;
      case 'crow_curse':
        updateNightDraft({ crowCurseTarget: pendingTarget });
        break;
      case 'miracle_merchant_gift':
        updateNightDraft({
          miracleMerchantTarget: pendingTarget,
          miracleMerchantItem: pendingMerchantItem,
        });
        break;
      case 'black_market_gift':
        updateNightDraft({
          blackMarketTarget: pendingTarget,
          blackMarketItem: pendingMerchantItem,
        });
        break;
      case 'super_black_market_gift':
        updateNightDraft({
          superBlackMarketTargets: {
            seer_check: pendingMultiTargets[0] ?? null,
            witch_poison: pendingMultiTargets[1] ?? null,
            hunter_gun: pendingMultiTargets[2] ?? null,
          },
        });
        break;
      case 'evil_merchant_gift': {
        const evilGiftType = round === 1 ? 'hunter_gun' : 'witch_poison';
        updateNightDraft({
          evilMerchantTarget: pendingTarget,
          evilMerchantGiftType: pendingTarget !== null ? evilGiftType : null,
          ...(thirdPartySpecialState?.evilMerchantPoisonHolderSeat != null
            ? { evilMerchantPoisonActionTarget: pendingEvilPoisonTarget }
            : {}),
        });
        break;
      }
      case 'medium_channel':
        updateNightDraft({
          mediumDeadSeat: pendingDualTargets[0],
          mediumHeirSeat: pendingDualTargets[1],
        });
        break;
      case 'butler_tea':
        updateNightDraft({ butlerTeaTarget: pendingTarget, butlerTeaAccepted: true });
        break;
      case 'wolf_maid_tea':
        updateNightDraft({ wolfMaidTeaTarget: pendingTarget, wolfMaidTeaAccepted: true });
        break;
      case 'lucky_item_action': {
        const luckyActorSeat =
          activeLuckyActor?.actorSeat ??
          thirdPartySpecialState?.miracleLuckySeat ??
          thirdPartySpecialState?.blackMarketLuckySeat ??
          thirdPartySpecialState?.superBlackMarketGifts.find((g) => !g.used)?.seat ??
          null;
        updateNightDraft({
          luckyItemActorSeat: luckyActorSeat,
          luckyItemTargetSeat: pendingTarget,
        });
        break;
      }
      case 'eclipse_maid_devour':
        updateNightDraft({
          eclipseMaidDevourTarget: pendingDualTargets[0],
          eclipseMaidUseSkillTarget: pendingDualTargets[1],
        });
        break;
      case 'grey_wolf_boss_steal':
        updateNightDraft({
          greyWolfBossStealTarget: pendingDualTargets[0],
          greyWolfBossUseSkillTarget: pendingDualTargets[1],
        });
        break;
      case 'happy_sheep_action':
        updateNightDraft({
          happySheepTarget: pendingTarget,
          happySheepMode: currentNightDraft.happySheepMode ?? 'guard',
        });
        break;
      case 'phantom_wolf_invincible':
        updateNightDraft({
          phantomWolfActivateInvincible: currentNightDraft.phantomWolfActivateInvincible ?? false,
        });
        break;
      case 'police_dog_action':
        updateNightDraft({ policeDogTarget: pendingTarget });
        break;
      case 'little_girl_identify':
        updateNightDraft({ littleGirlIdentifyTarget: pendingTarget });
        break;
      default:
        break;
    }
  };

  // 推進步驟（夜晚中途提前達成勝負立即天亮；線上法官進入閉眼→睜眼靜音緩衝）
  const advanceAfterCommit = () => {
    // 夜間任一步驟結算後若已達成陣營勝利條件（且後續已無救人步驟），立即結束剩餘夜間步驟並天亮結算
    if (!isLastStep && checkEarlyNightVictory()) {
      ambientAudioEngine.playSoftCue('dawn');
      if (isOnlineJudge) {
        ttsEngine.speakFromGesture('天亮了，請睜眼', {
          enabled: onlineJudgeSettings.ttsEnabled,
          rate: onlineJudgeSettings.ttsRate,
        });
      }
      finishNight();
      return;
    }

    if (isOnlineJudge) {
      const latestDraft = useGameStore.getState().currentNightDraft;
      const touchEvt = getTouchConfirmEventAfterStep(currentStep, latestDraft, round, board.id);
      ttsEngine.speakFromGesture(buildStepCloseSpeech(currentStep), {
        enabled: onlineJudgeSettings.ttsEnabled,
        rate: onlineJudgeSettings.ttsRate,
      });
      if (touchEvt && touchConfirmSeats.length > 0) {
        setTouchConfirmEvent(touchEvt);
        setTouchConfirmIdx(0);
        setBufferTarget('touch_confirm');
        if (closeToOpenDelay <= 0) {
          setOnlinePhase('touch_confirm_blackout');
        } else {
          setBufferRemaining(closeToOpenDelay);
          setOnlinePhase('buffer');
        }
        return;
      }
      setBufferTarget('next_step');
      if (closeToOpenDelay <= 0) {
        completeBufferTransition();
      } else {
        setBufferRemaining(closeToOpenDelay);
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

  // 處理「認領階段」確認鍵（支援同角色多席次批次認領／解除）
  const handleConfirmClaimAction = () => {
    if (!activeClaimRoleId) return;
    if (pendingClaimSeats.length > 0) {
      for (const seatNum of pendingClaimSeats) {
        const targetSeat = seats.find((s) => s.seatNumber === seatNum);
        const isUnclaiming = targetSeat?.roleId === activeClaimRoleId;
        const res = claimSeatRole(seatNum, isUnclaiming ? null : activeClaimRoleId);
        if (!res.ok) {
          setClaimError(res.reason ?? '認領失敗');
          return;
        }
      }
      setClaimError(null);
      setPendingClaimSeats([]);
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
    if (isSkillLocked) {
      advanceAfterCommit();
      return;
    }
    if (!pendingValidation.allowed) return;

    // 查驗類步驟：若有選擇目標且尚未揭曉，先寫入草稿並鎖定揭曉查驗結果
    const hasRevealableSelection =
      currentStep.actionType === 'awakened_seer_check'
        ? pendingDualTargets[0] !== null && pendingDualTargets[1] !== null
        : pendingTarget !== null;
    if (isInfoRevealStep && hasRevealableSelection && !revealConfirmed) {
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

  // 線上法官：點擊全黑防窺畫面亮起操作盤（只唸睜眼與閉眼，不唸中間操作提示）
  const handleWakeOnlineScreen = () => {
    setOnlinePhase('active');
  };

  // 線上法官：輪流確認附加身分（點亮查看 → 確認並閉眼 → 下一位或結束）
  const handleWakeTouchConfirm = () => {
    setOnlinePhase('touch_confirm_reveal');
  };

  const handleCloseTouchConfirm = () => {
    if (activeTouchConfirmSeat == null) return;
    ttsEngine.speakFromGesture(`${formatSeatNum(activeTouchConfirmSeat)} 號請閉眼`, {
      enabled: onlineJudgeSettings.ttsEnabled,
      rate: onlineJudgeSettings.ttsRate,
    });
    const nextIdx = touchConfirmIdx + 1;
    if (nextIdx < touchConfirmSeats.length) {
      setTouchConfirmIdx(nextIdx);
      setBufferTarget('touch_confirm');
      if (closeToOpenDelay <= 0) {
        setOnlinePhase('touch_confirm_blackout');
      } else {
        setBufferRemaining(closeToOpenDelay);
        setOnlinePhase('buffer');
      }
    } else {
      setTouchConfirmEvent(null);
      setTouchConfirmIdx(0);
      setBufferTarget('next_step');
      if (closeToOpenDelay <= 0) {
        if (isLastStep) {
          setOnlinePhase('dawn');
        } else {
          nextNightStep();
          setOnlinePhase('blackout');
        }
      } else {
        setBufferRemaining(closeToOpenDelay);
        setOnlinePhase('buffer');
      }
    }
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
    if (onlinePhase === 'night_intro') {
      ttsEngine.speakFromGesture(buildNightStartSpeech(), {
        enabled: true,
        rate: onlineJudgeSettings.ttsRate,
        warmupDelayMs: 300,
      });
      return;
    }
    if (onlinePhase === 'dawn') {
      ttsEngine.speakSequence(
        [
          { text: dawnSpeechPlan.introText, delayAfterMs: 1000 },
          { text: dawnSpeechPlan.countdown[0], delayAfterMs: 1000 },
          { text: dawnSpeechPlan.countdown[1], delayAfterMs: 1000 },
          { text: dawnSpeechPlan.countdown[2], delayAfterMs: 600 },
        ],
        {
          enabled: true,
          rate: onlineJudgeSettings.ttsRate,
          onItemStart: (idx) => {
            if (idx === 0) setDawnCountdownDigit(null);
            else if (idx === 1) setDawnCountdownDigit(3);
            else if (idx === 2) setDawnCountdownDigit(2);
            else if (idx === 3) setDawnCountdownDigit(1);
          },
          onEnd: () => setDawnCountdownDigit(null),
        },
      );
      return;
    }
    if (onlinePhase === 'touch_confirm_blackout' && activeTouchConfirmSeat != null) {
      ttsEngine.speakFromGesture(`${formatSeatNum(activeTouchConfirmSeat)} 號請睜眼`, {
        enabled: true,
        rate: onlineJudgeSettings.ttsRate,
      });
      return;
    }
    const textToSpeak =
      onlinePhase === 'buffer'
        ? buildStepCloseSpeech(currentStep)
        : buildStepOpenSpeech(currentStep);
    ttsEngine.speakFromGesture(textToSpeak, {
      enabled: true,
      rate: onlineJudgeSettings.ttsRate,
    });
  };

  const handleCycleBufferSeconds = () => {
    const cur = closeToOpenDelay;
    const nextIdx = BUFFER_PRESET_STEPS.findIndex((v) => v > cur);
    const nextVal = nextIdx === -1 ? BUFFER_PRESET_STEPS[0] : BUFFER_PRESET_STEPS[nextIdx];
    updateOnlineJudgeSettings({ closeToOpenDelaySeconds: nextVal });
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
  const isPendingUnclaim =
    pendingClaimSeats.length > 0 &&
    activeClaimRoleId !== null &&
    pendingClaimSeats.every(
      (sn) => seats.find((s) => s.seatNumber === sn)?.roleId === activeClaimRoleId,
    );

  // 產生資訊結果與「放大展示給玩家看」資料（適用實體法官與線上語音法官）
  const currentFlashcardCandidate: InfoFlashcardData | null = useMemo(() => {
    if (isClaimStage) return null;
    if (seerOutcome) {
      return {
        eyebrow: '預言家查驗結果',
        subject: `${formatSeatNum(seerOutcome.targetSeat)} 號`,
        headline: seerOutcome.faction === 'wolf' ? '狼人陣營（查殺）' : '好人陣營（金水）',
        tone: seerOutcome.faction === 'wolf' ? 'wolf' : 'good',
      };
    }
    if (luckySeerOutcome) {
      return {
        eyebrow: '幸運兒查驗結果',
        subject: `${formatSeatNum(luckySeerOutcome.targetSeat)} 號`,
        headline: luckySeerOutcome.faction === 'wolf' ? '狼人陣營（查殺）' : '好人陣營（金水）',
        tone: luckySeerOutcome.faction === 'wolf' ? 'wolf' : 'good',
      };
    }
    if (psychicOutcome) {
      const rName = getRoleById(psychicOutcome.perceivedRoleId)?.name ?? psychicOutcome.perceivedRoleId;
      return {
        eyebrow: '通靈師查驗底牌',
        subject: `${formatSeatNum(psychicOutcome.targetSeat)} 號`,
        headline: rName,
        tone: 'third',
      };
    }
    if (mechWolfPsychicOutcome) {
      const rName =
        getRoleById(mechWolfPsychicOutcome.perceivedRoleId)?.name ??
        mechWolfPsychicOutcome.perceivedRoleId;
      return {
        eyebrow: '機械狼查驗底牌',
        subject: `${formatSeatNum(mechWolfPsychicOutcome.targetSeat)} 號`,
        headline: rName,
        tone: 'third',
      };
    }
    if (awakenedSeerOutcome) {
      return {
        eyebrow: '覺醒預言家雙驗',
        subject: `${formatSeatNum(awakenedSeerOutcome.targetSeats[0])} 號、${formatSeatNum(awakenedSeerOutcome.targetSeats[1])} 號`,
        headline:
          awakenedSeerOutcome.result === 'double_good' ? '雙金水（皆好人）' : '疑似狼人（含狼）',
        tone: awakenedSeerOutcome.result === 'double_good' ? 'good' : 'wolf',
      };
    }
    if (lanternSeerOutcome) {
      return {
        eyebrow: '燈影預言家查驗',
        subject: `${formatSeatNum(lanternSeerOutcome.targetSeat)} 號`,
        headline: lanternSeerOutcome.faction === 'wolf' ? '狼人陣營（查殺）' : '好人陣營（金水）',
        tone: lanternSeerOutcome.faction === 'wolf' ? 'wolf' : 'good',
      };
    }
    if (drunkSeerOutcome) {
      return {
        eyebrow: '查驗結果',
        subject: `${formatSeatNum(drunkSeerOutcome.targetSeat)} 號`,
        headline: drunkSeerOutcome.faction === 'wolf' ? '狼人陣營（查殺）' : '好人陣營（金水）',
        tone: drunkSeerOutcome.faction === 'wolf' ? 'wolf' : 'good',
      };
    }
    if (foolSeerOutcome) {
      return {
        eyebrow: '愚言家查驗結果',
        subject: `${formatSeatNum(foolSeerOutcome.targetSeat)} 號`,
        headline: foolSeerOutcome.faction === 'wolf' ? '狼人陣營（查殺）' : '好人陣營（金水）',
        tone: foolSeerOutcome.faction === 'wolf' ? 'wolf' : 'good',
      };
    }
    if (foxOutcome) {
      return {
        eyebrow: '狐狸查驗結果',
        subject: `${foxOutcome.checkedSeats.map(formatSeatNum).join('、')} 號`,
        headline: foxOutcome.hasWolf ? '含狼人（技能保留）' : '全好人（技能失效）',
        tone: foxOutcome.hasWolf ? 'wolf' : 'sheriff',
      };
    }
    const exactCheck = gargoyleOutcome ?? wolfWitchOutcome ?? pureWhiteOutcome ?? pumpkinGhostOutcome;
    if (exactCheck) {
      const rName = getRoleById(exactCheck.perceivedRoleId)?.name ?? exactCheck.perceivedRoleId;
      return {
        eyebrow: `${currentStep.actorLabel} · 底牌查驗`,
        subject: `${formatSeatNum(exactCheck.targetSeat)} 號`,
        headline: rName,
        tone: 'third',
      };
    }
    if (demonWolfOutcome) {
      return {
        eyebrow: '惡魔查驗結果',
        subject: `${formatSeatNum(demonWolfOutcome.targetSeat)} 號`,
        headline: demonWolfOutcome.roleType === 'god' ? '神職' : '平民',
        tone: 'third',
      };
    }
    if (
      (currentStep.actionType === 'gravekeeper_check' ||
        currentStep.actionType === 'super_gravekeeper_action' ||
        currentStep.actionType === 'super_gravekeeper_heir_check') &&
      gravekeeperOutcome
    ) {
      return {
        eyebrow: '守墓人驗屍結果',
        ...(gravekeeperOutcome.exiledSeat !== null
          ? {
              subject: `${formatSeatNum(gravekeeperOutcome.exiledSeat)} 號`,
              headline: gravekeeperOutcome.faction === 'wolf' ? '狼人陣營' : '好人陣營',
            }
          : { headline: '昨日無放逐紀錄' }),
        tone: gravekeeperOutcome.faction === 'wolf' ? 'wolf' : 'good',
      };
    }
    if (currentStep.actionType === 'hunter_gesture' && hunterSeat?.isAlive) {
      return {
        eyebrow: '獵人開槍狀態',
        headline: isHunterPoisonedTonight ? '不可開槍' : '可以開槍',
        tone: isHunterPoisonedTonight ? 'wolf' : 'good',
      };
    }
    if (currentStep.actionType === 'mech_wolf_reveal_skill' && mechLearnedTargetSeat?.roleId) {
      const rName = getRoleById(mechLearnedTargetSeat.roleId)?.name ?? mechLearnedTargetSeat.roleId;
      return {
        eyebrow: '機械狼習得身分',
        headline: rName,
        detail: `對象：${formatSeatNum(mechLearnedTargetSeat.seatNumber)} 號`,
        tone: 'sheriff',
      };
    }
    if (currentStep.actionType === 'witch_action' && !witchAntidoteUsed && !isSkillLocked) {
      return {
        eyebrow: '今晚被刀對象',
        headline: wolfTargetSeat ? `${formatSeatNum(wolfTargetSeat.seatNumber)} 號` : '今晚平安（空刀）',
        tone: wolfTargetSeat ? 'wolf' : 'good',
      };
    }
    if (
      currentStep.actionType === 'miracle_merchant_gift' ||
      currentStep.actionType === 'black_market_gift' ||
      currentStep.actionType === 'super_black_market_gift' ||
      currentStep.actionType === 'evil_merchant_gift'
    ) {
      const targetStr =
        pendingTarget !== null
          ? `${formatSeatNum(pendingTarget)} 號`
          : pendingMultiTargets.length > 0
            ? pendingMultiTargets.map(formatSeatNum).join('、') + ' 號'
            : null;
      if (targetStr) {
        return {
          eyebrow: `${currentStep.actorLabel} · 贈禮告知`,
          headline: `幸運兒：${targetStr}`,
          detail: '請向玩家展示所獲技能道具',
          tone: 'sheriff',
        };
      }
    }
    return null;
  }, [
    isClaimStage,
    seerOutcome,
    luckySeerOutcome,
    psychicOutcome,
    mechWolfPsychicOutcome,
    awakenedSeerOutcome,
    lanternSeerOutcome,
    drunkSeerOutcome,
    foolSeerOutcome,
    foxOutcome,
    gargoyleOutcome,
    wolfWitchOutcome,
    pureWhiteOutcome,
    pumpkinGhostOutcome,
    demonWolfOutcome,
    gravekeeperOutcome,
    currentStep.actionType,
    currentStep.actorLabel,
    hunterSeat,
    isHunterPoisonedTonight,
    mechLearnedTargetSeat,
    witchAntidoteUsed,
    isSkillLocked,
    wolfTargetSeat,
    pendingTarget,
    pendingMultiTargets,
  ]);

  const primaryButtonLabel = (() => {
    if (isClaimStage) {
      if (pendingClaimSeats.length > 0) {
        const seatList = pendingClaimSeats.map(formatSeatNum).join('、');
        return isPendingUnclaim
          ? `解除 ${seatList} 號的「${activeClaimRoleName}」認領`
          : `確認登錄 ${seatList} 號為「${activeClaimRoleName}」`;
      }
      if (claimSummary?.isComplete) {
        return '認領完成 ➜ 進入夜間技能';
      }
      if (board.isFlexibleComposition) {
        return '略過認領 ➜ 進入夜間技能';
      }
      return `請先點選座位認領「${activeClaimRoleName}」`;
    }

    if (isSkillLocked) {
      return isLastStep ? '唸詞完畢 ➜ 天亮結算' : '唸詞完畢 ➜ 下一步';
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
    ? pendingClaimSeats.length === 0 && !claimSummary?.isComplete && !board.isFlexibleComposition
    : isSkillLocked
      ? false
      : !pendingValidation.allowed;

  const { left: leftSeats, right: rightSeats } = splitSeatsIntoSymmetricColumns(seats);

  const renderNightSeatButton = (seat: (typeof seats)[number]) => {
    const role = getRoleById(seat.roleId);
    const factionChip = getSeatFactionChip(seat.roleId);
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
    const attachedTags =
      !isOnlineJudge && !maskSeatRoles
        ? getSeatAttachedStatusTags(seat, {
            draft: currentNightDraft,
            activeCharmedSeat,
            lastDreamTarget,
            hybridState,
            mechWolfState,
            combatState,
            conversionState,
            thirdPartySpecialState,
          })
        : [];

    const tagToneClass = (tone: (typeof attachedTags)[number]['tone']) => {
      switch (tone) {
        case 'wolf':
          return 'border-wolf-border bg-wolf-tint text-wolf';
        case 'good':
          return 'border-good-border bg-good-tint text-good';
        case 'sheriff':
          return 'border-sheriff-border bg-sheriff-tint text-sheriff';
        case 'third':
          return 'border-third-border bg-third-tint text-third';
        default:
          return 'border-subtle bg-canvas text-muted';
      }
    };

    return (
      <button
        key={seat.seatNumber}
        type="button"
        disabled={control.disabled}
        title={control.reason}
        onClick={control.onSelect}
        className={`flex h-12 w-full items-center justify-between gap-1 rounded-md px-2.5 text-left transition ${
          control.selected
            ? 'border-selected-sheriff bg-sheriff-tint'
            : isClaimedAsActive
              ? 'border-selected-good bg-good-tint'
              : control.disabled
                ? 'cursor-not-allowed border border-subtle bg-canvas opacity-55'
                : 'border border-subtle bg-surface hover:border-strong'
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
          <span
            className={`w-6 shrink-0 text-[14px] font-semibold tabular-nums ${
              seat.isAlive ? 'text-primary' : 'text-muted line-through'
            }`}
          >
            {formatSeatNum(seat.seatNumber)}
          </span>
          {showRoleBadge && role ? (
            <div className="flex min-w-0 items-center gap-1 overflow-hidden">
              <span
                className={`truncate rounded-md border px-1.5 py-0.5 text-[12px] font-medium ${getRoleBadgeClasses(role.id)}`}
              >
                {role.name}
              </span>
              {factionChip && (
                <span className={`shrink-0 text-[12px] font-semibold ${factionChip.className}`}>
                  {factionChip.label}
                </span>
              )}
              {attachedTags.slice(0, 2).map((tag, idx) => (
                <span
                  key={`${tag.label}-${idx}`}
                  className={`shrink-0 rounded border px-1 text-[12px] leading-4 font-medium ${tagToneClass(tag.tone)}`}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          ) : (
            <span className="truncate text-[12px] text-secondary">
              {seat.nickname.trim() || `${seat.seatNumber}號`}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1 text-[12px]">
          {!seat.isAlive && (
            <span className="shrink-0 font-medium text-muted">已出局</span>
          )}
          {seat.isAlive && control.disabled && control.reason && control.reason !== '技能鎖定' && (
            <span className="max-w-[68px] shrink-0 truncate text-wolf">{control.reason}</span>
          )}
          {seat.isAlive && seat.idiotRevealed && !showRoleBadge && (
            <span className="text-sheriff">翻</span>
          )}
          {!showRoleBadge &&
            actionIcons.map((icon, i) => (
              <span key={i}>{icon}</span>
            ))}
          {control.selected && (
            <span className="rounded bg-sheriff px-1 text-[12px] font-semibold text-inverse">
              選
            </span>
          )}
          {!control.selected && isClaimedAsActive && (
            <span className="text-[12px] font-semibold text-good">認</span>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
      {/* 1. 頂部「捷運站點式」夜間階段進度列 ＋ 快捷鍵 */}
      <section className="flex shrink-0 items-center justify-between gap-2 border-b border-subtle pb-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <NightStepMetroBar steps={steps} currentStepIndex={currentStepIndex} />
          <span className="shrink-0 text-[12px] font-semibold tabular-nums text-muted">
            {currentStepIndex + 1}/{steps.length}
          </span>
          {isClaimStage && (
            <span className="shrink-0 rounded-md border border-sheriff-border bg-sheriff-tint px-1.5 py-0.5 text-[12px] font-semibold text-sheriff">
              認領
            </span>
          )}
          {!isOnlineJudge && !actorSeatsAlive && (
            <span className="shrink-0 text-[12px] font-semibold text-wolf">已出局</span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {isOnlineJudge ? (
            <>
              <button
                type="button"
                onClick={handleToggleTts}
                aria-label="切換語音播報"
                className={`min-h-10 rounded-md border px-2.5 text-[12px] font-semibold transition ${
                  onlineJudgeSettings.ttsEnabled
                    ? 'border-good-border bg-good-tint text-good'
                    : 'border-subtle bg-surface text-muted'
                }`}
              >
                {onlineJudgeSettings.ttsEnabled ? '語音' : '靜音'}
              </button>
              <button
                type="button"
                disabled={!onlineJudgeSettings.ttsEnabled || !ttsSupported}
                onClick={handleReplayTts}
                aria-label="重播語音"
                className="min-h-10 rounded-md border border-subtle bg-surface px-2.5 text-[12px] font-medium text-secondary hover:border-strong disabled:opacity-40"
              >
                重播
              </button>
              <button
                type="button"
                onClick={handleCycleBufferSeconds}
                title="點擊切換閉眼→睜眼間隔秒數"
                className="min-h-10 rounded-md border border-subtle bg-surface px-2.5 text-[12px] font-semibold tabular-nums text-sheriff"
              >
                {closeToOpenDelay}s
              </button>
            </>
          ) : (
            <>
              {isPhysicalDealFirstNight && claimSummary?.requiresClaiming && !isClaimStage && (
                <button
                  type="button"
                  onClick={() => setForceEditClaims(true)}
                  className="min-h-10 rounded-md border border-sheriff-border bg-sheriff-tint px-2.5 text-[12px] font-semibold text-sheriff"
                >
                  認領
                </button>
              )}
              <button
                type="button"
                onClick={() => setSeatDrawerOpen(true)}
                className="min-h-10 rounded-md border border-subtle bg-surface px-2.5 text-[12px] font-medium text-secondary hover:border-strong hover:text-primary"
              >
                座位
              </button>
            </>
          )}
        </div>
      </section>

      {/* 1.2 線上法官常駐顯示「狼隊名單（座號＋具體角色身分）」 */}
      {isOnlineJudge && <OnlineWolfRosterBar seats={seats} />}

      {/* 1.3 線上法官：查驗／開槍／贈禮資訊放大並置於上方醒目位置 */}
      {isOnlineJudge && !isClaimStage && currentFlashcardCandidate && (
        <section className="shrink-0 rounded-md border border-strong bg-surface px-4 py-3">
          <div className="text-[12px] font-semibold text-secondary">
            {currentFlashcardCandidate.eyebrow}
          </div>
          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            {currentFlashcardCandidate.subject && (
              <span className="text-[20px] font-bold leading-7 tabular-nums text-primary">
                {currentFlashcardCandidate.subject}
              </span>
            )}
            <span
              className={`text-[22px] font-bold leading-7 tabular-nums ${
                currentFlashcardCandidate.tone === 'wolf'
                  ? 'text-wolf'
                  : currentFlashcardCandidate.tone === 'good'
                    ? 'text-good'
                    : currentFlashcardCandidate.tone === 'third'
                      ? 'text-third'
                      : 'text-sheriff'
              }`}
            >
              {currentFlashcardCandidate.headline}
            </span>
          </div>
          {currentFlashcardCandidate.detail && (
            <div className="mt-1 text-[14px] text-secondary">
              {currentFlashcardCandidate.detail}
            </div>
          )}
        </section>
      )}

      {/* 1.5 實體認領主提示區（認領時不顯示台詞）或實體法官三段台詞提詞區（睜眼／行動／閉眼） */}
      {isClaimStage && claimSummary && (
        <section className="shrink-0 space-y-1.5">
          {(() => {
            const activeRoleStatus = claimSummary.roles.find(
              (r) => r.roleId === activeClaimRoleId,
            );
            const isFlexibleCount =
              board.isFlexibleComposition ||
              Boolean(board.presetPlayerCounts?.length) ||
              Boolean(board.playerCountRange);
            const allowMultiClaim =
              isFlexibleCount ||
              (activeRoleStatus !== undefined && activeRoleStatus.expectedCount > 1);
            const remainingCount = activeRoleStatus?.remainingCount ?? 0;
            return (
              <div className="flex items-center justify-between gap-2 border-l-2 border-sheriff bg-surface px-3 py-2">
                <div className="min-w-0 flex-1 text-[14px] font-semibold text-primary">
                  點選座位認領「{activeClaimRoleName}」
                  {allowMultiClaim && (
                    <span className="ml-1 text-[12px] font-medium text-secondary">
                      （多名可一次多選）
                    </span>
                  )}
                </div>
                <span className="shrink-0 text-[12px] font-semibold tabular-nums text-sheriff">
                  {remainingCount > 0 ? `待認領 ${remainingCount} 位` : '已認領完成'}
                </span>
              </div>
            );
          })()}
        </section>
      )}

      {!isOnlineJudge && !isClaimStage && (
        <section className="shrink-0 space-y-1.5">
          <div
            className={`flex items-start justify-between gap-2 border-l-2 bg-surface px-3 py-2 ${
              isSkillLocked ? 'border-wolf' : 'border-sheriff'
            }`}
          >
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="text-[12px] font-semibold leading-4 text-sheriff">
                {currentStep.openPrompt?.trim() || `${currentStep.actorLabel} 請睜眼`}
              </div>
              <p className="text-[14px] font-semibold leading-5 text-primary">
                {currentStep.actionPrompt.replace(/\n+/g, ' ')}
              </p>
              <div className="text-[12px] font-medium leading-4 text-secondary">
                {currentStep.closePrompt?.trim() || `${currentStep.actorLabel} 請閉眼`}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setScriptDrawerOpen(true)}
              className="min-h-10 shrink-0 rounded-md border border-subtle bg-canvas px-2.5 text-[12px] font-medium text-secondary hover:border-strong hover:text-primary"
            >
              台詞
            </button>
          </div>

          {stepLockEval.locked && stepLockEval.reason && (
            <div
              role="alert"
              className="border-l-2 border-wolf bg-wolf-tint px-3 py-1.5 text-[12px] font-semibold text-wolf"
            >
              {stepLockEval.reason}
            </div>
          )}

          {!stepLockEval.locked && stepLockEval.modifierNotice && (
            <div className="border-l-2 border-third bg-third-tint px-3 py-1.5 text-[12px] font-semibold text-third">
              {stepLockEval.modifierNotice}
            </div>
          )}

          {/* 資訊與結果區塊（移至台詞正下方，座號與陣營／結果強制分行排版，含放大展示給玩家看按鈕） */}
          {currentFlashcardCandidate && (
            <div className="flex items-center justify-between gap-2 rounded-md border border-subtle bg-surface px-3 py-2">
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-medium text-secondary">
                  {currentFlashcardCandidate.eyebrow}
                </div>
                {currentFlashcardCandidate.subject && (
                  <div className="mt-0.5 text-[14px] font-semibold leading-5 tabular-nums text-primary">
                    {currentFlashcardCandidate.subject}
                  </div>
                )}
                <div
                  className={`break-keep text-[14px] font-semibold leading-5 tabular-nums ${
                    currentFlashcardCandidate.tone === 'wolf'
                      ? 'text-wolf'
                      : currentFlashcardCandidate.tone === 'good'
                        ? 'text-good'
                        : currentFlashcardCandidate.tone === 'third'
                          ? 'text-third'
                          : 'text-sheriff'
                  }`}
                >
                  {currentFlashcardCandidate.headline}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFlashcardData(currentFlashcardCandidate)}
                className="min-h-10 shrink-0 rounded-md border border-sheriff-border bg-sheriff-tint px-3 text-[12px] font-semibold text-sheriff hover:opacity-90"
              >
                放大展示給玩家看
              </button>
            </div>
          )}
        </section>
      )}

      {/* 2. 中央左右對稱雙欄座位網格（無多餘外框） */}
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="mb-1.5 flex shrink-0 items-center justify-between gap-2">
          <div className="truncate text-[12px] text-secondary">
            {isClaimStage
              ? '點擊下方座位進行認領'
              : isSkillLocked
                ? '技能已鎖死 · 唸詞完畢後直接按下一步'
                : currentStep.actionType === 'witch_action'
                  ? '點下方【解藥】救人 · 點座位＝【毒藥】'
                  : isSeatSelectableForSkill
                    ? '點選目標座位，按下方確認'
                    : '檢視狀態後按下方確認'}
          </div>
          {!isOnlineJudge && (
            <button
              type="button"
              onClick={() => setMaskSeatRoles((prev) => !prev)}
              className={`min-h-9 shrink-0 rounded-md border px-2.5 text-[12px] font-semibold transition ${
                !maskSeatRoles
                  ? 'border-sheriff-border bg-sheriff-tint text-sheriff'
                  : 'border-subtle bg-surface text-secondary hover:border-strong hover:text-primary'
              }`}
            >
              {maskSeatRoles ? '顯示底牌' : '隱藏底牌'}
            </button>
          )}
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-1.5 overflow-y-auto pr-0.5">
          <div className="flex flex-col gap-1.5">{leftSeats.map(renderNightSeatButton)}</div>
          <div className="flex flex-col gap-1.5">{rightSeats.map(renderNightSeatButton)}</div>
        </div>
      </section>

      {/* 3. 底部精簡操作盤（Bottom Action Sheet）＋ 單一主按鈕 */}
      <section className="shrink-0 space-y-2 border-t border-subtle pt-2">
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
                      setPendingClaimSeats([]);
                      setClaimError(null);
                    }}
                    className={`min-h-10 rounded-md px-2.5 text-[12px] font-semibold tabular-nums transition ${
                      active
                        ? 'border-selected-sheriff bg-sheriff-tint text-primary'
                        : done
                          ? 'border border-good-border bg-good-tint text-good'
                          : 'border border-subtle bg-surface text-secondary'
                    }`}
                  >
                    {roleName} {r.claimedSeats.length}/{r.expectedCount}
                  </button>
                );
              })}
            </div>
            {claimError && (
              <div className="border-l-2 border-wolf bg-wolf-tint px-3 py-1.5 text-[12px] font-semibold text-wolf">
                {claimError}
              </div>
            )}
          </div>
        )}

        {/* 技能階段精簡提示與 Bottom Action Sheet（限高避免擠壓雙欄座位） */}
        {!isClaimStage && !isSkillLocked && (
          <div className="max-h-[26dvh] space-y-1.5 overflow-y-auto pr-0.5">

            {/* 步驟專屬操作快捷項 */}
            {currentStep.actionType === 'wolf_kill' && (
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="text-xs text-secondary">
                  {pendingTarget !== null ? (
                    <span>
                      {pendingSeedWolfInfect ? '預選種狼感染：' : '預選落刀：'}
                      <strong className={pendingSeedWolfInfect ? 'text-third' : 'text-wolf'}>
                        {pendingTarget} 號
                      </strong>
                    </span>
                  ) : (
                    <span>
                      目前預選：<strong className="text-sheriff">空刀（不殺人）</strong>
                    </span>
                  )}
                  {pendingSelfExplodeSeat !== null && (
                    <span className="ml-2 text-sheriff">
                      💥 {pendingSelfExplodeSeat}號自爆
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {seedWolfAliveCanInfect && !wolfTeamFearedTonight && (
                    <button
                      type="button"
                      onClick={() => {
                        setPendingSeedWolfInfect((prev) => !prev);
                        setPendingTarget(null);
                      }}
                      className={`min-h-12 rounded-md border px-3 text-xs font-bold transition ${
                        pendingSeedWolfInfect
                          ? 'border-third bg-third-tint text-third'
                          : 'border-third-border bg-third-tint text-third hover:opacity-90'
                      }`}
                    >
                      {pendingSeedWolfInfect ? '✓ 種狼感染模式（再點切回狼刀）' : '🦠 改為種狼感染（限一次）'}
                    </button>
                  )}
                  {pendingTarget !== null && (
                    <button
                      type="button"
                      onClick={() => setPendingTarget(null)}
                      className="min-h-10 rounded-md border border-subtle bg-canvas px-3 text-xs font-bold text-primary hover:bg-elevated"
                    >
                      改為空刀
                    </button>
                  )}
                </div>
                {wolfTeamFearedTonight && (
                  <div className="w-full rounded-md border border-sheriff-border bg-sheriff-tint px-3 py-2 text-xs font-bold text-sheriff">
                    ⚠️ 今晚夢魘恐懼到狼隊友，狼隊強制空刀（無法落刀或感染）
                  </div>
                )}
              </div>
            )}

            {currentStep.actionType === 'nightmare_fear' && (
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="text-xs text-secondary">
                  {round > 1 && (
                    <>
                      昨晚恐懼：
                      <strong className="text-sheriff">
                        {lastFearedSeat !== null ? `${lastFearedSeat} 號` : '無'}
                      </strong>
                      {' · '}
                    </>
                  )}
                  預選：
                  <strong className="text-third">
                    {pendingTarget !== null ? `${pendingTarget} 號` : '不恐懼'}
                  </strong>
                </div>
                {pendingTarget !== null && (
                  <button
                    type="button"
                    onClick={() => setPendingTarget(null)}
                    className="min-h-10 rounded-md border border-subtle bg-canvas px-3 text-xs font-bold text-primary hover:bg-elevated"
                  >
                    改為不恐懼
                  </button>
                )}
              </div>
            )}

            {currentStep.actionType === 'hybrid_choose' && (
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="text-xs text-secondary">
                  首夜榜樣：
                  <strong className="text-good">
                    {pendingTarget !== null ? `${pendingTarget} 號（勝利條件將綁定其陣營）` : '請點選上方座位選擇榜樣'}
                  </strong>
                </div>
              </div>
            )}

            {currentStep.actionType === 'guard_protect' && (
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="text-xs text-secondary">
                  {round > 1 && (
                    <>
                      昨晚守：
                      <strong className="text-sheriff">
                        {lastGuardedSeat !== null ? `${lastGuardedSeat} 號` : '無'}
                      </strong>
                      {' · '}
                    </>
                  )}
                  預選：
                  <strong className="text-good">
                    {pendingTarget !== null ? `${pendingTarget} 號` : '空守'}
                  </strong>
                </div>
                {pendingTarget !== null && (
                  <button
                    type="button"
                    onClick={() => setPendingTarget(null)}
                    className="min-h-10 rounded-md border border-subtle bg-canvas px-3 text-xs font-bold text-primary hover:bg-elevated"
                  >
                    改為空守
                  </button>
                )}
              </div>
            )}

            {currentStep.actionType === 'witch_action' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-[12px]">
                  <span className="text-secondary">
                    今晚刀口：
                    <strong className="text-wolf tabular-nums">
                      {!witchAntidoteUsed
                        ? wolfTargetSeat
                          ? formatSeatShort(wolfTargetSeat)
                          : '空刀（平安）'
                        : '解藥已耗盡（無刀口資訊）'}
                    </strong>
                  </span>
                  <div className="flex shrink-0 items-center gap-1.5 font-semibold">
                    <span
                      className={`rounded border px-1.5 py-0.5 ${
                        witchAntidoteUsed
                          ? 'border-subtle bg-canvas text-muted line-through'
                          : 'border-good-border bg-good-tint text-good'
                      }`}
                    >
                      解藥：{witchAntidoteUsed ? '已耗盡' : '可用'}
                    </span>
                    <span
                      className={`rounded border px-1.5 py-0.5 ${
                        witchPoisonUsed
                          ? 'border-subtle bg-canvas text-muted line-through'
                          : 'border-wolf-border bg-wolf-tint text-wolf'
                      }`}
                    >
                      毒藥：{witchPoisonUsed ? '已耗盡' : '可用'}
                    </span>
                  </div>
                </div>
                <div className="text-[12px] text-secondary">
                  點擊下方【解藥按鈕】救人；直接點選上方座位＝【使用毒藥】（同晚不可雙開）
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={witchAntidoteUsed || !antidoteCheck.allowed || antidoteBlockedByPoison}
                    onClick={() => setPendingUseAntidote((prev) => !prev)}
                    className={`min-h-12 flex-1 rounded-md border px-3 text-[13px] font-semibold transition ${
                      pendingUseAntidote
                        ? 'border-selected-good bg-good-tint text-good'
                        : witchAntidoteUsed || !antidoteCheck.allowed || antidoteBlockedByPoison
                          ? 'cursor-not-allowed border-subtle bg-canvas text-muted'
                          : 'border-good-border bg-good-tint text-good hover:opacity-90'
                    }`}
                  >
                    {witchAntidoteUsed
                      ? '解藥已耗盡（全場限用一次）'
                      : pendingUseAntidote
                        ? `✓ 已選解藥救 ${currentNightDraft.wolfTarget} 號（再點取消）`
                        : antidoteBlockedByPoison
                          ? '已選毒藥，同晚不可再使用解藥'
                          : !antidoteCheck.allowed
                            ? `解藥不可用：${antidoteCheck.reason}`
                            : `使用解藥救 ${currentNightDraft.wolfTarget} 號`}
                  </button>
                  {pendingTarget !== null && !witchPoisonUsed && (
                    <button
                      type="button"
                      onClick={() => setPendingTarget(null)}
                      className="min-h-12 shrink-0 rounded-md border border-wolf-border bg-wolf-tint px-3 text-[12px] font-semibold text-wolf"
                    >
                      取消毒 {pendingTarget}號
                    </button>
                  )}
                </div>
              </div>
            )}

            {currentStep.actionType === 'seer_check' && (
              <div
                className={`rounded-md border px-3 py-2 text-center text-xs font-bold ${
                  seerOutcome
                    ? seerOutcome.faction === 'wolf'
                      ? 'border-wolf-border bg-wolf-tint text-wolf'
                      : 'border-good-border bg-good-tint text-good'
                    : 'border-subtle bg-canvas text-secondary'
                }`}
              >
                {seerOutcome ? (
                  <span className="text-sm font-extrabold">
                    查驗結果：{seerOutcome.targetSeat} 號 ➜{' '}
                    {seerOutcome.faction === 'wolf' ? '👎 狼人陣營（查殺）' : '👍 好人陣營（金水）'}
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
                className={`rounded-md border px-3 py-2 text-center text-xs font-bold ${
                  psychicOutcome
                    ? 'border-third-border bg-third-tint text-third'
                    : 'border-subtle bg-canvas text-secondary'
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

            {currentStep.actionType === 'wolf_kill' && moonSpiritHowlPreview && (
              <div
                className={`rounded-md border px-3 py-1.5 text-center text-xs font-bold ${
                  moonSpiritHowlPreview.howled
                    ? 'border-third-border bg-third-tint text-third'
                    : 'border-subtle bg-canvas text-secondary'
                }`}
              >
                {moonSpiritHowlPreview.howled ? '🌕 ' : '🌑 '}
                {moonSpiritHowlPreview.reason}
              </div>
            )}

            {currentStep.actionType === 'awakened_seer_check' && (
              <div
                className={`rounded-md border px-3 py-2 text-center text-xs font-bold ${
                  awakenedSeerOutcome
                    ? awakenedSeerOutcome.result === 'suspected_wolf'
                      ? 'border-wolf-border bg-wolf-tint text-wolf'
                      : 'border-good-border bg-good-tint text-good'
                    : 'border-subtle bg-canvas text-secondary'
                }`}
              >
                {awakenedSeerOutcome ? (
                  <span className="text-sm font-extrabold">
                    雙驗結果（{awakenedSeerOutcome.targetSeats[0]} 號 &amp;{' '}
                    {awakenedSeerOutcome.targetSeats[1]} 號）➜{' '}
                    {awakenedSeerOutcome.result === 'double_good'
                      ? '👍 雙金水（皆好人）'
                      : '👎 疑似狼人（含至少一狼）'}
                  </span>
                ) : (
                  <span>
                    請點選 2 位存活玩家（可含自己）：目前已選{' '}
                    {pendingDualTargets.filter((n) => n !== null).join('、') || '無'}
                  </span>
                )}
              </div>
            )}

            {currentStep.actionType === 'lantern_seer_check' && (
              <div
                className={`rounded-md border px-3 py-2 text-center text-xs font-bold ${
                  lanternSeerOutcome
                    ? lanternSeerOutcome.faction === 'wolf'
                      ? 'border-wolf-border bg-wolf-tint text-wolf'
                      : 'border-good-border bg-good-tint text-good'
                    : 'border-subtle bg-canvas text-secondary'
                }`}
              >
                {lanternSeerOutcome ? (
                  <span className="text-sm font-extrabold">
                    查驗結果（反轉）：{lanternSeerOutcome.targetSeat} 號 ➜{' '}
                    {lanternSeerOutcome.faction === 'wolf' ? '👎 狼人陣營' : '👍 好人陣營'}
                  </span>
                ) : pendingTarget !== null ? (
                  `已預選查驗 ${pendingTarget} 號，點擊「確認查驗」揭曉結果`
                ) : (
                  '請點選上方座位預選查驗目標（燈影預言家結果將自動反轉）'
                )}
              </div>
            )}

            {currentStep.actionType === 'drunk_seer_check' && (
              <div className="space-y-1.5">
                {!isOnlineJudge && !revealConfirmed && (
                  <div className="flex items-center justify-center gap-1.5 text-[12px]">
                    <span className="text-secondary">酒鬼結果：</span>
                    {(
                      [
                        [null, '🎲 隨機'],
                        ['good', '👍 給金水'],
                        ['wolf', '👎 給查殺'],
                      ] as const
                    ).map(([val, label]) => (
                      <button
                        key={String(val)}
                        type="button"
                        onClick={() => setPendingDrunkManual(val)}
                        className={`min-h-8 rounded-lg border px-2 font-bold ${
                          pendingDrunkManual === val
                            ? 'border-sheriff bg-sheriff-tint text-sheriff'
                            : 'border-subtle bg-canvas text-secondary'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
                <div
                  className={`rounded-md border px-3 py-2 text-center text-xs font-bold ${
                    drunkSeerOutcome
                      ? drunkSeerOutcome.faction === 'wolf'
                        ? 'border-wolf-border bg-wolf-tint text-wolf'
                        : 'border-good-border bg-good-tint text-good'
                      : 'border-subtle bg-canvas text-secondary'
                  }`}
                >
                  {drunkSeerOutcome ? (
                    <span className="text-sm font-extrabold">
                      查驗結果：{drunkSeerOutcome.targetSeat} 號 ➜{' '}
                      {drunkSeerOutcome.faction === 'wolf' ? '👎 狼人陣營' : '👍 好人陣營'}
                    </span>
                  ) : pendingTarget !== null ? (
                    `已預選查驗 ${pendingTarget} 號，點擊「確認查驗」揭曉結果`
                  ) : (
                    '請點選上方座位預選酒鬼預言家查驗目標'
                  )}
                </div>
              </div>
            )}

            {currentStep.actionType === 'fool_seer_check' && (
              <div
                className={`rounded-md border px-3 py-2 text-center text-xs font-bold ${
                  foolSeerOutcome
                    ? foolSeerOutcome.faction === 'wolf'
                      ? 'border-wolf-border bg-wolf-tint text-wolf'
                      : 'border-good-border bg-good-tint text-good'
                    : 'border-subtle bg-canvas text-secondary'
                }`}
              >
                {foolSeerOutcome ? (
                  <span className="text-sm font-extrabold">
                    愚言家查驗：{foolSeerOutcome.targetSeat} 號 ➜{' '}
                    {foolSeerOutcome.faction === 'wolf' ? '👎 狼人陣營' : '👍 好人陣營'}
                  </span>
                ) : pendingTarget !== null ? (
                  `已預選查驗 ${pendingTarget} 號，點擊「確認查驗」揭曉結果`
                ) : (
                  '請點選上方座位預選愚言家查驗目標'
                )}
              </div>
            )}

            {currentStep.actionType === 'fox_check' && (
              <div
                className={`rounded-md border px-3 py-2 text-center text-xs font-bold ${
                  foxLostAbility
                    ? 'border-subtle bg-surface text-secondary'
                    : foxOutcome
                      ? foxOutcome.hasWolf
                        ? 'border-wolf-border bg-wolf-tint text-wolf'
                        : 'border-sheriff-border bg-amber-950/50 text-sheriff'
                      : 'border-subtle bg-canvas text-secondary'
                }`}
              >
                {foxLostAbility ? (
                  '⚠️ 狐狸查驗能力已永久失效（請比失能手勢後直接確認）'
                ) : foxOutcome ? (
                  <span className="text-sm font-extrabold">
                    查驗範圍（{foxOutcome.checkedSeats.join('、')} 號）➜{' '}
                    {foxOutcome.hasWolf ? '🐺 三人中含狼人（技能保留）' : '✨ 全好人（技能永久失效）'}
                  </span>
                ) : pendingTarget !== null ? (
                  `已預選查驗 ${pendingTarget} 號與其左右鄰居，點擊「確認查驗」揭曉`
                ) : (
                  '請點選 1 位目標查驗其自身與左右兩側存活鄰居'
                )}
              </div>
            )}

            {currentStep.actionType === 'gargoyle_team_status' && (
              <div className="rounded-md border border-sheriff-border bg-sheriff-tint px-3 py-2 text-center text-xs font-bold text-sheriff">
                {gargoyleState.hasJoinedWolfTeam
                  ? '✅ 石像鬼已入狼隊（場上其他狼人皆已出局，今晚可參與狼刀）'
                  : '⏳ 石像鬼尚未入隊（場上仍有其他存活狼人）'}
              </div>
            )}

            {(currentStep.actionType === 'gargoyle_check' ||
              currentStep.actionType === 'wolf_witch_check' ||
              currentStep.actionType === 'pure_white_check' ||
              currentStep.actionType === 'pumpkin_ghost_check') && (
              <div className="space-y-1.5">
                {currentStep.actionType === 'pumpkin_ghost_check' && (
                  <div className="rounded-md border border-sheriff-border bg-sheriff-tint px-3 py-1.5 text-center text-[12px] font-bold text-sheriff">
                    {pumpkinGhostState.hasInherited ? (
                      <>
                        🎃 已繼承石像鬼查驗能力
                        {pumpkinGhostState.inheritedHistory.length > 0 && (
                          <div className="mt-0.5 text-sheriff/90">
                            歷史紀錄：
                            {pumpkinGhostState.inheritedHistory
                              .map(
                                (h) =>
                                  `${formatChineseNight(h.round)}:${h.targetSeat}號(${
                                    getRoleById(h.perceivedRoleId)?.name ?? h.perceivedRoleId
                                  })`,
                              )
                              .join('、')}
                          </div>
                        )}
                      </>
                    ) : (
                      '⏳ 石像鬼仍存活，南瓜鬼尚未繼承查驗能力'
                    )}
                  </div>
                )}
                {(() => {
                  const exactOutcome =
                    currentStep.actionType === 'gargoyle_check'
                      ? gargoyleOutcome
                      : currentStep.actionType === 'wolf_witch_check'
                        ? wolfWitchOutcome
                        : currentStep.actionType === 'pure_white_check'
                          ? pureWhiteOutcome
                          : pumpkinGhostOutcome;
                  return (
                    <div
                      className={`rounded-md border px-3 py-2 text-center text-xs font-bold ${
                        exactOutcome
                          ? 'border-third-border bg-third-tint text-third'
                          : 'border-subtle bg-canvas text-secondary'
                      }`}
                    >
                      {exactOutcome ? (
                        <span className="text-sm font-extrabold">
                          真實身分：{exactOutcome.targetSeat} 號 ➜{' '}
                          {getRoleById(exactOutcome.perceivedRoleId)?.name ??
                            exactOutcome.perceivedRoleId}
                        </span>
                      ) : pendingTarget !== null ? (
                        `已預選查驗 ${pendingTarget} 號，點擊「確認查驗」揭曉真實身分`
                      ) : currentStep.actionType === 'pumpkin_ghost_check' &&
                        !pumpkinGhostState.hasInherited ? (
                        '尚未繼承，可直接點擊確認繼續'
                      ) : (
                        '請點選上方座位預選具體底牌查驗目標'
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {currentStep.actionType === 'demon_wolf_check' && (
              <div
                className={`rounded-md border px-3 py-2 text-center text-xs font-bold ${
                  demonWolfOutcome
                    ? 'border-third-border bg-third-tint text-third'
                    : 'border-subtle bg-canvas text-secondary'
                }`}
              >
                {demonWolfOutcome ? (
                  <span className="text-sm font-extrabold">
                    惡魔查驗：{demonWolfOutcome.targetSeat} 號 ➜{' '}
                    {demonWolfOutcome.roleType === 'god' ? '✨ 神職牌' : '🌾 平民牌'}
                  </span>
                ) : pendingTarget !== null ? (
                  `已預選查驗 ${pendingTarget} 號，點擊「確認查驗」揭曉神／民`
                ) : (
                  '請點選狼隊以外的存活玩家查驗神職或平民'
                )}
              </div>
            )}

            {(currentStep.actionType === 'gravekeeper_check' ||
              currentStep.actionType === 'super_gravekeeper_action' ||
              currentStep.actionType === 'super_gravekeeper_heir_check') && (
              <div className="space-y-1.5">
                <div className="rounded-md border border-good-border bg-emerald-950/35 px-3 py-2 text-center text-xs font-extrabold text-good">
                  🪦 {gravekeeperOutcome?.summary ?? '尚無放逐紀錄'}
                </div>
                {currentStep.actionType === 'super_gravekeeper_action' && (
                  <div className="text-center text-xs text-secondary">
                    {pendingTarget !== null
                      ? `預選繼承者：${pendingTarget} 號`
                      : `目前繼承者：${
                          superGravekeeperState.heirSeat !== null
                            ? `${superGravekeeperState.heirSeat} 號`
                            : '尚未選擇（可點選上方座位指定）'
                        }`}
                  </div>
                )}
                {currentStep.actionType === 'super_gravekeeper_heir_check' && (
                  <div className="rounded-md border border-sheriff-border bg-sheriff-tint px-3 py-1.5 text-center text-[12px] font-bold text-sheriff">
                    {superGravekeeperState.heirInherited ? (
                      <>
                        ✅ 繼承者（{superGravekeeperState.heirSeat} 號）已接手！原超級守墓人為{' '}
                        {superGravekeeperState.superGravekeeperSeat ?? '?'} 號
                        {exiledHistory.length > 0 && (
                          <div className="mt-0.5 text-sheriff/90">
                            歷史放逐：
                            {exiledHistory
                              .map(
                                (r) =>
                                  `${formatChineseDay(r.round)}:${r.seatNumber}號(${
                                    getGravekeeperFactionForRecord(r) === 'wolf' ? '狼' : '好'
                                  })`,
                              )
                              .join('、')}
                          </div>
                        )}
                      </>
                    ) : (
                      '⏳ 超級守墓人仍存活或無有效好人繼承者，可直接確認跳過'
                    )}
                  </div>
                )}
              </div>
            )}

            {currentStep.actionType === 'nine_tailed_fox_check' && nineTailedFoxOutcome && (
              <div
                className={`rounded-md border px-3 py-2 text-center text-sm font-extrabold ${
                  nineTailedFoxOutcome.diedFromNoTails
                    ? 'border-wolf-border bg-wolf-tint text-wolf'
                    : 'border-sheriff-border bg-amber-950/35 text-sheriff'
                }`}
              >
                🦊 {nineTailedFoxOutcome.reason}
              </div>
            )}

            {currentStep.actionType === 'awakened_dream_catcher_dream' && (
              <div className="flex items-center justify-between gap-2 text-xs text-secondary">
                <span>
                  {round > 1 && (
                    <>昨晚夢語：{lastAwakenedDreamTarget !== null ? `${lastAwakenedDreamTarget} 號` : '無'} · </>
                  )}
                  預選：
                  <strong className="text-third">
                    {pendingTarget !== null ? `${pendingTarget} 號` : '尚未選擇'}
                  </strong>
                </span>
              </div>
            )}

            {currentStep.actionType === 'awakened_dream_catcher_judge' && (
              <div className="space-y-2 rounded-md border border-third-border bg-indigo-950/35 p-2.5 text-center">
                <div className="text-xs font-extrabold text-third">
                  {awakenedDreamJudgeOutcome
                    ? `🌙 夢語者判定：${awakenedDreamJudgeOutcome.reason}`
                    : '今晚尚未選擇夢語者'}
                </div>
                {round >= 2 && awakenedDreamJudgeOutcome && (
                  <button
                    type="button"
                    onClick={() => setPendingAwakenedDreamKill((v) => !v)}
                    className={`min-h-11 w-full rounded-md border px-3 text-xs font-extrabold transition ${
                      pendingAwakenedDreamKill
                        ? 'border-wolf bg-rose-600 text-white'
                        : 'border-subtle bg-surface text-primary'
                    }`}
                  >
                    {pendingAwakenedDreamKill
                      ? `💀 已選擇：將 ${awakenedDreamJudgeOutcome.targetSeat} 號夢語出局（無法發動技能）`
                      : `是否將 ${awakenedDreamJudgeOutcome.targetSeat} 號夢語出局？（目前：不處決）`}
                  </button>
                )}
              </div>
            )}

            {(currentStep.actionType === 'magician_swap' ||
              currentStep.actionType === 'wolf_warlock_swap' ||
              currentStep.actionType === 'trickster_wolf_swap') && (
              <div className="rounded-md border border-third-border bg-indigo-950/35 px-3 py-2 text-center text-xs font-bold text-third">
                🔀 已選交換號碼：
                {pendingDualTargets[0] !== null && pendingDualTargets[1] !== null
                  ? `${pendingDualTargets[0]} 號 ⇄ ${pendingDualTargets[1]} 號`
                  : pendingDualTargets[0] !== null
                    ? `${pendingDualTargets[0]} 號（請再選第 2 位，或點清除改空換）`
                    : '空換（點選上方 2 個座位即可交換）'}
              </div>
            )}

            {currentStep.actionType === 'alchemy_witch_fog' && (
              <div className="rounded-md border border-sheriff-border bg-amber-950/35 px-3 py-2 text-center text-xs font-bold text-sheriff">
                🌫️ 未明之霧（限 1 次，選 3 位限制狼刀且禁空刀）：
                {interferenceState.alchemyFogUsed
                  ? '已使用完畢'
                  : pendingMultiTargets.length > 0
                    ? `已選 ${pendingMultiTargets.join('、')} 號（${pendingMultiTargets.length}/3）`
                    : '未使用（點選 3 位存活玩家發動，或直接確認跳過）'}
              </div>
            )}

            {currentStep.actionType === 'alchemy_witch_snake' && (
              <div className="rounded-md border border-good/45 bg-emerald-950/35 px-3 py-2 text-center text-xs font-bold text-good">
                🐍 法老之蛇資訊：
                {currentNightDraft.wolfTarget !== null
                  ? `今晚狼刀目標為 ${currentNightDraft.wolfTarget} 號（將於天亮發言後決定是否救活）`
                  : '今晚無狼刀死亡資訊'}
              </div>
            )}

            {(currentStep.actionType === 'silent_night_mentor_action' ||
              currentStep.actionType === 'daylight_scholar_action') && (
              <div className="space-y-1.5 rounded-md border border-third/40 bg-purple-950/35 p-2 text-center text-xs">
                <div className="flex items-center justify-center gap-2">
                  {(
                    [
                      [null, '不發動'],
                      ['amplify', '⬆️ 增幅'],
                      ['weaken', '⬇️ 削弱'],
                    ] as const
                  ).map(([mode, label]) => (
                    <button
                      key={String(mode)}
                      type="button"
                      onClick={() => {
                        setPendingAmplifyMode(mode);
                        if (!mode) setPendingTarget(null);
                      }}
                      className={`min-h-9 rounded-lg border px-2.5 font-bold ${
                        pendingAmplifyMode === mode
                          ? 'border-purple-300 bg-purple-600 text-white'
                          : 'border-subtle bg-surface text-primary'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="text-[12px] font-bold text-third">
                  {pendingAmplifyMode
                    ? `已選${pendingAmplifyMode === 'amplify' ? '增幅' : '削弱'}，目標：${
                        pendingTarget !== null ? `${pendingTarget} 號` : '請點選上方座位'
                      }`
                    : '選擇增幅或削弱後點選目標（或直接確認跳過）'}
                </div>
              </div>
            )}

            {currentStep.actionType === 'awakened_witch_action' && (
              <div className="space-y-2 rounded-md border border-good/40 bg-canvas p-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-primary">
                    🧪 覺醒女巫（解藥：{interferenceState.awakenedWitchAntidoteUsed ? '已用' : '可用'} ·
                    毒藥已用 {interferenceState.awakenedWitchPoisonsUsed}/3）
                  </span>
                  {!interferenceState.awakenedWitchAntidoteUsed &&
                    currentNightDraft.wolfTarget !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setPendingUseAntidote((v) => !v);
                          setPendingTarget(null);
                        }}
                        className={`min-h-9 rounded-lg border px-2.5 font-bold ${
                          pendingUseAntidote
                            ? 'border-good bg-emerald-600 text-white'
                            : 'border-subtle bg-surface text-primary'
                        }`}
                      >
                        {pendingUseAntidote ? '💊 已選解藥救人' : '使用解藥'}
                      </button>
                    )}
                </div>
                {!pendingUseAntidote && pendingTarget !== null && (
                  <div className="space-y-1.5 border-t border-subtle pt-1.5">
                    <div className="font-bold text-wolf">
                      ☠️ 預選毒殺 {pendingTarget} 號 — 請勾選{' '}
                      {interferenceState.awakenedWitchPoisonsUsed + 1} 位協助者：
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {seats
                        .filter(
                          (s) =>
                            s.isAlive &&
                            !interferenceState.awakenedWitchUsedHelpers.includes(s.seatNumber),
                        )
                        .map((s) => {
                          const picked = pendingMultiTargets.includes(s.seatNumber);
                          const limit = interferenceState.awakenedWitchPoisonsUsed + 1;
                          return (
                            <button
                              key={s.seatNumber}
                              type="button"
                              onClick={() =>
                                setPendingMultiTargets((prev) =>
                                  prev.includes(s.seatNumber)
                                    ? prev.filter((n) => n !== s.seatNumber)
                                    : prev.length < limit
                                      ? [...prev, s.seatNumber]
                                      : prev,
                                )
                              }
                              className={`min-h-8 rounded-md border px-2 font-bold ${
                                picked
                                  ? 'border-sheriff bg-amber-500/30 text-sheriff'
                                  : 'border-subtle bg-surface text-secondary'
                              }`}
                            >
                              {s.seatNumber}號
                            </button>
                          );
                        })}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPendingAwHelpersApproved((v) => !v)}
                      className={`min-h-9 w-full rounded-lg border px-2 font-bold ${
                        pendingAwHelpersApproved
                          ? 'border-wolf bg-rose-600/80 text-white'
                          : 'border-strong bg-elevated text-secondary'
                      }`}
                    >
                      {pendingAwHelpersApproved
                        ? '✅ 協助者全數同意投毒（毒殺生效）'
                        : '❌ 有協助者反對投毒（毒殺失敗仍耗次數）'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {(currentStep.actionType === 'troublemaker_prank' ||
              currentStep.actionType === 'time_eclipse_lock' ||
              currentStep.actionType === 'penguin_freeze' ||
              currentStep.actionType === 'fox_cub_charm' ||
              currentStep.actionType === 'mute_elder_mute' ||
              currentStep.actionType === 'medusa_petrify' ||
              currentStep.actionType === 'fortune_teller_mark' ||
              currentStep.actionType === 'radiant_earl_shield' ||
              currentStep.actionType === 'socialite_favor' ||
              currentStep.actionType === 'enchanter_bewitch' ||
              currentStep.actionType === 'black_bat_shield' ||
              currentStep.actionType === 'dark_night_envoy_shield' ||
              currentStep.actionType === 'demon_hunter_hunt' ||
              currentStep.actionType === 'wolf_raven_claw_kill' ||
              currentStep.actionType === 'big_bad_wolf_kill' ||
              currentStep.actionType === 'big_grey_wolf_kill' ||
              currentStep.actionType === 'wolf_younger_brother_kill' ||
              currentStep.actionType === 'perseus_execute' ||
              currentStep.actionType === 'awakened_wolf_king_give_gun' ||
              currentStep.actionType === 'awakened_wolf_beauty_charm' ||
              currentStep.actionType === 'scarlet_wolf_king_attach' ||
              currentStep.actionType === 'night_noble_servant' ||
              currentStep.actionType === 'awakened_idiot_shield' ||
              currentStep.actionType === 'twins_guard' ||
              currentStep.actionType === 'white_snake_action' ||
              currentStep.actionType === 'awakened_gargoyle_convert' ||
              currentStep.actionType === 'awakened_lonely_girl_choose' ||
              currentStep.actionType === 'wild_child_choose' ||
              currentStep.actionType === 'shadow_choose' ||
              currentStep.actionType === 'puppet_wolf_choose' ||
              currentStep.actionType === 'chameleon_wolf_choose' ||
              currentStep.actionType === 'jack_ripper_action' ||
              currentStep.actionType === 'pandora_gift' ||
              currentStep.actionType === 'pandora_knife' ||
              currentStep.actionType === 'sleeping_beauty_pick' ||
              currentStep.actionType === 'exotic_prince_check' ||
              currentStep.actionType === 'nine_tails_mark' ||
              currentStep.actionType === 'bai_ze_clear' ||
              currentStep.actionType === 'crow_curse' ||
              currentStep.actionType === 'poisoner_poison' ||
              currentStep.actionType === 'wolf_girl_confess' ||
              currentStep.actionType === 'miracle_merchant_gift' ||
              currentStep.actionType === 'black_market_gift' ||
              currentStep.actionType === 'evil_merchant_gift' ||
              currentStep.actionType === 'butler_tea' ||
              currentStep.actionType === 'wolf_maid_tea' ||
              currentStep.actionType === 'lucky_item_action' ||
              currentStep.actionType === 'happy_sheep_action' ||
              currentStep.actionType === 'police_dog_action' ||
              currentStep.actionType === 'little_girl_identify' ||
              (currentStep.actionType === 'ghost_bride_link' && round >= 2)) && (
              <div className="rounded-md border border-subtle bg-canvas px-3 py-2 text-center text-xs font-bold text-primary">
                {pendingTarget !== null
                  ? `已預選目標：${pendingTarget} 號（點擊下方按鈕確認紀錄）`
                  : '請點選上方座位選擇技能目標（或直接確認跳過）'}
              </div>
            )}

            {currentStep.actionType === 'thief_choose' && (
              <div className="space-y-2 rounded-md border border-third-border bg-canvas p-2.5 text-xs">
                <div className="font-bold text-third">
                  🎭 盜賊底牌二選一（點擊選擇首夜變身身分）
                </div>
                {thiefBottomCards.length === 0 ? (
                  <div className="text-secondary">尚無底牌紀錄（可直接確認跳過）</div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {thiefBottomCards.map((roleId, idx) => {
                      const roleInfo = getRoleById(roleId);
                      const check = canThiefChooseCard(thiefBottomCards, roleId);
                      const picked = pendingThiefRoleId === roleId;
                      return (
                        <button
                          key={`${roleId}-${idx}`}
                          type="button"
                          disabled={!check.allowed}
                          onClick={() => setPendingThiefRoleId(roleId)}
                          className={`min-h-11 rounded-md border px-3 py-2 text-xs font-bold transition ${
                            picked
                              ? 'border-selected-third bg-third-tint text-third'
                              : !check.allowed
                                ? 'cursor-not-allowed border-subtle bg-surface text-muted'
                                : 'border-subtle bg-surface text-primary hover:border-strong'
                          }`}
                        >
                          {roleInfo?.name ?? roleId}
                          {!check.allowed && '（必選狼牌）'}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {currentStep.actionType === 'treasure_master_choose' && (
              <div className="space-y-2 rounded-md border border-sheriff-border bg-canvas p-2.5 text-xs">
                <div className="flex items-center justify-between gap-2 font-bold text-sheriff">
                  <span>💎 盜寶大師三選一底牌</span>
                  <span>
                    歸屬：
                    {treasureMasterState.affiliation === 'wolf'
                      ? '狼人陣營'
                      : treasureMasterState.affiliation === 'god'
                        ? '神職陣營'
                        : treasureMasterState.affiliation === 'villager'
                          ? '平民陣營'
                          : '未判定'}
                  </span>
                </div>
                {treasureMasterState.bottomCards.length === 0 ? (
                  <div className="text-secondary">尚未配置三張底牌（請先於開局設定底牌）</div>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5">
                    {treasureMasterState.bottomCards.map((roleId) => {
                      const roleInfo = getRoleById(roleId);
                      const check = canTreasureMasterChooseCard(treasureMasterState, seats, roleId, {
                        allowSkip: false,
                      });
                      const picked = pendingTreasureCardRoleId === roleId;
                      return (
                        <button
                          key={roleId}
                          type="button"
                          disabled={!check.allowed}
                          onClick={() => setPendingTreasureCardRoleId(roleId)}
                          className={`min-h-11 rounded-md border px-2 py-2 text-xs font-bold transition ${
                            picked
                              ? 'border-selected-sheriff bg-sheriff-tint text-sheriff'
                              : !check.allowed
                                ? 'cursor-not-allowed border-subtle bg-surface text-muted line-through'
                                : 'border-subtle bg-surface text-primary hover:border-strong'
                          }`}
                        >
                          {roleInfo?.name ?? roleId}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {(currentStep.actionType === 'miracle_merchant_gift' ||
              currentStep.actionType === 'black_market_gift') && (
              <div className="space-y-1.5 rounded-md border border-sheriff-border bg-canvas p-2.5 text-xs">
                <div className="font-bold text-sheriff">🎁 選擇贈禮道具類型</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(currentStep.actionType === 'miracle_merchant_gift'
                    ? ([
                        ['seer_check', '🔮 查驗'],
                        ['witch_poison', '☠️ 毒藥'],
                        ['guard_shield', '🛡️ 守衛盾'],
                      ] as const)
                    : ([
                        ['seer_check', '🔮 查驗'],
                        ['witch_poison', '☠️ 毒藥'],
                        ['hunter_gun', '🔫 獵槍'],
                      ] as const)
                  ).map(([item, label]) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPendingMerchantItem(item)}
                      className={`min-h-10 rounded-md border px-2 font-bold ${
                        pendingMerchantItem === item
                          ? 'border-selected-sheriff bg-sheriff-tint text-sheriff'
                          : 'border-subtle bg-surface text-secondary'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep.actionType === 'evil_merchant_gift' && (
              <div className="space-y-2 rounded-md border border-wolf-border bg-canvas p-2.5 text-xs">
                <div className="font-bold text-wolf">
                  {round === 1
                    ? '🔫 第一晚固定贈送獵人槍（不可選自己）'
                    : thirdPartySpecialState?.evilMerchantLastDayNoGunWolfDied
                      ? '☠️ 昨日有非帶槍狼出局：今晚可改贈毒藥'
                      : '⛔ 昨日無非帶槍狼出局：今晚不可贈送毒藥'}
                </div>
                {thirdPartySpecialState?.evilMerchantPoisonHolderSeat != null && (
                  <div className="space-y-1.5 border-t border-subtle pt-1.5">
                    <div className="font-bold text-wolf">
                      ☠️ 持毒狼（{thirdPartySpecialState.evilMerchantPoisonHolderSeat} 號）指定今晚毒殺目標：
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {seats
                        .filter(
                          (s) =>
                            s.isAlive &&
                            s.seatNumber !== thirdPartySpecialState.evilMerchantPoisonHolderSeat,
                        )
                        .map((s) => (
                          <button
                            key={s.seatNumber}
                            type="button"
                            onClick={() =>
                              setPendingEvilPoisonTarget((prev) =>
                                prev === s.seatNumber ? null : s.seatNumber,
                              )
                            }
                            className={`min-h-10 rounded-md border text-xs font-bold tabular-nums ${
                              pendingEvilPoisonTarget === s.seatNumber
                                ? 'border-selected-wolf bg-wolf-tint text-wolf'
                                : 'border-subtle bg-surface text-secondary'
                            }`}
                          >
                            {s.seatNumber}號
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep.actionType === 'lucky_item_action' && round === 1 && (
              <div className="rounded-md border border-sheriff-border bg-sheriff-tint px-3 py-2 text-xs text-sheriff">
                {activeLuckyActor ? (
                  activeLuckyActor.allowedThisRound ? (
                    <>
                      幸運兒（{formatSeatNum(activeLuckyActor.actorSeat)} 號）首夜可使用此技能
                    </>
                  ) : (
                    <>
                      幸運兒（{formatSeatNum(activeLuckyActor.actorSeat)} 號）此技能依房規首夜禁用（次夜起生效），請直接跳過
                    </>
                  )
                ) : (
                  '尚未指定幸運兒（或無首夜可用技能），可直接跳過'
                )}
              </div>
            )}

            {(currentStep.actionType === 'eclipse_maid_devour' ||
              currentStep.actionType === 'grey_wolf_boss_steal') && (
              <div className="rounded-md border border-wolf/40 bg-wolf-tint px-3 py-2 text-center text-xs font-bold text-wolf">
                {currentStep.actionType === 'eclipse_maid_devour'
                  ? `🌑 蝕日侍女（吞噬對象 → 技能目標）：${pendingDualTargets.filter((n) => n !== null).join(' → ') || '請依序點選吞噬對象與技能目標'}`
                  : `🐺 灰太狼（偷竊對象 → 技能目標）：${pendingDualTargets.filter((n) => n !== null).join(' → ') || '請依序點選偷竊對象與技能目標'}`}
              </div>
            )}

            {(currentStep.actionType === 'dancer_dance' ||
              currentStep.actionType === 'super_black_market_gift') && (
              <div className="rounded-md border border-fuchsia-400/40 bg-fuchsia-950/35 px-3 py-2 text-center text-xs font-bold text-fuchsia-100">
                {currentStep.actionType === 'dancer_dance'
                  ? `💃 舞者舞池（須選 3 人）：${pendingMultiTargets.join('、') || '請點選 3 位未進舞池的存活玩家'}`
                  : `🎁 超級黑市商人（查驗／毒／槍 3 位幸運兒）：${pendingMultiTargets.join('、') || '請依序點選 3 位玩家'}`}
              </div>
            )}

            {(currentStep.actionType === 'masked_wolf_action' ||
              currentStep.actionType === 'medium_channel') && (
              <div className="rounded-md border border-third-border bg-indigo-950/35 px-3 py-2 text-center text-xs font-bold text-third">
                {currentStep.actionType === 'masked_wolf_action'
                  ? `🎭 假面（查舞池／改陣營）：${pendingDualTargets.filter((n) => n !== null).join(' ／ ') || '請依序點選查驗與改判目標'}`
                  : `🔮 通靈者（死者 → 繼承者）：${pendingDualTargets.filter((n) => n !== null).join(' → ') || '請依序點選已死亡玩家與存活繼承者'}`}
              </div>
            )}

            {(currentStep.actionType === 'cupid_link' ||
              (currentStep.actionType === 'ghost_bride_link' && round === 1) ||
              currentStep.actionType === 'scent_phantom_link' ||
              currentStep.actionType === 'xu_xian_action') && (
              <div className="rounded-md border border-pink-400/40 bg-pink-950/35 px-3 py-2 text-center text-xs font-bold text-pink-100">
                💞 已選連線對象：
                {pendingDualTargets.filter((n) => n !== null).join(' ⇄ ') || '請點選 2 位存活玩家'}
              </div>
            )}

            {currentStep.actionType === 'zombie_infect' && (
              <div className="rounded-md border border-lime-400/40 bg-lime-950/35 px-3 py-2 text-center text-xs font-bold text-lime-100">
                🧟 殭屍感染（每晚 0～2 人）：
                {pendingMultiTargets.length > 0
                  ? `已預選感染 ${pendingMultiTargets.join('、')} 號`
                  : `目前累計已感染 ${conversionState.zombieInfectedSeats.length} 人`}
              </div>
            )}

            {currentStep.actionType === 'assassin_wolf_assassinate' && (
              <div className="space-y-1.5 rounded-md border border-wolf/40 bg-wolf-tint p-2.5 text-xs">
                <div className="text-center font-bold text-wolf">
                  🗡️ 刺客目標：{pendingTarget !== null ? `${pendingTarget} 號` : '未選擇（跳過）'}
                </div>
                {pendingTarget !== null && (
                  <div className="flex flex-wrap justify-center gap-1">
                    {Array.from(
                      new Set(
                        seats.map((s) => s.roleId).filter((r): r is string => Boolean(r)),
                      ),
                    ).map((rId) => (
                      <button
                        key={rId}
                        type="button"
                        onClick={() => setPendingAssassinRoleId(rId)}
                        className={`min-h-8 rounded-md border px-2 font-bold ${
                          pendingAssassinRoleId === rId
                            ? 'border-wolf bg-rose-600 text-white'
                            : 'border-subtle bg-surface text-secondary'
                        }`}
                      >
                        {getRoleById(rId)?.name ?? rId}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStep.actionType === 'bee_wild_hunt_sting' && (
              <div className="rounded-md border border-sheriff-border bg-amber-950/35 px-3 py-2 text-center text-xs font-bold text-sheriff">
                🐝 蜂之狂獵蜂刺（選 2 位，可同人）：
                {combatState.beeWildHuntLostAbility
                  ? '技能已永久失效'
                  : pendingDualTargets.filter((n) => n !== null).join('、') || '尚未選擇'}
              </div>
            )}

            {currentStep.actionType === 'anubis_scale' && (
              <div className="rounded-md border border-third/40 bg-purple-950/35 px-3 py-2 text-center text-xs font-bold text-third">
                ⚖️ 阿努比斯天平（神&gt;民&gt;狼&gt;神）：左側死者{' '}
                {pendingDualTargets[0] !== null ? `${pendingDualTargets[0]} 號` : '未選'} vs 右側活人{' '}
                {pendingDualTargets[1] !== null ? `${pendingDualTargets[1]} 號` : '未選'}
              </div>
            )}

            {currentStep.actionType === 'warden_wolf_trade' && (
              <div className="space-y-1.5 rounded-md border border-third-border bg-indigo-950/35 p-2.5 text-xs">
                <div className="text-center font-bold text-third">
                  ⛓️ 典獄長交易對象：
                  {pendingDualTargets[0] !== null && pendingDualTargets[1] !== null
                    ? `${pendingDualTargets[0]} 號 & ${pendingDualTargets[1]} 號`
                    : '請點選 2 位存活玩家'}
                </div>
                {pendingDualTargets[0] !== null && pendingDualTargets[1] !== null && (
                  <div className="grid grid-cols-2 gap-2">
                    {[0, 1].map((idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setPendingWardenChoices((prev) =>
                            idx === 0
                              ? [prev[0] === 'trade' ? 'betray' : 'trade', prev[1]]
                              : [prev[0], prev[1] === 'trade' ? 'betray' : 'trade'],
                          )
                        }
                        className="min-h-9 rounded-lg border border-subtle bg-surface px-2 font-bold text-primary"
                      >
                        {pendingDualTargets[idx]} 號：
                        {pendingWardenChoices[idx] === 'trade' ? '🤝 交易' : '🗡️ 背叛'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStep.actionType === 'hunter_gesture' && (
              <div
                className={`rounded-md border px-3 py-2 text-center text-sm font-extrabold ${
                  !hunterSeat || !hunterSeat.isAlive
                    ? 'border-subtle bg-canvas text-secondary'
                    : isHunterPoisonedTonight
                      ? 'border-wolf-border bg-wolf-tint text-wolf'
                      : 'border-good-border bg-good-tint text-good'
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
              <div className="flex items-center justify-between gap-2 text-xs text-secondary">
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
                    className="min-h-10 rounded-md border border-subtle bg-canvas px-3 text-xs font-bold text-primary"
                  >
                    改為跳過
                  </button>
                )}
              </div>
            )}

            {currentStep.actionType === 'mech_wolf_reveal_skill' && (
              <div className="rounded-md border border-sheriff-border bg-sheriff-tint px-3 py-2 text-center text-xs font-bold text-sheriff">
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
                  <span className={mechWolfState.hasJoinedWolfTeam ? 'font-bold text-wolf' : 'text-sheriff'}>
                    {mechWolfState.hasJoinedWolfTeam ? '✅ 已入狼隊' : '⏳ 尚未入隊'}
                  </span>
                  <span className="text-secondary">
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
                      className="rounded-lg border border-subtle bg-canvas px-2 py-1 text-[12px] font-bold text-primary"
                    >
                      不使用
                    </button>
                  )}
                </div>
                {mechWolfPsychicOutcome && (
                  <div className="rounded-md border border-third-border bg-third-tint px-3 py-1.5 text-center text-sm font-extrabold text-third">
                    機械狼查驗：{mechWolfPsychicOutcome.targetSeat} 號 ➜{' '}
                    {getRoleById(mechWolfPsychicOutcome.perceivedRoleId)?.name ??
                      mechWolfPsychicOutcome.perceivedRoleId}
                  </div>
                )}
              </div>
            )}

            {currentStep.actionType === 'wolf_beauty_charm' && (
              <div className="flex items-center justify-between gap-2 text-xs text-secondary">
                <span>
                  {round > 1 && (
                    <>昨晚魅惑：{lastCharmedSeat !== null ? `${lastCharmedSeat} 號` : '無'} · </>
                  )}
                  預選：
                  <strong className="text-wolf">
                    {pendingTarget !== null ? `${pendingTarget} 號` : '空魅'}
                  </strong>
                </span>
                {pendingTarget !== null && (
                  <button
                    type="button"
                    onClick={() => setPendingTarget(null)}
                    className="min-h-10 rounded-md border border-subtle bg-canvas px-3 text-xs font-bold text-primary"
                  >
                    改為空魅
                  </button>
                )}
              </div>
            )}

            {currentStep.actionType === 'dream_catcher_dream' && (
              <div className="text-xs text-secondary">
                {round > 1 && (
                  <>昨晚夢遊：{lastDreamTarget !== null ? `${lastDreamTarget} 號` : '無'} ·{' '}</>
                )}
                {pendingTarget !== null && pendingTarget === lastDreamTarget ? (
                  <span className="font-bold text-wolf">
                    ⚠️ 連夢 {lastDreamTarget} 號將夢死！
                  </span>
                ) : pendingTarget !== null ? (
                  <span className="font-bold text-third">
                    💤 預選 {pendingTarget} 號為夢遊者
                  </span>
                ) : (
                  <span className="text-sheriff">請必選一名自己以外的存活玩家</span>
                )}
              </div>
            )}

            {!pendingValidation.allowed && pendingValidation.reason && (
              <div className="rounded-md border border-wolf-border bg-wolf-tint px-3 py-1.5 text-xs font-semibold text-wolf">
                ⚠️ {pendingValidation.reason}
              </div>
            )}
          </div>
        )}

        {/* 底部操作列：上一步線框 ＋ 單一實心主按鈕 */}
        <div className="flex items-center gap-2">
          {!isOnlineJudge && (
            <button
              type="button"
              disabled={isFirstStep}
              onClick={prevNightStep}
              aria-label="上一步"
              className={`min-h-12 min-w-12 shrink-0 rounded-md border px-3 text-[14px] font-semibold transition ${
                isFirstStep
                  ? 'cursor-not-allowed border-subtle bg-canvas text-muted opacity-50'
                  : 'border-subtle bg-surface text-secondary hover:border-strong hover:text-primary'
              }`}
            >
              ←
            </button>
          )}

          <button
            type="button"
            disabled={primaryButtonDisabled}
            onClick={isClaimStage ? handleConfirmClaimAction : handleConfirmSkillAction}
            className={`min-h-12 flex-1 rounded-md px-4 text-[14px] font-semibold transition ${
              primaryButtonDisabled
                ? 'cursor-not-allowed bg-elevated text-muted'
                : isClaimStage && isPendingUnclaim
                  ? 'bg-wolf text-primary hover:opacity-90'
                  : isLastStep && !isClaimStage && (!isInfoRevealStep || revealConfirmed)
                    ? 'bg-good text-inverse hover:opacity-90'
                    : 'bg-sheriff text-inverse hover:opacity-90'
            }`}
          >
            {primaryButtonLabel}
          </button>
        </div>
      </section>

      {/* 線上法官全黑防窺／開頭／輪流認身分／緩衝／天亮過渡畫面 */}
      {isOnlineJudge && onlinePhase !== 'active' && (
        <OnlineJudgeOverlay
          mode={onlinePhase as OnlineJudgeOverlayMode}
          round={round}
          actorLabel={currentStep.actorLabel}
          bufferRemainingSec={bufferRemaining}
          isLastStep={isLastStep}
          ttsEnabled={onlineJudgeSettings.ttsEnabled}
          ttsSupported={ttsSupported}
          dawnText={dawnSpeechPlan.fullText}
          dawnCountdownDigit={dawnCountdownDigit}
          touchConfirmSeat={activeTouchConfirmSeat}
          touchConfirmIndex={touchConfirmIdx}
          touchConfirmTotal={touchConfirmSeats.length}
          touchConfirmTitle={touchConfirmEvent?.title}
          touchConfirmView={activeTouchConfirmView}
          onWakeScreen={handleWakeOnlineScreen}
          onSkipBuffer={completeBufferTransition}
          onWakeTouchConfirm={handleWakeTouchConfirm}
          onCloseTouchConfirm={handleCloseTouchConfirm}
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
        title={`${currentStep.actorLabel} · 台詞`}
        placement="bottom"
      >
        <div className="divide-y divide-subtle">
          {!actorSeatsAlive && (
            <div className="border-l-2 border-wolf bg-wolf-tint px-3 py-2 text-[12px] font-semibold text-wolf">
              此角色已出局：請照常唸詞並默數 5 秒避免暴露資訊。
            </div>
          )}
          <div className="py-3">
            <div className="text-[12px] font-semibold text-secondary">睜眼</div>
            <p className="mt-1 text-[14px] font-semibold text-primary">{currentStep.openPrompt}</p>
          </div>
          <div className="border-l-2 border-sheriff py-3 pl-3">
            <div className="text-[12px] font-semibold text-sheriff">引導台詞</div>
            <p className="mt-1 whitespace-pre-line text-[14px] font-semibold leading-6 text-primary">
              {currentStep.actionPrompt}
            </p>
          </div>
          <div className="py-3">
            <div className="text-[12px] font-semibold text-secondary">閉眼</div>
            <p className="mt-1 text-[14px] font-medium text-secondary">{currentStep.closePrompt}</p>
          </div>
          {currentStep.judgeTips && currentStep.judgeTips.length > 0 && (
            <div className="space-y-1 py-3">
              <div className="text-[12px] font-semibold text-third">法官提醒</div>
              {currentStep.judgeTips.map((tip, idx) => (
                <p key={idx} className="text-[12px] leading-5 text-secondary">
                  • {tip}
                </p>
              ))}
            </div>
          )}
          {relatedQAs.length > 0 && (
            <div className="space-y-2 py-3">
              <div className="text-[12px] font-semibold text-sheriff">相關 Q&amp;A</div>
              {relatedQAs.map((qa) => (
                <div key={qa.id} className="text-[12px] leading-5">
                  <div className="font-semibold text-primary">Q：{qa.question}</div>
                  <div className="mt-0.5 text-secondary">A：{qa.answer}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SlideDrawer>

      {/* 女巫用藥不可逆二次確認彈窗 */}
      <ConfirmModal
        open={confirmWitchPotionOpen}
        title={pendingUseAntidote ? '確認使用解藥' : '確認使用毒藥'}
        description={
          pendingUseAntidote
            ? `消耗唯一解藥救起 ${currentNightDraft.wolfTarget} 號（若與守衛同守將奶穿）。`
            : `消耗唯一毒藥毒殺 ${pendingTarget} 號（被毒者無法開槍）。`
        }
        confirmLabel={pendingUseAntidote ? '確認解藥' : '確認毒藥'}
        cancelLabel="返回"
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
        title={`結束第 ${round} 晚並結算`}
        confirmLabel="確認結算"
        cancelLabel="返回"
        tone="warning"
        onConfirm={() => {
          setConfirmFinishOpen(false);
          finishNight();
        }}
        onCancel={() => setConfirmFinishOpen(false)}
      >
        <div className="space-y-2">
          <ul className="space-y-1 border-l-2 border-subtle pl-3 text-[12px] text-secondary tabular-nums">
            {summaryLines.length > 0 ? (
              summaryLines.map((line, idx) => <li key={idx}>• {line}</li>)
            ) : (
              <li>• 已完成本晚 {steps.length} 個步驟</li>
            )}
          </ul>
          {isPhysicalDealFirstNight && unclaimedSeats.length > 0 && (
            <div className="border-l-2 border-good bg-good-tint px-3 py-1.5 text-[12px] text-good tabular-nums">
              未認領 {unclaimedSeats.join('、')} 號將自動補為平民。
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

      {/* 放大展示給玩家看：全屏純黑防窺遮罩卡 */}
      <InfoFlashcardModal data={flashcardData} onClose={() => setFlashcardData(null)} />
    </div>
  );
}
