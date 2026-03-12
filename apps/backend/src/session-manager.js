import { EventEmitter } from 'node:events';
import pty from 'node-pty';
import { v4 as uuidv4 } from 'uuid';
import config from './config.js';
import { SESSION_STATE } from '@agent-deck/shared';

/**
 * Manages PTY-backed agent sessions with ring-buffered output.
 */
export default class SessionManager extends EventEmitter {
  /** @type {Map<string, object>} */
  #sessions = new Map();

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------

  /**
   * Spawn a new PTY session.
   *
   * @param {object}  opts
   * @param {string}  opts.workDir      Working directory for the agent
   * @param {string}  opts.prompt       Prompt text to pass to the agent
   * @param {string}  [opts.label]      Human-readable label
   * @param {string}  [opts.cmdTemplate] Per-session command template override
   * @returns {object} Serialised session (without pty)
   */
  createSession({ workDir, prompt, label, cmdTemplate }) {
    if (this.#sessions.size >= config.MAX_SESSIONS) {
      throw new Error(
        `Session limit reached (${config.MAX_SESSIONS}). Kill an existing session first.`,
      );
    }

    const id = uuidv4();
    const template = cmdTemplate || config.COPILOT_CMD_TEMPLATE;
    const cmd = template
      .replace(/\{workDir\}/g, workDir || process.cwd())
      .replace(/\{prompt\}/g, prompt || '');

    const ptyProcess = pty.spawn('powershell.exe', ['-Command', cmd], {
      name: 'xterm-256color',
      cols: 120,
      rows: 30,
      cwd: workDir || process.cwd(),
      env: process.env,
    });

    const session = {
      id,
      pid: ptyProcess.pid,
      label: label || `Session ${id.slice(0, 8)}`,
      workDir: workDir || process.cwd(),
      prompt: prompt || '',
      state: SESSION_STATE.RUNNING,
      createdAt: new Date().toISOString(),
      pty: ptyProcess,
      ringBuffer: [],
      ringBufferBytes: 0,
    };

    // Stream PTY output into the ring buffer and emit events.
    ptyProcess.onData((data) => {
      this.#pushToRingBuffer(session, data);
      this.emit('data', { sessionId: id, data });
    });

    ptyProcess.onExit(({ exitCode, signal }) => {
      session.state = SESSION_STATE.STOPPED;
      session.exitCode = exitCode;
      session.signal = signal;
      this.emit('exit', { sessionId: id, exitCode, signal });
    });

    this.#sessions.set(id, session);
    return SessionManager.serialise(session);
  }

  /**
   * Get a single session by id.
   * @param {string} id
   * @returns {object|undefined}
   */
  getSession(id) {
    return this.#sessions.get(id);
  }

  /**
   * List all sessions (serialised, pty excluded).
   * @returns {object[]}
   */
  getAllSessions() {
    return [...this.#sessions.values()].map(SessionManager.serialise);
  }

  /**
   * Forcefully kill a session's PTY process.
   * @param {string} id
   * @returns {boolean} true if killed, false if not found
   */
  killSession(id) {
    const session = this.#sessions.get(id);
    if (!session) return false;

    try {
      session.pty.kill();
    } catch {
      // Already exited — ignore.
    }
    session.state = SESSION_STATE.STOPPED;
    return true;
  }

  /**
   * Return the concatenated ring-buffer output for a session.
   * @param {string} id
   * @returns {string}
   */
  getSessionOutput(id) {
    const session = this.#sessions.get(id);
    if (!session) return '';
    return session.ringBuffer.join('');
  }

  /**
   * Number of active sessions.
   */
  get size() {
    return this.#sessions.size;
  }

  // ------------------------------------------------------------------
  // Internal helpers
  // ------------------------------------------------------------------

  /**
   * Append data to the ring buffer, trimming the oldest entries when the
   * total byte size exceeds RING_BUFFER_SIZE.
   */
  #pushToRingBuffer(session, data) {
    const byteLen = Buffer.byteLength(data, 'utf8');
    session.ringBuffer.push(data);
    session.ringBufferBytes += byteLen;

    while (session.ringBufferBytes > config.RING_BUFFER_SIZE && session.ringBuffer.length > 1) {
      const removed = session.ringBuffer.shift();
      session.ringBufferBytes -= Buffer.byteLength(removed, 'utf8');
    }
  }

  /**
   * Return a plain object safe for JSON serialisation (strips the pty handle).
   */
  static serialise(session) {
    const { pty, ringBuffer, ringBufferBytes, ...rest } = session;
    return rest;
  }
}
