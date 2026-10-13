import { GameSettings, LocalGameStats } from '../types/game';

const SETTINGS_KEY = 'minesweeper_rng_settings';
const GAME_STATS_KEY = 'minesweeper_rng_real_stats';
const EMPTY_GAME_STATS: LocalGameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  totalScore: 0,
  dailyWinDates: [],
};

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  quickChord: true,
  autoFitGrid: false,
  longPressDelay: 320,
};

export function getStoredSettings(): GameSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function getStoredGameStats(): LocalGameStats {
  if (typeof window === 'undefined') return EMPTY_GAME_STATS;
  try {
    const data = localStorage.getItem(GAME_STATS_KEY);
    return data ? { ...EMPTY_GAME_STATS, ...JSON.parse(data) } : EMPTY_GAME_STATS;
  } catch {
    return EMPTY_GAME_STATS;
  }
}

export function recordGameResult(won: boolean, score: number, dailyWinDate?: string) {
  const current = getStoredGameStats();
  const updated: LocalGameStats = {
    gamesPlayed: current.gamesPlayed + 1,
    gamesWon: current.gamesWon + (won ? 1 : 0),
    totalScore: current.totalScore + (won ? score : 0),
    dailyWinDates: dailyWinDate
      ? Array.from(new Set([...current.dailyWinDates, dailyWinDate])).sort()
      : current.dailyWinDates,
  };
  try {
    localStorage.setItem(GAME_STATS_KEY, JSON.stringify(updated));
  } catch {
    // Keep the current session usable when storage is unavailable.
  }
  return updated;
}

export function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDailyWinStreak(dailyWinDates: string[], today = new Date()) {
  const completedDates = new Set(dailyWinDates);
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!completedDates.has(getLocalDateKey(date))) date.setDate(date.getDate() - 1);

  let streak = 0;
  while (completedDates.has(getLocalDateKey(date))) {
    streak++;
    date.setDate(date.getDate() - 1);
  }
  return streak;
}

