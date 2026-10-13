import React, { useState } from 'react';

interface AccountModalProps {
  isOpen: boolean;
  username: string | null;
  onAuthenticated: (username: string) => void;
  onLogout: () => void;
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  username,
  onAuthenticated,
  onLogout,
  onClose,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [usernameInput, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/account/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.statusMessage ?? 'Account request failed.');
      onAuthenticated(data.username);
      setPassword('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Account request failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setError('');
    try {
      const response = await fetch('/api/account/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Could not sign out. Try again.');
      onLogout();
      setMode('login');
      setPassword('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not sign out.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101317]/85 backdrop-blur-md animate-in fade-in"
    >
      <div className="w-full max-w-sm bg-[#222932] p-5 rounded-2xl shadow-2xl border border-[#30353c]">
        <div className="flex items-center justify-between pb-3 border-b border-[#30353c]">
          <h2 id="account-modal-title" className="text-lg font-bold text-[#F4F6F8]">
            {username ? 'Player account' : mode === 'register' ? 'Create account' : 'Sign in'}
          </h2>
          <button onClick={onClose} aria-label="Close account" className="w-8 h-8 text-[#A5AFB9] hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {username ? (
          <div className="pt-5">
            <p className="text-sm text-[#A5AFB9]">Signed in as</p>
            <p className="text-xl font-bold text-[#75daa5] mt-1">{username}</p>
            {error && <p role="alert" className="mt-3 text-sm text-[#FF7777]">{error}</p>}
            <button
              onClick={() => void handleLogout()}
              className="w-full mt-5 py-2.5 bg-[#1b2026] hover:bg-[#30353c] text-[#F4F6F8] font-semibold rounded-lg border border-[#30353c]"
            >
              Sign out
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-1 p-1 mt-4 bg-[#1b2026] rounded-lg">
              {(['login', 'register'] as const).map((nextMode) => (
                <button
                  key={nextMode}
                  onClick={() => {
                    setMode(nextMode);
                    setError('');
                  }}
                  className={`py-2 text-sm font-semibold rounded-md ${
                    mode === nextMode ? 'bg-[#75daa5] text-[#102019]' : 'text-[#A5AFB9] hover:text-white'
                  }`}
                >
                  {nextMode === 'login' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="space-y-3 mt-4">
              <label className="block text-xs font-semibold text-[#A5AFB9]">
                Username
                <input
                  required
                  autoComplete="username"
                  value={usernameInput}
                  onChange={(event) => setUsernameInput(event.target.value)}
                  minLength={3}
                  maxLength={24}
                  className="block w-full mt-1 px-3 py-2.5 rounded-lg bg-[#1b2026] border border-[#30353c] text-sm text-[#F4F6F8] focus:outline-none focus:border-[#75daa5]"
                />
              </label>
              <label className="block text-xs font-semibold text-[#A5AFB9]">
                Password
                <input
                  required
                  type="password"
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  maxLength={128}
                  className="block w-full mt-1 px-3 py-2.5 rounded-lg bg-[#1b2026] border border-[#30353c] text-sm text-[#F4F6F8] focus:outline-none focus:border-[#75daa5]"
                />
              </label>
              {mode === 'register' && (
                <p className="text-[11px] text-[#A5AFB9]">Use 3-24 letters, numbers, or underscores for your username.</p>
              )}
              {error && <p role="alert" className="text-sm text-[#FF7777]">{error}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#75daa5] disabled:opacity-60 text-[#102019] font-bold rounded-lg"
              >
                {isSubmitting ? 'Please wait...' : mode === 'register' ? 'Create account' : 'Sign in'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};