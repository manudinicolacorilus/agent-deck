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
  [WORKFLOW_STATE.DONE]: { label: 'Complete', color: '#3fb950', icon: '\u2705' },
  [WORKFLOW_STATE.ERROR]: { label: 'Error', color: '#da3633', icon: '\u274C' },
};

const ROLE_COLORS = {
  [AGENT_ROLE.ARCHITECT]: '#d2a8ff',
  [AGENT_ROLE.DEV]: '#58a6ff',
  [AGENT_ROLE.REVIEWER]: '#f0883e',
  system: '#3fb950',
};

function WorkflowCard({ workflow, onCancel }) {
  const [expanded, setExpanded] = useState(false);
  const config = STATE_CONFIG[workflow.state] || STATE_CONFIG[WORKFLOW_STATE.PENDING];
  const isActive = ![WORKFLOW_STATE.DONE, WORKFLOW_STATE.ERROR].includes(workflow.state);

  return (
    <div style={{
      background: '#161b22',
      border: `1px solid ${isActive ? config.color + '44' : '#30363d'}`,
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: isActive ? `0 0 12px ${config.color}11` : 'none',
    }}>
      {/* Header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', cursor: 'pointer',
          background: isActive ? `${config.color}08` : 'transparent',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <span style={{ fontSize: 16 }}>{config.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: '#e6edf3',
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
              <span style={{ fontSize: 10, color: '#8b949e' }}>
                (review cycle {workflow.reviewCycle})
              </span>
            )}
          </div>
        </div>
        {isActive && (
          <button
            style={{
              background: 'none', border: 'none', color: '#484f58',
              cursor: 'pointer', fontSize: 11, padding: '2px 6px',
              borderRadius: 4, fontFamily: 'inherit',
            }}
            title="Cancel workflow"
            onClick={(e) => { e.stopPropagation(); onCancel?.(workflow.id); }}
            onMouseEnter={(e) => (e.target.style.color = '#da3633')}
            onMouseLeave={(e) => (e.target.style.color = '#484f58')}
          >
            cancel
          </button>
        )}
        <span style={{ color: '#484f58', fontSize: 12 }}>
          {expanded ? '\u25B2' : '\u25BC'}
        </span>
      </div>

      {/* Progress bar */}
      {isActive && (
        <div style={{
          height: 2, background: '#21262d',
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
          padding: '10px 14px', borderTop: '1px solid #30363d',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {/* Pipeline visualization */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 10, color: '#8b949e', marginBottom: 4,
          }}>
            <span style={{ color: ROLE_COLORS[AGENT_ROLE.ARCHITECT] }}>Architect</span>
            <span>&rarr;</span>
            <span style={{ color: ROLE_COLORS[AGENT_ROLE.DEV] }}>Dev</span>
            <span>&rarr;</span>
            <span style={{ color: ROLE_COLORS[AGENT_ROLE.REVIEWER] }}>Review (/review)</span>
            <span>&harr;</span>
            <span style={{ color: '#3fb950' }}>Done</span>
          </div>

          {/* Steps timeline */}
          {workflow.steps.map((step, i) => {
            const roleColor = ROLE_COLORS[step.role] || '#8b949e';
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
                      <span style={{ fontSize: 10, color: '#e6edf3' }}>
                        {step.agentName}
                      </span>
                    )}
                    <span style={{ fontSize: 9, color: '#484f58' }}>
                      {step.action}
                    </span>
                  </div>
                  {step.models && (
                    <div style={{ fontSize: 9, color: '#8b949e', marginTop: 2 }}>
                      Models: {step.models.join(', ')}
                    </div>
                  )}
                  {step.message && (
                    <div style={{ fontSize: 10, color: '#3fb950', marginTop: 2 }}>
                      {step.message}
                    </div>
                  )}
                  <div style={{ fontSize: 9, color: '#484f58', marginTop: 1 }}>
                    {new Date(step.timestamp).toLocaleTimeString()}
                    {step.completedAt && ` \u2192 ${new Date(step.completedAt).toLocaleTimeString()}`}
                  </div>
                </div>
                {step.hasOutput && (
                  <span style={{
                    fontSize: 9, color: '#3fb950', padding: '1px 4px',
                    background: '#3fb95011', borderRadius: 3,
                  }}>
                    output
                  </span>
                )}
              </div>
            );
          })}

          {workflow.steps.length === 0 && (
            <div style={{ fontSize: 11, color: '#484f58', fontStyle: 'italic' }}>
              Waiting to start...
            </div>
          )}

          {workflow.error && (
            <div style={{
              fontSize: 11, color: '#f85149', padding: '6px 8px',
              background: '#da363311', borderRadius: 4,
            }}>
              {workflow.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WorkflowPanel({ workflows, onCancel }) {
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
        fontSize: 10, color: '#484f58', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: 1, padding: '0 2px',
      }}>
        Workflows ({active.length} active)
      </div>
      {active.map((wf) => (
        <WorkflowCard key={wf.id} workflow={wf} onCancel={onCancel} />
      ))}
      {completed.map((wf) => (
        <WorkflowCard key={wf.id} workflow={wf} onCancel={onCancel} />
      ))}
    </div>
  );
}
