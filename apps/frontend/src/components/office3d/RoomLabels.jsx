import React from 'react';
import { Html } from '@react-three/drei';
import { ROOMS } from './coordUtils';

/**
 * Floating room name labels — styled like signs hanging in the room.
 */
export default function RoomLabels() {
  const breakRoom = ROOMS.breakRoom.center;
  const workspace = ROOMS.workspace.center;
  const hallway = ROOMS.hallway.center;

  const signStyle = {
    fontSize: 12,
    fontWeight: 800,
    color: '#5a4a32',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    background: '#f5e6c8',
    padding: '4px 14px',
    borderRadius: 4,
    border: '2px solid #c9a96e',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
  };

  return (
    <group>
      <Html position={[breakRoom[0], 6.2, breakRoom[2] - 10]} center>
        <div style={signStyle}>Break Room</div>
      </Html>
      <Html position={[workspace[0], 6.2, workspace[2] - 10]} center>
        <div style={signStyle}>Workspace</div>
      </Html>
      <Html position={[hallway[0], 6.2, hallway[2]]} center>
        <div style={{ ...signStyle, fontSize: 10, padding: '3px 10px' }}>Hallway</div>
      </Html>
    </group>
  );
}
