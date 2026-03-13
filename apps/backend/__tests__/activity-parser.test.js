import { describe, it, expect, vi, beforeEach } from 'vitest';
import ActivityParser from '../src/activity-parser.js';

describe('ActivityParser', () => {
  let onChange;
  let parser;

  beforeEach(() => {
    vi.useFakeTimers();
    onChange = vi.fn();
    parser = new ActivityParser(onChange);
  });

  it('starts in idle state', () => {
    expect(parser.currentState).toBe('idle');
  });

  it('detects thinking activity', () => {
    parser.feed('Thinking about the best approach...');
    vi.advanceTimersByTime(400);
    expect(onChange).toHaveBeenCalledWith('thinking');
  });

  it('detects reading activity', () => {
    parser.feed('Reading file src/index.js');
    vi.advanceTimersByTime(400);
    expect(onChange).toHaveBeenCalledWith('reading');
  });

  it('detects editing activity', () => {
    parser.feed('Editing the configuration file');
    vi.advanceTimersByTime(400);
    expect(onChange).toHaveBeenCalledWith('editing');
  });

  it('detects running_command activity', () => {
    parser.feed('Running npm test');
    vi.advanceTimersByTime(400);
    expect(onChange).toHaveBeenCalledWith('running_command');
  });

  it('strips ANSI codes before matching', () => {
    parser.feed('\x1b[33mThinking about it\x1b[0m');
    vi.advanceTimersByTime(400);
    expect(onChange).toHaveBeenCalledWith('thinking');
  });

  it('does not emit when state unchanged', () => {
    parser.feed('Thinking...');
    vi.advanceTimersByTime(400);
    expect(onChange).toHaveBeenCalledTimes(1);

    parser.feed('Thinking more...');
    vi.advanceTimersByTime(400);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('markDone sets done state on exit code 0', () => {
    parser.markDone(0);
    expect(parser.currentState).toBe('done');
    expect(onChange).toHaveBeenCalledWith('done');
  });

  it('markDone sets error state on non-zero exit', () => {
    parser.markDone(1);
    expect(parser.currentState).toBe('error');
    expect(onChange).toHaveBeenCalledWith('error');
  });

  it('debounces rapid state changes', () => {
    parser.feed('Reading file');
    parser.feed('Editing file');
    vi.advanceTimersByTime(400);
    // Only the last detected state should fire
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('editing');
  });

  it('detects waiting_for_approval when Claude asks for permission', () => {
    parser.feed('Allow Read tool? Y/n');
    vi.advanceTimersByTime(400);
    expect(onChange).toHaveBeenCalledWith('waiting_for_approval');
  });

  it('detects waiting_for_approval from run/deny prompt', () => {
    parser.feed('⏎ to run, x to deny');
    vi.advanceTimersByTime(400);
    expect(onChange).toHaveBeenCalledWith('waiting_for_approval');
  });

  it('transitions to idle after inactivity timeout', () => {
    parser.feed('Reading file src/index.js');
    vi.advanceTimersByTime(400);
    expect(onChange).toHaveBeenCalledWith('reading');

    // No new data for 8 seconds
    vi.advanceTimersByTime(8_000);
    expect(onChange).toHaveBeenCalledWith('idle');
  });

  it('does not idle-timeout from waiting_for_approval', () => {
    parser.feed('Allow Read tool? Y/n');
    vi.advanceTimersByTime(400);
    expect(onChange).toHaveBeenCalledWith('waiting_for_approval');

    // Even after 8s, should stay waiting
    vi.advanceTimersByTime(8_000);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('does not idle-timeout from done state', () => {
    parser.markDone(0);
    vi.advanceTimersByTime(8_000);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('done');
  });

  it('dispose stops emitting', () => {
    parser.dispose();
    parser.feed('Thinking...');
    vi.advanceTimersByTime(400);
    expect(onChange).not.toHaveBeenCalled();
  });
});
