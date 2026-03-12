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
- **Command-agnostic** — Configure any CLI agent per-session or globally via environment variables
- **Live streaming** — WebSocket bridge between browser terminals and PTY processes
- **Session management** — Create, monitor, and kill sessions from the UI
- **Dark theme** — GitHub-inspired dark interface
- **Ring buffer** — 100KB output buffer per session for instant catch-up on reconnect
- **Auto-reconnect** — WebSocket reconnection with exponential backoff

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

Use `{workDir}` and `{prompt}` as placeholders — they are replaced with values from the session creation form.

### GitHub Copilot CLI

```powershell
# Interactive mode
$env:COPILOT_CMD_TEMPLATE = "cd '{workDir}'; copilot -i '{prompt}' --allow-all"
npm run dev:backend

# Non-interactive mode
$env:COPILOT_CMD_TEMPLATE = "cd '{workDir}'; copilot -p '{prompt}' --allow-all-tools"
npm run dev:backend
```

### Claude Code

```powershell
# Interactive mode
$env:COPILOT_CMD_TEMPLATE = "cd '{workDir}'; claude -i '{prompt}'"
npm run dev:backend

# Print mode
$env:COPILOT_CMD_TEMPLATE = "cd '{workDir}'; claude -p '{prompt}' --allowedTools '*'"
npm run dev:backend
```

### Aider

```powershell
$env:COPILOT_CMD_TEMPLATE = "cd '{workDir}'; aider --message '{prompt}'"
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
| `COPILOT_CMD_TEMPLATE` | Mock agent | Command template with `{workDir}` and `{prompt}` placeholders |

## Tech Stack

- **Frontend:** React 18, xterm.js (WebGL), Vite
- **Backend:** Express, ws, node-pty
- **Testing:** Vitest
- **Build:** npm workspaces

## License

MIT
