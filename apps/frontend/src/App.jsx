import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import AgentGrid from './components/AgentGrid';
import OfficeView from './components/OfficeView';
import BottomBar from './components/BottomBar';
import NewAgentModal from './components/NewAgentModal';
import useAgentSessions from './hooks/useAgentSessions';
import useBackendHealth from './hooks/useBackendHealth';
import useActivityTracker from './hooks/useActivityTracker';

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
  const health = useBackendHealth();
  const activities = useActivityTracker(sessions);
  const [modalOpen, setModalOpen] = useState(false);
  const [view, setView] = useState('terminal');

  const handleCreate = useCallback(async (formData) => {
    await createSession(formData);
    setModalOpen(false);
  }, [createSession]);

  const handleKill = useCallback(async (id) => {
    await killSession(id);
  }, [killSession]);

  const handleClose = useCallback(async (id) => {
    await closeSession(id);
  }, [closeSession]);

  const handleSelectAgent = useCallback((id) => {
    // Switch to terminal view when clicking an agent in office view
    setView('terminal');
  }, []);

  return (
    <div style={styles.layout}>
      <Header
        onNewAgent={() => setModalOpen(true)}
        view={view}
        onViewChange={setView}
      />
      <div style={styles.main}>
        {view === 'terminal' ? (
          <AgentGrid sessions={sessions} onKill={handleKill} onClose={handleClose} />
        ) : (
          <OfficeView
            sessions={sessions}
            activities={activities}
            onSelectAgent={handleSelectAgent}
          />
        )}
      </div>
      <BottomBar health={health.connected} sessionCount={sessions.length} />
      <NewAgentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
