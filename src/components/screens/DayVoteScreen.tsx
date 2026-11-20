import { useEffect, useMemo, useState } from 'react';
import { getBoardById } from '../../data/boards';
import { getRoleById } from '../../data/roles';
import { countAliveFactions, resolveSelfExplode } from '../../logic';
import { useGameStore } from '../../store/gameStore';
import { ConfirmModal } from '../common/ConfirmModal';
import { PendingShooterCard } from '../common/PendingShooterCard';
import { SeatStatusDrawer } from '../common/SeatStatusDrawer';
import { formatSeatDisplay, getRoleBadgeClasses } from '../common/displayHelpers';

const TIMER_PRESETS = [60, 90, 120] as const;

export function DayVoteScreen() {
  const selectedBoardId = useGameStore((s) => s.selectedBoardId);
  const round = useGameStore((s) => s.round);
  const seats = useGameStore((s) => s.seats);
  const ruleOverrides = useGameStore((s) => s.ruleOverrides);
  const dayHistory = useGameStore((s) => s.dayHistory);
  const pendingShooters = useGameStore((s) => s.pendingShooters);

  const exilePlayer = useGameStore((s) => s.exilePlayer);
  const selfExplode = useGameStore((s) => s.selfExplode);
  const triggerShoot = useGameStore((s) => s.triggerShoot);
  const skipShoot = useGameStore((s) => s.skipShoot);
  const advanceToNextNight = useGameStore((s) => s.advanceToNextNight);

  const board = getBoardById(selectedBoardId);
  const [seatDrawerOpen, setSeatDrawerOpen] = useState(false);

  // 發言倒數計時器
  const [durationSeconds, setDurationSeconds] = useState<number>(90);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(90);
  const [timerRunning, setTimerRunning] = useState(false);

  // 放逐與自爆選擇狀態
  const [selectedExileSeat, setSelectedExileSeat] = useState<number | null>(null);
  const [confirmExileOpen, setConfirmExileOpen] = useState(false);

  const [selectedExplodeSeat, setSelectedExplodeSeat] = useState<number | null>(null);
  const [confirmExplodeOpen, setConfirmExplodeOpen] = useState(false);
  const [explodeError, setExplodeError] = useState<string | null>(null);

  const [confirmNextNightOpen, setConfirmNextNightOpen] = useState(false);
  const [showFactionCounts, setShowFactionCounts] = useState(false);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const aliveSeats = useMemo(() => seats.filter((s) => s.isAlive), [seats]);
  const factionCounts = useMemo(
    () => countAliveFactions(seats, ruleOverrides),
    [seats, ruleOverrides],
  );
  const todayEvents = useMemo(
    () => dayHistory.find((d) => d.round === round)?.events ?? [],
    [dayHistory, round],
  );

  const selectPreset = (seconds: number) => {
    setTimerRunning(false);
    setDurationSeconds(seconds);
    setRemainingSeconds(seconds);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const selectedExileObj = seats.find((s) => s.seatNumber === selectedExileSeat);
  const selectedExplodeObj = seats.find((s) => s.seatNumber === selectedExplodeSeat);
  const hasPendingShooters = pendingShooters.length > 0;

  return (
    <div className="space-y-4 pb-28">
      {/* 簡易發言倒數計時器 */}
      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/95 p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              第 {round} 天 · 白天階段
            </span>
            <h2 className="text-base font-bold text-slate-100">發言倒數計時器</h2>
          </div>
          <div
            className={`font-mono text-3xl font-extrabold tabular-nums ${
              remainingSeconds === 0
                ? 'text-rose-400'
                : remainingSeconds <= 10
                  ? 'text-amber-300'
                  : 'text-slate-50'
            }`}
          >
            {formatTimer(remainingSeconds)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {TIMER_PRESETS.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => selectPreset(sec)}
              className={`min-h-12 rounded-xl border text-sm font-bold transition ${
                durationSeconds === sec
                  ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                  : 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {sec} 秒
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              if (remainingSeconds === 0) setRemainingSeconds(durationSeconds);
              setTimerRunning((prev) => !prev);
            }}
            className={`min-h-12 rounded-xl px-4 text-sm font-extrabold transition ${
              timerRunning
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-indigo-500 text-white hover:bg-indigo-400'
            }`}
          >
            {timerRunning ? '⏸ 暫停計時' : remainingSeconds === 0 ? '▶ 重新開始' : '▶ 開始計時'}
          </button>
          <button
            type="button"
            onClick={() => {
              setTimerRunning(false);
              setRemainingSeconds(durationSeconds);
            }}
            className="min-h-12 rounded-xl border border-slate-700 bg-slate-800 px-4 text-sm font-bold text-slate-200 hover:bg-slate-700"
          >
            ↺ 重設
          </button>
        </div>
      </section>

      {/* 場上存活與白痴翻牌狀態 */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-300">
            目前存活人數：{aliveSeats.length} / {seats.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSeatDrawerOpen(true)}
              className="min-h-12 rounded-xl border border-indigo-400/40 bg-indigo-950/50 px-3 text-xs font-bold text-indigo-200 hover:bg-indigo-900/50"
            >
              👥 座位總覽 / 手動標記
            </button>
            <button
              type="button"
              onClick={() => setShowFactionCounts((prev) => !prev)}
              className="min-h-12 rounded-xl border border-slate-700 bg-slate-800 px-3 text-xs font-semibold text-slate-300"
            >
              {showFactionCounts ? '隱藏統計' : '法官統計'}
            </button>
          </div>
        </div>

        {showFactionCounts && (
          <div className="mt-2.5 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 py-2">
              <div className="text-rose-300">狼人</div>
              <div className="text-base font-extrabold text-rose-100">
                {factionCounts.wolves}
              </div>
            </div>
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/30 py-2">
              <div className="text-indigo-300">神職</div>
              <div className="text-base font-extrabold text-indigo-100">
                {factionCounts.gods}
              </div>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 py-2">
              <div className="text-emerald-300">平民</div>
              <div className="text-base font-extrabold text-emerald-100">
                {factionCounts.villagers}
              </div>
            </div>
          </div>
        )}

        {todayEvents.length > 0 && (
          <div className="mt-3 space-y-1 border-t border-slate-800 pt-2.5 text-xs text-amber-200">
            <div className="font-bold text-slate-400">今日事件紀錄：</div>
            {todayEvents.map((evt, idx) => (
              <div key={idx}>• {evt}</div>
            ))}
          </div>
        )}
      </section>

      {/* 若放逐後觸發開槍，優先顯示開槍結算 */}
      {pendingShooters.map((shooter) => (
        <PendingShooterCard
          key={shooter.seatNumber}
          shooter={shooter}
          seats={seats}
          onShoot={triggerShoot}
          onSkip={skipShoot}
        />
      ))}

      {/* 白天放逐投票區 */}
      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/95 p-4">
        <div>
          <h2 className="text-base font-bold text-slate-50">🗳️ 放逐投票出局</h2>
          <p className="mt-0.5 text-xs text-slate-400">
            點選被放逐玩家（若為未翻牌白痴，系統將自動翻牌免死並標記無投票權）。
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {aliveSeats.map((seat) => {
            const active = selectedExileSeat === seat.seatNumber;
            const role = getRoleById(seat.roleId);
            return (
              <button
                key={seat.seatNumber}
                type="button"
                disabled={hasPendingShooters}
                onClick={() =>
                  setSelectedExileSeat((prev) =>
                    prev === seat.seatNumber ? null : seat.seatNumber,
                  )
                }
                className={`min-h-14 rounded-xl border p-2.5 text-left transition ${
                  active
                    ? 'border-amber-400 bg-amber-500/20 ring-2 ring-amber-400/40'
                    : hasPendingShooters
                      ? 'cursor-not-allowed border-slate-800 bg-slate-950/60 opacity-50'
                      : 'border-slate-800 bg-slate-950/80 hover:border-slate-600 active:scale-[0.98]'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-extrabold text-slate-100">
                    {seat.seatNumber} 號
                  </span>
                  {seat.idiotRevealed && (
                    <span className="rounded bg-amber-500/25 px-1.5 py-0.5 text-[10px] font-bold text-amber-200">
                      無投票權
                    </span>
                  )}
                </div>
                <div className="truncate text-xs text-slate-400">
                  {seat.nickname.trim() || `${seat.seatNumber} 號玩家`}
                </div>
                {role && (
                  <span
                    className={`mt-1 inline-block rounded border px-1.5 py-0.5 text-[10px] font-bold ${getRoleBadgeClasses(role.id)}`}
                  >
                    {role.name}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={selectedExileSeat === null || hasPendingShooters}
          onClick={() => setConfirmExileOpen(true)}
          className={`min-h-12 w-full rounded-xl px-4 py-3 text-sm font-extrabold transition ${
            selectedExileSeat !== null && !hasPendingShooters
              ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-[0.99]'
              : 'cursor-not-allowed bg-slate-800 text-slate-500'
          }`}
        >
          {selectedExileObj
            ? `確認放逐 ${formatSeatDisplay(selectedExileObj)}`
            : '請先點選要放逐的座位'}
        </button>
      </section>

      {/* 狼人自爆區（清楚區隔防誤觸） */}
      <section className="space-y-3 rounded-2xl border border-rose-500/35 bg-rose-950/20 p-4">
        <div>
          <h2 className="text-base font-bold text-rose-200">💥 狼人自爆強制入夜</h2>
          <p className="mt-0.5 text-xs text-rose-200/75">
            自爆將立即終止白天並跳至下一晚，該狼人將於當晚點刀後正式出局（機械狼全程不可自爆，狼王自爆不可開槍）。
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {aliveSeats.map((seat) => {
            const explodeCheck = resolveSelfExplode(seats, seat.seatNumber);
            const active = selectedExplodeSeat === seat.seatNumber;
            const role = getRoleById(seat.roleId);

            return (
              <button
                key={seat.seatNumber}
                type="button"
                disabled={!explodeCheck.allowed || hasPendingShooters}
                onClick={() => {
                  setExplodeError(null);
                  setSelectedExplodeSeat((prev) =>
                    prev === seat.seatNumber ? null : seat.seatNumber,
                  );
                }}
                className={`min-h-14 rounded-xl border p-2.5 text-left transition ${
                  active
                    ? 'border-rose-400 bg-rose-500/30 ring-2 ring-rose-400/50'
                    : !explodeCheck.allowed || hasPendingShooters
                      ? 'cursor-not-allowed border-slate-800/70 bg-slate-950/50 opacity-45'
                      : 'border-rose-500/30 bg-slate-950/80 hover:border-rose-400/60 active:scale-[0.98]'
                }`}
              >
                <div className="text-sm font-extrabold text-slate-100">
                  {seat.seatNumber} 號
                </div>
                <div className="truncate text-xs text-slate-400">
                  {seat.nickname.trim() || `${seat.seatNumber} 號玩家`}
                </div>
                {role && (
                  <div className="mt-0.5 text-[10px] font-bold text-slate-300">
                    {role.name}
                  </div>
                )}
                {!explodeCheck.allowed && explodeCheck.reason && (
                  <div className="mt-1 text-[10px] text-slate-400">{explodeCheck.reason}</div>
                )}
              </button>
            );
          })}
        </div>

        {explodeError && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-950/50 p-2.5 text-xs text-rose-200">
            {explodeError}
          </div>
        )}

        <button
          type="button"
          disabled={selectedExplodeSeat === null || hasPendingShooters}
          onClick={() => setConfirmExplodeOpen(true)}
          className={`min-h-12 w-full rounded-xl px-4 py-3 text-sm font-extrabold transition ${
            selectedExplodeSeat !== null && !hasPendingShooters
              ? 'bg-rose-600 text-white hover:bg-rose-500 active:scale-[0.99]'
              : 'cursor-not-allowed bg-slate-800 text-slate-500'
          }`}
        >
          {selectedExplodeObj
            ? `💥 宣告 ${formatSeatDisplay(selectedExplodeObj)} 自爆並入夜`
            : '請選擇自爆狼人座位'}
        </button>
      </section>

      {/* 結束白天進入下一晚 */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-slate-950/95 p-3 backdrop-blur-md">
        <div className="mx-auto max-w-lg">
          <button
            type="button"
            disabled={hasPendingShooters}
            onClick={() => setConfirmNextNightOpen(true)}
            className={`min-h-12 w-full rounded-xl px-5 py-3.5 text-base font-extrabold transition ${
              hasPendingShooters
                ? 'cursor-not-allowed bg-slate-800 text-slate-500'
                : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 active:scale-[0.99]'
            }`}
          >
            {hasPendingShooters
              ? '請先結算開槍 / 壓槍後再入夜'
              : `🌙 結束第 ${round} 天 ➜ 進入第 ${round + 1} 晚`}
          </button>
        </div>
      </div>

      {/* 二次確認：放逐 */}
      <ConfirmModal
        open={confirmExileOpen && selectedExileObj !== undefined}
        title="確認執行白天放逐？"
        description={
          selectedExileObj
            ? `確定將 ${formatSeatDisplay(selectedExileObj)} 放逐投票投出？（若為未翻牌白痴將自動翻牌免死）`
            : undefined
        }
        confirmLabel="確認放逐"
        tone="warning"
        onConfirm={() => {
          if (selectedExileSeat !== null) {
            exilePlayer(selectedExileSeat);
            setSelectedExileSeat(null);
          }
          setConfirmExileOpen(false);
        }}
        onCancel={() => setConfirmExileOpen(false)}
      />

      {/* 二次確認：自爆 */}
      <ConfirmModal
        open={confirmExplodeOpen && selectedExplodeObj !== undefined}
        title="確認狼人自爆並強制入夜？"
        description={
          selectedExplodeObj
            ? `${formatSeatDisplay(selectedExplodeObj)} 自爆後將立刻進入第 ${round + 1} 晚，該玩家將於當晚點刀後正式死亡。`
            : undefined
        }
        confirmLabel="確認自爆入夜"
        tone="danger"
        onConfirm={() => {
          if (selectedExplodeSeat !== null) {
            const res = selfExplode(selectedExplodeSeat);
            if (!res.allowed) {
              setExplodeError(res.reason ?? '無法自爆');
            } else {
              setSelectedExplodeSeat(null);
            }
          }
          setConfirmExplodeOpen(false);
        }}
        onCancel={() => setConfirmExplodeOpen(false)}
      />

      {/* 二次確認：入夜 */}
      <ConfirmModal
        open={confirmNextNightOpen}
        title={`進入第 ${round + 1} 晚？`}
        description="確定結束白天討論與投票並進入下一個夜晚？"
        confirmLabel={`進入第 ${round + 1} 晚`}
        tone="primary"
        onConfirm={() => {
          setConfirmNextNightOpen(false);
          advanceToNextNight();
        }}
        onCancel={() => setConfirmNextNightOpen(false)}
      />

      <SeatStatusDrawer
        open={seatDrawerOpen}
        board={board}
        onClose={() => setSeatDrawerOpen(false)}
      />
    </div>
  );
}
