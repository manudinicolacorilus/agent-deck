import { useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../lib/api.js';

export default function useAgentSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const data = await api.fetchSessions();
      setSessions(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    // Initial fetch
    (async () => {
      try {
        const data = await api.fetchSessions(controller.signal);
        setSessions(data);
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

    // Poll every 5 seconds
    intervalRef.current = setInterval(refresh, 5000);

    return () => {
      controller.abort();
      clearInterval(intervalRef.current);
    };
  }, [refresh]);

  const createSession = useCallback(async (data) => {
    try {
      await api.createSession(data);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }, [refresh]);

  const killSession = useCallback(async (id) => {
    try {
      await api.killSession(id);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }, [refresh]);

  return { sessions, loading, error, createSession, killSession, refresh };
}
