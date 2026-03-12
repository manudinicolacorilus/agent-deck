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
};

export default function Header({ onNewAgent }) {
  const [hover, setHover] = React.useState(false);

  return (
    <header style={styles.header}>
      <div style={styles.titleWrap}>
        <div style={styles.logo}>A</div>
        <span style={styles.title}>Agent Deck</span>
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
    </header>
  );
}
