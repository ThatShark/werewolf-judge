import { useMemo } from 'react';
import { getRoleById } from '../../data/roles';
import { DEFAULT_RULE_OVERRIDES } from '../../logic';
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

  const isDoubleExplode = ruleOverrides.badgeSwallowRule === 'double_explode';
  const witchSelfSaveLabel = getWitchSelfSaveLabel(ruleOverrides.witchSelfSave);
  const victoryModeLabel =
    ruleOverrides.victoryMode === 'slaughter_all' ? '屠城（全滅好人）' : '屠邊（全滅神職或平民）';

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      title={`Q & A 規則速查${board ? ` · ${board.name}` : ''}`}
      subtitle="Judge Quick Reference"
      placement="bottom"
    >
      <div className="space-y-5">
        {/* 置頂：邊界規則裁決小抄（動態標示本局 ruleOverrides 生效結果） */}
        <section className="space-y-2.5 rounded-2xl border border-indigo-500/40 bg-indigo-950/25 p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-200">
              ⚡ 常見技能衝突裁決小抄
            </h2>
            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-200">
              已同步本局房規
            </span>
          </div>

          <div className="space-y-2">
            {/* 1. 同守同救奶穿 */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <h3 className="text-xs font-extrabold text-amber-200">🛡️＋💊 同守同救（奶穿）</h3>
                <span className="rounded-md border border-rose-500/40 bg-rose-950/50 px-2 py-0.5 text-[10px] font-bold text-rose-200">
                  本局生效：奶穿死亡・不可開槍
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                守衛守護與女巫解藥同時作用於同一名刀口目標時，判定「奶穿」出局；且該目標若為獵人或狼王，視為不可開槍。
              </p>
            </div>

            {/* 2. 連環開槍 */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <h3 className="text-xs font-extrabold text-amber-200">🔫 連環開槍（獵人 / 狼王）</h3>
                <span className="rounded-md border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-200">
                  本局生效：{ruleOverrides.wolfKillPriority ? '狼刀在先' : '毒殺優先'}
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                被狼刀或白天放逐出局可開槍；被女巫毒殺、白狼王自爆帶走或騎士決鬥撞死則不可開槍。若開槍帶走另一位槍系角色（獵人／狼王），將自動觸發連環開槍。
              </p>
            </div>

            {/* 3. 單爆 / 雙爆吞警徽 */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <h3 className="text-xs font-extrabold text-amber-200">💥 警上自爆吞警徽規則</h3>
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                    !ruleOverrides.enableSheriff
                      ? 'border-slate-700 bg-slate-800 text-slate-300'
                      : isDoubleExplode
                        ? 'border-indigo-400/50 bg-indigo-500/20 text-indigo-200'
                        : 'border-rose-500/50 bg-rose-950/60 text-rose-200'
                  }`}
                >
                  {!ruleOverrides.enableSheriff
                    ? '本局生效：關閉警長競選'
                    : isDoubleExplode
                      ? '本局生效：雙爆吞警徽'
                      : '本局生效：單爆吞警徽'}
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                {!ruleOverrides.enableSheriff
                  ? '本局已關閉警長競選，白天無上警與吞警徽流程。'
                  : isDoubleExplode
                    ? '首次警上狼人自爆立即入夜，隔天天亮跳過警上發言直接退水與警下投票；若此時發生第二次狼人自爆才正式吞警徽（本局無警長）。'
                    : '警上競選期間只要發生一次狼人自爆，立即吞警徽（本局無警長）並強制進入下一晚。'}
              </p>
            </div>

            {/* 4. 本局生效房規總覽標籤 */}
            <div className="flex flex-wrap gap-1.5 pt-0.5 text-[11px] font-bold">
              <span className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-slate-200">
                女巫自救：<span className="text-amber-300">{witchSelfSaveLabel}</span>
              </span>
              <span className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-slate-200">
                勝負：<span className="text-emerald-300">{victoryModeLabel}</span>
              </span>
              <span className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-slate-200">
                白痴翻牌：
                <span className="text-indigo-200">
                  {ruleOverrides.idiotNeedsExtraKill ? '需追刀才算神職出局' : '翻牌即不計存活神職'}
                </span>
              </span>
            </div>
          </div>
        </section>

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
