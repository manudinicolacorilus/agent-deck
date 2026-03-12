import http from 'node:http';
import express from 'express';
import cors from 'cors';
import config from './config.js';
import SessionManager from './session-manager.js';
import setupWebSocket from './ws-handler.js';
import { listDirectories, getDriveRoots } from './browse-handler.js';
import { API } from '@agent-deck/shared';

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
 * @returns {express.Express}
 */
function buildApp(sessionManager) {
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

  return app;
}

/**
 * Start the HTTP + WebSocket server.
 *
 * @param {SessionManager} [sessionManager]  Optional — a new one is created if omitted.
 * @returns {Promise<{ server: http.Server, sessionManager: SessionManager, app: express.Express }>}
 */
export function startServer(sessionManager) {
  sessionManager = sessionManager || createSessionManager();
  const app = buildApp(sessionManager);
  const server = http.createServer(app);

  setupWebSocket(server, sessionManager);

  return new Promise((resolve) => {
    server.listen(config.PORT, () => {
      console.log(`Backend listening on http://localhost:${config.PORT}`);
      resolve({ server, sessionManager, app });
    });
  });
}

export { buildApp as _buildApp };
export default buildApp;
