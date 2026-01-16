/**
 * TreasureBackstoryGenerator - Adds narrative depth to dungeon treasure.
 * Creates backstories, original owners, and complications for valuable items.
 */

import type { TreasureEntry, TreasureType, DungeonTheme, HistoryLayer } from "~/models";
import { SeededRandom } from "../SeededRandom";

// === Backstory Templates by Theme ===

const BACKSTORY_BY_THEME: Record<DungeonTheme, string[]> = {
  tomb: [
    "Interred with {owner} as a symbol of their station",
    "An offering left by mourners generations ago",
    "Stolen from the grave by thieves who never escaped",
    "Part of the burial goods that survived grave robbers",
    "Placed to appease the spirits of the dead",
  ],
  cave: [
    "Dropped by an adventurer who fled in terror",
    "Part of a smuggler's hidden cache",
    "Left behind by a hermit who once dwelt here",
    "Washed in by underground floods from distant places",
    "A dragon's forgotten trinket from a larger hoard",
  ],
  temple: [
    "A sacred offering to the forgotten gods",
    "Once adorned the high altar before the fall",
    "Donated by {owner} seeking divine favor",
    "Hidden by priests during the temple's sacking",
    "A relic of the faith that once flourished here",
  ],
  fortress: [
    "Part of the garrison's emergency treasury",
    "Seized from conquered enemies long ago",
    "Hidden by the castellan before the fortress fell",
    "Payment for mercenaries who never collected",
    "Looted from {owner} during the last siege",
  ],
  mine: [
    "Forgotten wages for miners who never returned",
    "Hidden by a prospector who struck it rich",
    "Left by the mining company when they abandoned operations",
    "A miner's lucky charm that failed them",
    "Part of an embezzlement scheme gone wrong",
  ],
  sewer: [
    "Dropped through a grate from the city above",
    "A thief's emergency stash",
    "Stolen from {owner} and hidden in the muck",
    "Lost during a smuggling operation gone wrong",
    "Hidden by city workers skimming from repairs",
  ],
  crypt: [
    "Interred with the body of {owner}",
    "Left as offerings to ward off curses",
    "Hidden by the cult that maintains this place",
    "Part of the death mask's ornamentation",
    "Tribute to ensure the dead remain at rest",
  ],
  bandit_hideout: [
    "Stolen from merchants on the road",
    "The gang's reserve fund for lean times",
    "{owner}'s personal stash hidden from the others",
    "Ransom payment for a noble who didn't survive",
    "Loot from a heist that went better than expected",
  ],
  cultist_lair: [
    "An offering to the dark powers they serve",
    "Confiscated from new converts",
    "Stolen from {owner} during a ritual sacrifice",
    "Payment for a dark bargain fulfilled",
    "Gathered to fund their apocalyptic plans",
  ],
  witch_hut: [
    "Payment for hexes and curses",
    "Stolen from unwary travelers",
    "Inherited from the previous witch",
    "Gifted by {owner} seeking forbidden knowledge",
    "Accumulated over decades of dark dealings",
  ],
  sea_cave: [
    "Washed up from a shipwreck long ago",
    "Part of a pirate's buried treasure",
    "Hidden by smugglers before the tide came",
    "Tribute thrown to the sea gods",
    "Salvaged from {owner}'s vessel by merfolk",
  ],
  beast_den: [
    "Taken from the beast's last victim",
    "Part of the creature's instinctive hoard",
    "Left by hunters who became the hunted",
    "Carried here in the stomach of prey",
    "Drawn here by the beast's magpie instincts",
  ],
  lair: [
    "Accumulated over years of raiding",
    "Stolen from {owner} and added to the hoard",
    "Tribute paid by fearful villagers",
    "The master's personal collection",
    "Loot from a rival who was eliminated",
  ],
  shrine: [
    "A pilgrim's offering seeking blessing",
    "Donated by {owner} in gratitude for miracles",
    "Hidden here when the faith was persecuted",
    "Part of the shrine's sacred treasures",
    "Left by a dying traveler seeking peace",
  ],
  floating_keep: [
    "Accumulated by the keep's arcane master",
    "Fallen from the world below over centuries",
    "A gift from {owner} seeking magical knowledge",
    "Payment for impossible enchantments",
    "Summoned from distant treasure vaults",
  ],
};

// === Original Owner Templates ===

const ORIGINAL_OWNERS = [
  "a wealthy merchant",
  "a minor noble",
  "a guild master",
  "a foreign dignitary",
  "a retired adventurer",
  "a desperate debtor",
  "an eccentric collector",
  "a temple official",
  "a royal cousin",
  "a bandit king",
  "a hedge wizard",
  "a wandering knight",
  "a merchant prince",
  "a famous courtesan",
  "a disgraced priest",
];

// === Complication Templates ===

const COMPLICATIONS_BY_TYPE: Record<TreasureType, string[]> = {
  coins: [
    "The coins bear a royal seal that's been outlawed",
    "Blood stains that won't quite wash off hint at murder",
    "These coins are marked by the thieves' guild",
    "A curse makes owners dream of the original victim",
    "The coins are counterfeit—excellent fakes, but fakes",
  ],
  gems: [
    "The gem is famous—any jeweler will recognize it as stolen",
    "The gem is secretly flawed and worth a fraction of its apparent value",
    "A family has been searching for this heirloom for generations",
    "The gem glows faintly in moonlight, attracting unwanted attention",
    "Taking it triggers a geas laid by the original owner",
  ],
  art: [
    "The piece is well-documented—selling it invites scrutiny",
    "It depicts scenes sacred to a vengeful cult",
    "Hidden inside is a message that powerful people want destroyed",
    "The artist's ghost haunts those who possess it",
    "A collector has hired assassins to recover it",
  ],
  item: [
    "The maker's mark identifies it as stolen military property",
    "It carries a faint magical aura that attracts monsters",
    "A secret compartment holds incriminating documents",
    "The item is subject to an ancient deed of ownership",
    "Using it openly will be recognized by its former owner",
  ],
  magic_item: [
    "The item has a hidden curse that activates gradually",
    "A powerful wizard wants it back—badly",
    "Using it draws the attention of extraplanar entities",
    "The item is bonded to a bloodline and will try to return",
    "Its magic is unstable and may fail at critical moments",
  ],
};

// === General Complications (theme-agnostic) ===

const GENERAL_COMPLICATIONS = [
  "Taking it fulfills a prophecy in unexpected ways",
  "It's actually a convincing fake—the real one is elsewhere",
  "A dying curse binds this to whoever last held it",
  "Removing it from here destabilizes the local magic",
  "A faction has placed a bounty on its return",
  "The item appears in local legends—taking it makes you notable",
];

// === History-Based Backstory Templates ===

const HISTORY_BACKSTORIES = [
  "Left here during {era}, when the {builders} occupied this place",
  "Hidden before the site {fate}, and never retrieved",
  "Belonged to the {builders} who built this place",
  "Survived the events of {era} that shaped this place",
  "A remnant from when the {builders} {fate}",
];

export interface TreasureBackstoryOptions {
  seed: string;
  theme: DungeonTheme;
  historyLayers?: HistoryLayer[];
}

/**
 * Add backstories and complications to treasure entries.
 */
export function addTreasureBackstories(
  treasure: TreasureEntry[],
  options: TreasureBackstoryOptions
): TreasureEntry[] {
  const { seed, theme, historyLayers = [] } = options;
  const rng = new SeededRandom(`${seed}-treasure-backstory`);

  return treasure.map((entry, index) => {
    // Chance of backstory depends on treasure type
    const backstoryChance = getBackstoryChance(entry.type);

    if (!rng.chance(backstoryChance)) {
      return entry;
    }

    const backstory = generateBackstory(rng, entry, theme, historyLayers);
    const complication = rng.chance(0.3) ? generateComplication(rng, entry.type) : undefined;
    const originalOwner = rng.chance(0.5) ? rng.pick(ORIGINAL_OWNERS) : undefined;

    return {
      ...entry,
      backstory: backstory.replace("{owner}", originalOwner ?? "a forgotten soul"),
      complication,
      originalOwner,
    };
  });
}

/**
 * Get the chance of generating a backstory based on treasure type.
 */
function getBackstoryChance(type: TreasureType): number {
  switch (type) {
    case "magic_item":
      return 0.9;  // Almost always have a story
    case "art":
      return 0.7;  // Unique pieces usually have history
    case "gems":
      return 0.5;  // Notable gems have stories
    case "item":
      return 0.4;  // Some items are noteworthy
    case "coins":
      return 0.2;  // Coins rarely have individual stories
  }
}

/**
 * Generate a backstory for a treasure entry.
 */
function generateBackstory(
  rng: SeededRandom,
  entry: TreasureEntry,
  theme: DungeonTheme,
  historyLayers: HistoryLayer[]
): string {
  // 30% chance to tie to dungeon history if available
  if (historyLayers.length > 0 && rng.chance(0.3)) {
    const layer = rng.pick(historyLayers);
    const template = rng.pick(HISTORY_BACKSTORIES);
    return template
      .replace("{era}", layer.era)
      .replace("{builders}", layer.builders.toLowerCase())
      .replace("{fate}", layer.fate.toLowerCase());
  }

  // Otherwise use theme-based backstory
  const themeBackstories = BACKSTORY_BY_THEME[theme];
  return rng.pick(themeBackstories);
}

/**
 * Generate a complication for taking the treasure.
 */
function generateComplication(
  rng: SeededRandom,
  type: TreasureType
): string {
  // 60% chance of type-specific complication
  if (rng.chance(0.6)) {
    return rng.pick(COMPLICATIONS_BY_TYPE[type]);
  }

  // Otherwise use general complication
  return rng.pick(GENERAL_COMPLICATIONS);
}

/**
 * Standalone function to generate backstory for a single treasure item.
 */
export function generateTreasureBackstory(
  seed: string,
  entry: TreasureEntry,
  theme: DungeonTheme,
  historyLayers?: HistoryLayer[]
): TreasureEntry {
  const rng = new SeededRandom(`${seed}-single-treasure`);

  const backstoryChance = getBackstoryChance(entry.type);
  if (!rng.chance(backstoryChance)) {
    return entry;
  }

  const originalOwner = rng.chance(0.5) ? rng.pick(ORIGINAL_OWNERS) : undefined;
  const backstory = generateBackstory(rng, entry, theme, historyLayers ?? []);
  const complication = rng.chance(0.3) ? generateComplication(rng, entry.type) : undefined;

  return {
    ...entry,
    backstory: backstory.replace("{owner}", originalOwner ?? "a forgotten soul"),
    complication,
    originalOwner,
  };
}
