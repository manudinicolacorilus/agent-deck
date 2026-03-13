import React from 'react';

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    background: '#161b22',
    borderBottom: '1px solid #30363d',
    flexShrink: 0,
  },
  titleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 6,
    background: 'linear-gradient(135deg, #238636 0%, #2ea043 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    color: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: '#e6edf3',
    letterSpacing: '-0.3px',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 16px',
    color: '#fff',
    border: '1px solid rgba(240, 246, 252, 0.1)',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s ease',
    fontFamily: 'inherit',
    lineHeight: '20px',
  },
  viewToggle: {
    display: 'inline-flex',
    borderRadius: 6,
    overflow: 'hidden',
    border: '1px solid #30363d',
  },
  viewBtn: {
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    fontFamily: 'inherit',
    transition: 'all 0.15s ease',
    lineHeight: '20px',
  },
};

export default function Header({ onNewAgent, onNewSession, onStartWorkflow, view, onViewChange, soundEnabled, onToggleSound }) {
  const [hoverAgent, setHoverAgent] = React.useState(false);
  const [hoverSession, setHoverSession] = React.useState(false);
  const [hoverWorkflow, setHoverWorkflow] = React.useState(false);

  return (
    <header style={styles.header}>
      <div style={styles.titleWrap}>
        <div style={styles.logo}>A</div>
        <span style={styles.title}>Agent Deck</span>
      </div>
      <div style={styles.controls}>
        <button
          style={{
            ...styles.viewBtn,
            background: soundEnabled ? '#21262d' : '#21262d',
            color: soundEnabled ? '#e6edf3' : '#484f58',
            border: `1px solid ${soundEnabled ? '#30363d' : '#21262d'}`,
            borderRadius: 6,
            fontSize: 18,
            padding: '4px 10px',
            cursor: 'pointer',
            lineHeight: '20px',
          }}
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute peon sounds' : 'Unmute peon sounds'}
        >
          {soundEnabled ? '\uD83D\uDD0A' : '\uD83D\uDD07'}
        </button>
        <div style={styles.viewToggle}>
          <button
            style={{
              ...styles.viewBtn,
              background: view === 'terminal' ? '#238636' : '#21262d',
              color: view === 'terminal' ? '#fff' : '#8b949e',
            }}
            onClick={() => onViewChange?.('terminal')}
          >
            Terminal View
          </button>
          <button
            style={{
              ...styles.viewBtn,
              background: view === 'office' ? '#238636' : '#21262d',
              color: view === 'office' ? '#fff' : '#8b949e',
            }}
            onClick={() => onViewChange?.('office')}
          >
            Office View
          </button>
        </div>
        <button
          style={{
            ...styles.button,
            background: hoverWorkflow ? '#9a6ddf' : '#8957e5',
          }}
          onMouseEnter={() => setHoverWorkflow(true)}
          onMouseLeave={() => setHoverWorkflow(false)}
          onClick={onStartWorkflow}
        >
          Workflow
        </button>
        <button
          style={{
            ...styles.button,
            background: hoverAgent ? '#1c6dd0' : '#1158a6',
          }}
          onMouseEnter={() => setHoverAgent(true)}
          onMouseLeave={() => setHoverAgent(false)}
          onClick={onNewAgent}
        >
          + New Agent
        </button>
        <button
          style={{
            ...styles.button,
            background: hoverSession ? '#2ea043' : '#238636',
          }}
          onMouseEnter={() => setHoverSession(true)}
          onMouseLeave={() => setHoverSession(false)}
          onClick={onNewSession}
        >
          + Quick Session
        </button>
      </div>
    </header>
  );
}
