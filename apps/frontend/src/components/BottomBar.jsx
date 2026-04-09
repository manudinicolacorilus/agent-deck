import React from 'react';

const styles = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '5px 20px',
    background: '#0f1318',
    borderTop: '1px solid #21262d',
    fontSize: 11,
    color: '#8b949e',
    flexShrink: 0,
    gap: 12,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  healthWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    flexShrink: 0,
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '2px 8px',
    borderRadius: 10,
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
  },
  version: {
    color: '#484f58',
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
    letterSpacing: '0.02em',
  },
};

export default function BottomBar({ health, sessionCount }) {
  const isHealthy = health === 'ok' || health === true;
  const dotColor  = isHealthy ? '#3fb950' : '#da3633';
  const dotShadow = isHealthy ? `0 0 5px ${dotColor}88` : `0 0 5px ${dotColor}66`;
  const bgColor   = isHealthy ? 'rgba(63,185,80,0.08)'  : 'rgba(218,54,51,0.08)';
  const borderColor = isHealthy ? 'rgba(63,185,80,0.2)' : 'rgba(218,54,51,0.2)';

  return (
    <div style={styles.bar}>
      <div style={styles.left}>
        {/* Backend health pill */}
        <span style={{ ...styles.pill, background: bgColor, border: `1px solid ${borderColor}`, color: isHealthy ? '#3fb950' : '#da3633' }}>
          <span style={{ ...styles.dot, background: dotColor, boxShadow: dotShadow }} />
          {isHealthy ? 'Backend connected' : 'Backend offline'}
        </span>

        {/* Session count */}
        <span style={{ ...styles.pill, background: 'rgba(56,139,253,0.07)', border: '1px solid rgba(56,139,253,0.15)', color: '#58a6ff' }}>
          {sessionCount ?? 0} session{(sessionCount ?? 0) !== 1 ? 's' : ''} active
        </span>
      </div>

      <span style={styles.version}>Agent Deck v0.1</span>
    </div>
  );
}
