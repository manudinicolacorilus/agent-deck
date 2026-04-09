import React from 'react';

const STATE_CONFIG = {
  running: { color: '#16a34a', bg: 'rgba(22, 163, 74, 0.10)', label: 'Running', pulse: true },
  stopped: { color: '#dc2626', bg: 'rgba(220, 38, 38, 0.10)', label: 'Stopped', pulse: false },
  error:   { color: '#d97706', bg: 'rgba(217, 119, 6, 0.10)', label: 'Error',   pulse: false },
};

const ENGINE_CONFIG = {
  copilot: { color: '#fff', bg: '#7c3aed', label: 'Copilot' },
  claude:  { color: '#fff', bg: '#ea580c', label: 'Claude' },
};

function makeBadgeStyle(color, bg, borderColor) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '2px 9px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.02em',
    color,
    background: bg,
    border: `1px solid ${borderColor || color + '30'}`,
    lineHeight: '18px',
    userSelect: 'none',
  };
}

export default function StatusBadge({ state }) {
  const config = STATE_CONFIG[state] || STATE_CONFIG.stopped;

  return (
    <span style={makeBadgeStyle(config.color, config.bg)}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: config.color,
        boxShadow: `0 0 0 0 ${config.color}`,
        flexShrink: 0,
        animation: config.pulse ? 'statusDotPulse 2s ease-in-out infinite' : 'none',
      }} />
      {config.label}
    </span>
  );
}

export function EngineBadge({ engine }) {
  const config = ENGINE_CONFIG[engine];
  if (!config) return null;

  return (
    <span
      style={makeBadgeStyle(config.color, config.bg, config.bg)}
      data-testid={`engine-badge-${engine}`}
    >
      {config.label}
    </span>
  );
}

export function YoloBadge() {
  return (
    <span
      style={makeBadgeStyle('#000', '#d29922', '#d29922')}
      data-testid="yolo-badge"
    >
      YOLO
    </span>
  );
}
