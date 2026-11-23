import { useEffect, useRef, useState } from 'react';
import { ambientAudioEngine } from '../../audio/ambientAudioEngine';
import type { AmbientPresetId } from '../../logic/types';
import { useGameStore } from '../../store/gameStore';

const PRESET_OPTIONS: Array<{
  id: Exclude<AmbientPresetId, 'custom'>;
  label: string;
  icon: string;
  hint: string;
}> = [
  { id: 'none', label: '關閉', icon: '🔇', hint: '不播放背景音' },
  { id: 'rain', label: '雨聲', icon: '🌧️', hint: '自然細雨起伏' },
  { id: 'white_noise', label: '純白噪音', icon: '📻', hint: '柔和等頻遮噪' },
  { id: 'pink_noise', label: '粉紅噪音', icon: '🌊', hint: '低頻溫潤包覆' },
  { id: 'campfire', label: '營火聲', icon: '🔥', hint: '暖底噪與柴火聲' },
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
      setNotice('請先選擇一款白噪音或上傳本機音訊檔。');
      return;
    }
    if (ambientAudio.presetId === 'custom' && !ambientAudioEngine.hasCustomAudio()) {
      setNotice('瀏覽器重整後需重新選取本機音訊檔案。');
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
    setNotice(`已載入本機音訊：${fileName}`);
    if (isPlaying) {
      ambientAudioEngine.play('custom', ambientAudio.volume);
    }
  };

  const volumePercent = Math.round(ambientAudio.volume * 100);

  return (
    <div className="space-y-3">
      {/* 音軌選擇 */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-100">夜間白噪音音軌</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Web Audio 原生合成，夜晚自動播放以掩蓋玩家行動聲響。
            </p>
          </div>
          <button
            type="button"
            onClick={handleTogglePreview}
            className={`min-h-12 shrink-0 rounded-xl border px-3.5 text-xs font-extrabold transition active:scale-[0.98] ${
              isPlaying
                ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                : 'border-amber-400/50 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25'
            }`}
          >
            {isPlaying ? '⏹ 停止試聽' : '▶ 大廳試聽'}
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PRESET_OPTIONS.map((opt) => {
            const active = ambientAudio.presetId === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectPreset(opt.id)}
                className={`min-h-12 rounded-xl border px-3 py-2 text-left transition active:scale-[0.98] ${
                  active
                    ? 'border-amber-400 bg-amber-500/20 text-amber-100'
                    : 'border-slate-800 bg-slate-950/75 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-slate-400">{opt.hint}</div>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`min-h-12 rounded-xl border px-3 py-2 text-left transition active:scale-[0.98] ${
              ambientAudio.presetId === 'custom'
                ? 'border-indigo-400 bg-indigo-500/20 text-indigo-100'
                : 'border-dashed border-slate-700 bg-slate-950/75 text-slate-300 hover:border-indigo-400/60 hover:bg-slate-800/80'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span>🎵</span>
              <span>上傳本機音訊</span>
            </div>
            <div className="mt-0.5 truncate text-[11px] text-slate-400">
              {ambientAudio.customFileName || '支援 MP3 / WAV / M4A'}
            </div>
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
          <div className="mt-2.5 rounded-xl border border-amber-500/30 bg-amber-950/30 px-3 py-2 text-xs text-amber-200">
            {notice}
          </div>
        )}
      </div>

      {/* 音量與自動播放開關 */}
      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5">
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-200">
            <label htmlFor="ambient-volume-slider">背景音量</label>
            <span className="text-amber-300">{volumePercent}%</span>
          </div>
          <input
            id="ambient-volume-slider"
            type="range"
            min={0}
            max={100}
            step={5}
            value={volumePercent}
            onChange={(e) => handleVolumeChange(Number(e.target.value) / 100)}
            className="mt-2 h-2 w-full cursor-pointer accent-amber-400"
          />
        </div>

        <button
          type="button"
          onClick={() => updateAmbientAudio({ autoPlayAtNight: !ambientAudio.autoPlayAtNight })}
          className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2.5 text-left transition hover:border-slate-700"
        >
          <div>
            <div className="text-xs font-bold text-slate-100">夜晚階段自動播放</div>
            <p className="mt-0.5 text-[11px] text-slate-400">
              進入夜間主持時自動開啟所選白噪音，天亮後自動停止。
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${
              ambientAudio.autoPlayAtNight
                ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-200'
                : 'border-slate-700 bg-slate-800 text-slate-400'
            }`}
          >
            {ambientAudio.autoPlayAtNight ? '開啟' : '關閉'}
          </span>
        </button>
      </div>
    </div>
  );
}
