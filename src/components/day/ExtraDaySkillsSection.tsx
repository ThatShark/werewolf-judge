import { useMemo, useState } from 'react';
import { hasPandoraDayGun, isJackSecondIdentityBoard } from '../../logic';
import { useGameStore } from '../../store/gameStore';
import { formatSeatNum } from '../common/displayHelpers';

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

  const aliveSeats = useMemo(() => seats.filter((s) => s.isAlive), [seats]);
  const pandoraGunHolders = useMemo(() => {
    if (!thirdPartySpecialState) return [];
    return aliveSeats.filter((s) => hasPandoraDayGun(thirdPartySpecialState, s.seatNumber));
  }, [aliveSeats, thirdPartySpecialState]);
  const [gunHolderSeat, setGunHolderSeat] = useState<number | null>(null);
  const [gunTargetSeat, setGunTargetSeat] = useState<number | null>(null);
  const [gunNotice, setGunNotice] = useState<string | null>(null);

  const aliveWolfGirl = useMemo(
    () => seats.find((s) => s.isAlive && s.roleId === 'wolf_girl') ?? null,
    [seats],
  );
  const [wolfGirlNotice, setWolfGirlNotice] = useState<string | null>(null);

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
    <div className="divide-y divide-subtle">
      {/* 1. 偵探集結指證開膛手傑克 */}
      {isJackSecondId && (
        <div className="space-y-2 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[14px] font-semibold text-wolf">偵探集結指證</span>
            <span className="text-[12px] tabular-nums text-secondary">
              出局偵探 {deadDetectives.length} · 門檻 {requiredAgree}
            </span>
          </div>
          {conversionState?.jackRipperDetAccusationUsed ? (
            <p className="text-[12px] text-secondary">
              {conversionState.jackRipperThirdPartyDefeated
                ? '指證成功：開膛手傑克失敗。'
                : '本場指證機會已使用。'}
            </p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[12px] text-secondary">
                <span>同意人數</span>
                <button
                  type="button"
                  onClick={() => setAgreeCount((c) => Math.max(0, c - 1))}
                  className="min-h-9 min-w-9 rounded-md border border-subtle bg-canvas text-[14px] font-semibold text-primary"
                >
                  −
                </button>
                <span className="w-6 text-center text-[14px] font-semibold tabular-nums text-sheriff">
                  {agreeCount}
                </span>
                <button
                  type="button"
                  onClick={() => setAgreeCount((c) => Math.min(deadDetectives.length || 12, c + 1))}
                  className="min-h-9 min-w-9 rounded-md border border-subtle bg-canvas text-[14px] font-semibold text-primary"
                >
                  +
                </button>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {seats.map((seat) => (
                  <button
                    key={seat.seatNumber}
                    type="button"
                    disabled={disabled}
                    onClick={() => setAccusedSeat(seat.seatNumber)}
                    className={`min-h-10 rounded-md text-[12px] font-semibold tabular-nums transition ${
                      accusedSeat === seat.seatNumber
                        ? 'border-selected-wolf bg-wolf-tint text-wolf'
                        : 'border border-subtle bg-canvas text-secondary'
                    }`}
                  >
                    {formatSeatNum(seat.seatNumber)}
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
                        ? `指證 ${formatSeatNum(accusedSeat)} 號成功，第三方失敗。`
                        : `指證 ${formatSeatNum(accusedSeat)} 號失敗。`,
                    );
                  }
                }}
                className="min-h-12 w-full rounded-md bg-wolf px-4 text-[14px] font-semibold text-primary disabled:cursor-not-allowed disabled:bg-elevated disabled:text-muted"
              >
                確認指證
              </button>
              {accuseNotice && (
                <div className="border-l-2 border-sheriff pl-3 text-[12px] text-sheriff">
                  {accuseNotice}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. 潘朵拉魔盒白天手槍 */}
      {pandoraGunHolders.length > 0 && (
        <div className="space-y-2 py-3">
          <div className="text-[14px] font-semibold text-third">潘朵拉白天手槍</div>
          <div className="flex flex-wrap gap-1.5">
            {pandoraGunHolders.map((h) => (
              <button
                key={h.seatNumber}
                type="button"
                onClick={() => setGunHolderSeat(h.seatNumber)}
                className={`min-h-10 rounded-md px-2.5 text-[12px] font-semibold tabular-nums ${
                  (gunHolderSeat ?? pandoraGunHolders[0].seatNumber) === h.seatNumber
                    ? 'border-selected-third bg-third-tint text-third'
                    : 'border border-subtle bg-canvas text-secondary'
                }`}
              >
                持槍 {formatSeatNum(h.seatNumber)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {aliveSeats
              .filter((s) => s.seatNumber !== (gunHolderSeat ?? pandoraGunHolders[0].seatNumber))
              .map((s) => (
                <button
                  key={s.seatNumber}
                  type="button"
                  disabled={disabled}
                  onClick={() => setGunTargetSeat(s.seatNumber)}
                  className={`min-h-10 rounded-md text-[12px] font-semibold tabular-nums ${
                    gunTargetSeat === s.seatNumber
                      ? 'border-selected-wolf bg-wolf-tint text-wolf'
                      : 'border border-subtle bg-canvas text-secondary'
                  }`}
                >
                  {formatSeatNum(s.seatNumber)}
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
                setGunNotice(`${formatSeatNum(holder)} 號擊殺 ${formatSeatNum(gunTargetSeat)} 號。`);
                setGunTargetSeat(null);
              }
            }}
            className="min-h-12 w-full rounded-md bg-third px-4 text-[14px] font-semibold text-inverse disabled:cursor-not-allowed disabled:bg-elevated disabled:text-muted"
          >
            確認開槍
          </button>
          {gunNotice && (
            <div className="border-l-2 border-third pl-3 text-[12px] text-third">{gunNotice}</div>
          )}
        </div>
      )}

      {/* 3. 狼女孩白天自爆 */}
      {aliveWolfGirl && (
        <div className="space-y-2 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[14px] font-semibold text-sheriff tabular-nums">
              狼女孩自爆（{formatSeatNum(aliveWolfGirl.seatNumber)} 號）
            </span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                const res = wolfGirlExplode(aliveWolfGirl.seatNumber);
                if (!res.allowed) {
                  setWolfGirlNotice(res.reason ?? '無法自爆');
                }
              }}
              className="min-h-11 rounded-md bg-wolf px-3 text-[12px] font-semibold text-primary disabled:opacity-40"
            >
              自爆入夜
            </button>
          </div>
          {wolfGirlNotice && (
            <div className="border-l-2 border-wolf pl-3 text-[12px] text-wolf">{wolfGirlNotice}</div>
          )}
        </div>
      )}

      {/* 4. 蒙面平民延遲死亡 */}
      {maskedDelayedSeats.map((seat) => (
        <div key={seat.seatNumber} className="flex items-center justify-between gap-2 py-3">
          <span className="text-[14px] font-medium text-primary tabular-nums">
            蒙面人延遲出局（{formatSeatNum(seat.seatNumber)} 號）
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => triggerMaskedVillagerDelayedDeath(seat.seatNumber)}
            className="min-h-11 shrink-0 rounded-md bg-wolf px-3 text-[12px] font-semibold text-primary disabled:opacity-40"
          >
            結算出局
          </button>
        </div>
      ))}
    </div>
  );
}
