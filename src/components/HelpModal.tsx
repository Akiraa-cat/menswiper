import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101317]/85 backdrop-blur-md animate-in fade-in"
    >
      <div className="w-full max-w-md bg-[#222932] p-5 rounded-2xl shadow-2xl border border-[#30353c] max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#30353c]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#b4c5ff] text-[22px]">help_outline</span>
            <h2 className="text-[18px] font-bold text-[#F4F6F8]">How to play</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Guide"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A5AFB9] hover:text-[#F4F6F8] hover:bg-[#30353c]"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 py-3 text-[13px] text-[#A5AFB9] leading-relaxed">
          {/* Objective */}
          <div>
            <h3 className="text-[#F4F6F8] font-bold text-[14px] mb-1">Objective</h3>
            <p>
              Clear every safe cell on the grid without detonating any hidden mines. Numbers on revealed tiles represent exactly how many mines touch that cell (up, down, left, right, diagonals).
            </p>
          </div>

          {/* Controls */}
          <div>
            <h3 className="text-[#F4F6F8] font-bold text-[14px] mb-1">Controls & Mobile Gestures</h3>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>
                <strong className="text-[#b4c5ff]">DIG (Reveal)</strong>: Tap an unrevealed tile to open it.
              </li>
              <li>
                <strong className="text-[#FF5B5B]">FLAG (Mark)</strong>: Tap a tile to mark it with a red flag, preventing accidental clicks.
              </li>
              <li>
                <strong className="text-[#F4F6F8]">Quick Long-Press</strong>: Hold any tile for 300ms on touchscreen to immediately flag or unflag it!
              </li>
              <li>
                <strong className="text-[#F4F6F8]">Right Click</strong>: On desktop mouse, right-click always toggles flags.
              </li>
            </ul>
          </div>

          {/* Tactical Chord */}
          <div className="p-3 bg-[#1b2026] rounded-xl border border-[#252a31]">
            <h3 className="text-[#75daa5] font-bold text-[13px] flex items-center gap-1.5">
              <span>⚡</span> Quick clear
            </h3>
            <p className="mt-1 text-xs text-[#A5AFB9]">
              Once you have flagged the correct number of mines around a revealed number (e.g., cell has <strong>2</strong> and you flagged 2 neighbors), <strong>tap the revealed number</strong> to instantly sweep all remaining adjacent unflagged cells at once!
            </p>
          </div>

          {/* Custom board codes */}
          <div>
            <h3 className="text-[#F4F6F8] font-bold text-[14px] mb-1">Play the same board</h3>
            <p>
              Give a friend your board code to play the exact same layout and compare how you do.
            </p>
            <p className="mt-1 text-xs text-[#75daa5]">
              ✓ First reveal is guaranteed 100% mine-free with an automatic opening.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#b4c5ff] text-[#002979] font-bold rounded-xl text-[13px] hover:brightness-110 active:scale-95 transition-all"
          >
            Understood, Back to Game
          </button>
        </div>
      </div>
    </div>
  );
};
