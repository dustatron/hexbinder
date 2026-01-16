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

# Phase 1: Foundation (Faction Integration)
PHASE1=$(bd create "Phase 1: Faction Integration" -p 0 --json | jq -r '.id')
echo "Created phase 1: $PHASE1"

T1_1=$(bd create "Add controllingFactionId field to dungeon/location model" --json | jq -r '.id')
T1_2=$(bd create "Generate matching dungeon when faction has wilderness lair HQ" --json | jq -r '.id')
T1_3=$(bd create "Populate dungeon with faction NPCs as inhabitants" --json | jq -r '.id')
T1_4=$(bd create "Link faction agenda goals to dungeon treasures/objectives" --json | jq -r '.id')
T1_5=$(bd create "Add rival faction scouts as potential dungeon encounters" --json | jq -r '.id')
T1_6=$(bd create "Generate hooks that send players to faction-controlled dungeons" --json | jq -r '.id')

bd dep add $T1_1 $PHASE1
bd dep add $T1_2 $T1_1
bd dep add $T1_3 $T1_2
bd dep add $T1_4 $T1_3
bd dep add $T1_5 $T1_4
bd dep add $T1_6 $T1_5

# Phase 2: Narrative Depth (History + Storytelling)
PHASE2=$(bd create "Phase 2: Narrative Depth (History + Storytelling)" --json | jq -r '.id')
echo "Created phase 2: $PHASE2"

T2_1=$(bd create "Add historyLayers array to dungeon model" --json | jq -r '.id')
T2_2=$(bd create "Generate 2-3 history layers per dungeon" --json | jq -r '.id')
T2_3=$(bd create "Create environmental detail tables for each era type" --json | jq -r '.id')
T2_4=$(bd create "Add historicalClues to room descriptions" --json | jq -r '.id')
T2_5=$(bd create "Mix treasure from different eras in loot generation" --json | jq -r '.id')
T2_6=$(bd create "Generate what-happened-here discoveries" --json | jq -r '.id')

T2_7=$(bd create "Add discoveries array to rooms for non-combat finds" --json | jq -r '.id')
T2_8=$(bd create "Generate journal entries, letters, maps as loot" --json | jq -r '.id')
T2_9=$(bd create "Connect dungeon discoveries to surface world hooks" --json | jq -r '.id')
T2_10=$(bd create "Add previous adventuring party evidence" --json | jq -r '.id')
T2_11=$(bd create "Create environmental details that telegraph danger" --json | jq -r '.id')
T2_12=$(bd create "Link discoveries to significant items" --json | jq -r '.id')

bd dep add $PHASE2 $PHASE1
bd dep add $T2_1 $PHASE2
bd dep add $T2_2 $T2_1
bd dep add $T2_3 $T2_2
bd dep add $T2_4 $T2_3
bd dep add $T2_5 $T2_4
bd dep add $T2_6 $T2_5
bd dep add $T2_7 $T2_6
bd dep add $T2_8 $T2_7
bd dep add $T2_9 $T2_8
bd dep add $T2_10 $T2_9
bd dep add $T2_11 $T2_10
bd dep add $T2_12 $T2_11

# Phase 3: World Integration (Connections + Dynamics)
PHASE3=$(bd create "Phase 3: World Integration (Connections + Dynamics)" --json | jq -r '.id')
echo "Created phase 3: $PHASE3"

T3_1=$(bd create "Add alertLevel to dungeon state (normal/cautious/alarmed/lockdown)" --json | jq -r '.id')
T3_2=$(bd create "Track lastCleared timestamp for dungeon repopulation" --json | jq -r '.id')
T3_3=$(bd create "Add resources that deplete (forcing raids on settlements)" --json | jq -r '.id')
T3_4=$(bd create "Connect dungeon state to faction clocks" --json | jq -r '.id')
T3_5=$(bd create "Generate seasonal variations (flooded/frozen passages)" --json | jq -r '.id')
T3_6=$(bd create "Create dungeon events triggered by world time" --json | jq -r '.id')

T3_7=$(bd create "Add exitPoints array for connections to other hexes" --json | jq -r '.id')
T3_8=$(bd create "Generate underground networks between locations" --json | jq -r '.id')
T3_9=$(bd create "Create shortcut-but-dangerous travel routes" --json | jq -r '.id')
T3_10=$(bd create "Add resources the surface world needs (water/ore)" --json | jq -r '.id')
T3_11=$(bd create "Link dungeon exits to undiscovered hexes" --json | jq -r '.id')
T3_12=$(bd create "Generate this-dungeon-connects-to-X rumors" --json | jq -r '.id')

bd dep add $PHASE3 $PHASE2
bd dep add $T3_1 $PHASE3
bd dep add $T3_2 $T3_1
bd dep add $T3_3 $T3_2
bd dep add $T3_4 $T3_3
bd dep add $T3_5 $T3_4
bd dep add $T3_6 $T3_5
bd dep add $T3_7 $T3_6
bd dep add $T3_8 $T3_7
bd dep add $T3_9 $T3_8
bd dep add $T3_10 $T3_9
bd dep add $T3_11 $T3_10
bd dep add $T3_12 $T3_11

# Phase 4: Player Agency (Solutions + Treasure)
PHASE4=$(bd create "Phase 4: Player Agency (Solutions + Treasure)" --json | jq -r '.id')
echo "Created phase 4: $PHASE4"

T4_1=$(bd create "Add alternativeSolutions to encounters/obstacles" --json | jq -r '.id')
T4_2=$(bd create "Generate negotiable NPCs with wants/needs" --json | jq -r '.id')
T4_3=$(bd create "Create environmental hazards that can be weaponized" --json | jq -r '.id')
T4_4=$(bd create "Add information-as-reward system" --json | jq -r '.id')
T4_5=$(bd create "Generate multiple paths to objectives" --json | jq -r '.id')
T4_6=$(bd create "Add NPC disposition system (hostile/wary/neutral/friendly)" --json | jq -r '.id')

T4_7=$(bd create "Place significant items in thematic locations" --json | jq -r '.id')
T4_8=$(bd create "Generate treasure backstories (who owned it, why here)" --json | jq -r '.id')
T4_9=$(bd create "Add non-monetary valuables (maps, keys, secrets)" --json | jq -r '.id')
T4_10=$(bd create "Create cursed/complicated treasures that create hooks" --json | jq -r '.id')
T4_11=$(bd create "Link treasure to faction desires" --json | jq -r '.id')
T4_12=$(bd create "Generate useful-but-dangerous items" --json | jq -r '.id')

bd dep add $PHASE4 $PHASE3
bd dep add $T4_1 $PHASE4
bd dep add $T4_2 $T4_1
bd dep add $T4_3 $T4_2
bd dep add $T4_4 $T4_3
bd dep add $T4_5 $T4_4
bd dep add $T4_6 $T4_5
bd dep add $T4_7 $T4_6
bd dep add $T4_8 $T4_7
bd dep add $T4_9 $T4_8
bd dep add $T4_10 $T4_9
bd dep add $T4_11 $T4_10
bd dep add $T4_12 $T4_11

echo ""
echo "Done! Created 4 phases with 42 tasks total."
echo ""
echo "View ready tasks: bd ready"
echo "Show all tasks: bd list"
echo "Start working: bd start <task-id>"
