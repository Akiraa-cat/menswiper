import React from 'react';

interface SubBarProps {
  seed: string;
  isDaily: boolean;
  dailyLabel: string;
  onRegenerateSeed: () => void;
  onOpenSeedModal: () => void;
  onLoadDailySeed: () => void;
}

export const SubBar: React.FC<SubBarProps> = ({
  seed,
  isDaily,
  dailyLabel,
  onRegenerateSeed,
  onOpenSeedModal,
  onLoadDailySeed,
}) => {
  return (
    <div className="flex items-center justify-between text-[#A5AFB9] text-xs pt-0.5">
      {/* Left segment: Mode badge & Seed selector */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1b2026] text-[11px] font-bold text-[#75daa5] border border-[#252a31]/60">
          <svg className="w-3 h-3 text-[#75daa5] shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2v-2zm0-10h2v8h-2V6z" />
          </svg>
          <span className="whitespace-nowrap">Classic RnG</span>
        </span>

        <div className="inline-flex items-center bg-[#1b2026] rounded-lg border border-[#252a31]/60 hover:bg-[#222932] transition-colors overflow-hidden">
          <button
            onClick={onOpenSeedModal}
            title="Click to view or edit seed"
            className="px-2 py-1 text-[11px] font-bold text-[#F4F6F8] tracking-wider hover:text-[#b4c5ff] transition-colors"
          >
            {seed}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRegenerateSeed();
            }}
            title="Reroll new PRNG seed"
            aria-label="Reroll seed"
            className="pr-2 py-1 text-[#A5AFB9] hover:text-[#F4F6F8] hover:scale-110 active:rotate-180 transition-all flex items-center"
          >
            <svg
              className="w-3.5 h-3.5 text-[#A5AFB9]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </button>
        </div>
      </div>

      {/* Right segment: Daily challenge trigger */}
      <button
        onClick={onLoadDailySeed}
        title="Load current daily challenge seed"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all text-[11px] font-bold ${
          isDaily
            ? 'bg-[#7c9cff]/20 text-[#b4c5ff] border-[#7c9cff]/40 shadow-sm'
            : 'bg-[#1b2026] text-[#b4c5ff] border-[#252a31]/60 hover:bg-[#222932]'
        }`}
      >
        <svg
          className="w-3.5 h-3.5 text-[#b4c5ff] shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <rect height="18" rx="2" ry="2" width="18" x="3" y="4" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
        <span className="whitespace-nowrap">{dailyLabel}</span>
      </button>
    </div>
  );
};
