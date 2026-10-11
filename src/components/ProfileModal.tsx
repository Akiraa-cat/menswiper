import React, { useState } from 'react';
import { UserStats } from '../types/game';

interface ProfileModalProps {
  isOpen: boolean;
  playerName: string;
  stats: UserStats;
  onUpdateName: (name: string) => void;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  playerName,
  stats,
  onUpdateName,
  onClose,
}) => {
  const [nameInput, setNameInput] = useState(playerName);

  if (!isOpen) return null;

  // Compute tactical military title based on total score
  const getRankTitle = (score: number) => {
    if (score < 1000) return 'Recruit Sapper';
    if (score < 3000) return 'Tactical Demolitionist';
    if (score < 6000) return 'Subsurface Specialist';
    if (score < 10000) return 'Veteran Mine Sweeper';
    return 'Grandmaster of RnG';
  };

  const rankTitle = getRankTitle(stats.totalScore);
  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onUpdateName(nameInput.trim());
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101317]/85 backdrop-blur-md animate-in fade-in"
    >
      <div className="w-full max-w-sm bg-[#222932] p-5 rounded-2xl shadow-2xl border border-[#30353c] max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#30353c]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#b4c5ff] text-[22px]">military_tech</span>
            <h2 className="text-[18px] font-bold text-[#F4F6F8]">Sapper Dossier</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Profile"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A5AFB9] hover:text-[#F4F6F8] hover:bg-[#30353c]"
          >
            ✕
          </button>
        </div>

        {/* Identity & Rank Badge */}
        <div className="flex flex-col items-center text-center my-4">
          <div className="w-16 h-16 rounded-full bg-[#b4c5ff] flex items-center justify-center text-[#002979] mb-2 shadow-lg shadow-[#b4c5ff]/20">
            <span className="material-symbols-outlined text-[32px]">person</span>
          </div>

          <form onSubmit={handleSaveName} className="flex items-center gap-1.5 mt-1">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="bg-[#1b2026] text-[#F4F6F8] font-bold text-base px-2.5 py-1 rounded-lg border border-[#30353c] text-center focus:outline-none focus:border-[#7c9cff]"
              maxLength={20}
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-[#222932] hover:bg-[#30353c] text-[#75daa5] text-xs font-bold rounded-lg border border-[#30353c]"
            >
              Save
            </button>
          </form>

          <span className="text-xs text-[#f2c035] font-bold mt-1.5 px-2.5 py-0.5 rounded-full bg-[#f2c035]/15 border border-[#f2c035]/30">
            ★ {rankTitle}
          </span>
        </div>

        {/* Tactical Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-[#1b2026] rounded-xl border border-[#252a31] text-center my-3">
          <div className="p-2">
            <div className="text-[10px] text-[#A5AFB9] font-bold uppercase tracking-wider">Career Points</div>
            <div className="text-[18px] font-extrabold text-[#75daa5] digital-display mt-0.5">
              {stats.totalScore}
            </div>
          </div>
          <div className="p-2">
            <div className="text-[10px] text-[#A5AFB9] font-bold uppercase tracking-wider">Win Rate</div>
            <div className="text-[18px] font-extrabold text-[#b4c5ff] digital-display mt-0.5">
              {winRate}%
            </div>
          </div>
          <div className="p-2 border-t border-[#252a31]">
            <div className="text-[10px] text-[#A5AFB9] font-bold uppercase tracking-wider">Mines Disarmed</div>
            <div className="text-[18px] font-extrabold text-[#FF5B5B] digital-display mt-0.5">
              {stats.totalMinesFlagged}
            </div>
          </div>
          <div className="p-2 border-t border-[#252a31]">
            <div className="text-[10px] text-[#A5AFB9] font-bold uppercase tracking-wider">Best Win Streak</div>
            <div className="text-[18px] font-extrabold text-[#F0BD4F] digital-display mt-0.5">
              {stats.maxStreak}
            </div>
          </div>
        </div>

        <div className="text-[11px] text-center text-[#A5AFB9] py-1">
          Device ID: <span className="font-mono text-[#F4F6F8]">DEV-OFFLINE-784</span>
        </div>

        <div className="pt-3">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#b4c5ff] text-[#002979] font-bold rounded-xl text-[13px] hover:brightness-110 active:scale-95 transition-all"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
