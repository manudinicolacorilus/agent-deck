import React, { useState, useEffect } from 'react';

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    width: '100%',
    maxWidth: 420,
    padding: 0,
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.14)',
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
    color: '#0f172a',
    lineHeight: 1.5,
  },
  agentLabel: {
    fontWeight: 600,
    color: '#2563eb',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    padding: '16px 20px',
    borderTop: '1px solid #e2e8f0',
  },
  cancelBtn: {
    padding: '6px 16px',
    background: '#f1f5f9',
    color: '#0f172a',
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.15s ease',
  },
  killBtn: {
    padding: '6px 16px',
    background: '#dc2626',
    color: '#fff',
    border: '1px solid transparent',
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
              background: cancelHover ? '#e2e8f0' : '#f1f5f9',
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
              background: killHover ? '#b91c1c' : '#dc2626',
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
