import React, { useState, useEffect } from 'react';
import { AGENT_ROLE, AGENT_VISUAL_STATE } from '@agent-deck/shared';
import * as api from '../../lib/api.js';

/* Role display config */
const ROLE_ORDER = [
  { key: AGENT_ROLE.SUPER_MASTER, label: 'Super-Master', accent: '#9333ea' },
  { key: AGENT_ROLE.MASTER,       label: 'Master',       accent: '#0891b2' },
  { key: AGENT_ROLE.ARCHITECT,    label: 'Architect',    accent: '#7c3aed' },
  { key: AGENT_ROLE.EXPLORER,     label: 'Explorer',     accent: '#059669' },
  { key: AGENT_ROLE.DEV,          label: 'Developer',    accent: '#2563eb' },
  { key: AGENT_ROLE.INTEGRATOR,   label: 'Integrator',   accent: '#d97706' },
  { key: AGENT_ROLE.TESTER,       label: 'Tester',       accent: '#dc2626' },
  { key: AGENT_ROLE.REVIEWER,     label: 'Reviewer',     accent: '#ea580c' },
  { key: AGENT_ROLE.RELEASER,     label: 'Releaser',     accent: '#7c3aed' },
  { key: null,                    label: 'General',      accent: '#6b7280' },
];

/* Status square colours - light-friendly */
const SQ = {
  healthy:  '#16a34a',
  busy:     '#ea580c',
  inactive: '#e2e8f0',
};

const T = {
  bg:      '#f8fafc',
  surface: '#ffffff',
  border:  '#e2e8f0',
  text:    '#0f172a',
  muted:   '#64748b',
  dimmed:  '#94a3b8',
  hover:   '#f1f5f9',
  accent:  '#2563eb',
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

function Tooltip({ agent, status, style }) {
  const statusLabel = { healthy: 'Healthy', busy: 'Busy', inactive: 'Offline' };
  const statusColor = { healthy: '#16a34a', busy: '#ea580c', inactive: '#94a3b8' };
  return (
    <div style={{
      position: 'fixed', ...style, zIndex: 9999,
      background: '#1e293b', border: '1px solid #334155',
      borderRadius: 7, padding: '6px 10px',
      pointerEvents: 'none',
      boxShadow: '0 8px 24px rgba(15,23,42,0.25)',
      whiteSpace: 'nowrap',
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{agent.name}</div>
      <div style={{ fontSize: 11, color: statusColor[status], marginTop: 2, fontWeight: 600 }}>
        {statusLabel[status]}
      </div>
      {agent.engine && (
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1, textTransform: 'capitalize' }}>
          {agent.engine}
        </div>
      )}
    </div>
  );
}

function AgentSquare({ agent, visualState, onEdit }) {
  const status = agentStatus(visualState);
  const color  = SQ[status];
  const [hovered, setHovered] = useState(false);
  const [pos, setPos]         = useState({ top: 0, left: 0 });

  const handleMouseEnter = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left });
    setHovered(true);
  };

  return (
    <>
      <div
        onClick={() => onEdit(agent.id)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setHovered(false)}
        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.82)')}
        onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.1)'; setTimeout(() => { if (e.currentTarget) e.currentTarget.style.transform = 'scale(1)'; }, 110); }}
        style={{
          width: 13, height: 13, borderRadius: 3,
          background: color,
          border: status === 'inactive' ? '1px solid #cbd5e1' : 'none',
          cursor: 'pointer', flexShrink: 0,
          transition: 'transform 0.1s',
          boxShadow: status === 'busy' ? '0 0 5px rgba(234,88,12,0.45)' : status === 'healthy' ? '0 0 4px rgba(22,163,74,0.3)' : 'none',
        }}
      />
      {hovered && <Tooltip agent={agent} status={status} style={{ top: pos.top, left: pos.left }} />}
    </>
  );
}

function RoleSection({ label, accent, agents, visualStates, onEdit }) {
  if (agents.length === 0) return null;
  const busyCount = agents.filter(a => agentStatus(visualStates[a.id]) === 'busy').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: accent, flexShrink: 0, display: 'inline-block',
        }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: T.text, letterSpacing: '-0.1px' }}>
          {label}
        </span>
        <span style={{ fontSize: 11, color: T.dimmed, fontWeight: 500 }}>
          ({agents.length})
        </span>
        {busyCount > 0 && (
          <span style={{
            marginLeft: 'auto', fontSize: 10, color: '#ea580c', fontWeight: 700,
            background: '#fff7ed', padding: '1px 6px', borderRadius: 10,
            border: '1px solid #fed7aa',
          }}>{busyCount}</span>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, paddingLeft: 15 }}>
        {agents.map(agent => (
          <AgentSquare key={agent.id} agent={agent} visualState={visualStates[agent.id]} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
}

function QuickEditModal({ agent, onSave, onClose }) {
  const [name, setName] = useState(agent.name || '');
  const [role, setRole] = useState(agent.role || null);
  const [yolo, setYolo] = useState(agent.yolo || false);

  const inputStyle = {
    padding: '7px 10px', background: T.hover, color: T.text,
    border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 13,
    fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 340, background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 14,
          boxShadow: '0 20px 60px rgba(15,23,42,0.18)',
          animation: 'scaleIn 0.15s ease both',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
          Edit Agent
          <span style={{ fontSize: 12, color: T.muted, fontWeight: 500, marginLeft: 6 }}>
            — {agent.name}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} style={inputStyle}
            onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)'; }}
            onBlur={e  => { e.target.style.borderColor = T.border;  e.target.style.boxShadow = 'none'; }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Role</label>
          <select value={role || ''} onChange={e => setRole(e.target.value || null)}
            style={{ ...inputStyle, cursor: 'pointer' }}
            onFocus={e => (e.target.style.borderColor = T.accent)}
            onBlur={e  => (e.target.style.borderColor = T.border)}
          >
            <option value="">None (General)</option>
            {ROLE_ORDER.filter(r => r.key !== null).map(r => (
              <option key={r.key} value={r.key}>{r.label}</option>
            ))}
          </select>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', background: T.hover, borderRadius: 7, border: `1px solid ${T.border}`,
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Yolo Mode</div>
            <div style={{ fontSize: 11, color: T.muted }}>Auto-accept all actions</div>
          </div>
          <button type="button" onClick={() => setYolo(!yolo)} style={{
            width: 36, height: 20, borderRadius: 10, border: 'none',
            background: yolo ? '#16a34a' : '#cbd5e1', cursor: 'pointer',
            position: 'relative', transition: 'background 0.2s',
          }}>
            <span style={{
              position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%',
              background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              left: yolo ? 18 : 2, transition: 'left 0.2s',
            }} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4, borderTop: `1px solid ${T.border}` }}>
          <button type="button" onClick={onClose} style={{
            padding: '6px 16px', fontSize: 12, fontWeight: 600,
            background: 'transparent', color: T.muted, border: `1px solid ${T.border}`,
            borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit',
          }}>Cancel</button>
          <button type="button"
            onClick={() => { onSave(agent.id, { name, role, yolo }); onClose(); }}
            disabled={!name.trim()}
            style={{
              padding: '6px 16px', fontSize: 12, fontWeight: 600,
              background: name.trim() ? T.accent : T.border,
              color: name.trim() ? '#fff' : T.dimmed,
              border: 'none', borderRadius: 6,
              cursor: name.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
            }}
          >Save</button>
        </div>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '9px 16px',
      borderTop: `1px solid ${T.border}`, background: T.surface, flexShrink: 0,
    }}>
      {[
        { color: SQ.healthy,  label: 'Healthy' },
        { color: SQ.busy,     label: 'Busy' },
        { color: SQ.inactive, label: 'Offline', border: '1px solid #cbd5e1' },
      ].map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{
            width: 9, height: 9, borderRadius: 2,
            background: item.color, display: 'inline-block',
            border: item.border || 'none', flexShrink: 0,
          }} />
          <span style={{ fontSize: 11, color: T.muted, fontWeight: 500 }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

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

  const grouped = {};
  for (const r of ROLE_ORDER) grouped[r.key ?? '__general__'] = [];
  for (const agent of agents) {
    const k = agent.role && grouped[agent.role] !== undefined ? agent.role : '__general__';
    grouped[k].push(agent);
  }

  const aliveCount = agents.length;
  const busyTotal  = agents.filter(a => agentStatus(visualStates[a.id]) === 'busy').length;
  const busyPct    = aliveCount > 0 ? Math.round((busyTotal / aliveCount) * 100) : 0;
  const editingAgent = editingId ? agents.find(a => a.id === editingId) : null;

  return (
    <div style={{
      width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column',
      background: T.bg, borderRight: `1px solid ${T.border}`, overflow: 'hidden',
      fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px 12px',
        borderBottom: `1px solid ${T.border}`,
        background: T.surface, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 15, fontWeight: 700, color: T.text, letterSpacing: '-0.3px' }}>
              Agents
            </span>
            <span style={{ fontSize: 13, fontWeight: 500, color: T.muted, marginLeft: 7 }}>
              {aliveCount} alive
            </span>
          </div>
          <button type="button" onClick={onCreateAgent} title="New agent"
            style={{
              background: '#eff6ff', border: '1px solid #bfdbfe',
              color: T.accent, cursor: 'pointer',
              width: 24, height: 24, borderRadius: 6,
              fontSize: 16, lineHeight: '22px', fontWeight: 700,
              transition: 'background 0.15s', padding: 0, textAlign: 'center',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#dbeafe')}
            onMouseLeave={e => (e.currentTarget.style.background = '#eff6ff')}
          >+</button>
        </div>

        {aliveCount > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ height: 4, borderRadius: 3, background: T.border, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${busyPct}%`,
                background: 'linear-gradient(90deg, #f97316, #ea580c)',
                borderRadius: 3, transition: 'width 0.6s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
              <span style={{ fontSize: 11, color: '#ea580c', fontWeight: 600 }}>{busyTotal} busy</span>
              <span style={{ fontSize: 11, color: T.dimmed }}>{aliveCount - busyTotal} idle · {busyPct}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Role sections */}
      <div className="thin-scrollbar" style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        {agents.length === 0 && (
          <div style={{ paddingTop: 40, textAlign: 'center', color: T.dimmed, fontSize: 13, lineHeight: 1.7 }}>
            No agents yet.{' '}
            <span onClick={onCreateAgent} style={{ color: T.accent, cursor: 'pointer', textDecoration: 'underline' }}>
              Create one
            </span>
          </div>
        )}
        {ROLE_ORDER.map(({ key, label, accent }) => {
          const group = grouped[key ?? '__general__'] || [];
          return (
            <RoleSection
              key={key ?? '__general__'}
              label={label} accent={accent}
              agents={group} visualStates={visualStates}
              onEdit={setEditingId}
            />
          );
        })}
      </div>

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
