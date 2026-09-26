// プロジェクト
export interface Project {
  id: string;
  name: string;
  spendBalance: number;   // つかう おかね（10の倍数）
  savingsBalance: number;  // ためる おかね（10の倍数）
  autoAllowance: {
    enabled: boolean;
    amount: number;        // 10の倍数
    dayOfMonth: number;    // 1〜28
    lastProcessedMonth?: string; // "YYYY-MM" — 二重処理防止用
  };
  createdAt: string;
  updatedAt: string;
}

// おこづかいちょう明細
export interface LedgerEntry {
  id: string;
  projectId: string;
  date: string;            // YYYY-MM-DD
  title: string;           // なにを かったか / はいった りゆう
  type: 'income' | 'expense';
  incomeAmount: number;    // はいった おかね（10の倍数、支出時は0）
  expenseAmount: number;   // つかった おかね（10の倍数、収入時は0）
  balanceAfter: number;    // のこった おかね
  status: 'approved' | 'pending' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  approvedAt?: string;
  wishlistItemId?: string;
}

// ほしい物リスト
export interface WishlistItem {
  id: string;
  projectId: string;
  title: string;
  price: number;           // ひつような おかね（10の倍数）
  priority: 1 | 2 | 3 | 4;    // 星の数
  isTarget: boolean;       // 現在の目標に設定されているか
  isPurchased: boolean;
  memo?: string;
  createdAt: string;
}
