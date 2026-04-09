import React from 'react';
import { AGENT_VISUAL_STATE } from '@agent-deck/shared';
import WorkflowPanel from './WorkflowPanel';
import OfficeFloorPlan from './office/OfficeFloorPlan';
import AgentHealthSidebar from './office/AgentHealthSidebar';
import useCharacterPositions from '../hooks/useCharacterPositions';
import useAgentInteractions from '../hooks/useAgentInteractions';
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
        background: '#f8fafc',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 18,
          background: 'linear-gradient(135deg, #f1f5f9 0%, #ffffff 100%)',
          border: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        }}>🏢</div>
        <div style={{ fontSize: 17, fontWeight: 600, color: '#475569', letterSpacing: '-0.2px' }}>
          The office is empty
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', lineHeight: 1.7, maxWidth: 320 }}>
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
      background: '#f8fafc',
      minHeight: 0,
    }}>
      {/* ── Left sidebar: health monitoring ── */}
      <AgentHealthSidebar
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

      {/* ── Right panel: workflows (only when active) ── */}
      {hasWorkflows && (
        <div style={{
          width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column',
          borderLeft: '1px solid #e2e8f0', overflow: 'hidden',
          background: '#ffffff',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 12px',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc', flexShrink: 0,
          }}>
            <span style={{ fontSize: 13 }}>⚡</span>
            <span style={{
              fontSize: 11, fontWeight: 700, color: '#64748b',
              textTransform: 'uppercase', letterSpacing: '1.5px',
            }}>Workflows</span>
            <span style={{
              marginLeft: 'auto', fontSize: 10,
              color: '#2563eb', fontWeight: 600,
              background: 'rgba(37,99,235,0.07)',
              padding: '1px 6px', borderRadius: 8,
              border: '1px solid rgba(37,99,235,0.18)',
            }}>
              {workflows.filter(w => !['done','error'].includes(w.state)).length} active
            </span>
          </div>
          <div className="thin-scrollbar" style={{ flex: 1, padding: 10, overflowY: 'auto' }}>
            <WorkflowPanel workflows={workflows} onCancel={onCancelWorkflow} />
          </div>
        </div>
      )}
    </div>
  );
}
