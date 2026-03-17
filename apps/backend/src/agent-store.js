import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'agents.json');

function readFile() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeFile(agents) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(agents, null, 2), 'utf8');
  fs.renameSync(tmp, DATA_FILE);
}

class AgentStore {
  #agents = [];

  constructor() {
    this.#agents = readFile();
    this.#cleanupStaleSessionRefs();
  }

  getAll() {
    return this.#agents;
  }

  get(id) {
    return this.#agents.find((a) => a.id === id) || null;
  }

  create({ name, engine, yolo = false, role = null, skinColor = null, hat = null, pet = null }) {
    const agent = {
      id: uuidv4(),
      name,
      engine,
      yolo: Boolean(yolo),
      role: role || null,
      skinColor: skinColor || null,
      hat: hat || null,
      pet: pet || null,
      createdAt: new Date().toISOString(),
      currentSessionId: null,
    };
    this.#agents.push(agent);
    this.#save();
    return agent;
  }

  update(id, fields) {
    const agent = this.get(id);
    if (!agent) return null;
    const allowed = ['name', 'engine', 'yolo', 'role', 'skinColor', 'hat', 'pet'];
    for (const key of allowed) {
      if (key in fields) agent[key] = fields[key];
    }
    this.#save();
    return agent;
  }

  /**
   * Find an idle agent with the given role.
   * Falls back to any idle agent if no role-matched agent is available.
   * @param {string} role
   * @returns {object|null}
   */
  findIdleByRole(role) {
    return (
      this.#agents.find((a) => a.role === role && !a.currentSessionId) ||
      this.#agents.find((a) => !a.currentSessionId) ||
      null
    );
  }

  /**
   * Find all idle agents with the given role.
   * @param {string} role
   * @returns {object[]}
   */
  findAllIdleByRole(role) {
    return this.#agents.filter((a) => a.role === role && !a.currentSessionId);
  }

  delete(id) {
    const agent = this.get(id);
    if (!agent) return false;
    if (agent.currentSessionId) {
      throw new Error('Cannot delete agent with an active session. Kill the session first.');
    }
    this.#agents = this.#agents.filter((a) => a.id !== id);
    this.#save();
    return true;
  }

  setCurrentSession(agentId, sessionId) {
    const agent = this.get(agentId);
    if (!agent) return null;
    agent.currentSessionId = sessionId;
    this.#save();
    return agent;
  }

  clearCurrentSession(agentId) {
    const agent = this.get(agentId);
    if (!agent) return null;
    agent.currentSessionId = null;
    this.#save();
    return agent;
  }

  #cleanupStaleSessionRefs() {
    let dirty = false;
    for (const agent of this.#agents) {
      if (agent.currentSessionId) {
        agent.currentSessionId = null;
        dirty = true;
      }
    }
    if (dirty) this.#save();
  }

  #save() {
    writeFile(this.#agents);
  }
}

export default AgentStore;
