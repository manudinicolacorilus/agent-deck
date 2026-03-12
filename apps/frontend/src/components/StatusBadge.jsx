import React from 'react';

const STATE_CONFIG = {
  running: { color: '#2ea043', bg: 'rgba(46, 160, 67, 0.15)', label: 'Running' },
  stopped: { color: '#da3633', bg: 'rgba(218, 54, 51, 0.15)', label: 'Stopped' },
  error: { color: '#d29922', bg: 'rgba(210, 153, 34, 0.15)', label: 'Error' },
};

export default function StatusBadge({ state }) {
  const config = STATE_CONFIG[state] || STATE_CONFIG.stopped;

  const styles = {
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '2px 10px',
      borderRadius: 12,
      fontSize: 12,
      fontWeight: 600,
      fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
      color: config.color,
      background: config.bg,
      border: `1px solid ${config.color}33`,
      lineHeight: '20px',
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: config.color,
      boxShadow: `0 0 6px ${config.color}88`,
    },
  };

  return (
    <span style={styles.badge}>
      <span style={styles.dot} />
      {config.label}
    </span>
  );
}
