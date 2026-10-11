import React, { useState } from 'react';
import { Difficulty, UserStats } from '../types/game';

interface StatsScreenProps {
  stats: UserStats;
  onLaunchCustomSeed: (seed: string, difficulty: Difficulty) => void;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ stats, onLaunchCustomSeed }) => {
  const [sandboxSeed, setSandboxSeed] = useState('#RNG-MINE-1');
  const [sandboxDiff, setSandboxDiff] = useState<Difficulty>('beginner');

  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

  const handleLaunchSandbox = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sandboxSeed.trim()) return;
    let s = sandboxSeed.trim();
    if (!s.startsWith('#')) s = `#${s}`;
    onLaunchCustomSeed(s, sandboxDiff);
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-4 pb-20 pt-4 space-y-4">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-[#F4F6F8]">Tactical Telemetry & Stats</h2>
        <p className="text-xs text-[#A5AFB9]">Comprehensive offline performance analytics</p>
      </div>

      {/* Top 4 KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-[#1b2026] rounded-xl border border-[#252a31] text-center">
          <div className="text-[10px] text-[#A5AFB9] font-bold uppercase">Win Rate</div>
          <div className="text-xl font-extrabold text-[#75daa5] digital-display mt-0.5">{winRate}%</div>
        </div>
        <div className="p-3 bg-[#1b2026] rounded-xl border border-[#252a31] text-center">
          <div className="text-[10px] text-[#A5AFB9] font-bold uppercase">Games Won</div>
          <div className="text-xl font-extrabold text-[#b4c5ff] digital-display mt-0.5">
            {stats.gamesWon} / {stats.gamesPlayed}
          </div>
        </div>
        <div className="p-3 bg-[#1b2026] rounded-xl border border-[#252a31] text-center">
          <div className="text-[10px] text-[#A5AFB9] font-bold uppercase">Mines Flagged</div>
          <div className="text-xl font-extrabold text-[#FF5B5B] digital-display mt-0.5">
            {stats.totalMinesFlagged}
          </div>
        </div>
        <div className="p-3 bg-[#1b2026] rounded-xl border border-[#252a31] text-center">
          <div className="text-[10px] text-[#A5AFB9] font-bold uppercase">Max Streak</div>
          <div className="text-xl font-extrabold text-[#F0BD4F] digital-display mt-0.5">
            {stats.maxStreak} 🔥
          </div>
        </div>
      </div>

      {/* Personal Bests by Difficulty */}
      <div className="p-4 bg-[#1b2026] rounded-2xl border border-[#252a31]">
        <h3 className="text-sm font-bold text-[#F4F6F8] mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#f2c035]">trophy</span>
          Personal Bests (Record Time)
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 bg-[#0a0f14]/60 rounded-xl border border-[#252a31]/60">
            <div>
              <span className="font-bold text-[#F4F6F8]">Beginner (9×9)</span>
              <div className="text-[11px] text-[#A5AFB9]">10 Mines</div>
            </div>
            <span className="text-base font-extrabold digital-display text-[#F0BD4F]">
              {stats.beginnerBestTime !== null ? `${stats.beginnerBestTime}s` : '—'}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-[#0a0f14]/60 rounded-xl border border-[#252a31]/60">
            <div>
              <span className="font-bold text-[#F4F6F8]">Intermediate (16×16)</span>
              <div className="text-[11px] text-[#A5AFB9]">40 Mines</div>
            </div>
            <span className="text-base font-extrabold digital-display text-[#F0BD4F]">
              {stats.intermediateBestTime !== null ? `${stats.intermediateBestTime}s` : '—'}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-[#0a0f14]/60 rounded-xl border border-[#252a31]/60">
            <div>
              <span className="font-bold text-[#F4F6F8]">Expert (30×16)</span>
              <div className="text-[11px] text-[#A5AFB9]">99 Mines</div>
            </div>
            <span className="text-base font-extrabold digital-display text-[#F0BD4F]">
              {stats.expertBestTime !== null ? `${stats.expertBestTime}s` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Custom PRNG Seed Sandbox */}
      <div className="p-4 bg-[#1b2026] rounded-2xl border border-[#252a31]">
        <h3 className="text-sm font-bold text-[#F4F6F8] mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#75daa5]">tune</span>
          PRNG Seed Sandbox Generator
        </h3>
        <p className="text-xs text-[#A5AFB9] mb-3">
          Deploy any custom seed word or number on your preferred board difficulty.
        </p>

        <form onSubmit={handleLaunchSandbox} className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-[#A5AFB9] uppercase">Seed Key</label>
            <input
              type="text"
              value={sandboxSeed}
              onChange={(e) => setSandboxSeed(e.target.value)}
              className="w-full mt-1 bg-[#0a0f14] text-[#75daa5] font-mono text-sm px-3 py-2 rounded-xl border border-[#30353c] focus:outline-none focus:border-[#7c9cff]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#A5AFB9] uppercase">Difficulty</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {(['beginner', 'intermediate', 'expert'] as Difficulty[]).map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setSandboxDiff(d)}
                  className={`py-1.5 text-xs font-semibold rounded-lg capitalize border ${
                    sandboxDiff === d
                      ? 'bg-[#222932] text-[#b4c5ff] border-[#7c9cff]/40 shadow-sm'
                      : 'bg-[#0a0f14] text-[#A5AFB9] border-[#252a31]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#b4c5ff] text-[#002979] font-bold rounded-xl text-xs hover:brightness-110 active:scale-95 transition-all mt-2"
          >
            Launch Custom Simulation
          </button>
        </form>
      </div>
    </div>
  );
};
