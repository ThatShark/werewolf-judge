import { useMemo, useState } from 'react';
import { ttsEngine } from '../../audio/ttsEngine';
import { getBoardById } from '../../data/boards';
import { getRoleById } from '../../data/roles';
import { getHostModeDescriptor } from '../../logic';
import type {
  BadgeSwallowRule,
  ControlMode,
  DealMode,
  JudgeMode,
  RuleOverrides,
  SpeakingDirection,
  WitchSelfSaveRule,
} from '../../logic/types';
import { useGameStore } from '../../store/gameStore';
import { AmbientAudioPlayer } from '../common/AmbientAudioPlayer';
import { ConfirmModal } from '../common/ConfirmModal';
import { RULE_TOGGLE_META, getRoleBadgeClasses } from '../common/displayHelpers';

type LobbyTab = 'mode' | 'rules' | 'seats' | 'audio';

interface SeatSetupScreenProps {
  onOpenQA?: () => void;
}

const WITCH_SELF_SAVE_OPTIONS: Array<{ value: WitchSelfSaveRule; label: string }> = [
  { value: 'first_night_only', label: '僅首夜可自救' },
  { value: 'never', label: '全程不可自救' },
  { value: 'always', label: '全程可自救' },
];

const BADGE_SWALLOW_OPTIONS: Array<{ value: BadgeSwallowRule; label: string }> = [
  { value: 'single_explode', label: '單爆吞警徽' },
  { value: 'double_explode', label: '雙爆吞警徽' },
];

const DIRECTION_OPTIONS: Array<{ value: SpeakingDirection; label: string }> = [
  { value: 'clockwise', label: '順時針（左起）' },
  { value: 'counterclockwise', label: '逆時針（右起）' },
];

export function SeatSetupScreen({ onOpenQA }: SeatSetupScreenProps) {
  const selectedBoardId = useGameStore((s) => s.selectedBoardId);
  const seats = useGameStore((s) => s.seats);
  const hostMode = useGameStore((s) => s.hostMode);
  const onlineJudgeSettings = useGameStore((s) => s.onlineJudgeSettings);
  const ruleOverrides = useGameStore((s) => s.ruleOverrides);
  const ambientAudio = useGameStore((s) => s.ambientAudio);

  const goToBoardSelect = useGameStore((s) => s.goToBoardSelect);
  const setBoardPlayerCount = useGameStore((s) => s.setBoardPlayerCount);
  const updateHostMode = useGameStore((s) => s.updateHostMode);
  const updateOnlineJudgeSettings = useGameStore((s) => s.updateOnlineJudgeSettings);
  const updateRuleOverrides = useGameStore((s) => s.updateRuleOverrides);
  const setSeatNickname = useGameStore((s) => s.setSeatNickname);
  const setSeatGender = useGameStore((s) => s.setSeatGender);
  const setSeatSecondRole = useGameStore((s) => s.setSeatSecondRole);
  const randomizeJackSetup = useGameStore((s) => s.randomizeJackSetup);
  const clearSavedNicknames = useGameStore((s) => s.clearSavedNicknames);
  const startGame = useGameStore((s) => s.startGame);

  const [activeTab, setActiveTab] = useState<LobbyTab>('mode');
  const [confirmClearNicknamesOpen, setConfirmClearNicknamesOpen] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const board = getBoardById(selectedBoardId);
  const modeDescriptor = useMemo(() => getHostModeDescriptor(hostMode), [hostMode]);

  const compositionSummary = useMemo(() => {
    if (!board) return null;
    const wolfCount = board.composition.wolf.reduce((sum, s) => sum + s.count, 0);
    const goodCount = board.composition.good.reduce((sum, s) => sum + s.count, 0);
    const thirdCount = (board.composition.thirdParty ?? []).reduce((sum, s) => sum + s.count, 0);
    const allSlots = [
      ...board.composition.wolf,
      ...board.composition.good,
      ...(board.composition.thirdParty ?? []),
    ];
    return { wolfCount, goodCount, thirdCount, allSlots };
  }, [board]);

  const visibleRuleKeys = useMemo<Array<keyof RuleOverrides>>(() => {
    const coreKeys: Array<keyof RuleOverrides> = [
      'victoryMode',
      'enableSheriff',
      'badgeSwallowRule',
      'noSheriffDeadDirection',
      'sheriffUseDeadSideOnDeath',
    ];
    const boardKeys = board?.supportedRuleToggles ?? [];
    const merged: Array<keyof RuleOverrides> = [];
    for (const key of [...boardKeys, ...coreKeys]) {
      if (!merged.includes(key)) {
        merged.push(key);
      }
    }
    return merged;
  }, [board]);

  if (!board || !compositionSummary) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center text-sm text-slate-300">
        <p>尚未選擇板子，請先選擇欲主持的板子。</p>
        <button
          type="button"
          onClick={goToBoardSelect}
          className="mt-4 min-h-12 rounded-xl bg-amber-500 px-5 text-sm font-extrabold text-slate-950 hover:bg-amber-400"
        >
          前往選擇板子
        </button>
      </div>
    );
  }

  const hasAnyNickname = seats.some((s) => s.nickname.trim().length > 0);
  const isMultiDevice = hostMode.controlMode === 'multi_device';

  const handleStartGame = () => {
    if (hostMode.judgeMode === 'online_judge') {
      ttsEngine.unlockAudio();
      if (onlineJudgeSettings.ttsEnabled) {
        ttsEngine.startKeepAlive();
      }
    }
    const result = startGame();
    if (!result.ok) {
      setStartError(result.errors.join(' '));
    } else {
      setStartError(null);
    }
  };

  const renderRuleControl = (key: keyof RuleOverrides) => {
    const meta = RULE_TOGGLE_META[key];

    if (key === 'witchSelfSave') {
      return (
        <div key={key} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <div className="text-xs font-bold text-slate-100">{meta.label}</div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{meta.description}</p>
          <div className="mt-2.5 grid grid-cols-3 gap-1.5">
            {WITCH_SELF_SAVE_OPTIONS.map((opt) => {
              const active = ruleOverrides.witchSelfSave === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateRuleOverrides({ witchSelfSave: opt.value })}
                  className={`min-h-12 rounded-xl border px-2 text-xs font-bold transition ${
                    active
                      ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (key === 'victoryMode') {
      return (
        <div key={key} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <div className="text-xs font-bold text-slate-100">{meta.label}</div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{meta.description}</p>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {(
              [
                { value: 'slaughter_side', label: '屠邊（預設）' },
                { value: 'slaughter_all', label: '屠城' },
              ] as const
            ).map((opt) => {
              const active = ruleOverrides.victoryMode === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateRuleOverrides({ victoryMode: opt.value })}
                  className={`min-h-12 rounded-xl border px-3 text-xs font-bold transition ${
                    active
                      ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (key === 'badgeSwallowRule') {
      return (
        <div key={key} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <div className="text-xs font-bold text-slate-100">{meta.label}</div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{meta.description}</p>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {BADGE_SWALLOW_OPTIONS.map((opt) => {
              const active = ruleOverrides.badgeSwallowRule === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateRuleOverrides({ badgeSwallowRule: opt.value })}
                  className={`min-h-12 rounded-xl border px-3 text-xs font-bold transition ${
                    active
                      ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (key === 'noSheriffDeadDirection') {
      return (
        <div key={key} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <div className="text-xs font-bold text-slate-100">{meta.label}</div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{meta.description}</p>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {DIRECTION_OPTIONS.map((opt) => {
              const active = ruleOverrides.noSheriffDeadDirection === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateRuleOverrides({ noSheriffDeadDirection: opt.value })}
                  className={`min-h-12 rounded-xl border px-3 text-xs font-bold transition ${
                    active
                      ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    const boolVal = Boolean(ruleOverrides[key]);
    return (
      <button
        key={key}
        type="button"
        onClick={() => updateRuleOverrides({ [key]: !boolVal })}
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-left transition hover:border-slate-700"
      >
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-slate-100">{meta.label}</div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{meta.description}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${
            boolVal
              ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-200'
              : 'border-slate-700 bg-slate-800 text-slate-400'
          }`}
        >
          {boolVal ? '開啟' : '關閉'}
        </span>
      </button>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-2.5 overflow-hidden">
      {/* 1. 頂部固定板子摘要與規則抽屜入口 */}
      <section className="shrink-0 rounded-2xl border border-slate-800 bg-slate-900/95 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-extrabold text-slate-50">{board.name}</h1>
              <span className="shrink-0 rounded-lg bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-200">
                {seats.length} 人
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
              <span className="rounded-md border border-rose-500/35 bg-rose-950/60 px-2 py-0.5 text-rose-200">
                狼人 {compositionSummary.wolfCount}
              </span>
              <span className="rounded-md border border-emerald-500/35 bg-emerald-950/60 px-2 py-0.5 text-emerald-200">
                好人 {compositionSummary.goodCount}
              </span>
              {compositionSummary.thirdCount > 0 && (
                <span className="rounded-md border border-amber-500/35 bg-amber-950/60 px-2 py-0.5 text-amber-200">
                  第三方 {compositionSummary.thirdCount}
                </span>
              )}
              <span className="truncate text-slate-400">
                {compositionSummary.allSlots
                  .map((s) => `${getRoleById(s.roleId)?.name ?? s.roleId}×${s.count}`)
                  .join(' · ')}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={goToBoardSelect}
              className="min-h-12 rounded-xl border border-slate-700 bg-slate-950 px-2.5 text-xs font-bold text-slate-300 transition hover:bg-slate-800"
            >
              換板
            </button>
            {onOpenQA && (
              <button
                type="button"
                onClick={onOpenQA}
                className="min-h-12 rounded-xl border border-amber-400/50 bg-amber-500/15 px-2.5 text-xs font-bold text-amber-200 transition hover:bg-amber-500/25"
              >
                規則 / Q&amp;A
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. 大廳四分頁切換器（零外層滾輪） */}
      <nav
        aria-label="大廳設定分頁"
        className="grid shrink-0 grid-cols-4 gap-1.5 rounded-2xl border border-slate-800 bg-slate-900/80 p-1.5"
      >
        {(
          [
            { id: 'mode', label: '3D 模式', badge: `(${modeDescriptor.modeNumber})` },
            { id: 'rules', label: '房規微調', badge: '' },
            { id: 'seats', label: '座位清單', badge: `${seats.length}` },
            {
              id: 'audio',
              label: '白噪音',
              badge: ambientAudio.presetId === 'none' ? '' : 'ON',
            },
          ] as const
        ).map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-12 flex flex-col items-center justify-center rounded-xl px-1.5 text-xs font-extrabold transition ${
                active
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] font-bold ${
                    active ? 'text-slate-900/80' : 'text-amber-300/80'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 3. 中央分頁內容區（內部獨立捲動，絕不撐爆 100dvh） */}
      <section className="min-h-0 flex-1 overflow-y-auto pr-0.5">
        {activeTab === 'mode' && (
          <div className="space-y-3">
            {/* 快速開局 2 大常用模式 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-xs font-extrabold text-slate-300">快速開局模式</span>
                <span className="text-[11px] font-bold text-amber-300">
                  目前：模式 ({modeDescriptor.modeNumber})
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    updateHostMode({
                      judgeMode: 'physical_judge',
                      dealMode: 'physical_deal',
                      controlMode: 'central_control',
                    });
                    setStartError(null);
                  }}
                  className={`min-h-20 rounded-2xl border p-3.5 text-left transition active:scale-[0.98] ${
                    modeDescriptor.modeNumber === 1
                      ? 'border-amber-400 bg-amber-500/20 text-amber-50 ring-2 ring-amber-400/35'
                      : 'border-slate-800 bg-slate-900/90 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-black">① 實體法官面殺（預設）</span>
                    {modeDescriptor.modeNumber === 1 && (
                      <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-slate-950">
                        已選擇
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">
                    遊戲外法官口頭主持・實體卡牌發牌・首夜動態認領，開局最快。
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    ttsEngine.unlockAudio();
                    updateHostMode({
                      judgeMode: 'online_judge',
                      dealMode: 'online_deal',
                      controlMode: 'central_control',
                    });
                    setStartError(null);
                  }}
                  className={`min-h-20 rounded-2xl border p-3.5 text-left transition active:scale-[0.98] ${
                    modeDescriptor.modeNumber === 6
                      ? 'border-indigo-400 bg-indigo-500/20 text-indigo-50 ring-2 ring-indigo-400/35'
                      : 'border-slate-800 bg-slate-900/90 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-black">② 線上語音法官（全員下場）</span>
                    {modeDescriptor.modeNumber === 6 && (
                      <span className="rounded-full bg-indigo-400 px-2 py-0.5 text-[10px] font-black text-slate-950">
                        已選擇
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">
                    系統隨機洗牌傳閱・全黑防窺交接・自動語音播報，無需真人法官。
                  </p>
                </button>
              </div>
            </div>

            {/* 進階折疊面板：其餘 6 種混合模式與完整 2×2×2 矩陣 */}
            <details
              open={modeDescriptor.modeNumber !== 1 && modeDescriptor.modeNumber !== 6}
              className="group rounded-2xl border border-slate-800 bg-slate-900/75"
            >
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 px-3.5 py-2.5 text-xs font-extrabold text-slate-200 select-none hover:text-amber-200">
                <span>⚙️ 進階自訂主持模式（2×2×2 完整矩陣）</span>
                <span className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-0.5 text-[10px] font-bold text-slate-400 group-open:text-amber-300">
                  {modeDescriptor.modeNumber !== 1 && modeDescriptor.modeNumber !== 6
                    ? `自訂模式 (${modeDescriptor.modeNumber})`
                    : '展開 8 模式'}
                </span>
              </summary>

              <div className="space-y-2.5 border-t border-slate-800 p-3">
                {/* 維度一：法官模式 */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
                  <div className="text-xs font-bold text-slate-400">維度一 · 法官模式</div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {(
                      [
                        {
                          value: 'physical_judge' as JudgeMode,
                          title: '🎙️ 實體法官',
                          sub: '遊戲外法官口頭主持',
                        },
                        {
                          value: 'online_judge' as JudgeMode,
                          title: '🔊 線上法官',
                          sub: '全員下場・語音主持',
                        },
                      ] as const
                    ).map((opt) => {
                      const active = hostMode.judgeMode === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            if (opt.value === 'online_judge') {
                              ttsEngine.unlockAudio();
                            }
                            updateHostMode({ judgeMode: opt.value });
                            setStartError(null);
                          }}
                          className={`min-h-14 rounded-xl border p-2.5 text-left transition active:scale-[0.98] ${
                            active
                              ? 'border-amber-400 bg-amber-500/20 text-amber-100'
                              : 'border-slate-800 bg-slate-950/75 text-slate-300 hover:bg-slate-800/80'
                          }`}
                        >
                          <div className="text-xs font-extrabold">{opt.title}</div>
                          <div className="mt-0.5 text-[11px] text-slate-400">{opt.sub}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 維度二：發牌模式 */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
                  <div className="text-xs font-bold text-slate-400">維度二 · 發牌模式</div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {(
                      [
                        {
                          value: 'physical_deal' as DealMode,
                          title: '🃏 實體發牌',
                          sub: '首夜認領・未認領補平民',
                        },
                        {
                          value: 'online_deal' as DealMode,
                          title: '🎴 線上發牌',
                          sub: '系統隨機洗牌・傳閱看牌',
                        },
                      ] as const
                    ).map((opt) => {
                      const active = hostMode.dealMode === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            updateHostMode({ dealMode: opt.value });
                            setStartError(null);
                          }}
                          className={`min-h-14 rounded-xl border p-2.5 text-left transition active:scale-[0.98] ${
                            active
                              ? 'border-amber-400 bg-amber-500/20 text-amber-100'
                              : 'border-slate-800 bg-slate-950/75 text-slate-300 hover:bg-slate-800/80'
                          }`}
                        >
                          <div className="text-xs font-extrabold">{opt.title}</div>
                          <div className="mt-0.5 text-[11px] text-slate-400">{opt.sub}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 維度三：操作模式 */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
                  <div className="text-xs font-bold text-slate-400">維度三 · 操作模式</div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {(
                      [
                        {
                          value: 'central_control' as ControlMode,
                          title: '📱 中央操作',
                          sub: '單機裝置・立即可玩',
                        },
                        {
                          value: 'multi_device' as ControlMode,
                          title: '🌐 多點操作',
                          sub: '各手機入房（Milestone B）',
                        },
                      ] as const
                    ).map((opt) => {
                      const active = hostMode.controlMode === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            updateHostMode({ controlMode: opt.value });
                            setStartError(null);
                          }}
                          className={`min-h-14 rounded-xl border p-2.5 text-left transition active:scale-[0.98] ${
                            active
                              ? opt.value === 'multi_device'
                                ? 'border-sky-400 bg-sky-500/20 text-sky-100'
                                : 'border-amber-400 bg-amber-500/20 text-amber-100'
                              : 'border-slate-800 bg-slate-950/75 text-slate-300 hover:bg-slate-800/80'
                          }`}
                        >
                          <div className="text-xs font-extrabold">{opt.title}</div>
                          <div className="mt-0.5 text-[11px] text-slate-400">{opt.sub}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 即時模式說明卡片 */}
                <div
                  className={`rounded-xl border p-3 ${
                    modeDescriptor.availableInStandalone
                      ? 'border-emerald-500/35 bg-emerald-950/25'
                      : 'border-sky-500/40 bg-sky-950/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-slate-50">
                      模式 ({modeDescriptor.modeNumber}) · {modeDescriptor.shortTitle}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        modeDescriptor.availableInStandalone
                          ? 'bg-emerald-500/25 text-emerald-200'
                          : 'bg-sky-500/25 text-sky-200'
                      }`}
                    >
                      {modeDescriptor.availableInStandalone ? '單機可用' : 'Milestone B 預留'}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                    {modeDescriptor.description}
                  </p>
                </div>
              </div>
            </details>

            {hostMode.judgeMode === 'online_judge' && (
              <div className="space-y-2.5 rounded-2xl border border-indigo-500/35 bg-indigo-950/20 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-extrabold text-indigo-200">
                      🎙️ 線上法官語音與防窺緩衝設定
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      夜間自動語音播報並以全黑防窺畫面交接下一位角色
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateOnlineJudgeSettings({ ttsEnabled: !onlineJudgeSettings.ttsEnabled })
                    }
                    className={`min-h-10 shrink-0 rounded-xl border px-3 text-xs font-bold transition ${
                      onlineJudgeSettings.ttsEnabled
                        ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-200'
                        : 'border-slate-700 bg-slate-900 text-slate-400'
                    }`}
                  >
                    {onlineJudgeSettings.ttsEnabled ? '🔊 語音開' : '🔇 靜音'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-2.5">
                    <div className="text-[11px] font-bold text-slate-400">閉眼緩衝秒數</div>
                    <div className="mt-1.5 flex items-center justify-between gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          updateOnlineJudgeSettings({
                            stepBufferSeconds: onlineJudgeSettings.stepBufferSeconds - 1,
                          })
                        }
                        className="min-h-10 min-w-10 rounded-lg border border-slate-700 bg-slate-900 text-sm font-extrabold text-slate-200 hover:bg-slate-800"
                      >
                        −
                      </button>
                      <span className="text-sm font-extrabold tabular-nums text-amber-200">
                        {onlineJudgeSettings.stepBufferSeconds} 秒
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateOnlineJudgeSettings({
                            stepBufferSeconds: onlineJudgeSettings.stepBufferSeconds + 1,
                          })
                        }
                        className="min-h-10 min-w-10 rounded-lg border border-slate-700 bg-slate-900 text-sm font-extrabold text-slate-200 hover:bg-slate-800"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-2.5">
                    <div className="text-[11px] font-bold text-slate-400">語音播報語速</div>
                    <div className="mt-1.5 flex items-center justify-between gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          updateOnlineJudgeSettings({
                            ttsRate: onlineJudgeSettings.ttsRate - 0.1,
                          })
                        }
                        className="min-h-10 min-w-10 rounded-lg border border-slate-700 bg-slate-900 text-sm font-extrabold text-slate-200 hover:bg-slate-800"
                      >
                        −
                      </button>
                      <span className="text-sm font-extrabold tabular-nums text-indigo-200">
                        {onlineJudgeSettings.ttsRate.toFixed(1)}×
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateOnlineJudgeSettings({
                            ttsRate: onlineJudgeSettings.ttsRate + 0.1,
                          })
                        }
                        className="min-h-10 min-w-10 rounded-lg border border-slate-700 bg-slate-900 text-sm font-extrabold text-slate-200 hover:bg-slate-800"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-2.5">
            {board.compositionNote && (
              <div className="rounded-xl border border-amber-500/35 bg-amber-950/25 px-3 py-2 text-xs leading-relaxed text-amber-200">
                💡 {board.compositionNote}
              </div>
            )}
            {visibleRuleKeys.map((key) => renderRuleControl(key))}
          </div>
        )}

        {activeTab === 'seats' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-3">
              <div>
                <div className="text-xs font-bold text-slate-100">
                  座位與玩家暱稱（1 ～ {seats.length} 號）
                </div>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {hostMode.dealMode === 'physical_deal'
                    ? '實體發牌：開局無需預填身分，第一晚睜眼時動態認領。'
                    : '線上發牌：開局自動隨機洗牌並依序傳閱確認身分。'}
                </p>
              </div>
              <button
                type="button"
                disabled={!hasAnyNickname}
                onClick={() => setConfirmClearNicknamesOpen(true)}
                className={`min-h-12 shrink-0 rounded-xl border px-3 text-xs font-bold transition ${
                  hasAnyNickname
                    ? 'border-rose-500/40 bg-rose-950/40 text-rose-200 hover:bg-rose-900/50'
                    : 'cursor-not-allowed border-slate-800 bg-slate-950 text-slate-600'
                }`}
              >
                清空暱稱
              </button>
            </div>

            {board.presetPlayerCounts && board.presetPlayerCounts.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3">
                <div className="text-xs font-bold text-slate-300">選擇本局玩家人數</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {board.presetPlayerCounts.map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => {
                        setBoardPlayerCount(cnt);
                        setStartError(null);
                      }}
                      className={`min-h-12 min-w-14 rounded-xl border px-3 text-sm font-extrabold transition ${
                        seats.length === cnt
                          ? 'border-amber-400 bg-amber-500 text-slate-950'
                          : 'border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {cnt} 人
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(board.id === '12p-jack-the-ripper' || board.id === '12p-jack-the-ripper-2') && (() => {
              const maleCount = seats.filter((s) => s.gender === 'male').length;
              const femaleCount = seats.filter((s) => s.gender === 'female').length;
              const jackSecondSeat = seats.find((s) => s.secondRoleId === 'jack_the_ripper');
              return (
                <div className="rounded-2xl border border-rose-500/35 bg-rose-950/25 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-extrabold text-rose-200">
                        🔪 開膛手傑克性別{board.id === '12p-jack-the-ripper-2' ? '與第二身分' : ''}配置
                      </div>
                      <p className="mt-0.5 text-[11px] text-rose-200/80">
                        目前性別：男 {maleCount} 人 / 女 {femaleCount} 人（標準 6 男 6 女）
                        {board.id === '12p-jack-the-ripper-2'
                          ? ` ｜ 第二身分開膛手傑克：${jackSecondSeat ? `${jackSecondSeat.seatNumber} 號` : '尚未指定'}`
                          : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={randomizeJackSetup}
                      className="min-h-12 shrink-0 rounded-xl border border-rose-400/50 bg-rose-500/20 px-3 text-xs font-extrabold text-rose-100 hover:bg-rose-500/30"
                    >
                      🎲 一鍵隨機分配
                    </button>
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {seats.map((seat) => {
                const role = getRoleById(seat.roleId);
                const isJackBoard =
                  board.id === '12p-jack-the-ripper' || board.id === '12p-jack-the-ripper-2';
                const isJackSecondIdBoard = board.id === '12p-jack-the-ripper-2';
                return (
                  <div
                    key={seat.seatNumber}
                    className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-2"
                  >
                    <div className="flex h-12 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-sm font-extrabold text-amber-300">
                      {seat.seatNumber}
                    </div>
                    <input
                      type="text"
                      value={seat.nickname}
                      onChange={(e) => setSeatNickname(seat.seatNumber, e.target.value)}
                      placeholder={`${seat.seatNumber} 號玩家`}
                      aria-label={`${seat.seatNumber} 號玩家暱稱`}
                      className="min-h-12 min-w-0 flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                    {role && (
                      <span
                        className={`shrink-0 rounded-lg border px-2 py-1 text-[11px] font-bold ${getRoleBadgeClasses(role.id)}`}
                      >
                        {role.name}
                      </span>
                    )}
                    {isJackBoard && (
                      <div className="flex w-full items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setSeatGender(seat.seatNumber, 'male')}
                          className={`min-h-10 flex-1 rounded-lg border text-xs font-bold transition ${
                            seat.gender === 'male'
                              ? 'border-sky-400 bg-sky-500/25 text-sky-100'
                              : 'border-slate-700 bg-slate-950 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          ♂ 男
                        </button>
                        <button
                          type="button"
                          onClick={() => setSeatGender(seat.seatNumber, 'female')}
                          className={`min-h-10 flex-1 rounded-lg border text-xs font-bold transition ${
                            seat.gender === 'female'
                              ? 'border-pink-400 bg-pink-500/25 text-pink-100'
                              : 'border-slate-700 bg-slate-950 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          ♀ 女
                        </button>
                        {isJackSecondIdBoard && (
                          <button
                            type="button"
                            onClick={() =>
                              setSeatSecondRole(
                                seat.seatNumber,
                                seat.secondRoleId === 'jack_the_ripper'
                                  ? 'detective'
                                  : 'jack_the_ripper',
                              )
                            }
                            className={`min-h-10 shrink-0 rounded-lg border px-2.5 text-xs font-bold transition ${
                              seat.secondRoleId === 'jack_the_ripper'
                                ? 'border-rose-400 bg-rose-500/25 text-rose-100'
                                : 'border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            {seat.secondRoleId === 'jack_the_ripper' ? '🔪 開膛手傑克' : '🔍 偵探'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'audio' && <AmbientAudioPlayer />}
      </section>

      {/* 4. 底部固定開局操作區 */}
      <footer className="shrink-0 space-y-2 border-t border-slate-800 pt-2.5">
        {startError && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-xs text-rose-200">
            {startError}
          </div>
        )}

        {isMultiDevice ? (
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1 rounded-xl border border-sky-500/40 bg-sky-950/35 px-3 py-2 text-xs text-sky-200">
              🌐 多點連線大廳將於 Milestone B 開放，單機模式請使用中央操作。
            </div>
            <button
              type="button"
              onClick={() => {
                updateHostMode({ controlMode: 'central_control' });
                setStartError(null);
              }}
              className="min-h-12 shrink-0 rounded-xl bg-sky-500 px-3.5 text-xs font-extrabold text-slate-950 transition hover:bg-sky-400 active:scale-[0.98]"
            >
              切回中央操作
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStartGame}
            className="min-h-12 w-full rounded-xl bg-emerald-500 px-5 py-3 text-base font-extrabold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-[0.99]"
          >
            {hostMode.dealMode === 'physical_deal'
              ? '🌙 進入第一夜（實體發牌・首夜動態認領）'
              : '🎴 隨機發牌並開始傳閱確認身分'}
          </button>
        )}
      </footer>

      <ConfirmModal
        open={confirmClearNicknamesOpen}
        title="確定要清空所有座位暱稱？"
        description="將清除目前與已保存的所有玩家暱稱，座位將恢復顯示「N 號玩家」。"
        confirmLabel="確定清空暱稱"
        tone="warning"
        onConfirm={() => {
          clearSavedNicknames();
          setConfirmClearNicknamesOpen(false);
        }}
        onCancel={() => setConfirmClearNicknamesOpen(false)}
      />
    </div>
  );
}
