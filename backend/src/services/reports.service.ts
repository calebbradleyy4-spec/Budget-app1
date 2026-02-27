import { getDb } from '../db/client';
import type { CategorySpendDTO, MonthlyTrendDTO, MonthlySummaryDTO } from '../types/shared';

export function getSpendingByCategory(
  userId: number,
  month: string
): CategorySpendDTO[] {
  const db = getDb();

  const rows = db
    .prepare(
      `SELECT c.id as category_id, c.name as category_name, c.color as category_color,
              c.icon as category_icon, COALESCE(SUM(t.amount), 0) as total
       FROM categories c
       LEFT JOIN transactions t ON t.category_id = c.id
         AND t.user_id = ? AND t.type = 'expense'
         AND strftime('%Y-%m', t.date) = ?
       WHERE (c.user_id IS NULL OR c.user_id = ?) AND c.type = 'expense'
       GROUP BY c.id
       HAVING total > 0
       ORDER BY total DESC`
    )
    .all(userId, month, userId) as any[];

  const grandTotal = rows.reduce((sum, r) => sum + r.total, 0);

  return rows.map((r) => ({
    category_id: r.category_id,
    category_name: r.category_name,
    category_color: r.category_color,
    category_icon: r.category_icon,
    total: r.total,
    percentage: grandTotal > 0 ? Math.round((r.total / grandTotal) * 100) : 0,
  }));
}

export function getMonthlyTrend(userId: number, months: number = 6): MonthlyTrendDTO[] {
  const db = getDb();

  const rows = db
    .prepare(
      `SELECT strftime('%Y-%m', date) as month,
              SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
              SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
       FROM transactions
       WHERE user_id = ?
         AND date >= date('now', '-' || ? || ' months', 'start of month')
       GROUP BY month
       ORDER BY month ASC`
    )
    .all(userId, months) as any[];

  return rows.map((r) => ({
    month: r.month,
    income: r.income,
    expense: r.expense,
    balance: r.income - r.expense,
  }));
}

export function getMonthlySummary(userId: number, month: string): MonthlySummaryDTO {
  const db = getDb();

  const row = db
    .prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as totalIncome,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as totalExpense,
         COUNT(*) as transactionCount
       FROM transactions
       WHERE user_id = ? AND strftime('%Y-%m', date) = ?`
    )
    .get(userId, month) as any;

  return {
    month,
    totalIncome: row.totalIncome,
    totalExpense: row.totalExpense,
    balance: row.totalIncome - row.totalExpense,
    transactionCount: row.transactionCount,
  };
}
