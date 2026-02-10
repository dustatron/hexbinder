#!/usr/bin/env python3
"""Validate cross-references across Obojima world data files."""

import json
import sys
from pathlib import Path

BASE = Path(__file__).parent

def load_json(filename):
    with open(BASE / filename) as f:
        return json.load(f)

def main():
    # ── Load data ──────────────────────────────────────────────
    core = load_json("obojima_core.json")
    npcs_file = load_json("obojima_npcs.json")
    hooks_file = load_json("obojima_hooks.json")

    hexes = core.get("hexes", [])
    locations = core.get("locations", [])
    factions = core.get("factions", [])
    clocks = core.get("clocks", [])
    significant_items = core.get("significantItems", [])
    calendar = core.get("state", {}).get("calendar", [])

    # Build lookup sets/dicts
    location_ids = {loc["id"] for loc in locations}
    location_by_id = {loc["id"]: loc for loc in locations}
    npc_ids = {npc["id"] for npc in npcs_file}
    npc_by_id = {npc["id"]: npc for npc in npcs_file}
    faction_ids = {fac["id"] for fac in factions}
    hook_ids = {hook["id"] for hook in hooks_file}

    # Hex coord -> hex mapping (use tuple of q,r)
    hex_coords = {}
    for h in hexes:
        coord = (h["coord"]["q"], h["coord"]["r"])
        hex_coords[coord] = h

    total_issues = 0
    all_failures = []

    def check(name, failures):
        nonlocal total_issues
        count = len(failures)
        total_issues += count
        status = "\u2705 PASS" if count == 0 else f"\u274c FAIL ({count})"
        print(f"  {status}  {name}")
        if failures:
            all_failures.extend(failures)
            for f in failures[:10]:  # cap per-check output
                print(f"           \u2937 {f}")
            if count > 10:
                print(f"           ... and {count - 10} more")

    print("=" * 70)
    print("  OBOJIMA WORLD DATA VALIDATION")
    print("=" * 70)
    print()

    # ── (a) hex.locationId -> locations ────────────────────────
    failures = []
    for h in hexes:
        lid = h.get("locationId")
        if lid and lid not in location_ids:
            failures.append(f"Hex ({h['coord']['q']},{h['coord']['r']}) refs missing location {lid}")
    check("(a) Hex locationId \u2192 locations", failures)

    # ── (b) location.hexCoord -> matches a hex ────────────────
    failures = []
    for loc in locations:
        hc = loc.get("hexCoord")
        if hc:
            coord = (hc["q"], hc["r"])
            if coord not in hex_coords:
                failures.append(f"Location {loc['id']} ({loc['name']}) hexCoord ({hc['q']},{hc['r']}) has no hex")
    check("(b) Location hexCoord \u2192 hex exists", failures)

    # ── (c) settlement.npcIds -> npcs ─────────────────────────
    failures = []
    for loc in locations:
        for nid in loc.get("npcIds", []):
            if nid not in npc_ids:
                failures.append(f"Location {loc['name']} refs missing NPC {nid}")
    check("(c) Settlement npcIds \u2192 npcs", failures)

    # ── (d) NPC.locationId -> locations or null ───────────────
    failures = []
    for npc in npcs_file:
        lid = npc.get("locationId")
        if lid is not None and lid not in location_ids:
            failures.append(f"NPC {npc['name']} ({npc['id']}) refs missing location {lid}")
    check("(d) NPC locationId \u2192 locations (or null)", failures)

    # ── (e) hook.sourceNpcId -> npcs ──────────────────────────
    failures = []
    for hook in hooks_file:
        src = hook.get("sourceNpcId")
        if src and src not in npc_ids:
            failures.append(f"Hook {hook['id']} sourceNpcId {src} missing")
    check("(e) Hook sourceNpcId \u2192 npcs", failures)

    # ── (f) hook.targetLocationId -> locations ────────────────
    failures = []
    for hook in hooks_file:
        tgt = hook.get("targetLocationId")
        if tgt and tgt not in location_ids:
            failures.append(f"Hook {hook['id']} targetLocationId {tgt} missing")
    check("(f) Hook targetLocationId \u2192 locations", failures)

    # ── (g) hook.involvedNpcIds -> npcs ───────────────────────
    failures = []
    for hook in hooks_file:
        for nid in hook.get("involvedNpcIds", []):
            if nid not in npc_ids:
                failures.append(f"Hook {hook['id']} involvedNpcId {nid} missing")
    check("(g) Hook involvedNpcIds \u2192 npcs", failures)

    # ── (h) hook.involvedLocationIds -> locations ─────────────
    failures = []
    for hook in hooks_file:
        for lid in hook.get("involvedLocationIds", []):
            if lid not in location_ids:
                failures.append(f"Hook {hook['id']} involvedLocationId {lid} missing")
    check("(h) Hook involvedLocationIds \u2192 locations", failures)

    # ── (i) clock.ownerId -> factions ─────────────────────────
    failures = []
    for clock in clocks:
        oid = clock.get("ownerId")
        if oid and oid not in faction_ids:
            failures.append(f"Clock {clock['name']} ownerId {oid} missing from factions")
    check("(i) Clock ownerId \u2192 factions", failures)

    # ── (j) faction.lair.dungeonId -> locations ───────────────
    failures = []
    for fac in factions:
        lair = fac.get("lair", {})
        if lair:
            did = lair.get("dungeonId")
            if did and did not in location_ids:
                failures.append(f"Faction {fac['name']} lair dungeonId {did} missing from locations")
    check("(j) Faction lair.dungeonId \u2192 locations", failures)

    # ── (k) significantItem.desiredByFactionIds -> factions ───
    failures = []
    for item in significant_items:
        for fid in item.get("desiredByFactionIds", []):
            if fid not in faction_ids:
                failures.append(f"Item {item['name']} desiredByFactionId {fid} missing")
    check("(k) SignificantItem desiredByFactionIds \u2192 factions", failures)

    # ── (l) calendar event.linkedFactionId -> factions ────────
    failures = []
    for day_entry in calendar:
        for evt in day_entry.get("events", []):
            fid = evt.get("linkedFactionId")
            if fid and fid not in faction_ids:
                failures.append(f"Calendar event {evt.get('id','')} linkedFactionId {fid} missing")
    check("(l) Calendar event linkedFactionId \u2192 factions", failures)

    # ── (m) calendar event.linkedLocationId -> locations ──────
    failures = []
    for day_entry in calendar:
        for evt in day_entry.get("events", []):
            lid = evt.get("linkedLocationId")
            if lid and lid not in location_ids:
                failures.append(f"Calendar event {evt.get('id','')} linkedLocationId {lid} missing")
    check("(m) Calendar event linkedLocationId \u2192 locations", failures)

    # ── (n) No forbidden NPC races ────────────────────────────
    forbidden_races = {"goblin", "dwarf", "half-orc", "halfling", "gnome", "human/elf"}
    failures = []
    for npc in npcs_file:
        race = npc.get("race", "").lower()
        if race in forbidden_races:
            failures.append(f"NPC {npc['name']} ({npc['id']}) has forbidden race '{npc['race']}'")
    check("(n) No forbidden NPC races", failures)

    # ── (o) World name is 'Obojima' ──────────────────────────
    world_name = core.get("name", "")
    failures = [] if world_name == "Obojima" else [f"World name is '{world_name}', expected 'Obojima'"]
    check("(o) World name is 'Obojima'", failures)

    # ── (p) No generic settlement/dungeon names ──────────────
    generic_names = [
        "Greyton", "Highton", "Ironmill", "Westbury", "Blackford",
        "Northfalls", "Greymill", "Westfield"
    ]
    failures = []
    for loc in locations:
        name = loc.get("name", "")
        for gn in generic_names:
            if gn.lower() in name.lower():
                failures.append(f"Location '{name}' ({loc['id']}) contains generic name '{gn}'")
    check("(p) No generic settlement/dungeon names", failures)

    # ── (q) No generic NPC surnames ──────────────────────────
    generic_npc_names = [
        "Ironside", "Marshwalker", "Goldmane", "Stonefist", "Brightblade",
        "Darkwood", "Silvershield", "Oakenshield", "Thornwood", "Firebrand",
        "Blackthorn", "Stormwind", "Deepforge", "Whitecliff", "Highwind",
        "Tundraborn", "Valleyborn", "Lakewood", "Rivershade", "Mountainborn",
        "Shadowmere", "Lightbringer", "Dawnblade", "Nightshade", "Frostbeard",
    ]
    failures = []
    for npc in npcs_file:
        name = npc.get("name", "")
        for gn in generic_npc_names:
            if gn.lower() in name.lower():
                failures.append(f"NPC '{name}' ({npc['id']}) contains generic name '{gn}'")
    check("(q) No generic NPC names", failures)

    # ── Summary ──────────────────────────────────────────────
    print()
    print("=" * 70)
    if total_issues == 0:
        print("  \U0001f389 ALL CHECKS PASSED \u2014 0 issues found")
    else:
        print(f"  \u26a0\ufe0f  TOTAL ISSUES: {total_issues}")
        print()
        print("  All failures:")
        for i, f in enumerate(all_failures, 1):
            print(f"    {i:3d}. {f}")
    print("=" * 70)

    return 0 if total_issues == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
