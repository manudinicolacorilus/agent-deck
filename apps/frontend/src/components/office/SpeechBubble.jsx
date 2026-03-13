import React, { useState, useEffect, useRef } from 'react';

/**
 * Floating speech or thought bubble above a character.
 *
 * Props:
 *  - type: 'speech' | 'thought' | 'action'
 *  - text: string — bubble content
 *  - visible: boolean
 *  - x: number — anchor x position
 *  - y: number — anchor y position
 */

export default function SpeechBubble({ type = 'speech', text, visible, x = 0, y = 0 }) {
  const [show, setShow] = useState(false);
  const [fading, setFading] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (visible && text) {
      setShow(true);
      setFading(false);

      clearTimeout(timerRef.current);
      // Hold for 2-4 seconds
      const holdTime = 2000 + Math.random() * 2000;
      timerRef.current = setTimeout(() => {
        setFading(true);
        setTimeout(() => setShow(false), 300);
      }, holdTime);
    } else {
      setFading(true);
      setTimeout(() => setShow(false), 300);
    }
    return () => clearTimeout(timerRef.current);
  }, [visible, text]);

  if (!show || !text) return null;

  if (type === 'thought') {
    return (
      <div style={{
        position: 'absolute',
        left: x - 30,
        top: y - 50,
        zIndex: 100,
        pointerEvents: 'none',
        animation: fading ? 'bubble-out 0.3s ease forwards' : 'bubble-in 0.2s ease forwards',
      }}>
        {/* Thought trail dots */}
        <div style={{
          position: 'absolute',
          bottom: -4,
          left: 12,
          display: 'flex',
          gap: 3,
          flexDirection: 'column',
        }}>
          <div style={{
            width: 4, height: 4, borderRadius: '50%',
            background: '#8b949e', opacity: 0.6,
          }} />
          <div style={{
            width: 3, height: 3, borderRadius: '50%',
            background: '#8b949e', opacity: 0.4,
          }} />
        </div>
        {/* Bubble */}
        <div style={{
          background: '#21262d',
          border: '1px solid #30363d',
          borderRadius: 16,
          padding: '4px 10px',
          fontSize: 11,
          color: '#d2a8ff',
          whiteSpace: 'nowrap',
          fontFamily: 'monospace',
        }}>
          <ThoughtDots />
        </div>
      </div>
    );
  }

  if (type === 'action') {
    return (
      <div style={{
        position: 'absolute',
        left: x + 14,
        top: y - 24,
        zIndex: 100,
        pointerEvents: 'none',
        animation: fading ? 'bubble-out 0.3s ease forwards' : 'bubble-in 0.2s ease forwards',
      }}>
        <div style={{
          width: 20,
          height: 20,
          borderRadius: 4,
          background: '#21262d',
          border: '1px solid #30363d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
        }}>
          {text}
        </div>
      </div>
    );
  }

  // Speech bubble (default)
  return (
    <div style={{
      position: 'absolute',
      left: x - 20,
      top: y - 52,
      zIndex: 100,
      pointerEvents: 'none',
      animation: fading ? 'bubble-out 0.3s ease forwards' : 'bubble-in 0.2s ease forwards',
    }}>
      {/* Bubble */}
      <div style={{
        background: '#e6edf3',
        color: '#1a1f27',
        borderRadius: 10,
        padding: '4px 10px',
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        position: 'relative',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        maxWidth: 140,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {text}
        {/* Tail */}
        <div style={{
          position: 'absolute',
          bottom: -6,
          left: 14,
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid #e6edf3',
        }} />
      </div>
    </div>
  );
}

function ThoughtDots() {
  const [dots, setDots] = useState(1);
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d % 3) + 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);
  return <span>{'.'.repeat(dots)}</span>;
}
