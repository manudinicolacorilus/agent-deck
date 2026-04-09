import React, { useState, useEffect, useRef } from 'react';
import DirectoryBrowser from './DirectoryBrowser.jsx';

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(6px)',
  },
  modal: {
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: 14,
    width: '100%',
    maxWidth: 520,
    padding: 0,
    boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
    animation: 'scaleIn 0.18s ease both',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #21262d',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#e6edf3',
    letterSpacing: '-0.2px',
  },
  headerSub: {
    fontSize: 12,
    color: '#58a6ff',
    fontWeight: 500,
    marginLeft: 8,
    background: 'rgba(56,139,253,0.1)',
    padding: '1px 7px',
    borderRadius: 10,
    border: '1px solid rgba(56,139,253,0.2)',
  },
  closeBtn: {
    background: 'none',
    border: '1px solid transparent',
    color: '#8b949e',
    fontSize: 18,
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 6,
    lineHeight: 1,
    transition: 'color 0.15s ease, background 0.15s ease, border-color 0.15s ease',
  },
  body: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: '#8b949e',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    padding: '8px 12px',
    background: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: 6,
    color: '#e6edf3',
    fontSize: 14,
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  },
  textarea: {
    padding: '10px 12px',
    background: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: 6,
    color: '#e6edf3',
    fontSize: 14,
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
    outline: 'none',
    resize: 'vertical',
    minHeight: 110,
    lineHeight: 1.6,
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    padding: '14px 20px',
    borderTop: '1px solid #21262d',
    background: '#0f1318',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  cancelBtn: {
    padding: '6px 16px',
    background: 'transparent',
    color: '#8b949e',
    border: '1px solid #30363d',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'color 0.15s ease, border-color 0.15s ease, background 0.15s ease',
  },
  submitBtn: {
    padding: '6px 18px',
    background: '#238636',
    color: '#fff',
    border: '1px solid rgba(240, 246, 252, 0.1)',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'filter 0.15s ease, box-shadow 0.15s ease',
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
    transition: 'background 0.15s ease, border-color 0.15s ease',
  },
};

export default function AssignPromptModal({ isOpen, agent, onClose, onSubmit }) {
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

  if (!isOpen || !agent) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || !workDir.trim()) return;
    onSubmit(agent.id, { prompt, workDir });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <>
      <div style={styles.overlay} onClick={handleOverlayClick} onKeyDown={handleKeyDown}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <div>
              <span style={styles.headerTitle}>Assign Work</span>
              <span style={styles.headerSub}>{agent.name}</span>
            </div>
            <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.body}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={styles.label}>Working Directory</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    style={{ ...styles.input, flex: 1 }}
                    type="text"
                    value={workDir}
                    onChange={(e) => setWorkDir(e.target.value)}
                    placeholder="."
                    required
                    onFocus={(e) => { e.target.style.borderColor = '#388bfd'; e.target.style.boxShadow = '0 0 0 3px rgba(56,139,253,0.15)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#30363d'; e.target.style.boxShadow = 'none'; }}
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={styles.label}>Prompt</label>
                <textarea
                  ref={textareaRef}
                  style={styles.textarea}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the task for this agent..."
                  onFocus={(e) => { e.target.style.borderColor = '#388bfd'; e.target.style.boxShadow = '0 0 0 3px rgba(56,139,253,0.15)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#30363d'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <div style={styles.footer}>
              <button type="button" style={styles.cancelBtn} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" style={styles.submitBtn}>
                Send to Desk
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
