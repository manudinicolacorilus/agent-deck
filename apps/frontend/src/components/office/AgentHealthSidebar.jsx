import React, { useState, useEffect } from 'react';
import { AGENT_ROLE, AGENT_VISUAL_STATE } from '@agent-deck/shared';
import * as api from '../../lib/api.js';

/* ─── Role display config (ordered for display) ─── */
const ROLE_ORDER = [
  { key: AGENT_ROLE.SUPER_MASTER, label: 'Super-Master', accent: '#e879f9' },
  { key: AGENT_ROLE.MASTER,       label: 'Master',       accent: '#22d3ee' },
  { key: AGENT_ROLE.ARCHITECT,    label: 'Architect',    accent: '#a78bfa' },
  { key: AGENT_ROLE.EXPLORER,     label: 'Explorer',     accent: '#34d399' },
  { key: AGENT_ROLE.DEV,          label: 'Developer',    accent: '#60a5fa' },
  { key: AGENT_ROLE.INTEGRATOR,   label: 'Integrator',   accent: '#fbbf24' },
  { key: AGENT_ROLE.TESTER,       label: 'Tester',       accent: '#f87171' },
  { key: AGENT_ROLE.REVIEWER,     label: 'Reviewer',     accent: '#f0883e' },
  { key: AGENT_ROLE.RELEASER,     label: 'Releaser',     accent: '#c084fc' },
  { key: null,                    label: 'General',      accent: '#6b7280' },
];

/* ─── Status square colours ─── */
const SQ = {
  healthy:  '#22c55e',   // green  — idle / in office
  busy:     '#f97316',   // orange — working / walking
  inactive: '#1e2530',   // near-black — no state assigned
};

function agentStatus(visualState) {
  if (!visualState) return 'healthy';
  if (
    visualState === AGENT_VISUAL_STATE.WORKING_AT_DESK ||
    visualState === AGENT_VISUAL_STATE.THINKING_AT_DESK
  ) return 'busy';
  if (visualState.includes('walking')) return 'busy';
  return 'healthy';
}

/* ─── Tooltip for a hovered square ─── */
function Tooltip({ agent, status, style }) {
  const statusLabel = { healthy: 'Healthy', busy: 'Busy', inactive: 'Offline' };
  return (
    <div style={{
      position: 'fixed',
      ...style,
      zIndex: 9999,
      background: '#0a0d14',
      border: '1px solid #2a3040',
      borderRadius: 6,
      padding: '5px 9px',
      pointerEvents: 'none',
      boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
      whiteSpace: 'nowrap',
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3' }}>{agent.name}</div>
      <div style={{ fontSize: 10, color: SQ[status], marginTop: 2, fontWeight: 600 }}>
        ● {statusLabel[status]}
      </div>
      {agent.engine && (
        <div style={{ fontSize: 10, color: '#6b7280', marginTop: 1, textTransform: 'capitalize' }}>
          {agent.engine}
        </div>
      )}
    </div>
  );
}

/* ─── Single status square ─── */
function AgentSquare({ agent, visualState, onEdit }) {
  const status = agentStatus(visualState);
  const color = SQ[status];
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const handleMouseEnter = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left });
    setHovered(true);
  };

  return (
    <>
      <div
        title={agent.name}
        onClick={() => onEdit(agent.id)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 11,
          height: 11,
          borderRadius: 3,
          background: color,
          cursor: 'pointer',
          transition: 'transform 0.1s, filter 0.1s',
          flexShrink: 0,
          boxShadow: status === 'busy'
            ? `0 0 5px ${color}88`
            : status === 'healthy'
            ? `0 0 3px ${color}44`
            : 'none',
        }}
        onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.85)'; }}
        onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; setTimeout(() => { if (e.currentTarget) e.currentTarget.style.transform = 'scale(1)'; }, 120); }}
      />
      {hovered && (
        <Tooltip agent={agent} status={status} style={{ top: pos.top, left: pos.left }} />
      )}
    </>
  );
}

/* ─── Role section with tight square grid ─── */
function RoleSection({ roleKey, label, accent, agents, visualStates, onEdit }) {
  if (agents.length === 0) return null;

  const busyCount     = agents.filter(a => agentStatus(visualStates[a.id]) === 'busy').length;
  const healthyCount  = agents.filter(a => agentStatus(visualStates[a.id]) === 'healthy').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {/* Section label row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, color: accent,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
        }}>
          {label}
        </span>
        <span style={{ fontSize: 10, color: '#3a4455', fontWeight: 500 }}>
          ({agents.length})
        </span>
        {busyCount > 0 && (
          <span style={{
            marginLeft: 'auto', fontSize: 9, color: '#f97316',
            fontWeight: 600, letterSpacing: '0.02em',
          }}>{busyCount} busy</span>
        )}
      </div>

      {/* Dense grid of squares */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
      }}>
        {agents.map(agent => (
          <AgentSquare
            key={agent.id}
            agent={agent}
            visualState={visualStates[agent.id]}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Edit mini-modal ─── */
function QuickEditModal({ agent, engines, onSave, onClose }) {
  const [name, setName]     = useState(agent.name || '');
  const [engine, setEngine] = useState(agent.engine || 'copilot');
  const [role, setRole]     = useState(agent.role || null);
  const [yolo, setYolo]     = useState(agent.yolo || false);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 320, background: '#0d1017', border: '1px solid #1e2530',
          borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
          boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
          animation: 'scaleIn 0.15s ease both',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: '#c9d1d9', letterSpacing: '-0.1px' }}>
          Edit — {agent.name}
        </div>

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Name"
          style={{
            padding: '6px 8px', background: '#0a0d14', color: '#e6edf3',
            border: '1px solid #1e2530', borderRadius: 5, fontSize: 12,
            fontFamily: 'inherit', outline: 'none',
          }}
          onFocus={e => (e.target.style.borderColor = '#388bfd')}
          onBlur={e => (e.target.style.borderColor = '#1e2530')}
        />

        {/* Role select */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Role</span>
          <select
            value={role || ''}
            onChange={e => setRole(e.target.value || null)}
            style={{
              padding: '5px 8px', background: '#0a0d14', color: '#c9d1d9',
              border: '1px solid #1e2530', borderRadius: 5, fontSize: 12,
              fontFamily: 'inherit', cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="">None (General)</option>
            {ROLE_ORDER.filter(r => r.key !== null).map(r => (
              <option key={r.key} value={r.key}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Yolo toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: '#6b7280' }}>Yolo Mode</span>
          <button type="button" onClick={() => setYolo(!yolo)} style={{
            width: 32, height: 18, borderRadius: 9, border: 'none',
            background: yolo ? '#22c55e' : '#1e2530', cursor: 'pointer',
            position: 'relative', transition: 'background 0.2s',
          }}>
            <span style={{
              position: 'absolute', top: 2, width: 14, height: 14,
              borderRadius: '50%', background: '#fff',
              left: yolo ? 16 : 2, transition: 'left 0.2s',
            }} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{
            padding: '4px 12px', fontSize: 11, fontWeight: 600,
            background: 'transparent', color: '#6b7280',
            border: '1px solid #1e2530', borderRadius: 5, cursor: 'pointer',
            fontFamily: 'inherit',
          }}>Cancel</button>
          <button type="button" onClick={() => { onSave(agent.id, { name, engine, role, yolo }); onClose(); }}
            disabled={!name.trim()} style={{
              padding: '4px 12px', fontSize: 11, fontWeight: 600,
              background: '#166534', color: '#fff',
              border: '1px solid #15803d', borderRadius: 5,
              cursor: name.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
            }}>Save</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Status legend strip ─── */
function Legend() {
  const items = [
    { color: SQ.healthy,  label: 'Healthy' },
    { color: SQ.busy,     label: 'Busy' },
    { color: SQ.inactive, label: 'Offline', border: '1px solid #2a3040' },
  ];
  return (
    <div style={{
      display: 'flex', gap: 10, padding: '7px 14px',
      borderTop: '1px solid #111720', background: '#080b10', flexShrink: 0,
    }}>
      {items.map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{
            width: 8, height: 8, borderRadius: 2,
            background: item.color, display: 'inline-block',
            border: item.border || 'none',
          }} />
          <span style={{ fontSize: 9, color: '#3a4455', fontWeight: 500 }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Main export ─── */
export default function AgentHealthSidebar({
  agents,
  visualStates,
  onUpdateAgent,
  onDeleteAgent,
  onCreateAgent,
}) {
  const [editingId, setEditingId] = useState(null);
  const [engines, setEngines]     = useState([]);

  useEffect(() => {
    api.getEngines().then(r => setEngines(r.engines || [])).catch(() => {});
  }, []);

  // Group agents by role
  const grouped = {};
  for (const r of ROLE_ORDER) grouped[r.key ?? '__general__'] = [];
  for (const agent of agents) {
    const k = agent.role && grouped[agent.role] !== undefined ? agent.role : '__general__';
    grouped[k].push(agent);
  }

  const aliveCount = agents.length;
  const busyTotal  = agents.filter(a => agentStatus(visualStates[a.id]) === 'busy').length;

  const editingAgent = editingId ? agents.find(a => a.id === editingId) : null;

  return (
    <div style={{
      width: 196,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      background: '#080b10',
      borderRight: '1px solid #111720',
      overflow: 'hidden',
      fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: '12px 14px 10px',
        borderBottom: '1px solid #111720',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{
            fontSize: 13, fontWeight: 700, color: '#e6edf3',
            letterSpacing: '-0.3px',
          }}>
            Agents{' '}
            <span style={{ color: '#3a4455', fontWeight: 500 }}>({aliveCount} alive)</span>
          </span>
          <button
            type="button"
            onClick={onCreateAgent}
            title="New agent"
            style={{
              background: 'none', border: '1px solid #1e2530',
              color: '#4b5563', cursor: 'pointer',
              width: 20, height: 20, borderRadius: 4,
              fontSize: 14, lineHeight: '18px', fontWeight: 700,
              transition: 'border-color 0.15s, color 0.15s',
              padding: 0, textAlign: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#60a5fa'; e.currentTarget.style.color = '#60a5fa'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2530'; e.currentTarget.style.color = '#4b5563'; }}
          >+</button>
        </div>

        {/* Live activity bar */}
        {aliveCount > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{
              height: 3, borderRadius: 2,
              background: '#1e2530',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${Math.round((busyTotal / aliveCount) * 100)}%`,
                background: '#f97316',
                borderRadius: 2,
                transition: 'width 0.6s ease',
              }} />
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginTop: 4,
            }}>
              <span style={{ fontSize: 9, color: '#3a4455' }}>
                {busyTotal} busy
              </span>
              <span style={{ fontSize: 9, color: '#3a4455' }}>
                {aliveCount - busyTotal} idle
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Role sections ── */}
      <div
        className="thin-scrollbar"
        style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          padding: '10px 14px',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}
      >
        {agents.length === 0 && (
          <div style={{
            paddingTop: 32, textAlign: 'center',
            color: '#1e2a38', fontSize: 11, lineHeight: 1.7,
          }}>
            No agents yet.<br />
            <span
              onClick={onCreateAgent}
              style={{ color: '#1d3a5f', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Create one
            </span>
          </div>
        )}

        {ROLE_ORDER.map(({ key, label, accent }) => {
          const group = grouped[key ?? '__general__'] || [];
          return (
            <RoleSection
              key={key ?? '__general__'}
              roleKey={key}
              label={label}
              accent={accent}
              agents={group}
              visualStates={visualStates}
              onEdit={setEditingId}
            />
          );
        })}
      </div>

      {/* ── Legend ── */}
      <Legend />

      {editingAgent && (
        <QuickEditModal
          agent={editingAgent}
          engines={engines}
          onSave={onUpdateAgent}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  );
}
