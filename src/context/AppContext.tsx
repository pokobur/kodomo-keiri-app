import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Project, LedgerEntry, WishlistItem } from '../types';
import { generateId, todayString, currentMonthString } from '../utils/validation';

// ─── Context の型定義 ───
interface AppContextType {
  // State
  projects: Project[];
  ledgerEntries: LedgerEntry[];
  wishlistItems: WishlistItem[];
  currentProjectId: string | null;
  isAdminMode: boolean;
  adminPin: string;

  // Mode
  setCurrentProjectId: (id: string) => void;
  setAdminMode: (mode: boolean) => void;
  setAdminPin: (pin: string) => void;

  // Project CRUD（おとな専用）
  addProject: (name: string) => void;
  updateProjectName: (id: string, name: string) => void;
  deleteProject: (id: string) => void;

  // ふらっと支給（おとな専用）
  distributeAllowance: (projectId: string, amount: number, reason: string) => void;
  updateAutoAllowance: (projectId: string, settings: Project['autoAllowance']) => void;

  // 支出
  requestExpense: (projectId: string, title: string, amount: number, wishlistItemId?: string) => void;
  approveExpense: (entryId: string) => void;
  rejectExpense: (entryId: string, reason: string) => void;

  // 振替
  transferToSavings: (projectId: string, amount: number) => void;
  transferToSpending: (projectId: string, amount: number) => void;

  // ほしい物リスト
  addWishlistItem: (item: { projectId: string; title: string; price: number; priority: 1 | 2 | 3 | 4; memo?: string }) => void;
  updateWishlistItem: (id: string, updates: Partial<WishlistItem>) => void;
  deleteWishlistItem: (id: string) => void;

  // ヘルパー
  currentProject: Project | null;
  currentLedgerEntries: LedgerEntry[];
  currentWishlistItems: WishlistItem[];
  pendingExpenses: LedgerEntry[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── localStorage ヘルパー ───
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── 定期自動支給チェック ───
function processAutoAllowances(
  projects: Project[],
  ledgerEntries: LedgerEntry[],
): { updatedProjects: Project[]; newEntries: LedgerEntry[] } {
  const today = new Date();
  const currentMonth = currentMonthString();
  const todayDay = today.getDate();
  const updatedProjects = [...projects];
  const newEntries: LedgerEntry[] = [];

  for (let i = 0; i < updatedProjects.length; i++) {
    const proj = updatedProjects[i];
    const aa = proj.autoAllowance;
    if (!aa.enabled || aa.amount <= 0) continue;
    if (aa.lastProcessedMonth === currentMonth) continue;
    if (todayDay < aa.dayOfMonth) continue;

    // 自動支給を実行
    const currentBalance = proj.spendBalance + aa.amount;
    const entry: LedgerEntry = {
      id: generateId(),
      projectId: proj.id,
      date: todayString(),
      title: `${today.getMonth() + 1}がつの ていき おこづかい`,
      type: 'income',
      incomeAmount: aa.amount,
      expenseAmount: 0,
      balanceAfter: currentBalance,
      status: 'approved',
      createdAt: new Date().toISOString(),
    };
    newEntries.push(entry);

    updatedProjects[i] = {
      ...proj,
      spendBalance: currentBalance,
      autoAllowance: { ...aa, lastProcessedMonth: currentMonth },
      updatedAt: new Date().toISOString(),
    };
  }

  return { updatedProjects, newEntries };
}

// ─── Provider ───
export function AppProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() =>
    loadFromStorage<Project[]>('kodomo_projects', [])
  );
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(() =>
    loadFromStorage<LedgerEntry[]>('kodomo_ledger', [])
  );
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(() =>
    loadFromStorage<WishlistItem[]>('kodomo_wishlist', [])
  );
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(() =>
    loadFromStorage<string | null>('kodomo_current_project', null)
  );
  const [isAdminMode, setAdminMode] = useState(false);
  const [adminPin, setAdminPin] = useState<string>(() =>
    loadFromStorage<string>('kodomo_admin_pin', '1234')
  );

  // localStorage 永続化
  useEffect(() => saveToStorage('kodomo_projects', projects), [projects]);
  useEffect(() => saveToStorage('kodomo_ledger', ledgerEntries), [ledgerEntries]);
  useEffect(() => saveToStorage('kodomo_wishlist', wishlistItems), [wishlistItems]);
  useEffect(() => saveToStorage('kodomo_current_project', currentProjectId), [currentProjectId]);
  useEffect(() => saveToStorage('kodomo_admin_pin', adminPin), [adminPin]);

  // 初回マウント時に定期自動支給チェックと古いデータの消去
  useEffect(() => {
    // 2ヶ月前の日時を計算
    const thresholdDate = new Date();
    thresholdDate.setMonth(thresholdDate.getMonth() - 2);
    const thresholdMs = thresholdDate.getTime();

    // 2ヶ月以上経過したお小遣い帳データを消去
    let hasCleanedUp = false;
    const cleanedEntries = ledgerEntries.filter(entry => {
      if (new Date(entry.createdAt).getTime() < thresholdMs) {
        hasCleanedUp = true;
        return false;
      }
      return true;
    });

    const { updatedProjects, newEntries } = processAutoAllowances(projects, cleanedEntries);
    
    if (newEntries.length > 0 || hasCleanedUp) {
      if (newEntries.length > 0) setProjects(updatedProjects);
      setLedgerEntries([...cleanedEntries, ...newEntries]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // currentProjectId が null でプロジェクトが存在する場合、最初のプロジェクトを選択
  useEffect(() => {
    if (currentProjectId === null && projects.length > 0) {
      setCurrentProjectId(projects[0].id);
    }
  }, [currentProjectId, projects]);

  // ─── Helpers ───
  const currentProject = projects.find(p => p.id === currentProjectId) ?? null;

  const currentLedgerEntries = ledgerEntries
    .filter(e => e.projectId === currentProjectId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const currentWishlistItems = wishlistItems
    .filter(w => w.projectId === currentProjectId)
    .sort((a, b) => b.priority - a.priority);

  const pendingExpenses = ledgerEntries
    .filter(e => e.status === 'pending')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // ─── Project CRUD ───
  const addProject = useCallback((name: string) => {
    const newProject: Project = {
      id: generateId(),
      name,
      spendBalance: 0,
      savingsBalance: 0,
      autoAllowance: { enabled: false, amount: 100, dayOfMonth: 1 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects(prev => [...prev, newProject]);
    if (!currentProjectId) setCurrentProjectId(newProject.id);
  }, [currentProjectId]);

  const updateProjectName = useCallback((id: string, name: string) => {
    setProjects(prev =>
      prev.map(p => p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p)
    );
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setLedgerEntries(prev => prev.filter(e => e.projectId !== id));
    setWishlistItems(prev => prev.filter(w => w.projectId !== id));
    if (currentProjectId === id) setCurrentProjectId(null);
  }, [currentProjectId]);

  // ─── ふらっと支給 ───
  const distributeAllowance = useCallback((projectId: string, amount: number, reason: string) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          spendBalance: p.spendBalance + amount,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    setLedgerEntries(prev => {
      const proj = projects.find(p => p.id === projectId);
      const balanceAfter = (proj?.spendBalance ?? 0) + amount;
      const entry: LedgerEntry = {
        id: generateId(),
        projectId,
        date: todayString(),
        title: reason,
        type: 'income',
        incomeAmount: amount,
        expenseAmount: 0,
        balanceAfter,
        status: 'approved',
        createdAt: new Date().toISOString(),
      };
      return [...prev, entry];
    });
  }, [projects]);

  const updateAutoAllowance = useCallback((projectId: string, settings: Project['autoAllowance']) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? { ...p, autoAllowance: settings, updatedAt: new Date().toISOString() }
          : p
      )
    );
  }, []);

  // ─── 支出 ───
  const requestExpense = useCallback((projectId: string, title: string, amount: number, wishlistItemId?: string) => {
    // ステータス「しんせいちゅう」で仮登録 — 残高はまだ減らないが、表示用に現在の残高を記録
    setLedgerEntries(prev => {
      const proj = projects.find(p => p.id === projectId);
      const currentBalance = proj?.spendBalance ?? 0;
      const entry: LedgerEntry = {
        id: generateId(),
        projectId,
        date: todayString(),
        title,
        type: 'expense',
        incomeAmount: 0,
        expenseAmount: amount,
        balanceAfter: currentBalance, // 現在の残高を表示
        status: 'pending',
        createdAt: new Date().toISOString(),
        wishlistItemId, // 追加
      };
      return [...prev, entry];
    });
  }, [projects]);

  const approveExpense = useCallback((entryId: string) => {
    setLedgerEntries(prev => {
      const idx = prev.findIndex(e => e.id === entryId);
      if (idx === -1) return prev;
      const entry = prev[idx];
      if (entry.status !== 'pending') return prev;

      const updated = [...prev];
      updated[idx] = {
        ...entry,
        status: 'approved',
        date: todayString(),
        approvedAt: new Date().toISOString(),
      };
      return updated;
    });

    // 承認時に残高引き落とし（アトミック）とほしい物リスト削除
    setLedgerEntries(prevEntries => {
      const entry = prevEntries.find(e => e.id === entryId);
      if (!entry) return prevEntries;

      if (entry.wishlistItemId) {
        setWishlistItems(prevW => prevW.filter(w => w.id !== entry.wishlistItemId));
      }

      setProjects(prevProjects =>
        prevProjects.map(p => {
          if (p.id !== entry.projectId) return p;
          return {
            ...p,
            spendBalance: p.spendBalance - entry.expenseAmount,
            updatedAt: new Date().toISOString(),
          };
        })
      );

      // balanceAfter を再計算
      return prevEntries.map(e => {
        if (e.id !== entryId) return e;
        const proj = projects.find(pp => pp.id === e.projectId);
        return {
          ...e,
          balanceAfter: (proj?.spendBalance ?? 0) - e.expenseAmount,
          status: 'approved' as const,
        };
      });
    });
  }, [projects]);

  const rejectExpense = useCallback((entryId: string, reason: string) => {
    setLedgerEntries(prev =>
      prev.map(e =>
        e.id === entryId
          ? { ...e, status: 'rejected' as const, rejectionReason: reason }
          : e
      )
    );
  }, []);

  // ─── 振替 ───
  const transferToSavings = useCallback((projectId: string, amount: number) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? {
              ...p,
              spendBalance: p.spendBalance - amount,
              savingsBalance: p.savingsBalance + amount,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
    setLedgerEntries(prev => {
      const proj = projects.find(p => p.id === projectId);
      const balanceAfter = (proj?.spendBalance ?? 0) - amount;
      const entry: LedgerEntry = {
        id: generateId(),
        projectId,
        date: todayString(),
        title: 'ちょきんばこへ いれた',
        type: 'expense',
        incomeAmount: 0,
        expenseAmount: amount,
        balanceAfter,
        status: 'approved',
        createdAt: new Date().toISOString(),
      };
      return [...prev, entry];
    });
  }, [projects]);

  const transferToSpending = useCallback((projectId: string, amount: number) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? {
              ...p,
              spendBalance: p.spendBalance + amount,
              savingsBalance: p.savingsBalance - amount,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
    setLedgerEntries(prev => {
      const proj = projects.find(p => p.id === projectId);
      const balanceAfter = (proj?.spendBalance ?? 0) + amount;
      const entry: LedgerEntry = {
        id: generateId(),
        projectId,
        date: todayString(),
        title: 'ちょきんばこから だした',
        type: 'income',
        incomeAmount: amount,
        expenseAmount: 0,
        balanceAfter,
        status: 'approved',
        createdAt: new Date().toISOString(),
      };
      return [...prev, entry];
    });
  }, [projects]);

  // ─── ほしい物リスト ───
  const addWishlistItem = useCallback((item: {
    projectId: string; title: string; price: number; priority: 1 | 2 | 3 | 4; memo?: string;
  }) => {
    const newItem: WishlistItem = {
      id: generateId(),
      projectId: item.projectId,
      title: item.title,
      price: item.price,
      priority: item.priority,
      isTarget: false,
      isPurchased: false,
      memo: item.memo,
      createdAt: new Date().toISOString(),
    };
    setWishlistItems(prev => [...prev, newItem]);
  }, []);

  const updateWishlistItem = useCallback((id: string, updates: Partial<WishlistItem>) => {
    setWishlistItems(prev =>
      prev.map(w => (w.id === id ? { ...w, ...updates } : w))
    );
  }, []);

  const deleteWishlistItem = useCallback((id: string) => {
    setWishlistItems(prev => prev.filter(w => w.id !== id));
  }, []);

  // ─── Context Value ───
  const value: AppContextType = {
    projects,
    ledgerEntries,
    wishlistItems,
    currentProjectId,
    isAdminMode,
    adminPin,
    setCurrentProjectId,
    setAdminMode,
    setAdminPin,
    addProject,
    updateProjectName,
    deleteProject,
    distributeAllowance,
    updateAutoAllowance,
    requestExpense,
    approveExpense,
    rejectExpense,
    transferToSavings,
    transferToSpending,
    addWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,
    currentProject,
    currentLedgerEntries,
    currentWishlistItems,
    pendingExpenses,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── カスタムフック ───
export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
