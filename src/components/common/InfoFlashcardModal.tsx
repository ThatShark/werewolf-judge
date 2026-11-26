export type FlashcardTone = 'good' | 'wolf' | 'sheriff' | 'third' | 'neutral';

export interface InfoFlashcardData {
  eyebrow: string;
  /** 第一行主體（例如座號 `04 號`），與下方陣營／結果強制分行排版 */
  subject?: string;
  headline: string;
  detail?: string;
  tone?: FlashcardTone;
}

interface InfoFlashcardModalProps {
  data: InfoFlashcardData | null;
  onClose: () => void;
}

const TONE_BORDER: Record<FlashcardTone, string> = {
  good: 'border-good',
  wolf: 'border-wolf',
  sheriff: 'border-sheriff',
  third: 'border-third',
  neutral: 'border-strong',
};

const TONE_TEXT: Record<FlashcardTone, string> = {
  good: 'text-good',
  wolf: 'text-wolf',
  sheriff: 'text-sheriff',
  third: 'text-third',
  neutral: 'text-primary',
};

/**
 * 「放大展示給玩家看」全屏防窺遮罩卡：
 * 使用純黑實色遮罩（bg-blackout）完整覆蓋背景所有座位底牌，
 * 讓法官可直接將手機轉給睜眼玩家閱讀關鍵查驗／開槍／贈禮資訊。
 */
export function InfoFlashcardModal({ data, onClose }: InfoFlashcardModalProps) {
  if (!data) return null;
  const tone = data.tone ?? 'sheriff';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={data.eyebrow}
      onClick={onClose}
      className="fixed inset-0 z-50 flex h-dvh w-full cursor-pointer select-none flex-col justify-between bg-blackout px-6 py-8 text-primary"
    >
      <div className="mx-auto flex w-full max-w-lg items-center justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-widest text-muted">
          防窺放大展示
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="min-h-11 rounded-md border border-subtle bg-surface px-4 text-[14px] font-semibold text-primary hover:border-strong"
        >
          關閉 ✕
        </button>
      </div>

      <div
        className={`mx-auto w-full max-w-md border-l-4 bg-surface px-6 py-8 text-left ${TONE_BORDER[tone]}`}
      >
        <div className="text-[14px] font-semibold text-secondary">{data.eyebrow}</div>
        {data.subject && (
          <div className="mt-3 text-[32px] font-bold leading-tight tracking-tight tabular-nums text-primary sm:text-[38px]">
            {data.subject}
          </div>
        )}
        <div
          className={`${data.subject ? 'mt-1.5' : 'mt-3'} break-keep whitespace-pre-line text-[32px] font-bold leading-snug tracking-tight tabular-nums sm:text-[40px] ${TONE_TEXT[tone]}`}
        >
          {data.headline}
        </div>
        {data.detail && (
          <p className="mt-4 text-[18px] font-medium leading-7 text-primary">{data.detail}</p>
        )}
      </div>

      <div className="mx-auto w-full max-w-lg text-center text-[12px] text-muted">
        背景座位底牌已完全遮蔽 · 點擊螢幕任意處返回夜間主持
      </div>
    </div>
  );
}
