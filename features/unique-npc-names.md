# Feature: Unique NPC Names with Race Support

## Overview
Race-specific name generator ensuring unique first names per world generation, with hybrid curated/procedural approach.

## Problem
Current system has only 30 first names, causing frequent repeats across 50+ NPCs per world.

## User Story
When generating a world, each NPC gets a unique first name appropriate to their race and gender. Names feel authentic to D&D fantasy setting.

## Technical Design

### New Model Fields

**NPC Interface additions:**
```typescript
type NPCRace = 'human' | 'elf' | 'dwarf' | 'halfling' | 'half-elf' | 'half-orc' | 'gnome' | 'goblin';
type NPCGender = 'male' | 'female';

interface NPC {
  // ... existing fields
  race: NPCRace;
  gender: NPCGender;
}
```

### Race Distribution

**Default weights (global):**
- Human: 40%
- Elf: 10%
- Dwarf: 10%
- Halfling: 10%
- Half-elf: 8%
- Half-orc: 8%
- Gnome: 7%
- Goblin: 7%

**Settlement-specific overrides:**
- Dwarven settlement: 70% dwarf, 15% human, 15% other
- Elven settlement: 70% elf, 15% half-elf, 15% other
- Goblin hideout: 80% goblin, 20% other
- Human town: default weights but goblin rare (2%)

Gender: 50/50 random split.

### Race-Archetype Affinities

Some archetypes have race preferences:
- `noble`: human, elf, half-elf weighted higher
- `blacksmith`: dwarf weighted higher
- `witch`: human, half-elf weighted higher
- `bandit`: any race
- etc.

### Uniqueness Rules

- **First name uniqueness only** - Two "Erik Blackwood" and "Erik Stoneheart" allowed
- **Surnames can repeat** - No tracking needed
- **Per-world scope** - Reset on new world generation

### Data Sources

**Curated Names (Primary Pool):**
| Race | Source | ~Count |
|------|--------|--------|
| Human | bvezilic/DnD-name-generator | 360+ |
| Dwarf | bvezilic/DnD-name-generator | 190+ |
| Elf | bvezilic/DnD-name-generator | 190+ |
| Halfling | bvezilic/DnD-name-generator | 100+ |
| Half-orc | bvezilic/DnD-name-generator | 100+ |
| Half-elf | bvezilic + Snake4life syllables | 50+ curated |
| Gnome | Snake4life + web sources | 50+ curated |
| Goblin | amazinggameroom.com list | 50+ |

**Syllable Combiners (Fallback only):**
| Race | Source | Potential |
|------|--------|-----------|
| All races | Snake4life/fantasy-names | Unlimited |

### Files to Create

1. `src/generators/NameRegistry.ts` - Core name generation with state
   - Owns dedicated `SeededRandom` instance (world-seed based)
   - Pre-shuffled pools per race/gender
   - Sequential index tracking (O(1) picks)
   - Syllable combiner fallback
   - `usedFirstNames: Set<string>` tracking

2. `src/data/names.ts` - Single file with all name data
   ```typescript
   export const NAME_DATA: Record<NPCRace, {
     male: string[];
     female: string[];
     maleSyllables?: [string[], string[]];
     femaleSyllables?: [string[], string[]];
   }> = { ... };

   export const SURNAMES: string[];
   export const NICKNAMES: string[];
   ```

### Files to Modify

1. `src/models/index.ts`
   - Add `NPCRace` type union
   - Add `NPCGender` type
   - Add `race` and `gender` fields to `NPC` interface

2. `src/generators/NPCGenerator.ts`
   - Remove inline FIRST_NAMES, LAST_NAMES, NICKNAMES
   - Accept `NameRegistry` instance in generation functions
   - Add `generateRace(rng, settlementType?)` with context-aware weights
   - Add `generateGender(rng)` - 50/50 split
   - Update `generateNPCName()` to use registry

3. `src/generators/WorldGenerator.ts`
   - Create `NameRegistry` instance with world seed
   - Pass to all NPC generation calls

### NameRegistry Architecture

```typescript
class NameRegistry {
  private rng: SeededRandom;
  private usedFirstNames: Set<string> = new Set();
  private pools: Map<string, { names: string[]; index: number }> = new Map();

  constructor(worldSeed: string) {
    // Dedicated RNG for determinism
    this.rng = new SeededRandom(`${worldSeed}-names`);
    this.initializePools();
  }

  private initializePools(): void {
    // Pre-shuffle all pools ONCE at construction
    for (const race of RACES) {
      for (const gender of ['male', 'female']) {
        const key = `${race}-${gender}`;
        const names = this.rng.shuffle([...NAME_DATA[race][gender]]);
        this.pools.set(key, { names, index: 0 });
      }
    }
  }

  generateFirstName(race: NPCRace, gender: NPCGender): string {
    const key = `${race}-${gender}`;
    const pool = this.pools.get(key)!;

    // 1. Try curated pool (O(1) sequential pick)
    while (pool.index < pool.names.length) {
      const name = pool.names[pool.index++];
      if (!this.usedFirstNames.has(name)) {
        this.usedFirstNames.add(name);
        return name;
      }
    }

    // 2. Fallback: syllable combiner
    for (let attempt = 0; attempt < 100; attempt++) {
      const generated = this.combineSyllables(race, gender);
      if (!this.usedFirstNames.has(generated)) {
        this.usedFirstNames.add(generated);
        return generated;
      }
    }

    // 3. Emergency: title suffix (not numbers!)
    const titles = ['the Younger', 'the Elder', 'the Second', 'of the Vale'];
    const base = pool.names[0];
    for (const title of titles) {
      const named = `${base} ${title}`;
      if (!this.usedFirstNames.has(named)) {
        this.usedFirstNames.add(named);
        return named;
      }
    }

    // Absolute last resort
    return `${base} of ${this.rng.between(1, 999)}`;
  }

  generateFullName(race: NPCRace, gender: NPCGender): string {
    const first = this.generateFirstName(race, gender);
    const last = this.rng.pick(SURNAMES);

    // 20% chance for nickname
    if (this.rng.chance(0.2)) {
      const nick = this.rng.pick(NICKNAMES);
      return `${first} ${nick} ${last}`;
    }
    return `${first} ${last}`;
  }
}
```

### Race Selection with Context

```typescript
const DEFAULT_RACE_WEIGHTS: WeightedEntry<NPCRace>[] = [
  { value: 'human', weight: 40 },
  { value: 'elf', weight: 10 },
  { value: 'dwarf', weight: 10 },
  { value: 'halfling', weight: 10 },
  { value: 'half-elf', weight: 8 },
  { value: 'half-orc', weight: 8 },
  { value: 'gnome', weight: 7 },
  { value: 'goblin', weight: 7 },
];

const SETTLEMENT_RACE_WEIGHTS: Record<string, WeightedEntry<NPCRace>[]> = {
  'dwarven': [
    { value: 'dwarf', weight: 70 },
    { value: 'human', weight: 15 },
    { value: 'gnome', weight: 10 },
    { value: 'halfling', weight: 5 },
  ],
  'elven': [
    { value: 'elf', weight: 70 },
    { value: 'half-elf', weight: 15 },
    { value: 'human', weight: 10 },
    { value: 'halfling', weight: 5 },
  ],
  'goblin': [
    { value: 'goblin', weight: 80 },
    { value: 'half-orc', weight: 15 },
    { value: 'human', weight: 5 },
  ],
  'human': [
    { value: 'human', weight: 50 },
    { value: 'halfling', weight: 12 },
    { value: 'dwarf', weight: 10 },
    { value: 'elf', weight: 8 },
    { value: 'half-elf', weight: 8 },
    { value: 'half-orc', weight: 6 },
    { value: 'gnome', weight: 4 },
    { value: 'goblin', weight: 2 },
  ],
};

function generateRace(rng: SeededRandom, settlementType?: string): NPCRace {
  const weights = settlementType && SETTLEMENT_RACE_WEIGHTS[settlementType]
    ? SETTLEMENT_RACE_WEIGHTS[settlementType]
    : DEFAULT_RACE_WEIGHTS;
  return rng.pickWeighted(weights);
}
```

## Implementation Steps

1. **Update NPC model** - Add `race`, `gender` to interface in `src/models/index.ts`
2. **Create name data file** - Single `src/data/names.ts` with all race/gender arrays
3. **Build NameRegistry class** - `src/generators/NameRegistry.ts` with pre-shuffle + tracking
4. **Update NPCGenerator** - Use NameRegistry, add race/gender generation
5. **Add settlement race weights** - Context-aware race selection
6. **Update WorldGenerator** - Create NameRegistry, pass to NPC generation
7. **Test** - Verify uniqueness, determinism, distribution

## Testing Plan

- [ ] Generate 100-NPC world, confirm zero duplicate first names
- [ ] Verify race distribution roughly matches weights
- [ ] Same seed produces same names (determinism preserved)
- [ ] Dwarven settlement has mostly dwarves
- [ ] Syllable fallback produces reasonable names
- [ ] All 8 races appear in generated worlds
- [ ] Gender distribution ~50/50

## Data Acquisition Tasks

- [ ] Download bvezilic repo txt files (human, dwarf, elf, halfling, halforc)
- [ ] Extract syllables from Snake4life (gnome, half_elf, all races)
- [ ] Curate 50+ names for gnome and half-elf from syllable combinations
- [ ] Format goblin names from amazinggameroom.com
- [ ] Keep current LAST_NAMES or expand with hanleybrady surnames

## Decisions Made

1. **First name uniqueness only** - Surnames can repeat
2. **Gender added to model** - 50/50 random split
3. **Settlement-aware race weights** - Dwarven towns, goblin hideouts, etc.
4. **Goblins in towns** - Rare (2%) unless goblin settlement
5. **Race-archetype affinities** - Some archetypes prefer certain races
6. **Single names.ts file** - Not 9 separate files
7. **Pre-shuffle O(1) picks** - Not O(n) shuffle every call
8. **Title-based emergency names** - "the Younger" not "2"
