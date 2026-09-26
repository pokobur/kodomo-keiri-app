import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatFlat } from '../../utils/validation';
import { Project } from '../../types';

export default function ProjectManagement() {
  const { projects, addProject, updateProjectName, deleteProject, updateAutoAllowance } = useApp();
  const [newProjectName, setNewProjectName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      addProject(newProjectName.trim());
      setNewProjectName('');
    }
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      updateProjectName(id, editName.trim());
    }
    setEditingId(null);
  };

  const startEdit = (project: Project) => {
    setEditingId(project.id);
    setEditName(project.name);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`「${name}」を本当に削除しますか？この操作は取り消せません。`)) {
      deleteProject(id);
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">📁 プロジェクト管理</h2>
      
      {/* New Project Form */}
      <form onSubmit={handleAddProject} className="flex gap-2 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div className="flex-1">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="新しいプロジェクト名..."
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={!newProjectName.trim()}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          追加する ➕
        </button>
      </form>

      {/* Projects List */}
      <div className="grid grid-cols-1 gap-4">
        {projects.length === 0 ? (
          <p className="text-center text-gray-500 py-4">プロジェクトがありません</p>
        ) : (
          projects.map(project => (
            <div key={project.id} className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors bg-white shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                
                <div className="flex-1">
                  {/* Name and Edit */}
                  <div className="flex items-center gap-2 mb-2">
                    {editingId === project.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="p-1 border rounded focus:ring-2 focus:ring-blue-400 outline-none flex-1 text-lg font-bold"
                          autoFocus
                        />
                        <button onClick={() => handleSaveEdit(project.id)} className="px-3 py-1 bg-green-500 text-white rounded font-bold text-sm">保存</button>
                        <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded font-bold text-sm">取消</button>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-bold text-gray-800">{project.name}</h3>
                        <button onClick={() => startEdit(project)} className="text-gray-400 hover:text-blue-500 p-1" title="名前を編集">✏️</button>
                      </>
                    )}
                  </div>
                  
                  {/* Balances */}
                  <div className="flex flex-wrap gap-3 text-sm mb-4">
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
                      つかう: <b>{formatFlat(project.spendBalance)}</b>
                    </span>
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                      ためる: <b>{formatFlat(project.savingsBalance)}</b>
                    </span>
                  </div>

                  {/* Auto Allowance Settings */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-sm">
                    <div className="font-bold text-gray-700 mb-2">自動おこづかい設定</div>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={project.autoAllowance.enabled}
                          onChange={(e) => updateAutoAllowance(project.id, { ...project.autoAllowance, enabled: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="font-medium text-gray-700">有効</span>
                      </label>
                      
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-gray-600">毎月</span>
                        <select
                          value={project.autoAllowance.dayOfMonth}
                          onChange={(e) => updateAutoAllowance(project.id, { ...project.autoAllowance, dayOfMonth: Number(e.target.value) })}
                          disabled={!project.autoAllowance.enabled}
                          className="p-1 border rounded bg-white disabled:opacity-50"
                        >
                          {Array.from({length: 28}, (_, i) => i + 1).map(d => (
                            <option key={d} value={d}>{d}日</option>
                          ))}
                        </select>
                        <span className="text-gray-600">に</span>
                        <input
                          type="number"
                          value={project.autoAllowance.amount}
                          onChange={(e) => updateAutoAllowance(project.id, { ...project.autoAllowance, amount: Number(e.target.value) })}
                          disabled={!project.autoAllowance.enabled}
                          min="10"
                          step="10"
                          className="p-1 border rounded w-20 bg-white disabled:opacity-50"
                        />
                        <span className="text-gray-600">F 支給</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <div className="flex justify-end shrink-0">
                  <button
                    onClick={() => handleDelete(project.id, project.name)}
                    className="flex items-center gap-1 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-bold border border-transparent hover:border-red-200"
                  >
                    🗑️ 削除
                  </button>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
