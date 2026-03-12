import React, { useState, useEffect, useRef } from 'react';
import * as api from '../lib/api.js';
import DirectoryBrowser from './DirectoryBrowser.jsx';

// Module-level variable to remember last used engine across modal opens
let lastUsedEngine = 'copilot';

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
    maxWidth: 520,
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
    transition: 'color 0.15s ease',
  },
  body: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
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
    transition: 'border-color 0.15s ease',
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
    minHeight: 80,
    transition: 'border-color 0.15s ease',
    lineHeight: 1.5,
  },
  hint: {
    fontSize: 12,
    color: '#8b949e',
    marginTop: -2,
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
  submitBtn: {
    padding: '6px 16px',
    background: '#238636',
    color: '#fff',
    border: '1px solid rgba(240, 246, 252, 0.1)',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.15s ease',
  },
  workDirRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'stretch',
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
  engineGroup: {
    display: 'flex',
    gap: 10,
  },
  engineOption: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 14px',
    borderRadius: 8,
    cursor: 'pointer',
    border: '1px solid #30363d',
    background: '#0d1117',
    flex: 1,
    transition: 'all 0.15s ease',
  },
  engineOptionSelected: {
    border: '1px solid #388bfd',
    background: 'rgba(56, 139, 253, 0.1)',
  },
  engineRadio: {
    accentColor: '#388bfd',
  },
  engineLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e6edf3',
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    background: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: 6,
  },
  toggleLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e6edf3',
  },
  toggleHint: {
    fontSize: 11,
    color: '#8b949e',
  },
  toggleSwitch: {
    width: 40,
    height: 22,
    borderRadius: 11,
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background 0.2s ease',
    flexShrink: 0,
  },
  toggleKnob: {
    position: 'absolute',
    top: 2,
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: '#fff',
    transition: 'left 0.2s ease',
  },
  yoloWarning: {
    fontSize: 12,
    color: '#d29922',
    padding: '6px 12px',
    background: 'rgba(210, 153, 34, 0.1)',
    border: '1px solid rgba(210, 153, 34, 0.3)',
    borderRadius: 6,
  },
};

export default function NewAgentModal({ isOpen, onClose, onSubmit }) {
  const [label, setLabel] = useState('');
  const [workDir, setWorkDir] = useState('.');
  const [prompt, setPrompt] = useState('');
  const [engine, setEngine] = useState(lastUsedEngine);
  const [yolo, setYolo] = useState(false);
  const [engines, setEngines] = useState([]);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [submitHover, setSubmitHover] = useState(false);
  const [cancelHover, setCancelHover] = useState(false);
  const labelRef = useRef(null);

  useEffect(() => {
    if (isOpen && labelRef.current) {
      labelRef.current.focus();
    }
    if (isOpen) {
      setLabel('');
      setWorkDir('.');
      setPrompt('');
      setEngine(lastUsedEngine);
      setYolo(false);
      api.getEngines().then((r) => setEngines(r.engines || [])).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    lastUsedEngine = engine;
    onSubmit({ label, workDir, prompt, engine, yolo });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  const handleBrowseSelect = (path) => {
    setWorkDir(path);
    setBrowseOpen(false);
  };

  return (
    <>
      <div style={styles.overlay} onClick={handleOverlayClick} onKeyDown={handleKeyDown}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <span style={styles.headerTitle}>New Agent Session</span>
            <button
              style={styles.closeBtn}
              onClick={onClose}
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.body}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Label</label>
                <input
                  ref={labelRef}
                  style={styles.input}
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. fix-auth-bug"
                  onFocus={(e) => (e.target.style.borderColor = '#388bfd')}
                  onBlur={(e) => (e.target.style.borderColor = '#30363d')}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Working Directory</label>
                <div style={styles.workDirRow}>
                  <input
                    style={{ ...styles.input, fontFamily: "'SFMono-Regular', Consolas, monospace", flex: 1 }}
                    type="text"
                    value={workDir}
                    onChange={(e) => setWorkDir(e.target.value)}
                    placeholder="."
                    onFocus={(e) => (e.target.style.borderColor = '#388bfd')}
                    onBlur={(e) => (e.target.style.borderColor = '#30363d')}
                  />
                  <button
                    type="button"
                    style={styles.browseBtn}
                    onClick={() => setBrowseOpen(true)}
                    data-testid="browse-button"
                  >
                    Browse...
                  </button>
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Prompt</label>
                <textarea
                  style={styles.textarea}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the task for the agent..."
                  onFocus={(e) => (e.target.style.borderColor = '#388bfd')}
                  onBlur={(e) => (e.target.style.borderColor = '#30363d')}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Agent Engine</label>
                <div style={styles.engineGroup}>
                  {engines.map((eng) => (
                    <label
                      key={eng.id}
                      style={{
                        ...styles.engineOption,
                        ...(engine === eng.id ? styles.engineOptionSelected : {}),
                      }}
                    >
                      <input
                        type="radio"
                        name="engine"
                        value={eng.id}
                        checked={engine === eng.id}
                        onChange={() => setEngine(eng.id)}
                        style={styles.engineRadio}
                        data-testid={`engine-${eng.id}`}
                      />
                      <span style={styles.engineLabel}>{eng.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <div style={styles.toggleRow}>
                  <div style={styles.toggleLeft}>
                    <span style={styles.toggleLabel}>Yolo Mode</span>
                    <span style={styles.toggleHint}>Auto-accept all actions</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={yolo}
                    aria-label="Toggle yolo mode"
                    style={{
                      ...styles.toggleSwitch,
                      background: yolo ? '#238636' : '#30363d',
                    }}
                    onClick={() => setYolo(!yolo)}
                    data-testid="yolo-toggle"
                  >
                    <span style={{
                      ...styles.toggleKnob,
                      left: yolo ? 20 : 2,
                    }} />
                  </button>
                </div>
                {yolo && (
                  <div style={styles.yoloWarning} data-testid="yolo-warning">
                    Agent will execute actions without asking for confirmation
                  </div>
                )}
              </div>
            </div>

            <div style={styles.footer}>
              <button
                type="button"
                style={{
                  ...styles.cancelBtn,
                  background: cancelHover ? '#30363d' : '#21262d',
                }}
                onMouseEnter={() => setCancelHover(true)}
                onMouseLeave={() => setCancelHover(false)}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  ...styles.submitBtn,
                  background: submitHover ? '#2ea043' : '#238636',
                }}
                onMouseEnter={() => setSubmitHover(true)}
                onMouseLeave={() => setSubmitHover(false)}
              >
                Create Session
              </button>
            </div>
          </form>
        </div>
      </div>

      <DirectoryBrowser
        isOpen={browseOpen}
        initialPath={workDir !== '.' ? workDir : ''}
        onSelect={handleBrowseSelect}
        onCancel={() => setBrowseOpen(false)}
      />
    </>
  );
}
