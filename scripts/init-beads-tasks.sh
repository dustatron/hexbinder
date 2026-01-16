#!/bin/bash
# Initialize beads and create dungeon improvement tasks
# Run this after installing beads: npm install -g @beads/bd
# Or: brew install steveyegge/beads/bd

set -e

# Check if bd is available
if ! command -v bd &> /dev/null; then
    echo "Error: beads (bd) is not installed"
    echo "Install with: npm install -g @beads/bd"
    echo "Or: brew install steveyegge/beads/bd"
    exit 1
fi

# Initialize beads in the project if not already done
if [ ! -d ".beads" ]; then
    bd init
fi

echo "Creating dungeon improvement tasks..."

# Phase 0: Model Updates (must complete first)
PHASE0=$(bd create "Phase 0: Model Updates" -p 0 --json | jq -r '.id')
echo "Created phase 0: $PHASE0"

T0_1=$(bd create "Add interface changes to models/index.ts" --json | jq -r '.id')
T0_2=$(bd create "Create DungeonRuntimeState interface" --json | jq -r '.id')
T0_3=$(bd create "Add HistoryLayer interface" --json | jq -r '.id')
T0_4=$(bd create "Add Discovery interface" --json | jq -r '.id')
T0_5=$(bd create "Add ExitPoint interface" --json | jq -r '.id')
T0_6=$(bd create "Extend DungeonNPC with wants/disposition" --json | jq -r '.id')
T0_7=$(bd create "Extend SignificantItem with backstory/complication" --json | jq -r '.id')
T0_8=$(bd create "Review and merge model changes PR" --json | jq -r '.id')

bd dep add $T0_1 $PHASE0
bd dep add $T0_2 $T0_1
bd dep add $T0_3 $T0_2
bd dep add $T0_4 $T0_3
bd dep add $T0_5 $T0_4
bd dep add $T0_6 $T0_5
bd dep add $T0_7 $T0_6
bd dep add $T0_8 $T0_7

# Phase 1a: Faction-Dungeon Linking
PHASE1A=$(bd create "Phase 1a: Faction-Dungeon Linking" --json | jq -r '.id')
echo "Created phase 1a: $PHASE1A"

T1A_1=$(bd create "Add controllingFactionId to Location model" --json | jq -r '.id')
T1A_2=$(bd create "Modify WorldGenerator to create dungeons at lair hexes" --json | jq -r '.id')
T1A_3=$(bd create "Add FACTION_TO_DUNGEON_THEME mapping" --json | jq -r '.id')
T1A_4=$(bd create "Link faction headquartersId to generated dungeon" --json | jq -r '.id')
T1A_5=$(bd create "Update dungeon detail view to show controlling faction" --json | jq -r '.id')

bd dep add $PHASE1A $PHASE0
bd dep add $T1A_1 $PHASE1A
bd dep add $T1A_2 $T1A_1
bd dep add $T1A_3 $T1A_2
bd dep add $T1A_4 $T1A_3
bd dep add $T1A_5 $T1A_4

# Phase 1b: Faction NPCs in Dungeons
PHASE1B=$(bd create "Phase 1b: Faction NPCs in Dungeons" --json | jq -r '.id')
echo "Created phase 1b: $PHASE1B"

T1B_1=$(bd create "Use faction NPCs as dungeon inhabitants" --json | jq -r '.id')
T1B_2=$(bd create "Place faction leader in boss room" --json | jq -r '.id')
T1B_3=$(bd create "Add faction-specific room activities" --json | jq -r '.id')
T1B_4=$(bd create "Link faction agenda goals to dungeon objectives" --json | jq -r '.id')
T1B_5=$(bd create "Add rival faction scouts as random encounters" --json | jq -r '.id')

bd dep add $PHASE1B $PHASE1A
bd dep add $T1B_1 $PHASE1B
bd dep add $T1B_2 $T1B_1
bd dep add $T1B_3 $T1B_2
bd dep add $T1B_4 $T1B_3
bd dep add $T1B_5 $T1B_4

# Phase 2: History & Storytelling
PHASE2=$(bd create "Phase 2: History & Storytelling" --json | jq -r '.id')
echo "Created phase 2: $PHASE2"

T2_1=$(bd create "Implement HistoryLayer generation (2-3 per dungeon)" --json | jq -r '.id')
T2_2=$(bd create "Create environmental detail tables per era type" --json | jq -r '.id')
T2_3=$(bd create "Add historicalClues to room generation" --json | jq -r '.id')
T2_4=$(bd create "Implement Discovery generation for rooms" --json | jq -r '.id')
T2_5=$(bd create "Generate document content from pre-seeded tables" --json | jq -r '.id')
T2_6=$(bd create "Implement previous adventuring party system" --json | jq -r '.id')
T2_7=$(bd create "Link discoveries to surface world hooks" --json | jq -r '.id')

bd dep add $PHASE2 $PHASE0  # Can start after Phase 0, parallel to Phase 1
bd dep add $T2_1 $PHASE2
bd dep add $T2_2 $T2_1
bd dep add $T2_3 $T2_2
bd dep add $T2_4 $T2_3
bd dep add $T2_5 $T2_4
bd dep add $T2_6 $T2_5
bd dep add $T2_7 $T2_6

# Phase 3: Connection Points
PHASE3=$(bd create "Phase 3: Connection Points" --json | jq -r '.id')
echo "Created phase 3: $PHASE3"

T3_1=$(bd create "Implement ExitPoint generation (max 2 per dungeon)" --json | jq -r '.id')
T3_2=$(bd create "Generate destination hexes (marked undiscovered)" --json | jq -r '.id')
T3_3=$(bd create "Add exit descriptions to room generation" --json | jq -r '.id')
T3_4=$(bd create "Generate dungeon-connects-to-X rumors" --json | jq -r '.id')
T3_5=$(bd create "Update travel system for dungeon shortcuts" --json | jq -r '.id')

bd dep add $PHASE3 $PHASE1B
bd dep add $T3_1 $PHASE3
bd dep add $T3_2 $T3_1
bd dep add $T3_3 $T3_2
bd dep add $T3_4 $T3_3
bd dep add $T3_5 $T3_4

# Phase 4: Negotiable NPCs
PHASE4=$(bd create "Phase 4: Negotiable NPCs" --json | jq -r '.id')
echo "Created phase 4: $PHASE4"

T4_1=$(bd create "Extend DungeonNPC with wants/disposition fields" --json | jq -r '.id')
T4_2=$(bd create "Create wants tables by NPC category" --json | jq -r '.id')
T4_3=$(bd create "Generate initial disposition based on NPC type" --json | jq -r '.id')
T4_4=$(bd create "Add NPC negotiation UI hints" --json | jq -r '.id')
T4_5=$(bd create "Implement information-as-reward system" --json | jq -r '.id')

bd dep add $PHASE4 $PHASE1B
bd dep add $T4_1 $PHASE4
bd dep add $T4_2 $T4_1
bd dep add $T4_3 $T4_2
bd dep add $T4_4 $T4_3
bd dep add $T4_5 $T4_4

# Phase 5: Dynamic State (highest risk, implement last)
PHASE5=$(bd create "Phase 5: Dynamic State" --json | jq -r '.id')
echo "Created phase 5: $PHASE5"

T5_1=$(bd create "Implement DungeonRuntimeState storage" --json | jq -r '.id')
T5_2=$(bd create "Add alert level system with UI indicators" --json | jq -r '.id')
T5_3=$(bd create "Implement resource depletion over world time" --json | jq -r '.id')
T5_4=$(bd create "Connect depletion to settlement raid hooks" --json | jq -r '.id')
T5_5=$(bd create "Link dungeon state to faction clocks" --json | jq -r '.id')
T5_6=$(bd create "Add dungeon repopulation after extended absence" --json | jq -r '.id')

bd dep add $PHASE5 $PHASE3
bd dep add $PHASE5 $PHASE4
bd dep add $T5_1 $PHASE5
bd dep add $T5_2 $T5_1
bd dep add $T5_3 $T5_2
bd dep add $T5_4 $T5_3
bd dep add $T5_5 $T5_4
bd dep add $T5_6 $T5_5

# Phase 6: Meaningful Treasure
PHASE6=$(bd create "Phase 6: Meaningful Treasure" --json | jq -r '.id')
echo "Created phase 6: $PHASE6"

T6_1=$(bd create "Extend SignificantItem with backstory/complication" --json | jq -r '.id')
T6_2=$(bd create "Create treasure backstory tables" --json | jq -r '.id')
T6_3=$(bd create "Place significant items in thematic rooms" --json | jq -r '.id')
T6_4=$(bd create "Link treasure to faction desires" --json | jq -r '.id')
T6_5=$(bd create "Generate item-will-cause-problems complications" --json | jq -r '.id')

bd dep add $PHASE6 $PHASE1B
bd dep add $T6_1 $PHASE6
bd dep add $T6_2 $T6_1
bd dep add $T6_3 $T6_2
bd dep add $T6_4 $T6_3
bd dep add $T6_5 $T6_4

echo ""
echo "Done! Created 7 phases with 51 tasks total."
echo ""
echo "Phase structure:"
echo "  Phase 0: Model Updates (8 tasks) - MUST COMPLETE FIRST"
echo "  Phase 1a: Faction-Dungeon Linking (5 tasks)"
echo "  Phase 1b: Faction NPCs in Dungeons (5 tasks)"
echo "  Phase 2: History & Storytelling (7 tasks) - can parallel Phase 1"
echo "  Phase 3: Connection Points (5 tasks)"
echo "  Phase 4: Negotiable NPCs (5 tasks)"
echo "  Phase 5: Dynamic State (6 tasks) - highest risk, last"
echo "  Phase 6: Meaningful Treasure (5 tasks)"
echo ""
echo "View ready tasks: bd ready"
echo "Show all tasks: bd list"
echo "Start working: bd start <task-id>"
