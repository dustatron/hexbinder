#!/usr/bin/env python3
"""
Transform obojima.hexbinder.json with Obojima-themed world data.
Transforms: world metadata, hexes, settlements, dungeons, factions, clocks,
            edges, significant items, calendar events, state.
Preserves: npcs, hooks (untouched).
Also outputs npc_settlement_map.json mapping settlement IDs -> npcIds arrays.
"""

import json
import copy
from pathlib import Path

INPUT = Path("/Users/dmccord/Projects/vibeCode/hexbinder/temp/obojima.hexbinder.json")
OUTPUT = Path("/Users/dmccord/Projects/vibeCode/hexbinder/temp/obojima_core.json")
NPC_MAP_OUTPUT = Path("/Users/dmccord/Projects/vibeCode/hexbinder/temp/npc_settlement_map.json")


def main():
    with open(INPUT) as f:
        data = json.load(f)

    original = copy.deepcopy(data)
    changes = []

    # -- 1. World Metadata ---------------------------------------------------
    data["name"] = "Obojima"
    data["state"]["season"] = "summer"
    data["state"]["weather"] = {
        "condition": "clear",
        "temperature": "warm",
        "tempLow": 72,
        "tempHigh": 88,
        "wind": "breeze",
    }
    changes.append("World metadata: name='Obojima', season='summer', weather=clear/warm")

    # -- 2. Hex Terrain & Descriptions ----------------------------------------
    hex_updates = {
        # LAND HEXES
        (-3, 0): ("forest", "Giant mushrooms tower above the forest canopy. The air smells of rich earth and mycelium."),
        (-3, 1): ("swamp", "Lake Ellior stretches before you, its dark waters hiding the submerged tiers of an ancient ziggurat."),
        (-3, 2): ("plains", "Rolling hills of farmland. Sheep dragons graze among rusted-out First Age vehicles."),
        (-3, 3): ("plains", "Colorful sand structures rise from the beach, rebuilt by master sculptors. The Tower of Glass glints."),
        (-2, 2): ("plains", "Steep streets of an ancient First Age city climb the hillside. Vending machines and trolley cars everywhere."),
        (-2, 1): ("forest", "An abandoned fish market overlays a bustling spirit bazaar. Spirit fish drift between realms."),
        (-2, 0): ("hills", "A lighthouse perches on a rocky spit. Partially built structures crumble, reclaimed by colorful crabs."),
        (-2, -1): ("mountains", "Stone steps carved into the mountainside lead upward through thin air and alpine meadows."),
        (-1, -1): ("mountains", "Mount Arbora's snow-capped peak looms overhead. Meltwater cascades down rocky channels."),
        (-1, -2): ("forest", "The trees here move when you're not looking. Vines creep and branches shift\u2014the Crawling Canopy."),
        (0, 0): ("hills", "Hot springs bubble from cracks in the arid earth. Steam rises from carved pools at different elevations."),
        (0, 2): ("plains", "Uncommonly tall grass stretches endlessly, swaying in constant wind. Hidden paths through the Gale Fields."),
        (0, 3): ("plains", "The tall grass of the Gale Fields thins near the coast. A courier brigade fort guards a crossroads."),
        (0, -2): ("plains", "Deep within the Gale Fields, fish-head effigies mark the Fish Head Coven's domain."),
        (1, 2): ("mountains", "A massive bird's nest of woven branches and First Age debris between two peaks. Something enormous lives here."),
        (1, -2): ("plains", "Wind-swept grassland. Ancient nakudama road stones mark a forgotten highway."),
        (1, -3): ("swamp", "Stilted walkways connect ramshackle buildings over brackish water. The smell of mud eels."),
        (2, 0): ("forest", "A settlement built into the mountainside where legendary smiths forge rare alloys in volcanic heat."),
        (2, 1): ("swamp", "A village on stilts above murky wetlands. Wooden boardwalks connect homes and shops."),
        (2, -1): ("swamp", "Steam rises from a ramshackle building. The legendary scent of Hakumon's ramen draws travelers."),
        (2, -2): ("hills", "A plateau of craggy rock with dramatic ocean cliffs. An observatory perches at the highest point."),
        (3, 0): ("swamp", "Black ooze seeps from the ground. Plants are twisted and discolored. The Corruption has taken hold."),
        # WATER HEXES (terrain stays "water")
        (-1, 0): (None, "Warm coastal waters lap against golden beaches."),
        (-1, 1): (None, "Fish break the surface near the reef. The Shallows teem with colorful marine life."),
        (-1, 2): (None, "Gentle waves carry the scent of salt and flowers from the nearby coast."),
        (-1, 3): (None, "The southern coast stretches toward open ocean."),
        (0, 1): (None, "Reef formations create a natural harbor. Fishing boats bob at anchor."),
        (0, -1): (None, "The water grows deeper. Currents from the open ocean swirl against the reef."),
        (0, -3): (None, "Dark waters mark the domain of the Lionfish King. Fish folk patrols lurk beneath."),
        (1, 0): (None, "Warm currents from underwater vents create misty patches on the surface."),
        (1, 1): (None, "A half-sunken First Age vessel rests in the shallows, claimed by coral."),
        (1, -1): (None, "The water carries an oily sheen near the corrupted eastern coastline."),
        (2, -3): (None, "Deep water beyond the reef. Mariners' Guild buoys mark safe passage."),
        (3, -1): (None, "Corrupted water laps at twisted coral. Fish folk patrol these waters."),
        (3, -2): (None, "Open ocean. Fishermen say the currents pull you east."),
        (3, -3): (None, "The vast ocean. No one who sails beyond the horizon returns."),
        (-2, 3): (None, "Calm waters along the Gift of Shuritashi's southern coast."),
    }

    hex_count = 0
    for h in data["hexes"]:
        coord = (h["coord"]["q"], h["coord"]["r"])
        if coord in hex_updates:
            terrain, desc = hex_updates[coord]
            if terrain is not None:
                h["terrain"] = terrain
            h["description"] = desc
            hex_count += 1

    changes.append(f"Hexes: updated {hex_count}/{len(hex_updates)} hex terrains/descriptions")

    # -- 3. NPC Settlement Map (extract BEFORE modifying settlements) ----------
    npc_settlement_map = {}
    for loc in data["locations"]:
        if loc["type"] == "settlement" and "npcIds" in loc:
            npc_settlement_map[loc["id"]] = loc["npcIds"]

    # -- 4. Settlements -------------------------------------------------------
    settlement_updates = {
        "settlement-CbSD55DO": {
            "name": "Matango Village",
            "settlementType": "human",
            "size": "village",
            "population": 450,
            "governmentType": "council",
            "economyBase": ["farming", "crafting"],
            "mood": "prosperous",
            "tags": ["village", "mushroom farmers"],
            "trouble": "Mushroom poachers have set up camp nearby",
            "quirk": "All buildings are carved from giant mushrooms",
            "description": "A village of mushroom farmers in a magical forest where fungi grow to extraordinary sizes.",
            "sites": [
                {"id": "site-mat-tavern", "name": "The Moss Boiler", "type": "tavern", "description": "Outdoor food stall famous for moss boil noodles, run by beetle spirit Rokoko", "staffIds": [], "services": [{"name": "Moss Boil", "cost": "3 sp"}, {"name": "Ale", "cost": "4 cp"}, {"name": "Spirit Tea", "cost": "1 sp"}], "rumorSource": True, "noticeBoard": False},
                {"id": "site-mat-inn", "name": "Porcini Guest House", "type": "inn", "description": "Cozy mushroom-house inn run by the Porcini family", "staffIds": [], "services": [{"name": "Room (common)", "cost": "5 sp/night"}, {"name": "Room (private)", "cost": "2 gp/night"}, {"name": "Feast", "cost": "1 gp"}], "rumorSource": True, "noticeBoard": True},
            ],
        },
        "settlement-37cK4TIX": {
            "name": "Okiri Village",
            "settlementType": "human",
            "size": "village",
            "population": 320,
            "governmentType": "council",
            "economyBase": ["farming", "herding"],
            "mood": "prosperous",
            "tags": ["village", "farming", "sheep dragons"],
            "trouble": "Yokario spotted near the village outskirts",
            "quirk": "Villagers play blotcher using overripe produce as ammunition",
            "description": "A charming farming village known for sheep dragon herders and lively festivals.",
            "sites": [
                {"id": "site-oki-inn", "name": "High Hearth", "type": "inn", "description": "Tall timber hall\u2014meeting place, winter feast hall, and village refuge", "staffIds": [], "services": [{"name": "Room (common)", "cost": "5 sp/night"}, {"name": "Meal", "cost": "5 cp"}, {"name": "Stabling", "cost": "5 sp/night"}], "rumorSource": True, "noticeBoard": True},
                {"id": "site-oki-shop", "name": "Bree's Mercantile", "type": "shop", "description": "Merchant shop specializing in potion ingredients, run by prickly-skinned spirit Bree", "staffIds": [], "services": [{"name": "Potion ingredients", "cost": "varies"}, {"name": "General goods", "cost": "varies"}], "rumorSource": False, "noticeBoard": False},
            ],
        },
        "settlement-qaroUeGg": {
            "name": "Tidewater",
            "settlementType": "human",
            "size": "village",
            "population": 580,
            "governmentType": "council",
            "economyBase": ["crafting", "fishing"],
            "mood": "wary",
            "tags": ["village", "coastal", "sand sculptors"],
            "trouble": "Fish folk raiders attack from the sea at night",
            "quirk": "Every building is magically hardened colored sand, rebuilt constantly",
            "description": "The Village of Sand, where master sculptors create colorful structures and the Pearl of Rongol glows in the Tower of Glass.",
            "sites": [
                {"id": "site-tid-inn", "name": "Sandy Rest", "type": "inn", "description": "Sand-built inn that changes appearance weekly", "staffIds": [], "services": [{"name": "Room (common)", "cost": "5 sp/night"}, {"name": "Room (private)", "cost": "2 gp/night"}, {"name": "Meal", "cost": "5 cp"}], "rumorSource": True, "noticeBoard": True},
                {"id": "site-tid-tavern", "name": "Sculpture Park Cantina", "type": "tavern", "description": "Open-air tavern among sand sculptures", "staffIds": [], "services": [{"name": "Ale", "cost": "4 cp"}, {"name": "Wine", "cost": "2 sp"}, {"name": "Meal", "cost": "1 sp"}], "rumorSource": True, "noticeBoard": False},
            ],
        },
        "settlement-HmoL5chU": {
            "name": "Yatamon",
            "settlementType": "human",
            "size": "city",
            "population": 10000,
            "governmentType": "council",
            "economyBase": ["trade", "crafting"],
            "mood": "prosperous",
            "tags": ["city", "First Age", "trade hub"],
            "trouble": "An AHA ranger warns the Corruption is spreading westward",
            "quirk": "First Age magic grants long-term residents a cantrip",
            "description": "The largest city on Obojima, a First Age relic filled with vending machines, trolley cars, and ancient technology.",
            "sites": [
                {"id": "site-yat-shop", "name": "Happy Joy Cake Bakery", "type": "shop", "description": "Home of Obojima's most beloved delicacy, run by Master Hu", "staffIds": [], "services": [{"name": "Happy Joy Cake", "cost": "5 sp"}, {"name": "Elegant Tea Cake", "cost": "1 gp"}], "rumorSource": True, "noticeBoard": False},
                {"id": "site-yat-inn", "name": "The Beehive", "type": "inn", "description": "Capsule hotel of hexagonal sleeping pods\u2014free, first-come first-served", "staffIds": [], "services": [{"name": "Capsule (free)", "cost": "0"}, {"name": "Hot water", "cost": "1 cp"}], "rumorSource": True, "noticeBoard": True},
                {"id": "site-yat-tavern", "name": "Himitsu's Arcane Izakaya", "type": "tavern", "description": "Spirit tavern that vanishes by day, secret arcade in basement", "staffIds": [], "services": [{"name": "Spirit sake", "cost": "5 sp"}, {"name": "Ale", "cost": "4 cp"}, {"name": "Meal", "cost": "1 sp"}], "rumorSource": True, "noticeBoard": False},
                {"id": "site-yat-shop2", "name": "Jenni's General Store", "type": "shop", "description": "Potion ingredient hub run by a kind Witch and her two brothers", "staffIds": [], "services": [{"name": "Potion ingredients", "cost": "varies"}, {"name": "General goods", "cost": "varies"}], "rumorSource": False, "noticeBoard": False},
            ],
        },
        "settlement-e0MHafVM": {
            "name": "Uluwa",
            "settlementType": "human",
            "size": "village",
            "population": 800,
            "governmentType": "elder",
            "economyBase": ["trade", "fishing"],
            "mood": "prosperous",
            "tags": ["village", "spirit market", "Spirit Realm"],
            "trouble": "Thieves pickpocketing spirit vendors",
            "quirk": "Entire village exists in the Spirit Realm, superimposed over an abandoned fish market",
            "description": "A bustling Spirit Realm market town where spirits trade exotic fish and otherworldly wares.",
            "sites": [
                {"id": "site-ulu-tavern", "name": "Let's Have Another", "type": "tavern", "description": "Hall of joviality with multi-gravity tables on walls and ceiling", "staffIds": [], "services": [{"name": "Spirit Wine", "cost": "5 sp"}, {"name": "Sweet Wine", "cost": "3 sp"}, {"name": "Meal", "cost": "1 sp"}], "rumorSource": True, "noticeBoard": False},
                {"id": "site-ulu-shop", "name": "Bobbing Boat Market", "type": "shop", "description": "Fishing boats lashed together as floating stalls", "staffIds": [], "services": [{"name": "Spirit fish", "cost": "varies"}, {"name": "Exotic catches", "cost": "varies"}], "rumorSource": True, "noticeBoard": True},
            ],
        },
        "settlement-VuGghMRN": {
            "name": "Hogstone Hot Springs",
            "settlementType": "human",
            "size": "village",
            "population": 250,
            "governmentType": "elder",
            "economyBase": ["trade", "crafting"],
            "mood": "prosperous",
            "tags": ["village", "hot springs", "healing"],
            "trouble": "A man covered in glowing red sores arrived, infected by the Corruption",
            "quirk": "Three magical pools\u2014Emerald, Amber, Azure\u2014offer supernatural healing",
            "description": "A mountain spa town built around geothermally heated pools, known for healing waters.",
            "sites": [
                {"id": "site-hog-inn", "name": "Hogstone Lodge", "type": "inn", "description": "Comfortable mountain lodge with bungalows alongside hot springs", "staffIds": [], "services": [{"name": "Room (bungalow)", "cost": "2 gp/night"}, {"name": "Hot spring access", "cost": "5 sp"}, {"name": "Meal", "cost": "5 cp"}], "rumorSource": True, "noticeBoard": True},
                {"id": "site-hog-shop", "name": "Adira's Apothecary", "type": "shop", "description": "Healing practice filled with jars of herbs and medicinal plants", "staffIds": [], "services": [{"name": "Healing consultation", "cost": "1 gp"}, {"name": "Herbal remedy", "cost": "5 sp"}, {"name": "Potion ingredients", "cost": "varies"}], "rumorSource": False, "noticeBoard": False},
            ],
        },
        "settlement-_N0PVVNb": {
            "name": "Polewater Village",
            "settlementType": "human",
            "size": "village",
            "population": 350,
            "governmentType": "elder",
            "economyBase": ["fishing"],
            "mood": "fearful",
            "tags": ["village", "wetlands", "stilts"],
            "trouble": "The Corruption encroaches from the eastern coastline",
            "quirk": "Entire village built on stilts above the swamp",
            "description": "A hardscrabble stilts village in the Brackwater Wetlands.",
            "sites": [
                {"id": "site-pol-inn", "name": "The Mud Eel", "type": "inn", "description": "Creaking stilted inn above the swamp, hearty eel stew", "staffIds": [], "services": [{"name": "Room (common)", "cost": "3 sp/night"}, {"name": "Eel Stew", "cost": "3 cp"}, {"name": "Stabling", "cost": "3 sp/night"}], "rumorSource": True, "noticeBoard": True},
                {"id": "site-pol-shop", "name": "Polewater Trading Post", "type": "shop", "description": "Only supply shop for miles", "staffIds": [], "services": [{"name": "Rations", "cost": "5 sp"}, {"name": "Rope (50ft)", "cost": "1 gp"}, {"name": "Torches (6)", "cost": "1 sp"}], "rumorSource": True, "noticeBoard": False},
            ],
        },
        "settlement-kCsR6cxU": {
            "name": "Toggle",
            "settlementType": "human",
            "size": "hamlet",
            "population": 120,
            "governmentType": "elder",
            "economyBase": ["mining", "crafting"],
            "mood": "busy",
            "tags": ["hamlet", "mountain", "smithing"],
            "trouble": "A territorial mountain beast stalks the paths",
            "quirk": "Legendary smiths Duro and Garo forge rare alloys from volcanic minerals",
            "description": "A small mountain settlement on Mount Arbora known for its master smiths.",
            "sites": [
                {"id": "site-tog-inn", "name": "The Anvil Rest", "type": "inn", "description": "Stone inn heated by volcanic vents", "staffIds": [], "services": [{"name": "Room", "cost": "5 sp/night"}, {"name": "Meal", "cost": "5 cp"}, {"name": "Forge rental", "cost": "1 gp/day"}], "rumorSource": True, "noticeBoard": True},
                {"id": "site-tog-shop", "name": "The Twin Forge", "type": "shop", "description": "Legendary forge of Duro and Garo", "staffIds": [], "services": [{"name": "Custom metalwork", "cost": "varies"}, {"name": "Rare alloy sheet", "cost": "50 gp"}], "rumorSource": False, "noticeBoard": False},
            ],
        },
    }

    settlement_count = 0
    for loc in data["locations"]:
        if loc["id"] in settlement_updates:
            updates = settlement_updates[loc["id"]]
            for key, val in updates.items():
                loc[key] = val
            settlement_count += 1

    changes.append(f"Settlements: updated {settlement_count}/{len(settlement_updates)}")

    # -- 5. Dungeons ----------------------------------------------------------
    dungeon_updates = {
        "dungeon-bqafTLDH": {"name": "Temple of Shoom", "description": "Ancient nakudama ziggurat, mostly submerged in Lake Ellior. Recently rediscovered by midwives.", "tags": ["large", "temple"], "theme": "temple", "size": "large", "depth": 3},
        "dungeon-Jv9NpCZZ": {"name": "Coastal Divers' Lodge (North)", "description": "Northern branch of the Mariners' Guild at Pelican's Nest Lighthouse. Home to Holly Clintock.", "tags": ["small", "outpost"], "theme": "outpost", "size": "small", "depth": 1},
        "dungeon-qooARykv": {"name": "The Graysteps", "description": "Ancient stone steps carved into Mount Arbora, leading to hidden alpine meadows.", "tags": ["medium", "ruins"], "theme": "ruins", "size": "medium", "depth": 2},
        "dungeon-YN2lLblj": {"name": "Domain of the Fish Head Coven", "description": "Stronghold of the Fish Head Coven, hidden in the Gale Fields behind magical wards.", "tags": ["large", "stronghold"], "theme": "stronghold", "size": "large", "depth": 2},
        "dungeon-yIL6pItd": {"name": "The Crawling Canopy", "description": "A vast magical forest that moves and shifts. Trees walk, vines creep.", "tags": ["large", "wilderness"], "theme": "wilderness", "size": "large", "depth": 2},
        "dungeon-M42RS8S-": {"name": "Jumaga's Roost", "description": "Massive nest of woven branches between mountain peaks. Home to colossal bird spirit Jumaga.", "tags": ["medium", "lair"], "theme": "lair", "size": "medium", "depth": 1},
        "dungeon-pNKQj3ws": {"name": "Corrupted Coastline", "description": "Eastern shore where the Corruption emerged. Twisted plants, black ooze, corrupted spirits.", "tags": ["large", "wilderness"], "theme": "wilderness", "size": "large", "depth": 2},
        "dungeon-DUsbpKcn": {"name": "Hakumon's Ramen Shop", "description": "Legendary ramen shop of Hakumon, oni sorcerer and brother to tea master Chisuay.", "tags": ["small", "outpost"], "theme": "outpost", "size": "small", "depth": 1},
        "dungeon-qTQ51c_U": {"name": "Roa Kala", "description": "Remote settlement deep in the Brackwater Wetlands, connected by precarious boardwalks.", "tags": ["medium", "settlement"], "theme": "ruins", "size": "medium", "depth": 1},
        "dungeon-SgXJriDd": {"name": "AHA Headquarters", "description": "Observatory HQ of the Archaeologists, Historians & Archivists on Coastal Highlands cliffs.", "tags": ["medium", "outpost"], "theme": "outpost", "size": "medium", "depth": 2},
        "dungeon-ic32fqpx": {"name": "Domain of the Lionfish King", "description": "Underwater domain of the paranoid Lionfish King, commanding vast fish folk armies.", "tags": ["large", "stronghold"], "theme": "stronghold", "size": "large", "depth": 3},
    }

    dungeon_count = 0
    for loc in data["locations"]:
        if loc["id"] in dungeon_updates:
            updates = dungeon_updates[loc["id"]]
            for key, val in updates.items():
                loc[key] = val
            dungeon_count += 1

    changes.append(f"Dungeons: updated {dungeon_count}/{len(dungeon_updates)}")

    # -- 6. Factions ----------------------------------------------------------
    faction_updates = {
        "faction-o3Wd4Xcu": {
            "name": "Fish Head Coven",
            "description": "The most powerful witch coven on Obojima, controlling magical ingredient trade from the Gale Fields.",
            "archetype": "arcane",
            "factionType": "guild",
            "purpose": "controlling magical ingredient trade",
            "lair": {"hexCoord": {"q": 0, "r": -2}, "dungeonId": "dungeon-YN2lLblj"},
            "scale": "regional",
            "advantages": [
                {"type": "knowledge", "name": "Magical ingredient monopoly", "description": "Controls rare ingredient trade across the island"},
                {"type": "territory", "name": "Hidden domain in Gale Fields", "description": "Stronghold concealed in tall grass, warded by powerful magic"},
            ],
            "agenda": [
                {"id": "goal-fhc1", "order": 1, "description": "Expand control over ingredient sources in every region"},
                {"id": "goal-fhc2", "order": 2, "description": "Investigate the Corruption for arcane potential"},
                {"id": "goal-fhc3", "order": 3, "description": "Recruit promising young witches from across the island"},
            ],
        },
        "faction-PbhkQa-n": {
            "name": "Domain of the Lionfish King",
            "description": "The Lionfish King rules fish folk warriors in the Shallows, growing paranoid since the Corruption's arrival.",
            "archetype": "military",
            "factionType": "kingdom",
            "purpose": "asserting dominion over the Shallows and coastal settlements",
            "lair": {"hexCoord": {"q": 0, "r": -3}, "dungeonId": "dungeon-ic32fqpx"},
            "scale": "regional",
            "advantages": [
                {"type": "military", "name": "Fish folk army", "description": "Commands hundreds of fish folk warriors striking from the sea"},
                {"type": "territory", "name": "The Shallows", "description": "Controls the reef surrounding Obojima"},
            ],
            "agenda": [
                {"id": "goal-lk1", "order": 1, "description": "Destroy Captain Clintock and the Pointue"},
                {"id": "goal-lk2", "order": 2, "description": "Raid Tidewater and claim the Pearl of Rongol"},
                {"id": "goal-lk3", "order": 3, "description": "Drive back the Corruption threatening his domain"},
            ],
        },
    }

    faction_count = 0
    for faction in data["factions"]:
        if faction["id"] in faction_updates:
            updates = faction_updates[faction["id"]]
            for key, val in updates.items():
                faction[key] = val
            faction_count += 1

    changes.append(f"Factions: updated {faction_count}/{len(faction_updates)}")

    # -- 7. Clocks ------------------------------------------------------------
    clock_updates = {
        "clock-V_zU90BU": {
            "name": "Fish Head Coven: Ingredient Monopoly",
            "description": "The Fish Head Coven is consolidating control over rare magical ingredients",
            "ownerId": "faction-o3Wd4Xcu",
            "consequences": [
                {"description": "The coven controls all rare ingredient trade", "type": "event"},
                {"description": "Independent witches forced to submit", "type": "state_change"},
            ],
        },
        "clock-Aqweft9h": {
            "name": "Lionfish King: Coastal Raids",
            "description": "The Lionfish King is escalating raids on coastal settlements",
            "ownerId": "faction-PbhkQa-n",
            "consequences": [
                {"description": "Major attack on Tidewater", "type": "event"},
                {"description": "Coastal villages cut off from sea trade", "type": "state_change"},
            ],
        },
    }

    clock_count = 0
    for clock in data["clocks"]:
        if clock["id"] in clock_updates:
            updates = clock_updates[clock["id"]]
            for key, val in updates.items():
                clock[key] = val
            clock_count += 1

    changes.append(f"Clocks: updated {clock_count}/{len(clock_updates)}")

    # -- 8. Edges -------------------------------------------------------------
    data["edges"] = [
        {"from": {"q": -2, "r": 2}, "to": {"q": -2, "r": 1}, "type": "road"},
        {"from": {"q": -3, "r": 2}, "to": {"q": -2, "r": 2}, "type": "road"},
        {"from": {"q": -3, "r": 3}, "to": {"q": -2, "r": 2}, "type": "road"},
        {"from": {"q": -2, "r": 2}, "to": {"q": -1, "r": -1}, "type": "road"},
        {"from": {"q": 0, "r": 0}, "to": {"q": -1, "r": -1}, "type": "road"},
        {"from": {"q": -1, "r": -1}, "to": {"q": -2, "r": 1}, "type": "river"},
        {"from": {"q": -1, "r": -1}, "to": {"q": 0, "r": 0}, "type": "river"},
        {"from": {"q": 0, "r": 2}, "to": {"q": 1, "r": 2}, "type": "river"},
    ]
    changes.append("Edges: replaced all 8 edges")

    # -- 9. Significant Items -------------------------------------------------
    data["significantItems"] = [
        {
            "id": "sig-item-2UG8BPXK",
            "name": "The Pearl of Rongol",
            "type": "relic",
            "rarity": "legendary",
            "description": "An enormous pearl glowing with inner light, housed in the Tower of Glass in Tidewater",
            "effect": "Grants visions of coming events; may be calling to something in the deep ocean",
            "history": "Pulled from the sea by diver Rongol. Lightning struck the sand, creating the Tower of Glass.",
            "significance": "A beacon calling to an unknown power in the ocean depths",
            "status": "hidden",
            "desiredByFactionIds": ["faction-PbhkQa-n"],
            "desiredByNpcIds": [],
        },
        {
            "id": "sig-item-hORgN71X",
            "name": "Chisuay's Heavenly Tea",
            "type": "potion",
            "rarity": "rare",
            "description": "A beautifully wrapped package of fragrant tea, each blend unique",
            "effect": "Grants euphoria or renewed vitality",
            "history": "Perfected by tea master Chisuay over decades in his mountaintop teahouse.",
            "significance": "Known across all of Obojima as the finest tea",
            "status": "known",
            "desiredByFactionIds": [],
            "desiredByNpcIds": [],
        },
        {
            "id": "sig-item-qErQDUAw",
            "name": "The Pointue's Horn",
            "type": "artifact",
            "rarity": "rare",
            "description": "The swordfish-shaped prow of Captain Clintock's submarine",
            "effect": "Can pierce magical barriers and stretch through narrow passages",
            "history": "Designed by Holly Clintock and enchanted by the Mariners' Guild.",
            "significance": "The key component of the most advanced submersible on Obojima",
            "status": "known",
            "desiredByFactionIds": ["faction-PbhkQa-n"],
            "desiredByNpcIds": [],
        },
        {
            "id": "sig-item-qsJS9EIo",
            "name": "Happy Joy Cake",
            "type": "consumable",
            "rarity": "uncommon",
            "description": "A delicious pastry made with love and First Age magic by Master Hu",
            "effect": "Grants 1d4 temp HP and advantage on CHA checks for 1 hour",
            "history": "Perfected over 50 years at the Happy Joy Cake Bakery in Yatamon.",
            "significance": "Obojima's most famous delicacy",
            "status": "known",
            "desiredByFactionIds": [],
            "desiredByNpcIds": [],
        },
    ]
    changes.append("Significant Items: replaced all 4 items")

    # -- 10. Calendar Events --------------------------------------------------
    event_pool = [
        {"type": "clock_tick", "description": "Fish Head Coven witches seen gathering rare ingredients", "linkedFactionId": "faction-o3Wd4Xcu"},
        {"type": "clock_tick", "description": "Lionfish King's fish folk raiders spotted near the coast", "linkedFactionId": "faction-PbhkQa-n"},
        {"type": "arrival", "description": "Courier Brigade delivery arrives at Okiri Village", "linkedLocationId": "settlement-37cK4TIX"},
        {"type": "arrival", "description": "Travelers from the Land of Hot Water reach Yatamon", "linkedLocationId": "settlement-HmoL5chU"},
        {"type": "discovery", "description": "Corruption patch found near Polewater Village", "linkedLocationId": "settlement-_N0PVVNb"},
        {"type": "festival", "description": "Mushroom harvest market day in Matango Village", "linkedLocationId": "settlement-CbSD55DO"},
        {"type": "sighting", "description": "Spirit festival draws visitors to Uluwa", "linkedLocationId": "settlement-e0MHafVM"},
        {"type": "rumor", "description": "Strange lights seen in the Temple of Shoom", "linkedLocationId": "dungeon-bqafTLDH"},
        {"type": "threat", "description": "Fish folk war party assembles in the Shallows", "linkedFactionId": "faction-PbhkQa-n"},
        {"type": "trade", "description": "Rare ingredients arrive at Hogstone Hot Springs", "linkedLocationId": "settlement-VuGghMRN"},
        {"type": "rumor", "description": "Crawling Canopy seen moving toward the Gale Fields", "linkedLocationId": "dungeon-yIL6pItd"},
        {"type": "arrival", "description": "AHA researchers pass through Toggle", "linkedLocationId": "settlement-kCsR6cxU"},
    ]

    event_counter = 1
    pool_idx = 0
    calendar = data["state"]["calendar"]

    for day_entry in calendar:
        new_events = []
        for _ in range(3):
            event_id = f"event-obj-{event_counter:03d}"
            event_data = dict(event_pool[pool_idx % len(event_pool)])
            event_data["id"] = event_id
            new_events.append(event_data)
            event_counter += 1
            pool_idx += 1
        day_entry["events"] = new_events

    changes.append(f"Calendar: replaced events for {len(calendar)} days ({event_counter - 1} events total)")

    # -- Save outputs ---------------------------------------------------------
    with open(OUTPUT, "w") as f:
        json.dump(data, f, indent=2)

    with open(NPC_MAP_OUTPUT, "w") as f:
        json.dump(npc_settlement_map, f, indent=2)

    # -- Summary --------------------------------------------------------------
    print("=" * 60)
    print("TRANSFORMATION SUMMARY")
    print("=" * 60)
    for c in changes:
        print(f"  - {c}")
    print()
    print(f"Output: {OUTPUT}")
    print(f"  Size: {OUTPUT.stat().st_size:,} bytes")
    print(f"NPC map: {NPC_MAP_OUTPUT}")
    print(f"  Size: {NPC_MAP_OUTPUT.stat().st_size:,} bytes")
    print(f"  Settlements mapped: {len(npc_settlement_map)}")
    total_npcs = sum(len(v) for v in npc_settlement_map.values())
    print(f"  Total NPC IDs preserved: {total_npcs}")
    print()

    # Verify untouched sections
    assert data["npcs"] == original["npcs"], "NPCs were modified!"
    assert data["hooks"] == original["hooks"], "Hooks were modified!"
    print("Verified: npcs and hooks are UNTOUCHED")

    # Show NPC map preview
    print()
    print("NPC Settlement Map preview:")
    for sid, npc_ids in npc_settlement_map.items():
        settlement_name = next(
            (s["name"] for s in data["locations"] if s["id"] == sid), "?"
        )
        print(f"  {sid} ({settlement_name}): {len(npc_ids)} NPCs")


if __name__ == "__main__":
    main()
