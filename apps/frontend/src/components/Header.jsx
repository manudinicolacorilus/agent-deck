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
    background: '#238636',
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

export default function Header({ onNewAgent, view, onViewChange }) {
  const [hover, setHover] = React.useState(false);

  return (
    <header style={styles.header}>
      <div style={styles.titleWrap}>
        <div style={styles.logo}>A</div>
        <span style={styles.title}>Agent Deck</span>
      </div>
      <div style={styles.controls}>
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
            background: hover ? '#2ea043' : '#238636',
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={onNewAgent}
        >
          + New Agent
        </button>
      </div>
    </header>
  );
}
