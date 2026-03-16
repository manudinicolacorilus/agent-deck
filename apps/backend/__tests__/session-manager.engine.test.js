import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';

// ---------------------------------------------------------------------------
// Mock node-pty
// ---------------------------------------------------------------------------
vi.mock('node-pty', () => ({
  default: {
    spawn: vi.fn(() => ({
      pid: 12345,
      onData: vi.fn(),
      onExit: vi.fn(),
      write: vi.fn(),
      resize: vi.fn(),
      kill: vi.fn(),
    })),
  },
}));

// Mock fs.writeFileSync to avoid actual file writes in tests
vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});

import pty from 'node-pty';
import SessionManager from '../src/session-manager.js';

describe('SessionManager — engine support', () => {
  let manager;

  beforeEach(() => {
    vi.clearAllMocks();
    pty.spawn.mockImplementation(() => ({
      pid: Math.floor(Math.random() * 90000) + 10000,
      onData: vi.fn(),
      onExit: vi.fn(),
      write: vi.fn(),
      resize: vi.fn(),
      kill: vi.fn(),
    }));
    manager = new SessionManager();
  });

  // ------------------------------------------------------------------
  it('create() with engine "copilot" spawns correct command', () => {
    manager.createSession({
      workDir: 'C:\\test',
      prompt: 'fix bug',
      engine: 'copilot',
      options: { yolo: false },
    });

    expect(pty.spawn).toHaveBeenCalledTimes(1);
    const [shell, args] = pty.spawn.mock.calls[0];
    expect(shell).toBe('powershell.exe');
    const cmd = args.join(' ');
    expect(cmd).toContain('copilot');
    expect(cmd).toContain('-i');
    expect(cmd).toContain('--no-alt-screen');
    expect(cmd).not.toContain('--yolo');
  });

  // ------------------------------------------------------------------
  it('create() with engine "copilot" and yolo=true includes --yolo flag', () => {
    manager.createSession({
      workDir: 'C:\\test',
      prompt: 'fix bug',
      engine: 'copilot',
      options: { yolo: true },
    });

    const args = pty.spawn.mock.calls[0][1];
    const cmd = args.join(' ');
    expect(cmd).toContain('--yolo');
  });

  // ------------------------------------------------------------------
  it('create() with engine "claude" spawns correct command', () => {
    manager.createSession({
      workDir: 'C:\\test',
      prompt: 'fix bug',
      engine: 'claude',
      options: { yolo: false },
    });

    const [shell, args] = pty.spawn.mock.calls[0];
    expect(shell).toBe('powershell.exe');
    const cmd = args.join(' ');
    expect(cmd).toContain('claude');
    expect(cmd).not.toContain('--dangerously-skip-permissions');
  });

  // ------------------------------------------------------------------
  it('create() with engine "claude" and yolo=true includes --dangerously-skip-permissions', () => {
    manager.createSession({
      workDir: 'C:\\test',
      prompt: 'fix bug',
      engine: 'claude',
      options: { yolo: true },
    });

    const args = pty.spawn.mock.calls[0][1];
    const cmd = args.join(' ');
    expect(cmd).toContain('--dangerously-skip-permissions');
  });

  // ------------------------------------------------------------------
  it('create() with engine "claude" passes prompt file as argument in interactive mode', () => {
    manager.createSession({
      workDir: 'C:\\test',
      prompt: 'fix bug',
      engine: 'claude',
      options: { yolo: false },
    });

    const args = pty.spawn.mock.calls[0][1];
    const cmd = args.join(' ');
    expect(cmd).toContain('Get-Content -Raw');
    expect(cmd).toContain('claude');
    expect(cmd).toContain('-- (Get-Content');
    expect(cmd).not.toMatch(/claude\s.*-p\b/);
    // Prompt is written to a temp file, not inline
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('agent-deck-prompt'),
      'fix bug',
      'utf8',
    );
  });

  // ------------------------------------------------------------------
  it('create() with invalid engine throws error', () => {
    expect(() =>
      manager.createSession({
        workDir: 'C:\\test',
        prompt: 'fix bug',
        engine: 'invalid',
      }),
    ).toThrow(/Invalid engine/);
  });

  // ------------------------------------------------------------------
  it('create() without engine throws error', () => {
    expect(() =>
      manager.createSession({
        workDir: 'C:\\test',
        prompt: 'fix bug',
      }),
    ).toThrow(/Invalid engine/);
  });

  // ------------------------------------------------------------------
  it('session metadata includes engine and yolo fields', () => {
    const session = manager.createSession({
      workDir: 'C:\\test',
      prompt: 'fix bug',
      engine: 'claude',
      options: { yolo: true },
    });

    expect(session.engine).toBe('claude');
    expect(session.yolo).toBe(true);

    const internal = manager.getSession(session.id);
    expect(internal.engine).toBe('claude');
    expect(internal.yolo).toBe(true);
  });
});
