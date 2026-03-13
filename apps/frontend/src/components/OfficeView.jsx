import React from 'react';
import { AGENT_VISUAL_STATE } from '@agent-deck/shared';
import WorkflowPanel from './WorkflowPanel';
import OfficeFloorPlan from './office/OfficeFloorPlan';
import useCharacterPositions from '../hooks/useCharacterPositions';
import useAgentInteractions from '../hooks/useAgentInteractions';
import '../styles/sprites.css';

/* ─── colour tokens ─── */
const C = {
  floor: '#1a1f27',
  wall: '#2d333b',
  wallTop: '#383f49',
  wallAccent: '#444c56',
  roomBg: '#161b22',
};

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
  const { positions, deskAssignments, getDeskPosition } = useCharacterPositions(
    agents, visualStates, activities, sessions
  );
  const { bubbles } = useAgentInteractions(agents, visualStates, positions);

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

  const hasWorkflows = workflows && workflows.length > 0;

  return (
    <div style={{
      flex: 1, overflow: 'auto', background: C.floor,
      padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
      minHeight: 0,
    }}>
      {/* Office header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 12px',
        background: C.wall, borderRadius: 6,
        borderLeft: '4px solid #58a6ff',
        flexShrink: 0,
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
          {agents.length} agent{agents.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{
        display: 'flex', gap: 12, flex: 1, minHeight: 0,
        alignItems: 'flex-start',
      }}>
        {/* 2D Floor Plan */}
        <div style={{
          flex: 1, overflow: 'auto', display: 'flex',
          justifyContent: 'center', alignItems: 'flex-start',
          minHeight: 0,
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
          />
        </div>

        {/* Workflow Board (side panel) */}
        {hasWorkflows && (
          <div style={{
            width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column',
            border: `2px solid ${C.wall}`, borderRadius: 8, overflow: 'hidden',
            background: C.roomBg, maxHeight: '100%',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', background: C.wallTop, borderRadius: '6px 6px 0 0',
              borderBottom: `2px solid ${C.wallAccent}`,
            }}>
              <span style={{ fontSize: 14 }}>🔄</span>
              <span style={{
                fontSize: 11, fontWeight: 700, color: '#8b949e',
                textTransform: 'uppercase', letterSpacing: '1.5px',
              }}>
                Workflow Board
              </span>
            </div>
            <div style={{ flex: 1, padding: 12, overflow: 'auto' }}>
              <WorkflowPanel workflows={workflows} onCancel={onCancelWorkflow} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
