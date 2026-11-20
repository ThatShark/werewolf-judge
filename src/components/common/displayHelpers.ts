import { getRoleById } from '../../data/roles';
import type {
  BoardDefinition,
  DeathReason,
  Faction,
  GamePhase,
  GameState,
  PlayerSeat,
  RuleOverrides,
} from '../../logic/types';

export const DEATH_REASON_LABELS: Record<DeathReason, string> = {
  wolf_kill: '狼人擊殺',
  witch_poison: '女巫毒殺',
  milk_pierce: '同守同救奶穿',
  exiled: '白天放逐出局',
  hunter_shoot: '獵人開槍帶走',
  wolf_king_shoot: '狼王開槍帶走',
  self_explode: '狼人自爆出局',
  mech_wolf_poison: '機械狼毒殺',
  mech_wolf_kill: '機械狼額外刀口',
  manual_judge: '法官手動標記出局',
};

export const PHASE_LABELS: Record<GamePhase, string> = {
  board_select: '開局選板',
  seat_setup: '座位配角',
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

export function formatFactionLabel(faction: Faction | null): string {
  if (faction === 'wolf') return '狼人陣營';
  if (faction === 'good') return '好人陣營';
  if (faction === 'third_party') return '第三方陣營';
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

export function buildGameReplayText(
  state: Pick<
    GameState,
    'round' | 'winner' | 'winReason' | 'seats' | 'nightHistory' | 'dayHistory'
  >,
  board?: BoardDefinition,
): string {
  const lines: string[] = [];
  lines.push(`【狼人殺對局復盤】${board ? board.name : '未指定板子'}`);
  lines.push(`勝利陣營：${formatFactionLabel(state.winner)}`);
  if (state.winReason) {
    lines.push(`獲勝原因：${state.winReason}`);
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
      for (const evt of dayEntry.events) {
        lines.push(`  • ${evt}`);
      }
    }
  }

  return lines.join('\n');
}
