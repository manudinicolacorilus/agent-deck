import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Mock api module
vi.mock('../src/lib/api.js', () => ({
  browsePath: vi.fn(),
  browseRoots: vi.fn(),
}));

import * as api from '../src/lib/api.js';
import DirectoryBrowser from '../src/components/DirectoryBrowser';

describe('DirectoryBrowser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.browseRoots.mockResolvedValue({ roots: ['C:\\', 'D:\\'] });
    api.browsePath.mockResolvedValue({
      current: 'C:\\Dev',
      parent: 'C:\\',
      directories: ['Corilus', 'Projects', 'Tools'],
    });
  });

  it('renders drive roots on open', async () => {
    render(
      <DirectoryBrowser
        isOpen={true}
        initialPath="C:\\Dev"
        onSelect={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('drive-C')).toBeTruthy();
      expect(screen.getByTestId('drive-D')).toBeTruthy();
    });
  });

  it('clicking a directory navigates into it', async () => {
    render(
      <DirectoryBrowser
        isOpen={true}
        initialPath="C:\\Dev"
        onSelect={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('dir-Corilus')).toBeTruthy();
    });

    api.browsePath.mockResolvedValue({
      current: 'C:\\Dev\\Corilus',
      parent: 'C:\\Dev',
      directories: ['CCPharmacy', 'Other'],
    });

    fireEvent.click(screen.getByTestId('dir-Corilus'));

    await waitFor(() => {
      expect(screen.getByTestId('dir-CCPharmacy')).toBeTruthy();
    });
  });

  it('breadcrumb navigation works', async () => {
    api.browsePath.mockResolvedValue({
      current: 'C:\\Dev\\Corilus',
      parent: 'C:\\Dev',
      directories: ['CCPharmacy'],
    });

    render(
      <DirectoryBrowser
        isOpen={true}
        initialPath="C:\\Dev\\Corilus"
        onSelect={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('breadcrumb-1')).toBeTruthy();
    });

    api.browsePath.mockResolvedValue({
      current: 'C:\\Dev',
      parent: 'C:\\',
      directories: ['Corilus', 'Projects'],
    });

    // Click "Dev" breadcrumb segment (index 1)
    fireEvent.click(screen.getByTestId('breadcrumb-1'));

    await waitFor(() => {
      expect(api.browsePath).toHaveBeenCalled();
    });
  });

  it('"Select this folder" calls onSelect with current path', async () => {
    const onSelect = vi.fn();
    render(
      <DirectoryBrowser
        isOpen={true}
        initialPath="C:\\Dev"
        onSelect={onSelect}
        onCancel={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('select-folder')).toBeTruthy();
    });

    fireEvent.click(screen.getByTestId('select-folder'));
    expect(onSelect).toHaveBeenCalledWith('C:\\Dev');
  });

  it('Cancel closes the browser', async () => {
    const onCancel = vi.fn();
    render(
      <DirectoryBrowser
        isOpen={true}
        initialPath="C:\\Dev"
        onSelect={vi.fn()}
        onCancel={onCancel}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('Escape key closes the browser', async () => {
    const onCancel = vi.fn();
    render(
      <DirectoryBrowser
        isOpen={true}
        initialPath="C:\\Dev"
        onSelect={vi.fn()}
        onCancel={onCancel}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    fireEvent.keyDown(screen.getByRole('dialog').parentElement, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalled();
  });

  it('shows error state for inaccessible directory', async () => {
    api.browsePath.mockRejectedValue(new Error('Cannot access directory'));

    render(
      <DirectoryBrowser
        isOpen={true}
        initialPath="C:\\nope"
        onSelect={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Cannot access directory')).toBeTruthy();
    });
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <DirectoryBrowser
        isOpen={false}
        initialPath="C:\\Dev"
        onSelect={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(container.innerHTML).toBe('');
  });
});
