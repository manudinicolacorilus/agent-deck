import React from 'react';

/**
 * Small floating icon showing what an agent is currently doing.
 * Hovers above-right of the character sprite.
 *
 * Props:
 *  - activity: string — activity state from ACTIVITY_STATE
 *  - x: number
 *  - y: number
 */

const ACTIVITY_ICONS = {
  thinking: '💭',
  reading: '📖',
  editing: '⌨️',
  running_command: '⚡',
  waiting_for_approval: '❓',
  waiting_for_input: '💬',
  done: '✅',
  error: '❌',
};

const ACTIVITY_GLOW = {
  thinking: '#d2a8ff',
  reading: '#58a6ff',
  editing: '#3fb950',
  running_command: '#f0883e',
  waiting_for_approval: '#f8e3a1',
  waiting_for_input: '#f8e3a1',
  done: '#3fb950',
  error: '#da3633',
};

export default function ActionIndicator({ activity, x = 0, y = 0 }) {
  if (!activity || activity === 'idle') return null;

  const icon = ACTIVITY_ICONS[activity];
  const glow = ACTIVITY_GLOW[activity];
  if (!icon) return null;

  return (
    <div style={{
      position: 'absolute',
      left: x + 20,
      top: y - 8,
      zIndex: 90,
      pointerEvents: 'none',
      width: 18,
      height: 18,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 11,
      background: '#161b22',
      border: `1px solid ${glow}66`,
      borderRadius: 4,
      boxShadow: `0 0 6px ${glow}33`,
    }}>
      {icon}
    </div>
  );
}
