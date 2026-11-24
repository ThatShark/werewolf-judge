import { useEffect, useRef, useState } from 'react';
import { ambientAudioEngine } from '../../audio/ambientAudioEngine';
import type { AmbientPresetId } from '../../logic/types';
import { useGameStore } from '../../store/gameStore';

const PRESET_OPTIONS: Array<{
  id: Exclude<AmbientPresetId, 'custom'>;
  label: string;
}> = [
  { id: 'none', label: '關閉' },
  { id: 'rain', label: '雨聲' },
  { id: 'white_noise', label: '白噪音' },
  { id: 'pink_noise', label: '粉紅噪音' },
  { id: 'campfire', label: '營火聲' },
];

export function AmbientAudioPlayer() {
  const ambientAudio = useGameStore((s) => s.ambientAudio);
  const updateAmbientAudio = useGameStore((s) => s.updateAmbientAudio);

  const [isPlaying, setIsPlaying] = useState(() => ambientAudioEngine.isPlaying());
  const [notice, setNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return ambientAudioEngine.subscribe(setIsPlaying);
  }, []);

  const handleSelectPreset = (presetId: AmbientPresetId) => {
    setNotice(null);
    updateAmbientAudio({ presetId });
    if (presetId === 'none') {
      ambientAudioEngine.stop();
      return;
    }
    if (isPlaying) {
      if (presetId === 'custom' && !ambientAudioEngine.hasCustomAudio()) {
        ambientAudioEngine.stop();
        setNotice('請先選擇本機音訊檔案再試聽。');
        return;
      }
      ambientAudioEngine.play(presetId, ambientAudio.volume);
    }
  };

  const handleTogglePreview = () => {
    setNotice(null);
    if (isPlaying) {
      ambientAudioEngine.stop();
      return;
    }
    if (ambientAudio.presetId === 'none') {
      setNotice('請先選擇音軌或上傳本機音訊。');
      return;
    }
    if (ambientAudio.presetId === 'custom' && !ambientAudioEngine.hasCustomAudio()) {
      setNotice('重整後需重新選取本機音訊檔案。');
      return;
    }
    ambientAudioEngine.play(ambientAudio.presetId, ambientAudio.volume);
  };

  const handleVolumeChange = (nextVolume: number) => {
    updateAmbientAudio({ volume: nextVolume });
    ambientAudioEngine.setVolume(nextVolume);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const fileName = ambientAudioEngine.setCustomFile(file);
    updateAmbientAudio({ presetId: 'custom', customFileName: fileName });
    setNotice(`已載入：${fileName}`);
    if (isPlaying) {
      ambientAudioEngine.play('custom', ambientAudio.volume);
    }
  };

  const volumePercent = Math.round(ambientAudio.volume * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[14px] font-semibold text-primary">夜間白噪音</span>
        <button
          type="button"
          onClick={handleTogglePreview}
          className={`min-h-11 rounded-md border px-3 text-[12px] font-semibold transition ${
            isPlaying
              ? 'border-good-border bg-good-tint text-good'
              : 'border-subtle bg-canvas text-primary hover:border-strong'
          }`}
        >
          {isPlaying ? '停止試聽' : '試聽'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {PRESET_OPTIONS.map((opt) => {
          const active = ambientAudio.presetId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelectPreset(opt.id)}
              className={`min-h-12 rounded-md px-2 text-[14px] font-medium transition ${
                active
                  ? 'border-selected-sheriff bg-sheriff-tint text-primary'
                  : 'border border-subtle bg-canvas text-secondary hover:border-strong hover:text-primary'
              }`}
            >
              {opt.label}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`min-h-12 truncate rounded-md px-2 text-[14px] font-medium transition ${
            ambientAudio.presetId === 'custom'
              ? 'border-selected-third bg-third-tint text-primary'
              : 'border border-dashed border-strong bg-canvas text-secondary hover:text-primary'
          }`}
        >
          {ambientAudio.customFileName ? '自訂音檔' : '上傳音檔'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="上傳本機白噪音音訊檔案"
      />

      {notice && (
        <div className="border-l-2 border-sheriff bg-canvas px-3 py-2 text-[12px] text-sheriff">
          {notice}
        </div>
      )}

      <div className="space-y-3 border-t border-subtle pt-3">
        <div>
          <div className="flex items-center justify-between text-[12px] font-medium text-secondary">
            <label htmlFor="ambient-volume-slider">音量</label>
            <span className="tabular-nums text-primary">{volumePercent}%</span>
          </div>
          <input
            id="ambient-volume-slider"
            type="range"
            min={0}
            max={100}
            step={5}
            value={volumePercent}
            onChange={(e) => handleVolumeChange(Number(e.target.value) / 100)}
            className="mt-2 h-1.5 w-full cursor-pointer accent-sheriff"
          />
        </div>

        <button
          type="button"
          onClick={() => updateAmbientAudio({ autoPlayAtNight: !ambientAudio.autoPlayAtNight })}
          className="flex min-h-12 w-full items-center justify-between rounded-md border border-subtle bg-canvas px-3 text-left transition hover:border-strong"
        >
          <span className="text-[14px] font-medium text-primary">夜晚自動播放</span>
          <span
            className={`text-[12px] font-semibold ${
              ambientAudio.autoPlayAtNight ? 'text-good' : 'text-muted'
            }`}
          >
            {ambientAudio.autoPlayAtNight ? '開啟' : '關閉'}
          </span>
        </button>
      </div>
    </div>
  );
}
