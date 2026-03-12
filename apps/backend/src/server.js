import http from 'node:http';
import express from 'express';
import cors from 'cors';
import config from './config.js';
import SessionManager from './session-manager.js';
import setupWebSocket from './ws-handler.js';
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
    const { workDir, prompt, label, cmdTemplate } = req.body;
    try {
      const session = sessionManager.createSession({ workDir, prompt, label, cmdTemplate });
      res.status(201).json(session);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- Kill session ----------------------------------------------------
  app.delete('/api/sessions/:id/kill', (req, res) => {
    const killed = sessionManager.killSession(req.params.id);
    if (killed) {
      res.json({ status: 'killed', id: req.params.id });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
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
