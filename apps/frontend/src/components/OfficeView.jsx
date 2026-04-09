import React from 'react';
import { AGENT_VISUAL_STATE } from '@agent-deck/shared';
import WorkflowPanel from './WorkflowPanel';
import OfficeFloorPlan from './office/OfficeFloorPlan';
import AgentCardPanel from './office/AgentCardPanel';
import useCharacterPositions from '../hooks/useCharacterPositions';
import useAgentInteractions from '../hooks/useAgentInteractions';
import OfficeChatPanel from './office/OfficeChatPanel';
import '../styles/sprites.css';

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
  onUpdateAgent,
  onCreateAgent,
  onDropAgentOnDesk,
  onCancelWorkflow,
}) {
  const { positions, deskAssignments, getDeskPosition } = useCharacterPositions(
    agents, visualStates, activities, sessions
  );
  const { bubbles } = useAgentInteractions(agents, visualStates, positions);

  const hasNoAgents = agents.length === 0 && sessions.length === 0;

  if (hasNoAgents) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', flex: 1, gap: 16,
        background: '#0d1117',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 18,
          background: 'linear-gradient(135deg, #21262d 0%, #161b22 100%)',
          border: '1px solid #30363d',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}>🏢</div>
        <div style={{ fontSize: 17, fontWeight: 600, color: '#8b949e', letterSpacing: '-0.2px' }}>
          The office is empty
        </div>
        <div style={{ fontSize: 13, color: '#484f58', textAlign: 'center', lineHeight: 1.7, maxWidth: 320 }}>
          Create a persistent agent to populate the office,<br />or spawn a quick session.
        </div>
      </div>
    );
  }

  const hasWorkflows = workflows && workflows.length > 0;

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      overflow: 'hidden',
      background: '#0d1117',
      minHeight: 0,
    }}>
      {/* ── Left sidebar: agents grouped by role ── */}
      <AgentCardPanel
        agents={agents}
        visualStates={visualStates}
        onUpdateAgent={onUpdateAgent}
        onDeleteAgent={onDeleteAgent}
        onCreateAgent={onCreateAgent}
      />

      {/* ── Centre: floor plan (fills remaining space) ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0,
      }}>
        <OfficeFloorPlan
          agents={agents}
          sessions={sessions}
          activities={activities}
          visualStates={visualStates}
          positions={positions}
          deskAssignments={deskAssignments}
          getDeskPosition={getDeskPosition}
          bubbles={bubbles}
          onClickIdleAgent={onClickIdleAgent}
          onClickWorkingAgent={onClickWorkingAgent}
          onDeleteAgent={onDeleteAgent}
          onDropAgentOnDesk={onDropAgentOnDesk}
        />
      </div>

      {/* ── Right panels: workflow board + chat ── */}
      {(hasWorkflows || true) && (
        <div style={{
          width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column',
          borderLeft: '1px solid #21262d', overflow: 'hidden',
          background: '#0f1318',
        }}>
          {/* Workflow section */}
          {hasWorkflows && (
            <div style={{
              display: 'flex', flexDirection: 'column',
              borderBottom: '1px solid #21262d', maxHeight: '50%', minHeight: 0,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 12px',
                borderBottom: '1px solid #21262d',
                background: '#161b22', flexShrink: 0,
              }}>
                <span style={{ fontSize: 13 }}>⚡</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: '#8b949e',
                  textTransform: 'uppercase', letterSpacing: '1.5px',
                }}>Workflows</span>
                <span style={{
                  marginLeft: 'auto', fontSize: 10,
                  color: '#58a6ff', fontWeight: 600,
                  background: 'rgba(56,139,253,0.1)',
                  padding: '1px 6px', borderRadius: 8,
                  border: '1px solid rgba(56,139,253,0.2)',
                }}>
                  {workflows.filter(w => !['done','error'].includes(w.state)).length} active
                </span>
              </div>
              <div className="thin-scrollbar" style={{ flex: 1, padding: 10, overflowY: 'auto' }}>
                <WorkflowPanel workflows={workflows} onCancel={onCancelWorkflow} />
              </div>
            </div>
          )}

          {/* Chat section */}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <OfficeChatPanel agents={agents} visualStates={visualStates} />
          </div>
        </div>
      )}
    </div>
  );
}
