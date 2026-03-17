import React, { useRef, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { ACTIVITY_COLORS } from './coordUtils';

/**
 * Visual content rendered directly on the monitor screen surface.
 * Uses small meshes to represent code lines, terminal output, etc.
 */
function ScreenContent({ activity, color, position }) {
  const cursorRef = useRef();

  // Blink cursor for terminal/editing
  useFrame((state) => {
    if (cursorRef.current) {
      cursorRef.current.visible = Math.sin(state.clock.elapsedTime * 4) > 0;
    }
  });

  const [px, py, pz] = position;

  if (activity === 'editing') {
    // Code lines — small colored bars at varying widths
    return (
      <group position={[px, py, pz]}>
        {[0.4, 0.22, 0.04, -0.14, -0.32, -0.5].map((ly, i) => (
          <mesh key={i} position={[-0.3 + (i % 3) * 0.15, ly, 0.005]}>
            <planeGeometry args={[0.6 + (i % 4) * 0.25, 0.08]} />
            <meshBasicMaterial color={i % 3 === 0 ? '#58a6ff' : i % 3 === 1 ? color : '#8b949e'} />
          </mesh>
        ))}
        {/* Blinking cursor */}
        <mesh ref={cursorRef} position={[0.3, -0.5, 0.005]}>
          <planeGeometry args={[0.06, 0.12]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
    );
  }

  if (activity === 'running_command') {
    // Terminal lines + blinking cursor
    return (
      <group position={[px, py, pz]}>
        {[0.4, 0.2, 0].map((ly, i) => (
          <mesh key={i} position={[-0.2, ly, 0.005]}>
            <planeGeometry args={[1.2 - i * 0.3, 0.07]} />
            <meshBasicMaterial color={i === 0 ? '#8b949e' : color} />
          </mesh>
        ))}
        <mesh ref={cursorRef} position={[-0.7, -0.2, 0.005]}>
          <planeGeometry args={[0.5, 0.08]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
    );
  }

  if (activity === 'thinking') {
    // Three pulsing dots
    return (
      <group position={[px, py, pz]}>
        {[-0.2, 0, 0.2].map((dx, i) => (
          <mesh key={i} position={[dx, 0, 0.005]}>
            <circleGeometry args={[0.08, 12]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
    );
  }

  if (activity === 'reading') {
    // Text-like horizontal lines
    return (
      <group position={[px, py, pz]}>
        {[0.4, 0.25, 0.1, -0.05, -0.2, -0.35, -0.5].map((ly, i) => (
          <mesh key={i} position={[0, ly, 0.005]}>
            <planeGeometry args={[1.6 - (i % 3) * 0.3, 0.06]} />
            <meshBasicMaterial color={i < 2 ? color : '#6e7681'} />
          </mesh>
        ))}
      </group>
    );
  }

  if (activity === 'waiting_for_approval' || activity === 'waiting_for_input') {
    // Question mark / prompt shape
    return (
      <group position={[px, py, pz]}>
        <mesh position={[0, 0.15, 0.005]}>
          <circleGeometry args={[0.25, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
        <mesh position={[0, 0.15, 0.006]}>
          <planeGeometry args={[0.08, 0.3]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <mesh position={[0, -0.15, 0.006]}>
          <circleGeometry args={[0.05, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
    );
  }

  if (activity === 'done') {
    // Checkmark shape (two angled bars)
    return (
      <group position={[px, py, pz]}>
        <mesh position={[-0.08, -0.05, 0.005]} rotation={[0, 0, -0.5]}>
          <planeGeometry args={[0.08, 0.3]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <mesh position={[0.15, 0.1, 0.005]} rotation={[0, 0, 0.4]}>
          <planeGeometry args={[0.08, 0.5]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
    );
  }

  if (activity === 'error') {
    // X shape
    return (
      <group position={[px, py, pz]}>
        <mesh position={[0, 0, 0.005]} rotation={[0, 0, 0.78]}>
          <planeGeometry args={[0.08, 0.5]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <mesh position={[0, 0, 0.005]} rotation={[0, 0, -0.78]}>
          <planeGeometry args={[0.08, 0.5]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
    );
  }

  return null;
}

/**
 * Detailed desk station with chair at origin, desk behind.
 */
const DeskStation3D = memo(function DeskStation3D({
  position,
  activity = 'idle',
  occupied = false,
}) {
  const monitorRef = useRef();
  const monitor2Ref = useRef();
  const color = ACTIVITY_COLORS[activity] || ACTIVITY_COLORS.idle;
  const isActive = occupied && !['idle', 'done', 'error'].includes(activity);
  const isApproval = activity === 'waiting_for_approval';

  useFrame((state) => {
    if (isApproval) {
      const t = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 0.7;
      if (monitorRef.current) monitorRef.current.emissiveIntensity = t;
      if (monitor2Ref.current) monitor2Ref.current.emissiveIntensity = t;
    }
  });

  // Offset: desk geometry shifted so chair is at origin
  const D = -2.2; // desk offset on Z

  return (
    <group position={position}>
      {/* === OFFICE CHAIR at origin === */}
      <group position={[0, 0, 0]}>
        {/* Seat cushion */}
        <mesh position={[0, 1.35, 0]} castShadow>
          <boxGeometry args={[2, 0.35, 2]} />
          <meshStandardMaterial color="#2c2c2c" roughness={0.8} />
        </mesh>
        {/* Seat padding */}
        <mesh position={[0, 1.55, 0]}>
          <boxGeometry args={[1.7, 0.08, 1.7]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        {/* Backrest — faces away from desk (positive z) */}
        <mesh position={[0, 2.4, 0.85]}>
          <boxGeometry args={[1.8, 1.8, 0.2]} />
          <meshStandardMaterial color="#2c2c2c" roughness={0.8} />
        </mesh>
        {/* Lumbar cushion */}
        <mesh position={[0, 2, 0.73]}>
          <boxGeometry args={[1.4, 0.5, 0.15]} />
          <meshStandardMaterial color="#383838" />
        </mesh>
        {/* Armrests */}
        <mesh position={[-1, 1.7, 0]}>
          <boxGeometry args={[0.15, 0.1, 1.2]} />
          <meshStandardMaterial color="#444" />
        </mesh>
        <mesh position={[1, 1.7, 0]}>
          <boxGeometry args={[0.15, 0.1, 1.2]} />
          <meshStandardMaterial color="#444" />
        </mesh>
        {/* Armrest supports */}
        <mesh position={[-1, 1.45, 0.2]}>
          <boxGeometry args={[0.1, 0.5, 0.1]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[1, 1.45, 0.2]}>
          <boxGeometry args={[0.1, 0.5, 0.1]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        {/* Gas cylinder */}
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 1.1, 8]} />
          <meshStandardMaterial color="#444" metalness={0.6} />
        </mesh>
        {/* Base star */}
        {[0, 1.256, 2.513, 3.77, 5.026].map((angle, i) => (
          <mesh key={i} position={[Math.cos(angle) * 0.7, 0.12, Math.sin(angle) * 0.7]} rotation={[0, -angle, 0]}>
            <boxGeometry args={[0.15, 0.1, 1.4]} />
            <meshStandardMaterial color="#333" metalness={0.3} />
          </mesh>
        ))}
        {/* Wheels */}
        {[0, 1.256, 2.513, 3.77, 5.026].map((angle, i) => (
          <mesh key={`w${i}`} position={[Math.cos(angle) * 1.1, 0.08, Math.sin(angle) * 1.1]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        ))}
      </group>

      {/* === DESK (behind the chair) === */}
      {/* Main desk surface */}
      <mesh position={[0, 1.8, D]} castShadow receiveShadow>
        <boxGeometry args={[5.5, 0.18, 3]} />
        <meshStandardMaterial color="#C4A882" roughness={0.6} />
      </mesh>
      {/* Desk edge trim */}
      <mesh position={[0, 1.72, D + 1.49]}>
        <boxGeometry args={[5.5, 0.08, 0.08]} />
        <meshStandardMaterial color="#a08a68" />
      </mesh>
      {/* Left panel */}
      <mesh position={[-2.6, 0.9, D]} castShadow>
        <boxGeometry args={[0.12, 1.8, 2.8]} />
        <meshStandardMaterial color="#B09870" roughness={0.7} />
      </mesh>
      {/* Right panel */}
      <mesh position={[2.6, 0.9, D]} castShadow>
        <boxGeometry args={[0.12, 1.8, 2.8]} />
        <meshStandardMaterial color="#B09870" roughness={0.7} />
      </mesh>
      {/* Back modesty panel */}
      <mesh position={[0, 0.9, D - 1.35]}>
        <boxGeometry args={[5.3, 1.6, 0.1]} />
        <meshStandardMaterial color="#B09870" roughness={0.8} />
      </mesh>
      {/* Drawer unit */}
      <mesh position={[1.8, 0.9, D]}>
        <boxGeometry args={[1.4, 1.7, 2.6]} />
        <meshStandardMaterial color="#B09870" />
      </mesh>
      {/* Drawer faces */}
      {[0.35, 0.9, 1.45].map((dy, i) => (
        <group key={i}>
          <mesh position={[1.8, dy, D + 1.31]}>
            <planeGeometry args={[1.2, 0.45]} />
            <meshStandardMaterial color="#a08a68" />
          </mesh>
          <mesh position={[1.8, dy, D + 1.35]}>
            <boxGeometry args={[0.5, 0.06, 0.06]} />
            <meshStandardMaterial color="#888" metalness={0.7} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* === MONITORS === */}
      {/* Main monitor */}
      <mesh position={[-0.8, 3.2, D - 0.8]} castShadow>
        <boxGeometry args={[2.8, 1.8, 0.12]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-0.8, 3.2, D - 0.73]}>
        <boxGeometry args={[2.65, 1.65, 0.01]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      <mesh ref={monitorRef} position={[-0.8, 3.2, D - 0.72]}>
        <planeGeometry args={[2.4, 1.4]} />
        <meshStandardMaterial
          color={occupied ? color : '#111'}
          emissive={occupied ? color : '#000000'}
          emissiveIntensity={isActive ? 0.8 : occupied ? 0.25 : 0}
        />
      </mesh>
      {/* Screen content — activity-specific geometry on the monitor face */}
      {occupied && activity !== 'idle' && (
        <ScreenContent activity={activity} color={color} position={[-0.8, 3.2, D - 0.71]} />
      )}
      {/* Main monitor stand */}
      <mesh position={[-0.8, 2.2, D - 0.8]}>
        <boxGeometry args={[0.25, 0.5, 0.25]} />
        <meshStandardMaterial color="#333" metalness={0.4} />
      </mesh>
      <mesh position={[-0.8, 1.95, D - 0.8]}>
        <boxGeometry args={[1.2, 0.08, 0.6]} />
        <meshStandardMaterial color="#333" metalness={0.4} />
      </mesh>

      {/* Second monitor */}
      <mesh position={[1.2, 3, D - 0.7]} rotation={[0, -0.2, 0]} castShadow>
        <boxGeometry args={[2.2, 1.5, 0.1]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh ref={monitor2Ref} position={[1.2, 3, D - 0.64]} rotation={[0, -0.2, 0]}>
        <planeGeometry args={[1.9, 1.2]} />
        <meshStandardMaterial
          color={occupied ? color : '#111'}
          emissive={occupied ? color : '#000000'}
          emissiveIntensity={isActive ? 0.5 : occupied ? 0.15 : 0}
        />
      </mesh>
      <mesh position={[1.2, 2.15, D - 0.7]}>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color="#333" metalness={0.4} />
      </mesh>

      {/* === KEYBOARD + MOUSE === */}
      {occupied && (
        <group>
          <mesh position={[-0.5, 1.94, D + 0.4]}>
            <boxGeometry args={[2, 0.06, 0.7]} />
            <meshStandardMaterial color="#2a2a2a" />
          </mesh>
          {[0, 0.15, 0.3].map((rz, i) => (
            <mesh key={i} position={[-0.5, 1.98, D + 0.2 + rz]}>
              <boxGeometry args={[1.8, 0.02, 0.12]} />
              <meshStandardMaterial color="#3a3a3a" />
            </mesh>
          ))}
          <mesh position={[1.3, 1.94, D + 0.4]}>
            <boxGeometry args={[0.4, 0.12, 0.6]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.4} />
          </mesh>
          <mesh position={[1.3, 1.91, D + 0.4]}>
            <boxGeometry args={[1, 0.02, 1]} />
            <meshStandardMaterial color="#1a1a3a" />
          </mesh>
        </group>
      )}

      {/* === DESK LAMP === */}
      <mesh position={[-2.2, 1.95, D - 0.5]}>
        <cylinderGeometry args={[0.3, 0.35, 0.08, 10]} />
        <meshStandardMaterial color="#555" metalness={0.5} />
      </mesh>
      <mesh position={[-2.2, 2.5, D - 0.5]}>
        <cylinderGeometry args={[0.03, 0.03, 1, 6]} />
        <meshStandardMaterial color="#555" metalness={0.4} />
      </mesh>
      <mesh position={[-2.2, 3, D - 0.5]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.4, 0.5, 10, 1, true]} />
        <meshStandardMaterial color="#666" metalness={0.3} side={2} />
      </mesh>

      {/* Small desk plant */}
      <mesh position={[2.3, 2, D + 0.8]}>
        <cylinderGeometry args={[0.2, 0.15, 0.25, 8]} />
        <meshStandardMaterial color="#8B5E3C" />
      </mesh>
      <mesh position={[2.3, 2.3, D + 0.8]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial color="#3fb950" />
      </mesh>
    </group>
  );
});

export default DeskStation3D;
