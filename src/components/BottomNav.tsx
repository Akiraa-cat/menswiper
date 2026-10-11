import React from 'react';

export type NavTab = 'play' | 'daily' | 'records' | 'stats';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs: { id: NavTab; label: string; icon: string }[] = [
    { id: 'play', label: 'Play', icon: 'sports_esports' },
    { id: 'daily', label: 'Daily', icon: 'calendar_today' },
    { id: 'records', label: 'Records', icon: 'leaderboard' },
    { id: 'stats', label: 'Stats', icon: 'military_tech' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-[#101317]/95 backdrop-blur-xl border-t border-[#252a31]/50 shadow-[0_-2px_12px_rgba(0,0,0,0.6)]">
      <div className="flex justify-around items-center h-16 px-2 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              aria-label={`Go to ${tab.label} screen`}
              className={`flex flex-col items-center justify-center gap-0.5 w-16 h-12 transition-colors relative ${
                isActive ? 'text-[#b4c5ff] font-bold' : 'text-[#A5AFB9] hover:text-[#F4F6F8]'
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] transition-transform ${isActive ? 'scale-110' : ''}`}>
                {tab.icon}
              </span>
              <span className="text-[11px] tracking-wider uppercase font-semibold">
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-1 w-4 h-0.5 bg-[#b4c5ff] rounded-full shadow-[0_0_6px_#b4c5ff]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
