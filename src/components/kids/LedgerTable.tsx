import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatDate, formatFlat } from '../../utils/validation';

export const LedgerTable: React.FC = () => {
  const { currentLedgerEntries, currentProject } = useApp();

  const visibleEntries = currentLedgerEntries.filter(
    entry => entry.status === 'approved' || entry.status === 'pending' || entry.status === 'rejected'
  ).sort((a, b) => {
    // 申請中を最上部にソート
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    // それ以外は承認日時（または作成日時）の降順
    const timeA = new Date(a.approvedAt || a.createdAt).getTime();
    const timeB = new Date(b.approvedAt || b.createdAt).getTime();
    return timeB - timeA;
  });

  if (visibleEntries.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-md text-center">
        <p className="text-gray-500 text-lg font-bold">まだ きろく が ないよ！</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden border-4 border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-4 font-bold border-b-4 border-gray-200 whitespace-nowrap">ひづけ</th>
              <th className="p-4 font-bold border-b-4 border-gray-200 min-w-[150px]">なにを かったか</th>
              <th className="p-4 font-bold border-b-4 border-gray-200 whitespace-nowrap">はいった おかね</th>
              <th className="p-4 font-bold border-b-4 border-gray-200 whitespace-nowrap">つかった おかね</th>
              <th className="p-4 font-bold border-b-4 border-gray-200 whitespace-nowrap">のこった おかね</th>
            </tr>
          </thead>
          <tbody>
            {visibleEntries.map((entry, index) => (
              <tr key={entry.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="p-4 border-b text-gray-600 whitespace-nowrap">{formatDate(entry.date)}</td>
                <td className="p-4 border-b font-bold text-gray-800">
                  {entry.title}
                  {entry.status === 'pending' && (
                    <span className="ml-2 inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold">
                      しんせいちゅう
                    </span>
                  )}
                  {entry.status === 'rejected' && (
                    <span className="ml-2 inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-bold">
                      きゃっか: {entry.rejectionReason}
                    </span>
                  )}
                </td>
                <td className="p-4 border-b font-bold text-green-600 whitespace-nowrap">
                  {entry.incomeAmount > 0 ? formatFlat(entry.incomeAmount) : '-'}
                </td>
                <td className="p-4 border-b font-bold text-red-500 whitespace-nowrap">
                  {entry.expenseAmount > 0 ? formatFlat(entry.expenseAmount) : '-'}
                </td>
                <td className="p-4 border-b font-bold text-blue-700 whitespace-nowrap">
                  {formatFlat(entry.status === 'pending' ? (currentProject?.spendBalance ?? 0) : entry.balanceAfter)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
