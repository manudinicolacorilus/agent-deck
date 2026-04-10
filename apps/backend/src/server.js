import http from 'node:http';
import express from 'express';
import cors from 'cors';
import config from './config.js';
import SessionManager from './session-manager.js';
import AgentStore from './agent-store.js';
import WorkflowManager from './workflow-manager.js';
import setupWebSocket from './ws-handler.js';
import { listDirectories, getDriveRoots } from './browse-handler.js';
import { API } from '@agent-deck/shared';
import openDatabase from './db/schema.js';
import WorkflowStore from './workflow-store.js';

/**
 * Create a fresh SessionManager instance (useful for testing).
 */
export function createSessionManager() {
  return new SessionManager();
}

/**
 * Build and return the Express application.
 *
 * @param {SessionManager} sessionManager
 * @param {AgentStore} agentStore
 * @param {WorkflowManager} workflowManager
 * @returns {express.Express}
 */
function buildApp(sessionManager, agentStore, workflowManager) {
  const app = express();

  app.use(cors({ origin: config.CORS_ORIGINS }));
  app.use(express.json());

  // --- Health ----------------------------------------------------------
  app.get(API.HEALTH, (_req, res) => {
    res.json({
      status: 'ok',
      sessions: sessionManager.size,
      uptime: process.uptime(),
    });
  });

  // --- List sessions ---------------------------------------------------
  app.get(API.SESSIONS, (_req, res) => {
    res.json(sessionManager.getAllSessions());
  });

  // --- Create session --------------------------------------------------
  app.post(API.SESSIONS, (req, res) => {
    const { workDir, prompt, label, engine, yolo } = req.body;
    try {
      const session = sessionManager.createSession({
        workDir,
        prompt,
        label,
        engine,
        options: { yolo: Boolean(yolo) },
      });
      res.status(201).json(session);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- Kill session ----------------------------------------------------
  app.delete('/api/sessions/:id/kill', (req, res) => {
    const result = sessionManager.remove(req.params.id);
    if (result.removed) {
      res.json({ status: 'killed', id: req.params.id });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  });

  // --- Close session (kill if running + full removal) -----------------
  app.delete('/api/sessions/:id/close', (req, res) => {
    const result = sessionManager.remove(req.params.id);
    if (result.removed) {
      res.json({ removed: true, wasRunning: result.wasRunning });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  });

  // --- Browse directories ----------------------------------------------
  app.get('/api/browse', async (req, res) => {
    try {
      const result = await listDirectories(req.query.path);
      res.json(result);
    } catch (err) {
      if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
        res.status(400).json({ error: 'Directory not found' });
      } else if (err.code === 'EINVAL') {
        res.status(400).json({ error: err.message });
      } else {
        res.status(400).json({ error: 'Cannot access directory' });
      }
    }
  });

  app.get('/api/browse/roots', async (_req, res) => {
    try {
      const result = await getDriveRoots();
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to list drive roots' });
    }
  });

  // --- Available engines -----------------------------------------------
  app.get('/api/engines', (_req, res) => {
    const engines = Object.entries(config.ENGINES).map(([id, eng]) => ({
      id,
      label: eng.label,
    }));
    res.json({ engines });
  });

  // --- Persistent Agents ------------------------------------------------
  app.get(API.AGENTS, (_req, res) => {
    res.json(agentStore.getAll());
  });

  app.post(API.AGENTS, (req, res) => {
    const { name, engine, yolo, role } = req.body;
    if (!name || !engine) {
      return res.status(400).json({ error: 'name and engine are required' });
    }
    try {
      const agent = agentStore.create({ name, engine, yolo, role });
      res.status(201).json(agent);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/agents/:id', (req, res) => {
    const agent = agentStore.update(req.params.id, req.body);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    res.json(agent);
  });

  app.delete('/api/agents/:id', (req, res) => {
    try {
      const deleted = agentStore.delete(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Agent not found' });
      res.json({ deleted: true });
    } catch (err) {
      res.status(409).json({ error: err.message });
    }
  });

  app.post('/api/agents/:id/assign', (req, res) => {
    const agent = agentStore.get(req.params.id);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    if (agent.currentSessionId) {
      return res.status(409).json({ error: 'Agent already has an active session' });
    }

    const { prompt, workDir } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt is required' });
    if (!workDir) return res.status(400).json({ error: 'workDir is required' });

    try {
      const session = sessionManager.createSession({
        workDir,
        prompt,
        label: agent.name,
        engine: agent.engine,
        options: { yolo: agent.yolo },
        agentId: agent.id,
      });
      agentStore.setCurrentSession(agent.id, session.id);
      res.status(201).json({ agent: agentStore.get(agent.id), session });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- Workflows --------------------------------------------------------
  app.get(API.WORKFLOWS, (_req, res) => {
    res.json(workflowManager.getAll());
  });

  app.post(API.WORKFLOWS, (req, res) => {
    const { prompt, workDir } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }
    try {
      const workflow = workflowManager.start({ prompt, workDir: workDir || '.' });
      res.status(201).json(workflow);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/workflows/:id', (req, res) => {
    const wf = workflowManager.get(req.params.id);
    if (!wf) return res.status(404).json({ error: 'Workflow not found' });
    res.json(wf);
  });

  app.delete('/api/workflows/:id', (req, res) => {
    const cancelled = workflowManager.cancel(req.params.id);
    if (!cancelled) return res.status(404).json({ error: 'Workflow not found' });
    res.json({ cancelled: true });
  });

  // --- Workflow control: pause / resume / abort / resolve ---------------
  app.post('/api/workflows/:id/pause', (req, res) => {
    const result = workflowManager.pause(req.params.id);
    if (!result) return res.status(404).json({ error: 'Workflow not found or not pausable' });
    res.json(result);
  });

  app.post('/api/workflows/:id/resume', (req, res) => {
    const result = workflowManager.resume(req.params.id);
    if (!result) return res.status(404).json({ error: 'Workflow not found or not paused' });
    res.json(result);
  });

  app.post('/api/workflows/:id/abort', (req, res) => {
    const result = workflowManager.abort(req.params.id);
    if (!result) return res.status(404).json({ error: 'Workflow not found or already finished' });
    res.json(result);
  });

  // --- Workflow history (persisted in SQLite) ---------------------------
  app.get('/api/workflows/history', (_req, res) => {
    const limit = parseInt(_req.query.limit, 10) || 10;
    res.json(workflowManager.getHistory(limit));
  });

  app.post('/api/workflows/:id/resolve', (req, res) => {
    const { action, message } = req.body;
    if (!action || !['instruct', 'reassign', 'skip'].includes(action)) {
      return res.status(400).json({ error: 'action must be instruct, reassign, or skip' });
    }
    const result = workflowManager.resolve(req.params.id, { action, message });
    if (!result) return res.status(404).json({ error: 'Workflow not found or not stuck/paused' });
    res.json(result);
  });

  return app;
}

/**
 * Start the HTTP + WebSocket server.
 *
 * @param {SessionManager} [sessionManager]  Optional — a new one is created if omitted.
 * @returns {Promise<{ server: http.Server, sessionManager: SessionManager, app: express.Express }>}
 */
export function startServer(sessionManager, agentStore) {
  sessionManager = sessionManager || createSessionManager();
  let db;
  if (!agentStore) {
    db = openDatabase();
    agentStore = new AgentStore(db);
  }
  const workflowStore = db ? new WorkflowStore(db) : null;
  const workflowManager = new WorkflowManager(sessionManager, agentStore, workflowStore);
  const app = buildApp(sessionManager, agentStore, workflowManager);
  const server = http.createServer(app);

  // When a session exits, clear the agent's currentSessionId
  sessionManager.on('exit', ({ sessionId }) => {
    for (const agent of agentStore.getAll()) {
      if (agent.currentSessionId === sessionId) {
        agentStore.clearCurrentSession(agent.id);
        break;
      }
    }
  });

  setupWebSocket(server, sessionManager, workflowManager);

  return new Promise((resolve) => {
    server.listen(config.PORT, () => {
      console.log(`Backend listening on http://localhost:${config.PORT}`);
      resolve({ server, sessionManager, agentStore, workflowManager, app });
    });
  });
}

export { buildApp as _buildApp };
export default buildApp;
