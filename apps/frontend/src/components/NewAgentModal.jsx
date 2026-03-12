import React, { useState, useEffect, useRef } from 'react';

const CMD_PRESETS = [
  { label: 'Mock Agent (default)', value: '' },
  { label: 'GitHub Copilot (interactive)', value: "cd '{workDir}'; copilot -i {prompt} --allow-all" },
  { label: 'GitHub Copilot (non-interactive)', value: "cd '{workDir}'; copilot -p {prompt} --allow-all-tools" },
  { label: 'Claude Code (interactive)', value: "cd '{workDir}'; claude {prompt}" },
  { label: 'Claude Code (non-interactive)', value: "cd '{workDir}'; claude -p {prompt} --allowedTools '*'" },
  { label: 'Custom...', value: '__custom__' },
];

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
  select: {
    padding: '8px 12px',
    background: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: 6,
    color: '#e6edf3',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    cursor: 'pointer',
    transition: 'border-color 0.15s ease',
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
};

export default function NewAgentModal({ isOpen, onClose, onSubmit }) {
  const [label, setLabel] = useState('');
  const [workDir, setWorkDir] = useState('.');
  const [prompt, setPrompt] = useState('');
  const [presetIndex, setPresetIndex] = useState(0);
  const [customCmd, setCustomCmd] = useState('');
  const [submitHover, setSubmitHover] = useState(false);
  const [cancelHover, setCancelHover] = useState(false);
  const labelRef = useRef(null);

  const isCustom = CMD_PRESETS[presetIndex]?.value === '__custom__';

  useEffect(() => {
    if (isOpen && labelRef.current) {
      labelRef.current.focus();
    }
    if (isOpen) {
      setLabel('');
      setWorkDir('.');
      setPrompt('');
      setPresetIndex(0);
      setCustomCmd('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cmdTemplate = isCustom ? customCmd : CMD_PRESETS[presetIndex].value;
    onSubmit({ label, workDir, prompt, cmdTemplate });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  return (
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
              <input
                style={{ ...styles.input, fontFamily: "'SFMono-Regular', Consolas, monospace" }}
                type="text"
                value={workDir}
                onChange={(e) => setWorkDir(e.target.value)}
                placeholder="."
                onFocus={(e) => (e.target.style.borderColor = '#388bfd')}
                onBlur={(e) => (e.target.style.borderColor = '#30363d')}
              />
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
              <label style={styles.label}>Command Template</label>
              <select
                style={styles.select}
                value={presetIndex}
                onChange={(e) => setPresetIndex(Number(e.target.value))}
                onFocus={(e) => (e.target.style.borderColor = '#388bfd')}
                onBlur={(e) => (e.target.style.borderColor = '#30363d')}
              >
                {CMD_PRESETS.map((preset, idx) => (
                  <option key={idx} value={idx}>
                    {preset.label}
                  </option>
                ))}
              </select>
              {isCustom && (
                <input
                  style={{
                    ...styles.input,
                    marginTop: 6,
                    fontFamily: "'SFMono-Regular', Consolas, monospace",
                    fontSize: 13,
                  }}
                  type="text"
                  value={customCmd}
                  onChange={(e) => setCustomCmd(e.target.value)}
                  placeholder="cd '{workDir}'; my-agent '{prompt}'"
                  onFocus={(e) => (e.target.style.borderColor = '#388bfd')}
                  onBlur={(e) => (e.target.style.borderColor = '#30363d')}
                />
              )}
              {!isCustom && presetIndex > 0 && (
                <div style={styles.hint}>
                  <code style={{ color: '#8b949e', fontSize: 11 }}>
                    {CMD_PRESETS[presetIndex].value}
                  </code>
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
  );
}
