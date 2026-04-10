/**
 * Persists workflow (mission) state to SQLite.
 * WorkflowManager calls these methods to save/restore workflow state.
 */
export default class WorkflowStore {
  #db;
  #stmts;

  constructor(db) {
    this.#db = db;
    this.#stmts = {
      upsertMission: db.prepare(`
        INSERT INTO missions (id, prompt, work_dir, state, branch, review_cycle, error, created_at, updated_at)
        VALUES (@id, @prompt, @workDir, @state, @branch, @reviewCycle, @error, @createdAt, @updatedAt)
        ON CONFLICT(id) DO UPDATE SET
          state = @state, branch = @branch, review_cycle = @reviewCycle,
          error = @error, updated_at = @updatedAt
      `),
      getMission: db.prepare('SELECT * FROM missions WHERE id = ?'),
      getAllMissions: db.prepare('SELECT * FROM missions ORDER BY created_at DESC'),
      getRecentMissions: db.prepare('SELECT * FROM missions ORDER BY created_at DESC LIMIT ?'),
      insertStage: db.prepare(`
        INSERT INTO stages (id, mission_id, role, action, agent_id, agent_name, session_id, exit_code, output, created_at, completed_at)
        VALUES (@id, @missionId, @role, @action, @agentId, @agentName, @sessionId, @exitCode, @output, @createdAt, @completedAt)
      `),
      getStages: db.prepare('SELECT * FROM stages WHERE mission_id = ? ORDER BY created_at ASC'),
      deleteMission: db.prepare('DELETE FROM missions WHERE id = ?'),
    };
  }

  /**
   * Save or update a workflow/mission.
   */
  save(wf) {
    this.#stmts.upsertMission.run({
      id: wf.id,
      prompt: wf.prompt,
      workDir: wf.workDir,
      state: wf.state,
      branch: wf.branch || null,
      reviewCycle: wf.reviewCycle || 0,
      error: wf.error || null,
      createdAt: wf.createdAt,
      updatedAt: wf.updatedAt || new Date().toISOString(),
    });
  }

  /**
   * Save a workflow step/stage.
   */
  saveStep(missionId, step) {
    this.#stmts.insertStage.run({
      id: step.sessionId || `${missionId}-${Date.now()}`,
      missionId,
      role: step.role,
      action: step.action || null,
      agentId: step.agentId || null,
      agentName: step.agentName || null,
      sessionId: step.sessionId || null,
      exitCode: step.exitCode ?? null,
      output: step.output || null,
      createdAt: step.timestamp || new Date().toISOString(),
      completedAt: step.completedAt || null,
    });
  }

  /**
   * Get a mission with its stages.
   */
  get(id) {
    const row = this.#stmts.getMission.get(id);
    if (!row) return null;
    const stages = this.#stmts.getStages.all(id);
    return WorkflowStore.#toWorkflow(row, stages);
  }

  /**
   * Get all missions (summary, without full stage output).
   */
  getAll() {
    return this.#stmts.getAllMissions.all().map(row => {
      const stages = this.#stmts.getStages.all(row.id);
      return WorkflowStore.#toWorkflow(row, stages);
    });
  }

  /**
   * Get recent missions for history display.
   */
  getRecent(limit = 10) {
    return this.#stmts.getRecentMissions.all(limit).map(row => {
      const stages = this.#stmts.getStages.all(row.id);
      return WorkflowStore.#toWorkflow(row, stages);
    });
  }

  static #toWorkflow(row, stages) {
    return {
      id: row.id,
      prompt: row.prompt,
      workDir: row.work_dir,
      state: row.state,
      branch: row.branch || null,
      reviewCycle: row.review_cycle,
      error: row.error || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      steps: stages.map(s => ({
        role: s.role,
        action: s.action,
        agentId: s.agent_id,
        agentName: s.agent_name,
        sessionId: s.session_id,
        exitCode: s.exit_code,
        hasOutput: !!s.output,
        timestamp: s.created_at,
        completedAt: s.completed_at,
      })),
    };
  }
}
