/**
 * Landmark enrichment data for Obojima canon world.
 * Fills in descriptions, encounter hooks, and creatures/NPCs
 * for each of the 16 landmarks in the preview world.
 *
 * Some landmarks are converted to explorable dungeon locations
 * via the dungeonConversion field.
 *
 * Source: obojima/reference/obojima_raw.txt
 */

import type { DungeonTheme, DungeonSize } from "~/models";

export interface LandmarkDungeonConversion {
  theme: DungeonTheme;
  size: DungeonSize;
  /** Override room descriptions with source-material-inspired content */
  roomOverrides?: { index: number; name: string; description: string }[];
}

export interface LandmarkEnrichment {
  id: string;
  description: string;
  /** Short encounter hooks or points of interest at this location */
  encounters: string[];
  /** Tags to merge with existing tags */
  tags: string[];
  /** NPC IDs associated with this landmark */
  npcIds?: string[];
  /** Controlling or associated faction */
  factionId?: string;
  /** If set, convert this landmark to a dungeon location */
  dungeonConversion?: LandmarkDungeonConversion;
}

export const LANDMARK_ENRICHMENTS: LandmarkEnrichment[] = [
  {
    id: "landmark-way-gate",
    description:
      "A 120-foot tunnel bored straight through the rock face of Mount Arbora by nakudama stonemasons in the age of the monarchs. The walls and ceiling are covered in a continuous bas-relief of a royal procession through curling clouds — a testament to nakudama artistry. Large enough for a cart pulled by two horses. The Watchers patrol it, but monsters nest here when the snow piles deep outside.",
    encounters: [
      "Monsters have nested in the tunnel during a recent snowstorm — the Watchers need help clearing them",
      "A section of the bas-relief has been vandalized; close inspection reveals claw marks from something large",
      "Patcher, captain of the Watchers, regales passersby with increasingly unbelievable stories of what he's fought in this tunnel",
    ],
    tags: ["tunnel", "nakudama", "mountains", "graysteps", "watchers"],
    npcIds: ["npc-obojima-patcher"],
    dungeonConversion: {
      theme: "fortress",
      size: "small",
      roomOverrides: [
        { index: 0, name: "Tunnel Mouth", description: "The entrance to the Way Gate — a perfectly carved archway framing a dark passage through solid rock. Claw marks score the threshold. Cold wind flows from within." },
        { index: 1, name: "Hall of the Royal Procession", description: "The tunnel walls are covered in continuous nakudama bas-relief depicting a royal procession through curling clouds. Several panels have been gouged by something large. Rubble and old nests line the floor." },
        { index: 2, name: "The Watcher's Alcove", description: "A carved alcove where the Watchers keep supplies — torches, rope, dried rations. A logbook records recent monster sightings in Patcher's scrawling hand." },
        { index: 3, name: "Inner Gallery", description: "The bas-relief here shows the nakudama queen receiving tribute. A fresh monster nest fills one corner — bones, fur, and a foul smell. Something was here recently." },
        { index: 4, name: "Eastern Exit", description: "Daylight filters through the far opening. The relief carvings here show the queen ascending into clouds. Bootprints in the dust suggest the Watchers patrol regularly." },
      ],
    },
  },
  {
    id: "landmark-ten-wheels",
    description:
      "Once a wondrous grove of ancient bashu trees protected by the elder spirit Olundu — a giant tree sloth. Now ravaged by thick tendrils of Corruption slime. Olundu became afflicted and rotted into a demon: a shaggy, oil-covered predator with unnatural swiftness who lurks in the blackened canopy, vomiting Corruption on prey below before pouncing with terrible talons.",
    encounters: [
      "Olundu the demon sloth lurks in the canopy above — oil drips from the branches as warning",
      "A weird, skeletonized fish called Bloop follows the party like a stray dog through the grove",
      "Gnasher, a wraith-like howler chieftain caught in the initial Corruption flood, haunts the grove's edge",
      "Bim of the Beasts has a hidden observation post here, studying Corruption's effect on local wildlife",
    ],
    tags: ["corrupted", "grove", "demon", "gale-fields", "dangerous"],
    npcIds: ["npc-obojima-bim-of-the-beasts"],
    dungeonConversion: {
      theme: "beast_den",
      size: "lair",
      roomOverrides: [
        { index: 0, name: "Grove Edge", description: "Blackened bashu trees drip with oily Corruption slime. The canopy above is unnaturally dark. A skeletonized fish called Bloop flops around the entrance, following visitors like a lost pet." },
        { index: 1, name: "The Blighted Heart", description: "The center of the grove where Olundu's corruption is thickest. Oil-black puddles reflect no light. Claw gouges scar the trunks ten feet up — the demon sloth prowls the canopy above." },
        { index: 2, name: "Bim's Observation Post", description: "A hidden lean-to where Bim of the Beasts studies the Corruption. Jars of samples, notebooks of observations, and cages of recuperating animals fill the cramped space." },
      ],
    },
  },
  {
    id: "landmark-crumpled-hut",
    description:
      "A ramshackle dwelling that looks like it was dropped from a great height and never properly rebuilt. The walls lean at impossible angles and the roof sags in the middle, yet it stands. Locals avoid it, claiming strange lights flicker inside on moonless nights and that anyone who sleeps here wakes somewhere else entirely.",
    encounters: [
      "Strange lights are visible from a distance on moonless nights — investigating reveals an old spirit shrine beneath the floorboards",
      "A traveling merchant claims the hut moved since they last passed through — their old campfire ring is now 50 feet away from it",
      "Something has been leaving offerings of fish bones and river stones on the doorstep",
    ],
    tags: ["hut", "mystery", "spirit"],
    dungeonConversion: {
      theme: "witch_hut",
      size: "lair",
      roomOverrides: [
        { index: 0, name: "The Crooked Doorway", description: "The hut's door hangs at an impossible angle but swings open easily. Inside, the floor tilts — furniture slides slowly toward one wall. Dust motes drift upward instead of down." },
        { index: 1, name: "The Shifted Room", description: "A living space where nothing is quite right. A kettle hangs over a cold hearth but the water inside is boiling. Offerings of fish bones and river stones are arranged in a spiral on the table. A trapdoor in the floor glows faintly." },
        { index: 2, name: "Spirit Shrine Below", description: "Beneath the floorboards, a cramped root cellar holds an ancient spirit shrine — a flat stone carved with spiraling glyphs that pulse with pale light. The air hums. This is why the hut moves: the shrine anchors a restless spirit that drags the structure when it wanders." },
      ],
    },
  },
  {
    id: "landmark-lake-ellior",
    description:
      "One of Obojima's great lakes, its deep waters conceal the mostly-submerged nakudama ziggurat of Shoom. Ruins of a settlement on the southern shore hint at the site's ancient importance — Shoom was once the largest nakudama hatching site on the island, where families brought eggs to be tended by midwives. It was sealed and abandoned after the warlock Voraro the Parasite enthralled the midwives and offered eggs as tribute to his greedy spirit patron.",
    encounters: [
      "Lights are visible deep beneath the lake's surface at night — Voraro the Parasite and his spirit patron may still be sealed within Shoom",
      "A nakudama pilgrim asks for escort to the southern shore ruins to perform a remembrance ritual",
      "Corrupted fish have begun surfacing near the ziggurat — something is disturbing the ancient seals",
    ],
    tags: ["lake", "nakudama", "ziggurat", "shoom", "gift-of-shuritashi", "underwater"],
    npcIds: ["npc-obojima-voraro-the-parasite"],
  },
  {
    id: "landmark-crawling-canopy",
    description:
      "A mysterious, ever-moving magical forest that crawls across the Gale Fields. It may remain in one spot for months, tempting the curious — then uproot itself without warning, bewildering anyone caught inside the confounding swirl of moving trees. Most creatures live in the canopy, riding the trees as the forest lumbers across the plains. Dead wood burns longer and hotter than normal; bows of living wood are magical; arrows of living wood fly farther. Demons lurk in the depths.",
    encounters: [
      "The forest has stopped moving — locals say this means it's hungry for new visitors",
      "A desperate lumberjack offers to split profits if the party guards them while harvesting magical living wood from the edge",
      "A woodcutter went in three days ago and hasn't returned; their dog waits at the tree line, whimpering",
      "Arrows made from living Canopy wood add 30 feet to a bow's range — but the trees don't give up their branches willingly",
    ],
    tags: ["forest", "mobile", "gale-fields", "magical", "dangerous", "demons"],
    dungeonConversion: {
      theme: "shrine",
      size: "lair",
      roomOverrides: [
        { index: 0, name: "The Tree Line", description: "Where the Crawling Canopy currently rests. The trees at the edge shift and creak — roots lift and resettle like sleeping limbs. A woodcutter's dog whimpers at the boundary, refusing to enter. Fallen branches of magical living wood litter the ground." },
        { index: 1, name: "The Moving Interior", description: "Inside, the forest is disorienting. Trees uproot and replant around you in slow motion. The ground shifts. Navigation is nearly impossible — landmarks move. Canopy creatures watch from above: birds with too many eyes, insects that glow wrong colors." },
        { index: 2, name: "The Demon's Hollow", description: "A clearing that the trees seem to avoid. The ground is scorched. A demon lurks here — once a forest spirit, now twisted into something that feeds on the curious. Bones of woodcutters and adventurers are half-buried in the shifting soil." },
      ],
    },
  },
  {
    id: "landmark-lilywin",
    description:
      "The ancient capital of the nakudama monarchy, founded by the first Queen who swam across the great ocean to Obojima and birthed the first hundred nakudama. Lilywin once stretched for miles across the Gale Fields, but was devastated during the civil war against Oghmai the Demon Usurper. Little archaeological evidence remains — the oldest roads in the Gale Fields, still maintained by the Courier Brigade, may be the last remnants of this once-great city.",
    encounters: [
      "Tellu & Scale sword school is seeking passage to locate and settle at the ruins",
      "A Courier Brigade runner reports finding carved nakudama foundation stones beneath the road surface after a recent washout",
      "Something large is using the old road at night — enormous tracks suggest a creature from the Gale Fields",
      "A Fish Head Coven witch offers a map to Lilywin's ceremonial center in exchange for a dangerous favor",
    ],
    tags: ["ruins", "nakudama", "gale-fields", "ancient", "capital"],
    factionId: "faction-obojima-tellu-scale",
  },
  {
    id: "landmark-blue-back-lake",
    description:
      "A lake at the base of Opal Falls, named for the Blue Back Salmon that migrate here annually up the River Din. The elder river spirit Din — the most beloved spirit on Obojima — long ago divided himself into thousands of salmon to feed the island. During the Salmon Festival, Din's magic lets the fish leap up the roaring falls in a burst of supernatural vigor. Locals bet on champion salmon, crown a King and Queen of the Salmon, and feast for days. The legendary 10-foot salmon Soledad is said to have fed all of Opal Falls for a week.",
    encounters: [
      "The Salmon Festival is approaching — volunteers needed for setup, and rumors swirl that Soledad has been spotted",
      "A Courier Brigade member at the falls reports their post box has been broken into — someone is stealing mail",
      "Warwick the Spirit Whisperer offers to cut gemstones in exchange for help gathering spirit-touched river stones",
      "The blue back salmon run is late this year — fishermen fear something has disturbed Din's grotto beneath the falls",
    ],
    tags: ["lake", "falls", "salmon", "spirit", "festival", "coastal-highlands", "din"],
    npcIds: ["npc-obojima-warwick"],
  },
  {
    id: "landmark-rumble-hill",
    description:
      "A large circular mound of earth near the Broken Bird Airfield. Anyone approaching hears and feels a low reverberation. The hill appears covered in soft, downy orange grass — the perfect spot to watch Phin's contraptions struggle airborne. In truth, Rumble Hill is a sleeping Cat of Prodigious Size. Once a normal house cat named Lyle, he grew continuously until mistaken for a hill. Only the loudest noises stir him. An old woman in Opal Falls still leaves a saucer of milk for him every day. A flying machine barreling down the runway would be an irresistible plaything.",
    encounters: [
      "Rumble Hill is purring today — the ground vibrates so strongly that drinks won't stay in cups at the airfield",
      "Phin's latest contraption is nearly ready for a test flight, but someone warns it might wake The Hill",
      "An elderly woman from Opal Falls arrives looking for her cat Lyle — she has a saucer of milk and refuses to believe he's a hill",
      "The Hill has shifted position overnight, partially blocking the runway; scratch marks the size of trenches scar the earth",
    ],
    tags: ["mystery", "creature", "coastal-highlands", "airfield", "cat", "giant"],
    npcIds: ["npc-obojima-phin"],
  },
  {
    id: "landmark-water-clock",
    description:
      "A giant tower built in the Shallows outside Sky Kite Valley by the legendary Master Chen. A strong ocean current once turned a wheel that drove a remarkably precise clock mechanism. Since the great earthquake — caused when the island struck a massive tendril of deep-sea Corruption — the current has slowed dramatically and the clock has stopped. The tower still stands, battered by waves, its gears frozen. It serves as silent testimony to the catastrophe that brought the Corruption to Obojima.",
    encounters: [
      "An AHA researcher wants to examine the clock mechanism for clues about the earthquake's true cause",
      "Fish folk have begun nesting in the tower's lower levels — they guard something hidden in the gearworks",
      "A Mariners' Guild diver reports the underwater portion of the tower extends much deeper than expected",
      "On certain tides, the clock's bell tolls once — locals say it's Master Chen's ghost marking the hour",
    ],
    tags: ["tower", "shallows", "landmark", "broken", "first-age", "mystery", "earthquake"],
    dungeonConversion: {
      theme: "fortress",
      size: "small",
      roomOverrides: [
        { index: 0, name: "Wave-Battered Base", description: "The tower rises from a platform of barnacle-crusted stone. Waves crash against the lower walls. A rusted iron door hangs ajar — beyond, stairs spiral upward. Salt water pools on the floor. Fish folk have scratched territorial marks into the stonework." },
        { index: 1, name: "The Gear Chamber", description: "A massive room dominated by Master Chen's clock mechanism — interlocking bronze gears the size of wagon wheels, frozen in place. Barnacles grow on the lower works. Fish folk have nested among the machinery, weaving seaweed shelters between the gears." },
        { index: 2, name: "Fish Folk Nest", description: "What was once a storage level is now a fish folk nest. Salvaged nets, shells, and shiny objects are piled everywhere. They guard something hidden deep in the gearworks — a First Age component that hums with faint energy." },
        { index: 3, name: "The Bell Chamber", description: "The top of the tower. The great clock bell hangs overhead, green with verdigris. The clock face looks out over the Shallows. On certain tides, the bell tolls once on its own. The view reveals the underwater portion of the tower extending far deeper than anyone realized." },
      ],
    },
  },
  {
    id: "landmark-shade-wood",
    description:
      "The section of forest near the Brackwater coastline that has been desaturated and drained of life by the Corruption. Once a living swamp, it now feels cold and empty — home to Corrupted Muk and wayward spirits slowly being twisted into demonic forms. Refugees from devastated villages huddle in a camp deep in the wood, kept alive by an exhausted ranger suffering advanced Corruption sickness and a druid working around the clock. At night, skeletonized howlers pick off the weak.",
    encounters: [
      "Desperate Measures: A refugee camp needs immediate help — the ranger is dying of Corruption sickness and the druid can't hold the perimeter alone",
      "It Takes a Village: An entire collapsed village has become an enormous rubble golem, confused and mourning — it could be cleansed rather than destroyed",
      "Skeletonized howlers circle the camp each night, growing bolder as the defenders weaken",
      "A corrupted spirit begs for help before it loses itself completely to the transformation",
    ],
    tags: ["corrupted", "forest", "brackwater", "refugees", "dangerous", "undead"],
    dungeonConversion: {
      theme: "crypt",
      size: "small",
      roomOverrides: [
        { index: 0, name: "Dead Tree Line", description: "Grey, leafless trees mark the boundary. The air is cold and tastes of iron. Corruption slime pools in the hollows between roots. Claw marks on the bark — howlers." },
        { index: 1, name: "Refugee Camp", description: "A desperate ring of tents and lean-tos. The druid maintains protective wards — chalk circles, herb bundles, spirit stones. The ranger lies feverish in the largest tent, Corruption veins visible on their arms." },
        { index: 2, name: "The Rubble Golem", description: "An entire collapsed village compressed into a shambling humanoid shape — timber walls for limbs, a chimney for a head. It sits motionless, making low groaning sounds. Corruption runs through its mortar like black veins. It could be cleansed or destroyed." },
        { index: 3, name: "Howler Den", description: "A depression in the corrupted earth where skeletonized howlers nest during the day. Bones and scraps from their night raids litter the ground. The creatures are wraith-thin, all jaw and ribs." },
        { index: 4, name: "The Turning Spirit", description: "A clearing where a spirit flickers between its true form — a gentle deer-like creature — and something twisted and wrong. It begs for help in a voice like breaking glass. The transformation is nearly complete." },
      ],
    },
  },
  {
    id: "landmark-whispering-forest",
    description:
      "Dense, ancient woods in the Coastal Highlands where the trees seem to murmur secrets to those who listen. Young Stewards from the nearby settlements make expeditions here to study the blue back salmon migration routes and learn woodland lore. The forest edges the wild rapids of the River Din, and travelers who follow its depths eventually hear the roaring sound of Opal Falls.",
    encounters: [
      "Young Stewards ask for an escort on a training expedition — something has been stalking their groups",
      "The trees' whispers have changed tone recently; locals say they sound frightened rather than welcoming",
      "A rare blue back salmon has been spotted in a forest stream far from the river — a spirit omen",
    ],
    tags: ["forest", "coastal-highlands", "din-river", "stewards", "salmon"],
  },
  {
    id: "landmark-new-moon-lagoon",
    description:
      "A sheltered lagoon in the Brackwater Wetlands where the village of Polewater perches on stilts above the water. Polewater has existed for generations as an enclave of safety between the treacherous wetlands and the sea — a tangle of interconnected gangways and catwalks running between timber structures. Once a lively marina smelling of fish and salt with guitar music drifting from returning boats. A devastating tsunami nearly destroyed it. Now fish folk grow belligerent on either side, villagers show signs of Corruption, and the young leader struggles to keep his people safe while his sister secretly embraces the Corruption.",
    encounters: [
      "Polewater's leader asks for help reinforcing the stilts — something large has been bumping them from below at night",
      "Fish folk reel in skeletonized fish near the lagoon — a sign the Corruption is reaching the waters",
      "A young woman (the leader's sister) is secretly meeting corrupted fish folk at the lagoon's edge",
      "The old marina pilings have exposed something beneath the muck — First Age metalwork, possibly a sunken structure",
    ],
    tags: ["lagoon", "brackwater", "polewater", "stilts", "tsunami", "corrupted"],
    npcIds: ["npc-obojima-ernest-ebbs", "npc-obojima-ermina-flopfoot"],
    dungeonConversion: {
      theme: "sea_cave",
      size: "small",
      roomOverrides: [
        { index: 0, name: "Lagoon Shallows", description: "Murky tidal water laps against the barnacle-crusted stilts of Polewater above. Ropes and broken fishing nets hang down like vines. Dark shapes move beneath the surface — Corruption tendrils snake through the water like living oil. At low tide, rusted First Age metalwork protrudes from the muck." },
        { index: 1, name: "Sunken Marina", description: "The old marina pilings descend into a graveyard of wrecked boats half-buried in silt. Fish folk territorial markers — shells and bone arranged in spirals — cover every surface. Something large has been scraping against the stilts; deep gouges scar the timber." },
        { index: 2, name: "First Age Antechamber", description: "A partially collapsed metal structure, ancient beyond reckoning, juts from the lagoon floor. The entrance is a corroded hatch forced open by the earthquake. Inside: smooth walls, geometric carvings, and a faint hum. Corruption seeps through cracks in the ceiling." },
        { index: 3, name: "The Drowned Vault", description: "A sealed First Age chamber, knee-deep in brackish water. Strange machinery lines the walls — crystalline tubes, copper conduits green with verdigris. At the center, a circular platform holds something that pulses with dim light beneath the murk. Fish folk have been bringing offerings here." },
        { index: 4, name: "Roakraska's Lair", description: "The deepest point beneath the lagoon. A massive cavity carved by the tsunami's force. Here lurks Roakraska — the skeletonized gulper eel hurled inland by the wave, now nesting in the dark. Bones of fish and unfortunate divers litter the floor. This is what's been bumping the stilts at night." },
      ],
    },
  },
  {
    id: "landmark-corrupted-coastline",
    description:
      "The devastated eastern coast of the Brackwater Wetlands where the tsunami and earthquake struck hardest. Black pools of Corruption snake along every abandoned street and infest crumbled walls. The ruined village of Gobo sits here, home only to a single mad druid who is inexplicably immune to the Corruption — at night he claims demons overrun the town, but even he can't be sure it's not in his mind. Just offshore, the sunken village of Ekmu lies under 15 feet of corrupted water, claimed by the demon Slaathti as her lair.",
    encounters: [
      "The mad druid of Gobo offers shelter and information, but his ramblings mix truth and hallucination — separating them is the challenge",
      "Corrupted fish folk have gathered at the sunken village of Ekmu, guarding the demon Slaathti's underwater lair",
      "Bim of the Beasts has a makeshift laboratory on the fringe, studying Corruption's effects on animals — she needs fresh samples",
      "Boats bob on the black water offshore, held fast by sticky strands of Corruption anchored to the sunken village below",
    ],
    tags: ["corrupted", "coast", "brackwater", "ruins", "demon", "underwater", "gobo", "ekmu"],
    npcIds: ["npc-obojima-bim-of-the-beasts"],
    dungeonConversion: {
      theme: "cave",
      size: "small",
      roomOverrides: [
        { index: 0, name: "Gobo Village Ruins", description: "Crumbled stone walls and collapsed roofs line an abandoned street. Black pools of Corruption fill every hollow. A mad druid sits by a fire in the least-ruined building, muttering. He claims he's immune to the Corruption — and seems to be right." },
        { index: 1, name: "The Druid's Shelter", description: "The only intact building. The druid has covered the walls in chalk diagrams — maps of Corruption spread, phases of the moon, demon sightings. Some are brilliant. Some are nonsense. He can't tell the difference anymore." },
        { index: 2, name: "Bim's Laboratory", description: "A makeshift workspace on the edge of the ruins. Bim of the Beasts has cages of sick animals, jars of Corruption samples, and careful notes. She needs fresh samples from deeper in the zone and will pay for them." },
        { index: 3, name: "The Black Shore", description: "Where the land meets corrupted water. Boats bob offshore, held fast by sticky black strands anchored to the sunken village of Ekmu fifteen feet below. The demon Slaathti's eel-like form is sometimes visible in the murk." },
        { index: 4, name: "Sunken Ekmu", description: "The submerged village rests on the seafloor — stone buildings coated in Corruption. A nakudama temple sits at the center, its sacred carvings defaced. Corrupted fish folk patrol the ruins. Slaathti, a demon in giant eel form, has claimed this as her lair." },
      ],
    },
  },
  {
    id: "landmark-sally-sue",
    description:
      "A wrecked merchant vessel beached on the Brackwater shore, its hull cracked open like an egg. The Salty Sue ran aground during the tsunami and now serves as a makeshift shelter for scavengers and a navigation hazard for coastal traffic. Gulls roost in the rigging. Locals say the cargo hold still contains sealed crates that no one has been able to open — the locks are First Age mechanism work, and whatever's inside shifts when you press your ear to the wood.",
    encounters: [
      "A scavenger crew is fighting over salvage rights — both sides offer to cut the party in for help",
      "The sealed First Age crates in the hold hum faintly at night; an AHA researcher offers good coin to have them extracted intact",
      "Something has made a nest in the lower decks — the scavengers won't go below anymore",
    ],
    tags: ["shipwreck", "beach", "brackwater", "salvage", "first-age"],
    dungeonConversion: {
      theme: "sea_cave",
      size: "lair",
      roomOverrides: [
        { index: 0, name: "The Beached Hull", description: "The Salty Sue lies cracked open on the sand, listing badly to port. Gulls roost in the remaining rigging. A makeshift camp of scavengers clusters around the gap in the hull. Two crews are arguing over salvage rights." },
        { index: 1, name: "Upper Cargo Hold", description: "Crates and barrels tumbled everywhere when the ship hit. Most have been picked clean. But at the back, bolted to the hull with First Age mechanism locks, sit three sealed crates that hum faintly. Press your ear to the wood — something shifts inside." },
        { index: 2, name: "Lower Decks", description: "Dark, damp, and tilted at a sickening angle. Seawater sloshes in the bilge. The scavengers refuse to come down here — something has made a nest in the captain's quarters. Scratching sounds come from behind the barricaded door." },
      ],
    },
  },
  {
    id: "landmark-island-hmug",
    description:
      "A remote island far offshore of the Land of Hot Water, accessible via the Wandering Line — a magical First Age train system with depots in the clouds, inside Mount Arbora's Prison of Oghmai, and in the Glittering Depot mine near Toggle. The island's true nature and purpose are largely unknown, but the Wandering Line's hopper contains Spirit Coal — a prized material sought by ingredient hunters and smiths alike.",
    encounters: [
      "A Council of Kroo floppy disk mentions coordinates that may correspond to the Island of Hmug",
      "A Wandering Line depot map shows Hmug as the final stop — but the track there is marked with warning glyphs",
      "Spirit Coal from the Wandering Line's hopper is worth a fortune to the right buyer",
    ],
    tags: ["island", "offshore", "land-of-hot-water", "wandering-line", "first-age", "mystery"],
  },
  {
    id: "landmark-lionfish-king",
    description:
      "The underwater domain of the Lionfish King — a pompous, moody tyrant who rules the Western Shallows with barracuda warriors and fish folk pirates. His palace, the Coral Castle, is a hill-sized coral mound flanked by poisonous anemones large enough to devour trespassers, patrolled by armored crab guardians. The hollow upper half houses his court of frogfish advisors, barracuda warriors, and noble courtiers. When not in the castle, the King rides the Doomspine — a war barge built from salvaged wrecks, its prow the stolen front half of Captain Clintock's submarine, the Pointue.",
    encounters: [
      "Fish folk pirates demand tribute from any vessel passing through the Shallows",
      "The Lionfish King seeks a nakudama princess of royal bearing to marry and legitimize his rule",
      "Corrupted deep-sea fish folk from Venomous Rex's territory are raiding westward, making the King more temperamental",
      "The stolen submarine prow (Pointue) is mounted on the Doomspine — the Mariners' Guild desperately wants it back",
    ],
    tags: ["underwater", "shallows", "coral-castle", "fish-folk", "pirates", "doomspine"],
    factionId: "faction-obojima-lionfish-king",
    npcIds: ["npc-obojima-lionfish-king", "npc-obojima-sleethar", "npc-obojima-bloodfin-the-foul"],
  },
];
