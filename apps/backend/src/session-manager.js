import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
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
    // Always resolve to an absolute path
    const resolvedWorkDir = path.resolve(workDir || process.cwd());
    const tmpDir = path.join(os.tmpdir(), 'agent-deck');
    fs.mkdirSync(tmpDir, { recursive: true });

    // Write prompt to a .md file. The agent CLI reads the file path instead
    // of receiving the raw prompt text as a CLI argument. This avoids all
    // shell parsing issues with markdown, special chars, long text, etc.
    let promptFile = null;
    if (prompt) {
      promptFile = path.join(tmpDir, `${id}.prompt.md`);
      fs.writeFileSync(promptFile, prompt, 'utf8');
    }

    // Replace placeholders in the template
    const cmd = template
      .replace(/\{workDir\}/g, resolvedWorkDir)
      .replace(/\{promptFile\}/g, promptFile || '')
      .replace(/\{prompt\}/g, promptFile
        ? `Read and execute the instructions in ${promptFile}`
        : '');

    // Spawn PowerShell with -Command. The prompt text never appears in the
    // command — only a short file path reference does.
    const ptyProcess = pty.spawn(
      'powershell.exe',
      ['-ExecutionPolicy', 'Bypass', '-Command', cmd],
      {
        name: 'xterm-256color',
        cols: 120,
        rows: 30,
        cwd: resolvedWorkDir,
        env: process.env,
      },
    );

    const session = {
      id,
      pid: ptyProcess.pid,
      label: label || `Session ${id.slice(0, 8)}`,
      workDir: resolvedWorkDir,
      prompt: prompt || '',
      promptFile,
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
      // Clean up temp prompt file
      if (session.promptFile) {
        try { fs.unlinkSync(session.promptFile); } catch { /* ignore */ }
      }
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
   * Convenience method — returns just the status string, or null if not found.
   * @param {string} id
   * @returns {string|null}
   */
  getStatus(id) {
    const session = this.#sessions.get(id);
    return session ? session.state : null;
  }

  /**
   * Fully remove a session: kill if running, remove from map, clean up.
   * @param {string} id
   * @returns {{ removed: boolean, wasRunning?: boolean }}
   */
  remove(id) {
    const session = this.#sessions.get(id);
    if (!session) return { removed: false };

    const wasRunning = session.state === SESSION_STATE.RUNNING;

    if (wasRunning) {
      try {
        session.pty.kill();
      } catch {
        // Already exited — ignore.
      }
      session.state = SESSION_STATE.STOPPED;
    }

    // Clean up temp prompt file
    if (session.promptFile) {
      try { fs.unlinkSync(session.promptFile); } catch { /* ignore */ }
    }

    this.#sessions.delete(id);
    this.emit('session_removed', { sessionId: id });
    return { removed: true, wasRunning };
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
    const { pty, ringBuffer, ringBufferBytes, promptFile, ...rest } = session;
    return rest;
  }
}
