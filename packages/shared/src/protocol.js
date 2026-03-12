// WebSocket message types
export const WS_MSG = {
  // Client → Server
  INPUT: 'input',
  RESIZE: 'resize',

  // Server → Client
  OUTPUT: 'output',
  SESSION_EXIT: 'session:exit',
  SESSION_CLOSED: 'session_closed',
  ERROR: 'error',
};

// Session states
export const SESSION_STATE = {
  RUNNING: 'running',
  STOPPED: 'stopped',
  ERROR: 'error',
};

// REST API paths
export const API = {
  HEALTH: '/api/health',
  SESSIONS: '/api/sessions',
  SESSION: (id) => `/api/sessions/${id}`,
  SESSION_KILL: (id) => `/api/sessions/${id}/kill`,
  SESSION_CLOSE: (id) => `/api/sessions/${id}/close`,
};

// Defaults
export const DEFAULTS = {
  BACKEND_PORT: 3001,
  MAX_SESSIONS: 10,
  RING_BUFFER_SIZE: 100 * 1024, // 100KB
  WS_RECONNECT_RETRIES: 3,
  WS_RECONNECT_DELAY: 2000,
  POLL_INTERVAL: 5000,
  HEALTH_INTERVAL: 10000,
};
