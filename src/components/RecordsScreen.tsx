import React, { useState } from 'react';
import { GameRecord } from '../types/game';

interface RecordsScreenProps {
  records: GameRecord[];
  onPlaySeed: (seed: string, mode?: string) => void;
}

export const RecordsScreen: React.FC<RecordsScreenProps> = ({ records, onPlaySeed }) => {
  const [filterMode, setFilterMode] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'time' | 'score' | 'date'>('time');

  const filtered = records.filter((r) => {
    if (filterMode === 'All') return true;
    return r.mode === filterMode;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'time') return a.time - b.time;
    if (sortBy === 'score') return b.score - a.score;
    return b.timestamp - a.timestamp;
  });

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-4 pb-20 pt-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#F4F6F8]">Hall of Records</h2>
          <p className="text-xs text-[#A5AFB9]">Local device high scores & fastest clear times</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between bg-[#1b2026] p-1 rounded-xl border border-[#252a31]">
        {['All', 'Beginner', 'Intermediate', 'Expert'].map((mode) => (
          <button
            key={mode}
            onClick={() => setFilterMode(mode)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterMode === mode
                ? 'bg-[#222932] text-[#b4c5ff] shadow-sm'
                : 'text-[#A5AFB9] hover:text-[#F4F6F8]'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Sort Buttons */}
      <div className="flex items-center justify-end gap-2 text-xs text-[#A5AFB9]">
        <span>Sort by:</span>
        <button
          onClick={() => setSortBy('time')}
          className={`px-2 py-0.5 rounded-md ${sortBy === 'time' ? 'bg-[#222932] text-[#F0BD4F] font-bold' : 'hover:text-[#F4F6F8]'}`}
        >
          Fastest Time
        </button>
        <button
          onClick={() => setSortBy('score')}
          className={`px-2 py-0.5 rounded-md ${sortBy === 'score' ? 'bg-[#222932] text-[#75daa5] font-bold' : 'hover:text-[#F4F6F8]'}`}
        >
          Highest Score
        </button>
        <button
          onClick={() => setSortBy('date')}
          className={`px-2 py-0.5 rounded-md ${sortBy === 'date' ? 'bg-[#222932] text-[#b4c5ff] font-bold' : 'hover:text-[#F4F6F8]'}`}
        >
          Recent
        </button>
      </div>

      {/* Records Table Card */}
      <div className="bg-[#1b2026] rounded-2xl border border-[#252a31] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0a0f14]/60 text-[#A5AFB9] text-[11px] font-semibold border-b border-[#252a31]">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-2">MODE</th>
                <th className="py-2.5 px-2">TIME</th>
                <th className="py-2.5 px-2">SCORE</th>
                <th className="py-2.5 px-2">SEED</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252a31]/50 text-[#F4F6F8]">
              {sorted.map((rec, idx) => {
                const rankNumber = idx + 1;
                return (
                  <tr key={rec.id} className="hover:bg-[#222932]/70 transition-colors">
                    <td className="py-2.5 px-3 font-bold">
                      {rankNumber === 1 ? (
                        <span className="text-[#f2c035]">★ 1</span>
                      ) : rankNumber === 2 ? (
                        <span className="text-[#b4c5ff]">2</span>
                      ) : (
                        <span className="text-[#A5AFB9]">{rankNumber}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-[#A5AFB9] font-medium">{rec.mode}</td>
                    <td className="py-2.5 px-2 font-bold digital-display text-[#F0BD4F]">{rec.time}s</td>
                    <td className="py-2.5 px-2 font-bold digital-display text-[#75daa5]">{rec.score}</td>
                    <td className="py-2.5 px-2 font-mono text-[11px] text-[#A5AFB9]">{rec.seed}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onPlaySeed(rec.seed, rec.mode)}
                        className="px-2.5 py-1 bg-[#222932] hover:bg-[#30353c] text-[11px] font-bold text-[#b4c5ff] rounded-lg border border-[#30353c]"
                      >
                        Play
                      </button>
                    </td>
                  </tr>
                );
              })}

              {sorted.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#A5AFB9]">
                    No records found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
