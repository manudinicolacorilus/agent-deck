import React, { useMemo, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { AGENT_VISUAL_STATE } from '@agent-deck/shared';
import Floor from './Floor';
import Walls from './Walls';
import BreakRoomFurniture from './BreakRoomFurniture';
import ManagerOfficeFurniture from './ManagerOfficeFurniture';
import RestroomFurniture from './RestroomFurniture';
import DeskStation3D from './DeskStation3D';
import Character3D from './Character3D';
import Decorations from './Decorations';
import ParkingLot from './ParkingLot';
import { getDeskPosition3D, ROOMS } from './coordUtils';

// Scene bounds (world units)
const SCENE_MIN = new THREE.Vector3(-61, 0, -33); // break room left, parking back
const SCENE_MAX = new THREE.Vector3(56, 7, 24);   // manager office right, front rooms
const SCENE_CENTER = new THREE.Vector3(
  (SCENE_MIN.x + SCENE_MAX.x) / 2,
  0,
  (SCENE_MIN.z + SCENE_MAX.z) / 2,
);

/**
 * Camera that auto-fits the full scene (building + parking) with ~85-90% fill.
 */
function FixedCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    // 35-40° bird's-eye, slight right offset for depth
    camera.position.set(SCENE_CENTER.x + 10, 48, SCENE_CENTER.z + 58);
    camera.lookAt(SCENE_CENTER);

    // Compute zoom to fill ~88% of viewport
    const sceneWidth = SCENE_MAX.x - SCENE_MIN.x;  // 117
    const sceneDepth = SCENE_MAX.z - SCENE_MIN.z;   // 57
    const projectedHeight = sceneDepth * 0.78 + 7;   // cos(~38°) + wall height
    const fillFactor = 0.88;

    const zoomW = size.width / (sceneWidth / fillFactor);
    const zoomH = size.height / (projectedHeight / fillFactor);
    camera.zoom = Math.min(zoomW, zoomH);
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

/**
 * Main 3D office scene — Sims-style isometric view.
 */
export default function Office3DScene({
  agents,
  activities,
  visualStates,
  positions,
  deskAssignments,
  bubbles,
  onClickIdleAgent,
  onClickWorkingAgent,
}) {
  const getAgentActivity = (agent) => {
    if (!agent.currentSessionId) return 'idle';
    return activities[agent.currentSessionId] || 'idle';
  };

  const deskStations = useMemo(() => {
    const stations = [];
    for (let i = 0; i < 8; i++) {
      const pos3D = getDeskPosition3D(i);
      const assignedAgent = Object.entries(deskAssignments).find(([, idx]) => idx === i);
      const agent = assignedAgent ? agents.find((a) => a.id === assignedAgent[0]) : null;
      const activity = agent ? getAgentActivity(agent) : 'idle';

      stations.push(
        <DeskStation3D
          key={`desk-${i}`}
          position={pos3D}
          occupied={!!agent}
          activity={activity}
        />
      );
    }
    return stations;
  }, [deskAssignments, agents, activities]);

  const idleCount = agents.filter((a) => {
    const vs = visualStates[a.id];
    return !vs || vs === AGENT_VISUAL_STATE.IDLE_AT_COFFEE
      || vs === AGENT_VISUAL_STATE.CHATTING_AT_COOLER
      || vs === AGENT_VISUAL_STATE.SITTING_ON_COUCH;
  }).length;

  const workingCount = agents.filter((a) => {
    const vs = visualStates[a.id];
    return vs === AGENT_VISUAL_STATE.WORKING_AT_DESK
      || vs === AGENT_VISUAL_STATE.THINKING_AT_DESK;
  }).length;

  return (
    <div style={{
      position: 'relative', width: '100%', height: 700,
      borderRadius: 12, overflow: 'hidden',
      border: '2px solid #2d333b',
    }}>
      <Canvas
        orthographic
        shadows
        style={{ background: 'linear-gradient(180deg, #6fa8c7 0%, #a8c8d8 40%, #c8dce4 100%)' }}
        gl={{ antialias: true }}
        camera={{ near: 0.1, far: 500 }}
      >
        <FixedCamera />

        {/* === LIGHTING — soft outdoor ambient === */}
        {/* Sky ambient — warm daylight fill */}
        <ambientLight intensity={0.5} color="#e8dcc8" />

        {/* Sun — warm directional from above-behind */}
        <directionalLight
          position={[20, 60, -25]}
          intensity={0.9}
          color="#fff5d8"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={250}
          shadow-camera-left={-100}
          shadow-camera-right={100}
          shadow-camera-top={60}
          shadow-camera-bottom={-60}
        />

        {/* Sky fill — soft blue from above */}
        <directionalLight
          position={[-20, 40, 20]}
          intensity={0.25}
          color="#88b8d8"
        />

        {/* Front fill — illuminate open cutaway face */}
        <directionalLight
          position={[0, 10, 50]}
          intensity={0.2}
          color="#d8d0c8"
        />

        {/* Hemisphere light — ground bounce (green grass reflection) */}
        <hemisphereLight
          args={['#87ceeb', '#3a6b2a', 0.3]}
        />

        {/* Warm point light for break room */}
        <pointLight
          position={[ROOMS.breakRoom.center[0], 5, ROOMS.breakRoom.center[2]]}
          color="#ffcc88"
          intensity={8}
          distance={25}
        />

        {/* Cool point light for workspace */}
        <pointLight
          position={[ROOMS.workspace.center[0], 5, ROOMS.workspace.center[2]]}
          color="#aaccff"
          intensity={5}
          distance={45}
        />

        {/* Warm point light for manager office */}
        <pointLight
          position={[ROOMS.managerOffice.center[0], 5, ROOMS.managerOffice.center[2]]}
          color="#ffe8c0"
          intensity={6}
          distance={18}
        />

        {/* === SCENE === */}
        <Floor />
        <Walls />
        <BreakRoomFurniture />
        <ManagerOfficeFurniture />
        <RestroomFurniture />
        <Decorations />
        <ParkingLot />
        {deskStations}

        {/* === CHARACTERS === */}
        {agents.map((agent) => {
          const pos = positions[agent.id];
          if (!pos) return null;

          const vs = visualStates[agent.id];
          const activity = getAgentActivity(agent);
          const isIdle = !vs || vs === AGENT_VISUAL_STATE.IDLE_AT_COFFEE
            || vs === AGENT_VISUAL_STATE.CHATTING_AT_COOLER
            || vs === AGENT_VISUAL_STATE.SITTING_ON_COUCH;
          const isWorking = vs === AGENT_VISUAL_STATE.WORKING_AT_DESK
            || vs === AGENT_VISUAL_STATE.THINKING_AT_DESK;
          const bubble = bubbles?.[agent.id];

          return (
            <Character3D
              key={agent.id}
              agent={agent}
              position2D={pos}
              visualState={vs}
              activity={activity}
              bubble={bubble}
              isIdle={isIdle}
              isWorking={isWorking}
              onClick={() => {
                if (isIdle) onClickIdleAgent?.(agent);
                else if (isWorking) onClickWorkingAgent?.(agent);
              }}
            />
          );
        })}
      </Canvas>

      {/* Stats overlay */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '5px 14px',
        background: 'linear-gradient(transparent, rgba(20,25,30,0.85))',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        fontSize: 11,
        color: '#8b949e',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <span style={{ fontWeight: 700 }}>🏢 Agent Office</span>
        <span style={{ flex: 1 }} />
        <span>{agents.length} agent{agents.length !== 1 ? 's' : ''}</span>
        <span style={{ color: '#444' }}>|</span>
        <span style={{ color: '#3fb950' }}>{workingCount} working</span>
        <span style={{ color: '#444' }}>|</span>
        <span style={{ color: '#6e7681' }}>{idleCount} idle</span>
      </div>
    </div>
  );
}
