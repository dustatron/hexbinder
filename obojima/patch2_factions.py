#!/usr/bin/env python3
"""Patch 2: Fix faction structure and clock structure to match app model."""

import json

INPUT = '/Users/dmccord/Projects/vibeCode/hexbinder/temp/obojima_final.hexbinder.json'
OUTPUT = '/Users/dmccord/Projects/vibeCode/hexbinder/temp/obojima_final.hexbinder.json'

with open(INPUT) as f:
    data = json.load(f)

# =============================================================================
# 1. Remove broken new factions, replace with properly structured ones
# =============================================================================
print("=== Fixing factions ===")

# Keep the 2 existing factions (Fish Head Coven, Lionfish King) - they have correct structure
good_factions = [f for f in data['factions'] if f['id'] in ('faction-o3Wd4Xcu', 'faction-PbhkQa-n')]

# Fix legacy fields on existing factions
for f in good_factions:
    if f['id'] == 'faction-o3Wd4Xcu':
        f['goals'] = [{"description": "Expand control over rare magical ingredients", "progress": 0}]
        f['methods'] = ["Enchantment", "Herbalism", "Intimidation"]
        f['resources'] = ["Magical ingredient monopoly", "Hidden domain in Gale Fields"]
        f['territoryIds'] = []
        f['influenceIds'] = ["settlement-HmoL5chU", "settlement-CbSD55DO"]  # Yatamon, Matango
        f['headquartersId'] = "dungeon-YN2lLblj"
        f['symbols'] = ["A fish skull wreathed in seaweed"]
        f['rumors'] = ["They brew potions that can control minds", "The coven mother speaks to fish spirits"]
        f['status'] = "active"
        f['recruitmentHookIds'] = []
        f['goalRumorIds'] = []
        if 'leaderArchetype' not in f:
            f['leaderArchetype'] = "mage"
        if 'memberArchetype' not in f:
            f['memberArchetype'] = "mage"
    elif f['id'] == 'faction-PbhkQa-n':
        f['goals'] = [{"description": "Destroy Captain Clintock and the Pointue", "progress": 0}]
        f['methods'] = ["Conquest", "Raids", "Intimidation"]
        f['resources'] = ["Fish folk army", "The Shallows", "Corruption magic"]
        f['territoryIds'] = []
        f['influenceIds'] = ["settlement-qaroUeGg", "settlement-kCsR6cxU"]  # Tidewater, Toggle
        f['headquartersId'] = "dungeon-ic32fqpx"
        f['symbols'] = ["A lionfish spine crown"]
        f['rumors'] = ["The Lionfish King can control the tides", "His corruption spreads through the coral"]
        f['status'] = "active"
        f['recruitmentHookIds'] = []
        f['goalRumorIds'] = []
        if 'leaderArchetype' not in f:
            f['leaderArchetype'] = "warlord"
        if 'memberArchetype' not in f:
            f['memberArchetype'] = "soldier"

def make_faction(id, name, desc, archetype, ftype, purpose, scale,
                 advantages, agenda, obstacle, methods, relationships,
                 territory_ids=None, influence_ids=None, hq_id=None,
                 leader_arch="leader", member_arch="soldier",
                 symbols=None, rumors=None, lair=None, seneschal_id=None):
    return {
        "id": id,
        "name": name,
        "description": desc,
        "archetype": archetype,
        "factionType": ftype,
        "purpose": purpose,
        "lair": lair,
        "scale": scale,
        "advantages": advantages,
        "agenda": agenda,
        "obstacle": obstacle,
        "seneschalId": seneschal_id,
        "goals": [{"description": agenda[0]["description"], "progress": 0}] if agenda else [],
        "methods": methods,
        "resources": [a["name"] for a in advantages],
        "relationships": relationships,
        "headquartersId": hq_id,
        "territoryIds": territory_ids or [],
        "influenceIds": influence_ids or [],
        "leaderArchetype": leader_arch,
        "memberArchetype": member_arch,
        "symbols": symbols or [],
        "rumors": rumors or [],
        "recruitmentHookIds": [],
        "goalRumorIds": [],
        "status": "active",
    }

new_factions = [
    make_faction(
        "faction-MarGuild", "Mariners' Guild",
        "A powerful seafaring organization controlling shipping lanes around Obojima. They maintain lighthouses, patrol for pirates, and regulate trade.",
        "mercantile", "guild", "controlling sea trade and protecting shipping lanes", "regional",
        [
            {"type": "territory", "name": "Coastal shipping routes", "description": "Controls all major sea lanes around the island"},
            {"type": "wealth", "name": "Trade tariffs", "description": "Collects fees from all ships using their protected routes"},
        ],
        [
            {"id": "goal-mg1", "order": 1, "description": "Repair the Pointue lighthouse", "status": "in_progress", "addressesObstacle": False},
            {"id": "goal-mg2", "order": 2, "description": "Secure shipping from Lionfish King raids", "status": "pending", "addressesObstacle": True},
            {"id": "goal-mg3", "order": 3, "description": "Establish trade monopoly with mainland", "status": "pending", "addressesObstacle": False},
        ],
        {"type": "powerful_enemy", "description": "The Lionfish King's forces threaten all sea traffic"},
        ["Negotiation", "Naval patrols", "Trade sanctions"],
        [
            {"factionId": "faction-CourBrig", "type": "allied", "reason": "Mutual benefit in communication and trade"},
            {"factionId": "faction-PbhkQa-n", "type": "hostile", "reason": "Fish folk raids on shipping"},
        ],
        influence_ids=["settlement-kCsR6cxU", "settlement-qaroUeGg"],  # Toggle, Tidewater
        leader_arch="captain", member_arch="sailor",
        symbols=["An anchor crossed with a compass rose"],
        rumors=["They're building a warship to challenge the Lionfish King", "The Guild Master has a secret deal with mainland traders"],
    ),
    make_faction(
        "faction-CourBrig", "Courier Brigade",
        "Swift messengers who carry mail, packages, and urgent news between Obojima's scattered settlements. Some ride, some run, some fly with spirit companions.",
        "mercantile", "guild", "connecting all settlements with reliable communication", "regional",
        [
            {"type": "knowledge", "name": "Information network", "description": "Couriers hear everything and know everyone"},
            {"type": "territory", "name": "Established routes", "description": "Fastest paths between all settlements mapped and maintained"},
        ],
        [
            {"id": "goal-cb1", "order": 1, "description": "Establish route through the Crawling Canopy", "status": "in_progress", "addressesObstacle": True},
            {"id": "goal-cb2", "order": 2, "description": "Recruit spirit-bonded couriers for aerial delivery", "status": "pending", "addressesObstacle": False},
            {"id": "goal-cb3", "order": 3, "description": "Expand service to include package delivery to remote locations", "status": "pending", "addressesObstacle": False},
        ],
        {"type": "environmental", "description": "Dangerous terrain and corrupted zones block key routes"},
        ["Speed", "Neutrality", "Information brokering"],
        [
            {"factionId": "faction-MarGuild", "type": "allied", "reason": "Mutual benefit"},
        ],
        influence_ids=["settlement-HmoL5chU"],  # Yatamon (HQ)
        seneschal_id="npc-rNXOMasI",  # PM Escalante
        leader_arch="scout", member_arch="scout",
        symbols=["A running figure carrying a scroll"],
        rumors=["Couriers sometimes read the messages they carry", "PM Escalante is actually a retired adventurer"],
    ),
    make_faction(
        "faction-AHA", "AHA (Archaeologists, Historians & Archivists)",
        "Scholarly organization dedicated to uncovering and preserving Obojima's ancient history. They maintain archives, fund expeditions, and study pre-cataclysm ruins.",
        "arcane", "guild", "excavating and documenting ancient sites", "local",
        [
            {"type": "knowledge", "name": "Ancient archives", "description": "Vast collection of historical documents and artifacts"},
            {"type": "knowledge", "name": "Expedition expertise", "description": "Skilled at navigating ruins and translating ancient scripts"},
        ],
        [
            {"id": "goal-aha1", "order": 1, "description": "Complete excavation of the Undercity ruins", "status": "in_progress", "addressesObstacle": False},
            {"id": "goal-aha2", "order": 2, "description": "Decipher the pre-human tablets found at Okiri", "status": "pending", "addressesObstacle": True},
            {"id": "goal-aha3", "order": 3, "description": "Map all ancient sites on the island", "status": "pending", "addressesObstacle": False},
        ],
        {"type": "lack_of_resources", "description": "Insufficient funding and personnel for all planned expeditions"},
        ["Research", "Expedition", "Preservation"],
        [
            {"factionId": "faction-SYS", "type": "allied", "reason": "Shared interest in the island's history and environment"},
        ],
        hq_id="dungeon-SgXJriDd",  # AHA Headquarters
        seneschal_id="npc-B-vq-H1C",  # Dr. Zalia Frond
        leader_arch="sage", member_arch="sage",
        symbols=["An open book over a pickaxe"],
        rumors=["They found something terrifying in the Undercity", "Dr. Frond has a theory about what caused the ancient cataclysm"],
    ),
    make_faction(
        "faction-SYS", "Society of Young Stewards",
        "Youth organization dedicated to environmental conservation and spirit harmony on Obojima. Members learn to tend the land, communicate with nature spirits, and combat corruption.",
        "religious", "cult", "protecting the natural environment and training stewards", "regional",
        [
            {"type": "knowledge", "name": "Spirit communication", "description": "Members can speak with nature spirits and detect corruption"},
            {"type": "popular_support", "name": "Youth network", "description": "Chapters in most settlements with enthusiastic young members"},
        ],
        [
            {"id": "goal-sys1", "order": 1, "description": "Establish corruption monitoring stations across the island", "status": "in_progress", "addressesObstacle": True},
            {"id": "goal-sys2", "order": 2, "description": "Train 20 new spirit-speakers", "status": "pending", "addressesObstacle": False},
            {"id": "goal-sys3", "order": 3, "description": "Cleanse the corrupted eastern coastline", "status": "pending", "addressesObstacle": True},
        ],
        {"type": "powerful_enemy", "description": "The corruption is too powerful for the Stewards to combat alone"},
        ["Monitoring", "Education", "Spirit rituals"],
        [
            {"factionId": "faction-AHA", "type": "allied", "reason": "Shared interest in the island"},
            {"factionId": "faction-PbhkQa-n", "type": "hostile", "reason": "Corruption threatens the environment"},
        ],
        influence_ids=["settlement-CbSD55DO", "settlement-e0MHafVM"],  # Matango, Uluwa
        leader_arch="druid", member_arch="acolyte",
        symbols=["A green sprout in a cupped hand"],
        rumors=["They can actually heal corrupted land", "The oldest Steward remembers the island before the cataclysm"],
    ),
    make_faction(
        "faction-PatchRobe", "Patchwork Robe Coven",
        "Witches and hedge mages who practice folk magic, herbalism, and spirit-speaking. They wear distinctive patchwork robes and serve as the island's healers and seers.",
        "arcane", "cult", "preserving traditional magical practices", "regional",
        [
            {"type": "knowledge", "name": "Traditional magic", "description": "Centuries of folk magical knowledge passed down through generations"},
            {"type": "popular_support", "name": "Community healers", "description": "Trusted by common folk as healers and advisors"},
        ],
        [
            {"id": "goal-pr1", "order": 1, "description": "Counter the Fish Head Coven's ingredient monopoly", "status": "in_progress", "addressesObstacle": True},
            {"id": "goal-pr2", "order": 2, "description": "Develop a cure for corruption sickness", "status": "pending", "addressesObstacle": False},
            {"id": "goal-pr3", "order": 3, "description": "Train the next generation of hedge witches", "status": "pending", "addressesObstacle": False},
        ],
        {"type": "rival_faction", "description": "The Fish Head Coven and Tall Hats seek to suppress their practice"},
        ["Herbalism", "Folk magic", "Community service"],
        [
            {"factionId": "faction-CloudCap", "type": "allied", "reason": "Sister coven with shared traditions"},
            {"factionId": "faction-o3Wd4Xcu", "type": "hostile", "reason": "Competition over magical resources"},
            {"factionId": "faction-TallHats", "type": "hostile", "reason": "Tall Hats want to regulate their magic"},
        ],
        seneschal_id="npc-5RyUOu7J",  # Granny Yuzu
        leader_arch="mage", member_arch="mage",
        symbols=["A patched robe with seven colors"],
        rumors=["Granny Yuzu is over 200 years old", "Their robes are actually enchanted with protective spells"],
    ),
    make_faction(
        "faction-CloudCap", "Cloud Cap Coven",
        "Mountain-dwelling witches who practice weather magic and commune with sky spirits atop Mount Arbora. Reclusive but respected for storm prediction and volcanic monitoring.",
        "arcane", "cult", "monitoring Mount Arbora and maintaining weather patterns", "local",
        [
            {"type": "knowledge", "name": "Weather magic", "description": "Can predict and influence weather patterns across the island"},
            {"type": "territory", "name": "Mount Arbora summit", "description": "Control the sacred peak and its spirit sanctuaries"},
        ],
        [
            {"id": "goal-cc1", "order": 1, "description": "Monitor volcanic tremors from Mount Arbora", "status": "in_progress", "addressesObstacle": False},
            {"id": "goal-cc2", "order": 2, "description": "Strengthen the ward against storm spirits", "status": "pending", "addressesObstacle": True},
            {"id": "goal-cc3", "order": 3, "description": "Prevent the Tall Hats from accessing the summit", "status": "pending", "addressesObstacle": True},
        ],
        {"type": "rival_faction", "description": "The Tall Hats seek to control and regulate all magic on the island"},
        ["Weather magic", "Divination", "Isolation"],
        [
            {"factionId": "faction-PatchRobe", "type": "allied", "reason": "Sister coven"},
            {"factionId": "faction-TallHats", "type": "hostile", "reason": "Resist magical regulation"},
        ],
        leader_arch="mage", member_arch="mage",
        symbols=["A cloud-wreathed mountain peak"],
        rumors=["They can summon lightning at will", "The coven leader hasn't come down from the mountain in years"],
    ),
    make_faction(
        "faction-Crowsworn", "The Crowsworn",
        "Secretive network of spies, informants, and shadow operatives. They trade in secrets and information, serving hidden agendas from the shadows.",
        "criminal", "guild", "gathering intelligence and manipulating events", "regional",
        [
            {"type": "knowledge", "name": "Spy network", "description": "Agents embedded in every settlement and faction"},
            {"type": "knowledge", "name": "Blackmail material", "description": "Compromising information on key figures across the island"},
        ],
        [
            {"id": "goal-cs1", "order": 1, "description": "Infiltrate the Tall Hats' inner circle", "status": "in_progress", "addressesObstacle": True},
            {"id": "goal-cs2", "order": 2, "description": "Steal the AHA's map of ancient sites", "status": "pending", "addressesObstacle": False},
            {"id": "goal-cs3", "order": 3, "description": "Establish a smuggling route through the Crawling Canopy", "status": "pending", "addressesObstacle": False},
        ],
        {"type": "secrecy", "description": "Must remain hidden to maintain their advantage"},
        ["Espionage", "Blackmail", "Assassination"],
        [
            {"factionId": "faction-CourBrig", "type": "hostile", "reason": "Couriers are too nosy and interfere with operations"},
        ],
        leader_arch="assassin", member_arch="thief",
        symbols=["A black crow's feather"],
        rumors=["Their leader is someone everyone knows by another name", "They have agents in every faction on the island"],
    ),
    make_faction(
        "faction-GildGourd", "League of the Gilded Gourd",
        "Merchant consortium controlling much of Obojima's inland commerce. Known for their golden gourd seal and ruthless business practices.",
        "mercantile", "guild", "monopolizing inland trade", "regional",
        [
            {"type": "wealth", "name": "Trade monopoly", "description": "Controls pricing and distribution of most inland goods"},
            {"type": "political", "name": "Economic leverage", "description": "Can bankrupt competitors or embargo settlements"},
        ],
        [
            {"id": "goal-gg1", "order": 1, "description": "Establish exclusive trade agreements with all settlements", "status": "in_progress", "addressesObstacle": False},
            {"id": "goal-gg2", "order": 2, "description": "Undermine the Mariners' Guild's import business", "status": "pending", "addressesObstacle": True},
            {"id": "goal-gg3", "order": 3, "description": "Install Guild-friendly leaders in key settlements", "status": "pending", "addressesObstacle": False},
        ],
        {"type": "rival_faction", "description": "The Mariners' Guild controls sea trade and resists inland expansion"},
        ["Price manipulation", "Bribery", "Contract enforcement"],
        [
            {"factionId": "faction-SYS", "type": "hostile", "reason": "Stewards oppose their exploitative practices"},
        ],
        influence_ids=["settlement-HmoL5chU"],  # Yatamon
        seneschal_id="npc-sgrG_DsX",  # Gomber
        leader_arch="merchant", member_arch="merchant",
        symbols=["A golden gourd filled with coins"],
        rumors=["Gomber has more gold than all the settlements combined", "They secretly fund both sides of every conflict"],
    ),
    make_faction(
        "faction-TallHats", "The Tall Hats",
        "Elite order of wizards and sorcerers who consider themselves the island's magical authority. They seek to regulate all arcane practice under their governance.",
        "arcane", "guild", "establishing magical governance and regulation", "regional",
        [
            {"type": "knowledge", "name": "Arcane mastery", "description": "The most powerful trained spellcasters on the island"},
            {"type": "political", "name": "Magical authority", "description": "Self-proclaimed regulators of all arcane practice"},
        ],
        [
            {"id": "goal-th1", "order": 1, "description": "Pass magical regulation edicts in all settlements", "status": "in_progress", "addressesObstacle": True},
            {"id": "goal-th2", "order": 2, "description": "Shut down unlicensed magical practice", "status": "pending", "addressesObstacle": True},
            {"id": "goal-th3", "order": 3, "description": "Secure access to Mount Arbora's arcane energies", "status": "pending", "addressesObstacle": True},
        ],
        {"type": "rival_faction", "description": "Three covens resist their regulatory authority"},
        ["Legislation", "Magical enforcement", "Political pressure"],
        [
            {"factionId": "faction-PatchRobe", "type": "hostile", "reason": "Resist regulation"},
            {"factionId": "faction-CloudCap", "type": "hostile", "reason": "Block access to mountain"},
            {"factionId": "faction-o3Wd4Xcu", "type": "hostile", "reason": "Operate outside the law"},
        ],
        influence_ids=["settlement-HmoL5chU"],  # Yatamon
        seneschal_id="npc-dVZGtYSC",  # Krocius
        leader_arch="mage", member_arch="mage",
        symbols=["A tall pointed hat with stars"],
        rumors=["Krocius can see through walls", "The Tall Hats' tower extends deep underground"],
    ),
    make_faction(
        "faction-FourSword", "The Four Sword Schools",
        "Four competing martial arts academies based in Yatamon, each teaching a distinct fighting style. Regular tournaments shape town politics.",
        "military", "guild", "training warriors and winning martial prestige", "local",
        [
            {"type": "military", "name": "Trained warriors", "description": "Dozens of skilled fighters across four distinct styles"},
            {"type": "popular_support", "name": "Tournament prestige", "description": "Tournaments draw crowds and build community loyalty"},
        ],
        [
            {"id": "goal-fs1", "order": 1, "description": "Win the Grand Tournament and claim the Champion's Blade", "status": "in_progress", "addressesObstacle": False},
            {"id": "goal-fs2", "order": 2, "description": "Recruit promising students from across the island", "status": "pending", "addressesObstacle": False},
            {"id": "goal-fs3", "order": 3, "description": "Establish branch dojos in other settlements", "status": "pending", "addressesObstacle": True},
        ],
        {"type": "internal_conflict", "description": "The four schools' rivalry sometimes prevents unified action"},
        ["Combat training", "Tournaments", "Honor challenges"],
        [],
        influence_ids=["settlement-HmoL5chU"],  # Yatamon
        seneschal_id="npc-FHVF-_HA",  # Master Hu
        leader_arch="warrior", member_arch="warrior",
        symbols=["Four crossed swords"],
        rumors=["Master Hu once defeated 20 opponents in a single match", "The schools are secretly cooperating against an outside threat"],
    ),
]

# Combine existing good factions + new factions
data['factions'] = good_factions + new_factions
print(f"  Total factions: {len(data['factions'])}")
for f in data['factions']:
    print(f"  ✅ {f['name']} ({f['id']})")

# =============================================================================
# 2. Fix clock structure for new clocks
# =============================================================================
print("\n=== Fixing clocks ===")

# Keep the 2 existing good clocks, replace the 4 broken ones
good_clocks = [c for c in data['clocks'] if c['id'] in ('clock-V_zU90BU', 'clock-Aqweft9h')]

new_clocks = [
    {
        "id": "clock-MarRepair",
        "name": "Pointue Lighthouse Repair",
        "description": "The Mariners' Guild works to repair the damaged Pointue lighthouse, crucial for safe navigation around Obojima's reefs.",
        "segments": 6,
        "filled": 1,
        "ownerId": "faction-MarGuild",
        "ownerType": "faction",
        "trigger": {"type": "event", "events": ["Delivery of building materials", "Skilled labor provided"]},
        "consequences": [
            {"description": "Safe navigation restored around the island", "type": "state_change"},
            {"description": "Mariners' Guild gains major influence in Toggle", "type": "event"},
        ],
        "visible": True,
        "paused": False,
    },
    {
        "id": "clock-CourRoute",
        "name": "Courier Route Through Canopy",
        "description": "The Courier Brigade attempts to establish a reliable route through the Crawling Canopy, connecting isolated communities.",
        "segments": 4,
        "filled": 0,
        "ownerId": "faction-CourBrig",
        "ownerType": "faction",
        "trigger": {"type": "event", "events": ["Path cleared through canopy section", "Spirit guide recruited"]},
        "consequences": [
            {"description": "Fast communication to all settlements", "type": "state_change"},
            {"description": "Courier Brigade becomes essential infrastructure", "type": "event"},
        ],
        "visible": True,
        "paused": False,
    },
    {
        "id": "clock-AHAExcav",
        "name": "AHA Undercity Excavation",
        "description": "AHA archaeologists dig deeper into pre-human ruins beneath the island, risking unleashing something ancient.",
        "segments": 8,
        "filled": 2,
        "ownerId": "faction-AHA",
        "ownerType": "faction",
        "trigger": {"type": "time", "daysPerTick": 14},
        "consequences": [
            {"description": "Ancient pre-human structure fully exposed", "type": "event"},
            {"description": "Something sealed away is released", "type": "spawn"},
        ],
        "visible": True,
        "paused": False,
    },
    {
        "id": "clock-CorruptSpread",
        "name": "Corruption Spreading Westward",
        "description": "The corruption creeps further from the eastern coastline, threatening more settlements and wildlife.",
        "segments": 6,
        "filled": 2,
        "ownerId": "faction-PbhkQa-n",
        "ownerType": "faction",
        "trigger": {"type": "time", "daysPerTick": 7},
        "consequences": [
            {"description": "Toggle's fishing waters become corrupted", "type": "state_change"},
            {"description": "Corruption reaches Tidewater", "type": "event"},
        ],
        "visible": True,
        "paused": False,
    },
]

data['clocks'] = good_clocks + new_clocks
print(f"  Total clocks: {len(data['clocks'])}")
for c in data['clocks']:
    print(f"  ✅ {c['name']}")

# =============================================================================
# 3. Verify faction structure
# =============================================================================
print("\n=== Verifying faction structure ===")
required_fields = ['id', 'name', 'description', 'archetype', 'factionType', 'purpose',
                   'scale', 'advantages', 'agenda', 'obstacle', 'goals', 'methods',
                   'resources', 'relationships', 'territoryIds', 'influenceIds',
                   'leaderArchetype', 'memberArchetype', 'symbols', 'rumors',
                   'recruitmentHookIds', 'goalRumorIds', 'status']

issues = []
for f in data['factions']:
    for field in required_fields:
        if field not in f:
            issues.append(f"Faction '{f['name']}' missing field: {field}")

# Verify clocks
clock_required = ['id', 'name', 'description', 'segments', 'filled', 'ownerId',
                  'ownerType', 'trigger', 'consequences', 'visible', 'paused']
for c in data['clocks']:
    for field in clock_required:
        if field not in c:
            issues.append(f"Clock '{c['name']}' missing field: {field}")

if issues:
    print("  ISSUES:")
    for i in issues:
        print(f"    ❌ {i}")
else:
    print("  ✅ All factions and clocks have correct structure!")

# Save
with open(OUTPUT, 'w') as f:
    json.dump(data, f, indent=2)

print(f"\n✅ Saved to {OUTPUT}")
