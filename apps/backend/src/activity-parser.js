import { ACTIVITY_STATE } from '@agent-deck/shared';

/**
 * Patterns that match terminal output to activity states.
 * Order matters — first match wins.
 */
const PATTERNS = [
  // Reading files
  { state: ACTIVITY_STATE.READING, patterns: [
    /\bRead(?:ing)?\b.*\bfile/i,
    /\bcat\s+/,
    /\bReading\b/i,
    /\bSearching\b/i,
    /\bGrep\b/i,
    /\bGlob\b/i,
    /\bLooking at\b/i,
    /\bExploring\b/i,
  ]},
  // Editing / writing files
  { state: ACTIVITY_STATE.EDITING, patterns: [
    /\bEdit(?:ing)?\b/i,
    /\bWrit(?:e|ing)\b.*\bfile/i,
    /\bCreat(?:e|ing)\b.*\bfile/i,
    /\bModif(?:y|ying)\b/i,
    /\bUpdat(?:e|ing)\b.*\bfile/i,
    /\bWrote\b/i,
  ]},
  // Running commands
  { state: ACTIVITY_STATE.RUNNING_COMMAND, patterns: [
    /\bBash\b/,
    /\bRunning\b/i,
    /\bnpm\s+(run|test|install)\b/,
    /\bgit\s+/,
    /\bExecut(e|ing)\b/i,
    /\$ /,
  ]},
  // Thinking / planning
  { state: ACTIVITY_STATE.THINKING, patterns: [
    /\bThink(?:ing)?\b/i,
    /\bAnalyz(?:e|ing)\b/i,
    /\bPlan(?:ning)?\b/i,
    /\bConsider(?:ing)?\b/i,
    /\bReason(?:ing)?\b/i,
    /\bDecid(?:e|ing)\b/i,
    /\bLet me\b/i,
    /\bI'll\b/i,
    /\bI need to\b/i,
  ]},
];

/**
 * Stateful parser that watches PTY output and detects activity state changes.
 * Emits the new state only when it actually changes.
 */
export default class ActivityParser {
  #currentState = ACTIVITY_STATE.IDLE;
  #debounceTimer = null;
  #onChange = null;
  /** Minimum ms before we emit a state change (prevents flicker) */
  #debounceMs = 300;

  /**
   * @param {function} onChange - Called with (newState) when activity changes
   */
  constructor(onChange) {
    this.#onChange = onChange;
  }

  get currentState() {
    return this.#currentState;
  }

  /**
   * Feed a chunk of terminal output to the parser.
   * @param {string} data - Raw PTY output chunk
   */
  feed(data) {
    // Strip ANSI escape sequences for pattern matching
    const clean = data.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '').replace(/\x1b\][^\x07]*\x07/g, '');

    let detected = null;
    for (const { state, patterns } of PATTERNS) {
      for (const re of patterns) {
        if (re.test(clean)) {
          detected = state;
          break;
        }
      }
      if (detected) break;
    }

    if (detected && detected !== this.#currentState) {
      clearTimeout(this.#debounceTimer);
      this.#debounceTimer = setTimeout(() => {
        this.#currentState = detected;
        this.#onChange?.(detected);
      }, this.#debounceMs);
    }
  }

  /**
   * Mark the agent as done (called on process exit).
   * @param {number} exitCode
   */
  markDone(exitCode) {
    clearTimeout(this.#debounceTimer);
    this.#currentState = exitCode === 0 ? ACTIVITY_STATE.DONE : ACTIVITY_STATE.ERROR;
    this.#onChange?.(this.#currentState);
  }

  dispose() {
    clearTimeout(this.#debounceTimer);
    this.#onChange = null;
  }
}
