import type { Hex, HexCoord, HexEdge } from "~/models";
import { SeededRandom } from "./SeededRandom";
import { getNeighbors, coordKey } from "~/lib/hex-utils";

export interface RiverGeneratorOptions {
  seed: string;
  hexes: Hex[];
  riverCount?: number;
}

export interface RiverNetwork {
  rivers: HexEdge[];
  riverHexes: Set<string>;
}

/**
 * Generate rivers flowing from high terrain to low/water.
 */
export function generateRivers(options: RiverGeneratorOptions): RiverNetwork {
  const { seed, hexes, riverCount = 2 } = options;
  const rng = new SeededRandom(`${seed}-rivers`);

  const rivers: HexEdge[] = [];
  const riverHexes = new Set<string>();

  // Build hex lookup
  const hexMap = new Map<string, Hex>();
  for (const hex of hexes) {
    hexMap.set(coordKey(hex.coord), hex);
  }

  // Terrain elevation (higher = more elevated)
  const elevation: Record<string, number> = {
    mountains: 5,
    hills: 4,
    forest: 2,
    plains: 2,
    swamp: 1,
    water: 0,
  };

  // Find potential source hexes (hills/mountains)
  const sources = hexes.filter(
    (h) => h.terrain === "hills" || h.terrain === "mountains"
  );

  if (sources.length === 0) return { rivers, riverHexes };

  // Generate rivers
  for (let i = 0; i < riverCount && sources.length > 0; i++) {
    const sourceIndex = rng.between(0, sources.length - 1);
    const source = sources.splice(sourceIndex, 1)[0];

    const riverPath = flowRiver(source, hexMap, elevation, rng);

    // Add river edges
    for (let j = 0; j < riverPath.length - 1; j++) {
      rivers.push({
        from: riverPath[j],
        to: riverPath[j + 1],
        type: "river",
      });
      riverHexes.add(coordKey(riverPath[j]));
      riverHexes.add(coordKey(riverPath[j + 1]));
    }
  }

  return { rivers, riverHexes };
}

function flowRiver(
  source: Hex,
  hexMap: Map<string, Hex>,
  elevation: Record<string, number>,
  rng: SeededRandom
): HexCoord[] {
  const path: HexCoord[] = [source.coord];
  const visited = new Set<string>([coordKey(source.coord)]);
  let current = source;
  const maxLength = 20;

  while (path.length < maxLength) {
    const currentElevation = elevation[current.terrain] ?? 2;
    const neighbors = getNeighbors(current.coord)
      .map((coord) => hexMap.get(coordKey(coord)))
      .filter((h): h is Hex => h !== undefined && !visited.has(coordKey(h.coord)));

    if (neighbors.length === 0) break;

    // Prefer downhill flow
    const downhill = neighbors.filter(
      (n) => (elevation[n.terrain] ?? 2) < currentElevation
    );
    const sameLevel = neighbors.filter(
      (n) => (elevation[n.terrain] ?? 2) === currentElevation
    );

    let next: Hex;
    if (downhill.length > 0) {
      next = rng.pick(downhill);
    } else if (sameLevel.length > 0 && rng.chance(0.5)) {
      next = rng.pick(sameLevel);
    } else {
      break; // No valid flow direction
    }

    path.push(next.coord);
    visited.add(coordKey(next.coord));

    // Stop at water
    if (next.terrain === "water") break;

    current = next;
  }

  return path;
}

/**
 * Check if a hex has a river.
 */
export function hasRiver(coord: HexCoord, riverHexes: Set<string>): boolean {
  return riverHexes.has(coordKey(coord));
}

/**
 * Get hexes suitable for bridges (roads crossing rivers).
 */
export function findBridgeSites(
  riverHexes: Set<string>,
  roadHexes: Set<string>
): HexCoord[] {
  const bridges: HexCoord[] = [];

  for (const key of riverHexes) {
    if (roadHexes.has(key)) {
      const [q, r] = key.split(",").map(Number);
      bridges.push({ q, r });
    }
  }

  return bridges;
}
