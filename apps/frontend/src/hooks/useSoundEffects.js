import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Warcraft Peon-style sound effects for agent state transitions.
 * Uses Web Speech API to speak quotes — no audio files needed.
 */

const PEON_QUOTES = {
  // Agent assigned work / walking to desk
  startWork: [
    'Ready to work!',
    'Zug zug',
    'Dabu',
    'Something need doing?',
    'What you want?',
    'Yes, me lord?',
  ],
  // Agent actively working
  working: [
    'Work work',
    'Me busy, leave me alone!',
    'Okie dokie',
  ],
  // Agent finished task
  done: [
    "Job's done!",
    'Work complete',
    "Job's done!",
    'All done!',
  ],
  // Agent error
  error: [
    'Me not that kind of orc!',
    'Why you poking me again?',
    'That not work',
  ],
  // Agent going idle / back to break room
  idle: [
    'Off I go then!',
    'Okie dokie',
    'I can do that',
  ],
  // Waiting for approval
  approval: [
    'Hmmm?',
    'What?',
    'Something need doing?',
  ],
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Speak a phrase with a peon-like voice
function speakPeon(text, volume = 0.7) {
  if (!window.speechSynthesis) return;

  // Cancel any currently speaking utterance to avoid queue buildup
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 0.4; // Low, grunty voice
  utterance.volume = volume;

  // Try to find a male/deep voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    (v) => v.name.includes('Male') || v.name.includes('David') || v.name.includes('Mark')
  );
  if (preferred) utterance.voice = preferred;

  window.speechSynthesis.speak(utterance);
}

/**
 * Hook that plays Warcraft peon sounds on agent state transitions.
 *
 * @param {Object} activities - { [sessionId]: activityState }
 * @param {Object} visualStates - { [agentId]: visualState } from OfficeView
 * @param {Array} agents - agent list
 * @param {Array} sessions - session list
 * @returns {{ soundEnabled: boolean, toggleSound: () => void }}
 */
export default function useSoundEffects(activities, visualStates, agents, sessions) {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem('agent-deck-sound') !== 'off';
    } catch {
      return true;
    }
  });

  const prevActivities = useRef({});
  const prevVisualStates = useRef({});
  const lastSoundTime = useRef(0);
  const MIN_INTERVAL = 2000; // Min ms between sounds to avoid spam

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try { localStorage.setItem('agent-deck-sound', next ? 'on' : 'off'); } catch {}
      if (!next) window.speechSynthesis?.cancel();
      return next;
    });
  }, []);

  // Preload voices (some browsers need this)
  useEffect(() => {
    window.speechSynthesis?.getVoices();
  }, []);

  // Watch visual state transitions (walking to desk, going idle)
  useEffect(() => {
    if (!soundEnabled || !visualStates) return;

    const now = Date.now();
    const prev = prevVisualStates.current;

    for (const [agentId, state] of Object.entries(visualStates)) {
      const prevState = prev[agentId];
      if (prevState === state) continue;
      if (!prevState) continue; // Skip initial state

      if (now - lastSoundTime.current < MIN_INTERVAL) continue;

      if (state === 'walking_to_desk' && prevState === 'idle_at_coffee') {
        speakPeon(pickRandom(PEON_QUOTES.startWork));
        lastSoundTime.current = now;
      } else if (state === 'walking_to_coffee' && prevState === 'working_at_desk') {
        speakPeon(pickRandom(PEON_QUOTES.idle));
        lastSoundTime.current = now;
      }
    }

    prevVisualStates.current = { ...visualStates };
  }, [visualStates, soundEnabled]);

  // Watch activity state transitions (done, error, working, approval)
  useEffect(() => {
    if (!soundEnabled || !activities) return;

    const now = Date.now();
    const prev = prevActivities.current;

    for (const [sessionId, activity] of Object.entries(activities)) {
      const prevActivity = prev[sessionId];
      if (prevActivity === activity) continue;
      if (!prevActivity) continue; // Skip initial

      if (now - lastSoundTime.current < MIN_INTERVAL) continue;

      if (activity === 'done') {
        speakPeon(pickRandom(PEON_QUOTES.done));
        lastSoundTime.current = now;
      } else if (activity === 'error') {
        speakPeon(pickRandom(PEON_QUOTES.error));
        lastSoundTime.current = now;
      } else if (activity === 'waiting_for_approval') {
        speakPeon(pickRandom(PEON_QUOTES.approval));
        lastSoundTime.current = now;
      } else if (
        ['thinking', 'reading', 'editing', 'running_command'].includes(activity) &&
        prevActivity === 'idle'
      ) {
        // Only say "work work" when transitioning from idle to working
        speakPeon(pickRandom(PEON_QUOTES.working));
        lastSoundTime.current = now;
      }
    }

    prevActivities.current = { ...activities };
  }, [activities, soundEnabled]);

  return { soundEnabled, toggleSound };
}
