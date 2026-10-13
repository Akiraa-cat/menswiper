import React from 'react';

interface VictoryDefeatModalProps {
  isOpen: boolean;
  isWon: boolean;
  timeSeconds: number;
  score: number;
  seed: string;
  saveMessage?: string;
  onPlayAgain: () => void;
  onInspectBoard: () => void;
  onClose: () => void;
}

export const VictoryDefeatModal: React.FC<VictoryDefeatModalProps> = ({
  isOpen,
  isWon,
  timeSeconds,
  score,
  seed,
  saveMessage,
  onPlayAgain,
  onInspectBoard,
}) => {
  if (!isOpen) return null;

  const formattedTime = `${String(timeSeconds).padStart(3, '0')}s`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101317]/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="w-full max-w-sm bg-[#222932] p-5 rounded-2xl shadow-2xl border border-[#30353c] flex flex-col items-center text-center">
        {/* Status Badge */}
        {isWon ? (
          <div className="w-14 h-14 rounded-full bg-[#018053] flex items-center justify-center mb-3 shadow-lg shadow-[#018053]/30">
            <svg className="w-8 h-8 text-[#d1ffe1]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        ) : (
          <div className="w-14 h-14 rounded-full bg-[#93000a] flex items-center justify-center mb-3 shadow-lg shadow-[#93000a]/30">
            <svg className="w-8 h-8 text-[#ffdad6]" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="6" />
              <line stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" x1="12" x2="12" y1="2" y2="6" />
              <line stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" x1="12" x2="12" y1="18" y2="22" />
              <line stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" x1="2" x2="6" y1="12" y2="12" />
              <line stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" x1="18" x2="22" y1="12" y2="12" />
            </svg>
          </div>
        )}

        {/* Modal Title */}
        <h2 className="text-[22px] font-bold text-[#F4F6F8]">
          {isWon ? 'Board Cleared!' : 'Mine Detonated'}
        </h2>

        {/* Modal Subtitle */}
        <p className="text-[13px] text-[#A5AFB9] mt-1">
          {isWon
            ? `Exceptional tactical sweeps across seed ${seed}.`
            : `Subsurface mine triggered across seed ${seed}.`}
        </p>

        {/* Performance Metrics Box */}
        <div className="w-full grid grid-cols-2 gap-2 my-4 p-3 bg-[#1b2026] rounded-xl border border-[#252a31]">
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-bold text-[#A5AFB9]">COMPLETION TIME</span>
            <span className="text-[18px] text-[#F0BD4F] font-extrabold digital-display mt-0.5">
              {formattedTime}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-bold text-[#A5AFB9]">TOTAL POINTS</span>
            <span className="text-[18px] text-[#75daa5] font-extrabold digital-display mt-0.5">
              {score}
            </span>
          </div>
        </div>

        {saveMessage && <p role="alert" className="mb-3 text-sm text-[#FF7777]">{saveMessage}</p>}

        {/* Button Actions */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={onPlayAgain}
            className="w-full py-3 bg-[#b4c5ff] text-[#002979] font-bold text-[14px] rounded-xl shadow-md hover:brightness-110 active:scale-[0.98] transition-all min-h-[44px]"
          >
            Play Again (New Seed)
          </button>

          <button
            onClick={onInspectBoard}
            className="w-full py-2.5 bg-[#1b2026] text-[#F4F6F8] font-semibold text-[13px] rounded-xl border border-[#252a31] hover:bg-[#353a40] transition-colors min-h-[44px]"
          >
            Inspect Board
          </button>
        </div>
      </div>
    </div>
  );
};
