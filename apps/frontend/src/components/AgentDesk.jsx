import React, { useState } from 'react';

/**
 * Activity-to-visual mapping for the pixel-art agent desk.
 */
const ACTIVITY_CONFIG = {
  idle: {
    screenContent: '...',
    screenColor: '#484f58',
    character: '\u{1F9D1}\u200D\u{1F4BB}',
    statusText: 'Idle',
    statusColor: '#484f58',
    glowColor: 'transparent',
  },
  thinking: {
    screenContent: '?  ?  ?',
    screenColor: '#d2a8ff',
    character: '\u{1F914}',
    statusText: 'Thinking',
    statusColor: '#d2a8ff',
    glowColor: '#d2a8ff33',
  },
  reading: {
    screenContent: '\u2261 \u2261 \u2261',
    screenColor: '#58a6ff',
    character: '\u{1F4D6}',
    statusText: 'Reading',
    statusColor: '#58a6ff',
    glowColor: '#58a6ff33',
  },
  editing: {
    screenContent: '/// ///',
    screenColor: '#3fb950',
    character: '\u{1F9D1}\u200D\u{1F4BB}',
    statusText: 'Coding',
    statusColor: '#3fb950',
    glowColor: '#3fb95033',
  },
  running_command: {
    screenContent: '> _ _',
    screenColor: '#f0883e',
    character: '\u{1F3C3}',
    statusText: 'Running',
    statusColor: '#f0883e',
    glowColor: '#f0883e33',
  },
  waiting_for_approval: {
    screenContent: '? Y/n',
    screenColor: '#f8e3a1',
    character: '\u{270B}',
    statusText: 'Needs approval',
    statusColor: '#f8e3a1',
    glowColor: '#f8e3a133',
  },
  waiting_for_input: {
    screenContent: '?  ? ?',
    screenColor: '#f8e3a1',
    character: '\u{1F4AC}',
    statusText: 'Asking...',
    statusColor: '#f8e3a1',
    glowColor: '#f8e3a133',
  },
  done: {
    screenContent: '\u2713 \u2713 \u2713',
    screenColor: '#3fb950',
    character: '\u2705',
    statusText: 'Done!',
    statusColor: '#3fb950',
    glowColor: '#3fb95033',
  },
  error: {
    screenContent: '! ERR',
    screenColor: '#da3633',
    character: '\u274C',
    statusText: 'Error',
    statusColor: '#da3633',
    glowColor: '#da363333',
  },
};

const styles = {
  desk: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 160,
    padding: 16,
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    userSelect: 'none',
  },
  deskHover: {
    borderColor: '#58a6ff',
    background: '#1c2333',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  monitor: {
    width: 110,
    height: 70,
    border: '3px solid #30363d',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0d1117',
    marginBottom: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  monitorStand: {
    width: 30,
    height: 6,
    background: '#30363d',
    borderRadius: '0 0 4px 4px',
    marginBottom: 8,
  },
  screenText: {
    fontFamily: "'SFMono-Regular', Consolas, monospace",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: '1px',
  },
  character: {
    fontSize: 28,
    lineHeight: 1,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: '#e6edf3',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
    marginBottom: 4,
  },
  status: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.5px',
  },
  progressBar: {
    width: '80%',
    height: 4,
    background: '#21262d',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s ease',
  },
};

/** Simple animated pulse effect for active agents */
function ScreenPulse({ color }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse at center, ${color}22 0%, transparent 70%)`,
        animation: 'pulse 2s ease-in-out infinite',
      }}
    />
  );
}

export default function AgentDesk({ session, agent, activity, onClick }) {
  const [hover, setHover] = useState(false);
  const config = ACTIVITY_CONFIG[activity] || ACTIVITY_CONFIG.idle;
  const isActive = activity !== 'idle' && activity !== 'done' && activity !== 'error';

  return (
    <div
      style={{
        ...styles.desk,
        ...(hover ? styles.deskHover : {}),
        boxShadow: hover
          ? '0 4px 12px rgba(0,0,0,0.3)'
          : `0 0 20px ${config.glowColor}`,
      }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      role="button"
      tabIndex={0}
      title={`${agent?.name || session.label} — ${config.statusText}`}
    >
      {/* Monitor */}
      <div style={{ ...styles.monitor, borderColor: config.screenColor + '66' }}>
        {isActive && <ScreenPulse color={config.screenColor} />}
        <span style={{ ...styles.screenText, color: config.screenColor, position: 'relative', zIndex: 1 }}>
          {config.screenContent}
        </span>
      </div>

      {/* Monitor stand */}
      <div style={styles.monitorStand} />

      {/* Character */}
      <div style={styles.character}>{config.character}</div>

      {/* Agent name */}
      <div style={styles.label}>{agent?.name || session.label || session.id.slice(0, 8)}</div>

      {/* Engine badge */}
      {agent && (
        <div style={{ fontSize: 10, color: '#8b949e', marginBottom: 4 }}>
          {agent.engine}
        </div>
      )}

      {/* Status */}
      <div style={{ ...styles.status, color: config.statusColor }}>
        {config.statusText}
      </div>

      {/* Activity indicator bar */}
      {isActive && (
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              background: config.statusColor,
              width: '60%',
              animation: 'progressPulse 1.5s ease-in-out infinite',
            }}
          />
        </div>
      )}
    </div>
  );
}
