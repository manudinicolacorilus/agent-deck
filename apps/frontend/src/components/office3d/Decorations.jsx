import React from 'react';
import { ROOMS, map2Dto3D } from './coordUtils';

/**
 * Office decorations: whiteboard, printer, coat rack,
 * workspace ceiling lights, wall posters, trash cans, rug.
 */

function Whiteboard() {
  const ws = ROOMS.workspace.center;
  const wallZ = ws[2] - ROOMS.workspace.size[1] / 2;
  return (
    <group position={[ws[0] + 10, 3.5, wallZ + 0.4]}>
      {/* Board frame */}
      <mesh>
        <boxGeometry args={[8, 4, 0.15]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>
      {/* Writing surface */}
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[7.4, 3.4]} />
        <meshStandardMaterial color="#f8f8f8" />
      </mesh>
      {/* Marker tray */}
      <mesh position={[0, -2.1, 0.2]}>
        <boxGeometry args={[5, 0.2, 0.4]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
      {/* Markers */}
      {[-1.5, -0.5, 0.5, 1.5].map((mx, i) => (
        <mesh key={i} position={[mx, -2, 0.35]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.6, 6]} />
          <meshStandardMaterial color={['#e74c3c', '#2980b9', '#27ae60', '#111'][i]} />
        </mesh>
      ))}
      {/* Some "writing" — subtle colored lines */}
      {[0.8, 0.2, -0.4, -1].map((ly, i) => (
        <mesh key={i} position={[-1 + i * 0.3, ly, 0.09]}>
          <boxGeometry args={[3 + Math.random() * 3, 0.08, 0.01]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#2980b9' : '#e74c3c'} transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Printer() {
  const [x, , z] = map2Dto3D(1100, 300);
  return (
    <group position={[x, 0, z]}>
      {/* Stand */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[2.5, 2, 2]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      {/* Printer body */}
      <mesh position={[0, 2.3, 0]} castShadow>
        <boxGeometry args={[3, 0.8, 2.5]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      {/* Paper tray */}
      <mesh position={[0, 2.75, 0.5]}>
        <boxGeometry args={[2, 0.05, 1.2]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      {/* Status light */}
      <mesh position={[1, 2.75, -1]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color="#3fb950" emissive="#3fb950" emissiveIntensity={0.8} />
      </mesh>
      {/* Display */}
      <mesh position={[0, 2.75, -1.26]}>
        <planeGeometry args={[1.2, 0.4]} />
        <meshStandardMaterial color="#222" emissive="#335577" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

function CoatRack() {
  const [x, , z] = map2Dto3D(230, 120);
  return (
    <group position={[x, 0, z]}>
      {/* Pole */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 5, 8]} />
        <meshStandardMaterial color="#5a4a32" />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.1, 12]} />
        <meshStandardMaterial color="#5a4a32" />
      </mesh>
      {/* Hooks */}
      {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 0.3, 4.5, Math.sin(angle) * 0.3]} rotation={[0, angle, Math.PI / 4]}>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 4]} />
          <meshStandardMaterial color="#888" metalness={0.5} />
        </mesh>
      ))}
      {/* A jacket hanging */}
      <mesh position={[0.4, 3.8, 0]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.6, 1.2, 0.3]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
    </group>
  );
}

function TrashCan({ x2D, y2D }) {
  const [x, , z] = map2Dto3D(x2D, y2D);
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.4, 0.35, 1, 10]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      {/* Rim */}
      <mesh position={[0, 1.02, 0]}>
        <torusGeometry args={[0.4, 0.04, 6, 12]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#666" metalness={0.3} />
      </mesh>
    </group>
  );
}

function FluorescentLight({ position }) {
  return (
    <group position={position}>
      {/* Fixture housing */}
      <mesh>
        <boxGeometry args={[6, 0.15, 1.2]} />
        <meshStandardMaterial color="#ddd" />
      </mesh>
      {/* Light panel */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[5.5, 0.05, 0.9]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ddeeff"
          emissiveIntensity={0.8}
        />
      </mesh>
      {/* Actual light */}
      <pointLight position={[0, -0.5, 0]} color="#eef4ff" intensity={6} distance={15} />
    </group>
  );
}

function WallPoster({ position, color, rotation = 0 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Frame */}
      <mesh>
        <boxGeometry args={[2.5, 3, 0.1]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Art */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[2.1, 2.6]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

export default function Decorations() {
  const ws = ROOMS.workspace.center;
  const br = ROOMS.breakRoom.center;

  return (
    <group>
      <Whiteboard />
      <Printer />
      <CoatRack />

      {/* Trash cans */}
      <TrashCan x2D={210} y2D={350} />
      <TrashCan x2D={1140} y2D={350} />

      {/* Workspace ceiling lights */}
      <FluorescentLight position={[ws[0] - 15, 6.9, ws[2] - 5]} />
      <FluorescentLight position={[ws[0], 6.9, ws[2] - 5]} />
      <FluorescentLight position={[ws[0] + 15, 6.9, ws[2] - 5]} />
      <FluorescentLight position={[ws[0] - 15, 6.9, ws[2] + 5]} />
      <FluorescentLight position={[ws[0], 6.9, ws[2] + 5]} />
      <FluorescentLight position={[ws[0] + 15, 6.9, ws[2] + 5]} />

      {/* Wall posters in break room */}
      <WallPoster
        position={[br[0] - ROOMS.breakRoom.size[0] / 2 + 0.3, 4, br[2] + 3]}
        color="#e74c3c"
        rotation={Math.PI / 2}
      />
      <WallPoster
        position={[br[0] - ROOMS.breakRoom.size[0] / 2 + 0.3, 4, br[2] - 5]}
        color="#3498db"
        rotation={Math.PI / 2}
      />
    </group>
  );
}
