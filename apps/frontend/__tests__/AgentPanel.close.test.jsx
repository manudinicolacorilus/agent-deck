import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock useElapsedTime to avoid timer complications in tests
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
    ...overrides,
  };
}

describe('AgentPanel — close button', () => {
  // ------------------------------------------------------------------
  it('close button is visible in panel header', () => {
    render(<AgentPanel session={makeSession()} />);
    const closeBtn = screen.getByTestId('close-button');
    expect(closeBtn).toBeTruthy();
  });

  // ------------------------------------------------------------------
  it('clicking close on a completed session calls onClose directly (no modal)', () => {
    const onClose = vi.fn();
    render(
      <AgentPanel
        session={makeSession({ state: 'stopped' })}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByTestId('close-button'));
    expect(onClose).toHaveBeenCalledWith('sess-1');
    // Confirm modal should NOT be visible
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  // ------------------------------------------------------------------
  it('clicking close on a running session opens ConfirmKillModal', () => {
    render(
      <AgentPanel
        session={makeSession({ state: 'running' })}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId('close-button'));
    // Modal should now be visible
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText(/Kill & Close/)).toBeTruthy();
  });

  // ------------------------------------------------------------------
  it('confirming kill in modal calls onClose', () => {
    const onClose = vi.fn();
    render(
      <AgentPanel
        session={makeSession({ state: 'running' })}
        onClose={onClose}
      />,
    );

    // Open modal
    fireEvent.click(screen.getByTestId('close-button'));
    // Confirm
    fireEvent.click(screen.getByText(/Kill & Close/));
    expect(onClose).toHaveBeenCalledWith('sess-1');
  });

  // ------------------------------------------------------------------
  it('cancelling modal keeps the panel open', () => {
    const onClose = vi.fn();
    render(
      <AgentPanel
        session={makeSession({ state: 'running' })}
        onClose={onClose}
      />,
    );

    // Open modal
    fireEvent.click(screen.getByTestId('close-button'));
    expect(screen.getByRole('dialog')).toBeTruthy();

    // Cancel
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).not.toHaveBeenCalled();
    // Modal should be dismissed
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
