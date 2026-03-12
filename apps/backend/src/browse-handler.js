import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const HIDDEN_OR_SYSTEM = new Set([
  '$Recycle.Bin',
  'System Volume Information',
  '$WINDOWS.~BT',
  '$WinREAgent',
  'Recovery',
  'DumpStack.log.tmp',
]);

/**
 * List subdirectories in the given path.
 *
 * @param {string} [dirPath] - Directory to list. Defaults to os.homedir().
 * @returns {Promise<{ current: string, parent: string|null, directories: string[] }>}
 */
export async function listDirectories(dirPath) {
  const resolved = path.resolve(dirPath || os.homedir());

  // Security: reject UNC paths
  if (resolved.startsWith('\\\\')) {
    throw Object.assign(new Error('UNC paths are not supported'), { code: 'EINVAL' });
  }

  const entries = await fs.promises.readdir(resolved, { withFileTypes: true });

  const directories = entries
    .filter((entry) => {
      if (!entry.isDirectory()) return false;
      if (entry.name.startsWith('.')) return false;
      if (HIDDEN_OR_SYSTEM.has(entry.name)) return false;
      return true;
    })
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  const parsed = path.parse(resolved);
  const isRoot = parsed.root === resolved;
  const parent = isRoot ? null : path.dirname(resolved);

  return { current: resolved, parent, directories };
}

/**
 * Get available drive roots on Windows.
 *
 * @returns {Promise<{ roots: string[] }>}
 */
export async function getDriveRoots() {
  const roots = [];
  for (let code = 65; code <= 90; code++) {
    const letter = String.fromCharCode(code);
    const root = `${letter}:\\`;
    try {
      await fs.promises.access(root, fs.constants.R_OK);
      roots.push(root);
    } catch {
      // Drive not available
    }
  }
  return { roots };
}
