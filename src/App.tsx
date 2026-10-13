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
  GameSettings,
  LocalGameStats,
} from './types/game';
import {
  createEmptyGrid,
  populateMinesWithSeed,
  generateRandomSeed,
  getDailySeed,
} from './utils/prng';
import {
  getStoredGameStats,
  getLocalDateKey,
  recordGameResult,
  getStoredSettings,
  saveSettings,
} from './utils/storage';
import { readJsonResponse } from './utils/http';
import { playSound, triggerHaptic } from './utils/audio';

import { Header } from './components/Header';
import { DifficultyBar } from './components/DifficultyBar';
import { SubBar } from './components/SubBar';
import { HUD } from './components/HUD';
import { GameBoard } from './components/GameBoard';
import { ActionBar } from './components/ActionBar';
import { VictoryDefeatModal } from './components/VictoryDefeatModal';
import { HelpModal } from './components/HelpModal';
import { SettingsModal } from './components/SettingsModal';
import { AccountModal } from './components/AccountModal';
import { LoginPromptModal } from './components/LoginPromptModal';
import { SeedModal } from './components/SeedModal';
import { BottomNav, NavTab } from './components/BottomNav';
import { DailyScreen } from './components/DailyScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
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
  const [isLoginPromptDismissed, setIsLoginPromptDismissed] = useState(false);
  const [isLoginPromptPending, setIsLoginPromptPending] = useState(false);

  // Storage State
  const [settings, setSettings] = useState<GameSettings>(getStoredSettings());
  const [gameStats, setGameStats] = useState<LocalGameStats>(getStoredGameStats());
  const [accountName, setAccountName] = useState<string | null>(null);
  const [guestGamesCompleted, setGuestGamesCompleted] = useState(0);
  const [guestScore, setGuestScore] = useState(0);
  const [scoreSaveError, setScoreSaveError] = useState('');

  // Game Engine State
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [seed, setSeed] = useState<string>('#RNG-8492');
  const [isDaily, setIsDaily] = useState<boolean>(false);
  const [mode, setMode] = useState<InputMode>('dig');
  const [grid, setGrid] = useState<Cell[][]>(() => {
    const cfg = DIFFICULTY_PRESETS.beginner;
    return createEmptyGrid(cfg.rows, cfg.cols);
  });
  const [status, setStatus] = useState<GameStatus>('idle');
  const [faceMood, setFaceMood] = useState<FaceMood>('smile');
  const [timerVal, setTimerVal] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [remainingMines, setRemainingMines] = useState<number>(DIFFICULTY_PRESETS.beginner.mines);
  const [isFitGrid, setIsFitGrid] = useState<boolean>(false);

  // Timer Ref
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const gameWasStartedRef = useRef(false);

  const recordAccountGame = useCallback(async (
    won: boolean,
    points: number,
    dailyWinDate?: string
  ) => {
    try {
      const response = await fetch('/api/game-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          won,
          score: points,
          dailyWinDate,
          todayDate: getLocalDateKey(new Date()),
        }),
      });
      const data = await readJsonResponse<{ stats: LocalGameStats }>(response);
      setGameStats(data.stats);
      setScoreSaveError('');
    } catch (error) {
      setScoreSaveError(error instanceof Error ? error.message : 'Game stats could not be saved.');
    }
  }, []);

  const completeGame = useCallback((won: boolean, points: number) => {
    if (!gameWasStartedRef.current) return;
    gameWasStartedRef.current = false;

    let dailyWinDate: string | undefined;
    if (won && isDaily) {
      for (let offset = 0; offset <= 6; offset++) {
        if (seed === getDailySeed(offset).code) {
          const dailyDate = new Date();
          dailyDate.setDate(dailyDate.getDate() - offset);
          dailyWinDate = getLocalDateKey(dailyDate);
          break;
        }
      }
    }
    if (accountName) {
      void recordAccountGame(won, points, dailyWinDate);
      return;
    }
    setGameStats(recordGameResult(won, points, dailyWinDate));

    const completedCount = guestGamesCompleted + 1;
    setGuestGamesCompleted(completedCount);
    if (completedCount >= 2 && !isLoginPromptDismissed) setIsLoginPromptPending(true);
  }, [accountName, guestGamesCompleted, isDaily, isLoginPromptDismissed, recordAccountGame, seed]);

  // Load local preferences; guest account state is intentionally memory-only.
  useEffect(() => {
    setSettings(getStoredSettings());
    setGameStats(getStoredGameStats());
    fetch('/api/account/me')
      .then((response) => readJsonResponse<{ username: string | null }>(response))
      .then((data) => setAccountName(data.username))
      .catch(() => setAccountName(null));
  }, []);

  useEffect(() => {
    let isActive = true;
    if (!accountName) {
      setGameStats(getStoredGameStats());
      return () => {
        isActive = false;
      };
    }

    fetch(`/api/account/stats?todayDate=${getLocalDateKey(new Date())}`)
      .then((response) => readJsonResponse<LocalGameStats>(response))
      .then((stats) => {
        if (!isActive) return;
        setGameStats(stats);
        setScoreSaveError('');
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        setScoreSaveError(error instanceof Error ? error.message : 'Game stats could not be loaded.');
      });

    return () => {
      isActive = false;
    };
  }, [accountName]);

  const saveScoreToAccount = useCallback(async (points: number) => {
    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: points }),
      });
      if (!response.ok) throw new Error('Score could not be saved. Check your connection and sign in again.');
      setScoreSaveError('');
      return true;
    } catch (error) {
      setScoreSaveError(error instanceof Error ? error.message : 'Score could not be saved.');
      return false;
    }
  }, []);

  const handleAuthenticated = (username: string) => {
    setAccountName(username);
    setIsProfileOpen(false);
    setIsLoginPromptPending(false);
    if (guestScore > 0) {
      void saveScoreToAccount(guestScore).then((saved) => {
        if (saved) setGuestScore(0);
      });
    }
  };

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

  // Reset / Start Game
  const initGame = useCallback(
    (newSeed?: string, diff: Difficulty = difficulty) => {
      stopTimer();
      gameWasStartedRef.current = false;
      setScoreSaveError('');
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

  // Load the shared puzzle for today
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
        completeGame(true, finalScore);

        if (!accountName) {
          setGuestScore((points) => points + finalScore);
        }

        setIsGameOverModalOpen(true);
      }
    },
    [accountName, completeGame, difficulty, saveScoreToAccount, settings, stopTimer, timerVal]
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
      completeGame(false, 0);

      setTimeout(() => {
        setIsGameOverModalOpen(true);
      }, 700);
    },
    [completeGame, settings, stopTimer]
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
        gameWasStartedRef.current = true;
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
        playerName={accountName ?? 'Sign in'}
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
                isDaily={isDaily}
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
              onNewMap={handleRegenerateSeed}
              isFitGrid={isFitGrid}
              onToggleFitGrid={() => setIsFitGrid(!isFitGrid)}
            />

          </div>
        )}

        {activeTab === 'daily' && (
          <DailyScreen stats={gameStats} onPlayDaily={handlePlaySpecificSeed} />
        )}

        {activeTab === 'stats' && <StatsScreen stats={gameStats} />}

        {activeTab === 'records' && (
          <LeaderboardScreen
            accountName={accountName}
            onOpenAccount={() => setIsProfileOpen(true)}
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
        saveMessage={scoreSaveError}
        onPlayAgain={handleRegenerateSeed}
        onInspectBoard={() => setIsGameOverModalOpen(false)}
        onClose={() => setIsGameOverModalOpen(false)}
      />

      <LoginPromptModal
        isOpen={
          !accountName && isLoginPromptPending && !isLoginPromptDismissed && !isGameOverModalOpen &&
          (status === 'won' || status === 'lost' || status === 'idle')
        }
        onLogin={() => {
          setIsLoginPromptDismissed(true);
          setIsLoginPromptPending(false);
          setIsProfileOpen(true);
        }}
        onClose={() => {
          setIsLoginPromptDismissed(true);
          setIsLoginPromptPending(false);
        }}
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onUpdateSettings={(newSettings) => {
          setSettings(newSettings);
          saveSettings(newSettings);
        }}
        onClose={() => setIsSettingsOpen(false)}
      />

      <AccountModal
        isOpen={isProfileOpen}
        username={accountName}
        onAuthenticated={handleAuthenticated}
        onLogout={() => {
          setAccountName(null);
          setGameStats(getStoredGameStats());
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
