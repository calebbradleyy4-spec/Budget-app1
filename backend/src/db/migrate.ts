import fs from 'fs';
import path from 'path';
import { getDb } from './client';

export function runMigrations(): void {
  const db = getDb();
  const migrationsDir = path.join(__dirname, 'migrations');

  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL UNIQUE,
      ran_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const already = db
      .prepare('SELECT id FROM _migrations WHERE filename = ?')
      .get(file);

    if (!already) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      // Split and run statements individually to handle SQLite limitations
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const stmt of statements) {
        // SQLite doesn't support IF NOT EXISTS on ALTER TABLE column add in older versions
        // Catch and ignore "duplicate column" errors
        try {
          db.exec(stmt + ';');
        } catch (err: any) {
          if (!err.message?.includes('duplicate column')) {
            throw err;
          }
        }
      }

      db.prepare('INSERT INTO _migrations (filename) VALUES (?)').run(file);
      console.log(`Ran migration: ${file}`);
    }
  }
}

if (require.main === module) {
  runMigrations();
  console.log('All migrations complete.');
}
