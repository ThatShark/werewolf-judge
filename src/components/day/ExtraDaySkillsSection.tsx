import { useMemo, useState } from 'react';
import {
  createInitialCombatState,
  createInitialConversionState,
  createInitialFinalBatchState,
  createInitialInterferenceState,
  createInitialThirdPartySpecialState,
  hasPandoraDayGun,
  isJackSecondIdentityBoard,
} from '../../logic';
import type { PandoraBoxItem } from '../../logic/types';
import { useGameStore } from '../../store/gameStore';
import { formatSeatNum } from '../common/displayHelpers';

interface ExtraDaySkillsSectionProps {
  disabled?: boolean;
}

const PANDORA_ITEM_LABELS: Record<PandoraBoxItem, string> = {
  knife: '小刀',
  poison: '毒藥',
  hope_light: '希望之光',
  day_gun: '白天手槍',
};

const DEFAULT_CONVERSION_STATE = Object.freeze(createInitialConversionState());
const DEFAULT_THIRD_PARTY_STATE = Object.freeze(createInitialThirdPartySpecialState());
const DEFAULT_COMBAT_STATE = Object.freeze(createInitialCombatState());
const DEFAULT_INTERFERENCE_STATE = Object.freeze(createInitialInterferenceState());
const DEFAULT_FINAL_BATCH_STATE = Object.freeze(createInitialFinalBatchState());

export function ExtraDaySkillsSection({ disabled = false }: ExtraDaySkillsSectionProps) {
  const round = useGameStore((s) => s.round);
  const selectedBoardId = useGameStore((s) => s.selectedBoardId);
  const seats = useGameStore((s) => s.seats);
  const conversionState = useGameStore((s) => s.conversionState ?? DEFAULT_CONVERSION_STATE);
  const thirdPartySpecialState = useGameStore(
    (s) => s.thirdPartySpecialState ?? DEFAULT_THIRD_PARTY_STATE,
  );
  const combatState = useGameStore((s) => s.combatState ?? DEFAULT_COMBAT_STATE);
  const interferenceState = useGameStore((s) => s.interferenceState ?? DEFAULT_INTERFERENCE_STATE);
  const finalBatchState = useGameStore((s) => s.finalBatchState ?? DEFAULT_FINAL_BATCH_STATE);

  const detectiveCollectiveAccuse = useGameStore((s) => s.detectiveCollectiveAccuse);
  const usePandoraDayGun = useGameStore((s) => s.usePandoraDayGun);
  const wolfGirlExplode = useGameStore((s) => s.wolfGirlExplode);
  const triggerMaskedVillagerDelayedDeath = useGameStore(
    (s) => s.triggerMaskedVillagerDelayedDeath,
  );
  const reviveWithAlchemySnake = useGameStore((s) => s.reviveWithAlchemySnake);
  const triggerWhiteCatDelayedDeath = useGameStore((s) => s.triggerWhiteCatDelayedDeath);
  const triggerOldRascalDelayedDeath = useGameStore((s) => s.triggerOldRascalDelayedDeath);
  const triggerBaiZeDelayedDeath = useGameStore((s) => s.triggerBaiZeDelayedDeath);
  const setBaiZeHeir = useGameStore((s) => s.setBaiZeHeir);
  const pufferfishExplode = useGameStore((s) => s.pufferfishExplode);
  const avengerAssassinate = useGameStore((s) => s.avengerAssassinate);
  const triggerNineTailsHunt = useGameStore((s) => s.triggerNineTailsHunt);
  const pandoraDayGift = useGameStore((s) => s.pandoraDayGift);
  const usePandoraHopeLight = useGameStore((s) => s.usePandoraHopeLight);
  const triggerDetectiveReveal = useGameStore((s) => s.triggerDetectiveReveal);
  const detectiveExecutePlayer = useGameStore((s) => s.detectiveExecutePlayer);
  const resolveContrarianVote = useGameStore((s) => s.resolveContrarianVote);
  const triggerSequencePrinceRevote = useGameStore((s) => s.triggerSequencePrinceRevote);
  const triggerWhiteNightRewind = useGameStore((s) => s.triggerWhiteNightRewind);

  const aliveSeats = useMemo(() => seats.filter((s) => s.isAlive), [seats]);

  // 1. 偵探集結指證
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
          s.seatNumber !== conversionState.jackRipperFanaticSeat,
      ),
    [seats, conversionState.jackRipperFanaticSeat],
  );
  const [accusedSeat, setAccusedSeat] = useState<number | null>(null);
  const [agreeCount, setAgreeCount] = useState<number>(2);
  const [accuseNotice, setAccuseNotice] = useState<string | null>(null);

  // 2. 潘朵拉白天手槍 & 贈盒 & 希望之光
  const pandoraGunHolders = useMemo(
    () => aliveSeats.filter((s) => hasPandoraDayGun(thirdPartySpecialState, s.seatNumber)),
    [aliveSeats, thirdPartySpecialState],
  );
  const [gunHolderSeat, setGunHolderSeat] = useState<number | null>(null);
  const [gunTargetSeat, setGunTargetSeat] = useState<number | null>(null);
  const [gunNotice, setGunNotice] = useState<string | null>(null);

  const alivePandora = useMemo(
    () => seats.find((s) => s.isAlive && s.roleId === 'pandora') ?? null,
    [seats],
  );
  const [pandoraGiftTarget, setPandoraGiftTarget] = useState<number | null>(null);
  const [pandoraGiftItem, setPandoraGiftItem] = useState<PandoraBoxItem | null>(null);
  const [pandoraNotice, setPandoraNotice] = useState<string | null>(null);

  const hopeLightHolders = useMemo(
    () =>
      thirdPartySpecialState.pandoraGiftHistory
        .filter((g) => g.item === 'hope_light' && !g.used)
        .map((g) => seats.find((s) => s.seatNumber === g.seat && s.isAlive))
        .filter((s): s is (typeof seats)[number] => Boolean(s)),
    [thirdPartySpecialState.pandoraGiftHistory, seats],
  );
  const [hopeLightNotice, setHopeLightNotice] = useState<string | null>(null);

  // 3. 狼女孩白天自爆
  const aliveWolfGirl = useMemo(
    () => seats.find((s) => s.isAlive && s.roleId === 'wolf_girl') ?? null,
    [seats],
  );
  const [wolfGirlNotice, setWolfGirlNotice] = useState<string | null>(null);

  // 4. 延遲死亡列
  const maskedDelayedSeats = useMemo(
    () => seats.filter((s) => s.isAlive && s.statuses.maskedDelayedDeath),
    [seats],
  );
  const whiteCatDelayedSeats = useMemo(
    () => seats.filter((s) => s.isAlive && s.statuses.whiteCatRevealed),
    [seats],
  );
  const oldRascalDelayedSeats = useMemo(
    () => seats.filter((s) => s.isAlive && s.statuses.oldRascalDelayedDeath),
    [seats],
  );
  const baiZeDelayedSeats = useMemo(
    () => seats.filter((s) => s.isAlive && s.statuses.baiZeDelayedDeath),
    [seats],
  );

  // 5. 煉金魔女法老之蛇
  const aliveAlchemyWitch = useMemo(
    () => seats.find((s) => s.isAlive && s.roleId === 'alchemy_witch') ?? null,
    [seats],
  );
  const snakeVictimSeats = useMemo(() => {
    const raw = [
      ...(interferenceState.alchemySnakePendingVictimSeats ?? []),
      ...(interferenceState.alchemySnakePendingVictimSeat != null
        ? [interferenceState.alchemySnakePendingVictimSeat]
        : []),
    ];
    return Array.from(new Set(raw)).filter((num) =>
      seats.some((s) => s.seatNumber === num && !s.isAlive),
    );
  }, [
    interferenceState.alchemySnakePendingVictimSeats,
    interferenceState.alchemySnakePendingVictimSeat,
    seats,
  ]);
  const [snakeNotice, setSnakeNotice] = useState<string | null>(null);

  // 6. 白澤繼承人
  const aliveBaiZe = useMemo(
    () => seats.find((s) => s.isAlive && s.roleId === 'bai_ze') ?? null,
    [seats],
  );
  const [baiZeHeirTarget, setBaiZeHeirTarget] = useState<number | null>(null);
  const [baiZeNotice, setBaiZeNotice] = useState<string | null>(null);

  // 7. 河豚爆破投票者
  const alivePufferfish = useMemo(
    () => seats.find((s) => s.isAlive && s.roleId === 'pufferfish') ?? null,
    [seats],
  );
  const [pufferVoterSeats, setPufferVoterSeats] = useState<number[]>([]);
  const [pufferNotice, setPufferNotice] = useState<string | null>(null);

  // 8. 復仇者刺殺
  const deadAvenger = useMemo(
    () => seats.find((s) => s.roleId === 'avenger' && !s.isAlive) ?? null,
    [seats],
  );
  const [avengerTarget, setAvengerTarget] = useState<number | null>(null);
  const [avengerNotice, setAvengerNotice] = useState<string | null>(null);

  // 9. 九尾獵殺時刻
  const aliveNineTails = useMemo(
    () => seats.find((s) => s.isAlive && s.roleId === 'nine_tails_wolf') ?? null,
    [seats],
  );
  const [nineTailsNotice, setNineTailsNotice] = useState<string | null>(null);

  // 10. 偵探 / 槓精 / 定序王子 / 白夜使者
  const aliveDetective = useMemo(
    () => seats.find((s) => s.isAlive && s.roleId === 'detective') ?? null,
    [seats],
  );
  const [detectiveTarget, setDetectiveTarget] = useState<number | null>(null);
  const [detectiveNotice, setDetectiveNotice] = useState<string | null>(null);

  const aliveContrarian = useMemo(
    () => seats.find((s) => s.isAlive && s.roleId === 'contrarian') ?? null,
    [seats],
  );
  const [contrarianTarget, setContrarianTarget] = useState<number | null>(null);
  const [contrarianMajority, setContrarianMajority] = useState<boolean>(true);
  const [contrarianNotice, setContrarianNotice] = useState<string | null>(null);

  const aliveSequencePrince = useMemo(
    () => seats.find((s) => s.isAlive && s.roleId === 'sequence_prince') ?? null,
    [seats],
  );
  const [princeNotice, setPrinceNotice] = useState<string | null>(null);

  const aliveWhiteNightEnvoy = useMemo(
    () => seats.find((s) => s.isAlive && s.roleId === 'white_night_envoy') ?? null,
    [seats],
  );
  const [whiteNightNotice, setWhiteNightNotice] = useState<string | null>(null);

  const hasSnakePanel =
    Boolean(aliveAlchemyWitch) && !interferenceState.alchemySnakeUsed && snakeVictimSeats.length > 0;
  const hasPufferPanel = Boolean(alivePufferfish) && !combatState.pufferfishBombUsed;
  const hasAvengerPanel = Boolean(deadAvenger) && !conversionState.avengerInstantWin;
  const hasDetectivePanel = Boolean(aliveDetective) && !finalBatchState.detectiveUsed;
  const hasContrarianPanel = Boolean(aliveContrarian) && !finalBatchState.contrarianUsed;
  const hasPrincePanel = Boolean(aliveSequencePrince) && !finalBatchState.sequencePrinceUsed;
  const hasWhiteNightPanel =
    round >= 2 && Boolean(aliveWhiteNightEnvoy) && !finalBatchState.whiteNightEnvoyUsed;

  const hasAnySection =
    isJackSecondId ||
    pandoraGunHolders.length > 0 ||
    Boolean(alivePandora) ||
    hopeLightHolders.length > 0 ||
    Boolean(aliveWolfGirl) ||
    maskedDelayedSeats.length > 0 ||
    whiteCatDelayedSeats.length > 0 ||
    oldRascalDelayedSeats.length > 0 ||
    baiZeDelayedSeats.length > 0 ||
    hasSnakePanel ||
    Boolean(aliveBaiZe) ||
    hasPufferPanel ||
    hasAvengerPanel ||
    Boolean(aliveNineTails) ||
    hasDetectivePanel ||
    hasContrarianPanel ||
    hasPrincePanel ||
    hasWhiteNightPanel;

  if (!hasAnySection) {
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
          {conversionState.jackRipperDetAccusationUsed ? (
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

      {/* 2. 潘朵拉白天手槍 */}
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

      {/* 2b. 潘朵拉白天贈送魔盒 */}
      {alivePandora && (
        <div className="space-y-2 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[14px] font-semibold text-third">潘朵拉白天贈盒</span>
            <span className="text-[12px] text-secondary tabular-nums">
              剩餘 {thirdPartySpecialState.pandoraRemainingBoxes.length} 盒
            </span>
          </div>
          {thirdPartySpecialState.pandoraRemainingBoxes.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-1.5">
                {thirdPartySpecialState.pandoraRemainingBoxes.map((item, idx) => (
                  <button
                    key={`${item}-${idx}`}
                    type="button"
                    disabled={disabled}
                    onClick={() => setPandoraGiftItem(item)}
                    className={`min-h-10 rounded-md px-2.5 text-[12px] font-semibold ${
                      pandoraGiftItem === item
                        ? 'border-selected-third bg-third-tint text-third'
                        : 'border border-subtle bg-canvas text-secondary'
                    }`}
                  >
                    {PANDORA_ITEM_LABELS[item]}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {aliveSeats
                  .filter((s) => s.seatNumber !== alivePandora.seatNumber)
                  .map((s) => (
                    <button
                      key={s.seatNumber}
                      type="button"
                      disabled={disabled}
                      onClick={() => setPandoraGiftTarget(s.seatNumber)}
                      className={`min-h-10 rounded-md text-[12px] font-semibold tabular-nums ${
                        pandoraGiftTarget === s.seatNumber
                          ? 'border-selected-third bg-third-tint text-third'
                          : 'border border-subtle bg-canvas text-secondary'
                      }`}
                    >
                      {formatSeatNum(s.seatNumber)}
                    </button>
                  ))}
              </div>
              <button
                type="button"
                disabled={disabled || pandoraGiftTarget === null || pandoraGiftItem === null}
                onClick={() => {
                  if (pandoraGiftTarget === null || pandoraGiftItem === null) return;
                  const res = pandoraDayGift(pandoraGiftTarget, pandoraGiftItem);
                  if (!res.allowed) {
                    setPandoraNotice(res.reason ?? '贈送失敗');
                  } else {
                    setPandoraNotice(
                      res.poisonedSeat != null
                        ? `已將毒藥贈與 ${formatSeatNum(res.poisonedSeat)} 號，立即毒死出局。`
                        : `已將「${PANDORA_ITEM_LABELS[pandoraGiftItem]}」贈與 ${formatSeatNum(pandoraGiftTarget)} 號。`,
                    );
                    setPandoraGiftTarget(null);
                    setPandoraGiftItem(null);
                  }
                }}
                className="min-h-12 w-full rounded-md bg-third px-4 text-[14px] font-semibold text-inverse disabled:cursor-not-allowed disabled:bg-elevated disabled:text-muted"
              >
                確認贈出魔盒
              </button>
            </>
          ) : (
            <p className="text-[12px] text-secondary">全部魔盒皆已贈出。</p>
          )}
          {pandoraNotice && (
            <div className="border-l-2 border-third pl-3 text-[12px] text-third">{pandoraNotice}</div>
          )}
        </div>
      )}

      {/* 2c. 潘朵拉「希望之光」發動 */}
      {hopeLightHolders.length > 0 && (
        <div className="space-y-2 py-3">
          <div className="text-[14px] font-semibold text-sheriff">希望之光</div>
          {hopeLightHolders.map((holder) => (
            <div key={holder.seatNumber} className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-medium text-primary tabular-nums">
                持有者：{formatSeatNum(holder.seatNumber)} 號
              </span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  const res = usePandoraHopeLight(holder.seatNumber);
                  if (!res.allowed) {
                    setHopeLightNotice(res.reason ?? '無法使用希望之光');
                  } else {
                    setHopeLightNotice(
                      res.triggeredWinner
                        ? `${formatSeatNum(holder.seatNumber)} 號啟動希望之光獲勝！`
                        : `${formatSeatNum(holder.seatNumber)} 號已發動希望之光，尚未達最後一人條件。`,
                    );
                  }
                }}
                className="min-h-11 rounded-md bg-sheriff px-3 text-[12px] font-semibold text-inverse disabled:opacity-40"
              >
                發動希望之光
              </button>
            </div>
          ))}
          {hopeLightNotice && (
            <div className="border-l-2 border-sheriff pl-3 text-[12px] text-sheriff">
              {hopeLightNotice}
            </div>
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

      {/* 4. 蒙面平民／白貓／老流氓／白澤繼承神職延遲死亡結算 */}
      {maskedDelayedSeats.map((seat) => (
        <div key={`masked-${seat.seatNumber}`} className="flex items-center justify-between gap-2 py-3">
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

      {whiteCatDelayedSeats.length > 0 && (
        <div className="flex items-center justify-between gap-2 py-3">
          <span className="text-[14px] font-medium text-primary tabular-nums">
            小白貓延遲出局（{whiteCatDelayedSeats.map((s) => `${formatSeatNum(s.seatNumber)}號`).join('、')}）
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => triggerWhiteCatDelayedDeath()}
            className="min-h-11 shrink-0 rounded-md bg-wolf px-3 text-[12px] font-semibold text-primary disabled:opacity-40"
          >
            結算出局
          </button>
        </div>
      )}

      {oldRascalDelayedSeats.length > 0 && (
        <div className="flex items-center justify-between gap-2 py-3">
          <span className="text-[14px] font-medium text-primary tabular-nums">
            老流氓延遲出局（{oldRascalDelayedSeats.map((s) => `${formatSeatNum(s.seatNumber)}號`).join('、')}）
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => triggerOldRascalDelayedDeath()}
            className="min-h-11 shrink-0 rounded-md bg-wolf px-3 text-[12px] font-semibold text-primary disabled:opacity-40"
          >
            結算出局
          </button>
        </div>
      )}

      {baiZeDelayedSeats.length > 0 && (
        <div className="flex items-center justify-between gap-2 py-3">
          <span className="text-[14px] font-medium text-primary tabular-nums">
            白澤神職繼承人延遲出局（
            {baiZeDelayedSeats.map((s) => `${formatSeatNum(s.seatNumber)}號`).join('、')}）
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => triggerBaiZeDelayedDeath()}
            className="min-h-11 shrink-0 rounded-md bg-wolf px-3 text-[12px] font-semibold text-primary disabled:opacity-40"
          >
            結算出局
          </button>
        </div>
      )}

      {/* 5. 煉金魔女法老之蛇救人 */}
      {hasSnakePanel && (
        <div className="space-y-2 py-3">
          <div className="text-[14px] font-semibold text-good">煉金魔女 · 法老之蛇救人</div>
          <div className="flex flex-wrap gap-1.5">
            {snakeVictimSeats.map((num) => (
              <button
                key={num}
                type="button"
                disabled={disabled}
                onClick={() => {
                  const res = reviveWithAlchemySnake(num);
                  if (!res.allowed) {
                    setSnakeNotice(res.reason ?? '救活失敗');
                  } else {
                    setSnakeNotice(`法老之蛇成功救活 ${formatSeatNum(num)} 號！`);
                  }
                }}
                className="min-h-11 rounded-md bg-good px-3 text-[12px] font-semibold text-inverse disabled:opacity-40"
              >
                救活 {formatSeatNum(num)} 號
              </button>
            ))}
          </div>
          {snakeNotice && (
            <div className="border-l-2 border-good pl-3 text-[12px] text-good">{snakeNotice}</div>
          )}
        </div>
      )}

      {/* 6. 白澤選擇繼承人 */}
      {aliveBaiZe && (
        <div className="space-y-2 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[14px] font-semibold text-third">白澤指定繼承人</span>
            {thirdPartySpecialState.baiZeHeirSeat != null && (
              <span className="text-[12px] font-semibold text-sheriff tabular-nums">
                目前：{formatSeatNum(thirdPartySpecialState.baiZeHeirSeat)} 號
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {aliveSeats
              .filter((s) => s.seatNumber !== aliveBaiZe.seatNumber)
              .map((s) => (
                <button
                  key={s.seatNumber}
                  type="button"
                  disabled={disabled}
                  onClick={() => setBaiZeHeirTarget(s.seatNumber)}
                  className={`min-h-10 rounded-md text-[12px] font-semibold tabular-nums ${
                    baiZeHeirTarget === s.seatNumber
                      ? 'border-selected-third bg-third-tint text-third'
                      : 'border border-subtle bg-canvas text-secondary'
                  }`}
                >
                  {formatSeatNum(s.seatNumber)}
                </button>
              ))}
          </div>
          <button
            type="button"
            disabled={disabled || baiZeHeirTarget === null}
            onClick={() => {
              if (baiZeHeirTarget === null) return;
              const res = setBaiZeHeir(baiZeHeirTarget);
              if (!res.allowed) {
                setBaiZeNotice(res.reason ?? '設定繼承人失敗');
              } else {
                setBaiZeNotice(`已指定 ${formatSeatNum(baiZeHeirTarget)} 號為白澤繼承人。`);
                setBaiZeHeirTarget(null);
              }
            }}
            className="min-h-12 w-full rounded-md bg-third px-4 text-[14px] font-semibold text-inverse disabled:cursor-not-allowed disabled:bg-elevated disabled:text-muted"
          >
            確認繼承人
          </button>
          {baiZeNotice && (
            <div className="border-l-2 border-third pl-3 text-[12px] text-third">{baiZeNotice}</div>
          )}
        </div>
      )}

      {/* 7. 河豚爆破投票者 */}
      {hasPufferPanel && alivePufferfish && (
        <div className="space-y-2 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[14px] font-semibold text-wolf">
              河豚翻牌爆破（{formatSeatNum(alivePufferfish.seatNumber)} 號）
            </span>
            <span className="text-[12px] text-secondary tabular-nums">
              已選 {pufferVoterSeats.length} 位投票者
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {aliveSeats
              .filter((s) => s.seatNumber !== alivePufferfish.seatNumber)
              .map((s) => {
                const picked = pufferVoterSeats.includes(s.seatNumber);
                return (
                  <button
                    key={s.seatNumber}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      setPufferVoterSeats((prev) =>
                        prev.includes(s.seatNumber)
                          ? prev.filter((n) => n !== s.seatNumber)
                          : [...prev, s.seatNumber],
                      )
                    }
                    className={`min-h-10 rounded-md text-[12px] font-semibold tabular-nums ${
                      picked
                        ? 'border-selected-wolf bg-wolf-tint text-wolf'
                        : 'border border-subtle bg-canvas text-secondary'
                    }`}
                  >
                    {formatSeatNum(s.seatNumber)}
                  </button>
                );
              })}
          </div>
          <button
            type="button"
            disabled={disabled || pufferVoterSeats.length === 0}
            onClick={() => {
              const res = pufferfishExplode(pufferVoterSeats);
              if (!res.allowed) {
                setPufferNotice(res.reason ?? '河豚自爆失敗');
              } else {
                setPufferNotice(
                  res.killedSeats && res.killedSeats.length > 0
                    ? `河豚自爆帶走：${res.killedSeats.map((n) => `${formatSeatNum(n)}號`).join('、')}`
                    : '河豚自爆（無同夥帶走或全體免疫）。',
                );
                setPufferVoterSeats([]);
              }
            }}
            className="min-h-12 w-full rounded-md bg-wolf px-4 text-[14px] font-semibold text-primary disabled:cursor-not-allowed disabled:bg-elevated disabled:text-muted"
          >
            確認河豚炸死投票者
          </button>
          {pufferNotice && (
            <div className="border-l-2 border-wolf pl-3 text-[12px] text-wolf">{pufferNotice}</div>
          )}
        </div>
      )}

      {/* 8. 復仇者出局白天刺殺 */}
      {hasAvengerPanel && (
        <div className="space-y-2 py-3">
          <div className="text-[14px] font-semibold text-third">復仇者刺殺</div>
          <div className="grid grid-cols-4 gap-1.5">
            {aliveSeats.map((s) => (
              <button
                key={s.seatNumber}
                type="button"
                disabled={disabled}
                onClick={() => setAvengerTarget(s.seatNumber)}
                className={`min-h-10 rounded-md text-[12px] font-semibold tabular-nums ${
                  avengerTarget === s.seatNumber
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
            disabled={disabled || avengerTarget === null}
            onClick={() => {
              if (avengerTarget === null) return;
              const res = avengerAssassinate(avengerTarget);
              if (!res.allowed) {
                setAvengerNotice(res.reason ?? '刺殺失敗');
              } else {
                setAvengerNotice(
                  res.killedSeat != null
                    ? `復仇者成功刺殺對立陣營 ${formatSeatNum(res.killedSeat)} 號！`
                    : `目標 ${formatSeatNum(avengerTarget)} 號為同陣營，未倒牌。`,
                );
                setAvengerTarget(null);
              }
            }}
            className="min-h-12 w-full rounded-md bg-third px-4 text-[14px] font-semibold text-inverse disabled:cursor-not-allowed disabled:bg-elevated disabled:text-muted"
          >
            確認復仇刺殺
          </button>
          {avengerNotice && (
            <div className="border-l-2 border-third pl-3 text-[12px] text-third">{avengerNotice}</div>
          )}
        </div>
      )}

      {/* 9. 九尾妖狐獵殺時刻 */}
      {aliveNineTails && (
        <div className="space-y-2 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[14px] font-semibold text-wolf">
              九尾獵殺時刻（標記 {thirdPartySpecialState.nineTailsMarkedSeats.length} 人）
            </span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                const res = triggerNineTailsHunt();
                setNineTailsNotice(
                  res.success
                    ? `九尾獵殺成功！淘汰：${res.eliminatedSeats.map((n) => `${formatSeatNum(n)}號`).join('、') || '無'}`
                    : '未滿足多數條件，九尾獵殺失敗出局。',
                );
              }}
              className="min-h-11 rounded-md bg-wolf px-3 text-[12px] font-semibold text-primary disabled:opacity-40"
            >
              發動獵殺
            </button>
          </div>
          {nineTailsNotice && (
            <div className="border-l-2 border-wolf pl-3 text-[12px] text-wolf">{nineTailsNotice}</div>
          )}
        </div>
      )}

      {/* 10. 偵探翻牌搶警徽與處決 */}
      {hasDetectivePanel && aliveDetective && (
        <div className="space-y-2 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[14px] font-semibold text-sheriff">
              偵探翻牌／處決（{formatSeatNum(aliveDetective.seatNumber)} 號）
            </span>
            {!finalBatchState.detectiveRevealedToday && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  const res = triggerDetectiveReveal();
                  setDetectiveNotice(
                    res.allowed ? '偵探已翻牌奪取警徽，今日狼隊禁自爆。' : res.reason ?? '翻牌失敗',
                  );
                }}
                className="min-h-11 rounded-md bg-sheriff px-3 text-[12px] font-semibold text-inverse disabled:opacity-40"
              >
                翻牌奪徽
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {aliveSeats
              .filter((s) => s.seatNumber !== aliveDetective.seatNumber)
              .map((s) => (
                <button
                  key={s.seatNumber}
                  type="button"
                  disabled={disabled}
                  onClick={() => setDetectiveTarget(s.seatNumber)}
                  className={`min-h-10 rounded-md text-[12px] font-semibold tabular-nums ${
                    detectiveTarget === s.seatNumber
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
            disabled={disabled || detectiveTarget === null}
            onClick={() => {
              if (detectiveTarget === null) return;
              const res = detectiveExecutePlayer(detectiveTarget);
              if (!res.allowed) {
                setDetectiveNotice(res.reason ?? '處決失敗');
              } else {
                setDetectiveNotice(
                  `偵探處決 ${formatSeatNum(detectiveTarget)} 號（今晚警犬激活${res.targetWasWolf ? '查驗' : '撕咬'}）。`,
                );
                setDetectiveTarget(null);
              }
            }}
            className="min-h-12 w-full rounded-md bg-wolf px-4 text-[14px] font-semibold text-primary disabled:cursor-not-allowed disabled:bg-elevated disabled:text-muted"
          >
            確認偵探處決
          </button>
          {detectiveNotice && (
            <div className="border-l-2 border-sheriff pl-3 text-[12px] text-sheriff">
              {detectiveNotice}
            </div>
          )}
        </div>
      )}

      {/* 11. 槓精白天開槓 */}
      {hasContrarianPanel && aliveContrarian && (
        <div className="space-y-2 py-3">
          <div className="text-[14px] font-semibold text-third">
            槓精開槓（{formatSeatNum(aliveContrarian.seatNumber)} 號）
          </div>
          <div className="flex gap-1.5">
            {[
              { val: true, label: '多數贊成（禁投處決）' },
              { val: false, label: '未過半（反制）' },
            ].map((opt) => (
              <button
                key={String(opt.val)}
                type="button"
                onClick={() => setContrarianMajority(opt.val)}
                className={`min-h-10 flex-1 rounded-md text-[12px] font-semibold ${
                  contrarianMajority === opt.val
                    ? 'border-selected-third bg-third-tint text-third'
                    : 'border border-subtle bg-canvas text-secondary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {aliveSeats
              .filter((s) => s.seatNumber !== aliveContrarian.seatNumber)
              .map((s) => (
                <button
                  key={s.seatNumber}
                  type="button"
                  disabled={disabled}
                  onClick={() => setContrarianTarget(s.seatNumber)}
                  className={`min-h-10 rounded-md text-[12px] font-semibold tabular-nums ${
                    contrarianTarget === s.seatNumber
                      ? 'border-selected-third bg-third-tint text-third'
                      : 'border border-subtle bg-canvas text-secondary'
                  }`}
                >
                  {formatSeatNum(s.seatNumber)}
                </button>
              ))}
          </div>
          <button
            type="button"
            disabled={disabled || contrarianTarget === null}
            onClick={() => {
              if (contrarianTarget === null) return;
              const res = resolveContrarianVote(contrarianTarget, contrarianMajority);
              if (!res.allowed) {
                setContrarianNotice(res.reason ?? '開槓失敗');
              } else {
                setContrarianNotice(
                  res.silencedVoterSeat != null
                    ? `開槓完成：${formatSeatNum(res.silencedVoterSeat)} 號今日失去投票權。`
                    : `已結算槓精對 ${formatSeatNum(contrarianTarget)} 號開槓結果。`,
                );
                setContrarianTarget(null);
              }
            }}
            className="min-h-12 w-full rounded-md bg-third px-4 text-[14px] font-semibold text-inverse disabled:cursor-not-allowed disabled:bg-elevated disabled:text-muted"
          >
            確認開槓結算
          </button>
          {contrarianNotice && (
            <div className="border-l-2 border-third pl-3 text-[12px] text-third">
              {contrarianNotice}
            </div>
          )}
        </div>
      )}

      {/* 12. 定序王子重新發言／投票 */}
      {hasPrincePanel && aliveSequencePrince && (
        <div className="space-y-2 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[14px] font-semibold text-good">
              定序王子重投（{formatSeatNum(aliveSequencePrince.seatNumber)} 號）
            </span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                const res = triggerSequencePrinceRevote();
                setPrinceNotice(
                  res.allowed ? '已還原放逐前狀態，請重新進行發言與投票！' : res.reason ?? '發動失敗',
                );
              }}
              className="min-h-11 rounded-md bg-good px-3 text-[12px] font-semibold text-inverse disabled:opacity-40"
            >
              翻牌重投
            </button>
          </div>
          {princeNotice && (
            <div className="border-l-2 border-good pl-3 text-[12px] text-good">{princeNotice}</div>
          )}
        </div>
      )}

      {/* 13. 白夜使者時間回溯 */}
      {hasWhiteNightPanel && aliveWhiteNightEnvoy && (
        <div className="space-y-2 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[14px] font-semibold text-sheriff">
              白夜使者時間回溯（{formatSeatNum(aliveWhiteNightEnvoy.seatNumber)} 號）
            </span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                const res = triggerWhiteNightRewind();
                if (!res.allowed) {
                  setWhiteNightNotice(res.reason ?? '時間回溯失敗');
                }
              }}
              className="min-h-11 rounded-md bg-sheriff px-3 text-[12px] font-semibold text-inverse disabled:opacity-40"
            >
              回溯重跑昨夜
            </button>
          </div>
          {whiteNightNotice && (
            <div className="border-l-2 border-sheriff pl-3 text-[12px] text-sheriff">
              {whiteNightNotice}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
