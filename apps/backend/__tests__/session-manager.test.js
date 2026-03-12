import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock node-pty before importing SessionManager
// ---------------------------------------------------------------------------
const mockPtyProcess = {
  pid: 12345,
  onData: vi.fn(),
  onExit: vi.fn(),
  write: vi.fn(),
  resize: vi.fn(),
  kill: vi.fn(),
};

vi.mock('node-pty', () => ({
  default: {
    spawn: vi.fn(() => ({ ...mockPtyProcess })),
  },
}));

// Ensure each test gets fresh callbacks by resetting the captured handlers.
let dataHandler;
let exitHandler;

function capturePtyHandlers(ptyInstance) {
  // node-pty's onData / onExit are registered by SessionManager right after spawn.
  // Our mock records them so tests can invoke them.
  ptyInstance.onData.mockImplementation((cb) => {
    dataHandler = cb;
  });
  ptyInstance.onExit.mockImplementation((cb) => {
    exitHandler = cb;
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
import pty from 'node-pty';
import SessionManager from '../src/session-manager.js';
import config from '../src/config.js';

describe('SessionManager', () => {
  /** @type {SessionManager} */
  let manager;

  beforeEach(() => {
    vi.clearAllMocks();
    dataHandler = undefined;
    exitHandler = undefined;

    // Prepare mock so the next spawn captures handlers
    pty.spawn.mockImplementation(() => {
      const inst = {
        pid: Math.floor(Math.random() * 90000) + 10000,
        onData: vi.fn(),
        onExit: vi.fn(),
        write: vi.fn(),
        resize: vi.fn(),
        kill: vi.fn(),
      };
      capturePtyHandlers(inst);
      return inst;
    });

    manager = new SessionManager();
  });

  // ------------------------------------------------------------------
  it('creates a session and returns a serialised object without pty', () => {
    const session = manager.createSession({
      workDir: '/tmp',
      prompt: 'hello',
      label: 'Test Session',
    });

    expect(session).toHaveProperty('id');
    expect(session).toHaveProperty('pid');
    expect(session).toHaveProperty('label', 'Test Session');
    expect(session).toHaveProperty('state', 'running');
    expect(session).not.toHaveProperty('pty');
    expect(session).not.toHaveProperty('ringBuffer');
    expect(pty.spawn).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------------------------------
  it('enforces max sessions limit', () => {
    const original = config.MAX_SESSIONS;
    config.MAX_SESSIONS = 2;

    manager.createSession({ workDir: '/tmp', prompt: 'a' });
    manager.createSession({ workDir: '/tmp', prompt: 'b' });

    expect(() => manager.createSession({ workDir: '/tmp', prompt: 'c' })).toThrow(
      /Session limit reached/,
    );

    config.MAX_SESSIONS = original;
  });

  // ------------------------------------------------------------------
  it('kills a session and marks it as stopped', () => {
    const session = manager.createSession({ workDir: '/tmp', prompt: 'x' });
    const internal = manager.getSession(session.id);

    const killed = manager.killSession(session.id);
    expect(killed).toBe(true);
    expect(internal.state).toBe('stopped');
    expect(internal.pty.kill).toHaveBeenCalled();
  });

  // ------------------------------------------------------------------
  it('returns false when killing a non-existent session', () => {
    expect(manager.killSession('no-such-id')).toBe(false);
  });

  // ------------------------------------------------------------------
  it('accumulates output in the ring buffer', () => {
    manager.createSession({ workDir: '/tmp', prompt: 'buf' });

    // Simulate PTY emitting data
    dataHandler('chunk-1');
    dataHandler('chunk-2');

    const sessions = manager.getAllSessions();
    const output = manager.getSessionOutput(sessions[0].id);
    expect(output).toBe('chunk-1chunk-2');
  });

  // ------------------------------------------------------------------
  it('trims oldest ring buffer entries when size exceeds limit', () => {
    const originalSize = config.RING_BUFFER_SIZE;
    config.RING_BUFFER_SIZE = 20; // 20 bytes

    manager.createSession({ workDir: '/tmp', prompt: 'trim' });

    // Push data that exceeds 20 bytes total
    dataHandler('aaaaaaaaaa'); // 10 bytes → total 10
    dataHandler('bbbbbbbbbb'); // 10 bytes → total 20
    dataHandler('cccccccccc'); // 10 bytes → total 30 → must trim

    const sessions = manager.getAllSessions();
    const output = manager.getSessionOutput(sessions[0].id);

    // Oldest chunk(s) should have been removed so total <= 20 bytes
    expect(Buffer.byteLength(output, 'utf8')).toBeLessThanOrEqual(20);
    expect(output).toContain('cccccccccc'); // newest data always present

    config.RING_BUFFER_SIZE = originalSize;
  });

  // ------------------------------------------------------------------
  it('emits exit event when PTY process exits', () => {
    const onExit = vi.fn();
    manager.on('exit', onExit);

    const session = manager.createSession({ workDir: '/tmp', prompt: 'exit-test' });

    // Simulate PTY exit
    exitHandler({ exitCode: 0, signal: undefined });

    expect(onExit).toHaveBeenCalledWith(
      expect.objectContaining({ sessionId: session.id, exitCode: 0 }),
    );

    const internal = manager.getSession(session.id);
    expect(internal.state).toBe('stopped');
  });
});
