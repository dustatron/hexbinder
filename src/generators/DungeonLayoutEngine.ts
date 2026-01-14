import { nanoid } from "nanoid";
import type {
  CellState,
  GridPoint,
  GridRect,
  PlacementDirection,
  RoomSize,
  RoomType,
  SpatialRoom,
  Passage,
  SpatialDungeon,
  DungeonSize,
  DungeonTheme,
  RoomConnection,
  RoomFeature,
  Hazard,
  RoomSecret,
  Encounter,
  TreasureEntry,
  HexCoord,
  ROOM_DIMENSIONS,
  DUNGEON_GRID_SIZES,
} from "~/models";
import { SeededRandom } from "./SeededRandom";

// Re-import constants (they're values, not types)
const ROOM_DIMS: Record<
  RoomSize,
  { minW: number; maxW: number; minH: number; maxH: number }
> = {
  cramped: { minW: 2, maxW: 3, minH: 2, maxH: 3 },
  small: { minW: 3, maxW: 4, minH: 3, maxH: 4 },
  medium: { minW: 4, maxW: 6, minH: 4, maxH: 6 },
  large: { minW: 5, maxW: 8, minH: 5, maxH: 8 },
  vast: { minW: 6, maxW: 9, minH: 6, maxH: 9 },
};

const GRID_SIZES: Record<DungeonSize, number> = {
  lair: 40,
  small: 60,
  medium: 80,
  large: 100,
  megadungeon: 150,
};

const DIRECTIONS: PlacementDirection[] = ["n", "s", "e", "w"];

/**
 * OccupancyGrid - Tracks cell usage for collision detection during dungeon generation.
 * Ported from Python dungeongen's occupancy_grid.py
 */
export class OccupancyGrid {
  private cells: CellState[][];
  readonly width: number;
  readonly height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.cells = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => "empty" as CellState)
    );
  }

  /** Get cell state at position */
  getCell(x: number, y: number): CellState {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return "blocked"; // Out of bounds treated as blocked
    }
    return this.cells[y][x];
  }

  /** Set cell state at position */
  setCell(x: number, y: number, state: CellState): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.cells[y][x] = state;
    }
  }

  /** Set all cells in a rectangle to a state */
  setRect(rect: GridRect, state: CellState): void {
    for (let dy = 0; dy < rect.height; dy++) {
      for (let dx = 0; dx < rect.width; dx++) {
        this.setCell(rect.x + dx, rect.y + dy, state);
      }
    }
  }

  /** Check if a rectangle area is clear (all cells are empty or allowed states) */
  isRectClear(rect: GridRect, allowStates: CellState[] = ["empty"]): boolean {
    for (let dy = 0; dy < rect.height; dy++) {
      for (let dx = 0; dx < rect.width; dx++) {
        const state = this.getCell(rect.x + dx, rect.y + dy);
        if (!allowStates.includes(state)) {
          return false;
        }
      }
    }
    return true;
  }

  /** Reserve perimeter around a room (1-cell buffer) */
  reservePerimeter(rect: GridRect): void {
    // Top and bottom edges
    for (let dx = -1; dx <= rect.width; dx++) {
      const topState = this.getCell(rect.x + dx, rect.y - 1);
      if (topState === "empty") {
        this.setCell(rect.x + dx, rect.y - 1, "reserved");
      }
      const bottomState = this.getCell(rect.x + dx, rect.y + rect.height);
      if (bottomState === "empty") {
        this.setCell(rect.x + dx, rect.y + rect.height, "reserved");
      }
    }
    // Left and right edges
    for (let dy = 0; dy < rect.height; dy++) {
      const leftState = this.getCell(rect.x - 1, rect.y + dy);
      if (leftState === "empty") {
        this.setCell(rect.x - 1, rect.y + dy, "reserved");
      }
      const rightState = this.getCell(rect.x + rect.width, rect.y + dy);
      if (rightState === "empty") {
        this.setCell(rect.x + rect.width, rect.y + dy, "reserved");
      }
    }
  }

  /**
   * A* pathfinding for passage routing.
   * Finds orthogonal path from start to end avoiding rooms.
   */
  findPassagePath(
    from: GridPoint,
    to: GridPoint,
    allowedRoomIds?: Set<string>
  ): GridPoint[] | null {
    const key = (p: GridPoint) => `${p.x},${p.y}`;

    // Priority queue: [f-score, g-score, point, path]
    type QueueItem = [number, number, GridPoint, GridPoint[]];
    const openSet: QueueItem[] = [];
    const closedSet = new Set<string>();

    const heuristic = (a: GridPoint, b: GridPoint) =>
      Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

    openSet.push([heuristic(from, to), 0, from, [from]]);

    const maxIterations = 5000;
    let iterations = 0;

    while (openSet.length > 0 && iterations < maxIterations) {
      iterations++;

      // Sort by f-score and pop lowest
      openSet.sort((a, b) => a[0] - b[0]);
      const [, g, current, path] = openSet.shift()!;

      const currentKey = key(current);
      if (closedSet.has(currentKey)) continue;
      closedSet.add(currentKey);

      // Reached destination?
      if (current.x === to.x && current.y === to.y) {
        return path;
      }

      // Explore neighbors (orthogonal only)
      const neighbors: GridPoint[] = [
        { x: current.x, y: current.y - 1 },
        { x: current.x, y: current.y + 1 },
        { x: current.x - 1, y: current.y },
        { x: current.x + 1, y: current.y },
      ];

      for (const next of neighbors) {
        const nextKey = key(next);
        if (closedSet.has(nextKey)) continue;

        const cellState = this.getCell(next.x, next.y);

        // Can traverse: empty, reserved, or passage (for crossings)
        // Cannot traverse: room, blocked
        const canTraverse =
          cellState === "empty" ||
          cellState === "reserved" ||
          cellState === "passage" ||
          (next.x === to.x && next.y === to.y); // Always allow destination

        if (!canTraverse) continue;

        // Prefer empty cells, penalize reserved and passages
        let moveCost = 1;
        if (cellState === "reserved") moveCost = 2;
        if (cellState === "passage") moveCost = 5; // Discourage crossings

        const newG = g + moveCost;
        const newF = newG + heuristic(next, to);

        openSet.push([newF, newG, next, [...path, next]]);
      }
    }

    return null; // No path found
  }

  /** Simplify path to waypoints (only keep turns) */
  simplifyPath(path: GridPoint[]): GridPoint[] {
    if (path.length <= 2) return path;

    const waypoints: GridPoint[] = [path[0]];

    for (let i = 1; i < path.length - 1; i++) {
      const prev = path[i - 1];
      const curr = path[i];
      const next = path[i + 1];

      // Check if direction changed
      const dx1 = curr.x - prev.x;
      const dy1 = curr.y - prev.y;
      const dx2 = next.x - curr.x;
      const dy2 = next.y - curr.y;

      if (dx1 !== dx2 || dy1 !== dy2) {
        waypoints.push(curr);
      }
    }

    waypoints.push(path[path.length - 1]);
    return waypoints;
  }

  /** Mark passage cells in grid */
  markPassage(waypoints: GridPoint[]): void {
    for (let i = 0; i < waypoints.length - 1; i++) {
      const from = waypoints[i];
      const to = waypoints[i + 1];

      // Horizontal or vertical segment
      const dx = Math.sign(to.x - from.x);
      const dy = Math.sign(to.y - from.y);

      let x = from.x;
      let y = from.y;

      while (x !== to.x || y !== to.y) {
        const state = this.getCell(x, y);
        if (state === "empty" || state === "reserved") {
          this.setCell(x, y, "passage");
        }
        x += dx;
        y += dy;
      }
      // Mark final cell
      const finalState = this.getCell(to.x, to.y);
      if (finalState === "empty" || finalState === "reserved") {
        this.setCell(to.x, to.y, "passage");
      }
    }
  }

  /** Debug: print ASCII representation of grid */
  toAscii(): string {
    const chars: Record<CellState, string> = {
      empty: ".",
      room: "#",
      passage: "+",
      reserved: " ",
      blocked: "X",
    };
    return this.cells.map((row) => row.map((c) => chars[c]).join("")).join("\n");
  }
}

/**
 * RoomPlacer - Places rooms on the occupancy grid with adjacent growth strategy.
 */
export class RoomPlacer {
  constructor(
    private grid: OccupancyGrid,
    private rng: SeededRandom
  ) {}

  /** Generate room dimensions for a given size */
  generateRoomDimensions(size: RoomSize): { width: number; height: number } {
    const dims = ROOM_DIMS[size];
    return {
      width: this.rng.between(dims.minW, dims.maxW),
      height: this.rng.between(dims.minH, dims.maxH),
    };
  }

  /** Place entrance room at center of grid */
  placeEntrance(size: RoomSize, type: RoomType = "entrance"): SpatialRoom | null {
    const dims = this.generateRoomDimensions(size);
    const centerX = Math.floor(this.grid.width / 2);
    const centerY = Math.floor(this.grid.height / 2);

    const bounds: GridRect = {
      x: centerX - Math.floor(dims.width / 2),
      y: centerY - Math.floor(dims.height / 2),
      width: dims.width,
      height: dims.height,
    };

    if (!this.grid.isRectClear(bounds)) {
      return null;
    }

    // Mark room in grid
    this.grid.setRect(bounds, "room");
    this.grid.reservePerimeter(bounds);

    return this.createSpatialRoom(bounds, type, size, 0);
  }

  /** Place a room adjacent to an anchor room */
  placeAdjacentRoom(
    anchor: SpatialRoom,
    size: RoomSize,
    type: RoomType,
    depth: number,
    preferredDirection?: PlacementDirection
  ): SpatialRoom | null {
    const dims = this.generateRoomDimensions(size);

    // Try preferred direction first, then shuffle others
    const directions = [...DIRECTIONS];
    if (preferredDirection) {
      const idx = directions.indexOf(preferredDirection);
      if (idx > 0) {
        directions.splice(idx, 1);
        directions.unshift(preferredDirection);
      }
    } else {
      this.rng.shuffle(directions);
    }

    for (const dir of directions) {
      const placement = this.findPlacementInDirection(anchor.bounds, dims, dir);
      if (placement && this.grid.isRectClear(placement)) {
        // Mark room in grid
        this.grid.setRect(placement, "room");
        this.grid.reservePerimeter(placement);

        return this.createSpatialRoom(placement, type, size, depth);
      }
    }

    return null;
  }

  /** Find placement position for a room adjacent to anchor in given direction */
  private findPlacementInDirection(
    anchor: GridRect,
    roomDims: { width: number; height: number },
    direction: PlacementDirection
  ): GridRect | null {
    const gap = 3; // Gap for passage (includes reserved cells)

    let x: number, y: number;

    switch (direction) {
      case "n":
        x = anchor.x + Math.floor((anchor.width - roomDims.width) / 2);
        y = anchor.y - gap - roomDims.height;
        break;
      case "s":
        x = anchor.x + Math.floor((anchor.width - roomDims.width) / 2);
        y = anchor.y + anchor.height + gap;
        break;
      case "e":
        x = anchor.x + anchor.width + gap;
        y = anchor.y + Math.floor((anchor.height - roomDims.height) / 2);
        break;
      case "w":
        x = anchor.x - gap - roomDims.width;
        y = anchor.y + Math.floor((anchor.height - roomDims.height) / 2);
        break;
    }

    // Bounds check
    if (
      x < 0 ||
      y < 0 ||
      x + roomDims.width > this.grid.width ||
      y + roomDims.height > this.grid.height
    ) {
      return null;
    }

    return { x, y, width: roomDims.width, height: roomDims.height };
  }

  /** Create a SpatialRoom object */
  private createSpatialRoom(
    bounds: GridRect,
    type: RoomType,
    size: RoomSize,
    depth: number
  ): SpatialRoom {
    return {
      id: `room-${nanoid(8)}`,
      name: this.getRoomName(type),
      description: `A ${size} ${type.replace("_", " ")}.`,
      type,
      size,
      depth,
      bounds,
      encounters: [],
      treasure: [],
      features: [],
      hazards: [],
      secrets: [],
      explored: false,
    };
  }

  /** Generate a room name based on type */
  private getRoomName(type: RoomType): string {
    const names: Record<RoomType, string[]> = {
      entrance: ["Entry Hall", "Gatehouse", "Antechamber", "Foyer"],
      corridor: ["Passage", "Hallway", "Gallery", "Tunnel"],
      chamber: ["Chamber", "Hall", "Room", "Vault"],
      lair: ["Lair", "Den", "Nest", "Burrow"],
      trap_room: ["Death Corridor", "Gauntlet", "Testing Ground"],
      treasury: ["Treasury", "Vault", "Hoard Room"],
      shrine: ["Shrine", "Chapel", "Altar Room", "Sanctuary"],
      prison: ["Dungeon Cells", "Oubliette", "Prison Block"],
      puzzle_room: ["Puzzle Chamber", "Trial Room", "Testing Grounds"],
    };
    return this.rng.pick(names[type]);
  }
}

/**
 * PassageRouter - Routes passages between rooms using A* pathfinding.
 */
export class PassageRouter {
  constructor(
    private grid: OccupancyGrid,
    private rng: SeededRandom
  ) {}

  /** Route a passage between two rooms */
  routePassage(
    from: SpatialRoom,
    to: SpatialRoom,
    connectionType: RoomConnection["type"] = "door"
  ): Passage | null {
    // Find connection points on room edges
    const fromPoint = this.findConnectionPoint(from, to);
    const toPoint = this.findConnectionPoint(to, from);

    if (!fromPoint || !toPoint) return null;

    // Find path using A*
    const path = this.grid.findPassagePath(fromPoint, toPoint);
    if (!path || path.length < 2) return null;

    // Simplify to waypoints
    const waypoints = this.grid.simplifyPath(path);

    // Mark passage in grid
    this.grid.markPassage(path);

    return {
      id: `passage-${nanoid(8)}`,
      fromRoomId: from.id,
      toRoomId: to.id,
      waypoints,
      connectionType,
      locked: this.rng.chance(0.15),
      hidden: connectionType === "secret",
    };
  }

  /** Find best connection point on room edge facing toward target room */
  private findConnectionPoint(
    room: SpatialRoom,
    target: SpatialRoom
  ): GridPoint | null {
    const roomCenterX = room.bounds.x + room.bounds.width / 2;
    const roomCenterY = room.bounds.y + room.bounds.height / 2;
    const targetCenterX = target.bounds.x + target.bounds.width / 2;
    const targetCenterY = target.bounds.y + target.bounds.height / 2;

    const dx = targetCenterX - roomCenterX;
    const dy = targetCenterY - roomCenterY;

    // Determine primary direction to target
    let exitX: number, exitY: number;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal connection
      if (dx > 0) {
        // Target is to the east
        exitX = room.bounds.x + room.bounds.width;
        exitY = room.bounds.y + Math.floor(room.bounds.height / 2);
      } else {
        // Target is to the west
        exitX = room.bounds.x - 1;
        exitY = room.bounds.y + Math.floor(room.bounds.height / 2);
      }
    } else {
      // Vertical connection
      if (dy > 0) {
        // Target is to the south
        exitX = room.bounds.x + Math.floor(room.bounds.width / 2);
        exitY = room.bounds.y + room.bounds.height;
      } else {
        // Target is to the north
        exitX = room.bounds.x + Math.floor(room.bounds.width / 2);
        exitY = room.bounds.y - 1;
      }
    }

    return { x: exitX, y: exitY };
  }
}

/**
 * Main layout generator that coordinates room placement and passage routing.
 */
export class DungeonLayoutGenerator {
  private grid!: OccupancyGrid;
  private placer!: RoomPlacer;
  private router!: PassageRouter;
  private rng: SeededRandom;

  constructor(seed: string) {
    this.rng = new SeededRandom(`${seed}-layout`);
  }

  /** Generate a complete spatial dungeon layout */
  generate(
    size: DungeonSize,
    theme: DungeonTheme,
    roomCount: number,
    hexCoord: HexCoord
  ): { rooms: SpatialRoom[]; passages: Passage[]; gridWidth: number; gridHeight: number } {
    const gridSize = GRID_SIZES[size];
    this.grid = new OccupancyGrid(gridSize, gridSize);
    this.placer = new RoomPlacer(this.grid, this.rng);
    this.router = new PassageRouter(this.grid, this.rng);

    const rooms: SpatialRoom[] = [];
    const passages: Passage[] = [];

    // Phase 1: Place entrance room
    const entranceSize = this.rng.pick<RoomSize>(["small", "medium"]);
    const entrance = this.placer.placeEntrance(entranceSize, "entrance");
    if (!entrance) {
      throw new Error("Failed to place entrance room");
    }
    rooms.push(entrance);

    // Room type weights (excluding entrance)
    const roomTypes: RoomType[] = [
      "corridor", "corridor",
      "chamber", "chamber", "chamber",
      "lair",
      "trap_room",
      "treasury",
      "shrine",
      "prison",
      "puzzle_room",
    ];

    const roomSizes: RoomSize[] = [
      "cramped", "cramped",
      "small", "small", "small",
      "medium", "medium",
      "large",
      "vast",
    ];

    // Phase 2: Place remaining rooms adjacent to existing rooms
    let attempts = 0;
    const maxAttempts = roomCount * 10;

    while (rooms.length < roomCount && attempts < maxAttempts) {
      attempts++;

      // Pick a random existing room as anchor (prefer rooms with fewer connections)
      const connectionCounts = new Map<string, number>();
      for (const p of passages) {
        connectionCounts.set(
          p.fromRoomId,
          (connectionCounts.get(p.fromRoomId) ?? 0) + 1
        );
        connectionCounts.set(
          p.toRoomId,
          (connectionCounts.get(p.toRoomId) ?? 0) + 1
        );
      }

      // Weight rooms by inverse connection count
      const weightedRooms = rooms.map((r) => ({
        room: r,
        weight: 1 / (1 + (connectionCounts.get(r.id) ?? 0)),
      }));
      const totalWeight = weightedRooms.reduce((sum, wr) => sum + wr.weight, 0);
      let pick = this.rng.next() * totalWeight;
      let anchor = rooms[0];
      for (const wr of weightedRooms) {
        pick -= wr.weight;
        if (pick <= 0) {
          anchor = wr.room;
          break;
        }
      }

      // Generate room properties
      const roomType = this.rng.pick(roomTypes);
      const roomSize = this.rng.pick(roomSizes);
      const depth = anchor.depth + 1;

      // Try to place adjacent room
      const newRoom = this.placer.placeAdjacentRoom(
        anchor,
        roomSize,
        roomType,
        depth
      );

      if (newRoom) {
        rooms.push(newRoom);

        // Route passage from anchor to new room
        const connectionType = this.rng.pick<RoomConnection["type"]>([
          "door", "door", "archway", "passage", "secret",
        ]);
        const passage = this.router.routePassage(anchor, newRoom, connectionType);
        if (passage) {
          passages.push(passage);
        }
      }
    }

    // Phase 3: Add some loop connections (30% of room count)
    const loopCount = Math.floor(rooms.length * 0.3);
    for (let i = 0; i < loopCount; i++) {
      const fromRoom = this.rng.pick(rooms);
      const toRoom = this.rng.pick(rooms);

      if (fromRoom.id === toRoom.id) continue;

      // Check if connection already exists
      const exists = passages.some(
        (p) =>
          (p.fromRoomId === fromRoom.id && p.toRoomId === toRoom.id) ||
          (p.fromRoomId === toRoom.id && p.toRoomId === fromRoom.id)
      );

      if (!exists) {
        const passage = this.router.routePassage(fromRoom, toRoom, "passage");
        if (passage) {
          passages.push(passage);
        }
      }
    }

    return {
      rooms,
      passages,
      gridWidth: gridSize,
      gridHeight: gridSize,
    };
  }

  /** Get ASCII debug output of the grid */
  getDebugAscii(): string {
    return this.grid?.toAscii() ?? "";
  }
}
