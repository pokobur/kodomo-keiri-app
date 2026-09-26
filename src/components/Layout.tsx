import React, { ReactNode, useState } from 'react';
import { useApp } from '../context/AppContext';
import ProjectSelector from './ProjectSelector';
import PinLock from './PinLock';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isAdminMode, setAdminMode } = useApp();
  const [showPinLock, setShowPinLock] = useState(false);

  const handleModeToggle = () => {
    if (isAdminMode) {
      setAdminMode(false);
    } else {
      setShowPinLock(true);
    }
  };

  const handleUnlock = () => {
    setShowPinLock(false);
    setAdminMode(true);
  };

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col font-['Zen_Maru_Gothic']">
      <header className="bg-gradient-to-r from-blue-400 to-sky-400 p-4 shadow-md text-white sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-xl md:text-2xl font-bold flex-shrink-0">🪙 こども けいり アプリ</h1>
          
          {!isAdminMode && (
            <div className="flex-1 flex justify-center min-w-[200px]">
              <ProjectSelector />
            </div>
          )}

          <button
            onClick={handleModeToggle}
            className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-full font-bold text-sm md:text-base flex-shrink-0 border border-white/30 shadow-sm"
          >
            {isAdminMode ? 'こどもモード 🧒' : 'おとなモード 🔐'}
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-6">
        {showPinLock ? (
          <PinLock onUnlock={handleUnlock} onCancel={() => setShowPinLock(false)} />
        ) : (
          children
        )}
      </main>

      <footer className="bg-sky-100 text-center py-6 text-sky-600 text-sm font-bold mt-auto border-t border-sky-200">
        🪙 こども けいり アプリ
      </footer>
    </div>
  );
}
