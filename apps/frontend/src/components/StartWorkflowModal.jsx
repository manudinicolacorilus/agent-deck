import React, { useState, useEffect, useRef } from 'react';
import DirectoryBrowser from './DirectoryBrowser.jsx';
import { AGENT_ROLE } from '@agent-deck/shared';

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
    maxWidth: 600,
    padding: 0,
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #30363d',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#e6edf3',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#8b949e',
    fontSize: 20,
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 6,
    lineHeight: 1,
  },
  body: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e6edf3',
  },
  input: {
    padding: '8px 12px',
    background: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: 6,
    color: '#e6edf3',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
  },
  textarea: {
    padding: '8px 12px',
    background: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: 6,
    color: '#e6edf3',
    fontSize: 14,
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
    outline: 'none',
    resize: 'vertical',
    minHeight: 120,
    lineHeight: 1.5,
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
  },
  submitBtn: {
    padding: '6px 16px',
    background: '#8957e5',
    color: '#fff',
    border: '1px solid rgba(240, 246, 252, 0.1)',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  browseBtn: {
    padding: '8px 14px',
    background: '#21262d',
    color: '#e6edf3',
    border: '1px solid #30363d',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  pipeline: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    background: '#0d111766',
    borderRadius: 8,
    border: '1px solid #30363d',
  },
  pipelineStep: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 10px',
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 600,
  },
  pipelineArrow: {
    color: '#484f58',
    fontSize: 14,
  },
  agentStatus: {
    padding: '8px 12px',
    borderRadius: 6,
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
};

const ROLE_COLORS = {
  [AGENT_ROLE.ARCHITECT]: '#d2a8ff',
  [AGENT_ROLE.DEV]: '#58a6ff',
  [AGENT_ROLE.REVIEWER]: '#f0883e',
};

export default function StartWorkflowModal({ isOpen, onClose, onSubmit, agents }) {
  const [prompt, setPrompt] = useState('');
  const [workDir, setWorkDir] = useState('.');
  const [browseOpen, setBrowseOpen] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPrompt('');
      setWorkDir('.');
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const architects = agents.filter((a) => a.role === AGENT_ROLE.ARCHITECT);
  const devs = agents.filter((a) => a.role === AGENT_ROLE.DEV);
  const reviewers = agents.filter((a) => a.role === AGENT_ROLE.REVIEWER);

  const idleArchitects = architects.filter((a) => !a.currentSessionId);
  const idleDevs = devs.filter((a) => !a.currentSessionId);
  const idleReviewers = reviewers.filter((a) => !a.currentSessionId);

  const canStart = prompt.trim() && architects.length > 0 && devs.length > 0 && reviewers.length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canStart) return;
    onSubmit({ prompt, workDir });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  const RoleStatus = ({ label, total, idle, color }) => (
    <div style={{
      ...styles.agentStatus,
      background: `${color}11`,
      border: `1px solid ${color}33`,
    }}>
      <span style={{ color, fontSize: 14 }}>
        {idle > 0 ? '\u2713' : '\u23F3'}
      </span>
      <span style={{ color: '#e6edf3' }}>{label}:</span>
      <span style={{ color: idle > 0 ? '#3fb950' : '#f8e3a1' }}>
        {idle}/{total} idle
      </span>
    </div>
  );

  return (
    <>
      <div style={styles.overlay} onClick={handleOverlayClick} onKeyDown={handleKeyDown}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <span style={styles.headerTitle}>Start Workflow Pipeline</span>
            <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.body}>
              {/* Pipeline visualization */}
              <div style={styles.pipeline}>
                <div style={{
                  ...styles.pipelineStep,
                  background: `${ROLE_COLORS[AGENT_ROLE.ARCHITECT]}22`,
                  color: ROLE_COLORS[AGENT_ROLE.ARCHITECT],
                }}>
                  Architect
                </div>
                <span style={styles.pipelineArrow}>&rarr;</span>
                <div style={{
                  ...styles.pipelineStep,
                  background: `${ROLE_COLORS[AGENT_ROLE.DEV]}22`,
                  color: ROLE_COLORS[AGENT_ROLE.DEV],
                }}>
                  Developer
                </div>
                <span style={styles.pipelineArrow}>&rarr;</span>
                <div style={{
                  ...styles.pipelineStep,
                  background: `${ROLE_COLORS[AGENT_ROLE.REVIEWER]}22`,
                  color: ROLE_COLORS[AGENT_ROLE.REVIEWER],
                }}>
                  Reviewer (3 models)
                </div>
                <span style={styles.pipelineArrow}>&harr;</span>
                <div style={{
                  ...styles.pipelineStep,
                  background: '#3fb95022',
                  color: '#3fb950',
                }}>
                  Done
                </div>
              </div>

              {/* Agent availability */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <RoleStatus label="Architects" total={architects.length} idle={idleArchitects.length} color={ROLE_COLORS[AGENT_ROLE.ARCHITECT]} />
                <RoleStatus label="Developers" total={devs.length} idle={idleDevs.length} color={ROLE_COLORS[AGENT_ROLE.DEV]} />
                <RoleStatus label="Reviewers" total={reviewers.length} idle={idleReviewers.length} color={ROLE_COLORS[AGENT_ROLE.REVIEWER]} />
              </div>

              {/* Review info */}
              <div style={{
                fontSize: 11, color: '#8b949e', padding: '8px 12px',
                background: '#0d111744', borderRadius: 6, border: '1px solid #30363d',
              }}>
                Review: uses Copilot&apos;s built-in /review command
              </div>

              {(architects.length === 0 || devs.length === 0 || reviewers.length === 0) && (
                <div style={{
                  padding: '10px 14px', background: '#da363322',
                  border: '1px solid #da363366', borderRadius: 6,
                  fontSize: 12, color: '#f85149',
                }}>
                  Missing agents! You need at least 1 of each role:
                  {architects.length === 0 && ' Architect'}
                  {devs.length === 0 && ' Developer'}
                  {reviewers.length === 0 && ' Reviewer'}
                </div>
              )}

              {/* Task prompt */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={styles.label}>Task Description</label>
                <textarea
                  ref={textareaRef}
                  style={styles.textarea}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the feature or task for the workflow pipeline..."
                  onFocus={(e) => (e.target.style.borderColor = '#8957e5')}
                  onBlur={(e) => (e.target.style.borderColor = '#30363d')}
                />
              </div>

              {/* Working directory */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={styles.label}>Working Directory</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    style={{ ...styles.input, fontFamily: "'SFMono-Regular', Consolas, monospace", flex: 1 }}
                    type="text"
                    value={workDir}
                    onChange={(e) => setWorkDir(e.target.value)}
                    placeholder="."
                    onFocus={(e) => (e.target.style.borderColor = '#8957e5')}
                    onBlur={(e) => (e.target.style.borderColor = '#30363d')}
                  />
                  <button
                    type="button"
                    style={styles.browseBtn}
                    onClick={() => setBrowseOpen(true)}
                  >
                    Browse...
                  </button>
                </div>
              </div>
            </div>

            <div style={styles.footer}>
              <button type="button" style={styles.cancelBtn} onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  ...styles.submitBtn,
                  opacity: canStart ? 1 : 0.5,
                  cursor: canStart ? 'pointer' : 'not-allowed',
                }}
                disabled={!canStart}
              >
                Start Workflow
              </button>
            </div>
          </form>
        </div>
      </div>

      <DirectoryBrowser
        isOpen={browseOpen}
        initialPath={workDir !== '.' ? workDir : ''}
        onSelect={(p) => { setWorkDir(p); setBrowseOpen(false); }}
        onCancel={() => setBrowseOpen(false)}
      />
    </>
  );
}
