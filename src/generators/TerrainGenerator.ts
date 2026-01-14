import type { Hex, HexCoord, TerrainType } from "~/models";
import { SeededRandom, createWeightedTable } from "./SeededRandom";

/** Terrain distribution weights */
const TERRAIN_WEIGHTS = createWeightedTable<TerrainType>({
  plains: 40,
  forest: 25,
  hills: 15,
  mountains: 10,
  water: 5,
  swamp: 5,
});

export interface TerrainGeneratorOptions {
  width: number;
  height: number;
  seed: string;
}

/**
 * Generate terrain for a hex grid.
 * Same seed always produces identical terrain.
 */
export function generateTerrain(options: TerrainGeneratorOptions): Hex[] {
  const { width, height, seed } = options;
  const rng = new SeededRandom(seed);
  const hexes: Hex[] = [];

  for (let r = 0; r < height; r++) {
    for (let q = 0; q < width; q++) {
      const coord: HexCoord = { q, r };
      const terrain = rng.pickWeighted(TERRAIN_WEIGHTS);

      hexes.push({
        coord,
        terrain,
      });
    }
  }

  return hexes;
}

/**
 * Find hexes suitable for settlement placement.
 * Prefers plains, avoids water/mountains.
 */
export function findSettlementHexes(hexes: Hex[]): Hex[] {
  return hexes.filter(
    (h) => h.terrain === "plains" && !h.locationId
  );
}

/**
 * Find hexes suitable for dungeon placement.
 * Prefers hills/mountains edges.
 */
export function findDungeonHexes(hexes: Hex[]): Hex[] {
  return hexes.filter(
    (h) =>
      (h.terrain === "hills" || h.terrain === "forest") &&
      !h.locationId
  );
}
