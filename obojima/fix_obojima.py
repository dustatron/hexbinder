#!/usr/bin/env python3
"""
Comprehensive fix for obojima_final.hexbinder.json
Fixes:
1. Sites missing ownerId
2. Rebuild all malformed factions with correct schema
3. Regenerate notices with Obojima NPC/faction names
4. Regenerate rumors with Obojima NPC names and hook content
5. Fix lore secrets referencing old site IDs
6. Update lore text + sensory impressions for Obojima themes
7. Validate all cross-references
"""

import json
import random
import string

def gen_id(prefix):
    chars = string.ascii_letters + string.digits + "_-"
    return f"{prefix}-{''.join(random.choices(chars, k=8))}"

# Load data
with open("obojima_final.hexbinder.json") as f:
    data = json.load(f)

# ========================================
# Build lookup maps
# ========================================
npc_map = {n["id"]: n for n in data["npcs"]}
hook_map = {h["id"]: h for h in data["hooks"]}
location_map = {l["id"]: l for l in data["locations"]}

settlements = [l for l in data["locations"] if l["type"] == "settlement"]
dungeons = [l for l in data["locations"] if l["type"] == "dungeon"]

settlement_ids = [s["id"] for s in settlements]
dungeon_ids = [d["id"] for d in dungeons]

# ========================================
# FIX 0: Fix invalid NPC archetypes
# ========================================
print("FIX 0: Fixing invalid NPC archetypes...")
VALID_ARCHETYPES = {"commoner", "bandit", "guard", "knight", "assassin", "priest", "thief", "cultist", "witch", "noble", "merchant", "scholar"}
ARCHETYPE_MAP = {
    "artisan": "commoner",
    "sage": "scholar",
    "guardian": "guard",
    "scout": "thief",
    "trickster": "thief",
    "healer": "priest",
    "villain": "assassin",
    "warrior": "knight",
}
fixed_arch = 0
for npc in data["npcs"]:
    arch = npc.get("archetype", "")
    if arch not in VALID_ARCHETYPES:
        new_arch = ARCHETYPE_MAP.get(arch, "commoner")
        npc["archetype"] = new_arch
        fixed_arch += 1
print(f"  Fixed {fixed_arch} NPC archetypes")

# ========================================
# FIX 1: Add ownerId to all sites
# ========================================
print("FIX 1: Adding ownerId to sites...")
for settlement in settlements:
    npc_ids = settlement.get("npcIds", [])
    for i, site in enumerate(settlement.get("sites", [])):
        if "ownerId" not in site or not site["ownerId"]:
            if npc_ids:
                site["ownerId"] = npc_ids[i % len(npc_ids)]
                print(f"  {settlement['name']}/{site['name']} → {npc_map.get(site['ownerId'], {}).get('name', '?')}")
            else:
                site["ownerId"] = data["npcs"][0]["id"]

# ========================================
# FIX 2: Rebuild ALL factions with correct schema
# ========================================
print("\nFIX 2: Rebuilding factions with correct schema...")

# Keep only the 2 properly-structured factions
good_factions = [f for f in data["factions"] if f["name"] in ("Fish Head Coven", "Domain of the Lionfish King")]
good_faction_ids = {f["id"] for f in good_factions}

# Template for proper faction structure
def make_faction(fid, name, desc, archetype, ftype, purpose, scale,
                 lair_hex, lair_dungeon, hq_id, advantages, agenda,
                 obstacle, methods, resources, leader_arch, member_arch,
                 symbols, territory_ids=None, influence_ids=None):
    return {
        "id": fid,
        "name": name,
        "description": desc,
        "archetype": archetype,
        "factionType": ftype,
        "purpose": purpose,
        "lair": {
            "hexCoord": lair_hex,
            "dungeonId": lair_dungeon
        } if lair_dungeon else None,
        "scale": scale,
        "advantages": advantages,
        "agenda": agenda,
        "obstacle": {"type": "rival_faction", "description": obstacle},
        "goals": [{"description": agenda[0]["description"], "progress": 0}] if agenda else [],
        "methods": methods,
        "resources": resources,
        "relationships": [],
        "headquartersId": hq_id,
        "territoryIds": territory_ids or [],
        "influenceIds": influence_ids or [],
        "recruitmentHookIds": [],
        "goalRumorIds": [],
        "leaderArchetype": leader_arch,
        "memberArchetype": member_arch,
        "symbols": symbols,
        "rumors": [],
        "status": "active"
    }

# Settlement name → ID mapping
sname_to_id = {s["name"]: s["id"] for s in settlements}
dname_to_id = {d["name"]: d["id"] for d in dungeons}

new_factions = [
    make_faction(
        "faction-MarGuild", "Mariners' Guild",
        "The seafaring guild controlling shipping and trade routes around Obojima. Based primarily in Tidewater.",
        "mercantile", "guild", "controlling maritime trade", "regional",
        {"q": 3, "r": -2}, None, sname_to_id.get("Tidewater"),
        [
            {"type": "resources", "name": "Fleet of trading vessels", "description": "A dozen ships from fishing boats to cargo vessels"},
            {"type": "knowledge", "name": "Navigational charts", "description": "Generations of accumulated knowledge of Obojima's waters"}
        ],
        [
            {"id": "goal-mg1", "order": 1, "description": "Expand trade routes to the outer islands"},
            {"id": "goal-mg2", "order": 2, "description": "Map the dangerous waters of the Shallows"},
            {"id": "goal-mg3", "order": 3, "description": "Drive out Lionfish King's forces from shipping lanes"}
        ],
        "Lionfish King's forces threaten shipping lanes",
        ["Trade negotiations", "Naval patrols", "Harbor dues"],
        ["Ships", "Trade goods", "Navigational expertise"],
        "merchant", "commoner", ["Anchor and compass rose"],
        territory_ids=[sname_to_id.get("Tidewater", "")],
        influence_ids=[sname_to_id.get("Uluwa", ""), sname_to_id.get("Polewater Village", "")]
    ),
    make_faction(
        "faction-CourBrig", "Courier Brigade",
        "Swift messengers maintaining communication across Obojima's difficult terrain using trained flying creatures and athletic runners.",
        "professional", "guild", "maintaining island communications", "regional",
        {"q": 1, "r": -1}, None, sname_to_id.get("Yatamon"),
        [
            {"type": "territory", "name": "Network of relay stations", "description": "Rest points across every region of Obojima"},
            {"type": "resources", "name": "Trained messenger animals", "description": "Birds and small creatures trained to carry messages"}
        ],
        [
            {"id": "goal-cb1", "order": 1, "description": "Establish a relay station on Mount Arbora's peak"},
            {"id": "goal-cb2", "order": 2, "description": "Breed faster messenger birds"},
            {"id": "goal-cb3", "order": 3, "description": "Secure routes through the Gale Fields"}
        ],
        "Gale Fields storms frequently ground their messengers",
        ["Swift delivery", "Coded messages", "Animal training"],
        ["Messenger birds", "Relay stations", "Runners"],
        "noble", "commoner", ["Winged boot"],
        influence_ids=[s["id"] for s in settlements]  # present everywhere
    ),
    make_faction(
        "faction-AHA", "AHA (Archaeologists, Historians & Archivists)",
        "A well-meaning organization that coordinates adventuring parties and ensures ethical guidelines. Based in Yatamon, providing contracts, mediation, and rescue services.",
        "scholarly", "guild", "coordinating adventurers ethically", "regional",
        {"q": 1, "r": -1}, dname_to_id.get("AHA HQ"), sname_to_id.get("Yatamon"),
        [
            {"type": "knowledge", "name": "Adventurer registry", "description": "Comprehensive records of active adventuring parties"},
            {"type": "resources", "name": "Rescue teams", "description": "Trained groups ready to extract failed expeditions"}
        ],
        [
            {"id": "goal-aha1", "order": 1, "description": "Establish an adventurer code of conduct across Obojima"},
            {"id": "goal-aha2", "order": 2, "description": "Build a proper headquarters in Yatamon"},
            {"id": "goal-aha3", "order": 3, "description": "Create a comprehensive map of Obojima's dungeons"}
        ],
        "Many adventurers resist regulation and oversight",
        ["Bureaucracy", "Rescue missions", "Contract mediation"],
        ["Adventurer contacts", "Rescue equipment", "Contracts"],
        "scholar", "commoner", ["Open book with compass"],
        territory_ids=[sname_to_id.get("Yatamon", "")],
        influence_ids=[sname_to_id.get("Toggle", ""), sname_to_id.get("Tidewater", "")]
    ),
    make_faction(
        "faction-PatchRobe", "Patchwork Robe Coven",
        "A coven of witches and hedge wizards practicing folk magic and herbal medicine. Generally helpful to common folk but suspicious of formal magical institutions.",
        "arcane", "cult", "preserving folk magic traditions", "local",
        {"q": -2, "r": 1}, None, None,
        [
            {"type": "knowledge", "name": "Herbal knowledge", "description": "Vast knowledge of Obojima's medicinal plants"},
            {"type": "popular_support", "name": "Folk trust", "description": "Common people trust them more than formal wizards"}
        ],
        [
            {"id": "goal-prc1", "order": 1, "description": "Protect sacred groves from exploitation"},
            {"id": "goal-prc2", "order": 2, "description": "Preserve ancient herbal knowledge"},
            {"id": "goal-prc3", "order": 3, "description": "Counter Cloud Cap Coven's magical regulations"}
        ],
        "Cloud Cap Coven considers them reckless amateurs",
        ["Herbalism", "Folk rituals", "Healing"],
        ["Herb gardens", "Folk remedies", "Ritual sites"],
        "witch", "commoner", ["Patchwork robe pattern"],
        influence_ids=[sname_to_id.get("Matango Village", ""), sname_to_id.get("Okiri Village", ""), sname_to_id.get("Polewater Village", "")]
    ),
    make_faction(
        "faction-CloudCap", "Cloud Cap Coven",
        "An elite circle of powerful spellcasters studying arcane winds atop Mount Arbora. They consider themselves the true magical authority of Obojima.",
        "arcane", "guild", "controlling arcane knowledge", "regional",
        {"q": -1, "r": -1}, None, None,
        [
            {"type": "knowledge", "name": "Arcane library", "description": "Vast collection of magical texts and scrolls"},
            {"type": "territory", "name": "Mountain fortress", "description": "Nearly impregnable tower atop Mount Arbora"}
        ],
        [
            {"id": "goal-cc1", "order": 1, "description": "Harness the arcane storms of the Gale Fields"},
            {"id": "goal-cc2", "order": 2, "description": "Establish magical regulation across Obojima"},
            {"id": "goal-cc3", "order": 3, "description": "Uncover the source of the Brackwater corruption"}
        ],
        "The storms they study are growing more unpredictable",
        ["Arcane research", "Political influence", "Weather manipulation"],
        ["Arcane library", "Magical artifacts", "Weather observation"],
        "witch", "scholar", ["Cloud within a circle"],
        influence_ids=[sname_to_id.get("Yatamon", ""), sname_to_id.get("Toggle", "")]
    ),
    make_faction(
        "faction-Crowsworn", "The Crowsworn",
        "A secretive order of rangers and scouts patrolling the wilds of Obojima, protecting travelers and monitoring threats. Named for the crows they use as scouts.",
        "military", "order", "protecting Obojima's wilderness", "regional",
        {"q": 2, "r": -1}, None, None,
        [
            {"type": "knowledge", "name": "Wilderness expertise", "description": "Unmatched knowledge of Obojima's wild places"},
            {"type": "resources", "name": "Crow network", "description": "Trained crows serving as scouts and early warning system"}
        ],
        [
            {"id": "goal-cw1", "order": 1, "description": "Map and contain the corruption spreading from Brackwater"},
            {"id": "goal-cw2", "order": 2, "description": "Establish a permanent watch post near Corrupted Coastline"},
            {"id": "goal-cw3", "order": 3, "description": "Train new rangers to replace aging members"}
        ],
        "The corruption is spreading faster than they can contain it",
        ["Wilderness patrol", "Beast tracking", "Ambush tactics"],
        ["Trained crows", "Wilderness shelters", "Survival gear"],
        "knight", "guard", ["Black crow silhouette"],
        influence_ids=[sname_to_id.get("Hogstone Hot Springs", ""), sname_to_id.get("Okiri Village", "")]
    ),
    make_faction(
        "faction-GildGourd", "League of the Gilded Gourd",
        "A merchant consortium controlling much of the inland trade on Obojima. They prize profit above all and are known for shrewd business practices.",
        "mercantile", "guild", "monopolizing inland trade", "regional",
        {"q": 1, "r": -1}, None, sname_to_id.get("Yatamon"),
        [
            {"type": "resources", "name": "Trade caravans", "description": "Well-guarded merchant caravans connecting inland settlements"},
            {"type": "resources", "name": "Wealth reserves", "description": "Significant gold reserves and credit networks"}
        ],
        [
            {"id": "goal-lg1", "order": 1, "description": "Monopolize the hot springs mineral trade"},
            {"id": "goal-lg2", "order": 2, "description": "Establish exclusive trade agreements with all settlements"},
            {"id": "goal-lg3", "order": 3, "description": "Undercut the Mariners' Guild's influence in Tidewater"}
        ],
        "Mariners' Guild controls the more lucrative sea trade",
        ["Trade manipulation", "Bribery", "Contract law"],
        ["Gold reserves", "Trade caravans", "Warehouses"],
        "merchant", "commoner", ["Golden gourd"],
        territory_ids=[sname_to_id.get("Yatamon", "")],
        influence_ids=[sname_to_id.get("Toggle", ""), sname_to_id.get("Hogstone Hot Springs", ""), sname_to_id.get("Uluwa", "")]
    ),
    make_faction(
        "faction-TallHats", "The Tall Hats",
        "A mysterious cabal of judges and arbiters settling disputes across Obojima. They wear distinctive tall hats and are respected and feared for their impartial but severe judgments.",
        "political", "order", "establishing unified law", "regional",
        {"q": 1, "r": -1}, None, sname_to_id.get("Yatamon"),
        [
            {"type": "political", "name": "Legal authority", "description": "Widely recognized right to arbitrate disputes"},
            {"type": "knowledge", "name": "Information network", "description": "Extensive records of contracts, crimes, and disputes"}
        ],
        [
            {"id": "goal-th1", "order": 1, "description": "Codify a unified law for all of Obojima"},
            {"id": "goal-th2", "order": 2, "description": "Investigate corruption in Yatamon's governance"},
            {"id": "goal-th3", "order": 3, "description": "Extend judicial authority to the frontier settlements"}
        ],
        "Settlements resist giving up their local legal autonomy",
        ["Legal proceedings", "Investigation", "Formal decree"],
        ["Legal archives", "Enforcers", "Courthouse"],
        "noble", "guard", ["Tall black hat"],
        territory_ids=[sname_to_id.get("Yatamon", "")],
        influence_ids=[sname_to_id.get("Tidewater", ""), sname_to_id.get("Toggle", "")]
    ),
    make_faction(
        "faction-SYS", "Society of Young Stewards",
        "An idealistic organization of young leaders training to govern and protect Obojima. They believe in civic duty and work to improve infrastructure and public services.",
        "political", "guild", "improving public infrastructure", "regional",
        {"q": -3, "r": 0}, None, sname_to_id.get("Okiri Village"),
        [
            {"type": "popular_support", "name": "Youthful energy", "description": "Dedicated young members willing to work hard"},
            {"type": "popular_support", "name": "Popular support", "description": "Common folk appreciate their public works projects"}
        ],
        [
            {"id": "goal-sys1", "order": 1, "description": "Build a bridge connecting Okiri to the northern road"},
            {"id": "goal-sys2", "order": 2, "description": "Establish a public school in every settlement"},
            {"id": "goal-sys3", "order": 3, "description": "Create a disaster response system for storms and floods"}
        ],
        "Older factions see them as naive and resist their reforms",
        ["Public works", "Community organizing", "Education"],
        ["Volunteer workers", "Public goodwill", "Small treasury"],
        "noble", "commoner", ["Rising sun over a bridge"],
        influence_ids=[sname_to_id.get("Okiri Village", ""), sname_to_id.get("Polewater Village", ""), sname_to_id.get("Matango Village", "")]
    ),
    make_faction(
        "faction-FourSword", "The Four Sword Schools",
        "Four competing martial arts academies teaching different combat styles. While rivals, they share a common code of honor and occasionally unite against external threats.",
        "military", "guild", "training the finest warriors", "regional",
        {"q": 2, "r": 0}, None, sname_to_id.get("Toggle"),
        [
            {"type": "military", "name": "Martial expertise", "description": "The finest warriors on Obojima"},
            {"type": "territory", "name": "Training grounds", "description": "Well-equipped dojos and training facilities"}
        ],
        [
            {"id": "goal-fs1", "order": 1, "description": "Host the Grand Tournament to prove the supreme style"},
            {"id": "goal-fs2", "order": 2, "description": "Train warriors to defend against the growing corruption"},
            {"id": "goal-fs3", "order": 3, "description": "Establish a warrior code all schools can agree on"}
        ],
        "Internal rivalry prevents unified action against real threats",
        ["Martial training", "Dueling", "Honor challenges"],
        ["Trained fighters", "Weapons", "Dojos"],
        "knight", "guard", ["Four crossed swords"],
        territory_ids=[sname_to_id.get("Toggle", "")],
        influence_ids=[sname_to_id.get("Yatamon", "")]
    ),
]

# Filter out empty string IDs from territory/influence
for f in new_factions:
    f["territoryIds"] = [tid for tid in f["territoryIds"] if tid]
    f["influenceIds"] = [iid for iid in f["influenceIds"] if iid]

# Replace all factions
data["factions"] = good_factions + new_factions

# Ensure all agenda items have required fields (status, addressesObstacle)
for f in data["factions"]:
    for i, goal in enumerate(f.get("agenda", [])):
        if "status" not in goal or not goal["status"]:
            goal["status"] = "in_progress" if i == 0 else "pending"
        if "addressesObstacle" not in goal:
            goal["addressesObstacle"] = False

print(f"  Rebuilt {len(new_factions)} factions, kept {len(good_factions)} original")
for f in data["factions"]:
    print(f"    {f['name']}: territory={len(f['territoryIds'])}, influence={len(f['influenceIds'])}")

# Rebuild faction map
faction_map = {f["id"]: f for f in data["factions"]}
all_faction_ids = list(faction_map.keys())
all_faction_names = [f["name"] for f in data["factions"]]
faction_name_to_id = {f["name"]: f["id"] for f in data["factions"]}

# ========================================
# FIX 2b: Rebuild clocks for all factions
# ========================================
print("\nFIX 2b: Rebuilding clocks...")
# Keep clocks whose ownerId references a valid faction, OR have no ownerId (world clocks)
valid_clocks = []
for c in data.get("clocks", []):
    owner = c.get("ownerId") or c.get("factionId")
    if owner and owner in faction_map:
        # Ensure correct schema fields exist
        if "ownerId" not in c and "factionId" in c:
            c["ownerId"] = c.pop("factionId")
        c.setdefault("ownerType", "faction")
        c.setdefault("trigger", {"type": "event", "events": ["faction_action"]})
        c.setdefault("consequences", [{"description": "The faction advances its agenda", "type": "event"}])
        c.setdefault("visible", True)
        c.setdefault("paused", False)
        # Remove non-schema fields
        c.pop("type", None)
        c.pop("active", None)
        c.pop("factionId", None)
        valid_clocks.append(c)
    elif not owner:
        # World-level clock, keep it
        c.setdefault("ownerType", "world")
        c.setdefault("trigger", {"type": "manual"})
        c.setdefault("consequences", [])
        c.setdefault("visible", True)
        c.setdefault("paused", False)
        valid_clocks.append(c)

existing_clock_owners = {c.get("ownerId") for c in valid_clocks if c.get("ownerId")}

for faction in data["factions"]:
    if faction["id"] not in existing_clock_owners:
        goal_desc = faction["agenda"][0]["description"] if faction.get("agenda") else "advance their agenda"
        clock = {
            "id": gen_id("clock"),
            "name": f"{faction['name']}'s Ambition",
            "description": f"{faction['name']} is working to {goal_desc.lower()}",
            "segments": 6,
            "filled": 0,
            "ownerId": faction["id"],
            "ownerType": "faction",
            "trigger": {"type": "event", "events": ["faction_action"]},
            "consequences": [{"description": f"{faction['name']} advances its agenda significantly", "type": "event"}],
            "visible": True,
            "paused": False
        }
        valid_clocks.append(clock)
        print(f"  Added clock: {clock['name']}")

data["clocks"] = valid_clocks

# ========================================
# FIX 3: Set up faction relationships
# ========================================
print("\nFIX 3: Setting up faction relationships...")

relationships = {
    "Mariners' Guild": {"hostile": ["Domain of the Lionfish King"], "rival": ["League of the Gilded Gourd"], "allied": ["Courier Brigade"]},
    "Courier Brigade": {"allied": ["Mariners' Guild", "AHA (Archaeologists, Historians & Archivists)"]},
    "AHA (Archaeologists, Historians & Archivists)": {"allied": ["Courier Brigade", "Society of Young Stewards"]},
    "Fish Head Coven": {"hostile": ["Cloud Cap Coven"], "allied": ["Patchwork Robe Coven"]},
    "Patchwork Robe Coven": {"rival": ["Cloud Cap Coven"], "allied": ["Fish Head Coven"]},
    "Cloud Cap Coven": {"rival": ["Patchwork Robe Coven", "Fish Head Coven"], "allied": ["The Tall Hats"]},
    "The Crowsworn": {"allied": ["Society of Young Stewards", "Courier Brigade"]},
    "League of the Gilded Gourd": {"rival": ["Mariners' Guild"], "allied": ["The Tall Hats"]},
    "The Tall Hats": {"allied": ["Cloud Cap Coven", "League of the Gilded Gourd"]},
    "Society of Young Stewards": {"rival": ["League of the Gilded Gourd"], "allied": ["The Crowsworn", "AHA (Archaeologists, Historians & Archivists)"]},
    "Domain of the Lionfish King": {"hostile": ["Mariners' Guild", "The Four Sword Schools"], "allied": ["Fish Head Coven"]},
    "The Four Sword Schools": {"hostile": ["Domain of the Lionfish King"], "allied": ["The Crowsworn"]},
}

for faction in data["factions"]:
    rels = relationships.get(faction["name"], {})
    faction["relationships"] = []
    for rel_type, names in rels.items():
        for name in names:
            fid = faction_name_to_id.get(name)
            if fid:
                faction["relationships"].append({
                    "factionId": fid,
                    "type": rel_type,
                    "reason": f"{'Ancient enmity' if rel_type == 'hostile' else 'Competing interests' if rel_type == 'rival' else 'Shared goals'}"
                })

# ========================================
# FIX 4: Regenerate notices
# ========================================
print("\nFIX 4: Regenerating notices...")

notice_templates_request = [
    "INFORMATION WANTED: Reports needed regarding strange activity in {region}. Rewards for credible leads. Contact {faction}.",
    "SKILLED HELP NEEDED: {faction} seeks specialists for work in {region}. Generous compensation guaranteed.",
    "ADVENTURERS WANTED: {faction} seeks capable individuals for an important task. Inquire at {site}.",
    "BOUNTY POSTED: {faction} offers {reward} for information about threats in {region}.",
    "NOTICE: {faction} requests volunteers for community protection efforts. See representatives at {site}.",
]

notice_templates_job = [
    "{npc} needs help clearing creatures from their {place}",
    "{npc} seeks a guide through the {region}",
    "{npc} requires an escort to {destination}",
    "{npc} is looking for someone to deliver a package to {destination}",
    "{npc} has lost something valuable in the {region} and needs help finding it",
    "{npc} suspects someone of theft and needs a discreet investigation",
    "{npc} needs safe passage through dangerous territory",
    "{npc} is offering work at {site} — inquire within",
    "{npc} seeks adventurers for a salvage expedition",
    "{npc} has a pest problem and needs capable exterminators",
]

regions = ["Gift of Shuritashi", "Land of Hot Water", "Mount Arbora", "Gale Fields",
           "Brackwater Wetlands", "Coastal Highlands", "The Shallows"]
places = ["rice paddies", "mushroom grove", "hot springs", "fishing grounds", "herb garden",
          "coral reef", "mountain trail", "bamboo forest", "volcanic cave", "tide pools"]
destinations = ["Okiri", "Matango", "Tidewater", "Yatamon", "Uluwa", "Toggle",
                "Hogstone Hot Springs", "Polewater Village"]

for settlement in settlements:
    npc_ids = settlement.get("npcIds", [])
    settlement_sites = settlement.get("sites", [])
    new_notices = []

    # Faction notices (3-5)
    for i in range(random.randint(3, 5)):
        faction_name = random.choice(all_faction_names)
        region = random.choice(regions)
        site_name = settlement_sites[0]["name"] if settlement_sites else settlement["name"]
        reward = f"{random.randint(20, 150)} gp"
        template = random.choice(notice_templates_request)
        desc = template.format(faction=faction_name, region=region, site=site_name, reward=reward)
        new_notices.append({
            "id": gen_id("notice"),
            "title": desc.split(":")[0] if ":" in desc else "NOTICE",
            "description": desc,
            "noticeType": "request",
            "reward": reward
        })

    # NPC job notices (5-8)
    for i in range(random.randint(5, 8)):
        npc_name = npc_map.get(random.choice(npc_ids), {}).get("name", "A local resident") if npc_ids else "A local resident"
        region = random.choice(regions)
        dest = random.choice([d for d in destinations if d != settlement["name"]])
        place = random.choice(places)
        site_name = settlement_sites[0]["name"] if settlement_sites else settlement["name"]
        template = random.choice(notice_templates_job)
        desc = template.format(npc=npc_name, region=region, destination=dest, place=place, site=site_name)
        new_notices.append({
            "id": gen_id("notice"),
            "title": desc[:50] + ("..." if len(desc) > 50 else ""),
            "description": desc,
            "noticeType": "job",
            "reward": f"{random.randint(10, 80)} gp"
        })

    settlement["notices"] = new_notices
    print(f"  {settlement['name']}: {len(new_notices)} notices")

# ========================================
# FIX 5: Regenerate rumors
# ========================================
print("\nFIX 5: Regenerating rumors...")

rumor_templates = [
    "They say {npc} has been acting strangely lately",
    "Word around {settlement} is that {npc} knows more than they let on",
    "{npc} was seen heading toward {region} late at night",
    "Some folk say the {faction} are planning something big",
    "I heard {faction} members whispering about {region}",
    "The waters near {region} have been unusually rough lately",
    "Strange lights were seen over {region} last night",
    "A merchant from {dest} says things are getting worse out there",
    "The {faction} offered {npc} a deal, but nobody knows the details",
    "{npc} claims to have found something valuable near {region}",
    "Travelers report unusual creatures in the {region}",
    "The hot springs near {settlement} have been bubbling differently",
    "A nakudama elder warned that the old spirits are stirring",
    "Fishing boats have been coming back empty from the Shallows",
    "Someone carved strange symbols on the shrine near {region}",
]

for settlement in settlements:
    npc_ids = settlement.get("npcIds", [])
    new_rumors = []

    # Hook-linked rumors
    linked_hooks = [h for h in data["hooks"] if settlement["id"] in h.get("involvedLocationIds", [])]
    for hook in linked_hooks[:5]:
        new_rumors.append({
            "id": gen_id("rumor"),
            "text": hook.get("rumor", "Something strange is happening"),
            "isTrue": True,
            "source": random.choice(["tavern talk", "market gossip", "traveler's tale", "overheard conversation"]),
            "linkedHookId": hook["id"],
            "targetLocationId": hook.get("targetLocationId")
        })

    # General rumors
    for i in range(max(3, 8 - len(new_rumors))):
        npc_name = npc_map.get(random.choice(npc_ids), {}).get("name", "someone") if npc_ids else "someone"
        template = random.choice(rumor_templates)
        text = template.format(
            npc=npc_name, faction=random.choice(all_faction_names),
            region=random.choice(regions), settlement=settlement["name"],
            dest=random.choice(destinations)
        )
        new_rumors.append({
            "id": gen_id("rumor"),
            "text": text,
            "isTrue": random.choice([True, True, False]),
            "source": random.choice(["tavern talk", "market gossip", "traveler's tale", "overheard conversation", "drunken rambling"]),
            "linkedHookId": None,
            "targetLocationId": None
        })

    settlement["rumors"] = new_rumors
    print(f"  {settlement['name']}: {len(new_rumors)} rumors")

# ========================================
# FIX 6: Fix lore secrets
# ========================================
print("\nFIX 6: Fixing lore secrets...")

settlement_site_ids = {s["id"]: [site["id"] for site in s.get("sites", [])] for s in settlements}

obojima_secrets = [
    ("The {site} owner secretly communes with ocean spirits during the new moon", "major"),
    ("Ancient nakudama artifacts are hidden beneath {site}", "major"),
    ("The settlement's water source is slowly being corrupted by brackwater runoff", "major"),
    ("A member of the {faction} is secretly working against the group from within", "major"),
    ("{npc} discovered a map to a pre-human ruin but hasn't told anyone", "minor"),
    ("The local shrine keeper has been receiving visions of a great storm", "minor"),
    ("Smugglers use the back room of {site} to move goods after dark", "minor"),
    ("A dara sage living nearby has been observing the settlement for months", "minor"),
    ("The fish supply has been dwindling because of Lionfish King's expanding territory", "minor"),
    ("An old spirit trapped in a local shrine grants wishes — for a price", "major"),
    ("{npc} is actually a former member of the {faction} in hiding", "major"),
    ("The settlement was built on top of an ancient spirit's resting place", "major"),
]

for settlement in settlements:
    site_ids = settlement_site_ids.get(settlement["id"], [])
    npc_ids = settlement.get("npcIds", [])
    if "lore" not in settlement:
        settlement["lore"] = {"history": {"founding": "", "founderType": "refugees", "age": "established", "majorEvents": []}, "secrets": []}

    new_secrets = []
    for template, severity in random.sample(obojima_secrets, min(3, len(obojima_secrets))):
        involved_sites, involved_npcs = [], []
        site_name = "the local establishment"
        if site_ids:
            chosen_site = random.choice(site_ids)
            site_obj = next((s for s in settlement["sites"] if s["id"] == chosen_site), None)
            if site_obj: site_name = site_obj["name"]
            involved_sites = [chosen_site]
        npc_name = "a local resident"
        if npc_ids:
            chosen_npc = random.choice(npc_ids)
            npc_name = npc_map.get(chosen_npc, {}).get("name", "a local resident")
            involved_npcs = [chosen_npc]
        faction_name = random.choice(all_faction_names)
        new_secrets.append({
            "id": gen_id("secret"),
            "text": template.format(site=site_name, npc=npc_name, faction=faction_name),
            "severity": severity,
            "discovered": False,
            "involvedSiteIds": involved_sites,
            "involvedNpcIds": involved_npcs
        })
    settlement["lore"]["secrets"] = new_secrets
    print(f"  {settlement['name']}: {len(new_secrets)} secrets")

# ========================================
# FIX 6b: Update lore history
# ========================================
print("\nFIX 6b: Updating lore history...")
settlement_histories = {
    "Polewater Village": {
        "founding": "Grew from a small fishing camp at the edge of the Brackwater Wetlands, built by nakudama settlers who understood the swamp's moods",
        "founderType": "refugees",
        "age": "established",
        "majorEvents": [
            "A great flood destroyed the original ground-level buildings, forcing reconstruction on stilts",
            "The Corruption began seeping in from the eastern coastline",
            "Discovery of a sunken shrine beneath the deepest channel"
        ]
    },
    "Okiri Village": {
        "founding": "Founded by pastoral farmers who first cultivated the rich volcanic soil of the Gift of Shuritashi",
        "founderType": "refugees",
        "age": "old",
        "majorEvents": [
            "The bamboo grove sacred to village shamans survived a great wildfire unscathed",
            "First contact with the Kaiju Preservation Society researchers",
            "A territorial dispute with the Corruption forced new protective wards"
        ]
    },
    "Matango Village": {
        "founding": "Grew up around the great mushroom groves of the lowland forests, cultivating exotic fungi beneath centuries-old Porcini trees",
        "founderType": "refugees",
        "age": "established",
        "majorEvents": [
            "Discovery of the mycelial communication network connecting groves across the island",
            "The Great Blight nearly destroyed the elder mushroom groves",
            "Rokoko the great mushroom spirit first spoke through the network"
        ]
    },
    "Uluwa": {
        "founding": "Began as a floating market where coastal traders met inland merchants, growing as boats became permanent structures",
        "founderType": "merchant_guild",
        "age": "established",
        "majorEvents": [
            "A massive storm scattered the floating market, which reformed in a new configuration",
            "The Mariners' Guild established a permanent trade route through the village",
            "Discovery of hot springs beneath the floating platforms"
        ]
    },
    "Yatamon": {
        "founding": "Originally a fortress built during the ancient wars, grown into the island's de facto capital of trade, politics, and adventure",
        "founderType": "military_outpost",
        "age": "old",
        "majorEvents": [
            "The AHA established its headquarters in the old fortress district",
            "The Four Sword Schools held their first Grand Tournament",
            "A kaiju attack on the outer walls was repelled by combined faction effort"
        ]
    },
    "Toggle": {
        "founding": "Founded by smiths and craftspeople who discovered rich mineral deposits in the Coastal Highlands",
        "founderType": "adventurers",
        "age": "established",
        "majorEvents": [
            "The Four Sword Schools formalized their martial traditions",
            "Discovery of a rare ore vein that produces weapons of exceptional quality",
            "The Lionfish King's raiders attacked the harbor but were driven back"
        ]
    },
    "Tidewater": {
        "founding": "Built on terraced cliffs overlooking a natural harbor, connecting Obojima to the outside world through trade",
        "founderType": "merchant_guild",
        "age": "old",
        "majorEvents": [
            "The Mariners' Guild established Tidewater as the primary port of entry",
            "A pirate blockade was broken by a combined fleet of island factions",
            "Construction of the clifftop lighthouse that guides ships through the reefs"
        ]
    },
    "Hogstone Hot Springs": {
        "founding": "Grew around therapeutic volcanic hot springs in the Land of Hot Water, known for their healing properties",
        "founderType": "religious_order",
        "age": "ancient",
        "majorEvents": [
            "The springs changed color for a full season after a deep volcanic tremor",
            "Chisuay discovered that the hogstones contain memories of the volcano",
            "A pilgrimage tradition was established drawing visitors from across Obojima"
        ]
    },
}
for settlement in settlements:
    history = settlement_histories.get(settlement["name"])
    if history:
        settlement["lore"]["history"] = history
    else:
        # Ensure any existing string history is converted to proper structure
        existing = settlement["lore"].get("history")
        if isinstance(existing, str):
            settlement["lore"]["history"] = {
                "founding": existing[:200] if existing else "Founded by early settlers",
                "founderType": "refugees",
                "age": "established",
                "majorEvents": []
            }
    # Remove any invalid 'legends' key (not part of SettlementLore schema)
    settlement["lore"].pop("legends", None)

# ========================================
# FIX 7: Update sensory impressions
# ========================================
print("\nFIX 7: Updating sensory impressions...")
settlement_sensory = {
    "Polewater Village": [
        "Stilted buildings rising from murky water, firefly lanterns swaying in the humid breeze",
        "Croaking frogs and buzzing insects over the creak of wooden walkways",
        "Rich mud, cooking eel, and flowering water lilies on damp air"
    ],
    "Okiri Village": [
        "Terraced rice paddies gleaming in sunlight, thatched-roof homes with spirit shrines",
        "Birdsong, rustling bamboo, and temple bells drifting from the village square",
        "Fresh rice, incense from the shrine, and blooming tropical flowers"
    ],
    "Matango Village": [
        "Enormous mushroom caps serving as rooftops, bioluminescent fungi lighting pathways",
        "Soft popping of mushroom caps, dripping moisture, and quiet conversation",
        "Rich earthy fungi, damp moss, and brewing mushroom tea"
    ],
    "Uluwa": [
        "Colorful boats lashed together forming streets, market stalls on floating platforms",
        "Haggling merchants, splashing water, creaking boats, and strumming instruments",
        "Grilled fish, sea salt, exotic spices, and fresh tropical fruit"
    ],
    "Yatamon": [
        "Multi-story buildings with curved roofs, busy market streets, sword school dojos",
        "Bustling crowds, clanging metal from workshops, training martial artists",
        "Street food vendors, incense, forge smoke, ramen broth, and sake"
    ],
    "Toggle": [
        "Glowing forges, martial artists training in open courtyards, weapon displays",
        "Hammer on anvil, training shouts and kiai, crackling forge fires",
        "Hot metal, charcoal, sweat, and mountain air"
    ],
    "Tidewater": [
        "Terraced cliffs with colorful buildings, a busy harbor full of ships",
        "Crashing waves, seagull cries, ship bells, and dockworkers shouting",
        "Salt air, fresh catch, tar and pitch, and tropical flowers"
    ],
    "Hogstone Hot Springs": [
        "Steam rising from mineral pools, smooth stone paths between springs",
        "Bubbling water, steam hissing, wind chimes, and quiet birdsong",
        "Mineral-rich steam, sulfur, herbal bath oils, and green tea"
    ],
}
for settlement in settlements:
    sensory = settlement_sensory.get(settlement["name"])
    if sensory:
        settlement["sensoryImpressions"] = sensory

# ========================================
# FIX 8: Assign NPCs to factions
# ========================================
print("\nFIX 8: Assigning NPCs to factions...")
faction_role_mapping = {
    "Mariners' Guild": ["sailor", "fisherman", "navigator", "captain", "trader"],
    "Courier Brigade": ["courier", "messenger", "runner", "scout"],
    "AHA (Archaeologists, Historians & Archivists)": ["adventurer", "healer", "coordinator", "archivist"],
    "Patchwork Robe Coven": ["herbalist", "healer", "witch"],
    "Cloud Cap Coven": ["wizard", "scholar", "mage"],
    "The Crowsworn": ["ranger", "scout", "tracker", "patrol"],
    "League of the Gilded Gourd": ["merchant", "trader", "broker"],
    "The Tall Hats": ["judge", "arbiter", "lawyer"],
    "Society of Young Stewards": ["steward", "civic worker", "builder"],
    "The Four Sword Schools": ["swordsman", "warrior", "fighter", "martial artist", "sensei"],
    "Fish Head Coven": ["witch", "shaman"],
    "Domain of the Lionfish King": [],
}

# Clear existing npcIds, then rebuild
for faction in data["factions"]:
    if "npcIds" not in faction:
        faction["npcIds"] = []

for npc in data["npcs"]:
    role = npc.get("role", "").lower()
    for fname, roles in faction_role_mapping.items():
        if any(r in role for r in roles):
            fid = faction_name_to_id.get(fname)
            if fid and npc["id"] not in faction_map[fid].get("npcIds", []):
                faction_map[fid].setdefault("npcIds", []).append(npc["id"])
                npc["factionId"] = fid
            break

for f in data["factions"]:
    print(f"  {f['name']}: {len(f.get('npcIds', []))} NPCs")

# ========================================
# FIX 9: Update calendar events
# ========================================
print("\nFIX 9: Updating calendar events...")
if "state" in data and "calendar" in data["state"]:
    calendar = data["state"]["calendar"]
    days = calendar if isinstance(calendar, list) else calendar.get("days", [])
    for day in days:
        for event in day.get("events", []):
            for key in ["factionId", "linkedFactionId"]:
                if key in event and event[key] and event[key] not in faction_map:
                    event[key] = random.choice(all_faction_ids)
            for key in ["locationId", "linkedLocationId"]:
                if key in event and event[key] and event[key] not in location_map:
                    event[key] = random.choice(list(location_map.keys()))

# ========================================
# FIX 10: Check significant items
# ========================================
print("\nFIX 10: Checking significant items...")
for item in data.get("significantItems", []):
    if "locationId" in item and item["locationId"] and item["locationId"] not in location_map:
        item["locationId"] = random.choice(list(location_map.keys()))
        print(f"  Fixed item {item['name']} locationId")
    if "holderId" in item and item["holderId"] and item["holderId"] not in npc_map:
        item["holderId"] = random.choice(list(npc_map.keys()))
        print(f"  Fixed item {item['name']} holderId")

# ========================================
# FIX 11: Check edges
# ========================================
print("\nFIX 11: Checking edges...")
for edge in data.get("edges", []):
    if "factionId" in edge and edge["factionId"] and edge["factionId"] not in faction_map:
        edge["factionId"] = random.choice(all_faction_ids)
        print(f"  Fixed edge {edge['id']} factionId")

# ========================================
# VALIDATION
# ========================================
print("\n========== VALIDATION ==========")
errors = 0

# NPC locationIds
for npc in data["npcs"]:
    loc_id = npc.get("locationId")
    if loc_id and loc_id not in location_map:
        print(f"  ERR: NPC {npc['name']} → invalid location {loc_id}")
        errors += 1

# Settlement npcIds
for s in settlements:
    for npc_id in s.get("npcIds", []):
        if npc_id not in npc_map:
            print(f"  ERR: {s['name']} → invalid NPC {npc_id}")
            errors += 1

# Site ownerIds
for s in settlements:
    for site in s.get("sites", []):
        oid = site.get("ownerId")
        if not oid:
            print(f"  ERR: {site['name']} missing ownerId")
            errors += 1
        elif oid not in npc_map:
            print(f"  ERR: {site['name']} invalid ownerId {oid}")
            errors += 1

# Hook NPC refs
for h in data["hooks"]:
    for nid in h.get("involvedNpcIds", []):
        if nid not in npc_map:
            print(f"  ERR: Hook {h['id']} → invalid NPC {nid}")
            errors += 1
    src = h.get("sourceNpcId")
    if src and src not in npc_map:
        print(f"  ERR: Hook {h['id']} → invalid sourceNpcId {src}")
        errors += 1

# Faction schema
for f in data["factions"]:
    for field in ["territoryIds", "influenceIds", "headquartersId", "archetype", "factionType"]:
        if field not in f:
            print(f"  ERR: Faction {f['name']} missing {field}")
            errors += 1

# Clock ownerIds
for c in data.get("clocks", []):
    oid = c.get("ownerId")
    if oid and c.get("ownerType") == "faction" and oid not in faction_map:
        print(f"  ERR: Clock {c['name']} → invalid faction owner {oid}")
        errors += 1
    for field in ["trigger", "consequences", "visible", "paused"]:
        if field not in c:
            print(f"  ERR: Clock {c['name']} missing {field}")
            errors += 1

# Mayor NPC refs
for s in settlements:
    mayor = s.get("mayorNpcId")
    if mayor and mayor not in npc_map:
        print(f"  ERR: {s['name']} → invalid mayorNpcId {mayor}")
        errors += 1

# Lore secret refs
for s in settlements:
    for secret in s.get("lore", {}).get("secrets", []):
        for sid in secret.get("involvedSiteIds", []):
            if sid not in settlement_site_ids.get(s["id"], []):
                print(f"  ERR: Secret in {s['name']} → invalid site {sid}")
                errors += 1
        for nid in secret.get("involvedNpcIds", []):
            if nid not in npc_map:
                print(f"  ERR: Secret in {s['name']} → invalid NPC {nid}")
                errors += 1

print(f"\nTotal errors: {errors}")

# ========================================
# WRITE OUTPUT
# ========================================
output_path = "obojima_fixed.hexbinder.json"
with open(output_path, "w") as f:
    json.dump(data, f, indent=2)

print(f"\n✅ Written to {output_path}")
print(f"   Factions: {len(data['factions'])}")
print(f"   Clocks: {len(data['clocks'])}")
print(f"   NPCs: {len(data['npcs'])}")
print(f"   Hooks: {len(data['hooks'])}")
print(f"   Locations: {len(data['locations'])}")
