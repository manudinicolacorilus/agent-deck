import React from 'react';
import { ROOMS } from './coordUtils';

/**
 * Restroom furniture: toilet stalls, sinks with mirrors, hand dryer.
 */

function ToiletStall({ position, mirror = false }) {
  const m = mirror ? -1 : 1;
  return (
    <group position={position}>
      {/* Stall walls */}
      <mesh position={[0, 2, -1.2 * m]} castShadow>
        <boxGeometry args={[2.5, 4, 0.1]} />
        <meshStandardMaterial color="#b8b8b8" />
      </mesh>
      <mesh position={[1.2, 2, 0]}>
        <boxGeometry args={[0.1, 4, 2.5]} />
        <meshStandardMaterial color="#b8b8b8" />
      </mesh>
      {/* Door */}
      <mesh position={[-1.2, 2, 0]}>
        <boxGeometry args={[0.08, 3.5, 2.2]} />
        <meshStandardMaterial color="#c0c0c0" />
      </mesh>
      {/* Door handle */}
      <mesh position={[-1.15, 2, 0.5 * m]}>
        <boxGeometry args={[0.15, 0.06, 0.3]} />
        <meshStandardMaterial color="#999" metalness={0.6} />
      </mesh>
      {/* Toilet */}
      <mesh position={[0.3, 0.9, 0]}>
        <boxGeometry args={[1, 0.8, 1.2]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      {/* Toilet seat */}
      <mesh position={[0.3, 1.35, 0]}>
        <boxGeometry args={[0.9, 0.06, 1]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      {/* Tank */}
      <mesh position={[0.3, 1.6, -0.5 * m]}>
        <boxGeometry args={[0.8, 0.8, 0.3]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      {/* Flush handle */}
      <mesh position={[0.6, 2, -0.45 * m]}>
        <boxGeometry args={[0.15, 0.04, 0.15]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.6} />
      </mesh>
      {/* Toilet paper holder */}
      <mesh position={[1.1, 1.5, 0.3 * m]}>
        <cylinderGeometry args={[0.12, 0.12, 0.3, 8]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
    </group>
  );
}

function SinkArea({ cx, cz, wallZ }) {
  return (
    <group>
      {/* Counter */}
      <mesh position={[cx, 2.2, wallZ + 1]} castShadow>
        <boxGeometry args={[8, 0.15, 2]} />
        <meshStandardMaterial color="#d0d0d0" />
      </mesh>
      {/* Counter base */}
      <mesh position={[cx, 1.1, wallZ + 1]}>
        <boxGeometry args={[7.8, 2, 1.8]} />
        <meshStandardMaterial color="#c0c0c0" />
      </mesh>

      {/* Two sinks */}
      {[-1.8, 1.8].map((dx, i) => (
        <group key={i}>
          {/* Basin */}
          <mesh position={[cx + dx, 2.15, wallZ + 1.2]}>
            <boxGeometry args={[1.4, 0.3, 1]} />
            <meshStandardMaterial color="#e8e8e8" />
          </mesh>
          {/* Faucet */}
          <mesh position={[cx + dx, 2.7, wallZ + 0.5]}>
            <cylinderGeometry args={[0.05, 0.05, 0.6, 6]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.1} />
          </mesh>
          <mesh position={[cx + dx, 2.9, wallZ + 0.8]} rotation={[Math.PI / 3, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.5, 6]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.1} />
          </mesh>

          {/* Mirror */}
          <mesh position={[cx + dx, 4, wallZ + 0.2]}>
            <boxGeometry args={[2, 2.5, 0.08]} />
            <meshStandardMaterial color="#88aacc" metalness={0.7} roughness={0.1} />
          </mesh>
          {/* Mirror frame */}
          <mesh position={[cx + dx, 4, wallZ + 0.15]}>
            <boxGeometry args={[2.2, 2.7, 0.04]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Soap dispensers */}
      {[-1.8, 1.8].map((dx, i) => (
        <mesh key={`soap-${i}`} position={[cx + dx + 0.8, 2.5, wallZ + 0.5]}>
          <boxGeometry args={[0.2, 0.4, 0.15]} />
          <meshStandardMaterial color="#e8e8e8" />
        </mesh>
      ))}
    </group>
  );
}

function HandDryer({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 3, 0]}>
        <boxGeometry args={[1, 1.2, 0.6]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      {/* Nozzle */}
      <mesh position={[0, 2.3, 0.2]}>
        <boxGeometry args={[0.6, 0.15, 0.3]} />
        <meshStandardMaterial color="#ccc" metalness={0.3} />
      </mesh>
    </group>
  );
}

export default function RestroomFurniture() {
  const { center, size } = ROOMS.restrooms;
  const [cx, , cz] = center;
  const wallZ = cz - size[1] / 2;

  return (
    <group>
      {/* Toilet stalls */}
      <ToiletStall position={[cx - 4, 0, cz + 1.5]} />
      <ToiletStall position={[cx + 1, 0, cz + 1.5]} mirror />

      {/* Sinks and mirrors along back wall */}
      <SinkArea cx={cx} cz={cz} wallZ={wallZ} />

      {/* Hand dryer */}
      <HandDryer position={[cx + 5, 0, wallZ + 0.5]} />

      {/* Ceiling light */}
      <pointLight position={[cx, 6, cz]} color="#f0f0ff" intensity={6} distance={12} />

      {/* Wet floor sign (small yellow cone) */}
      <mesh position={[cx - 2, 0.4, cz + 4]}>
        <coneGeometry args={[0.3, 0.8, 8]} />
        <meshStandardMaterial color="#ffcc00" />
      </mesh>
    </group>
  );
}
