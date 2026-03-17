import React, { useRef, useMemo, useState, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { AGENT_VISUAL_STATE } from '@agent-deck/shared';
import {
  map2Dto3D,
  nameToColor,
  nameToSkin,
  hslToHex,
  ROLE_COLORS,
  ACTIVITY_ICONS,
  ACTIVITY_COLORS,
} from './coordUtils';

/**
 * Sims-style 3D character: rounded body with shirt/pants distinction,
 * sphere head with face details, hands, shoes, role badge,
 * smooth animations via useFrame, Html overlays for bubbles.
 */

function getCharacterAnimation(visualState, activity) {
  if (!visualState) return 'idle';
  if (visualState.includes('walking')) return 'walking';
  if (visualState === AGENT_VISUAL_STATE.WORKING_AT_DESK) {
    if (activity === 'editing' || activity === 'running_command') return 'typing';
    if (activity === 'thinking') return 'thinking';
    return 'idle';
  }
  if (visualState === AGENT_VISUAL_STATE.THINKING_AT_DESK) return 'thinking';
  if (visualState === AGENT_VISUAL_STATE.CHATTING_AT_COOLER) return 'talking';
  if (visualState === AGENT_VISUAL_STATE.IDLE_AT_COFFEE) return 'idle';
  if (visualState === AGENT_VISUAL_STATE.SITTING_ON_COUCH) return 'idle';
  return 'idle';
}

function facingToAngle(facing) {
  switch (facing) {
    case 'down': return 0;
    case 'left': return Math.PI / 2;
    case 'up': return Math.PI;
    case 'right': return -Math.PI / 2;
    default: return 0;
  }
}

const Character3D = memo(function Character3D({
  agent,
  position2D,
  visualState,
  activity,
  bubble,
  onClick,
  isIdle,
  isWorking,
}) {
  const groupRef = useRef();
  const targetPos = useRef(new THREE.Vector3());
  const currentPos = useRef(new THREE.Vector3());
  const targetRotY = useRef(0);
  const currentRotY = useRef(0);
  const initialized = useRef(false);
  const headRef = useRef();
  const torsoRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();

  const accent = useMemo(() => hslToHex(nameToColor(agent.name)), [agent.name]);
  const defaultSkin = useMemo(() => nameToSkin(agent.name), [agent.name]);
  const skin = agent.skinColor || defaultSkin;
  const roleColor = agent.role ? ROLE_COLORS[agent.role] : null;
  const animation = getCharacterAnimation(visualState, activity);
  const agentHat = agent.hat || null;
  const agentPet = agent.pet || null;

  // Slightly darker accent for shirt detail
  const accentDark = useMemo(() => {
    const c = new THREE.Color(accent);
    c.multiplyScalar(0.7);
    return '#' + c.getHexString();
  }, [accent]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (position2D) {
      const [tx, , tz] = map2Dto3D(position2D.x, position2D.y);
      targetPos.current.set(tx, 0, tz);
    }

    if (!initialized.current && position2D) {
      currentPos.current.copy(targetPos.current);
      groupRef.current.position.copy(currentPos.current);
      initialized.current = true;
    }

    currentPos.current.lerp(targetPos.current, Math.min(1, delta * 8));
    groupRef.current.position.copy(currentPos.current);

    if (position2D) {
      targetRotY.current = facingToAngle(position2D.facing);
    }
    let diff = targetRotY.current - currentRotY.current;
    if (diff > Math.PI) diff -= Math.PI * 2;
    if (diff < -Math.PI) diff += Math.PI * 2;
    currentRotY.current += diff * Math.min(1, delta * 6);
    groupRef.current.rotation.y = currentRotY.current;

    const t = state.clock.elapsedTime;

    // Animation logic
    if (animation === 'idle') {
      if (torsoRef.current) torsoRef.current.position.y = 1.6 + Math.sin(t * 1.5) * 0.03;
      if (headRef.current) headRef.current.position.y = 3.0 + Math.sin(t * 1.5) * 0.03;
    } else if (animation === 'walking') {
      const bounce = Math.abs(Math.sin(t * 8)) * 0.12;
      if (torsoRef.current) torsoRef.current.position.y = 1.6 + bounce;
      if (headRef.current) headRef.current.position.y = 3.0 + bounce;
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t * 8) * 0.5;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.sin(t * 8) * 0.5;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -Math.sin(t * 8) * 0.4;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t * 8) * 0.4;
    } else if (animation === 'typing') {
      if (torsoRef.current) torsoRef.current.rotation.x = -0.08;
      if (headRef.current) headRef.current.position.y = 2.95;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -0.6 + Math.sin(t * 12) * 0.12;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -0.6 - Math.sin(t * 12) * 0.12;
    } else if (animation === 'thinking') {
      if (torsoRef.current) {
        torsoRef.current.rotation.z = Math.sin(t * 1.2) * 0.04;
        torsoRef.current.position.y = 1.6;
      }
      if (headRef.current) {
        headRef.current.rotation.z = Math.sin(t * 1.2) * 0.06;
        headRef.current.position.y = 3.0;
      }
      if (leftArmRef.current) leftArmRef.current.rotation.x = -0.5;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
    } else if (animation === 'talking') {
      if (torsoRef.current) torsoRef.current.position.y = 1.6 + Math.sin(t * 5) * 0.025;
      if (headRef.current) headRef.current.position.y = 3.0 + Math.sin(t * 5) * 0.025;
      if (leftArmRef.current) leftArmRef.current.rotation.z = Math.sin(t * 3) * 0.15;
      if (rightArmRef.current) rightArmRef.current.rotation.z = -Math.sin(t * 3 + 1) * 0.15;
    }

    // Smooth reset for inactive states
    if (animation !== 'walking') {
      if (leftLegRef.current) leftLegRef.current.rotation.x *= 0.9;
      if (rightLegRef.current) rightLegRef.current.rotation.x *= 0.9;
    }
    if (animation !== 'typing' && animation !== 'thinking' && animation !== 'walking') {
      if (leftArmRef.current) leftArmRef.current.rotation.x *= 0.9;
      if (rightArmRef.current) rightArmRef.current.rotation.x *= 0.9;
    }
    if (animation !== 'talking') {
      if (leftArmRef.current) leftArmRef.current.rotation.z *= 0.9;
      if (rightArmRef.current) rightArmRef.current.rotation.z *= 0.9;
    }
    if (animation !== 'typing' && animation !== 'thinking') {
      if (torsoRef.current) {
        torsoRef.current.rotation.x *= 0.9;
        torsoRef.current.rotation.z *= 0.9;
      }
      if (headRef.current) headRef.current.rotation.z *= 0.9;
    }
  });

  const [hovered, setHovered] = useState(false);
  const activityIcon = isWorking ? ACTIVITY_ICONS[activity] : null;
  const activityGlow = isWorking ? (ACTIVITY_COLORS[activity] || null) : null;
  const showThought = activity === 'thinking' && isWorking;

  return (
    <group ref={groupRef}>
      {/* Click hitbox */}
      <mesh
        position={[0, 1.8, 0]}
        onClick={(e) => { e.stopPropagation(); onClick?.(); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
      >
        <boxGeometry args={[2, 4.5, 2]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* === TORSO === */}
      <group ref={torsoRef} position={[0, 1.6, 0]}>
        {/* Upper body (shirt) */}
        <mesh castShadow>
          <capsuleGeometry args={[0.5, 0.7, 4, 12]} />
          <meshStandardMaterial color={accent} roughness={0.7} />
        </mesh>
        {/* Shirt collar detail */}
        <mesh position={[0, 0.5, 0.2]}>
          <boxGeometry args={[0.4, 0.15, 0.15]} />
          <meshStandardMaterial color={accentDark} />
        </mesh>
      </group>

      {/* === HIPS / PANTS === */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <capsuleGeometry args={[0.4, 0.2, 4, 10]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.8} />
      </mesh>

      {/* === HEAD === */}
      <group ref={headRef} position={[0, 3.0, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.55, 16, 16]} />
          <meshStandardMaterial color={skin} roughness={0.8} />
        </mesh>
        {/* Hair */}
        <mesh position={[0, 0.25, 0]}>
          <sphereGeometry args={[0.52, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color={accent} roughness={0.9} />
        </mesh>
        {/* Eyes */}
        <mesh position={[0.18, 0.05, 0.45]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
        <mesh position={[-0.18, 0.05, 0.45]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
        {/* Pupils */}
        <mesh position={[0.18, 0.05, 0.53]}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        <mesh position={[-0.18, 0.05, 0.53]}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        {/* Nose */}
        <mesh position={[0, -0.05, 0.5]}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshStandardMaterial color={skin} roughness={0.9} />
        </mesh>
        {/* Mouth */}
        <mesh position={[0, -0.2, 0.48]}>
          <boxGeometry args={[0.18, 0.04, 0.04]} />
          <meshStandardMaterial color="#8B4040" />
        </mesh>
        {/* Ears */}
        <mesh position={[0.52, 0, 0]}>
          <sphereGeometry args={[0.1, 6, 6]} />
          <meshStandardMaterial color={skin} />
        </mesh>
        <mesh position={[-0.52, 0, 0]}>
          <sphereGeometry args={[0.1, 6, 6]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      </group>

      {/* === ARMS === */}
      {/* Left arm */}
      <group ref={leftArmRef} position={[-0.7, 2, 0]}>
        {/* Upper arm */}
        <mesh castShadow>
          <capsuleGeometry args={[0.14, 0.5, 4, 8]} />
          <meshStandardMaterial color={accent} roughness={0.7} />
        </mesh>
        {/* Forearm (skin) */}
        <mesh position={[0, -0.5, 0.1]}>
          <capsuleGeometry args={[0.12, 0.4, 4, 8]} />
          <meshStandardMaterial color={skin} roughness={0.8} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.85, 0.15]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      </group>
      {/* Right arm */}
      <group ref={rightArmRef} position={[0.7, 2, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.14, 0.5, 4, 8]} />
          <meshStandardMaterial color={accent} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.5, 0.1]}>
          <capsuleGeometry args={[0.12, 0.4, 4, 8]} />
          <meshStandardMaterial color={skin} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.85, 0.15]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      </group>

      {/* === LEGS === */}
      {/* Left leg */}
      <group ref={leftLegRef} position={[-0.22, 0.55, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.16, 0.6, 4, 8]} />
          <meshStandardMaterial color="#3a3a4a" roughness={0.8} />
        </mesh>
        {/* Shoe */}
        <mesh position={[0, -0.55, 0.1]}>
          <boxGeometry args={[0.3, 0.15, 0.45]} />
          <meshStandardMaterial color="#2a1a0a" roughness={0.6} />
        </mesh>
      </group>
      {/* Right leg */}
      <group ref={rightLegRef} position={[0.22, 0.55, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.16, 0.6, 4, 8]} />
          <meshStandardMaterial color="#3a3a4a" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.55, 0.1]}>
          <boxGeometry args={[0.3, 0.15, 0.45]} />
          <meshStandardMaterial color="#2a1a0a" roughness={0.6} />
        </mesh>
      </group>

      {/* === ROLE BADGE === */}
      {roleColor && (
        <group position={[0, 3.8, 0]}>
          <mesh>
            <sphereGeometry args={[0.18, 10, 10]} />
            <meshStandardMaterial
              color={roleColor}
              emissive={roleColor}
              emissiveIntensity={0.9}
            />
          </mesh>
          {/* Floating ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.28, 0.03, 8, 16]} />
            <meshStandardMaterial color={roleColor} transparent opacity={0.5} />
          </mesh>
        </group>
      )}

      {/* === HAT === */}
      {agentHat === 'hardhat' && (
        <group position={[0, 3.65, 0]}>
          <mesh>
            <sphereGeometry args={[0.58, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color="#f5c542" roughness={0.4} />
          </mesh>
          {/* Brim */}
          <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.72, 0.72, 0.06, 16]} />
            <meshStandardMaterial color="#f5c542" roughness={0.5} />
          </mesh>
        </group>
      )}
      {agentHat === 'tophat' && (
        <group position={[0, 3.75, 0]}>
          {/* Cylinder */}
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.35, 0.38, 0.8, 12]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.3} />
          </mesh>
          {/* Brim */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.06, 16]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.3} />
          </mesh>
        </group>
      )}
      {agentHat === 'beanie' && (
        <group position={[0, 3.55, 0]}>
          <mesh>
            <sphereGeometry args={[0.56, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            <meshStandardMaterial color="#da3633" roughness={0.9} />
          </mesh>
          {/* Pom-pom */}
          <mesh position={[0, 0.45, 0]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="#fff" roughness={0.9} />
          </mesh>
        </group>
      )}
      {agentHat === 'crown' && (
        <group position={[0, 3.6, 0]}>
          <mesh>
            <cylinderGeometry args={[0.45, 0.5, 0.35, 5]} />
            <meshStandardMaterial color="#f5c542" roughness={0.3} metalness={0.6} />
          </mesh>
          {/* Jewel */}
          <mesh position={[0, 0, 0.45]}>
            <sphereGeometry args={[0.08, 6, 6]} />
            <meshStandardMaterial color="#da3633" emissive="#da3633" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}
      {agentHat === 'wizard' && (
        <group position={[0, 3.65, 0]}>
          {/* Cone */}
          <mesh position={[0, 0.45, 0]}>
            <coneGeometry args={[0.45, 1.0, 12]} />
            <meshStandardMaterial color="#6e40c9" roughness={0.7} />
          </mesh>
          {/* Brim */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.7, 0.7, 0.05, 16]} />
            <meshStandardMaterial color="#6e40c9" roughness={0.7} />
          </mesh>
          {/* Star */}
          <mesh position={[0, 0.55, 0.35]}>
            <sphereGeometry args={[0.07, 6, 6]} />
            <meshStandardMaterial color="#f5c542" emissive="#f5c542" emissiveIntensity={1.2} />
          </mesh>
        </group>
      )}

      {/* === PET === */}
      {agentPet && (
        <Html position={[1.2, 0.3, 0.5]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            fontSize: 18, lineHeight: 1,
            animation: 'sprite-idle 2.5s ease-in-out infinite',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
          }}>
            {{ cat: '🐱', dog: '🐶', bird: '🐦', robot: '🤖', duck: '🦆' }[agentPet] || ''}
          </div>
        </Html>
      )}

      {/* === NAME TAG (hover only) === */}
      {hovered && (
        <Html position={[0, 4.2, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#e6edf3',
            background: '#161b22dd',
            padding: '2px 8px',
            borderRadius: 6,
            whiteSpace: 'nowrap',
            border: '1px solid #30363d',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}>
            {agent.name}
            {agent.role && (
              <span style={{
                fontSize: 8,
                color: ROLE_COLORS[agent.role] || '#8b949e',
                textTransform: 'uppercase',
                fontWeight: 800,
              }}>
                {agent.role}
              </span>
            )}
          </div>
        </Html>
      )}

      {/* === SPEECH BUBBLE === */}
      {bubble && bubble.visible && bubble.text && (
        <Html position={[0, 4.8, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            background: bubble.type === 'thought' ? '#21262d' : '#f0f0f0',
            color: bubble.type === 'thought' ? '#d2a8ff' : '#1a1f27',
            borderRadius: 12,
            padding: '5px 12px',
            fontSize: 11,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            boxShadow: '0 3px 12px rgba(0,0,0,0.3)',
            maxWidth: 150,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            border: bubble.type === 'thought' ? '1px solid #30363d' : '1px solid #ddd',
            fontFamily: bubble.type === 'thought' ? 'monospace' : 'system-ui, -apple-system, sans-serif',
          }}>
            {bubble.text}
          </div>
        </Html>
      )}

      {/* === THOUGHT BUBBLE === */}
      {showThought && !bubble?.visible && (
        <Html position={[0, 4.8, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            background: '#21262d',
            border: '1px solid #30363d',
            borderRadius: 16,
            padding: '4px 12px',
            fontSize: 12,
            color: '#d2a8ff',
            fontFamily: 'monospace',
          }}>
            ...
          </div>
        </Html>
      )}
    </group>
  );
});

export default Character3D;
