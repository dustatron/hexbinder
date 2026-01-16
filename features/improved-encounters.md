# Feature: Improved Encounters

## Overview
Enhanced encounter system for wilderness/landmark hexes with terrain-aware creature tables, reaction rolls, varied encounter types, sensory impressions, and quick-reference NPC names.

## Problem
Current encounter table is basic (Monster/NPC/Treasure/Omen/Nothing). Doesn't differentiate by terrain, lacks environmental hazards, resource loss events, or area effects. No reaction system for creature/NPC disposition. No sensory details to help GM describe the scene.

## User Story
1. GM opens wilderness hex or landmark
2. **First Impressions** panel shows 3 sensory bullets (sight, sound, smell) for the terrain
3. System auto-rolls encounter from seed, highlights results in tables
4. **NPC Names sidebar** shows 16 random names for quick improvisation
5. GM can re-roll entire flow OR individual tables
6. GM can manually select any row by clicking
7. Overrides persist via seed + flags (not full data duplication)

---

## Technical Design

### Data Model (Minimal - extends existing)

```typescript
// Extend existing Hex interface
interface Hex {
  // ... existing fields ...

  // NEW: Override flags only, not full encounter data
  encounterOverrides?: {
    masterIndex?: number;      // 0-5 for 1d6
    creatureIndex?: number;    // index in terrain creature list
    reactionIndex?: number;    // 0-4 for 1d10 mapped
    subTableIndex?: number;    // for sign/env/loss/area
  };
}

// Generation happens on-the-fly from seed + overrides
// No duplicate encounter storage
```

**Why this approach:**
- Keeps seeded determinism intact
- Overrides are just index pointers, not data duplication
- Regenerate anytime from `hex.seed` + `hex.encounterOverrides`
- Matches existing EncounterTable pattern

### Tables

**Master Table (1d6)**
| Roll | Type | Description |
|------|------|-------------|
| 1 | Creature | Roll creature table for terrain |
| 2 | Sign/Omen | Clue, spoor, track, abandoned lair, scent, victim |
| 3 | Environment | Surroundings shift or escalate |
| 4 | Loss | Resource loss - resolve before moving on |
| 5 | NPC | Generate NPC with reaction |
| 6 | Area Effect | Strange event - mundane or magical |

**Reaction Table (1d10)** - applies to Creature + NPC
| Roll | Reaction |
|------|----------|
| 1-2 | Hostile |
| 3-5 | Wary |
| 6-7 | Curious |
| 8-9 | Friendly |
| 10 | Helpful |

**Creature Tables** - consolidated in single file, keyed by terrain
```typescript
// src/data/encounters/creatures.ts
export const CREATURES_BY_TERRAIN: Record<TerrainType, CreatureEntry[]>
```

**Sub-Tables** (all in `src/data/encounters/tables.ts`):
- Sign/Omen (1d12) - expand existing OMEN_TABLE
- Environment (1d10) - water rising, ceiling collapse, weather shift, etc.
- Loss (1d8) - physical only: torches, rations, rope, gear
- Area Effect (1d20) - mix mundane + magical: flood, wild surge, time skip

---

### NEW: First Impressions (per terrain)

3 sensory bullets generated from terrain type. Shown at top of hex view.

```typescript
// src/data/encounters/impressions.ts
export const IMPRESSIONS_BY_TERRAIN: Record<TerrainType, {
  sight: string[];   // 6+ options each
  sound: string[];
  smell: string[];
}>

// Example: forest
{
  sight: ["Dappled sunlight through dense canopy", "Mist clings to mossy trunks", ...],
  sound: ["Birdsong echoes distantly", "Branches creak in the wind", ...],
  smell: ["Damp earth and rotting leaves", "Pine resin sharp in the air", ...]
}
```

**UI:** 3 bullet panel above encounter tables
```
👁 Dappled sunlight filters through dense canopy
👂 Distant birdsong, then sudden silence
👃 Damp earth and mushroom spores
```

---

### NEW: NPC Names Sidebar (16 names)

Quick-reference names for improvisation. Seeded from hex, click to copy.

```typescript
// Uses existing NameRegistry
// Generate 16 names (8 male, 8 female) from hex seed
const names = generateQuickNames(hex.seed, 16);
```

**UI:** Sidebar or collapsed panel
```
┌─ Quick Names ─────┐
│ Aldric    Mira    │
│ Brom      Sylva   │
│ Corwin    Thessa  │
│ Dain      Una     │
│ Erik      Vera    │
│ Finn      Wren    │
│ Gareth    Yara    │
│ Holt      Zora    │
└───────────────────┘
```

---

### Files to Create (Simplified)

```
src/data/encounters/
├── index.ts              # Export all tables + types
├── tables.ts             # Master, reaction, sign, env, loss, area-effect tables
├── creatures.ts          # CREATURES_BY_TERRAIN (single file, keyed by terrain)
└── impressions.ts        # IMPRESSIONS_BY_TERRAIN (sight/sound/smell per terrain)

src/components/encounter-table/
├── ImprovedEncounterTable.tsx   # Main component (extends existing pattern)
├── FirstImpressions.tsx         # 3-bullet sensory panel
└── QuickNames.tsx               # 16-name sidebar
```

**Note:** Minimal new components. Main logic stays in single `ImprovedEncounterTable` following existing EncounterTable pattern.

### Files to Modify

```
src/models/index.ts
  - Add EncounterOverrides interface
  - Add EncounterType, Reaction types
  - Update Hex interface with encounterOverrides field

src/components/locations/WildernessDetail.tsx
  - Replace EncounterTable with ImprovedEncounterTable
  - Add FirstImpressions + QuickNames components

src/generators/EncounterGenerator.ts
  - Extend with new table generation logic
  - Add terrain-aware creature selection
```

### No Database Changes
localStorage only - overrides stored as index pointers in Hex object

---

## Implementation Steps

1. **Types** - Add EncounterOverrides, EncounterType, Reaction to models
2. **Data: tables.ts** - Master (1d6), reaction (1d10), sign, env, loss, area-effect tables
3. **Data: creatures.ts** - CREATURES_BY_TERRAIN for all 6 terrain types
4. **Data: impressions.ts** - IMPRESSIONS_BY_TERRAIN (sight/sound/smell)
5. **Generator** - Extend EncounterGenerator with new table logic
6. **UI: FirstImpressions** - 3-bullet sensory panel component
7. **UI: QuickNames** - 16-name sidebar component
8. **UI: ImprovedEncounterTable** - Main table with click-select, highlights, re-roll buttons
9. **Integration** - Wire into WildernessDetail, replace old EncounterTable
10. **Persistence** - Save/load encounterOverrides in hex state

---

## UI Wireframe

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🌲 FOREST HEX                                                           │
├─────────────────────────────────────────────────────────────────────────┤
│ 👁 Dappled sunlight filters through dense canopy                        │
│ 👂 Distant birdsong, then sudden silence                                │
│ 👃 Damp earth and mushroom spores                                       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┬───────────────┐
│ 🎲 ENCOUNTER: Wolf Pack (3) - Wary                [↻]  │ Quick Names   │
├─────────────────────────────────────────────────────────┤───────────────┤
│                                                         │ Aldric  Mira  │
│ ┌─ MASTER TABLE (1d6) ──────────────────────── [↻] ─┐  │ Brom    Sylva │
│ │   1. Creature        ← ROLLED                     │  │ Corwin  Thessa│
│ │   2. Sign/Omen                                    │  │ Dain    Una   │
│ │   3. Environment                                  │  │ Erik    Vera  │
│ │   4. Loss                                         │  │ Finn    Wren  │
│ │   5. NPC                                          │  │ Gareth  Yara  │
│ │   6. Area Effect                                  │  │ Holt    Zora  │
│ └───────────────────────────────────────────────────┘  │               │
│                                                         │    [↻]        │
│ ┌─ CREATURE: Forest ────────────────────────── [↻] ─┐  │               │
│ │   Wolf Pack (1d4)    ← ROLLED                     │  │               │
│ │   Giant Spider                                    │  │               │
│ │   Goblin Scouts                                   │  │               │
│ │   Owlbear                                         │  │               │
│ └───────────────────────────────────────────────────┘  │               │
│                                                         │               │
│ ┌─ REACTION (1d10) ─────────────────────────── [↻] ─┐  │               │
│ │   1-2: Hostile                                    │  │               │
│ │   3-5: Wary          ← ROLLED                     │  │               │
│ │   6-7: Curious                                    │  │               │
│ │   8-9: Friendly                                   │  │               │
│ │   10:  Helpful                                    │  │               │
│ └───────────────────────────────────────────────────┘  │               │
└─────────────────────────────────────────────────────────┴───────────────┘
```

**Interaction:**
- Click any row → selects it (shows "GM override" if different from roll)
- [↻] per-table → re-rolls just that table
- [↻] on summary banner → re-rolls entire encounter flow
- Click name in sidebar → copies to clipboard

---

## Testing Plan

- [ ] First Impressions shows 3 terrain-appropriate sensory bullets
- [ ] Quick Names shows 16 seeded names, re-rollable
- [ ] Auto-roll on hex load shows highlighted results
- [ ] Re-roll button regenerates all tables
- [ ] Per-table re-roll only affects that table
- [ ] Click row to manually select, shows "GM override" indicator
- [ ] Creature table changes based on hex terrain
- [ ] Reaction appears for Creature and NPC types only
- [ ] Overrides persist across navigation (via encounterOverrides)
- [ ] Same seed + no overrides = same results (deterministic)
- [ ] Click name in sidebar copies to clipboard

---

## Unresolved Questions

- Creature table curation: minimal viable list per terrain, expand later?
- Landmarks same tables as wilderness, or distinct?
- Touch: tap = select, no long-press needed?
