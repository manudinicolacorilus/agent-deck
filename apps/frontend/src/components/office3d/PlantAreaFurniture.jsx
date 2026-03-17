import React from 'react';
import { ROOMS } from './coordUtils';

/**
 * Indoor plant/garden area: variety of plants, bench, small water feature, stone path.
 */

function TallPlant({ position, leafColor = '#2d8a4e', potColor = '#6B4C3B' }) {
  return (
    <group position={position}>
      {/* Pot */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.6, 0.45, 1, 10]} />
        <meshStandardMaterial color={potColor} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.02, 0]}>
        <torusGeometry args={[0.6, 0.06, 6, 12]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color={potColor} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.98, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.06, 10]} />
        <meshStandardMaterial color="#3a2815" />
      </mesh>
      {/* Trunk */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 2, 6]} />
        <meshStandardMaterial color="#5a4a2a" />
      </mesh>
      {/* Leaf clusters at top */}
      <mesh position={[0, 3.2, 0]}>
        <sphereGeometry args={[0.9, 10, 10]} />
        <meshStandardMaterial color={leafColor} />
      </mesh>
      <mesh position={[0.4, 3.5, 0.3]}>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial color={leafColor} />
      </mesh>
      <mesh position={[-0.3, 3.4, -0.2]}>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial color={leafColor} />
      </mesh>
    </group>
  );
}

function SmallBush({ position, color = '#3a7a3a' }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.4, 0.3, 0.6, 8]} />
        <meshStandardMaterial color="#7a5a3a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.7, 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.3, 1.1, 0.2]}>
        <sphereGeometry args={[0.4, 6, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function WaterFeature({ position }) {
  return (
    <group position={position}>
      {/* Stone basin */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[1.5, 1.2, 0.8, 12]} />
        <meshStandardMaterial color="#777" roughness={0.9} />
      </mesh>
      {/* Water surface */}
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[1.3, 1.3, 0.04, 12]} />
        <meshStandardMaterial color="#4488aa" transparent opacity={0.6} metalness={0.2} />
      </mesh>
      {/* Center stone column */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 1.2, 8]} />
        <meshStandardMaterial color="#888" roughness={0.8} />
      </mesh>
      {/* Top sphere */}
      <mesh position={[0, 1.9, 0]}>
        <sphereGeometry args={[0.25, 10, 10]} />
        <meshStandardMaterial color="#999" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Water drip effect (small transparent spheres) */}
      {[0.1, 0.4, 0.7].map((dy, i) => (
        <mesh key={i} position={[0.1 * (i - 1), 1.5 - dy, 0.1 * i]}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshStandardMaterial color="#66aacc" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function GardenBench({ position }) {
  return (
    <group position={position}>
      {/* Seat */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[4, 0.15, 1.2]} />
        <meshStandardMaterial color="#8B6914" roughness={0.7} />
      </mesh>
      {/* Seat slats */}
      {[-1.5, -0.5, 0.5, 1.5].map((sx, i) => (
        <mesh key={i} position={[sx, 1.02, 0]}>
          <boxGeometry args={[0.8, 0.06, 1.1]} />
          <meshStandardMaterial color="#9B7424" roughness={0.8} />
        </mesh>
      ))}
      {/* Backrest */}
      <mesh position={[0, 1.8, -0.5]}>
        <boxGeometry args={[4, 1.2, 0.12]} />
        <meshStandardMaterial color="#8B6914" roughness={0.7} />
      </mesh>
      {/* Armrests */}
      <mesh position={[-1.9, 1.4, -0.1]}>
        <boxGeometry args={[0.15, 0.6, 1]} />
        <meshStandardMaterial color="#555" metalness={0.4} />
      </mesh>
      <mesh position={[1.9, 1.4, -0.1]}>
        <boxGeometry args={[0.15, 0.6, 1]} />
        <meshStandardMaterial color="#555" metalness={0.4} />
      </mesh>
      {/* Legs */}
      {[[-1.7, 0.5, 0.4], [1.7, 0.5, 0.4], [-1.7, 0.5, -0.4], [1.7, 0.5, -0.4]].map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.12, 1, 0.12]} />
          <meshStandardMaterial color="#555" metalness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function SteppingStones({ cx, cz }) {
  const stones = [
    [cx - 3, cz - 2], [cx - 1, cz - 1.5], [cx + 1, cz - 2.5],
    [cx + 3, cz - 1], [cx + 5, cz - 2],
  ];
  return (
    <group>
      {stones.map(([sx, sz], i) => (
        <mesh key={i} position={[sx, 0.04, sz]} rotation={[-Math.PI / 2, 0, i * 0.5]}>
          <circleGeometry args={[0.5 + (i % 2) * 0.15, 8]} />
          <meshStandardMaterial color="#888" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

export default function PlantAreaFurniture() {
  const { center, size } = ROOMS.plantArea;
  const [cx, , cz] = center;

  return (
    <group>
      {/* Tall plants */}
      <TallPlant position={[cx - 5, 0, cz - 2]} leafColor="#2d8a4e" />
      <TallPlant position={[cx + 5, 0, cz - 3]} leafColor="#1a6b3a" potColor="#8B5E3C" />
      <TallPlant position={[cx - 2, 0, cz + 3]} leafColor="#4a8c5c" potColor="#5a3a2a" />
      <TallPlant position={[cx + 6, 0, cz + 2]} leafColor="#2ea043" />

      {/* Small bushes */}
      <SmallBush position={[cx - 6, 0, cz + 1]} color="#3a8a3a" />
      <SmallBush position={[cx + 2, 0, cz - 4]} color="#2a7a2a" />
      <SmallBush position={[cx - 3, 0, cz + 4]} color="#4a9a4a" />
      <SmallBush position={[cx + 4, 0, cz + 4]} color="#3a7a3a" />

      {/* Water feature */}
      <WaterFeature position={[cx, 0, cz]} />

      {/* Bench */}
      <GardenBench position={[cx + 3, 0, cz + 1]} />

      {/* Stepping stones */}
      <SteppingStones cx={cx} cz={cz} />

      {/* Warm overhead light */}
      <pointLight position={[cx, 6, cz]} color="#ffe8c0" intensity={6} distance={15} />

      {/* Subtle green uplights */}
      <pointLight position={[cx - 4, 0.5, cz]} color="#88cc88" intensity={2} distance={6} />
      <pointLight position={[cx + 4, 0.5, cz]} color="#88cc88" intensity={2} distance={6} />
    </group>
  );
}
