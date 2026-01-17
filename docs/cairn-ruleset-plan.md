# Cairn Ruleset Support - Implementation Plan

## Overview

Add support for Cairn RPG monster stats alongside Shadowdark. Users select their ruleset during world creation, and monster stat blocks display in the appropriate format.

## Requirements

1. **Ruleset Selection** - Dropdown on world creation form (Shadowdark vs Cairn)
2. **User Preference** - Remember last selection via React state + localStorage initializer
3. **Per-World Storage** - Each world stores its ruleset choice (source of truth)
4. **Unified Display** - Single MonsterCard component renders both formats
5. **Backwards Compatible** - Existing worlds default to Shadowdark
6. **Canonical Creature IDs** - Use Shadowdark slugs as canonical identifiers

---

## Architect Review Issues (Addressed)

### Critical Issues Fixed

1. **Creature Name Mapping** - The core problem: encounters store names like "Wolf" or "wolves", but Cairn uses different IDs. Solution: Use Shadowdark slugs as canonical IDs, map Cairn monsters to these slugs.

2. **RoomCard.tsx has inline MonsterDisplay** - Lines 21-48 duplicate monster rendering logic. Solution: Refactor to use unified MonsterCard.

3. **Two Encounter Systems** - Legacy (`HexEncounter`) vs Improved (`ImprovedEncounterResult`). Both need to work with the unified lookup.

4. **localStorage Preference Anti-pattern** - Simplified: use React state with localStorage initializer, world.ruleset is source of truth.

---

## Data Structure Comparison

### Shadowdark Monster Format
```typescript
interface ShadowdarkMonster {
  name: string;
  slug: string;
  description: string;
  armor_class: number;
  hit_points: number;
  attacks: string;
  movement: string;
  strength: number;      // modifier (-3 to +4)
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  alignment: "L" | "N" | "C";
  level: number;
  traits: { name: string; description: string }[];
}
```

### Cairn Monster Format
```typescript
interface CairnMonster {
  id: string;
  title: string;         // name
  stats: {
    hp: number;
    armor: number;
    str: number;         // ability score (3-18)
    dex: number;
    wil: number;
    attack: string;
  };
  details: string[];     // flavor + abilities combined
  environments: string[];
}
```

### Key Differences
| Aspect | Shadowdark | Cairn |
|--------|------------|-------|
| Ability scores | 6 stats as modifiers | 3 stats as full scores |
| Defense | AC (armor class) | Armor (damage reduction) |
| Health | HP | HP |
| Special abilities | `traits[]` with name/desc | `details[]` as strings |
| Level/CR | `level` field | None (HD implied by HP) |

---

## Architecture

### Unified Monster Interface

Create a display-agnostic interface that both systems map to:

```typescript
// src/lib/monster-stats.ts

type Ruleset = "shadowdark" | "cairn";

interface MonsterStats {
  name: string;
  ruleset: Ruleset;

  // Common display fields
  hp: number;
  defense: number;        // AC for Shadowdark, Armor for Cairn
  defenseLabel: string;   // "AC" or "Armor"
  attack: string;
  movement?: string;

  // System-specific (rendered conditionally)
  shadowdark?: {
    level: number;
    abilities: Record<string, number>;  // STR/DEX/CON/INT/WIS/CHA modifiers
    alignment: string;
    traits: { name: string; description: string }[];
  };
  cairn?: {
    abilities: { str: number; dex: number; wil: number };
    details: string[];
  };

  description?: string;
}
```

### Monster Lookup Flow

```
getMonsterStats(creatureName, ruleset)
  │
  ├─► ruleset === "shadowdark"
  │     └─► getMonster(name) from src/lib/monsters.ts
  │           └─► Map to MonsterStats
  │
  └─► ruleset === "cairn"
        └─► getCairnMonster(name) from src/lib/cairn-monsters.ts
              └─► Map to MonsterStats
```

---

## File Changes

### 1. Model Changes

**`src/models/index.ts`**
```typescript
// Add ruleset type
export type Ruleset = "shadowdark" | "cairn";

// Add to WorldData interface
export interface WorldData {
  // ... existing fields
  ruleset: Ruleset;  // NEW
}

// Add to WorldSummary for list display
export interface WorldSummary {
  // ... existing fields
  ruleset?: Ruleset;  // NEW (optional for backwards compat)
}
```

### 2. Storage Changes

**`src/lib/storage.ts`**
```typescript
const PREF_KEY = "hexbinder:preferences";

interface UserPreferences {
  preferredRuleset: Ruleset;
}

export function getUserPreferences(): UserPreferences {
  const data = localStorage.getItem(PREF_KEY);
  return data ? JSON.parse(data) : { preferredRuleset: "shadowdark" };
}

export function setUserPreferences(prefs: Partial<UserPreferences>): void {
  const current = getUserPreferences();
  localStorage.setItem(PREF_KEY, JSON.stringify({ ...current, ...prefs }));
}
```

### 3. New Files

**`cairn-reference/monsters.ts`**
- Copy monster data from warden-tools repo
- Export as typed array

**`src/lib/cairn-monsters.ts`**
```typescript
import cairnMonstersData from "../../cairn-reference/monsters";

export interface CairnMonster { /* ... */ }

const monstersByTitle = new Map<string, CairnMonster>();
// ... lookup functions similar to monsters.ts
```

**`src/lib/monster-stats.ts`**
```typescript
// Unified monster lookup
export function getMonsterStats(
  name: string,
  ruleset: Ruleset
): MonsterStats | undefined {
  if (ruleset === "cairn") {
    const monster = getCairnMonster(name);
    return monster ? mapCairnToStats(monster) : undefined;
  }
  const monster = getMonster(name);
  return monster ? mapShadowdarkToStats(monster) : undefined;
}
```

### 4. UI Changes

**`src/routes/index.tsx`** (World Creation Form)
```tsx
// Add state
const [ruleset, setRuleset] = useState<Ruleset>(() =>
  getUserPreferences().preferredRuleset
);

// Add dropdown after "Starting Settlement" section
<div className="mb-4">
  <label className="mb-1 block text-sm text-stone-400">
    Rule System
  </label>
  <select
    value={ruleset}
    onChange={(e) => {
      const value = e.target.value as Ruleset;
      setRuleset(value);
      setUserPreferences({ preferredRuleset: value });
    }}
    className="w-full rounded border border-stone-600 bg-stone-700 px-3 py-2"
  >
    <option value="shadowdark">Shadowdark</option>
    <option value="cairn">Cairn</option>
  </select>
</div>

// Pass to generateWorld
const { world } = generateWorld({
  // ... existing options
  ruleset,  // NEW
});
```

**`src/generators/index.ts`** (WorldGenerator entry)
- Accept `ruleset` option
- Store in generated WorldData

### 5. Monster Display

**`src/components/encounter-table/MonsterCard.tsx`**

Refactor to accept `MonsterStats` interface and render conditionally:

```tsx
interface MonsterCardProps {
  stats: MonsterStats;
  expanded?: boolean;
}

export function MonsterCard({ stats, expanded }: MonsterCardProps) {
  return (
    <div className="rounded-lg border border-stone-700 bg-stone-800 p-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-bold">{stats.name}</span>
        {stats.shadowdark && (
          <span className="rounded bg-stone-700 px-2 py-0.5 text-xs">
            LV {stats.shadowdark.level}
          </span>
        )}
      </div>

      {/* Core stats */}
      <div className="mt-1 text-sm text-stone-300">
        <span>{stats.defenseLabel} {stats.defense}</span>
        <span className="mx-2">|</span>
        <span>HP {stats.hp}</span>
      </div>

      {/* Attack */}
      <div className="mt-1 text-sm text-stone-400">{stats.attack}</div>

      {expanded && (
        <>
          {/* Shadowdark-specific */}
          {stats.shadowdark && (
            <>
              <div>Movement: {stats.movement}</div>
              <div>Abilities: STR {stats.shadowdark.abilities.STR}, ...</div>
              {stats.shadowdark.traits.map(t => (
                <div key={t.name}><b>{t.name}.</b> {t.description}</div>
              ))}
            </>
          )}

          {/* Cairn-specific */}
          {stats.cairn && (
            <>
              <div>STR {stats.cairn.abilities.str} DEX {stats.cairn.abilities.dex} WIL {stats.cairn.abilities.wil}</div>
              {stats.cairn.details.map((d, i) => (
                <p key={i}>{d}</p>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}
```

### 6. Integration Points

**`src/components/location-detail/WildernessDetail.tsx`**
```tsx
// Change from:
const monster = getMonster(encounter.creature);
return monster ? <MonsterCard monster={monster} expanded /> : null;

// To:
const stats = getMonsterStats(encounter.creature, world.ruleset);
return stats ? <MonsterCard stats={stats} expanded /> : null;
```

### Complete Integration Points

| File | Current State | Required Change |
|------|--------------|-----------------|
| `WildernessDetail.tsx` | Uses `getMonster()` + `MonsterCard` | Switch to `getMonsterStats()` |
| `RoomCard.tsx` | **Has inline `MonsterDisplay`** (lines 21-48) | Refactor to use unified `MonsterCard` |
| `EncounterTable.tsx` | Uses `getMonster()` | Switch to `getMonsterStats()` |
| `ImprovedEncounterTable.tsx` | May use MonsterCard | Verify and update |

### RoomCard.tsx Refactor

**Current:** Inline `MonsterDisplay` component duplicates rendering logic
```tsx
// Lines 21-48 - REMOVE THIS
function MonsterDisplay({ monster, count }: { monster: Monster; count: number }) {
  // Directly accesses monster.level, monster.armor_class, etc.
}
```

**After:** Import and use unified MonsterCard
```tsx
import { MonsterCard } from "~/components/encounter-table/MonsterCard";
import { getMonsterStats } from "~/lib/monster-stats";

// In render, replace MonsterDisplay usage with:
{encounter.creatureType && (() => {
  const stats = getMonsterStats(encounter.creatureType, world.ruleset);
  return stats ? <MonsterCard stats={stats} count={encounter.count} /> : null;
})()}
```

**Note:** RoomCard needs access to `world.ruleset`. Options:
1. Pass `ruleset` as prop from parent (`DungeonDetail`)
2. Use a `useCurrentWorld()` hook/context
3. Pass the full world to the component

---

## Migration Strategy

### Existing Worlds
- Worlds without `ruleset` field default to `"shadowdark"`
- No data migration needed - handled at load time:

```typescript
// In loadWorld()
const world = JSON.parse(data) as WorldData;
if (!world.ruleset) {
  world.ruleset = "shadowdark";  // Default for legacy worlds
}
return world;
```

### Canonical Creature ID System

**Problem:** Encounters store creature names in various formats:
- HexEncounter: `"Wolf"`, `"Bear, Brown"` (Shadowdark exact names)
- Legacy encounters: `"wolves"`, `"bandits"` (plural/lowercase)
- Cairn monsters use `title` field with different naming

**Solution:** Use Shadowdark slugs as canonical IDs

```typescript
// src/lib/creature-ids.ts

// Canonical slug -> Cairn title mapping
const SLUG_TO_CAIRN: Record<string, string> = {
  "wolf": "Wolf",
  "bandit": "Bandit",
  "goblin": "Goblin",
  "bear_brown": "Bear, Black",  // Cairn has different bear variant
  "orc": "Orc",
  "ogre": "Ogre",
  // ... comprehensive mapping for all encounter creatures
};

// Normalize any creature name to canonical slug
function toCanonicalSlug(name: string): string {
  // First try direct slug match
  const lower = name.toLowerCase();

  // Handle Shadowdark exact names like "Bear, Brown" -> "bear_brown"
  const slugified = lower.replace(/[,\s]+/g, "_");

  // Handle legacy plurals via existing LEGACY_NAME_MAP
  const legacyMapped = LEGACY_NAME_MAP[lower];
  if (legacyMapped) return legacyMapped;

  return slugified;
}
```

**Lookup Flow:**
```
creatureName (any format)
    ↓
toCanonicalSlug(name)
    ↓
canonical slug (e.g., "wolf")
    ↓
ruleset === "shadowdark" ? getShadowdarkMonster(slug) : getCairnMonster(SLUG_TO_CAIRN[slug])
```

---

## Implementation Order

### Phase 1: Data Layer (Low risk)
- [ ] Add `Ruleset` type to `src/models/index.ts`
- [ ] Add `ruleset: Ruleset` field to `WorldData` interface
- [ ] Add `ruleset?: Ruleset` to `WorldSummary` interface
- [ ] Create `cairn-reference/monsters.ts` (copy from warden-tools)
- [ ] Create `src/lib/cairn-monsters.ts` with lookup functions
- [ ] Create `src/lib/creature-ids.ts` with slug normalization + mappings

### Phase 2: Unified Monster Interface (Medium risk)
- [ ] Create `src/lib/monster-stats.ts` with `MonsterStats` interface
- [ ] Implement `mapShadowdarkToStats()` function
- [ ] Implement `mapCairnToStats()` function
- [ ] Implement `getMonsterStats(name, ruleset)` unified lookup
- [ ] Add comprehensive `SLUG_TO_CAIRN` mapping for all encounter creatures

### Phase 3: World Creation UI (Low risk)
- [ ] Add `ruleset?: Ruleset` to `WorldGeneratorOptions` in `WorldGenerator.ts`
- [ ] Update `generateWorld()` to include ruleset in WorldData
- [ ] Add ruleset dropdown to `src/routes/index.tsx`
- [ ] Initialize dropdown from localStorage (preference)
- [ ] Save preference on change

### Phase 4: Monster Display Refactor (Medium risk)
- [ ] Update `MonsterCard` to accept `MonsterStats` interface
- [ ] Add `count?: number` prop to MonsterCard
- [ ] Render Shadowdark-specific fields when `stats.shadowdark` present
- [ ] Render Cairn-specific fields when `stats.cairn` present
- [ ] Update `WildernessDetail.tsx` to use `getMonsterStats()`
- [ ] **Refactor `RoomCard.tsx`** - remove inline MonsterDisplay, use MonsterCard
- [ ] Pass `ruleset` prop down from DungeonDetail -> RoomCard
- [ ] Update `EncounterTable.tsx`
- [ ] Check and update `ImprovedEncounterTable.tsx`

### Phase 5: Polish & Edge Cases (Low risk)
- [ ] Add ruleset badge to world list in `index.tsx`
- [ ] Handle missing monsters gracefully ("Stats unavailable for [ruleset]")
- [ ] Update `loadWorld()` to default missing ruleset to "shadowdark"
- [ ] Update `listWorlds()` to include ruleset in WorldSummary
- [ ] Test with existing worlds (no ruleset field)
- [ ] Test creating new Cairn world
- [ ] Test dungeon room encounters display

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cairn monster data format changes | Medium | Pin to specific commit/version |
| Creature name mismatches | High | Create comprehensive mapping table |
| MonsterCard refactor breaks existing | High | Keep old interface as fallback |
| Missing creatures in one system | Medium | Show "Stats unavailable" gracefully |

---

## Testing Checklist

- [ ] Create world with Shadowdark - verify monster stats display
- [ ] Create world with Cairn - verify monster stats display
- [ ] Load existing world (no ruleset) - defaults to Shadowdark
- [ ] Ruleset preference persists across sessions
- [ ] World list shows ruleset badge
- [ ] Wilderness encounters show correct format
- [ ] Dungeon room encounters show correct format
- [ ] Missing monster shows graceful fallback

---

## Performance Considerations

### Bundle Size
- Shadowdark monsters: ~150KB JSON
- Cairn monsters: ~80KB (estimated)
- Loading both at startup doubles monster data in bundle

**Recommendation:** Accept the bundle increase for now. Both datasets are relatively small. If bundle size becomes an issue later, consider dynamic imports.

---

## Open Questions (Resolved)

| Question | Decision | Rationale |
|----------|----------|-----------|
| Creature pools per ruleset? | Same for both | Preserves seed determinism |
| Cairn Data License | Verify before proceeding | Check warden-tools repo license |
| Future Rulesets? | Extensible union type | Easy to add more later |
| Missing monster handling | Show "unavailable" | Graceful degradation |
| Canonical ID system | Shadowdark slugs | Already in use |
