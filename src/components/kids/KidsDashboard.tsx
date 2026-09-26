import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BalanceCards } from './BalanceCards';
import { ExpenseRequestModal } from './ExpenseRequestModal';
import { TransferModal } from './TransferModal';
import { LedgerTable } from './LedgerTable';
import { WishList } from './WishList';

export const KidsDashboard: React.FC = () => {
  const { currentProject } = useApp();
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-lg border-8 border-orange-200">
          <h1 className="text-3xl font-extrabold text-orange-600 mb-4">こども けいり</h1>
          <p className="text-xl text-gray-700 font-bold">まだ プロジェクトが ないよ。<br/>おとなに つくってもらおう！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50 pb-20 font-sans">
      <div className="max-w-4xl mx-auto p-4 space-y-8 pt-6">
        
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-sky-800 tracking-wider">
            {currentProject.name}
          </h1>
        </header>

        <section>
          <BalanceCards />
        </section>

        <section className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setExpenseModalOpen(true)}
            className="flex-1 bg-yellow-400 text-yellow-900 font-extrabold rounded-3xl py-6 text-2xl shadow-lg border-b-8 border-yellow-500 hover:translate-y-1 hover:border-b-4 transition-all"
          >
            つかう（おねがいする）💸
          </button>
          <button
            onClick={() => setTransferModalOpen(true)}
            className="flex-1 bg-purple-400 text-white font-extrabold rounded-3xl py-6 text-2xl shadow-lg border-b-8 border-purple-500 hover:translate-y-1 hover:border-b-4 transition-all"
          >
            ちょきんばこへ うつす 🏦
          </button>
        </section>

        <section className="bg-white p-6 rounded-3xl shadow-md border-4 border-pink-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-4 border-pink-200 inline-block pb-1">
            🌟 ほしいものリスト
          </h2>
          <WishList />
        </section>

        <section className="bg-white p-6 rounded-3xl shadow-md border-4 border-sky-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-4 border-sky-200 inline-block pb-1">
            📒 おこづかいちょう
          </h2>
          <LedgerTable />
        </section>

      </div>

      <ExpenseRequestModal 
        isOpen={expenseModalOpen} 
        onClose={() => setExpenseModalOpen(false)} 
      />
      <TransferModal 
        isOpen={transferModalOpen} 
        onClose={() => setTransferModalOpen(false)} 
      />
    </div>
  );
};
