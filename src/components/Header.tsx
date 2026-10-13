import React from 'react';

interface HeaderProps {
  onOpenGuide: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  playerName: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenGuide,
  onOpenSettings,
  onOpenProfile,
  playerName,
}) => {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#101317]/90 backdrop-blur-xl border-b border-[#252a31]/50 shadow-[0_1px_8px_rgba(0,0,0,0.5)] pt-safe">
      <div className="h-14 px-4 max-w-2xl mx-auto flex items-center justify-between">
        {/* Brand Lockup */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#222932] flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[#FF5B5B] text-[18px]">
              emergency
            </span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-[18px] font-semibold tracking-tight text-[#F4F6F8] leading-tight">
              Minesweeper
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenGuide}
            aria-label="Game Guide"
            title="Game Guide & Rules"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-[#A5AFB9] hover:text-[#F4F6F8] hover:bg-[#222932] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">help_outline</span>
          </button>

          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            title="Game Settings"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-[#A5AFB9] hover:text-[#F4F6F8] hover:bg-[#222932] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>

          <button
            onClick={onOpenProfile}
            aria-label={playerName === 'Sign in' ? 'Sign in or create account' : `Account: ${playerName}`}
            title={playerName === 'Sign in' ? 'Sign in or create account' : `Account: ${playerName}`}
            className="w-8 h-8 rounded-full bg-[#b4c5ff] flex items-center justify-center ml-1 text-[#002979] hover:brightness-110 active:scale-95 transition-transform font-bold text-xs"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
          </button>
        </div>
      </div>
    </header>
  );
};
