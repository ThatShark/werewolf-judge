import { useMemo, useState } from 'react';
import { ttsEngine } from '../../audio/ttsEngine';
import { getBoardById } from '../../data/boards';
import { getBoardRoleIdSet, getHostModeDescriptor } from '../../logic';
import type { BadgeSwallowRule, WitchSelfSaveRule } from '../../logic/types';
import { useGameStore } from '../../store/gameStore';
import { AmbientAudioPlayer } from '../common/AmbientAudioPlayer';
import { ConfirmModal } from '../common/ConfirmModal';
import { SlideDrawer } from '../common/SlideDrawer';
import {
  formatBoardRoleList,
  formatSeatNum,
  splitSeatsIntoSymmetricColumns,
} from '../common/displayHelpers';

type SettingsTab = 'rules' | 'special' | 'audio' | 'mode';

interface SeatSetupScreenProps {
  onOpenQA?: () => void;
}

const WITCH_SELF_SAVE_OPTIONS: Array<{ value: WitchSelfSaveRule; label: string }> = [
  { value: 'never', label: '不能' },
  { value: 'first_night_only', label: '僅首晚能' },
  { value: 'always', label: '能' },
];

const BADGE_SWALLOW_OPTIONS: Array<{ value: BadgeSwallowRule; label: string }> = [
  { value: 'double_explode', label: '雙爆吞警徽' },
  { value: 'single_explode', label: '單爆吞警徽' },
];

export function SeatSetupScreen({ onOpenQA }: SeatSetupScreenProps) {
  const selectedBoardId = useGameStore((s) => s.selectedBoardId);
  const seats = useGameStore((s) => s.seats);
  const hostMode = useGameStore((s) => s.hostMode);
  const onlineJudgeSettings = useGameStore((s) => s.onlineJudgeSettings);
  const ruleOverrides = useGameStore((s) => s.ruleOverrides);

  const goToHostSetup = useGameStore((s) => s.goToHostSetup);
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
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('rules');
  const [confirmClearNicknamesOpen, setConfirmClearNicknamesOpen] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [isTtsPreviewing, setIsTtsPreviewing] = useState(false);

  const board = getBoardById(selectedBoardId);
  const modeDescriptor = useMemo(() => getHostModeDescriptor(hostMode), [hostMode]);

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

  const boardRoleIds = useMemo(() => getBoardRoleIdSet(board), [board]);
  const hasWitchRole = boardRoleIds.has('witch') || boardRoleIds.has('awakened_witch');
  const hasMechWolfRole = boardRoleIds.has('mech_wolf');
  const hasBlackMarketMerchant = boardRoleIds.has('black_market_merchant');
  const hasMiracleMerchant = boardRoleIds.has('miracle_merchant');
  const hasSuperBlackMarketMerchant = boardRoleIds.has('super_black_market_merchant');
  const hasAnyMerchant =
    hasBlackMarketMerchant || hasMiracleMerchant || hasSuperBlackMarketMerchant;

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

  const handleToggleTtsPreview = () => {
    if (isTtsPreviewing) {
      ttsEngine.cancel();
      setIsTtsPreviewing(false);
      return;
    }
    setIsTtsPreviewing(true);
    ttsEngine.previewShort(
      {
        enabled: true,
        rate: onlineJudgeSettings.ttsRate,
        onEnd: () => setIsTtsPreviewing(false),
      },
      3000,
    );
  };

  const luckyCfg = ruleOverrides.luckyFirstNightSkills;

  const toggleLuckySkill = (
    merchant: 'blackMarket' | 'miracle' | 'superBlackMarket',
    skill: 'seer_check' | 'witch_poison' | 'hunter_gun' | 'guard_shield',
  ) => {
    if (merchant === 'blackMarket' && skill !== 'guard_shield') {
      updateRuleOverrides({
        luckyFirstNightSkills: {
          ...luckyCfg,
          blackMarket: { ...luckyCfg.blackMarket, [skill]: !luckyCfg.blackMarket[skill] },
        },
      });
    } else if (merchant === 'miracle' && skill !== 'hunter_gun') {
      updateRuleOverrides({
        luckyFirstNightSkills: {
          ...luckyCfg,
          miracle: { ...luckyCfg.miracle, [skill]: !luckyCfg.miracle[skill] },
        },
      });
    } else if (merchant === 'superBlackMarket' && skill !== 'guard_shield') {
      updateRuleOverrides({
        luckyFirstNightSkills: {
          ...luckyCfg,
          superBlackMarket: {
            ...luckyCfg.superBlackMarket,
            [skill]: !luckyCfg.superBlackMarket[skill],
          },
        },
      });
    }
  };

  const renderSeatRow = (seat: (typeof seats)[number]) => (
    <div
      key={seat.seatNumber}
      className="flex h-12 items-center gap-2 rounded-md border border-subtle bg-surface px-2"
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
    { id: 'rules', label: '細節設定' },
    ...(isJackBoard ? [{ id: 'special' as const, label: '特殊配置' }] : []),
    { id: 'audio', label: '音效' },
    { id: 'mode', label: '主持模式' },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
      {/* 1. 頂部板子摘要列 */}
      <section className="shrink-0 space-y-2 border-b border-subtle pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[18px] font-semibold leading-6 text-primary">
              {board.name}
            </h1>
            <div className="mt-0.5 line-clamp-2 text-[12px] leading-4 text-secondary">
              <span className="font-semibold tabular-nums text-primary">{seats.length}人</span>
              <span className="mx-1.5 text-muted">·</span>
              <span>{formatBoardRoleList(board)}</span>
            </div>
            <div className="mt-0.5 text-[11px] text-sheriff">{modeDescriptor.shortTitle}</div>
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
              onClick={() => {
                setSettingsTab('rules');
                setSettingsOpen(true);
              }}
              className="min-h-11 rounded-md border border-subtle bg-surface px-3 text-[12px] font-semibold text-primary hover:border-strong"
            >
              細節設定
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

      {/* 房間內細節設定抽屜（6 項房規、傑克特殊配置、音效、主持模式摘要） */}
      <SlideDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="房間內細節設定"
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

          {settingsTab === 'rules' && (
            <div className="divide-y divide-subtle">
              {/* 永遠顯示 1：是否有警長 */}
              <div className="space-y-1.5 py-2.5">
                <div className="text-[14px] font-medium text-primary">是否有警長</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { value: true, label: '有' },
                      { value: false, label: '沒有' },
                    ] as const
                  ).map((opt) => {
                    const active = ruleOverrides.enableSheriff === opt.value;
                    return (
                      <button
                        key={String(opt.value)}
                        type="button"
                        onClick={() => updateRuleOverrides({ enableSheriff: opt.value })}
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

              {/* 永遠顯示 2：吞警徽規則 */}
              {ruleOverrides.enableSheriff && (
                <div className="space-y-1.5 py-2.5">
                  <div className="text-[14px] font-medium text-primary">吞警徽規則</div>
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
              )}

              {/* 警長投票加權（多0.5票 / 多1票） */}
              {ruleOverrides.enableSheriff && (
                <div className="space-y-1.5 py-2.5">
                  <div className="text-[14px] font-medium text-primary">警長投票加權</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(
                      [
                        { value: 1.5, label: '多0.5票（1.5票）' },
                        { value: 2, label: '多1票（2票）' },
                      ] as const
                    ).map((opt) => {
                      const active = (ruleOverrides.sheriffVoteWeight ?? 1.5) === opt.value;
                      return (
                        <button
                          key={String(opt.value)}
                          type="button"
                          onClick={() => updateRuleOverrides({ sheriffVoteWeight: opt.value })}
                          className={`min-h-11 rounded-md px-2 text-[12px] font-semibold tabular-nums transition ${
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
              )}

              {/* 永遠顯示 3：勝利條件 */}
              <div className="space-y-1.5 py-2.5">
                <div className="text-[14px] font-medium text-primary">勝利條件</div>
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

              {/* 永遠顯示 4：警長安排發言規則 */}
              {ruleOverrides.enableSheriff && (
                <div className="space-y-1.5 py-2.5">
                  <div className="text-[14px] font-medium text-primary">警長安排發言規則</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(
                      [
                        { value: false, label: '無論如何警左／警右' },
                        { value: true, label: '有死訊時死左／死右' },
                      ] as const
                    ).map((opt) => {
                      const active = Boolean(ruleOverrides.sheriffUseDeadSideOnDeath) === opt.value;
                      return (
                        <button
                          key={String(opt.value)}
                          type="button"
                          onClick={() =>
                            updateRuleOverrides({ sheriffUseDeadSideOnDeath: opt.value })
                          }
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
              )}

              {/* 條件顯示：僅含女巫／覺醒女巫時顯示 */}
              {hasWitchRole && (
                <div className="space-y-1.5 py-2.5">
                  <div className="text-[14px] font-medium text-primary">女巫可否自救</div>
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
              )}

              {/* 條件顯示：僅含機械狼時顯示 */}
              {hasMechWolfRole && (
                <div className="space-y-1.5 py-2.5">
                  <div className="text-[14px] font-medium text-primary">
                    機械狼是否第一晚強制學習
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(
                      [
                        { value: true, label: '是' },
                        { value: false, label: '否' },
                      ] as const
                    ).map((opt) => {
                      const active = ruleOverrides.mechWolfForceLearnNight1 === opt.value;
                      return (
                        <button
                          key={String(opt.value)}
                          type="button"
                          onClick={() =>
                            updateRuleOverrides({ mechWolfForceLearnNight1: opt.value })
                          }
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
              )}

              {/* 條件顯示：僅含黑市／奇蹟／超級黑市商人時顯示對應勾選框 */}
              {hasAnyMerchant && (
                <div className="space-y-2.5 py-2.5">
                  <div className="text-[14px] font-medium text-primary">
                    幸運兒第一晚是否就能使用技能
                  </div>

                  {hasBlackMarketMerchant && (
                    <div className="space-y-1.5 rounded-md border border-subtle bg-canvas p-2.5">
                      <div className="text-[12px] font-semibold text-secondary">黑市商人</div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(
                          [
                            { key: 'seer_check', label: '查驗' },
                            { key: 'witch_poison', label: '毒' },
                            { key: 'hunter_gun', label: '槍' },
                          ] as const
                        ).map((item) => {
                          const checked = luckyCfg.blackMarket[item.key];
                          return (
                            <label
                              key={item.key}
                              className={`flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-md border px-2 text-[12px] font-semibold transition ${
                                checked
                                  ? 'border-selected-sheriff bg-sheriff-tint text-primary'
                                  : 'border-subtle bg-surface text-secondary'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleLuckySkill('blackMarket', item.key)}
                                className="h-4 w-4 accent-sheriff"
                              />
                              <span>{item.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {hasMiracleMerchant && (
                    <div className="space-y-1.5 rounded-md border border-subtle bg-canvas p-2.5">
                      <div className="text-[12px] font-semibold text-secondary">奇蹟商人</div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(
                          [
                            { key: 'seer_check', label: '查驗' },
                            { key: 'witch_poison', label: '毒' },
                            { key: 'guard_shield', label: '盾' },
                          ] as const
                        ).map((item) => {
                          const checked = luckyCfg.miracle[item.key];
                          return (
                            <label
                              key={item.key}
                              className={`flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-md border px-2 text-[12px] font-semibold transition ${
                                checked
                                  ? 'border-selected-sheriff bg-sheriff-tint text-primary'
                                  : 'border-subtle bg-surface text-secondary'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleLuckySkill('miracle', item.key)}
                                className="h-4 w-4 accent-sheriff"
                              />
                              <span>{item.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {hasSuperBlackMarketMerchant && (
                    <div className="space-y-1.5 rounded-md border border-subtle bg-canvas p-2.5">
                      <div className="text-[12px] font-semibold text-secondary">超級黑市商人</div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(
                          [
                            { key: 'seer_check', label: '查驗' },
                            { key: 'witch_poison', label: '毒' },
                            { key: 'hunter_gun', label: '槍' },
                          ] as const
                        ).map((item) => {
                          const checked = luckyCfg.superBlackMarket[item.key];
                          return (
                            <label
                              key={item.key}
                              className={`flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-md border px-2 text-[12px] font-semibold transition ${
                                checked
                                  ? 'border-selected-sheriff bg-sheriff-tint text-primary'
                                  : 'border-subtle bg-surface text-secondary'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleLuckySkill('superBlackMarket', item.key)}
                                className="h-4 w-4 accent-sheriff"
                              />
                              <span>{item.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
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

          {settingsTab === 'mode' && (
            <div className="space-y-3">
              <div className="rounded-md border-l-2 border-sheriff bg-canvas px-3 py-2.5 text-[12px] leading-5 text-secondary">
                <div className="font-semibold text-primary">
                  模式 {modeDescriptor.modeNumber} · {modeDescriptor.shortTitle}
                </div>
                <p className="mt-1">{modeDescriptor.description}</p>
              </div>

              {hostMode.judgeMode === 'online_judge' && (
                <div className="space-y-2.5 rounded-md border border-subtle bg-canvas p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[14px] font-medium text-primary">語音播報</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleToggleTtsPreview}
                        className={`min-h-10 rounded-md border px-3 text-[12px] font-semibold ${
                          isTtsPreviewing
                            ? 'border-good-border bg-good-tint text-good'
                            : 'border-subtle bg-surface text-primary'
                        }`}
                      >
                        {isTtsPreviewing ? '停止試聽' : '試聽（3 秒）'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateOnlineJudgeSettings({ ttsEnabled: !onlineJudgeSettings.ttsEnabled })
                        }
                        className={`min-h-10 rounded-md border px-3 text-[12px] font-semibold ${
                          onlineJudgeSettings.ttsEnabled
                            ? 'border-good-border bg-good-tint text-good'
                            : 'border-subtle bg-surface text-muted'
                        }`}
                      >
                        {onlineJudgeSettings.ttsEnabled ? '開啟' : '靜音'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setSettingsOpen(false);
                  goToHostSetup();
                }}
                className="min-h-12 w-full rounded-md border border-subtle bg-canvas text-[14px] font-medium text-secondary hover:border-strong hover:text-primary"
              >
                返回開房前重新設定 2 × 2 × 2 模式
              </button>
            </div>
          )}
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
