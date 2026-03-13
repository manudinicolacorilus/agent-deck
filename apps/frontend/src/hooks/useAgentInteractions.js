import { useEffect, useRef, useState, useCallback } from 'react';
import { AGENT_VISUAL_STATE } from '@agent-deck/shared';

/**
 * Water cooler conversation quotes (agent-to-agent).
 */
const COOLER_QUOTES = [
  'Did you see the latest commit?',
  'This codebase though...',
  'Need more coffee...',
  'Who wrote this test?',
  'Merge conflicts again!',
  'Ship it!',
  'LGTM',
  'Works on my machine',
  'Have you tried turning it off?',
  'Refactor time!',
  'The sprint never ends',
  'Is it Friday yet?',
];

const COUCH_QUOTES = [
  '*yawns*',
  'Five more minutes...',
  'Recharging...',
  'Zzzz...',
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Hook that manages agent-to-agent interactions.
 * When multiple agents are idle at the same location, trigger conversations.
 *
 * @param {Array} agents
 * @param {Object} visualStates
 * @param {Object} positions - from useCharacterPositions
 * @returns {{ bubbles: Object, chatPairs: Array }}
 */
export default function useAgentInteractions(agents, visualStates, positions) {
  const [bubbles, setBubbles] = useState({}); // { [agentId]: { text, type, visible } }
  const timerRef = useRef({});
  const intervalRef = useRef(null);

  // Find agents that are close together and idle
  const checkInteractions = useCallback(() => {
    const idleAgents = agents.filter((a) => {
      const vs = visualStates[a.id];
      return vs === AGENT_VISUAL_STATE.IDLE_AT_COFFEE
        || vs === AGENT_VISUAL_STATE.CHATTING_AT_COOLER
        || vs === AGENT_VISUAL_STATE.SITTING_ON_COUCH;
    });

    if (idleAgents.length < 2) return;

    // Check proximity (within 80px)
    for (let i = 0; i < idleAgents.length; i++) {
      for (let j = i + 1; j < idleAgents.length; j++) {
        const a = idleAgents[i];
        const b = idleAgents[j];
        const posA = positions[a.id];
        const posB = positions[b.id];
        if (!posA || !posB) continue;

        const dist = Math.sqrt((posA.x - posB.x) ** 2 + (posA.y - posB.y) ** 2);
        if (dist < 80) {
          // Random chance to trigger a conversation
          if (Math.random() < 0.3) {
            const speaker = Math.random() < 0.5 ? a : b;
            const vs = visualStates[speaker.id];
            const quotes = vs === AGENT_VISUAL_STATE.SITTING_ON_COUCH
              ? COUCH_QUOTES
              : COOLER_QUOTES;

            setBubbles((prev) => ({
              ...prev,
              [speaker.id]: {
                text: pickRandom(quotes),
                type: 'speech',
                visible: true,
              },
            }));

            // Clear after 3-5 seconds
            clearTimeout(timerRef.current[speaker.id]);
            timerRef.current[speaker.id] = setTimeout(() => {
              setBubbles((prev) => ({
                ...prev,
                [speaker.id]: { ...prev[speaker.id], visible: false },
              }));
            }, 3000 + Math.random() * 2000);
          }
        }
      }
    }
  }, [agents, visualStates, positions]);

  // Run interaction check every 5-8 seconds
  useEffect(() => {
    const schedule = () => {
      const delay = 5000 + Math.random() * 3000;
      intervalRef.current = setTimeout(() => {
        checkInteractions();
        schedule();
      }, delay);
    };
    schedule();
    return () => {
      clearTimeout(intervalRef.current);
      for (const t of Object.values(timerRef.current)) clearTimeout(t);
    };
  }, [checkInteractions]);

  // Find chat pairs (agents facing each other)
  const chatPairs = [];
  const idleAgents = agents.filter((a) => {
    const vs = visualStates[a.id];
    return vs === AGENT_VISUAL_STATE.IDLE_AT_COFFEE
      || vs === AGENT_VISUAL_STATE.CHATTING_AT_COOLER;
  });

  for (let i = 0; i < idleAgents.length; i++) {
    for (let j = i + 1; j < idleAgents.length; j++) {
      const posA = positions[idleAgents[i].id];
      const posB = positions[idleAgents[j].id];
      if (!posA || !posB) continue;
      const dist = Math.sqrt((posA.x - posB.x) ** 2 + (posA.y - posB.y) ** 2);
      if (dist < 80) {
        chatPairs.push([idleAgents[i].id, idleAgents[j].id]);
      }
    }
  }

  return { bubbles, chatPairs };
}
