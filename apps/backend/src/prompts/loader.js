import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cache = new Map();

/**
 * Load a prompt template by role name and fill placeholders.
 * Templates use {{key}} placeholders.
 *
 * @param {string} role - e.g. 'developer', 'architect', 'reviewer'
 * @param {Record<string, string>} vars - placeholder values
 * @returns {string}
 */
export function loadPrompt(role, vars = {}) {
  if (!cache.has(role)) {
    const filePath = path.join(__dirname, `${role}.txt`);
    cache.set(role, fs.readFileSync(filePath, 'utf8'));
  }
  let template = cache.get(role);
  for (const [key, value] of Object.entries(vars)) {
    template = template.replaceAll(`{{${key}}}`, value || '');
  }
  return template;
}

/**
 * List all available prompt template names.
 * @returns {string[]}
 */
export function listPrompts() {
  return fs.readdirSync(__dirname)
    .filter(f => f.endsWith('.txt'))
    .map(f => f.replace('.txt', ''));
}
