import React from 'react';
import { GameSettings } from '../types/game';
import { playSound, triggerHaptic } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleSoundToggle = () => {
    const next = !settings.soundEnabled;
    onUpdateSettings({ ...settings, soundEnabled: next });
    if (next) playSound.click(true);
  };

  const handleHapticsToggle = () => {
    const next = !settings.hapticsEnabled;
    onUpdateSettings({ ...settings, hapticsEnabled: next });
    if (next) triggerHaptic('medium', true);
  };

  const testAudio = () => {
    playSound.victory(settings.soundEnabled);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101317]/85 backdrop-blur-md animate-in fade-in"
    >
      <div className="w-full max-w-md bg-[#222932] p-5 rounded-2xl shadow-2xl border border-[#30353c] max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#30353c]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#b4c5ff] text-[22px]">settings</span>
            <h2 className="text-[18px] font-bold text-[#F4F6F8]">Settings</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Settings"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A5AFB9] hover:text-[#F4F6F8] hover:bg-[#30353c]"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 py-3 text-[13px]">
          {/* Audio Synthesizer */}
          <div className="flex items-center justify-between p-3 bg-[#1b2026] rounded-xl border border-[#252a31]">
            <div>
              <div className="font-semibold text-[#F4F6F8]">Synthesized Audio FX</div>
              <div className="text-xs text-[#A5AFB9]">Web Audio API clicks, flags & victory fanfare</div>
            </div>
            <div className="flex items-center gap-2">
              {settings.soundEnabled && (
                <button
                  onClick={testAudio}
                  title="Test Sound"
                  className="px-2 py-1 text-[11px] font-semibold bg-[#222932] text-[#b4c5ff] rounded-lg hover:bg-[#30353c]"
                >
                  Test
                </button>
              )}
              <button
                onClick={handleSoundToggle}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  settings.soundEnabled ? 'bg-[#7c9cff]' : 'bg-[#30353c]'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Haptic Vibration */}
          <div className="flex items-center justify-between p-3 bg-[#1b2026] rounded-xl border border-[#252a31]">
            <div>
              <div className="font-semibold text-[#F4F6F8]">Haptic Feedback</div>
              <div className="text-xs text-[#A5AFB9]">Gentle vibration on flagging and reveals</div>
            </div>
            <button
              onClick={handleHapticsToggle}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.hapticsEnabled ? 'bg-[#7c9cff]' : 'bg-[#30353c]'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.hapticsEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Quick Chord */}
          <div className="flex items-center justify-between p-3 bg-[#1b2026] rounded-xl border border-[#252a31]">
            <div>
              <div className="font-semibold text-[#F4F6F8]">Quick Chording</div>
              <div className="text-xs text-[#A5AFB9]">Tap revealed number to reveal surrounding safe tiles</div>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, quickChord: !settings.quickChord })}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.quickChord ? 'bg-[#7c9cff]' : 'bg-[#30353c]'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.quickChord ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Long Press Delay */}
          <div className="p-3 bg-[#1b2026] rounded-xl border border-[#252a31]">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-[#F4F6F8]">Long-Press to Flag Duration</span>
              <span className="text-[#b4c5ff] font-bold text-xs">{settings.longPressDelay} ms</span>
            </div>
            <input
              type="range"
              min={200}
              max={500}
              step={20}
              value={settings.longPressDelay}
              onChange={(e) => onUpdateSettings({ ...settings, longPressDelay: Number(e.target.value) })}
              className="w-full accent-[#7c9cff] cursor-pointer"
            />
          </div>

        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#b4c5ff] text-[#002979] font-bold rounded-xl text-[13px] hover:brightness-110 active:scale-95 transition-all"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
