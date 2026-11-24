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
      setNotice('請輸入 4～6 碼房間代碼。');
      return;
    }
    setNotice(`已收到代碼「${cleaned}」— 連線房間將於多點版開放，目前可使用單機主持。`);
  };

  return (
    <div className="flex h-full min-h-0 flex-col justify-between gap-3">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        <section className="space-y-3 rounded-lg border border-subtle bg-surface p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[18px] font-semibold text-primary">輸入房間代碼</h2>
            <span className="text-[12px] text-muted">多點版預留</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2.5">
            <input
              type="text"
              inputMode="text"
              maxLength={8}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="WOLF88"
              aria-label="房間代碼"
              className="min-h-12 w-full rounded-md border border-subtle bg-canvas px-4 text-center text-[18px] font-semibold tracking-widest tabular-nums text-primary placeholder:text-[14px] placeholder:font-normal placeholder:tracking-normal placeholder:text-muted focus:border-sheriff focus:outline-none"
            />
            <button
              type="submit"
              className="min-h-12 w-full rounded-md bg-sheriff px-4 text-[14px] font-semibold text-inverse transition hover:opacity-90"
            >
              加入房間
            </button>
          </form>
        </section>

        <section className="space-y-2.5 rounded-lg border border-subtle bg-surface p-4">
          <h2 className="text-[14px] font-semibold text-primary">掃描 QR Code</h2>
          <button
            type="button"
            onClick={() => {
              setScannerOpen((prev) => !prev);
              setNotice('連線房間與相機掃描將於多點版開放。');
            }}
            className="min-h-12 w-full rounded-md border border-subtle bg-canvas px-4 text-[14px] font-medium text-secondary hover:border-strong hover:text-primary"
          >
            {scannerOpen ? '關閉掃描預覽' : '開啟掃描介面'}
          </button>

          {scannerOpen && (
            <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-strong bg-canvas text-[12px] text-muted">
              QR Code 掃描預留區
            </div>
          )}
        </section>

        {notice && (
          <div
            role="status"
            className="border-l-2 border-sheriff bg-surface px-3 py-2 text-[14px] text-sheriff"
          >
            {notice}
          </div>
        )}
      </div>

      <footer className="flex shrink-0 gap-2 border-t border-subtle pt-2">
        <button
          type="button"
          onClick={onBackHome}
          className="min-h-12 flex-1 rounded-md border border-subtle bg-surface px-4 text-[14px] font-medium text-secondary hover:border-strong hover:text-primary"
        >
          返回主頁
        </button>
        <button
          type="button"
          onClick={onGoHost}
          className="min-h-12 flex-1 rounded-md bg-sheriff px-4 text-[14px] font-semibold text-inverse hover:opacity-90"
        >
          前往主持
        </button>
      </footer>
    </div>
  );
}
