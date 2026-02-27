import { getDb } from '../db/client';
import type { RecurringRuleDTO } from '../types/shared';
import type { CreateRecurringInput, UpdateRecurringInput } from '../schemas/recurring.schema';

function rowToDTO(row: any): RecurringRuleDTO {
  return {
    id: row.id,
    user_id: row.user_id,
    category_id: row.category_id,
    type: row.type,
    amount: row.amount,
    description: row.description,
    frequency: row.frequency,
    start_date: row.start_date,
    end_date: row.end_date ?? null,
    last_run_date: row.last_run_date ?? null,
    is_active: row.is_active === 1,
    created_at: row.created_at,
    updated_at: row.updated_at,
    category: row.cat_id
      ? {
          id: row.cat_id,
          user_id: row.cat_user_id ?? null,
          name: row.cat_name,
          type: row.cat_type,
          color: row.cat_color,
          icon: row.cat_icon,
          is_default: row.cat_is_default === 1,
        }
      : undefined,
  };
}

const JOIN = `
  SELECT r.*,
         c.id as cat_id, c.user_id as cat_user_id, c.name as cat_name,
         c.type as cat_type, c.color as cat_color, c.icon as cat_icon, c.is_default as cat_is_default
  FROM recurring_rules r
  LEFT JOIN categories c ON c.id = r.category_id
`;

export function listRecurring(userId: number): RecurringRuleDTO[] {
  const db = getDb();
  const rows = db.prepare(`${JOIN} WHERE r.user_id = ? ORDER BY r.created_at DESC`).all(userId) as any[];
  return rows.map(rowToDTO);
}

export function getRecurring(userId: number, id: number): RecurringRuleDTO {
  const db = getDb();
  const row = db.prepare(`${JOIN} WHERE r.id = ? AND r.user_id = ?`).get(id, userId) as any;
  if (!row) throw Object.assign(new Error('Recurring rule not found'), { statusCode: 404, code: 'NOT_FOUND' });
  return rowToDTO(row);
}

export function createRecurring(userId: number, input: CreateRecurringInput): RecurringRuleDTO {
  const db = getDb();

  const cat = db
    .prepare('SELECT id FROM categories WHERE id = ? AND (user_id IS NULL OR user_id = ?)')
    .get(input.category_id, userId);
  if (!cat) throw Object.assign(new Error('Category not found'), { statusCode: 404, code: 'NOT_FOUND' });

  const result = db
    .prepare(
      `INSERT INTO recurring_rules (user_id, category_id, type, amount, description, frequency, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      userId,
      input.category_id,
      input.type,
      input.amount,
      input.description ?? '',
      input.frequency,
      input.start_date,
      input.end_date ?? null
    );

  return getRecurring(userId, result.lastInsertRowid as number);
}

export function updateRecurring(userId: number, id: number, input: UpdateRecurringInput): RecurringRuleDTO {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM recurring_rules WHERE id = ? AND user_id = ?').get(id, userId) as any;
  if (!existing) throw Object.assign(new Error('Recurring rule not found'), { statusCode: 404, code: 'NOT_FOUND' });

  const merged = { ...existing, ...input };
  db.prepare(
    `UPDATE recurring_rules
     SET category_id=?, type=?, amount=?, description=?, frequency=?, start_date=?, end_date=?,
         is_active=?, updated_at=datetime('now')
     WHERE id=?`
  ).run(
    merged.category_id, merged.type, merged.amount, merged.description,
    merged.frequency, merged.start_date, merged.end_date ?? null,
    merged.is_active ? 1 : 0, id
  );

  return getRecurring(userId, id);
}

export function deleteRecurring(userId: number, id: number): void {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM recurring_rules WHERE id = ? AND user_id = ?').get(id, userId);
  if (!existing) throw Object.assign(new Error('Recurring rule not found'), { statusCode: 404, code: 'NOT_FOUND' });
  db.prepare('DELETE FROM recurring_rules WHERE id = ?').run(id);
}

/** Called by the cron job. Creates transactions for due rules. */
export function processRecurringRules(): void {
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);

  const rules = db
    .prepare(
      `SELECT * FROM recurring_rules
       WHERE is_active = 1
         AND start_date <= ?
         AND (end_date IS NULL OR end_date >= ?)
         AND (last_run_date IS NULL OR last_run_date < ?)`
    )
    .all(today, today, today) as any[];

  for (const rule of rules) {
    const shouldRun = isRuleDue(rule, today);
    if (!shouldRun) continue;

    db.prepare(
      `INSERT INTO transactions (user_id, category_id, type, amount, description, date, recurring_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(rule.user_id, rule.category_id, rule.type, rule.amount, rule.description, today, rule.id);

    db.prepare(
      `UPDATE recurring_rules SET last_run_date = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(today, rule.id);
  }
}

function isRuleDue(rule: any, today: string): boolean {
  if (!rule.last_run_date) return true;

  const last = new Date(rule.last_run_date);
  const now = new Date(today);

  switch (rule.frequency) {
    case 'daily':
      return now > last;
    case 'weekly': {
      const diff = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 7;
    }
    case 'monthly': {
      const sameMonth =
        last.getFullYear() === now.getFullYear() && last.getMonth() === now.getMonth();
      return !sameMonth;
    }
    default:
      return false;
  }
}
