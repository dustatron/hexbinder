# User Feedback Roadmap

Collected from user testing session. Prioritized by impact and effort.

---

## Bugs

### B1: Terrain Generation Limited to Forest/Mountains/Plains
**Status:** Investigated  
**Priority:** High  
**Effort:** Medium  

Region generator only produces Forest, Mountains, or Plains terrain. Missing:
- Hills (defined but rare)
- Swamp (defined but rare)
- Desert (defined but very rare)
- Coast (NOT DEFINED - doesn't exist)
- Road (NOT DEFINED - doesn't exist)
- Tundra (NOT DEFINED - doesn't exist)

**Root Cause Found:**
The `SpiralTerrainGenerator.ts` uses a terrain loop with shift mechanics:
- 60% chance to stay same terrain
- 20% chance to shift +1
- 10% chance to shift -1
- 10% chance POI with shift

Terrain loop order: `plains → forest → hills → mountains → desert → swamp → water → plains`

Starting from plains (center) with 60% same-terrain probability, reaching desert/swamp requires 4+ consecutive shifts - extremely unlikely.

Seed points force compass directions to specific terrains but NO desert seed:
- North: hills
- East: forest
- South: swamp
- West: mountains

**Fixes needed:**
1. Add desert as a seed point (maybe Southeast?)
2. Increase shift probability OR add "jump" mechanic
3. Consider adding Coast/Tundra as new terrain types if desired
4. Road is probably a feature overlay, not terrain type

---

## Quick Wins

### Q1: Dungeon Map Icons - NPCs vs Creatures
**Status:** Not started  
**Priority:** High  
**Effort:** Small (1-2 hours)  

Currently hard to distinguish rooms with NPCs you can talk to vs creatures you must fight (e.g., "murder camels").

**Solution:**
- Use distinct icon for NPCs (person/speech bubble) vs creatures (skull/claw)
- Maybe color coding: green/yellow for NPCs, red for hostile creatures
- Check `DungeonMap.tsx` and room rendering logic

### Q2: Creature Theming per Dungeon Type
**Status:** Not started  
**Priority:** Medium  
**Effort:** Small  

"Cultist lair filled with camels" feels silly. Dungeon creature pools should match theme better.

**Solution:**
- Review creature pool selection in dungeon generator
- Ensure theme-appropriate creatures (cultists get cultist creatures, not random animals)

---

## Medium Features

### M1: Calendar Editing
**Status:** Not started  
**Priority:** Medium  
**Effort:** Medium (half-day)  

Calendar looks connected to things but unclear how. Users want to:
- Edit weather manually
- Change seasons
- Understand event connections

**Solution:**
- Add weather override controls
- Season selector
- Show event->calendar connections more clearly
- Document calendar system

### M2: Missing Cairn Content - People
**Status:** Not started  
**Priority:** Medium  
**Effort:** Medium  

Missing "People" tables from Cairn Setting Seeds:
https://cairnrpg.com/second-edition/wardens-guide/setting-seeds/#people

**Solution:**
- Add People generator based on Cairn tables
- Integrate into region/settlement generation

### M3: Missing Cairn Content - Landmarks
**Status:** Not started  
**Priority:** Medium  
**Effort:** Medium  

Landmarks don't match Cairn topography rules:
https://cairnrpg.com/second-edition/wardens-guide/setting-seeds/#topography

**Solution:**
- Review landmark generation
- Add missing landmark types from Cairn
- Consider closer alignment with topography rules (optional)

---

## Large Features

### L1: Editable Dungeon Maps
**Status:** Not started  
**Priority:** High  
**Effort:** Large (multi-day)  

Users want to modify generated dungeons:
- Add rooms
- Remove rooms
- Change hallway connections
- Move rooms around

This would make the tool "10/10" per user feedback.

**Approach Options:**
1. **Simple editing:** Add/remove rooms via UI, auto-regenerate layout
2. **Visual editor:** Drag-and-drop room placement, manual connection drawing
3. **Hybrid:** Generate base layout, allow manual tweaks

**Considerations:**
- Need to persist edits to WorldData
- Map visualization must reflect changes
- Room numbering/connections need recalculation
- Consider undo/redo

### L2: Forest Seeds Generator
**Status:** Not started  
**Priority:** High (for Cairn users)  
**Effort:** Large (multi-day)  

New generator based on Cairn Forest Seeds rules:
https://cairnrpg.com/second-edition/wardens-guide/forest-seeds/

**Components needed:**
- Forest structure (trails, clearings, landmarks)
- Forest-specific encounters
- Forest "dungeon" equivalent (point crawl?)
- Integration with hex map

### L3: Compendium Customization
**Status:** Not started  
**Priority:** Medium  
**Effort:** Large  

Users want to customize base content:
- Toggle items on/off
- Edit existing entries
- Add custom content

**Approach:**
- Settings layer that overrides base data
- UI for browsing/editing compendium
- Import/export custom content
- Per-world or global customizations

---

## Suggested Implementation Order

### Phase 1: Bug Fixes & Quick Wins
1. [B1] Fix terrain generation variety
2. [Q1] Dungeon map NPC vs creature icons
3. [Q2] Review dungeon creature theming

### Phase 2: Cairn Content
4. [M2] Add People tables
5. [M3] Add/improve Landmarks
6. [L2] Forest Seeds generator

### Phase 3: Editing & Customization
7. [M1] Calendar editing
8. [L1] Editable dungeon maps
9. [L3] Compendium customization

---

## Notes

- User is running Cairn, so Cairn-specific features are high value
- "Murder camels" in cultist lair = creature pool issue
- Editable maps would be transformative feature
- Consider whether to match Cairn rules 1:1 or adapt for tool
