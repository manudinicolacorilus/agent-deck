import React, { useState } from 'react';
import AgentDesk from './AgentDesk';
import WorkflowPanel from './WorkflowPanel';
import { AGENT_VISUAL_STATE, AGENT_ROLE } from '@agent-deck/shared';

/* ─── colour tokens ─── */
const C = {
  floor: '#1a1f27',
  floorTile: '#1e242c',
  wall: '#2d333b',
  wallTop: '#383f49',
  wallAccent: '#444c56',
  roomBg: '#161b22',
  desk: '#2d333b',
  deskTop: '#383f49',
  chair: '#444c56',
  chairSeat: '#3b424c',
  monitor: '#0d1117',
  monitorFrame: '#30363d',
  plant: '#2ea043',
  plantPot: '#6e4b2b',
  coffee: '#8b6914',
  rug: '#1c2333',
  doorway: '#0d1117',
};

/* ─── Furniture sub-components (pure CSS drawn) ─── */

function CoffeeMachine() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    }}>
      {/* Steam */}
      <div className="coffee-steam" style={{
        fontSize: 14, color: '#8b949e', letterSpacing: 2, marginBottom: -2,
      }}>
        ~ ~ ~
      </div>
      {/* Machine body */}
      <div style={{
        width: 44, height: 52, background: '#484f58', borderRadius: '6px 6px 4px 4px',
        border: '2px solid #6e7681', position: 'relative', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
        paddingBottom: 6,
      }}>
        {/* Display */}
        <div style={{
          width: 24, height: 8, background: '#3fb950', borderRadius: 2,
          position: 'absolute', top: 8, opacity: 0.8,
        }} />
        {/* Cup */}
        <div style={{
          width: 14, height: 12, background: '#e6edf3', borderRadius: '0 0 3px 3px',
          border: '2px solid #d0d7de', borderTop: 'none',
        }} />
      </div>
      <div style={{ fontSize: 10, color: '#484f58', marginTop: 4, fontWeight: 600 }}>
        COFFEE
      </div>
    </div>
  );
}

function Couch() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Back */}
      <div style={{
        width: 72, height: 10, background: '#3b424c', borderRadius: '6px 6px 0 0',
        border: '1px solid #484f58', borderBottom: 'none',
      }} />
      {/* Seat */}
      <div style={{
        width: 80, height: 18, background: '#444c56', borderRadius: '0 0 6px 6px',
        border: '1px solid #484f58', borderTop: '1px solid #555d66',
      }} />
    </div>
  );
}

function Plant({ size = 'md' }) {
  const s = size === 'sm' ? 0.7 : 1;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      transform: `scale(${s})`, transformOrigin: 'bottom center',
    }}>
      <div style={{ fontSize: 20 }}>🌿</div>
      <div style={{
        width: 16, height: 12, background: C.plantPot,
        borderRadius: '2px 2px 4px 4px', marginTop: -4,
      }} />
    </div>
  );
}

function WaterCooler() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div style={{
        width: 18, height: 22, background: '#58a6ff44', borderRadius: '8px 8px 2px 2px',
        border: '2px solid #58a6ff66',
      }} />
      <div style={{
        width: 22, height: 24, background: '#e6edf3', borderRadius: 4,
        border: '2px solid #d0d7de',
      }} />
      <div style={{ fontSize: 9, color: '#484f58', fontWeight: 600 }}>WATER</div>
    </div>
  );
}

function DeskFurniture({ occupied, screenColor, screenText }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
      position: 'relative',
    }}>
      {/* Monitor */}
      <div style={{
        width: 48, height: 30, background: C.monitor,
        border: `2px solid ${occupied ? (screenColor || C.monitorFrame) : C.monitorFrame}`,
        borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        boxShadow: occupied ? `0 0 12px ${screenColor}33` : 'none',
      }}>
        {occupied && screenText && (
          <span style={{
            fontFamily: 'monospace', fontSize: 8, color: screenColor, fontWeight: 700,
          }}>
            {screenText}
          </span>
        )}
        {!occupied && (
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#21262d' }} />
        )}
      </div>
      {/* Stand */}
      <div style={{ width: 6, height: 4, background: C.monitorFrame }} />
      {/* Desk surface */}
      <div style={{
        width: 68, height: 14, background: C.deskTop,
        borderRadius: 3, border: `1px solid ${C.wallAccent}`,
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      }} />
      {/* Chair */}
      <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: 28, height: 24, background: C.chairSeat,
          borderRadius: '10px 10px 4px 4px', border: `1px solid ${C.wallAccent}`,
        }} />
        <div style={{
          width: 4, height: 4, background: C.wall,
        }} />
        <div style={{
          width: 20, height: 3, background: C.wall, borderRadius: 2,
        }} />
      </div>
    </div>
  );
}

/* ─── Room components ─── */

function RoomHeader({ title, icon }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', background: C.wallTop, borderRadius: '6px 6px 0 0',
      borderBottom: `2px solid ${C.wallAccent}`,
    }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{
        fontSize: 11, fontWeight: 700, color: '#8b949e',
        textTransform: 'uppercase', letterSpacing: '1.5px',
      }}>
        {title}
      </span>
    </div>
  );
}

/* ─── Walking agent overlay ─── */
function WalkingAgentBubble({ agent, direction }) {
  const emoji = direction === 'toDesk' ? '🏃' : '🚶';
  const label = direction === 'toDesk' ? '→ desk' : '→ break room';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', background: '#161b22ee',
      border: '1px solid #30363d', borderRadius: 20,
      animation: 'agentBounce 0.5s ease-in-out infinite',
    }}>
      <span style={{ fontSize: 20 }}>{emoji}</span>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#e6edf3' }}>
          {agent.name}
        </span>
        <span style={{ fontSize: 9, color: '#8b949e' }}>{label}</span>
      </div>
    </div>
  );
}

/* ─── Idle agent in break room ─── */
function BreakRoomAgent({ agent, onClick, onDelete }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 10px', background: hover ? '#1c2333' : '#161b22',
        border: `1px solid ${hover ? '#58a6ff' : '#30363d'}`,
        borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s ease',
        minWidth: 0,
      }}
      onClick={() => onClick?.(agent)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      role="button"
      tabIndex={0}
      title="Click to assign work"
    >
      <span style={{ fontSize: 20, flexShrink: 0 }}>
        {agent.role === AGENT_ROLE.ARCHITECT ? '\uD83D\uDCC0' :
         agent.role === AGENT_ROLE.DEV ? '\uD83D\uDCBB' :
         agent.role === AGENT_ROLE.REVIEWER ? '\uD83D\uDD0D' : '\uD83E\uDDD1\u200D\uD83D\uDCBB'}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontWeight: 600, color: '#e6edf3',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {agent.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 10, color: '#8b949e' }}>{agent.engine}</span>
          {agent.role && (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
              background: agent.role === AGENT_ROLE.ARCHITECT ? '#d2a8ff22' :
                          agent.role === AGENT_ROLE.DEV ? '#58a6ff22' :
                          agent.role === AGENT_ROLE.REVIEWER ? '#f0883e22' : '#484f5822',
              color: agent.role === AGENT_ROLE.ARCHITECT ? '#d2a8ff' :
                     agent.role === AGENT_ROLE.DEV ? '#58a6ff' :
                     agent.role === AGENT_ROLE.REVIEWER ? '#f0883e' : '#8b949e',
              textTransform: 'uppercase', letterSpacing: 0.5,
            }}>
              {agent.role}
            </span>
          )}
        </div>
      </div>
      <span style={{
        fontSize: 10, color: '#3fb950', fontWeight: 700, flexShrink: 0,
      }}>
        idle
      </span>
      <button
        style={{
          background: 'none', border: 'none', color: '#484f58',
          cursor: 'pointer', fontSize: 14, padding: '2px 4px',
          borderRadius: 4, lineHeight: 1, flexShrink: 0,
        }}
        title="Delete agent"
        onClick={(e) => { e.stopPropagation(); onDelete?.(agent.id); }}
        onMouseEnter={(e) => (e.target.style.color = '#da3633')}
        onMouseLeave={(e) => (e.target.style.color = '#484f58')}
      >
        &times;
      </button>
    </div>
  );
}

/* ─── Desk cubicle for working agent ─── */
function DeskCubicle({ agent, session, activity, onClick }) {
  const [hover, setHover] = useState(false);
  const ACTIVITY_COLORS = {
    idle: '#484f58', thinking: '#d2a8ff', reading: '#58a6ff',
    editing: '#3fb950', running_command: '#f0883e',
    waiting_for_approval: '#f8e3a1', waiting_for_input: '#f8e3a1', done: '#3fb950', error: '#da3633',
  };
  const ACTIVITY_SCREEN = {
    idle: '...', thinking: '?  ?', reading: '≡ ≡', editing: '///',
    running_command: '> _', waiting_for_approval: 'Y/n', waiting_for_input: '?  ?', done: '✓ ✓', error: 'ERR',
  };
  const ACTIVITY_LABEL = {
    idle: 'Idle', thinking: 'Thinking...', reading: 'Reading',
    editing: 'Coding', running_command: 'Running', waiting_for_approval: 'Needs OK',
    waiting_for_input: 'Asking...', done: 'Done!', error: 'Error',
  };

  const color = ACTIVITY_COLORS[activity] || ACTIVITY_COLORS.idle;
  const screenText = ACTIVITY_SCREEN[activity] || '...';
  const label = ACTIVITY_LABEL[activity] || 'Idle';
  const isActive = !['idle', 'done', 'error'].includes(activity);

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        padding: '12px 10px 10px', background: hover ? '#1c2333' : C.roomBg,
        border: `1px solid ${hover ? '#58a6ff' : '#30363d'}`,
        borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s ease',
        width: 120, position: 'relative',
        boxShadow: isActive ? `0 0 16px ${color}22` : 'none',
      }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      role="button"
      tabIndex={0}
      title={`${agent?.name || session.label} — ${label}`}
    >
      {/* Desk with monitor */}
      <DeskFurniture occupied={true} screenColor={color} screenText={screenText} />

      {/* Agent emoji sitting on chair */}
      <div style={{
        fontSize: 22, lineHeight: 1, marginTop: -20,
        position: 'relative', zIndex: 2,
        filter: isActive ? `drop-shadow(0 0 4px ${color}66)` : 'none',
      }}>
        {activity === 'thinking' ? '🤔' :
         activity === 'reading' ? '📖' :
         activity === 'running_command' ? '⚡' :
         activity === 'waiting_for_approval' ? '✋' :
         activity === 'waiting_for_input' ? '💬' :
         activity === 'done' ? '✅' :
         activity === 'error' ? '❌' : '🧑‍💻'}
      </div>

      {/* Name */}
      <div style={{
        fontSize: 11, fontWeight: 600, color: '#e6edf3', marginTop: 2,
        textAlign: 'center', whiteSpace: 'nowrap',
        overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
      }}>
        {agent?.name || session.label || session.id.slice(0, 8)}
      </div>

      {/* Role badge */}
      {agent?.role && (
        <div style={{
          fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
          background: agent.role === 'architect' ? '#d2a8ff22' :
                      agent.role === 'dev' ? '#58a6ff22' :
                      agent.role === 'reviewer' ? '#f0883e22' : '#484f5822',
          color: agent.role === 'architect' ? '#d2a8ff' :
                 agent.role === 'dev' ? '#58a6ff' :
                 agent.role === 'reviewer' ? '#f0883e' : '#8b949e',
          textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          {agent.role}
        </div>
      )}

      {/* Status */}
      <div style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: 0.3 }}>
        {label}
      </div>

      {/* Activity bar */}
      {isActive && (
        <div style={{
          width: '70%', height: 3, background: '#21262d',
          borderRadius: 2, overflow: 'hidden', marginTop: 2,
        }}>
          <div style={{
            height: '100%', borderRadius: 2, background: color,
            animation: 'progressPulse 1.5s ease-in-out infinite',
          }} />
        </div>
      )}
    </div>
  );
}

function getSessionForAgent(agent, sessions) {
  if (!agent.currentSessionId) return null;
  return sessions.find((s) => s.id === agent.currentSessionId) || null;
}

/* ─── Main OfficeView ─── */
export default function OfficeView({
  agents,
  sessions,
  activities,
  visualStates,
  workflows,
  onClickIdleAgent,
  onClickWorkingAgent,
  onDeleteAgent,
  onCancelWorkflow,
}) {

  const idleAgents = agents.filter((a) => {
    const vs = visualStates[a.id];
    return vs === AGENT_VISUAL_STATE.IDLE_AT_COFFEE || !vs;
  });
  const walkingToDesk = agents.filter(
    (a) => visualStates[a.id] === AGENT_VISUAL_STATE.WALKING_TO_DESK
  );
  const workingAgents = agents.filter(
    (a) => visualStates[a.id] === AGENT_VISUAL_STATE.WORKING_AT_DESK
  );
  const walkingToCoffee = agents.filter(
    (a) => visualStates[a.id] === AGENT_VISUAL_STATE.WALKING_TO_COFFEE
  );
  const legacySessions = sessions.filter(
    (s) => !s.agentId && s.state === 'running'
  );

  const hasNoAgents = agents.length === 0 && sessions.length === 0;

  if (hasNoAgents) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', flex: 1, padding: 60, color: '#484f58', gap: 16,
      }}>
        <div style={{ fontSize: 40 }}>🏢</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#8b949e' }}>
          The office is empty
        </div>
        <div style={{
          fontSize: 14, color: '#484f58', textAlign: 'center', lineHeight: 1.6,
        }}>
          Create a persistent agent to see them in the break room,<br />
          or spawn a quick session.
        </div>
      </div>
    );
  }

  const allWalking = [...walkingToDesk, ...walkingToCoffee];

  return (
    <div style={{
      flex: 1, overflow: 'auto', background: C.floor,
      padding: 24, display: 'flex', flexDirection: 'column', gap: 0,
      minHeight: 0,
      /* subtle floor grid */
      backgroundImage: `
        linear-gradient(${C.floorTile}44 1px, transparent 1px),
        linear-gradient(90deg, ${C.floorTile}44 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
    }}>
      {/* Office header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px', marginBottom: 16,
        background: C.wall, borderRadius: 6,
        borderLeft: '4px solid #58a6ff',
      }}>
        <span style={{ fontSize: 16 }}>🏢</span>
        <span style={{
          fontSize: 12, fontWeight: 700, color: '#8b949e',
          textTransform: 'uppercase', letterSpacing: 2,
        }}>
          Agent Office — Floor Plan
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: '#484f58' }}>
          {agents.length} agent{agents.length !== 1 ? 's' : ''} •{' '}
          {workingAgents.length + legacySessions.length} working •{' '}
          {idleAgents.length} idle
        </span>
      </div>

      <div style={{
        display: 'flex', gap: 16, flex: 1, minHeight: 0,
      }}>

        {/* ═══ BREAK ROOM ═══ */}
        <div style={{
          width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column',
          border: `2px solid ${C.wall}`, borderRadius: 8, overflow: 'hidden',
          background: C.roomBg,
        }}>
          <RoomHeader title="Break Room" icon="☕" />

          <div style={{
            flex: 1, padding: 16, display: 'flex', flexDirection: 'column',
            gap: 16, overflow: 'auto',
          }}>
            {/* Coffee machine area */}
            <div style={{
              display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end',
              padding: '12px 8px', background: '#0d111766', borderRadius: 8,
              border: '1px dashed #30363d',
            }}>
              <CoffeeMachine />
              <WaterCooler />
              <Plant />
            </div>

            {/* Couch */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 4, padding: '8px 0',
            }}>
              <Couch />
              <div style={{ fontSize: 9, color: '#484f58' }}>lounge area</div>
            </div>

            {/* Idle agents list */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 6, flex: 1,
            }}>
              {idleAgents.length > 0 && (
                <div style={{
                  fontSize: 10, color: '#484f58', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: 1, padding: '0 2px',
                }}>
                  Hanging out ({idleAgents.length})
                </div>
              )}
              {idleAgents.map((agent) => (
                <BreakRoomAgent
                  key={agent.id}
                  agent={agent}
                  onClick={onClickIdleAgent}
                  onDelete={onDeleteAgent}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ═══ HALLWAY (walking agents) ═══ */}
        {allWalking.length > 0 && (
          <div style={{
            width: 120, flexShrink: 0, display: 'flex', flexDirection: 'column',
            border: `2px solid ${C.wall}`, borderRadius: 8, overflow: 'hidden',
            background: `repeating-linear-gradient(
              0deg, ${C.floorTile} 0px, ${C.floorTile} 38px,
              ${C.floor} 38px, ${C.floor} 40px
            )`,
          }}>
            <RoomHeader title="Hallway" icon="🚪" />
            <div style={{
              flex: 1, padding: 12, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 12,
            }}>
              {walkingToDesk.map((a) => (
                <WalkingAgentBubble key={a.id} agent={a} direction="toDesk" />
              ))}
              {walkingToCoffee.map((a) => (
                <WalkingAgentBubble key={a.id} agent={a} direction="toCoffee" />
              ))}
            </div>
          </div>
        )}

        {/* ═══ WORKFLOW BOARD ═══ */}
        {workflows && workflows.length > 0 && (
          <div style={{
            width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column',
            border: `2px solid ${C.wall}`, borderRadius: 8, overflow: 'hidden',
            background: C.roomBg,
          }}>
            <RoomHeader title="Workflow Board" icon="\uD83D\uDD04" />
            <div style={{
              flex: 1, padding: 12, overflow: 'auto',
            }}>
              <WorkflowPanel workflows={workflows} onCancel={onCancelWorkflow} />
            </div>
          </div>
        )}

        {/* ═══ WORKSPACE ═══ */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          border: `2px solid ${C.wall}`, borderRadius: 8, overflow: 'hidden',
          background: C.roomBg, minWidth: 0,
        }}>
          <RoomHeader title="Workspace" icon="💻" />

          <div style={{
            flex: 1, padding: 16, overflow: 'auto',
          }}>
            {/* Desk decoration row */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
              padding: '0 8px', marginBottom: 16,
            }}>
              <Plant size="sm" />
              <div style={{
                fontSize: 9, color: '#484f58', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: 1,
                borderBottom: '1px solid #30363d', paddingBottom: 4,
                flex: 1, textAlign: 'center', margin: '0 16px',
              }}>
                {workingAgents.length + legacySessions.length} desk{workingAgents.length + legacySessions.length !== 1 ? 's' : ''} occupied
              </div>
              <Plant size="sm" />
            </div>

            {/* Desk grid */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 16,
              alignItems: 'flex-start',
            }}>
              {/* Walking-to-desk agents get a temporary desk spot */}
              {walkingToDesk.map((agent) => (
                <div key={agent.id} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 4, padding: '12px 10px 10px', background: '#161b2288',
                  border: '1px dashed #30363d', borderRadius: 8, width: 120,
                }}>
                  <DeskFurniture occupied={false} />
                  <div style={{
                    fontSize: 10, color: '#8b949e', fontWeight: 600, marginTop: 4,
                  }}>
                    Reserved for
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 600, color: '#58a6ff',
                  }}>
                    {agent.name}
                  </div>
                </div>
              ))}

              {/* Working persistent agents */}
              {workingAgents.map((agent) => {
                const session = getSessionForAgent(agent, sessions);
                if (!session) return null;
                return (
                  <DeskCubicle
                    key={agent.id}
                    session={session}
                    agent={agent}
                    activity={activities[session.id] || 'idle'}
                    onClick={() => onClickWorkingAgent?.(agent)}
                  />
                );
              })}

              {/* Legacy sessions */}
              {legacySessions.map((session) => (
                <DeskCubicle
                  key={session.id}
                  session={session}
                  agent={null}
                  activity={activities[session.id] || 'idle'}
                  onClick={() => onClickWorkingAgent?.(null)}
                />
              ))}

              {workingAgents.length === 0 && walkingToDesk.length === 0 && legacySessions.length === 0 && (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', width: '100%', padding: 40, gap: 12,
                }}>
                  {/* Empty desks decoration */}
                  <div style={{ display: 'flex', gap: 24, opacity: 0.4 }}>
                    <DeskFurniture occupied={false} />
                    <DeskFurniture occupied={false} />
                    <DeskFurniture occupied={false} />
                  </div>
                  <div style={{ color: '#484f58', fontSize: 12, marginTop: 12, textAlign: 'center' }}>
                    No agents at their desks.<br />
                    Click an idle agent in the break room to assign work.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
