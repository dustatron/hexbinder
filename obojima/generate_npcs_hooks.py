#!/usr/bin/env python3
"""Generate Obojima-themed NPCs and hooks, preserving original IDs."""

import json
import random

# Load original data
with open("/Users/dmccord/Projects/vibeCode/hexbinder/temp/obojima.hexbinder.json") as f:
    data = json.load(f)

orig_npcs = data["npcs"]
orig_hooks = data["hooks"]
orig_locations = data["locations"]

# Extract original NPC IDs and locationIds
npc_id_map = {n["id"]: n.get("locationId") for n in orig_npcs}

# Settlement to NPC ID mapping from original
settlement_npc_map = {}
for loc in orig_locations:
    if loc["id"].startswith("settlement-"):
        settlement_npc_map[loc["id"]] = loc.get("npcIds", [])

# Unattached NPCs
all_settlement_npc_ids = set()
for nids in settlement_npc_map.values():
    all_settlement_npc_ids.update(nids)
unattached = [n for n in orig_npcs if n["id"] not in all_settlement_npc_ids]


def make_npc(npc_id, name, race, gender, desc, feature, archetype, threat, age, role, tags, location_id):
    return {
        "id": npc_id,
        "name": name,
        "race": race,
        "gender": gender,
        "description": desc,
        "distinguishingFeature": feature,
        "archetype": archetype,
        "threatLevel": threat,
        "age": age,
        "role": role,
        "relationships": [],
        "flavorWant": "",
        "wants": [],
        "status": "alive",
        "tags": tags,
        "locationId": location_id,
    }


npcs = []

# == Polewater Village (settlement-_N0PVVNb) == 9 NPCs ==
pw_ids = settlement_npc_map["settlement-_N0PVVNb"]
pw_named = [
    make_npc(pw_ids[0], "Zolde", "nakudama", "female",
             "Village leader of Polewater, a stilt-village over brackish wetlands. Zolde is fierce, practical, and deeply protective of her people.",
             "Iridescent scale patterns on her forearms", "noble", 3, 42, "village leader",
             ["leader", "nakudama", "wetland"], "settlement-_N0PVVNb"),
    make_npc(pw_ids[1], "Paloma Clintock", "human", "female",
             "AHA ranger stationed at Polewater. Paloma patrols the wetlands and tracks corruption spread from the south.",
             "Carries a weathered crossbow named 'Whisper'", "guardian", 3, 34, "ranger",
             ["ranger", "AHA", "patrol"], "settlement-_N0PVVNb"),
    make_npc(pw_ids[2], "Hakumon", "human", "male",
             "Jovial ramen chef who runs the only hot-food stall in Polewater. Secretly an oni in human guise, drawn by the village's spiritual energy.",
             "Steam perpetually rising from his hands", "trickster", 4, 58, "chef",
             ["oni", "secret", "cook"], "settlement-_N0PVVNb"),
]
pw_extras = [
    ("Tanisu", "human", "male", "Pole fisherman who knows every channel in the wetlands", "Fingers stained blue from dye-fish", "commoner", 1, 29, "fisherman", ["fisherman", "wetland"]),
    ("Koru", "nakudama", "male", "Young guide who leads travelers through the safe paths of the bog", "Always barefoot, even on sharp reeds", "scout", 2, 19, "guide", ["guide", "wetland"]),
    ("Weshi", "human", "female", "Elderly basket-weaver who makes waterproof containers from swamp reeds", "Missing her left ear from a gator attack", "artisan", 1, 67, "weaver", ["artisan", "wetland"]),
    ("Doba", "nakudama", "female", "Herb gatherer who collects medicinal plants from deep in the marsh", "Crown of woven water lilies", "healer", 2, 35, "herbalist", ["herbalist", "wetland"]),
    ("Nalli", "human", "male", "Dock hand who manages the small flotilla of punts and coracles", "Massive arms from years of poling boats", "commoner", 1, 44, "dock worker", ["laborer", "wetland"]),
    ("Reen", "human", "female", "Quiet trapper who sets snares for marsh hares and monitors wildlife", "A live frog always sitting on her shoulder", "scout", 2, 26, "trapper", ["trapper", "wetland"]),
]
for i, (name, race, gender, desc, feat, arch, threat, age, role, tags) in enumerate(pw_extras):
    pw_named.append(make_npc(pw_ids[3 + i], name, race, gender, desc, feat, arch, threat, age, role, tags, "settlement-_N0PVVNb"))
npcs.extend(pw_named)

# == Okiri Village (settlement-37cK4TIX) == 6 NPCs ==
ok_ids = settlement_npc_map["settlement-37cK4TIX"]
ok_npcs = [
    make_npc(ok_ids[0], "Broad Naldo", "human", "male",
             "Massive farmer who tends Okiri's terraced rice paddies. His booming voice carries across the valley.",
             "Arms like tree trunks, always carrying a hoe", "commoner", 2, 48, "farmer",
             ["farmer", "strong"], "settlement-37cK4TIX"),
    make_npc(ok_ids[1], "Miss Lindley", "human", "female",
             "Eccentric artisan and hedge witch who crafts talismans from mountain flowers. Knows more than she lets on about the old magic.",
             "Fingers permanently stained purple from herb work", "sage", 3, 55, "artisan",
             ["witch", "artisan", "crafts"], "settlement-37cK4TIX"),
    make_npc(ok_ids[2], "Wenneth", "human", "female",
             "Sword champion of Okiri who won the annual blade tournament three years running. Trains anyone willing to learn.",
             "A thin scar running from temple to jaw", "warrior", 4, 31, "sword champion",
             ["fighter", "champion", "trainer"], "settlement-37cK4TIX"),
    make_npc(ok_ids[3], "Morna", "nakudama", "female",
             "A child who plays among the fields but listens to everything. Reports to Zolde in Polewater via messenger birds.",
             "Oversized hat that hides her face", "trickster", 1, 11, "spy",
             ["spy", "child", "nakudama"], "settlement-37cK4TIX"),
    make_npc(ok_ids[4], "Thim Torrelli", "human", "male",
             "Gentle shepherd who grazes his flock on the high meadows above Okiri. Twin brother to Torrio.",
             "Plays a wooden flute beautifully", "commoner", 1, 38, "shepherd",
             ["shepherd", "twin"], "settlement-37cK4TIX"),
    make_npc(ok_ids[5], "Torrio Torrelli", "human", "male",
             "Shepherd and twin to Thim. More hot-headed than his brother, fiercely protective of the village flocks.",
             "Identical to Thim except for a broken nose", "commoner", 2, 38, "shepherd",
             ["shepherd", "twin"], "settlement-37cK4TIX"),
]
npcs.extend(ok_npcs)

# == Matango Village (settlement-CbSD55DO) == 8 NPCs ==
mt_ids = settlement_npc_map["settlement-CbSD55DO"]
mt_npcs = [
    make_npc(mt_ids[0], "Rokoko", "spirit", "nonbinary",
             "A jewel beetle spirit who runs Matango's finest kitchen. Rokoko's dishes use rare fungi and are legendary across Obojima.",
             "Carapace that shimmers between emerald and copper", "artisan", 2, 120, "chef",
             ["spirit", "chef", "beetle"], "settlement-CbSD55DO"),
    make_npc(mt_ids[1], "Madame Porcini", "human", "female",
             "Proprietor of the Spore & Slumber inn. Madame Porcini knows every rumor that passes through Matango's fungal groves.",
             "Mushroom-shaped hat that she never removes", "merchant", 2, 52, "innkeeper",
             ["innkeeper", "gossip"], "settlement-CbSD55DO"),
    make_npc(mt_ids[2], "Reheni", "human", "female",
             "Self-proclaimed 'Truffle Prince' of Matango. Reheni has an uncanny nose for the rarest underground fungi.",
             "Always dusted in spores", "noble", 2, 27, "truffle hunter",
             ["hunter", "fungi"], "settlement-CbSD55DO"),
    make_npc(mt_ids[3], "Chogo", "human", "male",
             "Leader of a small gang that controls the black-market mushroom trade. Charming but ruthless when crossed.",
             "Gold-capped tooth shaped like a mushroom", "villain", 4, 33, "gang leader",
             ["criminal", "gang", "mushroom"], "settlement-CbSD55DO"),
    make_npc(mt_ids[4], "Marvolio Chanterelle", "human", "male",
             "Flamboyant fashionista who designs clothing from bioluminescent fungal fibers. His creations glow in the dark.",
             "Clothes that softly glow in shifting colors", "artisan", 1, 29, "fashionista",
             ["artisan", "fashion", "fungi"], "settlement-CbSD55DO"),
    make_npc(mt_ids[5], "Mama Amala", "human", "female",
             "Retired monk who settled in Matango to study the spiritual properties of the great mycelium network.",
             "Prayer beads made of petrified fungal caps", "sage", 3, 68, "monk",
             ["monk", "spiritual"], "settlement-CbSD55DO"),
    make_npc(mt_ids[6], "Myron", "human", "male",
             "Druid who tends the fungal groves and maintains the delicate balance between the mushroom colonies and the forest.",
             "Bark-like skin patches on his hands", "sage", 3, 45, "druid",
             ["druid", "nature"], "settlement-CbSD55DO"),
    make_npc(mt_ids[7], "Bree", "spirit", "female",
             "Tiny merchant spirit who sells curios and oddities from a stall made of giant shelf fungi.",
             "Translucent wings that buzz when excited", "merchant", 1, 80, "merchant",
             ["spirit", "merchant"], "settlement-CbSD55DO"),
]
npcs.extend(mt_npcs)

# == Uluwa (settlement-e0MHafVM) == 6 NPCs ==
ul_ids = settlement_npc_map["settlement-e0MHafVM"]
ul_npcs = [
    make_npc(ul_ids[0], "Master of Ceremonies", "spirit", "male",
             "The enigmatic host of Uluwa's floating spirit market. Nobody knows his true name. He orchestrates the nightly gatherings with theatrical flair.",
             "A mask that changes expression on its own", "noble", 4, 300, "host",
             ["spirit", "leader", "mysterious"], "settlement-e0MHafVM"),
    make_npc(ul_ids[1], "Humble Utzu", "spirit", "male",
             "Supposedly humble spirit who runs a 'legitimate' trading post. Actually the island's most prolific smuggler of First Age artifacts.",
             "Eyes that glow faintly in the dark", "trickster", 3, 150, "smuggler",
             ["spirit", "smuggler", "artifacts"], "settlement-e0MHafVM"),
    make_npc(ul_ids[2], "Emille", "dara", "male",
             "Wandering busker who plays haunting melodies on a bone flute. His music can calm spirits and agitate the living.",
             "Antlers adorned with tiny bells", "artisan", 2, 35, "busker",
             ["dara", "musician"], "settlement-e0MHafVM"),
    make_npc(ul_ids[3], "Throth", "spirit", "nonbinary",
             "Self-appointed constable of Uluwa who keeps order among the spirits. Stern but fair, and secretly lonely.",
             "A badge made from a polished river stone", "guardian", 3, 200, "constable",
             ["spirit", "law"], "settlement-e0MHafVM"),
    make_npc(ul_ids[4], "Orble the Fisher", "spirit", "male",
             "Ancient spirit fishmonger who catches spirit fish with his bare hands from the luminescent pools beneath Uluwa.",
             "Hands that shimmer like fish scales", "commoner", 2, 250, "fishmonger",
             ["spirit", "fishmonger"], "settlement-e0MHafVM"),
    make_npc(ul_ids[5], "Dapo", "spirit", "male",
             "Master of fermented fish paste, a delicacy among spirits. His recipes are generations old and fiercely guarded.",
             "Perpetual smell of fermented fish that spirits find intoxicating", "artisan", 2, 180, "artisan",
             ["spirit", "food", "fermentation"], "settlement-e0MHafVM"),
]
npcs.extend(ul_npcs)

# == Yatamon (settlement-HmoL5chU) == 28 NPCs ==
ya_ids = settlement_npc_map["settlement-HmoL5chU"]
ya_named = [
    make_npc(ya_ids[0], "Master Hu", "human", "male",
             "Legendary baker whose Happy Joy Cakes are famous across Obojima. His bakery is a Yatamon landmark.",
             "Flour permanently dusted in his eyebrows", "artisan", 1, 62, "baker",
             ["baker", "famous"], "settlement-HmoL5chU"),
    make_npc(ya_ids[1], "Cholly", "spirit", "male",
             "Conductor of Yatamon's rickety trolley system. Cholly knows every street and shortcut in the city.",
             "A conductor's cap that floats slightly above his head", "commoner", 1, 90, "conductor",
             ["spirit", "transport"], "settlement-HmoL5chU"),
    make_npc(ya_ids[2], "Himitsu", "spirit", "nonbinary",
             "Keeper of the Whispering Lantern tavern, where secrets are the preferred currency. Himitsu collects rumors like others collect coins.",
             "Lantern eyes that dim when they're listening intently", "trickster", 3, 140, "tavern keeper",
             ["spirit", "tavern", "secrets"], "settlement-HmoL5chU"),
    make_npc(ya_ids[3], "Jenni", "human", "female",
             "Cheerful shopkeeper who runs the general store. Jenni stocks everything from rope to rare tea blends.",
             "Apron with impossibly many pockets", "merchant", 1, 28, "shopkeeper",
             ["merchant", "general store"], "settlement-HmoL5chU"),
    make_npc(ya_ids[4], "PM Escalante", "human", "female",
             "Yatamon's meticulous postmaster who oversees the Courier Brigade's city operations. Nothing enters or leaves without her knowledge.",
             "Ink-stained fingers and reading spectacles", "sage", 2, 51, "postmaster",
             ["postal", "bureaucrat"], "settlement-HmoL5chU"),
    make_npc(ya_ids[5], "Gomber", "human", "male",
             "Private detective who works the back alleys of Yatamon. Gruff, cynical, but has a soft spot for lost causes.",
             "A battered fedora and a magnifying glass on a chain", "scout", 3, 47, "detective",
             ["detective", "investigator"], "settlement-HmoL5chU"),
    make_npc(ya_ids[6], "Granny Yuzu", "human", "female",
             "Eccentric collector of First Age artifacts. Her cramped shop is a treasure trove of ancient oddities.",
             "Spectacles with multiple rotating lenses", "sage", 2, 78, "collector",
             ["collector", "artifacts", "sage"], "settlement-HmoL5chU"),
    make_npc(ya_ids[7], "Tatsu", "human", "male",
             "Leader of the Jade Fang gang. Controls the dockside district through intimidation and a network of informants.",
             "Jade-green tattoo of a serpent coiling up his neck", "villain", 4, 36, "gang leader",
             ["criminal", "gang leader"], "settlement-HmoL5chU"),
    make_npc(ya_ids[8], "Mikiko", "human", "female",
             "Young apprentice witch studying under an absent master. Eager but prone to magical mishaps.",
             "Hair that changes color with her mood", "sage", 2, 17, "apprentice witch",
             ["witch", "apprentice", "magic"], "settlement-HmoL5chU"),
    make_npc(ya_ids[9], "Dr. Zalia Frond", "human", "female",
             "Brilliant scholar researching the Corruption's origin. She believes it's connected to First Age technology buried beneath the island.",
             "Always carries a leather journal filled with diagrams", "sage", 3, 41, "scholar",
             ["scholar", "corruption", "research"], "settlement-HmoL5chU"),
    make_npc(ya_ids[10], "Krocius", "nakudama", "male",
             "Historian and linguist who can read First Age inscriptions. Quiet and methodical, he works closely with Dr. Frond.",
             "Spectacles with one cracked lens he refuses to replace", "sage", 2, 55, "scholar",
             ["scholar", "linguist", "nakudama"], "settlement-HmoL5chU"),
    make_npc(ya_ids[11], "Lula", "spirit", "female",
             "Proprietor of the Moonpetal Lounge, a rival tavern to the Whispering Lantern. Lula serves drinks that induce visions.",
             "Petals that fall from her hair and dissolve before hitting the ground", "merchant", 2, 110, "tavern keeper",
             ["spirit", "tavern"], "settlement-HmoL5chU"),
    make_npc(ya_ids[12], "Imelda", "elf", "female",
             "Elegant thief who specializes in liberating art from undeserving owners. Maintains a refined public persona.",
             "Elven ears half-hidden by an elaborate hairstyle", "trickster", 3, 120, "thief",
             ["elf", "thief", "art"], "settlement-HmoL5chU"),
    make_npc(ya_ids[13], "Mr. Basingstoke", "human", "male",
             "Respectable-seeming warlock who runs an antiquities shop as a front. His patron is unknown but clearly powerful.",
             "One eye that is solid black", "villain", 4, 50, "warlock",
             ["warlock", "patron", "sinister"], "settlement-HmoL5chU"),
    make_npc(ya_ids[14], "Mortimus Fids", "human", "male",
             "Curator of the Yatamon Museum of Natural Curiosities. Obsessed with cataloging every species on Obojima.",
             "Monocle and a butterfly net he always carries", "sage", 2, 59, "curator",
             ["curator", "museum", "collector"], "settlement-HmoL5chU"),
]
ya_extras = [
    ("Bokka Bokka", "spirit", "male", "Enthusiastic spirit street performer who juggles balls of light. Knows everyone in the market district.", "Luminous orbs orbiting his head", "artisan", 1, 60, "performer", ["spirit", "performer"]),
    ("Gojo", "human", "male", "Rival ramen chef to Hakumon in Polewater. Gojo's noodle cart in Yatamon draws huge crowds.", "Headband soaked in broth", "artisan", 2, 34, "ramen chef", ["chef", "rival"]),
    ("Kenta", "human", "male", "Beachcomber who scours the Yatamon waterfront for washed-up treasures and First Age debris.", "Sun-bleached hair and sand-scarred hands", "scout", 1, 23, "beachcomber", ["beachcomber", "scavenger"]),
    ("Suki", "human", "female", "Courier Brigade rider who specializes in dangerous routes. Fearless on her modified bicycle.", "Goggles permanently pushed up on her forehead", "scout", 2, 25, "courier", ["courier", "brave"]),
    ("Old Matsuda", "human", "male", "Retired fisherman turned storyteller. Holds court at the harbor telling tales of sea spirits.", "Missing two fingers on his left hand", "sage", 1, 72, "storyteller", ["storyteller", "harbor"]),
    ("Pebble", "spirit", "nonbinary", "Tiny stone spirit who works as a messenger between the spirit and human communities.", "Body made of smooth river stones", "commoner", 1, 50, "messenger", ["spirit", "messenger"]),
    ("Haruto", "human", "male", "Dockworker and amateur boxer. Dreams of opening a fighting gym.", "Cauliflower ears and a broad grin", "warrior", 2, 30, "dockworker", ["laborer", "fighter"]),
    ("Yumi", "human", "female", "Seamstress who makes the traditional festival kimonos. Her work is in high demand.", "Thimbles on every finger", "artisan", 1, 44, "seamstress", ["artisan", "textile"]),
    ("Ren", "nakudama", "male", "Night watchman who patrols the old quarter. Has seen things he won't talk about.", "A lantern that never goes out", "guardian", 2, 40, "watchman", ["guard", "nakudama"]),
    ("Chizuru", "human", "female", "Tea house owner who serves as an informal mediator for disputes in the merchant quarter.", "Elaborate silver hair pins", "noble", 2, 53, "tea house owner", ["merchant", "mediator"]),
    ("Fumio", "human", "male", "Street sweeper who knows every alley and secret passage in Yatamon.", "A broom taller than he is", "commoner", 1, 61, "street sweeper", ["laborer", "knowledge"]),
    ("Riko", "spirit", "female", "Paper lantern spirit who lights up the evening markets. Shy but helpful.", "Body that glows warmly from within", "commoner", 1, 30, "lantern lighter", ["spirit", "light"]),
    ("Jinbei", "human", "male", "Harbor master who manages ship traffic and collects docking fees. Gruff but honest.", "Enormous salt-and-pepper mustache", "commoner", 2, 56, "harbor master", ["harbor", "official"]),
]
for i, (name, race, gender, desc, feat, arch, threat, age, role, tags) in enumerate(ya_extras):
    ya_named.append(make_npc(ya_ids[15 + i], name, race, gender, desc, feat, arch, threat, age, role, tags, "settlement-HmoL5chU"))
npcs.extend(ya_named)

# == Toggle (settlement-kCsR6cxU) == 11 NPCs ==
tg_ids = settlement_npc_map["settlement-kCsR6cxU"]
tg_named = [
    make_npc(tg_ids[0], "Duro", "human", "male",
             "Master blacksmith of Toggle. Duro forges weapons and tools from rare alloys found in the mountain mines.",
             "Arms covered in burn scars he wears proudly", "artisan", 3, 45, "smith",
             ["smith", "forge"], "settlement-kCsR6cxU"),
    make_npc(tg_ids[1], "Garo", "human", "male",
             "Duro's apprentice and younger brother. Specializes in delicate metalwork and mechanical components.",
             "Always wearing thick leather gloves", "artisan", 2, 32, "smith",
             ["smith", "apprentice"], "settlement-kCsR6cxU"),
    make_npc(tg_ids[2], "Holly Clintock", "human", "female",
             "Brilliant engineer who designs and maintains Toggle's wind-powered machinery. Sister to Paloma in Polewater.",
             "Grease smudge permanently on her left cheek", "sage", 3, 30, "engineer",
             ["engineer", "Clintock"], "settlement-kCsR6cxU"),
    make_npc(tg_ids[3], "Captain Clintock", "human", "male",
             "Retired sea captain and patriarch of the Clintock family. Now serves as Toggle's informal leader and mediator.",
             "Pegleg carved from ironwood", "noble", 3, 65, "captain",
             ["captain", "leader", "Clintock"], "settlement-kCsR6cxU"),
    make_npc(tg_ids[4], "Marcel", "human", "male",
             "Lighthouse keeper at Toggle Point. Marcel maintains the beacon that guides ships through the rocky approach.",
             "One eye perpetually squinting from years of watching the light", "commoner", 1, 58, "lighthouse keeper",
             ["lighthouse", "solitary"], "settlement-kCsR6cxU"),
]
tg_extras = [
    ("Shinobu", "human", "female", "Mountain herbalist who gathers medicinal plants from the high slopes above Toggle.", "A basket that seems bottomless", "healer", 2, 39, "herbalist", ["herbalist", "mountain"]),
    ("Gravel", "spirit", "male", "Rock spirit who works the mines. Knows every vein and fault line in the mountain.", "Body of living granite", "commoner", 2, 200, "miner", ["spirit", "miner"]),
    ("Pip", "human", "male", "Young runner who carries messages between Toggle and the lowland settlements.", "Perpetually out of breath", "scout", 1, 14, "runner", ["messenger", "youth"]),
    ("Esma", "human", "female", "Cook who runs Toggle's communal kitchen. Her mountain stew is the town's pride.", "A ladle she wields like a weapon", "commoner", 1, 50, "cook", ["cook", "communal"]),
    ("Thorn", "nakudama", "male", "Reclusive prospector who trades rare minerals for supplies. Distrustful of outsiders.", "Crystals growing from his shoulders", "commoner", 2, 55, "prospector", ["prospector", "nakudama"]),
    ("Windy", "spirit", "female", "Air spirit who helps power the windmills. Mischievous and unpredictable.", "Hair of streaming wind that never settles", "trickster", 2, 75, "wind tender", ["spirit", "wind"]),
]
for i, (name, race, gender, desc, feat, arch, threat, age, role, tags) in enumerate(tg_extras):
    tg_named.append(make_npc(tg_ids[5 + i], name, race, gender, desc, feat, arch, threat, age, role, tags, "settlement-kCsR6cxU"))
npcs.extend(tg_named)

# == Tidewater (settlement-qaroUeGg) == 13 NPCs ==
tw_ids = settlement_npc_map["settlement-qaroUeGg"]
tw_named = [
    make_npc(tw_ids[0], "Vorian", "elf", "male",
             "Elven sand sculptor who creates breathtaking temporary art on Tidewater's beaches. His works vanish with each tide.",
             "Sand permanently embedded in the lines of his palms", "artisan", 2, 180, "sand sculptor",
             ["elf", "artist", "sand"], "settlement-qaroUeGg"),
    make_npc(tw_ids[1], "Ulmat", "dara", "female",
             "Omenspeaker who reads the future in tide pools and wave patterns. Tidewater's spiritual guide.",
             "Antlers wrapped in dried kelp", "sage", 3, 60, "omenspeaker",
             ["dara", "oracle", "spiritual"], "settlement-qaroUeGg"),
    make_npc(tw_ids[2], "Gritty Groff", "human", "female",
             "The 'Sand Witch' of Tidewater. Makes sandwiches and sand-based potions with equal enthusiasm.",
             "Gritty laugh and sand in her teeth", "artisan", 2, 43, "sand witch",
             ["pun", "alchemist", "cook"], "settlement-qaroUeGg"),
    make_npc(tw_ids[3], "Great Ferek", "human", "male",
             "Massive sculptor who works in coral and driftwood. Competitive rival to Vorian's sand art.",
             "Hands the size of dinner plates", "artisan", 2, 52, "sculptor",
             ["artist", "sculptor", "coral"], "settlement-qaroUeGg"),
    make_npc(tw_ids[4], "Kersh", "human", "male",
             "Child warlock beachcomber who found a patron in a tide pool creature. Collects strange shells that whisper.",
             "Pockets always full of whispering shells", "sage", 2, 10, "beachcomber",
             ["child", "warlock", "beachcomber"], "settlement-qaroUeGg"),
]
tw_extras = [
    ("Marisol", "human", "female", "Net mender who also repairs sails and rigging. Strong and quiet.", "Fingers calloused into permanent curves", "commoner", 1, 37, "net mender", ["fisher", "crafts"]),
    ("Cove", "spirit", "male", "Tide spirit who warns fishers of dangerous currents. Appears as a shimmering figure in the surf.", "Body of swirling saltwater", "guardian", 2, 160, "tide warden", ["spirit", "ocean"]),
    ("Tomoko", "human", "female", "Diver who harvests pearls and abalone from the reef. Best free-diver in Tidewater.", "Lungs like bellows, can hold breath for minutes", "scout", 2, 26, "diver", ["diver", "pearl"]),
    ("Reef", "nakudama", "male", "Fisherman who claims to speak with the fish. Nobody is sure if he's serious.", "Scale-like birthmarks on his neck", "commoner", 1, 41, "fisherman", ["fisherman", "nakudama"]),
    ("Sunny", "human", "female", "Cheerful bait seller and gossip who sets up shop at dawn every day.", "Sunburn that never fades", "merchant", 1, 33, "bait seller", ["merchant", "gossip"]),
    ("Anchor", "human", "male", "Retired sailor who runs a beachside shack selling grilled fish and stories.", "A real anchor tattooed on his chest", "commoner", 1, 57, "retired sailor", ["sailor", "food"]),
    ("Little Yoshi", "human", "male", "Boat builder's apprentice who dreams of sailing to the mainland.", "Sawdust permanently in his hair", "artisan", 1, 16, "apprentice", ["boatwright", "youth"]),
    ("Coral", "spirit", "female", "Reef spirit who tends the living coral gardens offshore. Concerned about the Corruption reaching the reef.", "Body of branching pink coral", "sage", 3, 300, "reef tender", ["spirit", "coral", "guardian"]),
]
for i, (name, race, gender, desc, feat, arch, threat, age, role, tags) in enumerate(tw_extras):
    tw_named.append(make_npc(tw_ids[5 + i], name, race, gender, desc, feat, arch, threat, age, role, tags, "settlement-qaroUeGg"))
npcs.extend(tw_named)

# == Hogstone Hot Springs (settlement-VuGghMRN) == 11 NPCs ==
hs_ids = settlement_npc_map["settlement-VuGghMRN"]
hs_named = [
    make_npc(hs_ids[0], "Adira", "human", "female",
             "Head healer of Hogstone Hot Springs. Adira's poultices and thermal treatments can mend wounds both physical and spiritual.",
             "Warm hands that glow faintly when healing", "healer", 3, 40, "healer",
             ["healer", "springs"], "settlement-VuGghMRN"),
    make_npc(hs_ids[1], "Chisuay", "human", "male",
             "Tea master who brews with spring water and rare mountain herbs. Secretly an oni who genuinely loves tea more than mischief.",
             "Steam curls from his nostrils when he laughs", "trickster", 4, 200, "tea master",
             ["oni", "tea", "secret"], "settlement-VuGghMRN"),
    make_npc(hs_ids[2], "Migo", "spirit", "male",
             "Chisuay's cheerful assistant who tends the tea garden. A small hot-spring spirit who loves chatting with visitors.",
             "Body perpetually steaming like a hot kettle", "commoner", 1, 40, "assistant",
             ["spirit", "tea", "helpful"], "settlement-VuGghMRN"),
    make_npc(hs_ids[3], "Indigo", "spirit", "male",
             "A fossa-shaped spirit who serves as majordomo of the hot springs resort. Impeccably organized and slightly haughty.",
             "Sleek dark fur and an impossibly long tail", "noble", 2, 80, "majordomo",
             ["spirit", "fossa", "manager"], "settlement-VuGghMRN"),
]
hs_extras = [
    ("Yuki", "human", "female", "Masseuse whose treatments are said to cure everything from broken hearts to cursed limbs.", "Hands that crack like thunder", "healer", 2, 35, "masseuse", ["spa", "healer"]),
    ("Banto", "human", "male", "Groundskeeper who maintains the pools and channels. Knows the plumbing of the springs intimately.", "Perpetually damp clothing", "commoner", 1, 48, "groundskeeper", ["maintenance", "springs"]),
    ("Suzu", "spirit", "female", "Bell spirit who announces guests and rings the hour. Her chimes carry across the valley.", "Body shaped like a bronze bell", "commoner", 1, 60, "bell ringer", ["spirit", "bell"]),
    ("Hotaru", "human", "female", "Night attendant who tends the lanterns and watches over guests during evening soaks.", "Eyes that reflect light like a cat's", "commoner", 1, 22, "attendant", ["night", "attendant"]),
    ("Kemushi", "nakudama", "male", "Gardener who cultivates the medicinal herb gardens surrounding the springs.", "Green-tinged skin from years among plants", "commoner", 1, 55, "gardener", ["gardener", "nakudama"]),
    ("Rindo", "human", "male", "Cook who prepares the healing broths and therapeutic meals for guests.", "A nose that can identify any herb by smell alone", "artisan", 1, 40, "cook", ["cook", "healing food"]),
    ("Okami", "spirit", "female", "Wolf spirit who guards the mountain paths to Hogstone. Fiercely territorial but respects those who show proper courtesy.", "Silver-white fur that shimmers in moonlight", "guardian", 3, 150, "guardian", ["spirit", "wolf", "guardian"]),
]
for i, (name, race, gender, desc, feat, arch, threat, age, role, tags) in enumerate(hs_extras):
    hs_named.append(make_npc(hs_ids[4 + i], name, race, gender, desc, feat, arch, threat, age, role, tags, "settlement-VuGghMRN"))
npcs.extend(hs_named)

# == Unattached NPCs (8 total) ==
unattached_npcs = [
    make_npc("npc-6BRwRnao", "Voraro the Parasite", "nakudama", "male",
             "A warlock who has bonded with a parasitic entity found deep in the Shoom. Voraro lurks in the dungeon, drawing power from the corruption.",
             "Black veins visible beneath translucent skin", "villain", 5, 38, "warlock",
             ["warlock", "parasite", "dungeon"], "dungeon-bqafTLDH"),
    make_npc("npc-We_kkBiG", "Lionfish King", "spirit", "male",
             "Ruler of the Coral Throne in the undersea dungeon. A massive lionfish spirit who commands the fish folk armies.",
             "Crown of living venomous spines", "villain", 5, 500, "ruler",
             ["spirit", "royalty", "fish folk"], "dungeon-ic32fqpx"),
    make_npc("npc-8fPHQ6J5", "Ranger Kesso", "human", "male",
             "AHA ranger who went missing during a patrol near the Shoom. Captured and held in the depths.",
             "Torn AHA uniform with ranger insignia", "guardian", 3, 29, "ranger",
             ["AHA", "ranger", "captured"], "dungeon-bqafTLDH"),
    make_npc("npc-1538sWHN", "Courier Fane", "human", "female",
             "Courier Brigade rider who disappeared while carrying a message through the Gale Fields.",
             "Courier satchel with undelivered letters", "scout", 2, 24, "courier",
             ["courier", "missing"], "dungeon-bqafTLDH"),
    make_npc("npc-YcJE47-6", "Traveling Sora", "human", "female",
             "Wandering merchant who trades between settlements, carrying rare goods and rarer news.",
             "A cart pulled by a trained boar", "merchant", 1, 45, "traveling merchant",
             ["merchant", "wanderer"], None),
    make_npc("npc-TPA0o3xE", "Ranger Aoki", "human", "male",
             "AHA ranger who patrols the northern routes. Reports to the AHA leadership in Yatamon.",
             "A bow made of pale driftwood", "guardian", 3, 33, "ranger",
             ["AHA", "ranger", "patrol"], None),
    make_npc("npc-aaCzm0jF", "Courier Miku", "human", "female",
             "Courier Brigade rider who handles the mountain routes between Toggle and Hogstone.",
             "Bicycle with oversized wheels for mountain terrain", "scout", 2, 21, "courier",
             ["courier", "mountain"], None),
    make_npc("npc-j_ybakUJ", "Wandering Gust", "spirit", "male",
             "A wind spirit who drifts between settlements carrying whispered messages from the spirit world.",
             "Translucent body that ripples like a heat mirage", "sage", 2, 100, "wanderer",
             ["spirit", "wind", "messenger"], None),
]
npcs.extend(unattached_npcs)

# Assign flavor wants
flavor_wants = [
    "Seeks a rare ingredient for a special recipe",
    "Wants to find a lost family heirloom",
    "Desires recognition from the community",
    "Dreams of traveling beyond Obojima",
    "Hopes to master a new craft",
    "Wants revenge on someone who wronged them",
    "Seeks spiritual enlightenment",
    "Wants to protect someone dear to them",
    "Craves a specific rare tea",
    "Desires to uncover a buried truth",
    "Wants to build something lasting",
    "Hopes to reunite with a lost companion",
    "Seeks a cure for an ailment",
    "Dreams of opening their own shop",
    "Wants to settle an old score",
    "Desires peace and quiet above all else",
    "Wants to learn ancient First Age secrets",
    "Hopes to prove their worth to a mentor",
    "Seeks the perfect mushroom specimen",
    "Wants to befriend a spirit",
]
random.seed(42)
for npc in npcs:
    if not npc["flavorWant"]:
        npc["flavorWant"] = random.choice(flavor_wants)

# Build NPC lookup
npc_by_id = {n["id"]: n for n in npcs}

# Settlement NPC ID lists for hook source assignment
settlement_to_npc_ids = {}
for npc in npcs:
    loc = npc["locationId"]
    if loc and loc.startswith("settlement-"):
        settlement_to_npc_ids.setdefault(loc, []).append(npc["id"])

# Closest settlement to each dungeon
dungeon_to_nearest_settlement = {
    "dungeon-bqafTLDH": "settlement-_N0PVVNb",
    "dungeon-YN2lLblj": "settlement-CbSD55DO",
    "dungeon-yIL6pItd": "settlement-HmoL5chU",
    "dungeon-qTQ51c_U": "settlement-kCsR6cxU",
    "dungeon-M42RS8S-": "settlement-qaroUeGg",
    "dungeon-pNKQj3ws": "settlement-37cK4TIX",
    "dungeon-DUsbpKcn": "settlement-VuGghMRN",
    "dungeon-Jv9NpCZZ": "settlement-HmoL5chU",
    "dungeon-SgXJriDd": "settlement-e0MHafVM",
    "dungeon-ic32fqpx": "settlement-qaroUeGg",
    "dungeon-qooARykv": "settlement-_N0PVVNb",
}


def get_source_npc(target_loc_id):
    if target_loc_id and target_loc_id.startswith("settlement-"):
        candidates = settlement_to_npc_ids.get(target_loc_id, [])
    elif target_loc_id and target_loc_id.startswith("dungeon-"):
        nearest = dungeon_to_nearest_settlement.get(target_loc_id, "settlement-HmoL5chU")
        candidates = settlement_to_npc_ids.get(nearest, [])
    else:
        candidates = settlement_to_npc_ids.get("settlement-HmoL5chU", [])
    return random.choice(candidates) if candidates else npcs[0]["id"]


# == Generate Hooks ==
hook_ids = [h["id"] for h in orig_hooks]

faction_ids = ["faction-o3Wd4Xcu", "faction-PbhkQa-n"]

rewards = [
    "Gold flowers", "Rare potion ingredients", "First Age artifact",
    "Magical tea blend", "Happy Joy Cake recipe", "Custom forged weapon",
    "Diving equipment", "Spirit fish", "Sand sculpture", "Healing at Hogstone",
]

hook_templates = {
    "rescue": [
        {"rumor": "A midwife from Polewater went into the Shoom to gather herbs and hasn't returned for three days",
         "truth": "The midwife stumbled into Voraro's territory and is being held captive, her life force slowly drained",
         "target": "dungeon-bqafTLDH", "missing_npc": "npc-1538sWHN", "factions": []},
        {"rumor": "A pearl diver was captured by fish folk near the Coral Throne",
         "truth": "The Lionfish King is holding the diver as a bargaining chip to negotiate with surface dwellers",
         "target": "dungeon-ic32fqpx", "missing_npc": None, "factions": []},
        {"rumor": "A Courier Brigade rider never arrived at Toggle with an urgent message",
         "truth": "The courier was swept off the mountain path by corrupted winds and is trapped in a cave",
         "target": "dungeon-qTQ51c_U", "missing_npc": None, "factions": ["faction-PbhkQa-n"]},
        {"rumor": "A child from Okiri wandered into the Crawling Canopy chasing a glowing butterfly",
         "truth": "The child found a First Age chamber and is protected by ancient guardians but cannot leave",
         "target": "dungeon-pNKQj3ws", "missing_npc": None, "factions": []},
        {"rumor": "An AHA ranger went to investigate strange lights in the wetlands and hasn't reported back",
         "truth": "Ranger Kesso is imprisoned in the Shoom by Voraro, who uses him as bait for more captives",
         "target": "dungeon-bqafTLDH", "missing_npc": "npc-8fPHQ6J5", "factions": ["faction-o3Wd4Xcu"]},
        {"rumor": "A tea merchant disappeared on the road between Hogstone and Yatamon",
         "truth": "Bandits ambushed the merchant and are holding them in a mountain hideout for ransom",
         "target": "dungeon-DUsbpKcn", "missing_npc": None, "factions": []},
        {"rumor": "Granny Yuzu's apprentice went to retrieve an artifact from beneath the city and hasn't returned",
         "truth": "The apprentice activated a First Age defense system in the subway tunnels",
         "target": "dungeon-yIL6pItd", "missing_npc": None, "factions": []},
        {"rumor": "A spirit fisherman from Uluwa vanished while fishing in deep waters",
         "truth": "The fisherman discovered an underwater passage and is trapped by a collapsed entrance",
         "target": "dungeon-SgXJriDd", "missing_npc": None, "factions": []},
    ],
    "escort": [
        {"rumor": "Someone needs to transport a crate of Pointue mushrooms past fish folk territory to Tidewater",
         "truth": "The mushrooms are actually a cover for smuggling a First Age power cell that Humble Utzu wants",
         "target": "settlement-qaroUeGg", "factions": []},
        {"rumor": "The mushroom harvest from Matango needs armed escort to the Yatamon market",
         "truth": "Chogo's gang plans to hijack the shipment and sell it on the black market",
         "target": "settlement-HmoL5chU", "factions": []},
        {"rumor": "The AHA needs guides for an expedition into the corrupted southern marshes",
         "truth": "The AHA suspects the corruption has a central source they want to locate and study",
         "target": "dungeon-qooARykv", "factions": ["faction-o3Wd4Xcu"]},
        {"rumor": "A nervous scholar needs bodyguards to reach the Coral Throne for research",
         "truth": "Dr. Frond believes the Coral Throne holds proof that the Corruption is artificial",
         "target": "dungeon-ic32fqpx", "factions": []},
        {"rumor": "Captain Clintock needs a crew to escort a shipment of alloys down from Toggle to the coast",
         "truth": "The alloys are needed to repair ancient machinery that Holly discovered",
         "target": "settlement-kCsR6cxU", "factions": []},
        {"rumor": "A delegation from Uluwa needs protection traveling to Yatamon for trade negotiations",
         "truth": "The delegation carries a spirit artifact that certain humans would kill to possess",
         "target": "settlement-HmoL5chU", "factions": ["faction-PbhkQa-n"]},
        {"rumor": "Mama Amala needs someone to escort her to a remote shrine in the mountains",
         "truth": "The shrine contains a sealed evil that Mama Amala must re-bind before the next full moon",
         "target": "dungeon-DUsbpKcn", "factions": []},
        {"rumor": "A wounded AHA ranger needs safe passage from the Gale Fields back to Yatamon",
         "truth": "The ranger carries intelligence about a new corruption outbreak that enemies want suppressed",
         "target": "settlement-HmoL5chU", "factions": ["faction-o3Wd4Xcu"]},
    ],
    "mystery": [
        {"rumor": "The legendary Moonpearl has been stolen from Tidewater's shrine",
         "truth": "Mr. Basingstoke orchestrated the theft to use the pearl in a ritual for his patron",
         "target": "settlement-qaroUeGg", "factions": []},
        {"rumor": "The Corruption is spreading faster than natural, someone might be feeding it",
         "truth": "Voraro the Parasite is channeling energy from captured victims to accelerate the corruption",
         "target": "dungeon-bqafTLDH", "factions": ["faction-o3Wd4Xcu"]},
        {"rumor": "Vorian's masterwork sand sculpture was sabotaged the night before the festival",
         "truth": "Great Ferek's apprentice did it out of jealousy, but Ferek himself is horrified",
         "target": "settlement-qaroUeGg", "factions": []},
        {"rumor": "Three different cooks in Yatamon have reported their secret ingredients going missing",
         "truth": "A mischievous spirit is collecting the ingredients to recreate a legendary First Age dish",
         "target": "settlement-HmoL5chU", "factions": []},
        {"rumor": "People near the hot springs are having identical strange visions of a burning city",
         "truth": "The springs are channeling memories from a First Age catastrophe sealed beneath Hogstone",
         "target": "settlement-VuGghMRN", "factions": []},
        {"rumor": "Ships are disappearing near the coast with no wreckage found",
         "truth": "The Lionfish King's forces are capturing ships and dragging them to an underwater base",
         "target": "dungeon-ic32fqpx", "factions": []},
        {"rumor": "Someone has been leaving strange glowing symbols on buildings in Yatamon at night",
         "truth": "Mikiko is sleepwalking and casting spells unconsciously, channeling First Age magic",
         "target": "settlement-HmoL5chU", "factions": []},
        {"rumor": "The mycelium network in Matango has stopped growing, and mushrooms are dying",
         "truth": "A buried First Age device is emitting energy that poisons the fungal network",
         "target": "dungeon-YN2lLblj", "factions": []},
        {"rumor": "Travelers between Okiri and Polewater report hearing singing from empty fields",
         "truth": "A trapped spirit in an old well is calling for help, growing weaker each day",
         "target": "settlement-37cK4TIX", "factions": []},
        {"rumor": "Gomber has been hired to investigate why the trolley keeps breaking down at the same spot",
         "truth": "A First Age subway station beneath the tracks is interfering with surface mechanisms",
         "target": "settlement-HmoL5chU", "factions": []},
    ],
    "fetch": [
        {"rumor": "Rokoko needs a specific bioluminescent mushroom that only grows in the deep caves near Toggle",
         "truth": "The mushroom is actually a symbiotic organism with a cave spirit who must be negotiated with",
         "target": "dungeon-qTQ51c_U", "factions": []},
        {"rumor": "Holly Clintock needs a special alloy from the deep mines of Toggle for a critical repair",
         "truth": "The alloy vein is in territory claimed by a territorial rock spirit",
         "target": "settlement-kCsR6cxU", "factions": []},
        {"rumor": "Someone is willing to pay handsomely for Laughing Moss from the Crawling Canopy",
         "truth": "The moss is needed for an antidote to a rare poison that is slowly killing a village elder",
         "target": "dungeon-pNKQj3ws", "factions": []},
        {"rumor": "Orble the Fisher needs someone to catch a spirit fish from the deepest pool in Uluwa",
         "truth": "The spirit fish contains a message from an ancient water spirit about coming danger",
         "target": "settlement-e0MHafVM", "factions": []},
        {"rumor": "Chisuay needs a specific mineral spring water from a cave guarded by corrupted creatures",
         "truth": "The water is the only thing that can suppress his oni nature during the solstice",
         "target": "dungeon-DUsbpKcn", "factions": []},
        {"rumor": "Dr. Frond needs coral samples from the reef that only grows near the Corrupted Coastline",
         "truth": "The coral contains traces of First Age bio-engineering that could explain the Corruption",
         "target": "dungeon-M42RS8S-", "factions": ["faction-o3Wd4Xcu"]},
        {"rumor": "Master Hu's legendary recipe requires honey from spirit bees in the Gale Fields",
         "truth": "The spirit bees are dying and their hive is the last one, making this a conservation mission too",
         "target": "dungeon-Jv9NpCZZ", "factions": []},
        {"rumor": "Madame Porcini needs a rare truffle that only grows in the ruins beneath Matango",
         "truth": "The truffle is growing on a First Age power conduit and removing it may have consequences",
         "target": "dungeon-YN2lLblj", "factions": []},
        {"rumor": "A blacksmith in Toggle needs fire-iron ore from a volcanic vent near the coast",
         "truth": "The volcanic vent is actually a slumbering fire spirit who trades ore for offerings",
         "target": "dungeon-M42RS8S-", "factions": []},
    ],
    "exploration": [
        {"rumor": "Fishermen have spotted structures beneath the waves off Tidewater's coast",
         "truth": "An entire First Age underwater facility lies beneath the reef, still partially powered",
         "target": "dungeon-ic32fqpx", "factions": []},
        {"rumor": "The AHA wants a detailed map of the Crawling Canopy's interior",
         "truth": "Previous mapping expeditions have all returned with incomplete and contradictory maps",
         "target": "dungeon-pNKQj3ws", "factions": ["faction-o3Wd4Xcu"]},
        {"rumor": "The Corrupted Coastline has shifted, revealing cave entrances that weren't there before",
         "truth": "The corruption is eroding barriers to a First Age weapons vault",
         "target": "dungeon-M42RS8S-", "factions": []},
        {"rumor": "Cholly claims there are abandoned subway tunnels beneath Yatamon from the First Age",
         "truth": "The tunnels connect to a vast underground network that spans much of the island",
         "target": "dungeon-yIL6pItd", "factions": []},
        {"rumor": "A new hot spring has erupted near Hogstone, but the water is an unnatural color",
         "truth": "The spring breached a First Age containment chamber, and something is leaking out",
         "target": "dungeon-DUsbpKcn", "factions": []},
        {"rumor": "Spirit paths in the wetlands have shifted, opening routes to previously unreachable areas",
         "truth": "The shift was caused by a spiritual earthquake and the new paths are unstable",
         "target": "dungeon-qooARykv", "factions": []},
        {"rumor": "An old map found in Granny Yuzu's collection shows a tower that doesn't appear on modern maps",
         "truth": "The tower is cloaked by spirit magic and can only be seen during certain moon phases",
         "target": "dungeon-Jv9NpCZZ", "factions": []},
        {"rumor": "Miners in Toggle broke through to an enormous cavern filled with First Age machinery",
         "truth": "The machinery is still functional and appears to be a weather control system",
         "target": "dungeon-qTQ51c_U", "factions": []},
    ],
    "diplomacy": [
        {"rumor": "A fish folk messenger has appeared at Tidewater asking to speak with human leaders",
         "truth": "A faction of fish folk wants to defect from the Lionfish King and seek asylum on land",
         "target": "settlement-qaroUeGg", "factions": ["faction-PbhkQa-n"]},
        {"rumor": "Two mushroom clans in Matango are on the verge of war over truffle territory",
         "truth": "Both clans are being manipulated by Chogo who profits from the conflict",
         "target": "settlement-CbSD55DO", "factions": []},
        {"rumor": "The Lionfish King has sent an emissary demanding tribute from coastal settlements",
         "truth": "The King is actually testing surface-dweller resolve before a major offensive",
         "target": "dungeon-ic32fqpx", "factions": ["faction-PbhkQa-n"]},
        {"rumor": "A coven of witches near Okiri wants to negotiate a mutual defense pact with the village",
         "truth": "The coven has been secretly protecting Okiri from corruption and wants recognition",
         "target": "settlement-37cK4TIX", "factions": []},
        {"rumor": "The spirits of Uluwa are considering closing their market to non-spirits",
         "truth": "Recent disrespectful behavior by human traders has deeply offended the spirit community",
         "target": "settlement-e0MHafVM", "factions": []},
        {"rumor": "The AHA and the Courier Brigade disagree about who should control the mountain passes",
         "truth": "Both organizations are needed and a compromise would benefit everyone",
         "target": "settlement-HmoL5chU", "factions": ["faction-o3Wd4Xcu", "faction-PbhkQa-n"]},
        {"rumor": "A powerful spirit in the Gale Fields is demanding offerings to let travelers pass",
         "truth": "The spirit is actually scared and defensive because corruption is approaching its territory",
         "target": "dungeon-Jv9NpCZZ", "factions": []},
        {"rumor": "Toggle and Tidewater are in a trade dispute over mineral rights",
         "truth": "A third party is forging trade documents to create conflict and profit from both sides",
         "target": "settlement-kCsR6cxU", "factions": []},
    ],
}

hooks = []
all_templates = []
for hook_type, templates in hook_templates.items():
    for t in templates:
        t["type"] = hook_type
        all_templates.append(t)

random.seed(123)
for i, hook_id in enumerate(hook_ids):
    template = all_templates[i % len(all_templates)]
    target = template["target"]
    source_npc = get_source_npc(target)

    missing_npc = template.get("missing_npc", None)

    involved_npcs = [source_npc]
    if missing_npc:
        involved_npcs.append(missing_npc)

    involved_locs = [target]
    src_loc = npc_by_id[source_npc]["locationId"]
    if src_loc and src_loc != target and src_loc not in involved_locs:
        involved_locs.append(src_loc)

    involved_factions = template.get("factions", [])
    reward = rewards[i % len(rewards)]

    hook = {
        "id": hook_id,
        "type": template["type"],
        "rumor": template["rumor"],
        "truth": template["truth"],
        "sourceNpcId": source_npc,
        "targetLocationId": target,
        "missingNpcId": missing_npc,
        "involvedNpcIds": involved_npcs,
        "involvedLocationIds": involved_locs,
        "involvedFactionIds": involved_factions,
        "reward": reward,
        "status": "available",
    }
    hooks.append(hook)

# == Save outputs ==
with open("/Users/dmccord/Projects/vibeCode/hexbinder/temp/obojima_npcs.json", "w") as f:
    json.dump(npcs, f, indent=2)

with open("/Users/dmccord/Projects/vibeCode/hexbinder/temp/obojima_hooks.json", "w") as f:
    json.dump(hooks, f, indent=2)

# == Summary ==
from collections import Counter

print("=== NPC Summary ===")
print(f"Total NPCs generated: {len(npcs)}")

race_dist = Counter(n["race"] for n in npcs)
print("\nRace distribution:")
for race, count in sorted(race_dist.items(), key=lambda x: -x[1]):
    print(f"  {race}: {count}")

gender_dist = Counter(n["gender"] for n in npcs)
print("\nGender distribution:")
for gender, count in sorted(gender_dist.items(), key=lambda x: -x[1]):
    print(f"  {gender}: {count}")

print("\nNPCs per location:")
loc_dist = Counter(n["locationId"] for n in npcs)
for loc, count in sorted(loc_dist.items(), key=lambda x: str(x[0])):
    print(f"  {loc}: {count}")

print(f"\n=== Hook Summary ===")
print(f"Total hooks generated: {len(hooks)}")
hook_type_dist = Counter(h["type"] for h in hooks)
print("\nHooks by type:")
for htype, count in sorted(hook_type_dist.items(), key=lambda x: -x[1]):
    print(f"  {htype}: {count}")

# Validation
invalid_races = [n for n in npcs if n["race"] not in ("human", "nakudama", "elf", "dara", "spirit")]
if invalid_races:
    print(f"\nWARNING: INVALID RACES FOUND: {[n['race'] for n in invalid_races]}")
else:
    print("\nAll races valid")

orig_npc_ids = set(n["id"] for n in orig_npcs)
gen_npc_ids = set(n["id"] for n in npcs)
if orig_npc_ids == gen_npc_ids:
    print("All 100 original NPC IDs preserved")
else:
    missing = orig_npc_ids - gen_npc_ids
    extra = gen_npc_ids - orig_npc_ids
    if missing:
        print(f"Missing NPC IDs: {missing}")
    if extra:
        print(f"Extra NPC IDs: {extra}")

orig_hook_ids_set = set(h["id"] for h in orig_hooks)
gen_hook_ids = set(h["id"] for h in hooks)
if orig_hook_ids_set == gen_hook_ids:
    print("All 97 original hook IDs preserved")
else:
    missing = orig_hook_ids_set - gen_hook_ids
    extra = gen_hook_ids - orig_hook_ids_set
    if missing:
        print(f"Missing hook IDs: {missing}")
    if extra:
        print(f"Extra hook IDs: {extra}")
