export type Difficulty = 'beginner' | 'intermediate' | 'expert' | 'custom';

export interface DifficultyConfig {
  name: Difficulty;
  label: string;
  rows: number;
  cols: number;
  mines: number;
  displaySize: string;
}

export interface Cell {
  row: number;
  col: number;
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  count: number;
  exploded?: boolean;
  misflagged?: boolean;
}

export type InputMode = 'dig' | 'flag';

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

export type FaceMood = 'smile' | 'surprised' | 'won' | 'lost' | 'pressed';

export interface GameRecord {
  id: string;
  rank?: number;
  mode: 'Beginner' | 'Intermediate' | 'Expert' | 'Custom';
  time: number;
  score: number;
  date: string;
  timestamp: number;
  seed: string;
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  beginnerBestTime: number | null;
  intermediateBestTime: number | null;
  expertBestTime: number | null;
  totalScore: number;
  totalMinesFlagged: number;
  currentStreak: number;
  maxStreak: number;
  completedDailies: string[]; // array of daily seed strings e.g. "DAILY-084"
}

export interface GameSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  quickChord: boolean;
  autoFitGrid: boolean;
  longPressDelay: number;
  playerName: string;
}

export const DIFFICULTY_PRESETS: Record<Difficulty, DifficultyConfig> = {
  beginner: {
    name: 'beginner',
    label: 'Beginner',
    rows: 9,
    cols: 9,
    mines: 10,
    displaySize: '9×9',
  },
  intermediate: {
    name: 'intermediate',
    label: 'Intermediate',
    rows: 16,
    cols: 16,
    mines: 40,
    displaySize: '16×16',
  },
  expert: {
    name: 'expert',
    label: 'Expert',
    rows: 16,
    cols: 30,
    mines: 99,
    displaySize: '30×16',
  },
  custom: {
    name: 'custom',
    label: 'Custom',
    rows: 9,
    cols: 9,
    mines: 10,
    displaySize: 'Custom',
  },
};

export const NUMBER_COLORS: Record<number, string> = {
  1: '#243CFF',
  2: '#16852B',
  3: '#F02028',
  4: '#151C8D',
  5: '#8D1018',
  6: '#087E80',
  7: '#17191C',
  8: '#7B8188',
};
