import React from 'react';
import AgentPanel from './AgentPanel';
import TerminalView from './TerminalView';

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
    gap: 16,
    padding: 16,
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
    padding: 40,
    color: '#484f58',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#8b949e',
  },
  emptyText: {
    fontSize: 14,
    color: '#484f58',
    textAlign: 'center',
    lineHeight: 1.6,
  },
};

export default function AgentGrid({ sessions, onKill }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyTitle}>No active agents</div>
        <div style={styles.emptyText}>
          Click "New Agent" to spin up a copilot session.
        </div>
      </div>
    );
  }

  return (
    <div style={styles.grid}>
      {sessions.map((session) => (
        <AgentPanel key={session.id} session={session} onKill={onKill}>
          {session.state === 'running' && (
            <TerminalView sessionId={session.id} />
          )}
        </AgentPanel>
      ))}
    </div>
  );
}
