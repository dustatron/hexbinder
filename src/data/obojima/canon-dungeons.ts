/**
 * Canon dungeon enrichment data for Obojima.
 * These dungeons exist as empty stubs in the base world JSON.
 * The builder uses placeDungeon to generate spatial layouts,
 * then overlays these canon descriptions.
 */

import type { DungeonTheme, DungeonSize } from "~/models";

export interface CanonDungeonEnrichment {
  id: string;
  description: string;
  theme: DungeonTheme;
  size: DungeonSize;
  tags: string[];
  npcIds?: string[];
  factionId?: string;
  roomOverrides: { index: number; name: string; description: string }[];
}

export const CANON_DUNGEON_ENRICHMENTS: CanonDungeonEnrichment[] = [
  {
    id: "dungeon-coral-castle",
    description:
      "The underwater fortress of the Lionfish King — a hill-sized mound of coral covered in sea vegetation, flanked by poisonous anemones large enough to devour trespassers. The hollow upper half houses his court of frogfish advisors, barracuda warriors, and noble courtiers. Elite crab sentinels patrol the gates. At the base, a sea cave holds the Crimson Octopus 'Boombox,' whose ink is worth a fortune.",
    theme: "fortress",
    size: "large",
    tags: ["underwater", "fortress", "coral", "fish-folk", "lionfish-king"],
    npcIds: ["npc-obojima-lionfish-king", "npc-obojima-sleethar", "npc-obojima-bloodfin-the-foul"],
    factionId: "faction-obojima-lionfish-king",
    roomOverrides: [
      { index: 0, name: "The Coral Gate", description: "A towering arch of living coral flanked by two massive poisonous anemones — their translucent tendrils sway lazily, each thick enough to enfold a person. Armored crab sentinels stand motionless on either side, clicking their claws in warning. The water here is warm and murky with silt." },
      { index: 1, name: "Anemone Garden", description: "A passage through a forest of smaller anemones and sea fans. Colorful reef fish dart between the fronds. Barracuda warriors patrol in pairs, sleek and silver, watching visitors with predatory eyes. The walls are living coral — cutting yourself is easy, bleeding is dangerous." },
      { index: 2, name: "Crab Sentinel Barracks", description: "A series of carved-out coral chambers where the elite crab sentinels rest. Their shells are decorated with barnacle-encrusted insignia. Weapons — tridents, nets, hooks — hang from coral pegs. The crabs are fanatically loyal to the King." },
      { index: 3, name: "Hall of Noble Courtiers", description: "A grand gallery where the Lionfish King holds court. Butterfly fish nobles drift in colorful clouds. Pufferfish diplomats inflate nervously. Moray eels lurk in coral crevices, watching. Sleethar the royal consigliere — an ancient ocean mage in moray eel form — coils near the throne." },
      { index: 4, name: "The Throne of Spines", description: "An enormous chamber at the coral mound's hollow center. The Lionfish King's throne is a fan of poisonous spines, each as long as a spear. The King himself is magnificent and terrifying — venomous fins spread like a war banner, his mood shifting from magnanimous to murderous in a heartbeat." },
      { index: 5, name: "The Royal Library", description: "A waterlogged chamber containing stolen nakudama tomes — the Royal Lineages tracking the old monarchy's bloodline. The books are preserved in sealed First Age containers. The King studies them obsessively, seeking a nakudama princess of royal blood to marry and legitimize his rule." },
      { index: 6, name: "War Room", description: "Maps of the Shallows etched into the coral walls — territorial boundaries, patrol routes, the encroaching threat of Venomous Rex from the east. A scale model of the Doomspine war barge sits on a stone table. Plans for the stolen submarine prow — the Pointue — are spread beside it." },
      { index: 7, name: "Doomspine Dock", description: "A vast underwater cavern where the Doomspine war barge is moored — a grotesque vessel cobbled from salvaged shipwrecks. Its prow is the stolen front half of Captain Clintock's submarine, the Pointue, containing the Aquatic Stabilizer. Fish folk pirates load and unload plunder." },
      { index: 8, name: "Boombox's Cave", description: "A dark sea cave at the castle's base, guarded by elite crab sentinels. Inside lurks the Crimson Octopus known as Boombox — a massive creature whose ink is prized by alchemists and the Fish Head Coven witches. The cave floor is stained deep red. Boombox is intelligent and hostile." },
    ],
  },
  {
    id: "dungeon-sunken-town",
    description:
      "First Age ruins submerged on white sand 200 feet below the surface, connected to the Wandering Line depot system. A ghost town of perfectly preserved buildings, asphalt roads, and a train station — all claimed by fish folk pirates under Bloodfin the Foul. A gentle giant octopus named Lucinda is held hostage, her eggs used as leverage.",
    theme: "sea_cave",
    size: "medium",
    tags: ["underwater", "first-age", "ruins", "fish-folk", "wandering-line"],
    npcIds: ["npc-obojima-bloodfin-the-foul"],
    roomOverrides: [
      { index: 0, name: "Main Road", description: "Clear First Age asphalt stretching between submerged buildings. Little wear despite the ages — some seaweed growth. The water is crystal-clear in the magical Shallows, visibility 200 feet. Colorful reef fish swim between the rooftops like birds." },
      { index: 1, name: "Train Depot", description: "A well-built wooden structure with arrival and departure times still posted on a board. Witch's Eye Coral clusters glow faintly on the platform. Sligo, a mischievous sea sprite, lurks here — she'll trade information about the fish folk pirates for a pearl from Bloodfin's giant clam." },
      { index: 2, name: "Fish Folk Hideout", description: "A large First Age warehouse occupied by 8 fish folk pirates guarding a stolen kite-plane. Bloodfin the Foul has a 25% chance of being present. The pirates have decorated the interior with salvaged trinkets and territorial markers." },
      { index: 3, name: "Moxy's Music Grotto", description: "A First Age music store filled with waterlogged instruments. Morris, a cowardly giant sea horse spirit, hides here. He stole the kite-plane for Bloodfin but is terrified of Slurpgill the sea hag. He whinnies nervously at any approach." },
      { index: 4, name: "Jerry's Garage", description: "A First Age garage with rusted tools, an old kei truck, and ancient mopeds. Four giant crabs have nested in the toolshed. The vehicles are beyond repair but contain salvageable First Age components." },
      { index: 5, name: "Bloodfin's Lair", description: "An old Goodie Mart decorated in gothic deep-sea style — Bloodfin the Foul's lair. A giant clam holds a 500 Gold Flower pearl (DC 16 STR to pry open). Lucinda the gentle Awakened Giant Octopus is held nearby, her eggs used as leverage to force her into guard duty." },
      { index: 6, name: "Storage Lockers", description: "Train station storage lockers (DC 20 to pick). One contains an indestructible suitcase (DC 25 magic lock) holding a Neko Ronin figurine in original packaging — the interior kept magically dry. Worth a fortune to collectors." },
    ],
  },
  {
    id: "dungeon-crak-caves",
    description:
      "A winding cave system in the western hills of the Gift of Shuritashi. The caves are home to colonies of cuddle bugs and deeper chambers hold deposits of spirit-touched minerals. Rangers from the Greenward Path use the upper caves as supply caches, but something has been raiding their stores.",
    theme: "cave",
    size: "medium",
    tags: ["caves", "western", "gift-of-shuritashi", "rangers"],
    roomOverrides: [
      { index: 0, name: "Hill Mouth", description: "A wide cave entrance hidden behind a curtain of hanging vines. Ranger trail markers are scratched into the stone — the Greenward Path uses this as a waypoint. Cool air flows outward. Cuddle bug tracks dot the sandy floor." },
      { index: 1, name: "Supply Cache", description: "A dry upper chamber where Rangers store emergency supplies — dried food, rope, torches, healing herbs. Something has been raiding the crates: claw marks, scattered rations, and a half-eaten leather satchel. The raids started a month ago." },
      { index: 2, name: "Cuddle Bug Colony", description: "A warm chamber full of burrowing cuddle bugs — small creatures that drain body heat. They cluster in piles, their faint bioluminescence casting the room in blue-green light. They're drawn to warmth and will swarm anyone who stays too long." },
      { index: 3, name: "Crystal Grotto", description: "A breathtaking cavern where spirit-touched minerals line the walls — translucent crystals that hum faintly when touched. The minerals are valuable to the Fish Head Coven and Lom & Salt's forges. Mining here would be profitable but dangerous — the crystals are structurally important." },
      { index: 4, name: "The Deep Pool", description: "A subterranean lake of perfectly still, black water. Something large ripples the surface occasionally. Blind cave fish bump against boots. The water is ice cold and impossibly deep — a dropped torch disappears without hitting bottom." },
    ],
  },
  {
    id: "dungeon-temple-of-shoom",
    description:
      "An ancient nakudama ziggurat mostly submerged in Lake Ellior. Once the largest hatching site on the island, where families brought eggs to be tended by sacred midwives. Sealed after the warlock Voraro the Parasite enthralled the midwives and offered eggs as tribute to his greedy spirit patron. Lights are visible deep beneath the lake at night — something stirs within.",
    theme: "temple",
    size: "large",
    tags: ["nakudama", "ziggurat", "underwater", "lake-ellior", "voraro", "sealed"],
    npcIds: ["npc-obojima-voraro-the-parasite"],
    roomOverrides: [
      { index: 0, name: "Shore Ruins", description: "Crumbled nakudama stonework lines the southern shore of Lake Ellior. Foundation stones carved with egg-shaped glyphs — the symbol of the hatching site. A pilgrim's trail leads to a stone dock, half-submerged, where boats once brought families and their precious eggs." },
      { index: 1, name: "The Drowning Steps", description: "Stone steps descend into Lake Ellior, leading to the ziggurat's upper terrace. The water is dark and cold. At depth, faint lights pulse — rhythmic, like a heartbeat. Corrupted fish circle at the boundary where fresh water meets something else." },
      { index: 2, name: "Hatching Terrace", description: "The ziggurat's broad upper level, designed for communal egg-tending. Stone nests line the walls — each sized for a clutch of nakudama eggs. The midwives' tools remain: warming stones, incubation lamps, hatching records carved in stone. Everything is covered in lake silt." },
      { index: 3, name: "Midwives' Quarters", description: "Living chambers for the sacred midwives. Personal effects remain — robes, prayer beads, half-finished letters. The enthrallment happened suddenly. Some midwives tried to resist — scratch marks on the inside of sealed doors." },
      { index: 4, name: "The Offering Chamber", description: "A vast chamber at the ziggurat's heart. An altar stained dark with old rituals. This is where Voraro offered nakudama eggs to his spirit patron. The walls are carved with scenes of the hatching ceremony — defaced with Voraro's own twisted glyphs." },
      { index: 5, name: "Voraro's Sanctum", description: "The warlock's private chamber, sealed behind wards that still pulse with power. Inside: a throne of fused eggshells, occult instruments, and a mirror that shows not your reflection but something watching from the other side. The spirit patron may still be bound here." },
      { index: 6, name: "The Deep Seal", description: "The lowest level of the ziggurat, far below the lake's surface. A massive stone door carved with nakudama sealing magic. The lights visible from the surface originate here — something pushes against the seal from within. Cracks have appeared. The corrupted fish cluster at this depth." },
    ],
  },
  {
    id: "dungeon-glittering-depot",
    description:
      "A long-forgotten mine near Toggle at the eastern slope of Mount Arbora. A maze of tunnels connects gem-encrusted caverns, monster lairs, and surface exits. One of three Wandering Line depot stops — an ancient First Age train system. Spirit Coal, a prized alchemical ingredient, can be found in the hopper cars.",
    theme: "mine",
    size: "medium",
    tags: ["mine", "first-age", "wandering-line", "toggle", "spirit-coal"],
    roomOverrides: [
      { index: 0, name: "Mine Entrance", description: "A timber-framed opening in the hillside near Toggle. Old rail tracks disappear into darkness. The miners left generations ago but the supports are First Age alloy — still holding strong. A draft carries the faint smell of minerals and something electric." },
      { index: 1, name: "Cart Junction", description: "Three tunnels converge at a switching point. Rusted ore carts sit on the tracks. One tunnel leads deeper into gem caverns, one angles upward to a surface exit, and the third descends toward rumbling sounds and warmth. Yokario music faintly echoes from one passage." },
      { index: 2, name: "Gem Cavern", description: "A dazzling natural chamber where veins of crystallized minerals catch any light and scatter it into rainbows. The gems are spirit-touched — faintly warm to the touch. Careful extraction could yield valuable stones, but crude mining risks a collapse." },
      { index: 3, name: "Wandering Line Platform", description: "A First Age train platform, impossibly preserved. Tiled floors, metal benches, destination signs listing stops: 'Cloud Station — Glittering Depot — Prison Terminal — Island of Hmug.' A hopper car sits on the track, half-full of Spirit Coal — dark crystals that shimmer with trapped energy." },
      { index: 4, name: "Deep Workings", description: "The lowest mining tunnels, where the original miners stopped digging. Tool marks end abruptly — they hit something they couldn't cut. First Age metal walls, smooth and featureless, block the passage. The Wandering Line track runs through a sealed door in this wall." },
    ],
  },
  {
    id: "dungeon-prison-oghmai",
    description:
      "Deep within Mount Arbora lies the prison of Oghmai — the Demon Emperor of the nakudama, imprisoned since the Second Age. The Deep Current faction secretly steers AHA excavations toward passages leading here. Layers of nakudama sealing magic guard the descent, each weaker than the last. Something has been eroding them from within.",
    theme: "temple",
    size: "large",
    tags: ["mountain", "prison", "nakudama", "demon", "oghmai", "deep-current", "mount-arbora"],
    roomOverrides: [
      { index: 0, name: "Arbora Tunnel Entrance", description: "A crack in the mountain's interior, hidden behind a waterfall. Nakudama warning glyphs are carved into every surface — do not enter, do not listen, do not speak his name. The air is warm and smells of sulfur. The Deep Current has been quietly widening this passage." },
      { index: 1, name: "First Seal Chamber", description: "A vast circular room. The floor is a single carved seal — concentric rings of nakudama binding magic, cracked but holding. Spirit energy hums in the walls. Each ring represents a generation of nakudama wardens who renewed the seals. The outermost ring is dark — broken." },
      { index: 2, name: "Hall of Wardens", description: "Statues of nakudama wardens line a descending corridor — each holding a symbolic key. Their stone faces show determination hardening into despair as you go deeper. The last few statues are unfinished — the warden line ended. No one has renewed the seals in centuries." },
      { index: 3, name: "The Whispering Gallery", description: "A natural cavern where sound behaves wrong. Whispers from below are amplified into almost-intelligible speech. Oghmai's voice, filtered through layers of sealing magic, offers bargains, threats, and truths designed to corrode resolve. Staying too long risks madness." },
      { index: 4, name: "Wandering Line Terminal", description: "A forgotten First Age train platform — 'Prison Terminal' reads the sign. The track continues deeper but is blocked by collapsed stone. Spirit Coal dust coats everything. Someone has been here recently — fresh boot prints in the ancient dust. Deep Current operatives." },
      { index: 5, name: "Second Seal Chamber", description: "Another sealing room, deeper. This seal is stronger but visibly strained — hairline cracks radiate from the center. The air is hot. Shadows move wrong. Something immense presses against the other side. The demon emperor is awake and aware." },
      { index: 6, name: "The Threshold", description: "The final chamber before the prison itself. No one living has seen what lies beyond the last door — a slab of nakudama-forged metal ten feet thick, covered in every protective glyph their civilization ever devised. It vibrates. It's warm to the touch. From behind it comes a sound like breathing." },
    ],
  },
];
