import React, { useState } from 'react';

/**
 * Enhanced desk station drawn on the floor plan.
 * Shows monitor with activity-specific animations, chair, and keyboard area.
 *
 * Props:
 *  - activity: string — current agent activity
 *  - occupied: boolean — whether an agent is at this desk
 *  - x: number — absolute x position
 *  - y: number — absolute y position
 *  - agentName: string
 */

const C = {
  desk: '#2d333b',
  deskTop: '#383f49',
  monitor: '#0d1117',
  monitorFrame: '#30363d',
  chair: '#444c56',
  chairSeat: '#3b424c',
  wallAccent: '#444c56',
};

const ACTIVITY_COLORS = {
  idle: '#484f58',
  thinking: '#d2a8ff',
  reading: '#58a6ff',
  editing: '#3fb950',
  running_command: '#f0883e',
  waiting_for_approval: '#f8e3a1',
  waiting_for_input: '#f8e3a1',
  done: '#3fb950',
  error: '#da3633',
};

const ACTIVITY_SCREEN = {
  idle: '...',
  thinking: '?  ?',
  reading: '≡ ≡',
  editing: '///',
  running_command: '> _',
  waiting_for_approval: 'Y/n',
  waiting_for_input: '?  ?',
  done: '✓ ✓',
  error: 'ERR',
};

export default function DeskStation({ activity = 'idle', occupied = false, x = 0, y = 0, agentName, onDropAgent }) {
  const color = ACTIVITY_COLORS[activity] || ACTIVITY_COLORS.idle;
  const screenText = ACTIVITY_SCREEN[activity] || '...';
  const isActive = occupied && !['idle', 'done', 'error'].includes(activity);
  const isApproval = activity === 'waiting_for_approval';
  const [dragOver, setDragOver] = useState(false);
  const canDrop = !occupied && onDropAgent;

  const handleDragOver = (e) => {
    if (!canDrop) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (!canDrop) return;
    const agentId = e.dataTransfer.getData('application/agent-id');
    if (agentId) onDropAgent(agentId);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        position: 'absolute',
        left: x - 40,
        top: y - 50,
        width: 80,
        height: 70,
        pointerEvents: canDrop ? 'auto' : 'none',
        borderRadius: 6,
        outline: dragOver ? '2px dashed #58a6ff' : 'none',
        outlineOffset: 2,
        background: dragOver ? 'rgba(88, 166, 255, 0.08)' : 'transparent',
        transition: 'outline 0.15s, background 0.15s',
      }}
    >
      {/* Monitor */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 16,
        width: 48,
        height: 30,
        background: C.monitor,
        border: `2px solid ${occupied ? color : C.monitorFrame}`,
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: occupied
          ? `0 0 12px ${color}33, inset 0 0 8px ${color}11`
          : 'none',
        animation: isApproval ? 'approval-pulse 2s ease-in-out infinite' : 'none',
      }}>
        {occupied && (
          <span style={{
            fontFamily: 'monospace',
            fontSize: 8,
            color,
            fontWeight: 700,
            animation: activity === 'editing' ? 'screen-type 0.5s ease-in-out infinite' :
                       activity === 'reading' ? 'screen-scroll 2s linear infinite' :
                       activity === 'running_command' ? 'cursor-blink 0.8s step-end infinite' :
                       'none',
          }}>
            {screenText}
          </span>
        )}
        {!occupied && (
          <div style={{
            width: 6, height: 6, borderRadius: '50%', background: '#21262d',
          }} />
        )}
      </div>

      {/* Monitor Stand */}
      <div style={{
        position: 'absolute',
        top: 30,
        left: 37,
        width: 6,
        height: 4,
        background: C.monitorFrame,
      }} />

      {/* Desk Surface */}
      <div style={{
        position: 'absolute',
        top: 34,
        left: 6,
        width: 68,
        height: 12,
        background: C.deskTop,
        borderRadius: 3,
        border: `1px solid ${C.wallAccent}`,
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      }}>
        {/* Keyboard area */}
        {occupied && (
          <div style={{
            position: 'absolute',
            bottom: 2,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 24,
            height: 4,
            background: '#21262d',
            borderRadius: 1,
            border: '1px solid #30363d',
            opacity: isActive ? 1 : 0.5,
          }} />
        )}
      </div>

      {/* Chair */}
      <div style={{
        position: 'absolute',
        top: 50,
        left: 26,
        width: 28,
        height: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          width: 28,
          height: 14,
          background: C.chairSeat,
          borderRadius: '10px 10px 4px 4px',
          border: `1px solid ${C.wallAccent}`,
        }} />
        <div style={{ width: 4, height: 3, background: C.desk }} />
        <div style={{ width: 20, height: 3, background: C.desk, borderRadius: 2 }} />
      </div>

      {/* Name tag below desk */}
      {agentName && (
        <div style={{
          position: 'absolute',
          top: 72,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 9,
          color: '#8b949e',
          whiteSpace: 'nowrap',
          fontWeight: 600,
          textAlign: 'center',
        }}>
          {agentName}
        </div>
      )}
    </div>
  );
}
