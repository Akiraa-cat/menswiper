import React from 'react';
import { GameRecord } from '../types/game';

interface RecordsCardProps {
  records: GameRecord[];
  onViewAllRecords?: () => void;
  onPlaySeed?: (seed: string) => void;
}

export const RecordsCard: React.FC<RecordsCardProps> = ({
  records,
  onViewAllRecords,
  onPlaySeed,
}) => {
  // Take top 3 recent / best beginner or overall records
  const displayRecords = records.slice(0, 3);

  return (
    <div className="mt-4 p-3 bg-[#1b2026] rounded-xl shadow-sm border border-[#252a31]/70 w-full">
      <div className="flex items-center justify-between pb-2 border-b border-[#252a31]/60">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#f2c035] shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="text-[14px] font-bold text-[#F4F6F8]">Local Device Records</span>
        </div>
        <span className="text-[11px] font-medium text-[#A5AFB9]">Pure Offline Storage</span>
      </div>

      {/* Records Table */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="text-[#A5AFB9] text-[11px] font-semibold">
              <th className="py-1 px-2 font-normal">RANK</th>
              <th className="py-1 px-2 font-normal">MODE</th>
              <th className="py-1 px-2 font-normal">TIME</th>
              <th className="py-1 px-2 font-normal">SCORE</th>
              <th className="py-1 px-2 font-normal text-right">DATE</th>
            </tr>
          </thead>
          <tbody className="text-[#F4F6F8]">
            {displayRecords.map((rec, index) => {
              const isFirst = index === 0;
              const isEven = index % 2 === 0;
              return (
                <tr
                  key={rec.id}
                  onClick={() => onPlaySeed && onPlaySeed(rec.seed)}
                  className={`transition-colors cursor-pointer hover:bg-[#222932] ${
                    isEven ? 'bg-[#0a0f14]/50 rounded-lg' : ''
                  }`}
                  title={`Click to load seed ${rec.seed}`}
                >
                  <td className={`py-2 px-2 font-bold ${isFirst ? 'text-[#f2c035]' : 'text-[#A5AFB9]'}`}>
                    #{rec.rank || index + 1}
                  </td>
                  <td className="py-2 px-2 text-[#A5AFB9]">{rec.mode}</td>
                  <td className="py-2 px-2 font-bold text-[#F4F6F8] digital-display">{rec.time}s</td>
                  <td className="py-2 px-2 text-[#75daa5] font-bold digital-display">{rec.score}</td>
                  <td className="py-2 px-2 text-right text-[#A5AFB9]">{rec.date}</td>
                </tr>
              );
            })}

            {displayRecords.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-[#A5AFB9] text-xs">
                  No records yet. Clear a minefield to set your first local device record!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / PRNG Note */}
      <div className="mt-2.5 pt-2 border-t border-[#252a31]/50 flex items-center justify-between text-center">
        <span className="text-[11px] text-[#A5AFB9] leading-tight mx-auto">
          Deterministic PRNG seed engine. First reveal is guaranteed 100% mine-free.
        </span>
      </div>
    </div>
  );
};
