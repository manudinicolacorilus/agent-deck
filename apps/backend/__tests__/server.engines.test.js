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
      return { removed: true, wasRunning };
    }),
    createSession: vi.fn(({ label, engine, options }) => {
      const id = 'test-' + Math.random().toString(36).slice(2, 8);
      const session = {
        id,
        label,
        state: 'running',
        workDir: '/tmp',
        prompt: 'test',
        engine: engine || 'copilot',
        yolo: options?.yolo || false,
      };
      sessions.set(id, session);
      return session;
    }),
    get size() { return sessions.size; },
  });
  return mgr;
}

describe('Server — engines endpoint', () => {
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

  it('GET /api/engines returns available engines', async () => {
    const res = await fetch(`${getBaseUrl()}/api/engines`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.engines).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'copilot', label: 'GitHub Copilot' }),
        expect.objectContaining({ id: 'claude', label: 'Claude Code' }),
      ]),
    );
  });

  it('POST /api/sessions with engine creates session', async () => {
    const res = await fetch(`${getBaseUrl()}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workDir: '/tmp', prompt: 'test', engine: 'copilot' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.engine).toBe('copilot');
  });

  it('POST /api/sessions with yolo creates session with yolo flag', async () => {
    const res = await fetch(`${getBaseUrl()}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workDir: '/tmp', prompt: 'test', engine: 'claude', yolo: true }),
    });
    expect(res.status).toBe(201);
    expect(sessionManager.createSession).toHaveBeenCalledWith(
      expect.objectContaining({ engine: 'claude', options: { yolo: true } }),
    );
  });
});
