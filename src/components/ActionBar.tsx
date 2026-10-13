import React from 'react';
import { InputMode } from '../types/game';

interface ActionBarProps {
  mode: InputMode;
  onSetMode: (mode: InputMode) => void;
  onNewMap: () => void;
  isFitGrid: boolean;
  onToggleFitGrid: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  mode,
  onSetMode,
  onNewMap,
  isFitGrid,
  onToggleFitGrid,
}) => {
  return (
    <div className="mt-3 flex flex-col gap-2 w-full">
      {/* Primary Dig vs Flag Mode Toggle */}
      <div className="grid grid-cols-2 gap-2 bg-[#1b2026] p-1 rounded-xl border border-[#252a31]/60">
        {/* Dig / Reveal Mode Button */}
        <button
          onClick={() => onSetMode('dig')}
          className={`flex items-center justify-center gap-2 py-3 rounded-lg text-[14px] font-semibold transition-all min-h-[48px] active:scale-[0.98] ${
            mode === 'dig'
              ? 'bg-[#7c9cff] text-[#002f88] shadow-sm'
              : 'text-[#A5AFB9] hover:text-[#F4F6F8] hover:bg-[#222932]/50'
          }`}
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 2l6 6-9 9-4 1 1-4 6-6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 6l-2-2" />
          </svg>
          <span>DIG (Reveal)</span>
        </button>

        {/* Flag / Mark Mode Button */}
        <button
          onClick={() => onSetMode('flag')}
          className={`flex items-center justify-center gap-2 py-3 rounded-lg text-[14px] font-semibold transition-all min-h-[48px] active:scale-[0.98] ${
            mode === 'flag'
              ? 'bg-[#93000a] text-white shadow-sm ring-1 ring-[#FF5B5B]'
              : 'text-[#A5AFB9] hover:text-[#F4F6F8] hover:bg-[#222932]/50'
          }`}
        >
          <svg className="w-5 h-5 text-[#FF5B5B] shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 21v-3h1v-4H5V3h11l1 3h5v9h-8l-1-3H7v9H5z" />
          </svg>
          <span>FLAG (Mark)</span>
        </button>
      </div>

      {/* Secondary Utilities: New Map & Fit Grid */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onNewMap}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-[#1b2026] hover:bg-[#222932] border border-[#252a31]/60 rounded-xl text-[#F4F6F8] text-[12px] font-semibold transition-colors min-h-[44px] active:scale-[0.98]"
        >
          <svg className="w-4 h-4 text-[#75daa5] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect height="20" rx="4" width="20" x="2" y="2" />
            <circle cx="8" cy="8" fill="currentColor" r="1.5" />
            <circle cx="16" cy="8" fill="currentColor" r="1.5" />
            <circle cx="12" cy="12" fill="currentColor" r="1.5" />
            <circle cx="8" cy="16" fill="currentColor" r="1.5" />
            <circle cx="16" cy="16" fill="currentColor" r="1.5" />
          </svg>
          <span>New Map</span>
        </button>

        <button
          onClick={onToggleFitGrid}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[12px] font-semibold transition-colors min-h-[44px] active:scale-[0.98] border ${
            isFitGrid
              ? 'bg-[#222932] text-[#b4c5ff] border-[#7c9cff]/40 shadow-sm'
              : 'bg-[#1b2026] hover:bg-[#222932] text-[#A5AFB9] hover:text-[#F4F6F8] border-[#252a31]/60'
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" x2="16.65" y1="21" y2="16.65" />
            <line x1="11" x2="11" y1="8" y2="14" />
            <line x1="8" x2="14" y1="11" y2="11" />
          </svg>
          <span>{isFitGrid ? 'Reset Zoom' : 'Fit Grid'}</span>
        </button>
      </div>
    </div>
  );
};
