import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../lib/api.js';

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    width: '100%',
    maxWidth: 520,
    padding: 0,
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.14)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '12px 16px',
    borderBottom: '1px solid #e2e8f0',
    fontSize: 14,
    fontWeight: 600,
    color: '#0f172a',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    padding: '8px 16px',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    fontSize: 13,
    fontFamily: "'SFMono-Regular', Consolas, monospace",
    flexWrap: 'wrap',
  },
  breadcrumbSegment: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    cursor: 'pointer',
    padding: '2px 4px',
    borderRadius: 4,
    fontSize: 13,
    fontFamily: "'SFMono-Regular', Consolas, monospace",
  },
  breadcrumbSeparator: {
    color: '#94a3b8',
    fontSize: 12,
  },
  driveRow: {
    display: 'flex',
    gap: 6,
    padding: '8px 16px',
    borderBottom: '1px solid #e2e8f0',
    flexWrap: 'wrap',
  },
  driveBtn: {
    padding: '4px 10px',
    background: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    color: '#0f172a',
    fontSize: 12,
    fontFamily: "'SFMono-Regular', Consolas, monospace",
    cursor: 'pointer',
    fontWeight: 600,
  },
  dirList: {
    maxHeight: 300,
    overflowY: 'auto',
    padding: '4px 0',
  },
  dirItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 16px',
    background: 'transparent',
    border: 'none',
    color: '#0f172a',
    fontSize: 13,
    fontFamily: "'SFMono-Regular', Consolas, monospace",
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
  },
  dirIcon: {
    color: '#2563eb',
    fontSize: 14,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    padding: '12px 16px',
    borderTop: '1px solid #e2e8f0',
    background: '#f8fafc',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  cancelBtn: {
    padding: '6px 16px',
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  selectBtn: {
    padding: '6px 16px',
    background: '#16a34a',
    color: '#fff',
    border: '1px solid transparent',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  loading: {
    padding: '20px 16px',
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
  },
  error: {
    padding: '12px 16px',
    color: '#dc2626',
    fontSize: 13,
  },
  empty: {
    padding: '20px 16px',
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
  },
};

export default function DirectoryBrowser({ isOpen, initialPath, onSelect, onCancel }) {
  const [currentPath, setCurrentPath] = useState('');
  const [directories, setDirectories] = useState([]);
  const [parentPath, setParentPath] = useState(null);
  const [roots, setRoots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPath = useCallback(async (dirPath) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.browsePath(dirPath);
      setCurrentPath(result.current);
      setDirectories(result.directories);
      setParentPath(result.parent);
    } catch (err) {
      setError(err.message || 'Cannot access directory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    loadPath(initialPath || '');
    api.browseRoots().then((r) => setRoots(r.roots || [])).catch(() => {});
  }, [isOpen, initialPath, loadPath]);

  if (!isOpen) return null;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onCancel();
    if (e.key === 'Enter') onSelect(currentPath);
  };

  // Parse breadcrumb segments from currentPath
  const segments = [];
  if (currentPath) {
    const parts = currentPath.split(/[\\/]/);
    let accumulated = '';
    for (let i = 0; i < parts.length; i++) {
      if (i === 0) {
        accumulated = parts[0];
        // On Windows, first part is like "C:" — append separator
        if (accumulated && !accumulated.endsWith('\\')) {
          accumulated += '\\';
        }
        segments.push({ label: parts[0] || '/', path: accumulated });
      } else if (parts[i]) {
        accumulated = accumulated.replace(/\\$/, '') + '\\' + parts[i];
        segments.push({ label: parts[i], path: accumulated });
      }
    }
  }

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onCancel()} onKeyDown={handleKeyDown}>
      <div style={styles.modal} role="dialog" aria-label="Browse directories">
        <div style={styles.header}>Browse for folder</div>

        {/* Breadcrumb */}
        <div style={styles.breadcrumb}>
          {segments.map((seg, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span style={styles.breadcrumbSeparator}>&gt;</span>}
              <button
                style={styles.breadcrumbSegment}
                onClick={() => loadPath(seg.path)}
                data-testid={`breadcrumb-${i}`}
              >
                {seg.label}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Drive roots */}
        {roots.length > 0 && (
          <div style={styles.driveRow}>
            {roots.map((root) => (
              <button
                key={root}
                style={styles.driveBtn}
                onClick={() => loadPath(root)}
                data-testid={`drive-${root.charAt(0)}`}
              >
                {root}
              </button>
            ))}
          </div>
        )}

        {/* Directory list */}
        <div style={styles.dirList} data-testid="dir-list">
          {loading && <div style={styles.loading}>Loading...</div>}
          {error && <div style={styles.error}>{error}</div>}
          {!loading && !error && directories.length === 0 && (
            <div style={styles.empty}>No subdirectories</div>
          )}
          {!loading && !error && directories.map((dir) => (
            <button
              key={dir}
              style={styles.dirItem}
              onClick={() => loadPath(currentPath + '\\' + dir)}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              data-testid={`dir-${dir}`}
            >
              <span style={styles.dirIcon}>&#128193;</span>
              {dir}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button style={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button
            style={styles.selectBtn}
            onClick={() => onSelect(currentPath)}
            data-testid="select-folder"
          >
            Select this folder
          </button>
        </div>
      </div>
    </div>
  );
}
