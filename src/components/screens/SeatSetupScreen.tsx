import { useMemo, useState } from 'react';
import { ttsEngine } from '../../audio/ttsEngine';
import { getBoardById } from '../../data/boards';
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
import { SlideDrawer } from '../common/SlideDrawer';
import {
  RULE_TOGGLE_META,
  formatBoardCompositionShort,
  formatSeatNum,
  splitSeatsIntoSymmetricColumns,
} from '../common/displayHelpers';

type SettingsTab = 'mode' | 'rules' | 'special' | 'audio';

interface SeatSetupScreenProps {
  onOpenQA?: () => void;
}

const WITCH_SELF_SAVE_OPTIONS: Array<{ value: WitchSelfSaveRule; label: string }> = [
  { value: 'first_night_only', label: '首夜自救' },
  { value: 'never', label: '不可自救' },
  { value: 'always', label: '全程自救' },
];

const BADGE_SWALLOW_OPTIONS: Array<{ value: BadgeSwallowRule; label: string }> = [
  { value: 'single_explode', label: '單爆吞徽' },
  { value: 'double_explode', label: '雙爆吞徽' },
];

const DIRECTION_OPTIONS: Array<{ value: SpeakingDirection; label: string }> = [
  { value: 'clockwise', label: '順時針' },
  { value: 'counterclockwise', label: '逆時針' },
];

export function SeatSetupScreen({ onOpenQA }: SeatSetupScreenProps) {
  const selectedBoardId = useGameStore((s) => s.selectedBoardId);
  const seats = useGameStore((s) => s.seats);
  const hostMode = useGameStore((s) => s.hostMode);
  const onlineJudgeSettings = useGameStore((s) => s.onlineJudgeSettings);
  const ruleOverrides = useGameStore((s) => s.ruleOverrides);

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

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('mode');
  const [confirmClearNicknamesOpen, setConfirmClearNicknamesOpen] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const board = getBoardById(selectedBoardId);
  const modeDescriptor = useMemo(() => getHostModeDescriptor(hostMode), [hostMode]);

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

  if (!board) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="text-[14px] text-secondary">尚未選擇板子</p>
        <button
          type="button"
          onClick={goToBoardSelect}
          className="mt-4 min-h-12 rounded-md bg-sheriff px-5 text-[14px] font-semibold text-inverse hover:opacity-90"
        >
          選擇板子
        </button>
      </div>
    );
  }

  const hasAnyNickname = seats.some((s) => s.nickname.trim().length > 0);
  const isMultiDevice = hostMode.controlMode === 'multi_device';
  const isJackBoard =
    board.id === '12p-jack-the-ripper' || board.id === '12p-jack-the-ripper-2';
  const isJackSecondIdBoard = board.id === '12p-jack-the-ripper-2';
  const { left: leftSeats, right: rightSeats } = splitSeatsIntoSymmetricColumns(seats);

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
        <div key={key} className="space-y-1.5 py-2.5">
          <div className="text-[14px] font-medium text-primary">{meta.label}</div>
          <div className="grid grid-cols-3 gap-1.5">
            {WITCH_SELF_SAVE_OPTIONS.map((opt) => {
              const active = ruleOverrides.witchSelfSave === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateRuleOverrides({ witchSelfSave: opt.value })}
                  className={`min-h-11 rounded-md px-2 text-[12px] font-semibold transition ${
                    active
                      ? 'border-selected-sheriff bg-sheriff-tint text-primary'
                      : 'border border-subtle bg-canvas text-secondary hover:border-strong'
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
        <div key={key} className="space-y-1.5 py-2.5">
          <div className="text-[14px] font-medium text-primary">{meta.label}</div>
          <div className="grid grid-cols-2 gap-1.5">
            {(
              [
                { value: 'slaughter_side', label: '屠邊' },
                { value: 'slaughter_all', label: '屠城' },
              ] as const
            ).map((opt) => {
              const active = ruleOverrides.victoryMode === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateRuleOverrides({ victoryMode: opt.value })}
                  className={`min-h-11 rounded-md px-3 text-[12px] font-semibold transition ${
                    active
                      ? 'border-selected-sheriff bg-sheriff-tint text-primary'
                      : 'border border-subtle bg-canvas text-secondary hover:border-strong'
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
        <div key={key} className="space-y-1.5 py-2.5">
          <div className="text-[14px] font-medium text-primary">{meta.label}</div>
          <div className="grid grid-cols-2 gap-1.5">
            {BADGE_SWALLOW_OPTIONS.map((opt) => {
              const active = ruleOverrides.badgeSwallowRule === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateRuleOverrides({ badgeSwallowRule: opt.value })}
                  className={`min-h-11 rounded-md px-3 text-[12px] font-semibold transition ${
                    active
                      ? 'border-selected-sheriff bg-sheriff-tint text-primary'
                      : 'border border-subtle bg-canvas text-secondary hover:border-strong'
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
        <div key={key} className="space-y-1.5 py-2.5">
          <div className="text-[14px] font-medium text-primary">{meta.label}</div>
          <div className="grid grid-cols-2 gap-1.5">
            {DIRECTION_OPTIONS.map((opt) => {
              const active = ruleOverrides.noSheriffDeadDirection === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateRuleOverrides({ noSheriffDeadDirection: opt.value })}
                  className={`min-h-11 rounded-md px-3 text-[12px] font-semibold transition ${
                    active
                      ? 'border-selected-sheriff bg-sheriff-tint text-primary'
                      : 'border border-subtle bg-canvas text-secondary hover:border-strong'
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

    const boolValue = Boolean(ruleOverrides[key]);
    return (
      <button
        key={key}
        type="button"
        onClick={() => updateRuleOverrides({ [key]: !boolValue })}
        className="flex min-h-12 w-full items-center justify-between gap-3 py-2.5 text-left"
      >
        <span className="text-[14px] font-medium text-primary">{meta.label}</span>
        <span
          className={`shrink-0 text-[12px] font-semibold ${
            boolValue ? 'text-good' : 'text-muted'
          }`}
        >
          {boolValue ? '開啟' : '關閉'}
        </span>
      </button>
    );
  };

  const renderSeatRow = (seat: (typeof seats)[number]) => (
    <div
      key={seat.seatNumber}
      className="flex min-h-12 items-center gap-2 rounded-md border border-subtle bg-surface px-2"
    >
      <span className="w-6 shrink-0 text-center text-[14px] font-semibold tabular-nums text-sheriff">
        {formatSeatNum(seat.seatNumber)}
      </span>
      <input
        type="text"
        value={seat.nickname}
        onChange={(e) => setSeatNickname(seat.seatNumber, e.target.value)}
        placeholder={`${seat.seatNumber}號`}
        aria-label={`${seat.seatNumber} 號玩家暱稱`}
        className="min-h-11 min-w-0 flex-1 bg-transparent text-[14px] text-primary placeholder:text-muted focus:outline-none"
      />
    </div>
  );

  const settingsTabs: Array<{ id: SettingsTab; label: string }> = [
    { id: 'mode', label: '主持模式' },
    { id: 'rules', label: '房規' },
    ...(isJackBoard ? [{ id: 'special' as const, label: '特殊配置' }] : []),
    { id: 'audio', label: '音效' },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
      {/* 1. 頂部板子摘要列 */}
      <section className="shrink-0 space-y-2 border-b border-subtle pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="truncate text-[18px] font-semibold leading-6 text-primary">
              {board.name}
            </h1>
            <div className="mt-0.5 flex items-center gap-2 text-[12px] tabular-nums text-secondary">
              <span>{seats.length}人</span>
              <span>·</span>
              <span>{formatBoardCompositionShort(board)}</span>
              <span>·</span>
              <span className="text-sheriff">
                {hostMode.dealMode === 'physical_deal' ? '實體發牌' : '線上發牌'}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={goToBoardSelect}
              className="min-h-11 rounded-md border border-subtle bg-surface px-3 text-[12px] font-medium text-secondary hover:border-strong hover:text-primary"
            >
              換板
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="min-h-11 rounded-md border border-subtle bg-surface px-3 text-[12px] font-semibold text-primary hover:border-strong"
            >
              開局設定
            </button>
          </div>
        </div>

        {board.presetPlayerCounts && board.presetPlayerCounts.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto">
            {board.presetPlayerCounts.map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => {
                  setBoardPlayerCount(cnt);
                  setStartError(null);
                }}
                className={`min-h-10 shrink-0 rounded-md px-3 text-[12px] font-semibold tabular-nums transition ${
                  seats.length === cnt
                    ? 'bg-sheriff text-inverse'
                    : 'border border-subtle bg-surface text-secondary hover:border-strong'
                }`}
              >
                {cnt}人
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 2. 中央雙欄座位確認區 */}
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="mb-1.5 flex shrink-0 items-center justify-between text-[12px] text-secondary">
          <span className="tabular-nums">座位表（01–{formatSeatNum(seats.length)}）</span>
          <div className="flex items-center gap-2">
            {isJackBoard && (
              <button
                type="button"
                onClick={() => {
                  setSettingsTab('special');
                  setSettingsOpen(true);
                }}
                className="text-[12px] font-semibold text-wolf hover:underline"
              >
                傑克性別／第二身分
              </button>
            )}
            {hasAnyNickname && (
              <button
                type="button"
                onClick={() => setConfirmClearNicknamesOpen(true)}
                className="text-[12px] font-medium text-muted hover:text-wolf"
              >
                清空暱稱
              </button>
            )}
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-1.5 overflow-y-auto pr-0.5">
          <div className="flex flex-col gap-1.5">{leftSeats.map(renderSeatRow)}</div>
          <div className="flex flex-col gap-1.5">{rightSeats.map(renderSeatRow)}</div>
        </div>
      </section>

      {/* 3. 底部單一主按鈕區 */}
      <footer className="shrink-0 space-y-2 border-t border-subtle pt-2">
        {startError && (
          <div className="border-l-2 border-wolf bg-wolf-tint px-3 py-1.5 text-[12px] text-wolf">
            {startError}
          </div>
        )}

        <div className="flex items-center gap-2">
          {onOpenQA && (
            <button
              type="button"
              onClick={onOpenQA}
              className="min-h-12 shrink-0 rounded-md border border-subtle bg-surface px-3.5 text-[14px] font-medium text-secondary hover:border-strong hover:text-primary"
            >
              規則
            </button>
          )}

          {isMultiDevice ? (
            <button
              type="button"
              onClick={() => {
                updateHostMode({ controlMode: 'central_control' });
                setStartError(null);
              }}
              className="min-h-12 flex-1 rounded-md bg-sheriff px-4 text-[14px] font-semibold text-inverse hover:opacity-90"
            >
              切回單機中央操作
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartGame}
              className="min-h-12 flex-1 rounded-md bg-good px-4 text-[14px] font-semibold text-inverse transition hover:opacity-90"
            >
              {hostMode.dealMode === 'physical_deal' ? '進入第一夜' : '隨機發牌並傳閱'}
            </button>
          )}
        </div>
      </footer>

      {/* 開局設定抽屜（整合主持矩陣、房規、傑克特殊配置、白噪音） */}
      <SlideDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="開局設定"
        placement="bottom"
      >
        <div className="space-y-3">
          <div
            className="grid gap-1 rounded-md border border-subtle bg-canvas p-1"
            style={{ gridTemplateColumns: `repeat(${settingsTabs.length}, minmax(0, 1fr))` }}
          >
            {settingsTabs.map((tab) => {
              const active = settingsTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSettingsTab(tab.id)}
                  className={`min-h-11 rounded-md px-2 text-[12px] font-semibold transition ${
                    active ? 'bg-elevated text-primary' : 'text-secondary hover:text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {settingsTab === 'mode' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="text-[12px] font-semibold text-secondary">法官模式</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { value: 'physical_judge' as JudgeMode, label: '實體法官' },
                      { value: 'online_judge' as JudgeMode, label: '線上語音法官' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        updateHostMode({ judgeMode: opt.value });
                        setStartError(null);
                      }}
                      className={`min-h-12 rounded-md px-3 text-[14px] font-semibold transition ${
                        hostMode.judgeMode === opt.value
                          ? 'border-selected-sheriff bg-sheriff-tint text-primary'
                          : 'border border-subtle bg-canvas text-secondary hover:border-strong'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[12px] font-semibold text-secondary">發牌模式</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { value: 'physical_deal' as DealMode, label: '實體發牌' },
                      { value: 'online_deal' as DealMode, label: '線上發牌' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        updateHostMode({ dealMode: opt.value });
                        setStartError(null);
                      }}
                      className={`min-h-12 rounded-md px-3 text-[14px] font-semibold transition ${
                        hostMode.dealMode === opt.value
                          ? 'border-selected-sheriff bg-sheriff-tint text-primary'
                          : 'border border-subtle bg-canvas text-secondary hover:border-strong'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[12px] font-semibold text-secondary">操作模式</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { value: 'central_control' as ControlMode, label: '中央單機' },
                      { value: 'multi_device' as ControlMode, label: '多點連線' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        updateHostMode({ controlMode: opt.value });
                        setStartError(null);
                      }}
                      className={`min-h-12 rounded-md px-3 text-[14px] font-semibold transition ${
                        hostMode.controlMode === opt.value
                          ? 'border-selected-sheriff bg-sheriff-tint text-primary'
                          : 'border border-subtle bg-canvas text-secondary hover:border-strong'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-l-2 border-subtle pl-3 text-[12px] text-secondary">
                模式 {modeDescriptor.modeNumber} · {modeDescriptor.shortTitle}
              </div>

              {hostMode.judgeMode === 'online_judge' && (
                <div className="space-y-2.5 border-t border-subtle pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-medium text-primary">語音播報</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateOnlineJudgeSettings({ ttsEnabled: !onlineJudgeSettings.ttsEnabled })
                      }
                      className={`min-h-11 rounded-md border px-3 text-[12px] font-semibold ${
                        onlineJudgeSettings.ttsEnabled
                          ? 'border-good-border bg-good-tint text-good'
                          : 'border-subtle bg-canvas text-muted'
                      }`}
                    >
                      {onlineJudgeSettings.ttsEnabled ? '開啟' : '靜音'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between rounded-md border border-subtle bg-canvas px-2.5 py-2">
                      <span className="text-[12px] text-secondary">緩衝</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            updateOnlineJudgeSettings({
                              stepBufferSeconds: onlineJudgeSettings.stepBufferSeconds - 1,
                            })
                          }
                          className="min-h-9 min-w-9 rounded-md border border-subtle bg-surface text-[14px] font-semibold text-primary"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-[14px] font-semibold tabular-nums text-sheriff">
                          {onlineJudgeSettings.stepBufferSeconds}s
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateOnlineJudgeSettings({
                              stepBufferSeconds: onlineJudgeSettings.stepBufferSeconds + 1,
                            })
                          }
                          className="min-h-9 min-w-9 rounded-md border border-subtle bg-surface text-[14px] font-semibold text-primary"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-md border border-subtle bg-canvas px-2.5 py-2">
                      <span className="text-[12px] text-secondary">語速</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            updateOnlineJudgeSettings({
                              ttsRate: onlineJudgeSettings.ttsRate - 0.1,
                            })
                          }
                          className="min-h-9 min-w-9 rounded-md border border-subtle bg-surface text-[14px] font-semibold text-primary"
                        >
                          −
                        </button>
                        <span className="w-9 text-center text-[14px] font-semibold tabular-nums text-primary">
                          {onlineJudgeSettings.ttsRate.toFixed(1)}×
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateOnlineJudgeSettings({
                              ttsRate: onlineJudgeSettings.ttsRate + 0.1,
                            })
                          }
                          className="min-h-9 min-w-9 rounded-md border border-subtle bg-surface text-[14px] font-semibold text-primary"
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

          {settingsTab === 'rules' && (
            <div className="divide-y divide-subtle">
              {visibleRuleKeys.map((key) => renderRuleControl(key))}
            </div>
          )}

          {settingsTab === 'special' && isJackBoard && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[12px] tabular-nums text-secondary">
                  男 {seats.filter((s) => s.gender === 'male').length} / 女{' '}
                  {seats.filter((s) => s.gender === 'female').length}
                  {isJackSecondIdBoard &&
                    ` · 傑克 ${seats.find((s) => s.secondRoleId === 'jack_the_ripper')?.seatNumber ?? '未定'}號`}
                </div>
                <button
                  type="button"
                  onClick={randomizeJackSetup}
                  className="min-h-11 rounded-md border border-wolf-border bg-wolf-tint px-3 text-[12px] font-semibold text-wolf"
                >
                  隨機分配
                </button>
              </div>

              <div className="divide-y divide-subtle">
                {seats.map((seat) => (
                  <div key={seat.seatNumber} className="flex items-center justify-between gap-2 py-2">
                    <span className="w-16 shrink-0 text-[14px] font-semibold tabular-nums text-primary">
                      {formatSeatNum(seat.seatNumber)} 號
                    </span>
                    <div className="flex flex-1 items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSeatGender(seat.seatNumber, 'male')}
                        className={`min-h-10 min-w-12 rounded-md text-[12px] font-semibold ${
                          seat.gender === 'male'
                            ? 'border-selected-good bg-good-tint text-good'
                            : 'border border-subtle bg-canvas text-muted'
                        }`}
                      >
                        男
                      </button>
                      <button
                        type="button"
                        onClick={() => setSeatGender(seat.seatNumber, 'female')}
                        className={`min-h-10 min-w-12 rounded-md text-[12px] font-semibold ${
                          seat.gender === 'female'
                            ? 'border-selected-third bg-third-tint text-third'
                            : 'border border-subtle bg-canvas text-muted'
                        }`}
                      >
                        女
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
                          className={`min-h-10 rounded-md px-2.5 text-[12px] font-semibold ${
                            seat.secondRoleId === 'jack_the_ripper'
                              ? 'border-selected-wolf bg-wolf-tint text-wolf'
                              : 'border border-subtle bg-canvas text-secondary'
                          }`}
                        >
                          {seat.secondRoleId === 'jack_the_ripper' ? '開膛手' : '偵探'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {settingsTab === 'audio' && <AmbientAudioPlayer />}
        </div>
      </SlideDrawer>

      <ConfirmModal
        open={confirmClearNicknamesOpen}
        title="清空所有暱稱"
        description="將清除已儲存的玩家暱稱。"
        confirmLabel="確認清空"
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
