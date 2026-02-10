import { nanoid } from "nanoid";
import type { Hex, HexFeature, FeatureType, TerrainType, TreasureEntry } from "~/models";
import { SeededRandom } from "./SeededRandom";
import { coordKey } from "~/lib/hex-utils";
import { generateTreasure } from "./TreasureGenerator";

// === Feature Pools by Terrain ===

const TERRAIN_FEATURES: Record<TerrainType, FeatureType[]> = {
  plains: ["standing_stones", "abandoned_farm", "caravan_camp", "crossroads_shrine"],
  forest: ["hunters_camp", "druid_grove", "ancient_tree", "ruined_tower"],
  hills: ["watchtower", "mining_camp", "hermit_cave", "burial_mound"],
  mountains: ["mountain_pass", "eagle_nest", "frozen_shrine", "abandoned_mine"],
  swamp: ["witch_hut", "sunken_ruins", "sacrificial_altar"],
  water: ["shipwreck", "reef", "sea_shrine", "whirlpool", "lighthouse_ruins", "drowned_village"],
  desert: ["standing_stones", "abandoned_mine", "crossroads_shrine", "burial_mound"],
};

const ANY_TERRAIN_FEATURES: FeatureType[] = [
  "wayshrine",
  "traveler_camp",
  "battlefield",
  "monster_lair",
];

// === Interactive vs Static Features ===

const INTERACTIVE_FEATURES: Set<FeatureType> = new Set([
  "abandoned_farm",
  "caravan_camp",
  "hunters_camp",
  "ruined_tower",
  "mining_camp",
  "hermit_cave",
  "abandoned_mine",
  "witch_hut",
  "sunken_ruins",
  "traveler_camp",
  "monster_lair",
  // Water features
  "shipwreck",
  "sea_shrine",
  "lighthouse_ruins",
  "drowned_village",
]);

// === Feature Names & Descriptions ===

interface FeatureTemplate {
  names: string[];
  descriptions: string[];
}

const FEATURE_TEMPLATES: Record<FeatureType, FeatureTemplate> = {
  standing_stones: {
    names: ["The Standing Stones", "Circle of Ancients", "Sentinel Stones", "The Old Ring"],
    descriptions: [
      "Weathered monoliths arranged in a circle, humming faintly at dusk.",
      "Tall stones covered in forgotten runes, arranged in a pattern.",
      "Ancient megaliths standing silent vigil over the plains.",
    ],
  },
  abandoned_farm: {
    names: ["Ruined Farmstead", "The Burned Homestead", "Desolate Farm", "Overgrown Fields"],
    descriptions: [
      "A collapsed farmhouse surrounded by fallow fields.",
      "Charred remains of a farmstead, recently abandoned.",
      "Weeds choke what was once productive farmland.",
    ],
  },
  caravan_camp: {
    names: ["Merchant Camp", "Trader's Rest", "Caravan Circle", "Waypoint Camp"],
    descriptions: [
      "A well-used campsite with wagon ruts and fire rings.",
      "Traders have set up temporary shelter here.",
      "Colorful tents and pack animals rest along the road.",
    ],
  },
  crossroads_shrine: {
    names: ["Roadside Shrine", "Traveler's Blessing", "Crossroads Marker", "Wayfarer's Chapel"],
    descriptions: [
      "A small shrine where travelers leave offerings for safe passage.",
      "A weathered statue watches over the crossroads.",
      "Coins and flowers are scattered at this humble shrine.",
    ],
  },
  hunters_camp: {
    names: ["Hunter's Camp", "Trappers' Lodge", "Woodland Shelter", "Ranger's Post"],
    descriptions: [
      "A lean-to shelter with drying racks for game.",
      "A well-hidden camp used by local hunters.",
      "Animal pelts hang from crude wooden frames.",
    ],
  },
  druid_grove: {
    names: ["Sacred Grove", "Druid's Circle", "The Old Wood", "Spirit Clearing"],
    descriptions: [
      "Trees grow in an unnatural spiral around a moss-covered altar.",
      "The air here feels charged with natural magic.",
      "Strange symbols are carved into the oldest trees.",
    ],
  },
  ancient_tree: {
    names: ["The Great Oak", "Elder Tree", "Grandfather Tree", "The Heart Tree"],
    descriptions: [
      "A massive tree, older than memory, dominates the forest.",
      "This ancient tree's roots spread across the entire clearing.",
      "Locals whisper that spirits dwell within this tree.",
    ],
  },
  ruined_tower: {
    names: ["Crumbling Tower", "The Broken Spire", "Wizard's Ruin", "Fallen Watchtower"],
    descriptions: [
      "A collapsed tower, its stones scattered among the trees.",
      "Only the foundation remains of what was once a tall spire.",
      "Scorched stones hint at the tower's violent end.",
    ],
  },
  watchtower: {
    names: ["Old Watchtower", "Border Tower", "Signal Hill", "The Lookout"],
    descriptions: [
      "An ancient watchtower commands a view of the surrounding lands.",
      "This crumbling tower once guarded against invasion.",
      "Signal fires were lit here in ages past.",
    ],
  },
  mining_camp: {
    names: ["Mining Camp", "Prospector's Site", "The Dig", "Ore Camp"],
    descriptions: [
      "Abandoned mining equipment rusts near a hillside excavation.",
      "Miners have been working these hills for months.",
      "Wooden supports prop up a tunnel entrance.",
    ],
  },
  hermit_cave: {
    names: ["Hermit's Cave", "The Recluse's Den", "Hidden Grotto", "Sage's Retreat"],
    descriptions: [
      "A cave entrance partially hidden by brush.",
      "Someone has been living here alone for years.",
      "A thin trail of smoke rises from the cave mouth.",
    ],
  },
  burial_mound: {
    names: ["Burial Mound", "The Barrow", "King's Rest", "Ancient Cairn"],
    descriptions: [
      "A grass-covered mound marking an ancient grave.",
      "Locals avoid this place after dark.",
      "The entrance to this barrow has been sealed for centuries.",
    ],
  },
  mountain_pass: {
    names: ["Mountain Pass", "The Gap", "High Road", "Wind's Gate"],
    descriptions: [
      "A narrow passage between towering peaks.",
      "The only safe route through these mountains.",
      "Carved steps wind up through the treacherous terrain.",
    ],
  },
  eagle_nest: {
    names: ["Eagle's Nest", "The Eyrie", "Sky Perch", "Giant's View"],
    descriptions: [
      "A massive nest perches on an impossible cliff.",
      "Giant eagles circle overhead, watching intruders.",
      "Bones of large prey litter the cliff face.",
    ],
  },
  frozen_shrine: {
    names: ["Frozen Shrine", "Ice Temple", "The Cold Altar", "Winter's Heart"],
    descriptions: [
      "An altar of blue ice that never melts.",
      "Frost covers everything in this sacred place.",
      "Ancient prayers to winter gods are carved in ice.",
    ],
  },
  abandoned_mine: {
    names: ["Abandoned Mine", "The Old Shaft", "Collapsed Dig", "Forsaken Tunnels"],
    descriptions: [
      "Rotted timbers mark the entrance to a played-out mine.",
      "Something drove the miners from this place.",
      "The darkness within feels oppressive and wrong.",
    ],
  },
  witch_hut: {
    names: ["Witch's Hut", "The Bog Cottage", "Crone's Dwelling", "Marsh House"],
    descriptions: [
      "A crooked hut on stilts rises from the murky water.",
      "Smoke and strange smells drift from this isolated dwelling.",
      "Charms and bones hang from the eaves.",
    ],
  },
  sunken_ruins: {
    names: ["Sunken Ruins", "Drowned Temple", "The Lost Halls", "Marsh Stones"],
    descriptions: [
      "Ancient stonework slowly sinks into the bog.",
      "Carved pillars emerge from the dark water.",
      "Something glints beneath the murky surface.",
    ],
  },
  sacrificial_altar: {
    names: ["Blood Altar", "The Dark Stone", "Sacrificial Circle", "Doom Rock"],
    descriptions: [
      "A black stone altar stained with old blood.",
      "The air here feels heavy with malevolent power.",
      "Cultists have recently used this place for dark rituals.",
    ],
  },
  wayshrine: {
    names: ["Wayshrine", "Road Marker", "Pilgrim's Rest", "Stone Shrine"],
    descriptions: [
      "A small shrine offers blessing to weary travelers.",
      "Pilgrims have left offerings at this holy marker.",
      "A weathered statue of a forgotten god watches the road.",
    ],
  },
  traveler_camp: {
    names: ["Traveler's Camp", "Wanderer's Rest", "Road Camp", "Wayside Stop"],
    descriptions: [
      "A campfire still smolders from recent visitors.",
      "Travelers have stopped here to rest.",
      "A crude shelter offers protection from the elements.",
    ],
  },
  battlefield: {
    names: ["Old Battlefield", "The Killing Fields", "War's End", "Bone Field"],
    descriptions: [
      "Rusted weapons and armor lie scattered across the ground.",
      "The earth here is churned and scarred by ancient violence.",
      "Crows still pick at remnants of the fallen.",
    ],
  },
  monster_lair: {
    names: ["Monster Lair", "The Den", "Beast's Cave", "Creature Hole"],
    descriptions: [
      "Large tracks and gnawed bones mark predator territory.",
      "A foul smell emanates from this dark opening.",
      "Something dangerous makes its home here.",
    ],
  },
  // Water features
  shipwreck: {
    names: ["The Wreck", "Sunken Vessel", "Drowned Ship", "Skeleton Hull"],
    descriptions: [
      "A ship's mast juts from the water at an angle.",
      "Broken timbers and cargo float among the waves.",
      "The hull of a merchant vessel lies just below the surface.",
    ],
  },
  reef: {
    names: ["Coral Reef", "The Shallows", "Razor Rocks", "Hidden Reef"],
    descriptions: [
      "Colorful coral formations teem with fish.",
      "Jagged rocks lurk just beneath the surface.",
      "Many ships have met their end on these hidden rocks.",
    ],
  },
  sea_shrine: {
    names: ["Sea Shrine", "Temple of the Depths", "Drowned Altar", "Merfolk Sanctuary"],
    descriptions: [
      "An ancient temple rises from the waves.",
      "Offerings to sea gods glitter in the shallows.",
      "Stone pillars emerge from the deep, covered in barnacles.",
    ],
  },
  whirlpool: {
    names: ["The Maelstrom", "Churning Waters", "Doom Spiral", "The Vortex"],
    descriptions: [
      "The water spirals violently into a deadly whirlpool.",
      "Ships give this spot a wide berth.",
      "Something unnatural causes this perpetual vortex.",
    ],
  },
  lighthouse_ruins: {
    names: ["Ruined Lighthouse", "The Dark Beacon", "Fallen Light", "Storm Tower"],
    descriptions: [
      "A crumbling lighthouse stands on a rocky outcrop.",
      "The beacon that once saved ships now lies dark and broken.",
      "Storms have battered this tower for centuries.",
    ],
  },
  drowned_village: {
    names: ["Drowned Village", "Sunken Settlement", "The Lost Town", "Flooded Hamlet"],
    descriptions: [
      "Rooftops and chimneys poke above the waterline.",
      "A village swallowed by rising waters long ago.",
      "Fish swim through empty windows of submerged homes.",
    ],
  },
};

// === Generator Options ===

export interface FeatureGeneratorOptions {
  seed: string;
  hexes: Hex[];
  roadHexes: Set<string>;
}

export interface FeatureGeneratorResult {
  hexes: Hex[];
  features: HexFeature[];
}

/**
 * Generate features for hexes without locations.
 * Places features on 15-25% of eligible hexes.
 */
export function generateFeatures(options: FeatureGeneratorOptions): FeatureGeneratorResult {
  const { seed, hexes, roadHexes } = options;
  const rng = new SeededRandom(`${seed}-features`);

  // Find eligible hexes (no location)
  const eligibleHexes = hexes.filter((hex) => !hex.locationId);

  if (eligibleHexes.length === 0) {
    return { hexes, features: [] };
  }

  // Determine how many features to place (15-25% of eligible)
  const minFeatures = Math.floor(eligibleHexes.length * 0.15);
  const maxFeatures = Math.ceil(eligibleHexes.length * 0.25);
  const featureCount = rng.between(minFeatures, Math.max(minFeatures, maxFeatures));

  // Select hexes for features
  const selectedHexes = rng.sample(eligibleHexes, featureCount);

  // Generate features
  const features: HexFeature[] = [];
  const hexMap = new Map<string, Hex>();
  hexes.forEach((h) => hexMap.set(coordKey(h.coord), h));

  for (const hex of selectedHexes) {
    const feature = generateFeature(rng, hex, roadHexes);
    if (feature) {
      features.push(feature);

      // Update hex with feature
      const key = coordKey(hex.coord);
      const existingHex = hexMap.get(key);
      if (existingHex) {
        hexMap.set(key, { ...existingHex, feature });
      }
    }
  }

  // Return updated hexes
  const updatedHexes = hexes.map((h) => hexMap.get(coordKey(h.coord)) ?? h);

  return { hexes: updatedHexes, features };
}

/**
 * Generate a single feature for a hex.
 */
function generateFeature(
  rng: SeededRandom,
  hex: Hex,
  roadHexes: Set<string>
): HexFeature | null {
  const key = coordKey(hex.coord);
  const isOnRoad = roadHexes.has(key);

  // Get available feature types for this terrain
  const terrainFeatures = TERRAIN_FEATURES[hex.terrain] ?? [];
  const allFeatures = [...terrainFeatures, ...ANY_TERRAIN_FEATURES];

  if (allFeatures.length === 0) {
    return null;
  }

  // Prefer road-related features if on road
  let selectedType: FeatureType;
  if (isOnRoad && rng.chance(0.4)) {
    const roadCandidates: FeatureType[] = [
      "wayshrine",
      "traveler_camp",
      "crossroads_shrine",
      "caravan_camp",
    ];
    const roadFeatures = roadCandidates.filter((f) => allFeatures.includes(f));
    selectedType = roadFeatures.length > 0 ? rng.pick(roadFeatures) : rng.pick(allFeatures);
  } else {
    selectedType = rng.pick(allFeatures);
  }

  // Get template
  const template = FEATURE_TEMPLATES[selectedType];
  const name = rng.pick(template.names);
  const description = rng.pick(template.descriptions);

  // Determine interactivity
  const interactive = INTERACTIVE_FEATURES.has(selectedType);

  // Generate treasure for some interactive features (30% chance)
  let treasure: TreasureEntry[] | undefined;
  if (interactive && rng.chance(0.3)) {
    treasure = generateTreasure({
      seed: `${key}-feature-treasure`,
      difficulty: 2,
      itemCount: rng.between(1, 3),
    });
  }

  return {
    id: `feature-${nanoid(8)}`,
    type: selectedType,
    name,
    description,
    interactive,
    treasure,
  };
}
