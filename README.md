# Agent Deck

A self-hosted web dashboard for spawning, monitoring, and interacting with multiple AI coding agent sessions from your browser.

Built with React, xterm.js, Express, and node-pty (ConPTY on Windows). Command-agnostic — works with GitHub Copilot CLI, Claude Code, Aider, or any terminal-based agent.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-Windows-0078D6?logo=windows&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## Features

- **Multi-session dashboard** — Spawn and manage multiple agent sessions simultaneously in a responsive grid layout
- **Real-time terminal** — Full ANSI color support via xterm.js with WebGL rendering
- **Command-agnostic** — Works with GitHub Copilot CLI, Claude Code, or any terminal-based agent
- **Persistent agents** — Create named agents with roles (Architect, Developer, Reviewer, etc.) stored in SQLite
- **Workflow orchestration** — Automated Architect → Developer → Reviewer pipeline with revision loops
- **Activity detection** — Real-time tracking of agent states (thinking, editing, running commands, waiting)
- **Human intervention** — Pause/resume/abort workflows; send instructions to stuck agents
- **Mission history** — SQLite-backed workflow history persisted across server restarts
- **Dark/Light mode** — Toggle between themes, respects OS preference
- **Office view** — Visual dashboard with agent desk animations and activity indicators
- **Ring buffer** — 100KB output buffer per session for instant catch-up on reconnect
- **Watchdog** — Automatic silence detection, STATUS? pings, and STUCK marking

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Browser (localhost:5173)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Terminal  │  │ Terminal  │  │ Terminal  │      │
│  │ (xterm)  │  │ (xterm)  │  │ (xterm)  │      │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘      │
│        │WS           │WS          │WS           │
└────────┼─────────────┼────────────┼─────────────┘
         │             │            │
┌────────┼─────────────┼────────────┼─────────────┐
│  Backend (localhost:3001)                        │
│  ┌─────┴────┐  ┌─────┴────┐  ┌─────┴────┐      │
│  │   PTY    │  │   PTY    │  │   PTY    │      │
│  │ Session  │  │ Session  │  │ Session  │      │
│  └──────────┘  └──────────┘  └──────────┘      │
│        Express + WebSocket Server                │
└─────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- **Node.js** 18+
- **Windows** (ConPTY support via node-pty)
- **Build tools** for node-pty: `npm install -g windows-build-tools` or Visual Studio Build Tools

### Installation

```bash
git clone https://github.com/manudinicolacorilus/agent-deck.git
cd agent-deck
npm install
```

### Development

```bash
# Start both backend and frontend
npm run dev

# Or start individually
npm run dev:backend   # Express on http://localhost:3001
npm run dev:frontend  # Vite on http://localhost:5173
```

Open http://localhost:5173 in your browser.

By default, sessions use a **mock agent** (`mock-agent.ps1`) that simulates an interactive coding assistant. To use a real agent, see [Agent Configuration](#agent-configuration).

### Running Tests

```bash
npm test
```

## Agent Configuration

Agent Deck is command-agnostic. Configure which CLI agent to spawn via the `COPILOT_CMD_TEMPLATE` environment variable, or select a preset per-session in the UI.

Available placeholders:
- `{workDir}` — working directory from the session form
- `{prompt}` — for short prompts: inline text; for long prompts: instruction to read the prompt file
- `{promptFile}` — absolute path to a `.md` file containing the full prompt text

Long prompts (with markdown, code blocks, etc.) are automatically written to a temp file. The `{prompt}` placeholder becomes a short instruction like `"Read the instructions from this file and execute them: C:\...\prompt.md"`, which is safe to pass as a CLI argument.

Commands are spawned via `cmd.exe /C`, not PowerShell, to avoid shell parsing issues.

### GitHub Copilot CLI

```powershell
# Interactive mode
$env:COPILOT_CMD_TEMPLATE = 'cd /d "{workDir}" && copilot -i "{prompt}" --allow-all'
npm run dev:backend

# Non-interactive mode
$env:COPILOT_CMD_TEMPLATE = 'cd /d "{workDir}" && copilot -p "{prompt}" --allow-all-tools'
npm run dev:backend
```

### Claude Code

```powershell
# Interactive mode
$env:COPILOT_CMD_TEMPLATE = 'cd /d "{workDir}" && claude "{prompt}"'
npm run dev:backend

# Non-interactive print mode
$env:COPILOT_CMD_TEMPLATE = 'cd /d "{workDir}" && claude -p "{prompt}" --allowedTools "*"'
npm run dev:backend
```

### Aider

```powershell
$env:COPILOT_CMD_TEMPLATE = 'cd /d "{workDir}" && aider --message "{prompt}"'
npm run dev:backend
```

### Custom Agent

```powershell
$env:COPILOT_CMD_TEMPLATE = "cd '{workDir}'; my-agent --task '{prompt}'"
npm run dev:backend
```

## Project Structure

```
agent-deck/
├── apps/
│   ├── backend/                  # Express + WebSocket server
│   │   ├── src/
│   │   │   ├── index.js              # Entry point
│   │   │   ├── server.js             # Express app + HTTP server
│   │   │   ├── session-manager.js    # PTY lifecycle & ring buffer
│   │   │   ├── ws-handler.js         # WebSocket <-> PTY bridge
│   │   │   └── config.js             # Environment configuration
│   │   ├── __tests__/                # Vitest unit tests
│   │   └── test-fixtures/            # Mock agent script
│   └── frontend/                 # React + Vite SPA
│       ├── src/
│       │   ├── components/
│       │   │   ├── AgentGrid.jsx         # Responsive session grid
│       │   │   ├── AgentPanel.jsx        # Session card with terminal
│       │   │   ├── TerminalView.jsx      # xterm.js integration
│       │   │   ├── NewAgentModal.jsx     # Session creation form
│       │   │   ├── Header.jsx            # App header
│       │   │   ├── BottomBar.jsx         # Status bar
│       │   │   └── StatusBadge.jsx       # Session state indicator
│       │   ├── hooks/
│       │   │   ├── useAgentSessions.js   # Session CRUD + polling
│       │   │   ├── useBackendHealth.js   # Health check polling
│       │   │   └── useElapsedTime.js     # Timer display
│       │   ├── lib/
│       │   │   └── api.js                # REST client
│       │   ├── styles/
│       │   │   └── global.css            # Dark theme
│       │   ├── App.jsx                   # Root component
│       │   └── main.jsx                  # React entry point
│       └── vite.config.js
└── packages/
    └── shared/                   # Shared constants
        └── src/
            └── protocol.js           # WS message types, API paths, defaults
```

## API Reference

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health + session count |
| `GET` | `/api/sessions` | List all sessions |
| `POST` | `/api/sessions` | Create a new session |
| `DELETE` | `/api/sessions/:id/kill` | Kill a session |
| `DELETE` | `/api/sessions/:id/close` | Kill + remove a session |
| `GET` | `/api/agents` | List persistent agents |
| `POST` | `/api/agents` | Create a persistent agent |
| `PUT` | `/api/agents/:id` | Update agent properties |
| `DELETE` | `/api/agents/:id` | Delete an agent |
| `POST` | `/api/agents/:id/assign` | Assign a prompt to an agent |
| `GET` | `/api/workflows` | List active workflows |
| `POST` | `/api/workflows` | Start a workflow pipeline |
| `DELETE` | `/api/workflows/:id` | Cancel a workflow |
| `POST` | `/api/workflows/:id/pause` | Pause a workflow |
| `POST` | `/api/workflows/:id/resume` | Resume a paused workflow |
| `POST` | `/api/workflows/:id/abort` | Abort a workflow |
| `POST` | `/api/workflows/:id/resolve` | Resolve stuck workflow (instruct/reassign/skip) |
| `GET` | `/api/workflows/history` | Get recent mission history |
| `GET` | `/api/engines` | List available agent engines |

### WebSocket Protocol

Connect to `ws://localhost:3001/ws?sessionId=<uuid>`

| Direction | Type | Payload |
|-----------|------|---------|
| Server -> Client | `output` | `{ type, data }` |
| Server -> Client | `session:exit` | `{ type, exitCode, signal }` |
| Client -> Server | `input` | `{ type, data }` |
| Client -> Server | `resize` | `{ type, cols, rows }` |

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `PORT` | `3001` | Backend server port |
| `MAX_SESSIONS` | `10` | Maximum concurrent sessions |
| `DB_PATH` | `./data/agent-deck.db` | SQLite database path |
| `CORS_ORIGINS` | `localhost:5173,3001` | Allowed CORS origins |

## Tech Stack

- **Frontend:** React 19, xterm.js 6 (WebGL), Vite 8
- **Backend:** Express 5, ws, node-pty, better-sqlite3
- **Persistence:** SQLite (WAL mode) — agents, missions, stages, messages, agent_logs
- **Testing:** Vitest
- **Build:** npm workspaces

## License

MIT
