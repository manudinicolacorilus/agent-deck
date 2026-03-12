import { describe, it, expect, vi, beforeEach } from 'vitest';
import http from 'node:http';
import { EventEmitter } from 'node:events';

// ---------------------------------------------------------------------------
// Mock node-pty so importing session-manager doesn't blow up
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

import setupWebSocket from '../src/ws-handler.js';

describe('ws-handler', () => {
  it('creates a WebSocketServer attached to the given HTTP server', () => {
    const server = http.createServer();

    // Minimal session manager stub (EventEmitter with required methods)
    const sessionManager = Object.assign(new EventEmitter(), {
      getSession: vi.fn(),
      getSessionOutput: vi.fn(() => ''),
      getAllSessions: vi.fn(() => []),
    });

    const wss = setupWebSocket(server, sessionManager);

    expect(wss).toBeDefined();
    // The WSS should be listening for connections
    expect(wss.options.path).toBe('/ws');

    // Clean up
    wss.close();
  });
});
