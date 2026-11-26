import { useMemo } from 'react';
import { getRoleById } from '../../data/roles';
import { DEFAULT_RULE_OVERRIDES, getBoardRoleIdSet } from '../../logic';
import type { BoardDefinition, RuleOverrides } from '../../logic/types';
import { SlideDrawer } from './SlideDrawer';
import { getRoleBadgeClasses } from './displayHelpers';

interface QADrawerProps {
  open: boolean;
  board?: BoardDefinition;
  ruleOverrides?: RuleOverrides;
  highlightRoleIds?: string[];
  onClose: () => void;
}

function getWitchSelfSaveLabel(rule: RuleOverrides['witchSelfSave']): string {
  switch (rule) {
    case 'first_night_only':
      return '僅首晚能';
    case 'never':
      return '不能';
    case 'always':
      return '能';
  }
}

export function QADrawer({
  open,
  board,
  ruleOverrides = DEFAULT_RULE_OVERRIDES,
  highlightRoleIds = [],
  onClose,
}: QADrawerProps) {
  const { prioritizedQAs, otherQAs, boardRoles, specialRuleLines } = useMemo(() => {
    if (!board) {
      return {
        prioritizedQAs: [],
        otherQAs: [],
        boardRoles: [],
        specialRuleLines: [],
      };
    }
    const highlightSet = new Set(highlightRoleIds);
    const prioritized = board.qaList.filter((qa) =>
      qa.relatedRoleIds?.some((id) => highlightSet.has(id)),
    );
    const others = board.qaList.filter(
      (qa) => !qa.relatedRoleIds?.some((id) => highlightSet.has(id)),
    );

    const roleIds = Array.from(
      new Set([
        ...board.composition.wolf.map((s) => s.roleId),
        ...board.composition.good.map((s) => s.roleId),
        ...(board.composition.thirdParty ?? []).map((s) => s.roleId),
      ]),
    );
    const roles = roleIds
      .map((id) => getRoleById(id))
      .filter((r): r is NonNullable<typeof r> => Boolean(r));

    const rules: string[] = [];
    if (board.specialRules && board.specialRules.length > 0) {
      for (const line of board.specialRules) {
        if (!rules.includes(line)) rules.push(line);
      }
    }
    if (board.compositionNote && !rules.includes(board.compositionNote)) {
      rules.push(board.compositionNote);
    }

    return {
      prioritizedQAs: prioritized,
      otherQAs: others,
      boardRoles: roles,
      specialRuleLines: rules,
    };
  }, [board, highlightRoleIds]);

  const isDoubleExplode = ruleOverrides.badgeSwallowRule === 'double_explode';
  const witchSelfSaveLabel = getWitchSelfSaveLabel(ruleOverrides.witchSelfSave);
  const victoryModeLabel = ruleOverrides.victoryMode === 'slaughter_all' ? '屠城' : '屠邊';

  const boardRoleIdSet = useMemo(
    () => (board ? getBoardRoleIdSet(board) : new Set<string>()),
    [board],
  );
  const hasWitch = boardRoleIdSet.has('witch') || boardRoleIdSet.has('awakened_witch');
  const hasMechWolf = boardRoleIdSet.has('mech_wolf');
  const hasBlackMarket = boardRoleIdSet.has('black_market_merchant');
  const hasMiracle = boardRoleIdSet.has('miracle_merchant');
  const hasSuperBlackMarket = boardRoleIdSet.has('super_black_market_merchant');
  const hasMerchant = hasBlackMarket || hasMiracle || hasSuperBlackMarket;

  const luckySummary = useMemo(() => {
    if (!hasMerchant) return '';
    const cfg = ruleOverrides.luckyFirstNightSkills;
    const parts: string[] = [];
    if (hasBlackMarket) {
      const enabled = [
        cfg.blackMarket.seer_check ? '查' : null,
        cfg.blackMarket.witch_poison ? '毒' : null,
        cfg.blackMarket.hunter_gun ? '槍' : null,
      ].filter(Boolean);
      parts.push(`黑市:${enabled.length > 0 ? enabled.join('/') : '皆禁'}`);
    }
    if (hasMiracle) {
      const enabled = [
        cfg.miracle.seer_check ? '查' : null,
        cfg.miracle.witch_poison ? '毒' : null,
        cfg.miracle.guard_shield ? '守' : null,
      ].filter(Boolean);
      parts.push(`奇蹟:${enabled.length > 0 ? enabled.join('/') : '皆禁'}`);
    }
    if (hasSuperBlackMarket) {
      const enabled = [
        cfg.superBlackMarket.seer_check ? '查' : null,
        cfg.superBlackMarket.witch_poison ? '毒' : null,
        cfg.superBlackMarket.hunter_gun ? '槍' : null,
      ].filter(Boolean);
      parts.push(`超黑市:${enabled.length > 0 ? enabled.join('/') : '皆禁'}`);
    }
    return parts.join(' · ');
  }, [hasMerchant, hasBlackMarket, hasMiracle, hasSuperBlackMarket, ruleOverrides.luckyFirstNightSkills]);

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      title={board ? `規則 · ${board.name}` : '規則與 Q&A'}
      placement="bottom"
    >
      <div className="space-y-4">
        {/* 1. 板子首夜／全局特殊規則（最上方醒目呈現） */}
        {specialRuleLines.length > 0 && (
          <section className="space-y-2 rounded-md border border-sheriff-border bg-sheriff-tint/60 p-3">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-sheriff">
              板子特殊規則
            </h3>
            <ul className="space-y-1">
              {specialRuleLines.map((ruleText, idx) => (
                <li key={idx} className="text-[13px] font-medium leading-5 text-primary">
                  • {ruleText}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 2. 本局生效房規 */}
        <section className="space-y-2">
          <h3 className="text-[12px] font-semibold uppercase tracking-wider text-secondary">
            本局生效房規
          </h3>
          <div className="flex flex-wrap gap-1.5 text-[12px]">
            <span className="rounded-md border border-subtle bg-canvas px-2 py-1 text-secondary">
              勝負：<span className="font-semibold text-good">{victoryModeLabel}</span>
            </span>
            <span className="rounded-md border border-subtle bg-canvas px-2 py-1 text-secondary">
              警長：
              <span className="font-semibold text-sheriff">
                {!ruleOverrides.enableSheriff
                  ? '沒有'
                  : `${isDoubleExplode ? '雙爆吞徽' : '單爆吞徽'} · ${
                      (ruleOverrides.sheriffVoteWeight ?? 1.5) === 2 ? '2票' : '1.5票'
                    }`}
              </span>
            </span>
            {hasWitch && (
              <span className="rounded-md border border-subtle bg-canvas px-2 py-1 text-secondary">
                女巫自救：<span className="font-semibold text-primary">{witchSelfSaveLabel}</span>
              </span>
            )}
            {hasMechWolf && (
              <span className="rounded-md border border-subtle bg-canvas px-2 py-1 text-secondary">
                機械狼首夜學：
                <span className="font-semibold text-primary">
                  {ruleOverrides.mechWolfForceLearnNight1 ? '強制' : '可跳過'}
                </span>
              </span>
            )}
            {hasMerchant && (
              <span className="rounded-md border border-subtle bg-canvas px-2 py-1 text-secondary">
                首夜幸運兒：<span className="font-semibold text-primary">{luckySummary}</span>
              </span>
            )}
          </div>
        </section>

        {!board ? (
          <p className="text-[14px] text-secondary">尚未選擇板子。</p>
        ) : (
          <>
            {/* 3. 板子角色規則（移至常見 Q&A 上方，徹底移除睜眼順序） */}
            <section className="space-y-2 border-t border-subtle pt-3">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-secondary">
                板子角色規則
              </h3>
              <div className="divide-y divide-subtle">
                {boardRoles.map((role) => (
                  <div key={role.id} className="py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[12px] font-semibold ${getRoleBadgeClasses(role.id)}`}
                      >
                        {role.name}
                      </span>
                      {role.aliases.length > 0 && (
                        <span className="text-[12px] text-muted">
                          {role.aliases.join(' / ')}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 whitespace-pre-line text-[12px] leading-5 text-secondary">
                      {role.description}
                    </p>
                    {role.warnings && role.warnings.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5">
                        {role.warnings.map((w, idx) => (
                          <li key={idx} className="text-[12px] leading-4 text-sheriff">
                            • {w}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* 4. 當前步驟相關 Q&A */}
            {prioritizedQAs.length > 0 && (
              <section className="space-y-2 border-t border-subtle pt-3">
                <h3 className="text-[12px] font-semibold uppercase tracking-wider text-sheriff">
                  當前步驟相關 Q&amp;A
                </h3>
                <div className="divide-y divide-subtle">
                  {prioritizedQAs.map((qa) => (
                    <div key={qa.id} className="border-l-2 border-sheriff py-2.5 pl-3">
                      <h4 className="whitespace-pre-line text-[14px] font-semibold text-primary">
                        Q：{qa.question}
                      </h4>
                      <p className="mt-1 whitespace-pre-line text-[12px] leading-5 text-secondary">
                        A：{qa.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 5. 常見 Q&A（若無任何 Q&A 資料則自動隱藏） */}
            {board.qaList.length > 0 && otherQAs.length > 0 && (
              <section className="space-y-2 border-t border-subtle pt-3">
                <h3 className="text-[12px] font-semibold uppercase tracking-wider text-secondary">
                  常見 Q&amp;A
                </h3>
                <div className="divide-y divide-subtle">
                  {otherQAs.map((qa) => (
                    <div key={qa.id} className="py-2.5">
                      <h4 className="whitespace-pre-line text-[14px] font-semibold text-primary">
                        Q：{qa.question}
                      </h4>
                      <p className="mt-1 whitespace-pre-line text-[12px] leading-5 text-secondary">
                        A：{qa.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </SlideDrawer>
  );
}
