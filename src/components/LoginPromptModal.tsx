import React from 'react';

interface LoginPromptModalProps {
  isOpen: boolean;
  onLogin: () => void;
  onClose: () => void;
}

export const LoginPromptModal: React.FC<LoginPromptModalProps> = ({ isOpen, onLogin, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-progress-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101317]/85 backdrop-blur-md animate-in fade-in"
    >
      <div className="w-full max-w-sm bg-[#222932] p-5 rounded-xl border border-[#30353c] shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="save-progress-title" className="text-lg font-bold text-[#F4F6F8]">Simpan skor kemenangan?</h2>
            <p className="mt-2 text-sm text-[#A5AFB9]">Buat akun atau masuk untuk menyimpan skor dan muncul di leaderboard.</p>
          </div>
          <button onClick={onClose} aria-label="Tutup" className="w-8 h-8 shrink-0 text-[#A5AFB9] hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button onClick={onClose} className="py-2.5 bg-[#1b2026] text-[#A5AFB9] font-semibold rounded-lg border border-[#30353c]">
            Nanti
          </button>
          <button onClick={onLogin} className="py-2.5 bg-[#75daa5] text-[#102019] font-bold rounded-lg">
            Masuk / Daftar
          </button>
        </div>
      </div>
    </div>
  );
};
