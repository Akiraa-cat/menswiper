import { Cell } from '../types/game';

/**
 * 32-bit hash function (cyrb53 / FNV-like) converting string seeds to an integer.
 */
export function stringToSeed(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
  }
  return h;
}

/**
 * Mulberry32 PRNG generator
 */
export function createPRNG(seed: number) {
  let s = seed >>> 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a new random seed code like "#RNG-8492"
 */
export function generateRandomSeed(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `#RNG-${num}`;
}

/**
 * Get the daily seed for a given date
 */
export function getDailySeed(dayOffset = 0): { code: string; label: string; dayNumber: number } {
  const d = new Date();
  d.setDate(d.getDate() - dayOffset);
  
  // Calculate day of the year or sequential index
  const startOfYear = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const paddedDay = String(dayOfYear % 1000).padStart(3, '0');
  const code = `#DAILY-${paddedDay}`;
  const label = `Daily #${paddedDay}`;

  return { code, label, dayNumber: dayOfYear };
}

/**
 * Initialize an empty board
 */
export function createEmptyGrid(rows: number, cols: number): Cell[][] {
  const grid: Cell[][] = [];
  for (let r = 0; r < rows; r++) {
    grid[r] = [];
    for (let c = 0; c < cols; c++) {
      grid[r][c] = {
        row: r,
        col: c,
        mine: false,
        revealed: false,
        flagged: false,
        count: 0,
      };
    }
  }
  return grid;
}

/**
 * Populate mines using PRNG seed, guaranteeing the first clicked tile and its immediate
 * 3x3 vicinity are mine-free for an immediate clean tactical opening.
 */
export function populateMinesWithSeed(
  grid: Cell[][],
  rows: number,
  cols: number,
  totalMines: number,
  seedString: string,
  safeRow?: number,
  safeCol?: number
): Cell[][] {
  const seedNum = stringToSeed(seedString);
  const rng = createPRNG(seedNum);

  // Deep clone grid
  const newGrid: Cell[][] = grid.map(row => row.map(cell => ({ ...cell, mine: false, count: 0 })));

  // Available candidate coordinates
  const candidates: { r: number; c: number }[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // If a safe click coordinate is provided, exclude it and its 8 neighbors
      if (safeRow !== undefined && safeCol !== undefined) {
        const isSafeZone = Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1;
        if (isSafeZone) continue;
      }
      candidates.push({ r, c });
    }
  }

  // Shuffle candidates deterministically using Fisher-Yates with PRNG
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = candidates[i];
    candidates[i] = candidates[j];
    candidates[j] = temp;
  }

  // If not enough outside candidates (e.g. tiny custom board with many mines), allow non-adjacent safe spots
  let minesToPlace = Math.min(totalMines, candidates.length);
  for (let i = 0; i < minesToPlace; i++) {
    const { r, c } = candidates[i];
    newGrid[r][c].mine = true;
  }

  // Fallback if candidates were fewer than totalMines, but keep safeRow safe
  if (minesToPlace < totalMines && safeRow !== undefined && safeCol !== undefined) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (minesToPlace >= totalMines) break;
        if (r === safeRow && c === safeCol) continue;
        if (!newGrid[r][c].mine) {
          newGrid[r][c].mine = true;
          minesToPlace++;
        }
      }
    }
  }

  // Calculate neighbor counts
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (newGrid[r][c].mine) continue;

      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            if (newGrid[nr][nc].mine) {
              count++;
            }
          }
        }
      }
      newGrid[r][c].count = count;
    }
  }

  return newGrid;
}
