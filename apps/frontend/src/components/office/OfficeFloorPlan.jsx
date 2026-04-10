import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AGENT_VISUAL_STATE, AGENT_ROLE } from '@agent-deck/shared';
import CharacterSprite from './CharacterSprite';
import SpeechBubble from './SpeechBubble';
import ActionIndicator from './ActionIndicator';
import DeskStation from './DeskStation';

/* ─── colour tokens ─── */
const C = {
  floor: '#f0f4f8',
  floorTile: '#e8edf3',
  wall: '#b0bec5',
  wallTop: '#dde4ed',
  wallAccent: '#c8d3df',
  roomBg: '#f8fafc',
  doorway: '#e2e8f0',
};

/* ─── Furniture drawn at absolute positions ─── */

function AbsCoffeeMachine({ x, y }) {
  return (
    <div style={{ position: 'absolute', left: x - 22, top: y - 30 }}>
      <div style={{
        fontSize: 12, color: '#94a3b8', letterSpacing: 2, textAlign: 'center',
        animation: 'coffeeStream 2s ease-in-out infinite',
      }}>
        ~ ~
      </div>
      <div style={{
        width: 44, height: 48, background: '#78909c', borderRadius: '6px 6px 4px 4px',
        border: '2px solid #90a4ae', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 6, position: 'relative',
      }}>
        <div style={{
          width: 22, height: 7, background: '#3fb950', borderRadius: 2,
          position: 'absolute', top: 8, opacity: 0.8,
        }} />
        <div style={{
          width: 12, height: 10, background: '#e6edf3', borderRadius: '0 0 3px 3px',
          border: '2px solid #d0d7de', borderTop: 'none',
        }} />
      </div>
      <div style={{ fontSize: 8, color: '#94a3b8', fontWeight: 600, textAlign: 'center', marginTop: 2 }}>
        COFFEE
      </div>
    </div>
  );
}

function AbsWaterCooler({ x, y }) {
  return (
    <div style={{ position: 'absolute', left: x - 12, top: y - 28 }}>
      <div style={{
        width: 18, height: 20, background: '#58a6ff44', borderRadius: '8px 8px 2px 2px',
        border: '2px solid #58a6ff66',
      }} />
      <div style={{
        width: 22, height: 22, background: '#e6edf3', borderRadius: 4,
        border: '2px solid #d0d7de', marginLeft: -2,
      }} />
      <div style={{ fontSize: 7, color: '#94a3b8', fontWeight: 600, textAlign: 'center', marginTop: 1 }}>
        WATER
      </div>
    </div>
  );
}

function AbsCouch({ x, y }) {
  return (
    <div style={{ position: 'absolute', left: x - 40, top: y - 14 }}>
      <div style={{
        width: 72, height: 10, background: '#b0bec5', borderRadius: '6px 6px 0 0',
        border: '1px solid #90a4ae', borderBottom: 'none',
      }} />
      <div style={{
        width: 80, height: 18, background: '#cfd8dc', borderRadius: '0 0 6px 6px',
        border: '1px solid #b0bec5', borderTop: '1px solid #cfd8dc',
      }} />
      <div style={{ fontSize: 7, color: '#94a3b8', textAlign: 'center', marginTop: 2 }}>
        lounge
      </div>
    </div>
  );
}

function AbsPlant({ x, y, size = 1 }) {
  return (
    <div style={{
      position: 'absolute', left: x - 10, top: y - 16,
      transform: `scale(${size})`, transformOrigin: 'bottom center',
    }}>
      <div style={{ fontSize: 18, textAlign: 'center' }}>🌿</div>
      <div style={{
        width: 14, height: 10, background: '#6e4b2b',
        borderRadius: '2px 2px 4px 4px', margin: '-3px auto 0',
      }} />
    </div>
  );
}

/* ─── Room walls with doorways ─── */

function BreakRoomWalls() {
  // Break room: left box from (20, 80) to (240, 370)
  return (
    <div style={{
      position: 'absolute', left: 20, top: 80, width: 220, height: 290,
      border: `3px solid ${C.wall}`,
      borderRadius: 8,
      background: `${C.roomBg}cc`,
      boxShadow: `inset 0 0 20px ${C.floor}`,
    }}>
      {/* Room label */}
      <div style={{
        position: 'absolute', top: -1, left: -1, right: -1,
        background: C.wallTop, borderRadius: '6px 6px 0 0',
        padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5,
        borderBottom: `2px solid ${C.wallAccent}`,
      }}>
        <span style={{ fontSize: 12 }}>☕</span>
        <span style={{
          fontSize: 10, fontWeight: 700, color: '#64748b',
          textTransform: 'uppercase', letterSpacing: 1.5,
        }}>
          Break Room
        </span>
      </div>
      {/* Door opening on right wall */}
      <div style={{
        position: 'absolute', right: -4, top: 160, width: 8, height: 50,
        background: C.doorway, borderRadius: 2,
        boxShadow: '0 0 8px rgba(0,0,0,0.5)',
      }} />
    </div>
  );
}

function WorkspaceWalls() {
  // Workspace: right box from (460, 80) to (1160, 370)
  return (
    <div style={{
      position: 'absolute', left: 460, top: 80, width: 700, height: 290,
      border: `3px solid ${C.wall}`,
      borderRadius: 8,
      background: `${C.roomBg}cc`,
      boxShadow: `inset 0 0 20px ${C.floor}`,
    }}>
      {/* Room label */}
      <div style={{
        position: 'absolute', top: -1, left: -1, right: -1,
        background: C.wallTop, borderRadius: '6px 6px 0 0',
        padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5,
        borderBottom: `2px solid ${C.wallAccent}`,
      }}>
        <span style={{ fontSize: 12 }}>💻</span>
        <span style={{
          fontSize: 10, fontWeight: 700, color: '#64748b',
          textTransform: 'uppercase', letterSpacing: 1.5,
        }}>
          Workspace
        </span>
      </div>
      {/* Door opening on left wall */}
      <div style={{
        position: 'absolute', left: -4, top: 160, width: 8, height: 50,
        background: C.doorway, borderRadius: 2,
        boxShadow: '0 0 8px rgba(0,0,0,0.5)',
      }} />
    </div>
  );
}

function HallwayFloor() {
  // Hallway connecting the two rooms
  return (
    <div style={{
      position: 'absolute', left: 230, top: 230, width: 240, height: 60,
      background: `repeating-linear-gradient(
        90deg, ${C.floorTile} 0px, ${C.floorTile} 38px,
        ${C.floor} 38px, ${C.floor} 40px
      )`,
      borderTop: `2px solid ${C.wall}`,
      borderBottom: `2px solid ${C.wall}`,
      opacity: 0.7,
    }}>
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: 9, color: '#94a3b866', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: 2,
      }}>
        HALLWAY
      </div>
    </div>
  );
}

/* ─── Animation state mapping ─── */

function getCharacterAnimation(visualState, activity) {
  if (!visualState) return 'idle';
  if (visualState.includes('walking')) return 'walking';
  if (visualState === AGENT_VISUAL_STATE.WORKING_AT_DESK) {
    if (activity === 'editing') return 'typing';
    if (activity === 'thinking') return 'thinking';
    if (activity === 'reading') return 'idle'; // subtle
    if (activity === 'running_command') return 'typing';
    return 'idle';
  }
  if (visualState === AGENT_VISUAL_STATE.THINKING_AT_DESK) return 'thinking';
  if (visualState === AGENT_VISUAL_STATE.CHATTING_AT_COOLER) return 'talking';
  if (visualState === AGENT_VISUAL_STATE.IDLE_AT_COFFEE) return 'sipping';
  if (visualState === AGENT_VISUAL_STATE.SITTING_ON_COUCH) return 'idle';
  return 'idle';
}

/**
 * Main 2D floor plan component.
 * Renders the office as a top-down map with characters at absolute positions.
 *
 * Props:
 *  - agents, sessions, activities, visualStates (from App)
 *  - positions: from useCharacterPositions
 *  - deskAssignments: from useCharacterPositions
 *  - getDeskPosition: from useCharacterPositions
 *  - bubbles: from useAgentInteractions
 *  - onClickIdleAgent, onClickWorkingAgent, onDeleteAgent
 */
export default function OfficeFloorPlan({
  agents,
  sessions,
  activities,
  visualStates,
  positions,
  deskAssignments,
  getDeskPosition,
  bubbles,
  onClickIdleAgent,
  onClickWorkingAgent,
  onDeleteAgent,
  onDropAgentOnDesk,
}) {
  const [hoveredAgent, setHoveredAgent] = useState(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  const CANVAS_W = 1200;
  const CANVAS_H = 440;

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setScale(Math.min(width / CANVAS_W, height / CANVAS_H));
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Map session IDs to activities for agents
  const getAgentActivity = (agent) => {
    if (!agent.currentSessionId) return 'idle';
    return activities[agent.currentSessionId] || 'idle';
  };

  // Count stats
  const idleCount = agents.filter((a) => {
    const vs = visualStates[a.id];
    return !vs || vs === AGENT_VISUAL_STATE.IDLE_AT_COFFEE
      || vs === AGENT_VISUAL_STATE.CHATTING_AT_COOLER
      || vs === AGENT_VISUAL_STATE.SITTING_ON_COUCH;
  }).length;

  const workingCount = agents.filter((a) => {
    const vs = visualStates[a.id];
    return vs === AGENT_VISUAL_STATE.WORKING_AT_DESK
      || vs === AGENT_VISUAL_STATE.THINKING_AT_DESK;
  }).length;

  // Render desk stations for assigned desks
  const deskStations = useMemo(() => {
    const stations = [];
    // Always show 8 desk positions
    for (let i = 0; i < 8; i++) {
      const pos = getDeskPosition(i);
      const assignedAgent = Object.entries(deskAssignments).find(([, idx]) => idx === i);
      const agent = assignedAgent ? agents.find((a) => a.id === assignedAgent[0]) : null;
      const activity = agent ? getAgentActivity(agent) : 'idle';

      stations.push(
        <DeskStation
          key={`desk-${i}`}
          x={pos.x}
          y={pos.y}
          occupied={!!agent}
          activity={activity}
          agentName={agent?.name}
          onDropAgent={onDropAgentOnDesk}
        />
      );
    }
    return stations;
  }, [deskAssignments, agents, activities, getDeskPosition]);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: C.floor,
      }}
    >
    <div style={{
      position: 'relative',
      width: CANVAS_W,
      height: CANVAS_H,
      transform: `scale(${scale})`,
      transformOrigin: 'center center',
      flexShrink: 0,
      /* Floor tile pattern */
      background: C.floor,
      backgroundImage: `
        linear-gradient(${C.floorTile}44 1px, transparent 1px),
        linear-gradient(90deg, ${C.floorTile}44 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
      borderRadius: 12,
      overflow: 'hidden',
      border: `2px solid ${C.wall}`,
      boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
    }}>
      {/* Room structures */}
      <BreakRoomWalls />
      <HallwayFloor />
      <WorkspaceWalls />

      {/* Break room furniture */}
      <AbsCoffeeMachine x={70} y={160} />
      <AbsWaterCooler x={155} y={160} />
      <AbsPlant x={200} y={140} size={0.8} />
      <AbsCouch x={120} y={310} />
      <AbsPlant x={40} y={340} size={0.7} />

      {/* Workspace furniture plants */}
      <AbsPlant x={480} y={110} size={0.7} />
      <AbsPlant x={1130} y={110} size={0.7} />

      {/* Desk stations */}
      {deskStations}

      {/* Character sprites at their positions */}
      {agents.map((agent) => {
        const pos = positions[agent.id];
        if (!pos) return null;

        const vs = visualStates[agent.id];
        const activity = getAgentActivity(agent);
        const animation = getCharacterAnimation(vs, activity);
        const isIdle = !vs || vs === AGENT_VISUAL_STATE.IDLE_AT_COFFEE
          || vs === AGENT_VISUAL_STATE.CHATTING_AT_COOLER
          || vs === AGENT_VISUAL_STATE.SITTING_ON_COUCH;
        const isWorking = vs === AGENT_VISUAL_STATE.WORKING_AT_DESK
          || vs === AGENT_VISUAL_STATE.THINKING_AT_DESK;
        const isHovered = hoveredAgent === agent.id;
        const bubble = bubbles?.[agent.id];

        return (
          <div
            key={agent.id}
            style={{
              position: 'absolute',
              left: pos.x - 16,
              top: pos.y - 16,
              zIndex: 50 + Math.round(pos.y / 10),
              cursor: 'pointer',
              transition: pos.moving ? 'none' : 'left 0.3s, top 0.3s',
            }}
            onClick={() => {
              if (isIdle) onClickIdleAgent?.(agent);
              else if (isWorking) onClickWorkingAgent?.(agent);
            }}
            onMouseEnter={() => setHoveredAgent(agent.id)}
            onMouseLeave={() => setHoveredAgent(null)}
          >
            <CharacterSprite
              name={agent.name}
              role={agent.role}
              animation={animation}
              facing={pos.facing || 'down'}
              size={1}
              skinColor={agent.skinColor || null}
              hat={agent.hat || null}
              pet={agent.pet || null}
            />

            {/* Agent name on hover */}
            {isHovered && (
              <div style={{
                position: 'absolute',
                top: -18,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 10,
                fontWeight: 700,
                color: '#0f172a',
                background: 'rgba(248,250,252,0.95)',
                padding: '2px 6px',
                borderRadius: 4,
                whiteSpace: 'nowrap',
                border: '1px solid #e2e8f0',
                zIndex: 200,
              }}>
                {agent.name}
                {agent.role && (
                  <span style={{
                    marginLeft: 4,
                    fontSize: 8,
                    color: agent.role === 'architect' ? '#d2a8ff' :
                           agent.role === 'dev' ? '#58a6ff' :
                           agent.role === 'reviewer' ? '#f0883e' : '#8b949e',
                    textTransform: 'uppercase',
                  }}>
                    {agent.role}
                  </span>
                )}
              </div>
            )}

            {/* Delete button on hover for idle agents */}
            {isHovered && isIdle && (
              <div
                style={{
                  position: 'absolute',
                  top: -18,
                  right: -12,
                  width: 16,
                  height: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(220,38,38,0.2)',
                  borderRadius: '50%',
                  fontSize: 10,
                  color: '#dc2626',
                  cursor: 'pointer',
                  zIndex: 201,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteAgent?.(agent.id);
                }}
              >
                ×
              </div>
            )}

            {/* Activity indicator for working agents */}
            {isWorking && (
              <ActionIndicator
                activity={activity}
                x={0}
                y={0}
              />
            )}

            {/* Speech/thought bubble */}
            {bubble && (
              <SpeechBubble
                type={bubble.type}
                text={bubble.text}
                visible={bubble.visible}
                x={16}
                y={0}
              />
            )}

            {/* Thought bubble for thinking activity */}
            {activity === 'thinking' && isWorking && (
              <SpeechBubble
                type="thought"
                text="..."
                visible={true}
                x={16}
                y={0}
              />
            )}
          </div>
        );
      })}

      {/* Stats bar at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '4px 12px',
        background: `${C.wall}dd`,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        fontSize: 10,
        color: '#8b949e',
        borderTop: `1px solid ${C.wallAccent}`,
      }}>
        <span>🏢 Agent Office</span>
        <span style={{ flex: 1 }} />
        <span>{agents.length} agent{agents.length !== 1 ? 's' : ''}</span>
        <span>•</span>
        <span style={{ color: '#3fb950' }}>{workingCount} working</span>
        <span>•</span>
        <span style={{ color: '#484f58' }}>{idleCount} idle</span>
      </div>
    </div>
    </div>
  );
}
