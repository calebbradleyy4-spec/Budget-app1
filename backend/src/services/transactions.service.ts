import { getDb } from '../db/client';
import type { TransactionDTO, TransactionListResponse } from '../types/shared';
import type { CreateTransactionInput, UpdateTransactionInput } from '../schemas/transaction.schema';

interface ListOptions {
  page?: number;
  limit?: number;
  type?: 'income' | 'expense';
  category_id?: number;
  start_date?: string;
  end_date?: string;
}

function rowToDTO(row: any): TransactionDTO {
  const { cat_id, cat_user_id, cat_name, cat_type, cat_color, cat_icon, cat_is_default, ...base } = row;
  return {
    ...base,
    recurring_id: base.recurring_id ?? null,
    category: cat_id
      ? {
          id: cat_id,
          user_id: cat_user_id,
          name: cat_name,
          type: cat_type,
          color: cat_color,
          icon: cat_icon,
          is_default: cat_is_default === 1,
        }
      : undefined,
  };
}

export function listTransactions(userId: number, opts: ListOptions): TransactionListResponse {
  const db = getDb();
  const page = Math.max(1, opts.page || 1);
  const limit = Math.min(100, Math.max(1, opts.limit || 20));
  const offset = (page - 1) * limit;

  const conditions = ['t.user_id = ?'];
  const params: any[] = [userId];

  if (opts.type) { conditions.push('t.type = ?'); params.push(opts.type); }
  if (opts.category_id) { conditions.push('t.category_id = ?'); params.push(opts.category_id); }
  if (opts.start_date) { conditions.push('t.date >= ?'); params.push(opts.start_date); }
  if (opts.end_date) { conditions.push('t.date <= ?'); params.push(opts.end_date); }

  const where = conditions.join(' AND ');

  const total = (db.prepare(`SELECT COUNT(*) as cnt FROM transactions t WHERE ${where}`).get(...params) as any).cnt;

  const rows = db
    .prepare(
      `SELECT t.*,
              c.id as cat_id, c.user_id as cat_user_id, c.name as cat_name,
              c.type as cat_type, c.color as cat_color, c.icon as cat_icon, c.is_default as cat_is_default
       FROM transactions t
       LEFT JOIN categories c ON c.id = t.category_id
       WHERE ${where}
       ORDER BY t.date DESC, t.created_at DESC
       LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset) as any[];

  return {
    data: rows.map(rowToDTO),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export function getTransaction(userId: number, id: number): TransactionDTO {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT t.*,
              c.id as cat_id, c.user_id as cat_user_id, c.name as cat_name,
              c.type as cat_type, c.color as cat_color, c.icon as cat_icon, c.is_default as cat_is_default
       FROM transactions t
       LEFT JOIN categories c ON c.id = t.category_id
       WHERE t.id = ? AND t.user_id = ?`
    )
    .get(id, userId) as any;

  if (!row) {
    throw Object.assign(new Error('Transaction not found'), { statusCode: 404, code: 'NOT_FOUND' });
  }
  return rowToDTO(row);
}

export function createTransaction(userId: number, input: CreateTransactionInput): TransactionDTO {
  const db = getDb();

  // Verify category belongs to user or is default
  const cat = db
    .prepare('SELECT id FROM categories WHERE id = ? AND (user_id IS NULL OR user_id = ?)')
    .get(input.category_id, userId);
  if (!cat) {
    throw Object.assign(new Error('Category not found'), { statusCode: 404, code: 'NOT_FOUND' });
  }

  const result = db
    .prepare(
      `INSERT INTO transactions (user_id, category_id, type, amount, description, date, recurring_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      userId,
      input.category_id,
      input.type,
      input.amount,
      input.description ?? '',
      input.date,
      input.recurring_id ?? null
    );

  return getTransaction(userId, result.lastInsertRowid as number);
}

export function updateTransaction(userId: number, id: number, input: UpdateTransactionInput): TransactionDTO {
  const db = getDb();
  const existing = db
    .prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?')
    .get(id, userId) as any;

  if (!existing) {
    throw Object.assign(new Error('Transaction not found'), { statusCode: 404, code: 'NOT_FOUND' });
  }

  const merged = { ...existing, ...input };

  db.prepare(
    `UPDATE transactions
     SET category_id = ?, type = ?, amount = ?, description = ?, date = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(merged.category_id, merged.type, merged.amount, merged.description, merged.date, id);

  return getTransaction(userId, id);
}

export function deleteTransaction(userId: number, id: number): void {
  const db = getDb();
  const existing = db
    .prepare('SELECT id FROM transactions WHERE id = ? AND user_id = ?')
    .get(id, userId);

  if (!existing) {
    throw Object.assign(new Error('Transaction not found'), { statusCode: 404, code: 'NOT_FOUND' });
  }

  db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
}
