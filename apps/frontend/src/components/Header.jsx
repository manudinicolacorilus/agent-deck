import React from 'react';

/* ─── Logo SVG ─── */
function LogoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="28" height="28" rx="7" fill="url(#logoGrad)" />
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3fb950" />
          <stop offset="100%" stopColor="#1a7f37" />
        </linearGradient>
      </defs>
      {/* Stack of three bars representing an agent deck */}
      <rect x="7" y="8" width="14" height="3" rx="1.5" fill="white" opacity="0.95" />
      <rect x="7" y="12.5" width="10" height="3" rx="1.5" fill="white" opacity="0.7" />
      <rect x="7" y="17" width="7" height="3" rx="1.5" fill="white" opacity="0.45" />
    </svg>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 1px 0 #e2e8f0',
    flexShrink: 0,
    gap: 12,
  },
  titleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: '#0f172a',
    letterSpacing: '-0.3px',
    userSelect: 'none',
  },
  divider: {
    width: 1,
    height: 20,
    background: '#e2e8f0',
    flexShrink: 0,
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: 6,
    fontSize: 16,
    cursor: 'pointer',
    transition: 'background 0.15s ease, border-color 0.15s ease',
    lineHeight: 1,
    flexShrink: 0,
    color: '#64748b',
  },
  viewToggle: {
    display: 'inline-flex',
    borderRadius: 6,
    background: '#f1f5f9',
    border: '1px solid #cbd5e1',
    padding: 2,
    gap: 2,
  },
  viewBtn: {
    padding: '5px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    fontFamily: 'inherit',
    transition: 'all 0.18s ease',
    lineHeight: '18px',
    borderRadius: 4,
    color: '#64748b',
    whiteSpace: 'nowrap',
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '6px 14px',
    color: '#fff',
    border: '1px solid transparent',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'filter 0.15s ease, box-shadow 0.15s ease',
    fontFamily: 'inherit',
    lineHeight: '20px',
    flexShrink: 0,
  },
};

export default function Header({ onNewAgent, onNewSession, onStartWorkflow, view, onViewChange, soundEnabled, onToggleSound }) {
  const [hoverAgent, setHoverAgent] = React.useState(false);
  const [hoverSession, setHoverSession] = React.useState(false);
  const [hoverWorkflow, setHoverWorkflow] = React.useState(false);
  const [hoverSound, setHoverSound] = React.useState(false);

  return (
    <header style={styles.header}>
      <div style={styles.titleWrap}>
        <LogoIcon />
        <span style={styles.title}>Agent Deck</span>
      </div>

      <div style={styles.divider} />

      <div style={styles.controls}>
        {/* View toggle */}
        <div style={styles.viewToggle}>
          <button
            style={{
              ...styles.viewBtn,
              background: view === 'terminal' ? '#2563eb' : 'transparent',
              color: view === 'terminal' ? '#fff' : '#64748b',
              boxShadow: view === 'terminal' ? '0 1px 4px rgba(37,99,235,0.25)' : 'none',
            }}
            onClick={() => onViewChange?.('terminal')}
            title="Terminal View"
          >
            ⌨ Terminal
          </button>
          <button
            style={{
              ...styles.viewBtn,
              background: view === 'office' ? '#2563eb' : 'transparent',
              color: view === 'office' ? '#fff' : '#64748b',
              boxShadow: view === 'office' ? '0 1px 4px rgba(37,99,235,0.25)' : 'none',
            }}
            onClick={() => onViewChange?.('office')}
            title="Office View"
          >
            🏢 Office
          </button>
        </div>

        <div style={styles.divider} />

        {/* Action buttons */}
        <button
          style={{
            ...styles.button,
            background: '#7c3aed',
            boxShadow: hoverWorkflow ? '0 0 0 3px rgba(124, 58, 237, 0.25)' : 'none',
            filter: hoverWorkflow ? 'brightness(1.15)' : 'none',
          }}
          onMouseEnter={() => setHoverWorkflow(true)}
          onMouseLeave={() => setHoverWorkflow(false)}
          onClick={onStartWorkflow}
          title="Start a workflow"
        >
          ⚡ Workflow
        </button>
        <button
          style={{
            ...styles.button,
            background: '#2563eb',
            boxShadow: hoverAgent ? '0 0 0 3px rgba(37, 99, 235, 0.25)' : 'none',
            filter: hoverAgent ? 'brightness(1.15)' : 'none',
          }}
          onMouseEnter={() => setHoverAgent(true)}
          onMouseLeave={() => setHoverAgent(false)}
          onClick={onNewAgent}
          title="Create a persistent agent"
        >
          + Agent
        </button>
        <button
          style={{
            ...styles.button,
            background: '#16a34a',
            boxShadow: hoverSession ? '0 0 0 3px rgba(22, 163, 74, 0.25)' : 'none',
            filter: hoverSession ? 'brightness(1.15)' : 'none',
          }}
          onMouseEnter={() => setHoverSession(true)}
          onMouseLeave={() => setHoverSession(false)}
          onClick={onNewSession}
          title="Spawn a quick session"
        >
          + Session
        </button>

        <div style={styles.divider} />

        {/* Sound toggle */}
        <button
          style={{
            ...styles.iconBtn,
            color: soundEnabled ? '#0f172a' : '#94a3b8',
            background: hoverSound ? '#f1f5f9' : 'transparent',
            borderColor: hoverSound ? '#cbd5e1' : 'transparent',
          }}
          onMouseEnter={() => setHoverSound(true)}
          onMouseLeave={() => setHoverSound(false)}
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>
    </header>
  );
}
