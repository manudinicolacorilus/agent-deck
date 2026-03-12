import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock useElapsedTime
vi.mock('../src/hooks/useElapsedTime', () => ({
  default: () => '0s',
}));

import AgentPanel from '../src/components/AgentPanel';

function makeSession(overrides = {}) {
  return {
    id: 'sess-1',
    label: 'Test Agent',
    state: 'running',
    workDir: '/tmp',
    prompt: 'do something',
    createdAt: new Date().toISOString(),
    engine: 'copilot',
    yolo: false,
    ...overrides,
  };
}

describe('AgentPanel — engine and yolo badges', () => {
  it('engine badge displays for copilot session', () => {
    render(<AgentPanel session={makeSession({ engine: 'copilot' })} />);
    const badge = screen.getByTestId('engine-badge-copilot');
    expect(badge).toBeTruthy();
    expect(badge.textContent).toBe('Copilot');
  });

  it('engine badge displays for claude session', () => {
    render(<AgentPanel session={makeSession({ engine: 'claude' })} />);
    const badge = screen.getByTestId('engine-badge-claude');
    expect(badge).toBeTruthy();
    expect(badge.textContent).toBe('Claude');
  });

  it('yolo badge displays when session has yolo=true', () => {
    render(<AgentPanel session={makeSession({ yolo: true })} />);
    const badge = screen.getByTestId('yolo-badge');
    expect(badge).toBeTruthy();
    expect(badge.textContent).toBe('YOLO');
  });

  it('yolo badge NOT displayed when yolo=false', () => {
    render(<AgentPanel session={makeSession({ yolo: false })} />);
    expect(screen.queryByTestId('yolo-badge')).toBeNull();
  });

  it('both engine and yolo badges display together', () => {
    render(<AgentPanel session={makeSession({ engine: 'claude', yolo: true })} />);
    expect(screen.getByTestId('engine-badge-claude')).toBeTruthy();
    expect(screen.getByTestId('yolo-badge')).toBeTruthy();
  });
});
