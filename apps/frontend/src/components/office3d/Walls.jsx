import React from 'react';
import { ROOMS, map2Dto3D } from './coordUtils';

/**
 * Sims-style dollhouse walls: cream interior, baseboard trim,
 * window cutouts with sky glow, proper door frames.
 */

const WALL_HEIGHT = 7;
const WALL_THICKNESS = 0.4;
const WALL_COLOR = '#d4c8a8';       // Warm cream
const WALL_INNER = '#c9bc9e';       // Slightly darker interior face
const BASEBOARD_COLOR = '#5a4a32';  // Dark wood baseboard
const BASEBOARD_HEIGHT = 0.4;
const CROWN_COLOR = '#e8dcc4';      // Light crown molding
const CROWN_HEIGHT = 0.25;

function WallSegment({ position, size, color = WALL_COLOR }) {
  const [w, h, d] = size;
  return (
    <group>
      {/* Main wall */}
      <mesh position={position} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* Baseboard */}
      <mesh position={[position[0], BASEBOARD_HEIGHT / 2, position[2]]}>
        <boxGeometry args={[w + 0.05, BASEBOARD_HEIGHT, d + 0.05]} />
        <meshStandardMaterial color={BASEBOARD_COLOR} roughness={0.7} />
      </mesh>
      {/* Crown molding */}
      <mesh position={[position[0], WALL_HEIGHT - CROWN_HEIGHT / 2, position[2]]}>
        <boxGeometry args={[w + 0.05, CROWN_HEIGHT, d + 0.05]} />
        <meshStandardMaterial color={CROWN_COLOR} roughness={0.6} />
      </mesh>
    </group>
  );
}

function WindowCutout({ position, wallAxis = 'x' }) {
  // Glowing "sky" rectangle embedded in wall
  const sillWidth = wallAxis === 'x' ? 4 : 0.5;
  const sillDepth = wallAxis === 'x' ? 0.5 : 4;
  return (
    <group position={position}>
      {/* Window glass — emissive sky blue */}
      <mesh>
        <boxGeometry args={[sillWidth, 2.5, sillDepth]} />
        <meshStandardMaterial
          color="#87CEEB"
          emissive="#87CEEB"
          emissiveIntensity={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>
      {/* Window frame */}
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[sillWidth + 0.2, 0.15, sillDepth + 0.2]} />
        <meshStandardMaterial color="#e8dcc4" />
      </mesh>
      <mesh position={[0, -1.3, 0]}>
        <boxGeometry args={[sillWidth + 0.3, 0.2, sillDepth + 0.3]} />
        <meshStandardMaterial color="#e8dcc4" />
      </mesh>
      {/* Cross bars */}
      <mesh>
        <boxGeometry args={[wallAxis === 'x' ? 0.1 : 0.5, 2.5, wallAxis === 'x' ? 0.5 : 0.1]} />
        <meshStandardMaterial color="#e8dcc4" />
      </mesh>
      <mesh>
        <boxGeometry args={[sillWidth, 0.1, sillDepth]} />
        <meshStandardMaterial color="#e8dcc4" />
      </mesh>
    </group>
  );
}

function DoorFrame({ position, rotation = 0 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Left post */}
      <mesh position={[-1.5, 2.5, 0]}>
        <boxGeometry args={[0.3, 5, 0.5]} />
        <meshStandardMaterial color={BASEBOARD_COLOR} />
      </mesh>
      {/* Right post */}
      <mesh position={[1.5, 2.5, 0]}>
        <boxGeometry args={[0.3, 5, 0.5]} />
        <meshStandardMaterial color={BASEBOARD_COLOR} />
      </mesh>
      {/* Top beam */}
      <mesh position={[0, 5.1, 0]}>
        <boxGeometry args={[3.3, 0.3, 0.5]} />
        <meshStandardMaterial color={BASEBOARD_COLOR} />
      </mesh>
    </group>
  );
}

function BreakRoomWalls() {
  const { center, size } = ROOMS.breakRoom;
  const [cx, , cz] = center;
  const [w, d] = size;
  const halfW = w / 2;
  const halfD = d / 2;
  const h = WALL_HEIGHT;
  const y = h / 2;

  // Door on right wall
  const doorZ = 5;
  const doorWidth = 3;
  const topSeg = halfD - doorZ - doorWidth / 2;
  const botSeg = halfD - (doorWidth / 2 - doorZ);

  return (
    <group>
      {/* Left wall (exterior) */}
      <WallSegment position={[cx - halfW, y, cz]} size={[WALL_THICKNESS, h, d]} />
      {/* Back wall (exterior) with windows */}
      <WallSegment position={[cx, y, cz - halfD]} size={[w, h, WALL_THICKNESS]} />
      <WindowCutout position={[cx - 4, 4, cz - halfD]} wallAxis="x" />
      <WindowCutout position={[cx + 4, 4, cz - halfD]} wallAxis="x" />
      {/* Front wall removed — dollhouse open view */}
      {/* Right wall — top segment */}
      {topSeg > 0 && (
        <WallSegment position={[cx + halfW, y, cz - halfD + topSeg / 2]} size={[WALL_THICKNESS, h, topSeg]} />
      )}
      {/* Right wall — bottom segment */}
      {botSeg > 0 && (
        <WallSegment position={[cx + halfW, y, cz + halfD - botSeg / 2]} size={[WALL_THICKNESS, h, botSeg]} />
      )}
      {/* Door frame */}
      <DoorFrame position={[cx + halfW, 0, cz + doorZ]} rotation={Math.PI / 2} />
    </group>
  );
}

function WorkspaceWalls() {
  const { center, size } = ROOMS.workspace;
  const [cx, , cz] = center;
  const [w, d] = size;
  const halfW = w / 2;
  const halfD = d / 2;
  const h = WALL_HEIGHT;
  const y = h / 2;

  // Door on left wall
  const doorZ = 5;
  const doorWidth = 3;
  const topSeg = halfD - doorZ - doorWidth / 2;
  const botSeg = halfD - (doorWidth / 2 - doorZ);

  return (
    <group>
      {/* Right wall (exterior) */}
      <WallSegment position={[cx + halfW, y, cz]} size={[WALL_THICKNESS, h, d]} />
      {/* Back wall (exterior) with windows */}
      <WallSegment position={[cx, y, cz - halfD]} size={[w, h, WALL_THICKNESS]} />
      <WindowCutout position={[cx - 18, 4, cz - halfD]} wallAxis="x" />
      <WindowCutout position={[cx - 9, 4, cz - halfD]} wallAxis="x" />
      <WindowCutout position={[cx, 4, cz - halfD]} wallAxis="x" />
      <WindowCutout position={[cx + 9, 4, cz - halfD]} wallAxis="x" />
      <WindowCutout position={[cx + 18, 4, cz - halfD]} wallAxis="x" />
      {/* Front wall removed — dollhouse open view */}
      {/* Left wall — top segment */}
      {topSeg > 0 && (
        <WallSegment position={[cx - halfW, y, cz - halfD + topSeg / 2]} size={[WALL_THICKNESS, h, topSeg]} />
      )}
      {/* Left wall — bottom segment */}
      {botSeg > 0 && (
        <WallSegment position={[cx - halfW, y, cz + halfD - botSeg / 2]} size={[WALL_THICKNESS, h, botSeg]} />
      )}
      {/* Door frame */}
      <DoorFrame position={[cx - halfW, 0, cz + doorZ]} rotation={Math.PI / 2} />
    </group>
  );
}

function HallwayWalls() {
  const { center, size } = ROOMS.hallway;
  const [cx, , cz] = center;
  const [w, d] = size;
  const h = WALL_HEIGHT;
  const y = h / 2;

  return (
    <group>
      {/* Back wall only — front removed for open view */}
      <WallSegment position={[cx, y, cz - d / 2]} size={[w, h, WALL_THICKNESS]} />
    </group>
  );
}

function ManagerOfficeWalls() {
  const { center, size } = ROOMS.managerOffice;
  const [cx, , cz] = center;
  const [w, d] = size;
  const halfW = w / 2;
  const halfD = d / 2;
  const h = WALL_HEIGHT;
  const y = h / 2;

  // Door on left wall
  const doorZ = 3;
  const doorWidth = 3;
  const topSeg = halfD - doorZ - doorWidth / 2;
  const botSeg = halfD - (doorWidth / 2 - doorZ);

  return (
    <group>
      {/* Right wall (exterior) */}
      <WallSegment position={[cx + halfW, y, cz]} size={[WALL_THICKNESS, h, d]} />
      {/* Back wall with window */}
      <WallSegment position={[cx, y, cz - halfD]} size={[w, h, WALL_THICKNESS]} />
      <WindowCutout position={[cx, 4, cz - halfD]} wallAxis="x" />
      {/* Front wall removed — open view */}
      {/* Left wall — top segment */}
      {topSeg > 0 && (
        <WallSegment position={[cx - halfW, y, cz - halfD + topSeg / 2]} size={[WALL_THICKNESS, h, topSeg]} />
      )}
      {/* Left wall — bottom segment */}
      {botSeg > 0 && (
        <WallSegment position={[cx - halfW, y, cz + halfD - botSeg / 2]} size={[WALL_THICKNESS, h, botSeg]} />
      )}
      <DoorFrame position={[cx - halfW, 0, cz + doorZ]} rotation={Math.PI / 2} />
    </group>
  );
}

function RestroomWalls() {
  const { center, size } = ROOMS.restrooms;
  const [cx, , cz] = center;
  const [w, d] = size;
  const halfW = w / 2;
  const halfD = d / 2;
  const h = WALL_HEIGHT;
  const y = h / 2;

  return (
    <group>
      {/* Left wall */}
      <WallSegment position={[cx - halfW, y, cz]} size={[WALL_THICKNESS, h, d]} />
      {/* Back wall */}
      <WallSegment position={[cx, y, cz - halfD]} size={[w, h, WALL_THICKNESS]} />
      {/* Right wall with door gap */}
      <WallSegment position={[cx + halfW, y, cz - halfD + 2]} size={[WALL_THICKNESS, h, 4]} />
      <WallSegment position={[cx + halfW, y, cz + halfD - 2]} size={[WALL_THICKNESS, h, 4]} />
      <DoorFrame position={[cx + halfW, 0, cz]} rotation={Math.PI / 2} />
      {/* Front wall removed — open view */}
    </group>
  );
}

function SouthCorridorWalls() {
  const { center, size } = ROOMS.southCorridor;
  const [cx, , cz] = center;
  const [w, d] = size;
  const h = WALL_HEIGHT;
  const y = h / 2;

  return (
    <group>
      {/* Side walls only */}
      <WallSegment position={[cx - w / 2, y, cz]} size={[WALL_THICKNESS, h, d]} />
      <WallSegment position={[cx + w / 2, y, cz]} size={[WALL_THICKNESS, h, d]} />
    </group>
  );
}

export default function Walls() {
  return (
    <group>
      <BreakRoomWalls />
      <WorkspaceWalls />
      <HallwayWalls />
      <ManagerOfficeWalls />
      <RestroomWalls />
      <SouthCorridorWalls />
    </group>
  );
}
