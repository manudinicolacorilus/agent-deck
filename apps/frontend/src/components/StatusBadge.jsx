import React from 'react';

const STATE_CONFIG = {
  running: { color: '#2ea043', bg: 'rgba(46, 160, 67, 0.15)', label: 'Running' },
  stopped: { color: '#da3633', bg: 'rgba(218, 54, 51, 0.15)', label: 'Stopped' },
  error: { color: '#d29922', bg: 'rgba(210, 153, 34, 0.15)', label: 'Error' },
};

const ENGINE_CONFIG = {
  copilot: { color: '#fff', bg: '#8b5cf6', label: 'Copilot' },
  claude: { color: '#fff', bg: '#f97316', label: 'Claude' },
};

function makeBadgeStyle(color, bg, borderColor) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '2px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
    color,
    background: bg,
    border: `1px solid ${borderColor || color + '33'}`,
    lineHeight: '20px',
  };
}

export default function StatusBadge({ state }) {
  const config = STATE_CONFIG[state] || STATE_CONFIG.stopped;

  return (
    <span style={makeBadgeStyle(config.color, config.bg)}>
      <span style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: config.color,
        boxShadow: `0 0 6px ${config.color}88`,
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
