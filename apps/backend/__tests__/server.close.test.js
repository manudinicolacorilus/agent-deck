import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import http from 'node:http';
import { EventEmitter } from 'node:events';

// ---------------------------------------------------------------------------
// Mock node-pty
// ---------------------------------------------------------------------------
vi.mock('node-pty', () => ({
  default: {
    spawn: vi.fn(() => ({
      pid: 99999,
      onData: vi.fn(),
      onExit: vi.fn(),
      write: vi.fn(),
      resize: vi.fn(),
      kill: vi.fn(),
    })),
  },
}));

import buildApp from '../src/server.js';
import setupWebSocket from '../src/ws-handler.js';

// Minimal sessionManager stub
function createMockSessionManager() {
  const sessions = new Map();
  const mgr = Object.assign(new EventEmitter(), {
    getSession: vi.fn((id) => sessions.get(id)),
    getSessionOutput: vi.fn(() => ''),
    getAllSessions: vi.fn(() => [...sessions.values()]),
    killSession: vi.fn((id) => {
      const s = sessions.get(id);
      if (!s) return false;
      s.state = 'stopped';
      return true;
    }),
    remove: vi.fn((id) => {
      const s = sessions.get(id);
      if (!s) return { removed: false };
      const wasRunning = s.state === 'running';
      sessions.delete(id);
      mgr.emit('session_removed', { sessionId: id });
      return { removed: true, wasRunning };
    }),
    createSession: vi.fn(({ label }) => {
      const id = 'test-' + Math.random().toString(36).slice(2, 8);
      const session = { id, label, state: 'running', workDir: '/tmp', prompt: 'test' };
      sessions.set(id, session);
      return session;
    }),
    get size() { return sessions.size; },
  });
  mgr._sessions = sessions;
  return mgr;
}

describe('Server — close endpoint', () => {
  let app;
  let sessionManager;
  let server;

  beforeEach(async () => {
    sessionManager = createMockSessionManager();
    app = buildApp(sessionManager);
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
  });

  afterEach(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  function getBaseUrl() {
    const addr = server.address();
    return `http://127.0.0.1:${addr.port}`;
  }

  // ------------------------------------------------------------------
  it('DELETE /api/sessions/:id/close returns 200 with removal info', async () => {
    const created = sessionManager.createSession({ label: 'to-close' });

    const res = await fetch(`${getBaseUrl()}/api/sessions/${created.id}/close`, {
      method: 'DELETE',
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.removed).toBe(true);
    expect(body.wasRunning).toBe(true);
  });

  // ------------------------------------------------------------------
  it('DELETE /api/sessions/:id/close on unknown id returns 404', async () => {
    const res = await fetch(`${getBaseUrl()}/api/sessions/nonexistent/close`, {
      method: 'DELETE',
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Session not found');
  });

  // ------------------------------------------------------------------
  it('WS clients receive session_closed message when session is removed', async () => {
    const wss = setupWebSocket(server, sessionManager);
    const created = sessionManager.createSession({ label: 'ws-close' });

    const addr = server.address();
    const wsUrl = `ws://127.0.0.1:${addr.port}/ws?sessionId=${created.id}`;

    const { WebSocket } = await import('ws');

    const receivedMessages = [];

    await new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl);
      ws.on('open', () => {
        // Now close the session via REST
        fetch(`${getBaseUrl()}/api/sessions/${created.id}/close`, {
          method: 'DELETE',
        }).catch(reject);
      });
      ws.on('message', (raw) => {
        const msg = JSON.parse(raw.toString());
        receivedMessages.push(msg);
        if (msg.type === 'session_closed') {
          resolve();
        }
      });
      ws.on('error', reject);
      // Timeout safety
      setTimeout(() => reject(new Error('WS timeout')), 5000);
    });

    expect(receivedMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'session_closed', id: created.id }),
      ]),
    );

    wss.close();
  });
});
