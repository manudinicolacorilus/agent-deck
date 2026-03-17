import React from 'react';

/**
 * Outdoor parking lot with Tesla EV + charger, other cars, and bike parking.
 * Positioned behind the building (negative z).
 */

const PARKING_Z = -24; // behind back walls
const PARKING_X = -2;  // centered on building

/* ── Asphalt & Lines ── */

function AsphaltGround() {
  return (
    <group>
      {/* Main asphalt surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[PARKING_X, -0.005, PARKING_Z]} receiveShadow>
        <planeGeometry args={[90, 18]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.95} />
      </mesh>
      {/* Sidewalk/curb between building and parking */}
      <mesh position={[PARKING_X, 0.08, PARKING_Z + 8.5]}>
        <boxGeometry args={[92, 0.16, 1.5]} />
        <meshStandardMaterial color="#888" roughness={0.8} />
      </mesh>
      {/* Parking lines */}
      {[-4, -2, 0, 2, 4].map((slot, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[PARKING_X + 12 + slot * 5, 0.005, PARKING_Z]}>
          <planeGeometry args={[0.15, 8]} />
          <meshStandardMaterial color="#dddddd" />
        </mesh>
      ))}
      {/* Bike area lines */}
      {[-3, -1.5, 0, 1.5, 3].map((slot, i) => (
        <mesh key={`b${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[PARKING_X - 25 + slot * 2, 0.005, PARKING_Z + 1]}>
          <planeGeometry args={[0.1, 5]} />
          <meshStandardMaterial color="#dddddd" />
        </mesh>
      ))}
      {/* Handicap symbol spot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[PARKING_X + 22, 0.006, PARKING_Z]}>
        <planeGeometry args={[4.5, 7.5]} />
        <meshStandardMaterial color="#2244aa" />
      </mesh>
    </group>
  );
}

/* ── Tesla Model 3 (simplified) ── */

function TeslaCar({ position, color = '#cc0000', rotation = 0 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Body lower */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[2.2, 0.7, 5.5]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Body upper / cabin */}
      <mesh position={[0, 1.15, -0.3]} castShadow>
        <boxGeometry args={[2, 0.6, 3]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Windshield (front) */}
      <mesh position={[0, 1.1, 1.15]} rotation={[-0.3, 0, 0]}>
        <planeGeometry args={[1.8, 0.7]} />
        <meshStandardMaterial color="#1a2a3a" metalness={0.5} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* Rear window */}
      <mesh position={[0, 1.1, -1.75]} rotation={[0.3, Math.PI, 0]}>
        <planeGeometry args={[1.8, 0.65]} />
        <meshStandardMaterial color="#1a2a3a" metalness={0.5} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* Side windows */}
      {[-1, 1].map((side, i) => (
        <mesh key={i} position={[side * 1.1, 1.15, -0.3]}>
          <planeGeometry args={[0.01, 0.5]} />
          <meshStandardMaterial color="#1a2a3a" transparent opacity={0.6} />
        </mesh>
      ))}
      {/* Wheels */}
      {[[-0.9, 0.3, 1.6], [0.9, 0.3, 1.6], [-0.9, 0.3, -1.6], [0.9, 0.3, -1.6]].map((wp, i) => (
        <group key={i} position={wp}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.32, 0.32, 0.25, 12]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          {/* Hub cap */}
          <mesh position={[0.13, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.02, 8]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.8} />
          </mesh>
        </group>
      ))}
      {/* Headlights */}
      {[-0.7, 0.7].map((hx, i) => (
        <mesh key={`hl${i}`} position={[hx, 0.65, 2.76]}>
          <boxGeometry args={[0.5, 0.15, 0.05]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
        </mesh>
      ))}
      {/* Tail lights */}
      {[-0.8, 0.8].map((tx, i) => (
        <mesh key={`tl${i}`} position={[tx, 0.65, -2.76]}>
          <boxGeometry args={[0.4, 0.1, 0.05]} />
          <meshStandardMaterial color="#cc0000" emissive="#cc0000" emissiveIntensity={0.4} />
        </mesh>
      ))}
      {/* Tesla "T" logo on back (simple) */}
      <mesh position={[0, 0.75, -2.77]}>
        <boxGeometry args={[0.2, 0.25, 0.02]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} />
      </mesh>
      {/* Door handles */}
      {[-1.11, 1.11].map((dx, i) => (
        <group key={`dh${i}`}>
          <mesh position={[dx, 0.7, 0.3]}>
            <boxGeometry args={[0.03, 0.06, 0.4]} />
            <meshStandardMaterial color="#888" metalness={0.6} />
          </mesh>
          <mesh position={[dx, 0.7, -1]}>
            <boxGeometry args={[0.03, 0.06, 0.4]} />
            <meshStandardMaterial color="#888" metalness={0.6} />
          </mesh>
        </group>
      ))}
      {/* Charge port (left rear) */}
      <mesh position={[-1.12, 0.6, -1.5]}>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 8]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}

/* ── EV Charging Station (Tesla Supercharger style) ── */

function EVCharger({ position }) {
  return (
    <group position={position}>
      {/* Base pedestal */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.8, 1.2, 0.5]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>
      {/* Main column */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <boxGeometry args={[0.6, 2, 0.4]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      {/* Red stripe (Tesla brand) */}
      <mesh position={[0, 2.8, 0.21]}>
        <boxGeometry args={[0.5, 0.4, 0.02]} />
        <meshStandardMaterial color="#cc0000" />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 2.2, 0.22]}>
        <planeGeometry args={[0.4, 0.3]} />
        <meshStandardMaterial color="#111" emissive="#22aa44" emissiveIntensity={0.5} />
      </mesh>
      {/* Charging cable (curved down) */}
      <mesh position={[0.2, 1.5, 0.3]}>
        <cylinderGeometry args={[0.04, 0.04, 1.5, 6]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Cable connector (hanging) */}
      <mesh position={[0.2, 0.8, 0.4]}>
        <boxGeometry args={[0.15, 0.25, 0.1]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Green LED status */}
      <mesh position={[0.25, 3, 0.22]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#3fb950" emissive="#3fb950" emissiveIntensity={1.5} />
      </mesh>
      {/* "TESLA" text area */}
      <mesh position={[0, 3.1, 0.22]}>
        <boxGeometry args={[0.45, 0.12, 0.02]} />
        <meshStandardMaterial color="#cc0000" />
      </mesh>
    </group>
  );
}

/* ── Bike Rack & Bikes ── */

function BikeRack({ position }) {
  return (
    <group position={position}>
      {/* Ground rail */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[8, 0.1, 0.4]} />
        <meshStandardMaterial color="#888" metalness={0.5} />
      </mesh>
      {/* Upright loops */}
      {[-3, -1.5, 0, 1.5, 3].map((rx, i) => (
        <group key={i} position={[rx, 0, 0]}>
          <mesh position={[0, 0.9, 0]}>
            <torusGeometry args={[0.6, 0.05, 8, 12, Math.PI]} />
            <meshStandardMaterial color="#888" metalness={0.5} roughness={0.3} />
          </mesh>
          {/* Support posts */}
          <mesh position={[-0.6, 0.45, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.9, 6]} />
            <meshStandardMaterial color="#888" metalness={0.5} />
          </mesh>
          <mesh position={[0.6, 0.45, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.9, 6]} />
            <meshStandardMaterial color="#888" metalness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Bicycle({ position, color = '#2980b9', rotation = 0 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Frame (triangle) */}
      <mesh position={[0, 0.7, 0]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.04, 0.8, 1.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Top tube */}
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[0.04, 0.04, 1.4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Down tube */}
      <mesh position={[0, 0.65, 0.3]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.04, 0.04, 0.9]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Wheels */}
      {[0.6, -0.6].map((wz, i) => (
        <mesh key={i} position={[0, 0.4, wz]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.38, 0.03, 8, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
      {/* Hub */}
      {[0.6, -0.6].map((wz, i) => (
        <mesh key={`hub${i}`} position={[0, 0.4, wz]}>
          <cylinderGeometry args={[0.04, 0.04, 0.06, 6]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.6} />
        </mesh>
      ))}
      {/* Handlebars */}
      <mesh position={[0, 1.15, 0.55]}>
        <boxGeometry args={[0.6, 0.04, 0.04]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Seat */}
      <mesh position={[0, 1.15, -0.4]}>
        <boxGeometry args={[0.2, 0.06, 0.3]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Pedals */}
      <mesh position={[0, 0.45, 0.1]}>
        <boxGeometry args={[0.3, 0.04, 0.08]} />
        <meshStandardMaterial color="#555" metalness={0.4} />
      </mesh>
    </group>
  );
}

/* ── Bollards & Signage ── */

function Bollard({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} />
        <meshStandardMaterial color="#ffcc00" />
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color="#ffcc00" />
      </mesh>
    </group>
  );
}

function ParkingSign({ position, text }) {
  return (
    <group position={position}>
      {/* Post */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 3, 6]} />
        <meshStandardMaterial color="#777" metalness={0.4} />
      </mesh>
      {/* Sign plate */}
      <mesh position={[0, 2.8, 0]}>
        <boxGeometry args={[1.6, 1, 0.08]} />
        <meshStandardMaterial color="#1155aa" />
      </mesh>
      {/* White border */}
      <mesh position={[0, 2.8, 0.05]}>
        <boxGeometry args={[1.4, 0.8, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* P symbol */}
      <mesh position={[0, 2.85, 0.07]}>
        <boxGeometry args={[0.5, 0.5, 0.02]} />
        <meshStandardMaterial color="#1155aa" />
      </mesh>
    </group>
  );
}

/* ── Outdoor Trees & Landscaping ── */

function OutdoorTree({ position, scale = 1 }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 4.4, 8]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.9} />
      </mesh>
      {/* Canopy layers */}
      <mesh position={[0, 5, 0]} castShadow>
        <sphereGeometry args={[2, 10, 10]} />
        <meshStandardMaterial color="#2a6a2a" roughness={0.9} />
      </mesh>
      <mesh position={[0.6, 5.5, 0.4]}>
        <sphereGeometry args={[1.4, 8, 8]} />
        <meshStandardMaterial color="#3a7a3a" roughness={0.9} />
      </mesh>
      <mesh position={[-0.5, 5.3, -0.5]}>
        <sphereGeometry args={[1.2, 8, 8]} />
        <meshStandardMaterial color="#2a5a2a" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Shrub({ position, color = '#3a7a3a' }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      <mesh position={[0.3, 0.6, 0.2]}>
        <sphereGeometry args={[0.4, 6, 6]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
    </group>
  );
}

/* ── Main Export ── */

export default function ParkingLot() {
  return (
    <group>
      <AsphaltGround />

      {/* === CARS === */}
      {/* Tesla (white, charging) */}
      <TeslaCar position={[PARKING_X + 10, 0, PARKING_Z]} color="#e8e8e8" />
      {/* EV charger next to Tesla */}
      <EVCharger position={[PARKING_X + 7.5, 0, PARKING_Z - 3]} />

      {/* Second Tesla (red) */}
      <TeslaCar position={[PARKING_X + 15, 0, PARKING_Z]} color="#cc2222" />
      <EVCharger position={[PARKING_X + 17.5, 0, PARKING_Z - 3]} />

      {/* Other cars */}
      <TeslaCar position={[PARKING_X + 5, 0, PARKING_Z]} color="#2a2a4a" />
      <TeslaCar position={[PARKING_X + 20, 0, PARKING_Z + 0.2]} color="#4a4a4a" />

      {/* === BIKE PARKING === */}
      <BikeRack position={[PARKING_X - 25, 0, PARKING_Z + 1]} />

      {/* Bikes locked to rack */}
      <Bicycle position={[PARKING_X - 28, 0, PARKING_Z + 1]} color="#2980b9" rotation={0.1} />
      <Bicycle position={[PARKING_X - 26.5, 0, PARKING_Z + 1.2]} color="#e74c3c" rotation={-0.05} />
      <Bicycle position={[PARKING_X - 25, 0, PARKING_Z + 0.8]} color="#27ae60" rotation={0.15} />

      {/* === SIGNAGE & SAFETY === */}
      <ParkingSign position={[PARKING_X + 25, 0, PARKING_Z + 4]} />
      <ParkingSign position={[PARKING_X - 20, 0, PARKING_Z + 4]} text="BIKES" />

      {/* Bollards separating car and bike areas */}
      {[-15, -13, -11].map((bx, i) => (
        <Bollard key={i} position={[PARKING_X + bx, 0, PARKING_Z + 4]} />
      ))}

      {/* Parking lot light pole */}
      <mesh position={[PARKING_X, 3, PARKING_Z - 5]}>
        <cylinderGeometry args={[0.1, 0.12, 6, 8]} />
        <meshStandardMaterial color="#666" metalness={0.4} />
      </mesh>
      <mesh position={[PARKING_X, 6, PARKING_Z - 5]}>
        <boxGeometry args={[2, 0.3, 0.8]} />
        <meshStandardMaterial color="#777" />
      </mesh>
      <pointLight position={[PARKING_X, 5.5, PARKING_Z - 4]} color="#ffe8c0" intensity={8} distance={20} />

      {/* Second light pole */}
      <mesh position={[PARKING_X + 20, 3, PARKING_Z - 5]}>
        <cylinderGeometry args={[0.1, 0.12, 6, 8]} />
        <meshStandardMaterial color="#666" metalness={0.4} />
      </mesh>
      <mesh position={[PARKING_X + 20, 6, PARKING_Z - 5]}>
        <boxGeometry args={[2, 0.3, 0.8]} />
        <meshStandardMaterial color="#777" />
      </mesh>
      <pointLight position={[PARKING_X + 20, 5.5, PARKING_Z - 4]} color="#ffe8c0" intensity={8} distance={20} />

      {/* === OUTDOOR LANDSCAPING === */}
      {/* Trees along parking perimeter */}
      <OutdoorTree position={[PARKING_X - 38, 0, PARKING_Z - 4]} scale={1.1} />
      <OutdoorTree position={[PARKING_X - 32, 0, PARKING_Z - 5]} scale={0.9} />
      <OutdoorTree position={[PARKING_X + 30, 0, PARKING_Z - 4]} scale={1} />
      <OutdoorTree position={[PARKING_X + 38, 0, PARKING_Z - 5]} scale={0.85} />
      {/* Tree between car and bike areas */}
      <OutdoorTree position={[PARKING_X - 8, 0, PARKING_Z - 3]} scale={0.95} />

      {/* Shrubs along building edge */}
      <Shrub position={[PARKING_X - 20, 0, PARKING_Z + 6]} color="#2a6a2a" />
      <Shrub position={[PARKING_X - 15, 0, PARKING_Z + 6.5]} color="#3a7a3a" />
      <Shrub position={[PARKING_X + 5, 0, PARKING_Z + 6]} color="#2a6a2a" />
      <Shrub position={[PARKING_X + 10, 0, PARKING_Z + 6.3]} color="#3a8a3a" />
      <Shrub position={[PARKING_X + 25, 0, PARKING_Z + 6]} color="#2a6a2a" />
      <Shrub position={[PARKING_X + 30, 0, PARKING_Z + 6.5]} color="#3a7a3a" />

      {/* Small landscaped green patches */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[PARKING_X - 35, 0.005, PARKING_Z - 4]}>
        <circleGeometry args={[3, 12]} />
        <meshStandardMaterial color="#2a5a2a" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[PARKING_X + 34, 0.005, PARKING_Z - 4]}>
        <circleGeometry args={[3, 12]} />
        <meshStandardMaterial color="#2a5a2a" roughness={1} />
      </mesh>

      {/* === TREES AROUND BUILDING === */}
      {/* Left side of building */}
      <OutdoorTree position={[-66, 0, -8]} scale={1.2} />
      <OutdoorTree position={[-67, 0, 5]} scale={1} />
      <OutdoorTree position={[-65, 0, 18]} scale={0.9} />
      {/* Right side of building */}
      <OutdoorTree position={[62, 0, -5]} scale={1.1} />
      <OutdoorTree position={[63, 0, 8]} scale={0.85} />
      <OutdoorTree position={[61, 0, 20]} scale={1} />
      {/* Front of building (positive z) */}
      <OutdoorTree position={[-45, 0, 30]} scale={1} />
      <OutdoorTree position={[-20, 0, 32]} scale={0.9} />
      <OutdoorTree position={[10, 0, 31]} scale={1.1} />
      <OutdoorTree position={[35, 0, 30]} scale={0.95} />
      <OutdoorTree position={[55, 0, 32]} scale={0.85} />
      {/* Far corners */}
      <OutdoorTree position={[-55, 0, -35]} scale={1.3} />
      <OutdoorTree position={[50, 0, -36]} scale={1.2} />

      {/* === SHRUBS AROUND BUILDING PERIMETER === */}
      {/* Front shrubs */}
      <Shrub position={[-50, 0, 27]} color="#3a8a3a" />
      <Shrub position={[-35, 0, 27.5]} color="#2a7a2a" />
      <Shrub position={[-10, 0, 27]} color="#3a7a3a" />
      <Shrub position={[5, 0, 27.3]} color="#2a6a2a" />
      <Shrub position={[20, 0, 27]} color="#3a8a3a" />
      <Shrub position={[40, 0, 27.5]} color="#2a7a2a" />
      {/* Left side shrubs */}
      <Shrub position={[-64, 0, -3]} color="#3a7a3a" />
      <Shrub position={[-64, 0, 10]} color="#2a6a2a" />
      {/* Right side shrubs */}
      <Shrub position={[60, 0, 0]} color="#3a7a3a" />
      <Shrub position={[60, 0, 13]} color="#2a6a2a" />

      {/* EV charging sign */}
      <group position={[PARKING_X + 13, 0, PARKING_Z - 4.5]}>
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 2.4, 6]} />
          <meshStandardMaterial color="#777" metalness={0.4} />
        </mesh>
        <mesh position={[0, 2.3, 0]}>
          <boxGeometry args={[1.4, 0.8, 0.06]} />
          <meshStandardMaterial color="#2a8a2a" />
        </mesh>
        {/* Lightning bolt symbol */}
        <mesh position={[0, 2.35, 0.04]}>
          <boxGeometry args={[0.15, 0.5, 0.02]} />
          <meshStandardMaterial color="#ffcc00" />
        </mesh>
        <mesh position={[0.1, 2.2, 0.04]} rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.12, 0.3, 0.02]} />
          <meshStandardMaterial color="#ffcc00" />
        </mesh>
      </group>
    </group>
  );
}
