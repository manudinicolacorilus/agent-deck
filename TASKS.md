# Agent Deck — Task List

## How to use this file
Work through tasks top to bottom. When a task is done:
1. Mark it [x]
2. Run the verification command if listed
3. Move to the next task
Never skip ahead. Each task builds on the previous.

> **Note:** Actual file paths use `apps/backend/src/` and `apps/frontend/src/`
> (monorepo layout) rather than the `server/` and `client/` paths in CLAUDE.md.

---

## M0 — Project scaffold (target: Day 3)
Goal: `npm run dev` works, xterm.js renders a real spawned shell in the browser.

- [x] M0-01  Create package.json with all dependencies and npm scripts
- [x] M0-02  Create .env.example with all variables
- [x] M0-03  Create server/db/schema.js — defines all 5 SQLite tables, exports db instance
- [x] M0-04  Create server/index.js — Express + ws bootstrap, loads schema, listens on PORT
- [x] M0-05  Create server/pty/manager.js — PtyManager with spawn/write/kill/resize/onOutput
- [x] M0-06  Create server/ws/handler.js — handles subscribe/terminal:input/terminal:resize
- [x] M0-07  Create server/routes/agents.js — GET /api/agents, POST /api/agents, DELETE /:id
- [x] M0-08  Create client/index.html + client/src/main.jsx + client/vite.config.js
- [x] M0-09  Create client/src/views/TerminalView.jsx
- [x] M0-10  Create client/src/components/AppShell.jsx

---

## M1 — Single Claude CLI agent (target: Day 7)

- [x] M1-01  Create server/agents/registry.js — agent-store.js with SQLite backend
- [x] M1-02  Create server/agents/prompts/ — all role templates with {{placeholders}}
      (apps/backend/src/prompts/ — developer.txt, architect.txt, reviewer.txt, etc.)
- [x] M1-03  Create server/routes/missions.js — workflow routes in server.js
- [x] M1-04  Create server/pty/scanner.js — activity-parser.js
- [x] M1-05  Wire PtyManager.spawn() to use CLAUDE_CLI_PATH from .env
- [x] M1-06  Add agent:status + agent:message WS broadcasts
- [x] M1-07  Frontend: useMissionsStore + useAgentsStore (React hooks)
- [x] M1-08  Frontend: DashboardView with AgentDesk components

---

## M2 — Agent registry + multi-PTY (target: Day 12)

- [x] M2-01  PtyManager: support up to 15 concurrent PTY sessions
- [x] M2-02  server/routes/agents.js: POST /:id/assign, DELETE /:id/kill, /:id/close
- [x] M2-03  Frontend: TerminalView shows tab strip, one xterm per agent
- [x] M2-04  Frontend: AgentDetailPanel slide-in with terminal + actions
- [x] M2-05  Handle terminal:resize from client → PtyManager.resize()

---

## M3 — Super-Master pipeline (target: Day 21)

- [x] M3-01  Create server/orchestrator/tick.js — WorkflowManager polls every 3s
- [x] M3-02  Create server/orchestrator/dispatch.js — prompt builders per role
- [x] M3-03  Create server/orchestrator/exitCriteria.js — session exit + review verdict
- [x] M3-04  Create server/workflows/feature-development.json — stage definitions
      (apps/backend/src/workflows/feature-development.json)
- [x] M3-05  Create server/agents/prompts/ for SM, EX, AR roles
      (apps/backend/src/prompts/ — super-master.txt, explorer.txt, architect.txt)
- [x] M3-06  Wire SM agent: WorkflowManager.start() dispatches to agents
- [x] M3-07  Orchestrator handles Architect → Dev → Review → Revision cycle
- [x] M3-08  Frontend: WorkflowPanel with steps timeline + CommsFeed

---

## M4 — Full 7-stage pipeline (target: Day 32)

- [x] M4-01  Add prompts for RV, TE, IN, RL roles
      (apps/backend/src/prompts/ — reviewer.txt, tester.txt, integrator.txt, releaser.txt)
- [x] M4-02  VERDICT: FAIL loop — return to implementation with review notes
- [x] M4-03  Watchdog: silence detection, STATUS? ping, STUCK marking
      (WorkflowManager#watchdog — 5min silence → ping → STUCK)
- [x] M4-04  Parallel developer dispatch (maxParallelDevs in workflow start)
- [x] M4-05  mission:complete event + frontend success state
      (workflow:update WS broadcast on all state changes including DONE)

---

## M5 — Human intervention (target: Day 40)

- [x] M5-01  POST /api/workflows/:id/pause + resume + abort
      (server.js routes + WorkflowManager.pause/resume/abort)
- [x] M5-02  POST /api/workflows/:id/resolve (INSTRUCT / REASSIGN / SKIP)
      (server.js route + WorkflowManager.resolve)
- [x] M5-03  Frontend: EscalationBanner + resolution buttons
      (WorkflowPanel.jsx — EscalationBanner with Pause/Resume/Abort/Reassign/Skip/Instruct)
- [x] M5-04  Frontend: SuperMasterBar Intervene panel + Override button
      (integrated into EscalationBanner with instruction input)
- [x] M5-05  SQLite: persist mission memory across server restarts
      (WorkflowStore saves/restores workflows + stages to SQLite)

---

## M6 — Polish (target: Day 48)

- [x] M6-01  Mission history list in sidebar (last 10 missions)
      (MissionHistory.jsx + GET /api/workflows/history endpoint)
- [x] M6-02  MissionCreateDialog with workflow template selector
      (StartWorkflowModal.jsx — Feature Development / Bug Fix / Code Review templates)
- [x] M6-03  AgentCreateDialog with role + backend type selector
- [x] M6-04  Dark mode (CSS custom properties + data-theme toggle)
      (global.css dark vars + useTheme hook + Header toggle button)
- [x] M6-05  README.md with install + run instructions
      (Updated with full API reference, SQLite, workflow orchestration, dark mode docs)
