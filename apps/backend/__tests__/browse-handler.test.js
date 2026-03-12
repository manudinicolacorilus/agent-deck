import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Mock fs.promises
vi.mock('node:fs', async () => {
  const actual = await vi.importActual('node:fs');
  return {
    ...actual,
    default: {
      ...actual,
      promises: {
        readdir: vi.fn(),
        access: vi.fn(),
      },
      constants: actual.constants,
    },
    promises: {
      readdir: vi.fn(),
      access: vi.fn(),
    },
    constants: actual.constants,
  };
});

import { listDirectories, getDriveRoots } from '../src/browse-handler.js';

describe('browse-handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listDirectories', () => {
    it('lists only directories, excludes files', async () => {
      fs.promises.readdir.mockResolvedValue([
        { name: 'Projects', isDirectory: () => true },
        { name: 'readme.md', isDirectory: () => false },
        { name: 'Tools', isDirectory: () => true },
        { name: 'file.txt', isDirectory: () => false },
      ]);

      const result = await listDirectories('C:\\Dev');
      expect(result.directories).toEqual(['Projects', 'Tools']);
      expect(result.current).toContain('Dev');
    });

    it('excludes hidden and system directories', async () => {
      fs.promises.readdir.mockResolvedValue([
        { name: '.git', isDirectory: () => true },
        { name: '$Recycle.Bin', isDirectory: () => true },
        { name: 'System Volume Information', isDirectory: () => true },
        { name: 'Users', isDirectory: () => true },
        { name: '.hidden', isDirectory: () => true },
      ]);

      const result = await listDirectories('C:\\');
      expect(result.directories).toEqual(['Users']);
    });

    it('sorts directories alphabetically case-insensitive', async () => {
      fs.promises.readdir.mockResolvedValue([
        { name: 'Zebra', isDirectory: () => true },
        { name: 'alpha', isDirectory: () => true },
        { name: 'Beta', isDirectory: () => true },
      ]);

      const result = await listDirectories('C:\\Dev');
      expect(result.directories).toEqual(['alpha', 'Beta', 'Zebra']);
    });

    it('returns correct parent path', async () => {
      fs.promises.readdir.mockResolvedValue([]);

      const result = await listDirectories('C:\\Dev\\Corilus');
      expect(result.parent).toMatch(/Dev$/);
    });

    it('returns null parent for root path', async () => {
      fs.promises.readdir.mockResolvedValue([]);

      const result = await listDirectories('C:\\');
      expect(result.parent).toBeNull();
    });

    it('throws error for non-existent path', async () => {
      fs.promises.readdir.mockRejectedValue(
        Object.assign(new Error('ENOENT'), { code: 'ENOENT' })
      );

      await expect(listDirectories('C:\\nonexistent')).rejects.toThrow();
    });

    it('rejects UNC paths', async () => {
      await expect(listDirectories('\\\\server\\share')).rejects.toThrow(/UNC paths/);
    });
  });

  describe('getDriveRoots', () => {
    it('returns available drive letters', async () => {
      // Mock access to succeed for C and D, fail for others
      fs.promises.access.mockImplementation(async (drivePath) => {
        if (drivePath === 'C:\\' || drivePath === 'D:\\') return;
        throw new Error('not found');
      });

      const result = await getDriveRoots();
      expect(result.roots).toContain('C:\\');
      expect(result.roots).toContain('D:\\');
      expect(result.roots.every((r) => /^[A-Z]:\\$/.test(r))).toBe(true);
    });
  });
});
