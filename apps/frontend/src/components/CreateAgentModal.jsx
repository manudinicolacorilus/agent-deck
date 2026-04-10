import React, { useState, useEffect, useRef } from 'react';
import * as api from '../lib/api.js';
import { AGENT_ROLE } from '@agent-deck/shared';

let lastUsedEngine = 'copilot';

const ROLE_OPTIONS = [
  { id: null,                       label: 'None',         desc: 'General purpose agent' },
  { id: AGENT_ROLE.ARCHITECT,       label: 'Architect',    desc: 'Plans work, always uses plan mode' },
  { id: AGENT_ROLE.SUPER_MASTER,    label: 'Super-Master', desc: 'Oversees all agents and escalates' },
  { id: AGENT_ROLE.MASTER,          label: 'Master',       desc: 'Coordinates sub-teams' },
  { id: AGENT_ROLE.EXPLORER,        label: 'Explorer',     desc: 'Research, prototyping and discovery' },
  { id: AGENT_ROLE.DEV,             label: 'Developer',    desc: 'Implements plans from architects' },
  { id: AGENT_ROLE.INTEGRATOR,      label: 'Integrator',   desc: 'Merges work and resolves conflicts' },
  { id: AGENT_ROLE.TESTER,          label: 'Tester',       desc: 'Writes and runs automated tests' },
  { id: AGENT_ROLE.REVIEWER,        label: 'Reviewer',     desc: 'Reviews code with copilot /review' },
  { id: AGENT_ROLE.RELEASER,        label: 'Releaser',     desc: 'Handles deploys and release notes' },
];

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(6px)',
  },
  modal: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 14,
    width: '100%',
    maxWidth: 520,
    padding: 0,
    boxShadow: '0 24px 64px rgba(0, 0, 0, 0.15)',
    animation: 'scaleIn 0.18s ease both',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#0f172a',
    letterSpacing: '-0.2px',
  },
  closeBtn: {
    background: 'none',
    border: '1px solid transparent',
    color: '#94a3b8',
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
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    padding: '8px 12px',
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    color: '#0f172a',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  },
  hint: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 1.5,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    padding: '14px 20px',
    borderTop: '1px solid #e2e8f0',
    background: '#f8fafc',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  cancelBtn: {
    padding: '6px 16px',
    background: 'transparent',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'color 0.15s ease, border-color 0.15s ease, background 0.15s ease',
  },
  submitBtn: {
    padding: '6px 18px',
    background: '#16a34a',
    color: '#fff',
    border: '1px solid transparent',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'filter 0.15s ease, box-shadow 0.15s ease',
  },
  engineGroup: {
    display: 'flex',
    gap: 8,
  },
  engineOption: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 14px',
    borderRadius: 8,
    cursor: 'pointer',
    border: '1px solid #cbd5e1',
    background: '#f8fafc',
    flex: 1,
    transition: 'all 0.15s ease',
  },
  engineOptionSelected: {
    border: '1px solid #2563eb',
    background: 'rgba(37, 99, 235, 0.06)',
  },
  engineRadio: {
    accentColor: '#2563eb',
  },
  engineLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#0f172a',
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
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
    color: '#0f172a',
  },
  toggleHint: {
    fontSize: 11,
    color: '#64748b',
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
};

export default function CreateAgentModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [engine, setEngine] = useState(lastUsedEngine);
  const [yolo, setYolo] = useState(false);
  const [role, setRole] = useState(null);
  const [engines, setEngines] = useState([]);
  const nameRef = useRef(null);

  useEffect(() => {
    if (isOpen && nameRef.current) {
      nameRef.current.focus();
    }
    if (isOpen) {
      setName('');
      setEngine(lastUsedEngine);
      setYolo(false);
      setRole(null);
      api.getEngines().then((r) => setEngines(r.engines || [])).catch(() => {});
    }
  }, [isOpen]);

  // Auto-set engine to copilot when reviewer role is selected
  useEffect(() => {
    if (role === AGENT_ROLE.REVIEWER) {
      setEngine('copilot');
    }
  }, [role]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    lastUsedEngine = engine;
    onSubmit({ name, engine, yolo, role });
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
          <span style={styles.headerTitle}>New Persistent Agent</span>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.body}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Name</label>
              <input
                ref={nameRef}
                style={styles.input}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Backend Bot"
                required
                onFocus={(e) => { e.target.style.borderColor = '#388bfd'; e.target.style.boxShadow = '0 0 0 3px rgba(56,139,253,0.15)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#30363d'; e.target.style.boxShadow = 'none'; }}
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
                      ...(role === AGENT_ROLE.REVIEWER && eng.id !== 'copilot'
                        ? { opacity: 0.4, pointerEvents: 'none' } : {}),
                    }}
                  >
                    <input
                      type="radio"
                      name="engine"
                      value={eng.id}
                      checked={engine === eng.id}
                      onChange={() => setEngine(eng.id)}
                      style={styles.engineRadio}
                      disabled={role === AGENT_ROLE.REVIEWER && eng.id !== 'copilot'}
                    />
                    <span style={styles.engineLabel}>{eng.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Workflow Role</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ROLE_OPTIONS.map((opt) => (
                  <label
                    key={opt.id || 'none'}
                    style={{
                      ...styles.engineOption,
                      flex: 'none',
                      padding: '6px 12px',
                      ...(role === opt.id ? styles.engineOptionSelected : {}),
                    }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={opt.id || ''}
                      checked={role === opt.id}
                      onChange={() => setRole(opt.id)}
                      style={styles.engineRadio}
                    />
                    <div>
                      <span style={styles.engineLabel}>{opt.label}</span>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              {role === AGENT_ROLE.REVIEWER && (
                <div style={{ fontSize: 11, color: '#ea580c', marginTop: 4 }}>
                  Reviewer agents always use Copilot&apos;s built-in /review command
                </div>
              )}
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
                    background: yolo ? '#16a34a' : '#cbd5e1',
                  }}
                  onClick={() => setYolo(!yolo)}
                >
                  <span style={{
                    ...styles.toggleKnob,
                    left: yolo ? 20 : 2,
                  }} />
                </button>
              </div>
            </div>

            <div style={styles.hint}>
              No prompt or folder needed — specify the working directory when assigning work.
            </div>
          </div>

          <div style={styles.footer}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" style={styles.submitBtn}>
              Create Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
