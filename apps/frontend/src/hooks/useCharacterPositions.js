import { useRef, useEffect, useState, useCallback } from 'react';
import { AGENT_VISUAL_STATE } from '@agent-deck/shared';

/**
 * Named positions in the office floor plan.
 * These define waypoints for character movement.
 */
const POSITIONS = {
  coffeeArea: { x: 80, y: 180 },
  waterCooler: { x: 160, y: 180 },
  couch: { x: 120, y: 300 },
  breakRoomDoor: { x: 220, y: 270 },
  hallwayMid: { x: 350, y: 270 },
  workspaceDoor: { x: 480, y: 270 },
};

// Desk grid: 2 rows × 4 columns, starting from workspace area
function getDeskPosition(index) {
  const col = index % 4;
  const row = Math.floor(index / 4);
  return {
    x: 530 + col * 140,
    y: 140 + row * 170,
  };
}

// Idle wander spots within break room
const IDLE_SPOTS = [
  POSITIONS.coffeeArea,
  POSITIONS.waterCooler,
  POSITIONS.couch,
  { x: 100, y: 240 }, // between coffee and couch
  { x: 160, y: 250 }, // near door
];

/**
 * Waypoint graph for pathfinding between named areas.
 * Returns an array of positions to walk through.
 */
function getPath(from, to) {
  // Simple waypoint routing: break room → door → hallway → workspace door → desk
  const breakRoomPositions = ['coffeeArea', 'waterCooler', 'couch'];
  const isFromBreakRoom = breakRoomPositions.some(
    (name) => Math.abs(from.x - POSITIONS[name].x) < 60 && Math.abs(from.y - POSITIONS[name].y) < 60
  );
  const isToBreakRoom = breakRoomPositions.some(
    (name) => Math.abs(to.x - POSITIONS[name].x) < 60 && Math.abs(to.y - POSITIONS[name].y) < 60
  );
  const isToDesk = to.x >= 500;
  const isFromDesk = from.x >= 500;

  const path = [];

  if (isFromBreakRoom && isToDesk) {
    path.push(POSITIONS.breakRoomDoor, POSITIONS.hallwayMid, POSITIONS.workspaceDoor, to);
  } else if (isFromDesk && isToBreakRoom) {
    path.push(POSITIONS.workspaceDoor, POSITIONS.hallwayMid, POSITIONS.breakRoomDoor, to);
  } else if (isFromBreakRoom && !isToBreakRoom) {
    path.push(POSITIONS.breakRoomDoor, to);
  } else if (isFromDesk && !isToDesk) {
    path.push(POSITIONS.workspaceDoor, to);
  } else {
    path.push(to);
  }

  return path;
}

function getFacing(dx, dy) {
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  }
  return dy > 0 ? 'down' : 'up';
}

const SPEED = 120; // pixels per second

/**
 * Hook that manages character (x, y) positions and smooth interpolation.
 *
 * @param {Array} agents
 * @param {Object} visualStates - { [agentId]: visualState }
 * @param {Object} activities - { [sessionId]: activityState }
 * @param {Array} sessions
 * @returns {{ positions: Object, deskAssignments: Object }}
 */
export default function useCharacterPositions(agents, visualStates, activities, sessions) {
  const [positions, setPositions] = useState({});
  const animFrameRef = useRef(null);
  const dataRef = useRef({}); // mutable character data for animation loop
  const deskAssignmentRef = useRef({}); // agentId → deskIndex

  // Assign desks to working agents
  const deskAssignments = (() => {
    const assignments = { ...deskAssignmentRef.current };
    const usedDesks = new Set(Object.values(assignments));
    let nextDesk = 0;

    for (const agent of agents) {
      const vs = visualStates[agent.id];
      const isWorking = vs === AGENT_VISUAL_STATE.WORKING_AT_DESK
        || vs === AGENT_VISUAL_STATE.THINKING_AT_DESK
        || vs === AGENT_VISUAL_STATE.WALKING_TO_DESK;

      if (isWorking && assignments[agent.id] === undefined) {
        while (usedDesks.has(nextDesk)) nextDesk++;
        assignments[agent.id] = nextDesk;
        usedDesks.add(nextDesk);
        nextDesk++;
      } else if (!isWorking && assignments[agent.id] !== undefined) {
        delete assignments[agent.id];
      }
    }

    // Clean removed agents
    for (const id of Object.keys(assignments)) {
      if (!agents.find((a) => a.id === id)) delete assignments[id];
    }

    deskAssignmentRef.current = assignments;
    return assignments;
  })();

  // Update targets based on visual states
  useEffect(() => {
    for (const agent of agents) {
      const vs = visualStates[agent.id];
      const data = dataRef.current[agent.id];

      let targetPos = null;

      switch (vs) {
        case AGENT_VISUAL_STATE.IDLE_AT_COFFEE:
          targetPos = POSITIONS.coffeeArea;
          break;
        case AGENT_VISUAL_STATE.CHATTING_AT_COOLER:
          targetPos = POSITIONS.waterCooler;
          break;
        case AGENT_VISUAL_STATE.SITTING_ON_COUCH:
          targetPos = POSITIONS.couch;
          break;
        case AGENT_VISUAL_STATE.WALKING_TO_DESK:
        case AGENT_VISUAL_STATE.WORKING_AT_DESK:
        case AGENT_VISUAL_STATE.THINKING_AT_DESK: {
          const deskIdx = deskAssignments[agent.id] ?? 0;
          targetPos = getDeskPosition(deskIdx);
          break;
        }
        case AGENT_VISUAL_STATE.WALKING_TO_COFFEE:
          targetPos = POSITIONS.coffeeArea;
          break;
        case AGENT_VISUAL_STATE.WALKING_TO_COOLER:
          targetPos = POSITIONS.waterCooler;
          break;
        default:
          targetPos = POSITIONS.coffeeArea;
      }

      if (!data) {
        // First time — place immediately
        dataRef.current[agent.id] = {
          current: { ...targetPos },
          target: { ...targetPos },
          path: [],
          pathIndex: 0,
          facing: 'down',
          moving: false,
        };
      } else if (
        Math.abs(data.target.x - targetPos.x) > 5 ||
        Math.abs(data.target.y - targetPos.y) > 5
      ) {
        // Target changed — compute new path
        const path = getPath(data.current, targetPos);
        data.target = { ...targetPos };
        data.path = path;
        data.pathIndex = 0;
        data.moving = true;
      }
    }

    // Clean removed agents
    for (const id of Object.keys(dataRef.current)) {
      if (!agents.find((a) => a.id === id)) {
        delete dataRef.current[id];
      }
    }
  }, [agents, visualStates, deskAssignments]);

  // Animation loop
  useEffect(() => {
    let lastTime = performance.now();

    function animate(now) {
      const dt = (now - lastTime) / 1000; // seconds
      lastTime = now;

      let changed = false;

      for (const [id, data] of Object.entries(dataRef.current)) {
        if (!data.moving || data.path.length === 0) continue;

        const waypoint = data.path[data.pathIndex];
        if (!waypoint) {
          data.moving = false;
          continue;
        }

        const dx = waypoint.x - data.current.x;
        const dy = waypoint.y - data.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 2) {
          // Reached waypoint
          data.current.x = waypoint.x;
          data.current.y = waypoint.y;
          data.pathIndex++;

          if (data.pathIndex >= data.path.length) {
            data.moving = false;
          }
          changed = true;
        } else {
          // Move toward waypoint
          const step = SPEED * dt;
          const ratio = Math.min(step / dist, 1);
          data.current.x += dx * ratio;
          data.current.y += dy * ratio;
          data.facing = getFacing(dx, dy);
          changed = true;
        }
      }

      if (changed) {
        setPositions(() => {
          const result = {};
          for (const [id, data] of Object.entries(dataRef.current)) {
            result[id] = {
              x: Math.round(data.current.x),
              y: Math.round(data.current.y),
              facing: data.facing,
              moving: data.moving,
            };
          }
          return result;
        });
      }

      animFrameRef.current = requestAnimationFrame(animate);
    }

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // Set initial positions
  useEffect(() => {
    setPositions(() => {
      const result = {};
      for (const [id, data] of Object.entries(dataRef.current)) {
        result[id] = {
          x: Math.round(data.current.x),
          y: Math.round(data.current.y),
          facing: data.facing,
          moving: data.moving,
        };
      }
      return result;
    });
  }, [agents.length]);

  return { positions, deskAssignments, POSITIONS, getDeskPosition };
}
