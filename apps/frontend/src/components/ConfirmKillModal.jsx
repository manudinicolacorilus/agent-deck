import React, { useState, useEffect } from 'react';

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: 12,
    width: '100%',
    maxWidth: 420,
    padding: 0,
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
  },
  body: {
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    textAlign: 'center',
  },
  warningIcon: {
    fontSize: 32,
    lineHeight: 1,
  },
  message: {
    fontSize: 14,
    color: '#e6edf3',
    lineHeight: 1.5,
  },
  agentLabel: {
    fontWeight: 600,
    color: '#58a6ff',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    padding: '16px 20px',
    borderTop: '1px solid #30363d',
  },
  cancelBtn: {
    padding: '6px 16px',
    background: '#21262d',
    color: '#e6edf3',
    border: '1px solid #30363d',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.15s ease',
  },
  killBtn: {
    padding: '6px 16px',
    background: '#da3633',
    color: '#fff',
    border: '1px solid rgba(240, 246, 252, 0.1)',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.15s ease',
  },
};

export default function ConfirmKillModal({ isOpen, agentLabel, onConfirmKill, onCancel }) {
  const [killHover, setKillHover] = useState(false);
  const [cancelHover, setCancelHover] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.modal} role="dialog" aria-modal="true">
        <div style={styles.body}>
          <div style={styles.warningIcon}>&#9888;</div>
          <div style={styles.message}>
            Agent '<span style={styles.agentLabel}>{agentLabel}</span>' is still running. Kill it and close?
          </div>
        </div>
        <div style={styles.footer}>
          <button
            style={{
              ...styles.cancelBtn,
              background: cancelHover ? '#30363d' : '#21262d',
            }}
            onMouseEnter={() => setCancelHover(true)}
            onMouseLeave={() => setCancelHover(false)}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            style={{
              ...styles.killBtn,
              background: killHover ? '#b62324' : '#da3633',
            }}
            onMouseEnter={() => setKillHover(true)}
            onMouseLeave={() => setKillHover(false)}
            onClick={onConfirmKill}
          >
            Kill &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
}
