import React, { useState, useEffect } from 'react';
import { AGENT_ROLE, AGENT_VISUAL_STATE } from '@agent-deck/shared';
import * as api from '../../lib/api.js';

/* ─── Engine colour tokens ─── */
const ENGINE_COLOR = {
  copilot: '#388bfd',   // blue
  claude:  '#ea580c',   // orange
};
const ENGINE_LABEL = {
  copilot: 'Copilot',
  claude:  'Claude',
};

/* ─── Role config ─── */
const ROLE_CONFIG = {
  [AGENT_ROLE.ARCHITECT]: { label: 'Architect', color: '#d2a8ff', icon: '🏗️' },
  [AGENT_ROLE.DEV]:       { label: 'Developer',  color: '#58a6ff', icon: '💻' },
  [AGENT_ROLE.REVIEWER]:  { label: 'Reviewer',   color: '#f0883e', icon: '🔍' },
  general:                { label: 'General',    color: '#6e7681', icon: '🤖' },
};

const C = {
  bg:          '#0f1318',
  surface:     '#161b22',
  cardBg:      '#161b22',
  border:      '#21262d',
  borderHover: '#30363d',
  text:        '#e6edf3',
  muted:       '#8b949e',
  dimmed:      '#484f58',
  green:       '#3fb950',
  red:         '#da3633',
  blue:        '#388bfd',
  selectBg:    '#0d1117',
};

function getAgentStatus(visualState) {
  if (!visualState) return { label: 'Idle', color: C.dimmed };
  if (
    visualState === AGENT_VISUAL_STATE.WORKING_AT_DESK ||
    visualState === AGENT_VISUAL_STATE.THINKING_AT_DESK
  ) return { label: 'Working', color: C.green };
  if (visualState.includes('walking')) return { label: 'Moving', color: '#58a6ff' };
  return { label: 'Idle', color: C.dimmed };
}

const SKIN_TONES = ['#f4c794', '#e0ac69', '#c68642', '#8d5524', '#ffdbac'];
const HAT_OPTIONS = [
  { id: null,       label: 'None',     icon: '—' },
  { id: 'hardhat',  label: 'Hard Hat', icon: '⛑️' },
  { id: 'tophat',   label: 'Top Hat',  icon: '🎩' },
  { id: 'beanie',   label: 'Beanie',   icon: '🧢' },
  { id: 'crown',    label: 'Crown',    icon: '👑' },
  { id: 'wizard',   label: 'Wizard',   icon: '🧙' },
];
const PET_OPTIONS = [
  { id: null,    label: 'None',  icon: '—' },
  { id: 'cat',   label: 'Cat',   icon: '🐱' },
  { id: 'dog',   label: 'Dog',   icon: '🐶' },
  { id: 'bird',  label: 'Bird',  icon: '🐦' },
  { id: 'robot', label: 'Robot', icon: '🤖' },
  { id: 'duck',  label: 'Duck',  icon: '🦆' },
];

/* ─── Edit modal ─── */
function AgentEditModal({ agent, engines, onSave, onClose }) {
  const [name, setName]           = useState(agent.name || '');
  const [engine, setEngine]       = useState(agent.engine || 'copilot');
  const [role, setRole]           = useState(agent.role || null);
  const [yolo, setYolo]           = useState(agent.yolo || false);
  const [skinColor, setSkinColor] = useState(agent.skinColor || null);
  const [hat, setHat]             = useState(agent.hat || null);
  const [pet, setPet]             = useState(agent.pet || null);

  useEffect(() => {
    if (role === AGENT_ROLE.REVIEWER) setEngine('copilot');
  }, [role]);

  const handleSave = () => {
    onSave(agent.id, { name, engine, role, yolo, skinColor, hat, pet });
    onClose();
  };

  const pillBtn = (selected, activeColor) => ({
    padding: '3px 8px', fontSize: 10, fontWeight: 600,
    border: `1px solid ${selected ? (activeColor || C.blue) : C.border}`,
    borderRadius: 4, cursor: 'pointer',
    background: selected ? `${activeColor || C.blue}22` : 'transparent',
    color: selected ? (activeColor || C.blue) : C.muted,
    fontFamily: 'inherit', transition: 'all 0.15s ease',
  });

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        className="thin-scrollbar"
        style={{
          width: 340, maxHeight: '85vh', overflowY: 'auto',
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
          animation: 'scaleIn 0.18s ease both',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, letterSpacing: '-0.2px' }}>
          Edit Agent
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</label>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            style={{
              padding: '6px 8px', background: C.selectBg, color: C.text,
              border: `1px solid ${C.border}`, borderRadius: 6,
              fontSize: 12, fontFamily: 'inherit', outline: 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onFocus={(e) => { e.target.style.borderColor = C.blue; e.target.style.boxShadow = '0 0 0 3px rgba(56,139,253,0.15)'; }}
            onBlur={(e)  => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Engine</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {engines.map((eng) => {
              const ec = ENGINE_COLOR[eng.id] || C.muted;
              const disabled = role === AGENT_ROLE.REVIEWER && eng.id !== 'copilot';
              return (
                <label key={eng.id} style={{
                  ...pillBtn(engine === eng.id, ec),
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 10px', borderRadius: 6,
                  opacity: disabled ? 0.4 : 1,
                  pointerEvents: disabled ? 'none' : 'auto',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}>
                  <input
                    type="radio" name="modal-engine" value={eng.id}
                    checked={engine === eng.id} onChange={() => setEngine(eng.id)}
                    disabled={disabled}
                    style={{ accentColor: ec }}
                  />
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{eng.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</label>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {[
              { id: null, label: 'None' },
              { id: AGENT_ROLE.ARCHITECT, label: 'Architect' },
              { id: AGENT_ROLE.DEV, label: 'Dev' },
              { id: AGENT_ROLE.REVIEWER, label: 'Reviewer' },
            ].map((opt) => (
              <button key={opt.id || 'none'} type="button"
                onClick={() => { setRole(opt.id); if (opt.id === AGENT_ROLE.REVIEWER) setEngine('copilot'); }}
                style={pillBtn(role === opt.id, ROLE_CONFIG[opt.id]?.color)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>Yolo Mode</span>
          <button type="button" onClick={() => setYolo(!yolo)} style={{
            width: 34, height: 20, borderRadius: 10, border: 'none',
            background: yolo ? C.green : C.border, cursor: 'pointer',
            position: 'relative', transition: 'background 0.2s',
          }}>
            <span style={{
              position: 'absolute', top: 2, width: 16, height: 16,
              borderRadius: '50%', background: '#fff',
              left: yolo ? 16 : 2, transition: 'left 0.2s',
            }} />
          </button>
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, margin: '2px 0' }} />
        <div style={{ fontSize: 10, fontWeight: 700, color: C.dimmed, textTransform: 'uppercase', letterSpacing: 1.5 }}>
          Appearance
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>Skin</label>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button type="button" onClick={() => setSkinColor(null)} title="Auto"
              style={{
                width: 22, height: 22, borderRadius: '50%', cursor: 'pointer',
                border: skinColor === null ? `2px solid ${C.blue}` : `2px solid ${C.border}`,
                background: 'conic-gradient(#f4c794, #e0ac69, #c68642, #8d5524, #ffdbac, #f4c794)',
              }}
            />
            {SKIN_TONES.map((tone) => (
              <button key={tone} type="button" onClick={() => setSkinColor(tone)} title={tone}
                style={{
                  width: 22, height: 22, borderRadius: '50%', cursor: 'pointer',
                  border: skinColor === tone ? `2px solid ${C.blue}` : `2px solid ${C.border}`,
                  background: tone,
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>Hat</label>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {HAT_OPTIONS.map((opt) => (
              <button key={opt.id || 'none'} type="button" onClick={() => setHat(opt.id)} title={opt.label}
                style={{ ...pillBtn(hat === opt.id, C.blue), padding: '4px 8px', fontSize: 13 }}>
                {opt.icon}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>Pet</label>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {PET_OPTIONS.map((opt) => (
              <button key={opt.id || 'none'} type="button" onClick={() => setPet(opt.id)} title={opt.label}
                style={{ ...pillBtn(pet === opt.id, C.blue), padding: '4px 8px', fontSize: 13 }}>
                {opt.icon}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 4 }}>
          <button type="button" onClick={onClose} style={{
            padding: '5px 14px', fontSize: 11, fontWeight: 600,
            background: 'transparent', color: C.muted, border: `1px solid ${C.border}`,
            borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit',
            transition: 'border-color 0.15s, color 0.15s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.muted; e.currentTarget.style.color = C.text; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
          >Cancel</button>
          <button type="button" onClick={handleSave} disabled={!name.trim()} style={{
            padding: '5px 14px', fontSize: 11, fontWeight: 600,
            background: name.trim() ? '#238636' : '#21262d',
            color: name.trim() ? '#fff' : C.dimmed,
            border: '1px solid rgba(240,246,252,0.1)',
            borderRadius: 6, cursor: name.trim() ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit', transition: 'filter 0.15s',
          }}
            onMouseEnter={(e) => { if (name.trim()) e.currentTarget.style.filter = 'brightness(1.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
          >Save</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Single Agent Card ─── */
function AgentCard({ agent, visualState, onEdit, onDelete }) {
  const status     = getAgentStatus(visualState);
  const engineColor = ENGINE_COLOR[agent.engine] || C.dimmed;
  const isIdle     = status.label === 'Idle';

  const handleDragStart = (e) => {
    e.dataTransfer.setData('application/agent-id', agent.id);
    e.dataTransfer.setData('text/plain', agent.name);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable={isIdle}
      onDragStart={isIdle ? handleDragStart : undefined}
      style={{
        background: `${engineColor}12`,
        border: `1px solid ${engineColor}33`,
        borderRadius: 6,
        padding: '5px 8px',
        cursor: isIdle ? 'grab' : 'default',
        transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
        opacity: isIdle ? 1 : 0.7,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `${engineColor}22`;
        e.currentTarget.style.borderColor = `${engineColor}66`;
        e.currentTarget.style.boxShadow = `0 2px 8px rgba(0,0,0,0.3)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = `${engineColor}12`;
        e.currentTarget.style.borderColor = `${engineColor}33`;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Single row: dot + name + accessories + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{
          width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
          background: status.color,
          boxShadow: status.label === 'Working' ? `0 0 5px ${C.green}88` : 'none',
          animation: status.label === 'Working' ? 'statusDotPulse 2s ease-in-out infinite' : 'none',
        }} />
        <span style={{
          fontSize: 11, fontWeight: 600, color: C.text,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
        }}>{agent.name}</span>
        {agent.hat && <span style={{ fontSize: 9 }}>{HAT_OPTIONS.find(h => h.id === agent.hat)?.icon}</span>}
        {agent.pet && <span style={{ fontSize: 9 }}>{PET_OPTIONS.find(p => p.id === agent.pet)?.icon}</span>}
        {agent.yolo && (
          <span style={{
            fontSize: 8, fontWeight: 700, color: '#d29922',
            background: '#d2992218', border: '1px solid #d2992233',
            padding: '0px 4px', borderRadius: 8,
          }}>Y</span>
        )}
        <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(agent.id); }}
          style={{ background: 'none', border: 'none', color: C.dimmed, cursor: 'pointer', padding: '0 2px', fontSize: 10, borderRadius: 3, lineHeight: 1 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.dimmed)}
          title="Edit"
        >✎</button>
        {isIdle && (
          <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(agent.id); }}
            style={{ background: 'none', border: 'none', color: C.dimmed, cursor: 'pointer', padding: '0 2px', fontSize: 11, borderRadius: 3, lineHeight: 1 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.red)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.dimmed)}
            title="Delete"
          >×</button>
        )}
      </div>

      {/* Sub-row: engine + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
        <span style={{
          fontSize: 8, fontWeight: 700, letterSpacing: '0.04em',
          color: engineColor,
          textTransform: 'uppercase',
        }}>
          {ENGINE_LABEL[agent.engine] || agent.engine || 'copilot'}
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 8, color: status.color, fontWeight: 600 }}>
          {status.label}
        </span>
      </div>
    </div>
  );
}

/* ─── Role group section ─── */
function RoleSection({ roleKey, agents, visualStates, onEdit, onDelete }) {
  const cfg = ROLE_CONFIG[roleKey] || ROLE_CONFIG.general;
  if (agents.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '3px 6px',
        background: `${cfg.color}10`,
        borderLeft: `2px solid ${cfg.color}`,
        borderRadius: '0 4px 4px 0',
        marginBottom: 1,
      }}>
        <span style={{ fontSize: 11 }}>{cfg.icon}</span>
        <span style={{
          fontSize: 9, fontWeight: 700, color: cfg.color,
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>{cfg.label}</span>
        <span style={{
          marginLeft: 'auto', fontSize: 9, color: cfg.color,
          background: `${cfg.color}18`, padding: '0px 4px',
          borderRadius: 8, fontWeight: 600,
        }}>{agents.length}</span>
      </div>
      {/* Cards */}
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          visualState={visualStates[agent.id]}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
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
  const [engines, setEngines]     = useState([]);

  useEffect(() => {
    api.getEngines().then((r) => setEngines(r.engines || [])).catch(() => {});
  }, []);

  const handleSaveEdit = async (id, fields) => {
    await onUpdateAgent(id, fields);
    setEditingId(null);
  };

  // Group agents by role
  const grouped = {
    [AGENT_ROLE.ARCHITECT]: [],
    [AGENT_ROLE.DEV]:       [],
    [AGENT_ROLE.REVIEWER]:  [],
    general:                [],
  };
  for (const agent of agents) {
    const key = grouped[agent.role] !== undefined ? agent.role : 'general';
    grouped[key].push(agent);
  }

  const editingAgent = editingId ? agents.find((a) => a.id === editingId) : null;
  const totalWorking = agents.filter((a) => {
    const vs = visualStates[a.id];
    return vs === AGENT_VISUAL_STATE.WORKING_AT_DESK || vs === AGENT_VISUAL_STATE.THINKING_AT_DESK;
  }).length;

  return (
    <div style={{
      width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column',
      borderRight: '1px solid #21262d', background: C.bg,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '10px 12px',
        borderBottom: '1px solid #21262d',
        background: '#161b22', flexShrink: 0,
      }}>
        <span style={{ fontSize: 14 }}>🤖</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          Agents
        </span>
        {totalWorking > 0 && (
          <span style={{
            fontSize: 9, color: C.green, fontWeight: 700,
            background: 'rgba(63,185,80,0.1)', padding: '1px 6px',
            borderRadius: 8, border: '1px solid rgba(63,185,80,0.2)',
          }}>{totalWorking} working</span>
        )}
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: C.dimmed }}>{agents.length}</span>
        <button type="button" onClick={onCreateAgent} title="New agent"
          style={{
            background: 'none', border: `1px solid ${C.border}`,
            color: C.muted, cursor: 'pointer',
            padding: '2px 7px', fontSize: 14, borderRadius: 4, lineHeight: 1, fontWeight: 700,
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.blue; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
        >+</button>
      </div>

      {/* Grouped card list */}
      <div className="thin-scrollbar" style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        padding: '6px 6px', display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {agents.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', color: C.dimmed, fontSize: 11, lineHeight: 1.6 }}>
            No agents yet.<br />Click + to create one.
          </div>
        )}

        <RoleSection roleKey={AGENT_ROLE.ARCHITECT} agents={grouped[AGENT_ROLE.ARCHITECT]} visualStates={visualStates} onEdit={setEditingId} onDelete={onDeleteAgent} />
        <RoleSection roleKey={AGENT_ROLE.DEV}       agents={grouped[AGENT_ROLE.DEV]}       visualStates={visualStates} onEdit={setEditingId} onDelete={onDeleteAgent} />
        <RoleSection roleKey={AGENT_ROLE.REVIEWER}  agents={grouped[AGENT_ROLE.REVIEWER]}  visualStates={visualStates} onEdit={setEditingId} onDelete={onDeleteAgent} />
        <RoleSection roleKey="general"              agents={grouped.general}               visualStates={visualStates} onEdit={setEditingId} onDelete={onDeleteAgent} />
      </div>

      {editingAgent && (
        <AgentEditModal
          agent={editingAgent}
          engines={engines}
          onSave={handleSaveEdit}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  );
}
