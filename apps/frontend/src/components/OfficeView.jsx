import React from 'react';
import AgentDesk from './AgentDesk';

const styles = {
  container: {
    flex: 1,
    overflow: 'auto',
    background: '#0d1117',
    padding: 32,
    position: 'relative',
  },
  floor: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 32,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  breakRoom: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    minHeight: 180,
    border: '2px dashed #30363d',
    borderRadius: 12,
    padding: 20,
    background: '#161b2288',
  },
  breakRoomTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#8b949e',
    marginBottom: 8,
    letterSpacing: '0.5px',
  },
  breakRoomSub: {
    fontSize: 12,
    color: '#484f58',
    textAlign: 'center',
    lineHeight: 1.5,
  },
  breakRoomAgents: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
    justifyContent: 'center',
  },
  breakRoomAgent: {
    fontSize: 11,
    color: '#58a6ff',
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: 6,
    padding: '4px 10px',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 60,
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

export default function OfficeView({ sessions, activities, onSelectAgent }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyTitle}>The office is empty</div>
        <div style={styles.emptyText}>
          Spawn some agents to see them working at their desks.
        </div>
      </div>
    );
  }

  const activeAgents = sessions.filter((s) => s.state === 'running');
  const doneAgents = sessions.filter((s) => s.state !== 'running');

  return (
    <div style={styles.container}>
      <div style={styles.floor}>
        {activeAgents.map((session) => (
          <AgentDesk
            key={session.id}
            session={session}
            activity={activities[session.id] || 'idle'}
            onClick={() => onSelectAgent?.(session.id)}
          />
        ))}

        {doneAgents.length > 0 && (
          <div style={styles.breakRoom}>
            <div style={styles.breakRoomTitle}>Break Room</div>
            <div style={styles.breakRoomSub}>
              Completed agents hang out here
            </div>
            <div style={styles.breakRoomAgents}>
              {doneAgents.map((session) => (
                <div
                  key={session.id}
                  style={styles.breakRoomAgent}
                  onClick={() => onSelectAgent?.(session.id)}
                  title={`${session.label} — ${activities[session.id] || 'done'}`}
                  role="button"
                  tabIndex={0}
                >
                  {activities[session.id] === 'error' ? '!' : '\u2713'}{' '}
                  {session.label || session.id.slice(0, 8)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
