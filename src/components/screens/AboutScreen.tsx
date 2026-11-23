interface AboutScreenProps {
  onBackHome: () => void;
}

export function AboutScreen({ onBackHome }: AboutScreenProps) {
  return (
    <div className="flex h-full min-h-0 flex-col justify-between gap-4">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-0.5">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <h2 className="text-base font-bold text-amber-300">專案簡介</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-200">
            「狼人殺法官輔助」專為線下聚會與社團局設計，採用 Mobile-First 全站暗黑模式與零滾輪單屏架構，協助法官與玩家在低光環境下零失誤完成發牌、夜間睜閉眼主持、警長競選、發言計時與投票復盤。
          </p>
          <ul className="mt-3 space-y-1 text-xs text-slate-400">
            <li>• 內建 142 種完整板子與 128 個不重複角色資料</li>
            <li>• 支援 PWA 加入主畫面全螢幕體驗，杜絕網址列跳動</li>
            <li>• 透過 Zustand + localStorage 自動存檔，重整或切換 App 不遺失對局</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <h2 className="text-base font-bold text-violet-300">參考網站與致謝</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
            本專案在介面體驗、發牌流程與復盤設計上深受以下優秀狼人殺工具啟發：
          </p>
          <div className="mt-3 space-y-2">
            <a
              href="https://wolfcue.com"
              target="_blank"
              rel="noreferrer"
              className="flex min-h-12 items-center justify-between rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-violet-400/60 hover:bg-slate-800"
            >
              <span>狼序 WolfCue</span>
              <span className="text-xs text-violet-300">前往參考網站 ↗</span>
            </a>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <h2 className="text-base font-bold text-emerald-300">社團資訊</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
            歡迎各大專院校桌遊社、狼人殺社團與線下親友團使用本工具作為日常開局與教學輔助；若有板子勘誤或新角色建議，歡迎於專案社群回報交流。
          </p>
        </section>
      </div>

      <button
        type="button"
        onClick={onBackHome}
        className="min-h-12 w-full shrink-0 rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm font-bold text-slate-200 transition hover:bg-slate-800 active:scale-[0.98]"
      >
        返回主頁
      </button>
    </div>
  );
}
