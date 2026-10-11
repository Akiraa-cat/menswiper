import React from 'react';
import { FaceMood } from '../types/game';

interface HUDProps {
  remainingMines: number;
  timeSeconds: number;
  score: number;
  mood: FaceMood;
  onReset: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  remainingMines,
  timeSeconds,
  score,
  mood,
  onReset,
}) => {
  // Format numbers to 3 digits like classic minesweeper (e.g. 007, -01, etc.)
  const formattedMines = remainingMines < 0
    ? `-${String(Math.abs(remainingMines)).padStart(2, '0')}`
    : String(remainingMines).padStart(3, '0');

  const formattedTime = String(Math.min(999, timeSeconds)).padStart(3, '0');

  return (
    <div className="mt-3 p-2 bg-[#1b2026] rounded-xl shadow-md border border-[#252a31]/70 flex items-center justify-between gap-2">
      {/* Remaining Mines Counter */}
      <div className="flex items-center gap-2 bg-[#0a0f14] px-3 py-1.5 rounded-lg border border-[#222932]/40 shadow-inner">
        <svg
          className="w-4 h-4 text-[#FF5B5B] shrink-0"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="6" />
          <line stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" x1="12" x2="12" y1="2" y2="6" />
          <line stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" x1="12" x2="12" y1="18" y2="22" />
          <line stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" x1="2" x2="6" y1="12" y2="12" />
          <line stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" x1="18" x2="22" y1="12" y2="12" />
          <line stroke="currentColor" strokeLinecap="round" strokeWidth="2" x1="4.93" x2="7.76" y1="4.93" y2="7.76" />
          <line stroke="currentColor" strokeLinecap="round" strokeWidth="2" x1="16.24" x2="19.07" y1="16.24" y2="19.07" />
          <line stroke="currentColor" strokeLinecap="round" strokeWidth="2" x1="4.93" x2="7.76" y1="19.07" y2="16.24" />
          <line stroke="currentColor" strokeLinecap="round" strokeWidth="2" x1="16.24" x2="19.07" y1="7.76" y2="4.93" />
        </svg>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-[#A5AFB9] leading-none tracking-wider">
            MINES
          </span>
          <span className="digital-display text-[17px] text-[#FF5B5B] leading-none font-black tracking-widest mt-0.5">
            {formattedMines}
          </span>
        </div>
      </div>

      {/* Interactive Face Reset Button */}
      <button
        onClick={onReset}
        aria-label="Restart Game"
        title="Restart Game"
        className="w-11 h-11 bg-[#222932] rounded-lg flex items-center justify-center hover:bg-[#353a40] active:scale-95 transition-all shadow-sm border border-[#30353c]"
      >
        {mood === 'smile' && (
          <svg className="w-6 h-6 text-[#f2c035]" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="#c89a00" strokeWidth="1.5" />
            <circle cx="8.5" cy="9.5" fill="#101317" r="1.5" />
            <circle cx="15.5" cy="9.5" fill="#101317" r="1.5" />
            <path d="M7.5 14.5C9 17 15 17 16.5 14.5" fill="none" stroke="#101317" strokeLinecap="round" strokeWidth="2" />
          </svg>
        )}

        {(mood === 'surprised' || mood === 'pressed') && (
          <svg className="w-6 h-6 text-[#f2c035]" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="#c89a00" strokeWidth="1.5" />
            <circle cx="8.5" cy="9.5" fill="#101317" r="1.5" />
            <circle cx="15.5" cy="9.5" fill="#101317" r="1.5" />
            <circle cx="12" cy="15.5" fill="#101317" r="2.2" />
          </svg>
        )}

        {mood === 'won' && (
          <svg className="w-6 h-6 text-[#75daa5]" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="#018053" strokeWidth="1.5" />
            {/* Cool Sunglasses */}
            <rect x="5.5" y="8" width="5.5" height="4" rx="1.5" fill="#101317" />
            <rect x="13" y="8" width="5.5" height="4" rx="1.5" fill="#101317" />
            <line x1="11" y1="9.5" x2="13" y2="9.5" stroke="#101317" strokeWidth="2" />
            <path d="M8 15.5C9.5 17.5 14.5 17.5 16 15.5" fill="none" stroke="#101317" strokeLinecap="round" strokeWidth="2" />
          </svg>
        )}

        {mood === 'lost' && (
          <svg className="w-6 h-6 text-[#FF5B5B]" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="#93000a" strokeWidth="1.5" />
            {/* Dead/Shocked X eyes */}
            <path d="M7 8L10 11M10 8L7 11" stroke="#101317" strokeWidth="2" strokeLinecap="round" />
            <path d="M14 8L17 11M17 8L14 11" stroke="#101317" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 16C9.5 14 14.5 14 16 16" fill="none" stroke="#101317" strokeLinecap="round" strokeWidth="2" />
          </svg>
        )}
      </button>

      {/* Score & Timer Readouts */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-[#A5AFB9] leading-none tracking-wider">
            POINTS
          </span>
          <span className="digital-display text-[15px] text-[#b4c5ff] font-bold tracking-wider mt-0.5">
            {score}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-[#0a0f14] px-3 py-1.5 rounded-lg border border-[#222932]/40 shadow-inner">
          <svg
            className="w-4 h-4 text-[#F0BD4F] shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#A5AFB9] leading-none tracking-wider">
              TIME
            </span>
            <span className="digital-display text-[17px] text-[#F0BD4F] leading-none font-black tracking-widest mt-0.5">
              {formattedTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
