/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Difficulty,
  DIFFICULTY_PRESETS,
  Cell,
  InputMode,
  GameStatus,
  FaceMood,
  GameRecord,
  UserStats,
  GameSettings,
} from './types/game';
import {
  createEmptyGrid,
  populateMinesWithSeed,
  generateRandomSeed,
  getDailySeed,
} from './utils/prng';
import {
  getStoredRecords,
  saveNewRecord,
  getStoredStats,
  updateStoredStats,
  getStoredSettings,
  saveSettings,
  resetAllStorage,
} from './utils/storage';
import { playSound, triggerHaptic } from './utils/audio';

import { Header } from './components/Header';
import { DifficultyBar } from './components/DifficultyBar';
import { SubBar } from './components/SubBar';
import { HUD } from './components/HUD';
import { GameBoard } from './components/GameBoard';
import { ActionBar } from './components/ActionBar';
import { RecordsCard } from './components/RecordsCard';
import { VictoryDefeatModal } from './components/VictoryDefeatModal';
import { HelpModal } from './components/HelpModal';
import { SettingsModal } from './components/SettingsModal';
import { ProfileModal } from './components/ProfileModal';
import { SeedModal } from './components/SeedModal';
import { BottomNav, NavTab } from './components/BottomNav';
import { DailyScreen } from './components/DailyScreen';
import { RecordsScreen } from './components/RecordsScreen';
import { StatsScreen } from './components/StatsScreen';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<NavTab>('play');

  // Modals
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSeedModalOpen, setIsSeedModalOpen] = useState(false);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);

  // Storage State
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [stats, setStats] = useState<UserStats>(getStoredStats());
  const [settings, setSettings] = useState<GameSettings>(getStoredSettings());

  // Game Engine State
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [seed, setSeed] = useState<string>('#RNG-8492');
  const [isDaily, setIsDaily] = useState<boolean>(false);
  const [mode, setMode] = useState<InputMode>('dig');
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [faceMood, setFaceMood] = useState<FaceMood>('smile');
  const [timerVal, setTimerVal] = useState<number>(44);
  const [score, setScore] = useState<number>(140);
  const [remainingMines, setRemainingMines] = useState<number>(4);
  const [isFitGrid, setIsFitGrid] = useState<boolean>(false);

  // Timer Ref
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load records & stats from storage
  useEffect(() => {
    setRecords(getStoredRecords());
    setStats(getStoredStats());
    setSettings(getStoredSettings());
  }, []);

  // Stop timer helper
  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // Start timer helper
  const startTimer = useCallback(() => {
    stopTimer();
    timerIntervalRef.current = setInterval(() => {
      setTimerVal((prev) => {
        if (prev >= 999) return 999;
        return prev + 1;
      });
    }, 1000);
  }, [stopTimer]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  // Pre-load default initial state matching screenshot exactly on first mount
  useEffect(() => {
    const cfg = DIFFICULTY_PRESETS.beginner;
    const initialGrid = createEmptyGrid(cfg.rows, cfg.cols);

    // Populate using seed #RNG-8492
    const populated = populateMinesWithSeed(
      initialGrid,
      cfg.rows,
      cfg.cols,
      cfg.mines,
      '#RNG-8492',
      1,
      1
    );

    // Open sample safe cluster (rows 0-2, cols 0-2) matching the screenshot
    for (let r = 0; r <= 2; r++) {
      for (let c = 0; c <= 2; c++) {
        populated[r][c].revealed = true;
      }
    }

    // Place the 3 tactical flags from the screenshot
    if (populated[4]?.[5]) populated[4][5].flagged = true;
    if (populated[6]?.[2]) populated[6][2].flagged = true;
    if (populated[7]?.[7]) populated[7][7].flagged = true;

    setGrid(populated);
    setRemainingMines(4);
    setScore(140);
    setTimerVal(44);
    setStatus('playing');
    setFaceMood('smile');
    startTimer();
  }, [startTimer]);

  // Reset / Start Game
  const initGame = useCallback(
    (newSeed?: string, diff: Difficulty = difficulty) => {
      stopTimer();
      const cfg = DIFFICULTY_PRESETS[diff];
      const targetSeed = newSeed || seed;

      const emptyGrid = createEmptyGrid(cfg.rows, cfg.cols);
      setGrid(emptyGrid);
      setDifficulty(diff);
      setSeed(targetSeed);
      setStatus('idle');
      setFaceMood('smile');
      setTimerVal(0);
      setScore(0);
      setRemainingMines(cfg.mines);
      setIsGameOverModalOpen(false);
    },
    [difficulty, seed, stopTimer]
  );

  // Handle Reroll Seed
  const handleRegenerateSeed = () => {
    const newSeed = generateRandomSeed();
    setIsDaily(false);
    initGame(newSeed);
    playSound.click(settings.soundEnabled);
  };

  // Handle Load Daily Seed
  const handleLoadDailySeed = () => {
    const daily = getDailySeed(0);
    setIsDaily(true);
    setDifficulty('beginner');
    initGame(daily.code, 'beginner');
    playSound.click(settings.soundEnabled);
  };

  // Select difficulty tab
  const handleSelectDifficulty = (newDiff: Difficulty) => {
    if (newDiff === difficulty) return;
    initGame(seed, newDiff);
    playSound.click(settings.soundEnabled);
  };

  // Check victory condition
  const checkVictory = useCallback(
    (currentGrid: Cell[][], currentScore: number) => {
      const cfg = DIFFICULTY_PRESETS[difficulty];
      let unrevealedSafe = 0;

      for (let r = 0; r < cfg.rows; r++) {
        for (let c = 0; c < cfg.cols; c++) {
          if (!currentGrid[r][c].mine && !currentGrid[r][c].revealed) {
            unrevealedSafe++;
          }
        }
      }

      if (unrevealedSafe === 0) {
        stopTimer();
        setStatus('won');
        setFaceMood('won');
        playSound.victory(settings.soundEnabled);
        triggerHaptic('heavy', settings.hapticsEnabled);

        // Auto-flag all mines
        const finalizedGrid = currentGrid.map((row) =>
          row.map((cell) => (cell.mine ? { ...cell, flagged: true } : cell))
        );
        setGrid(finalizedGrid);
        setRemainingMines(0);

        // Bonus score calculation
        const timeBonus = Math.max(0, 500 - timerVal * 2);
        const finalScore = currentScore + 500 + timeBonus;
        setScore(finalScore);

        // Update records in offline storage
        const modeLabel =
          difficulty === 'beginner'
            ? 'Beginner'
            : difficulty === 'intermediate'
            ? 'Intermediate'
            : 'Expert';

        const updatedRecords = saveNewRecord({
          mode: modeLabel,
          time: timerVal,
          score: finalScore,
          date: 'Today',
          timestamp: Date.now(),
          seed,
        });
        setRecords(updatedRecords);

        // Update user stats
        const currentBestTime =
          difficulty === 'beginner'
            ? stats.beginnerBestTime
            : difficulty === 'intermediate'
            ? stats.intermediateBestTime
            : stats.expertBestTime;

        const newBestTime =
          currentBestTime === null ? timerVal : Math.min(currentBestTime, timerVal);

        const newStats = updateStoredStats({
          gamesWon: stats.gamesWon + 1,
          totalScore: stats.totalScore + finalScore,
          currentStreak: stats.currentStreak + 1,
          maxStreak: Math.max(stats.maxStreak, stats.currentStreak + 1),
          beginnerBestTime:
            difficulty === 'beginner' ? newBestTime : stats.beginnerBestTime,
          intermediateBestTime:
            difficulty === 'intermediate' ? newBestTime : stats.intermediateBestTime,
          expertBestTime:
            difficulty === 'expert' ? newBestTime : stats.expertBestTime,
          completedDailies: isDaily
            ? Array.from(new Set([...stats.completedDailies, seed]))
            : stats.completedDailies,
        });
        setStats(newStats);

        setIsGameOverModalOpen(true);
      }
    },
    [difficulty, isDaily, seed, settings, stats, stopTimer, timerVal]
  );

  // Cascade reveal algorithm
  const revealCellRecursive = useCallback(
    (gridCopy: Cell[][], r: number, c: number, rows: number, cols: number): number => {
      let openedCount = 0;
      const queue: [number, number][] = [[r, c]];

      while (queue.length > 0) {
        const [cr, cc] = queue.pop()!;
        const cell = gridCopy[cr][cc];

        if (cell.revealed || cell.flagged || cell.mine) continue;

        cell.revealed = true;
        openedCount++;

        // If zero tile, push surrounding neighbors to queue
        if (cell.count === 0) {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = cr + dr;
              const nc = cc + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                if (!gridCopy[nr][nc].revealed && !gridCopy[nr][nc].flagged) {
                  queue.push([nr, nc]);
                }
              }
            }
          }
        }
      }

      return openedCount;
    },
    []
  );

  // Trigger Defeat
  const triggerDefeat = useCallback(
    (currentGrid: Cell[][], hitR: number, hitC: number) => {
      stopTimer();
      setStatus('lost');
      setFaceMood('lost');
      playSound.explosion(settings.soundEnabled);
      triggerHaptic('heavy', settings.hapticsEnabled);

      const cfg = DIFFICULTY_PRESETS[difficulty];
      const revealedGrid = currentGrid.map((row, r) =>
        row.map((cell, c) => {
          if (r === hitR && c === hitC) {
            return { ...cell, revealed: true, exploded: true };
          }
          if (cell.mine && !cell.flagged) {
            return { ...cell, revealed: true };
          }
          if (!cell.mine && cell.flagged) {
            return { ...cell, revealed: true, misflagged: true };
          }
          return cell;
        })
      );

      setGrid(revealedGrid);

      // Record defeat in stats
      const newStats = updateStoredStats({
        gamesPlayed: stats.gamesPlayed + 1,
        currentStreak: 0,
      });
      setStats(newStats);

      setTimeout(() => {
        setIsGameOverModalOpen(true);
      }, 700);
    },
    [difficulty, settings, stats.gamesPlayed, stopTimer]
  );

  // Cell Click (Dig or Flag based on active input mode)
  const handleCellClick = useCallback(
    (r: number, c: number) => {
      if (status === 'won' || status === 'lost') return;

      // In Flag mode, clicking toggles flag
      if (mode === 'flag') {
        handleCellRightClick(r, c);
        return;
      }

      let currentGrid = grid;
      const cfg = DIFFICULTY_PRESETS[difficulty];

      // First click: guaranteed safe opening!
      if (status === 'idle') {
        currentGrid = populateMinesWithSeed(
          grid,
          cfg.rows,
          cfg.cols,
          cfg.mines,
          seed,
          r,
          c
        );
        setStatus('playing');
        startTimer();

        // Increment games played
        setStats((prev) => updateStoredStats({ gamesPlayed: prev.gamesPlayed + 1 }));
      }

      const cell = currentGrid[r][c];
      if (cell.revealed || cell.flagged) return;

      // Mine hit!
      if (cell.mine) {
        triggerDefeat(currentGrid, r, c);
        return;
      }

      // Safe cell reveal
      const gridCopy = currentGrid.map((row) => row.map((item) => ({ ...item })));
      const opened = revealCellRecursive(gridCopy, r, c, cfg.rows, cfg.cols);

      if (opened > 1) {
        playSound.pop(settings.soundEnabled);
      } else {
        playSound.click(settings.soundEnabled);
      }
      triggerHaptic('light', settings.hapticsEnabled);

      const addedScore = opened * 10;
      const newScore = score + addedScore;
      setScore(newScore);
      setGrid(gridCopy);
      checkVictory(gridCopy, newScore);
    },
    [
      checkVictory,
      difficulty,
      grid,
      mode,
      revealCellRecursive,
      score,
      seed,
      settings,
      startTimer,
      status,
      triggerDefeat,
    ]
  );

  // Right-Click or Long-Press: Toggle Flag
  const handleCellRightClick = useCallback(
    (r: number, c: number) => {
      if (status === 'won' || status === 'lost') return;

      const cell = grid[r]?.[c];
      if (!cell || cell.revealed) return;

      const newFlagged = !cell.flagged;
      const updatedGrid = grid.map((row, rowIdx) =>
        row.map((item, colIdx) => {
          if (rowIdx === r && colIdx === c) {
            return { ...item, flagged: newFlagged };
          }
          return item;
        })
      );

      if (newFlagged) {
        playSound.flag(settings.soundEnabled);
        triggerHaptic('medium', settings.hapticsEnabled);
        setRemainingMines((prev) => prev - 1);
        setStats((prev) => updateStoredStats({ totalMinesFlagged: prev.totalMinesFlagged + 1 }));
      } else {
        playSound.unflag(settings.soundEnabled);
        triggerHaptic('light', settings.hapticsEnabled);
        setRemainingMines((prev) => prev + 1);
      }

      setGrid(updatedGrid);
    },
    [grid, settings, status]
  );

  // Chord Click on revealed numbered tile
  const handleCellChord = useCallback(
    (r: number, c: number) => {
      if (!settings.quickChord || status === 'won' || status === 'lost') return;
      const cell = grid[r][c];
      if (!cell.revealed || cell.count === 0) return;

      const cfg = DIFFICULTY_PRESETS[difficulty];

      // Count adjacent flags
      let flagCount = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < cfg.rows && nc >= 0 && nc < cfg.cols) {
            if (grid[nr][nc].flagged) flagCount++;
          }
        }
      }

      // If flags match adjacent number, reveal all other unflagged neighbors!
      if (flagCount === cell.count) {
        let hitMine = false;
        let mineR = -1;
        let mineC = -1;
        const gridCopy = grid.map((row) => row.map((item) => ({ ...item })));
        let totalOpened = 0;

        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < cfg.rows && nc >= 0 && nc < cfg.cols) {
              const target = gridCopy[nr][nc];
              if (!target.revealed && !target.flagged) {
                if (target.mine) {
                  hitMine = true;
                  mineR = nr;
                  mineC = nc;
                } else {
                  totalOpened += revealCellRecursive(gridCopy, nr, nc, cfg.rows, cfg.cols);
                }
              }
            }
          }
        }

        if (hitMine) {
          triggerDefeat(grid, mineR, mineC);
        } else if (totalOpened > 0) {
          playSound.chord(settings.soundEnabled);
          triggerHaptic('medium', settings.hapticsEnabled);
          const newScore = score + totalOpened * 10;
          setScore(newScore);
          setGrid(gridCopy);
          checkVictory(gridCopy, newScore);
        }
      }
    },
    [
      checkVictory,
      difficulty,
      grid,
      revealCellRecursive,
      score,
      settings,
      status,
      triggerDefeat,
    ]
  );

  // Play seed from records or daily archive
  const handlePlaySpecificSeed = (seedCode: string, modeName?: string) => {
    setActiveTab('play');
    let targetDiff = difficulty;
    if (modeName) {
      if (modeName.toLowerCase() === 'beginner') targetDiff = 'beginner';
      if (modeName.toLowerCase() === 'intermediate') targetDiff = 'intermediate';
      if (modeName.toLowerCase() === 'expert') targetDiff = 'expert';
    }
    initGame(seedCode, targetDiff);
  };

  return (
    <div className="bg-[#101317] font-['Inter',sans-serif] text-[#F4F6F8] min-h-screen flex flex-col selection:bg-[#7c9cff] selection:text-[#002979]">
      {/* Top Navigation Bar */}
      <Header
        onOpenGuide={() => setIsHelpOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        playerName={settings.playerName}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full pt-14 pb-20 overflow-x-hidden">
        {activeTab === 'play' && (
          <div className="flex flex-col w-full max-w-xl mx-auto px-4 pb-4">
            {/* Difficulty Bar */}
            <div className="pt-2">
              <DifficultyBar
                currentDifficulty={difficulty}
                onSelectDifficulty={handleSelectDifficulty}
              />
            </div>

            {/* Sub Bar (Seed & Daily) */}
            <div className="mt-2">
              <SubBar
                seed={seed}
                isDaily={isDaily}
                dailyLabel={getDailySeed(0).label}
                onRegenerateSeed={handleRegenerateSeed}
                onOpenSeedModal={() => setIsSeedModalOpen(true)}
                onLoadDailySeed={handleLoadDailySeed}
              />
            </div>

            {/* HUD Telemetry Bar */}
            <HUD
              remainingMines={remainingMines}
              timeSeconds={timerVal}
              score={score}
              mood={faceMood}
              onReset={() => initGame(undefined, difficulty)}
            />

            {/* Tactical Game Board */}
            <GameBoard
              grid={grid}
              difficulty={difficulty}
              isFitGrid={isFitGrid}
              onCellClick={handleCellClick}
              onCellRightClick={handleCellRightClick}
              onCellChord={handleCellChord}
              onPointerDownCell={() => {
                if (status === 'playing') setFaceMood('surprised');
              }}
              onPointerUpCell={() => {
                if (status === 'playing') setFaceMood('smile');
              }}
              longPressDelayMs={settings.longPressDelay}
            />

            {/* Tactical Action Bar */}
            <ActionBar
              mode={mode}
              onSetMode={setMode}
              onNewRngMap={handleRegenerateSeed}
              isFitGrid={isFitGrid}
              onToggleFitGrid={() => setIsFitGrid(!isFitGrid)}
            />

            {/* Local Device Records Card */}
            <RecordsCard
              records={records.filter((r) => r.mode === 'Beginner')}
              onViewAllRecords={() => setActiveTab('records')}
              onPlaySeed={(s) => handlePlaySpecificSeed(s, 'Beginner')}
            />
          </div>
        )}

        {activeTab === 'daily' && (
          <DailyScreen stats={stats} onPlayDaily={handlePlaySpecificSeed} />
        )}

        {activeTab === 'records' && (
          <RecordsScreen records={records} onPlaySeed={handlePlaySpecificSeed} />
        )}

        {activeTab === 'stats' && (
          <StatsScreen
            stats={stats}
            onLaunchCustomSeed={(customSeed, customDiff) => {
              setActiveTab('play');
              initGame(customSeed, customDiff);
            }}
          />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Modals & Dialogs */}
      <VictoryDefeatModal
        isOpen={isGameOverModalOpen}
        isWon={status === 'won'}
        timeSeconds={timerVal}
        score={score}
        seed={seed}
        onPlayAgain={handleRegenerateSeed}
        onInspectBoard={() => setIsGameOverModalOpen(false)}
        onClose={() => setIsGameOverModalOpen(false)}
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onUpdateSettings={(newSettings) => {
          setSettings(newSettings);
          saveSettings(newSettings);
        }}
        onResetData={() => {
          resetAllStorage();
          setRecords(getStoredRecords());
          setStats(getStoredStats());
        }}
        onClose={() => setIsSettingsOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        playerName={settings.playerName}
        stats={stats}
        onUpdateName={(name) => {
          const updated = { ...settings, playerName: name };
          setSettings(updated);
          saveSettings(updated);
        }}
        onClose={() => setIsProfileOpen(false)}
      />

      <SeedModal
        isOpen={isSeedModalOpen}
        currentSeed={seed}
        onSetSeed={(newSeed) => {
          setIsDaily(false);
          initGame(newSeed, difficulty);
        }}
        onClose={() => setIsSeedModalOpen(false)}
      />
    </div>
  );
}
