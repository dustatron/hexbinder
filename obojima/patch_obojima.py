#!/usr/bin/env python3
"""Patch obojima_final.hexbinder.json to fix crashes and add missing content."""

import json
import copy
import hashlib

INPUT = '/Users/dmccord/Projects/vibeCode/hexbinder/temp/obojima_final.hexbinder.json'
OUTPUT = '/Users/dmccord/Projects/vibeCode/hexbinder/temp/obojima_final.hexbinder.json'

with open(INPUT) as f:
    data = json.load(f)

# Build NPC lookup
npc_by_id = {n['id']: n for n in data['npcs']}

# =============================================================================
# 1. FIX: Add ownerId to all settlement sites
# =============================================================================
print("=== Fixing site ownerIds ===")

# Map site names to specific NPCs where thematic (owner runs the establishment)
SITE_OWNER_MAP = {
    # Polewater
    "The Mud Eel": "npc-QQRB0fln",        # Paloma Clintock (innkeeper)
    "Polewater Trading Post": "npc-t66vooNF",  # Tanisu (trader)
    # Okiri
    "High Hearth": "npc-lz6mMjvd",        # Miss Lindley (innkeeper)
    "Bree's Mercantile": "npc-pvmx6k5K",   # Bree (spirit shopkeeper)
    # Matango
    "The Moss Boiler": "npc-p3GXX0bu",     # Madame Porcini (tavern)
    "Porcini Guest House": "npc-brhHsoBm",  # Marvolio Chanterelle (inn)
    # Uluwa
    "Let's Have Another": "npc-IjcdyuyV",   # Humble Utzu (tavern)
    "Bobbing Boat Market": "npc-EI0C3N4Y",  # Emille (shop)
    # Yatamon
    "Happy Joy Cake Bakery": "npc-H5JPh3qQ",  # Cholly (bakery)
    "The Beehive": "npc-G3cS__uw",          # Jenni (inn)
    "Himitsu's Arcane Izakaya": "npc-mRGE9F6P",  # Himitsu (tavern)
    "Jenni's General Store": "npc-G3cS__uw",    # Jenni (shop)
    # Toggle
    "The Anvil Rest": "npc-dc-k4mKz",       # Garo (inn)
    "The Twin Forge": "npc-6GLfkaoH",        # Holly Clintock (shop)
    # Tidewater
    "Sandy Rest": "npc-LqDjDsn-",           # Ulmat (inn)
    "Sculpture Park Cantina": "npc-4gAs3NJJ",  # Gritty Groff (tavern)
    # Hogstone
    "Hogstone Lodge": "npc-KPjlobsT",        # Chisuay (inn/teahouse)
    "Adira's Apothecary": "npc--8WDPwAp",    # Adira (shop)
}

for loc in data['locations']:
    if loc['type'] != 'settlement':
        continue
    npc_ids = loc.get('npcIds', [])
    for i, site in enumerate(loc.get('sites', [])):
        if site['name'] in SITE_OWNER_MAP:
            site['ownerId'] = SITE_OWNER_MAP[site['name']]
        elif npc_ids:
            # Fallback: assign sequentially from settlement NPCs
            site['ownerId'] = npc_ids[min(i, len(npc_ids) - 1)]
        print(f"  {loc['name']} -> {site['name']}: ownerId = {site.get('ownerId')}")

# =============================================================================
# 2. FIX: Update sensoryImpressions per settlement
# =============================================================================
print("\n=== Updating sensoryImpressions ===")

SENSORY = {
    "Polewater Village": [
        "Stilted huts rise from murky brackwater channels",
        "The buzz of insects mingles with distant frog chorus",
        "Fresh fish dries on wooden racks along the boardwalk",
        "A nakudama child paddles a small boat between houses",
        "The smell of swamp herbs and smoked eel fills the air"
    ],
    "Okiri Village": [
        "Colorful prayer flags flutter between thatched rooftops",
        "Villagers tend terraced gardens on the hillside",
        "The rhythmic clang of a blacksmith echoes through the valley",
        "Children chase spirit-lights through the bamboo grove",
        "Sweet incense drifts from the village shrine"
    ],
    "Matango Village": [
        "Giant mushrooms tower above the village like parasols",
        "Spore clouds drift lazily in the humid air",
        "The earthy scent of fungi and rich soil is everywhere",
        "Bioluminescent caps glow softly in the shade",
        "Villagers harvest cap-flesh with curved silver knives"
    ],
    "Uluwa": [
        "Floating platforms bob gently on the warm thermal springs",
        "Steam rises from natural hot pools throughout the village",
        "Spirit lanterns illuminate the waterways at dusk",
        "The sound of ceremonial drums echoes across the water",
        "Flower garlands decorate every doorway and railing"
    ],
    "Yatamon": [
        "Paper lanterns line the bustling market streets",
        "The aroma of fresh-baked mochi and grilled fish fills the air",
        "Sword school students practice forms in the town square",
        "Colorful banners mark the entrances to competing shops",
        "A spirit postal carrier swoops between rooftops"
    ],
    "Toggle": [
        "Weathered wooden buildings lean against the coastal wind",
        "The creak of ship rigging mingles with seabird calls",
        "Salt spray mists the cobblestone streets",
        "Fishing nets hang drying between the houses",
        "A courier ship's bell rings as it enters the harbor"
    ],
    "Tidewater": [
        "Massive sculptural installations dot the beachfront",
        "Colorful coral formations visible through crystal-clear shallows",
        "Artists work on driftwood carvings in open-air studios",
        "The crash of waves provides a constant rhythm",
        "Sand-smoothed glass decorates window frames and doorways"
    ],
    "Hogstone Hot Springs": [
        "Mineral-rich steam rises from natural stone pools",
        "The scent of yuzu and herbal tea wafts from Chisuay's teahouse",
        "Hot water streams trickle between smooth hogstones",
        "Guests in cotton robes stroll along heated pathways",
        "The distant rumble of Mount Arbora is a constant companion"
    ],
}

for loc in data['locations']:
    if loc['type'] == 'settlement' and loc['name'] in SENSORY:
        loc['sensoryImpressions'] = SENSORY[loc['name']]
        print(f"  Updated: {loc['name']}")

# =============================================================================
# 3. FIX: Update rumors per settlement with Obojima-themed content
# =============================================================================
print("\n=== Updating rumors ===")

RUMORS = {
    "Polewater Village": [
        {"text": "Zolde has been meeting with nakudama elders about something urgent in the wetlands", "isTrue": True},
        {"text": "Strange lights have been seen rising from the deep channels at night", "isTrue": True},
        {"text": "The Fish Head Coven has been recruiting from among the village youth", "isTrue": False},
        {"text": "Hakumon claims to have found an ancient recipe that grants water-breathing", "isTrue": False},
        {"text": "Something massive has been moving through the brackwater — bigger than any known creature", "isTrue": True},
    ],
    "Okiri Village": [
        {"text": "Broad Naldo received a warning from the Mariners' Guild about unusual currents", "isTrue": True},
        {"text": "Miss Lindley found old maps in the inn's cellar showing pre-cataclysm ruins", "isTrue": True},
        {"text": "A dara trading vessel brought strange cargo wrapped in spirit-silk", "isTrue": False},
        {"text": "Wenneth overheard Crowsworn agents discussing a plan near the shrine", "isTrue": False},
        {"text": "The coral reef south of the village has been dying at an unnatural rate", "isTrue": True},
    ],
    "Matango Village": [
        {"text": "Rokoko has been communing with the Great Mushroom — something is wrong with the mycelial network", "isTrue": True},
        {"text": "Madame Porcini's latest brew can cure the corruption sickness", "isTrue": False},
        {"text": "The Crawling Canopy has been expanding faster than normal this season", "isTrue": True},
        {"text": "Chogo discovered a hidden passage beneath the largest mushroom cap", "isTrue": True},
        {"text": "A spirit from Mount Arbora was seen wandering the mushroom groves at midnight", "isTrue": False},
    ],
    "Uluwa": [
        {"text": "The Master of Ceremonies is hiding the true purpose of the next festival", "isTrue": True},
        {"text": "Humble Utzu waters down his drinks with enchanted spring water", "isTrue": False},
        {"text": "Emille the dara has been sending messages to someone off-island", "isTrue": True},
        {"text": "The hot springs' temperature has been rising — Mount Arbora may be stirring", "isTrue": True},
        {"text": "Throth has been building something in secret at the edge of the village", "isTrue": False},
    ],
    "Yatamon": [
        {"text": "Master Hu is secretly training a student to challenge the Tall Hats", "isTrue": True},
        {"text": "Himitsu's izakaya serves drinks that let you see into the spirit world", "isTrue": True},
        {"text": "PM Escalante has been buying unusual quantities of iron from the forge", "isTrue": False},
        {"text": "The Four Sword Schools are gathering for an unprecedented joint tournament", "isTrue": True},
        {"text": "Cholly's cakes have been making people dream of ancient Obojima", "isTrue": False},
    ],
    "Toggle": [
        {"text": "Captain Clintock spotted something enormous beneath the waves near the Shallows", "isTrue": True},
        {"text": "The Lionfish King's corruption is creeping closer to Toggle's fishing waters", "isTrue": True},
        {"text": "Duro has been secretly negotiating with both the Mariners' Guild and the Courier Brigade", "isTrue": False},
        {"text": "Holly Clintock forged a blade from metal pulled from a corrupted reef", "isTrue": True},
        {"text": "Marcel claims to have a map to the Lionfish King's treasure hoard", "isTrue": False},
    ],
    "Tidewater": [
        {"text": "Vorian the elf found inscriptions in the sculpture park that predate the island", "isTrue": True},
        {"text": "Great Ferek has been acting strangely since visiting the corrupted coastline", "isTrue": True},
        {"text": "The sculptures in the park move when no one is watching", "isTrue": False},
        {"text": "Gritty Groff discovered a sea cave beneath the cantina with old carvings", "isTrue": True},
        {"text": "A ghost ship has been seen offshore at dawn, heading toward the Shallows", "isTrue": False},
    ],
    "Hogstone Hot Springs": [
        {"text": "Chisuay's tea leaves have been showing dark omens about Mount Arbora", "isTrue": True},
        {"text": "Adira discovered a new mineral deposit with healing properties in the hot springs", "isTrue": True},
        {"text": "Migo the spirit has been unusually quiet — they sense something underground", "isTrue": True},
        {"text": "A Patchwork Robe Coven member was seen collecting samples from the springs at night", "isTrue": False},
        {"text": "Yuki claims the hogstones have been humming with a frequency she's never heard before", "isTrue": False},
    ],
}

for loc in data['locations']:
    if loc['type'] == 'settlement' and loc['name'] in RUMORS:
        # Keep original rumor IDs but update text
        old_rumors = loc.get('rumors', [])
        new_rumors_data = RUMORS[loc['name']]
        updated_rumors = []
        for i, nr in enumerate(new_rumors_data):
            if i < len(old_rumors):
                rumor = copy.deepcopy(old_rumors[i])
                rumor['text'] = nr['text']
                rumor['isTrue'] = nr['isTrue']
            else:
                rumor = {
                    'id': f'rumor-{hashlib.md5(nr["text"].encode()).hexdigest()[:8]}',
                    'text': nr['text'],
                    'isTrue': nr['isTrue'],
                    'source': 'local gossip'
                }
            updated_rumors.append(rumor)
        loc['rumors'] = updated_rumors
        print(f"  Updated: {loc['name']} ({len(updated_rumors)} rumors)")

# =============================================================================
# 4. FIX: Update notices per settlement
# =============================================================================
print("\n=== Updating notices ===")

NOTICES = {
    "Polewater Village": [
        {"title": "WETLAND GUIDES NEEDED", "description": "Experienced guides wanted for expedition into deep brackwater channels. Good pay. Contact Zolde at the village hall.", "noticeType": "job", "reward": "25gp per day"},
        {"title": "LOST FISHING BOAT", "description": "My boat went missing near the eastern channels. If found, please return to Paloma at The Mud Eel.", "noticeType": "missing", "reward": "10gp"},
        {"title": "NAKUDAMA FESTIVAL", "description": "Annual Water Blessing ceremony in 3 days. All residents welcome. Offerings of fresh fish appreciated.", "noticeType": "event", "reward": ""},
    ],
    "Okiri Village": [
        {"title": "CORAL SURVEY VOLUNTEERS", "description": "The AHA needs volunteers to document coral formations south of the village. Ask for Broad Naldo.", "noticeType": "job", "reward": "15gp"},
        {"title": "MISSING HEIRLOOM", "description": "Silver compass lost near the bamboo grove. Sentimental value. Contact Miss Lindley at High Hearth.", "noticeType": "missing", "reward": "20gp"},
        {"title": "SHRINE MAINTENANCE", "description": "Help needed repairing the village shrine after the last storm. Speak to Wenneth.", "noticeType": "job", "reward": "8gp"},
    ],
    "Matango Village": [
        {"title": "MUSHROOM HARVESTERS WANTED", "description": "Experienced foragers needed for deep canopy harvest. Dangerous work, good pay. Ask Rokoko.", "noticeType": "job", "reward": "30gp per day"},
        {"title": "WARNING: SPORE BLOOMS", "description": "Avoid the northeastern mushroom groves. Unusual spore activity detected. By order of Rokoko.", "noticeType": "warning", "reward": ""},
        {"title": "PORCINI GUEST HOUSE SPECIAL", "description": "Madame Porcini offers half-price rooms for anyone bringing news from outside the mushroom forest.", "noticeType": "event", "reward": ""},
    ],
    "Uluwa": [
        {"title": "FESTIVAL PERFORMERS NEEDED", "description": "The Master of Ceremonies seeks talented performers for the upcoming Spirit Festival. Contact at village center.", "noticeType": "job", "reward": "40gp"},
        {"title": "HOT SPRING SAFETY", "description": "WARNING: Some pools have reached dangerous temperatures. Bathe only in marked safe zones.", "noticeType": "warning", "reward": ""},
        {"title": "SPIRIT OFFERINGS", "description": "Daily spirit offerings at the thermal shrine. Flower garlands and fresh fruit accepted. See Throth.", "noticeType": "event", "reward": ""},
    ],
    "Yatamon": [
        {"title": "SWORD TOURNAMENT", "description": "The Four Sword Schools invite all warriors to the Grand Tournament. Register with Master Hu.", "noticeType": "event", "reward": "100gp grand prize"},
        {"title": "COURIER BRIGADE RECRUITMENT", "description": "Fast runners and flyers wanted for inter-village mail delivery. Apply at PM Escalante's office.", "noticeType": "job", "reward": "12gp per delivery"},
        {"title": "CAKE TASTING", "description": "Cholly's Happy Joy Cake Bakery debuts new flavors this week. First taste free!", "noticeType": "event", "reward": ""},
    ],
    "Toggle": [
        {"title": "SAILORS WANTED", "description": "Captain Clintock needs experienced crew for coastal patrol. Corruption zones expected. Hazard pay included.", "noticeType": "job", "reward": "50gp per voyage"},
        {"title": "FORGE APPRENTICE", "description": "Holly Clintock at The Twin Forge seeks an apprentice. Must not fear fire or hard work.", "noticeType": "job", "reward": "Room and board + training"},
        {"title": "CORRUPTED WATERS WARNING", "description": "Mariners' Guild advisory: avoid waters east of the harbor. Corruption spreading. Report sightings to Duro.", "noticeType": "warning", "reward": "5gp per report"},
    ],
    "Tidewater": [
        {"title": "SCULPTURE RESTORATION", "description": "Artists and craftspeople needed to restore storm-damaged installations. Contact Vorian.", "noticeType": "job", "reward": "20gp per piece"},
        {"title": "SEA CAVE EXPEDITION", "description": "Gritty Groff organizing exploration of newly discovered caves beneath the cantina. Brave souls apply.", "noticeType": "job", "reward": "Split of findings"},
        {"title": "BEACH CLEANUP", "description": "Corrupted debris washing ashore. Volunteers needed for safe removal. Gloves provided. See Great Ferek.", "noticeType": "job", "reward": "5gp per hour"},
    ],
    "Hogstone Hot Springs": [
        {"title": "SPRING WATER COLLECTION", "description": "Adira needs helpers to collect mineral-rich water from the upper springs. Careful hands only.", "noticeType": "job", "reward": "15gp per barrel"},
        {"title": "TEA CEREMONY", "description": "Chisuay's weekly tea ceremony now accepting reservations. Limited seating. Healing teas available.", "noticeType": "event", "reward": ""},
        {"title": "GEOLOGICAL SURVEY", "description": "The AHA requests observations of any unusual geological activity. Mount Arbora monitoring. Report to Migo.", "noticeType": "job", "reward": "10gp per report"},
    ],
}

for loc in data['locations']:
    if loc['type'] == 'settlement' and loc['name'] in NOTICES:
        old_notices = loc.get('notices', [])
        new_notices_data = NOTICES[loc['name']]
        updated_notices = []
        for i, nn in enumerate(new_notices_data):
            if i < len(old_notices):
                notice = copy.deepcopy(old_notices[i])
                notice['title'] = nn['title']
                notice['description'] = nn['description']
                notice['noticeType'] = nn['noticeType']
                notice['reward'] = nn['reward']
            else:
                notice = {
                    'id': f'notice-{hashlib.md5(nn["title"].encode()).hexdigest()[:8]}',
                    'title': nn['title'],
                    'description': nn['description'],
                    'noticeType': nn['noticeType'],
                    'reward': nn['reward'],
                }
            updated_notices.append(notice)
        loc['notices'] = updated_notices
        print(f"  Updated: {loc['name']} ({len(updated_notices)} notices)")

# =============================================================================
# 5. FIX: Update lore per settlement
# =============================================================================
print("\n=== Updating lore ===")

LORE = {
    "Polewater Village": {
        "history": "Founded by nakudama who first settled the brackwater wetlands, Polewater has always been a place between worlds — land and water, human and spirit.",
        "legends": "The Old Ones say a great spirit turtle sleeps beneath the deepest channel, and its dreams shape the currents.",
        "secrets": "The village elders know that the brackwater channels connect to an underground river system that runs beneath the entire island."
    },
    "Okiri Village": {
        "history": "Okiri was established as a waypoint for travelers crossing between the coast and the interior. Its shrine has been tended for generations.",
        "legends": "The bamboo grove is said to have grown from a staff planted by the first shaman of Obojima.",
        "secrets": "Hidden beneath the shrine are tablets describing the original pact between humans and spirits that governs the island."
    },
    "Matango Village": {
        "history": "Matango grew up around the Great Mushroom, a colossal fungus that predates human settlement on the island. The village lives in symbiosis with the mycelial network.",
        "legends": "Rokoko claims the mushrooms are the island's memory — every event absorbed into the network's spore patterns.",
        "secrets": "The mycelial network beneath Matango connects to the Crawling Canopy and can transmit messages across the island."
    },
    "Uluwa": {
        "history": "Built atop natural hot springs, Uluwa has long been a place of healing and celebration. Its festivals draw visitors from across Obojima.",
        "legends": "The springs are said to be the tears of a fire spirit who fell in love with the ocean and could never reach it.",
        "secrets": "The thermal energy beneath Uluwa is connected to Mount Arbora's volcanic activity — if the mountain stirs, the springs will boil."
    },
    "Yatamon": {
        "history": "The largest settlement on Obojima, Yatamon is a hub of commerce, martial arts, and culture. The Four Sword Schools have trained here for centuries.",
        "legends": "Master Hu's predecessor is said to have defeated a hundred corrupted spirits in a single night to protect the town.",
        "secrets": "The League of the Gilded Gourd secretly controls much of Yatamon's trade through shell companies and favors."
    },
    "Toggle": {
        "history": "A hardy fishing and shipping port, Toggle has weathered storms both natural and supernatural. The Clintock family has been its backbone for three generations.",
        "legends": "Sailors say that on moonless nights, you can hear the Lionfish King singing from beneath the waves.",
        "secrets": "Captain Clintock has been secretly mapping the Lionfish King's territory, preparing for an eventual confrontation."
    },
    "Tidewater": {
        "history": "Originally a simple fishing camp, Tidewater transformed when artists discovered that the local sand and coral produced exceptional sculptures and pigments.",
        "legends": "The oldest sculpture in the park is said to have carved itself — appearing overnight after a great storm.",
        "secrets": "The sea caves beneath Tidewater contain pre-human carvings that suggest an ancient civilization once thrived here."
    },
    "Hogstone Hot Springs": {
        "history": "Named for the distinctive rounded stones heated by volcanic activity, Hogstone has served as a retreat and healing place since before recorded history.",
        "legends": "Chisuay says the hogstones contain the memories of the volcano — press your ear to a warm one and you might hear Mount Arbora dreaming.",
        "secrets": "Adira has discovered that the spring minerals, properly prepared, can slow or even reverse the corruption spreading from the coastline."
    },
}

for loc in data['locations']:
    if loc['type'] == 'settlement' and loc['name'] in LORE:
        loc['lore'] = LORE[loc['name']]
        print(f"  Updated: {loc['name']}")

# =============================================================================
# 6. ADD: All Obojima factions (currently only 2)
# =============================================================================
print("\n=== Adding all Obojima factions ===")

existing_faction_names = {f['name'] for f in data['factions']}
print(f"  Existing factions: {existing_faction_names}")

NEW_FACTIONS = [
    {
        "id": "faction-MarGuild",
        "name": "Mariners' Guild",
        "description": "A powerful seafaring organization that controls shipping lanes around Obojima. They maintain lighthouses, patrol for pirates, and regulate trade routes. Their influence extends to every port on the island.",
        "goals": "Maintain control of sea trade, protect shipping lanes from corruption, expand influence over inland communities",
        "reputation": 65,
        "power": 70,
        "alignment": "lawful neutral",
        "territory": "All coastal settlements, especially Toggle and Tidewater",
        "allies": ["Courier Brigade"],
        "enemies": ["Domain of the Lionfish King"],
        "leader": "Harbor Master (elected position)",
        "memberCount": 200,
        "tags": ["maritime", "trade", "military"],
    },
    {
        "id": "faction-CourBrig",
        "name": "Courier Brigade",
        "description": "A network of swift messengers who carry mail, packages, and urgent news between Obojima's scattered settlements. Some ride, some run, some fly with spirit companions.",
        "goals": "Connect all settlements with reliable communication, maintain neutrality between factions, expand routes to remote areas",
        "reputation": 80,
        "power": 30,
        "alignment": "neutral good",
        "territory": "Routes between all settlements, HQ in Yatamon",
        "allies": ["Mariners' Guild"],
        "enemies": [],
        "leader": "PM Escalante",
        "memberCount": 50,
        "tags": ["communication", "travel", "neutral"],
    },
    {
        "id": "faction-AHA",
        "name": "AHA (Archaeologists, Historians & Archivists)",
        "description": "Scholarly organization dedicated to uncovering and preserving Obojima's ancient history. They maintain archives, fund expeditions, and study pre-cataclysm ruins.",
        "goals": "Excavate and document all ancient sites, understand the island's pre-human history, prevent artifacts from falling into wrong hands",
        "reputation": 60,
        "power": 25,
        "alignment": "neutral",
        "territory": "AHA Headquarters, expeditions across the island",
        "allies": ["Society of Young Stewards"],
        "enemies": [],
        "leader": "Dr. Zalia Frond",
        "memberCount": 30,
        "tags": ["scholarly", "exploration", "history"],
    },
    {
        "id": "faction-SYS",
        "name": "Society of Young Stewards",
        "description": "A youth organization dedicated to environmental conservation and spirit harmony on Obojima. Members learn to tend the land, communicate with nature spirits, and combat corruption.",
        "goals": "Protect Obojima's natural environment, train the next generation of stewards, combat the spread of corruption",
        "reputation": 70,
        "power": 20,
        "alignment": "neutral good",
        "territory": "Chapters in most settlements, strongest in Matango and Uluwa",
        "allies": ["AHA"],
        "enemies": ["Domain of the Lionfish King"],
        "leader": "Rotating youth council",
        "memberCount": 40,
        "tags": ["environmental", "youth", "spiritual"],
    },
    {
        "id": "faction-PatchRobe",
        "name": "Patchwork Robe Coven",
        "description": "A coven of witches and hedge mages who practice folk magic, herbalism, and spirit-speaking. They wear distinctive patchwork robes made from cloth traded across the island.",
        "goals": "Preserve traditional magical practices, maintain balance between natural and spirit worlds, counter dark magic",
        "reputation": 50,
        "power": 45,
        "alignment": "neutral",
        "territory": "Scattered across the island, strongest near Mount Arbora",
        "allies": ["Cloud Cap Coven"],
        "enemies": ["Fish Head Coven"],
        "leader": "Granny Yuzu",
        "memberCount": 15,
        "tags": ["magic", "tradition", "herbalism"],
    },
    {
        "id": "faction-CloudCap",
        "name": "Cloud Cap Coven",
        "description": "Mountain-dwelling witches who practice weather magic and commune with sky spirits atop Mount Arbora. They are reclusive but respected for their ability to predict and influence storms.",
        "goals": "Monitor Mount Arbora's volcanic activity, maintain weather patterns, protect mountain spirit sanctuaries",
        "reputation": 55,
        "power": 50,
        "alignment": "neutral",
        "territory": "Upper slopes of Mount Arbora",
        "allies": ["Patchwork Robe Coven"],
        "enemies": [],
        "leader": "Unknown (the coven guards this secret)",
        "memberCount": 8,
        "tags": ["magic", "weather", "mountain"],
    },
    {
        "id": "faction-Crowsworn",
        "name": "The Crowsworn",
        "description": "A secretive network of spies, informants, and shadow operatives. They trade in secrets and information, serving no single master but always pursuing hidden agendas.",
        "goals": "Gather intelligence on all factions, manipulate events from the shadows, maintain their network of informants",
        "reputation": 30,
        "power": 40,
        "alignment": "neutral evil",
        "territory": "Agents in every settlement, no known headquarters",
        "allies": [],
        "enemies": ["Courier Brigade"],
        "leader": "Unknown",
        "memberCount": 25,
        "tags": ["espionage", "secrets", "shadow"],
    },
    {
        "id": "faction-GildGourd",
        "name": "League of the Gilded Gourd",
        "description": "A merchant guild and trade consortium that controls much of Obojima's inland commerce. Known for their golden gourd seal on trade agreements and their ruthless business practices.",
        "goals": "Monopolize inland trade, accumulate wealth, influence settlement governance through economic pressure",
        "reputation": 45,
        "power": 55,
        "alignment": "lawful evil",
        "territory": "Yatamon (primary), trade outposts in most settlements",
        "allies": [],
        "enemies": ["Society of Young Stewards"],
        "leader": "Gomber",
        "memberCount": 60,
        "tags": ["trade", "wealth", "politics"],
    },
    {
        "id": "faction-TallHats",
        "name": "The Tall Hats",
        "description": "An elite order of wizards and sorcerers who wear distinctive tall pointed hats. They consider themselves the island's magical authority and seek to regulate all arcane practice.",
        "goals": "Establish magical governance, regulate spirit pacts, maintain arcane supremacy over other magical practitioners",
        "reputation": 40,
        "power": 60,
        "alignment": "lawful neutral",
        "territory": "Tower in Yatamon, agents across the island",
        "allies": [],
        "enemies": ["Patchwork Robe Coven", "Cloud Cap Coven", "Fish Head Coven"],
        "leader": "Krocius",
        "memberCount": 12,
        "tags": ["magic", "authority", "arcane"],
    },
    {
        "id": "faction-FourSword",
        "name": "The Four Sword Schools",
        "description": "Four competing martial arts academies based in Yatamon, each teaching a distinct fighting style. They hold regular tournaments and their rivalries shape town politics.",
        "goals": "Train the finest warriors on Obojima, win the Grand Tournament, expand their school's prestige and enrollment",
        "reputation": 75,
        "power": 35,
        "alignment": "lawful neutral",
        "territory": "Yatamon (four separate dojos)",
        "allies": [],
        "enemies": [],
        "leader": "Master Hu (senior among the four masters)",
        "memberCount": 80,
        "tags": ["martial", "honor", "competition"],
    },
]

for faction in NEW_FACTIONS:
    if faction['name'] not in existing_faction_names:
        data['factions'].append(faction)
        print(f"  Added: {faction['name']}")
    else:
        print(f"  Already exists: {faction['name']}")

print(f"\n  Total factions: {len(data['factions'])}")

# =============================================================================
# 7. ADD: Clocks for new faction storylines
# =============================================================================
print("\n=== Adding faction clocks ===")

existing_clock_names = {c['name'] for c in data['clocks']}

NEW_CLOCKS = [
    {
        "id": "clock-MarRepair",
        "name": "Pointue Lighthouse Repair",
        "description": "The Mariners' Guild works to repair the damaged Pointue lighthouse, crucial for safe navigation around Obojima's treacherous reefs.",
        "segments": 6,
        "filledSegments": 1,
        "clockType": "progress",
        "factionId": "faction-MarGuild",
        "isVisible": True,
    },
    {
        "id": "clock-CourRoute",
        "name": "Courier Route Expansion",
        "description": "The Courier Brigade attempts to establish a reliable route through the Crawling Canopy, connecting isolated communities.",
        "segments": 4,
        "filledSegments": 0,
        "clockType": "progress",
        "factionId": "faction-CourBrig",
        "isVisible": True,
    },
    {
        "id": "clock-AHAExcav",
        "name": "AHA Undercity Excavation",
        "description": "AHA archaeologists dig deeper into pre-human ruins beneath the island, risking unleashing something ancient.",
        "segments": 8,
        "filledSegments": 2,
        "clockType": "progress",
        "factionId": "faction-AHA",
        "isVisible": True,
    },
    {
        "id": "clock-CorruptSpread",
        "name": "Corruption Spreading Westward",
        "description": "The Lionfish King's corruption creeps further from the eastern coastline, threatening more settlements and wildlife.",
        "segments": 6,
        "filledSegments": 2,
        "clockType": "doom",
        "factionId": "faction-PbhkQa-n",
        "isVisible": True,
    },
]

for clock in NEW_CLOCKS:
    if clock['name'] not in existing_clock_names:
        data['clocks'].append(clock)
        print(f"  Added: {clock['name']}")
    else:
        print(f"  Already exists: {clock['name']}")

# =============================================================================
# 8. VERIFY: Check for any remaining issues
# =============================================================================
print("\n=== Final verification ===")

issues = []

# Check all sites have ownerId
for loc in data['locations']:
    if loc['type'] != 'settlement':
        continue
    for site in loc.get('sites', []):
        if 'ownerId' not in site or not site['ownerId']:
            issues.append(f"Site '{site['name']}' in {loc['name']} missing ownerId")
        elif site['ownerId'] not in npc_by_id:
            issues.append(f"Site '{site['name']}' in {loc['name']} has invalid ownerId: {site['ownerId']}")

# Check mayorNpcId validity
for loc in data['locations']:
    if loc['type'] != 'settlement':
        continue
    mayor = loc.get('mayorNpcId')
    if mayor and mayor not in npc_by_id:
        issues.append(f"{loc['name']} has invalid mayorNpcId: {mayor}")

# Check all NPC references exist
for loc in data['locations']:
    if loc['type'] != 'settlement':
        continue
    for nid in loc.get('npcIds', []):
        if nid not in npc_by_id:
            issues.append(f"{loc['name']} references missing NPC: {nid}")

if issues:
    print("  ISSUES FOUND:")
    for issue in issues:
        print(f"    ❌ {issue}")
else:
    print("  ✅ No issues found!")

print(f"\n  Total locations: {len(data['locations'])}")
print(f"  Total NPCs: {len(data['npcs'])}")
print(f"  Total hooks: {len(data['hooks'])}")
print(f"  Total factions: {len(data['factions'])}")
print(f"  Total clocks: {len(data['clocks'])}")

# =============================================================================
# SAVE
# =============================================================================
data['updatedAt'] = 1738000000000  # Fresh timestamp

with open(OUTPUT, 'w') as f:
    json.dump(data, f, indent=2)

print(f"\n✅ Saved to {OUTPUT}")
print(f"  File size: {len(json.dumps(data)):,} bytes")
