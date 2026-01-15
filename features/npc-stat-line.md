# Feature: NPC Stat Line

## Overview
Display compact Shadowdark combat stats on all NPC cards, pulled from monster statblocks based on archetype.

## Problem
NPCs are narrative-only entities with no combat stats. GMs need quick reference stats when combat breaks out.

## User Story
When viewing an NPC card, GM sees a one-line stat block (AC, HP, LV, attack) derived from their archetype's monster equivalent.

## Technical Design

### Files to Create
- `src/lib/npc-stats.ts` - Archetype→monster mapping utility
- `src/components/npc/NPCStatLine.tsx` - Compact stat display component

### Files to Modify
- `shadowdark-reference/monsters.json` - Add Commoner monster
- `src/components/location-detail/SettlementDetail.tsx` - Add stat line to NPC cards
- `src/components/location-detail/FactionDetail.tsx` - Add stat line to faction NPC list
- `src/components/location-detail/DungeonDetail.tsx` - Add stat line to dungeon NPCs

### Archetype → Monster Mapping

| Archetype | Monster |
|-----------|---------|
| bandit | Bandit |
| guard | Guard |
| knight | Knight |
| assassin | Assassin |
| priest | Priest |
| thief | Thief |
| cultist | Cultist |
| witch | Mage |
| noble | Knight |
| commoner | Commoner (new) |
| merchant | Commoner |
| scholar | Commoner |

### Commoner Monster (New)
```json
{
  "name": "Commoner",
  "slug": "commoner",
  "description": "An ordinary person with no combat training.",
  "armor_class": 11,
  "armor_type": null,
  "hit_points": 1,
  "attacks": "1 stick +0 (1d4)",
  "movement": "near",
  "strength": 0,
  "dexterity": 0,
  "constitution": 0,
  "intelligence": 0,
  "wisdom": 0,
  "charisma": 0,
  "alignment": "N",
  "level": 0,
  "traits": []
}
```

### npc-stats.ts Utility
```ts
const ARCHETYPE_TO_MONSTER: Record<CreatureArchetype, string> = {
  bandit: "Bandit",
  guard: "Guard",
  knight: "Knight",
  assassin: "Assassin",
  priest: "Priest",
  thief: "Thief",
  cultist: "Cultist",
  witch: "Mage",
  noble: "Knight",
  commoner: "Commoner",
  merchant: "Commoner",
  scholar: "Commoner",
};

export function getMonsterForArchetype(archetype: CreatureArchetype): Monster {
  const monsterName = ARCHETYPE_TO_MONSTER[archetype];
  return getMonster(monsterName) ?? getMonster("Commoner")!; // Fallback to Commoner
}
```

### NPCStatLine Component
```tsx
interface NPCStatLineProps {
  archetype: CreatureArchetype;
}

export function NPCStatLine({ archetype }: NPCStatLineProps) {
  const monster = getMonsterForArchetype(archetype);
  // Reuse MonsterCard's attack parsing logic
  const primaryAttack = monster.attacks.split(",")[0]?.trim() ?? monster.attacks;

  return (
    <p className="text-xs text-stone-500">
      AC {monster.armor_class} | HP {monster.hit_points} | LV {monster.level} | {primaryAttack}
    </p>
  );
}
```

### Placement in NPC Card
Insert after site location line (📍), before description text.

### Notes
- monsters.json is already loaded/cached at import time via `monstersByName` Map
- Attack parsing reuses existing MonsterCard logic (split on comma, take first)
- Fallback to Commoner if mapping somehow fails

## Implementation Steps
1. Add Commoner to `monsters.json`
2. Create `src/lib/npc-stats.ts` with mapping + `getMonsterForArchetype()`
3. Create `src/components/npc/NPCStatLine.tsx` component
4. Add `<NPCStatLine archetype={npc.archetype} />` to SettlementDetail NPC cards
5. Add stat line to FactionDetail NPC list
6. Add stat line to DungeonDetail linked NPCs

## Testing Plan
- Verify all 12 archetypes display correct stats
- Check commoner/merchant/scholar show Commoner stats
- Check noble shows Knight stats
- Check witch shows Mage stats
- Verify stat line appears in all 3 detail views
- Verify fallback works if archetype somehow unrecognized
