import type { TerrainType } from "~/models";
import type { SeededRandom } from "./SeededRandom";

/** Terrain description pools - evocative, brief flavor text */
const TERRAIN_DESCRIPTIONS: Record<TerrainType, readonly string[]> = {
  plains: [
    "Rolling grasslands stretch to the horizon, dotted with wildflowers.",
    "A weathered stone marker stands where two game trails cross.",
    "Tall grass ripples like waves in the steady wind.",
    "A shallow creek meanders through the open fields.",
    "Scattered boulders break the endless sea of grass.",
    "An abandoned shepherd's cairn overlooks the gentle slopes.",
    "Knee-high grass hides countless rodent burrows.",
    "A lone oak provides the only shade for miles.",
    "Dried wagon ruts mark an old trade route through the flatlands.",
    "Wildflower meadows attract clouds of butterflies and buzzing insects.",
    "The wind carries the scent of distant rain across the open expanse.",
    "Gopher mounds dot the landscape like tiny earthen forts.",
  ],
  forest: [
    "Dense canopy blocks most sunlight, leaving the forest floor in shadow.",
    "Ancient oaks tower overhead, their branches intertwined like fingers.",
    "A small clearing admits dappled sunlight through the leaves.",
    "Moss-covered stones suggest ruins long consumed by the wood.",
    "Fallen logs create natural bridges over a muddy game trail.",
    "Mushroom rings dot the forest floor near rotting stumps.",
    "Bird calls echo through the trees, impossibly loud in the silence.",
    "A massive tree has fallen, creating a gap in the endless green.",
    "Spider webs glisten with dew between the low branches.",
    "The smell of decay and growth mingles in the thick air.",
    "Twisted roots create treacherous footing across the needle-strewn ground.",
    "A hollow tree bears old claw marks around its entrance.",
  ],
  hills: [
    "Rocky outcrops jut from the grassy slopes like broken teeth.",
    "A narrow valley winds between the weathered hillsides.",
    "Wind-blasted vegetation clings to the exposed ridgeline.",
    "Stone ruins crown a distant hilltop.",
    "Sheep trails crisscross the heather-covered slopes.",
    "A spring bubbles up from between moss-covered rocks.",
    "The wind never stops atop these windswept heights.",
    "Loose scree makes the steep sections treacherous.",
    "A cave mouth gapes dark in the hillside.",
    "Wildflowers cling to sheltered spots between the stones.",
    "Tumbled boulders form a natural amphitheater in a hollow.",
    "The view from the ridge reveals miles of rolling terrain.",
  ],
  mountains: [
    "Jagged peaks pierce the clouds, their summits perpetually snow-capped.",
    "A treacherous path clings to the cliff face above a deadly drop.",
    "Thin air makes every step an effort at this altitude.",
    "An avalanche has scarred the mountainside with fresh rock.",
    "Mountain goats watch from impossible ledges overhead.",
    "A frozen waterfall gleams like glass in the weak sunlight.",
    "The wind howls through a narrow pass between towering peaks.",
    "Scrub pines cling desperately to the rocky soil.",
    "Eagles circle lazily in the thermals rising from the valley.",
    "A rockslide blocks what was once a passable route.",
    "Patches of snow persist in shadowed crevices year-round.",
    "The bones of some large creature lie scattered near the trail.",
  ],
  swamp: [
    "Murky water pools between twisted, moss-draped trees.",
    "Thick fog clings to the waterlogged ground.",
    "The stench of rot permeates the humid air.",
    "Gnarled roots create precarious walkways over the mire.",
    "Bubbles rise from the dark water, releasing foul gases.",
    "A heron takes flight, disturbed by your approach.",
    "Dead trees stand like pale sentinels in the muck.",
    "Insects swarm in thick clouds over the stagnant pools.",
    "Something large slipped beneath the water as you approached.",
    "Patches of solid ground appear and vanish unpredictably.",
    "Will-o-wisps flicker in the distance, or perhaps it's just swamp gas.",
    "Thick vines hang from skeletal branches like rotting curtains.",
  ],
  water: [
    "Gentle waves lap against a rocky shoreline.",
    "Fish break the surface, chasing insects in the shallows.",
    "The water is so clear you can see the sandy bottom.",
    "Reeds grow thick along the marshy edges.",
    "A strong current creates dangerous eddies near the shore.",
    "Seabirds cry overhead, circling for fish.",
    "The salty wind carries the smell of brine and kelp.",
    "Driftwood and debris mark the high tide line.",
    "The water stretches to the horizon, deep blue and endless.",
    "Smooth stones line a shallow beach perfect for landing boats.",
    "White-capped waves suggest dangerous conditions further out.",
    "A half-sunken wreck is visible in the shallows.",
  ],
};

/**
 * Generate evocative terrain description for a hex.
 * Uses seeded random for deterministic selection.
 */
export function generateTerrainDescription(
  terrain: TerrainType,
  rng: SeededRandom
): string {
  const descriptions = TERRAIN_DESCRIPTIONS[terrain];
  return rng.pick(descriptions);
}
