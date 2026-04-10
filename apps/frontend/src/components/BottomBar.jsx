import React from 'react';
import { useThemeColors } from '../hooks/useTheme';

export default function BottomBar({ health, sessionCount }) {
  const { colors } = useThemeColors();
  const isHealthy = health === 'ok' || health === true;
  const dotColor  = isHealthy ? '#16a34a' : '#dc2626';
  const dotShadow = isHealthy ? `0 0 5px ${dotColor}88` : `0 0 5px ${dotColor}66`;
  const bgColor   = isHealthy ? 'rgba(22,163,74,0.07)'   : 'rgba(220,38,38,0.07)';
  const borderColor = isHealthy ? 'rgba(22,163,74,0.18)' : 'rgba(220,38,38,0.18)';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '5px 20px', background: colors.surface,
      borderTop: `1px solid ${colors.border}`,
      fontSize: 11, color: colors.textSec, flexShrink: 0, gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '2px 8px', borderRadius: 10,
          fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
          background: bgColor, border: `1px solid ${borderColor}`,
          color: isHealthy ? '#16a34a' : '#dc2626',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, boxShadow: dotShadow, flexShrink: 0 }} />
          {isHealthy ? 'Backend connected' : 'Backend offline'}
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '2px 8px', borderRadius: 10,
          fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
          background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)', color: '#2563eb',
        }}>
          {sessionCount ?? 0} session{(sessionCount ?? 0) !== 1 ? 's' : ''} active
        </span>
      </div>
      <span style={{
        color: colors.textMuted,
        fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
        letterSpacing: '0.02em',
      }}>
        Agent Deck v0.1
      </span>
    </div>
  );
}
