import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ConfirmKillModal from '../src/components/ConfirmKillModal';

describe('ConfirmKillModal', () => {
  const defaultProps = {
    isOpen: true,
    agentLabel: 'test-agent',
    onConfirmKill: vi.fn(),
    onCancel: vi.fn(),
  };

  // ------------------------------------------------------------------
  it('renders when isOpen is true', () => {
    render(<ConfirmKillModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText(/Kill & Close/)).toBeTruthy();
  });

  // ------------------------------------------------------------------
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ConfirmKillModal {...defaultProps} isOpen={false} />,
    );
    expect(container.innerHTML).toBe('');
  });

  // ------------------------------------------------------------------
  it('displays agent label in the message', () => {
    render(<ConfirmKillModal {...defaultProps} agentLabel="my-agent" />);
    expect(screen.getByText('my-agent')).toBeTruthy();
  });

  // ------------------------------------------------------------------
  it('calls onConfirmKill when "Kill & Close" is clicked', () => {
    const onConfirmKill = vi.fn();
    render(
      <ConfirmKillModal {...defaultProps} onConfirmKill={onConfirmKill} />,
    );
    fireEvent.click(screen.getByText(/Kill & Close/));
    expect(onConfirmKill).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------------------------------
  it('calls onCancel when "Cancel" is clicked', () => {
    const onCancel = vi.fn();
    render(<ConfirmKillModal {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------------------------------
  it('calls onCancel on Escape key', () => {
    const onCancel = vi.fn();
    render(<ConfirmKillModal {...defaultProps} onCancel={onCancel} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
