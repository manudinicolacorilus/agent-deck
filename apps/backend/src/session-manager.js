import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import pty from 'node-pty';
import { v4 as uuidv4 } from 'uuid';
import config from './config.js';
import { SESSION_STATE, ACTIVITY_STATE } from '@agent-deck/shared';
import ActivityParser from './activity-parser.js';

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
   * @param {string}  opts.engine       Engine key ("copilot" or "claude")
   * @param {object}  [opts.options]    Additional options
   * @param {boolean} [opts.options.yolo] Whether to run in yolo mode
   * @returns {object} Serialised session (without pty)
   */
  createSession({ workDir, prompt, label, engine, options = {} }) {
    if (this.#sessions.size >= config.MAX_SESSIONS) {
      throw new Error(
        `Session limit reached (${config.MAX_SESSIONS}). Kill an existing session first.`,
      );
    }

    if (!engine || !config.ENGINES[engine]) {
      throw new Error(
        `Invalid engine "${engine}". Available engines: ${Object.keys(config.ENGINES).join(', ')}`,
      );
    }

    const id = uuidv4();
    const resolvedWorkDir = path.resolve(workDir || process.cwd());
    const yolo = Boolean(options.yolo);

    // Build command using engine config
    const { shell, args, promptFile } = config.ENGINES[engine].buildCommand(
      resolvedWorkDir,
      prompt || '',
      { yolo },
    );

    // Spawn PTY
    const ptyProcess = pty.spawn(
      shell,
      args,
      {
        name: 'xterm-256color',
        cols: 120,
        rows: 30,
        cwd: resolvedWorkDir,
        env: process.env,
      },
    );

    // Activity parser for detecting what the agent is doing
    const activityParser = new ActivityParser((activity) => {
      session.activity = activity;
      this.emit('activity', { sessionId: id, activity });
    });

    const session = {
      id,
      pid: ptyProcess.pid,
      label: label || `Session ${id.slice(0, 8)}`,
      workDir: resolvedWorkDir,
      prompt: prompt || '',
      engine,
      yolo,
      state: SESSION_STATE.RUNNING,
      activity: ACTIVITY_STATE.IDLE,
      createdAt: new Date().toISOString(),
      pty: ptyProcess,
      activityParser,
      ringBuffer: [],
      ringBufferBytes: 0,
    };

    // Stream PTY output into the ring buffer and emit events.
    ptyProcess.onData((data) => {
      this.#pushToRingBuffer(session, data);
      activityParser.feed(data);
      this.emit('data', { sessionId: id, data });
    });

    ptyProcess.onExit(({ exitCode, signal }) => {
      session.state = SESSION_STATE.STOPPED;
      session.exitCode = exitCode;
      session.signal = signal;
      activityParser.markDone(exitCode);
      this.emit('exit', { sessionId: id, exitCode, signal });
      // Clean up the temp prompt file
      if (promptFile) {
        fs.unlink(promptFile, () => {});
      }
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

    if (session.activityParser) {
      session.activityParser.dispose();
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
   * Return a plain object safe for JSON serialisation (strips internal handles).
   */
  static serialise(session) {
    const { pty, activityParser, ringBuffer, ringBufferBytes, ...rest } = session;
    return rest;
  }
}
