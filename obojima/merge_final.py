import json
import os

CORE = "/Users/dmccord/Projects/vibeCode/hexbinder/temp/obojima_core.json"
NPCS = "/Users/dmccord/Projects/vibeCode/hexbinder/temp/obojima_npcs.json"
HOOKS = "/Users/dmccord/Projects/vibeCode/hexbinder/temp/obojima_hooks.json"
OUTPUT = "/Users/dmccord/Projects/vibeCode/hexbinder/temp/obojima_final.hexbinder.json"

with open(CORE) as f:
    world = json.load(f)

with open(NPCS) as f:
    npcs = json.load(f)

with open(HOOKS) as f:
    hooks = json.load(f)

world["npcs"] = npcs
world["hooks"] = hooks

with open(OUTPUT, "w") as f:
    json.dump(world, f, indent=2)

size = os.path.getsize(OUTPUT)
npc_count = len(world["npcs"])
hook_count = len(world["hooks"])
hex_count = len(world.get("hexes", []))
loc_count = len(world.get("locations", []))

print(f"Saved: {OUTPUT}")
print(f"File size: {size:,} bytes ({size/1024:.1f} KB)")
print(f"NPCs:      {npc_count}")
print(f"Hooks:     {hook_count}")
print(f"Locations: {loc_count}")
print(f"Hexes:     {hex_count}")
