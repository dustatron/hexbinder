import type { Hex, HexCoord, TerrainType } from "~/models";
import { SeededRandom } from "./SeededRandom";
import { hexSpiral, coordKey, getNeighbors } from "~/lib/hex-utils";

/**
 * Terrain types arranged in a circular loop for Shadowdark-style generation.
 * Rolling on the "New Hex" table moves up/down this list.
 */
const TERRAIN_LOOP: TerrainType[] = [
  "plains",
  "forest",
  "hills",
  "mountains",
  "swamp",
  "water",
];

/** Map size presets */
export type MapSize = "small" | "medium" | "large";

const MAP_RADII: Record<MapSize, number> = {
  small: 3,    // ~37 hexes
  medium: 5,   // ~91 hexes
  large: 8,    // ~217 hexes
};

/** Starting position options */
export type StartPosition = "center" | "left" | "right";

export interface SpiralTerrainOptions {
  seed: string;
  mapSize: MapSize;
  startPosition: StartPosition;
}

export interface SpiralTerrainResult {
  hexes: Hex[];
  startCoord: HexCoord;
  poiCoords: HexCoord[];  // Points of interest for location placement
}

/**
 * Get terrain index in the loop
 */
function getTerrainIndex(terrain: TerrainType): number {
  return TERRAIN_LOOP.indexOf(terrain);
}

/**
 * Get terrain at index (wraps around)
 */
function getTerrainAtIndex(index: number): TerrainType {
  const len = TERRAIN_LOOP.length;
  return TERRAIN_LOOP[((index % len) + len) % len];
}

/**
 * Roll for new hex terrain based on parent.
 * Biased toward same terrain with gradual shifts for natural feel.
 * Returns terrain and whether this hex is a Point of Interest.
 */
function rollNewHex(rng: SeededRandom, parentTerrain: TerrainType): { terrain: TerrainType; isPOI: boolean } {
  const roll = rng.between(1, 10);
  const parentIndex = getTerrainIndex(parentTerrain);

  let shift: number;
  let isPOI = false;

  // 60% same, 20% +1, 15% -1, 5% POI with shift
  if (roll <= 6) {
    shift = 0;  // Same terrain (60%)
  } else if (roll <= 8) {
    shift = 1;  // Shift forward (20%)
  } else if (roll === 9) {
    shift = -1; // Shift back (10%)
  } else {
    shift = rng.pick([-1, 1]);  // POI with shift (10%)
    isPOI = true;
  }

  return {
    terrain: getTerrainAtIndex(parentIndex + shift),
    isPOI,
  };
}

/**
 * Calculate the starting coordinate based on position and map size.
 * All positions are on the center row (r=0).
 */
function getStartCoord(mapSize: MapSize, position: StartPosition): HexCoord {
  const radius = MAP_RADII[mapSize];

  switch (position) {
    case "center":
      return { q: 0, r: 0 };
    case "left":
      // Leftmost hex on center row
      return { q: -radius, r: 0 };
    case "right":
      // Rightmost hex on center row
      return { q: radius, r: 0 };
  }
}

/**
 * Find the dominant terrain among neighbors for better clustering.
 * Returns the most common terrain type from generated neighbors.
 */
function findParentTerrain(
  coord: HexCoord,
  hexMap: Map<string, Hex>,
  rng: SeededRandom
): TerrainType {
  const neighbors = getNeighbors(coord);
  const terrainCounts = new Map<TerrainType, number>();

  for (const neighbor of neighbors) {
    const hex = hexMap.get(coordKey(neighbor));
    if (hex) {
      terrainCounts.set(hex.terrain, (terrainCounts.get(hex.terrain) || 0) + 1);
    }
  }

  if (terrainCounts.size === 0) {
    return "plains"; // Fallback
  }

  // Find max count
  let maxCount = 0;
  const candidates: TerrainType[] = [];

  for (const [terrain, count] of terrainCounts) {
    if (count > maxCount) {
      maxCount = count;
      candidates.length = 0;
      candidates.push(terrain);
    } else if (count === maxCount) {
      candidates.push(terrain);
    }
  }

  // If tie, pick randomly for variety
  return candidates.length === 1 ? candidates[0] : rng.pick(candidates);
}

/**
 * Generate terrain using spiral pattern from center outward.
 * Each hex inherits/shifts terrain from nearest generated neighbor.
 */
export function generateSpiralTerrain(options: SpiralTerrainOptions): SpiralTerrainResult {
  const { seed, mapSize, startPosition } = options;
  const rng = new SeededRandom(seed);
  const radius = MAP_RADII[mapSize];

  // Calculate world center (0,0) and start position
  const worldCenter: HexCoord = { q: 0, r: 0 };
  const startCoord = getStartCoord(mapSize, startPosition);

  const hexMap = new Map<string, Hex>();
  const poiCoords: HexCoord[] = [];

  // Seed some varied terrain at compass points for biome diversity
  const seedPoints: { coord: HexCoord; terrain: TerrainType }[] = [
    { coord: { q: 0, r: -radius + 1 }, terrain: "hills" },      // North
    { coord: { q: radius - 1, r: 0 }, terrain: "forest" },      // East
    { coord: { q: 0, r: radius - 1 }, terrain: "swamp" },       // South
    { coord: { q: -radius + 1, r: 0 }, terrain: "mountains" },  // West
  ];
  const seedKeys = new Set(seedPoints.map(s => coordKey(s.coord)));

  // Generate hexes in spiral order from world center
  for (const coord of hexSpiral(worldCenter, radius)) {
    const key = coordKey(coord);

    // First hex (center) gets plains
    if (hexMap.size === 0) {
      hexMap.set(key, { coord, terrain: "plains" });
      continue;
    }

    // Check if this is a seed point
    const seedPoint = seedPoints.find(s => s.coord.q === coord.q && s.coord.r === coord.r);
    if (seedPoint) {
      hexMap.set(key, { coord, terrain: seedPoint.terrain });
      continue;
    }

    // Find dominant terrain among neighbors
    const parentTerrain = findParentTerrain(coord, hexMap, rng);

    // Roll new terrain based on parent
    const { terrain, isPOI } = rollNewHex(rng, parentTerrain);

    hexMap.set(key, { coord, terrain });

    if (isPOI) {
      poiCoords.push(coord);
    }
  }

  // Ensure start position is plains (for settlement)
  const startKey = coordKey(startCoord);
  const startHex = hexMap.get(startKey);
  if (startHex) {
    startHex.terrain = "plains";
  }

  return {
    hexes: Array.from(hexMap.values()),
    startCoord,
    poiCoords,
  };
}

/**
 * Get the radius for a map size.
 */
export function getMapRadius(size: MapSize): number {
  return MAP_RADII[size];
}
