import { getDb } from './client';
import { runMigrations } from './migrate';

const DEFAULT_CATEGORIES = [
  { name: 'Salary', type: 'income', color: '#22c55e', icon: 'briefcase' },
  { name: 'Freelance', type: 'income', color: '#84cc16', icon: 'laptop' },
  { name: 'Investment', type: 'income', color: '#06b6d4', icon: 'trending-up' },
  { name: 'Food & Dining', type: 'expense', color: '#f97316', icon: 'utensils' },
  { name: 'Transport', type: 'expense', color: '#8b5cf6', icon: 'car' },
  { name: 'Housing', type: 'expense', color: '#ef4444', icon: 'home' },
  { name: 'Entertainment', type: 'expense', color: '#ec4899', icon: 'music' },
  { name: 'Healthcare', type: 'expense', color: '#14b8a6', icon: 'heart' },
  { name: 'Shopping', type: 'expense', color: '#f59e0b', icon: 'shopping-bag' },
  { name: 'Utilities', type: 'expense', color: '#6366f1', icon: 'zap' },
];

export function seedDefaultCategories(): void {
  const db = getDb();

  const existing = (db.prepare('SELECT COUNT(*) as cnt FROM categories WHERE is_default = 1').get() as any).cnt;
  if (existing > 0) return;

  const insert = db.prepare(
    `INSERT INTO categories (user_id, name, type, color, icon, is_default)
     VALUES (NULL, ?, ?, ?, ?, 1)`
  );

  const insertMany = db.transaction(() => {
    for (const cat of DEFAULT_CATEGORIES) {
      insert.run(cat.name, cat.type, cat.color, cat.icon);
    }
  });

  insertMany();
  console.log('Seeded default categories.');
}

if (require.main === module) {
  runMigrations();
  seedDefaultCategories();
  console.log('Seed complete.');
}
