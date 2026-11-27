import { ALL_BOARDS } from '../../data/boards';
import { ROLE_LIST } from '../../data/roles';

interface AboutScreenProps {
  onBackHome: () => void;
}

export function AboutScreen({ onBackHome }: AboutScreenProps) {
  return (
    <div className="flex h-full min-h-0 flex-col justify-between gap-3">
      <div className="min-h-0 flex-1 divide-y divide-subtle overflow-y-auto">
        <section className="space-y-2 py-3">
          <h2 className="text-[14px] font-semibold text-sheriff">專案簡介</h2>
          <p className="text-[14px] leading-5 text-primary">
            專為線下聚會設計的法官輔助工具，協助完成發牌、夜間主持、警長競選、發言計時與復盤。
          </p>
          <ul className="space-y-1 text-[12px] tabular-nums text-secondary">
            <li>• {ALL_BOARDS.length} 種板子 · {ROLE_LIST.length} 個角色</li>
          </ul>
        </section>

        <section className="space-y-2 py-3">
          <h2 className="text-[14px] font-semibold text-third">參考致謝</h2>
          <p className="text-[12px] leading-5 text-secondary">參考了這個網站的流程設計。</p>
          <a
            href="https://wolfcue.runs-at.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 items-center justify-between rounded-md border border-subtle bg-surface px-4 text-[14px] font-medium text-primary hover:border-strong"
          >
            <span>狼序 WolfCue</span>
            <span className="text-[12px] text-secondary">↗</span>
          </a>
        </section>

        <section className="space-y-2 py-3">
          <h2 className="text-[14px] font-semibold text-good">社團使用</h2>
          <p className="text-[12px] leading-5 text-secondary">
            歡迎各校桌遊社與親友團作為日常開局與教學輔助使用。歡迎加入成大狼殺社！
          </p>
          <a
            href="https://line.me/ti/g2/wM7tXu7L6ICtgMX4yJWvtlw8kq4KmACR8HU-4A?utm_source=invitation&utm_medium=link_copy&utm_campaign=default"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 items-center justify-between rounded-md border border-subtle bg-surface px-4 text-[14px] font-medium text-primary hover:border-strong"
          >
            <span>加入「成大狼殺社🐺🐺」LINE 社群</span>
            <span className="text-[12px] text-secondary">↗</span>
          </a>
        </section>
      </div>

      <footer className="shrink-0 border-t border-subtle pt-2">
        <button
          type="button"
          onClick={onBackHome}
          className="min-h-12 w-full rounded-md border border-subtle bg-surface px-4 text-[14px] font-medium text-secondary hover:border-strong hover:text-primary"
        >
          返回主頁
        </button>
      </footer>
    </div>
  );
}
