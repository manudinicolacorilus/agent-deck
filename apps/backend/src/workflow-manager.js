import { EventEmitter } from 'node:events';
import { execSync } from 'node:child_process';
import { v4 as uuidv4 } from 'uuid';
import { WORKFLOW_STATE, AGENT_ROLE, REVIEW_MODELS, ACTIVITY_STATE, SESSION_STATE } from '@agent-deck/shared';

/**
 * Orchestrates multi-agent workflows: Architect → Dev → Review → (loop or done).
 *
 * Workflow pipeline:
 * 1. Architect agent plans the work (always in plan mode)
 * 2. Dev agent implements the plan
 * 3. Reviewer agent(s) review using 3 models via copilot
 * 4. If remarks → back to dev for revision; if approved → done
 * 5. If no agent available for next step → queued until one is idle
 */
export default class WorkflowManager extends EventEmitter {
  /** @type {Map<string, object>} */
  #workflows = new Map();

  /** @type {import('./session-manager.js').default} */
  #sessionManager;

  /** @type {import('./agent-store.js').default} */
  #agentStore;

  /** @type {NodeJS.Timeout|null} */
  #pollTimer = null;

  /**
   * @param {import('./session-manager.js').default} sessionManager
   * @param {import('./agent-store.js').default} agentStore
   */
  constructor(sessionManager, agentStore) {
    super();
    this.#sessionManager = sessionManager;
    this.#agentStore = agentStore;

    // Watch for session exits to advance workflows
    this.#sessionManager.on('exit', ({ sessionId, exitCode }) => {
      this.#onSessionExit(sessionId, exitCode);
    });

    // Watch for activity changes — auto-respond when workflow agents are blocked
    this.#sessionManager.on('activity', ({ sessionId, activity }) => {
      this.#onSessionActivity(sessionId, activity);
    });

    // Poll for idle agents to assign queued work
    this.#pollTimer = setInterval(() => this.#tryAdvanceWaiting(), 3000);
  }

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------

  /**
   * Start a new workflow with a prompt.
   * @param {object} opts
   * @param {string} opts.prompt - The original task description
   * @param {string} opts.workDir - Working directory for all agents
   * @returns {object} The created workflow
   */
  start({ prompt, workDir }) {
    const id = uuidv4();
    const workflow = {
      id,
      prompt,
      workDir,
      state: WORKFLOW_STATE.PENDING,
      steps: [],
      reviewCycle: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.#workflows.set(id, workflow);
    this.#advanceWorkflow(workflow);
    return this.#serialize(workflow);
  }

  /**
   * Get a workflow by id.
   * @param {string} id
   * @returns {object|null}
   */
  get(id) {
    const wf = this.#workflows.get(id);
    return wf ? this.#serialize(wf) : null;
  }

  /**
   * List all workflows.
   * @returns {object[]}
   */
  getAll() {
    return [...this.#workflows.values()].map((wf) => this.#serialize(wf));
  }

  /**
   * Cancel a workflow.
   * @param {string} id
   * @returns {boolean}
   */
  cancel(id) {
    const wf = this.#workflows.get(id);
    if (!wf) return false;
    wf.state = WORKFLOW_STATE.ERROR;
    wf.updatedAt = new Date().toISOString();
    wf.steps.push({ role: 'system', action: 'cancelled', timestamp: new Date().toISOString() });
    this.#emitUpdate(wf);
    return true;
  }

  dispose() {
    if (this.#pollTimer) {
      clearInterval(this.#pollTimer);
      this.#pollTimer = null;
    }
    // Clean up any pending auto-exit timers
    for (const wf of this.#workflows.values()) {
      if (wf._autoExitTimer) {
        clearTimeout(wf._autoExitTimer);
        wf._autoExitTimer = null;
      }
    }
  }

  // ------------------------------------------------------------------
  // Workflow advancement logic
  // ------------------------------------------------------------------

  #advanceWorkflow(wf) {
    switch (wf.state) {
      case WORKFLOW_STATE.PENDING:
        this.#assignArchitect(wf);
        break;
      case WORKFLOW_STATE.WAITING_DEV:
        this.#assignDev(wf);
        break;
      case WORKFLOW_STATE.WAITING_REVIEW:
        this.#assignReviewers(wf);
        break;
      case WORKFLOW_STATE.WAITING_REVISION:
        this.#assignDev(wf);
        break;
      default:
        break;
    }
  }

  #assignArchitect(wf) {
    const agent = this.#agentStore.findIdleByRole(AGENT_ROLE.ARCHITECT);
    if (!agent) {
      wf.state = WORKFLOW_STATE.PENDING;
      wf.updatedAt = new Date().toISOString();
      this.#emitUpdate(wf);
      console.log(`[workflow ${wf.id.slice(0, 8)}] Waiting for an idle architect agent...`);
      return;
    }

    // Architect always plans first — must NOT use plan mode or start implementing
    const architectPrompt = [
      `You are the ARCHITECT for this task. Your ONLY job is to produce a plan.`,
      `Do NOT use plan mode. Do NOT write any code or edit any files.`,
      `Do NOT use the Edit, Write, or Bash tools — only Read, Glob, and Grep to explore the codebase.`,
      ``,
      `=== TASK ===`,
      wf.prompt,
      ``,
      `=== INSTRUCTIONS ===`,
      `1. Analyze the requirements thoroughly by reading the relevant code`,
      `2. Output a detailed, step-by-step implementation plan as text`,
      `3. List all files that need to be created or modified`,
      `4. Describe the changes needed in each file`,
      `5. Identify potential risks and edge cases`,
      ``,
      `CRITICAL: You are ONLY the planner. A separate developer agent will implement your plan.`,
      `Do NOT ask any questions. Do NOT ask for confirmation.`,
      `Do NOT ask "shall I proceed?", "would you like me to start?", or "shall I implement this?".`,
      `Do NOT start implementing. Just output the complete plan as text and finish.`,
    ].join('\n');

    try {
      // Reset auto-exit tracking for the new session
      wf._sessionActivated = false;
      wf._sessionStartedAt = Date.now();
      if (wf._autoExitTimer) { clearTimeout(wf._autoExitTimer); wf._autoExitTimer = null; }

      const session = this.#sessionManager.createSession({
        workDir: wf.workDir,
        prompt: architectPrompt,
        label: `[WF] Architect: ${agent.name}`,
        engine: agent.engine,
        options: { yolo: agent.yolo },
        agentId: agent.id,
      });
      this.#agentStore.setCurrentSession(agent.id, session.id);

      wf.state = WORKFLOW_STATE.ARCHITECTING;
      wf.currentAgentId = agent.id;
      wf.currentSessionId = session.id;
      wf.updatedAt = new Date().toISOString();
      wf.steps.push({
        role: AGENT_ROLE.ARCHITECT,
        agentId: agent.id,
        agentName: agent.name,
        sessionId: session.id,
        action: 'planning',
        timestamp: new Date().toISOString(),
      });
      this.#emitUpdate(wf);
      console.log(`[workflow ${wf.id.slice(0, 8)}] Architect ${agent.name} assigned`);
    } catch (err) {
      console.error(`[workflow ${wf.id.slice(0, 8)}] Failed to assign architect:`, err.message);
      wf.state = WORKFLOW_STATE.ERROR;
      wf.error = err.message;
      wf.updatedAt = new Date().toISOString();
      this.#emitUpdate(wf);
    }
  }

  #assignDev(wf) {
    const agent = this.#agentStore.findIdleByRole(AGENT_ROLE.DEV);
    if (!agent) {
      // Keep waiting state
      if (wf.state !== WORKFLOW_STATE.WAITING_DEV && wf.state !== WORKFLOW_STATE.WAITING_REVISION) {
        wf.state = WORKFLOW_STATE.WAITING_DEV;
        wf.updatedAt = new Date().toISOString();
        this.#emitUpdate(wf);
      }
      console.log(`[workflow ${wf.id.slice(0, 8)}] Waiting for an idle dev agent...`);
      return;
    }

    // Create a feature branch before the dev starts working (first time only)
    if (!wf.branch) {
      wf.branch = this.#ensureWorkflowBranch(wf);
    }

    // Build dev prompt based on whether this is first implementation or revision
    const isRevision = wf.reviewCycle > 0;
    const lastPlanOutput = this.#getLastStepOutput(wf, AGENT_ROLE.ARCHITECT);
    const lastReviewRemarks = isRevision ? this.#getLastStepOutput(wf, AGENT_ROLE.REVIEWER) : '';

    let devPrompt;
    if (isRevision) {
      devPrompt = [
        `You are a DEVELOPER working on revisions based on code review feedback.`,
        ``,
        `=== ORIGINAL TASK ===`,
        wf.prompt,
        ``,
        `=== REVIEW REMARKS (cycle ${wf.reviewCycle}) ===`,
        lastReviewRemarks,
        ``,
        `=== INSTRUCTIONS ===`,
        `Address ALL the review remarks above. Make the requested changes.`,
        `Do NOT ask any questions or for confirmation. Just implement the changes and finish.`,
        `When done, your code will be automatically sent for another review.`,
      ].join('\n');
    } else {
      devPrompt = [
        `You are a DEVELOPER implementing a plan created by an architect.`,
        ``,
        `=== ORIGINAL TASK ===`,
        wf.prompt,
        ``,
        `=== ARCHITECT'S PLAN ===`,
        lastPlanOutput,
        ``,
        `=== INSTRUCTIONS ===`,
        `Implement the plan above. Follow it closely.`,
        `Do NOT ask any questions or for confirmation. Just implement the code and finish.`,
        `Write clean, well-structured code. When done, your code will be automatically sent for review.`,
      ].join('\n');
    }

    try {
      // Reset auto-exit tracking for the new session
      wf._sessionActivated = false;
      wf._sessionStartedAt = Date.now();
      if (wf._autoExitTimer) { clearTimeout(wf._autoExitTimer); wf._autoExitTimer = null; }

      const session = this.#sessionManager.createSession({
        workDir: wf.workDir,
        prompt: devPrompt,
        label: `[WF] Dev: ${agent.name}${isRevision ? ` (rev ${wf.reviewCycle})` : ''}`,
        engine: agent.engine,
        options: { yolo: agent.yolo },
        agentId: agent.id,
      });
      this.#agentStore.setCurrentSession(agent.id, session.id);

      wf.state = isRevision ? WORKFLOW_STATE.REVISING : WORKFLOW_STATE.DEVELOPING;
      wf.currentAgentId = agent.id;
      wf.currentSessionId = session.id;
      wf.updatedAt = new Date().toISOString();
      wf.steps.push({
        role: AGENT_ROLE.DEV,
        agentId: agent.id,
        agentName: agent.name,
        sessionId: session.id,
        action: isRevision ? `revision_${wf.reviewCycle}` : 'implementing',
        timestamp: new Date().toISOString(),
      });
      this.#emitUpdate(wf);
      console.log(`[workflow ${wf.id.slice(0, 8)}] Dev ${agent.name} assigned (${isRevision ? 'revision' : 'implementation'})`);
    } catch (err) {
      console.error(`[workflow ${wf.id.slice(0, 8)}] Failed to assign dev:`, err.message);
      wf.state = WORKFLOW_STATE.ERROR;
      wf.error = err.message;
      wf.updatedAt = new Date().toISOString();
      this.#emitUpdate(wf);
    }
  }

  #assignReviewers(wf) {
    // Reviewer always uses copilot, we spawn 3 sessions with 3 different models
    const agent = this.#agentStore.findIdleByRole(AGENT_ROLE.REVIEWER);
    if (!agent) {
      if (wf.state !== WORKFLOW_STATE.WAITING_REVIEW) {
        wf.state = WORKFLOW_STATE.WAITING_REVIEW;
        wf.updatedAt = new Date().toISOString();
        this.#emitUpdate(wf);
      }
      console.log(`[workflow ${wf.id.slice(0, 8)}] Waiting for an idle reviewer agent...`);
      return;
    }

    // Build review prompt that asks the 3 models
    const devOutput = this.#getLastStepOutput(wf, AGENT_ROLE.DEV);
    const modelsStr = REVIEW_MODELS.join(', ');

    const reviewPrompt = [
      `You are a CODE REVIEWER. Review the following code changes.`,
      ``,
      `Use these 3 models for a thorough review: ${modelsStr}`,
      ``,
      `For each model, evaluate:`,
      `1. Code correctness and potential bugs`,
      `2. Architecture and design patterns`,
      `3. Performance and security concerns`,
      `4. Code style and best practices`,
      ``,
      `=== ORIGINAL TASK ===`,
      wf.prompt,
      ``,
      `=== CODE CHANGES TO REVIEW ===`,
      devOutput,
      ``,
      `=== REVIEW INSTRUCTIONS ===`,
      `After consulting all 3 models (${modelsStr}), synthesize the feedback.`,
      ``,
      `If there are issues that MUST be fixed, list them clearly as REMARKS.`,
      `End your review with one of:`,
      `- "VERDICT: APPROVED" — if the code is ready to merge`,
      `- "VERDICT: CHANGES_REQUESTED" — if changes are needed (list specific remarks)`,
      ``,
      `Be thorough but fair. Only request changes for real issues.`,
      `Do NOT ask any questions or for confirmation. Just output your review and finish.`,
    ].join('\n');

    try {
      // Reset auto-exit tracking for the new session
      wf._sessionActivated = false;
      wf._sessionStartedAt = Date.now();
      if (wf._autoExitTimer) { clearTimeout(wf._autoExitTimer); wf._autoExitTimer = null; }

      // Reviewer always uses copilot engine
      const session = this.#sessionManager.createSession({
        workDir: wf.workDir,
        prompt: reviewPrompt,
        label: `[WF] Review: ${agent.name} (cycle ${wf.reviewCycle + 1})`,
        engine: 'copilot',
        options: { yolo: agent.yolo },
        agentId: agent.id,
      });
      this.#agentStore.setCurrentSession(agent.id, session.id);

      wf.state = WORKFLOW_STATE.REVIEWING;
      wf.currentAgentId = agent.id;
      wf.currentSessionId = session.id;
      wf.reviewCycle += 1;
      wf.updatedAt = new Date().toISOString();
      wf.steps.push({
        role: AGENT_ROLE.REVIEWER,
        agentId: agent.id,
        agentName: agent.name,
        sessionId: session.id,
        action: `review_cycle_${wf.reviewCycle}`,
        models: [...REVIEW_MODELS],
        timestamp: new Date().toISOString(),
      });
      this.#emitUpdate(wf);
      console.log(`[workflow ${wf.id.slice(0, 8)}] Reviewer ${agent.name} assigned (cycle ${wf.reviewCycle}, models: ${modelsStr})`);
    } catch (err) {
      console.error(`[workflow ${wf.id.slice(0, 8)}] Failed to assign reviewer:`, err.message);
      wf.state = WORKFLOW_STATE.ERROR;
      wf.error = err.message;
      wf.updatedAt = new Date().toISOString();
      this.#emitUpdate(wf);
    }
  }

  // ------------------------------------------------------------------
  // Auto-respond: unblock workflow agents waiting for approval/input
  // ------------------------------------------------------------------

  /**
   * When a workflow session is waiting for approval or asking a question,
   * automatically send input so the pipeline advances to the next agent.
   *
   * Also detects when a workflow agent has finished its work (session goes
   * IDLE after being active) and sends /exit to terminate the session so
   * the workflow can advance to the next step.
   */
  #onSessionActivity(sessionId, activity) {
    // Only act on workflow-owned sessions
    const wf = this.#findWorkflowBySession(sessionId);
    if (!wf) return;

    // Only act for active workflow states (not DONE/ERROR)
    const runningStates = [
      WORKFLOW_STATE.ARCHITECTING,
      WORKFLOW_STATE.DEVELOPING,
      WORKFLOW_STATE.REVISING,
      WORKFLOW_STATE.REVIEWING,
    ];
    if (!runningStates.includes(wf.state)) return;

    // ---------------------------------------------------------------
    // Track whether the session has done meaningful work. This lets us
    // distinguish between the initial IDLE (session just started) and
    // IDLE after the agent completed its task.
    // ---------------------------------------------------------------
    const workStates = [
      ACTIVITY_STATE.THINKING,
      ACTIVITY_STATE.READING,
      ACTIVITY_STATE.EDITING,
      ACTIVITY_STATE.RUNNING_COMMAND,
    ];

    if (workStates.includes(activity)) {
      wf._sessionActivated = true;

      // Agent is still working — cancel any pending auto-exit
      if (wf._autoExitTimer) {
        clearTimeout(wf._autoExitTimer);
        wf._autoExitTimer = null;
      }
    }

    // ---------------------------------------------------------------
    // Auto-exit: when a workflow session goes IDLE *or* WAITING_FOR_INPUT
    // after having done work, send /exit so the process terminates and
    // the workflow advances.
    //
    // WAITING_FOR_INPUT is a terminal state in ActivityParser (the 8s
    // inactivity timer won't transition it to IDLE), so we must handle
    // it here too — otherwise the session stalls forever after the agent
    // finishes and asks "shall I proceed?" or similar.
    //
    // We add a 15s confirmation delay and require 30s minimum session age
    // to avoid false positives from brief pauses in output.
    // ---------------------------------------------------------------
    const shouldAutoExit =
      wf._sessionActivated &&
      (activity === ACTIVITY_STATE.IDLE || activity === ACTIVITY_STATE.WAITING_FOR_INPUT);

    if (shouldAutoExit) {
      // Don't auto-exit too early — the session may still be producing output
      // between tool calls. Require at least 30s of session lifetime.
      const sessionAge = Date.now() - (wf._sessionStartedAt || Date.now());
      if (sessionAge < 30_000) {
        return;
      }

      // Clear any existing timer (shouldn't happen, but be safe)
      if (wf._autoExitTimer) clearTimeout(wf._autoExitTimer);

      // Use a longer delay (15s) to avoid false positives from brief pauses
      wf._autoExitTimer = setTimeout(() => {
        wf._autoExitTimer = null;
        const session = this.#sessionManager.getSession(sessionId);
        if (!session || session.state !== SESSION_STATE.RUNNING) return;
        if (wf.currentSessionId !== sessionId) return;
        // Verify still idle/waiting (agent didn't start working again)
        if (
          session.activity !== ACTIVITY_STATE.IDLE &&
          session.activity !== ACTIVITY_STATE.DONE &&
          session.activity !== ACTIVITY_STATE.WAITING_FOR_INPUT
        ) {
          return;
        }

        try {
          // For WAITING_FOR_INPUT, first decline to proceed, then exit.
          // For IDLE/DONE, just terminate directly.
          if (session.activity === ACTIVITY_STATE.WAITING_FOR_INPUT) {
            session.pty.write('no\n');
            console.log(
              `[workflow ${wf.id.slice(0, 8)}] Auto-declined input prompt in session ${sessionId.slice(0, 8)}`,
            );
            // Give the agent a moment to process the "no", then exit
            setTimeout(() => {
              try {
                const s = this.#sessionManager.getSession(sessionId);
                if (s && s.state === SESSION_STATE.RUNNING && wf.currentSessionId === sessionId) {
                  console.log(
                    `[workflow ${wf.id.slice(0, 8)}] Auto-exiting session ${sessionId.slice(0, 8)} after decline`,
                  );
                  this.#terminateWorkflowSession(wf, s, sessionId);
                }
              } catch { /* session already gone */ }
            }, 3000);
          } else {
            console.log(
              `[workflow ${wf.id.slice(0, 8)}] Auto-exiting idle workflow session ${sessionId.slice(0, 8)} (was: ${activity})`,
            );
            this.#terminateWorkflowSession(wf, session, sessionId);
          }
        } catch (err) {
          console.error(
            `[workflow ${wf.id.slice(0, 8)}] Failed to auto-exit session:`,
            err.message,
          );
        }
      }, 15_000);
      return;
    }

    // ---------------------------------------------------------------
    // Auto-respond to permission prompts (WAITING_FOR_APPROVAL only).
    // WAITING_FOR_INPUT is now handled by auto-exit above.
    // ---------------------------------------------------------------
    if (activity !== ACTIVITY_STATE.WAITING_FOR_APPROVAL) {
      return;
    }

    // Delay to let the full prompt render and confirm it's a real approval prompt.
    // The activity parser uses 300ms debounce, so 2.5s gives time for any
    // follow-up output to override a false positive detection.
    setTimeout(() => {
      const session = this.#sessionManager.getSession(sessionId);
      if (!session || session.state !== SESSION_STATE.RUNNING) return;

      // Re-check the session is still waiting for approval (not overridden)
      if (session.activity !== ACTIVITY_STATE.WAITING_FOR_APPROVAL) {
        return;
      }

      try {
        session.pty.write('yes\n');
        console.log(
          `[workflow ${wf.id.slice(0, 8)}] Auto-responded "yes" to approval prompt in session ${sessionId.slice(0, 8)}`,
        );
      } catch (err) {
        console.error(
          `[workflow ${wf.id.slice(0, 8)}] Failed to auto-respond:`,
          err.message,
        );
      }
    }, 2500);
  }

  /**
   * Find the workflow that owns a given session.
   */
  #findWorkflowBySession(sessionId) {
    for (const wf of this.#workflows.values()) {
      if (wf.currentSessionId === sessionId) return wf;
    }
    return null;
  }

  /**
   * Terminate a workflow session in an engine-aware way.
   * Copilot CLI supports `/exit`; other engines (Claude, etc.) do not,
   * so we kill the PTY process directly and flag the exit as intentional.
   */
  #terminateWorkflowSession(wf, session, sessionId) {
    if (session.engine === 'copilot') {
      session.pty.write('/exit\n');
    } else {
      // Non-copilot engines don't have a /exit command.
      // Kill the PTY directly; flag it so the exit handler treats it as success.
      wf._autoExitKill = true;
      this.#sessionManager.killSession(sessionId);
    }
  }

  // ------------------------------------------------------------------
  // Session exit handler
  // ------------------------------------------------------------------

  #onSessionExit(sessionId, exitCode) {
    for (const wf of this.#workflows.values()) {
      if (wf.currentSessionId !== sessionId) continue;
      if (wf.state === WORKFLOW_STATE.DONE || wf.state === WORKFLOW_STATE.ERROR) continue;

      // Wait for the PTY output to fully drain before reading.
      // node-pty can fire onExit before all buffered data has been delivered
      // via onData. waitForDrain polls until no new data arrives for 300ms
      // (or 3s max), which is far more reliable than a fixed timeout.
      this.#sessionManager
        .waitForDrain(sessionId)
        .then(() => this.#finalizeSessionExit(wf, sessionId, exitCode));
      return;
    }
  }

  #finalizeSessionExit(wf, sessionId, exitCode) {
    // Capture output from the completed session (now with buffer flushed)
    const output = this.#sessionManager.getSessionOutput(sessionId);
    const lastStep = wf.steps[wf.steps.length - 1];
    if (lastStep) {
      lastStep.output = this.#truncateOutput(output);
      lastStep.exitCode = exitCode;
      lastStep.completedAt = new Date().toISOString();
    }

    // Non-copilot engines (Claude, etc.) are terminated via PTY kill, which
    // produces a non-zero exit code. The _autoExitKill flag tells us this
    // was an intentional termination, not an actual error.
    const wasAutoExitKill = wf._autoExitKill;
    wf._autoExitKill = false;

    if (exitCode !== 0 && !wasAutoExitKill) {
      console.log(`[workflow ${wf.id.slice(0, 8)}] Session exited with code ${exitCode}, marking error`);
      wf.state = WORKFLOW_STATE.ERROR;
      wf.error = `Session exited with code ${exitCode}`;
      wf.updatedAt = new Date().toISOString();
      this.#emitUpdate(wf);
      return;
    }

    // Advance based on current state
    switch (wf.state) {
      case WORKFLOW_STATE.ARCHITECTING: {
        // Architect done → assign dev
        const planOutput = this.#getLastStepOutput(wf, AGENT_ROLE.ARCHITECT);
        const planLen = planOutput.length;
        if (planLen < 50 || planOutput === '(no output captured)') {
          console.warn(
            `[workflow ${wf.id.slice(0, 8)}] WARNING: Architect plan output looks empty or too short (${planLen} chars). ` +
            `Dev agent may not have enough context.`,
          );
        } else {
          console.log(`[workflow ${wf.id.slice(0, 8)}] Architect finished (plan: ${planLen} chars), advancing to dev`);
        }
        wf.state = WORKFLOW_STATE.WAITING_DEV;
        wf.updatedAt = new Date().toISOString();
        this.#emitUpdate(wf);
        this.#assignDev(wf);
        break;
      }

      case WORKFLOW_STATE.DEVELOPING:
      case WORKFLOW_STATE.REVISING:
        // Dev done → assign reviewer
        console.log(`[workflow ${wf.id.slice(0, 8)}] Dev finished, advancing to review`);
        wf.state = WORKFLOW_STATE.WAITING_REVIEW;
        wf.updatedAt = new Date().toISOString();
        this.#emitUpdate(wf);
        this.#assignReviewers(wf);
        break;

      case WORKFLOW_STATE.REVIEWING:
        // Review done → check verdict
        this.#handleReviewComplete(wf, output);
        break;

      default:
        break;
    }
  }

  #handleReviewComplete(wf, output) {
    const cleanOutput = this.#stripAnsi(output);
    const approved = /VERDICT:\s*APPROVED/i.test(cleanOutput);

    if (approved) {
      console.log(`[workflow ${wf.id.slice(0, 8)}] Review APPROVED! Workflow complete.`);
      wf.state = WORKFLOW_STATE.DONE;
      wf.updatedAt = new Date().toISOString();
      wf.steps.push({
        role: 'system',
        action: 'completed',
        message: 'All reviews passed. Workflow complete!',
        timestamp: new Date().toISOString(),
      });
      this.#emitUpdate(wf);
    } else {
      console.log(`[workflow ${wf.id.slice(0, 8)}] Review has remarks, sending back to dev`);
      wf.state = WORKFLOW_STATE.WAITING_REVISION;
      wf.updatedAt = new Date().toISOString();
      this.#emitUpdate(wf);
      this.#assignDev(wf);
    }
  }

  // ------------------------------------------------------------------
  // Polling: try to advance waiting workflows
  // ------------------------------------------------------------------

  #tryAdvanceWaiting() {
    for (const wf of this.#workflows.values()) {
      if (
        wf.state === WORKFLOW_STATE.PENDING ||
        wf.state === WORKFLOW_STATE.WAITING_DEV ||
        wf.state === WORKFLOW_STATE.WAITING_REVIEW ||
        wf.state === WORKFLOW_STATE.WAITING_REVISION
      ) {
        this.#advanceWorkflow(wf);
      }
    }
  }

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------

  #getLastStepOutput(wf, role) {
    for (let i = wf.steps.length - 1; i >= 0; i--) {
      if (wf.steps[i].role === role && wf.steps[i].output) {
        return wf.steps[i].output;
      }
    }
    return '(no output captured)';
  }

  #truncateOutput(output) {
    // Strip ANSI and keep last ~8000 chars to avoid massive payloads
    const clean = this.#stripAnsi(output);
    if (clean.length > 8000) {
      return '...(truncated)...\n' + clean.slice(-8000);
    }
    return clean;
  }

  #stripAnsi(str) {
    // eslint-disable-next-line no-control-regex
    return str.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '').replace(/\x1b\][^\x07]*\x07/g, '');
  }

  #serialize(wf) {
    return {
      id: wf.id,
      prompt: wf.prompt,
      workDir: wf.workDir,
      branch: wf.branch || null,
      state: wf.state,
      reviewCycle: wf.reviewCycle,
      steps: wf.steps.map(({ output, ...step }) => ({
        ...step,
        hasOutput: !!output,
      })),
      error: wf.error || null,
      createdAt: wf.createdAt,
      updatedAt: wf.updatedAt,
    };
  }

  /**
   * Create a git branch for the workflow so dev work doesn't happen on main.
   * @param {object} wf
   * @returns {string} branch name
   */
  #ensureWorkflowBranch(wf) {
    const slug = wf.prompt
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);
    const branchName = `workflow/${slug}-${wf.id.slice(0, 8)}`;

    try {
      execSync(`git checkout -b "${branchName}"`, {
        cwd: wf.workDir,
        stdio: 'pipe',
        timeout: 10000,
      });
      console.log(`[workflow ${wf.id.slice(0, 8)}] Created branch: ${branchName}`);
      wf.steps.push({
        role: 'system',
        action: 'branch_created',
        message: `Created branch: ${branchName}`,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      // Branch may already exist or git not available — log and continue
      console.warn(`[workflow ${wf.id.slice(0, 8)}] Branch creation warning: ${err.message}`);
      try {
        execSync(`git checkout "${branchName}"`, {
          cwd: wf.workDir,
          stdio: 'pipe',
          timeout: 10000,
        });
      } catch {
        // Ignore — dev will work on whatever branch is current
      }
    }

    return branchName;
  }

  #emitUpdate(wf) {
    this.emit('update', this.#serialize(wf));
  }
}
