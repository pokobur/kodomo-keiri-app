import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatFlat } from '../../utils/validation';

export const BalanceCards: React.FC = () => {
  const { currentProject } = useApp();

  if (!currentProject) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      <div className="flex-1 bg-blue-100 rounded-3xl p-6 shadow-lg border-4 border-blue-300">
        <h2 className="text-xl font-bold text-blue-700 mb-2">💰 つかえる おかね</h2>
        <p className="text-3xl font-extrabold text-blue-900">{formatFlat(currentProject.spendBalance)}</p>
      </div>
      <div className="flex-1 bg-green-100 rounded-3xl p-6 shadow-lg border-4 border-green-300">
        <h2 className="text-xl font-bold text-green-700 mb-2">🏦 ちょきん</h2>
        <p className="text-3xl font-extrabold text-green-900">{formatFlat(currentProject.savingsBalance)}</p>
      </div>
    </div>
  );
};
