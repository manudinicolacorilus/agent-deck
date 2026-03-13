import { useRef, useEffect, useState } from 'react';
import { AGENT_VISUAL_STATE } from '@agent-deck/shared';

const WALK_DURATION = 1800; // ms

// Idle behavior: agents wander between break room spots
const IDLE_STATES = [
  AGENT_VISUAL_STATE.IDLE_AT_COFFEE,
  AGENT_VISUAL_STATE.CHATTING_AT_COOLER,
  AGENT_VISUAL_STATE.SITTING_ON_COUCH,
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Tracks visual state for each agent (idle at coffee, walking, working at desk).
 * Now includes idle behavior cycling and thinking sub-state.
 */
export default function useAgentVisualStates(agents, sessions, activities = {}) {
  const prevSessionMap = useRef(null); // null = first run
  const [visualStates, setVisualStates] = useState({});
  const timersRef = useRef({});
  const idleTimersRef = useRef({});

  // Build a set of active session IDs for quick lookup
  const activeSessionIds = new Set(
    sessions.filter((s) => s.state === 'running').map((s) => s.id)
  );

  // Schedule idle wandering for an agent
  function scheduleIdleWander(agentId) {
    clearTimeout(idleTimersRef.current[agentId]);

    const delay = 5000 + Math.random() * 10000; // 5-15s
    idleTimersRef.current[agentId] = setTimeout(() => {
      setVisualStates((prev) => {
        const current = prev[agentId];
        // Only wander if still in an idle state
        if (!current || !IDLE_STATES.includes(current)) return prev;

        // Pick a different idle state
        const others = IDLE_STATES.filter((s) => s !== current);
        const next = pickRandom(others);
        return { ...prev, [agentId]: next };
      });

      // Schedule next wander
      scheduleIdleWander(agentId);
    }, delay);
  }

  useEffect(() => {
    const isFirstRun = prevSessionMap.current === null;
    const prevMap = prevSessionMap.current;

    const newMap = {};
    for (const agent of agents) {
      const sid = agent.currentSessionId || null;
      newMap[agent.id] = sid && activeSessionIds.has(sid) ? sid : null;
    }

    setVisualStates((prev) => {
      const next = { ...prev };

      for (const agent of agents) {
        const rawSessionId = agent.currentSessionId || null;
        const currSessionId = rawSessionId && activeSessionIds.has(rawSessionId)
          ? rawSessionId : null;

        if (isFirstRun) {
          if (currSessionId) {
            // Check if the activity is thinking
            const activity = activities[currSessionId];
            next[agent.id] = activity === 'thinking'
              ? AGENT_VISUAL_STATE.THINKING_AT_DESK
              : AGENT_VISUAL_STATE.WORKING_AT_DESK;
          } else {
            next[agent.id] = AGENT_VISUAL_STATE.IDLE_AT_COFFEE;
            scheduleIdleWander(agent.id);
          }
        } else {
          const prevSessionId = prevMap[agent.id];
          const prevHadSession = prevSessionId !== undefined ? !!prevSessionId : false;

          if (!currSessionId && !prevHadSession) {
            const current = next[agent.id];
            if (!current
              || current === AGENT_VISUAL_STATE.WALKING_TO_COFFEE
              || current === AGENT_VISUAL_STATE.WALKING_TO_DESK) {
              next[agent.id] = AGENT_VISUAL_STATE.IDLE_AT_COFFEE;
              scheduleIdleWander(agent.id);
            }
          } else if (currSessionId && !prevHadSession) {
            // Just got assigned → walk to desk
            next[agent.id] = AGENT_VISUAL_STATE.WALKING_TO_DESK;
            clearTimeout(timersRef.current[agent.id]);
            clearTimeout(idleTimersRef.current[agent.id]);
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
              scheduleIdleWander(agent.id);
            }, WALK_DURATION);
          } else if (currSessionId) {
            // Still working — check if thinking
            const activity = activities[currSessionId];
            if (activity === 'thinking' && next[agent.id] === AGENT_VISUAL_STATE.WORKING_AT_DESK) {
              next[agent.id] = AGENT_VISUAL_STATE.THINKING_AT_DESK;
            } else if (activity !== 'thinking' && next[agent.id] === AGENT_VISUAL_STATE.THINKING_AT_DESK) {
              next[agent.id] = AGENT_VISUAL_STATE.WORKING_AT_DESK;
            }
          }
        }
      }

      // Clean up removed agents
      for (const id of Object.keys(next)) {
        if (!agents.find((a) => a.id === id)) {
          delete next[id];
          clearTimeout(timersRef.current[id]);
          clearTimeout(idleTimersRef.current[id]);
        }
      }

      return next;
    });

    prevSessionMap.current = newMap;
  }, [agents, sessions, activities]);

  useEffect(() => {
    return () => {
      for (const t of Object.values(timersRef.current)) clearTimeout(t);
      for (const t of Object.values(idleTimersRef.current)) clearTimeout(t);
    };
  }, []);

  return visualStates;
}
