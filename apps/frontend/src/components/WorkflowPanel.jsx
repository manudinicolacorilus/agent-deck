import React, { useState } from 'react';
import { WORKFLOW_STATE, AGENT_ROLE } from '@agent-deck/shared';

const STATE_CONFIG = {
  [WORKFLOW_STATE.PENDING]: { label: 'Pending', color: '#8b949e', icon: '\u23F3' },
  [WORKFLOW_STATE.ARCHITECTING]: { label: 'Architecting', color: '#d2a8ff', icon: '\uD83D\uDCC0' },
  [WORKFLOW_STATE.WAITING_DEV]: { label: 'Waiting for Dev', color: '#f8e3a1', icon: '\u23F3' },
  [WORKFLOW_STATE.DEVELOPING]: { label: 'Developing', color: '#58a6ff', icon: '\uD83D\uDCBB' },
  [WORKFLOW_STATE.WAITING_REVIEW]: { label: 'Waiting for Review', color: '#f8e3a1', icon: '\u23F3' },
  [WORKFLOW_STATE.REVIEWING]: { label: 'Reviewing', color: '#f0883e', icon: '\uD83D\uDD0D' },
  [WORKFLOW_STATE.WAITING_REVISION]: { label: 'Waiting for Dev (revision)', color: '#f8e3a1', icon: '\u23F3' },
  [WORKFLOW_STATE.REVISING]: { label: 'Revising', color: '#58a6ff', icon: '\uD83D\uDD27' },
  [WORKFLOW_STATE.PAUSED]: { label: 'Paused', color: '#f59e0b', icon: '\u23F8\uFE0F' },
  [WORKFLOW_STATE.STUCK]: { label: 'STUCK', color: '#dc2626', icon: '\u26A0\uFE0F' },
  [WORKFLOW_STATE.DONE]: { label: 'Complete', color: '#3fb950', icon: '\u2705' },
  [WORKFLOW_STATE.ERROR]: { label: 'Error', color: '#da3633', icon: '\u274C' },
};

const ROLE_COLORS = {
  [AGENT_ROLE.ARCHITECT]: '#d2a8ff',
  [AGENT_ROLE.DEV]: '#58a6ff',
  [AGENT_ROLE.REVIEWER]: '#f0883e',
  system: '#3fb950',
};

function EscalationBanner({ workflow, onPause, onResume, onAbort, onResolve }) {
  const [resolveMsg, setResolveMsg] = useState('');
  const isStuck = workflow.state === WORKFLOW_STATE.STUCK;
  const isPaused = workflow.state === WORKFLOW_STATE.PAUSED;
  const isRunning = ![WORKFLOW_STATE.DONE, WORKFLOW_STATE.ERROR, WORKFLOW_STATE.PAUSED, WORKFLOW_STATE.STUCK].includes(workflow.state);

  const btnStyle = {
    padding: '4px 10px', fontSize: 11, fontWeight: 600,
    border: '1px solid', borderRadius: 4, cursor: 'pointer',
    fontFamily: 'inherit', lineHeight: '18px',
  };

  return (
    <div style={{
      padding: '8px 14px', borderTop: '1px solid #e2e8f0',
      display: 'flex', flexDirection: 'column', gap: 6,
      background: (isStuck || isPaused) ? '#fef3c7' : '#f8fafc',
    }}>
      {(isStuck || isPaused) && (
        <div style={{ fontSize: 11, fontWeight: 600, color: isStuck ? '#dc2626' : '#d97706' }}>
          {isStuck ? 'Agent appears stuck — choose a resolution:' : 'Workflow is paused.'}
        </div>
      )}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {isRunning && (
          <button style={{ ...btnStyle, color: '#d97706', borderColor: '#fbbf24', background: '#fffbeb' }}
            onClick={() => onPause?.(workflow.id)}>Pause</button>
        )}
        {isPaused && (
          <button style={{ ...btnStyle, color: '#2563eb', borderColor: '#93c5fd', background: '#eff6ff' }}
            onClick={() => onResume?.(workflow.id)}>Resume</button>
        )}
        {(isStuck || isPaused) && (
          <>
            <button style={{ ...btnStyle, color: '#16a34a', borderColor: '#86efac', background: '#f0fdf4' }}
              onClick={() => onResolve?.(workflow.id, { action: 'reassign', message: '' })}>Reassign</button>
            <button style={{ ...btnStyle, color: '#64748b', borderColor: '#cbd5e1', background: '#f8fafc' }}
              onClick={() => onResolve?.(workflow.id, { action: 'skip', message: '' })}>Skip Stage</button>
          </>
        )}
        {(isRunning || isPaused || isStuck) && (
          <button style={{ ...btnStyle, color: '#dc2626', borderColor: '#fca5a5', background: '#fef2f2' }}
            onClick={() => onAbort?.(workflow.id)}>Abort</button>
        )}
      </div>
      {(isStuck || isPaused) && (
        <div style={{ display: 'flex', gap: 4 }}>
          <input
            type="text"
            placeholder="Send instructions to agent..."
            value={resolveMsg}
            onChange={(e) => setResolveMsg(e.target.value)}
            style={{
              flex: 1, padding: '4px 8px', fontSize: 11, border: '1px solid #cbd5e1',
              borderRadius: 4, fontFamily: 'inherit', outline: 'none',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && resolveMsg.trim()) {
                onResolve?.(workflow.id, { action: 'instruct', message: resolveMsg.trim() });
                setResolveMsg('');
              }
            }}
          />
          <button
            style={{ ...btnStyle, color: '#fff', borderColor: '#2563eb', background: '#2563eb' }}
            onClick={() => {
              if (resolveMsg.trim()) {
                onResolve?.(workflow.id, { action: 'instruct', message: resolveMsg.trim() });
                setResolveMsg('');
              }
            }}
          >Send</button>
        </div>
      )}
    </div>
  );
}

function WorkflowCard({ workflow, onCancel, onPause, onResume, onAbort, onResolve }) {
  const [expanded, setExpanded] = useState(false);
  const config = STATE_CONFIG[workflow.state] || STATE_CONFIG[WORKFLOW_STATE.PENDING];
  const isActive = ![WORKFLOW_STATE.DONE, WORKFLOW_STATE.ERROR].includes(workflow.state);

  return (
    <div style={{
      background: '#ffffff',
      border: `1px solid ${isActive ? config.color + '44' : '#e2e8f0'}`,
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: isActive ? `0 0 12px ${config.color}11` : '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      {/* Header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', cursor: 'pointer',
          background: isActive ? `${config.color}08` : '#f8fafc',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <span style={{ fontSize: 16 }}>{config.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: '#0f172a',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {workflow.prompt.slice(0, 60)}{workflow.prompt.length > 60 ? '...' : ''}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, color: config.color,
              textTransform: 'uppercase', letterSpacing: 0.5,
            }}>
              {config.label}
            </span>
            {workflow.reviewCycle > 0 && (
              <span style={{ fontSize: 10, color: '#94a3b8' }}>
                (review cycle {workflow.reviewCycle})
              </span>
            )}
          </div>
        </div>
        {isActive && (
          <button
            style={{
              background: 'none', border: 'none', color: '#94a3b8',
              cursor: 'pointer', fontSize: 11, padding: '2px 6px',
              borderRadius: 4, fontFamily: 'inherit',
            }}
            title="Cancel workflow"
            onClick={(e) => { e.stopPropagation(); onCancel?.(workflow.id); }}
            onMouseEnter={(e) => (e.target.style.color = '#dc2626')}
            onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
          >
            cancel
          </button>
        )}
        <span style={{ color: '#94a3b8', fontSize: 12 }}>
          {expanded ? '\u25B2' : '\u25BC'}
        </span>
      </div>

      {/* Progress bar */}
      {isActive && (
        <div style={{
          height: 2, background: '#e2e8f0',
        }}>
          <div style={{
            height: '100%', background: config.color,
            animation: 'progressPulse 1.5s ease-in-out infinite',
          }} />
        </div>
      )}

      {/* Expanded steps */}
      {expanded && (
        <div style={{
          padding: '10px 14px', borderTop: '1px solid #e2e8f0',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {/* Pipeline visualization */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 10, color: '#94a3b8', marginBottom: 4,
          }}>
            <span style={{ color: ROLE_COLORS[AGENT_ROLE.ARCHITECT] }}>Architect</span>
            <span>&rarr;</span>
            <span style={{ color: ROLE_COLORS[AGENT_ROLE.DEV] }}>Dev</span>
            <span>&rarr;</span>
            <span style={{ color: ROLE_COLORS[AGENT_ROLE.REVIEWER] }}>Review (/review)</span>
            <span>&harr;</span>
            <span style={{ color: '#16a34a' }}>Done</span>
          </div>

          {/* Steps timeline */}
          {workflow.steps.map((step, i) => {
            const roleColor = ROLE_COLORS[step.role] || '#94a3b8';
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                padding: '4px 0',
              }}>
                {/* Timeline dot */}
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: roleColor, marginTop: 3, flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: roleColor,
                      textTransform: 'uppercase',
                    }}>
                      {step.role}
                    </span>
                    {step.agentName && (
                      <span style={{ fontSize: 10, color: '#0f172a' }}>
                        {step.agentName}
                      </span>
                    )}
                    <span style={{ fontSize: 9, color: '#94a3b8' }}>
                      {step.action}
                    </span>
                  </div>
                  {step.models && (
                    <div style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>
                      Models: {step.models.join(', ')}
                    </div>
                  )}
                  {step.message && (
                    <div style={{ fontSize: 10, color: '#16a34a', marginTop: 2 }}>
                      {step.message}
                    </div>
                  )}
                  <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>
                    {new Date(step.timestamp).toLocaleTimeString()}
                    {step.completedAt && ` \u2192 ${new Date(step.completedAt).toLocaleTimeString()}`}
                  </div>
                </div>
                {step.hasOutput && (
                  <span style={{
                    fontSize: 9, color: '#16a34a', padding: '1px 4px',
                    background: 'rgba(22,163,74,0.08)', borderRadius: 3,
                  }}>
                    output
                  </span>
                )}
              </div>
            );
          })}

          {workflow.steps.length === 0 && (
            <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>
              Waiting to start...
            </div>
          )}

          {workflow.error && (
            <div style={{
              fontSize: 11, color: '#dc2626', padding: '6px 8px',
              background: 'rgba(220,38,38,0.06)', borderRadius: 4,
            }}>
              {workflow.error}
            </div>
          )}
        </div>
      )}

      {/* Escalation controls */}
      {expanded && isActive && (
        <EscalationBanner
          workflow={workflow}
          onPause={onPause}
          onResume={onResume}
          onAbort={onAbort}
          onResolve={onResolve}
        />
      )}
    </div>
  );
}

export default function WorkflowPanel({ workflows, onCancel, onPause, onResume, onAbort, onResolve }) {
  if (!workflows || workflows.length === 0) return null;

  const active = workflows.filter((w) =>
    w.state !== WORKFLOW_STATE.DONE && w.state !== WORKFLOW_STATE.ERROR
  );
  const completed = workflows.filter((w) =>
    w.state === WORKFLOW_STATE.DONE || w.state === WORKFLOW_STATE.ERROR
  );

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{
        fontSize: 10, color: '#94a3b8', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: 1, padding: '0 2px',
      }}>
        Workflows ({active.length} active)
      </div>
      {active.map((wf) => (
        <WorkflowCard key={wf.id} workflow={wf} onCancel={onCancel}
          onPause={onPause} onResume={onResume} onAbort={onAbort} onResolve={onResolve} />
      ))}
      {completed.map((wf) => (
        <WorkflowCard key={wf.id} workflow={wf} onCancel={onCancel}
          onPause={onPause} onResume={onResume} onAbort={onAbort} onResolve={onResolve} />
      ))}
    </div>
  );
}
