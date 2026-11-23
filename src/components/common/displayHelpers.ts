import { getRoleById } from '../../data/roles';
import type {
  BoardDefinition,
  DeathReason,
  GamePhase,
  GameState,
  GameWinner,
  PlayerSeat,
  RuleOverrides,
  SheriffState,
  VoteRoundRecord,
} from '../../logic/types';

export const DEATH_REASON_LABELS: Record<DeathReason, string> = {
  wolf_kill: '狼人擊殺',
  witch_poison: '女巫毒殺',
  milk_pierce: '同守同救奶穿',
  exiled: '白天放逐出局',
  hunter_shoot: '獵人開槍帶走',
  wolf_king_shoot: '狼王開槍帶走',
  self_explode: '狼人自爆出局',
  white_wolf_king_explode: '白狼王自爆帶走',
  wolf_beauty_charm: '狼美人殉情帶走',
  knight_duel: '騎士決鬥撞狼出局',
  knight_duel_fail: '騎士決鬥撞好人以死謝罪',
  dream_catcher_consecutive: '攝夢人連續兩晚夢死',
  dream_catcher_link: '攝夢人夜死牽連共死',
  mech_wolf_poison: '機械狼毒殺',
  mech_wolf_kill: '機械狼額外刀口',
  manual_judge: '法官手動標記出局',
};

export const PHASE_LABELS: Record<GamePhase, string> = {
  board_select: '開局選板',
  seat_setup: '開局大廳',
  pass_and_reveal: '傳閱確認',
  night: '夜間主持',
  day_announcement: '天亮結算',
  day_vote: '白天投票',
  game_over: '對局復盤',
};

export const RULE_TOGGLE_META: Record<
  keyof RuleOverrides,
  { label: string; description: string }
> = {
  witchSelfSave: {
    label: '女巫自救規則',
    description: '控制女巫被狼人刀殺時是否可以使用解藥救自己。',
  },
  idiotNeedsExtraKill: {
    label: '白痴翻牌後需追刀',
    description: '開啟後，白痴白天翻牌免死仍計入存活神職，狼隊須追刀才會屠神。',
  },
  mechWolfForceLearnNight1: {
    label: '機械狼首夜強制學習',
    description: '開啟後，機械狼第一晚必須選擇一名其他玩家學習技能（不可跳過）。',
  },
  wolfKillPriority: {
    label: '狼刀在先原則',
    description: '開啟後，若當晚狼刀已達成屠邊條件，即使同晚女巫毒殺最後一狼仍判狼人勝利。',
  },
  victoryMode: {
    label: '勝利條件模式',
    description: '屠邊（殺光所有平民或所有神職）或屠城（殺光全部好人）。',
  },
  enableSheriff: {
    label: '開啟警長競選',
    description: '第一天白天是否進行警長競選流程（上警、退水、警下投票與警徽移交）。',
  },
  badgeSwallowRule: {
    label: '吞警徽規則',
    description: '警長競選期間狼人自爆時，採單爆立即吞警徽或雙爆吞警徽。',
  },
  noSheriffDeadDirection: {
    label: '無警長有死訊發言方向',
    description: '無警長且昨夜有死訊時，從座號最小死者出發的預設發言方向。',
  },
  sheriffUseDeadSideOnDeath: {
    label: '有警長有死訊優先死左／死右',
    description: '開啟後，有警長且昨夜有死訊時優先採死左／死右，平安夜再切回警左／警右。',
  },
};

export function formatSeatDisplay(seat: Pick<PlayerSeat, 'seatNumber' | 'nickname'>): string {
  const trimmed = seat.nickname.trim();
  return trimmed ? `${seat.seatNumber} 號 · ${trimmed}` : `${seat.seatNumber} 號玩家`;
}

export function formatSeatShort(seat: Pick<PlayerSeat, 'seatNumber' | 'nickname'>): string {
  const trimmed = seat.nickname.trim();
  return trimmed ? `${seat.seatNumber}號 ${trimmed}` : `${seat.seatNumber}號`;
}

export function formatDeathReason(reason?: DeathReason): string {
  if (!reason) return '出局';
  return DEATH_REASON_LABELS[reason] ?? reason;
}

export function formatFactionLabel(faction: GameWinner | null): string {
  if (faction === 'wolf') return '狼人陣營';
  if (faction === 'good') return '好人陣營';
  if (faction === 'third_party') return '第三方陣營';
  if (faction === 'draw') return '平局';
  return '未知陣營';
}

export function getRoleBadgeClasses(roleId: string | null): string {
  const role = getRoleById(roleId);
  if (!role) {
    return 'border-slate-700 bg-slate-800/80 text-slate-400';
  }
  if (role.faction === 'wolf') {
    return 'border-rose-500/40 bg-rose-950/70 text-rose-200';
  }
  if (role.category === 'god') {
    return 'border-indigo-400/40 bg-indigo-950/70 text-indigo-200';
  }
  if (role.category === 'villager') {
    return 'border-emerald-500/35 bg-emerald-950/60 text-emerald-200';
  }
  return 'border-amber-400/40 bg-amber-950/60 text-amber-200';
}

export function formatSheriffStatusSummary(
  sheriffState?: SheriffState,
  seats?: PlayerSeat[],
): string | null {
  if (!sheriffState || sheriffState.status === 'not_started') {
    return null;
  }
  if (sheriffState.badgeStatus === 'active' && sheriffState.sheriffSeat !== null) {
    const seatObj = seats?.find((s) => s.seatNumber === sheriffState.sheriffSeat);
    const label = seatObj ? formatSeatDisplay(seatObj) : `${sheriffState.sheriffSeat} 號`;
    return `警長：${label}（警徽有效）`;
  }
  if (sheriffState.badgeStatus === 'swallowed') {
    return '警徽狀態：警上自爆吞警徽（本局無警長）';
  }
  if (sheriffState.badgeStatus === 'destroyed') {
    return '警徽狀態：警長出局撕毀警徽';
  }
  if (sheriffState.status === 'no_sheriff') {
    return '警徽狀態：本局無警長';
  }
  return '警徽狀態：警長競選未完成即結束';
}

export function formatVoteRecordLines(record: VoteRoundRecord): string[] {
  const lines: string[] = [];
  const entries = Object.entries(record.totals).sort(
    ([seatA, scoreA], [seatB, scoreB]) => scoreB - scoreA || Number(seatA) - Number(seatB),
  );

  for (const [targetKey, score] of entries) {
    const targetSeat = Number(targetKey);
    const voters = record.votersByTarget[targetSeat] ?? [];
    const voterText =
      voters.length > 0 ? voters.map((s) => `${s} 號`).join('、') : '無玩家投票';
    const extra = record.extraVotes?.[targetSeat];
    const extraText = extra ? `；額外 +${extra} 票` : '';
    lines.push(`${targetSeat} 號：${score} 票（${voterText}${extraText}）`);
  }

  const abstainerText =
    record.abstainers.length > 0
      ? record.abstainers.map((s) => `${s} 號`).join('、')
      : '無';
  lines.push(`棄票：${abstainerText}`);
  return lines;
}

export function buildGameReplayText(
  state: Pick<
    GameState,
    'round' | 'winner' | 'winReason' | 'seats' | 'nightHistory' | 'dayHistory'
  > & { sheriffState?: SheriffState },
  board?: BoardDefinition,
): string {
  const lines: string[] = [];
  lines.push(`【狼人殺對局復盤】${board ? board.name : '未指定板子'}`);
  lines.push(`勝利陣營：${formatFactionLabel(state.winner)}`);
  if (state.winReason) {
    lines.push(`獲勝原因：${state.winReason}`);
  }
  const sheriffSummary = formatSheriffStatusSummary(state.sheriffState, state.seats);
  if (sheriffSummary) {
    lines.push(sheriffSummary);
  }

  lines.push('');
  lines.push('【玩家身分總覽】');
  for (const seat of state.seats) {
    const roleName = getRoleById(seat.roleId)?.name ?? '未指派';
    const statusText = seat.isAlive
      ? seat.idiotRevealed
        ? '存活（白痴已翻牌）'
        : '存活'
      : `第 ${seat.deathRound ?? '?'} 輪出局（${formatDeathReason(seat.deathReason)}）`;
    lines.push(`- ${formatSeatDisplay(seat)}：${roleName}｜${statusText}`);
  }

  const maxRound = Math.max(
    state.round,
    ...state.nightHistory.map((n) => n.round),
    ...state.dayHistory.map((d) => d.round),
  );

  lines.push('');
  lines.push('【完整時間軸】');
  for (let r = 1; r <= maxRound; r += 1) {
    const nightEntry = state.nightHistory.find((n) => n.round === r);
    const dayEntry = state.dayHistory.find((d) => d.round === r);
    if (!nightEntry && !dayEntry) continue;

    if (nightEntry) {
      lines.push(`第 ${r} 晚：`);
      const { draft, deaths } = nightEntry;
      if (draft.mechWolfLearnTarget !== null) {
        lines.push(`  • 機械狼學習 ${draft.mechWolfLearnTarget} 號`);
      }
      if (draft.mechWolfSkillTarget !== null) {
        lines.push(`  • 機械狼使用學習技能指定 ${draft.mechWolfSkillTarget} 號`);
      }
      if (draft.guardTarget !== null) {
        lines.push(`  • 守衛守護 ${draft.guardTarget} 號`);
      }
      lines.push(
        `  • 狼人點刀：${draft.wolfTarget !== null ? `${draft.wolfTarget} 號` : '空刀'}`,
      );
      if (draft.witchUseAntidote) {
        lines.push('  • 女巫使用解藥');
      }
      if (draft.witchPoisonTarget !== null) {
        lines.push(`  • 女巫毒殺 ${draft.witchPoisonTarget} 號`);
      }
      if (draft.seerCheckTarget !== null) {
        lines.push(`  • 預言家查驗 ${draft.seerCheckTarget} 號`);
      }
      if (draft.psychicCheckTarget !== null) {
        lines.push(`  • 通靈師查驗 ${draft.psychicCheckTarget} 號`);
      }
      if (draft.wolfBeautyCharmTarget != null) {
        lines.push(`  • 狼美人魅惑 ${draft.wolfBeautyCharmTarget} 號`);
      }
      if (draft.dreamCatcherTarget != null) {
        lines.push(`  • 攝夢人攝夢 ${draft.dreamCatcherTarget} 號`);
      }
      if (nightEntry.bearRoar) {
        lines.push(`  • 熊判定：${nightEntry.bearRoar.reason}`);
      }
      if (deaths.length === 0) {
        lines.push('  • 天亮結果：平安夜');
      } else {
        const deathStr = deaths
          .map((d) => `${d.seat} 號（${formatDeathReason(d.reason)}）`)
          .join('、');
        lines.push(`  • 天亮結果：${deathStr}`);
      }
    }

    if (dayEntry && dayEntry.events.length > 0) {
      lines.push(`第 ${r} 天：`);
      const remainingVoteEvents = [...(dayEntry.structuredEvents ?? [])].filter(
        (s) => s.voteRecord,
      );
      for (const evt of dayEntry.events) {
        lines.push(`  • ${evt}`);
        const matchIdx = remainingVoteEvents.findIndex((s) => s.summary === evt);
        if (matchIdx !== -1) {
          const [matched] = remainingVoteEvents.splice(matchIdx, 1);
          if (matched.voteRecord) {
            for (const voteLine of formatVoteRecordLines(matched.voteRecord)) {
              lines.push(`      - ${voteLine}`);
            }
          }
        }
      }
    }
  }

  return lines.join('\n');
}
