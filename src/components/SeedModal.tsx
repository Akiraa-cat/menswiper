import React, { useState } from 'react';

interface SeedModalProps {
  isOpen: boolean;
  currentSeed: string;
  onSetSeed: (seed: string) => void;
  onClose: () => void;
}

export const SeedModal: React.FC<SeedModalProps> = ({
  isOpen,
  currentSeed,
  onSetSeed,
  onClose,
}) => {
  const [inputVal, setInputVal] = useState(currentSeed);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(currentSeed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let cleaned = inputVal.trim();
    if (!cleaned) return;
    if (!cleaned.startsWith('#')) {
      cleaned = `#${cleaned}`;
    }
    onSetSeed(cleaned);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101317]/85 backdrop-blur-md animate-in fade-in"
    >
      <div className="w-full max-w-sm bg-[#222932] p-5 rounded-2xl shadow-2xl border border-[#30353c]">
        <div className="flex items-center justify-between pb-3 border-b border-[#30353c]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#75daa5] text-[22px]">shuffle</span>
            <h2 className="text-[18px] font-bold text-[#F4F6F8]">PRNG Seed Engine</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A5AFB9] hover:text-[#F4F6F8] hover:bg-[#30353c]"
          >
            ✕
          </button>
        </div>

        <div className="py-4 space-y-4">
          {/* Current Seed display */}
          <div className="p-3 bg-[#1b2026] rounded-xl border border-[#252a31]">
            <div className="text-[11px] font-bold text-[#A5AFB9] uppercase mb-1">Active PRNG Seed</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-base font-bold text-[#75daa5]">{currentSeed}</span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 text-xs font-semibold bg-[#222932] text-[#F4F6F8] rounded-lg border border-[#30353c] hover:bg-[#353a40]"
              >
                {copied ? 'Copied! ✓' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Custom Seed Input */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <label className="text-xs font-semibold text-[#A5AFB9]">Load Custom Seed / Password</label>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="#RNG-XXXX or text"
              className="w-full bg-[#1b2026] text-[#F4F6F8] font-mono px-3 py-2 rounded-xl border border-[#30353c] focus:outline-none focus:border-[#7c9cff] text-sm"
            />
            <p className="text-[11px] text-[#A5AFB9] leading-tight">
              Every unique seed creates an identical, reproducible minefield across all devices.
            </p>

            <div className="pt-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#b4c5ff] text-[#002979] font-bold rounded-xl text-sm hover:brightness-110 active:scale-95 transition-all"
              >
                Apply Seed
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-[#1b2026] text-[#F4F6F8] font-semibold rounded-xl text-sm border border-[#252a31] hover:bg-[#353a40]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
