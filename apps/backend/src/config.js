import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DEFAULTS } from '@agent-deck/shared';

/**
 * Write prompt to a temp file and return its path.
 * This avoids all shell-escaping issues with special characters in prompts.
 */
function writePromptFile(prompt) {
  const tmpDir = os.tmpdir();
  const tmpFile = path.join(tmpDir, `agent-deck-prompt-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`);
  fs.writeFileSync(tmpFile, prompt, 'utf8');
  return tmpFile;
}

const config = {
  PORT: parseInt(process.env.PORT, 10) || DEFAULTS.BACKEND_PORT,
  MAX_SESSIONS: parseInt(process.env.MAX_SESSIONS, 10) || DEFAULTS.MAX_SESSIONS,
  RING_BUFFER_SIZE: DEFAULTS.RING_BUFFER_SIZE,
  CORS_ORIGINS: ['http://localhost:5173', 'http://localhost:3001'],

  ENGINES: {
    copilot: {
      label: 'GitHub Copilot',
      buildCommand: (workDir, prompt, options) => {
        const promptFile = writePromptFile(prompt);
        return {
          shell: 'powershell.exe',
          args: [
            '-NoLogo', '-NoProfile', '-Command',
            `cd '${workDir}'; copilot ${options.yolo ? '--allow-all-tools ' : ''}-p (Get-Content -Raw '${promptFile}')`,
          ],
          promptFile,
        };
      },
    },
    claude: {
      label: 'Claude Code',
      buildCommand: (workDir, prompt, options) => {
        const promptFile = writePromptFile(prompt);
        return {
          shell: 'powershell.exe',
          args: [
            '-NoLogo', '-NoProfile', '-Command',
            `cd '${workDir}'; claude ${options.yolo ? '--dangerously-skip-permissions ' : ''}-- (Get-Content -Raw '${promptFile}')`,
          ],
          promptFile,
        };
      },
    },
  },
};

export default config;
