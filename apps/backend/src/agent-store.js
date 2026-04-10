import { v4 as uuidv4 } from 'uuid';

/**
 * Manages persistent agents using SQLite (better-sqlite3).
 * All reads/writes are synchronous.
 */
class AgentStore {
  #db;
  #stmts;

  /**
   * @param {import('better-sqlite3').Database} db
   */
  constructor(db) {
    this.#db = db;
    this.#stmts = {
      getAll: db.prepare('SELECT * FROM agents ORDER BY created_at ASC'),
      getById: db.prepare('SELECT * FROM agents WHERE id = ?'),
      insert: db.prepare(`
        INSERT INTO agents (id, name, engine, yolo, role, skin_color, hat, pet, current_session_id, created_at)
        VALUES (@id, @name, @engine, @yolo, @role, @skinColor, @hat, @pet, @currentSessionId, @createdAt)
      `),
      update: db.prepare(`
        UPDATE agents SET name = @name, engine = @engine, yolo = @yolo,
          role = @role, skin_color = @skinColor, hat = @hat, pet = @pet
        WHERE id = @id
      `),
      delete: db.prepare('DELETE FROM agents WHERE id = ?'),
      setSession: db.prepare('UPDATE agents SET current_session_id = ? WHERE id = ?'),
      clearSession: db.prepare('UPDATE agents SET current_session_id = NULL WHERE id = ?'),
      clearAllSessions: db.prepare('UPDATE agents SET current_session_id = NULL WHERE current_session_id IS NOT NULL'),
      findIdleByRole: db.prepare('SELECT * FROM agents WHERE role = ? AND current_session_id IS NULL LIMIT 1'),
      findAnyIdle: db.prepare('SELECT * FROM agents WHERE current_session_id IS NULL LIMIT 1'),
      findAllIdleByRole: db.prepare('SELECT * FROM agents WHERE role = ? AND current_session_id IS NULL'),
    };
    // On startup, clear stale session references (sessions don't survive restart)
    this.#stmts.clearAllSessions.run();
  }

  /** Convert a DB row to the public agent shape. */
  static #toAgent(row) {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      engine: row.engine,
      yolo: Boolean(row.yolo),
      role: row.role || null,
      skinColor: row.skin_color || null,
      hat: row.hat || null,
      pet: row.pet || null,
      createdAt: row.created_at,
      currentSessionId: row.current_session_id || null,
    };
  }

  getAll() {
    return this.#stmts.getAll.all().map(AgentStore.#toAgent);
  }

  get(id) {
    return AgentStore.#toAgent(this.#stmts.getById.get(id));
  }

  create({ name, engine, yolo = false, role = null, skinColor = null, hat = null, pet = null }) {
    const agent = {
      id: uuidv4(),
      name,
      engine,
      yolo: yolo ? 1 : 0,
      role: role || null,
      skinColor: skinColor || null,
      hat: hat || null,
      pet: pet || null,
      currentSessionId: null,
      createdAt: new Date().toISOString(),
    };
    this.#stmts.insert.run(agent);
    return AgentStore.#toAgent(this.#stmts.getById.get(agent.id));
  }

  update(id, fields) {
    const existing = this.#stmts.getById.get(id);
    if (!existing) return null;
    const allowed = ['name', 'engine', 'yolo', 'role', 'skinColor', 'hat', 'pet'];
    const merged = {
      id,
      name: existing.name,
      engine: existing.engine,
      yolo: existing.yolo,
      role: existing.role,
      skinColor: existing.skin_color,
      hat: existing.hat,
      pet: existing.pet,
    };
    for (const key of allowed) {
      if (key in fields) {
        merged[key] = key === 'yolo' ? (fields[key] ? 1 : 0) : fields[key];
      }
    }
    this.#stmts.update.run(merged);
    return AgentStore.#toAgent(this.#stmts.getById.get(id));
  }

  /**
   * Find an idle agent with the given role.
   * Falls back to any idle agent if no role-matched agent is available.
   */
  findIdleByRole(role) {
    return (
      AgentStore.#toAgent(this.#stmts.findIdleByRole.get(role)) ||
      AgentStore.#toAgent(this.#stmts.findAnyIdle.get()) ||
      null
    );
  }

  findAllIdleByRole(role) {
    return this.#stmts.findAllIdleByRole.all(role).map(AgentStore.#toAgent);
  }

  delete(id) {
    const agent = this.#stmts.getById.get(id);
    if (!agent) return false;
    if (agent.current_session_id) {
      throw new Error('Cannot delete agent with an active session. Kill the session first.');
    }
    this.#stmts.delete.run(id);
    return true;
  }

  setCurrentSession(agentId, sessionId) {
    const agent = this.#stmts.getById.get(agentId);
    if (!agent) return null;
    this.#stmts.setSession.run(sessionId, agentId);
    return AgentStore.#toAgent(this.#stmts.getById.get(agentId));
  }

  clearCurrentSession(agentId) {
    const agent = this.#stmts.getById.get(agentId);
    if (!agent) return null;
    this.#stmts.clearSession.run(agentId);
    return AgentStore.#toAgent(this.#stmts.getById.get(agentId));
  }
}

export default AgentStore;
