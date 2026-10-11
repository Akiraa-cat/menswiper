import React from 'react';
import { Difficulty } from '../types/game';

interface DifficultyBarProps {
  currentDifficulty: Difficulty;
  onSelectDifficulty: (diff: Difficulty) => void;
}

export const DifficultyBar: React.FC<DifficultyBarProps> = ({
  currentDifficulty,
  onSelectDifficulty,
}) => {
  const options: { id: Difficulty; label: string; dim: string }[] = [
    { id: 'beginner', label: 'Beginner', dim: '9×9' },
    { id: 'intermediate', label: 'Intermediate', dim: '16×16' },
    { id: 'expert', label: 'Expert', dim: '30×16' },
  ];

  return (
    <div className="flex items-center justify-between bg-[#1b2026] p-1 rounded-xl shadow-sm border border-[#252a31]/60">
      {options.map((opt) => {
        const isActive = currentDifficulty === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onSelectDifficulty(opt.id)}
            aria-label={`Select ${opt.label} mode`}
            className={`flex-1 py-1.5 px-1 rounded-lg text-center text-[12px] font-semibold transition-all whitespace-nowrap ${
              isActive
                ? 'bg-[#222932] text-[#b4c5ff] shadow-sm'
                : 'text-[#A5AFB9] hover:text-[#F4F6F8] hover:bg-[#222932]/40'
            }`}
          >
            <span>{opt.label}</span>{' '}
            <span className="opacity-70 font-normal">{opt.dim}</span>
          </button>
        );
      })}
    </div>
  );
};
