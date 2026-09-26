import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface PinLockProps {
  onUnlock: () => void;
  onCancel: () => void;
}

export default function PinLock({ onUnlock, onCancel }: PinLockProps) {
  const { adminPin } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === adminPin) {
      onUnlock();
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">おとなモード 🔒</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PINコード"
              maxLength={4}
              className={`w-full text-center text-2xl p-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all ${
                error ? 'border-red-500 animate-bounce' : 'border-gray-200 focus:border-blue-500'
              }`}
            />
            {error && <p className="text-red-500 text-center mt-2 font-bold">PINが ちがいます</p>}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
            >
              もどる
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors"
            >
              すすむ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
