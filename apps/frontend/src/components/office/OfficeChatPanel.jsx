import React, { useState, useRef, useEffect } from 'react';
import { AGENT_VISUAL_STATE } from '@agent-deck/shared';

const C = {
  bg: '#161b22',
  border: '#2d333b',
  inputBg: '#0d1117',
  text: '#c9d1d9',
  muted: '#484f58',
  accent: '#58a6ff',
};

const LOCATION_LABELS = {
  [AGENT_VISUAL_STATE.IDLE_AT_COFFEE]: 'at the coffee machine',
  [AGENT_VISUAL_STATE.CHATTING_AT_COOLER]: 'chatting at the water cooler',
  [AGENT_VISUAL_STATE.SITTING_ON_COUCH]: 'sitting on the couch',
  [AGENT_VISUAL_STATE.WALKING_TO_DESK]: 'walking to their desk',
  [AGENT_VISUAL_STATE.WORKING_AT_DESK]: 'working at their desk',
  [AGENT_VISUAL_STATE.THINKING_AT_DESK]: 'thinking at their desk',
  [AGENT_VISUAL_STATE.WALKING_TO_COFFEE]: 'heading to the break room',
  [AGENT_VISUAL_STATE.WALKING_TO_COOLER]: 'heading to the water cooler',
};

function getLocationLabel(state) {
  return LOCATION_LABELS[state] || 'somewhere in the office';
}

function answerQuery(query, agents, visualStates) {
  const q = query.toLowerCase().trim();

  // "who is there" / "who's there" / "who is in the office"
  if (q.match(/who.*(there|here|office|around)/)) {
    if (agents.length === 0) return 'The office is empty right now.';
    const lines = agents.map((a) => {
      const state = visualStates[a.id];
      const loc = getLocationLabel(state);
      const role = a.role ? ` (${a.role})` : '';
      return `  ${a.name}${role} — ${loc}`;
    });
    return `There are ${agents.length} agent${agents.length !== 1 ? 's' : ''} in the office:\n${lines.join('\n')}`;
  }

  // "where is <name>"
  const whereMatch = q.match(/where.*(?:is|are)\s+(.+)/);
  if (whereMatch) {
    const name = whereMatch[1].replace(/[?]/g, '').trim();
    const found = agents.filter((a) => a.name.toLowerCase().includes(name));
    if (found.length === 0) return `I don't see anyone named "${name}" in the office.`;
    return found.map((a) => {
      const state = visualStates[a.id];
      return `${a.name} is ${getLocationLabel(state)}.`;
    }).join('\n');
  }

  // "who is idle" / "who is working"
  if (q.match(/who.*(idle|break|resting|free)/)) {
    const idle = agents.filter((a) => {
      const s = visualStates[a.id];
      return s === AGENT_VISUAL_STATE.IDLE_AT_COFFEE
        || s === AGENT_VISUAL_STATE.CHATTING_AT_COOLER
        || s === AGENT_VISUAL_STATE.SITTING_ON_COUCH;
    });
    if (idle.length === 0) return 'Everyone is busy working!';
    return `Idle agents:\n${idle.map((a) => `  ${a.name} — ${getLocationLabel(visualStates[a.id])}`).join('\n')}`;
  }

  if (q.match(/who.*(work|busy|active)/)) {
    const working = agents.filter((a) => {
      const s = visualStates[a.id];
      return s === AGENT_VISUAL_STATE.WORKING_AT_DESK
        || s === AGENT_VISUAL_STATE.THINKING_AT_DESK;
    });
    if (working.length === 0) return 'No one is working right now.';
    return `Working agents:\n${working.map((a) => `  ${a.name} — ${getLocationLabel(visualStates[a.id])}`).join('\n')}`;
  }

  // "how many"
  if (q.match(/how many/)) {
    const idle = agents.filter((a) => {
      const s = visualStates[a.id];
      return s === AGENT_VISUAL_STATE.IDLE_AT_COFFEE
        || s === AGENT_VISUAL_STATE.CHATTING_AT_COOLER
        || s === AGENT_VISUAL_STATE.SITTING_ON_COUCH;
    });
    const working = agents.filter((a) => {
      const s = visualStates[a.id];
      return s === AGENT_VISUAL_STATE.WORKING_AT_DESK
        || s === AGENT_VISUAL_STATE.THINKING_AT_DESK;
    });
    return `${agents.length} total — ${working.length} working, ${idle.length} idle.`;
  }

  return `Try asking:\n  "who is there?"\n  "where is <name>?"\n  "who is idle?"\n  "who is working?"`;
}

export default function OfficeChatPanel({ agents, visualStates }) {
  const [messages, setMessages] = useState([
    { from: 'system', text: 'Ask me about the office! Try "who is there?"' },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const q = input.trim();
    if (!q) return;

    const answer = answerQuery(q, agents, visualStates);
    setMessages((prev) => [
      ...prev,
      { from: 'user', text: q },
      { from: 'system', text: answer },
    ]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column',
      border: `2px solid ${C.border}`, borderRadius: 8, overflow: 'hidden',
      background: C.bg, maxHeight: 360,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', background: '#383f49', borderRadius: '6px 6px 0 0',
        borderBottom: `2px solid #444c56`,
      }}>
        <span style={{ fontSize: 14 }}>💬</span>
        <span style={{
          fontSize: 11, fontWeight: 700, color: '#8b949e',
          textTransform: 'uppercase', letterSpacing: '1.5px',
        }}>
          Office Chat
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{
        flex: 1, padding: 8, overflow: 'auto',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            fontSize: 12, lineHeight: 1.5,
            color: msg.from === 'user' ? C.accent : C.text,
            fontWeight: msg.from === 'user' ? 600 : 400,
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            padding: '4px 8px',
            background: msg.from === 'user' ? '#1c2333' : 'transparent',
            borderRadius: 4,
          }}>
            {msg.from === 'user' ? '> ' : ''}{msg.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{
        display: 'flex', gap: 4, padding: 8,
        borderTop: `1px solid ${C.border}`,
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about the office..."
          style={{
            flex: 1, padding: '6px 10px', fontSize: 12,
            background: C.inputBg, color: C.text, border: `1px solid ${C.border}`,
            borderRadius: 4, outline: 'none', fontFamily: 'inherit',
          }}
        />
        <button
          onClick={handleSend}
          style={{
            padding: '6px 10px', fontSize: 11, fontWeight: 700,
            background: C.accent, color: '#0d1117', border: 'none',
            borderRadius: 4, cursor: 'pointer',
          }}
        >
          Ask
        </button>
      </div>
    </div>
  );
}
