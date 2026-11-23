import { useState, type FormEvent } from 'react';

interface JoinRoomScreenProps {
  onBackHome: () => void;
  onGoHost: () => void;
}

export function JoinRoomScreen({ onBackHome, onGoHost }: JoinRoomScreenProps) {
  const [roomCode, setRoomCode] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = roomCode.trim().toUpperCase();
    if (!cleaned) {
      setNotice('請先輸入 4～6 碼房間代碼，或使用下方掃描 QR Code 功能。');
      return;
    }
    setNotice(
      `已收到房間代碼「${cleaned}」— 連線房間將於多點版（Milestone B）正式開放，目前可先使用「主持」進行單機開局。`,
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col justify-between gap-4">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-0.5">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-slate-100">輸入房間代碼</h2>
            <span className="rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-xs font-semibold text-sky-300">
              Milestone B 預留
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            當主持人開啟「線上發牌」或「多點操作」模式時，可輸入主持人畫面上的房間代碼入座。
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <input
              type="text"
              inputMode="text"
              maxLength={8}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="例如：WOLF88"
              aria-label="房間代碼"
              className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-center text-lg font-extrabold tracking-widest text-slate-100 placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
            />
            <button
              type="submit"
              className="min-h-12 w-full rounded-xl bg-sky-600 px-4 text-sm font-bold text-white transition hover:bg-sky-500 active:scale-[0.98]"
            >
              加入房間
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <h2 className="text-base font-bold text-slate-100">掃描 QR Code</h2>
          <p className="mt-1 text-xs text-slate-400">
            使用裝置相機掃描主持人提供的房間 QR Code 快速入座。
          </p>

          <button
            type="button"
            onClick={() => {
              setScannerOpen((prev) => !prev);
              setNotice('連線房間與相機 QR Code 掃描將於多點版（Milestone B）開放。');
            }}
            className="mt-3 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 text-sm font-bold text-slate-200 transition hover:bg-slate-700 active:scale-[0.98]"
          >
            {scannerOpen ? '關閉掃描框預覽' : '開啟 QR Code 掃描介面'}
          </button>

          {scannerOpen && (
            <div className="mt-3 flex h-36 flex-col items-center justify-center rounded-xl border-2 border-dashed border-sky-500/40 bg-slate-950/90 p-4 text-center">
              <p className="text-xs font-semibold text-sky-300">QR Code 相機掃描區（骨架預留）</p>
              <p className="mt-1 text-xs text-slate-500">將於 Milestone B 串接即時連線房間</p>
            </div>
          )}
        </section>

        {notice && (
          <div
            role="status"
            className="rounded-2xl border border-amber-500/40 bg-amber-950/30 p-4 text-sm leading-relaxed text-amber-200"
          >
            {notice}
          </div>
        )}
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={onBackHome}
          className="min-h-12 rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm font-bold text-slate-200 transition hover:bg-slate-800 active:scale-[0.98]"
        >
          返回主頁
        </button>
        <button
          type="button"
          onClick={onGoHost}
          className="min-h-12 rounded-xl bg-amber-500 px-4 text-sm font-bold text-slate-950 transition hover:bg-amber-400 active:scale-[0.98]"
        >
          前往主持開局
        </button>
      </div>
    </div>
  );
}
