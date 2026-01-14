import { nanoid } from "nanoid";
import type {
  Hex,
  HexCoord,
  Location,
  TerrainType,
  WorldData,
} from "~/models";

// Generate 7x7 hex grid with offset coordinates converted to axial
function generateHexGrid(): { hexes: Hex[]; locationCoords: HexCoord[] } {
  const hexes: Hex[] = [];
  const size = 7;

  // Terrain weights: plains 40%, forest 25%, hills 15%, mountains 10%, water 5%, swamp 5%
  const terrainPool: TerrainType[] = [
    ...Array(40).fill("plains"),
    ...Array(25).fill("forest"),
    ...Array(15).fill("hills"),
    ...Array(10).fill("mountains"),
    ...Array(5).fill("water"),
    ...Array(5).fill("swamp"),
  ] as TerrainType[];

  // Shuffle terrain pool for variety
  const shuffled = [...terrainPool].sort(() => Math.random() - 0.5);
  let terrainIndex = 0;

  // Settlement at center (3,3), dungeon offset at (5,2)
  const settlementCoord: HexCoord = { q: 3, r: 3 };
  const dungeonCoord: HexCoord = { q: 5, r: 2 };

  for (let r = 0; r < size; r++) {
    for (let q = 0; q < size; q++) {
      const coord: HexCoord = { q, r };

      // Force plains for settlement, hills for dungeon
      let terrain: TerrainType;
      if (q === settlementCoord.q && r === settlementCoord.r) {
        terrain = "plains";
      } else if (q === dungeonCoord.q && r === dungeonCoord.r) {
        terrain = "hills";
      } else {
        terrain = shuffled[terrainIndex % shuffled.length];
        terrainIndex++;
      }

      hexes.push({
        coord,
        terrain,
        locationId:
          q === settlementCoord.q && r === settlementCoord.r
            ? "loc-settlement"
            : q === dungeonCoord.q && r === dungeonCoord.r
              ? "loc-dungeon"
              : undefined,
      });
    }
  }

  return {
    hexes,
    locationCoords: [settlementCoord, dungeonCoord],
  };
}

function generateLocations(coords: HexCoord[]): Location[] {
  return [
    {
      id: "loc-settlement",
      name: "Millhaven",
      type: "settlement",
      description:
        "A quiet farming village nestled beside a slow-moving creek. Recent livestock deaths have the villagers on edge, and strangers are met with suspicious glances.",
      hexCoord: coords[0],
      tags: ["village", "farming", "troubled"],
    },
    {
      id: "loc-dungeon",
      name: "Thornwood Barrow",
      type: "dungeon",
      description:
        "An ancient burial mound half-hidden by twisted oak trees. Locals avoid it after dark, claiming to hear whispers carried on the wind. A partially collapsed entrance leads into darkness below.",
      hexCoord: coords[1],
      tags: ["tomb", "undead", "ancient"],
    },
  ];
}

export function createMockWorld(name?: string, seed?: string): WorldData {
  const { hexes, locationCoords } = generateHexGrid();
  const locations = generateLocations(locationCoords);

  return {
    id: nanoid(),
    name: name || "The Borderlands",
    seed: seed || nanoid(8),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    state: {
      day: 1,
      season: "spring",
      year: 1,
      weather: {
        condition: "clear",
        temperature: "mild",
        wind: "breeze",
      },
      moonPhase: "waxing",
      calendar: [],
      forecastEndDay: 1,
    },
    hexes,
    edges: [],
    locations,
    dwellings: [],
    npcs: [],
    factions: [],
    hooks: [],
    clocks: [],
  };
}
