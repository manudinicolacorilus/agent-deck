import React from 'react';

const styles = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '5px 20px',
    background: '#f8fafc',
    borderTop: '1px solid #e2e8f0',
    fontSize: 11,
    color: '#64748b',
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
    color: '#94a3b8',
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
    letterSpacing: '0.02em',
  },
};

export default function BottomBar({ health, sessionCount }) {
  const isHealthy = health === 'ok' || health === true;
  const dotColor  = isHealthy ? '#16a34a' : '#dc2626';
  const dotShadow = isHealthy ? `0 0 5px ${dotColor}88` : `0 0 5px ${dotColor}66`;
  const bgColor   = isHealthy ? 'rgba(22,163,74,0.07)'   : 'rgba(220,38,38,0.07)';
  const borderColor = isHealthy ? 'rgba(22,163,74,0.18)' : 'rgba(220,38,38,0.18)';

  return (
    <div style={styles.bar}>
      <div style={styles.left}>
        {/* Backend health pill */}
        <span style={{ ...styles.pill, background: bgColor, border: `1px solid ${borderColor}`, color: isHealthy ? '#16a34a' : '#dc2626' }}>
          <span style={{ ...styles.dot, background: dotColor, boxShadow: dotShadow }} />
          {isHealthy ? 'Backend connected' : 'Backend offline'}
        </span>

        {/* Session count */}
        <span style={{ ...styles.pill, background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)', color: '#2563eb' }}>
          {sessionCount ?? 0} session{(sessionCount ?? 0) !== 1 ? 's' : ''} active
        </span>
      </div>

      <span style={styles.version}>Agent Deck v0.1</span>
    </div>
  );
}
