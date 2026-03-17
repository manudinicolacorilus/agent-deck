import React from 'react';
import { ROOMS } from './coordUtils';

/**
 * Manager's private office furniture:
 * Executive desk, leather chair, bookshelf, filing cabinet, wall art.
 */

function ExecutiveDesk({ cx, cz }) {
  return (
    <group position={[cx, 0, cz + 2]}>
      {/* Large L-shaped desk surface */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <boxGeometry args={[8, 0.2, 3]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.4} />
      </mesh>
      {/* Side extension */}
      <mesh position={[3.5, 1.8, -2]} castShadow>
        <boxGeometry args={[3, 0.2, 2]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.4} />
      </mesh>
      {/* Front modesty panel */}
      <mesh position={[0, 0.9, -1.4]}>
        <boxGeometry args={[7.8, 1.6, 0.15]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.5} />
      </mesh>
      {/* Left pedestal with drawers */}
      <mesh position={[-2.5, 0.9, 0]}>
        <boxGeometry args={[2, 1.6, 2.5]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.6} />
      </mesh>
      {/* Drawer handles */}
      {[0.3, 0.9, 1.5].map((dy, i) => (
        <mesh key={i} position={[-2.5, dy, 1.26]}>
          <boxGeometry args={[0.8, 0.06, 0.06]} />
          <meshStandardMaterial color="#c0a060" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {/* Right pedestal */}
      <mesh position={[2.5, 0.9, 0]}>
        <boxGeometry args={[2, 1.6, 2.5]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.6} />
      </mesh>

      {/* Monitor — large widescreen */}
      <mesh position={[0, 3, -0.8]}>
        <boxGeometry args={[3.5, 2.2, 0.1]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 3.1, -0.74]}>
        <planeGeometry args={[3.2, 1.8]} />
        <meshStandardMaterial color="#1a2a3a" emissive="#2244aa" emissiveIntensity={0.3} />
      </mesh>
      {/* Monitor stand */}
      <mesh position={[0, 2.1, -0.8]}>
        <boxGeometry args={[0.8, 0.4, 0.6]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      {/* Desk lamp */}
      <mesh position={[-3, 1.95, -0.5]}>
        <cylinderGeometry args={[0.4, 0.5, 0.1, 10]} />
        <meshStandardMaterial color="#222" metalness={0.6} />
      </mesh>
      <mesh position={[-3, 2.5, -0.5]}>
        <cylinderGeometry args={[0.04, 0.04, 1, 6]} />
        <meshStandardMaterial color="#222" metalness={0.5} />
      </mesh>
      <mesh position={[-3, 3, -0.5]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.5, 0.6, 10, 1, true]} />
        <meshStandardMaterial color="#333" metalness={0.4} side={2} />
      </mesh>
      <pointLight position={[-3, 2.8, -0.3]} color="#fff0d0" intensity={3} distance={6} />

      {/* Pen holder */}
      <mesh position={[2, 2.1, 0.3]}>
        <cylinderGeometry args={[0.2, 0.2, 0.5, 8]} />
        <meshStandardMaterial color="#5a4a32" />
      </mesh>

      {/* Keyboard */}
      <mesh position={[0, 1.95, 0.4]}>
        <boxGeometry args={[2.2, 0.06, 0.7]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
    </group>
  );
}

function ExecutiveChair({ cx, cz }) {
  return (
    <group position={[cx, 0, cz + 4.5]}>
      {/* Seat */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <boxGeometry args={[1.8, 0.25, 1.8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {/* Seat cushion */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[1.6, 0.15, 1.6]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.95} />
      </mesh>
      {/* High backrest */}
      <mesh position={[0, 2.8, -0.8]}>
        <boxGeometry args={[1.6, 2.6, 0.2]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {/* Headrest */}
      <mesh position={[0, 4.2, -0.75]}>
        <boxGeometry args={[1.2, 0.5, 0.25]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      {/* Armrests */}
      <mesh position={[-0.85, 1.8, -0.1]}>
        <boxGeometry args={[0.15, 0.1, 1.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.85, 1.8, -0.1]}>
        <boxGeometry args={[0.15, 0.1, 1.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Gas cylinder */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 1.1, 8]} />
        <meshStandardMaterial color="#444" metalness={0.5} />
      </mesh>
      {/* 5-star base */}
      {[0, 1.256, 2.513, 3.77, 5.026].map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 0.7, 0.08, Math.sin(angle) * 0.7]} rotation={[0, -angle, 0]}>
          <boxGeometry args={[0.12, 0.08, 0.7]} />
          <meshStandardMaterial color="#444" metalness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function OfficeBookshelf({ cx, cz, wallZ }) {
  return (
    <group position={[cx + 5, 0, wallZ + 0.8]}>
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[4, 5, 1.2]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.7} />
      </mesh>
      {[1, 2.2, 3.4].map((sy, i) => (
        <mesh key={i} position={[0, sy, 0]}>
          <boxGeometry args={[3.8, 0.12, 1.1]} />
          <meshStandardMaterial color="#2a1a0a" />
        </mesh>
      ))}
      {[
        { y: 1.5, colors: ['#8B0000', '#00308F', '#2a1a0a', '#8B4513'] },
        { y: 2.7, colors: ['#1a3a2a', '#4a2a1a', '#2a2a4a'] },
        { y: 3.9, colors: ['#3a1a0a', '#1a2a3a', '#4a3a2a', '#2a3a1a'] },
      ].map(({ y, colors }, si) => (
        <group key={si}>
          {colors.map((c, bi) => (
            <mesh key={bi} position={[-1.3 + bi * 0.8, y, 0]}>
              <boxGeometry args={[0.6, 0.9 + (bi % 3) * 0.1, 0.8]} />
              <meshStandardMaterial color={c} roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function FilingCabinet({ cx, cz, wallZ }) {
  return (
    <group position={[cx - 5.5, 0, wallZ + 0.8]}>
      <mesh position={[0, 1.8, 0]} castShadow>
        <boxGeometry args={[2, 3.6, 1.5]} />
        <meshStandardMaterial color="#666" metalness={0.3} roughness={0.6} />
      </mesh>
      {[0.6, 1.4, 2.2, 3.0].map((dy, i) => (
        <mesh key={i} position={[0, dy, 0.76]}>
          <boxGeometry args={[1.4, 0.06, 0.04]} />
          <meshStandardMaterial color="#999" metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function WallArt({ cx, cz, wallZ }) {
  return (
    <group>
      {/* Large framed artwork */}
      <mesh position={[cx - 2, 4, wallZ + 0.3]}>
        <boxGeometry args={[4, 3, 0.12]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[cx - 2, 4, 0.07 + wallZ + 0.3]}>
        <planeGeometry args={[3.6, 2.6]} />
        <meshStandardMaterial color="#1a3a5a" />
      </mesh>
      {/* Abstract art detail */}
      <mesh position={[cx - 2.5, 4.2, 0.08 + wallZ + 0.3]}>
        <circleGeometry args={[0.6, 16]} />
        <meshStandardMaterial color="#c0a060" />
      </mesh>
    </group>
  );
}

export default function ManagerOfficeFurniture() {
  const { center, size } = ROOMS.managerOffice;
  const [cx, , cz] = center;
  const wallZ = cz - size[1] / 2;

  return (
    <group>
      <ExecutiveDesk cx={cx} cz={cz} />
      <ExecutiveChair cx={cx} cz={cz} />
      <OfficeBookshelf cx={cx} cz={cz} wallZ={wallZ} />
      <FilingCabinet cx={cx} cz={cz} wallZ={wallZ} />
      <WallArt cx={cx} cz={cz} wallZ={wallZ} />

      {/* Nameplate on desk edge */}
      <mesh position={[cx, 2.05, cz + 0.65]}>
        <boxGeometry args={[1.8, 0.4, 0.08]} />
        <meshStandardMaterial color="#c0a060" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Visitor chairs */}
      {[-1.5, 1.5].map((dx, i) => (
        <group key={i} position={[cx + dx, 0, cz + 7]}>
          <mesh position={[0, 1, 0]} castShadow>
            <boxGeometry args={[1.4, 0.15, 1.4]} />
            <meshStandardMaterial color="#5a4a3a" />
          </mesh>
          <mesh position={[0, 1.7, -0.6]}>
            <boxGeometry args={[1.3, 1.2, 0.12]} />
            <meshStandardMaterial color="#5a4a3a" />
          </mesh>
          {[[-0.5, 0.5, -0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, 0.5], [0.5, 0.5, 0.5]].map((lp, li) => (
            <mesh key={li} position={lp}>
              <cylinderGeometry args={[0.05, 0.05, 1, 6]} />
              <meshStandardMaterial color="#3a2a1a" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
