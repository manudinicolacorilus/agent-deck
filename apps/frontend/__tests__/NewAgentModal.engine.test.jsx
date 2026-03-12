import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Mock api module
vi.mock('../src/lib/api.js', () => ({
  getEngines: vi.fn(),
  browsePath: vi.fn(),
  browseRoots: vi.fn(),
}));

// Mock useElapsedTime (in case any child component needs it)
vi.mock('../src/hooks/useElapsedTime', () => ({
  default: () => '0s',
}));

import * as api from '../src/lib/api.js';
import NewAgentModal from '../src/components/NewAgentModal';

describe('NewAgentModal — engine, yolo, browse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getEngines.mockResolvedValue({
      engines: [
        { id: 'copilot', label: 'GitHub Copilot' },
        { id: 'claude', label: 'Claude Code' },
      ],
    });
    api.browseRoots.mockResolvedValue({ roots: ['C:\\'] });
    api.browsePath.mockResolvedValue({
      current: 'C:\\Dev',
      parent: 'C:\\',
      directories: [],
    });
  });

  it('engine selector displays available engines', async () => {
    render(<NewAgentModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('engine-copilot')).toBeTruthy();
      expect(screen.getByTestId('engine-claude')).toBeTruthy();
    });
  });

  it('yolo toggle is OFF by default', () => {
    render(<NewAgentModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />);

    const toggle = screen.getByTestId('yolo-toggle');
    expect(toggle.getAttribute('aria-checked')).toBe('false');
    expect(screen.queryByTestId('yolo-warning')).toBeNull();
  });

  it('yolo toggle shows warning text when ON', () => {
    render(<NewAgentModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByTestId('yolo-toggle'));
    expect(screen.getByTestId('yolo-warning')).toBeTruthy();
    expect(screen.getByText(/without asking for confirmation/)).toBeTruthy();
  });

  it('submit includes engine and yolo in payload', async () => {
    const onSubmit = vi.fn();
    render(<NewAgentModal isOpen={true} onClose={vi.fn()} onSubmit={onSubmit} />);

    await waitFor(() => {
      expect(screen.getByTestId('engine-claude')).toBeTruthy();
    });

    // Select claude engine
    fireEvent.click(screen.getByTestId('engine-claude'));

    // Enable yolo
    fireEvent.click(screen.getByTestId('yolo-toggle'));

    // Submit form
    fireEvent.click(screen.getByText('Create Session'));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        engine: 'claude',
        yolo: true,
      }),
    );
  });

  it('browse button opens DirectoryBrowser', async () => {
    render(<NewAgentModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByTestId('browse-button'));

    await waitFor(() => {
      expect(screen.getByText('Browse for folder')).toBeTruthy();
    });
  });

  it('selecting a directory updates the workDir field', async () => {
    api.browsePath.mockResolvedValue({
      current: 'C:\\Dev\\MyProject',
      parent: 'C:\\Dev',
      directories: [],
    });

    render(<NewAgentModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />);

    // Open browse dialog
    fireEvent.click(screen.getByTestId('browse-button'));

    await waitFor(() => {
      expect(screen.getByTestId('select-folder')).toBeTruthy();
    });

    // Select the folder
    fireEvent.click(screen.getByTestId('select-folder'));

    // Verify workDir input updated
    await waitFor(() => {
      const inputs = screen.getAllByDisplayValue('C:\\Dev\\MyProject');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });
});
