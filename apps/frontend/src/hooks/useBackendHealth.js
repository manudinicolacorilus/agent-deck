import { useState, useEffect, useRef } from 'react';
import { fetchHealth } from '../lib/api.js';

export default function useBackendHealth() {
  const [health, setHealth] = useState({
    connected: false,
    sessions: 0,
    uptime: 0,
  });
  const intervalRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    async function checkHealth() {
      try {
        const data = await fetchHealth();
        setHealth({
          connected: true,
          sessions: data.sessions ?? 0,
          uptime: data.uptime ?? 0,
        });
      } catch {
        if (!controller.signal.aborted) {
          setHealth((prev) => ({ ...prev, connected: false }));
        }
      }
    }

    // Initial fetch
    checkHealth();

    // Poll every 10 seconds
    intervalRef.current = setInterval(checkHealth, 10000);

    return () => {
      controller.abort();
      clearInterval(intervalRef.current);
    };
  }, []);

  return health;
}
