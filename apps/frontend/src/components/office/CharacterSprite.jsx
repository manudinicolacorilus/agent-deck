import React, { useMemo } from 'react';

/**
 * Pure CSS pixel-art character sprite (32×32).
 * No image assets — built entirely from styled divs.
 *
 * Props:
 *  - name: string — used to derive unique color accent
 *  - role: 'architect' | 'dev' | 'reviewer' | null
 *  - animation: 'idle' | 'walking' | 'typing' | 'thinking' | 'talking' | 'sipping'
 *  - facing: 'down' | 'up' | 'left' | 'right'
 *  - size: number — scale factor (default 1 = 32px)
 */

const ROLE_COLORS = {
  architect: '#d2a8ff',
  dev: '#58a6ff',
  reviewer: '#f0883e',
};

const ROLE_BADGE_BG = {
  architect: '#d2a8ff33',
  dev: '#58a6ff33',
  reviewer: '#f0883e33',
};

// Derive a unique accent color from name string
function nameToColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 55%)`;
}

// Skin tones for variety
const SKIN_TONES = ['#f4c794', '#e0ac69', '#c68642', '#8d5524', '#ffdbac'];
function nameToSkin(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) * 7 + ((hash << 3) - hash);
  }
  return SKIN_TONES[Math.abs(hash) % SKIN_TONES.length];
}

const ANIM_MAP = {
  idle: 'sprite-idle 2s ease-in-out infinite',
  walking: 'sprite-walk 0.4s ease-in-out infinite',
  typing: 'sprite-type 0.6s ease-in-out infinite',
  thinking: 'sprite-think 3s ease-in-out infinite',
  talking: 'sprite-talk 0.8s ease-in-out infinite',
  sipping: 'sprite-sip 3s ease-in-out 1',
};

export default function CharacterSprite({
  name = 'Agent',
  role = null,
  animation = 'idle',
  facing = 'down',
  size = 1,
}) {
  const accent = useMemo(() => nameToColor(name), [name]);
  const skin = useMemo(() => nameToSkin(name), [name]);
  const roleColor = role ? ROLE_COLORS[role] : null;
  const roleBg = role ? ROLE_BADGE_BG[role] : null;

  const scaleX = facing === 'left' ? -1 : 1;
  const isBack = facing === 'up';

  const spriteAnim = ANIM_MAP[animation] || ANIM_MAP.idle;

  const legAnim = animation === 'walking'
    ? { left: 'leg-walk-left 0.4s ease-in-out infinite', right: 'leg-walk-right 0.4s ease-in-out infinite' }
    : { left: 'none', right: 'none' };

  const armAnim = animation === 'typing'
    ? { left: 'arm-type-left 0.3s ease-in-out infinite', right: 'arm-type-right 0.3s ease-in-out infinite alternate' }
    : animation === 'sipping'
      ? { left: 'arm-sip 3s ease-in-out 1', right: 'none' }
      : animation === 'thinking'
        ? { left: 'arm-think 3s ease-in-out infinite', right: 'none' }
        : { left: 'none', right: 'none' };

  return (
    <div
      style={{
        width: 32 * size,
        height: 32 * size,
        position: 'relative',
        transform: `scaleX(${scaleX})`,
        animation: spriteAnim,
        imageRendering: 'pixelated',
      }}
    >
      {/* Role badge - tiny colored dot above head */}
      {roleColor && (
        <div style={{
          position: 'absolute',
          top: -4 * size,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 6 * size,
          height: 6 * size,
          borderRadius: '50%',
          background: roleColor,
          boxShadow: `0 0 4px ${roleColor}66`,
          animation: 'badge-float 2s ease-in-out infinite',
          zIndex: 10,
        }} />
      )}

      {/* Head */}
      <div style={{
        position: 'absolute',
        top: 2 * size,
        left: 8 * size,
        width: 16 * size,
        height: 14 * size,
        background: skin,
        borderRadius: `${6 * size}px ${6 * size}px ${4 * size}px ${4 * size}px`,
        zIndex: 5,
      }}>
        {/* Hair */}
        <div style={{
          position: 'absolute',
          top: -1 * size,
          left: -1 * size,
          right: -1 * size,
          height: 8 * size,
          background: accent,
          borderRadius: `${6 * size}px ${6 * size}px ${2 * size}px ${2 * size}px`,
          zIndex: 6,
        }} />

        {/* Face (only visible when facing down or sides) */}
        {!isBack && (
          <>
            {/* Eyes */}
            <div style={{
              position: 'absolute',
              top: 6 * size,
              left: 3 * size,
              width: 3 * size,
              height: 3 * size,
              background: '#1a1a2e',
              borderRadius: '50%',
            }} />
            <div style={{
              position: 'absolute',
              top: 6 * size,
              right: 3 * size,
              width: 3 * size,
              height: 3 * size,
              background: '#1a1a2e',
              borderRadius: '50%',
            }} />
            {/* Mouth - changes with animation */}
            <div style={{
              position: 'absolute',
              bottom: 2 * size,
              left: '50%',
              transform: 'translateX(-50%)',
              width: (animation === 'talking' ? 4 : 5) * size,
              height: (animation === 'talking' ? 3 : 1.5) * size,
              background: animation === 'talking' ? '#2a1a1a' : 'transparent',
              borderBottom: animation === 'talking' ? 'none' : `${1.5 * size}px solid #2a1a1a`,
              borderRadius: animation === 'talking' ? `0 0 ${3 * size}px ${3 * size}px` : `0 0 ${2 * size}px ${2 * size}px`,
            }} />
          </>
        )}
      </div>

      {/* Body / Torso */}
      <div style={{
        position: 'absolute',
        top: 15 * size,
        left: 9 * size,
        width: 14 * size,
        height: 10 * size,
        background: accent,
        borderRadius: `${2 * size}px ${2 * size}px ${3 * size}px ${3 * size}px`,
        zIndex: 3,
        opacity: 0.9,
      }} />

      {/* Left Arm */}
      <div style={{
        position: 'absolute',
        top: 16 * size,
        left: 4 * size,
        width: 5 * size,
        height: 9 * size,
        background: accent,
        borderRadius: `${3 * size}px`,
        zIndex: 2,
        transformOrigin: 'top center',
        animation: armAnim.left,
        filter: 'brightness(0.85)',
      }} />

      {/* Right Arm */}
      <div style={{
        position: 'absolute',
        top: 16 * size,
        right: 4 * size,
        width: 5 * size,
        height: 9 * size,
        background: accent,
        borderRadius: `${3 * size}px`,
        zIndex: 2,
        transformOrigin: 'top center',
        animation: armAnim.right,
        filter: 'brightness(0.85)',
      }} />

      {/* Left Leg */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 9 * size,
        width: 5 * size,
        height: 7 * size,
        background: '#2d333b',
        borderRadius: `0 0 ${2 * size}px ${2 * size}px`,
        zIndex: 1,
        animation: legAnim.left,
      }} />

      {/* Right Leg */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        right: 9 * size,
        width: 5 * size,
        height: 7 * size,
        background: '#2d333b',
        borderRadius: `0 0 ${2 * size}px ${2 * size}px`,
        zIndex: 1,
        animation: legAnim.right,
      }} />
    </div>
  );
}
