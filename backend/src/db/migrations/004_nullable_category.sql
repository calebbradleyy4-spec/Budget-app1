PRAGMA foreign_keys = OFF;

CREATE TABLE transactions_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  amount REAL NOT NULL CHECK(amount > 0),
  description TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL,
  recurring_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO transactions_new SELECT * FROM transactions;

DROP TABLE transactions;

ALTER TABLE transactions_new RENAME TO transactions;

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);

PRAGMA foreign_keys = ON;
