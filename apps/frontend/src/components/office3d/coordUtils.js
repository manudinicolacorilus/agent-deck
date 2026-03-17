/**
 * 2D → 3D coordinate mapping utilities.
 * Scale: 1 world unit = 10 pixels.
 * x3D = (x2D - 600) / 10   (centered at origin)
 * z3D = (y2D - 220) / 10    (2D Y → 3D Z)
 * y3D = height (floor at 0)
 */

export function map2Dto3D(x2D, y2D, height = 0) {
  return [
    (x2D - 600) / 10,
    height,
    (y2D - 220) / 10,
  ];
}

// Named 2D positions (from useCharacterPositions)
const POSITIONS_2D = {
  coffeeArea: { x: 80, y: 180 },
  waterCooler: { x: 160, y: 180 },
  couch: { x: 120, y: 300 },
  kickerTable: { x: 75, y: 260 },
  diningTable: { x: 175, y: 310 },
  breakRoomDoor: { x: 220, y: 270 },
  hallwayMid: { x: 350, y: 270 },
  workspaceDoor: { x: 480, y: 270 },
};

// Pre-computed 3D positions for furniture & landmarks
export const POSITIONS_3D = Object.fromEntries(
  Object.entries(POSITIONS_2D).map(([key, { x, y }]) => [key, map2Dto3D(x, y)])
);

// Room boundaries in 3D
export const ROOMS = {
  breakRoom: {
    center: map2Dto3D(130, 230),
    size: [28, 35], // width (x), depth (z) in world units
  },
  workspace: {
    center: map2Dto3D(810, 225),
    size: [70, 29],
  },
  hallway: {
    center: map2Dto3D(350, 260),
    size: [24, 6],
  },
  managerOffice: {
    center: map2Dto3D(1080, 225),
    size: [16, 22],
  },
  restrooms: {
    center: map2Dto3D(350, 400),
    size: [16, 12],
  },
  southCorridor: {
    center: map2Dto3D(430, 330),
    size: [6, 12],
  },
};

// Desk grid: 2 rows × 4 columns
export function getDeskPosition3D(index) {
  const col = index % 4;
  const row = Math.floor(index / 4);
  const x2D = 530 + col * 140;
  const y2D = 140 + row * 170;
  return map2Dto3D(x2D, y2D);
}

// Activity → monitor emissive color
export const ACTIVITY_COLORS = {
  idle: '#484f58',
  thinking: '#d2a8ff',
  reading: '#58a6ff',
  editing: '#3fb950',
  running_command: '#f0883e',
  waiting_for_approval: '#f8e3a1',
  waiting_for_input: '#f8e3a1',
  done: '#3fb950',
  error: '#da3633',
};

// Role badge colors
export const ROLE_COLORS = {
  architect: '#d2a8ff',
  dev: '#58a6ff',
  reviewer: '#f0883e',
};

// Activity indicator icons
export const ACTIVITY_ICONS = {
  thinking: '💭',
  reading: '📖',
  editing: '⌨️',
  running_command: '⚡',
  waiting_for_approval: '❓',
  waiting_for_input: '💬',
  done: '✅',
  error: '❌',
};

// Skin tones (same as CharacterSprite)
const SKIN_TONES = ['#f4c794', '#e0ac69', '#c68642', '#8d5524', '#ffdbac'];

export function nameToColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 55%)`;
}

export function nameToSkin(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) * 7 + ((hash << 3) - hash);
  }
  return SKIN_TONES[Math.abs(hash) % SKIN_TONES.length];
}

// Convert HSL string to hex for Three.js
export function hslToHex(hslStr) {
  const match = hslStr.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return '#888888';
  const h = parseInt(match[1]) / 360;
  const s = parseInt(match[2]) / 100;
  const l = parseInt(match[3]) / 100;

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
