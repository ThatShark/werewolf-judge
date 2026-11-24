import { useMemo } from 'react';
import { getRoleById } from '../../data/roles';
import { DEFAULT_RULE_OVERRIDES, getNightSteps } from '../../logic';
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
      return '僅首夜可自救';
    case 'never':
      return '全程不可自救';
    case 'always':
      return '全程可自救';
  }
}

export function QADrawer({
  open,
  board,
  ruleOverrides = DEFAULT_RULE_OVERRIDES,
  highlightRoleIds = [],
  onClose,
}: QADrawerProps) {
  const { prioritizedQAs, otherQAs, boardRoles, firstNightOrder, regularNightOrder } =
    useMemo(() => {
      if (!board) {
        return {
          prioritizedQAs: [],
          otherQAs: [],
          boardRoles: [],
          firstNightOrder: [],
          regularNightOrder: [],
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

      return {
        prioritizedQAs: prioritized,
        otherQAs: others,
        boardRoles: roles,
        firstNightOrder: getNightSteps(board, 1).map((s) => s.actorLabel),
        regularNightOrder: getNightSteps(board, 2).map((s) => s.actorLabel),
      };
    }, [board, highlightRoleIds]);

  const isDoubleExplode = ruleOverrides.badgeSwallowRule === 'double_explode';
  const witchSelfSaveLabel = getWitchSelfSaveLabel(ruleOverrides.witchSelfSave);
  const victoryModeLabel = ruleOverrides.victoryMode === 'slaughter_all' ? '屠城' : '屠邊';

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      title={board ? `規則 · ${board.name}` : '規則與 Q&A'}
      placement="bottom"
    >
      <div className="space-y-4">
        {/* 本局生效房規與常見衝突 */}
        <section className="space-y-2">
          <h3 className="text-[12px] font-semibold uppercase tracking-wider text-secondary">
            本局生效房規
          </h3>
          <div className="flex flex-wrap gap-1.5 text-[12px]">
            <span className="rounded-md border border-subtle bg-canvas px-2 py-1 text-secondary">
              女巫：<span className="font-semibold text-primary">{witchSelfSaveLabel}</span>
            </span>
            <span className="rounded-md border border-subtle bg-canvas px-2 py-1 text-secondary">
              勝負：<span className="font-semibold text-good">{victoryModeLabel}</span>
            </span>
            <span className="rounded-md border border-subtle bg-canvas px-2 py-1 text-secondary">
              警徽：
              <span className="font-semibold text-sheriff">
                {!ruleOverrides.enableSheriff
                  ? '關閉'
                  : isDoubleExplode
                    ? '雙爆吞徽'
                    : '單爆吞徽'}
              </span>
            </span>
            <span className="rounded-md border border-subtle bg-canvas px-2 py-1 text-secondary">
              奶穿：<span className="font-semibold text-wolf">死亡且禁槍</span>
            </span>
            <span className="rounded-md border border-subtle bg-canvas px-2 py-1 text-secondary">
              結算：
              <span className="font-semibold text-primary">
                {ruleOverrides.wolfKillPriority ? '狼刀在先' : '毒殺優先'}
              </span>
            </span>
          </div>
        </section>

        {!board ? (
          <p className="text-[14px] text-secondary">尚未選擇板子。</p>
        ) : (
          <>
            {/* 睜眼順序 */}
            <section className="space-y-2 border-t border-subtle pt-3">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-secondary">
                睜眼順序
              </h3>
              <div className="space-y-1.5 text-[12px] leading-5">
                <div>
                  <span className="font-semibold text-sheriff">首夜：</span>
                  <span className="text-primary">{firstNightOrder.join(' → ')}</span>
                </div>
                <div>
                  <span className="font-semibold text-secondary">次夜：</span>
                  <span className="text-secondary">{regularNightOrder.join(' → ')}</span>
                </div>
              </div>
            </section>

            {/* 當前步驟相關 Q&A */}
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

            {/* 其他 Q&A */}
            {(otherQAs.length > 0 || prioritizedQAs.length === 0) && (
              <section className="space-y-2 border-t border-subtle pt-3">
                <h3 className="text-[12px] font-semibold uppercase tracking-wider text-secondary">
                  常見 Q&amp;A
                </h3>
                {otherQAs.length === 0 ? (
                  <p className="text-[12px] text-muted">此板子無額外 Q&amp;A。</p>
                ) : (
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
                )}
              </section>
            )}

            {/* 板子角色說明 */}
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
          </>
        )}
      </div>
    </SlideDrawer>
  );
}
