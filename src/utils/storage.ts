import { GameSettings, UserStats } from '../types/game';

const STATS_KEY = 'minesweeper_rng_stats';
const SETTINGS_KEY = 'minesweeper_rng_settings';

const INITIAL_STATS: UserStats = {
  gamesPlayed: 14,
  gamesWon: 9,
  beginnerBestTime: 34,
  intermediateBestTime: 142,
  expertBestTime: 310,
  totalScore: 7440,
  totalMinesFlagged: 92,
  currentStreak: 3,
  maxStreak: 5,
  completedDailies: ['#DAILY-083', '#DAILY-082'],
};

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  quickChord: true,
  autoFitGrid: false,
  longPressDelay: 320,
  playerName: 'Sweeper Cadet',
};

export function getStoredStats(): UserStats {
  if (typeof window === 'undefined') return INITIAL_STATS;
  try {
    const data = localStorage.getItem(STATS_KEY);
    if (!data) {
      localStorage.setItem(STATS_KEY, JSON.stringify(INITIAL_STATS));
      return INITIAL_STATS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_STATS;
  }
}

export function updateStoredStats(updates: Partial<UserStats>): UserStats {
  const current = getStoredStats();
  const updated: UserStats = {
    ...current,
    ...updates,
  };
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

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

export function resetAllStorage() {
  try {
    localStorage.removeItem('minesweeper_rng_records');
    localStorage.removeItem(STATS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  } catch {
    // ignore
  }
}
