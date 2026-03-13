import { useRef, useEffect, useState } from 'react';
import { AGENT_VISUAL_STATE } from '@agent-deck/shared';

const WALK_DURATION = 1800; // ms

/**
 * Tracks visual state for each agent (idle at coffee, walking, working at desk).
 * Extracted so it can be shared between OfficeView and sound effects.
 */
export default function useAgentVisualStates(agents, sessions) {
  const prevSessionMap = useRef(null); // null = first run
  const [visualStates, setVisualStates] = useState({});
  const timersRef = useRef({});

  // Build a set of active session IDs for quick lookup
  const activeSessionIds = new Set(
    sessions.filter((s) => s.state === 'running').map((s) => s.id)
  );

  useEffect(() => {
    const isFirstRun = prevSessionMap.current === null;

    setVisualStates((prev) => {
      const next = { ...prev };

      for (const agent of agents) {
        // Only count as "has session" if the session actually exists and is running
        const rawSessionId = agent.currentSessionId || null;
        const currSessionId = rawSessionId && activeSessionIds.has(rawSessionId)
          ? rawSessionId : null;

        if (isFirstRun) {
          // First render: place agents at their correct position immediately
          // (no walking animation for already-running agents)
          next[agent.id] = currSessionId
            ? AGENT_VISUAL_STATE.WORKING_AT_DESK
            : AGENT_VISUAL_STATE.IDLE_AT_COFFEE;
        } else {
          const prevSessionId = prevSessionMap.current[agent.id];
          const prevHadSession = prevSessionId !== undefined
            ? !!prevSessionId
            : false;

          if (!currSessionId && !prevHadSession) {
            // No session before, no session now → idle at coffee
            const current = next[agent.id];
            if (!current
              || current === AGENT_VISUAL_STATE.WALKING_TO_COFFEE
              || current === AGENT_VISUAL_STATE.WALKING_TO_DESK) {
              next[agent.id] = AGENT_VISUAL_STATE.IDLE_AT_COFFEE;
            }
          } else if (currSessionId && !prevHadSession) {
            // Just got assigned → walk to desk
            next[agent.id] = AGENT_VISUAL_STATE.WALKING_TO_DESK;
            clearTimeout(timersRef.current[agent.id]);
            timersRef.current[agent.id] = setTimeout(() => {
              setVisualStates((s) => ({
                ...s,
                [agent.id]: AGENT_VISUAL_STATE.WORKING_AT_DESK,
              }));
            }, WALK_DURATION);
          } else if (!currSessionId && prevHadSession) {
            // Session cleared → walk back to coffee
            next[agent.id] = AGENT_VISUAL_STATE.WALKING_TO_COFFEE;
            clearTimeout(timersRef.current[agent.id]);
            timersRef.current[agent.id] = setTimeout(() => {
              setVisualStates((s) => ({
                ...s,
                [agent.id]: AGENT_VISUAL_STATE.IDLE_AT_COFFEE,
              }));
            }, WALK_DURATION);
          }
          // else: still has same active session → keep current state
        }
      }

      // Clean up removed agents
      for (const id of Object.keys(next)) {
        if (!agents.find((a) => a.id === id)) {
          delete next[id];
          clearTimeout(timersRef.current[id]);
        }
      }

      return next;
    });

    // Update prev map — only track sessions that are actually running
    const newMap = {};
    for (const agent of agents) {
      const sid = agent.currentSessionId || null;
      newMap[agent.id] = sid && activeSessionIds.has(sid) ? sid : null;
    }
    prevSessionMap.current = newMap;
  }, [agents, sessions]);

  useEffect(() => {
    return () => {
      for (const t of Object.values(timersRef.current)) clearTimeout(t);
    };
  }, []);

  return visualStates;
}
