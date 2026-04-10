import React from 'react';
import AgentPanel from './AgentPanel';
import TerminalView from './TerminalView';

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(520px, 1fr))',
    gap: 16,
    padding: '16px 20px',
    flex: 1,
    overflow: 'auto',
    alignContent: 'start',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 60,
    gap: 16,
    animation: 'fadeSlideIn 0.3s ease both',
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    background: 'linear-gradient(135deg, #f1f5f9 0%, #ffffff 100%)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: '#475569',
    letterSpacing: '-0.2px',
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 1.7,
    maxWidth: 320,
  },
  emptyHint: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 12px',
    borderRadius: 20,
    background: 'rgba(37, 99, 235, 0.06)',
    border: '1px solid rgba(37, 99, 235, 0.18)',
    fontSize: 12,
    color: '#2563eb',
    fontWeight: 500,
  },
};

export default function AgentGrid({ sessions, onKill, onClose }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIconWrap}>⌨</div>
        <div style={styles.emptyTitle}>No active sessions</div>
        <div style={styles.emptyText}>
          Click <strong style={{ color: '#475569' }}>+ Session</strong> in the header to spin up a
          quick agent session, or <strong style={{ color: '#475569' }}>+ Agent</strong> to create a
          persistent agent.
        </div>
        <span style={styles.emptyHint}>💡 Agents persist between sessions</span>
      </div>
    );
  }

  return (
    <div style={styles.grid}>
      {sessions.map((session) => (
        <AgentPanel key={session.id} session={session} onKill={onKill} onClose={onClose}>
          <TerminalView sessionId={session.id} />
        </AgentPanel>
      ))}
    </div>
  );
}
