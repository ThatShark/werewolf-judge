import { SlideDrawer } from './SlideDrawer';

interface NotebookDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function NotebookDrawer({ open, onClose }: NotebookDrawerProps) {
  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      title="玩家雙模式筆記本"
      subtitle="Notebook Drawer"
      placement="bottom"
    >
      <div className="space-y-4 pb-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-sm font-semibold text-slate-200">
            自由筆記本 ⇄ 階段 × 座號結構化表格
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
            完整雙模式筆記本與 localStorage 持久化功能將於 Phase A5 開放，屆時可在遊戲中隨時滑出記錄抿牌、警上發言與每天票型資訊。
          </p>
        </div>
      </div>
    </SlideDrawer>
  );
}
