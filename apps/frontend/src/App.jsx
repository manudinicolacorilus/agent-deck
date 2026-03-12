import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import AgentGrid from './components/AgentGrid';
import BottomBar from './components/BottomBar';
import NewAgentModal from './components/NewAgentModal';
import useAgentSessions from './hooks/useAgentSessions';
import useBackendHealth from './hooks/useBackendHealth';

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
  const [modalOpen, setModalOpen] = useState(false);

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

  return (
    <div style={styles.layout}>
      <Header onNewAgent={() => setModalOpen(true)} />
      <div style={styles.main}>
        <AgentGrid sessions={sessions} onKill={handleKill} onClose={handleClose} />
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
