import { ACTIVITY_STATE } from '@agent-deck/shared';

/**
 * Patterns that match terminal output to activity states.
 * Order matters — first match wins.
 * "Waiting for approval" is checked first since it means the agent is blocked.
 */
const PATTERNS = [
  // Waiting for user approval (Claude CLI permission prompts)
  { state: ACTIVITY_STATE.WAITING_FOR_APPROVAL, patterns: [
    /\bAllow\b/i,
    /\bDo you want to/i,
    /\bPress Enter\b/i,
    /\bY\/n\b/i,
    /\by\/N\b/i,
    /\byes\/no\b/i,
    /\bApprove\b/i,
    /\bDeny\b/i,
    /\bAccept\b/i,
    /\bReject\b/i,
    /\u23ce/,           // ⏎ symbol used in Claude CLI
    /\bto run\b.*\bto deny\b/i,
    /\bto run\b.*\bto skip\b/i,
  ]},
  // Reading files — patterns should be specific to avoid false positives from CLI echoes
  { state: ACTIVITY_STATE.READING, patterns: [
    /\bRead(?:ing)?\s+(?:file|from|the|src|\.)/i,
    /\bcat\s+\S/,
    /\bSearching\b/i,
    /\bGrep\b/,
    /\bGlob\b/,
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

/** Time (ms) with no PTY output before we consider the agent idle/stalled */
const INACTIVITY_TIMEOUT_MS = 8_000;

/**
 * Stateful parser that watches PTY output and detects activity state changes.
 * Emits the new state only when it actually changes.
 */
export default class ActivityParser {
  #currentState = ACTIVITY_STATE.IDLE;
  #debounceTimer = null;
  #inactivityTimer = null;
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

    // Reset inactivity timer on every data chunk
    this.#resetInactivityTimer();

    if (detected && detected !== this.#currentState) {
      clearTimeout(this.#debounceTimer);
      this.#debounceTimer = setTimeout(() => {
        this.#currentState = detected;
        this.#onChange?.(detected);
      }, this.#debounceMs);
    }
  }

  /**
   * Reset the inactivity timer. If no data arrives for INACTIVITY_TIMEOUT_MS,
   * transition to IDLE (agent may be stalled or waiting).
   */
  #resetInactivityTimer() {
    clearTimeout(this.#inactivityTimer);
    this.#inactivityTimer = setTimeout(() => {
      // Only transition to idle if we're in an active state (not done/error)
      if (
        this.#currentState !== ACTIVITY_STATE.IDLE &&
        this.#currentState !== ACTIVITY_STATE.DONE &&
        this.#currentState !== ACTIVITY_STATE.ERROR &&
        this.#currentState !== ACTIVITY_STATE.WAITING_FOR_APPROVAL
      ) {
        this.#currentState = ACTIVITY_STATE.IDLE;
        this.#onChange?.(ACTIVITY_STATE.IDLE);
      }
    }, INACTIVITY_TIMEOUT_MS);
  }

  /**
   * Mark the agent as done (called on process exit).
   * @param {number} exitCode
   */
  markDone(exitCode) {
    clearTimeout(this.#debounceTimer);
    clearTimeout(this.#inactivityTimer);
    this.#currentState = exitCode === 0 ? ACTIVITY_STATE.DONE : ACTIVITY_STATE.ERROR;
    this.#onChange?.(this.#currentState);
  }

  dispose() {
    clearTimeout(this.#debounceTimer);
    clearTimeout(this.#inactivityTimer);
    this.#onChange = null;
  }
}
