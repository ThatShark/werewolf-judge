import { useMemo, useState } from 'react';
import { ttsEngine } from '../../audio/ttsEngine';
import { getHostModeDescriptor } from '../../logic';
import type { ControlMode, DealMode, JudgeMode } from '../../logic/types';
import { useGameStore } from '../../store/gameStore';

export function HostPreSetupScreen() {
  const hostMode = useGameStore((s) => s.hostMode);
  const onlineJudgeSettings = useGameStore((s) => s.onlineJudgeSettings);
  const updateHostMode = useGameStore((s) => s.updateHostMode);
  const updateOnlineJudgeSettings = useGameStore((s) => s.updateOnlineJudgeSettings);
  const goToBoardSelect = useGameStore((s) => s.goToBoardSelect);

  const [isTtsPreviewing, setIsTtsPreviewing] = useState(false);

  const modeDescriptor = useMemo(() => getHostModeDescriptor(hostMode), [hostMode]);

  const handleToggleTtsPreview = () => {
    if (isTtsPreviewing) {
      ttsEngine.cancel();
      setIsTtsPreviewing(false);
      return;
    }
    setIsTtsPreviewing(true);
    ttsEngine.previewShort(
      {
        enabled: true,
        rate: onlineJudgeSettings.ttsRate,
        onEnd: () => setIsTtsPreviewing(false),
      },
      3000,
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      <header className="shrink-0 border-l-2 border-sheriff pl-3">
        <div className="text-[12px] font-semibold uppercase tracking-wider text-sheriff">
          步驟 1 / 2 · 開房前設定
        </div>
        <h1 className="mt-0.5 text-[18px] font-semibold leading-6 text-primary">
          選擇主持模式（2 × 2 × 2）
        </h1>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-0.5">
        {/* 1. 法官模式 */}
        <section className="space-y-1.5 rounded-lg border border-subtle bg-surface p-3">
          <div className="text-[12px] font-semibold text-secondary">法官模式</div>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: 'physical_judge' as JudgeMode, label: '實體法官', sub: '真人上帝視角主持' },
                { value: 'online_judge' as JudgeMode, label: '線上語音法官', sub: '全員下場語音引導' },
              ] as const
            ).map((opt) => {
              const active = hostMode.judgeMode === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateHostMode({ judgeMode: opt.value })}
                  className={`flex min-h-14 flex-col items-start justify-center rounded-md px-3 py-2 text-left transition ${
                    active
                      ? 'border-selected-sheriff bg-sheriff-tint text-primary'
                      : 'border border-subtle bg-canvas text-secondary hover:border-strong'
                  }`}
                >
                  <span className="text-[14px] font-semibold">{opt.label}</span>
                  <span className="text-[11px] text-muted">{opt.sub}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. 發牌模式 */}
        <section className="space-y-1.5 rounded-lg border border-subtle bg-surface p-3">
          <div className="text-[12px] font-semibold text-secondary">發牌模式</div>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: 'physical_deal' as DealMode, label: '實體發牌', sub: '紙牌發放・首夜認領' },
                { value: 'online_deal' as DealMode, label: '線上發牌', sub: '系統洗牌・傳閱看牌' },
              ] as const
            ).map((opt) => {
              const active = hostMode.dealMode === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateHostMode({ dealMode: opt.value })}
                  className={`flex min-h-14 flex-col items-start justify-center rounded-md px-3 py-2 text-left transition ${
                    active
                      ? 'border-selected-sheriff bg-sheriff-tint text-primary'
                      : 'border border-subtle bg-canvas text-secondary hover:border-strong'
                  }`}
                >
                  <span className="text-[14px] font-semibold">{opt.label}</span>
                  <span className="text-[11px] text-muted">{opt.sub}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. 操作模式 */}
        <section className="space-y-1.5 rounded-lg border border-subtle bg-surface p-3">
          <div className="text-[12px] font-semibold text-secondary">操作裝置</div>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: 'central_control' as ControlMode, label: '單機中央操作', sub: '單一裝置集中主持' },
                { value: 'multi_device' as ControlMode, label: '多機連線', sub: '各自手機操作（規劃中）' },
              ] as const
            ).map((opt) => {
              const active = hostMode.controlMode === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateHostMode({ controlMode: opt.value })}
                  className={`flex min-h-14 flex-col items-start justify-center rounded-md px-3 py-2 text-left transition ${
                    active
                      ? 'border-selected-sheriff bg-sheriff-tint text-primary'
                      : 'border border-subtle bg-canvas text-secondary hover:border-strong'
                  }`}
                >
                  <span className="text-[14px] font-semibold">{opt.label}</span>
                  <span className="text-[11px] text-muted">{opt.sub}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 線上語音法官設定與 3 秒試聽 */}
        {hostMode.judgeMode === 'online_judge' && (
          <section className="space-y-2.5 rounded-lg border border-subtle bg-surface p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[14px] font-semibold text-primary">語音播報（TTS）</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleToggleTtsPreview}
                  className={`min-h-10 rounded-md border px-3 text-[12px] font-semibold transition ${
                    isTtsPreviewing
                      ? 'border-good-border bg-good-tint text-good'
                      : 'border-subtle bg-canvas text-primary hover:border-strong'
                  }`}
                >
                  {isTtsPreviewing ? '停止試聽' : '試聽（3 秒）'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateOnlineJudgeSettings({ ttsEnabled: !onlineJudgeSettings.ttsEnabled })
                  }
                  className={`min-h-10 rounded-md border px-3 text-[12px] font-semibold ${
                    onlineJudgeSettings.ttsEnabled
                      ? 'border-good-border bg-good-tint text-good'
                      : 'border-subtle bg-canvas text-muted'
                  }`}
                >
                  {onlineJudgeSettings.ttsEnabled ? '開啟' : '靜音'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between rounded-md border border-subtle bg-canvas px-2.5 py-2">
                <span className="text-[12px] text-secondary">緩衝</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      updateOnlineJudgeSettings({
                        stepBufferSeconds: onlineJudgeSettings.stepBufferSeconds - 1,
                      })
                    }
                    className="min-h-9 min-w-9 rounded-md border border-subtle bg-surface text-[14px] font-semibold text-primary"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-[14px] font-semibold tabular-nums text-sheriff">
                    {onlineJudgeSettings.stepBufferSeconds}s
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateOnlineJudgeSettings({
                        stepBufferSeconds: onlineJudgeSettings.stepBufferSeconds + 1,
                      })
                    }
                    className="min-h-9 min-w-9 rounded-md border border-subtle bg-surface text-[14px] font-semibold text-primary"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-md border border-subtle bg-canvas px-2.5 py-2">
                <span className="text-[12px] text-secondary">語速</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      updateOnlineJudgeSettings({
                        ttsRate: onlineJudgeSettings.ttsRate - 0.1,
                      })
                    }
                    className="min-h-9 min-w-9 rounded-md border border-subtle bg-surface text-[14px] font-semibold text-primary"
                  >
                    −
                  </button>
                  <span className="w-9 text-center text-[14px] font-semibold tabular-nums text-primary">
                    {onlineJudgeSettings.ttsRate.toFixed(1)}×
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateOnlineJudgeSettings({
                        ttsRate: onlineJudgeSettings.ttsRate + 0.1,
                      })
                    }
                    className="min-h-9 min-w-9 rounded-md border border-subtle bg-surface text-[14px] font-semibold text-primary"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 模式說明摘要 */}
        <div className="rounded-md border-l-2 border-sheriff bg-surface px-3 py-2 text-[12px] leading-5 text-secondary">
          <div className="font-semibold text-primary">
            模式 {modeDescriptor.modeNumber} · {modeDescriptor.shortTitle}
          </div>
          <p className="mt-0.5">{modeDescriptor.description}</p>
        </div>
      </div>

      <footer className="shrink-0 border-t border-subtle pt-2">
        <button
          type="button"
          onClick={goToBoardSelect}
          className="min-h-12 w-full rounded-md bg-sheriff px-4 text-[14px] font-semibold text-inverse transition hover:opacity-90"
        >
          下一步：選擇人數與板子 →
        </button>
      </footer>
    </div>
  );
}
