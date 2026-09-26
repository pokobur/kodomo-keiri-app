import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import PendingApprovals from './PendingApprovals';
import ManualDistribution from './ManualDistribution';
import ProjectManagement from './ProjectManagement';

// ─── PIN変更コンポーネント ───
function PinChange() {
  const { setAdminPin } = useApp();
  const [secretAnswer, setSecretAnswer] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const resetForm = () => {
    setSecretAnswer('');
    setNewPin('');
    setConfirmPin('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (secretAnswer !== '0190') {
      setMessage({ type: 'error', text: '秘密の質問の答えが正しくありません。' });
      return;
    }
    if (newPin.length < 4) {
      setMessage({ type: 'error', text: '新しいPINは4桁以上で入力してください。' });
      return;
    }
    if (newPin !== confirmPin) {
      setMessage({ type: 'error', text: '新しいPINが一致しません。' });
      return;
    }

    setAdminPin(newPin);
    resetForm();
    setMessage({ type: 'success', text: 'PINコードを変更しました ✅' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
      <h2 className="text-lg font-bold text-gray-800 mb-4">🔑 PINコード変更</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">【秘密の質問】あなたの年齢は？</label>
          <input
            type="password"
            value={secretAnswer}
            onChange={(e) => setSecretAnswer(e.target.value)}
            placeholder="答えを入力"
            className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">新しいPIN（4桁以上）</label>
          <input
            type="password"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="新しいPINを入力"
            maxLength={8}
            className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">新しいPIN（確認）</label>
          <input
            type="password"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            placeholder="もう一度入力"
            maxLength={8}
            className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={!secretAnswer || !newPin || !confirmPin}
          className="mt-1 py-2.5 px-4 bg-slate-700 hover:bg-slate-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors"
        >
          PINを変更する
        </button>
      </form>
    </div>
  );
}

// ─── AdminPanel ───
export function AdminPanel() {
  return (
    <div className="flex flex-col gap-6 pb-12 animate-fade-in">
      <div className="bg-slate-800 text-white p-4 rounded-xl shadow-md mb-2 flex items-center justify-between">
        <h1 className="text-xl font-bold">🛠️ 管理者ダッシュボード</h1>
        <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">大人用設定画面</span>
      </div>

      {/* 1. Pending Approvals - Highest Priority */}
      <PendingApprovals />

      {/* 2. Manual Distribution */}
      <ManualDistribution />

      {/* 3. Project Management */}
      <ProjectManagement />

      {/* 4. PIN Change */}
      <PinChange />
    </div>
  );
}
