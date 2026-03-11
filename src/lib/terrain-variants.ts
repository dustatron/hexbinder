import type { TerrainType, TerrainVariant } from "~/models";
import type { SeededRandom } from "~/generators/SeededRandom";

export const TERRAIN_VARIANTS: Record<TerrainType, TerrainVariant[]> = {
  plains: [
    "grassland", "grasslandpoor", "cultivatedfarmland", "savanna",
    "shrubland", "moor", "snowfields", "hillsgrassland",
  ],
  forest: [
    "lightforest", "heavyforest", "mixedforest", "mixedforestheavy",
    "evergreen", "heavyevergreen", "jungle", "heavyjungle", "deadforest",
  ],
  hills: [
    "hills", "grassyhills", "forestedhills", "forestedmixedhills",
    "evergreenhills", "junglehills", "deadforesthills", "shrublandhills",
  ],
  mountains: [
    "mountain", "mountains", "mountainsnowcapped", "mountainssnowcapped",
    "forestedmountain", "forestedmountains", "forestedmixedmountain",
    "forestedmixedmountains", "evergreenmountain", "evergreenmountains",
    "junglemountain", "junglemountains", "deadforestmountain",
    "deadforestmountains", "glacier", "volcano", "volcanodormant",
  ],
  water: ["kelp", "kelpheavy", "reefs"],
  swamp: ["swamp", "marsh", "deadforestwetlands", "forestwetlands", "wetlandsjungle"],
  desert: ["sandydesert", "rockydesert", "dunes", "cactus", "heavycactus", "badlands", "brokenlands"],
};

export const VARIANT_TO_TERRAIN: Record<TerrainVariant, TerrainType> = Object.fromEntries(
  Object.entries(TERRAIN_VARIANTS).flatMap(([terrain, variants]) =>
    variants.map((v) => [v, terrain as TerrainType])
  )
) as Record<TerrainVariant, TerrainType>;

export function getVariantIconPath(variant: TerrainVariant): string {
  return `/icons/${variant}.png`;
}

export function pickVariantForTerrain(terrain: TerrainType, rng: SeededRandom): TerrainVariant {
  const variants = TERRAIN_VARIANTS[terrain];
  return variants[Math.floor(rng.next() * variants.length)];
}
