/**
 * ExitPointGenerator - Creates exit points that connect dungeons to other hexes.
 * Enables backdoor entrances and multi-hex dungeon complexes.
 */

import { nanoid } from "nanoid";
import type {
  DungeonTheme,
  SpatialRoom,
  ExitPoint,
  HexCoord,
  Hex,
  TerrainType,
} from "~/models";
import { SeededRandom } from "../SeededRandom";

// === Exit Point Configuration ===

// Chance of generating exit points based on dungeon size
const EXIT_CHANCE_BY_SIZE: Record<string, number> = {
  small: 0.15,   // 15% chance for small dungeons
  medium: 0.30,  // 30% chance for medium dungeons
  large: 0.50,   // 50% chance for large dungeons
};

// Maximum exit points by dungeon size
const MAX_EXITS_BY_SIZE: Record<string, number> = {
  small: 1,
  medium: 2,
  large: 3,
};

// Exit descriptions by theme
const EXIT_DESCRIPTIONS: Record<DungeonTheme, string[]> = {
  tomb: [
    "A hidden passage through crumbling burial niches",
    "An ancient escape tunnel behind a sarcophagus",
    "A narrow shaft leading up to the surface",
    "A collapsed section revealing natural caves beyond",
  ],
  cave: [
    "A narrow fissure leading deeper underground",
    "A water-carved tunnel following an underground stream",
    "A tight squeeze through natural rock formations",
    "A vertical chimney ascending toward daylight",
  ],
  temple: [
    "A secret passage behind the altar",
    "An underground crypt connecting to adjacent tombs",
    "A meditation tunnel used by hermits long ago",
    "A hidden exit through the bell tower foundations",
  ],
  fortress: [
    "A secret escape tunnel leading outside the walls",
    "An old supply passage to nearby settlements",
    "A collapsed section of wall revealing caves",
    "A hidden sally port leading to the wilderness",
  ],
  mine: [
    "An abandoned mining shaft breaking through to the surface",
    "A flooded passage connecting to underground rivers",
    "A collapsed tunnel revealing natural caverns",
    "An old ventilation shaft leading up",
  ],
  sewer: [
    "A drainage tunnel flowing toward the river",
    "An access tunnel to the old city foundations",
    "A collapsed wall revealing ancient catacombs",
    "A maintenance passage leading to distant neighborhoods",
  ],
  crypt: [
    "A hidden ossuary passage",
    "An ancient tunnel connecting to the cathedral above",
    "A collapsed wall revealing natural caves",
    "A secret escape route for the clergy",
  ],
  bandit_hideout: [
    "A well-hidden escape tunnel",
    "A natural cave passage leading to the forest",
    "A concealed exit behind supplies",
    "A rocky chimney climbing to a hidden overlook",
  ],
  cultist_lair: [
    "A secret passage to an allied cult's sanctuary",
    "An escape tunnel prepared for emergencies",
    "A natural fissure used for disposing of remains",
    "A hidden door to the wilderness",
  ],
  witch_hut: [
    "A root cellar passage to the forest",
    "A natural cave beneath the hut",
    "A secret door hidden by illusion",
  ],
  sea_cave: [
    "A flooded passage leading to open water",
    "A natural chimney to the cliffs above",
    "A smuggler's tunnel to a hidden cove",
  ],
  beast_den: [
    "A secondary entrance used for hunting",
    "A natural passage deeper into the mountain",
    "A muddy tunnel following prey trails",
  ],
  lair: [
    "A back entrance for ambushes",
    "A natural cave passage",
    "A partially collapsed tunnel",
  ],
  shrine: [
    "A pilgrimage path to another holy site",
    "A hermit's meditation tunnel",
    "A natural cave beneath the altar",
  ],
  floating_keep: [
    "A magical portal to a distant peak",
    "An anchor chain tunnel to the ground below",
    "A wind shaft leading to lower levels",
  ],
};

// Direction offsets for hex neighbors (axial coordinates)
const HEX_DIRECTIONS: HexCoord[] = [
  { q: 1, r: 0 },   // East
  { q: 0, r: 1 },   // Southeast
  { q: -1, r: 1 },  // Southwest
  { q: -1, r: 0 },  // West
  { q: 0, r: -1 },  // Northwest
  { q: 1, r: -1 },  // Northeast
];

// Terrain preferences for exit destinations
const EXIT_TERRAIN_PREFS: Partial<Record<DungeonTheme, TerrainType[]>> = {
  cave: ["hills", "mountains"],
  mine: ["hills", "mountains"],
  sea_cave: ["water"],
  sewer: ["plains", "swamp"],
  tomb: ["hills", "forest"],
  fortress: ["plains", "hills"],
};

export class ExitPointGenerator {
  private rng: SeededRandom;
  private theme: DungeonTheme;
  private dungeonCoord: HexCoord;
  private hexes: Hex[];

  constructor(
    theme: DungeonTheme,
    dungeonCoord: HexCoord,
    hexes: Hex[],
    seed: string
  ) {
    this.theme = theme;
    this.dungeonCoord = dungeonCoord;
    this.hexes = hexes;
    this.rng = new SeededRandom(`${seed}-exits`);
  }

  /**
   * Generate exit points for a dungeon.
   */
  generateExitPoints(
    rooms: SpatialRoom[],
    dungeonSize: string
  ): ExitPoint[] {
    const exitPoints: ExitPoint[] = [];

    // Check if we should generate exits
    const exitChance = EXIT_CHANCE_BY_SIZE[dungeonSize] ?? 0.25;
    if (!this.rng.chance(exitChance)) {
      return exitPoints;
    }

    // Determine number of exits
    const maxExits = MAX_EXITS_BY_SIZE[dungeonSize] ?? 1;
    const exitCount = this.rng.between(1, maxExits);

    // Find eligible rooms (deep, dead-ends preferred)
    const eligibleRooms = rooms
      .filter((r) => r.type !== "entrance" && r.depth >= 2)
      .sort((a, b) => {
        // Prefer dead-ends
        if (a.isDeadEnd && !b.isDeadEnd) return -1;
        if (!a.isDeadEnd && b.isDeadEnd) return 1;
        // Then prefer deeper rooms
        return b.depth - a.depth;
      });

    if (eligibleRooms.length === 0) return exitPoints;

    // Find neighboring hexes that could be destinations
    const neighbors = this.getNeighborHexes();
    if (neighbors.length === 0) return exitPoints;

    // Generate exit points
    for (let i = 0; i < exitCount && i < eligibleRooms.length; i++) {
      const room = eligibleRooms[i];
      const destinationHex = this.selectDestinationHex(neighbors);

      if (!destinationHex) continue;

      const exit: ExitPoint = {
        id: `exit-${nanoid(6)}`,
        roomId: room.id,
        destinationHexId: this.getHexId(destinationHex.coord),
        destinationCoord: destinationHex.coord,
        description: this.getExitDescription(),
        discovered: false,
      };

      exitPoints.push(exit);

      // Remove this hex from neighbors so we don't duplicate destinations
      const idx = neighbors.indexOf(destinationHex);
      if (idx >= 0) neighbors.splice(idx, 1);
    }

    return exitPoints;
  }

  /**
   * Get neighboring hexes that are valid exit destinations.
   */
  private getNeighborHexes(): Hex[] {
    const neighbors: Hex[] = [];

    for (const dir of HEX_DIRECTIONS) {
      const neighborCoord: HexCoord = {
        q: this.dungeonCoord.q + dir.q,
        r: this.dungeonCoord.r + dir.r,
      };

      const hex = this.hexes.find(
        (h) => h.coord.q === neighborCoord.q && h.coord.r === neighborCoord.r
      );

      // Only include valid hexes (not water unless theme supports it)
      if (hex && this.isValidExitDestination(hex)) {
        neighbors.push(hex);
      }
    }

    return neighbors;
  }

  /**
   * Check if a hex is a valid exit destination.
   */
  private isValidExitDestination(hex: Hex): boolean {
    // Never exit to water unless theme supports it
    if (hex.terrain === "water") {
      const waterThemes: DungeonTheme[] = ["sea_cave", "sewer"];
      return waterThemes.includes(this.theme);
    }

    return true;
  }

  /**
   * Select the best destination hex based on theme preferences.
   */
  private selectDestinationHex(neighbors: Hex[]): Hex | null {
    if (neighbors.length === 0) return null;

    // Check for preferred terrain
    const prefs = EXIT_TERRAIN_PREFS[this.theme];
    if (prefs) {
      const preferred = neighbors.filter((h) => prefs.includes(h.terrain));
      if (preferred.length > 0) {
        return this.rng.pick(preferred);
      }
    }

    // Fall back to random neighbor
    return this.rng.pick(neighbors);
  }

  /**
   * Get a random exit description for this theme.
   */
  private getExitDescription(): string {
    const descriptions = EXIT_DESCRIPTIONS[this.theme] ?? [
      "A hidden passage leading elsewhere",
      "A narrow tunnel into darkness",
      "A concealed exit",
    ];
    return this.rng.pick(descriptions);
  }

  /**
   * Generate a hex ID from coordinates.
   */
  private getHexId(coord: HexCoord): string {
    return `hex-${coord.q}-${coord.r}`;
  }
}

/**
 * Generate exit points for a dungeon.
 */
export function generateExitPoints(
  theme: DungeonTheme,
  dungeonCoord: HexCoord,
  hexes: Hex[],
  rooms: SpatialRoom[],
  dungeonSize: string,
  seed: string
): ExitPoint[] {
  const generator = new ExitPointGenerator(theme, dungeonCoord, hexes, seed);
  return generator.generateExitPoints(rooms, dungeonSize);
}
