import React, { useState, useEffect } from 'react';
import { AGENT_ROLE, AGENT_VISUAL_STATE } from '@agent-deck/shared';
import * as api from '../../lib/api.js';

/* ─── colour tokens ─── */
const C = {
  bg: '#161b22',
  cardBg: '#0d1117',
  cardBorder: '#30363d',
  cardBorderHover: '#484f58',
  headerBg: '#383f49',
  headerBorder: '#444c56',
  text: '#e6edf3',
  muted: '#8b949e',
  dimmed: '#484f58',
  blue: '#58a6ff',
  purple: '#d2a8ff',
  orange: '#f0883e',
  green: '#3fb950',
  red: '#da3633',
  selectBg: '#0d1117',
  selectBorder: '#30363d',
};

const ROLE_COLOR = {
  [AGENT_ROLE.ARCHITECT]: C.purple,
  [AGENT_ROLE.DEV]: C.blue,
  [AGENT_ROLE.REVIEWER]: C.orange,
};

const ROLE_LABEL = {
  [AGENT_ROLE.ARCHITECT]: 'Architect',
  [AGENT_ROLE.DEV]: 'Developer',
  [AGENT_ROLE.REVIEWER]: 'Reviewer',
};

function getAgentStatus(visualState) {
  if (!visualState) return { label: 'Idle', color: C.dimmed };
  if (visualState === AGENT_VISUAL_STATE.WORKING_AT_DESK
    || visualState === AGENT_VISUAL_STATE.THINKING_AT_DESK) {
    return { label: 'Working', color: C.green };
  }
  if (visualState.includes('walking')) {
    return { label: 'Walking', color: C.blue };
  }
  return { label: 'Idle', color: C.dimmed };
}

/* ─── Inline edit popover for model/role ─── */
function AgentEditPopover({ agent, engines, onSave, onClose }) {
  const [engine, setEngine] = useState(agent.engine || 'copilot');
  const [role, setRole] = useState(agent.role || null);
  const [yolo, setYolo] = useState(agent.yolo || false);

  useEffect(() => {
    if (agent.role === AGENT_ROLE.REVIEWER) {
      setEngine('copilot');
    }
  }, [role]);

  const handleSave = () => {
    onSave(agent.id, { engine, role, yolo });
    onClose();
  };

  return (
    <div
      style={{
        position: 'absolute', top: 0, left: '100%', marginLeft: 8,
        width: 260, background: C.bg, border: `1px solid ${C.cardBorder}`,
        borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        zIndex: 300, padding: 12, display: 'flex', flexDirection: 'column', gap: 10,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
        Edit: {agent.name}
      </div>

      {/* Engine select */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>Model / Engine</label>
        <select
          value={engine}
          onChange={(e) => setEngine(e.target.value)}
          disabled={role === AGENT_ROLE.REVIEWER}
          style={{
            padding: '6px 8px', background: C.selectBg, color: C.text,
            border: `1px solid ${C.selectBorder}`, borderRadius: 6,
            fontSize: 12, fontFamily: 'inherit', outline: 'none',
            cursor: role === AGENT_ROLE.REVIEWER ? 'not-allowed' : 'pointer',
            opacity: role === AGENT_ROLE.REVIEWER ? 0.5 : 1,
          }}
        >
          {engines.map((eng) => (
            <option key={eng.id} value={eng.id}>{eng.label}</option>
          ))}
        </select>
      </div>

      {/* Role select */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>Role</label>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {[
            { id: null, label: 'None' },
            { id: AGENT_ROLE.ARCHITECT, label: 'Architect' },
            { id: AGENT_ROLE.DEV, label: 'Dev' },
            { id: AGENT_ROLE.REVIEWER, label: 'Reviewer' },
          ].map((opt) => (
            <button
              key={opt.id || 'none'}
              type="button"
              onClick={() => {
                setRole(opt.id);
                if (opt.id === AGENT_ROLE.REVIEWER) setEngine('copilot');
              }}
              style={{
                padding: '3px 8px', fontSize: 10, fontWeight: 600,
                border: `1px solid ${role === opt.id ? (ROLE_COLOR[opt.id] || C.blue) : C.cardBorder}`,
                borderRadius: 4, cursor: 'pointer',
                background: role === opt.id ? `${ROLE_COLOR[opt.id] || C.blue}22` : 'transparent',
                color: role === opt.id ? (ROLE_COLOR[opt.id] || C.blue) : C.muted,
                fontFamily: 'inherit',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Yolo toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>Yolo Mode</span>
        <button
          type="button"
          onClick={() => setYolo(!yolo)}
          style={{
            width: 32, height: 18, borderRadius: 9, border: 'none',
            background: yolo ? C.green : C.cardBorder, cursor: 'pointer',
            position: 'relative', transition: 'background 0.2s',
          }}
        >
          <span style={{
            position: 'absolute', top: 2, width: 14, height: 14,
            borderRadius: '50%', background: '#fff',
            left: yolo ? 16 : 2, transition: 'left 0.2s',
          }} />
        </button>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '4px 10px', fontSize: 11, fontWeight: 600,
            background: '#21262d', color: C.text, border: `1px solid ${C.cardBorder}`,
            borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          style={{
            padding: '4px 10px', fontSize: 11, fontWeight: 600,
            background: '#238636', color: '#fff', border: '1px solid rgba(240,246,252,0.1)',
            borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}

/* ─── Single Agent Card ─── */
function AgentCard({ agent, visualState, engines, isEditing, onEdit, onSaveEdit, onCloseEdit, onDelete }) {
  const status = getAgentStatus(visualState);
  const roleColor = ROLE_COLOR[agent.role] || C.muted;
  const isIdle = status.label === 'Idle';

  const handleDragStart = (e) => {
    e.dataTransfer.setData('application/agent-id', agent.id);
    e.dataTransfer.setData('text/plain', agent.name);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        draggable={isIdle}
        onDragStart={isIdle ? handleDragStart : undefined}
        style={{
          background: C.cardBg,
          border: `1px solid ${isEditing ? C.blue : C.cardBorder}`,
          borderRadius: 8,
          padding: '10px 12px',
          cursor: isIdle ? 'grab' : 'default',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          opacity: isIdle ? 1 : 0.7,
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          if (!isEditing) e.currentTarget.style.borderColor = C.cardBorderHover;
        }}
        onMouseLeave={(e) => {
          if (!isEditing) e.currentTarget.style.borderColor = C.cardBorder;
        }}
      >
        {/* Top row: name + status dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: status.color, flexShrink: 0,
            boxShadow: status.label === 'Working' ? `0 0 6px ${C.green}88` : 'none',
          }} />
          <div style={{
            fontSize: 13, fontWeight: 600, color: C.text,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            flex: 1,
          }}>
            {agent.name}
          </div>
          {/* Edit button */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(agent.id); }}
            title="Edit agent"
            style={{
              background: 'none', border: 'none', color: C.dimmed,
              cursor: 'pointer', padding: '2px 4px', fontSize: 12,
              borderRadius: 4, lineHeight: 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.dimmed)}
          >
            &#9881;
          </button>
          {/* Delete button */}
          {isIdle && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(agent.id); }}
              title="Delete agent"
              style={{
                background: 'none', border: 'none', color: C.dimmed,
                cursor: 'pointer', padding: '2px 4px', fontSize: 12,
                borderRadius: 4, lineHeight: 1,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.red)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.dimmed)}
            >
              &#10005;
            </button>
          )}
        </div>

        {/* Info row: role + engine */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {agent.role && (
            <span style={{
              fontSize: 9, fontWeight: 700, color: roleColor,
              textTransform: 'uppercase', letterSpacing: 1,
              background: `${roleColor}18`, padding: '1px 5px',
              borderRadius: 3,
            }}>
              {ROLE_LABEL[agent.role] || agent.role}
            </span>
          )}
          <span style={{
            fontSize: 9, color: C.dimmed,
            background: `${C.dimmed}18`, padding: '1px 5px',
            borderRadius: 3,
          }}>
            {agent.engine || 'copilot'}
          </span>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 9, color: status.color }}>
            {status.label}
          </span>
        </div>

        {/* Drag hint for idle agents */}
        {isIdle && (
          <div style={{
            fontSize: 9, color: C.dimmed, marginTop: 6,
            textAlign: 'center', fontStyle: 'italic',
          }}>
            Drag to desk to assign work
          </div>
        )}
      </div>

      {/* Edit popover */}
      {isEditing && (
        <AgentEditPopover
          agent={agent}
          engines={engines}
          onSave={onSaveEdit}
          onClose={onCloseEdit}
        />
      )}
    </div>
  );
}

/* ─── Main Panel ─── */
export default function AgentCardPanel({
  agents,
  visualStates,
  onUpdateAgent,
  onDeleteAgent,
  onCreateAgent,
}) {
  const [editingId, setEditingId] = useState(null);
  const [engines, setEngines] = useState([]);

  useEffect(() => {
    api.getEngines().then((r) => setEngines(r.engines || [])).catch(() => {});
  }, []);

  const handleSaveEdit = async (id, fields) => {
    await onUpdateAgent(id, fields);
    setEditingId(null);
  };

  const idleAgents = agents.filter((a) => {
    const vs = visualStates[a.id];
    return !vs || vs === AGENT_VISUAL_STATE.IDLE_AT_COFFEE
      || vs === AGENT_VISUAL_STATE.CHATTING_AT_COOLER
      || vs === AGENT_VISUAL_STATE.SITTING_ON_COUCH;
  });

  const workingAgents = agents.filter((a) => {
    const vs = visualStates[a.id];
    return vs === AGENT_VISUAL_STATE.WORKING_AT_DESK
      || vs === AGENT_VISUAL_STATE.THINKING_AT_DESK;
  });

  const walkingAgents = agents.filter((a) => {
    const vs = visualStates[a.id];
    return vs && vs.includes('walking');
  });

  return (
    <div style={{
      width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column',
      border: `2px solid #2d333b`, borderRadius: 8, overflow: 'hidden',
      background: C.bg, maxHeight: '100%',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', background: C.headerBg,
        borderBottom: `2px solid ${C.headerBorder}`,
      }}>
        <span style={{ fontSize: 14 }}>&#129302;</span>
        <span style={{
          fontSize: 11, fontWeight: 700, color: C.muted,
          textTransform: 'uppercase', letterSpacing: '1.5px',
        }}>
          Agents
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: C.dimmed }}>
          {agents.length}
        </span>
        {/* Create agent button */}
        <button
          type="button"
          onClick={onCreateAgent}
          title="New agent"
          style={{
            background: 'none', border: `1px solid ${C.cardBorder}`,
            color: C.muted, cursor: 'pointer', padding: '1px 6px',
            fontSize: 14, borderRadius: 4, lineHeight: 1, fontWeight: 700,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = C.blue;
            e.currentTarget.style.color = C.blue;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = C.cardBorder;
            e.currentTarget.style.color = C.muted;
          }}
        >
          +
        </button>
      </div>

      {/* Card list */}
      <div style={{
        flex: 1, overflow: 'auto', padding: 8,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {agents.length === 0 && (
          <div style={{
            padding: 20, textAlign: 'center', color: C.dimmed, fontSize: 12,
          }}>
            No agents yet.<br />
            Click + to create one.
          </div>
        )}

        {/* Idle agents first */}
        {idleAgents.length > 0 && (
          <div style={{
            fontSize: 9, fontWeight: 700, color: C.dimmed,
            textTransform: 'uppercase', letterSpacing: 1.5,
            padding: '4px 4px 2px',
          }}>
            Idle ({idleAgents.length})
          </div>
        )}
        {idleAgents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            visualState={visualStates[agent.id]}
            engines={engines}
            isEditing={editingId === agent.id}
            onEdit={setEditingId}
            onSaveEdit={handleSaveEdit}
            onCloseEdit={() => setEditingId(null)}
            onDelete={onDeleteAgent}
          />
        ))}

        {/* Walking agents */}
        {walkingAgents.length > 0 && (
          <div style={{
            fontSize: 9, fontWeight: 700, color: C.dimmed,
            textTransform: 'uppercase', letterSpacing: 1.5,
            padding: '4px 4px 2px', marginTop: 4,
          }}>
            Walking ({walkingAgents.length})
          </div>
        )}
        {walkingAgents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            visualState={visualStates[agent.id]}
            engines={engines}
            isEditing={editingId === agent.id}
            onEdit={setEditingId}
            onSaveEdit={handleSaveEdit}
            onCloseEdit={() => setEditingId(null)}
            onDelete={onDeleteAgent}
          />
        ))}

        {/* Working agents */}
        {workingAgents.length > 0 && (
          <div style={{
            fontSize: 9, fontWeight: 700, color: C.dimmed,
            textTransform: 'uppercase', letterSpacing: 1.5,
            padding: '4px 4px 2px', marginTop: 4,
          }}>
            Working ({workingAgents.length})
          </div>
        )}
        {workingAgents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            visualState={visualStates[agent.id]}
            engines={engines}
            isEditing={editingId === agent.id}
            onEdit={setEditingId}
            onSaveEdit={handleSaveEdit}
            onCloseEdit={() => setEditingId(null)}
            onDelete={onDeleteAgent}
          />
        ))}
      </div>
    </div>
  );
}
