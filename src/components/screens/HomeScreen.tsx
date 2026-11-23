import type { GamePhase } from '../../logic/types';
import { PHASE_LABELS } from '../common/displayHelpers';

interface HomeScreenProps {
  hasActiveGame: boolean;
  currentPhase: GamePhase;
  selectedBoardName?: string;
  onHost: () => void;
  onJoin: () => void;
  onRules: () => void;
  onAbout: () => void;
}

export function HomeScreen({
  hasActiveGame,
  currentPhase,
  selectedBoardName,
  onHost,
  onJoin,
  onRules,
  onAbout,
}: HomeScreenProps) {
  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-col justify-between px-4 py-5 md:max-w-2xl md:py-8">
      {/* 頂部標題區 */}
      <header className="shrink-0 space-y-2 pt-2 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
          <span>V2.0</span>
          <span className="text-amber-500/60">•</span>
          <span>Mobile-First 法官工作台</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-3xl">
          狼人殺法官輔助
        </h1>
        <p className="text-xs text-slate-400 sm:text-sm">
          142 種板子 · 128 個角色 · 零滾輪單屏操作
        </p>
      </header>

      {/* 中央四大入口按鈕 */}
      <nav
        aria-label="主頁功能入口"
        className="my-auto grid w-full grid-cols-1 gap-3 py-4 sm:grid-cols-2 sm:gap-4"
      >
        <button
          type="button"
          onClick={onHost}
          className="group flex min-h-20 flex-col justify-between rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-900 p-4 text-left shadow-lg shadow-amber-950/20 transition hover:border-amber-400/70 hover:from-amber-500/30 active:scale-[0.98]"
        >
          <div className="flex w-full items-center justify-between gap-2">
            <span className="text-lg font-extrabold text-amber-300">主持</span>
            <span className="rounded-lg bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-200">
              {hasActiveGame ? '繼續 / 開局' : '開局大廳'}
            </span>
          </div>
          <p className="mt-1.5 truncate text-xs text-slate-300">
            {hasActiveGame
              ? `進行中：${selectedBoardName ?? '已選板子'}（${PHASE_LABELS[currentPhase]}）`
              : '選擇板子、設定座位與啟動夜間流程'}
          </p>
        </button>

        <button
          type="button"
          onClick={onJoin}
          className="group flex min-h-20 flex-col justify-between rounded-2xl border border-slate-700 bg-slate-900/90 p-4 text-left transition hover:border-sky-500/50 hover:bg-slate-800/90 active:scale-[0.98]"
        >
          <div className="flex w-full items-center justify-between gap-2">
            <span className="text-lg font-extrabold text-sky-300">加入</span>
            <span className="rounded-lg bg-sky-500/15 px-2 py-0.5 text-xs font-semibold text-sky-300">
              房間代碼 / QR
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            輸入房間代碼或掃描 QR Code 加入玩家視角
          </p>
        </button>

        <button
          type="button"
          onClick={onRules}
          className="group flex min-h-20 flex-col justify-between rounded-2xl border border-slate-700 bg-slate-900/90 p-4 text-left transition hover:border-emerald-500/50 hover:bg-slate-800/90 active:scale-[0.98]"
        >
          <div className="flex w-full items-center justify-between gap-2">
            <span className="text-lg font-extrabold text-emerald-300">規則</span>
            <span className="rounded-lg bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-300">
              142 板子 · 128 角色
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            搜尋板子配置、睜眼順序、Q&amp;A 與角色技能
          </p>
        </button>

        <button
          type="button"
          onClick={onAbout}
          className="group flex min-h-20 flex-col justify-between rounded-2xl border border-slate-700 bg-slate-900/90 p-4 text-left transition hover:border-violet-500/50 hover:bg-slate-800/90 active:scale-[0.98]"
        >
          <div className="flex w-full items-center justify-between gap-2">
            <span className="text-lg font-extrabold text-violet-300">關於</span>
            <span className="rounded-lg bg-violet-500/15 px-2 py-0.5 text-xs font-semibold text-violet-300">
              專案與致謝
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            專案簡介、參考網站（狼序 WolfCue）與社團資訊
          </p>
        </button>
      </nav>

      {/* 底部狀態列 */}
      <footer className="shrink-0 pb-1 text-center text-xs text-slate-500">
        支援 PWA 加入主畫面全螢幕 · 對局狀態自動儲存於本機
      </footer>
    </div>
  );
}
