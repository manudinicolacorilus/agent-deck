import React from 'react';
import StatusBadge, { EngineBadge, YoloBadge } from './StatusBadge';
import ConfirmKillModal from './ConfirmKillModal';
import useElapsedTime from '../hooks/useElapsedTime';

const STATUS_BORDER = {
  running: '#2ea043',
  stopped: '#da3633',
  error: '#d29922',
};

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: 10,
    overflow: 'hidden',
    minHeight: 360,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    animation: 'fadeSlideIn 0.25s ease both',
  },
  cardHover: {
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
    transform: 'translateY(-1px)',
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
    flex: 1,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
    marginLeft: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e6edf3',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  killBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 10px',
    background: 'transparent',
    color: '#da3633',
    border: '1px solid #da363344',
    borderRadius: 5,
    fontSize: 11,
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
    width: 26,
    height: 26,
    padding: 0,
    background: 'transparent',
    color: '#8b949e',
    border: '1px solid transparent',
    borderRadius: 5,
    fontSize: 14,
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
    padding: '7px 14px',
    borderTop: '1px solid #21262d',
    background: '#0f1318',
    fontSize: 11,
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
  const [cardHover, setCardHover] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const elapsed = useElapsedTime(session.createdAt || session.startedAt);

  const isRunning = session.state === 'running';
  const statusColor = STATUS_BORDER[session.state] || STATUS_BORDER.stopped;

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
    <div
      style={{
        ...styles.card,
        ...(cardHover ? styles.cardHover : {}),
        borderTop: `2px solid ${statusColor}`,
      }}
      onMouseEnter={() => setCardHover(true)}
      onMouseLeave={() => setCardHover(false)}
    >
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
              background: killHover ? 'rgba(218, 54, 51, 0.12)' : 'transparent',
              borderColor: killHover ? '#da3633' : '#da363344',
              color: killHover ? '#ff6b68' : '#da3633',
            }}
            onMouseEnter={() => setKillHover(true)}
            onMouseLeave={() => setKillHover(false)}
            onClick={() => onKill?.(session.id)}
            title="Kill this session"
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
