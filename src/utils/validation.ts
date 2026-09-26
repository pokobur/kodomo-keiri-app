/**
 * 金額バリデーション: 10ふらっと単位の正の整数であること
 */
export function isValidAmount(amount: number): boolean {
  return Number.isInteger(amount) && amount > 0 && amount % 10 === 0;
}

/**
 * 残高が十分かチェック
 */
export function hasSufficientBalance(balance: number, amount: number): boolean {
  return balance >= amount;
}

/**
 * 日付を "YYYY/MM/DD" 形式にフォーマット
 */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
}

/**
 * 日付を "○がつ○にち" 形式にフォーマット（こども向け）
 */
export function formatDateKids(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}がつ${d.getDate()}にち`;
}

/**
 * 今日の日付を YYYY-MM-DD 形式で取得
 */
export function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * 現在の年月を "YYYY-MM" 形式で取得
 */
export function currentMonthString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * 簡易ユニークID生成（UUIDライブラリ不要）
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * 金額を "○○○ ふらっと" 形式にフォーマット
 */
export function formatFlat(amount: number): string {
  return `${amount.toLocaleString()} ふらっと`;
}
