# Cairn Ruleset Support - Task Checklist

## Phase 1: Data Layer

- [ ] **1.1** Add `Ruleset` type to `src/models/index.ts`
  ```typescript
  export type Ruleset = "shadowdark" | "cairn";
  ```

- [ ] **1.2** Add `ruleset: Ruleset` field to `WorldData` interface in `src/models/index.ts`

- [ ] **1.3** Add `ruleset?: Ruleset` to `WorldSummary` interface in `src/models/index.ts`

- [ ] **1.4** Fetch Cairn monster data from warden-tools repo and create `cairn-reference/monsters.ts`
  - Source: https://raw.githubusercontent.com/dustatron/warden-tools/master/src/lib/data-tables/monsters-updated-v2.ts

- [ ] **1.5** Create `src/lib/cairn-monsters.ts` with lookup functions
  - Export `CairnMonster` interface
  - Create `monstersByTitle` Map for O(1) lookup
  - Export `getCairnMonster(title: string)` function

- [ ] **1.6** Create `src/lib/creature-ids.ts` with slug normalization + mappings
  - `toCanonicalSlug(name: string): string`
  - `SLUG_TO_CAIRN: Record<string, string>` mapping

---

## Phase 2: Unified Monster Interface

- [ ] **2.1** Create `src/lib/monster-stats.ts` with `MonsterStats` interface
  ```typescript
  interface MonsterStats {
    name: string;
    ruleset: Ruleset;
    hp: number;
    defense: number;
    defenseLabel: string; // "AC" or "Armor"
    attack: string;
    movement?: string;
    description?: string;
    shadowdark?: { level, abilities, alignment, traits };
    cairn?: { abilities, details };
  }
  ```

- [ ] **2.2** Implement `mapShadowdarkToStats(monster: Monster): MonsterStats`

- [ ] **2.3** Implement `mapCairnToStats(monster: CairnMonster): MonsterStats`

- [ ] **2.4** Implement `getMonsterStats(name: string, ruleset: Ruleset): MonsterStats | undefined`
  - Use `toCanonicalSlug()` for name normalization
  - Route to correct monster source based on ruleset

- [ ] **2.5** Build comprehensive `SLUG_TO_CAIRN` mapping for all encounter creatures
  - Map all creatures in `HexEncounterGenerator.ts` CREATURES_BY_TERRAIN
  - Map all creatures in dungeon encounter pools

---

## Phase 3: World Creation UI

- [ ] **3.1** Add `ruleset?: Ruleset` to `WorldGeneratorOptions` in `src/generators/WorldGenerator.ts`

- [ ] **3.2** Update `generateWorld()` to include `ruleset` in returned `WorldData`
  - Default to `"shadowdark"` if not specified

- [ ] **3.3** Add ruleset dropdown to world creation form in `src/routes/index.tsx`
  - Add state: `const [ruleset, setRuleset] = useState<Ruleset>(...)`
  - Add select element after map size or starting settlement section

- [ ] **3.4** Initialize dropdown from localStorage preference
  ```typescript
  useState<Ruleset>(() => {
    if (typeof window === "undefined") return "shadowdark";
    return localStorage.getItem("hexbinder:ruleset") as Ruleset ?? "shadowdark";
  })
  ```

- [ ] **3.5** Save preference to localStorage on change
  ```typescript
  onChange={(e) => {
    const value = e.target.value as Ruleset;
    setRuleset(value);
    localStorage.setItem("hexbinder:ruleset", value);
  }}
  ```

- [ ] **3.6** Pass `ruleset` to `generateWorld()` call

---

## Phase 4: Monster Display Refactor

- [ ] **4.1** Update `MonsterCard` component to accept `MonsterStats` interface
  - File: `src/components/encounter-table/MonsterCard.tsx`
  - Change props from `{ monster: Monster }` to `{ stats: MonsterStats }`
  - Add optional `count?: number` prop

- [ ] **4.2** Update `MonsterCard` to render Shadowdark-specific fields
  - Level badge
  - Six ability score modifiers
  - Movement
  - Traits with name/description

- [ ] **4.3** Update `MonsterCard` to render Cairn-specific fields
  - Three ability scores (STR/DEX/WIL as values)
  - Details array as paragraphs
  - No level (Cairn doesn't have levels)

- [ ] **4.4** Update `WildernessDetail.tsx` to use `getMonsterStats()`
  - Import `getMonsterStats` from `~/lib/monster-stats`
  - Need to pass `world.ruleset` (component already has `hex`, needs world)
  - Or add `ruleset` prop

- [ ] **4.5** Refactor `RoomCard.tsx` - remove inline `MonsterDisplay`
  - Delete lines 21-48 (inline MonsterDisplay component)
  - Import `MonsterCard` and `getMonsterStats`
  - Add `ruleset: Ruleset` prop to `RoomCardProps`

- [ ] **4.6** Update `RoomCard` usages to pass `ruleset` prop
  - Find parent component (`DungeonDetail.tsx`)
  - Pass `ruleset={world.ruleset}` to each RoomCard

- [ ] **4.7** Update `EncounterTable.tsx` to use `getMonsterStats()`
  - Check current implementation
  - Update monster lookup calls

- [ ] **4.8** Check and update `ImprovedEncounterTable.tsx`
  - Verify if it uses MonsterCard
  - Update if needed

---

## Phase 5: Polish & Edge Cases

- [ ] **5.1** Add ruleset badge to world list in `src/routes/index.tsx`
  - Show badge for non-Shadowdark worlds (Cairn gets a badge)
  - Style: `bg-green-700/50 text-green-300 text-xs`

- [ ] **5.2** Handle missing monsters gracefully
  - When `getMonsterStats()` returns undefined
  - Show: "Stats unavailable for [ruleset]" with creature name

- [ ] **5.3** Update `loadWorld()` in `src/lib/storage.ts`
  - Default missing `ruleset` to `"shadowdark"`
  ```typescript
  const world = JSON.parse(data) as WorldData;
  world.ruleset ??= "shadowdark";
  return world;
  ```

- [ ] **5.4** Update `listWorlds()` in `src/lib/storage.ts`
  - Include `ruleset` in `WorldSummary` objects

---

## Testing Checklist

- [ ] Create world with Shadowdark - verify monster stats display in wilderness
- [ ] Create world with Cairn - verify monster stats display in wilderness
- [ ] Load existing world (no ruleset field) - should default to Shadowdark
- [ ] Ruleset preference persists after closing/reopening browser
- [ ] World list shows Cairn badge for Cairn worlds
- [ ] Wilderness encounter shows correct stat format
- [ ] Dungeon room encounter shows correct stat format
- [ ] Missing monster shows graceful "unavailable" message
- [ ] Build passes with no TypeScript errors
- [ ] No console errors in browser

---

## Files Modified Summary

| File | Type |
|------|------|
| `src/models/index.ts` | Modify |
| `src/lib/storage.ts` | Modify |
| `src/lib/monsters.ts` | Keep (already has LEGACY_NAME_MAP) |
| `src/generators/WorldGenerator.ts` | Modify |
| `src/routes/index.tsx` | Modify |
| `src/components/encounter-table/MonsterCard.tsx` | Modify (major) |
| `src/components/location-detail/WildernessDetail.tsx` | Modify |
| `src/components/location-detail/RoomCard.tsx` | Modify (major) |
| `src/components/location-detail/DungeonDetail.tsx` | Modify |
| `src/components/encounter-table/EncounterTable.tsx` | Modify |
| `src/components/encounter-table/ImprovedEncounterTable.tsx` | Check/Modify |

## New Files

| File | Purpose |
|------|---------|
| `cairn-reference/monsters.ts` | Raw Cairn monster data |
| `src/lib/cairn-monsters.ts` | Cairn monster lookup |
| `src/lib/creature-ids.ts` | Canonical ID normalization |
| `src/lib/monster-stats.ts` | Unified monster interface |
