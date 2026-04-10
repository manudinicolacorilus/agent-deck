import { useState, useEffect, useCallback, useMemo } from 'react';
import React from 'react';

const LIGHT = {
  bg:        '#f8fafc',
  surface:   '#ffffff',
  overlay:   '#f1f5f9',
  inset:     '#f8fafc',
  border:    '#e2e8f0',
  borderMd:  '#cbd5e1',
  borderStr: '#94a3b8',
  text:      '#0f172a',
  textSec:   '#475569',
  textMuted: '#94a3b8',
  shadow:    '0 1px 3px rgba(0,0,0,0.08)',
  shadowMd:  '0 4px 12px rgba(0,0,0,0.10)',
  // for panels / cards
  cardBg:    '#ffffff',
  cardBorder:'#e2e8f0',
  hoverBg:   '#f1f5f9',
  // toggle-specific
  viewToggleBg: '#f1f5f9',
  viewToggleBorder: '#cbd5e1',
  viewBtnInactive: '#64748b',
  iconBtnColor: '#64748b',
};

const DARK = {
  bg:        '#0d1117',
  surface:   '#161b22',
  overlay:   '#21262d',
  inset:     '#0d1117',
  border:    '#30363d',
  borderMd:  '#484f58',
  borderStr: '#6e7681',
  text:      '#e6edf3',
  textSec:   '#b1bac4',
  textMuted: '#7d8590',
  shadow:    '0 1px 3px rgba(0,0,0,0.3)',
  shadowMd:  '0 4px 12px rgba(0,0,0,0.4)',
  cardBg:    '#161b22',
  cardBorder:'#30363d',
  hoverBg:   '#21262d',
  viewToggleBg: '#21262d',
  viewToggleBorder: '#30363d',
  viewBtnInactive: '#b1bac4',
  iconBtnColor: '#8b949e',
};

const ThemeContext = React.createContext({ colors: LIGHT, isDark: false, toggleTheme: () => {} });

export function useThemeColors() {
  return React.useContext(ThemeContext);
}

export const ThemeProvider = ThemeContext.Provider;

/**
 * Manages dark/light theme with persistence.
 */
export default function useTheme() {
  const [theme, setThemeState] = useState(() => {
    const stored = localStorage.getItem('agent-deck-theme');
    if (stored) return stored;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('agent-deck-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const isDark = theme === 'dark';
  const colors = isDark ? DARK : LIGHT;

  const ctx = useMemo(() => ({ colors, isDark, toggleTheme }), [colors, isDark, toggleTheme]);

  return { theme, toggleTheme, isDark, colors, ctx };
}
