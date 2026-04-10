/**
 * One-time migration: import agents from data/agents.json into SQLite.
 * Safe to run multiple times — skips agents that already exist.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import openDatabase from './schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_FILE = path.join(__dirname, '..', '..', 'data', 'agents.json');

const db = openDatabase();

let agents;
try {
  agents = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
} catch {
  console.log('No agents.json found or empty — nothing to migrate.');
  db.close();
  process.exit(0);
}

const insert = db.prepare(`
  INSERT OR IGNORE INTO agents (id, name, engine, yolo, role, skin_color, hat, pet, current_session_id, created_at)
  VALUES (@id, @name, @engine, @yolo, @role, @skinColor, @hat, @pet, NULL, @createdAt)
`);

const tx = db.transaction((list) => {
  let count = 0;
  for (const a of list) {
    const result = insert.run({
      id: a.id,
      name: a.name,
      engine: a.engine,
      yolo: a.yolo ? 1 : 0,
      role: a.role || null,
      skinColor: a.skinColor || null,
      hat: a.hat || null,
      pet: a.pet || null,
      createdAt: a.createdAt,
    });
    if (result.changes > 0) count++;
  }
  return count;
});

const migrated = tx(agents);
console.log(`Migrated ${migrated} agents from JSON to SQLite.`);
db.close();
