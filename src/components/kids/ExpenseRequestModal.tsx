import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { isValidAmount, hasSufficientBalance } from '../../utils/validation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTitle?: string;
  initialAmount?: number;
  initialWishlistItemId?: string;
}

export const ExpenseRequestModal: React.FC<Props> = ({ isOpen, onClose, initialTitle = '', initialAmount = 0, initialWishlistItemId }) => {
  const { currentProject, requestExpense } = useApp();
  const [title, setTitle] = useState(initialTitle);
  const [amount, setAmount] = useState<number | ''>(initialAmount || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setAmount(initialAmount || '');
      setError('');
    }
  }, [isOpen, initialTitle, initialAmount]);

  if (!isOpen || !currentProject) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('なにを かうか おしえてね！');
      return;
    }
    const numAmount = Number(amount);
    if (!isValidAmount(numAmount)) {
      setError('おかねは １０ふらっと ずつ だよ！');
      return;
    }
    if (!hasSufficientBalance(currentProject.spendBalance, numAmount)) {
      setError('つかえる おかね が たりないみたい…');
      return;
    }

    requestExpense(currentProject.id, title, numAmount, initialWishlistItemId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">💸 おかねを つかう</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-lg font-bold text-gray-700 mb-2">なにを かうの？</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-4 border-yellow-200 rounded-xl p-3 text-lg"
              placeholder="おかし、おもちゃ など"
            />
          </div>
          <div>
            <label className="block text-lg font-bold text-gray-700 mb-2">いくら？</label>
            <input
              type="number"
              min="10"
              step="10"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
              className="w-full border-4 border-yellow-200 rounded-xl p-3 text-lg"
              placeholder="100"
            />
          </div>
          {error && <p className="text-red-500 font-bold">{error}</p>}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 font-bold rounded-xl py-3 text-lg"
            >
              やめる
            </button>
            <button
              type="submit"
              className="flex-1 bg-yellow-400 text-yellow-900 font-bold rounded-xl py-3 text-lg shadow-md"
            >
              おとなに おねがいする 🙏
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
