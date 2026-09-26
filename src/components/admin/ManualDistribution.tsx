import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatFlat } from '../../utils/validation';

export default function ManualDistribution() {
  const { projects, distributeAllowance } = useApp();
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [amount, setAmount] = useState<number | ''>('');
  const [reason, setReason] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedProject = projects.find(p => p.id === projectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || amount === '' || amount <= 0 || amount % 10 !== 0 || !reason.trim()) {
      return;
    }
    
    distributeAllowance(projectId, amount, reason.trim());
    
    setAmount('');
    setReason('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">💰 ふらっと支給</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
        {showSuccess && (
          <div className="bg-green-100 text-green-800 p-3 rounded-lg text-sm font-bold text-center">
            ✨ 支給が完了しました！
          </div>
        )}
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">対象プロジェクト</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none"
            required
          >
            {projects.length === 0 && <option value="">プロジェクトがありません</option>}
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {selectedProject && (
            <p className="text-xs text-gray-500 mt-1">
              現在の残高: つかう {formatFlat(selectedProject.spendBalance)} / ためる {formatFlat(selectedProject.savingsBalance)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">支給額（10ふらっと単位）</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              min="10"
              step="10"
              placeholder="例: 100"
              className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none pr-12"
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">F</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">支給理由</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="例: 10がつの おこづかい、おそうじ ボーナス"
            className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={!projectId || amount === '' || amount <= 0 || amount % 10 !== 0 || !reason.trim()}
          className="w-full py-4 mt-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-bold text-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          支給する 💫
        </button>
      </form>
    </section>
  );
}
