import React from 'react';
import AgentPanel from './AgentPanel';
import TerminalView from './TerminalView';
import { useThemeColors } from '../hooks/useTheme';

export default function AgentGrid({ sessions, onKill, onClose }) {
  const { colors } = useThemeColors();

  if (!sessions || sessions.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        flex: 1, padding: 60, gap: 16, animation: 'fadeSlideIn 0.3s ease both',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: `linear-gradient(135deg, ${colors.overlay} 0%, ${colors.surface} 100%)`,
          border: `1px solid ${colors.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, boxShadow: colors.shadow,
        }}>
          ⌨
        </div>
        <div style={{ fontSize: 17, fontWeight: 600, color: colors.textSec, letterSpacing: '-0.2px' }}>
          No active sessions
        </div>
        <div style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 1.7, maxWidth: 320 }}>
          Click <strong style={{ color: colors.textSec }}>+ Session</strong> in the header to spin up a
          quick agent session, or <strong style={{ color: colors.textSec }}>+ Agent</strong> to create a
          persistent agent.
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 20,
          background: 'rgba(37, 99, 235, 0.1)', border: '1px solid rgba(37, 99, 235, 0.25)',
          fontSize: 12, color: '#58a6ff', fontWeight: 500,
        }}>
          Agents persist between sessions
        </span>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(520px, 1fr))',
      gap: 16, padding: '16px 20px', flex: 1, overflow: 'auto', alignContent: 'start',
    }}>
      {sessions.map((session) => (
        <AgentPanel key={session.id} session={session} onKill={onKill} onClose={onClose}>
          <TerminalView sessionId={session.id} />
        </AgentPanel>
      ))}
    </div>
  );
}
