import React from 'react';
import { getDailySeed } from '../utils/prng';

interface DailyScreenProps {
  onPlayDaily: (seed: string) => void;
}

export const DailyScreen: React.FC<DailyScreenProps> = ({ onPlayDaily }) => {
  const today = getDailySeed(0);

  // Past 6 days archive
  const pastDays = [1, 2, 3, 4, 5, 6].map((offset) => {
    const info = getDailySeed(offset);
    const date = new Date();
    date.setDate(date.getDate() - offset);
    return {
      ...info,
      dateString: date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
    };
  });

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-4 pb-20 pt-4 space-y-4">
      {/* Daily Banner Card */}
      <div className="p-4 bg-[#1b2026] rounded-2xl border border-[#252a31] shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#7c9cff]/20 text-[#b4c5ff] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F4F6F8]">Today's Operation</h2>
              <div className="text-xs text-[#A5AFB9]">Every player faces the exact same minefield</div>
            </div>
          </div>
          <span className="text-xs font-semibold text-[#75daa5]">Daily seed</span>
        </div>

        <div className="mt-4 p-3 bg-[#0a0f14] rounded-xl flex items-center justify-between border border-[#222932]">
          <div>
            <div className="text-[11px] text-[#A5AFB9] uppercase font-bold tracking-wider">Mission Code</div>
            <div className="text-lg font-bold text-[#b4c5ff] font-mono mt-0.5">{today.code}</div>
          </div>
          <button
            onClick={() => onPlayDaily(today.code)}
            className="px-4 py-2 bg-[#b4c5ff] text-[#002979] font-bold text-xs rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            Launch Daily Seed
          </button>
        </div>
      </div>

      {/* Daily Archive List */}
      <div className="p-4 bg-[#1b2026] rounded-2xl border border-[#252a31]">
        <h3 className="text-sm font-bold text-[#F4F6F8] mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#A5AFB9]">history</span>
          Archive: Past Operations
        </h3>

        <div className="space-y-2">
          {pastDays.map((day) => (
            <div
              key={day.code}
              className="flex items-center justify-between p-2.5 bg-[#0a0f14]/60 hover:bg-[#222932] rounded-xl border border-[#252a31]/60 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#F4F6F8]">{day.code}</span>
                </div>
                <div className="text-[11px] text-[#A5AFB9]">{day.dateString}</div>
              </div>

              <button
                onClick={() => onPlayDaily(day.code)}
                className="px-3 py-1 bg-[#222932] hover:bg-[#30353c] text-xs font-bold text-[#b4c5ff] rounded-lg border border-[#30353c]"
              >
                Play Seed
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
