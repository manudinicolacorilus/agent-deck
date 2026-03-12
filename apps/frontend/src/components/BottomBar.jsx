import React from 'react';

const styles = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 20px',
    background: '#161b22',
    borderTop: '1px solid #30363d',
    fontSize: 12,
    color: '#8b949e',
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
    flexShrink: 0,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: 6,
  },
  healthWrap: {
    display: 'flex',
    alignItems: 'center',
  },
};

export default function BottomBar({ health, sessionCount }) {
  const isHealthy = health === 'ok' || health === true;
  const dotColor = isHealthy ? '#2ea043' : '#da3633';
  const dotShadow = isHealthy ? '0 0 6px #2ea04388' : '0 0 6px #da363388';

  return (
    <div style={styles.bar}>
      <div style={styles.left}>
        <span style={styles.healthWrap}>
          <span
            style={{
              ...styles.healthDot,
              background: dotColor,
              boxShadow: dotShadow,
            }}
          />
          {isHealthy ? 'Backend connected' : 'Backend offline'}
        </span>
        <span>
          {sessionCount ?? 0} session{(sessionCount ?? 0) !== 1 ? 's' : ''}
        </span>
      </div>
      <span style={{ color: '#484f58' }}>Agent Deck v0.1</span>
    </div>
  );
}
