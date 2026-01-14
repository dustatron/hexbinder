/**
 * Encounter sub-tables for 1d6 encounter system
 */

export type EncounterResultType = 'monster' | 'npc' | 'treasure' | 'omen' | 'nothing';

export interface EncounterTableEntry {
  roll: number;
  type: EncounterResultType;
  label: string;
}

export interface TableEntry {
  description: string;
  weight?: number; // rarity weight, higher = more common
  activity?: string; // What the NPC is currently doing
  rumor?: string; // What they know or seek
  reward?: string; // What they'll pay for help
}

export const ENCOUNTER_TABLE: EncounterTableEntry[] = [
  { roll: 1, type: 'monster', label: 'Monster' },
  { roll: 2, type: 'npc', label: 'NPC' },
  { roll: 3, type: 'treasure', label: 'Treasure' },
  { roll: 4, type: 'omen', label: 'Omen' },
  { roll: 5, type: 'nothing', label: 'Nothing' },
  { roll: 6, type: 'nothing', label: 'Nothing' },
];

export const NPC_TABLE: TableEntry[] = [
  {
    description: 'Traveling merchant with mule',
    weight: 3,
    activity: 'Heading to the nearest settlement to sell wares',
    rumor: 'Heard bandits have been robbing travelers on the south road',
    reward: '5gp for escort to town, or trades goods at discount',
  },
  {
    description: 'Pilgrim heading to shrine',
    weight: 2,
    activity: 'Seeking a holy site to complete a pilgrimage',
    rumor: 'The shrine they seek has been defiled by dark forces',
    reward: 'Blessing that grants advantage on one save',
  },
  {
    description: 'Bounty hunter tracking quarry',
    weight: 1,
    activity: 'Following tracks of a wanted criminal',
    rumor: 'The target was last seen near a dungeon entrance',
    reward: '20gp for information, 50gp for the capture',
  },
  {
    description: 'Lost traveler, desperate',
    weight: 2,
    activity: 'Wandered off the road and cannot find way back',
    rumor: 'Claims to have seen strange lights in the hills at night',
    reward: '10gp and a family heirloom for safe escort home',
  },
  {
    description: 'Patrol of local militia',
    weight: 2,
    activity: 'Investigating reports of monster sightings',
    rumor: 'Something attacked a farm last night, livestock killed',
    reward: '15gp for information about the creature responsible',
  },
  {
    description: 'Wandering bard seeking stories',
    weight: 2,
    activity: 'Collecting tales of adventure for songs',
    rumor: 'Knows a legend about treasure hidden in a nearby ruin',
    reward: 'Will share map location for a good story or 5gp',
  },
  {
    description: 'Hermit gathering herbs',
    weight: 1,
    activity: 'Collecting rare ingredients for potions',
    rumor: 'The local water source has been poisoned by something underground',
    reward: 'Free healing potion for help gathering dangerous herb',
  },
  {
    description: 'Fleeing peasant, something chasing',
    weight: 1,
    activity: 'Running from a monster or bandits',
    rumor: 'Their village is under attack - the creature came from the forest',
    reward: 'Everything they own (5gp) to save their family',
  },
  {
    description: 'Nobles with armed escort',
    weight: 1,
    activity: 'Traveling to inspect family holdings',
    rumor: 'Have heard their estate is being harassed by a local faction',
    reward: '100gp to clear out the troublemakers from their land',
  },
  {
    description: 'Rival adventuring party',
    weight: 1,
    activity: 'Also seeking the same dungeon or treasure',
    rumor: 'Know a secret entrance but need help with numbers',
    reward: 'Equal share of treasure for cooperation',
  },
];

export const TREASURE_TABLE: TableEntry[] = [
  { description: 'Pouch with 2d6 gold coins', weight: 3 },
  { description: 'Silver ring worth 5gp', weight: 2 },
  { description: 'Healing potion, cracked but intact', weight: 1 },
  { description: 'Scroll in waterproof case', weight: 1 },
  { description: 'Gemstone worth 10gp', weight: 2 },
  { description: 'Fine dagger, ornate hilt', weight: 2 },
  { description: 'Locked strongbox (1d20 gold inside)', weight: 1 },
  { description: 'Bundle of rare herbs (10gp)', weight: 2 },
  { description: 'Map fragment, partial location', weight: 1 },
  { description: 'Amulet, faintly magical', weight: 1 },
];

export const OMEN_TABLE: TableEntry[] = [
  { description: 'Dead adventurer, gear looted', weight: 3 },
  { description: 'Fresh bloodstains on rocks', weight: 2 },
  { description: 'Warning carved into tree bark', weight: 2 },
  { description: 'Dropped letter, urgent message', weight: 1 },
  { description: 'Animal carcass, strange wounds', weight: 2 },
  { description: 'Abandoned campsite, struggle signs', weight: 2 },
  { description: 'Fresh monster tracks', weight: 3 },
  { description: 'Broken weapon, recently used', weight: 2 },
  { description: 'Distant screams, then silence', weight: 1 },
  { description: 'Circling vultures ahead', weight: 2 },
  { description: 'Burnt patch of ground, acrid smell', weight: 1 },
];
