import { getDb } from '../db/client';
import type { BudgetWithSpentDTO } from '../types/shared';
import type { CreateBudgetInput, UpdateBudgetInput } from '../schemas/budget.schema';

function rowToDTO(row: any, spent: number): BudgetWithSpentDTO {
  const remaining = row.amount - spent;
  const percentUsed = row.amount > 0 ? Math.round((spent / row.amount) * 100) : 0;
  return {
    id: row.id,
    user_id: row.user_id,
    category_id: row.category_id,
    month: row.month,
    amount: row.amount,
    created_at: row.created_at,
    updated_at: row.updated_at,
    category: {
      id: row.cat_id,
      user_id: row.cat_user_id,
      name: row.cat_name,
      type: row.cat_type,
      color: row.cat_color,
      icon: row.cat_icon,
      is_default: row.cat_is_default === 1,
    },
    spent,
    remaining,
    percentUsed,
  };
}

export function listBudgets(userId: number, month: string): BudgetWithSpentDTO[] {
  const db = getDb();

  const rows = db
    .prepare(
      `SELECT b.*,
              c.id as cat_id, c.user_id as cat_user_id, c.name as cat_name,
              c.type as cat_type, c.color as cat_color, c.icon as cat_icon, c.is_default as cat_is_default
       FROM budgets b
       JOIN categories c ON c.id = b.category_id
       WHERE b.user_id = ? AND b.month = ?
       ORDER BY c.name ASC`
    )
    .all(userId, month) as any[];

  return rows.map((row) => {
    const spent = (
      db
        .prepare(
          `SELECT COALESCE(SUM(amount), 0) as total
           FROM transactions
           WHERE user_id = ? AND category_id = ? AND type = 'expense'
             AND strftime('%Y-%m', date) = ?`
        )
        .get(userId, row.category_id, month) as any
    ).total;
    return rowToDTO(row, spent);
  });
}

export function createBudget(userId: number, input: CreateBudgetInput): BudgetWithSpentDTO {
  const db = getDb();

  const cat = db
    .prepare('SELECT id FROM categories WHERE id = ? AND (user_id IS NULL OR user_id = ?)')
    .get(input.category_id, userId);
  if (!cat) {
    throw Object.assign(new Error('Category not found'), { statusCode: 404, code: 'NOT_FOUND' });
  }

  try {
    db.prepare(
      `INSERT INTO budgets (user_id, category_id, month, amount) VALUES (?, ?, ?, ?)`
    ).run(userId, input.category_id, input.month, input.amount);
  } catch (err: any) {
    if (err.message?.includes('UNIQUE')) {
      throw Object.assign(
        new Error('Budget for this category and month already exists'),
        { statusCode: 409, code: 'BUDGET_EXISTS' }
      );
    }
    throw err;
  }

  const [budget] = listBudgets(userId, input.month).filter(
    (b) => b.category_id === input.category_id
  );
  return budget;
}

export function updateBudget(userId: number, id: number, input: UpdateBudgetInput): BudgetWithSpentDTO {
  const db = getDb();
  const existing = db
    .prepare('SELECT * FROM budgets WHERE id = ? AND user_id = ?')
    .get(id, userId) as any;

  if (!existing) {
    throw Object.assign(new Error('Budget not found'), { statusCode: 404, code: 'NOT_FOUND' });
  }

  const merged = { ...existing, ...input };
  db.prepare(
    `UPDATE budgets SET category_id = ?, month = ?, amount = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(merged.category_id, merged.month, merged.amount, id);

  const [updated] = listBudgets(userId, merged.month).filter((b) => b.id === id);
  return updated;
}

export function deleteBudget(userId: number, id: number): void {
  const db = getDb();
  const existing = db
    .prepare('SELECT id FROM budgets WHERE id = ? AND user_id = ?')
    .get(id, userId);

  if (!existing) {
    throw Object.assign(new Error('Budget not found'), { statusCode: 404, code: 'NOT_FOUND' });
  }

  db.prepare('DELETE FROM budgets WHERE id = ?').run(id);
}
