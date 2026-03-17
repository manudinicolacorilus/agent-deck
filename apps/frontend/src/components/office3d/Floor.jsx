import React from 'react';
import { ROOMS, map2Dto3D } from './coordUtils';

/**
 * Room-specific floors: warm wood for break room, cool tiles for workspace,
 * stone pattern for hallway, grass-like exterior.
 */

function RoomFloor({ center, size, color, y = 0.01 }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[center[0], y, center[2]]} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Tile pattern floor — alternating colored squares
function TiledFloor({ center, size, color1, color2, tileSize = 4 }) {
  const tiles = [];
  const [w, d] = size;
  const cols = Math.ceil(w / tileSize);
  const rows = Math.ceil(d / tileSize);
  const startX = center[0] - w / 2 + tileSize / 2;
  const startZ = center[2] - d / 2 + tileSize / 2;

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const isEven = (c + r) % 2 === 0;
      tiles.push(
        <mesh
          key={`${c}-${r}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[startX + c * tileSize, 0.02, startZ + r * tileSize]}
          receiveShadow
        >
          <planeGeometry args={[tileSize - 0.1, tileSize - 0.1]} />
          <meshStandardMaterial color={isEven ? color1 : color2} />
        </mesh>
      );
    }
  }
  return <group>{tiles}</group>;
}

// Wood plank floor
function WoodFloor({ center, size }) {
  const planks = [];
  const [w, d] = size;
  const plankW = 2;
  const cols = Math.ceil(w / plankW);
  const startX = center[0] - w / 2 + plankW / 2;

  for (let c = 0; c < cols; c++) {
    const shade = c % 3 === 0 ? '#8B6914' : c % 3 === 1 ? '#9B7424' : '#7A5C10';
    planks.push(
      <mesh
        key={c}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[startX + c * plankW, 0.02, center[2]]}
        receiveShadow
      >
        <planeGeometry args={[plankW - 0.08, d - 0.1]} />
        <meshStandardMaterial color={shade} roughness={0.8} />
      </mesh>
    );
  }
  return <group>{planks}</group>;
}

export default function Floor() {
  const br = ROOMS.breakRoom;
  const ws = ROOMS.workspace;
  const hw = ROOMS.hallway;

  return (
    <group>
      {/* Base ground — green grass everywhere outside */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -5]} receiveShadow>
        <planeGeometry args={[250, 140]} />
        <meshStandardMaterial color="#3a6b2a" roughness={1} />
      </mesh>
      {/* Slightly varied grass patches for texture */}
      {[
        [-40, -8, 30, 20], [30, -10, 25, 18], [-50, 30, 20, 15],
        [45, 25, 18, 12], [-20, -40, 35, 15], [20, -45, 30, 12],
      ].map(([gx, gz, gw, gd], i) => (
        <mesh key={`grass${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[gx, -0.015, gz]} receiveShadow>
          <planeGeometry args={[gw, gd]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#356828' : '#407530'} roughness={1} />
        </mesh>
      ))}

      {/* Concrete sidewalk around building perimeter */}
      {/* Front walkway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2, 0.005, 26]} receiveShadow>
        <planeGeometry args={[130, 3]} />
        <meshStandardMaterial color="#a8a098" roughness={0.85} />
      </mesh>
      {/* Left walkway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-63, 0.005, 0]} receiveShadow>
        <planeGeometry args={[3, 55]} />
        <meshStandardMaterial color="#a8a098" roughness={0.85} />
      </mesh>
      {/* Right walkway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[58, 0.005, 0]} receiveShadow>
        <planeGeometry args={[3, 55]} />
        <meshStandardMaterial color="#a8a098" roughness={0.85} />
      </mesh>
      {/* Path from building to parking */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2, 0.005, -19]} receiveShadow>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color="#a8a098" roughness={0.85} />
      </mesh>
      {/* Walkway along back of building */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2, 0.005, -17]} receiveShadow>
        <planeGeometry args={[130, 2]} />
        <meshStandardMaterial color="#a8a098" roughness={0.85} />
      </mesh>

      {/* Building foundation slab (slightly raised concrete under entire building) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2, 0.008, 4]} receiveShadow>
        <planeGeometry args={[128, 44]} />
        <meshStandardMaterial color="#d0ccc4" roughness={0.8} />
      </mesh>

      {/* Break room — warm wood planks */}
      <WoodFloor center={br.center} size={br.size} />

      {/* Break room rug under couch area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[map2Dto3D(120, 290)[0], 0.03, map2Dto3D(120, 290)[2]]} receiveShadow>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#5c3a1e" roughness={1} />
      </mesh>

      {/* Workspace — checkerboard tiles */}
      <TiledFloor center={ws.center} size={ws.size} color1="#2a3040" color2="#242b38" tileSize={3.5} />

      {/* Hallway — stone tiles */}
      <TiledFloor center={hw.center} size={hw.size} color1="#3a3a3a" color2="#333333" tileSize={3} />

      {/* Manager office — dark wood */}
      <WoodFloor center={ROOMS.managerOffice.center} size={ROOMS.managerOffice.size} />

      {/* Manager office rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ROOMS.managerOffice.center[0], 0.03, ROOMS.managerOffice.center[2]]} receiveShadow>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#2a1a3a" roughness={1} />
      </mesh>

      {/* Restrooms — white tiles */}
      <TiledFloor center={ROOMS.restrooms.center} size={ROOMS.restrooms.size} color1="#d8d8d8" color2="#c8c8c8" tileSize={2} />

      {/* South corridor — stone tiles */}
      <TiledFloor center={ROOMS.southCorridor.center} size={ROOMS.southCorridor.size} color1="#3a3a3a" color2="#333333" tileSize={3} />
    </group>
  );
}
