# Dungeon Generation Improvements Plan

A roadmap for enhancing dungeon generation with Cairn-inspired design philosophy: player agency, meaningful choices, environmental storytelling, and world integration.

## Current System Summary

The existing dungeon generator provides:
- Spatial grid-based layout with A* pathfinding
- 15 dungeon themes with blueprints (crypts, temples, caves, etc.)
- Ecology system (builders, inhabitants, activities)
- Trap, NPC, key-lock puzzle systems
- Wandering monster tables

## Improvement Areas

---

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

**Design Notes:**
- Faction type influences dungeon theme (cult → temple/crypt, tribe → caves, syndicate → hideout)
- Faction advantages could be stored IN the dungeon (wealth in vault, artifact in shrine)
- Clearing a dungeon should impact faction status/clocks

---

### 2. History Layers

**Problem:** Dungeons feel like static sets. No sense of time, previous occupants, or accumulated history.

**Goal:** Every dungeon tells a story through environmental details spanning multiple eras.

**Tasks:**
- [ ] Add `historyLayers` array to dungeon model: `{ era: string, builders: string, fate: string }`
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
- [ ] Generate journal entries, letters, maps as loot
- [ ] Connect dungeon discoveries to surface world hooks (missing merchant's wagon found here)
- [ ] Add "previous adventuring party" evidence (skeleton with gear, final message)
- [ ] Create environmental details that telegraph danger or opportunity
- [ ] Link discoveries to significant items (map showing item location)

**Discovery Types:**
- **Documents:** Journals, letters, maps, spell notes, faction orders
- **Evidence:** Bodies, broken equipment, signs of struggle
- **Clues:** Tracks, fresh supplies, recent activity
- **Secrets:** Hidden doors hinted at, treasure locations, safe routes

---

### 4. Dynamic Dungeon State

**Problem:** Dungeons are frozen in time. They don't react to player actions or world events.

**Goal:** Dungeons change based on player actions and world clock progression.

**Tasks:**
- [ ] Add `alertLevel` to dungeon state: normal → cautious → alarmed → lockdown
- [ ] Track `lastCleared` timestamp for dungeon repopulation
- [ ] Add `resources` that deplete (forcing inhabitants to raid settlements)
- [ ] Connect dungeon state to faction clocks
- [ ] Generate seasonal variations (flooded passages, frozen areas)
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

---

### 5. Meaningful Treasure Placement

**Problem:** Treasure is randomly distributed. No narrative connection to dungeon or world.

**Goal:** Every significant treasure tells a story and creates consequences.

**Tasks:**
- [ ] Place significant items in specific thematic locations (crown in throne room)
- [ ] Generate treasure backstories: who owned it, why it's here
- [ ] Add non-monetary valuables: maps, keys to other locations, faction secrets
- [ ] Create "cursed/complicated" treasures that create hooks
- [ ] Link treasure to faction desires (taking it angers someone)
- [ ] Generate "useful but dangerous" items (powerful but attracts attention)

**Treasure Categories:**
- **Wealth:** Coins, gems, trade goods (simple, no complications)
- **Information:** Maps, letters, secrets (creates new hooks)
- **Power:** Magic items, artifacts (attracts attention)
- **Leverage:** Blackmail material, faction secrets (political power)
- **Keys:** Literal or metaphorical access to other locations

---

### 6. Alternative Solutions

**Problem:** Current system is combat-focused. Limited support for creative problem-solving.

**Goal:** Every obstacle has multiple solutions. Not everything requires fighting.

**Tasks:**
- [ ] Add `alternativeSolutions` to encounters/obstacles
- [ ] Generate negotiable NPCs with wants/needs
- [ ] Create environmental hazards that can be weaponized
- [ ] Add "information as reward" - learning dungeon layout, enemy weaknesses
- [ ] Generate multiple paths to objectives (not just key-lock-door)
- [ ] Add NPC disposition system (hostile, wary, neutral, friendly)

**Solution Types:**
- **Combat:** Fight through (always available)
- **Stealth:** Sneak past, avoid detection
- **Social:** Negotiate, bribe, deceive, intimidate
- **Environmental:** Collapse tunnel, flood room, start fire
- **Information:** Learn weakness, find secret path, discover alliance

**NPC Wants:**
- Food, safety, wealth, revenge, freedom, information
- Knowing what an NPC wants enables non-combat solutions

---

### 7. Connection Points

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

---

## Implementation Priority

### Phase 1: Foundation (Faction Integration)
Start here because we just built the faction HQ system. Natural extension.
- Faction-controlled dungeons
- Faction NPCs as inhabitants
- Basic faction-dungeon linking

### Phase 2: Narrative Depth (History + Storytelling)
Makes dungeons feel alive and connected to the world.
- History layers
- Environmental discoveries
- Document/evidence generation

### Phase 3: World Integration (Connections + Dynamics)
Connects dungeons to the broader sandbox.
- Exit points and networks
- Dynamic state and alert levels
- Resource mechanics

### Phase 4: Player Agency (Solutions + Treasure)
Enhances gameplay options.
- Alternative solutions
- NPC disposition
- Meaningful treasure placement

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

- Each phase should be playable independently
- Test with faction-lair dungeons first (most integrated)
- Consider save/load implications for dynamic state
- Document generation could use AI/LLM for variety
