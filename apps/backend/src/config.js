import { DEFAULTS } from '@agent-deck/shared';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
  PORT: parseInt(process.env.PORT, 10) || DEFAULTS.BACKEND_PORT,
  MAX_SESSIONS: parseInt(process.env.MAX_SESSIONS, 10) || DEFAULTS.MAX_SESSIONS,
  RING_BUFFER_SIZE: DEFAULTS.RING_BUFFER_SIZE,
  COPILOT_CMD_TEMPLATE:
    process.env.COPILOT_CMD_TEMPLATE ||
    `powershell.exe -ExecutionPolicy Bypass -File "${path.resolve(__dirname, '..', 'test-fixtures', 'mock-agent.ps1')}" -Prompt "{prompt}"`,
  CORS_ORIGINS: ['http://localhost:5173', 'http://localhost:3001'],
};

export default config;
