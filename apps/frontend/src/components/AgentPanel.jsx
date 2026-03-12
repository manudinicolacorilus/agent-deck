import React from 'react';
import StatusBadge, { EngineBadge, YoloBadge } from './StatusBadge';
import ConfirmKillModal from './ConfirmKillModal';
import useElapsedTime from '../hooks/useElapsedTime';

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 360,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderBottom: '1px solid #30363d',
    background: '#161b22',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: '#e6edf3',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  killBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    background: 'transparent',
    color: '#da3633',
    border: '1px solid #da363366',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: 'inherit',
    flexShrink: 0,
  },
  closeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    padding: 0,
    background: 'transparent',
    color: '#8b949e',
    border: '1px solid transparent',
    borderRadius: 6,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: 'inherit',
    lineHeight: 1,
    flexShrink: 0,
  },
  terminal: {
    flex: 1,
    background: '#0d1117',
    padding: 2,
    minHeight: 200,
    position: 'relative',
    overflow: 'hidden',
  },
  terminalPlaceholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#484f58',
    fontSize: 13,
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '8px 14px',
    borderTop: '1px solid #30363d',
    background: '#161b22',
    fontSize: 12,
    color: '#8b949e',
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
  },
  footerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  footerLabel: {
    color: '#484f58',
  },
  prompt: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};

export default function AgentPanel({ session, onKill, onClose, children }) {
  const [killHover, setKillHover] = React.useState(false);
  const [closeHover, setCloseHover] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const elapsed = useElapsedTime(session.createdAt || session.startedAt);

  const isRunning = session.state === 'running';

  const handleCloseClick = () => {
    if (isRunning) {
      setConfirmOpen(true);
    } else {
      onClose?.(session.id);
    }
  };

  const handleConfirmKill = () => {
    setConfirmOpen(false);
    onClose?.(session.id);
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.label}>{session.label || session.id}</span>
          <StatusBadge state={session.state} />
          {session.engine && <EngineBadge engine={session.engine} />}
          {session.yolo && <YoloBadge />}
        </div>
        <div style={styles.headerRight}>
          <button
            style={{
              ...styles.killBtn,
              background: killHover ? 'rgba(218, 54, 51, 0.15)' : 'transparent',
              borderColor: killHover ? '#da3633' : '#da363366',
            }}
            onMouseEnter={() => setKillHover(true)}
            onMouseLeave={() => setKillHover(false)}
            onClick={() => onKill?.(session.id)}
          >
            Kill
          </button>
          <button
            data-testid="close-button"
            style={{
              ...styles.closeBtn,
              color: closeHover ? '#e6edf3' : '#8b949e',
              borderColor: closeHover ? '#30363d' : 'transparent',
              background: closeHover ? '#21262d' : 'transparent',
            }}
            onMouseEnter={() => setCloseHover(true)}
            onMouseLeave={() => setCloseHover(false)}
            onClick={handleCloseClick}
            aria-label="Close panel"
            title="Close panel"
          >
            &#10005;
          </button>
        </div>
      </div>

      <div style={styles.terminal}>
        {children || (
          <div style={styles.terminalPlaceholder}>
            Terminal not connected
          </div>
        )}
      </div>

      <div style={styles.footer}>
        <span style={styles.footerItem}>
          <span style={styles.footerLabel}>dir:</span>
          {session.workDir || '.'}
        </span>
        <span style={styles.footerItem}>
          <span style={styles.footerLabel}>time:</span>
          {elapsed}
        </span>
        {session.prompt && (
          <span style={{ ...styles.footerItem, ...styles.prompt }}>
            <span style={styles.footerLabel}>prompt:</span>
            <span style={styles.prompt} title={session.prompt}>
              {session.prompt}
            </span>
          </span>
        )}
      </div>

      <ConfirmKillModal
        isOpen={confirmOpen}
        agentLabel={session.label || session.id}
        onConfirmKill={handleConfirmKill}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
