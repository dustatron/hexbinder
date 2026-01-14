import type {
  DungeonRoom,
  RoomConnection,
} from "~/models";
import { SeededRandom } from "./SeededRandom";

export interface ConnectionGeneratorOptions {
  seed: string;
  rooms: DungeonRoom[];
  minConnections?: number;
  maxLoops?: number;
}

/**
 * Generate connections between dungeon rooms.
 * Ensures all rooms are reachable and adds optional loops.
 */
export function generateDungeonConnections(
  options: ConnectionGeneratorOptions
): RoomConnection[] {
  const { seed, rooms, minConnections = 1, maxLoops = 3 } = options;
  const rng = new SeededRandom(`${seed}-connections`);

  const connections: RoomConnection[] = [];
  const connectionTypes: RoomConnection["type"][] = [
    "door", "door", "archway", "passage", "stairs", "ladder", "secret",
  ];

  if (rooms.length === 0) return connections;

  // Phase 1: Create spanning tree (ensures all rooms connected)
  const connected = new Set<string>([rooms[0].id]);
  const unconnected = new Set(rooms.slice(1).map((r) => r.id));

  while (unconnected.size > 0) {
    // Pick a random unconnected room
    const unconnectedArray = Array.from(unconnected);
    const targetId = rng.pick(unconnectedArray);
    const targetRoom = rooms.find((r) => r.id === targetId)!;

    // Connect to a random connected room (prefer nearby depth)
    const connectedArray = Array.from(connected);
    const candidates = connectedArray
      .map((id) => rooms.find((r) => r.id === id)!)
      .filter((r) => r !== undefined);

    // Prefer rooms at similar or adjacent depth
    const sameDepth = candidates.filter((r) => Math.abs(r.depth - targetRoom.depth) <= 1);
    const sourceRoom = sameDepth.length > 0 ? rng.pick(sameDepth) : rng.pick(candidates);

    // Determine connection type based on depth difference
    let connectionType: RoomConnection["type"];
    if (sourceRoom.depth !== targetRoom.depth) {
      connectionType = rng.pick(["stairs", "ladder", "passage"]);
    } else {
      connectionType = rng.pick(connectionTypes);
    }

    connections.push({
      fromRoomId: sourceRoom.id,
      toRoomId: targetId,
      type: connectionType,
      locked: rng.chance(0.1),
      hidden: connectionType === "secret",
    });

    connected.add(targetId);
    unconnected.delete(targetId);
  }

  // Phase 2: Add loop connections for alternate routes
  const loopCount = Math.min(
    rng.between(0, maxLoops),
    Math.floor(rooms.length * 0.3)
  );

  for (let i = 0; i < loopCount; i++) {
    const fromRoom = rng.pick(rooms);
    const toRoom = rng.pick(rooms);

    if (fromRoom.id === toRoom.id) continue;

    // Check if connection already exists
    const exists = connections.some(
      (c) =>
        (c.fromRoomId === fromRoom.id && c.toRoomId === toRoom.id) ||
        (c.fromRoomId === toRoom.id && c.toRoomId === fromRoom.id)
    );

    if (!exists) {
      connections.push({
        fromRoomId: fromRoom.id,
        toRoomId: toRoom.id,
        type: rng.pick(connectionTypes),
        locked: rng.chance(0.2),
        hidden: rng.chance(0.15),
      });
    }
  }

  return connections;
}

/**
 * Validate that all rooms are reachable from the entrance.
 */
export function validateConnectivity(
  rooms: DungeonRoom[],
  connections: RoomConnection[],
  entranceId: string
): { valid: boolean; unreachable: string[] } {
  const reachable = new Set<string>();
  const queue = [entranceId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (reachable.has(current)) continue;
    reachable.add(current);

    // Find all connections from/to this room
    for (const conn of connections) {
      if (conn.fromRoomId === current && !reachable.has(conn.toRoomId)) {
        queue.push(conn.toRoomId);
      }
      if (conn.toRoomId === current && !reachable.has(conn.fromRoomId)) {
        queue.push(conn.fromRoomId);
      }
    }
  }

  const unreachable = rooms
    .filter((r) => !reachable.has(r.id))
    .map((r) => r.id);

  return {
    valid: unreachable.length === 0,
    unreachable,
  };
}

/**
 * Get all rooms adjacent to a given room.
 */
export function getAdjacentRooms(
  roomId: string,
  connections: RoomConnection[]
): string[] {
  const adjacent: string[] = [];

  for (const conn of connections) {
    if (conn.fromRoomId === roomId) {
      adjacent.push(conn.toRoomId);
    }
    if (conn.toRoomId === roomId) {
      adjacent.push(conn.fromRoomId);
    }
  }

  return adjacent;
}

/**
 * Find the shortest path between two rooms.
 */
export function findRoomPath(
  startId: string,
  endId: string,
  connections: RoomConnection[]
): string[] | null {
  const visited = new Set<string>();
  const queue: { id: string; path: string[] }[] = [
    { id: startId, path: [startId] },
  ];

  while (queue.length > 0) {
    const { id, path } = queue.shift()!;

    if (id === endId) {
      return path;
    }

    if (visited.has(id)) continue;
    visited.add(id);

    const adjacent = getAdjacentRooms(id, connections);
    for (const nextId of adjacent) {
      if (!visited.has(nextId)) {
        queue.push({ id: nextId, path: [...path, nextId] });
      }
    }
  }

  return null;
}
