import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { isValidAmount, hasSufficientBalance, formatFlat } from '../../utils/validation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { currentProject, transferToSavings, transferToSpending } = useApp();
  const [direction, setDirection] = useState<'toSavings' | 'toSpending'>('toSavings');
  const [amount, setAmount] = useState<number | ''>('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !currentProject) return null;

  const sourceBalance = direction === 'toSavings' ? currentProject.spendBalance : currentProject.savingsBalance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = Number(amount);
    if (!isValidAmount(numAmount)) {
      setError('おかねは １０ふらっと ずつ だよ！');
      return;
    }
    if (!hasSufficientBalance(sourceBalance, numAmount)) {
      setError('おかね が たりないみたい…');
      return;
    }

    if (direction === 'toSavings') {
      transferToSavings(currentProject.id, numAmount);
    } else {
      transferToSpending(currentProject.id, numAmount);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">🔄 おかねを うつす</h2>
        
        <div className="flex gap-2 mb-6 bg-gray-100 p-2 rounded-xl">
          <button
            className={`flex-1 py-2 font-bold rounded-lg ${direction === 'toSavings' ? 'bg-green-400 text-white shadow' : 'text-gray-500'}`}
            onClick={() => setDirection('toSavings')}
            type="button"
          >
            ちょきんばこへ いれる 🏦
          </button>
          <button
            className={`flex-1 py-2 font-bold rounded-lg ${direction === 'toSpending' ? 'bg-blue-400 text-white shadow' : 'text-gray-500'}`}
            onClick={() => setDirection('toSpending')}
            type="button"
          >
            ちょきんばこから だす 💰
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-xl text-center">
            <p className="text-gray-600 font-bold mb-1">
              {direction === 'toSavings' ? 'つかえる おかね' : 'ちょきん'}
            </p>
            <p className="text-2xl font-extrabold text-gray-800">{formatFlat(sourceBalance)}</p>
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-700 mb-2">いくら うつす？</label>
            <input
              type="number"
              min="10"
              step="10"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
              className="w-full border-4 border-purple-200 rounded-xl p-3 text-lg"
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
              className="flex-1 bg-purple-400 text-white font-bold rounded-xl py-3 text-lg shadow-md"
            >
              うつす ✨
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
