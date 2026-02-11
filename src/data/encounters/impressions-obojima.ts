// Obojima First Impressions by Terrain
// Setting-appropriate sensory details for the Obojima archipelago

import type { TerrainType } from "~/models";
import type { TerrainImpressions } from "./impressions";

export const OBOJIMA_IMPRESSIONS_BY_TERRAIN: Record<TerrainType, TerrainImpressions> = {
  plains: {
    sight: [
      "Tall grass ripples with faint spirit lights at the tips",
      "Dustbunnies scatter in puffs across the golden field",
      "A hill dragon's back ridges break the distant grassline",
      "Yokario drum circles leave flattened rings in the meadow",
      "Howler tracks weave through trampled wildflowers",
      "A field giant stands motionless like a weathered monolith",
    ],
    sound: [
      "Distant howler laughter carries on the wind",
      "Yokario drums echo from a hidden hollow",
      "Dragon frogs croak in baritone pulses",
      "Spirit chimes tinkle where no wind blows",
      "Grasshoppers harmonize with faint magical humming",
      "A dustbunny teleports with a soft pop nearby",
    ],
    smell: [
      "Sweet wildflower pollen thick as perfume",
      "Sun-warmed grass with undertone of spirit ozone",
      "Dustbunny fur — like warm cotton and static",
      "Dragon frog musk, sharp and amphibian",
      "Clean wind off the distant sea",
      "Trampled herbs where howlers passed through",
    ],
  },

  forest: {
    sight: [
      "Canopy glows with patches of spirit moss",
      "Kafuka peer from high branches, tails coiled",
      "Watchwood trees shift almost imperceptibly as you pass",
      "Acorn crabs cling motionless to bark overhead",
      "Mosslings huddle in a shy cluster by a stream",
      "Vespoma hive structures hang like paper lanterns",
    ],
    sound: [
      "Kafuka chatter echoes through the canopy",
      "Vespoma hum a low droning chorus",
      "Branches creak as watchwood trees turn to look",
      "A lion's blume snaps at a passing insect",
      "Pixie laughter rings like tiny bells",
      "Something very large pads softly through undergrowth",
    ],
    smell: [
      "Cedar and wet earth after spirit rain",
      "Mushroom spores from mossling groves",
      "Vespoma honey, cloying and slightly magical",
      "Pine resin mixed with ozone from pixie magic",
      "Damp moss and the green tang of living wood",
      "Stul musk — hallucinogenic and sweet",
    ],
  },

  hills: {
    sight: [
      "Sheep dragons drift lazily between cloud-wrapped peaks",
      "Howler camps dot the ridgeline with crude shelters",
      "A hill dragon burrow entrance, earth freshly turned",
      "Rubble golem debris scattered across a rocky slope",
      "Harpy nests cling to cliff faces like mud cups",
      "Spirit lights dance along the ridgeline at dusk",
    ],
    sound: [
      "Sheep dragon bleating echoes across valleys",
      "Howler snarler war-chants drift from a distant camp",
      "Wind whistles through harpy-carved cliff hollows",
      "Loose stones clatter from a hill dragon's passage",
      "A field giant's footstep thuds like distant thunder",
      "Discouraging howler chuckles float from behind rocks",
    ],
    smell: [
      "Sheep dragon wool — lanolin and cloud moisture",
      "Hot stone and dragon musk from a nearby burrow",
      "Howler campfire smoke, burning stolen goods",
      "Wildflowers crushed under massive footprints",
      "Cold mineral air from rubble golem territory",
      "Rain approaching off the sea between islands",
    ],
  },

  mountains: {
    sight: [
      "Cloud-wrapped peaks with prayer flags snapping in wind",
      "Snowball spirits roll and tumble down a distant slope",
      "A slagger hovers above a volcanic vent, trailing magma",
      "Cuddle bugs burrow into snow banks in clusters",
      "Sheep dragons roost on impossible cliff ledges",
      "Hot springs steam rises from between frost-cracked rocks",
    ],
    sound: [
      "Wind through ancient prayer flags, rhythmic and low",
      "Snowball spirits giggling as they gather mass",
      "A slagger's molten drip hisses on cold stone",
      "Cuddle bugs chirp softly from snow burrows",
      "Distant rockfall from a sheep dragon's clumsy landing",
      "Volcanic vents rumble deep underground",
    ],
    smell: [
      "Sulfur from hot springs and volcanic vents",
      "Clean ice and thin mountain air",
      "Slagger magma — metallic and scorching",
      "Cuddle bug warmth — like heated cotton",
      "Snow and pine from the treeline far below",
      "Mineral-rich steam from geothermal pools",
    ],
  },

  water: {
    sight: [
      "Bioluminescent waves pulse with spirit energy",
      "Fish folk spears glint just beneath the surface",
      "A stone whale's back breaks the water like an island",
      "Giant jellyfish drift in slow glowing processions",
      "Skeletal fish swarm in tight silver clouds",
      "Hammer gulls circle with boulders in their claws",
    ],
    sound: [
      "Distant whale song reverberates through the hull",
      "Fish folk drums echo from a coral outcrop",
      "Hammer gulls cry and splash as boulders drop",
      "Jellyfish tentacles drag across the surface like rain",
      "Something enormous surfaces and dives far off",
      "Bearracuda splashing as it hunts near the shore",
    ],
    smell: [
      "Salt and kelp thick on the warm wind",
      "Seaweed elemental — briny and electric",
      "Fish folk cooking fires on a nearby reef",
      "Ozone from spirit-charged waters",
      "Deep brine rising from a stone whale's wake",
      "Storm coming — pressure dropping, air heavy",
    ],
  },

  swamp: {
    sight: [
      "Corruption tendrils thread through the dark water",
      "Slime trails glisten on every surface",
      "Corrupted muk shamble between dead trees",
      "Green slime bubbles in pools of stagnant water",
      "Soda slime clings to a rock, almost invisible",
      "Vile corruption shifts form in the distant mist",
    ],
    sound: [
      "Bubbling slime pops in rhythmic bursts",
      "Corrupted muk groan as they drag through mud",
      "A soda slime pops like a shaken bottle",
      "Insects buzz in thick corruption-tainted clouds",
      "Squelching from something moving through deep muck",
      "Eerie silence — even the slimes have gone still",
    ],
    smell: [
      "Acrid corruption decay thick enough to taste",
      "Necrotic slime — chemical and wrong",
      "Soda slime fizz — weirdly sweet amid the rot",
      "Sulfur and methane from bubbling corruption pools",
      "Something toxic, making your eyes water",
      "Green slime acid — sharp and corrosive",
    ],
  },

  desert: {
    sight: [
      "Heat shimmer reveals a slagger floating above the dunes",
      "Orange slime trails bake into glass on hot sand",
      "Rubble golem debris scattered across cracked earth",
      "Demon silhouettes flicker at the edge of vision",
      "Dustbunnies burst from sand in startled puffs",
      "A crawler's tracks weave endlessly through the waste",
    ],
    sound: [
      "A slagger's molten drip sizzles on baked stone",
      "Crawler legs click across hardpan in rapid staccato",
      "Demon whispers intrude at the edge of thought",
      "Sand hisses across rock like whispered warnings",
      "Orange slime bubbles and steams after rain",
      "Silence so vast the heat itself seems to hum",
    ],
    smell: [
      "Sulfur and scorched earth from slagger territory",
      "Orange slime — metallic heat and burning sand",
      "Dry dust and demon ozone",
      "Baked earth cracking in the relentless sun",
      "Something acrid from a fumarole nearby",
      "Hot stone with faint corruption undertone",
    ],
  },
};
