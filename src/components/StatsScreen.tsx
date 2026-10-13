import React from 'react';
import { LocalGameStats } from '../types/game';
import { getDailyWinStreak } from '../utils/storage';

interface StatsScreenProps {
  stats: LocalGameStats;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ stats }) => {
  const winRate = stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;
  const dailyWinStreak = getDailyWinStreak(stats.dailyWinDates);

  const metrics = [
    { label: 'Games completed', value: stats.gamesPlayed.toLocaleString(), color: 'text-[#F4F6F8]' },
    { label: 'Games won', value: stats.gamesWon.toLocaleString(), color: 'text-[#75daa5]' },
    { label: 'Win rate', value: `${winRate}%`, color: 'text-[#b4c5ff]' },
    { label: 'Points earned', value: stats.totalScore.toLocaleString(), color: 'text-[#F0BD4F]' },
    { label: 'Daily win streak', value: `${dailyWinStreak} days`, color: 'text-[#FF8B68]' },
    { label: 'Daily puzzles solved', value: stats.dailyWinDates.length.toLocaleString(), color: 'text-[#75daa5]' },
  ];

  return (
    <section className="w-full max-w-xl mx-auto px-4 pb-20 pt-5">
      <div className="pb-4 border-b border-[#30353c]">
        <h2 className="text-xl font-bold text-[#F4F6F8]">Game stats</h2>
        <p className="mt-1 text-sm text-[#A5AFB9]">Real results saved on this device</p>
      </div>

      <div className="grid grid-cols-2 gap-x-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="py-5 border-b border-[#252a31]">
            <div className="text-xs font-semibold text-[#A5AFB9]">{metric.label}</div>
            <div className={`mt-1 text-2xl font-bold tabular-nums ${metric.color}`}>{metric.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
};