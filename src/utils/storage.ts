import { GameRecord, GameSettings, UserStats } from '../types/game';

const RECORDS_KEY = 'minesweeper_rng_records';
const STATS_KEY = 'minesweeper_rng_stats';
const SETTINGS_KEY = 'minesweeper_rng_settings';

const INITIAL_RECORDS: GameRecord[] = [
  {
    id: 'rec-1',
    rank: 1,
    mode: 'Beginner',
    time: 34,
    score: 850,
    date: 'Today',
    timestamp: Date.now() - 3600 * 1000 * 2,
    seed: '#RNG-8492',
  },
  {
    id: 'rec-2',
    rank: 2,
    mode: 'Beginner',
    time: 48,
    score: 720,
    date: 'Yesterday',
    timestamp: Date.now() - 86400 * 1000,
    seed: '#RNG-6124',
  },
  {
    id: 'rec-3',
    rank: 3,
    mode: 'Beginner',
    time: 61,
    score: 610,
    date: '2 days ago',
    timestamp: Date.now() - 86400 * 1000 * 2,
    seed: '#RNG-3301',
  },
  {
    id: 'rec-4',
    rank: 1,
    mode: 'Intermediate',
    time: 142,
    score: 1840,
    date: '3 days ago',
    timestamp: Date.now() - 86400 * 1000 * 3,
    seed: '#RNG-7219',
  },
  {
    id: 'rec-5',
    rank: 1,
    mode: 'Expert',
    time: 310,
    score: 3420,
    date: 'Last week',
    timestamp: Date.now() - 86400 * 1000 * 7,
    seed: '#RNG-9912',
  },
];

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

export function getStoredRecords(): GameRecord[] {
  if (typeof window === 'undefined') return INITIAL_RECORDS;
  try {
    const data = localStorage.getItem(RECORDS_KEY);
    if (!data) {
      localStorage.setItem(RECORDS_KEY, JSON.stringify(INITIAL_RECORDS));
      return INITIAL_RECORDS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_RECORDS;
  }
}

export function saveNewRecord(record: Omit<GameRecord, 'id' | 'rank'>): GameRecord[] {
  const records = getStoredRecords();
  const newEntry: GameRecord = {
    ...record,
    id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  };

  const updated = [newEntry, ...records];
  
  // Re-rank entries within each mode by time ascending (lowest time = rank 1), or score descending
  const modes = ['Beginner', 'Intermediate', 'Expert', 'Custom'] as const;
  const reRanked: GameRecord[] = [];

  modes.forEach(m => {
    const modeRecords = updated.filter(r => r.mode === m);
    modeRecords.sort((a, b) => a.time - b.time || b.score - a.score);
    modeRecords.forEach((item, idx) => {
      reRanked.push({ ...item, rank: idx + 1 });
    });
  });

  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(reRanked));
  } catch {
    // ignore
  }

  return reRanked;
}

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
    localStorage.removeItem(RECORDS_KEY);
    localStorage.removeItem(STATS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  } catch {
    // ignore
  }
}
