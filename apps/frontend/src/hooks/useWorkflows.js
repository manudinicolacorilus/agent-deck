import { useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../lib/api.js';

export default function useWorkflows() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const data = await api.fetchWorkflows();
      setWorkflows(data);
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
        const data = await api.fetchWorkflows(controller.signal);
        setWorkflows(data);
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

    intervalRef.current = setInterval(refresh, 3000);

    return () => {
      controller.abort();
      clearInterval(intervalRef.current);
    };
  }, [refresh]);

  const startWorkflow = useCallback(async (data) => {
    const wf = await api.createWorkflow(data);
    await refresh();
    return wf;
  }, [refresh]);

  const cancelWorkflow = useCallback(async (id) => {
    await api.cancelWorkflow(id);
    await refresh();
  }, [refresh]);

  return { workflows, loading, error, startWorkflow, cancelWorkflow, refresh };
}
