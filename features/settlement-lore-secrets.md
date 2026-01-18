# Feature: Settlement Lore, Secrets & Improv Tools

## Overview

Add history/lore to settlements (mirroring dungeon ecology), display existing site secrets, and introduce settlement-wide secrets for GM improv support.

## Problem

Settlements lack the narrative depth that dungeons have. Dungeons get multi-layered history, builder cultures, and discoveries - but settlements only have a single "trouble" and "quirk" string. When a GM needs to improvise lore ("Who founded this town?") or reveal secrets ("What's really going on here?"), there's no generated content to draw from.

Additionally, the `SettlementSite.secret` field (15% chance, 8 options) exists in the model but is never displayed in the UI.

## User Story

As a GM viewing a settlement:
1. I see a **Settlement Lore** section (like dungeon lore) with founding story, major events, and cultural details
2. I can expand site cards to reveal **Site Secrets** (GM-only spoiler tags)
3. I see a **Town Secrets** section with 2-4 settlement-wide secrets that drive intrigue
4. I have quick improv hooks without needing to invent everything on the spot

---

## Technical Design

### Models to Add/Modify

**File: `src/models/index.ts`**

```typescript
// NEW: Settlement History (mirrors dungeon ecology.history)
export interface SettlementHistory {
  founding: string;           // "Founded by refugees fleeing the Northlands"
  founderType: "noble_exile" | "merchant_guild" | "religious_order" | "refugees" | "adventurers" | "military_outpost";
  age: "ancient" | "old" | "established" | "young" | "new";
  majorEvents: string[];      // ["Survived the Red Plague", "Trade route shifted here"]
  formerName?: string;        // "Once called Eastford"
  culturalNote?: string;      // "Known for its autumn harvest festival"
}

// NEW: Settlement-wide secrets
export interface SettlementSecret {
  id: string;
  text: string;               // "The mayor is a werewolf"
  severity: "minor" | "major" | "catastrophic";
  discovered: boolean;        // REQUIRED, default false - for GM tracking

  // Entities involved in this secret
  involvedNpcIds?: string[];     // NPCs who know or are involved
  involvedFactionIds?: string[]; // Factions involved (plural)
  involvedSiteIds?: string[];    // Sites connected to this secret

  linkedHookId?: string;         // If this secret connects to a hook
}

// NEW: Container for all settlement lore (mirrors dungeon.ecology pattern)
export interface SettlementLore {
  history: SettlementHistory;
  secrets: SettlementSecret[];
}

// MODIFY: Settlement interface
export interface Settlement extends Location {
  // ... existing fields (trouble, quirk remain as-is)
  lore?: SettlementLore;  // NEW - mirrors dungeon.ecology
}
```

**Existing field clarification:**
- `trouble: string` - KEEP as current/active problem (distinct from historical events)
- `quirk: string` - KEEP as atmospheric detail (not migrated to culturalNote)
- `lore.history.culturalNote` - NEW, separate from quirk

### File Organization

Following the dungeon pattern (`src/generators/dungeon/`):

```
src/generators/settlement/
  ├── SettlementHistoryGenerator.ts
  └── SettlementSecretsGenerator.ts

src/data/settlements/
  ├── history-tables.ts
  └── secret-tables.ts
```

### Files to Create

| File | Purpose |
|------|---------|
| `src/generators/settlement/SettlementHistoryGenerator.ts` | Generate founding stories, major events, cultural notes |
| `src/generators/settlement/SettlementSecretsGenerator.ts` | Generate town-wide secrets with entity connections |
| `src/data/settlements/history-tables.ts` | Tables for founders, events, cultural quirks by settlement type |
| `src/data/settlements/secret-tables.ts` | Tables for town-wide secrets by severity and size |

### Files to Modify

| File | Changes |
|------|---------|
| `src/models/index.ts` | Add `SettlementHistory`, `SettlementSecret`, `SettlementLore` interfaces; extend `Settlement` |
| `src/generators/SettlementGenerator.ts` | Call lore generators during settlement creation |
| `src/components/location-detail/SettlementDetail.tsx` | Add Lore section, display site secrets, add Secrets section to Events tab |
| `src/lib/hex-regenerate.ts` | Add `"settlement-history"` and `"settlement-secrets"` regeneration types |

### Seed Derivation (Determinism)

Following dungeon pattern:
```typescript
const historyRng = new SeededRandom(`${seed}-settlement-history`);
const secretsRng = new SeededRandom(`${seed}-settlement-secrets`);
```

### Generation Logic

**Settlement History Generation:**
```
1. Determine age based on settlement size:
   - thorpe/hamlet: 70% young/new, 30% established
   - village: 50% established, 30% old, 20% young
   - town: 40% old, 40% established, 20% ancient
   - city: 50% ancient/old, 40% established, 10% young

2. Roll founder type (weighted by settlement type)
3. Generate founding sentence from templates
4. Roll 1-3 major events from weighted tables
5. 25% chance of former name
6. 35% chance of cultural note
```

**Settlement Secrets Generation (scaled by size):**
```
Thorpe/Hamlet:
  - 1 secret, minor only

Village:
  - 1-2 secrets
  - 80% minor, 20% major

Town:
  - 2-3 secrets
  - 60% minor, 30% major, 10% catastrophic

City:
  - 3-4 secrets
  - 40% minor, 40% major, 20% catastrophic

For each secret:
  - 60% chance: link to 1 random settlement NPC (involvedNpcIds)
  - 40% chance: link to faction if present (involvedFactionIds)
  - 30% chance: link to site if thematically appropriate (involvedSiteIds)
```

---

## UI Changes

### 1. Settlement Lore Section (above tabs, like dungeon)

Collapsible, matches dungeon lore styling:
```
┌─────────────────────────────────────────┐
│ 📖 Settlement Lore                      │
│                                         │
│ "Founded three generations ago by       │
│ merchants fleeing the coastal wars..."  │
│                                         │
│ Founded by: Merchant Guild  Age: Old    │
│                                         │
│ ▼ Major Events                          │
│   • Survived the Red Plague (50 years)  │
│   • Trade route shifted here            │
│                                         │
│ Cultural note: Known for its autumn     │
│ harvest festival                        │
└─────────────────────────────────────────┘
```

### 2. Site Secrets on Site Cards

**Important:** Use a dedicated icon/button to toggle secret, NOT card click (which highlights map building). Avoid click target conflict.

```
┌─────────────────────────────────────────┐
│ 🍺 The Rusty Anchor - Tavern     [🔒]  │  ← Lock icon if has secret
│ Owner: Marta Greyfell                   │
│ "A lively establishment near the docks" │
│                                         │
│ ▶ Secret (GM only)                      │  ← <details> element, collapsed
│   "Smuggled goods pass through here"    │
└─────────────────────────────────────────┘
```

### 3. Town Secrets Section (merged into Events/Encounters tab)

NOT a separate tab - merged into Events tab as a collapsible section to avoid mobile crowding.

```
┌─────────────────────────────────────────┐
│ 🔒 Town Secrets                    [▼]  │
│                                         │
│ ☐ MAJOR: The baron's advisor is        │
│   actually a spy for the Iron Circle   │
│   Involved: [Advisor Kern] [Iron Circle]│
│   Related: Town Hall                    │
│                                         │
│ ☐ MINOR: The well water is slowly      │
│   being poisoned by runoff from the    │
│   abandoned mine                        │
│                                         │
│ ☑ CATASTROPHIC: An ancient evil        │  ← Checked = discovered
│   sleeps beneath the temple foundation  │
│   Involved: [Priest Aldric]            │
└─────────────────────────────────────────┘
```

Checkboxes persist `discovered` state via `onUpdateWorld` pattern (same as rumor/notice `used` field).

---

## Implementation Steps

### Phase 1: Data Tables
1. Create `src/data/settlements/history-tables.ts` with founder types, founding templates, events, cultural notes
2. Create `src/data/settlements/secret-tables.ts` with secrets by severity, scaled by settlement size

### Phase 2: Models
3. Add `SettlementHistory`, `SettlementSecret`, `SettlementLore` interfaces to `src/models/index.ts`
4. Extend `Settlement` interface with optional `lore` field

### Phase 3: Generators
5. Create `src/generators/settlement/SettlementHistoryGenerator.ts`
6. Create `src/generators/settlement/SettlementSecretsGenerator.ts`
7. Integrate into `SettlementGenerator.ts` - call generators, pass appropriate seed

### Phase 4: UI - Lore Section
8. Add Settlement Lore section to `SettlementDetail.tsx` (above tabs, collapsible)
9. Style to match dungeon lore section (`BookOpen` icon, same card styling)

### Phase 5: UI - Site Secrets
10. Add lock icon indicator on site cards that have secrets
11. Add `<details>` element inside site cards for secret reveal
12. Ensure click target doesn't conflict with map highlight behavior

### Phase 6: UI - Town Secrets
13. Add collapsible "Town Secrets" section to Events/Encounters tab
14. Add severity badges (color-coded)
15. Add linked entity badges (NPCs, factions, sites) with navigation
16. Add checkbox for `discovered` state with `onUpdateWorld` persistence

### Phase 7: Regeneration
17. Add `"settlement-history"` and `"settlement-secrets"` to `RegenerationType`
18. Wire up regenerate buttons in Lore section
19. **Decision:** Preserve `discovered` secrets during regeneration? (Recommend: yes, only regenerate undiscovered)

### Phase 8: Migration (Optional)
20. Consider lazy generation: if `settlement.lore` is undefined when viewing, generate it on-the-fly and save
21. This avoids a one-time migration and handles old worlds gracefully

---

## Testing Plan

1. **Generation Testing:**
   - Create new world, verify settlements have lore and secrets
   - Check age distribution matches settlement size
   - Verify severity scaling (thorpes get minor only, cities get catastrophic)
   - Verify entity linking (secrets reference real NPCs/factions/sites)

2. **UI Testing:**
   - Lore section displays correctly, collapses/expands
   - Site secrets show lock icon, reveal on details click (not whole card)
   - Town secrets section shows in Events tab
   - Severity badges color-coded correctly
   - Entity links navigate to correct NPCs/factions
   - Discovered checkbox persists across page navigation

3. **Regeneration Testing:**
   - Regenerate history keeps secrets
   - Regenerate secrets keeps history
   - Discovered secrets are preserved (if we decide that)

4. **Edge Cases:**
   - Settlement with no NPCs - secrets shouldn't crash
   - Settlement with no factions - faction links gracefully absent
   - Thorpe with 1 site - minimal lore still generates

---

## Resolved Questions

1. **Secrets in separate tab or Events tab?** → Merged into Events tab as collapsible section
2. **Tension tracking?** → Deferred to future feature
3. **Site secrets link to town secrets?** → Yes, via `involvedSiteIds` field
4. **Trouble/quirk fate?** → Keep as-is, distinct from lore system
5. **Discovered state during regeneration?** → Preserve discovered secrets, only regenerate undiscovered

## Dependencies

- None - self-contained feature

## Estimated Complexity

- **Data tables:** ~150 lines
- **Models:** ~40 lines
- **Generators:** ~200 lines
- **UI components:** ~200 lines
- **Total:** ~600 lines of new code

---

## Architect Review Notes

This plan was reviewed and updated to address:
- ✅ Model structure now mirrors dungeon pattern (`lore` container)
- ✅ Secret severity scaled by settlement size
- ✅ `discovered` field is now required (not optional)
- ✅ Site secret UI uses dedicated icon, not card click
- ✅ Generator file organization follows dungeon pattern
- ✅ Seed derivation specified for determinism
- ✅ `linkedFactionIds` is now plural (`involvedFactionIds`)
- ✅ Secrets tab merged into Events to avoid mobile crowding
- ✅ Entity linking is bidirectional-ish via `involved*Ids` fields
- ✅ Regeneration types added for granular control
- ✅ Migration strategy uses lazy generation
