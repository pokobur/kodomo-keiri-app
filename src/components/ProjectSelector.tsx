import React from 'react';
import { useApp } from '../context/AppContext';

export default function ProjectSelector() {
  const { projects, currentProjectId, setCurrentProjectId } = useApp();

  if (projects.length === 0) {
    return <div className="text-white text-sm font-bold">プロジェクトがありません</div>;
  }

  return (
    <div className="relative">
      <select
        value={currentProjectId || ''}
        onChange={(e) => setCurrentProjectId(e.target.value)}
        className="appearance-none bg-white/20 hover:bg-white/30 transition-colors text-white font-bold py-2 pl-4 pr-10 rounded-full border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
      >
        {projects.map(p => (
          <option key={p.id} value={p.id} className="text-gray-800">
            📁 {p.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white">
        ▼
      </div>
    </div>
  );
}
