import { nanoid } from "nanoid";
import type {
  SignificantItem,
  SignificantItemStatus,
  MagicItemRarity,
  HexCoord,
} from "~/models";
import { SeededRandom, createWeightedTable } from "./SeededRandom";

// === Significant Item Templates ===
// These are setting-defining artifacts that drive faction conflict

export type SignificantItemCategory =
  | "crown"      // Symbol of rulership/authority
  | "weapon"     // Legendary blade, bow, hammer
  | "tome"       // Book of forbidden knowledge
  | "relic"      // Holy/unholy religious artifact
  | "key"        // Opens something important (vault, prison, portal)
  | "vessel"     // Contains something (soul, demon, power)
  | "regalia"    // Set piece of a greater whole
  | "focus";     // Amplifies magic or power

const CATEGORY_WEIGHTS = createWeightedTable<SignificantItemCategory>({
  crown: 15,
  weapon: 25,
  tome: 15,
  relic: 15,
  key: 10,
  vessel: 10,
  regalia: 5,
  focus: 5,
});

// === Name Generation ===

const ITEM_PREFIXES: Record<SignificantItemCategory, string[]> = {
  crown: ["Crown", "Circlet", "Diadem", "Coronet", "Tiara"],
  weapon: ["Blade", "Sword", "Axe", "Spear", "Bow", "Hammer", "Mace"],
  tome: ["Tome", "Grimoire", "Codex", "Libram", "Scroll", "Chronicle"],
  relic: ["Relic", "Icon", "Chalice", "Censer", "Idol", "Bones"],
  key: ["Key", "Seal", "Signet", "Token", "Cipher"],
  vessel: ["Vessel", "Urn", "Phylactery", "Lantern", "Orb", "Heart"],
  regalia: ["Scepter", "Ring", "Mantle", "Orb", "Throne"],
  focus: ["Staff", "Crystal", "Prism", "Eye", "Mirror", "Stone"],
};

const ITEM_EPITHETS = [
  "of the Dawn",
  "of Shadows",
  "of the Fallen",
  "of Fire",
  "of Ice",
  "of the Deep",
  "of Whispers",
  "of the Void",
  "of Storms",
  "of Blood",
  "of the Ancients",
  "of Dominion",
];

const ITEM_NAMES: Record<SignificantItemCategory, string[]> = {
  crown: ["Ember", "Frost", "Thorn", "Golden", "Iron", "Crimson", "Pale"],
  weapon: ["Fang", "Edge", "Fury", "Silence", "Thunder", "Venom", "Glory"],
  tome: ["Forbidden", "Lost", "Dark", "Eternal", "Final", "First"],
  relic: ["Sacred", "Profane", "Burning", "Silent", "Weeping", "Blazing"],
  key: ["Black", "Silver", "Bone", "Crystal", "Living", "Dead"],
  vessel: ["Soul", "Demon", "Storm", "Dream", "Void", "Light"],
  regalia: ["Royal", "Imperial", "Divine", "Cursed", "True", "False"],
  focus: ["Arcane", "Elder", "Primal", "Chaos", "Order", "Wild"],
};

// === History Generation ===

const HISTORY_TEMPLATES = [
  "Forged in the {era} by {creator}, this {item} was {event}",
  "Once wielded by {creator}, it was {event} during the {era}",
  "Created to {purpose}, this {item} was {event} in the {era}",
  "Legend speaks of {creator} who crafted this {item} to {purpose}",
  "This {item} emerged from the {era} when {creator} sought to {purpose}",
];

const HISTORY_ERAS = [
  "Age of Fire",
  "Time Before Kings",
  "War of Shadows",
  "Reign of the Flame Kings",
  "Great Cataclysm",
  "Era of the God-Emperors",
  "Long Night",
  "First Dawn",
];

const HISTORY_CREATORS = [
  "the last Flame King",
  "an unknown archmage",
  "the Cult of the Consuming Fire",
  "the dwarven master-smiths",
  "a desperate bargain with dark powers",
  "the Elders of the First Circle",
  "a dying god's final act",
  "the nameless witch of the deep woods",
];

const HISTORY_EVENTS = [
  "lost when its bearer fell in battle",
  "hidden away to prevent misuse",
  "stolen by treacherous allies",
  "sealed in a tomb of darkness",
  "scattered across the realm",
  "corrupted by dark magic",
  "passed through many hands",
  "forgotten by all but a few",
];

const HISTORY_PURPOSES = [
  "unite the warring kingdoms",
  "seal away an ancient evil",
  "command the elemental forces",
  "open the gates between worlds",
  "grant dominion over the dead",
  "ensure an eternal dynasty",
  "destroy a rival power",
  "commune with forgotten gods",
];

// === Effect Generation ===

const EFFECTS_BY_CATEGORY: Record<SignificantItemCategory, string[]> = {
  crown: [
    "Commands absolute loyalty from those who swear fealty",
    "Grants visions of threats to the realm",
    "Allows the wearer to speak any language",
    "Protects the wearer from assassination",
    "Reveals the true intentions of courtiers",
  ],
  weapon: [
    "Slays any creature struck by a mortal blow",
    "Burns with undying flame",
    "Returns to its wielder when thrown",
    "Cuts through any armor or ward",
    "Drinks the souls of the slain",
  ],
  tome: [
    "Contains the true names of demons",
    "Teaches forgotten rituals of power",
    "Records the future in its pages",
    "Grants mastery over a school of magic",
    "Opens the mind to terrible knowledge",
  ],
  relic: [
    "Heals any wound when touched",
    "Strikes down the unfaithful",
    "Grants visions of the divine",
    "Raises the dead to serve",
    "Purifies or corrupts the land around it",
  ],
  key: [
    "Opens any lock, mundane or magical",
    "Unlocks the prison of an ancient being",
    "Grants passage to another realm",
    "Seals away powerful magic",
    "Reveals hidden paths and doors",
  ],
  vessel: [
    "Contains a bound demon lord",
    "Holds the soul of an ancient king",
    "Stores unlimited magical energy",
    "Traps those who look upon it",
    "Releases plague or blessing when opened",
  ],
  regalia: [
    "Part of a set that grants godlike power when united",
    "Marks the rightful ruler of the realm",
    "Channels the authority of an ancient line",
    "Protects the bloodline from extinction",
    "Amplifies all other magical effects",
  ],
  focus: [
    "Amplifies spells to devastating effect",
    "Allows scrying across any distance",
    "Bends probability to the wielder's will",
    "Commands elemental forces",
    "Pierces all illusions and deceptions",
  ],
};

// === Significance Generation ===

const SIGNIFICANCE_TEMPLATES: Record<SignificantItemCategory, string[]> = {
  crown: [
    "Whoever wears it is recognized as the rightful ruler",
    "It is the symbol of legitimacy for the {faction} claim",
    "Its power could unite or shatter the realm",
  ],
  weapon: [
    "It is the only thing that can slay {threat}",
    "Legends say the one who wields it will {prophecy}",
    "Its return would rally armies to its bearer's cause",
  ],
  tome: [
    "It contains the secret to {power}",
    "Its knowledge could {consequence}",
    "Factions war to possess or destroy it",
  ],
  relic: [
    "The faithful believe it will {prophecy}",
    "Its blessing could turn the tide of war",
    "Heretics seek to destroy it; the devout to protect it",
  ],
  key: [
    "It is the only way to reach {location}",
    "What it unlocks could {consequence}",
    "Multiple factions seek it for different purposes",
  ],
  vessel: [
    "If opened, {consequence}",
    "It is the prison of {entity}",
    "Its contents could grant ultimate power or doom",
  ],
  regalia: [
    "It is one piece of a set that could {power}",
    "Alone it grants power; united, godhood",
    "Each faction holds pieces, none hold all",
  ],
  focus: [
    "It is the key to mastering {magic}",
    "Wars have been fought over its power",
    "In the wrong hands, it could {consequence}",
  ],
};

const SIGNIFICANCE_ELEMENTS = {
  faction: ["Crown", "Church", "Guild", "Council"],
  threat: ["the Demon Prince", "the Lich King", "the Dragon of the North", "the Nameless One"],
  prophecy: ["bring a new age", "end the bloodline", "open the gates", "wake the sleepers"],
  power: ["eternal life", "true resurrection", "planar travel", "ultimate destruction"],
  consequence: ["reshape the world", "doom thousands", "break the old wards", "free the imprisoned"],
  location: ["the Vault of Stars", "the Prison of Souls", "the Garden of the Gods", "the Hollow World"],
  entity: ["a god's avatar", "an army of the damned", "a primordial force", "the First Darkness"],
  magic: ["death magic", "creation magic", "time magic", "planar magic"],
};

export interface SignificantItemGeneratorOptions {
  seed: string;
  count?: number;
  categories?: SignificantItemCategory[];
}

/**
 * Generate significant items for the setting seed.
 * These are narrative-driving artifacts that create faction conflict.
 */
export function generateSignificantItems(
  options: SignificantItemGeneratorOptions
): SignificantItem[] {
  const { seed, count = 4, categories } = options;
  const rng = new SeededRandom(`${seed}-significant-items`);
  const items: SignificantItem[] = [];

  // Ensure variety - don't repeat categories if possible
  const usedCategories = new Set<SignificantItemCategory>();

  for (let i = 0; i < count; i++) {
    const category = categories?.[i] ?? pickUniqueCategory(rng, usedCategories);
    usedCategories.add(category);

    const item = generateSignificantItem(rng, `${seed}-item-${i}`, category);
    items.push(item);
  }

  return items;
}

function pickUniqueCategory(
  rng: SeededRandom,
  used: Set<SignificantItemCategory>
): SignificantItemCategory {
  // Try to pick an unused category
  for (let attempts = 0; attempts < 10; attempts++) {
    const category = rng.pickWeighted(CATEGORY_WEIGHTS);
    if (!used.has(category) || used.size >= 8) {
      return category;
    }
  }
  return rng.pickWeighted(CATEGORY_WEIGHTS);
}

function generateSignificantItem(
  rng: SeededRandom,
  seed: string,
  category: SignificantItemCategory
): SignificantItem {
  const name = generateItemName(rng, category);
  const history = generateHistory(rng, category, name);
  const effect = rng.pick(EFFECTS_BY_CATEGORY[category]);
  const significance = generateSignificance(rng, category);

  // Determine initial status (will be updated during world gen)
  const status: SignificantItemStatus = rng.pick([
    "hidden",
    "hidden",
    "lost",
    "possessed",
  ]);

  const rarity: MagicItemRarity = rng.pick(["rare", "rare", "legendary"]);

  return {
    id: `sig-item-${nanoid(8)}`,
    name,
    type: category,
    rarity,
    description: generateDescription(rng, category, name),
    effect,
    history,
    significance,
    status,
    desiredByFactionIds: [],
    desiredByNpcIds: [],
    knownToExist: rng.chance(0.7), // 70% chance people know it exists
    locationKnown: status === "hidden" ? rng.chance(0.3) : false,
    rumorIds: [],
    cursed: rng.chance(0.15),
  };
}

function generateItemName(rng: SeededRandom, category: SignificantItemCategory): string {
  const prefix = rng.pick(ITEM_PREFIXES[category]);
  const nameWord = rng.pick(ITEM_NAMES[category]);

  // 60% chance to add an epithet
  if (rng.chance(0.6)) {
    const epithet = rng.pick(ITEM_EPITHETS);
    return `The ${nameWord} ${prefix} ${epithet}`;
  }

  return `The ${nameWord} ${prefix}`;
}

function generateHistory(
  rng: SeededRandom,
  category: SignificantItemCategory,
  name: string
): string {
  const template = rng.pick(HISTORY_TEMPLATES);
  const era = rng.pick(HISTORY_ERAS);
  const creator = rng.pick(HISTORY_CREATORS);
  const event = rng.pick(HISTORY_EVENTS);
  const purpose = rng.pick(HISTORY_PURPOSES);

  return template
    .replace("{item}", name.toLowerCase())
    .replace("{era}", era)
    .replace("{creator}", creator)
    .replace("{event}", event)
    .replace("{purpose}", purpose);
}

function generateDescription(
  rng: SeededRandom,
  category: SignificantItemCategory,
  name: string
): string {
  const materials: Record<SignificantItemCategory, string[]> = {
    crown: ["gold set with black opals", "iron thorns twisted together", "silver moonstone"],
    weapon: ["dark steel that drinks light", "bone white metal", "bronze etched with runes"],
    tome: ["human skin bound with iron", "dragon leather and gold leaf", "petrified wood covers"],
    relic: ["crystal that pulses with light", "blackened bone and silver", "preserved flesh"],
    key: ["a metal that shifts colors", "teeth of an unknown beast", "crystallized tears"],
    vessel: ["obsidian veined with gold", "glass that shows no reflection", "pulsing red crystal"],
    regalia: ["platinum and sapphire", "black iron and rubies", "white gold and pearls"],
    focus: ["a fist-sized gem of swirling colors", "twisted wood from no known tree", "frozen lightning"],
  };

  const adjectives = ["ancient", "ornate", "ominous", "beautiful", "terrible", "exquisite"];

  const material = rng.pick(materials[category]);
  const adjective = rng.pick(adjectives);

  return `An ${adjective} ${category} crafted from ${material}`;
}

function generateSignificance(rng: SeededRandom, category: SignificantItemCategory): string {
  const template = rng.pick(SIGNIFICANCE_TEMPLATES[category]);

  // Replace placeholders
  let result = template;
  for (const [key, values] of Object.entries(SIGNIFICANCE_ELEMENTS)) {
    const placeholder = `{${key}}`;
    if (result.includes(placeholder)) {
      result = result.replace(placeholder, rng.pick(values));
    }
  }

  return result;
}

/**
 * Assign an item to a faction as an advantage (they possess it).
 */
export function assignItemToFaction(
  item: SignificantItem,
  factionId: string
): SignificantItem {
  return {
    ...item,
    status: "possessed",
    currentHolderId: factionId,
    holderType: "faction",
    locationId: undefined,
    hexCoord: undefined,
  };
}

/**
 * Mark an item as desired by a faction.
 */
export function addFactionDesire(
  item: SignificantItem,
  factionId: string
): SignificantItem {
  if (item.desiredByFactionIds.includes(factionId)) {
    return item;
  }
  return {
    ...item,
    desiredByFactionIds: [...item.desiredByFactionIds, factionId],
  };
}

/**
 * Place an item in a location (dungeon).
 */
export function placeItemInLocation(
  item: SignificantItem,
  locationId: string,
  hexCoord?: HexCoord
): SignificantItem {
  return {
    ...item,
    status: "hidden",
    currentHolderId: undefined,
    holderType: undefined,
    locationId,
    hexCoord,
  };
}

/**
 * Generate rumors about a significant item.
 */
export function generateItemRumorText(
  rng: SeededRandom,
  item: SignificantItem
): string[] {
  const rumors: string[] = [];

  // Existence rumor
  if (item.knownToExist) {
    rumors.push(`They say ${item.name} still exists, hidden somewhere in the realm`);
  }

  // Location rumor
  if (item.status === "hidden" && item.locationKnown) {
    rumors.push(`Word is ${item.name} lies within a dungeon in the ${rng.pick(["eastern", "western", "northern", "southern"])} reaches`);
  }

  // Desire rumor
  if (item.desiredByFactionIds.length > 0) {
    rumors.push(`Powerful factions seek ${item.name} - and they'll kill to get it`);
  }

  // Power rumor
  rumors.push(`${item.name} is said to ${item.effect.toLowerCase().slice(0, 40)}...`);

  return rumors;
}
