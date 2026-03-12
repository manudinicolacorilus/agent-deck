import { WebSocketServer } from 'ws';
import { WS_MSG } from '@agent-deck/shared';
import url from 'node:url';

/**
 * Attach a WebSocket server to an existing HTTP server.
 *
 * Protocol:
 *   - Clients connect to  ws://host/ws?sessionId=<uuid>
 *   - Server immediately sends any buffered output (catch-up)
 *   - Server forwards live PTY output as  { type: OUTPUT, data }
 *   - Server sends  { type: SESSION_EXIT, exitCode, signal }  on process exit
 *   - Client may send  { type: INPUT, data }  to write to the PTY
 *   - Client may send  { type: RESIZE, cols, rows }  to resize the PTY
 *
 * @param {import('http').Server} server
 * @param {import('./session-manager.js').default} sessionManager
 * @returns {WebSocketServer}
 */
export default function setupWebSocket(server, sessionManager) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  // Track WS clients per session for broadcasting session_closed
  const sessionClients = new Map(); // sessionId → Set<ws>

  sessionManager.on('session_removed', ({ sessionId }) => {
    const clients = sessionClients.get(sessionId);
    if (clients) {
      for (const client of clients) {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({ type: WS_MSG.SESSION_CLOSED, id: sessionId }));
          client.close();
        }
      }
      sessionClients.delete(sessionId);
    }
  });

  wss.on('connection', (ws, req) => {
    // ---- resolve the target session -----------------------------------
    const parsed = url.parse(req.url, true);
    const sessionId = parsed.query.sessionId;

    if (!sessionId) {
      ws.send(JSON.stringify({ type: WS_MSG.ERROR, message: 'Missing sessionId query param' }));
      ws.close();
      return;
    }

    const session = sessionManager.getSession(sessionId);
    if (!session) {
      ws.send(JSON.stringify({ type: WS_MSG.ERROR, message: `Session ${sessionId} not found` }));
      ws.close();
      return;
    }

    // ---- track this client for session_closed broadcasting ------------
    if (!sessionClients.has(sessionId)) {
      sessionClients.set(sessionId, new Set());
    }
    sessionClients.get(sessionId).add(ws);

    // ---- send buffered output (catch-up) ------------------------------
    const catchUp = sessionManager.getSessionOutput(sessionId);
    if (catchUp) {
      ws.send(JSON.stringify({ type: WS_MSG.OUTPUT, data: catchUp }));
    }

    // ---- subscribe to live events -------------------------------------
    const onData = ({ sessionId: sid, data }) => {
      if (sid !== sessionId) return;
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ type: WS_MSG.OUTPUT, data }));
      }
    };

    const onExit = ({ sessionId: sid, exitCode, signal }) => {
      if (sid !== sessionId) return;
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ type: WS_MSG.SESSION_EXIT, exitCode, signal }));
      }
    };

    sessionManager.on('data', onData);
    sessionManager.on('exit', onExit);

    // ---- handle incoming client messages ------------------------------
    ws.on('message', (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        ws.send(JSON.stringify({ type: WS_MSG.ERROR, message: 'Invalid JSON' }));
        return;
      }

      const currentSession = sessionManager.getSession(sessionId);
      if (!currentSession) return;

      switch (msg.type) {
        case WS_MSG.INPUT:
          if (typeof msg.data === 'string') {
            currentSession.pty.write(msg.data);
          }
          break;

        case WS_MSG.RESIZE:
          if (typeof msg.cols === 'number' && typeof msg.rows === 'number') {
            currentSession.pty.resize(msg.cols, msg.rows);
          }
          break;

        default:
          ws.send(JSON.stringify({ type: WS_MSG.ERROR, message: `Unknown message type: ${msg.type}` }));
      }
    });

    // ---- clean up on disconnect ---------------------------------------
    ws.on('close', () => {
      sessionManager.off('data', onData);
      sessionManager.off('exit', onExit);
      const clients = sessionClients.get(sessionId);
      if (clients) {
        clients.delete(ws);
        if (clients.size === 0) sessionClients.delete(sessionId);
      }
    });
  });

  return wss;
}
