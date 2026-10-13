import React, { useEffect, useState } from 'react';

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
}

interface LeaderboardScreenProps {
  accountName: string | null;
  onOpenAccount: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ accountName, onOpenAccount }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLeaderboard = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/leaderboard');
      const data = await response.json();
      if (!response.ok) throw new Error(data.statusMessage ?? 'Could not load leaderboard.');
      setEntries(data.entries);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load leaderboard.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadLeaderboard();
  }, []);

  return (
    <section className="w-full max-w-xl mx-auto px-4 pb-20 pt-5">
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#30353c]">
        <div>
          <h2 className="text-xl font-bold text-[#F4F6F8]">Leaderboard</h2>
          <p className="mt-1 text-sm text-[#A5AFB9]">Total points from completed games</p>
        </div>
        <button
          onClick={() => void loadLeaderboard()}
          aria-label="Refresh leaderboard"
          title="Refresh leaderboard"
          className="w-10 h-10 flex items-center justify-center text-[#A5AFB9] hover:text-white rounded-lg hover:bg-[#222932]"
        >
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </div>

      {!accountName && (
        <div className="flex items-center justify-between gap-3 py-3 border-b border-[#252a31]">
          <p className="text-sm text-[#A5AFB9]">Sign in to add points for each win.</p>
          <button onClick={onOpenAccount} className="shrink-0 text-sm font-bold text-[#75daa5] hover:text-white">
            Sign in
          </button>
        </div>
      )}

      {isLoading ? (
        <p className="py-12 text-center text-sm text-[#A5AFB9]">Loading leaderboard...</p>
      ) : error ? (
        <div className="py-10 text-center">
          <p role="alert" className="text-sm text-[#FF7777]">{error}</p>
          <button onClick={() => void loadLeaderboard()} className="mt-3 text-sm font-bold text-[#75daa5]">Try again</button>
        </div>
      ) : entries.length === 0 ? (
        <div className="py-16 text-center">
          <span className="material-symbols-outlined text-4xl text-[#A5AFB9]">emoji_events</span>
          <h3 className="mt-3 font-semibold text-[#F4F6F8]">Belum ada pemain</h3>
          <p className="mt-1 text-sm text-[#A5AFB9]">Pemain akan muncul setelah akun pertama dibuat.</p>
          {!accountName && (
            <button onClick={onOpenAccount} className="mt-4 text-sm font-bold text-[#75daa5] hover:text-white">
              Buat akun
            </button>
          )}
        </div>
      ) : (
        <div className="mt-3 divide-y divide-[#252a31]">
          {entries.map((entry) => (
            <div key={entry.username} className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 py-3">
              <span className={`text-sm font-bold tabular-nums ${entry.rank === 1 ? 'text-[#F0BD4F]' : 'text-[#A5AFB9]'}`}>
                {entry.rank.toString().padStart(2, '0')}
              </span>
              <span className="truncate font-semibold text-[#F4F6F8]">{entry.username}</span>
              <span className="font-bold tabular-nums text-[#75daa5]">{entry.score.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};