import { DEFAULTS } from '@agent-deck/shared';

const config = {
  PORT: parseInt(process.env.PORT, 10) || DEFAULTS.BACKEND_PORT,
  MAX_SESSIONS: parseInt(process.env.MAX_SESSIONS, 10) || DEFAULTS.MAX_SESSIONS,
  RING_BUFFER_SIZE: DEFAULTS.RING_BUFFER_SIZE,
  CORS_ORIGINS: ['http://localhost:5173', 'http://localhost:3001'],

  ENGINES: {
    copilot: {
      label: 'GitHub Copilot',
      buildCommand: (workDir, prompt, options) => ({
        shell: 'powershell.exe',
        args: [
          '-NoLogo', '-NoProfile', '-Command',
          `cd '${workDir}'; gh copilot agent ${options.yolo ? '--yolo ' : ''}--prompt '${prompt.replace(/'/g, "''")}'`,
        ],
      }),
    },
    claude: {
      label: 'Claude Code',
      buildCommand: (workDir, prompt, options) => ({
        shell: 'powershell.exe',
        args: [
          '-NoLogo', '-NoProfile', '-Command',
          `cd '${workDir}'; claude ${options.yolo ? '--dangerously-skip-permissions ' : ''}-p '${prompt.replace(/'/g, "''")}'`,
        ],
      }),
    },
  },
};

export default config;
