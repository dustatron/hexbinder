import type { Hex, HexCoord, HexEdge, TerrainType } from "~/models";
import { SeededRandom } from "./SeededRandom";
import { findPath, coordKey, TERRAIN_COSTS } from "~/lib/hex-utils";

export interface RoadGeneratorOptions {
  seed: string;
  hexes: Hex[];
  settlementHexes: Hex[];
}

export interface RoadNetwork {
  roads: HexEdge[];
  roadHexes: Set<string>; // coordKeys of hexes with roads
}

/**
 * Generate roads connecting settlements.
 * Uses A* pathfinding with terrain costs.
 */
export function generateRoads(options: RoadGeneratorOptions): RoadNetwork {
  const { seed, hexes, settlementHexes } = options;
  const rng = new SeededRandom(`${seed}-roads`);

  const roads: HexEdge[] = [];
  const roadHexes = new Set<string>();

  // Build hex lookup
  const hexMap = new Map<string, Hex>();
  for (const hex of hexes) {
    hexMap.set(coordKey(hex.coord), hex);
  }

  // Cost function for pathfinding
  const getCost = (coord: HexCoord): number => {
    const hex = hexMap.get(coordKey(coord));
    if (!hex) return Infinity;
    // Roads are cheaper to travel on
    if (roadHexes.has(coordKey(coord))) {
      return 1;
    }
    return TERRAIN_COSTS[hex.terrain];
  };

  // Validity function - can't path through water or mountains
  const isValid = (coord: HexCoord): boolean => {
    const hex = hexMap.get(coordKey(coord));
    if (!hex) return false;
    return hex.terrain !== "water" && hex.terrain !== "mountains";
  };

  // Sort settlements for consistent ordering
  const sortedSettlements = [...settlementHexes].sort((a, b) => {
    const keyA = coordKey(a.coord);
    const keyB = coordKey(b.coord);
    return keyA.localeCompare(keyB);
  });

  // Connect settlements using minimum spanning tree approach
  const connected = new Set<string>();
  if (sortedSettlements.length > 0) {
    connected.add(coordKey(sortedSettlements[0].coord));
  }

  // Kruskal-like: always connect the nearest unconnected settlement
  while (connected.size < sortedSettlements.length) {
    let bestPath: HexCoord[] | null = null;
    let bestLength = Infinity;
    let targetKey = "";

    for (const settlement of sortedSettlements) {
      const key = coordKey(settlement.coord);
      if (connected.has(key)) continue;

      // Find shortest path from this settlement to any connected settlement
      for (const connectedKey of connected) {
        const connectedHex = hexMap.get(connectedKey);
        if (!connectedHex) continue;

        const path = findPath(settlement.coord, connectedHex.coord, getCost, isValid);
        if (path && path.length < bestLength) {
          bestPath = path;
          bestLength = path.length;
          targetKey = key;
        }
      }
    }

    if (bestPath && targetKey) {
      connected.add(targetKey);
      addRoadPath(bestPath, roads, roadHexes);
    } else {
      break; // No more paths possible
    }
  }

  // Optionally add some extra roads for redundancy (30% chance per pair)
  for (let i = 0; i < sortedSettlements.length; i++) {
    for (let j = i + 2; j < sortedSettlements.length; j++) {
      if (rng.chance(0.2)) {
        const path = findPath(
          sortedSettlements[i].coord,
          sortedSettlements[j].coord,
          getCost,
          isValid
        );
        if (path) {
          addRoadPath(path, roads, roadHexes);
        }
      }
    }
  }

  return { roads, roadHexes };
}

function addRoadPath(
  path: HexCoord[],
  roads: HexEdge[],
  roadHexes: Set<string>
): void {
  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];

    // Add edge (avoid duplicates)
    const edgeKey = getEdgeKey(from, to);
    const reverseKey = getEdgeKey(to, from);

    const exists = roads.some(
      (r) => getEdgeKey(r.from, r.to) === edgeKey || getEdgeKey(r.from, r.to) === reverseKey
    );

    if (!exists) {
      roads.push({ from, to, type: "road" });
    }

    roadHexes.add(coordKey(from));
    roadHexes.add(coordKey(to));
  }
}

function getEdgeKey(from: HexCoord, to: HexCoord): string {
  return `${coordKey(from)}->${coordKey(to)}`;
}

/**
 * Get the travel cost modifier for a hex with roads.
 */
export function getRoadModifier(
  coord: HexCoord,
  roadHexes: Set<string>
): number {
  return roadHexes.has(coordKey(coord)) ? 0.5 : 1;
}
