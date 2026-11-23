import { useMemo } from 'react';
import { getRoleById } from '../../data/roles';
import type { BoardDefinition } from '../../logic/types';
import { SlideDrawer } from './SlideDrawer';
import { getRoleBadgeClasses } from './displayHelpers';

interface QADrawerProps {
  open: boolean;
  board?: BoardDefinition;
  highlightRoleIds?: string[];
  onClose: () => void;
}

export function QADrawer({ open, board, highlightRoleIds = [], onClose }: QADrawerProps) {
  const { prioritizedQAs, otherQAs, boardRoles } = useMemo(() => {
    if (!board) {
      return { prioritizedQAs: [], otherQAs: [], boardRoles: [] };
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

    return { prioritizedQAs: prioritized, otherQAs: others, boardRoles: roles };
  }, [board, highlightRoleIds]);

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      title={`Q & A 規則速查${board ? ` · ${board.name}` : ''}`}
      subtitle="Judge Quick Reference"
      placement="bottom"
    >
      <div className="space-y-5">
        {!board ? (
          <p className="text-sm text-slate-400">尚未選擇板子，請先於開局畫面選擇板子。</p>
        ) : (
            <>
              {prioritizedQAs.length > 0 && (
                <section className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                    <span>★ 當前步驟相關 Q &amp; A</span>
                  </div>
                  {prioritizedQAs.map((qa) => (
                    <div
                      key={qa.id}
                      className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3.5"
                    >
                      <h3 className="whitespace-pre-line text-sm font-bold text-amber-200">
                        Q：{qa.question}
                      </h3>
                      <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-200">
                        A：{qa.answer}
                      </p>
                    </div>
                  ))}
                </section>
              )}

              <section className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {prioritizedQAs.length > 0 ? '本板子其他常見 Q & A' : '本板子常見 Q & A'}
                </h3>
                {otherQAs.length === 0 && prioritizedQAs.length === 0 ? (
                  <p className="text-sm text-slate-400">此板子尚無額外 Q&amp;A 條目。</p>
                ) : (
                  otherQAs.map((qa) => (
                    <div
                      key={qa.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5"
                    >
                      <h4 className="whitespace-pre-line text-sm font-bold text-slate-100">
                        Q：{qa.question}
                      </h4>
                      <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-300">
                        A：{qa.answer}
                      </p>
                    </div>
                  ))
                )}
              </section>

              <section className="space-y-2.5 pb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  板子角色規則摘要
                </h3>
                {boardRoles.map((role) => (
                  <div
                    key={role.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${getRoleBadgeClasses(role.id)}`}
                      >
                        {role.name}
                      </span>
                      {role.aliases.length > 0 && (
                        <span className="text-xs text-slate-400">
                          別名：{role.aliases.join('、')}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-300">
                      {role.description}
                    </p>
                    {role.warnings && role.warnings.length > 0 && (
                      <ul className="mt-2 space-y-1 border-t border-slate-800/80 pt-2">
                        {role.warnings.map((w, idx) => (
                          <li key={idx} className="text-xs leading-relaxed text-amber-300">
                            • {w}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </section>
            </>
          )}
      </div>
    </SlideDrawer>
  );
}
