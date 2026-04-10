import React, { useState, useEffect } from 'react';
import { WORKFLOW_STATE } from '@agent-deck/shared';
import { useThemeColors } from '../hooks/useTheme';
import * as api from '../lib/api.js';

const STATE_ICON = {
  [WORKFLOW_STATE.DONE]: '\u2705',
  [WORKFLOW_STATE.ERROR]: '\u274C',
  [WORKFLOW_STATE.PAUSED]: '\u23F8\uFE0F',
  [WORKFLOW_STATE.STUCK]: '\u26A0\uFE0F',
};

const STATE_COLOR = {
  [WORKFLOW_STATE.DONE]: '#3fb950',
  [WORKFLOW_STATE.ERROR]: '#f85149',
};

export default function MissionHistory() {
  const { colors } = useThemeColors();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.fetchWorkflowHistory(10).then(data => {
      if (!cancelled) { setMissions(data); setLoading(false); }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    const timer = setInterval(() => {
      api.fetchWorkflowHistory(10).then(data => {
        if (!cancelled) setMissions(data);
      }).catch(() => {});
    }, 30000);
    return () => { cancelled = true; clearInterval(timer); };
  }, []);

  if (loading) {
    return <div style={{ fontSize: 11, color: colors.textMuted, padding: 8 }}>Loading history...</div>;
  }

  if (missions.length === 0) {
    return <div style={{ fontSize: 11, color: colors.textMuted, padding: 8, fontStyle: 'italic' }}>No mission history yet.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{
        fontSize: 10, color: colors.textMuted, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: 1, padding: '4px 2px',
      }}>
        Recent Missions
      </div>
      {missions.map(m => (
        <div key={m.id} style={{
          padding: '8px 10px', background: colors.bg,
          border: `1px solid ${colors.border}`, borderRadius: 6,
          cursor: 'default',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12 }}>{STATE_ICON[m.state] || '\u23F3'}</span>
            <span style={{
              fontSize: 11, fontWeight: 600, color: colors.text,
              flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {m.prompt.slice(0, 50)}{m.prompt.length > 50 ? '...' : ''}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4, fontSize: 10, color: colors.textMuted }}>
            <span style={{ color: STATE_COLOR[m.state] || colors.textSec }}>{m.state}</span>
            <span>{new Date(m.createdAt).toLocaleDateString()}</span>
            {m.reviewCycle > 0 && <span>{m.reviewCycle} reviews</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
