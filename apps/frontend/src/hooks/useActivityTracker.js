import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Tracks activity state for all sessions via individual WebSocket connections.
 * Returns a Map-like object: { [sessionId]: activityState }
 */
export default function useActivityTracker(sessions) {
  const [activities, setActivities] = useState({});
  const wsRefs = useRef({}); // sessionId → WebSocket

  const updateActivity = useCallback((sessionId, activity) => {
    setActivities((prev) => {
      if (prev[sessionId] === activity) return prev;
      return { ...prev, [sessionId]: activity };
    });
  }, []);

  useEffect(() => {
    const currentIds = new Set(sessions.map((s) => s.id));
    const trackedIds = new Set(Object.keys(wsRefs.current));

    // Connect to new sessions
    for (const session of sessions) {
      if (wsRefs.current[session.id]) continue;

      // Set initial activity from session data if available
      if (session.activity) {
        updateActivity(session.id, session.activity);
      } else if (session.state === 'stopped') {
        updateActivity(session.id, session.exitCode === 0 ? 'done' : 'error');
      } else {
        updateActivity(session.id, 'idle');
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const url = `${protocol}//${window.location.host}/ws?sessionId=${encodeURIComponent(session.id)}`;
      const ws = new WebSocket(url);

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'activity') {
            updateActivity(session.id, msg.activity);
          } else if (msg.type === 'session:exit') {
            updateActivity(session.id, msg.exitCode === 0 ? 'done' : 'error');
          }
        } catch { /* ignore */ }
      };

      ws.onclose = () => {
        delete wsRefs.current[session.id];
      };

      wsRefs.current[session.id] = ws;
    }

    // Disconnect from removed sessions
    for (const id of trackedIds) {
      if (!currentIds.has(id)) {
        const ws = wsRefs.current[id];
        if (ws) {
          ws.onmessage = null;
          ws.onclose = null;
          ws.close();
          delete wsRefs.current[id];
        }
        setActivities((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    }

    return () => {
      // Clean up all on unmount
      for (const [id, ws] of Object.entries(wsRefs.current)) {
        ws.onmessage = null;
        ws.onclose = null;
        ws.close();
      }
      wsRefs.current = {};
    };
  }, [sessions, updateActivity]);

  return activities;
}
