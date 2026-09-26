import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatFlat, formatDate } from '../../utils/validation';

export default function PendingApprovals() {
  const { projects, pendingExpenses, approveExpense, rejectExpense } = useApp();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleReject = (id: string) => {
    if (rejectReason.trim()) {
      rejectExpense(id, rejectReason.trim());
      setRejectId(null);
      setRejectReason('');
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">📋 承認待ちリスト</h2>
      
      {pendingExpenses.length === 0 ? (
        <p className="text-gray-500 text-center py-8">承認待ちの申請はありません ✨</p>
      ) : (
        <div className="flex flex-col gap-4">
          {pendingExpenses.map(expense => {
            const project = projects.find(p => p.id === expense.projectId);
            const projectName = project ? project.name : '不明なプロジェクト';
            
            return (
              <div key={expense.id} className="border border-yellow-200 bg-yellow-50 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">{projectName} • {formatDate(expense.date)}</div>
                  <div className="font-bold text-lg text-gray-800">{expense.title}</div>
                  <div className="text-red-500 font-bold text-lg">{formatFlat(expense.expenseAmount)}</div>
                </div>
                
                {rejectId === expense.id ? (
                  <div className="flex flex-col gap-2 min-w-[250px]">
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="差し戻しの理由..."
                      className="p-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none text-sm"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setRejectId(null)}
                        className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold"
                      >
                        キャンセル
                      </button>
                      <button 
                        onClick={() => handleReject(expense.id)}
                        disabled={!rejectReason.trim()}
                        className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-bold disabled:opacity-50"
                      >
                        送信する
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (window.confirm(`${expense.title}（${formatFlat(expense.expenseAmount)}）を承認しますか？`)) {
                          approveExpense(expense.id);
                        }
                      }}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center min-w-[120px]"
                    >
                      ✅ 承認する
                    </button>
                    <button
                      onClick={() => setRejectId(expense.id)}
                      className="px-4 py-2 bg-white border-2 border-red-200 hover:bg-red-50 text-red-600 rounded-xl font-bold transition-colors flex items-center justify-center min-w-[120px]"
                    >
                      ❌ 差し戻す
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
