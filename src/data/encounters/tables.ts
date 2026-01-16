// Improved Encounter Tables
// Master table (1d6), Reaction (1d10), and sub-tables for each encounter type

import type { EncounterType, Reaction, TerrainType } from "~/models";

// === Master Encounter Table (1d6) ===

export interface MasterTableEntry {
  roll: number;
  type: EncounterType;
  label: string;
  description: string;
}

export const MASTER_TABLE: MasterTableEntry[] = [
  {
    roll: 1,
    type: "creature",
    label: "Creature",
    description: "Roll on terrain creature table",
  },
  {
    roll: 2,
    type: "sign",
    label: "Sign/Omen",
    description: "Clue, spoor, track, abandoned lair, scent, or victim",
  },
  {
    roll: 3,
    type: "environment",
    label: "Environment",
    description: "Surroundings shift or escalate",
  },
  {
    roll: 4,
    type: "loss",
    label: "Loss",
    description: "Resource loss - resolve before moving on",
  },
  {
    roll: 5,
    type: "npc",
    label: "NPC",
    description: "Encounter another character",
  },
  {
    roll: 6,
    type: "area-effect",
    label: "Discovery",
    description: "Find treasure, gear, or useful items",
  },
];

// === Reaction Table (1d10) ===

export interface ReactionTableEntry {
  minRoll: number;
  maxRoll: number;
  reaction: Reaction;
  label: string;
}

export const REACTION_TABLE: ReactionTableEntry[] = [
  { minRoll: 1, maxRoll: 2, reaction: "hostile", label: "Hostile" },
  { minRoll: 3, maxRoll: 5, reaction: "wary", label: "Wary" },
  { minRoll: 6, maxRoll: 7, reaction: "curious", label: "Curious" },
  { minRoll: 8, maxRoll: 9, reaction: "friendly", label: "Friendly" },
  { minRoll: 10, maxRoll: 10, reaction: "helpful", label: "Helpful" },
];

// === Sign/Omen Table (1d12) ===

export interface SignTableEntry {
  roll: number;
  text: string;
  detail: string;
}

export const SIGN_TABLE: SignTableEntry[] = [
  { roll: 1, text: "Fresh tracks", detail: "Something passed through recently" },
  { roll: 2, text: "Abandoned campfire", detail: "Still warm, hastily abandoned" },
  { roll: 3, text: "Claw marks", detail: "Deep gouges in tree or stone" },
  { roll: 4, text: "Distant howl", detail: "Echoing cry from the direction you're heading" },
  { roll: 5, text: "Scattered bones", detail: "Remains of a recent kill" },
  { roll: 6, text: "Strange smell", detail: "Sulfur, rot, or something unnatural" },
  { roll: 7, text: "Broken equipment", detail: "Discarded gear from previous travelers" },
  { roll: 8, text: "Warning sign", detail: "Carved symbol or painted mark" },
  { roll: 9, text: "Animal behavior", detail: "Birds flee, insects go silent" },
  { roll: 10, text: "Blood trail", detail: "Dried or fresh, leading somewhere" },
  { roll: 11, text: "Territorial marking", detail: "Scent or visual boundary marker" },
  { roll: 12, text: "Lair entrance", detail: "Visible but seemingly abandoned" },
];

// === Environment Table (1d20) ===
// Natural events, terrain changes, and strange phenomena

export interface EnvironmentTableEntry {
  roll: number;
  text: string;
  effect: string;
  magical: boolean;
}

export const ENVIRONMENT_TABLE: EnvironmentTableEntry[] = [
  // Natural terrain/weather (1-8)
  { roll: 1, text: "Weather shifts", effect: "Sudden storm, fog, or temperature drop", magical: false },
  { roll: 2, text: "Ground collapse", effect: "Sinkhole or cave-in, DEX save or fall 10ft", magical: false },
  { roll: 3, text: "Flash flood", effect: "Water rushes through, STR save or swept away", magical: false },
  { roll: 4, text: "Visibility drops", effect: "Thick mist, smoke, or dust - can't see 30ft", magical: false },
  { roll: 5, text: "Path blocked", effect: "Rockslide, fallen tree, or collapsed bridge", magical: false },
  { roll: 6, text: "Natural hazard", effect: "Quicksand, poison plants, or unstable ice", magical: false },
  { roll: 7, text: "Temperature extreme", effect: "Sudden heat wave or cold snap, CON save or exhaustion", magical: false },
  { roll: 8, text: "Darkness descends", effect: "Eclipse, thick canopy, or storm blocks all light", magical: false },
  // Sudden events (9-14)
  { roll: 9, text: "Swarm attack", effect: "Bees, bats, or rats - DC 12 CON or flee area", magical: false },
  { roll: 10, text: "Stampede", effect: "Animals flee through area, DEX save or 2d6 damage", magical: false },
  { roll: 11, text: "Gas pocket", effect: "Foul air - DC 13 CON or poisoned 1 hour", magical: false },
  { roll: 12, text: "Explosion", effect: "Gas or old cache ignites - 2d6 fire, DEX halves", magical: false },
  { roll: 13, text: "Static discharge", effect: "Lightning, metal sparks - 1d6 damage to armored", magical: false },
  { roll: 14, text: "Ground tremor", effect: "Brief quake, DEX save or fall prone", magical: false },
  // Magical phenomena (15-20)
  { roll: 15, text: "Time skip", effect: "Lose 1d4 hours, sun position changes", magical: true },
  { roll: 16, text: "Silence bubble", effect: "No sound 10 min, verbal spells fail", magical: true },
  { roll: 17, text: "Gravity flux", effect: "Fall upward 10ft then down, 1d6 damage", magical: true },
  { roll: 18, text: "Memory flash", effect: "Vivid vision of violence that happened here", magical: true },
  { roll: 19, text: "Fey glimpse", effect: "Feywild visible, 50% chance pixie appears", magical: true },
  { roll: 20, text: "Dead zone", effect: "No magic functions for 10 minutes", magical: true },
];

// === Loss Table (1d8) - Physical Resources Only ===
// Terrain-specific for narrative relevance

export interface LossTableEntry {
  roll: number;
  text: string;
  effect: string;
}

const LOSS_PLAINS: LossTableEntry[] = [
  { roll: 1, text: "Heat exhaustion", effect: "Fatigue sets in, disadvantage until rest" },
  { roll: 2, text: "Fresh water lost", effect: "Spill, theft, or spoilage - lose 1d4 days water" },
  { roll: 3, text: "Gear damaged", effect: "Wind, dust, or mishap ruins one item" },
  { roll: 4, text: "Mount trouble", effect: "Animal lame, spooked, or exhausted" },
  { roll: 5, text: "Rations spoiled", effect: "Heat, vermin, or accident ruins 1d4 days food" },
  { roll: 6, text: "Lost bearing", effect: "Featureless terrain, must reorient" },
  { roll: 7, text: "Clothing torn", effect: "Thorns, snags, or wear damages garments" },
  { roll: 8, text: "Tool broken", effect: "Essential equipment snaps or bends" },
];

const LOSS_FOREST: LossTableEntry[] = [
  { roll: 1, text: "Light sources lost", effect: "Damp, dropped, or depleted - no torches/lanterns" },
  { roll: 2, text: "Gear snagged", effect: "Thorns or branches tear pack, cloak, or rope" },
  { roll: 3, text: "Poisoned", effect: "Bad berries, plant contact, or insect bite" },
  { roll: 4, text: "Rations spoiled", effect: "Mold, insects, or damp ruins 1d4 days food" },
  { roll: 5, text: "Lost bearing", effect: "Dense canopy obscures sky, disoriented" },
  { roll: 6, text: "Fresh water lost", effect: "Spill, contamination, or theft" },
  { roll: 7, text: "Footwear damaged", effect: "Roots, mud, or wear ruins boots" },
  { roll: 8, text: "Tool broken", effect: "Axe, saw, or implement snaps" },
];

const LOSS_HILLS: LossTableEntry[] = [
  { roll: 1, text: "Injury", effect: "Twisted ankle, strained muscle, or fall - slowed" },
  { roll: 2, text: "Gear lost", effect: "Dropped, slides downhill, or stolen" },
  { roll: 3, text: "Equipment damaged", effect: "Impact, rockfall, or mishap breaks item" },
  { roll: 4, text: "Mount trouble", effect: "Animal injured, spooked, or exhausted" },
  { roll: 5, text: "Fresh water lost", effect: "Container burst, spilled, or fouled" },
  { roll: 6, text: "Papers lost", effect: "Map, scroll, or notes ruined or blown away" },
  { roll: 7, text: "Exhaustion", effect: "Climbing saps strength, disadvantage until rest" },
  { roll: 8, text: "Rations spoiled", effect: "Crushed, soaked, or vermin get to food" },
];

const LOSS_MOUNTAINS: LossTableEntry[] = [
  { roll: 1, text: "Cold injury", effect: "Frostbite or hypothermia, need treatment" },
  { roll: 2, text: "Equipment frozen", effect: "Mechanisms, liquids, or fabric ice-bound" },
  { roll: 3, text: "Altitude sickness", effect: "Nausea and weakness until rest or descent" },
  { roll: 4, text: "Rope damaged", effect: "Frayed, cut, or frozen - unreliable" },
  { roll: 5, text: "Gear lost", effect: "Dropped over edge, buried, or stolen" },
  { roll: 6, text: "Light sources lost", effect: "Frozen, dropped, or depleted" },
  { roll: 7, text: "Fresh water lost", effect: "Frozen solid, spilled, or contaminated" },
  { roll: 8, text: "Climbing gear broken", effect: "Pitons, crampons, or picks fail" },
];

const LOSS_WATER: LossTableEntry[] = [
  { roll: 1, text: "Gear soaked", effect: "Water ruins item - paper, food, powder, or cloth" },
  { roll: 2, text: "Equipment corroded", effect: "Rust, salt damage, or waterlogging" },
  { roll: 3, text: "Rope damaged", effect: "Rot, fray, or tangled beyond use" },
  { roll: 4, text: "Clothing ruined", effect: "Soaked, torn, or lost overboard" },
  { roll: 5, text: "Papers lost", effect: "Maps, scrolls, or notes ruined by water" },
  { roll: 6, text: "Rations spoiled", effect: "Saltwater, mold, or contamination" },
  { roll: 7, text: "Vessel damaged", effect: "Oar, sail, or hull needs repair" },
  { roll: 8, text: "Gear lost overboard", effect: "Wave, mishap, or theft - item gone" },
];

const LOSS_SWAMP: LossTableEntry[] = [
  { roll: 1, text: "Footwear lost", effect: "Mud claims boot, sandal, or shoe" },
  { roll: 2, text: "Gear lost in muck", effect: "Sinks, stolen, or dropped - gone" },
  { roll: 3, text: "Injury/illness", effect: "Leech, bite, infection, or fever" },
  { roll: 4, text: "Rations spoiled", effect: "Rot, mold, or vermin ruin 1d4 days food" },
  { roll: 5, text: "Light sources lost", effect: "Too damp, dropped, or depleted" },
  { roll: 6, text: "Fresh water lost", effect: "Contaminated, spilled, or stolen" },
  { roll: 7, text: "Clothing ruined", effect: "Rot, mold, or tears - armor straps weaken" },
  { roll: 8, text: "Pack soaked", effect: "Multiple items water-damaged" },
];

/** Get terrain-specific loss table */
export function getLossTableForTerrain(terrain: TerrainType): LossTableEntry[] {
  switch (terrain) {
    case "plains": return LOSS_PLAINS;
    case "forest": return LOSS_FOREST;
    case "hills": return LOSS_HILLS;
    case "mountains": return LOSS_MOUNTAINS;
    case "water": return LOSS_WATER;
    case "swamp": return LOSS_SWAMP;
    default: return LOSS_FOREST; // fallback
  }
}

// Legacy export for backwards compatibility
export const LOSS_TABLE = LOSS_FOREST;

// === Area Effect Table (1d20) - Discovery/Loot ===
// Party stumbles upon something useful

export interface AreaEffectTableEntry {
  roll: number;
  text: string;
  effect: string;
  magical: boolean;
}

export const AREA_EFFECT_TABLE: AreaEffectTableEntry[] = [
  // Mundane finds (1-14)
  { roll: 1, text: "Abandoned pack", effect: "Backpack with 1d4 days rations, waterskin, rope", magical: false },
  { roll: 2, text: "Hidden cache", effect: "Buried chest with 2d20 gold coins", magical: false },
  { roll: 3, text: "Fallen traveler", effect: "Skeleton with usable gear - weapon, armor, or tool", magical: false },
  { roll: 4, text: "Old campsite", effect: "Salvageable supplies - torches, bedroll, cookware", magical: false },
  { roll: 5, text: "Weapon rack", effect: "Abandoned or hidden - 1d3 weapons in good condition", magical: false },
  { roll: 6, text: "Coin purse", effect: "Dropped or hidden - 3d10 silver pieces", magical: false },
  { roll: 7, text: "Useful tool", effect: "Crowbar, shovel, lantern, or similar in good shape", magical: false },
  { roll: 8, text: "Healing herbs", effect: "Enough to brew 1d4 healing potions (healer's kit)", magical: false },
  { roll: 9, text: "Map fragment", effect: "Partial map showing nearby dungeon or treasure location", magical: false },
  { roll: 10, text: "Merchant's stash", effect: "Trade goods worth 2d20 gold - fabric, spices, tools", magical: false },
  { roll: 11, text: "Quality armor piece", effect: "Shield, helmet, or armor in good condition", magical: false },
  { roll: 12, text: "Hunting trap", effect: "Set but empty - can recover for use", magical: false },
  { roll: 13, text: "Rare component", effect: "Spell component, alchemical ingredient, or craft material", magical: false },
  { roll: 14, text: "Journal/letters", effect: "Clues about local danger, treasure, or faction", magical: false },
  // Magical finds (15-20)
  { roll: 15, text: "Glowing stone", effect: "Everburning torch or light-producing gem", magical: true },
  { roll: 16, text: "Potion vial", effect: "1 random potion - healing, strength, invisibility, etc.", magical: true },
  { roll: 17, text: "Enchanted trinket", effect: "Minor magic item - compass, lucky charm, warmth ring", magical: true },
  { roll: 18, text: "Scroll case", effect: "1d3 spell scrolls, levels 1-2", magical: true },
  { roll: 19, text: "Cursed object", effect: "Valuable but cursed - ring, weapon, or idol", magical: true },
  { roll: 20, text: "Magic weapon", effect: "+1 weapon or weapon with minor enchantment", magical: true },
];

// === Helper Functions ===

/** Get reaction from 1d10 roll */
export function getReactionFromRoll(roll: number): Reaction {
  const entry = REACTION_TABLE.find(
    (e) => roll >= e.minRoll && roll <= e.maxRoll
  );
  return entry?.reaction ?? "wary";
}

/** Get reaction index (0-4) from reaction type */
export function getReactionIndex(reaction: Reaction): number {
  const reactions: Reaction[] = ["hostile", "wary", "curious", "friendly", "helpful"];
  return reactions.indexOf(reaction);
}

/** Get reaction from index (0-4) */
export function getReactionFromIndex(index: number): Reaction {
  const reactions: Reaction[] = ["hostile", "wary", "curious", "friendly", "helpful"];
  return reactions[index] ?? "wary";
}
