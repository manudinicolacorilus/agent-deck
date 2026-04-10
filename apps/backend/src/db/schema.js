import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Resolve the SQLite database path. Defaults to data/agent-deck.db
 * relative to the backend package root.
 */
function resolveDbPath() {
  if (process.env.DB_PATH) return path.resolve(process.env.DB_PATH);
  return path.join(__dirname, '..', '..', 'data', 'agent-deck.db');
}

/**
 * Open (or create) the SQLite database and ensure all tables exist.
 * @returns {Database.Database}
 */
export function openDatabase() {
  const dbPath = resolveDbPath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS missions (
      id            TEXT PRIMARY KEY,
      prompt        TEXT NOT NULL,
      work_dir      TEXT NOT NULL,
      state         TEXT NOT NULL DEFAULT 'pending',
      branch        TEXT,
      review_cycle  INTEGER NOT NULL DEFAULT 0,
      error         TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS stages (
      id          TEXT PRIMARY KEY,
      mission_id  TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
      role        TEXT NOT NULL,
      action      TEXT,
      agent_id    TEXT,
      agent_name  TEXT,
      session_id  TEXT,
      exit_code   INTEGER,
      output      TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS agents (
      id                  TEXT PRIMARY KEY,
      name                TEXT NOT NULL,
      engine              TEXT NOT NULL,
      yolo                INTEGER NOT NULL DEFAULT 0,
      role                TEXT,
      skin_color          TEXT,
      hat                 TEXT,
      pet                 TEXT,
      current_session_id  TEXT,
      created_at          TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS messages (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      mission_id  TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
      agent_id    TEXT,
      role        TEXT,
      content     TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS agent_logs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id    TEXT NOT NULL,
      session_id  TEXT,
      signal      TEXT,
      payload     TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_stages_mission ON stages(mission_id);
    CREATE INDEX IF NOT EXISTS idx_messages_mission ON messages(mission_id);
    CREATE INDEX IF NOT EXISTS idx_agent_logs_agent ON agent_logs(agent_id);
  `);

  return db;
}

/**
 * Drop all tables and recreate them (for db:reset script).
 * @param {Database.Database} db
 */
export function resetDatabase(db) {
  db.exec(`
    DROP TABLE IF EXISTS agent_logs;
    DROP TABLE IF EXISTS messages;
    DROP TABLE IF EXISTS stages;
    DROP TABLE IF EXISTS missions;
    DROP TABLE IF EXISTS agents;
  `);
  // Re-run schema creation
  return openDatabase();
}

// When run directly: node server/db/schema.js
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const db = openDatabase();
  console.log(`Database created at: ${resolveDbPath()}`);
  console.log('Tables: missions, stages, agents, messages, agent_logs');
  db.close();
}

export default openDatabase;
