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
  { description: 'Traveling merchant with mule', weight: 3 },
  { description: 'Pilgrim heading to shrine', weight: 2 },
  { description: 'Bounty hunter tracking quarry', weight: 1 },
  { description: 'Lost traveler, desperate', weight: 2 },
  { description: 'Patrol of local militia', weight: 2 },
  { description: 'Wandering bard seeking stories', weight: 2 },
  { description: 'Hermit gathering herbs', weight: 1 },
  { description: 'Fleeing peasant, something chasing', weight: 1 },
  { description: 'Nobles with armed escort', weight: 1 },
  { description: 'Rival adventuring party', weight: 1 },
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
