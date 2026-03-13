import { useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../lib/api.js';

export default function useAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const data = await api.fetchAgents();
      setAgents(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const data = await api.fetchAgents(controller.signal);
        setAgents(data);
        setError(null);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    intervalRef.current = setInterval(refresh, 2000);

    return () => {
      controller.abort();
      clearInterval(intervalRef.current);
    };
  }, [refresh]);

  const createAgent = useCallback(async (data) => {
    const agent = await api.createAgent(data);
    await refresh();
    return agent;
  }, [refresh]);

  const updateAgent = useCallback(async (id, fields) => {
    const agent = await api.updateAgent(id, fields);
    await refresh();
    return agent;
  }, [refresh]);

  const deleteAgent = useCallback(async (id) => {
    await api.deleteAgent(id);
    setAgents((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const assignPrompt = useCallback(async (id, { prompt, workDir }) => {
    const result = await api.assignPrompt(id, { prompt, workDir });
    await refresh();
    return result;
  }, [refresh]);

  return { agents, loading, error, createAgent, updateAgent, deleteAgent, assignPrompt, refresh };
}
