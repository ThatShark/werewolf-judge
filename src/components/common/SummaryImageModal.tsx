import { useEffect, useState } from 'react';
import {
  canNativeShareFile,
  shareSummaryPngNative,
  triggerPngDownload,
  type GeneratedSummaryImage,
} from '../../utils/exportGameSummaryImage';

interface SummaryImageModalProps {
  open: boolean;
  image: GeneratedSummaryImage | null;
  onClose: () => void;
}

export function SummaryImageModal({ open, image, onClose }: SummaryImageModalProps) {
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setStatusNotice(null);
  }, [open]);

  if (!open || !image) return null;

  const supportsShare = canNativeShareFile(image.blob, image.filename);

  const handleDownload = () => {
    triggerPngDownload(image.blob, image.filename);
    setStatusNotice('已開始下載 PNG 圖片');
  };

  const handleShare = async () => {
    const shared = await shareSummaryPngNative(image.blob, image.filename);
    if (!shared) {
      triggerPngDownload(image.blob, image.filename);
      setStatusNotice('裝置未支援直接分享，已改為下載圖片');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="對局復盤表格圖預覽"
    >
      <div className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-strong bg-surface shadow-2xl">
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-subtle px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-bold text-primary">對局復盤表格圖（PNG）</h2>
            <p className="truncate text-[11px] text-muted">{image.filename}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 shrink-0 rounded-md border border-subtle bg-canvas px-3 text-[13px] font-medium text-secondary hover:border-strong hover:text-primary"
          >
            關閉
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-auto bg-canvas p-3">
          <img
            src={image.dataUrl}
            alt="狼人殺對局座號矩陣復盤表"
            className="mx-auto block h-auto max-w-full rounded-lg border border-subtle shadow-md"
          />
          <p className="mt-2.5 text-center text-[12px] text-muted">
            手機瀏覽器（iOS Safari / Android Chrome）亦可直接長按上方圖片儲存至相簿。
          </p>
        </div>

        <footer className="flex shrink-0 flex-col gap-2 border-t border-subtle bg-surface px-4 py-3">
          {statusNotice && (
            <p className="text-center text-[12px] font-medium text-good">{statusNotice}</p>
          )}
          <div className="flex items-center gap-2">
            {supportsShare && (
              <button
                type="button"
                onClick={handleShare}
                className="min-h-12 flex-1 rounded-md border border-sheriff-border bg-sheriff-tint px-4 text-[14px] font-semibold text-sheriff transition hover:opacity-90"
              >
                分享圖片
              </button>
            )}
            <button
              type="button"
              onClick={handleDownload}
              className="min-h-12 flex-1 rounded-md bg-sheriff px-4 text-[14px] font-semibold text-inverse transition hover:opacity-90"
            >
              下載 PNG
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
