import type { Hex, HexCoord, TerrainType } from "~/models";
import { SeededRandom, createWeightedTable } from "./SeededRandom";
import { getNeighbors, coordKey } from "~/lib/hex-utils";

export interface TerrainClusterOptions {
  seed: string;
  hexes: Hex[];
  clusterSize?: number;
  clusterStrength?: number;
}

/**
 * Apply clustering to terrain to create more natural-looking regions.
 * Uses a cellular automata-like approach to group similar terrain.
 */
export function clusterTerrain(options: TerrainClusterOptions): Hex[] {
  const { seed, hexes, clusterSize = 3, clusterStrength = 0.6 } = options;
  const rng = new SeededRandom(`${seed}-clustering`);

  // Build hex lookup
  const hexMap = new Map<string, Hex>();
  for (const hex of hexes) {
    hexMap.set(coordKey(hex.coord), hex);
  }

  // Run multiple passes to smooth terrain
  let currentHexes = [...hexes];

  for (let pass = 0; pass < clusterSize; pass++) {
    const newHexes: Hex[] = [];

    for (const hex of currentHexes) {
      const neighbors = getNeighbors(hex.coord)
        .map((coord) => hexMap.get(coordKey(coord)))
        .filter((h): h is Hex => h !== undefined);

      // Count terrain types in neighborhood
      const terrainCounts = new Map<TerrainType, number>();
      terrainCounts.set(hex.terrain, 1); // Include self

      for (const neighbor of neighbors) {
        const count = terrainCounts.get(neighbor.terrain) ?? 0;
        terrainCounts.set(neighbor.terrain, count + 1);
      }

      // Find dominant terrain
      let dominantTerrain = hex.terrain;
      let maxCount = 0;

      for (const [terrain, count] of terrainCounts) {
        if (count > maxCount) {
          maxCount = count;
          dominantTerrain = terrain;
        }
      }

      // Apply clustering with probability
      const shouldCluster = rng.chance(clusterStrength);
      const newTerrain = shouldCluster && maxCount >= 3
        ? dominantTerrain
        : hex.terrain;

      newHexes.push({
        ...hex,
        terrain: newTerrain,
      });
    }

    // Update map for next pass
    currentHexes = newHexes;
    for (const hex of currentHexes) {
      hexMap.set(coordKey(hex.coord), hex);
    }
  }

  return currentHexes;
}

export interface BiomeZoneOptions {
  seed: string;
  hexes: Hex[];
  biomeCount?: number;
}

/**
 * Create distinct biome zones with seed points that spread outward.
 */
export function createBiomeZones(options: BiomeZoneOptions): Hex[] {
  const { seed, hexes, biomeCount = 4 } = options;
  const rng = new SeededRandom(`${seed}-biomes`);

  if (hexes.length === 0) return hexes;

  // Build hex lookup
  const hexMap = new Map<string, Hex>();
  for (const hex of hexes) {
    hexMap.set(coordKey(hex.coord), hex);
  }

  // Define biome types
  const biomeTypes: TerrainType[] = ["plains", "forest", "hills", "swamp", "desert"];
  const biomeWeights = createWeightedTable<TerrainType>({
    plains: 30,
    forest: 27,
    hills: 18,
    mountains: 10,
    swamp: 5,
    desert: 10,
    water: 0, // Water is handled separately
  });

  // Select seed hexes for each biome
  const availableHexes = hexes.filter((h) => h.terrain !== "water");
  const seedHexes: { coord: HexCoord; terrain: TerrainType }[] = [];

  for (let i = 0; i < biomeCount && availableHexes.length > 0; i++) {
    const seedIndex = rng.between(0, availableHexes.length - 1);
    const seedHex = availableHexes.splice(seedIndex, 1)[0];
    const terrain = rng.pickWeighted(biomeWeights);
    seedHexes.push({ coord: seedHex.coord, terrain });
  }

  // Assign each hex to nearest biome seed
  const result: Hex[] = hexes.map((hex) => {
    // Keep water as-is
    if (hex.terrain === "water") {
      return hex;
    }

    // Find nearest seed
    let nearestSeed = seedHexes[0];
    let minDistance = Infinity;

    for (const biomeSeed of seedHexes) {
      const distance = hexDistance(hex.coord, biomeSeed.coord);
      if (distance < minDistance) {
        minDistance = distance;
        nearestSeed = biomeSeed;
      }
    }

    // Some randomness in biome assignment
    const finalTerrain = rng.chance(0.8) ? nearestSeed.terrain : hex.terrain;

    return {
      ...hex,
      terrain: finalTerrain,
    };
  });

  return result;
}

function hexDistance(a: HexCoord, b: HexCoord): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
}

export interface TerrainEdgeOptions {
  seed: string;
  hexes: Hex[];
}

/**
 * Add transition terrain at biome edges.
 */
export function smoothTerrainEdges(options: TerrainEdgeOptions): Hex[] {
  const { seed, hexes } = options;
  const rng = new SeededRandom(`${seed}-edges`);

  // Build hex lookup
  const hexMap = new Map<string, Hex>();
  for (const hex of hexes) {
    hexMap.set(coordKey(hex.coord), hex);
  }

  // Define edge transitions
  const transitions: Record<string, TerrainType> = {
    "plains-forest": "plains",
    "plains-hills": "hills",
    "forest-hills": "forest",
    "plains-mountains": "hills",
    "forest-mountains": "hills",
    "hills-mountains": "hills",
    "plains-swamp": "plains",
    "forest-swamp": "swamp",
    "plains-desert": "plains",
    "desert-hills": "hills",
    "desert-mountains": "hills",
    "desert-forest": "plains",
    "desert-swamp": "plains",
  };

  return hexes.map((hex) => {
    if (hex.terrain === "water" || hex.terrain === "mountains") {
      return hex;
    }

    const neighbors = getNeighbors(hex.coord)
      .map((coord) => hexMap.get(coordKey(coord)))
      .filter((h): h is Hex => h !== undefined);

    // Check for edge with different terrain
    const differentNeighbors = neighbors.filter(
      (n) => n.terrain !== hex.terrain && n.terrain !== "water"
    );

    if (differentNeighbors.length >= 2 && rng.chance(0.3)) {
      const neighbor = rng.pick(differentNeighbors);
      const key1 = `${hex.terrain}-${neighbor.terrain}`;
      const key2 = `${neighbor.terrain}-${hex.terrain}`;
      const transition = transitions[key1] ?? transitions[key2];

      if (transition) {
        return { ...hex, terrain: transition };
      }
    }

    return hex;
  });
}
