import { useMemo, useState } from 'react';
import { hasPandoraDayGun, isJackSecondIdentityBoard } from '../../logic';
import { useGameStore } from '../../store/gameStore';
import { formatSeatDisplay } from '../common/displayHelpers';

interface ExtraDaySkillsSectionProps {
  disabled?: boolean;
}

export function ExtraDaySkillsSection({ disabled = false }: ExtraDaySkillsSectionProps) {
  const selectedBoardId = useGameStore((s) => s.selectedBoardId);
  const seats = useGameStore((s) => s.seats);
  const conversionState = useGameStore((s) => s.conversionState);
  const thirdPartySpecialState = useGameStore((s) => s.thirdPartySpecialState);

  const detectiveCollectiveAccuse = useGameStore((s) => s.detectiveCollectiveAccuse);
  const usePandoraDayGun = useGameStore((s) => s.usePandoraDayGun);
  const wolfGirlExplode = useGameStore((s) => s.wolfGirlExplode);
  const triggerMaskedVillagerDelayedDeath = useGameStore(
    (s) => s.triggerMaskedVillagerDelayedDeath,
  );

  // 1. 開膛手傑克第二身分板：已出局偵探集結指證
  const isJackSecondId = useMemo(
    () => isJackSecondIdentityBoard(seats, selectedBoardId ?? undefined),
    [seats, selectedBoardId],
  );
  const deadDetectives = useMemo(
    () =>
      seats.filter(
        (s) =>
          !s.isAlive &&
          s.secondRoleId === 'detective' &&
          s.seatNumber !== conversionState?.jackRipperFanaticSeat,
      ),
    [seats, conversionState?.jackRipperFanaticSeat],
  );
  const [accusedSeat, setAccusedSeat] = useState<number | null>(null);
  const [agreeCount, setAgreeCount] = useState<number>(2);
  const [accuseNotice, setAccuseNotice] = useState<string | null>(null);

  // 2. 潘朵拉魔盒白天手槍
  const aliveSeats = useMemo(() => seats.filter((s) => s.isAlive), [seats]);
  const pandoraGunHolders = useMemo(() => {
    if (!thirdPartySpecialState) return [];
    return aliveSeats.filter((s) => hasPandoraDayGun(thirdPartySpecialState, s.seatNumber));
  }, [aliveSeats, thirdPartySpecialState]);
  const [gunHolderSeat, setGunHolderSeat] = useState<number | null>(null);
  const [gunTargetSeat, setGunTargetSeat] = useState<number | null>(null);
  const [gunNotice, setGunNotice] = useState<string | null>(null);

  // 3. 狼女孩白天自爆
  const aliveWolfGirl = useMemo(
    () => seats.find((s) => s.isAlive && s.roleId === 'wolf_girl') ?? null,
    [seats],
  );
  const [wolfGirlNotice, setWolfGirlNotice] = useState<string | null>(null);

  // 4. 蒙面平民延遲死亡
  const maskedDelayedSeats = useMemo(
    () => seats.filter((s) => s.isAlive && s.maskedDelayedDeath),
    [seats],
  );

  if (
    !isJackSecondId &&
    pandoraGunHolders.length === 0 &&
    !aliveWolfGirl &&
    maskedDelayedSeats.length === 0
  ) {
    return null;
  }

  const requiredAgree = Math.max(2, Math.ceil(deadDetectives.length / 2));

  return (
    <div className="space-y-2.5">
      {/* 1. 開膛手傑克第二身分板：已出局偵探集結指證 */}
      {isJackSecondId && (
        <div className="rounded-xl border border-rose-500/35 bg-rose-950/20 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-extrabold text-rose-200">
              🔍 已出局偵探集結指證開膛手傑克（整場 1 次）
            </div>
            <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[11px] font-bold text-slate-300">
              已出局偵探 {deadDetectives.length} 人
            </span>
          </div>
          {conversionState?.jackRipperDetAccusationUsed ? (
            <p className="mt-1.5 text-xs text-slate-300">
              {conversionState.jackRipperThirdPartyDefeated
                ? '✅ 偵探已指證開膛手傑克成功！第三方陣營已失敗。'
                : '❌ 本場偵探集結指證機會已使用（指證失敗）。'}
            </p>
          ) : (
            <div className="mt-2 space-y-2">
              <p className="text-[11px] leading-relaxed text-slate-300">
                須已出局偵探達 2 人以上，且至少半數（目前須 {requiredAgree} 人）同意集結才能指證。
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300">同意集結人數：</span>
                <button
                  type="button"
                  onClick={() => setAgreeCount((c) => Math.max(0, c - 1))}
                  className="min-h-10 min-w-10 rounded-lg border border-slate-700 bg-slate-900 text-sm font-extrabold text-slate-200"
                >
                  −
                </button>
                <span className="min-w-8 text-center text-sm font-extrabold text-amber-300">
                  {agreeCount}
                </span>
                <button
                  type="button"
                  onClick={() => setAgreeCount((c) => Math.min(deadDetectives.length || 12, c + 1))}
                  className="min-h-10 min-w-10 rounded-lg border border-slate-700 bg-slate-900 text-sm font-extrabold text-slate-200"
                >
                  ＋
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {seats.map((seat) => (
                  <button
                    key={seat.seatNumber}
                    type="button"
                    disabled={disabled}
                    onClick={() => setAccusedSeat(seat.seatNumber)}
                    className={`min-h-10 rounded-lg border px-2.5 text-xs font-bold transition ${
                      accusedSeat === seat.seatNumber
                        ? 'border-rose-400 bg-rose-500/30 text-rose-100'
                        : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {seat.seatNumber} 號
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={disabled || accusedSeat === null}
                onClick={() => {
                  if (accusedSeat === null) return;
                  const res = detectiveCollectiveAccuse(accusedSeat, agreeCount);
                  if (!res.allowed) {
                    setAccuseNotice(res.reason ?? '無法發動指證');
                  } else {
                    setAccuseNotice(
                      res.success
                        ? `🎯 指證 ${accusedSeat} 號為開膛手傑克成功！第三方陣營失敗。`
                        : `❌ 指證 ${accusedSeat} 號失敗，該玩家並非開膛手傑克。`,
                    );
                  }
                }}
                className="min-h-12 w-full rounded-xl bg-rose-500 px-4 text-xs font-extrabold text-slate-950 transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
              >
                確認偵探集結指證
              </button>
              {accuseNotice && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-950/30 px-2.5 py-1.5 text-xs text-amber-200">
                  {accuseNotice}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. 潘朵拉魔盒白天手槍 */}
      {pandoraGunHolders.length > 0 && (
        <div className="rounded-xl border border-fuchsia-500/35 bg-fuchsia-950/20 p-3">
          <div className="text-xs font-extrabold text-fuchsia-200">
            🔫 潘朵拉魔盒「白天手槍」發動
          </div>
          <div className="mt-2 space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {pandoraGunHolders.map((h) => (
                <button
                  key={h.seatNumber}
                  type="button"
                  onClick={() => setGunHolderSeat(h.seatNumber)}
                  className={`min-h-10 rounded-lg border px-2.5 text-xs font-bold ${
                    (gunHolderSeat ?? pandoraGunHolders[0].seatNumber) === h.seatNumber
                      ? 'border-fuchsia-400 bg-fuchsia-500/30 text-fuchsia-100'
                      : 'border-slate-700 bg-slate-900 text-slate-300'
                  }`}
                >
                  持槍：{formatSeatDisplay(h)}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {aliveSeats
                .filter((s) => s.seatNumber !== (gunHolderSeat ?? pandoraGunHolders[0].seatNumber))
                .map((s) => (
                  <button
                    key={s.seatNumber}
                    type="button"
                    disabled={disabled}
                    onClick={() => setGunTargetSeat(s.seatNumber)}
                    className={`min-h-10 rounded-lg border px-2.5 text-xs font-bold ${
                      gunTargetSeat === s.seatNumber
                        ? 'border-rose-400 bg-rose-500/30 text-rose-100'
                        : 'border-slate-700 bg-slate-900 text-slate-300'
                    }`}
                  >
                    射擊 {s.seatNumber} 號
                  </button>
                ))}
            </div>
            <button
              type="button"
              disabled={disabled || gunTargetSeat === null}
              onClick={() => {
                const holder = gunHolderSeat ?? pandoraGunHolders[0].seatNumber;
                if (gunTargetSeat === null) return;
                const res = usePandoraDayGun(holder, gunTargetSeat);
                if (!res.allowed) {
                  setGunNotice(res.reason ?? '開槍失敗');
                } else {
                  setGunNotice(`💥 ${holder} 號已使用潘朵拉白天手槍擊殺 ${gunTargetSeat} 號！`);
                  setGunTargetSeat(null);
                }
              }}
              className="min-h-12 w-full rounded-xl bg-fuchsia-500 px-4 text-xs font-extrabold text-slate-950 hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
            >
              確認開槍帶走目標
            </button>
            {gunNotice && (
              <div className="rounded-lg border border-fuchsia-500/35 bg-fuchsia-950/35 px-2.5 py-1.5 text-xs text-fuchsia-200">
                {gunNotice}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. 狼女孩白天自爆 */}
      {aliveWolfGirl && (
        <div className="rounded-xl border border-amber-500/35 bg-amber-950/20 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-extrabold text-amber-200">
              🐺 狼女孩（{aliveWolfGirl.seatNumber} 號）白天自爆分手
            </div>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                const res = wolfGirlExplode(aliveWolfGirl.seatNumber);
                if (!res.allowed) {
                  setWolfGirlNotice(res.reason ?? '狼女孩無法自爆');
                }
              }}
              className="min-h-12 shrink-0 rounded-xl bg-amber-500 px-3 text-xs font-extrabold text-slate-950 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500"
            >
              狼女孩自爆入夜
            </button>
          </div>
          {wolfGirlNotice && (
            <p className="mt-1.5 text-xs text-rose-300">{wolfGirlNotice}</p>
          )}
        </div>
      )}

      {/* 4. 蒙面平民延遲死亡結算 */}
      {maskedDelayedSeats.length > 0 && (
        <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-3">
          <div className="text-xs font-extrabold text-amber-200">
            🎭 蒙面平民負傷延遲死亡結算（發言結束後）
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {maskedDelayedSeats.map((seat) => (
              <button
                key={seat.seatNumber}
                type="button"
                disabled={disabled}
                onClick={() => triggerMaskedVillagerDelayedDeath(seat.seatNumber)}
                className="min-h-12 rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 text-xs font-extrabold text-rose-100 hover:bg-rose-900/50"
              >
                宣告 {seat.seatNumber} 號蒙面平民正式出局
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
