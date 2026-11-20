import { useMemo, useState } from 'react';
import { getBoardById } from '../../data/boards';
import { getRoleById } from '../../data/roles';
import {
  applyMechWolfLearn,
  canGuardTarget,
  canMechWolfLearn,
  canMechWolfUseLearnedSkill,
  canWitchUseAntidote,
  canWitchUsePoison,
  findMechWolfSeat,
  getNightSteps,
  getPsychicCheckResult,
  getSeerCheckResult,
} from '../../logic';
import { useGameStore } from '../../store/gameStore';
import { ConfirmModal } from '../common/ConfirmModal';
import { SeatStatusDrawer } from '../common/SeatStatusDrawer';
import { formatSeatShort, getRoleBadgeClasses } from '../common/displayHelpers';

export function NightConsoleScreen() {
  const selectedBoardId = useGameStore((s) => s.selectedBoardId);
  const round = useGameStore((s) => s.round);
  const seats = useGameStore((s) => s.seats);
  const ruleOverrides = useGameStore((s) => s.ruleOverrides);
  const currentStepIndex = useGameStore((s) => s.currentStepIndex);
  const currentNightDraft = useGameStore((s) => s.currentNightDraft);
  const witchAntidoteUsed = useGameStore((s) => s.witchAntidoteUsed);
  const witchPoisonUsed = useGameStore((s) => s.witchPoisonUsed);
  const lastGuardedSeat = useGameStore((s) => s.lastGuardedSeat);
  const mechWolfState = useGameStore((s) => s.mechWolfState);
  const pendingSelfExplodeSeat = useGameStore((s) => s.pendingSelfExplodeSeat);

  const updateNightDraft = useGameStore((s) => s.updateNightDraft);
  const nextNightStep = useGameStore((s) => s.nextNightStep);
  const prevNightStep = useGameStore((s) => s.prevNightStep);
  const finishNight = useGameStore((s) => s.finishNight);

  const [maskSeatRoles, setMaskSeatRoles] = useState(false);
  const [confirmFinishOpen, setConfirmFinishOpen] = useState(false);
  const [seatDrawerOpen, setSeatDrawerOpen] = useState(false);

  const board = getBoardById(selectedBoardId);
  const steps = useMemo(
    () => (board ? getNightSteps(board, round) : []),
    [board, round],
  );
  const currentStep = steps[currentStepIndex];

  const actorSeatsAlive = useMemo(() => {
    if (!currentStep || currentStep.actorRoleIds.length === 0) return true;
    return seats.some(
      (seat) => seat.isAlive && seat.roleId && currentStep.actorRoleIds.includes(seat.roleId),
    );
  }, [currentStep, seats]);

  const relatedQAs = useMemo(() => {
    if (!board || !currentStep) return [];
    const roleSet = new Set(currentStep.actorRoleIds);
    return board.qaList.filter((qa) => qa.relatedRoleIds?.some((id) => roleSet.has(id)));
  }, [board, currentStep]);

  const effectiveMechWolfForPreview = useMemo(() => {
    if (round !== 1) return mechWolfState;
    return applyMechWolfLearn(mechWolfState, seats, currentNightDraft.mechWolfLearnTarget);
  }, [round, mechWolfState, seats, currentNightDraft.mechWolfLearnTarget]);

  if (!board || !currentStep) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center text-sm text-slate-300">
        無法載入夜間主持步驟，請重開新局。
      </div>
    );
  }

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex >= steps.length - 1;

  // 檢查機械狼首夜強制學習是否未選
  const mechWolfSeat = findMechWolfSeat(seats);
  const mechWolfLearnCheck =
    currentStep.actionType === 'mech_wolf_learn' && round === 1 && mechWolfSeat?.isAlive
      ? canMechWolfLearn(seats, currentNightDraft.mechWolfLearnTarget, ruleOverrides, round)
      : { allowed: true };

  // 女巫解藥檢核
  const antidoteCheck = canWitchUseAntidote(
    seats,
    round,
    currentNightDraft.wolfTarget,
    witchAntidoteUsed,
    ruleOverrides,
  );
  const antidoteBlockedByPoison = currentNightDraft.witchPoisonTarget !== null;

  // 查驗即時結果
  const seerOutcome =
    currentStep.actionType === 'seer_check' && currentNightDraft.seerCheckTarget !== null
      ? getSeerCheckResult(seats, currentNightDraft.seerCheckTarget)
      : null;

  const psychicOutcome =
    currentStep.actionType === 'psychic_check' &&
    currentNightDraft.psychicCheckTarget !== null
      ? getPsychicCheckResult(
          seats,
          effectiveMechWolfForPreview,
          currentNightDraft.psychicCheckTarget,
        )
      : null;

  const mechWolfPsychicOutcome =
    currentStep.actionType === 'mech_wolf_night_action' &&
    mechWolfState.learnedRoleId === 'psychic' &&
    currentNightDraft.mechWolfSkillTarget !== null
      ? getPsychicCheckResult(seats, mechWolfState, currentNightDraft.mechWolfSkillTarget)
      : null;

  const hunterSeat = seats.find((s) => s.roleId === 'hunter');
  const isHunterPoisonedTonight =
    hunterSeat !== undefined &&
    (currentNightDraft.witchPoisonTarget === hunterSeat.seatNumber ||
      (round >= 2 &&
        mechWolfState.learnedRoleId === 'witch' &&
        currentNightDraft.mechWolfSkillTarget === hunterSeat.seatNumber));

  const getSeatControlForStep = (
    seatNumber: number,
  ): {
    selected: boolean;
    disabled: boolean;
    reason?: string;
    onSelect: () => void;
  } => {
    const seat = seats.find((s) => s.seatNumber === seatNumber);
    const isAlive = seat?.isAlive ?? false;

    switch (currentStep.actionType) {
      case 'wolf_kill': {
        return {
          selected: currentNightDraft.wolfTarget === seatNumber,
          disabled: !isAlive,
          reason: !isAlive ? '已出局' : undefined,
          onSelect: () =>
            updateNightDraft({
              wolfTarget: currentNightDraft.wolfTarget === seatNumber ? null : seatNumber,
            }),
        };
      }

      case 'guard_protect': {
        const check = canGuardTarget(lastGuardedSeat, seatNumber, seats);
        return {
          selected: currentNightDraft.guardTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: () =>
            updateNightDraft({
              guardTarget: currentNightDraft.guardTarget === seatNumber ? null : seatNumber,
            }),
        };
      }

      case 'witch_action': {
        const check = canWitchUsePoison(
          seats,
          currentNightDraft.witchUseAntidote,
          seatNumber,
          witchPoisonUsed,
        );
        return {
          selected: currentNightDraft.witchPoisonTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: () =>
            updateNightDraft({
              witchPoisonTarget:
                currentNightDraft.witchPoisonTarget === seatNumber ? null : seatNumber,
            }),
        };
      }

      case 'seer_check': {
        return {
          selected: currentNightDraft.seerCheckTarget === seatNumber,
          disabled: !isAlive,
          reason: !isAlive ? '已出局' : undefined,
          onSelect: () =>
            updateNightDraft({
              seerCheckTarget:
                currentNightDraft.seerCheckTarget === seatNumber ? null : seatNumber,
            }),
        };
      }

      case 'psychic_check': {
        return {
          selected: currentNightDraft.psychicCheckTarget === seatNumber,
          disabled: !isAlive,
          reason: !isAlive ? '已出局' : undefined,
          onSelect: () =>
            updateNightDraft({
              psychicCheckTarget:
                currentNightDraft.psychicCheckTarget === seatNumber ? null : seatNumber,
            }),
        };
      }

      case 'mech_wolf_learn': {
        const check = canMechWolfLearn(seats, seatNumber, ruleOverrides, round);
        return {
          selected: currentNightDraft.mechWolfLearnTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: () =>
            updateNightDraft({
              mechWolfLearnTarget:
                currentNightDraft.mechWolfLearnTarget === seatNumber ? null : seatNumber,
            }),
        };
      }

      case 'mech_wolf_night_action': {
        const check = canMechWolfUseLearnedSkill(mechWolfState, seats, seatNumber, round);
        return {
          selected: currentNightDraft.mechWolfSkillTarget === seatNumber,
          disabled: !check.allowed,
          reason: check.allowed ? undefined : check.reason,
          onSelect: () =>
            updateNightDraft({
              mechWolfSkillTarget:
                currentNightDraft.mechWolfSkillTarget === seatNumber ? null : seatNumber,
            }),
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

  const showSeatPad =
    currentStep.actionType !== 'hunter_gesture' &&
    currentStep.actionType !== 'mech_wolf_reveal_skill' &&
    currentStep.actionType !== 'confirm_only';

  const wolfTargetSeat =
    currentNightDraft.wolfTarget !== null
      ? seats.find((s) => s.seatNumber === currentNightDraft.wolfTarget)
      : undefined;

  const mechLearnedTargetSeat =
    currentNightDraft.mechWolfLearnTarget !== null
      ? seats.find((s) => s.seatNumber === currentNightDraft.mechWolfLearnTarget)
      : undefined;

  const hasWolfKillStep = steps.some((s) => s.actionType === 'wolf_kill');
  const hasWitchStep = steps.some((s) => s.actionType === 'witch_action');
  const hasGuardStep = steps.some((s) => s.actionType === 'guard_protect');

  // 夜間結算摘要清單
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
    ...(!hasWolfKillStep && !hasWitchStep && !hasGuardStep
      ? [`已完成本晚 ${steps.length} 個主持台詞步驟（特殊角色狀態請透過「座位總覽／手動標記」確認）`]
      : []),
  ];

  return (
    <div className="space-y-4 pb-28">
      {/* 步驟進度條 */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/95 p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              第 {round} 晚
            </span>
            <h1 className="text-lg font-extrabold text-slate-50">
              步驟 {currentStepIndex + 1} / {steps.length}：{currentStep.actorLabel}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`rounded-xl border px-2.5 py-1 text-xs font-bold ${
                actorSeatsAlive
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
                  : 'border-slate-700 bg-slate-800 text-slate-400'
              }`}
            >
              {actorSeatsAlive ? '場上存活' : '該職已出局'}
            </span>
            <button
              type="button"
              onClick={() => setSeatDrawerOpen(true)}
              className="min-h-10 rounded-xl border border-indigo-400/40 bg-indigo-950/50 px-2.5 text-xs font-bold text-indigo-200 hover:bg-indigo-900/50"
            >
              👥 座位總覽
            </button>
          </div>
        </div>

        <div className="mt-3 flex gap-1.5">
          {steps.map((step, idx) => (
            <div
              key={step.stepId}
              className={`h-2 flex-1 rounded-full transition ${
                idx < currentStepIndex
                  ? 'bg-emerald-500/70'
                  : idx === currentStepIndex
                    ? 'bg-amber-400'
                    : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </section>

      {!actorSeatsAlive && (
        <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-xs leading-relaxed text-slate-300">
          ⚠️ 此角色目前場上已無存活玩家。線下主持仍建議照常唸出睜閉眼台詞並默數 5 秒，避免場上玩家聽出神職已出局。
        </div>
      )}

      {/* 三段式法官夜間主持台詞卡 */}
      <section className="space-y-3 rounded-2xl border border-amber-500/30 bg-slate-900 p-4 shadow-lg">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <div className="text-xs font-bold text-sky-300">👁️ 睜眼</div>
          <p className="mt-1 text-base font-bold text-slate-100">{currentStep.openPrompt}</p>
        </div>

        <div className="rounded-xl border border-amber-500/35 bg-amber-950/25 p-3.5">
          <div className="text-xs font-bold text-amber-300">🗣️ 引導台詞</div>
          <p className="mt-1.5 whitespace-pre-line text-lg font-extrabold leading-relaxed text-amber-50">
            {currentStep.actionPrompt}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <div className="text-xs font-bold text-slate-400">🙈 閉眼</div>
          <p className="mt-1 text-base font-bold text-slate-200">{currentStep.closePrompt}</p>
        </div>
      </section>

      {/* 即時規則提示與相關 Q&A */}
      {((currentStep.judgeTips && currentStep.judgeTips.length > 0) ||
        relatedQAs.length > 0) && (
        <section className="space-y-2 rounded-2xl border border-indigo-500/30 bg-indigo-950/25 p-3.5">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            法官即時提醒
          </div>
          {currentStep.judgeTips?.map((tip, idx) => (
            <p key={idx} className="text-xs leading-relaxed text-slate-200">
              • {tip}
            </p>
          ))}
          {relatedQAs.length > 0 && (
            <div className="border-t border-indigo-500/20 pt-2 text-xs text-amber-200">
              相關 Q&amp;A：{relatedQAs[0].question}（可點右上角「Q &amp; A 速查」看完整解答）
            </div>
          )}
        </section>
      )}

      {/* 步驟專屬互動與狀態面板 */}
      {currentStep.actionType === 'wolf_kill' && (
        <section className="space-y-2.5 rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          {pendingSelfExplodeSeat !== null && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 text-xs font-semibold text-amber-200">
              💥 上個白天 {pendingSelfExplodeSeat} 號狼人自爆，本晚完成點刀結算後將正式出局。
            </div>
          )}
          {round >= 2 && mechWolfState.hasJoinedWolfTeam && mechWolfSeat?.isAlive && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-3 text-xs font-semibold text-rose-200">
              🤖 所有小狼已出局，機械狼（{mechWolfSeat.seatNumber} 號）已入狼隊並參與今晚點刀！
            </div>
          )}
          <button
            type="button"
            onClick={() => updateNightDraft({ wolfTarget: null })}
            className={`min-h-12 w-full rounded-xl border px-4 text-sm font-bold transition ${
              currentNightDraft.wolfTarget === null
                ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                : 'border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {currentNightDraft.wolfTarget === null ? '✓ 已選擇：今晚空刀（不殺人）' : '選擇空刀（不殺人）'}
          </button>
        </section>
      )}

      {currentStep.actionType === 'guard_protect' && (
        <section className="space-y-2.5 rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="text-xs text-slate-300">
            昨晚守護對象：
            <span className="font-bold text-amber-300">
              {lastGuardedSeat !== null ? ` ${lastGuardedSeat} 號（今晚不可連守）` : ' 無 / 空守'}
            </span>
          </div>
          <button
            type="button"
            disabled={!actorSeatsAlive}
            onClick={() => updateNightDraft({ guardTarget: null })}
            className={`min-h-12 w-full rounded-xl border px-4 text-sm font-bold transition ${
              !actorSeatsAlive
                ? 'cursor-not-allowed border-slate-800 bg-slate-950 text-slate-500'
                : currentNightDraft.guardTarget === null
                  ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                  : 'border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {currentNightDraft.guardTarget === null ? '✓ 已選擇：今晚空守' : '選擇空守（不守護）'}
          </button>
        </section>
      )}

      {currentStep.actionType === 'witch_action' && (
        <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <div className="text-slate-400">今晚狼刀目標</div>
              <div className="mt-1 text-base font-extrabold text-rose-300">
                {wolfTargetSeat ? formatSeatShort(wolfTargetSeat) : '空刀（平安）'}
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <div className="text-slate-400">雙藥剩餘</div>
              <div className="mt-1 flex gap-2 text-xs font-bold">
                <span className={witchAntidoteUsed ? 'text-slate-500 line-through' : 'text-emerald-300'}>
                  解藥{witchAntidoteUsed ? '已用' : '×1'}
                </span>
                <span className={witchPoisonUsed ? 'text-slate-500 line-through' : 'text-rose-300'}>
                  毒藥{witchPoisonUsed ? '已用' : '×1'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={!antidoteCheck.allowed || antidoteBlockedByPoison}
            onClick={() =>
              updateNightDraft({ witchUseAntidote: !currentNightDraft.witchUseAntidote })
            }
            className={`min-h-12 w-full rounded-xl border px-4 py-3 text-sm font-bold transition ${
              currentNightDraft.witchUseAntidote
                ? 'border-emerald-400 bg-emerald-500/25 text-emerald-100'
                : !antidoteCheck.allowed || antidoteBlockedByPoison
                  ? 'cursor-not-allowed border-slate-800 bg-slate-950 text-slate-500'
                  : 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200 hover:bg-emerald-900/40'
            }`}
          >
            {currentNightDraft.witchUseAntidote
              ? `✓ 已使用解藥救起 ${currentNightDraft.wolfTarget} 號（點擊取消）`
              : antidoteBlockedByPoison
                ? '已選擇毒藥，本晚不可同時使用解藥'
                : !antidoteCheck.allowed
                  ? `解藥不可用：${antidoteCheck.reason}`
                  : `💊 使用解藥救起 ${currentNightDraft.wolfTarget} 號`}
          </button>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-slate-300">
              毒藥目標（點下方座位選擇，或點右側不使用）
            </span>
            <button
              type="button"
              onClick={() => updateNightDraft({ witchPoisonTarget: null })}
              className={`min-h-10 rounded-lg border px-3 text-xs font-bold ${
                currentNightDraft.witchPoisonTarget === null
                  ? 'border-amber-400/50 bg-amber-500/15 text-amber-200'
                  : 'border-slate-700 bg-slate-800 text-slate-300'
              }`}
            >
              不使用毒藥
            </button>
          </div>
        </section>
      )}

      {currentStep.actionType === 'seer_check' && (
        <section className="space-y-2.5 rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          {seerOutcome ? (
            <div
              className={`rounded-xl border p-4 text-center ${
                seerOutcome.faction === 'wolf'
                  ? 'border-rose-500/50 bg-rose-950/50 text-rose-100'
                  : 'border-emerald-500/50 bg-emerald-950/50 text-emerald-100'
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-wider opacity-80">
                給預言家的查驗手勢
              </div>
              <div className="mt-1 text-xl font-extrabold">
                {seerOutcome.targetSeat} 號：{seerOutcome.faction === 'wolf' ? '👎 狼人陣營' : '👍 好人陣營'}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-center text-xs text-slate-400">
              請點選下方座位以顯示該玩家的陣營查驗結果
            </div>
          )}
        </section>
      )}

      {currentStep.actionType === 'psychic_check' && (
        <section className="space-y-2.5 rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          {psychicOutcome ? (
            <div className="rounded-xl border border-indigo-400/50 bg-indigo-950/50 p-4 text-center text-indigo-100">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                通靈師查驗真實身分
              </div>
              <div className="mt-1 text-xl font-extrabold">
                {psychicOutcome.targetSeat} 號 ➜{' '}
                {getRoleById(psychicOutcome.perceivedRoleId)?.name ??
                  psychicOutcome.perceivedRoleId}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-center text-xs text-slate-400">
              請點選下方座位以顯示真實身分（若機械狼已學習，將動態顯示所學角色）
            </div>
          )}
        </section>
      )}

      {currentStep.actionType === 'hunter_gesture' && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          {!hunterSeat || !hunterSeat.isAlive ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-center text-sm font-semibold text-slate-400">
              獵人目前已出局，無須比手勢。
            </div>
          ) : isHunterPoisonedTonight ? (
            <div className="rounded-xl border border-rose-500/50 bg-rose-950/50 p-4 text-center">
              <div className="text-xs font-bold text-rose-300">獵人座位：{hunterSeat.seatNumber} 號</div>
              <div className="mt-1 text-xl font-extrabold text-rose-100">
                👎 請比出【不可開槍】手勢
              </div>
              <p className="mt-1 text-xs text-rose-200">今晚女巫或機械狼使用毒藥毒殺了獵人</p>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/40 p-4 text-center">
              <div className="text-xs font-bold text-emerald-300">獵人座位：{hunterSeat.seatNumber} 號</div>
              <div className="mt-1 text-xl font-extrabold text-emerald-100">
                👍 請比出【可開槍】手勢
              </div>
              <p className="mt-1 text-xs text-emerald-200">獵人今晚未中毒，維持正常開槍狀態</p>
            </div>
          )}
        </section>
      )}

      {currentStep.actionType === 'mech_wolf_learn' && (
        <section className="space-y-2.5 rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          {ruleOverrides.mechWolfForceLearnNight1 ? (
            <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 text-xs font-semibold text-amber-200">
              本局已開啟「機械狼首夜強制學習」，請點選機械狼以外的一名玩家（不可跳過）。
            </div>
          ) : (
            <button
              type="button"
              onClick={() => updateNightDraft({ mechWolfLearnTarget: null })}
              className={`min-h-12 w-full rounded-xl border px-4 text-sm font-bold ${
                currentNightDraft.mechWolfLearnTarget === null
                  ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                  : 'border-slate-700 bg-slate-950 text-slate-300'
              }`}
            >
              不學習（跳過）
            </button>
          )}
        </section>
      )}

      {currentStep.actionType === 'mech_wolf_reveal_skill' && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-center">
          {mechLearnedTargetSeat && mechLearnedTargetSeat.roleId ? (
            <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-4">
              <div className="text-xs font-bold text-amber-300">
                機械狼學習對象：{mechLearnedTargetSeat.seatNumber} 號
              </div>
              <div className="mt-1 text-xl font-extrabold text-amber-100">
                習得身分：{getRoleById(mechLearnedTargetSeat.roleId)?.name ?? mechLearnedTargetSeat.roleId}
              </div>
              <p className="mt-1.5 text-xs text-slate-300">
                自第二晚起可使用對應技能（女巫僅 1 瓶毒藥；守衛機械盾可擋毒且不可連守）。
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
              首夜未選擇學習對象，本晚無習得技能。
            </div>
          )}
        </section>
      )}

      {currentStep.actionType === 'mech_wolf_night_action' && (
        <section className="space-y-2.5 rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <div className="text-slate-400">入隊狀態手勢</div>
              <div
                className={`mt-1 font-extrabold ${
                  mechWolfState.hasJoinedWolfTeam ? 'text-rose-300' : 'text-amber-300'
                }`}
              >
                {mechWolfState.hasJoinedWolfTeam ? '✅ 已入狼隊' : '⏳ 尚未入隊'}
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <div className="text-slate-400">已學習身分</div>
              <div className="mt-1 font-extrabold text-slate-100">
                {mechWolfState.learnedRoleId
                  ? getRoleById(mechWolfState.learnedRoleId)?.name ?? mechWolfState.learnedRoleId
                  : '無'}
              </div>
            </div>
          </div>

          {mechWolfState.learnedRoleId &&
          ['guard', 'witch', 'wolf', 'psychic'].includes(mechWolfState.learnedRoleId) ? (
            <button
              type="button"
              onClick={() => updateNightDraft({ mechWolfSkillTarget: null })}
              className={`min-h-12 w-full rounded-xl border px-4 text-sm font-bold ${
                currentNightDraft.mechWolfSkillTarget === null
                  ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                  : 'border-slate-700 bg-slate-950 text-slate-300'
              }`}
            >
              今晚不使用學習技能
            </button>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-400">
              所學身分無夜間主動技能，比出入隊狀態手勢後即可前往下一步。
            </div>
          )}

          {mechWolfPsychicOutcome && (
            <div className="rounded-xl border border-indigo-400/50 bg-indigo-950/50 p-3.5 text-center text-indigo-100">
              <div className="text-xs font-bold text-indigo-300">機械狼查驗結果</div>
              <div className="mt-1 text-lg font-extrabold">
                {mechWolfPsychicOutcome.targetSeat} 號 ➜{' '}
                {getRoleById(mechWolfPsychicOutcome.perceivedRoleId)?.name ??
                  mechWolfPsychicOutcome.perceivedRoleId}
              </div>
            </div>
          )}
        </section>
      )}

      {currentStep.actionType === 'confirm_only' && (
        <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="text-xs font-bold text-slate-400">持有此身分的座位：</div>
          {currentStep.actorRoleIds.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {seats
                .filter(
                  (seat) => seat.roleId && currentStep.actorRoleIds.includes(seat.roleId),
                )
                .map((seat) => (
                  <span
                    key={seat.seatNumber}
                    className={`rounded-xl border px-3 py-2 text-sm font-bold ${
                      seat.isAlive
                        ? 'border-indigo-400/40 bg-indigo-950/50 text-indigo-100'
                        : 'border-rose-500/35 bg-rose-950/35 text-rose-300 line-through'
                    }`}
                  >
                    {formatSeatShort(seat)}
                    {!seat.isAlive && '（已出局）'}
                  </span>
                ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              此步驟為動態取得身分或全場過渡提示，請依現場實際座位主持。
            </p>
          )}

          <button
            type="button"
            onClick={() => setSeatDrawerOpen(true)}
            className="min-h-12 w-full rounded-xl border border-indigo-400/45 bg-indigo-500/15 px-4 text-sm font-bold text-indigo-200 transition hover:bg-indigo-500/25"
          >
            👥 開啟座位總覽 / 手動標記存活或出局
          </button>
        </section>
      )}

      {/* 大格座位操作盤 */}
      {showSeatPad && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-300">座位操作盤</h2>
            <button
              type="button"
              onClick={() => setMaskSeatRoles((prev) => !prev)}
              className="min-h-10 rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              {maskSeatRoles ? '👁️ 顯示角色徽章' : '🙈 隱藏角色徽章'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {seats.map((seat) => {
              const role = getRoleById(seat.roleId);
              const control = getSeatControlForStep(seat.seatNumber);

              return (
                <button
                  key={seat.seatNumber}
                  type="button"
                  disabled={control.disabled}
                  onClick={control.onSelect}
                  className={`min-h-16 flex flex-col items-start justify-between rounded-2xl border p-3 text-left transition ${
                    control.selected
                      ? 'border-amber-400 bg-amber-500/20 ring-2 ring-amber-400/50'
                      : control.disabled
                        ? 'cursor-not-allowed border-slate-800/80 bg-slate-950/60 opacity-55'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-600 active:scale-[0.98]'
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-1">
                    <span className="text-base font-extrabold text-slate-50">
                      {seat.seatNumber} 號
                    </span>
                    {!seat.isAlive ? (
                      <span className="rounded bg-rose-950 px-1.5 py-0.5 text-[10px] font-bold text-rose-300">
                        已出局
                      </span>
                    ) : seat.idiotRevealed ? (
                      <span className="rounded bg-amber-950 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                        已翻牌
                      </span>
                    ) : control.selected ? (
                      <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-950">
                        已選
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-0.5 w-full truncate text-xs text-slate-300">
                    {seat.nickname.trim() || `${seat.seatNumber} 號玩家`}
                  </div>

                  {!maskSeatRoles && role && (
                    <span
                      className={`mt-1.5 rounded-md border px-1.5 py-0.5 text-[11px] font-bold ${getRoleBadgeClasses(role.id)}`}
                    >
                      {role.name}
                    </span>
                  )}

                  {control.disabled && control.reason && (
                    <span className="mt-1.5 text-[11px] leading-tight font-medium text-rose-300">
                      🔒 {control.reason}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 步驟警告 */}
      {!mechWolfLearnCheck.allowed && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-3.5 py-2.5 text-xs font-semibold text-rose-200">
          ⚠️ {mechWolfLearnCheck.reason}
        </div>
      )}

      {/* 底部上一步 / 下一步導航 */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-slate-950/95 p-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg gap-2.5">
          <button
            type="button"
            disabled={isFirstStep}
            onClick={prevNightStep}
            className={`min-h-12 flex-1 rounded-xl border px-4 py-3 text-sm font-bold transition ${
              isFirstStep
                ? 'cursor-not-allowed border-slate-800 bg-slate-900 text-slate-600'
                : 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700 active:scale-[0.98]'
            }`}
          >
            ← 上一步
          </button>

          {!isLastStep ? (
            <button
              type="button"
              disabled={!mechWolfLearnCheck.allowed}
              onClick={nextNightStep}
              className={`min-h-12 flex-[2] rounded-xl px-4 py-3 text-base font-extrabold transition ${
                mechWolfLearnCheck.allowed
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-[0.99]'
                  : 'cursor-not-allowed bg-slate-800 text-slate-500'
              }`}
            >
              下一步 →
            </button>
          ) : (
            <button
              type="button"
              disabled={!mechWolfLearnCheck.allowed}
              onClick={() => setConfirmFinishOpen(true)}
              className={`min-h-12 flex-[2] rounded-xl px-4 py-3 text-base font-extrabold transition ${
                mechWolfLearnCheck.allowed
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:scale-[0.99]'
                  : 'cursor-not-allowed bg-slate-800 text-slate-500'
              }`}
            >
              結束今夜 ➜ 天亮結算
            </button>
          )}
        </div>
      </div>

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
        <ul className="space-y-1.5 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200">
          {summaryLines.map((line, idx) => (
            <li key={idx}>• {line}</li>
          ))}
        </ul>
      </ConfirmModal>

      <SeatStatusDrawer
        open={seatDrawerOpen}
        board={board}
        onClose={() => setSeatDrawerOpen(false)}
      />
    </div>
  );
}
