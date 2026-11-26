import { getRoleById } from '../../data/roles';
import { formatNotebookExportText, hasNotebookContent } from '../../logic/notebook';
import type {
  BoardDefinition,
  DeathReason,
  GamePhase,
  GameState,
  GameWinner,
  MechWolfRuntimeState,
  NightActionDraft,
  NightHistoryEntry,
  NotebookState,
  PlayerSeat,
  RuleOverrides,
  SheriffState,
  VoteRoundRecord,
} from '../../logic/types';

export const DEATH_REASON_LABELS: Record<DeathReason, string> = {
  wolf_kill: '狼人擊殺',
  witch_poison: '女巫毒殺',
  poisoner_poison: '毒師毒殺',
  milk_pierce: '同守同救奶穿',
  exiled: '白天放逐出局',
  hunter_shoot: '獵人開槍帶走',
  wolf_king_shoot: '狼王開槍帶走',
  self_explode: '狼人自爆出局',
  white_wolf_king_explode: '白狼王自爆帶走',
  wolf_beauty_charm: '狼美人殉情帶走',
  wolf_girl_breakup: '狼女孩愛情破裂帶走',
  knight_duel: '騎士決鬥撞狼出局',
  knight_duel_fail: '騎士決鬥撞好人以死謝罪',
  dream_catcher_consecutive: '攝夢人連續兩晚夢死',
  dream_catcher_link: '攝夢人夜死牽連共死',
  mech_wolf_poison: '機械狼毒殺',
  mech_wolf_kill: '機械狼額外刀口',
  masked_delayed_death: '蒙面人負傷延遲出局',
  treasure_master_exile_delayed: '盜寶蒙面狼隔夜刀後出局',
  evil_knight_counter: '惡靈騎士反傷出局',
  cursed_fox_checked: '咒狐被查驗出局',
  pure_white_check_kill: '純白之女查驗出局',
  wolf_witch_check_kill: '狼巫查驗出局',
  nine_tailed_fox_no_tails: '九尾狐失尾歸零出局',
  awakened_dream_catcher_kill: '覺醒攝夢人夢語出局',
  good_self_explode: '好人翻牌自曝出局',
  enchanter_consecutive: '蠱惑師連蠱心智混亂出局',
  enchanter_substitute: '蠱惑師替死出局',
  socialite_link: '名媛出局寵幸者殉情',
  medusa_petrify_link: '梅杜莎出局石化者共死',
  medusa_poison_reflect: '梅杜莎石化反彈女巫毒藥',
  black_bat_reflect: '黑蝙蝠技能反彈出局',
  dark_night_envoy_counter: '黑夜使者庇護反殺出局',
  mentor_scholar_clash: '白晝學者與寂夜導師技能衝突出局',
  troublemaker_self_guard: '搗蛋鬼耍寶守衛連兩晚自守出局',
  white_cat_delayed_death: '白貓翻牌免死延遲出局',
  awakened_witch_poison: '覺醒女巫毒殺',
  demon_hunter_kill: '獵魔人狩獵出局',
  demon_hunter_backfire: '獵魔人誤狩好人反噬出局',
  wolf_raven_claw_kill: '狼鴉之爪無敵刀出局',
  assassin_wolf_kill: '刺客猜中身分刺殺出局',
  big_bad_wolf_kill: '大野狼額外刀出局',
  big_grey_wolf_kill: '大灰狼單獨擊殺出局',
  wolf_younger_brother_kill: '狼弟覺醒無敵刀出局',
  bee_wild_hunt_kill: '蜂之狂獵雙刺出局',
  perseus_execute: '珀爾修斯處決出局',
  perseus_petrify_backfire: '珀爾修斯處決石化者反噬出局',
  anubis_scale_kill: '阿努比斯天平裁決出局',
  anubis_scale_backfire: '阿努比斯天平反噬出局',
  blood_moon_exile_delayed: '血月使徒復仇夜後正式出局',
  pufferfish_explode: '河豚翻牌炸票出局',
  awakened_wolf_king_shoot: '覺醒狼王開槍帶走',
  awakened_wolf_beauty_substitute: '覺醒狼美人替死出局',
  awakened_hunter_shoot: '覺醒獵人方向開槍擊殺',
  scarlet_child_trigger: '猩紅之子受神職技能觸發死亡',
  scarlet_wolf_link: '猩紅狼王出局附著連帶死亡',
  night_noble_servant_death: '夜之貴族夜僕隔日出局',
  old_rascal_delayed_death: '老流氓中毒／負傷延遲出局',
  rusty_sword_counter: '鏽劍騎士左狼反殺出局',
  warden_trade_death: '典獄長交易裁決出局',
  cupid_lover_link: '邱比特情侶殉情出局',
  ghost_bride_link: '鬼魂新娘情侶殉情出局',
  scent_phantom_link: '尋香魅影鏈子殉情出局',
  twins_link: '雙子同生共死出局',
  white_snake_kill: '白蛇預言家靈襲出局',
  xu_xian_kill: '許仙尋香魅影靈襲出局',
  xu_xian_link: '許仙綁定鏈殉情出局',
  avenger_assassinate: '復仇者刺殺出局',
  jack_ripper_kill: '開膛手傑克擊殺出局',
  pandora_poison: '開啟潘朵拉魔盒毒藥出局',
  pandora_knife: '遭潘朵拉魔盒刀襲擊出局',
  pandora_day_gun: '遭潘朵拉魔盒日槍帶走',
  nine_tails_hunt: '遭九尾獵殺時刻淘汰',
  dance_out: '舞者舞池陣營少數出局',
  merchant_backfire: '商人贈禮給狼人反噬出局',
  medium_knife: '遭通靈者繼承狼刀擊殺',
  butler_seer_kill: '管家上茶預言家查殺出局',
  wolf_maid_tea_kill: '狼僕毒茶出局',
  eclipse_maid_kill: '蝕日侍女吞噬技能擊殺出局',
  grey_wolf_steal_kill: '灰太狼偷竊技能擊殺出局',
  detective_execute: '偵探白天處決出局',
  police_dog_bite: '警犬夜間撕咬出局',
  little_girl_caught: '小女孩遭狼隊指認代死出局',
  manual_judge: '法官手動標記出局',
};

export const PHASE_LABELS: Record<GamePhase, string> = {
  host_setup: '主持模式',
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
    label: '女巫可否自救',
    description: '控制女巫被狼人刀殺時是否可以使用解藥救自己。',
  },
  enableSheriff: {
    label: '是否有警長',
    description: '第一天白天是否進行警長競選流程（選「沒有」時自動跳過警長競選）。',
  },
  badgeSwallowRule: {
    label: '吞警徽規則',
    description: '警長競選期間狼人自爆時，採雙爆吞警徽或單爆吞警徽。',
  },
  victoryMode: {
    label: '勝利條件',
    description: '屠邊（殺光所有平民或所有神職）或屠城（殺光全部好人）。',
  },
  mechWolfForceLearnNight1: {
    label: '機械狼是否第一晚強制學習',
    description: '開啟後，機械狼第一晚必須選擇一名其他玩家學習技能（不可跳過）。',
  },
  luckyFirstNightSkills: {
    label: '幸運兒第一晚是否就能使用技能',
    description: '分別設定黑市商人、奇蹟商人、超級黑市商人的幸運兒在第一晚可使用的技能。',
  },
  idiotNeedsExtraKill: {
    label: '白痴翻牌後需追刀',
    description: '開啟後，白痴白天翻牌免死仍計入存活神職，狼隊須追刀才會屠神。',
  },
  wolfKillPriority: {
    label: '狼刀在先原則',
    description: '固定採狼刀在先原則。',
  },
  noSheriffDeadDirection: {
    label: '無警長有死訊發言方向',
    description: '由每日天亮隨機方向決定。',
  },
  sheriffUseDeadSideOnDeath: {
    label: '有警長有死訊優先死左／死右',
    description: '由天亮公告方向選擇器決定。',
  },
  hybridCountsAsVillager: {
    label: '混血兒計入平民屠邊人數',
    description: '依板子預設套用。',
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

export function formatSeatNum(seatNumber: number): string {
  return String(seatNumber).padStart(2, '0');
}

/**
 * 列出板子具體角色配置清單（例如：「預言家、女巫、獵人、白痴、4狼、4民」）。
 * 若含第三方角色直接列出角色名稱，不顯示「幾三方」數量標籤。
 */
export function formatBoardRoleList(board: BoardDefinition): string {
  const parts: string[] = [];

  // 1. 神職（非平民好人）
  const villagerSlots: Array<{ roleId: string; count: number }> = [];
  for (const slot of board.composition.good) {
    const role = getRoleById(slot.roleId);
    if (role?.category === 'villager') {
      villagerSlots.push(slot);
    } else {
      const name = role?.name ?? slot.roleId;
      parts.push(slot.count > 1 ? `${name}×${slot.count}` : name);
    }
  }

  // 2. 第三方角色直接列在角色清單中（不加「三方」數量標籤）
  for (const slot of board.composition.thirdParty ?? []) {
    const role = getRoleById(slot.roleId);
    const name = role?.name ?? slot.roleId;
    parts.push(slot.count > 1 ? `${name}×${slot.count}` : name);
  }

  // 3. 狼人陣營（特殊狼列名稱，普通小狼顯示「N狼」）
  let plainWolfCount = 0;
  for (const slot of board.composition.wolf) {
    if (slot.roleId === 'wolf') {
      plainWolfCount += slot.count;
    } else {
      const role = getRoleById(slot.roleId);
      const name = role?.name ?? slot.roleId;
      parts.push(slot.count > 1 ? `${name}×${slot.count}` : name);
    }
  }
  if (plainWolfCount > 0) {
    parts.push(`${plainWolfCount}小狼`);
  }

  // 4. 平民（普通平民顯示「N平民」，特殊平民列名稱）
  let plainVillagerCount = 0;
  for (const slot of villagerSlots) {
    if (slot.roleId === 'villager') {
      plainVillagerCount += slot.count;
    } else {
      const role = getRoleById(slot.roleId);
      const name = role?.name ?? slot.roleId;
      parts.push(slot.count > 1 ? `${name}×${slot.count}` : name);
    }
  }
  if (plainVillagerCount > 0) {
    parts.push(`${plainVillagerCount}平民`);
  }

  return parts.join('、');
}

export function formatBoardCompositionShort(board: BoardDefinition): string {
  const wolfCount = board.composition.wolf.reduce((sum, s) => sum + s.count, 0);
  let godCount = 0;
  let villagerCount = 0;
  for (const slot of board.composition.good) {
    const role = getRoleById(slot.roleId);
    if (role?.category === 'villager') {
      villagerCount += slot.count;
    } else {
      godCount += slot.count;
    }
  }
  const thirdCount = (board.composition.thirdParty ?? []).reduce((sum, s) => sum + s.count, 0);
  const parts = [`${wolfCount}狼`, `${godCount}神`, `${villagerCount}民`];
  if (thirdCount > 0) {
    parts.push(`${thirdCount}三方`);
  }
  return parts.join(' ');
}

export function getRoleShortSummary(roleId: string | null): string {
  const role = getRoleById(roleId);
  if (!role) return '無特殊技能';
  const raw = role.description.replace(/[。！!\n].*$/s, '').trim();
  if (raw.length <= 15) return raw;
  return `${raw.slice(0, 14)}…`;
}

export function getRoleBadgeClasses(roleId: string | null): string {
  const role = getRoleById(roleId);
  if (!role) {
    return 'border-subtle bg-elevated text-muted';
  }
  if (role.faction === 'wolf') {
    return 'border-wolf-border bg-wolf-tint text-wolf';
  }
  if (role.faction === 'third_party') {
    return 'border-third-border bg-third-tint text-third';
  }
  if (role.category === 'god') {
    return 'border-good-border bg-good-tint text-good';
  }
  return 'border-subtle bg-elevated text-secondary';
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

export function buildReplayDownloadFilename(boardName?: string, now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
  const safeBoard = (boardName ?? 'werewolf')
    .replace(/[\\/:*?"<>|\s]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `werewolf-replay-${safeBoard || 'game'}-${stamp}.txt`;
}

export function buildGameReplayText(
  state: Pick<
    GameState,
    'round' | 'winner' | 'winReason' | 'seats' | 'nightHistory' | 'dayHistory'
  > & {
    sheriffState?: SheriffState;
    mechWolfState?: MechWolfRuntimeState;
    notebook?: NotebookState;
    ruleOverrides?: Pick<RuleOverrides, 'enableSheriff'>;
  },
  board?: BoardDefinition,
): string {
  const lines: string[] = [];
  const aliveCount = state.seats.filter((s) => s.isAlive).length;
  lines.push(`【狼人殺對局復盤】${board ? board.name : '未指定板子'}`);
  lines.push(`勝利陣營：${formatFactionLabel(state.winner)}`);
  if (state.winReason) {
    lines.push(`獲勝原因：${state.winReason}`);
  }
  lines.push(`對局統計：共 ${state.round} 輪｜最終存活 ${aliveCount} / ${state.seats.length} 人`);
  const sheriffSummary = formatSheriffStatusSummary(state.sheriffState, state.seats);
  if (sheriffSummary) {
    lines.push(sheriffSummary);
  }

  lines.push('');
  lines.push('【玩家身分總覽】');
  for (const seat of state.seats) {
    const roleName = getRoleById(seat.roleId)?.name ?? '未指派';
    const tags: string[] = [];
    if (
      state.sheriffState?.badgeStatus === 'active' &&
      state.sheriffState.sheriffSeat === seat.seatNumber
    ) {
      tags.push('警長');
    }
    if (seat.roleId === 'mech_wolf' && state.mechWolfState?.learnedRoleId) {
      const learnedName =
        getRoleById(state.mechWolfState.learnedRoleId)?.name ?? state.mechWolfState.learnedRoleId;
      tags.push(`學：${learnedName}`);
    }
    const tagSuffix = tags.length > 0 ? ` [${tags.join(' / ')}]` : '';
    const statusText = seat.isAlive
      ? seat.idiotRevealed
        ? '存活（白痴已翻牌）'
        : '存活'
      : `第 ${seat.deathRound ?? '?'} 輪出局（${formatDeathReason(seat.deathReason)}）`;
    lines.push(`- ${formatSeatDisplay(seat)}：${roleName}${tagSuffix}｜${statusText}`);
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

  if (state.notebook && hasNotebookContent(state.notebook)) {
    lines.push('');
    lines.push(
      formatNotebookExportText(state.notebook, state.seats, board?.name, {
        round: state.round,
        enableSheriff: state.ruleOverrides?.enableSheriff ?? true,
      }),
    );
  }

  return lines.join('\n');
}

/**
 * 將座位陣列拆分為「左欄 1 ~ 半數、右欄 半數+1 ~ N」對稱雙欄，
 * 對齊實體桌遊桌左右兩排視角。
 */
export function splitSeatsIntoSymmetricColumns<T>(seats: T[]): { left: T[]; right: T[] } {
  const half = Math.ceil(seats.length / 2);
  return {
    left: seats.slice(0, half),
    right: seats.slice(half),
  };
}

/**
 * 將單一夜晚的行動草稿與結算結果轉為完整易讀的紀錄條目，供 HistoryDrawer 與復盤查閱每一晚技能對象與結果。
 */
export function formatNightActionLogs(
  draft: NightActionDraft,
  entry?: Partial<NightHistoryEntry>,
  pendingSelfExplodeSeat?: number | null,
): string[] {
  const lines: string[] = [];
  const fmt = (seat: number) => `${formatSeatNum(seat)} 號`;

  if (draft.nightmareFearTarget != null) lines.push(`夢魘恐懼：${fmt(draft.nightmareFearTarget)}`);
  if (draft.hybridIdolTarget != null) lines.push(`混血兒榜樣：${fmt(draft.hybridIdolTarget)}`);
  if (draft.wildChildIdolTarget != null) lines.push(`野孩子榜樣：${fmt(draft.wildChildIdolTarget)}`);
  if (draft.shadowMasterTarget != null) lines.push(`影子目標：${fmt(draft.shadowMasterTarget)}`);
  if (draft.awakenedLonelyGirlIdolTarget != null) {
    lines.push(`覺醒孤獨少女榜樣：${fmt(draft.awakenedLonelyGirlIdolTarget)}`);
  }
  if (draft.cupidLoversPair?.[0] != null && draft.cupidLoversPair?.[1] != null) {
    lines.push(`邱比特連線：${fmt(draft.cupidLoversPair[0])} ⇄ ${fmt(draft.cupidLoversPair[1])}`);
  }
  if (draft.ghostBrideGroomTarget != null || draft.ghostBrideWitnessTarget != null) {
    lines.push(
      `鬼魂新娘：新郎 ${draft.ghostBrideGroomTarget != null ? fmt(draft.ghostBrideGroomTarget) : '無'}／證婚 ${draft.ghostBrideWitnessTarget != null ? fmt(draft.ghostBrideWitnessTarget) : '無'}`,
    );
  }
  if (draft.scentPhantomChainPair?.[0] != null && draft.scentPhantomChainPair?.[1] != null) {
    lines.push(
      `尋香魅影連線：${fmt(draft.scentPhantomChainPair[0])} ⇄ ${fmt(draft.scentPhantomChainPair[1])}`,
    );
  }
  if (draft.mechWolfLearnTarget !== null) {
    lines.push(`機械狼學習：${fmt(draft.mechWolfLearnTarget)}`);
  }
  if (draft.mechWolfSkillTarget !== null) {
    const res = entry?.mechWolfPsychicResult;
    const suffix = res
      ? ` ➜ ${getRoleById(res.perceivedRoleId)?.name ?? res.perceivedRoleId}`
      : '';
    lines.push(`機械狼技能：${fmt(draft.mechWolfSkillTarget)}${suffix}`);
  }
  if (draft.magicianSwapPair?.[0] != null && draft.magicianSwapPair?.[1] != null) {
    lines.push(`魔術師交換：${fmt(draft.magicianSwapPair[0])} ⇄ ${fmt(draft.magicianSwapPair[1])}`);
  }
  if (draft.wolfWarlockSwapPair?.[0] != null && draft.wolfWarlockSwapPair?.[1] != null) {
    lines.push(
      `狼術師交換：${fmt(draft.wolfWarlockSwapPair[0])} ⇄ ${fmt(draft.wolfWarlockSwapPair[1])}`,
    );
  }
  if (draft.tricksterSwapPair?.[0] != null && draft.tricksterSwapPair?.[1] != null) {
    lines.push(
      `詭術師換票：${fmt(draft.tricksterSwapPair[0])} ⇄ ${fmt(draft.tricksterSwapPair[1])}`,
    );
  }
  if (draft.guardTarget !== null) lines.push(`守衛守護：${fmt(draft.guardTarget)}`);
  if (draft.dreamCatcherTarget != null) lines.push(`攝夢人夢遊：${fmt(draft.dreamCatcherTarget)}`);
  if (draft.awakenedDreamTarget != null) {
    const res = entry?.awakenedDreamResult;
    lines.push(
      `覺醒攝夢人夢語：${fmt(draft.awakenedDreamTarget)}${res ? `（${res.killedByDream ? '處決' : '未處決'}）` : ''}`,
    );
  }
  if (draft.penguinFreezeTarget != null) lines.push(`企鵝冰凍：${fmt(draft.penguinFreezeTarget)}`);
  if (draft.timeEclipseTarget != null) lines.push(`蝕時狼妃封鎖：${fmt(draft.timeEclipseTarget)}`);
  if (draft.medusaPetrifyTarget != null) lines.push(`梅杜莎石化：${fmt(draft.medusaPetrifyTarget)}`);
  if (draft.muteElderTarget != null) lines.push(`禁言長老禁言：${fmt(draft.muteElderTarget)}`);
  if (draft.silentNightMentorTarget != null && draft.silentNightMentorMode) {
    lines.push(
      `寂夜導師${draft.silentNightMentorMode === 'amplify' ? '增幅' : '削弱'}：${fmt(draft.silentNightMentorTarget)}`,
    );
  }
  if (draft.daylightScholarTarget != null && draft.daylightScholarMode) {
    lines.push(
      `白晝學者${draft.daylightScholarMode === 'amplify' ? '增幅' : '削弱'}：${fmt(draft.daylightScholarTarget)}`,
    );
  }
  if (draft.wolfTarget !== null) {
    lines.push(`狼人落刀：${fmt(draft.wolfTarget)}`);
  } else if (entry?.deaths !== undefined) {
    lines.push('狼人落刀：空刀');
  }
  if (draft.seedWolfInfectTarget != null) {
    lines.push(`種狼感染：${fmt(draft.seedWolfInfectTarget)}`);
  }
  if (draft.wolfBeautyCharmTarget != null) {
    lines.push(`狼美人魅惑：${fmt(draft.wolfBeautyCharmTarget)}`);
  }
  if (draft.awakenedWolfBeautyCharmTarget != null) {
    lines.push(`覺醒狼美人魅惑：${fmt(draft.awakenedWolfBeautyCharmTarget)}`);
  }
  if (draft.witchUseAntidote) {
    lines.push('女巫用藥：使用解藥');
  } else if (draft.witchPoisonTarget !== null) {
    lines.push(`女巫用藥：毒殺 ${fmt(draft.witchPoisonTarget)}`);
  }
  if (draft.poisonerTarget != null) {
    lines.push(`毒師毒殺：${fmt(draft.poisonerTarget)}`);
  }
  if (draft.awakenedWitchUseAntidote) {
    lines.push('覺醒女巫：使用解藥');
  } else if (draft.awakenedWitchPoisonTarget != null) {
    lines.push(`覺醒女巫毒殺：${fmt(draft.awakenedWitchPoisonTarget)}`);
  }
  if (draft.seerCheckTarget !== null) {
    const res = entry?.seerResult;
    const suffix = res
      ? ` ➜ ${res.faction === 'wolf' ? '狼人陣營（查殺）' : '好人陣營（金水）'}`
      : '';
    lines.push(`預言家查驗：${fmt(draft.seerCheckTarget)}${suffix}`);
  }
  if (draft.psychicCheckTarget !== null) {
    const res = entry?.psychicResult;
    const suffix = res
      ? ` ➜ ${getRoleById(res.perceivedRoleId)?.name ?? res.perceivedRoleId}`
      : '';
    lines.push(`通靈師查驗：${fmt(draft.psychicCheckTarget)}${suffix}`);
  }
  if (draft.awakenedSeerTargets?.[0] != null && draft.awakenedSeerTargets?.[1] != null) {
    const res = entry?.awakenedSeerResult;
    const suffix = res
      ? ` ➜ ${res.result === 'double_good' ? '雙金水（皆好人）' : '疑似狼人（含狼）'}`
      : '';
    lines.push(
      `覺醒預言家雙驗：${fmt(draft.awakenedSeerTargets[0])}、${fmt(draft.awakenedSeerTargets[1])}${suffix}`,
    );
  }
  if (draft.lanternSeerCheckTarget != null) {
    const res = entry?.lanternSeerResult;
    const suffix = res
      ? ` ➜ ${res.faction === 'wolf' ? '狼人陣營（查殺）' : '好人陣營（金水）'}`
      : '';
    lines.push(`燈影預言家查驗：${fmt(draft.lanternSeerCheckTarget)}${suffix}`);
  }
  if (draft.drunkSeerCheckTarget != null) {
    const res = entry?.drunkSeerResult;
    const suffix = res
      ? ` ➜ ${res.faction === 'wolf' ? '狼人陣營（查殺）' : '好人陣營（金水）'}`
      : '';
    lines.push(`酒鬼預言家查驗：${fmt(draft.drunkSeerCheckTarget)}${suffix}`);
  }
  if (draft.foolSeerCheckTarget != null) {
    const res = entry?.foolSeerResult;
    const suffix = res
      ? ` ➜ ${res.faction === 'wolf' ? '狼人陣營（查殺）' : '好人陣營（金水）'}`
      : '';
    lines.push(`愚言家查驗：${fmt(draft.foolSeerCheckTarget)}${suffix}`);
  }
  if (draft.foxCheckTarget != null) {
    const res = entry?.foxResult;
    const suffix = res ? ` ➜ ${res.hasWolf ? '含狼人' : '全好人（失效）'}` : '';
    lines.push(`狐狸查驗：${fmt(draft.foxCheckTarget)}${suffix}`);
  }
  if (draft.gargoyleCheckTarget != null) {
    const res = entry?.gargoyleResult;
    const suffix = res
      ? ` ➜ ${getRoleById(res.perceivedRoleId)?.name ?? res.perceivedRoleId}`
      : '';
    lines.push(`石像鬼查驗：${fmt(draft.gargoyleCheckTarget)}${suffix}`);
  }
  if (draft.wolfWitchCheckTarget != null) {
    const res = entry?.wolfWitchResult;
    const suffix = res
      ? ` ➜ ${getRoleById(res.perceivedRoleId)?.name ?? res.perceivedRoleId}`
      : '';
    lines.push(`狼巫查驗：${fmt(draft.wolfWitchCheckTarget)}${suffix}`);
  }
  if (draft.pureWhiteCheckTarget != null) {
    const res = entry?.pureWhiteResult;
    const suffix = res
      ? ` ➜ ${getRoleById(res.perceivedRoleId)?.name ?? res.perceivedRoleId}`
      : '';
    lines.push(`純白之女查驗：${fmt(draft.pureWhiteCheckTarget)}${suffix}`);
  }
  if (draft.demonWolfCheckTarget != null) {
    const res = entry?.demonWolfResult;
    const suffix = res ? ` ➜ ${res.roleType === 'god' ? '神職' : '平民'}` : '';
    lines.push(`惡魔查驗：${fmt(draft.demonWolfCheckTarget)}${suffix}`);
  }
  if (draft.pumpkinGhostCheckTarget != null) {
    const res = entry?.pumpkinGhostResult;
    const suffix = res
      ? ` ➜ ${getRoleById(res.perceivedRoleId)?.name ?? res.perceivedRoleId}`
      : '';
    lines.push(`南瓜鬼查驗：${fmt(draft.pumpkinGhostCheckTarget)}${suffix}`);
  }
  if (entry?.gravekeeperResult?.exiledSeat != null) {
    lines.push(`守墓人驗屍：${entry.gravekeeperResult.summary}`);
  }
  if (draft.crowCurseTarget != null) lines.push(`烏鴉詛咒：${fmt(draft.crowCurseTarget)}`);
  if (draft.miracleMerchantTarget != null) {
    lines.push(`奇蹟商人贈禮：${fmt(draft.miracleMerchantTarget)}`);
  }
  if (draft.blackMarketTarget != null) {
    lines.push(`黑市商人贈禮：${fmt(draft.blackMarketTarget)}`);
  }
  if (draft.evilMerchantTarget != null) {
    lines.push(`邪惡商人贈禮：${fmt(draft.evilMerchantTarget)}`);
  }
  if (draft.demonHunterTarget != null) lines.push(`獵魔人狩獵：${fmt(draft.demonHunterTarget)}`);
  if (draft.wolfRavenClawKillTarget != null) {
    lines.push(`狼鴉之爪刀口：${fmt(draft.wolfRavenClawKillTarget)}`);
  }
  if (draft.bigBadWolfKillTarget != null) {
    lines.push(`大野狼額外刀：${fmt(draft.bigBadWolfKillTarget)}`);
  }
  if (draft.bigGreyWolfKillTarget != null) {
    lines.push(`大灰狼擊殺：${fmt(draft.bigGreyWolfKillTarget)}`);
  }
  if (draft.wolfYoungerBrotherKillTarget != null) {
    lines.push(`狼弟覺醒刀：${fmt(draft.wolfYoungerBrotherKillTarget)}`);
  }
  if (draft.jackRipperKillTarget != null) {
    lines.push(`開膛手傑克擊殺：${fmt(draft.jackRipperKillTarget)}`);
  }
  if (draft.scarletAttachTarget != null) {
    lines.push(`猩紅狼王附著：${fmt(draft.scarletAttachTarget)}`);
  }
  if (draft.nightNobleServantTarget != null) {
    lines.push(`夜之貴族夜僕：${fmt(draft.nightNobleServantTarget)}`);
  }
  if (draft.sleepingBeautyPickSeat != null) {
    lines.push(`睡美人選擇：${fmt(draft.sleepingBeautyPickSeat)}`);
  }
  if (draft.socialiteTarget != null) lines.push(`名媛寵幸：${fmt(draft.socialiteTarget)}`);
  if (draft.enchanterTarget != null) lines.push(`蠱惑師蠱惑：${fmt(draft.enchanterTarget)}`);
  if (draft.radiantEarlTarget != null) lines.push(`輝光伯爵守護：${fmt(draft.radiantEarlTarget)}`);
  if (draft.blackBatTarget != null) lines.push(`黑蝙蝠庇護：${fmt(draft.blackBatTarget)}`);
  if (draft.darkNightEnvoyTarget != null) {
    lines.push(`黑夜使者庇護：${fmt(draft.darkNightEnvoyTarget)}`);
  }
  if (draft.alchemyFogTargets && draft.alchemyFogTargets.length > 0) {
    lines.push(`未明之霧：${draft.alchemyFogTargets.map(fmt).join('、')}`);
  }
  if (entry?.bearRoar) {
    lines.push(`熊判定：${entry.bearRoar.roared ? '咆哮' : '未咆哮'}`);
  }
  if (pendingSelfExplodeSeat != null) {
    lines.push(`自爆待出局：${fmt(pendingSelfExplodeSeat)}`);
  }

  return lines;
}
