import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock node-pty before importing SessionManager
// ---------------------------------------------------------------------------
let dataHandler;
let exitHandler;

vi.mock('node-pty', () => ({
  default: {
    spawn: vi.fn(() => {
      const inst = {
        pid: Math.floor(Math.random() * 90000) + 10000,
        onData: vi.fn((cb) => { dataHandler = cb; }),
        onExit: vi.fn((cb) => { exitHandler = cb; }),
        write: vi.fn(),
        resize: vi.fn(),
        kill: vi.fn(),
      };
      return inst;
    }),
  },
}));

import SessionManager from '../src/session-manager.js';

describe('SessionManager — remove() and getStatus()', () => {
  /** @type {SessionManager} */
  let manager;

  beforeEach(() => {
    vi.clearAllMocks();
    dataHandler = undefined;
    exitHandler = undefined;
    manager = new SessionManager();
  });

  // ------------------------------------------------------------------
  it('remove() on a non-running session removes it and returns wasRunning: false', () => {
    const session = manager.createSession({ workDir: '/tmp', prompt: 'done' });

    // Simulate exit so state becomes "stopped"
    exitHandler({ exitCode: 0, signal: undefined });

    const result = manager.remove(session.id);
    expect(result).toEqual({ removed: true, wasRunning: false });
    expect(manager.getAllSessions()).toHaveLength(0);
  });

  // ------------------------------------------------------------------
  it('remove() on a running session kills PTY, removes it, and returns wasRunning: true', () => {
    const session = manager.createSession({ workDir: '/tmp', prompt: 'active' });
    const internal = manager.getSession(session.id);

    const result = manager.remove(session.id);
    expect(result).toEqual({ removed: true, wasRunning: true });
    expect(internal.pty.kill).toHaveBeenCalled();
    expect(manager.getAllSessions()).toHaveLength(0);
  });

  // ------------------------------------------------------------------
  it('remove() on non-existent session returns { removed: false }', () => {
    const result = manager.remove('fake-id');
    expect(result).toEqual({ removed: false });
  });

  // ------------------------------------------------------------------
  it('getStatus() returns correct status for a running session', () => {
    const session = manager.createSession({ workDir: '/tmp', prompt: 'status' });
    expect(manager.getStatus(session.id)).toBe('running');
  });

  // ------------------------------------------------------------------
  it('getStatus() returns "stopped" after kill', () => {
    const session = manager.createSession({ workDir: '/tmp', prompt: 'kill-me' });
    manager.killSession(session.id);
    expect(manager.getStatus(session.id)).toBe('stopped');
  });

  // ------------------------------------------------------------------
  it('getStatus() returns null for unknown id', () => {
    expect(manager.getStatus('fake-id')).toBe(null);
  });

  // ------------------------------------------------------------------
  it('remove() emits session_removed event', () => {
    const onRemoved = vi.fn();
    manager.on('session_removed', onRemoved);

    const session = manager.createSession({ workDir: '/tmp', prompt: 'event' });
    manager.remove(session.id);

    expect(onRemoved).toHaveBeenCalledWith(
      expect.objectContaining({ sessionId: session.id }),
    );
  });
});
