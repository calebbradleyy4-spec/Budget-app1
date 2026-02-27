import { getDb } from '../db/client';
import type { CategoryDTO } from '../types/shared';
import type { CreateCategoryInput, UpdateCategoryInput } from '../schemas/category.schema';

function rowToDTO(row: any): CategoryDTO {
  return { ...row, is_default: row.is_default === 1 };
}

export function listCategories(userId: number): CategoryDTO[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT * FROM categories WHERE user_id IS NULL OR user_id = ? ORDER BY is_default DESC, name ASC`
    )
    .all(userId) as any[];
  return rows.map(rowToDTO);
}

export function createCategory(userId: number, input: CreateCategoryInput): CategoryDTO {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO categories (user_id, name, type, color, icon, is_default)
       VALUES (?, ?, ?, ?, ?, 0)`
    )
    .run(userId, input.name, input.type, input.color, input.icon);

  return rowToDTO(
    db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid)
  );
}

export function updateCategory(userId: number, id: number, input: UpdateCategoryInput): CategoryDTO {
  const db = getDb();
  const existing = db
    .prepare('SELECT * FROM categories WHERE id = ? AND user_id = ?')
    .get(id, userId) as any;

  if (!existing) {
    throw Object.assign(new Error('Category not found'), { statusCode: 404, code: 'NOT_FOUND' });
  }

  const updated = { ...existing, ...input };
  db.prepare(
    `UPDATE categories SET name = ?, type = ?, color = ?, icon = ? WHERE id = ?`
  ).run(updated.name, updated.type, updated.color, updated.icon, id);

  return rowToDTO(db.prepare('SELECT * FROM categories WHERE id = ?').get(id));
}

export function deleteCategory(userId: number, id: number): void {
  const db = getDb();
  const existing = db
    .prepare('SELECT * FROM categories WHERE id = ? AND user_id = ?')
    .get(id, userId) as any;

  if (!existing) {
    throw Object.assign(new Error('Category not found'), { statusCode: 404, code: 'NOT_FOUND' });
  }

  // Check if used by transactions
  const used = db
    .prepare('SELECT id FROM transactions WHERE category_id = ? AND user_id = ? LIMIT 1')
    .get(id, userId);

  if (used) {
    throw Object.assign(
      new Error('Cannot delete category with existing transactions'),
      { statusCode: 409, code: 'CATEGORY_IN_USE' }
    );
  }

  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
}
