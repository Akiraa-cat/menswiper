import React, { useRef } from 'react';
import { Cell, Difficulty, NUMBER_COLORS } from '../types/game';

interface GameBoardProps {
  grid: Cell[][];
  difficulty: Difficulty;
  isFitGrid: boolean;
  onCellClick: (row: number, col: number) => void;
  onCellRightClick: (row: number, col: number) => void;
  onCellChord: (row: number, col: number) => void;
  onPointerDownCell?: () => void;
  onPointerUpCell?: () => void;
  longPressDelayMs?: number;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  grid,
  difficulty,
  isFitGrid,
  onCellClick,
  onCellRightClick,
  onCellChord,
  onPointerDownCell,
  onPointerUpCell,
  longPressDelayMs = 300,
}) => {
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchMovedRef = useRef<boolean>(false);

  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;

  // Determine dynamic tile dimensions based on difficulty & fit mode
  const getTileSizeClass = () => {
    if (difficulty === 'beginner') {
      return isFitGrid ? 'w-8 h-8 sm:w-9 sm:h-9 text-[18px]' : 'w-9 h-9 sm:w-10 sm:h-10 text-[18px]';
    }
    if (difficulty === 'intermediate') {
      return isFitGrid ? 'w-5 h-5 sm:w-6 sm:h-6 text-[14px]' : 'w-6 h-6 sm:w-7 sm:h-7 text-[16px]';
    }
    // Expert (30 cols)
    return isFitGrid ? 'w-3.5 h-3.5 sm:w-5 sm:h-5 text-[11px]' : 'w-5 h-5 sm:w-6 sm:h-6 text-[13px]';
  };

  const tileSize = getTileSizeClass();

  // Handlers for touch long-press (flagging on mobile)
  const handleTouchStart = (r: number, c: number) => {
    touchMovedRef.current = false;
    onPointerDownCell?.();

    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      if (!touchMovedRef.current) {
        onCellRightClick(r, c);
      }
    }, longPressDelayMs);
  };

  const handleTouchEnd = (r: number, c: number, e: React.TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    onPointerUpCell?.();

    // If fast tap and not moved
    if (!touchMovedRef.current) {
      e.preventDefault();
      onCellClick(r, c);
    }
  };

  const handleTouchMove = () => {
    touchMovedRef.current = true;
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  return (
    <div className="mt-3 flex flex-col items-center w-full">
      <div
        id="board-cabinet"
        className={`p-2 sm:p-3 bg-[#252a31] rounded-xl shadow-2xl overflow-x-auto max-w-full border border-[#30353c] select-none transition-transform duration-200 ${
          isFitGrid ? 'scale-[0.98]' : ''
        }`}
      >
        <div
          className="grid gap-[2px] bg-[#8D949B] p-[2px] rounded-sm select-none"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              // REVEALED TILE
              if (cell.revealed) {
                // Exploded mine (player hit this mine)
                if (cell.exploded) {
                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`${tileSize} bg-[#FF5B5B] flex items-center justify-center border border-[#93000a] select-none`}
                    >
                      <svg className="w-[70%] h-[70%] text-[#101317] pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="6" />
                        <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  );
                }

                // Normal mine revealed upon game over
                if (cell.mine) {
                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`${tileSize} bg-[#E7E9EB] flex items-center justify-center border border-[#8D949B] select-none`}
                    >
                      <svg className="w-[70%] h-[70%] text-[#101317] pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="6" />
                        <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  );
                }

                // Misflagged tile (player placed flag where there was NO mine)
                if (cell.misflagged) {
                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`${tileSize} bg-[#E7E9EB] flex items-center justify-center border border-[#8D949B] relative select-none`}
                    >
                      <svg className="w-[60%] h-[60%] text-[#FF5B5B] pointer-events-none opacity-50" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5 21v-3h1v-4H5V3h11l1 3h5v9h-8l-1-3H7v9H5z" />
                      </svg>
                      {/* Big red X over misflag */}
                      <span className="absolute inset-0 flex items-center justify-center text-[#93000a] font-bold text-xs">✕</span>
                    </div>
                  );
                }

                // Normal revealed safe tile with number or blank
                const numColor = cell.count > 0 ? (NUMBER_COLORS[cell.count] || '#243CFF') : 'transparent';
                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => {
                      if (cell.count > 0) onCellChord(r, c);
                    }}
                    style={{ color: numColor }}
                    aria-label={cell.count > 0 ? `${cell.count} mines adjacent` : 'Empty revealed cell'}
                    className={`${tileSize} bg-[#E7E9EB] flex items-center justify-center font-black select-none border border-[#8D949B] transition-none leading-none ${
                      cell.count > 0 ? 'cursor-pointer hover:bg-[#dfe2e5] active:bg-[#d0d4d8]' : 'cursor-default'
                    }`}
                  >
                    {cell.count > 0 ? cell.count : ''}
                  </button>
                );
              }

              // UNREVEALED TILE (tactile raised 3D bevel)
              return (
                <div
                  key={`${r}-${c}`}
                  onClick={(e) => {
                    // Handled if desktop mouse click
                    if (e.detail > 0) {
                      onCellClick(r, c);
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    onCellRightClick(r, c);
                  }}
                  onMouseDown={onPointerDownCell}
                  onMouseUp={onPointerUpCell}
                  onTouchStart={() => handleTouchStart(r, c)}
                  onTouchEnd={(e) => handleTouchEnd(r, c, e)}
                  onTouchMove={handleTouchMove}
                  role="button"
                  tabIndex={0}
                  aria-label={`Cell row ${r + 1} column ${c + 1} ${cell.flagged ? 'flagged' : 'hidden'}`}
                  className={`${tileSize} tactile-tile-unrevealed flex items-center justify-center font-bold cursor-pointer select-none`}
                >
                  {cell.flagged && (
                    <svg
                      className="w-[65%] h-[65%] text-[#FF5B5B] drop-shadow-sm pointer-events-none"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M5 21v-3h1v-4H5V3h11l1 3h5v9h-8l-1-3H7v9H5z" />
                    </svg>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
