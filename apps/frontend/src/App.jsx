import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import AgentGrid from './components/AgentGrid';
import OfficeView from './components/OfficeView';
import BottomBar from './components/BottomBar';
import NewAgentModal from './components/NewAgentModal';
import CreateAgentModal from './components/CreateAgentModal';
import AssignPromptModal from './components/AssignPromptModal';
import StartWorkflowModal from './components/StartWorkflowModal';
import useAgentSessions from './hooks/useAgentSessions';
import useAgents from './hooks/useAgents';
import useBackendHealth from './hooks/useBackendHealth';
import useActivityTracker from './hooks/useActivityTracker';
import useAgentVisualStates from './hooks/useAgentVisualStates';
import useSoundEffects from './hooks/useSoundEffects';
import useWorkflows from './hooks/useWorkflows';

const styles = {
  layout: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
};

export default function App() {
  const { sessions, loading, error, createSession, killSession, closeSession } = useAgentSessions();
  const { agents, createAgent, deleteAgent, assignPrompt } = useAgents();
  const health = useBackendHealth();
  const activities = useActivityTracker(sessions);
  const visualStates = useAgentVisualStates(agents, sessions);
  const { soundEnabled, toggleSound } = useSoundEffects(activities, visualStates, agents, sessions);
  const { workflows, startWorkflow, cancelWorkflow } = useWorkflows();

  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [createAgentModalOpen, setCreateAgentModalOpen] = useState(false);
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [assignAgent, setAssignAgent] = useState(null);
  const [view, setView] = useState('terminal');

  // Legacy quick session flow
  const handleCreateSession = useCallback(async (formData) => {
    await createSession(formData);
    setSessionModalOpen(false);
  }, [createSession]);

  // Persistent agent flow
  const handleCreateAgent = useCallback(async (formData) => {
    await createAgent(formData);
    setCreateAgentModalOpen(false);
  }, [createAgent]);

  const handleAssignPrompt = useCallback(async (agentId, { prompt, workDir }) => {
    await assignPrompt(agentId, { prompt, workDir });
    setAssignAgent(null);
  }, [assignPrompt]);

  const handleStartWorkflow = useCallback(async (data) => {
    await startWorkflow(data);
    setWorkflowModalOpen(false);
  }, [startWorkflow]);

  const handleKill = useCallback(async (id) => {
    await killSession(id);
  }, [killSession]);

  const handleClose = useCallback(async (id) => {
    await closeSession(id);
  }, [closeSession]);

  const handleSelectAgent = useCallback((sessionId) => {
    setView('terminal');
  }, []);

  const handleClickIdleAgent = useCallback((agent) => {
    setAssignAgent(agent);
  }, []);

  const handleClickWorkingAgent = useCallback((agent) => {
    setView('terminal');
  }, []);

  return (
    <div style={styles.layout}>
      <Header
        onNewAgent={() => setCreateAgentModalOpen(true)}
        onNewSession={() => setSessionModalOpen(true)}
        onStartWorkflow={() => setWorkflowModalOpen(true)}
        view={view}
        onViewChange={setView}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />
      <div style={styles.main}>
        {view === 'terminal' ? (
          <AgentGrid sessions={sessions} onKill={handleKill} onClose={handleClose} />
        ) : (
          <OfficeView
            agents={agents}
            sessions={sessions}
            activities={activities}
            visualStates={visualStates}
            workflows={workflows}
            onClickIdleAgent={handleClickIdleAgent}
            onClickWorkingAgent={handleClickWorkingAgent}
            onDeleteAgent={deleteAgent}
            onCancelWorkflow={cancelWorkflow}
          />
        )}
      </div>
      <BottomBar health={health.connected} sessionCount={sessions.length} />

      <NewAgentModal
        isOpen={sessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
        onSubmit={handleCreateSession}
      />
      <CreateAgentModal
        isOpen={createAgentModalOpen}
        onClose={() => setCreateAgentModalOpen(false)}
        onSubmit={handleCreateAgent}
      />
      <AssignPromptModal
        isOpen={!!assignAgent}
        agent={assignAgent}
        onClose={() => setAssignAgent(null)}
        onSubmit={handleAssignPrompt}
      />
      <StartWorkflowModal
        isOpen={workflowModalOpen}
        onClose={() => setWorkflowModalOpen(false)}
        onSubmit={handleStartWorkflow}
        agents={agents}
      />
    </div>
  );
}
