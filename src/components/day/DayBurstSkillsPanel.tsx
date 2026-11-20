import { useMemo, useState } from 'react';
import { getRoleById } from '../../data/roles';
import { isSheriffElectionActive, resolveSelfExplode } from '../../logic';
import { useGameStore } from '../../store/gameStore';
import { ConfirmModal } from '../common/ConfirmModal';
import { formatSeatDisplay } from '../common/displayHelpers';

interface DayBurstSkillsPanelProps {
  disabled?: boolean;
}

export function DayBurstSkillsPanel({ disabled = false }: DayBurstSkillsPanelProps) {
  const round = useGameStore((s) => s.round);
  const seats = useGameStore((s) => s.seats);
  const sheriffState = useGameStore((s) => s.sheriffState);
  const knightDuelUsed = useGameStore((s) => s.knightDuelUsed);

  const selfExplode = useGameStore((s) => s.selfExplode);
  const whiteWolfKingExplode = useGameStore((s) => s.whiteWolfKingExplode);
  const knightDuel = useGameStore((s) => s.knightDuel);

  // 普通狼人自爆
  const [selectedExplodeSeat, setSelectedExplodeSeat] = useState<number | null>(null);
  const [confirmExplodeOpen, setConfirmExplodeOpen] = useState(false);
  const [explodeError, setExplodeError] = useState<string | null>(null);

  // 白狼王自爆帶人
  const [selectedWwkTarget, setSelectedWwkTarget] = useState<number | null>(null);
  const [confirmWwkOpen, setConfirmWwkOpen] = useState(false);

  // 騎士決鬥
  const [selectedKnightTarget, setSelectedKnightTarget] = useState<number | null>(null);
  const [confirmKnightOpen, setConfirmKnightOpen] = useState(false);
  const [knightNotice, setKnightNotice] = useState<string | null>(null);

  const aliveSeats = useMemo(() => seats.filter((s) => s.isAlive), [seats]);
  const electionActive = isSheriffElectionActive(sheriffState);

  const aliveWhiteWolfKing = useMemo(
    () => seats.find((s) => s.isAlive && s.roleId === 'white_wolf_king') ?? null,
    [seats],
  );
  const hasKnightInBoard = useMemo(() => seats.some((s) => s.roleId === 'knight'), [seats]);
  const aliveKnight = useMemo(
    () => seats.find((s) => s.isAlive && s.roleId === 'knight') ?? null,
    [seats],
  );

  const selectedExplodeObj = seats.find((s) => s.seatNumber === selectedExplodeSeat);
  const selectedWwkTargetObj = seats.find((s) => s.seatNumber === selectedWwkTarget);
  const selectedKnightTargetObj = seats.find((s) => s.seatNumber === selectedKnightTarget);

  return (
    <section className="space-y-4 rounded-2xl border border-rose-500/35 bg-rose-950/20 p-4">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
          高風險突發操作區
        </span>
        <h2 className="text-base font-bold text-rose-100">⚡ 白天突發技能與狼人自爆</h2>
        {electionActive && (
          <div className="mt-2 rounded-xl border border-amber-400/50 bg-amber-950/40 px-3 py-2 text-xs font-bold text-amber-200">
            ⚠️ 目前正處警上競選階段：任何狼人或白狼王自爆將自動判定「吞警徽（本局無警長）」並強制入夜！
          </div>
        )}
      </div>

      {/* 1. 騎士翻牌決鬥 */}
      {hasKnightInBoard && (
        <div className="space-y-2.5 rounded-xl border border-indigo-400/35 bg-slate-950/75 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold text-indigo-200">⚔️ 騎士翻牌決鬥</h3>
            <span className="text-[11px] font-bold text-slate-400">
              {knightDuelUsed
                ? '本局已使用過決鬥'
                : aliveKnight
                  ? `${aliveKnight.seatNumber} 號存活可用`
                  : '騎士已出局'}
            </span>
          </div>

          {knightNotice && (
            <div className="rounded-lg border border-amber-400/40 bg-amber-950/35 px-3 py-2 text-xs font-bold text-amber-200">
              {knightNotice}
            </div>
          )}

          {aliveKnight && !knightDuelUsed && (
            <>
              <p className="text-xs text-slate-400">
                撞狼則目標立即出局（不觸發亡語技能）並強制入夜；撞好人則騎士以死謝罪並繼續白天。
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {aliveSeats
                  .filter((s) => s.seatNumber !== aliveKnight.seatNumber)
                  .map((seat) => {
                    const active = selectedKnightTarget === seat.seatNumber;
                    return (
                      <button
                        key={seat.seatNumber}
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                          setSelectedKnightTarget((prev) =>
                            prev === seat.seatNumber ? null : seat.seatNumber,
                          )
                        }
                        className={`min-h-11 rounded-lg border p-2 text-left text-xs font-bold transition ${
                          active
                            ? 'border-indigo-400 bg-indigo-500/30 text-indigo-100 ring-1 ring-indigo-400/50'
                            : 'border-slate-800 bg-slate-900 text-slate-200 hover:border-slate-600'
                        }`}
                      >
                        <div>{seat.seatNumber} 號</div>
                        <div className="truncate text-[10px] font-normal text-slate-400">
                          {seat.nickname.trim() || `${seat.seatNumber}號`}
                        </div>
                      </button>
                    );
                  })}
              </div>
              <button
                type="button"
                disabled={disabled || selectedKnightTarget === null}
                onClick={() => setConfirmKnightOpen(true)}
                className="min-h-12 w-full rounded-xl bg-indigo-600 px-4 text-sm font-extrabold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
              >
                {selectedKnightTargetObj
                  ? `⚔️ 騎士決鬥 ${formatSeatDisplay(selectedKnightTargetObj)}`
                  : '請先點選騎士決鬥目標'}
              </button>
            </>
          )}
        </div>
      )}

      {/* 2. 白狼王自爆帶走目標 */}
      {aliveWhiteWolfKing && (
        <div className="space-y-2.5 rounded-xl border border-rose-400/45 bg-slate-950/75 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold text-rose-200">
              🐺 白狼王自爆帶人（{aliveWhiteWolfKing.seatNumber} 號）
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            可選擇帶走一名存活玩家（被帶走者無任何死亡技能）或不帶人空爆，強制進入第 {round + 1} 晚。
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
            {aliveSeats
              .filter((s) => s.seatNumber !== aliveWhiteWolfKing.seatNumber)
              .map((seat) => {
                const active = selectedWwkTarget === seat.seatNumber;
                return (
                  <button
                    key={seat.seatNumber}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      setSelectedWwkTarget((prev) =>
                        prev === seat.seatNumber ? null : seat.seatNumber,
                      )
                    }
                    className={`min-h-11 rounded-lg border p-2 text-left text-xs font-bold transition ${
                      active
                        ? 'border-rose-400 bg-rose-500/30 text-rose-100 ring-1 ring-rose-400/50'
                        : 'border-slate-800 bg-slate-900 text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    <div>{seat.seatNumber} 號</div>
                    <div className="truncate text-[10px] font-normal text-slate-400">
                      {seat.nickname.trim() || `${seat.seatNumber}號`}
                    </div>
                  </button>
                );
              })}
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setConfirmWwkOpen(true)}
            className="min-h-12 w-full rounded-xl bg-rose-600 px-4 text-sm font-extrabold text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
          >
            {selectedWwkTargetObj
              ? `💥 白狼王自爆並帶走 ${formatSeatDisplay(selectedWwkTargetObj)}`
              : '💥 白狼王空爆（不帶走任何人）'}
          </button>
        </div>
      )}

      {/* 3. 普通狼人自爆 */}
      <div className="space-y-2.5">
        <div>
          <h3 className="text-sm font-bold text-rose-200">💥 普通狼人自爆強制入夜</h3>
          <p className="mt-0.5 text-xs text-rose-200/75">
            自爆將立即終止白天並跳至下一晚，該狼人將於當晚點刀後正式出局（機械狼、狼美人不可自爆）。
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
                disabled={!explodeCheck.allowed || disabled}
                onClick={() => {
                  setExplodeError(null);
                  setSelectedExplodeSeat((prev) =>
                    prev === seat.seatNumber ? null : seat.seatNumber,
                  );
                }}
                className={`min-h-14 rounded-xl border p-2.5 text-left transition ${
                  active
                    ? 'border-rose-400 bg-rose-500/30 ring-2 ring-rose-400/50'
                    : !explodeCheck.allowed || disabled
                      ? 'cursor-not-allowed border-slate-800/70 bg-slate-950/50 opacity-45'
                      : 'border-rose-500/30 bg-slate-950/80 hover:border-rose-400/60 active:scale-[0.98]'
                }`}
              >
                <div className="text-sm font-extrabold text-slate-100">{seat.seatNumber} 號</div>
                <div className="truncate text-xs text-slate-400">
                  {seat.nickname.trim() || `${seat.seatNumber} 號玩家`}
                </div>
                {role && (
                  <div className="mt-0.5 text-[10px] font-bold text-slate-300">{role.name}</div>
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
          disabled={selectedExplodeSeat === null || disabled}
          onClick={() => setConfirmExplodeOpen(true)}
          className={`min-h-12 w-full rounded-xl px-4 py-3 text-sm font-extrabold transition ${
            selectedExplodeSeat !== null && !disabled
              ? 'bg-rose-600 text-white hover:bg-rose-500 active:scale-[0.99]'
              : 'cursor-not-allowed bg-slate-800 text-slate-500'
          }`}
        >
          {selectedExplodeObj
            ? `💥 宣告 ${formatSeatDisplay(selectedExplodeObj)} 自爆並入夜`
            : '請選擇自爆狼人座位'}
        </button>
      </div>

      {/* 確認普通狼人自爆 */}
      <ConfirmModal
        open={confirmExplodeOpen && selectedExplodeObj !== undefined}
        title="確認狼人自爆並強制入夜？"
        description={
          selectedExplodeObj
            ? `${formatSeatDisplay(selectedExplodeObj)} 自爆後將立刻進入第 ${round + 1} 晚${
                electionActive ? '（警上自爆將自動吞警徽）' : ''
              }，該玩家將於當晚點刀後正式死亡。`
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

      {/* 確認白狼王自爆帶人 */}
      <ConfirmModal
        open={confirmWwkOpen && aliveWhiteWolfKing !== null}
        title="確認白狼王自爆並強制入夜？"
        description={
          aliveWhiteWolfKing
            ? selectedWwkTargetObj
              ? `${aliveWhiteWolfKing.seatNumber} 號白狼王將自爆並立即帶走 ${formatSeatDisplay(
                  selectedWwkTargetObj,
                )}（無死亡技能）${electionActive ? '，同時吞警徽' : ''}。`
              : `${aliveWhiteWolfKing.seatNumber} 號白狼王將空爆並強制入夜${
                  electionActive ? '（同時吞警徽）' : ''
                }。`
            : undefined
        }
        confirmLabel="確認白狼王自爆"
        tone="danger"
        onConfirm={() => {
          if (aliveWhiteWolfKing) {
            whiteWolfKingExplode(aliveWhiteWolfKing.seatNumber, selectedWwkTarget);
            setSelectedWwkTarget(null);
          }
          setConfirmWwkOpen(false);
        }}
        onCancel={() => setConfirmWwkOpen(false)}
      />

      {/* 確認騎士翻牌決鬥 */}
      <ConfirmModal
        open={confirmKnightOpen && aliveKnight !== null && selectedKnightTargetObj !== undefined}
        title="確認騎士翻牌決鬥？"
        description={
          aliveKnight && selectedKnightTargetObj
            ? `${aliveKnight.seatNumber} 號（騎士）將翻牌決鬥 ${formatSeatDisplay(
                selectedKnightTargetObj,
              )}，整局僅能發動一次。`
            : undefined
        }
        confirmLabel="確認決鬥"
        tone="primary"
        onConfirm={() => {
          if (aliveKnight && selectedKnightTarget !== null) {
            const res = knightDuel(aliveKnight.seatNumber, selectedKnightTarget);
            if (!res.allowed) {
              setKnightNotice(res.reason ?? '決鬥失敗');
            } else if (!res.targetWasWolf) {
              setKnightNotice(
                `🛡️ ${selectedKnightTarget} 號為好人陣營，騎士（${aliveKnight.seatNumber} 號）以死謝罪，繼續白天流程！`,
              );
            }
            setSelectedKnightTarget(null);
          }
          setConfirmKnightOpen(false);
        }}
        onCancel={() => setConfirmKnightOpen(false)}
      />
    </section>
  );
}
