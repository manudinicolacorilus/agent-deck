import { EventEmitter } from 'node:events';
import { v4 as uuidv4 } from 'uuid';
import { WORKFLOW_STATE, AGENT_ROLE, REVIEW_MODELS, ACTIVITY_STATE } from '@agent-deck/shared';

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

    // Architect always plans first
    const architectPrompt = [
      `You are the ARCHITECT for this task. You MUST use plan mode.`,
      `Create a detailed, step-by-step implementation plan before any code is written.`,
      `Focus on architecture decisions, file structure, and component design.`,
      ``,
      `=== TASK ===`,
      wf.prompt,
      ``,
      `=== INSTRUCTIONS ===`,
      `1. Analyze the requirements thoroughly`,
      `2. Create a comprehensive implementation plan`,
      `3. List all files that need to be created or modified`,
      `4. Describe the changes needed in each file`,
      `5. Identify potential risks and edge cases`,
      ``,
      `IMPORTANT: Do NOT ask any questions. Do NOT ask for confirmation.`,
      `Do NOT ask "shall I proceed?" or "would you like me to start?".`,
      `Just output the complete plan and finish. The plan will be automatically handed to a developer agent.`,
    ].join('\n');

    try {
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
      `/review the following code changes.`,
      ``,
      `You are a CODE REVIEWER. You MUST consult these 3 models for a thorough review: ${modelsStr}`,
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
   */
  #onSessionActivity(sessionId, activity) {
    // Only act on workflow-owned sessions
    const wf = this.#findWorkflowBySession(sessionId);
    if (!wf) return;

    // Only auto-respond for active workflow states (not DONE/ERROR)
    const activeStates = [
      WORKFLOW_STATE.ARCHITECTING,
      WORKFLOW_STATE.DEVELOPING,
      WORKFLOW_STATE.REVISING,
      WORKFLOW_STATE.REVIEWING,
    ];
    if (!activeStates.includes(wf.state)) return;

    // Auto-respond to permission prompts and agent questions
    if (
      activity !== ACTIVITY_STATE.WAITING_FOR_APPROVAL &&
      activity !== ACTIVITY_STATE.WAITING_FOR_INPUT
    ) {
      return;
    }

    // Small delay to let the full prompt render before responding
    setTimeout(() => {
      const session = this.#sessionManager.getSession(sessionId);
      if (!session || session.state !== 'running') return;

      // Check the session is still in a waiting state
      if (
        session.activity !== ACTIVITY_STATE.WAITING_FOR_APPROVAL &&
        session.activity !== ACTIVITY_STATE.WAITING_FOR_INPUT
      ) {
        return;
      }

      // Send "yes" + Enter to approve and continue
      try {
        session.pty.write('yes\n');
        console.log(
          `[workflow ${wf.id.slice(0, 8)}] Auto-responded "yes" to ${activity} prompt in session ${sessionId.slice(0, 8)}`,
        );
      } catch (err) {
        console.error(
          `[workflow ${wf.id.slice(0, 8)}] Failed to auto-respond:`,
          err.message,
        );
      }
    }, 1500); // 1.5s delay to let the prompt fully render
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

  // ------------------------------------------------------------------
  // Session exit handler
  // ------------------------------------------------------------------

  #onSessionExit(sessionId, exitCode) {
    for (const wf of this.#workflows.values()) {
      if (wf.currentSessionId !== sessionId) continue;
      if (wf.state === WORKFLOW_STATE.DONE || wf.state === WORKFLOW_STATE.ERROR) continue;

      // Capture output from the completed session
      const output = this.#sessionManager.getSessionOutput(sessionId);
      const lastStep = wf.steps[wf.steps.length - 1];
      if (lastStep) {
        lastStep.output = this.#truncateOutput(output);
        lastStep.exitCode = exitCode;
        lastStep.completedAt = new Date().toISOString();
      }

      if (exitCode !== 0) {
        console.log(`[workflow ${wf.id.slice(0, 8)}] Session exited with code ${exitCode}, marking error`);
        wf.state = WORKFLOW_STATE.ERROR;
        wf.error = `Session exited with code ${exitCode}`;
        wf.updatedAt = new Date().toISOString();
        this.#emitUpdate(wf);
        return;
      }

      // Advance based on current state
      switch (wf.state) {
        case WORKFLOW_STATE.ARCHITECTING:
          // Architect done → assign dev
          console.log(`[workflow ${wf.id.slice(0, 8)}] Architect finished, advancing to dev`);
          wf.state = WORKFLOW_STATE.WAITING_DEV;
          wf.updatedAt = new Date().toISOString();
          this.#emitUpdate(wf);
          this.#assignDev(wf);
          break;

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
      return;
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

  #emitUpdate(wf) {
    this.emit('update', this.#serialize(wf));
  }
}
