import {
  defineHex,
  Grid,
  rectangle,
  Orientation,
  type Hex,
  type HexCoordinates,
} from "honeycomb-grid";
import type { TerrainType } from "~/models";

// Hex size in pixels
export const HEX_SIZE = 50;

// Define hex class with pointy-top orientation
export const Tile = defineHex({
  dimensions: HEX_SIZE,
  orientation: Orientation.POINTY,
  origin: "topLeft",
});

export type TileType = InstanceType<typeof Tile>;

// Create a 7x7 hex grid
export function createHexGrid(width = 7, height = 7): Grid<TileType> {
  return new Grid(Tile, rectangle({ width, height }));
}

// Convert hex corners to SVG polygon points string
export function hexToPolygonPoints(hex: Hex): string {
  return hex.corners.map(({ x, y }) => `${x},${y}`).join(" ");
}

// Get pixel center of hex for icon/label placement
export function hexToCenter(hex: Hex): { x: number; y: number } {
  return { x: hex.x, y: hex.y };
}

// Get hex from grid by coordinates
export function getHexAt(
  grid: Grid<TileType>,
  coords: HexCoordinates
): TileType | undefined {
  return grid.getHex(coords);
}

// Terrain color mapping (Tailwind colors)
export const TERRAIN_COLORS: Record<TerrainType, string> = {
  plains: "#fde68a", // amber-200
  forest: "#16a34a", // green-600
  hills: "#fbbf24", // amber-400
  mountains: "#78716c", // stone-500
  water: "#60a5fa", // blue-400
  swamp: "#166534", // green-800
};

// Terrain border colors (darker variants)
export const TERRAIN_BORDER_COLORS: Record<TerrainType, string> = {
  plains: "#d97706", // amber-600
  forest: "#14532d", // green-900
  hills: "#b45309", // amber-700
  mountains: "#44403c", // stone-700
  water: "#1d4ed8", // blue-700
  swamp: "#14532d", // green-900
};

// Calculate viewBox for grid
export function calculateViewBox(grid: Grid<TileType>): {
  minX: number;
  minY: number;
  width: number;
  height: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  grid.forEach((hex) => {
    hex.corners.forEach((corner) => {
      minX = Math.min(minX, corner.x);
      minY = Math.min(minY, corner.y);
      maxX = Math.max(maxX, corner.x);
      maxY = Math.max(maxY, corner.y);
    });
  });

  const padding = HEX_SIZE * 0.5;
  return {
    minX: minX - padding,
    minY: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  };
}

// === Pathfinding Utilities ===

import type { HexCoord } from "~/models";

/** Axial direction vectors for hex neighbors (pointy-top) */
const AXIAL_DIRECTIONS: HexCoord[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

/** Get all 6 neighboring hex coordinates */
export function getNeighbors(coord: HexCoord): HexCoord[] {
  return AXIAL_DIRECTIONS.map((dir) => ({
    q: coord.q + dir.q,
    r: coord.r + dir.r,
  }));
}

/** Calculate distance between two hexes (axial coordinates) */
export function hexDistance(a: HexCoord, b: HexCoord): number {
  // Convert to cube coords and use cube distance
  const aq = a.q;
  const ar = a.r;
  const as = -aq - ar;
  const bq = b.q;
  const br = b.r;
  const bs = -bq - br;
  return Math.max(Math.abs(aq - bq), Math.abs(ar - br), Math.abs(as - bs));
}

/** Coordinate key for maps */
export function coordKey(coord: HexCoord): string {
  return `${coord.q},${coord.r}`;
}

/** Parse coordinate key back to HexCoord */
export function parseCoordKey(key: string): HexCoord {
  const [q, r] = key.split(",").map(Number);
  return { q, r };
}

/** Check if two coordinates are equal */
export function coordsEqual(a: HexCoord, b: HexCoord): boolean {
  return a.q === b.q && a.r === b.r;
}

/** Terrain movement costs for pathfinding (lower = easier) */
export const TERRAIN_COSTS: Record<TerrainType, number> = {
  plains: 1,
  hills: 2,
  forest: 3,
  swamp: 4,
  mountains: Infinity, // impassable
  water: Infinity, // impassable
};

/** Generate hex coordinates in a ring at given radius from center */
export function* hexRing(center: HexCoord, radius: number): Generator<HexCoord> {
  if (radius === 0) {
    yield center;
    return;
  }

  // Start at "corner" position (move radius steps in direction 4, which is q-1, r+1)
  let hex: HexCoord = {
    q: center.q + AXIAL_DIRECTIONS[4].q * radius,
    r: center.r + AXIAL_DIRECTIONS[4].r * radius,
  };

  // Walk around the ring
  for (let side = 0; side < 6; side++) {
    for (let step = 0; step < radius; step++) {
      yield hex;
      hex = {
        q: hex.q + AXIAL_DIRECTIONS[side].q,
        r: hex.r + AXIAL_DIRECTIONS[side].r,
      };
    }
  }
}

/** Generate all hex coordinates in spiral order from center outward */
export function* hexSpiral(center: HexCoord, radius: number): Generator<HexCoord> {
  for (let r = 0; r <= radius; r++) {
    yield* hexRing(center, r);
  }
}

/** Get all hex coordinates within radius (filled circle) */
export function getHexesInRadius(center: HexCoord, radius: number): HexCoord[] {
  return [...hexSpiral(center, radius)];
}

/** Count hexes in a filled circle of given radius */
export function countHexesInRadius(radius: number): number {
  // Ring 0 = 1, Ring n = 6n, total = 1 + 6*(1+2+...+n) = 1 + 3n(n+1)
  return 1 + 3 * radius * (radius + 1);
}

/** A* pathfinding between two hexes */
export function findPath(
  start: HexCoord,
  goal: HexCoord,
  getCost: (coord: HexCoord) => number,
  isValid: (coord: HexCoord) => boolean
): HexCoord[] | null {
  const openSet = new Set<string>([coordKey(start)]);
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>([[coordKey(start), 0]]);
  const fScore = new Map<string, number>([
    [coordKey(start), hexDistance(start, goal)],
  ]);

  while (openSet.size > 0) {
    // Find node with lowest fScore
    let currentKey = "";
    let lowestF = Infinity;
    for (const key of openSet) {
      const f = fScore.get(key) ?? Infinity;
      if (f < lowestF) {
        lowestF = f;
        currentKey = key;
      }
    }

    const current = parseCoordKey(currentKey);

    // Reached goal?
    if (coordsEqual(current, goal)) {
      // Reconstruct path
      const path: HexCoord[] = [current];
      let key = currentKey;
      while (cameFrom.has(key)) {
        key = cameFrom.get(key)!;
        path.unshift(parseCoordKey(key));
      }
      return path;
    }

    openSet.delete(currentKey);

    // Check neighbors
    for (const neighbor of getNeighbors(current)) {
      if (!isValid(neighbor)) continue;

      const neighborKey = coordKey(neighbor);
      const moveCost = getCost(neighbor);
      if (moveCost === Infinity) continue;

      const tentativeG = (gScore.get(currentKey) ?? Infinity) + moveCost;

      if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
        cameFrom.set(neighborKey, currentKey);
        gScore.set(neighborKey, tentativeG);
        fScore.set(neighborKey, tentativeG + hexDistance(neighbor, goal));
        openSet.add(neighborKey);
      }
    }
  }

  // No path found
  return null;
}
