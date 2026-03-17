import React from 'react';
import { map2Dto3D, ROOMS } from './coordUtils';

/**
 * Richly detailed break room furniture: espresso machine, water cooler,
 * L-shaped couch with pillows, coffee table, bookshelf, wall clock,
 * vending machine, potted plants with detail, ceiling lights.
 */

function EspressoMachine() {
  const [x, , z] = map2Dto3D(70, 160);
  return (
    <group position={[x, 0, z]}>
      {/* Counter surface */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <boxGeometry args={[4, 0.2, 2.5]} />
        <meshStandardMaterial color="#4a3728" roughness={0.5} />
      </mesh>
      {/* Counter base */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[3.8, 2.2, 2.3]} />
        <meshStandardMaterial color="#5a4738" roughness={0.8} />
      </mesh>
      {/* Cabinet doors */}
      <mesh position={[-0.8, 1.1, 1.16]}>
        <boxGeometry args={[1.6, 1.8, 0.05]} />
        <meshStandardMaterial color="#4a3728" roughness={0.6} />
      </mesh>
      <mesh position={[0.8, 1.1, 1.16]}>
        <boxGeometry args={[1.6, 1.8, 0.05]} />
        <meshStandardMaterial color="#4a3728" roughness={0.6} />
      </mesh>
      {/* Door knobs */}
      <mesh position={[-0.15, 1.1, 1.2]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#c0a060" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.15, 1.1, 1.2]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#c0a060" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Espresso machine body */}
      <mesh position={[0, 3.2, -0.2]} castShadow>
        <boxGeometry args={[2.2, 1.8, 1.8]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* Chrome top */}
      <mesh position={[0, 4.2, -0.2]}>
        <boxGeometry args={[2.3, 0.15, 1.9]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Display panel */}
      <mesh position={[0, 3.5, 0.71]}>
        <planeGeometry args={[1, 0.5]} />
        <meshStandardMaterial color="#3fb950" emissive="#3fb950" emissiveIntensity={0.6} />
      </mesh>
      {/* Buttons */}
      {[-0.3, 0, 0.3].map((bx, i) => (
        <mesh key={i} position={[bx, 3, 0.72]}>
          <cylinderGeometry args={[0.08, 0.08, 0.05, 8]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#555555" metalness={0.5} />
        </mesh>
      ))}
      {/* Drip tray */}
      <mesh position={[0, 2.35, 0.4]}>
        <boxGeometry args={[1.4, 0.1, 0.8]} />
        <meshStandardMaterial color="#333333" metalness={0.4} />
      </mesh>
      {/* Coffee cup */}
      <mesh position={[0, 2.6, 0.4]}>
        <cylinderGeometry args={[0.25, 0.2, 0.5, 12]} />
        <meshStandardMaterial color="#f5f5f0" />
      </mesh>
      {/* Cup handle */}
      <mesh position={[0.3, 2.65, 0.4]}>
        <torusGeometry args={[0.1, 0.03, 8, 12, Math.PI]} />
        <meshStandardMaterial color="#f5f5f0" />
      </mesh>
      {/* Steam wisps */}
      {[0, 0.15, -0.1].map((sx, i) => (
        <mesh key={i} position={[sx, 3.0 + i * 0.25, 0.4 + i * 0.05]}>
          <sphereGeometry args={[0.08 + i * 0.02, 6, 6]} />
          <meshStandardMaterial color="#cccccc" transparent opacity={0.25 - i * 0.06} />
        </mesh>
      ))}
    </group>
  );
}

function WaterCooler() {
  const [x, , z] = map2Dto3D(155, 160);
  return (
    <group position={[x, 0, z]}>
      {/* Stand body */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[1.6, 2.4, 1.4]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>
      {/* Front panel */}
      <mesh position={[0, 1.2, 0.71]}>
        <planeGeometry args={[1.4, 2.2]} />
        <meshStandardMaterial color="#d0d0d0" />
      </mesh>
      {/* Hot/cold taps */}
      <mesh position={[-0.3, 1.4, 0.75]}>
        <boxGeometry args={[0.15, 0.1, 0.15]} />
        <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.3, 1.4, 0.75]}>
        <boxGeometry args={[0.15, 0.1, 0.15]} />
        <meshStandardMaterial color="#4488ff" emissive="#4488ff" emissiveIntensity={0.3} />
      </mesh>
      {/* Cup holder */}
      <mesh position={[0, 0.8, 0.75]}>
        <boxGeometry args={[0.8, 0.05, 0.3]} />
        <meshStandardMaterial color="#999999" metalness={0.5} />
      </mesh>
      {/* Water bottle (big blue inverted) */}
      <mesh position={[0, 3.3, 0]}>
        <cylinderGeometry args={[0.55, 0.65, 2.2, 12]} />
        <meshStandardMaterial color="#58a6ff" transparent opacity={0.3} />
      </mesh>
      {/* Water level inside bottle */}
      <mesh position={[0, 3.0, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 1.5, 12]} />
        <meshStandardMaterial color="#3388dd" transparent opacity={0.15} />
      </mesh>
      {/* Bottle cap at bottom (on dispenser) */}
      <mesh position={[0, 2.18, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.15, 12]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
    </group>
  );
}

function LShapeCouch() {
  const [x, , z] = map2Dto3D(120, 300);
  return (
    <group position={[x, 0, z]}>
      {/* Main seat */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[7, 0.6, 2.8]} />
        <meshStandardMaterial color="#6B4C3B" roughness={0.85} />
      </mesh>
      {/* Back cushions */}
      <mesh position={[0, 1.5, -1.1]} castShadow>
        <boxGeometry args={[7, 1.2, 0.6]} />
        <meshStandardMaterial color="#5D3E2E" roughness={0.9} />
      </mesh>
      {/* Left arm section (L part) */}
      <mesh position={[-3.2, 0.7, -2.5]} castShadow>
        <boxGeometry args={[1.2, 0.6, 2.5]} />
        <meshStandardMaterial color="#6B4C3B" roughness={0.85} />
      </mesh>
      <mesh position={[-3.2, 1.5, -3.5]}>
        <boxGeometry args={[1.2, 1.2, 0.6]} />
        <meshStandardMaterial color="#5D3E2E" roughness={0.9} />
      </mesh>
      {/* Left armrest */}
      <mesh position={[-3.7, 1.2, -1]}>
        <boxGeometry args={[0.4, 1, 4.5]} />
        <meshStandardMaterial color="#5D3E2E" />
      </mesh>
      {/* Right armrest */}
      <mesh position={[3.7, 1.2, 0]}>
        <boxGeometry args={[0.4, 1, 2.8]} />
        <meshStandardMaterial color="#5D3E2E" />
      </mesh>
      {/* Seat cushions (3 visible) */}
      {[-2, 0, 2].map((cx, i) => (
        <mesh key={i} position={[cx, 1.05, 0]}>
          <boxGeometry args={[2, 0.12, 2.4]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#7B5C4B' : '#6B4C3B'} roughness={0.95} />
        </mesh>
      ))}
      {/* Throw pillows */}
      <mesh position={[-2.8, 1.5, 0.3]} rotation={[0, 0, 0.15]}>
        <boxGeometry args={[0.8, 0.8, 0.3]} />
        <meshStandardMaterial color="#C4956A" />
      </mesh>
      <mesh position={[2.5, 1.5, -0.2]} rotation={[0, 0.3, -0.1]}>
        <boxGeometry args={[0.8, 0.8, 0.3]} />
        <meshStandardMaterial color="#8B6B4A" />
      </mesh>
      {/* Couch legs */}
      {[[-3.3, 0.15, 1.1], [3.3, 0.15, 1.1], [-3.3, 0.15, -1.1], [3.3, 0.15, -1.1]].map((p, i) => (
        <mesh key={i} position={p}>
          <cylinderGeometry args={[0.12, 0.12, 0.3, 6]} />
          <meshStandardMaterial color="#3a2a1a" />
        </mesh>
      ))}
    </group>
  );
}

function CoffeeTable() {
  const [x, , z] = map2Dto3D(120, 270);
  return (
    <group position={[x, 0, z]}>
      {/* Table top */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[4, 0.15, 2]} />
        <meshStandardMaterial color="#5a4a32" roughness={0.5} />
      </mesh>
      {/* Legs */}
      {[[-1.7, 0.45, -0.7], [1.7, 0.45, -0.7], [-1.7, 0.45, 0.7], [1.7, 0.45, 0.7]].map((p, i) => (
        <mesh key={i} position={p}>
          <cylinderGeometry args={[0.08, 0.1, 0.9, 6]} />
          <meshStandardMaterial color="#3a2a1a" />
        </mesh>
      ))}
      {/* Magazine on table */}
      <mesh position={[0.5, 1.12, 0.2]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[1.2, 0.03, 0.8]} />
        <meshStandardMaterial color="#d4a574" />
      </mesh>
      {/* Mug on table */}
      <mesh position={[-1, 1.2, -0.3]}>
        <cylinderGeometry args={[0.2, 0.18, 0.3, 10]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function Bookshelf() {
  const [x, , z] = map2Dto3D(50, 130);
  return (
    <group position={[x, 0, z]}>
      {/* Frame */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[3.5, 5, 1.2]} />
        <meshStandardMaterial color="#5a4a32" roughness={0.7} />
      </mesh>
      {/* Shelves */}
      {[1, 2.2, 3.4].map((sy, i) => (
        <mesh key={i} position={[0, sy, 0]}>
          <boxGeometry args={[3.3, 0.12, 1.1]} />
          <meshStandardMaterial color="#4a3a22" />
        </mesh>
      ))}
      {/* Books (colored blocks per shelf) */}
      {[
        { y: 1.5, colors: ['#c0392b', '#2980b9', '#27ae60', '#f39c12', '#8e44ad'] },
        { y: 2.7, colors: ['#d35400', '#16a085', '#2c3e50', '#e74c3c'] },
        { y: 3.9, colors: ['#3498db', '#e67e22', '#1abc9c', '#9b59b6', '#34495e'] },
      ].map(({ y, colors }, si) => (
        <group key={si}>
          {colors.map((c, bi) => (
            <mesh key={bi} position={[-1.3 + bi * 0.65, y, 0]}>
              <boxGeometry args={[0.5, 0.9 + Math.random() * 0.2, 0.8]} />
              <meshStandardMaterial color={c} roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function WallClock() {
  // Position on break room back wall
  const [cx, , cz] = ROOMS.breakRoom.center;
  return (
    <group position={[cx, 5.5, cz - ROOMS.breakRoom.size[1] / 2 + 0.3]}>
      {/* Clock face */}
      <mesh>
        <cylinderGeometry args={[0.9, 0.9, 0.15, 24]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Rim */}
      <mesh>
        <torusGeometry args={[0.9, 0.08, 8, 24]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#333333" metalness={0.6} />
      </mesh>
      {/* Hour hand */}
      <mesh position={[0, 0.2, 0.1]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.06, 0.5, 0.02]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Minute hand */}
      <mesh position={[0.15, 0.15, 0.1]} rotation={[0, 0, -1.2]}>
        <boxGeometry args={[0.04, 0.7, 0.02]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  );
}

function VendingMachine() {
  const [x, , z] = map2Dto3D(40, 200);
  return (
    <group position={[x, 0, z]}>
      {/* Body */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[2.5, 5, 2]} />
        <meshStandardMaterial color="#cc3333" roughness={0.6} />
      </mesh>
      {/* Glass front */}
      <mesh position={[0, 3, 1.01]}>
        <planeGeometry args={[2, 3]} />
        <meshStandardMaterial color="#1a3050" metalness={0.2} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* Items inside (rows of colored cylinders) */}
      {[0, 1, 2].map((row) =>
        [-0.5, 0, 0.5].map((col, ci) => (
          <mesh key={`${row}-${ci}`} position={[col, 2.3 + row * 0.8, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.4, 8]} />
            <meshStandardMaterial color={['#ff6633', '#33cc66', '#3366ff'][ci]} />
          </mesh>
        ))
      )}
      {/* Coin slot */}
      <mesh position={[0.8, 2.5, 1.02]}>
        <boxGeometry args={[0.3, 0.5, 0.05]} />
        <meshStandardMaterial color="#666" metalness={0.5} />
      </mesh>
      {/* Pickup slot */}
      <mesh position={[0, 0.8, 1.02]}>
        <boxGeometry args={[1.5, 0.6, 0.05]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  );
}

function FancyPlant({ x2D, y2D, scale = 1, variant = 0 }) {
  const [x, , z] = map2Dto3D(x2D, y2D);
  const leafColors = [
    ['#2d8a4e', '#3fb950', '#46d569'],
    ['#1a6b3a', '#2ea043', '#3fb950'],
    ['#4a8c5c', '#5aaa6a', '#6cc07a'],
  ];
  const colors = leafColors[variant % 3];

  return (
    <group position={[x, 0, z]} scale={[scale, scale, scale]}>
      {/* Decorative pot */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.55, 0.4, 0.9, 10]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.8} />
      </mesh>
      {/* Pot rim */}
      <mesh position={[0, 0.92, 0]}>
        <torusGeometry args={[0.55, 0.06, 6, 12]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#7A4E2D" />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.88, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.06, 10]} />
        <meshStandardMaterial color="#3a2815" />
      </mesh>
      {/* Stem */}
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 1, 6]} />
        <meshStandardMaterial color="#3a6b2a" />
      </mesh>
      {/* Leaf clusters */}
      <mesh position={[0, 1.9, 0]}>
        <sphereGeometry args={[0.7, 10, 10]} />
        <meshStandardMaterial color={colors[0]} />
      </mesh>
      <mesh position={[0.35, 2.2, 0.2]}>
        <sphereGeometry args={[0.45, 8, 8]} />
        <meshStandardMaterial color={colors[1]} />
      </mesh>
      <mesh position={[-0.25, 2.15, -0.25]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color={colors[2]} />
      </mesh>
      <mesh position={[0.1, 2.4, -0.15]}>
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshStandardMaterial color={colors[0]} />
      </mesh>
    </group>
  );
}

function FoosballTable() {
  const [x, , z] = map2Dto3D(75, 260);
  return (
    <group position={[x, 0, z]}>
      {/* Table body */}
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[5.5, 0.25, 3]} />
        <meshStandardMaterial color="#2d5a1e" roughness={0.6} />
      </mesh>
      {/* Playing field (green) */}
      <mesh position={[0, 2.14, 0]}>
        <planeGeometry args={[5, 2.5]} />
        <meshStandardMaterial color="#3a8c28" roughness={0.9} rotation={[-Math.PI / 2, 0, 0]} />
      </mesh>
      <mesh position={[0, 2.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 2.5]} />
        <meshStandardMaterial color="#3a8c28" roughness={0.9} />
      </mesh>
      {/* Side walls */}
      <mesh position={[0, 2.6, -1.5]} castShadow>
        <boxGeometry args={[5.5, 0.95, 0.15]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.6, 1.5]} castShadow>
        <boxGeometry args={[5.5, 0.95, 0.15]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.7} />
      </mesh>
      <mesh position={[-2.75, 2.6, 0]}>
        <boxGeometry args={[0.15, 0.95, 3]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.7} />
      </mesh>
      <mesh position={[2.75, 2.6, 0]}>
        <boxGeometry args={[0.15, 0.95, 3]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.7} />
      </mesh>
      {/* Legs */}
      {[[-2.4, 1, -1.2], [2.4, 1, -1.2], [-2.4, 1, 1.2], [2.4, 1, 1.2]].map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.3, 2, 0.3]} />
          <meshStandardMaterial color="#3a2a1a" roughness={0.7} />
        </mesh>
      ))}
      {/* Rods (4 across) */}
      {[-1.5, -0.5, 0.5, 1.5].map((rx, i) => (
        <group key={i}>
          <mesh position={[rx, 2.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 3.4, 6]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Handles */}
          <mesh position={[rx, 2.7, -1.8]}>
            <cylinderGeometry args={[0.08, 0.08, 0.4, 8]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          <mesh position={[rx, 2.7, 1.8]}>
            <cylinderGeometry args={[0.08, 0.08, 0.4, 8]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          {/* Players on rods */}
          {(i % 2 === 0 ? [-0.6, 0.6] : [-0.8, 0, 0.8]).map((pz, pi) => (
            <mesh key={pi} position={[rx, 2.5, pz]}>
              <boxGeometry args={[0.15, 0.4, 0.25]} />
              <meshStandardMaterial color={i < 2 ? '#cc3333' : '#3333cc'} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Ball */}
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Score counters */}
      <mesh position={[0, 3.15, -1.55]}>
        <boxGeometry args={[1.2, 0.15, 0.08]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}

function DiningTable() {
  const [x, , z] = map2Dto3D(175, 310);
  return (
    <group position={[x, 0, z]}>
      {/* Round table top */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <cylinderGeometry args={[2.5, 2.5, 0.15, 16]} />
        <meshStandardMaterial color="#C4A882" roughness={0.5} />
      </mesh>
      {/* Central pedestal */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 1.8, 8]} />
        <meshStandardMaterial color="#5a4a32" roughness={0.7} />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.1, 12]} />
        <meshStandardMaterial color="#5a4a32" roughness={0.7} />
      </mesh>
      {/* Chairs (4 around the table) */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => {
        const cx = Math.cos(angle) * 3.2;
        const cz = Math.sin(angle) * 3.2;
        return (
          <group key={i} position={[cx, 0, cz]} rotation={[0, -angle + Math.PI, 0]}>
            {/* Seat */}
            <mesh position={[0, 1.1, 0]} castShadow>
              <boxGeometry args={[1.2, 0.12, 1.2]} />
              <meshStandardMaterial color="#6B4C3B" roughness={0.8} />
            </mesh>
            {/* Backrest */}
            <mesh position={[0, 1.8, -0.55]}>
              <boxGeometry args={[1.1, 1.2, 0.1]} />
              <meshStandardMaterial color="#5D3E2E" roughness={0.8} />
            </mesh>
            {/* Legs */}
            {[[-0.45, 0.5, -0.45], [0.45, 0.5, -0.45], [-0.45, 0.5, 0.45], [0.45, 0.5, 0.45]].map((lp, li) => (
              <mesh key={li} position={lp}>
                <cylinderGeometry args={[0.05, 0.05, 1, 6]} />
                <meshStandardMaterial color="#3a2a1a" />
              </mesh>
            ))}
          </group>
        );
      })}
      {/* Cards on table */}
      {[[-0.4, 0.1], [0.2, -0.3], [0.5, 0.4]].map(([cx, cz], i) => (
        <mesh key={i} position={[cx, 1.9, cz]} rotation={[-Math.PI / 2, 0, i * 0.8]}>
          <planeGeometry args={[0.5, 0.7]} />
          <meshStandardMaterial color="#f5f0e8" />
        </mesh>
      ))}
      {/* Plate */}
      <mesh position={[-0.8, 1.9, -0.6]}>
        <cylinderGeometry args={[0.5, 0.5, 0.04, 12]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      {/* Cup */}
      <mesh position={[0.9, 1.95, 0.7]}>
        <cylinderGeometry args={[0.15, 0.12, 0.25, 8]} />
        <meshStandardMaterial color="#e8e0d0" />
      </mesh>
    </group>
  );
}

function CeilingLight({ position }) {
  return (
    <group position={position}>
      {/* Fixture base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.15, 12]} />
        <meshStandardMaterial color="#ccc" metalness={0.5} />
      </mesh>
      {/* Hanging rod */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.7, 6]} />
        <meshStandardMaterial color="#999" metalness={0.4} />
      </mesh>
      {/* Lamp shade */}
      <mesh position={[0, -0.9, 0]}>
        <cylinderGeometry args={[0.6, 1, 0.6, 12, 1, true]} />
        <meshStandardMaterial color="#f5e6c8" transparent opacity={0.7} side={2} />
      </mesh>
      {/* Bulb glow */}
      <mesh position={[0, -0.8, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#fff5d0" emissive="#fff5d0" emissiveIntensity={1} />
      </mesh>
      {/* Point light from fixture */}
      <pointLight position={[0, -0.8, 0]} color="#fff0d0" intensity={4} distance={12} />
    </group>
  );
}

export default function BreakRoomFurniture() {
  const br = ROOMS.breakRoom.center;

  return (
    <group>
      <EspressoMachine />
      <WaterCooler />
      <LShapeCouch />
      <CoffeeTable />
      <FoosballTable />
      <DiningTable />
      <Bookshelf />
      <WallClock />
      <VendingMachine />

      {/* Plants */}
      <FancyPlant x2D={200} y2D={135} scale={0.9} variant={0} />
      <FancyPlant x2D={35} y2D={345} scale={0.8} variant={1} />
      <FancyPlant x2D={480} y2D={105} scale={0.8} variant={2} />
      <FancyPlant x2D={1130} y2D={105} scale={0.85} variant={0} />

      {/* Ceiling lights in break room */}
      <CeilingLight position={[br[0] - 3, 7, br[2] - 4]} />
      <CeilingLight position={[br[0] + 3, 7, br[2] + 4]} />
    </group>
  );
}
