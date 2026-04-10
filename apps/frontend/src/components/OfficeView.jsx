import React, { useState, useMemo } from 'react';
import { AGENT_ROLE, AGENT_VISUAL_STATE } from '@agent-deck/shared';
import WorkflowPanel from './WorkflowPanel';
import MissionHistory from './MissionHistory';
import useElapsedTime from '../hooks/useElapsedTime';
import { useThemeColors } from '../hooks/useTheme';

const STATUS = {
  working: { border: '#0d9488', pill: '#ccfbf1', pillText: '#0f766e', dot: '#0d9488', label: 'Working' },
  idle:    { border: '#cbd5e1', pill: '#f1f5f9', pillText: '#64748b', dot: '#94a3b8', label: 'Idle' },
  error:   { border: '#dc2626', pill: '#fee2e2', pillText: '#991b1b', dot: '#dc2626', label: 'Error' },
};

const ROLE_CONFIG = {
  [AGENT_ROLE.SUPER_MASTER]: { label: 'Super-Master', color: '#9333ea', bg: '#f3e8ff' },
  [AGENT_ROLE.MASTER]:       { label: 'Master',       color: '#0891b2', bg: '#e0f2fe' },
  [AGENT_ROLE.ARCHITECT]:    { label: 'Architect',    color: '#7c3aed', bg: '#ede9fe' },
  [AGENT_ROLE.EXPLORER]:     { label: 'Explorer',     color: '#059669', bg: '#d1fae5' },
  [AGENT_ROLE.DEV]:          { label: 'Developer',    color: '#2563eb', bg: '#dbeafe' },
  [AGENT_ROLE.INTEGRATOR]:   { label: 'Integrator',   color: '#d97706', bg: '#fef3c7' },
  [AGENT_ROLE.TESTER]:       { label: 'Tester',       color: '#dc2626', bg: '#fee2e2' },
  [AGENT_ROLE.REVIEWER]:     { label: 'Reviewer',     color: '#ea580c', bg: '#ffedd5' },
  [AGENT_ROLE.RELEASER]:     { label: 'Releaser',     color: '#7c3aed', bg: '#ede9fe' },
};

const ENGINE_CONFIG = {
  copilot: { label: 'Copilot', color: '#2563eb' },
  claude:  { label: 'Claude',  color: '#ea580c' },
};

const ACTIVITY_LABELS = {
  idle:                 'No active task',
  thinking:             'Thinking…',
  reading:              'Reading files',
  editing:              'Editing files',
  running_command:      'Running command',
  waiting_for_approval: 'Awaiting approval',
  waiting_for_input:    'Waiting for input',
  done:                 'Task complete',
  error:                'Error occurred',
};

const ROLE_ORDER = [
  AGENT_ROLE.SUPER_MASTER, AGENT_ROLE.MASTER, AGENT_ROLE.ARCHITECT,
  AGENT_ROLE.EXPLORER, AGENT_ROLE.DEV, AGENT_ROLE.INTEGRATOR,
  AGENT_ROLE.TESTER, AGENT_ROLE.REVIEWER, AGENT_ROLE.RELEASER,
];

/* ─── Helpers ────────────────────────────────────────────────── */
function deriveStatus(agent, visualState, sessions) {
  const session = sessions.find(s => s.id === agent.currentSessionId);
  if (session?.state === 'error') return 'error';
  if (
    visualState === AGENT_VISUAL_STATE.WORKING_AT_DESK ||
    visualState === AGENT_VISUAL_STATE.THINKING_AT_DESK
  ) return 'working';
  return 'idle';
}

/* ─── Agent Card ─────────────────────────────────────────────── */
function AgentCard({ agent, session, activity, status, onAssign, onDelete }) {
  const { colors } = useThemeColors();
  const T = { bg: colors.bg, surface: colors.surface, border: colors.border, text: colors.text, muted: colors.textSec, dimmed: colors.textMuted, hover: colors.hoverBg };
  const sc = STATUS[status];
  const rc = ROLE_CONFIG[agent.role];
  const ec = ENGINE_CONFIG[agent.engine];
  const elapsed = useElapsedTime(status === 'working' ? session?.startTime : null);
  const taskLabel = ACTIVITY_LABELS[activity] ?? 'No active task';
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderLeft: `4px solid ${sc.border}`,
        borderRadius: 8,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 9,
        transition: 'box-shadow 0.15s, transform 0.1s',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-1px)' : 'none',
        position: 'relative',
      }}
    >
      {/* Row 1: name + status pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: 14, fontWeight: 700, color: T.text, flex: 1,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {agent.name}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 20,
          background: sc.pill, color: sc.pillText,
          textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0,
        }}>
          {sc.label}
        </span>
      </div>

      {/* Row 2: role + engine + yolo badges */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
          background: rc?.bg ?? '#f1f5f9', color: rc?.color ?? '#64748b',
        }}>
          {rc?.label ?? 'General'}
        </span>
        {ec && (
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
            background: `${ec.color}14`, color: ec.color,
          }}>
            {ec.label}
          </span>
        )}
        {agent.yolo && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
            background: '#fef9c3', color: '#854d0e',
          }}>YOLO</span>
        )}
      </div>

      {/* Row 3: current task + elapsed */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
          background: sc.dot,
          boxShadow: status === 'working' ? `0 0 0 3px ${sc.dot}28` : 'none',
          animation: status === 'working' ? 'statusDotPulse 2s ease-in-out infinite' : 'none',
        }} />
        <span style={{
          fontSize: 12, color: status === 'idle' ? T.dimmed : T.muted,
          fontStyle: (status === 'idle' && activity === 'idle') ? 'italic' : 'normal',
          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {taskLabel}
        </span>
        {status === 'working' && elapsed && (
          <span style={{
            fontSize: 11, color: '#0d9488', fontWeight: 600, flexShrink: 0,
            background: '#f0fdfa', padding: '1px 6px', borderRadius: 10,
            border: '1px solid #99f6e4',
          }}>
            {elapsed}
          </span>
        )}
      </div>

      {/* Hover actions */}
      {hovered && (
        <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 4 }}>
          <button type="button" onClick={(e) => { e.stopPropagation(); onAssign(agent); }}
            style={{
              padding: '3px 9px', fontSize: 10, fontWeight: 600,
              background: '#eff6ff', color: '#2563eb',
              border: '1px solid #bfdbfe', borderRadius: 4, cursor: 'pointer',
            }}>
            Assign
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(agent.id); }}
            style={{
              padding: '3px 7px', fontSize: 11, fontWeight: 700,
              background: '#fee2e2', color: '#dc2626',
              border: '1px solid #fecaca', borderRadius: 4, cursor: 'pointer',
            }}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Left Sidebar ───────────────────────────────────────────── */
function RoleSidebar({ agents, sessions, visualStates, activeFilter, onFilterChange, onCreateAgent }) {
  const { colors } = useThemeColors();
  const T = { bg: colors.bg, surface: colors.surface, border: colors.border, text: colors.text, muted: colors.textSec, dimmed: colors.textMuted, hover: colors.hoverBg };
  const grouped = useMemo(() => {
    const map = {};
    for (const role of ROLE_ORDER) map[role] = [];
    map.__general__ = [];
    for (const a of agents) {
      const k = a.role && map[a.role] !== undefined ? a.role : '__general__';
      map[k].push(a);
    }
    return map;
  }, [agents]);

  const total   = agents.length;
  const working = agents.filter(a => deriveStatus(a, visualStates[a.id], sessions) === 'working').length;
  const idle    = agents.filter(a => deriveStatus(a, visualStates[a.id], sessions) === 'idle').length;
  const errors  = agents.filter(a => deriveStatus(a, visualStates[a.id], sessions) === 'error').length;

  const filterBtns = [
    { key: 'all',     label: 'All',     count: total },
    { key: 'working', label: 'Working', count: working },
    { key: 'idle',    label: 'Idle',    count: idle },
    { key: 'error',   label: 'Error',   count: errors },
  ];

  return (
    <div style={{
      width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column',
      background: T.surface, borderRight: `1px solid ${T.border}`, overflow: 'hidden',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px 12px', borderBottom: `1px solid ${T.border}`,
        background: T.bg, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Dashboard</span>
          <button type="button" onClick={onCreateAgent}
            style={{
              padding: '3px 10px', fontSize: 11, fontWeight: 700,
              background: '#eff6ff', color: '#2563eb',
              border: '1px solid #bfdbfe', borderRadius: 5, cursor: 'pointer',
            }}>
            + Agent
          </button>
        </div>
        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {filterBtns.map(f => {
            const active = activeFilter === f.key;
            return (
              <button key={f.key} type="button" onClick={() => onFilterChange(f.key)}
                style={{
                  padding: '3px 8px', fontSize: 10, fontWeight: 600,
                  background: active ? '#0f172a' : T.hover,
                  color: active ? '#fff' : T.muted,
                  border: `1px solid ${active ? '#0f172a' : T.border}`,
                  borderRadius: 20, cursor: 'pointer', transition: 'all 0.1s',
                }}>
                {f.label} {f.count > 0 && <span style={{ opacity: 0.7 }}>{f.count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Role groups */}
      <div className="thin-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {[...ROLE_ORDER, null].map(roleKey => {
          const mapKey = roleKey ?? '__general__';
          const list = grouped[mapKey] || [];
          if (list.length === 0) return null;
          const rc = roleKey ? ROLE_CONFIG[roleKey] : null;
          const label = rc?.label ?? 'General';
          const accent = rc?.color ?? '#6b7280';

          return (
            <div key={mapKey} style={{ padding: '6px 0' }}>
              {/* Role header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 16px', marginBottom: 2,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: accent, flexShrink: 0,
                }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: T.text, letterSpacing: '-0.1px' }}>
                  {label}
                </span>
                <span style={{ fontSize: 10, color: T.dimmed, marginLeft: 'auto' }}>
                  {list.length}
                </span>
              </div>
              {/* Agent rows */}
              {list.map(agent => {
                const st = deriveStatus(agent, visualStates[agent.id], sessions);
                const sc = STATUS[st];
                return (
                  <div key={agent.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '4px 16px 4px 28px',
                    cursor: 'default',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = T.hover)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{
                      width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                      background: sc.dot,
                      boxShadow: st === 'working' ? `0 0 0 2px ${sc.dot}30` : 'none',
                      animation: st === 'working' ? 'statusDotPulse 2s ease-in-out infinite' : 'none',
                    }} />
                    <span style={{
                      fontSize: 12, color: T.muted, flex: 1,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {agent.name}
                    </span>
                    {agent.engine && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, color: ENGINE_CONFIG[agent.engine]?.color ?? T.dimmed,
                        textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0,
                      }}>
                        {agent.engine === 'copilot' ? 'CP' : 'CL'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────── */
function EmptyState({ onCreateAgent }) {
  const { colors } = useThemeColors();
  const T = { bg: colors.bg, surface: colors.surface, border: colors.border, text: colors.text, muted: colors.textSec, dimmed: colors.textMuted, hover: colors.hoverBg };
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 12,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: 'linear-gradient(135deg, #f1f5f9, #ffffff)',
        border: `1px solid ${T.border}`, display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: 28,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>📋</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: T.muted }}>No agents yet</div>
      <div style={{ fontSize: 13, color: T.dimmed, textAlign: 'center', lineHeight: 1.6, maxWidth: 280 }}>
        Create a persistent agent to track<br />its status and tasks here.
      </div>
      <button type="button" onClick={onCreateAgent}
        style={{
          padding: '8px 20px', fontSize: 13, fontWeight: 600,
          background: '#2563eb', color: '#fff',
          border: 'none', borderRadius: 7, cursor: 'pointer', marginTop: 4,
        }}>
        + New Agent
      </button>
    </div>
  );
}

/* ─── Main OfficeView ────────────────────────────────────────── */
export default function OfficeView({
  agents,
  sessions,
  activities,
  visualStates,
  workflows,
  onClickIdleAgent,
  onDeleteAgent,
  onCreateAgent,
  onCancelWorkflow,
  onPauseWorkflow,
  onResumeWorkflow,
  onAbortWorkflow,
  onResolveWorkflow,
}) {
  const { colors } = useThemeColors();
  const T = {
    bg: colors.bg, surface: colors.surface, border: colors.border,
    text: colors.text, muted: colors.textSec, dimmed: colors.textMuted, hover: colors.hoverBg,
  };
  const [filter, setFilter] = useState('all');

  /* Enrich agents with derived status + session */
  const enriched = useMemo(() => agents.map(agent => {
    const session  = sessions.find(s => s.id === agent.currentSessionId);
    const activity = session ? (activities[session.id] ?? 'idle') : 'idle';
    const status   = deriveStatus(agent, visualStates[agent.id], sessions);
    return { agent, session, activity, status };
  }), [agents, sessions, activities, visualStates]);

  /* Apply filter */
  const visible = useMemo(() =>
    filter === 'all' ? enriched : enriched.filter(e => e.status === filter),
    [enriched, filter]
  );

  /* Aggregate counts */
  const counts = useMemo(() => ({
    total:   enriched.length,
    working: enriched.filter(e => e.status === 'working').length,
    idle:    enriched.filter(e => e.status === 'idle').length,
    error:   enriched.filter(e => e.status === 'error').length,
  }), [enriched]);

  const hasWorkflows = workflows && workflows.length > 0;

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: T.bg, minHeight: 0 }}>
      {/* ── Left sidebar ── */}
      <RoleSidebar
        agents={agents}
        sessions={sessions}
        visualStates={visualStates}
        activeFilter={filter}
        onFilterChange={setFilter}
        onCreateAgent={onCreateAgent}
      />

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Top filter bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', borderBottom: `1px solid ${T.border}`,
          background: T.surface, flexShrink: 0,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
            {filter === 'all' ? `All Agents` : `${STATUS[filter]?.label ?? filter} Agents`}
          </span>
          <span style={{
            fontSize: 11, color: T.dimmed, background: T.hover,
            padding: '1px 8px', borderRadius: 20, border: `1px solid ${T.border}`,
          }}>
            {visible.length}
          </span>
          <div style={{ flex: 1 }} />
          {[
            { key: 'all',     label: 'All',     count: counts.total,   color: '#0f172a' },
            { key: 'working', label: 'Working', count: counts.working, color: '#0d9488' },
            { key: 'idle',    label: 'Idle',    count: counts.idle,    color: '#64748b' },
            { key: 'error',   label: 'Error',   count: counts.error,   color: '#dc2626' },
          ].map(f => {
            const active = filter === f.key;
            return (
              <button key={f.key} type="button" onClick={() => setFilter(f.key)}
                style={{
                  padding: '4px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  background: active ? f.color : T.hover,
                  color: active ? '#fff' : T.muted,
                  border: `1px solid ${active ? f.color : T.border}`,
                  borderRadius: 20, transition: 'all 0.12s',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                {f.label}
                {f.count > 0 && (
                  <span style={{
                    background: active ? 'rgba(255,255,255,0.25)' : T.border,
                    color: active ? '#fff' : T.muted,
                    borderRadius: 10, padding: '0 5px', fontSize: 10,
                  }}>
                    {f.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Card grid */}
        <div className="thin-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {agents.length === 0 ? (
            <EmptyState onCreateAgent={onCreateAgent} />
          ) : visible.length === 0 ? (
            <div style={{
              paddingTop: 60, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 8,
            }}>
              <div style={{ fontSize: 32 }}>🔍</div>
              <div style={{ fontSize: 14, color: T.muted, fontWeight: 600 }}>
                No {filter} agents
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 12,
              alignContent: 'start',
            }}>
              {visible.map(({ agent, session, activity, status }) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  session={session}
                  activity={activity}
                  status={status}
                  onAssign={onClickIdleAgent}
                  onDelete={onDeleteAgent}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom aggregate bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 20,
          padding: '8px 20px', borderTop: `1px solid ${T.border}`,
          background: T.surface, flexShrink: 0,
          fontSize: 12, fontWeight: 500,
        }}>
          <span style={{ color: T.muted }}>{counts.total} agents total</span>
          <span style={{ width: 1, height: 14, background: T.border }} />
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#0f766e' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0d9488', display: 'inline-block' }} />
            {counts.working} working
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748b' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#94a3b8', display: 'inline-block' }} />
            {counts.idle} idle
          </span>
          {counts.error > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#dc2626' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />
              {counts.error} errors
            </span>
          )}
        </div>
      </div>

      {/* ── Right panel: workflows + mission history ── */}
      <div style={{
        width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column',
        borderLeft: `1px solid ${T.border}`, overflow: 'hidden',
        background: T.surface,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '10px 14px', borderBottom: `1px solid ${T.border}`,
          background: T.bg, flexShrink: 0,
        }}>
          <span style={{ fontSize: 13 }}>⚡</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '1.2px' }}>
            Workflows
          </span>
          {hasWorkflows && (
            <span style={{
              marginLeft: 'auto', fontSize: 10, color: '#2563eb', fontWeight: 600,
              background: 'rgba(37,99,235,0.07)', padding: '1px 6px',
              borderRadius: 8, border: '1px solid rgba(37,99,235,0.18)',
            }}>
              {workflows.filter(w => !['done', 'error'].includes(w.state)).length} active
            </span>
          )}
        </div>
        <div className="thin-scrollbar" style={{ flex: 1, padding: 10, overflowY: 'auto' }}>
          {hasWorkflows && (
            <WorkflowPanel workflows={workflows} onCancel={onCancelWorkflow}
              onPause={onPauseWorkflow} onResume={onResumeWorkflow}
              onAbort={onAbortWorkflow} onResolve={onResolveWorkflow} />
          )}
          <div style={{ marginTop: hasWorkflows ? 12 : 0 }}>
            <MissionHistory />
          </div>
        </div>
      </div>
    </div>
  );
}
