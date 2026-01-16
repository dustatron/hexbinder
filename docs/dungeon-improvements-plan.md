# Dungeon Generation Improvements Plan

A roadmap for enhancing dungeon generation with Cairn-inspired design philosophy: player agency, meaningful choices, environmental storytelling, and world integration.

## Current System Summary

The existing dungeon generator provides:
- Spatial grid-based layout with A* pathfinding
- 15 dungeon themes with blueprints (crypts, temples, caves, etc.)
- Ecology system (builders, inhabitants, activities)
- Trap, NPC, key-lock puzzle systems
- Wandering monster tables

## Architecture Review Notes

This plan was reviewed by the frontend architect. Key issues identified and addressed:

1. **Generation Order Problem** - Factions generate before dungeons, no code path creates dungeons at faction lair hexes
2. **History Layers Type Conflict** - `DungeonEcology` already has single `builders` field
3. **Dynamic State Breaks Determinism** - Runtime state conflicts with "same seed = same world" promise
4. **Missing Model Changes** - Original plan didn't specify interface modifications

---

## Improvement Areas

### 1. Faction Integration

**Problem:** Dungeons exist in isolation from the faction system. A cult's lair has no connection to the actual cult faction.

**Goal:** Dungeons become living extensions of faction activity, not just static encounter sites.

**Tasks:**
- [ ] Add `controllingFactionId` field to dungeon/location model
- [ ] When generating faction with wilderness lair HQ, generate a matching dungeon
- [ ] Populate dungeon with faction NPCs (use existing faction members)
- [ ] Link faction agenda goals to dungeon treasures/objectives
- [ ] Add "rival faction scouts" as potential dungeon encounters
- [ ] Generate hooks that send players to faction-controlled dungeons

**Faction-to-Theme Mapping:**
```typescript
const FACTION_TO_DUNGEON_THEME: Record<FactionType, DungeonTheme[]> = {
  cult: ["cultist_lair", "temple", "crypt", "shrine"],
  militia: ["fortress", "bandit_hideout"],
  syndicate: ["sewer", "bandit_hideout"],
  guild: ["mine", "fortress"],
  tribe: ["cave", "beast_den"],
};
```

**Design Notes:**
- Faction advantages could be stored IN the dungeon (wealth in vault, artifact in shrine)
- Clearing a dungeon impacts faction status (see Design Decisions below)

---

### 2. History Layers

**Problem:** Dungeons feel like static sets. No sense of time, previous occupants, or accumulated history.

**Goal:** Every dungeon tells a story through environmental details spanning multiple eras.

**Tasks:**
- [ ] Extend `DungeonEcology.builders` to support multiple historical layers
- [ ] Generate 2-3 history layers per dungeon (original → abandonment → current)
- [ ] Create "environmental detail" tables for each era type
- [ ] Add `historicalClues` to room descriptions (old murals, broken symbols, repurposed furniture)
- [ ] Mix treasure from different eras (ancient coins + recent supplies)
- [ ] Generate "what happened here" discoveries players can piece together

**Example History:**
```
Layer 1: Dwarven mining complex (300 years ago) - collapsed after earthquake
Layer 2: Necromancer's laboratory (50 years ago) - destroyed by adventurers
Layer 3: Goblin tribe (current) - using old tunnels as lair
```

**Environmental Clues:**
- Dwarven runes on walls, rusted mining equipment
- Alchemical stains, shattered glass, old bone piles
- Fresh cooking fires, crude repairs, stolen goods

---

### 3. Environmental Storytelling Hooks

**Problem:** Rooms have encounters but lack discoverable narrative elements that connect to the broader world.

**Goal:** Dungeons contain clues, evidence, and discoveries that create new hooks and resolve existing ones.

**Tasks:**
- [ ] Add `discoveries` array to rooms: non-combat things players can find
- [ ] Generate journal entries, letters, maps as loot (from pre-generated tables)
- [ ] Connect dungeon discoveries to surface world hooks (missing merchant's wagon found here)
- [ ] Add "previous adventuring party" evidence (skeleton with gear, final message)
- [ ] Create environmental details that telegraph danger or opportunity
- [ ] Link discoveries to significant items (map showing item location)

**Discovery Types:**
- **Documents:** Journals, letters, maps, spell notes, faction orders
- **Evidence:** Bodies, broken equipment, signs of struggle
- **Clues:** Tracks, fresh supplies, recent activity
- **Secrets:** Hidden doors hinted at, treasure locations, safe routes

**Previous Adventuring Party System:**
- Generate 1-3 failed adventurer groups per world at world-gen time
- Track which dungeons they attempted (deterministic based on seed)
- Leave evidence (skeleton, gear, journal) in specific rooms
- Create hooks: "My brother's party never returned from [dungeon]"

---

### 4. Connection Points

**Problem:** Dungeons are self-contained. No connection to broader geography.

**Goal:** Dungeons connect to the world, serving as shortcuts, resource sources, and network nodes.

**Tasks:**
- [ ] Add `exitPoints` array: connections to other hexes
- [ ] Generate underground networks between locations
- [ ] Create "shortcut but dangerous" travel routes through dungeons
- [ ] Add resources the surface world needs (water, ore, ingredients)
- [ ] Link dungeon exits to undiscovered hexes (exploration reward)
- [ ] Generate "this dungeon connects to X" rumors

**Connection Types:**
- **Geographic:** Tunnel emerges in different hex
- **Vertical:** Leads to deeper dungeon level
- **Network:** Part of larger underground system
- **Portal:** Magical connection to distant location
- **Resource:** Source of water, ore, rare materials

**Exit Point Rules:**
- Exit points are generated at world-gen time (deterministic)
- Destination hex is always generated, but marked as "undiscovered"
- Player sees "tunnel continues into darkness" until they explore
- Maximum 2 exit points per dungeon to prevent topology explosion

---

### 5. Negotiable NPCs

**Problem:** Current system is combat-focused. Limited support for creative problem-solving.

**Goal:** Some dungeon inhabitants can be negotiated with, not just fought.

**Scope:** This phase focuses ONLY on negotiable NPCs. Full "alternative solutions for every obstacle" is out of scope.

**Tasks:**
- [ ] Extend existing `DungeonNPC` system with wants/needs
- [ ] Add `disposition` field with gradients (hostile → wary → neutral → friendly)
- [ ] Generate NPCs with motivations that enable non-combat solutions
- [ ] Add "information as reward" - NPCs can reveal dungeon layout, enemy weaknesses
- [ ] Use existing categories: rival_party, prisoner, hermit, ghost, refugee

**NPC Wants (pick from table based on category):**
- Food, safety, wealth, revenge, freedom, information
- Knowing what an NPC wants enables non-combat solutions

**Disposition System:**
- **Hostile:** Attacks on sight, negotiation requires leverage
- **Wary:** Won't attack first, suspicious of offers
- **Neutral:** Open to talking, will trade fairly
- **Friendly:** Actively helpful, may volunteer information

---

### 6. Meaningful Treasure Placement

**Problem:** Treasure is randomly distributed. No narrative connection to dungeon or world.

**Goal:** Every significant treasure tells a story and creates consequences.

**Tasks:**
- [ ] Extend `SignificantItemGenerator` with `treasureBackstory` field
- [ ] Place significant items in thematic locations (crown in throne room)
- [ ] Add non-monetary valuables: maps, keys to other locations, faction secrets
- [ ] Create "cursed/complicated" treasures that create hooks
- [ ] Link treasure to faction desires (taking it angers someone)

**Treasure Categories:**
- **Wealth:** Coins, gems, trade goods (simple, no complications)
- **Information:** Maps, letters, secrets (creates new hooks)
- **Power:** Magic items, artifacts (attracts attention)
- **Leverage:** Blackmail material, faction secrets (political power)
- **Keys:** Literal or metaphorical access to other locations

---

### 7. Dynamic Dungeon State

**Problem:** Dungeons are frozen in time. They don't react to player actions or world events.

**Goal:** Dungeons change based on player actions and world clock progression.

**WARNING:** This phase introduces runtime state that breaks seeded determinism. See Design Decisions below.

**Tasks:**
- [ ] Add `alertLevel` to dungeon runtime state: normal → cautious → alarmed → lockdown
- [ ] Track `lastVisited` timestamp for dungeon state changes
- [ ] Add `resources` that deplete (forcing inhabitants to raid settlements)
- [ ] Connect dungeon state to faction clocks
- [ ] Create "dungeon events" that trigger based on world time

**Alert Levels:**
- **Normal:** Standard patrols, guards at posts
- **Cautious:** Double patrols, locked doors, set traps
- **Alarmed:** All inhabitants mobilized, reinforcements called
- **Lockdown:** Barricades, ambush positions, boss alerted

**Resource Depletion:**
- Food runs out → raiding parties hit nearby settlements
- Creates new hooks: "Stop the goblin raids" leads to dungeon
- Faction clocks can represent resource countdown

**Determinism Note:** Alert levels and resources are RUNTIME state stored separately from generated dungeon data. See "Generated vs. Runtime State" below.

---

## Implementation Phases

### Phase 0: Model Updates
All interface changes in one PR, reviewed together before implementation.

**Model Changes:**
```typescript
// In Location/SpatialDungeon
controllingFactionId?: string;
exitPoints?: ExitPoint[];

// In DungeonEcology - extend existing
interface DungeonEcology {
  historyLayers: HistoryLayer[];  // replaces single builders
  inhabitants: DungeonFactionProfile;
  activities: RoomActivityAssignment[];
}

interface HistoryLayer {
  era: string;           // "300 years ago"
  builders: string;      // "Dwarven miners"
  fate: string;          // "collapsed after earthquake"
  clueTypes: string[];   // ["runes", "equipment", "architecture"]
}

// In SpatialRoom
discoveries?: Discovery[];

interface Discovery {
  id: string;
  type: "document" | "evidence" | "clue" | "secret";
  description: string;
  linkedHookId?: string;      // connects to surface world
  linkedItemId?: string;      // points to significant item
}

// In DungeonNPC - extend existing
wants?: string[];             // ["freedom", "revenge"]
disposition: "hostile" | "wary" | "neutral" | "friendly";

// In SignificantItem - extend existing
backstory?: string;
complication?: string;

// New: Exit points
interface ExitPoint {
  id: string;
  roomId: string;             // which room has the exit
  destinationHexId: string;   // where it leads
  description: string;        // "narrow tunnel descending into darkness"
  discovered: boolean;        // runtime state
}

// New: Runtime dungeon state (separate from generated data)
interface DungeonRuntimeState {
  dungeonId: string;
  alertLevel: "normal" | "cautious" | "alarmed" | "lockdown";
  lastVisited?: number;       // timestamp
  resources: number;          // 0-100, depletes over time
  clearedRoomIds: string[];
  discoveredExitIds: string[];
}
```

**Tasks:**
- [ ] Add all interface changes to models/index.ts
- [ ] Create DungeonRuntimeState interface
- [ ] Extend existing interfaces (non-breaking where possible)
- [ ] Review and merge before any implementation

---

### Phase 1a: Faction-Dungeon Linking
Wire factions to dungeons without content changes yet.

**Tasks:**
- [ ] Add `controllingFactionId` to Location model
- [ ] Modify WorldGenerator: after faction generation, create dungeons at lair hexes
- [ ] Add `FACTION_TO_DUNGEON_THEME` mapping
- [ ] Link faction's `headquartersId` to the generated dungeon location
- [ ] Update dungeon detail view to show controlling faction

**Generation Order Fix:**
```typescript
// In WorldGenerator.ts, after generateFactions:
for (const faction of factions) {
  if (faction.lair) {
    const theme = pickFactionDungeonTheme(rng, faction.type);
    const dungeon = placeDungeon({
      seed: `${seed}-faction-lair-${faction.id}`,
      hexes,
      forceCoord: faction.lair.hexCoord,
      forceTheme: theme,
    });
    dungeon.controllingFactionId = faction.id;
    faction.headquartersId = dungeon.id;
  }
}
```

---

### Phase 1b: Faction NPCs in Dungeons
Populate faction dungeons with faction members.

**Tasks:**
- [ ] When generating faction lair dungeon, use faction NPCs as inhabitants
- [ ] Place faction leader in boss room
- [ ] Add faction-specific room activities
- [ ] Link faction agenda goals to dungeon objectives
- [ ] Add rival faction scouts as random encounters

---

### Phase 2: History & Storytelling
Makes dungeons feel alive with layered history and discoveries.

**Tasks:**
- [ ] Implement `HistoryLayer` generation (2-3 per dungeon)
- [ ] Create environmental detail tables per era type
- [ ] Add `historicalClues` to room generation
- [ ] Implement `Discovery` generation for rooms
- [ ] Generate document content from pre-seeded tables
- [ ] Implement "previous adventuring party" system
- [ ] Link discoveries to surface world hooks

**Determinism:** All generated at world-gen time, fully deterministic.

---

### Phase 3: Connection Points
Link dungeons to broader geography.

**Tasks:**
- [ ] Implement `ExitPoint` generation (max 2 per dungeon)
- [ ] Generate destination hexes (marked undiscovered)
- [ ] Add exit descriptions to room generation
- [ ] Generate "dungeon connects to X" rumors
- [ ] Update travel system for dungeon shortcuts

**Determinism:** Exit points generated at world-gen. `discovered` flag is runtime state.

---

### Phase 4: Negotiable NPCs
Add non-combat options with dungeon inhabitants.

**Tasks:**
- [ ] Extend DungeonNPC with wants/disposition
- [ ] Create wants tables by NPC category
- [ ] Generate initial disposition based on NPC type
- [ ] Add NPC negotiation UI hints
- [ ] Implement information-as-reward system

**Determinism:** Initial disposition generated at world-gen. Can change during play (runtime).

---

### Phase 5: Dynamic State
Most architecturally disruptive - implement last.

**Tasks:**
- [ ] Implement `DungeonRuntimeState` storage (separate from world data)
- [ ] Add alert level system with UI indicators
- [ ] Implement resource depletion over world time
- [ ] Connect depletion to settlement raid hooks
- [ ] Link dungeon state to faction clocks
- [ ] Add dungeon repopulation after extended absence

**Determinism:** Entirely runtime state. See design decisions below.

---

### Phase 6: Meaningful Treasure
Enhance treasure with narrative connections.

**Tasks:**
- [ ] Extend SignificantItem with backstory/complication
- [ ] Create treasure backstory tables
- [ ] Place significant items in thematic rooms
- [ ] Link treasure to faction desires
- [ ] Generate "this item will cause problems" complications

**Determinism:** Generated at world-gen, fully deterministic.

---

## Design Decisions

### Generated vs. Runtime State

**Core Principle:** "Same seed = same world" applies to GENERATED content only.

| Generated (Deterministic) | Runtime (Mutable) |
|---------------------------|-------------------|
| Dungeon layout | Alert level |
| Room contents | Cleared rooms |
| NPC placement | NPC disposition changes |
| Exit point locations | Discovered exits |
| Initial disposition | Resource levels |
| Treasure placement | Last visited timestamp |

**Storage:** Runtime state stored in `DungeonRuntimeState` object, separate from `WorldData`. Can be reset independently.

### What Happens When Players Clear a Faction Lair?

**Recommendation:** Faction loses HQ but doesn't immediately collapse.

1. Faction's `headquartersId` set to `null`
2. Faction clock advances (representing destabilization)
3. After 1d6 world weeks, faction either:
   - Claims a new wilderness hex as temporary lair (if wilderness-based)
   - Retreats to allied settlement (if urban-based)
   - Disbands if clock was already critical

This creates consequences without instant faction death.

### How Do Seasonal Variations Work?

**Recommendation:** Don't implement. Complexity not worth it.

Seasonal variations (flooded passages, frozen areas) would require:
- Tracking world date at dungeon access
- Multiple room state variations
- Complex save/load logic

Instead, encode "seasonal" flavor in the initial generation: "This cavern shows water marks suggesting spring flooding" as description text, not mechanical state.

### Who Generates Documents/Journals?

**Recommendation:** Pre-seeded tables, not AI/LLM.

Create tables of document templates with fill-in-the-blanks:
```
"[NPC_NAME]'s journal, day [NUMBER]: The [FACTION] grows bolder.
I've hidden the [ITEM] where they'll never find it - behind the [FEATURE] in the [ROOM_TYPE]."
```

Fill from existing world data at generation time. Deterministic, no external dependencies.

### How Do Exit Points Interact with Fog-of-War?

**Recommendation:** Destinations exist but are marked undiscovered.

1. Exit point exists in room: "A narrow tunnel descends into darkness to the southeast"
2. Destination hex is generated but `discovered: false`
3. If players explore the exit, destination hex becomes discovered
4. Until then, players only know "there's a passage leading somewhere"

This preserves exploration reward while maintaining deterministic generation.

### What's the Persistence Model?

**Recommendation:** Dungeons regenerate encounters on "long rest" outside.

- **Cleared rooms stay cleared** within a single expedition
- **Leaving dungeon for extended rest** triggers partial repopulation
- **World time passage** (weeks) triggers full repopulation
- **Boss/unique NPCs** don't respawn once defeated
- **Treasure doesn't respawn** - empty chests stay empty

This balances replayability with meaningful progress.

---

## Reference: Cairn Design Principles

1. **Player agency over dice rolls** - Multiple solutions to problems
2. **Information is power** - Discovery matters more than loot
3. **The world is alive** - Factions act, dungeons change
4. **Consequences cascade** - Actions in dungeon affect surface world
5. **Exploration is rewarding** - Finding secrets is the game
6. **Combat is dangerous** - Avoiding it is often smart

---

## Notes

- Phase 0 must be completed and merged before other phases begin
- Phases 1a and 1b are tightly coupled, implement together
- Phase 2 can be implemented independently after Phase 0
- Phase 5 (Dynamic State) is highest risk - consider skipping if scope concerns arise
- Test with faction-lair dungeons first (most integrated use case)
