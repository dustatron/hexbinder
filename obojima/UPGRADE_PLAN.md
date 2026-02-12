# Hexbinder Theme System & Obojima Upgrade Plan

**Goal:** Transform Hexbinder from a single-setting generator into a themeable world engine. First theme: Obojima. Canon world loads as a fully populated preset. Themed generation creates new worlds with Obojima flavor.

**Current state of canon Obojima world (`obojima_preview.hexbinder.json`):**
- 892 hexes placed ✅
- 54 locations placed (33 settlements, 6 dungeons, 15 landmarks) ✅
- 0 NPCs, 0 factions, 0 hooks, 0 clocks, 0 items ❌

---

## Phase 1: Type System Expansion

Widen TypeScript types to support Obojima species, genders, and archetypes without breaking existing functionality.

### 1.1 — Expand `NPCRace`
**File:** `src/models/index.ts`

Add Obojima species to the union:
```typescript
export type NPCRace =
  // Standard fantasy
  | "human" | "elf" | "dwarf" | "halfling" | "half-elf" | "half-orc" | "gnome" | "goblin"
  // Obojima
  | "nakudama" | "dara" | "spirit" | "oni" | "fish_folk" | "awakened_animal";
```

### 1.2 — Expand `NPCGender`
```typescript
export type NPCGender = "male" | "female" | "nonbinary";
```
**Touch:** `NameRegistry.ts` (generateGender), `NPCGenerator.ts` (gender generation)

### 1.3 — Expand `CreatureArchetype`
Add 8 new combat archetypes with stat block mappings:
```typescript
export type CreatureArchetype =
  // Existing
  | "commoner" | "bandit" | "guard" | "knight" | "assassin"
  | "witch" | "priest" | "noble" | "merchant" | "scholar" | "thief" | "cultist"
  // New (Obojima + general use)
  | "warrior" | "sage" | "guardian" | "healer"
  | "scout" | "artisan" | "trickster" | "villain";
```

**Stat mappings** (add to `src/lib/npc-stats.ts`):
| New | Shadowdark Monster | Cairn Monster |
|-----|-------------------|---------------|
| warrior | Knight | Knight |
| sage | Mage | Wood Witch |
| guardian | Guard | Guard |
| healer | Priest | Acolyte |
| scout | Thief | Thief |
| artisan | Commoner | Commoner |
| trickster | Thief | Thief |
| villain | Knight | Knight |

### 1.4 — Change `NPCRole` to string
```typescript
// Before: 19-value union type
// After:
export type NPCRole = string;
```
**Touch:** `NPCGenerator.ts` (`SITE_TYPE_TO_ROLE` — change value type, keep keys), `TOWNSFOLK_ROLES` array.

### 1.5 — Add new fields to `NPC` interface
```typescript
export interface CompanionLink {
  npcId: string;        // ID of the companion NPC
  relationship: string; // "spirit companion", "mount", "familiar", etc.
}

export interface NPC {
  // ... existing fields ...
  displayArchetype?: string;     // Flavor label when archetype doesn't fit ("Tea Master", "Rockwinder")
  companions?: CompanionLink[];  // Links to companion NPCs (spirits, animals)
  companionOfId?: string;        // If THIS NPC is a companion, who they belong to
  aliases?: string[];            // ["Grimcloak"] for Nuharo
  trueIdentity?: string;        // "oni sorcerer" for Chisuay
  factionIds?: string[];         // Replaces factionId for multi-faction NPCs
  factionRoles?: Record<string, FactionRole>; // { "aha": "member", "deep-current": "agent" }
}
```
Keep `factionId` and `factionRole` as deprecated aliases during migration.

### 1.6 — Update all `Record<CreatureArchetype, ...>` maps
**Files to update:**
| File | Map | Action |
|------|-----|--------|
| `NPCGenerator.ts` | `WANTS_BY_ARCHETYPE` | Add 8 new archetype want lists (6 wants each = 48 new strings) |
| `NPCGenerator.ts` | `ARCHETYPE_DESCRIPTIONS` | Add 8 new archetype description lists (3 each = 24 new strings) |
| `NPCGenerator.ts` | `ARCHETYPE_THREAT` | Add 8 new threat levels |
| `npc-stats.ts` | `ARCHETYPE_TO_SHADOWDARK` | Add 8 new monster mappings |
| `npc-stats.ts` | `ARCHETYPE_TO_CAIRN` | Add 8 new monster mappings |
| `FactionGenerator.ts` | `LEADER_ARCHETYPES` | Add new archetypes to relevant faction type lists |
| `FactionGenerator.ts` | `MEMBER_ARCHETYPES` | Same |

### Estimated touch count: ~8 files

---

## Phase 2: Theme System Architecture

Create a pluggable theme system that controls all generation parameters.

### 2.1 — Theme Config Interface
**New file:** `src/themes/index.ts`

```typescript
export interface WorldTheme {
  id: string;                     // "base-fantasy" | "obojima" | "grimdark-fairytale"
  label: string;                  // Display name
  description: string;            // One-liner for UI

  // Races & species
  races: NPCRace[];               // Available races for this theme
  raceWeights: WeightedTable<NPCRace>;  // Default distribution
  settlementRaceOverrides?: Record<string, WeightedTable<NPCRace>>;

  // Names
  nameStyle: "western" | "japanese" | "mixed";
  namePools?: Record<string, RaceNameData>;  // Override/extend name pools

  // NPCs
  archetypes?: CreatureArchetype[];   // Subset of archetypes to use
  roleLabels?: Record<string, string>; // Display overrides

  // Factions
  factionTemplates?: FactionTemplate[];  // Menu of themed faction types for GM picks

  // Encounters
  encounterTables?: Record<TerrainType, string[]>;
  encounterBehaviorWeights?: WeightedTable<EncounterBehavior>;

  // Terrain & flavor
  terrainFlavors?: Record<TerrainType, string[]>;
  dungeonThemes?: string[];

  // Tone
  toneDescriptors?: string[];     // Words/phrases that guide flavor text
  secretTemplates?: string[];     // Theme-appropriate NPC secrets
  wantTemplates?: Record<CreatureArchetype, string[]>; // Override WANTS_BY_ARCHETYPE

  // Canon
  canonWorldFile?: string;        // Path to loadable world preset (e.g., "obojima.world.json")
}
```

### 2.2 — Theme Definitions
**New files:**
- `src/themes/base-fantasy.ts` — current behavior, extracted into theme config
- `src/themes/obojima.ts` — Obojima theme config
- `src/themes/grimdark-fairytale.ts` — placeholder/stub

### 2.3 — Theme Registry
```typescript
// src/themes/index.ts
export const THEMES: Record<string, WorldTheme> = {
  "base-fantasy": baseFantasyTheme,
  "obojima": obojimaTheme,
  "grimdark-fairytale": grimdarkFairytaleTheme,
};
```

### 2.4 — Thread theme through generators
Every generator that uses race weights, name pools, archetype lists, encounter tables, or flavor text needs to accept a `theme: WorldTheme` parameter (or pull it from the world state).

**Generators to update:**
| Generator | Theme-controlled aspect |
|-----------|------------------------|
| `NPCGenerator` | Race weights, archetype pool, descriptions, wants, secrets |
| `NameRegistry` | Name pools, style |
| `FactionGenerator` | Faction templates, archetype mappings |
| `EncounterGenerator` | Creature tables, behavior weights |
| `DungeonGenerator` | Theme list, flavor |
| `RumorGenerator` | Template text, tone |
| `ClockGenerator` | Template text |
| `HookWeaver` | Template text |
| `SettlementGenerator` | Terrain flavor, site types |

### 2.5 — World creation flow update
1. **Pick theme** → dropdown in world creation UI
2. **Choose mode** →
   - "Canon World" (if theme has `canonWorldFile`) → loads preset
   - "Generate New" → procedural with theme config
3. **Theme stored on world** → `WorldData.themeId: string`

### Estimated touch count: ~3 new files, ~10 generators updated

---

## Phase 3: Obojima Name Pools

Add Japanese-inspired name data for Obojima races.

### 3.1 — New name pool file
**New file:** `src/data/names-obojima.ts`

Pools needed:
| Race | Male names | Female names | Syllable combiner |
|------|-----------|--------------|-------------------|
| human (JP style) | ~80 | ~80 | Yes |
| nakudama | ~40 | ~40 | Yes |
| dara | ~30 | ~30 | Yes |
| spirit | ~50 (ungendered pool) | ~50 | Yes |
| elf (JP style) | ~30 | ~30 | Yes |
| oni | ~20 | ~20 | Yes |

Source inspiration: Obojima canon names, Japanese given names, nature-inspired names for dara/spirits.

### 3.2 — Update NameRegistry
- Accept `nameStyle` from theme
- Load appropriate name pools based on style
- Handle `"nonbinary"` gender → use either pool randomly or a shared pool
- Add `"obojima"` to `SETTLEMENT_RACE_WEIGHTS`:
```typescript
obojima: {
  entries: [
    { value: "human", weight: 45 },
    { value: "nakudama", weight: 25 },
    { value: "dara", weight: 15 },
    { value: "spirit", weight: 10 },
    { value: "elf", weight: 5 },
  ],
},
```

### 3.3 — Update RACES array
```typescript
const RACES: NPCRace[] = [
  "human", "elf", "dwarf", "halfling", "half-elf", "half-orc", "gnome", "goblin",
  "nakudama", "dara", "spirit", "oni", "fish_folk", "awakened_animal"
];
```

### Estimated touch count: 1 new file, 2 files updated

---

## Phase 4: Canon Obojima World Data

Build the full `obojima.world.json` preset by populating the existing hex map with NPCs, factions, hooks, clocks, and items.

### 4.1 — Faction data (17 active factions)
Source: `obojima/reference/FACTIONS.md`

Create faction entries for:
1. Mariners' Guild
2. The Lionfish King
3. AHA
4. Fish Head Coven
5. Courier Brigade
6. Cloud Cap Coven
7. Rangers of the Greenward Path
8. Lom & Salt
9. Canden & Moon
10. Toraf & Boulder
11. Dawn Blossom Guild
12. Flying Phin
13. Goro Goros
14. Council of Kroo
15. Tellu & Scale
16. Crowsworn
17. The Deep Current

Each faction needs: id, name, archetype, description, leaderArchetype, memberArchetype, goals, agenda (progressive steps), obstacle, want, traits, tension web connections.

### 4.2 — Canon NPC data (~220 NPCs)
Source: `obojima/reference/NPC_MASTER.md`

**~180 canon NPCs** from source material:
- Each with: name, race, gender, archetype, threatLevel, role, description, distinguishingFeature, factionIds, factionRoles, locationId, companions, aliases, trueIdentity, flavorWant, secret, status, relationships, tags

**~40 invented filler NPCs** from old `generate_npcs_hooks.py`:
- Keep as settlement filler (Tanisu, Koru, Weshi, etc.)
- Fix any that conflict with canon (wrong locations, wrong factions)
- Assign to correct settlements based on preview world location IDs

**~25 companion spirit NPCs:**
- Separate NPC entries with `companionOfId` linking to their bonded NPC
- Examples: Mr. Tamlin → Leobini, Disaster → Marcel, Beeks → Gomber, Sorrow → Mr. Basingstoke

### 4.3 — NPC-to-location mapping
Map each NPC to a settlement/dungeon/landmark ID from the preview world.

| Preview Location ID | Canon NPCs to place |
|----|-----|
| `settlement-yatamon` | Master Hu, Cholly, Himitsu, Jenni, PM Escalante, Gomber, Beeks, Granny Yuzu, Tatsu, Mikiko, Imelda, Mr. Basingstoke, Lula, Bridge Cat, Gojo, Bokka Bokka, Whiskers, Dr. Frond, Krocius, Mortimus Fids, Master Canden, Master Moon, Instructor Venn, Reiko + ~13 filler |
| `settlement-cdl-south` | Captain Clintock, Paloma, Figby, Leobini, Dahlia + companions |
| `settlement-cdl-north` | Holly Clintock, Marcel, Disaster |
| `settlement-matango` | Reheni, Myron, Chogo, Marvolio, Mama Amala, Madame Porcini, Rokoko |
| `settlement-okiri` | Broad Naldo, Miss Lindley, Thim, Torrio, Morna, Wenneth, Bree |
| `settlement-tidewater` | Vorian, Ulmat, Gritty Groff, Kenta, Kaz, Kersh, Harraga, Eol, Kem |
| `settlement-uluwa` | Master of Ceremonies, Emille, Throth, Humble Utzu, Four Orbles, Dapo Dapo, Vymm, Vigor, Ferryman |
| `settlement-hogstone` | Adira, Mocha, Jollah Everbreeze |
| `settlement-chisuay` | Chisuay, Migo, Indigo, Fossa Helpers |
| `settlement-sky-kite` | Rock Raley, Councilor Jiko, Olaya, Louise, Marlon, Rufus, Mal, Ember |
| `settlement-toggle` | Duro, Garo, Johnny One-Eye, Thugg, Isabel Skiff |
| `settlement-graysteps` | Phent, Stout Crumm, Nuharo/Grimcloak, Patcher |
| `settlement-jumaga-roost` | Jeelah, Karmajin |
| `settlement-polewater` | Grifftang Crump, Ermina Flopfoot + filler |
| `settlement-roa-kala` | Audok, Myara, Joshi, Poli |
| `settlement-opal-falls` | Warwick, Liffi Bolo, Mazuka Bo, Wayla |
| `settlement-broken-bird` | Phin, Mechanic Gretta, Plitsu |
| `settlement-aha-hq` | Uba, Gurriko, Loninni, Lonzo, Chloe, Vutochi |
| `settlement-hakumon` | Hakumon, Scrublings, Mr. Noka Noka |
| `settlement-witching-tower` | Yolikanter, Bim, Brass Eyes, Tan, Abi, Ognev, Ermy Flower, Alkun |
| `settlement-fort-harglo` | Courier Brigade garrison NPCs |
| `settlement-lom-salts` | Master Lom, Master Salt, Signet-Bearer Hara |
| `settlement-torf-bolders` | Master Toraf, Master Boulder, Quartermaster Jig |
| `settlement-tellu-scale` | Master Tellu, Master Scale, Wanderer Ishi |
| `dungeon-temple-of-shoom` | Zolde, Voraro the Parasite, Beatri, Dini |
| `dungeon-coral-castle` | Lionfish King, Sleethar |
| `dungeon-sunken-town` | Bloodfin, Borisss, Morris, Lucinda |
| `landmark-crawling-canopy` | Edgarton, Penelope, Sheldrake, Thurston, Zeb, Jeb, Dingus, Morgo |
| `landmark-corrupted-coastl` | Ernest Ebbs, Madelaine, Silt |
| `landmark-rumble-hill` | (no NPCs — sleeping great beast) |
| `landmark-lionfish-king` | (redirect to dungeon-coral-castle?) |

Remaining settlements to fill: Dorrin, Kuroki, CDL-East, CDL-West, Goodie Mart, Gobo Village, Ekmu, Amak Shurak — these may be settlements from the book not in npcs.md. Need filler NPCs or source-check.

### 4.4 — Hook data (~50-100 hooks)
Rebuild hooks from:
- FACTIONS.md agenda steps → faction-driven hooks
- NPC secrets → secret-reveal hooks
- Source material quests → pre-authored hooks
- Existing 97 hook templates from old `generate_npcs_hooks.py` (reuse where accurate)

### 4.5 — Clock data
Create progress clocks from FACTIONS.md agendas:
| Clock | Faction | Segments |
|-------|---------|----------|
| Corruption Spread | Meta | 6 |
| Pointue Repair | Mariners' Guild | 4 |
| Royal Lineages Decoded | Lionfish King | 4 |
| Almanac Collection | Fish Head Coven | 5 |
| Eastern Front Collapse | Rangers | 4 |
| Holly Assassination Plot | Lionfish King | 3 |
| Subway Tunnel Mapping | AHA / Deep Current | 4 |
| Oghmai's Prison Found | Deep Current | 6 |
| Mikiko Exposed | Goro Goros | 3 |
| Sorolu's Decline | Fish Head Coven | 4 |
| Powered Flight | Flying Phin | 4 |
| Paloma's Infection | Mariners' Guild | 4 |
| Bloodfin's Hag Turn | Lionfish King | 3 |

### 4.6 — Significant items
From FACTIONS.md:
- The Aquatic Stabilizer (gyroscope, on Doomspine)
- The Royal Lineages (2 tomes, Lionfish King)
- The Almanac (7 volumes, distributed across covens)
- Master Tellu's Stopwatch (undecoded First Age device)
- Rod of Awakening (Patcher, Graysteps)
- Guardian Sphere fragments (Lom & Salt)
- Spirit Coal (Wandering Line)

### 4.7 — Build script
**New file:** `obojima/build-canon-world.ts`

Script that:
1. Loads `obojima_preview.hexbinder.json` (hex map + locations)
2. Reads NPC data from `NPC_MASTER.md` (or a structured JSON derivative)
3. Creates all 17 factions
4. Creates all ~220 NPCs with correct location mappings
5. Links companions via `companionOfId` / `companions`
6. Creates hooks from templates
7. Creates clocks from faction agendas
8. Creates significant items
9. Outputs complete `obojima.world.json`

### Estimated output: 1 build script, 1 world JSON (~5000+ lines)

---

## Phase 5: Canon World Loader

Enable loading a canon world from a JSON preset.

### 5.1 — World creation UI update
Add to world creation screen:
- Theme picker (dropdown: Base Fantasy, Obojima, Grimdark Fairytale)
- Mode toggle (visible when theme has `canonWorldFile`):
  - "Load Canon World" → imports preset
  - "Generate New" → procedural generation with theme

### 5.2 — Import function
```typescript
function loadCanonWorld(themeId: string): WorldData {
  const theme = THEMES[themeId];
  if (!theme.canonWorldFile) throw new Error("No canon world for theme");
  const worldData = JSON.parse(/* load from bundled asset */);
  worldData.id = `world-${nanoid(8)}`; // Fresh ID
  worldData.createdAt = Date.now();
  return worldData;
}
```

### 5.3 — Bundle the canon world JSON
Include `obojima.world.json` as a static asset in the build.

### Estimated touch count: 2-3 files (world creation route, import util, vite config for asset)

---

## Phase 6: UI Updates

### 6.1 — Companion toggle
In settlement/location NPC lists:
- Default: companions nested as sub-entries under their bonded NPC
- Toggle button: "Show companions as full NPCs"
- When expanded: companion gets full stat line, description, own card

### 6.2 — Display archetype
NPC cards show `displayArchetype || archetype`. No code change needed in stat logic — stat line still uses `archetype` for monster lookup.

### 6.3 — Multi-faction display
NPCs with `factionIds.length > 1`:
- Show primary faction badge
- Secondary faction as smaller tag or tooltip
- Example: Krocius → "AHA (member)" with "Deep Current (agent)" as secondary

### 6.4 — Theme indicator
World header shows current theme badge/icon.

### Estimated touch count: ~5 component files

---

## Phase 7: Obojima Faction Templates (for themed gen)

For "Generate New" mode with Obojima theme, provide a menu of faction templates the GM picks from.

### Template examples:
| Template | Inspired By | Description |
|----------|-------------|-------------|
| Undersea Monarchy | Lionfish King | Vain aquatic ruler with legitimacy obsession |
| Explorer's Guild | Mariners' Guild | Undersea/overland exploration guild with damaged tech |
| Academic Society | AHA | Researchers spread thin across dig sites |
| Dominant Coven | Fish Head Coven | Most powerful witch coven hoarding knowledge |
| Postal Knights | Courier Brigade | Sworn mail carriers doubling as civil defense |
| Mountain Coven | Cloud Cap | Reclusive mountain witches guarding sacred sites |
| Ranger Corps | Rangers | Grim defenders of a corrupted front |
| Oldest School | Lom & Salt | Traditional sword school with ancient forge |
| Political School | Canden & Moon | Largest, most politically ambitious school |
| Frontline School | Toraf & Boulder | Battle-hardened school at the danger zone |
| Currency Guild | Dawn Blossom | Secretive currency controllers |
| Aviation Dreamers | Flying Phin | Obsessive tinkers trying to achieve flight |
| Street Gang | Goro Goros | Youth gang with magical graffiti |
| Eccentric Hermits | Council of Kroo | Paranoid eccentrics guarding buried secrets |
| Nomadic School | Tellu & Scale | Philosophical wandering sword school |
| Desperate Coven | Crowsworn | Coven racing to brew a cure for spreading plague |
| Shadow Society | Deep Current | Hidden cells seeking to free an ancient prisoner |

Each template includes: archetype, leader/member archetypes, goal patterns, obstacle patterns, tension hooks.

---

## Dependency Graph

```
Phase 1 (Types) ──────────┐
                           ├──→ Phase 4 (Canon Data) ──→ Phase 5 (Loader)
Phase 2 (Theme System) ───┤
                           ├──→ Phase 7 (Templates)
Phase 3 (Name Pools) ─────┘
                                                          Phase 6 (UI) ← independent
```

- Phases 1, 2, 3 can be parallelized
- Phase 4 depends on 1 (types must exist to build NPCs)
- Phase 5 depends on 4 (need world JSON to load)
- Phase 6 can happen anytime
- Phase 7 is independent, can be deferred

---

## Verification Checklist

### After Phase 1
- [ ] Existing base-fantasy world generation still works unchanged
- [ ] All `Record<CreatureArchetype, ...>` maps compile with new archetypes
- [ ] `npc-stats.ts` returns valid stats for all 20 archetypes
- [ ] NPCRole as string doesn't break SITE_TYPE_TO_ROLE

### After Phase 4
- [ ] Canon world has ~220 NPCs, all with valid locationIds
- [ ] All 17 factions created with correct memberNpcIds
- [ ] Companion NPCs linked bidirectionally (companionOfId ↔ companions)
- [ ] Multi-faction NPCs (Krocius, Mikiko, Ermina) have correct factionIds arrays
- [ ] No NPC has a locationId that doesn't exist in the world
- [ ] All faction tension web connections represented in data

### After Phase 5
- [ ] "Load Canon World" creates a working Obojima world
- [ ] All NPCs display correctly in settlement views
- [ ] Faction pages show correct members, agendas, obstacles
- [ ] Hooks reference valid NPC and location IDs
- [ ] Clocks display and can be advanced

### After full upgrade
- [ ] Base Fantasy theme generates worlds identical to current behavior
- [ ] Obojima canon world loads with full content
- [ ] Obojima themed generation creates new worlds with correct races/names/tone
- [ ] Companion toggle works in UI
- [ ] Multi-faction NPCs display correctly

---

## Open Items / Future Work

- **Wandering Line** — mobile location that isn't on the hex map. May need a special location type or be treated as a faction/organization.
- **Great Beasts** — The Hunter, Jumaga, Rumble Hill. Custom encounter type? Landmark with special encounter?
- **Spirit Realm** — parallel plane. Not modeled in hexbinder yet. Could be a layer toggle on the hex map (future feature).
- **Obojima-specific encounter tables** — corrupted creatures, fish folk patrols, spirit encounters by region.
- **Settlements without source NPCs** — Dorrin, Kuroki, CDL-East, CDL-West, Goodie Mart, Gobo Village, Ekmu, Amak Shurak need either source-checking against the raw text or filler generation.
- **Grimdark Fairytale theme** — stub only. Full implementation deferred.
- **Venomous Rex** — minor antagonist faction, not tracked as full faction. Could be added as 18th faction or kept as encounter-level threat.
