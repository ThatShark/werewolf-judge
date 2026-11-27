import { getRoleById } from '../data/roles';
import type {
  BoardDefinition,
  DayHistoryEntry,
  DayStructuredEvent,
  GameState,
  GameWinner,
  NightHistoryEntry,
  PlayerSeat,
  RoleCategory,
  VoteRoundRecord,
} from './types';

export type SummaryWinnerTone = 'good' | 'wolf' | 'third_party' | 'draw' | 'ongoing';

export interface SummaryHeaderData {
  dateTimeText: string;
  boardTitle: string;
  boardName: string;
  winnerLabel: string;
  winnerTone: SummaryWinnerTone;
}

export interface SummaryPlayerColumn {
  seatNumber: number;
  seatCode: string;
  nickname: string;
  roleName: string;
  roleCategory: RoleCategory;
  subNote: string;
  isAlive: boolean;
}

export interface SummaryVoteRow {
  label: string;
  /** 與 players 陣列對齊之每座格文字（座號數字 / 'X' 棄票 / '-' 無票權 / '自爆'） */
  cells: string[];
  /** 若該輪有平票或特殊標記可作為次要提示 */
  isPk: boolean;
}

export interface SummarySheriffBlock {
  /** 與 players 陣列對齊：'上警' | '退水*' | '' */
  signUpCells: string[];
  voteRows: SummaryVoteRow[];
  /** 最終警長競選當選座號（用來於對應欄位標記 ★） */
  electedSeat: number | null;
  /** 若吞警徽／流局等無警長狀態的簡短註記 */
  statusNote: string | null;
}

export interface SummaryNightRow {
  key: string;
  label: string;
  category: RoleCategory;
  /** 與 nightRounds 對齊之每晚簡碼（空刀='空'、未使用='X'、例：'救6'、'毒11'、'7好'） */
  cells: string[];
}

export interface SummaryNightMatrix {
  rounds: number[];
  roundLabels: string[];
  rows: SummaryNightRow[];
}

export interface SummaryDayColumn {
  round: number;
  label: string;
  /** 僅記錄當日白天放逐投票出局的座號（平安日或無人被放逐顯示 'X'） */
  exileText: string;
  /** 單獨記錄該輪的開槍帶人、狼人自爆、騎士決鬥、殉情／連帶出局等技能事件（無則顯示 '無'） */
  daySkillsText: string;
  /** 彙整該輪所有出局座號（無人出局顯示 '平安'） */
  eliminatedText: string;
}

export interface GameSummaryMatrix {
  header: SummaryHeaderData;
  players: SummaryPlayerColumn[];
  sheriff: SummarySheriffBlock | null;
  dayVoteRows: SummaryVoteRow[];
  nightMatrix: SummaryNightMatrix;
  daySummaryColumns: SummaryDayColumn[];
}

export type GameSummaryInput = Pick<
  GameState,
  'round' | 'seats' | 'winner' | 'sheriffState' | 'ruleOverrides' | 'nightHistory' | 'dayHistory'
> &
  Partial<
    Pick<
      GameState,
      'mechWolfState' | 'hybridState' | 'conversionState' | 'thirdPartySpecialState'
    >
  >;

const SHORT_ROLE_ABBR: Record<string, string> = {
  seer: '預',
  witch: '女',
  hunter: '獵',
  guard: '守',
  idiot: '白',
  knight: '騎',
  psychic: '通',
  dream_catcher: '攝',
  demon_hunter: '獵魔',
  gravekeeper: '墓',
  bear: '熊',
  crow: '鴉',
  magician: '魔',
  mute_elder: '禁',
  wolf: '狼',
  wolf_king: '狼王',
  white_wolf_king: '白狼',
  evil_knight: '惡靈',
  nightmare: '夢魘',
  mech_wolf: '機狼',
  wolf_beauty: '狼美',
  seed_wolf: '種狼',
  gargoyle: '石像',
  wolf_witch: '狼巫',
  villager: '民',
};

function getShortRoleLabel(roleId: string | null | undefined): string {
  if (!roleId) return '';
  if (SHORT_ROLE_ABBR[roleId]) return SHORT_ROLE_ABBR[roleId];
  const role = getRoleById(roleId);
  if (!role) return roleId;
  return role.name.slice(0, 2);
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function formatSummaryDateTime(now: Date = new Date()): string {
  return `${now.getFullYear()}/${pad2(now.getMonth() + 1)}/${pad2(now.getDate())} ${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
}

export function buildSummaryImageFilename(boardName?: string, now: Date = new Date()): string {
  const datePart = `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}`;
  const safeBoard = (boardName ?? '自訂板子')
    .replace(/[\\/:*?"<>|\s]+/g, '')
    .trim();
  return `狼人殺復盤_${datePart}_${safeBoard || '對局'}.png`;
}

function getWinnerMeta(winner: GameWinner | null): {
  label: string;
  tone: SummaryWinnerTone;
} {
  if (winner === 'good') return { label: '好人獲勝', tone: 'good' };
  if (winner === 'wolf') return { label: '狼人獲勝', tone: 'wolf' };
  if (winner === 'third_party') return { label: '第三方獲勝', tone: 'third_party' };
  if (winner === 'draw') return { label: '本局平局', tone: 'draw' };
  return { label: '對局進行中', tone: 'ongoing' };
}

function buildPlayerSubNote(seat: PlayerSeat, state: GameSummaryInput): string {
  const notes: string[] = [];
  if (seat.statuses.infectedBySeedWolf) notes.push('感染');
  if (seat.statuses.convertedByAwakenedGargoyle) notes.push('轉化');
  if (seat.statuses.infectedByZombie) notes.push('殭屍');
  if (seat.statuses.isPuppetized) notes.push('傀儡');
  if (seat.statuses.baiZeDualFaction) notes.push('雙陣營');
  if (seat.statuses.idiotRevealed) notes.push('翻牌');
  if (seat.secondRoleId === 'jack_the_ripper') notes.push('傑克');
  else if (seat.secondRoleId === 'fanatic') notes.push('狂熱粉');
  else if (seat.secondRoleId === 'detective') notes.push('偵探');

  if (seat.roleId === 'mech_wolf' && state.mechWolfState?.learnedRoleId) {
    notes.push(`學:${getShortRoleLabel(state.mechWolfState.learnedRoleId)}`);
  }
  if (seat.roleId === 'hybrid' && state.hybridState?.idolSeat != null) {
    notes.push(`榜${state.hybridState.idolSeat}`);
  }
  if (seat.roleId === 'wild_child' && state.conversionState?.wildChildIdolSeat != null) {
    notes.push(`榜${state.conversionState.wildChildIdolSeat}`);
  }
  return notes.join('·');
}

function resolveVoteCell(
  record: VoteRoundRecord,
  seatNumber: number,
): string {
  const target = record.votes[seatNumber];
  if (typeof target === 'number') {
    return String(target);
  }
  if (record.abstainers.includes(seatNumber)) {
    return 'X';
  }
  if (record.eligibleVoters && record.eligibleVoters.includes(seatNumber)) {
    return 'X';
  }
  if (Object.prototype.hasOwnProperty.call(record.votes, seatNumber) && target === null) {
    return 'X';
  }
  return '-';
}

function buildSheriffBlock(
  state: GameSummaryInput,
  sortedSeats: PlayerSeat[],
): SummarySheriffBlock | null {
  if (state.ruleOverrides.enableSheriff === false) {
    return null;
  }

  const sheriff = state.sheriffState;
  const withdrawnSet = new Set(sheriff.withdrawnSeats);
  const initialCandidates =
    sheriff.initialCandidates && sheriff.initialCandidates.length > 0
      ? sheriff.initialCandidates
      : Array.from(new Set([...sheriff.candidates, ...sheriff.withdrawnSeats])).sort(
          (a, b) => a - b,
        );
  const initialSet = new Set(initialCandidates);

  const signUpCells = sortedSeats.map((seat) => {
    if (withdrawnSet.has(seat.seatNumber)) return '退水*';
    if (initialSet.has(seat.seatNumber)) return '上警';
    return '';
  });

  const voteRows: SummaryVoteRow[] = sheriff.voteRounds.map((record, idx) => ({
    label: idx === 0 ? '警長投票' : idx === 1 ? '警長PK投票' : `警長PK${idx}投票`,
    isPk: idx > 0,
    cells: sortedSeats.map((seat) => resolveVoteCell(record, seat.seatNumber)),
  }));

  const electedFromVotes =
    sheriff.voteRounds.find((r) => r.electedSeat != null)?.electedSeat ?? null;
  const electedSeat =
    sheriff.initialElectedSeat ??
    electedFromVotes ??
    (sheriff.status === 'elected' ? sheriff.sheriffSeat : null);

  let statusNote: string | null = null;
  if (sheriff.badgeStatus === 'swallowed' || sheriff.status === 'swallowed') {
    statusNote = '吞警徽';
  } else if (sheriff.status === 'no_sheriff') {
    statusNote = '無警長';
  } else if (sheriff.badgeStatus === 'destroyed') {
    statusNote = '已撕徽';
  }

  return {
    signUpCells,
    voteRows,
    electedSeat,
    statusNote,
  };
}

function getExplodedSeatsForDay(dayEntry: DayHistoryEntry | undefined): Set<number> {
  const result = new Set<number>();
  if (!dayEntry?.structuredEvents) return result;
  for (const evt of dayEntry.structuredEvents) {
    if (
      (evt.type === 'self_explode' ||
        evt.type === 'white_wolf_king_explode' ||
        evt.type === 'good_self_explode') &&
      evt.actorSeat != null
    ) {
      result.add(evt.actorSeat);
    }
  }
  return result;
}

function buildDayVoteRows(
  state: GameSummaryInput,
  sortedSeats: PlayerSeat[],
): SummaryVoteRow[] {
  const rows: SummaryVoteRow[] = [];
  const sortedDays = [...state.dayHistory].sort((a, b) => a.round - b.round);

  for (const dayEntry of sortedDays) {
    const structured = dayEntry.structuredEvents ?? [];
    const voteEvents = structured.filter(
      (evt): evt is DayStructuredEvent & { voteRecord: VoteRoundRecord } =>
        (evt.type === 'exile_vote' || evt.type === 'exile_pk') && Boolean(evt.voteRecord),
    );
    const explodedSeats = getExplodedSeatsForDay(dayEntry);

    if (voteEvents.length > 0) {
      voteEvents.forEach((evt, idx) => {
        const record = evt.voteRecord;
        const isPk = idx > 0 || record.roundIndex >= 2;
        const label =
          idx === 0
            ? `Day ${dayEntry.round} 投票`
            : idx === 1
              ? `Day ${dayEntry.round} PK投票`
              : `Day ${dayEntry.round} 重投${idx}`;
        const cells = sortedSeats.map((seat) => {
          const voteCell = resolveVoteCell(record, seat.seatNumber);
          if (voteCell === '-' && explodedSeats.has(seat.seatNumber)) {
            return '自爆';
          }
          return voteCell;
        });
        rows.push({ label, isPk, cells });
      });
    } else if (explodedSeats.size > 0) {
      rows.push({
        label: `Day ${dayEntry.round} 投票`,
        isPk: false,
        cells: sortedSeats.map((seat) => (explodedSeats.has(seat.seatNumber) ? '自爆' : '-')),
      });
    }
  }

  return rows;
}

interface NightSkillRowSpec {
  roleIds: string[];
  key: string;
  label: string;
  category: RoleCategory;
  hasAnyAction: (history: NightHistoryEntry[]) => boolean;
  formatCell: (entry: NightHistoryEntry, state: GameSummaryInput) => string;
}

const NIGHT_SKILL_SPECS: NightSkillRowSpec[] = [
  {
    roleIds: ['nightmare'],
    key: 'nightmare',
    label: '夢魘',
    category: 'wolf',
    hasAnyAction: (h) => h.some((e) => e.draft.nightmareFearTarget != null),
    formatCell: (e) =>
      e.draft.nightmareFearTarget != null ? `恐${e.draft.nightmareFearTarget}` : 'X',
  },
  {
    roleIds: ['mech_wolf'],
    key: 'mech_wolf',
    label: '機械狼',
    category: 'wolf',
    hasAnyAction: (h) =>
      h.some((e) => e.draft.mechWolfLearnTarget !== null || e.draft.mechWolfSkillTarget !== null),
    formatCell: (e, state) => {
      const parts: string[] = [];
      if (e.draft.mechWolfLearnTarget !== null) {
        const learnedId = e.mechWolfLearnedRoleId ?? state.mechWolfState?.learnedRoleId ?? null;
        const abbr = getShortRoleLabel(learnedId);
        parts.push(`學${e.draft.mechWolfLearnTarget}${abbr}`);
      }
      if (e.draft.mechWolfSkillTarget !== null) {
        const res = e.mechWolfPsychicResult;
        const suffix = res ? getShortRoleLabel(res.perceivedRoleId) : '';
        parts.push(`技${e.draft.mechWolfSkillTarget}${suffix}`);
      }
      return parts.length > 0 ? parts.join('/') : 'X';
    },
  },
  {
    roleIds: ['witch'],
    key: 'witch',
    label: '女巫',
    category: 'god',
    hasAnyAction: (h) =>
      h.some((e) => e.draft.witchUseAntidote || e.draft.witchPoisonTarget !== null),
    formatCell: (e) => {
      const parts: string[] = [];
      if (e.draft.witchUseAntidote) {
        parts.push(e.draft.wolfTarget !== null ? `救${e.draft.wolfTarget}` : '救');
      }
      if (e.draft.witchPoisonTarget !== null) {
        parts.push(`毒${e.draft.witchPoisonTarget}`);
      }
      if (e.draft.witchSecondPoisonTarget != null) {
        parts.push(`毒${e.draft.witchSecondPoisonTarget}`);
      }
      return parts.length > 0 ? parts.join('/') : 'X';
    },
  },
  {
    roleIds: ['awakened_witch'],
    key: 'awakened_witch',
    label: '覺醒女巫',
    category: 'god',
    hasAnyAction: (h) =>
      h.some((e) => Boolean(e.draft.awakenedWitchUseAntidote) || e.draft.awakenedWitchPoisonTarget != null),
    formatCell: (e) => {
      const parts: string[] = [];
      if (e.draft.awakenedWitchUseAntidote) {
        parts.push(e.draft.wolfTarget !== null ? `救${e.draft.wolfTarget}` : '救');
      }
      if (e.draft.awakenedWitchPoisonTarget != null) {
        parts.push(`毒${e.draft.awakenedWitchPoisonTarget}`);
      }
      return parts.length > 0 ? parts.join('/') : 'X';
    },
  },
  {
    roleIds: ['seer'],
    key: 'seer',
    label: '預言家',
    category: 'god',
    hasAnyAction: (h) => h.some((e) => e.draft.seerCheckTarget !== null),
    formatCell: (e) => {
      if (e.draft.seerCheckTarget === null) return 'X';
      const f = e.seerResult?.faction;
      const tag = f === 'wolf' ? '狼' : f === 'good' ? '好' : '';
      return `${e.draft.seerCheckTarget}${tag}`;
    },
  },
  {
    roleIds: ['awakened_seer'],
    key: 'awakened_seer',
    label: '覺醒預言家',
    category: 'god',
    hasAnyAction: (h) =>
      h.some((e) => e.draft.awakenedSeerTargets?.[0] != null && e.draft.awakenedSeerTargets?.[1] != null),
    formatCell: (e) => {
      const pair = e.draft.awakenedSeerTargets;
      if (!pair || pair[0] == null || pair[1] == null) return 'X';
      const tag =
        e.awakenedSeerResult?.result === 'double_good'
          ? '雙好'
          : e.awakenedSeerResult
            ? '含狼'
            : '';
      return `${pair[0]},${pair[1]}${tag}`;
    },
  },
  {
    roleIds: ['psychic'],
    key: 'psychic',
    label: '通靈師',
    category: 'god',
    hasAnyAction: (h) => h.some((e) => e.draft.psychicCheckTarget !== null),
    formatCell: (e) => {
      if (e.draft.psychicCheckTarget === null) return 'X';
      const abbr = e.psychicResult ? getShortRoleLabel(e.psychicResult.perceivedRoleId) : '';
      return `${e.draft.psychicCheckTarget}${abbr}`;
    },
  },
  {
    roleIds: ['guard'],
    key: 'guard',
    label: '守衛',
    category: 'god',
    hasAnyAction: (h) => h.some((e) => e.draft.guardTarget !== null),
    formatCell: (e) => {
      if (e.draft.guardTarget === null) return 'X';
      if (e.draft.guardSecondTarget != null) {
        return `守${e.draft.guardTarget}/${e.draft.guardSecondTarget}`;
      }
      return `守${e.draft.guardTarget}`;
    },
  },
  {
    roleIds: ['dream_catcher'],
    key: 'dream_catcher',
    label: '攝夢人',
    category: 'god',
    hasAnyAction: (h) => h.some((e) => e.draft.dreamCatcherTarget != null),
    formatCell: (e) => (e.draft.dreamCatcherTarget != null ? `夢${e.draft.dreamCatcherTarget}` : 'X'),
  },
  {
    roleIds: ['awakened_dream_catcher'],
    key: 'awakened_dream_catcher',
    label: '覺醒攝夢',
    category: 'god',
    hasAnyAction: (h) => h.some((e) => e.draft.awakenedDreamTarget != null),
    formatCell: (e) => {
      if (e.draft.awakenedDreamTarget == null) return 'X';
      const kill = e.awakenedDreamResult?.killedByDream ? '殺' : '';
      return `夢${e.draft.awakenedDreamTarget}${kill}`;
    },
  },
  {
    roleIds: ['demon_hunter'],
    key: 'demon_hunter',
    label: '獵魔人',
    category: 'god',
    hasAnyAction: (h) => h.some((e) => e.draft.demonHunterTarget != null),
    formatCell: (e) => (e.draft.demonHunterTarget != null ? `狩${e.draft.demonHunterTarget}` : 'X'),
  },
  {
    roleIds: ['mute_elder'],
    key: 'mute_elder',
    label: '禁言長老',
    category: 'god',
    hasAnyAction: (h) => h.some((e) => e.draft.muteElderTarget != null),
    formatCell: (e) => (e.draft.muteElderTarget != null ? `禁${e.draft.muteElderTarget}` : 'X'),
  },
  {
    roleIds: ['wolf_beauty'],
    key: 'wolf_beauty',
    label: '狼美人',
    category: 'wolf',
    hasAnyAction: (h) => h.some((e) => e.draft.wolfBeautyCharmTarget != null),
    formatCell: (e) =>
      e.draft.wolfBeautyCharmTarget != null ? `魅${e.draft.wolfBeautyCharmTarget}` : 'X',
  },
  {
    roleIds: ['seed_wolf'],
    key: 'seed_wolf',
    label: '種狼',
    category: 'wolf',
    hasAnyAction: (h) => h.some((e) => e.draft.seedWolfInfectTarget != null),
    formatCell: (e) =>
      e.draft.seedWolfInfectTarget != null ? `感${e.draft.seedWolfInfectTarget}` : 'X',
  },
  {
    roleIds: ['masked_wolf'],
    key: 'masked_wolf',
    label: '假面',
    category: 'wolf',
    hasAnyAction: (h) =>
      h.some((e) => e.draft.maskedWolfCheckTarget != null || e.draft.maskedWolfAlterTarget != null),
    formatCell: (e) => {
      const parts: string[] = [];
      if (e.draft.maskedWolfCheckTarget != null) {
        const res = e.maskedWolfCheckResult;
        const tag = res ? (res.inDanceFloor ? '舞' : '外') : '';
        parts.push(`探${e.draft.maskedWolfCheckTarget}${tag}`);
      }
      if (e.draft.maskedWolfAlterTarget != null) {
        parts.push(`改${e.draft.maskedWolfAlterTarget}`);
      }
      return parts.length > 0 ? parts.join('/') : 'X';
    },
  },
  {
    roleIds: ['dancer'],
    key: 'dancer',
    label: '舞者',
    category: 'god',
    hasAnyAction: (h) => h.some((e) => (e.draft.dancerFloorTargets?.length ?? 0) > 0),
    formatCell: (e) => {
      const targets = e.draft.dancerFloorTargets;
      return targets && targets.length > 0 ? `舞${targets.join(',')}` : 'X';
    },
  },
  {
    roleIds: ['happy_sheep'],
    key: 'happy_sheep',
    label: '喜羊羊',
    category: 'god',
    hasAnyAction: (h) => h.some((e) => e.draft.happySheepTarget != null),
    formatCell: (e) => {
      if (e.draft.happySheepTarget == null) return 'X';
      const prefix = e.draft.happySheepMode === 'anti_theft' ? '防' : '守';
      return `${prefix}${e.draft.happySheepTarget}`;
    },
  },
  {
    roleIds: ['grey_wolf_boss'],
    key: 'grey_wolf_boss',
    label: '灰太狼',
    category: 'wolf',
    hasAnyAction: (h) =>
      h.some((e) => e.draft.greyWolfBossStealTarget != null || e.draft.greyWolfBossUseSkillTarget != null),
    formatCell: (e) => {
      const parts: string[] = [];
      if (e.draft.greyWolfBossStealTarget != null) {
        parts.push(`偷${e.draft.greyWolfBossStealTarget}`);
      }
      if (e.draft.greyWolfBossUseSkillTarget != null) {
        const res = e.greyWolfBossSeerResult;
        const tag = res ? (res.faction === 'wolf' ? '狼' : '好') : '';
        parts.push(`用${e.draft.greyWolfBossUseSkillTarget}${tag}`);
      }
      return parts.length > 0 ? parts.join('/') : 'X';
    },
  },
  {
    roleIds: ['magician'],
    key: 'magician',
    label: '魔術師',
    category: 'god',
    hasAnyAction: (h) =>
      h.some((e) => e.draft.magicianSwapPair?.[0] != null && e.draft.magicianSwapPair?.[1] != null),
    formatCell: (e) => {
      const p = e.draft.magicianSwapPair;
      return p?.[0] != null && p?.[1] != null ? `${p[0]}⇄${p[1]}` : 'X';
    },
  },
  {
    roleIds: ['penguin'],
    key: 'penguin',
    label: '企鵝',
    category: 'god',
    hasAnyAction: (h) => h.some((e) => e.draft.penguinFreezeTarget != null),
    formatCell: (e) => (e.draft.penguinFreezeTarget != null ? `凍${e.draft.penguinFreezeTarget}` : 'X'),
  },
  {
    roleIds: ['crow'],
    key: 'crow',
    label: '烏鴉',
    category: 'god',
    hasAnyAction: (h) => h.some((e) => e.draft.crowCurseTarget != null),
    formatCell: (e) => (e.draft.crowCurseTarget != null ? `咒${e.draft.crowCurseTarget}` : 'X'),
  },
  {
    roleIds: ['gargoyle'],
    key: 'gargoyle',
    label: '石像鬼',
    category: 'wolf',
    hasAnyAction: (h) => h.some((e) => e.draft.gargoyleCheckTarget != null),
    formatCell: (e) => {
      if (e.draft.gargoyleCheckTarget == null) return 'X';
      const abbr = e.gargoyleResult ? getShortRoleLabel(e.gargoyleResult.perceivedRoleId) : '';
      return `${e.draft.gargoyleCheckTarget}${abbr}`;
    },
  },
  {
    roleIds: ['wolf_witch'],
    key: 'wolf_witch',
    label: '狼巫',
    category: 'wolf',
    hasAnyAction: (h) => h.some((e) => e.draft.wolfWitchCheckTarget != null),
    formatCell: (e) => {
      if (e.draft.wolfWitchCheckTarget == null) return 'X';
      const abbr = e.wolfWitchResult ? getShortRoleLabel(e.wolfWitchResult.perceivedRoleId) : '';
      return `${e.draft.wolfWitchCheckTarget}${abbr}`;
    },
  },
  {
    roleIds: ['pure_white'],
    key: 'pure_white',
    label: '純白之女',
    category: 'god',
    hasAnyAction: (h) => h.some((e) => e.draft.pureWhiteCheckTarget != null),
    formatCell: (e) => {
      if (e.draft.pureWhiteCheckTarget == null) return 'X';
      const abbr = e.pureWhiteResult ? getShortRoleLabel(e.pureWhiteResult.perceivedRoleId) : '';
      return `${e.draft.pureWhiteCheckTarget}${abbr}`;
    },
  },
  {
    roleIds: ['fox'],
    key: 'fox',
    label: '狐狸',
    category: 'god',
    hasAnyAction: (h) => h.some((e) => e.draft.foxCheckTarget != null),
    formatCell: (e) => {
      if (e.draft.foxCheckTarget == null) return 'X';
      const tag = e.foxResult ? (e.foxResult.hasWolf ? '有狼' : '無狼') : '';
      return `${e.draft.foxCheckTarget}${tag}`;
    },
  },
  {
    roleIds: ['gravekeeper', 'super_gravekeeper'],
    key: 'gravekeeper',
    label: '守墓人',
    category: 'god',
    hasAnyAction: (h) => h.some((e) => e.gravekeeperResult?.exiledSeat != null),
    formatCell: (e) => {
      const r = e.gravekeeperResult;
      if (!r || r.exiledSeat == null) return 'X';
      return `${r.exiledSeat}${r.faction === 'wolf' ? '狼' : '好'}`;
    },
  },
  {
    roleIds: ['bear'],
    key: 'bear',
    label: '熊',
    category: 'god',
    hasAnyAction: (h) => h.some((e) => e.bearRoar != null),
    formatCell: (e) => {
      if (!e.bearRoar) return 'X';
      return e.bearRoar.roared ? '咆哮' : '靜默';
    },
  },
  {
    roleIds: ['poisoner'],
    key: 'poisoner',
    label: '毒師',
    category: 'god',
    hasAnyAction: (h) => h.some((e) => e.draft.poisonerTarget != null),
    formatCell: (e) => (e.draft.poisonerTarget != null ? `毒${e.draft.poisonerTarget}` : 'X'),
  },
  {
    roleIds: ['socialite'],
    key: 'socialite',
    label: '名媛',
    category: 'god',
    hasAnyAction: (h) => h.some((e) => e.draft.socialiteTarget != null),
    formatCell: (e) => (e.draft.socialiteTarget != null ? `寵${e.draft.socialiteTarget}` : 'X'),
  },
  {
    roleIds: ['medusa'],
    key: 'medusa',
    label: '梅杜莎',
    category: 'wolf',
    hasAnyAction: (h) => h.some((e) => e.draft.medusaPetrifyTarget != null),
    formatCell: (e) => (e.draft.medusaPetrifyTarget != null ? `石${e.draft.medusaPetrifyTarget}` : 'X'),
  },
  {
    roleIds: ['time_eclipse_wolf'],
    key: 'time_eclipse_wolf',
    label: '蝕時狼妃',
    category: 'wolf',
    hasAnyAction: (h) => h.some((e) => e.draft.timeEclipseTarget != null),
    formatCell: (e) => (e.draft.timeEclipseTarget != null ? `封${e.draft.timeEclipseTarget}` : 'X'),
  },
  {
    roleIds: ['eclipse_maid'],
    key: 'eclipse_maid',
    label: '蝕日侍女',
    category: 'wolf',
    hasAnyAction: (h) =>
      h.some((e) => e.draft.eclipseMaidDevourTarget != null || e.draft.eclipseMaidUseSkillTarget != null),
    formatCell: (e) => {
      const parts: string[] = [];
      if (e.draft.eclipseMaidDevourTarget != null) parts.push(`吞${e.draft.eclipseMaidDevourTarget}`);
      if (e.draft.eclipseMaidUseSkillTarget != null) {
        const res = e.eclipseMaidCheckResult;
        const tag = res?.faction ? (res.faction === 'wolf' ? '狼' : '好') : '';
        parts.push(`用${e.draft.eclipseMaidUseSkillTarget}${tag}`);
      }
      return parts.length > 0 ? parts.join('/') : 'X';
    },
  },
  {
    roleIds: ['miracle_merchant'],
    key: 'miracle_merchant',
    label: '奇蹟商人',
    category: 'god',
    hasAnyAction: (h) => h.some((e) => e.draft.miracleMerchantTarget != null),
    formatCell: (e) =>
      e.draft.miracleMerchantTarget != null ? `贈${e.draft.miracleMerchantTarget}` : 'X',
  },
  {
    roleIds: ['black_market_merchant'],
    key: 'black_market_merchant',
    label: '黑市商人',
    category: 'god',
    hasAnyAction: (h) => h.some((e) => e.draft.blackMarketTarget != null),
    formatCell: (e) => (e.draft.blackMarketTarget != null ? `贈${e.draft.blackMarketTarget}` : 'X'),
  },
  {
    roleIds: ['evil_merchant'],
    key: 'evil_merchant',
    label: '邪惡商人',
    category: 'wolf',
    hasAnyAction: (h) => h.some((e) => e.draft.evilMerchantTarget != null),
    formatCell: (e) => (e.draft.evilMerchantTarget != null ? `贈${e.draft.evilMerchantTarget}` : 'X'),
  },
  {
    roleIds: ['cupid'],
    key: 'cupid',
    label: '邱比特',
    category: 'third_party',
    hasAnyAction: (h) =>
      h.some((e) => e.draft.cupidLoversPair?.[0] != null && e.draft.cupidLoversPair?.[1] != null),
    formatCell: (e) => {
      const p = e.draft.cupidLoversPair;
      return p?.[0] != null && p?.[1] != null ? `${p[0]}♥${p[1]}` : 'X';
    },
  },
];

function collectPresentRoleIds(state: GameSummaryInput, board?: BoardDefinition): Set<string> {
  const ids = new Set<string>();
  for (const seat of state.seats) {
    if (seat.roleId) ids.add(seat.roleId);
    if (seat.secondRoleId) ids.add(seat.secondRoleId);
  }
  if (board) {
    for (const s of board.composition.wolf) ids.add(s.roleId);
    for (const s of board.composition.good) ids.add(s.roleId);
    for (const s of board.composition.thirdParty ?? []) ids.add(s.roleId);
  }
  return ids;
}

function buildNightMatrix(
  state: GameSummaryInput,
  board?: BoardDefinition,
): SummaryNightMatrix {
  const sortedNights = [...state.nightHistory].sort((a, b) => a.round - b.round);
  const rounds = sortedNights.map((n) => n.round);
  const roundLabels = rounds.map((r) => `N${r}`);

  const rows: SummaryNightRow[] = [
    {
      key: 'wolf_kill',
      label: '狼刀',
      category: 'wolf',
      cells: sortedNights.map((entry) =>
        entry.draft.wolfTarget !== null ? String(entry.draft.wolfTarget) : '空',
      ),
    },
  ];

  const presentRoles = collectPresentRoleIds(state, board);
  for (const spec of NIGHT_SKILL_SPECS) {
    const isRoleInGame = spec.roleIds.some((id) => presentRoles.has(id));
    if (!isRoleInGame && !spec.hasAnyAction(sortedNights)) {
      continue;
    }
    rows.push({
      key: spec.key,
      label: spec.label,
      category: spec.category,
      cells: sortedNights.map((entry) => spec.formatCell(entry, state)),
    });
  }

  return {
    rounds,
    roundLabels,
    rows,
  };
}

function formatDayExileText(dayEntry: DayHistoryEntry | undefined): string {
  if (!dayEntry?.structuredEvents) return 'X';
  const exiledSeats: number[] = [];

  for (const evt of dayEntry.structuredEvents) {
    if (evt.type === 'exile_result' && evt.outcomeTag !== 'exile_survived') {
      if (evt.eliminatedSeats && evt.eliminatedSeats.length > 0) {
        for (const s of evt.eliminatedSeats) {
          if (!exiledSeats.includes(s)) exiledSeats.push(s);
        }
      } else if (evt.targetSeat != null && !exiledSeats.includes(evt.targetSeat)) {
        exiledSeats.push(evt.targetSeat);
      }
    }
  }

  return exiledSeats.length > 0 ? exiledSeats.join('、') : 'X';
}

function formatDaySkillTags(dayEntry: DayHistoryEntry | undefined): string[] {
  if (!dayEntry?.structuredEvents) return [];
  const tags: string[] = [];

  for (const evt of dayEntry.structuredEvents) {
    switch (evt.type) {
      case 'exile_result':
        if (evt.targetSeat != null && evt.outcomeTag === 'exile_survived') {
          tags.push(`${evt.targetSeat}免死`);
        }
        break;
      case 'idiot_reveal':
        if (evt.targetSeat != null) tags.push(`${evt.targetSeat}翻牌`);
        break;
      case 'self_explode':
        if (evt.actorSeat != null) {
          if (evt.outcomeTag === 'wolf_girl_explode' && evt.targetSeat != null) {
            tags.push(`${evt.actorSeat}爆帶${evt.targetSeat}`);
          } else {
            tags.push(`${evt.actorSeat}自爆`);
          }
        }
        break;
      case 'good_self_explode':
        if (evt.actorSeat != null) tags.push(`${evt.actorSeat}自曝`);
        break;
      case 'white_wolf_king_explode':
        if (evt.actorSeat != null) {
          tags.push(
            evt.targetSeat != null
              ? `${evt.actorSeat}爆帶${evt.targetSeat}`
              : `${evt.actorSeat}自爆`,
          );
        }
        break;
      case 'hunter_shoot':
      case 'wolf_king_shoot':
        if (evt.actorSeat != null && evt.targetSeat != null) {
          tags.push(
            evt.outcomeTag === 'shoot_survived'
              ? `${evt.actorSeat}射${evt.targetSeat}(免)`
              : `${evt.actorSeat}帶${evt.targetSeat}`,
          );
        }
        break;
      case 'knight_duel':
        if (evt.actorSeat != null && evt.targetSeat != null) {
          const hit =
            evt.outcomeTag === 'knight_hit' ||
            (evt.outcomeTag == null && evt.summary.includes('成功'));
          tags.push(`${evt.actorSeat}決${evt.targetSeat}${hit ? '✓' : '✗'}`);
        }
        break;
      case 'wolf_beauty_charm_death':
        if (evt.targetSeat != null) tags.push(`${evt.targetSeat}殉情`);
        break;
      case 'manual_judge':
        if (evt.outcomeTag === 'detective_execute' && evt.targetSeat != null) {
          tags.push(`處決${evt.targetSeat}`);
        } else if (evt.outcomeTag === 'pufferfish_explode' && evt.eliminatedSeats?.length) {
          tags.push(`河豚炸${evt.eliminatedSeats.join(',')}`);
        } else if (evt.outcomeTag === 'nine_tails_hunt' && evt.eliminatedSeats?.length) {
          tags.push(`獵殺${evt.eliminatedSeats.join(',')}`);
        } else if (evt.outcomeTag === 'avenger_assassinate' && evt.targetSeat != null) {
          tags.push(`刺殺${evt.targetSeat}`);
        }
        break;
      default:
        break;
    }
  }

  return tags;
}

function collectRoundEliminatedSeats(
  round: number,
  nightEntry: NightHistoryEntry | undefined,
  dayEntry: DayHistoryEntry | undefined,
  seats: PlayerSeat[],
): number[] {
  const deadSet = new Set<number>();
  if (nightEntry) {
    for (const d of nightEntry.deaths) {
      deadSet.add(d.seat);
    }
  }
  if (dayEntry?.structuredEvents) {
    for (const evt of dayEntry.structuredEvents) {
      if (evt.eliminatedSeats && evt.eliminatedSeats.length > 0) {
        for (const s of evt.eliminatedSeats) deadSet.add(s);
      } else if (
        evt.type === 'exile_result' &&
        evt.outcomeTag !== 'exile_survived' &&
        evt.targetSeat != null
      ) {
        deadSet.add(evt.targetSeat);
      } else if (
        (evt.type === 'hunter_shoot' || evt.type === 'wolf_king_shoot') &&
        evt.outcomeTag !== 'shoot_survived' &&
        evt.targetSeat != null
      ) {
        deadSet.add(evt.targetSeat);
      } else if (
        (evt.type === 'self_explode' || evt.type === 'good_self_explode') &&
        evt.actorSeat != null
      ) {
        deadSet.add(evt.actorSeat);
      } else if (evt.type === 'white_wolf_king_explode') {
        if (evt.actorSeat != null) deadSet.add(evt.actorSeat);
        if (evt.targetSeat != null) deadSet.add(evt.targetSeat);
      } else if (evt.type === 'wolf_beauty_charm_death' && evt.targetSeat != null) {
        deadSet.add(evt.targetSeat);
      } else if (evt.type === 'knight_duel') {
        if (evt.outcomeTag === 'knight_hit' && evt.targetSeat != null) {
          deadSet.add(evt.targetSeat);
        } else if (evt.outcomeTag === 'knight_miss' && evt.actorSeat != null) {
          deadSet.add(evt.actorSeat);
        }
      }
    }
  }
  // 補入以 deathRound 記錄的連動出局者（如情侶殉情／手動出局）
  for (const seat of seats) {
    if (!seat.isAlive && seat.deathRound === round) {
      deadSet.add(seat.seatNumber);
    }
  }
  return Array.from(deadSet).sort((a, b) => a - b);
}

function buildDaySummaryColumns(state: GameSummaryInput): SummaryDayColumn[] {
  const maxRound = Math.max(
    0,
    ...state.nightHistory.map((n) => n.round),
    ...state.dayHistory.map((d) => d.round),
  );
  const columns: SummaryDayColumn[] = [];
  for (let r = 1; r <= maxRound; r += 1) {
    const nightEntry = state.nightHistory.find((n) => n.round === r);
    const dayEntry = state.dayHistory.find((d) => d.round === r);
    const exileText = formatDayExileText(dayEntry);
    const skillTags = formatDaySkillTags(dayEntry);
    const eliminated = collectRoundEliminatedSeats(r, nightEntry, dayEntry, state.seats);

    columns.push({
      round: r,
      label: `D${r}`,
      exileText,
      daySkillsText: skillTags.length > 0 ? skillTags.join(' / ') : '無',
      eliminatedText: eliminated.length > 0 ? eliminated.join('、') : '平安',
    });
  }
  return columns;
}

/**
 * 將對局核心狀態轉換為標準化「座號矩陣復盤表」資料模型，供 HTML5 Canvas 渲染與 Vitest 驗證。
 */
export function buildGameSummaryMatrix(
  state: GameSummaryInput,
  board?: BoardDefinition,
  now: Date = new Date(),
): GameSummaryMatrix {
  const sortedSeats = [...state.seats].sort((a, b) => a.seatNumber - b.seatNumber);
  const winnerMeta = getWinnerMeta(state.winner);
  const boardName = board?.name ?? '自訂板子';
  const playerCount = sortedSeats.length || board?.playerCount || 0;

  const players: SummaryPlayerColumn[] = sortedSeats.map((seat) => {
    const role = getRoleById(seat.roleId);
    return {
      seatNumber: seat.seatNumber,
      seatCode: pad2(seat.seatNumber),
      nickname: seat.nickname.trim() || `${seat.seatNumber}號`,
      roleName: role?.name ?? '未指派',
      roleCategory: role?.category ?? 'villager',
      subNote: buildPlayerSubNote(seat, state),
      isAlive: seat.isAlive,
    };
  });

  return {
    header: {
      dateTimeText: formatSummaryDateTime(now),
      boardTitle: `${playerCount} 人局 - ${boardName}`,
      boardName,
      winnerLabel: winnerMeta.label,
      winnerTone: winnerMeta.tone,
    },
    players,
    sheriff: buildSheriffBlock(state, sortedSeats),
    dayVoteRows: buildDayVoteRows(state, sortedSeats),
    nightMatrix: buildNightMatrix(state, board),
    daySummaryColumns: buildDaySummaryColumns(state),
  };
}
