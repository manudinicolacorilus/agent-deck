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
  ACTIVITY: 'activity',
  WORKFLOW_UPDATE: 'workflow:update',
};

// Session states
export const SESSION_STATE = {
  RUNNING: 'running',
  STOPPED: 'stopped',
  ERROR: 'error',
};

// Agent activity states (detected from terminal output)
export const ACTIVITY_STATE = {
  IDLE: 'idle',
  THINKING: 'thinking',
  READING: 'reading',
  EDITING: 'editing',
  RUNNING_COMMAND: 'running_command',
  WAITING_FOR_APPROVAL: 'waiting_for_approval',
  WAITING_FOR_INPUT: 'waiting_for_input',
  DONE: 'done',
  ERROR: 'error',
};

// Agent visual states (for office view animations)
export const AGENT_VISUAL_STATE = {
  IDLE_AT_COFFEE: 'idle_at_coffee',
  CHATTING_AT_COOLER: 'chatting_at_cooler',
  SITTING_ON_COUCH: 'sitting_on_couch',
  WALKING_TO_DESK: 'walking_to_desk',
  WORKING_AT_DESK: 'working_at_desk',
  THINKING_AT_DESK: 'thinking_at_desk',
  WALKING_TO_COFFEE: 'walking_to_coffee',
  WALKING_TO_COOLER: 'walking_to_cooler',
};

// Agent roles
export const AGENT_ROLE = {
  ARCHITECT:    'architect',
  SUPER_MASTER: 'super_master',
  MASTER:       'master',
  EXPLORER:     'explorer',
  DEV:          'dev',
  INTEGRATOR:   'integrator',
  TESTER:       'tester',
  REVIEWER:     'reviewer',
  RELEASER:     'releaser',
};

// Workflow states
export const WORKFLOW_STATE = {
  PENDING: 'pending',
  ARCHITECTING: 'architecting',
  WAITING_DEV: 'waiting_dev',
  DEVELOPING: 'developing',
  WAITING_REVIEW: 'waiting_review',
  REVIEWING: 'reviewing',
  WAITING_REVISION: 'waiting_revision',
  REVISING: 'revising',
  PAUSED: 'paused',
  STUCK: 'stuck',
  DONE: 'done',
  ERROR: 'error',
};

// Review models (used by reviewer agents via copilot)
export const REVIEW_MODELS = ['claude-opus-4.6', 'gemini-3-pro', 'gpt-5.3-codex'];

// REST API paths
export const API = {
  HEALTH: '/api/health',
  SESSIONS: '/api/sessions',
  SESSION: (id) => `/api/sessions/${id}`,
  SESSION_KILL: (id) => `/api/sessions/${id}/kill`,
  SESSION_CLOSE: (id) => `/api/sessions/${id}/close`,
  AGENTS: '/api/agents',
  AGENT: (id) => `/api/agents/${id}`,
  AGENT_ASSIGN: (id) => `/api/agents/${id}/assign`,
  WORKFLOWS: '/api/workflows',
  WORKFLOW: (id) => `/api/workflows/${id}`,
  WORKFLOW_PAUSE: (id) => `/api/workflows/${id}/pause`,
  WORKFLOW_RESUME: (id) => `/api/workflows/${id}/resume`,
  WORKFLOW_ABORT: (id) => `/api/workflows/${id}/abort`,
  WORKFLOW_RESOLVE: (id) => `/api/workflows/${id}/resolve`,
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
