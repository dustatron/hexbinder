import { nanoid } from "nanoid";
import type { HexCoord, HexEdge } from "~/models";
import { SeededRandom } from "./SeededRandom";
import { coordKey } from "~/lib/hex-utils";

export interface Bridge {
  id: string;
  name: string;
  coord: HexCoord;
  condition: "good" | "worn" | "damaged" | "collapsed";
  style: "wooden" | "stone" | "rope" | "ancient";
}

export interface BridgeGeneratorOptions {
  seed: string;
  roads: HexEdge[];
  riverHexes: Set<string>;
}

const BRIDGE_NAMES = [
  "Stone Crossing",
  "Old Bridge",
  "King's Bridge",
  "Merchant's Bridge",
  "North Bridge",
  "River Crossing",
  "Trade Bridge",
  "Broken Bridge",
  "Ancient Crossing",
  "Troll Bridge",
];

const BRIDGE_STYLES: Bridge["style"][] = ["wooden", "wooden", "stone", "stone", "rope", "ancient"];
const BRIDGE_CONDITIONS: Bridge["condition"][] = ["good", "good", "good", "worn", "worn", "damaged"];

/**
 * Generate bridges where roads cross rivers.
 */
export function generateBridges(options: BridgeGeneratorOptions): Bridge[] {
  const { seed, roads, riverHexes } = options;
  const rng = new SeededRandom(`${seed}-bridges`);
  const bridges: Bridge[] = [];
  const bridgeHexes = new Set<string>();

  // Find road hexes that are also river hexes
  for (const road of roads) {
    const fromKey = coordKey(road.from);
    const toKey = coordKey(road.to);

    // Check if road crosses a river
    if (riverHexes.has(fromKey) && !bridgeHexes.has(fromKey)) {
      bridges.push(createBridge(rng, road.from));
      bridgeHexes.add(fromKey);
    }

    if (riverHexes.has(toKey) && !bridgeHexes.has(toKey)) {
      bridges.push(createBridge(rng, road.to));
      bridgeHexes.add(toKey);
    }
  }

  return bridges;
}

function createBridge(rng: SeededRandom, coord: HexCoord): Bridge {
  const name = rng.pick(BRIDGE_NAMES);
  const style = rng.pick(BRIDGE_STYLES);
  let condition = rng.pick(BRIDGE_CONDITIONS);

  // Ancient bridges are often damaged
  if (style === "ancient" && rng.chance(0.5)) {
    condition = rng.pick(["worn", "damaged", "collapsed"]);
  }

  // Rope bridges are more fragile
  if (style === "rope" && rng.chance(0.3)) {
    condition = rng.pick(["worn", "damaged"]);
  }

  return {
    id: `bridge-${nanoid(8)}`,
    name,
    coord,
    style,
    condition,
  };
}

/**
 * Check if a bridge is passable.
 */
export function isBridgePassable(bridge: Bridge): boolean {
  return bridge.condition !== "collapsed";
}

/**
 * Get the crossing difficulty for a bridge.
 */
export function getBridgeDifficulty(bridge: Bridge): number {
  const difficulties: Record<Bridge["condition"], number> = {
    good: 0,
    worn: 5,
    damaged: 12,
    collapsed: Infinity,
  };

  const styleModifier: Record<Bridge["style"], number> = {
    wooden: 0,
    stone: -2,
    rope: 5,
    ancient: 2,
  };

  return difficulties[bridge.condition] + styleModifier[bridge.style];
}

/**
 * Get a description of a bridge.
 */
export function describeBridge(bridge: Bridge): string {
  const styleDesc: Record<Bridge["style"], string> = {
    wooden: "a wooden bridge",
    stone: "a sturdy stone bridge",
    rope: "a swaying rope bridge",
    ancient: "an ancient bridge of unknown origin",
  };

  const conditionDesc: Record<Bridge["condition"], string> = {
    good: "in good condition",
    worn: "showing signs of wear",
    damaged: "badly damaged",
    collapsed: "collapsed and impassable",
  };

  return `${bridge.name} is ${styleDesc[bridge.style]}, ${conditionDesc[bridge.condition]}.`;
}
