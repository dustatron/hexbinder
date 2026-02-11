// First Impressions by Terrain
// Sensory details (sight, sound, smell) for each terrain type

import type { TerrainType } from "~/models";

export interface TerrainImpressions {
  sight: string[];
  sound: string[];
  smell: string[];
}

export const IMPRESSIONS_BY_TERRAIN: Record<TerrainType, TerrainImpressions> = {
  plains: {
    sight: [
      "Tall grass sways in endless waves to the horizon",
      "Heat shimmer distorts distant landmarks",
      "Scattered wildflowers dot the golden expanse",
      "A lone tree stands sentinel on a low rise",
      "Storm clouds gather on the far horizon",
      "Dust devils spin lazily across dry earth",
    ],
    sound: [
      "Wind whispers through the grass like breathing",
      "Distant thunder rumbles across the sky",
      "Grasshoppers chirp in rhythmic chorus",
      "A hawk's cry echoes from above",
      "Silence so complete your heartbeat seems loud",
      "The creak of leather and jingle of gear",
    ],
    smell: [
      "Sweet grass and sun-warmed earth",
      "Wildflower pollen thick in the air",
      "Dust and dry straw",
      "Approaching rain on the wind",
      "Smoke from a distant fire",
      "Animal musk carried on the breeze",
    ],
  },

  forest: {
    sight: [
      "Dappled sunlight filters through dense canopy",
      "Mist clings to mossy trunks and fern beds",
      "Ancient trees tower overhead like cathedral pillars",
      "Shafts of light illuminate dancing dust motes",
      "Thick undergrowth crowds the narrow path",
      "Spider webs glisten with morning dew",
    ],
    sound: [
      "Birdsong echoes through the branches",
      "Branches creak and groan in the wind",
      "Leaves rustle with unseen movement",
      "Distant woodpecker hammers steadily",
      "A stream burbles somewhere nearby",
      "Sudden silence falls - something watches",
    ],
    smell: [
      "Damp earth and rotting leaves",
      "Pine resin sharp in the air",
      "Mushroom spores and forest loam",
      "Wildflowers hidden in the undergrowth",
      "Something dead, not far off",
      "Wood smoke drifting through trees",
    ],
  },

  hills: {
    sight: [
      "Rolling terrain stretches in green waves",
      "Rocky outcrops break through grass like bones",
      "A ruined tower crowns a distant hilltop",
      "Sheep graze on a far slope",
      "Morning mist fills the valleys below",
      "Wildflowers carpet a sun-facing slope",
    ],
    sound: [
      "Wind howls between the hills",
      "Loose stones clatter downslope",
      "Sheep bleating echoes across valleys",
      "A falcon's hunting cry from above",
      "Water trickling down rocky faces",
      "Your own labored breathing on the climb",
    ],
    smell: [
      "Heather and wild thyme",
      "Sheep wool and lanolin",
      "Cold stone and morning dew",
      "Rain approaching from the west",
      "Bracken and crushed grass underfoot",
      "Peat smoke from a hidden cottage",
    ],
  },

  mountains: {
    sight: [
      "Snow-capped peaks pierce the clouds",
      "Sheer cliffs drop into misty chasms",
      "Eagles circle on thermal currents",
      "Ancient stone faces carved by wind",
      "A treacherous path hugs the cliff face",
      "Glacial ice glints blue in crevasses",
    ],
    sound: [
      "Wind screams through rocky passes",
      "Rocks crack and tumble in the distance",
      "An avalanche roars on a far peak",
      "Eerie silence broken only by wind",
      "Your voice echoes back from stone walls",
      "Water drips in an ice cave nearby",
    ],
    smell: [
      "Thin, cold air that burns the lungs",
      "Snow and ice, crisp and clean",
      "Lichen and ancient stone",
      "Sulfur from a volcanic vent",
      "Pine from the treeline far below",
      "Something rank from a cave mouth",
    ],
  },

  water: {
    sight: [
      "Sunlight sparkles on endless blue waves",
      "Whitecaps foam on a restless sea",
      "Dark shapes move beneath the surface",
      "Seabirds wheel and dive for fish",
      "Fog bank rolls across the water",
      "The shore is a thin line on the horizon",
    ],
    sound: [
      "Waves crash and hiss on rocks",
      "Gulls cry overhead in endless loops",
      "Water slaps against the hull",
      "Something large surfaces and dives",
      "Wind fills the sails with a snap",
      "Distant whale song carries through water",
    ],
    smell: [
      "Salt spray and seaweed",
      "Fish and brine thick in the air",
      "Tar and wet rope from the dock",
      "Storm coming - ozone on the wind",
      "Something rotting on the tide line",
      "Fresh catch gleaming in nets",
    ],
  },

  swamp: {
    sight: [
      "Dead trees reach like skeletal fingers",
      "Thick fog hugs the murky water",
      "Something moved beneath the green scum",
      "Will-o'-wisps flicker in the distance",
      "Rotting boardwalk disappears into mist",
      "Eyes reflect your torchlight, then vanish",
    ],
    sound: [
      "Frogs croak in deafening chorus",
      "Bubbles rise and pop in stagnant water",
      "Something large splashes nearby",
      "Insects buzz in thick clouds",
      "Squelching mud with every step",
      "Eerie silence - the frogs have stopped",
    ],
    smell: [
      "Rot and decay thick enough to taste",
      "Sulfur and methane from bubbling mud",
      "Stagnant water and algae bloom",
      "Something dead, very close",
      "Mud and muck caked on everything",
      "Strange flowers with cloying sweetness",
    ],
  },

  desert: {
    sight: [
      "Heat shimmer distorts the barren horizon",
      "Cracked earth stretches in every direction",
      "Steam rises from geothermal vents ahead",
      "Vivid mineral deposits streak the ground red and yellow",
      "A lone hot spring bubbles in a rocky basin",
      "Bleached bones half-buried in dry sand",
    ],
    sound: [
      "Hot wind hisses across bare rock",
      "Geysers rumble deep underground",
      "Sand rattles against stone like whispered warnings",
      "A distant hiss of steam from cracked earth",
      "Silence so vast it rings in your ears",
      "Rocks crack and pop in the relentless heat",
    ],
    smell: [
      "Sulfur and mineral-rich steam",
      "Baked earth and sun-heated stone",
      "Hot springs carry a faint metallic tang",
      "Dry dust that catches in the throat",
      "Something acrid from a fumarole nearby",
      "Clean heat with no trace of moisture",
    ],
  },
};

// === Helper Functions ===

import { OBOJIMA_IMPRESSIONS_BY_TERRAIN } from "./impressions-obojima";

/** Get impressions for terrain, branching on themeId */
export function getImpressionsForTerrain(terrain: TerrainType, themeId?: string): TerrainImpressions {
  if (themeId === "obojima") {
    return OBOJIMA_IMPRESSIONS_BY_TERRAIN[terrain] ?? OBOJIMA_IMPRESSIONS_BY_TERRAIN.plains;
  }
  return IMPRESSIONS_BY_TERRAIN[terrain] ?? IMPRESSIONS_BY_TERRAIN.plains;
}

/** Get a random impression set (one of each sense) */
export function getRandomImpressions(
  terrain: TerrainType,
  sightIndex: number,
  soundIndex: number,
  smellIndex: number,
  themeId?: string
): { sight: string; sound: string; smell: string } {
  const impressions = getImpressionsForTerrain(terrain, themeId);
  return {
    sight: impressions.sight[sightIndex % impressions.sight.length],
    sound: impressions.sound[soundIndex % impressions.sound.length],
    smell: impressions.smell[smellIndex % impressions.smell.length],
  };
}
