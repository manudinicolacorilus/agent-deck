import { useEffect, useRef } from 'react';

const IDLE_TIMEOUT = 60 * 60 * 1000; // 1 hour in ms
const CHECK_INTERVAL = 30 * 1000; // check every 30s

/**
 * Automatically kills and closes sessions that have been idle for 1 hour.
 * A session is considered idle when its activity is 'idle', 'done', or 'error'.
 *
 * @param {Array} sessions
 * @param {Object} activities - { [sessionId]: activityState }
 * @param {Function} killSession
 * @param {Function} closeSession
 */
export default function useIdleSessionReaper(sessions, activities, killSession, closeSession) {
  const idleSinceRef = useRef({}); // { [sessionId]: timestamp }

  useEffect(() => {
    // Update idle timestamps
    const now = Date.now();

    for (const session of sessions) {
      if (session.state !== 'running') continue;

      const activity = activities[session.id];
      const isIdle = !activity || activity === 'idle' || activity === 'done' || activity === 'error';

      if (isIdle) {
        // Mark when it first became idle (don't overwrite existing)
        if (!idleSinceRef.current[session.id]) {
          idleSinceRef.current[session.id] = now;
        }
      } else {
        // Active — reset the timer
        delete idleSinceRef.current[session.id];
      }
    }

    // Clean up removed sessions
    const currentIds = new Set(sessions.map((s) => s.id));
    for (const id of Object.keys(idleSinceRef.current)) {
      if (!currentIds.has(id)) {
        delete idleSinceRef.current[id];
      }
    }
  }, [sessions, activities]);

  // Periodic check for sessions that exceeded the timeout
  useEffect(() => {
    const interval = setInterval(async () => {
      const now = Date.now();

      for (const [sessionId, idleSince] of Object.entries(idleSinceRef.current)) {
        if (now - idleSince >= IDLE_TIMEOUT) {
          // Remove from tracking immediately to avoid double-kill
          delete idleSinceRef.current[sessionId];

          try {
            await killSession(sessionId);
            // Small delay then close to clean up
            setTimeout(() => closeSession(sessionId), 2000);
          } catch {
            // Session may already be gone
          }
        }
      }
    }, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [killSession, closeSession]);
}
