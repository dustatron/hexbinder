/**
 * Settlement enrichment data for Obojima canon world.
 * Fills in trouble, quirk, sensory impressions, and known sites
 * for each of the 32 settlements in the preview world.
 *
 * Source: obojima/reference/ files (GEOGRAPHY.md, WORLD.md, NPC_MASTER.md, LOCATIONS.md)
 */

import type { SettlementSite } from "~/models";

export interface SettlementEnrichment {
  id: string;
  trouble: string;
  quirk: string;
  sensoryImpressions: string[];
  /** Hand-authored sites from sourcebook. Builder will generate remaining procedurally. */
  knownSites: Partial<SettlementSite>[];
}

export const SETTLEMENT_ENRICHMENTS: SettlementEnrichment[] = [
  // === GIFT OF SHURITASHI ===
  {
    id: "settlement-matango",
    trouble: "Mushroom blight threatening the village's primary crop; rival mushroom clans feuding over spore rights",
    quirk: "Every building is partially constructed from giant dried mushroom caps; villagers communicate harvest status via mushroom-shaped wind chimes",
    sensoryImpressions: [
      "The earthy, umami scent of drying mushrooms hangs over everything",
      "Wind chimes shaped like mushroom caps tinkle in the breeze",
      "Villagers carry baskets overflowing with fungi of every color",
    ],
    knownSites: [
      { name: "Mushroom Market", type: "market" },
      { name: "Spore House Inn", type: "inn" },
    ],
  },
  {
    id: "settlement-okiri",
    trouble: "Sheep dragons growing restless as highland grazing grounds shrink; retired Fish Head witch hiding in plain sight",
    quirk: "Sheep dragons wander freely through the village streets; a derelict First Age food truck sits in the commons, now used as a community bulletin board",
    sensoryImpressions: [
      "Bleating of sheep dragons mingles with children's laughter",
      "Wool tufts caught on every fence post and doorframe",
      "Smell of lanolin and fresh grass on the wind",
    ],
    knownSites: [
      { name: "Retired Witch's Repair Shop", type: "general_store" },
      { name: "Okiri Commons", type: "market" },
    ],
  },
  {
    id: "settlement-tidewater",
    trouble: "Coastal erosion eating away at the hardened sand buildings; the Pearl of Rongol in the Tower of Glass attracting unwanted attention",
    quirk: "Every structure is built from magically hardened sand; sand sculptors shape buildings by hand like potters at a wheel",
    sensoryImpressions: [
      "Granular walls glitter with embedded shell fragments in the sunlight",
      "The constant susurrus of waves reshaping the beach",
      "Salt-crusted air carries the sound of sculptors chanting shaping songs",
    ],
    knownSites: [
      { name: "Tower of Glass", type: "temple" },
      { name: "Sand Sculptor's Workshop", type: "guild_hall" },
    ],
  },
  {
    id: "settlement-yatamon",
    trouble: "Goro Goros magical graffiti defacing buildings; subway tunnels beneath the city growing more dangerous; Mortimus Fids gatekeeping the library",
    quirk: "Largest city on Obojima (~10k). Neon signs from the First Age still flicker along Fire Snake Alley. A trolley runs through the center. The Courier Brigade HQ is a former First Age bank.",
    sensoryImpressions: [
      "Flickering neon signs cast colored light across rain-slicked streets",
      "The clatter of Cholly's trolley bell echoing between buildings",
      "Sizzling street food from a dozen competing vendors on Fire Snake Alley",
    ],
    knownSites: [
      { name: "Courier Brigade HQ (First Age Bank)", type: "guild_hall" },
      { name: "AHA Library Outpost", type: "temple" },
      { name: "The Witchery (Academy)", type: "temple" },
      { name: "Canden & Moon School", type: "guild_hall" },
      { name: "Fire Snake Alley", type: "market" },
      { name: "Cholly's Trolley Station", type: "market" },
    ],
  },
  {
    id: "settlement-uluwa",
    trouble: "Spirit Realm market built over an abandoned fish market is unstable; boundary between realms thinning",
    quirk: "Exists simultaneously in the Physical and Spirit Realms — visitors may slip between planes without warning",
    sensoryImpressions: [
      "Translucent spirit vendors overlap with weathered fish market stalls",
      "The air shimmers like heat haze as realm boundaries flex",
      "Ethereal music from spirit instruments that have no physical form",
    ],
    knownSites: [
      { name: "Spirit Market", type: "market" },
      { name: "Old Fish Market", type: "market" },
    ],
  },
  {
    id: "settlement-kuroki",
    trouble: "Isolated forest village with limited supply routes; mountain predators growing bolder",
    quirk: "Homebrew village nestled deep in forest near the mountains, accessible only by overgrown trail",
    sensoryImpressions: [
      "Dense canopy filters light into dancing green patterns",
      "Woodsmoke and pine resin scent every surface",
      "Distant bird calls echo through the ancient trees",
    ],
    knownSites: [],
  },
  {
    id: "settlement-cdl-south",
    trouble: "The Pointue submarine damaged in drydock; Paloma secretly infected with Corruption; Lionfish King patrols threatening",
    quirk: "Mariners' Guild southern lodge with an aquarium displaying Shallows specimens. Captain Clintock researches Corruption here.",
    sensoryImpressions: [
      "Salt spray and the creak of dock timbers",
      "Bioluminescent specimens glow in the aquarium windows",
      "Diving suits hang to dry like strange scarecrows along the pier",
    ],
    knownSites: [
      { name: "Mariners' Lodge (South)", type: "guild_hall" },
      { name: "The Aquarium", type: "temple" },
      { name: "Drydock", type: "blacksmith" },
    ],
  },

  // === LAND OF HOT WATER ===
  {
    id: "settlement-sky-kite",
    trouble: "Rock Raley's aviation obsession drawing dangerous attention to the Sky King's domain; overcrowded tourist season",
    quirk: "Second largest settlement. Seaside town famous for kites and gliders — the sky is always full of color. Rock Raley leads expeditions to build flying machines.",
    sensoryImpressions: [
      "Hundreds of kites in every shape and color fill the sky",
      "The snap and flutter of silk against the constant sea wind",
      "Vendors hawk miniature kites and glider models to tourists",
    ],
    knownSites: [
      { name: "Raley's Kite Workshop", type: "guild_hall" },
      { name: "Seaside Market", type: "market" },
    ],
  },
  {
    id: "settlement-hogstone",
    trouble: "Hot springs temperatures fluctuating unpredictably since the earthquake; overcrowding straining resources",
    quirk: "Spa settlement on Mount Arbora's geothermal slopes. Visitors come from across the island to bathe in the mineral-rich springs.",
    sensoryImpressions: [
      "Sulfurous steam billows from dozens of natural pools",
      "The sound of bubbling water is constant and soothing",
      "Warm mineral-scented mist coats everything in a fine sheen",
    ],
    knownSites: [
      { name: "Adira's Bathhouse", type: "inn" },
      { name: "Amber Pool", type: "temple" },
    ],
  },
  {
    id: "settlement-chisuay",
    trouble: "The oni proprietor's true nature unsettles travelers who look too closely",
    quirk: "Remote teahouse run by a mysterious oni. Serves the finest tea on the island. Travelers speak of it in hushed, reverent tones.",
    sensoryImpressions: [
      "Fragrant steam rises from ceramic cups of impossible complexity",
      "Paper lanterns sway in the mountain wind, casting warm light",
      "The soft clink of porcelain and the oni's rumbling laugh",
    ],
    knownSites: [
      { name: "Chisuay's Teahouse", type: "inn" },
    ],
  },
  {
    id: "settlement-cdl-north",
    trouble: "Lionfish King targeting Holly Clintock; keeping the lighthouse operational with limited staff",
    quirk: "Mariners' Guild northern lodge at Pelican's Nest Lighthouse. Holly Clintock's workshop. Marcel the blind lighthouse keeper navigates by sonar.",
    sensoryImpressions: [
      "The lighthouse beam sweeps across churning northern waters",
      "Hammering and welding sounds from Holly's workshop at all hours",
      "Marcel's pelican spirit Disaster squawks at arriving boats",
    ],
    knownSites: [
      { name: "Pelican's Nest Lighthouse", type: "temple" },
      { name: "Holly's Workshop", type: "blacksmith" },
      { name: "Mariners' Lodge (North)", type: "guild_hall" },
    ],
  },
  {
    id: "settlement-durrin",
    trouble: "Supply routes becoming unreliable as mountain weather worsens",
    quirk: "Small settlement on Mount Arbora's western slopes",
    sensoryImpressions: [
      "Thin mountain air carries the scent of alpine flowers",
      "Clouds drift below the village in the morning",
      "Wind whistles through rocky outcroppings",
    ],
    knownSites: [],
  },

  // === MOUNT ARBORA ===
  {
    id: "settlement-graysteps",
    trouble: "Elder Phent secretly keeping a Corruption-tainted spirit captive, planning to release a demon on Toggle; anti-spirit sentiment growing",
    quirk: "Spirits don't come here. Stone statues line every path — nobody knows who carved them. Villagers walk on stilts. Nuharo (Cloud Cap apprentice) secretly runs a curio shop as 'Grimcloak.'",
    sensoryImpressions: [
      "An unsettling absence — no spirit lights, no ethereal whispers",
      "Stone statues watch from every corner with blank expressions",
      "The clack of wooden stilts on stone paths echoes through narrow streets",
    ],
    knownSites: [
      { name: "Murgin's Tavern and Inn", type: "tavern" },
      { name: "Grimcloak's Curio Shop (cellar)", type: "general_store" },
    ],
  },
  {
    id: "settlement-toggle",
    trouble: "Tetsuri (corrupted ranger) hiding here under false identity, waiting to kidnap Holly; air pirates raiding nearby",
    quirk: "Famous metalworkers Duro and Garo pioneered glyph-folding blade techniques. Isabel Skiff (AHA) hunts for dragon's fist gemstones.",
    sensoryImpressions: [
      "The ring of hammer on anvil echoes from multiple forges",
      "Sparks fly from Duro and Garo's workshop at all hours",
      "Metallic tang in the air mixed with coal smoke",
    ],
    knownSites: [
      { name: "Duro & Garo's Forge", type: "blacksmith" },
      { name: "Toggle Mining Office", type: "guild_hall" },
    ],
  },
  {
    id: "settlement-lom-salts",
    trouble: "Air pirates from Lom's past establishing a stronghold nearby; sacred geothermal vents being disrupted by expansion",
    quirk: "Oldest sword school on Obojima, cut into the mountainside. The ascent itself is the first test. Students forge their own blades in the geothermal forge.",
    sensoryImpressions: [
      "The hiss of quenching steel echoes up the mountain face",
      "Geothermal vents release steam that smells faintly of iron",
      "Distant clash of practice swords at dawn and dusk",
    ],
    knownSites: [
      { name: "The Geothermal Forge", type: "blacksmith" },
      { name: "Sanctum Forge (inner)", type: "blacksmith" },
      { name: "Training Grounds", type: "guild_hall" },
    ],
  },
  {
    id: "settlement-jumaga-roost",
    trouble: "The great beast Jumaga growing agitated; increased predator activity on upper slopes",
    quirk: "Named for the great beast Jumaga who nests near the summit. Few dare approach.",
    sensoryImpressions: [
      "Enormous claw marks score the rock face above",
      "The air vibrates faintly — a deep resonance from something massive",
      "Cloud shadows sweep across the mountainside like living things",
    ],
    knownSites: [],
  },

  // === GALE FIELDS ===
  {
    id: "settlement-witching-tower",
    trouble: "Elder spirit Sorolu suffering an unknown malady weakening domain magic; Fish Head scouts vs Council of Kroo territorial dispute",
    quirk: "Three brick towers connected by bridges. Magical hedgerow alerts the Council when crossed. Chot-to spy statues record conversations. The Closed Fists vaults hold dangerous ingredients and items.",
    sensoryImpressions: [
      "The hedgerow hums with a faint magical vibration",
      "Cauldron smoke drifts between the three towers in lazy spirals",
      "Animated chot-to statues murmur to each other when they think no one listens",
    ],
    knownSites: [
      { name: "Ermy Flower's Ingredient Kiosk", type: "general_store" },
      { name: "The Sanctum (underground)", type: "temple" },
      { name: "The Closed Fists (twin vaults)", type: "guild_hall" },
      { name: "Witches' Bridge", type: "guild_hall" },
    ],
  },
  {
    id: "settlement-fort-harglo",
    trouble: "Maintaining crossroads security as eastern routes become more dangerous; delicate non-aggression with Fish Head Coven",
    quirk: "Courier Brigade fort protecting the crossroads of the Gale Fields. Used for oath ceremonies and training.",
    sensoryImpressions: [
      "Courier birds call from the battlements at all hours",
      "The stamp of running boots on packed earth as cadets train",
      "Wind-battered pennants snap from every tower",
    ],
    knownSites: [
      { name: "Brigade Hall", type: "guild_hall" },
      { name: "Oath Ceremony Grounds", type: "temple" },
    ],
  },
  {
    id: "settlement-amak-shurak",
    trouble: "Demon consuming villagers in exchange for heart stones that power the forges and Spirit Blades; 'workers needed' signs in woods are a trap",
    quirk: "Homebrew town that crafts Spirit Blades using heart stones from a demon. The demon is the town elder's grandson, spirit-bonded with a demon.",
    sensoryImpressions: [
      "An eerie crimson glow emanates from the forge at night",
      "Heart stones pulse with faint warmth in display cases",
      "The air tastes metallic, and workers avoid eye contact with strangers",
    ],
    knownSites: [
      { name: "Spirit Blade Forge", type: "blacksmith" },
    ],
  },

  // === BRACKWATER WETLANDS ===
  {
    id: "settlement-roa-kala",
    trouble: "Howlers chopping down glyph trees for firewood; outsiders encroaching on sacred grove",
    quirk: "Sacred dara village where all dara emerge from trees bearing parting glyphs. Ranger Poli patrols the forest protecting glyph trees.",
    sensoryImpressions: [
      "Ancient bashu trees creak and whisper in a language almost understood",
      "Parting glyphs glow faintly on tree trunks in the twilight",
      "The forest floor is soft with centuries of fallen leaves",
    ],
    knownSites: [
      { name: "Sacred Grove", type: "temple" },
    ],
  },
  {
    id: "settlement-hakumon",
    trouble: "Vespoma creatures have overrun the shop, tormenting patrons with enchanting speech",
    quirk: "Island-famous ramen shop. Hakumon's recipes are legendary. Currently under siege by vespoma.",
    sensoryImpressions: [
      "Rich pork bone broth scent carries for miles across the wetlands",
      "Steam rises from enormous cauldrons behind the counter",
      "Buzzing vespoma chatter mingles with worried patron murmurs",
    ],
    knownSites: [
      { name: "Hakumon's Ramen Shop", type: "inn" },
    ],
  },
  {
    id: "settlement-polewater",
    trouble: "Tsunami damage still unrepaired; Madelaine (8yo immune to Corruption) may be cure or next demon; supply routes cut off",
    quirk: "Fishing village on stilts at New Moon Lagoon. Ernest leads the rebuilding. Grifftang Crump mysteriously resists infection.",
    sensoryImpressions: [
      "Stilted buildings creak above murky tidal waters",
      "Fishing nets dry in geometric patterns across every surface",
      "Dark corruption tendrils visible in the water at low tide",
    ],
    knownSites: [
      { name: "Ernest's Meeting Hall", type: "guild_hall" },
      { name: "Fishing Dock", type: "market" },
    ],
  },
  {
    id: "settlement-goodie-mart",
    trouble: "Supply shipments increasingly unreliable; strange noises from the basement",
    quirk: "A First Age convenience store still operating in the wetlands. Surprisingly well-stocked.",
    sensoryImpressions: [
      "Neon 'OPEN' sign flickers in the swamp mist",
      "Fluorescent lights buzz overhead inside",
      "Shelves stocked with an impossible variety of preserved goods",
    ],
    knownSites: [
      { name: "Goodie Mart", type: "general_store" },
    ],
  },
  {
    id: "settlement-gobo",
    trouble: "Completely devastated by tsunami and Corruption; a mad druid is the only immune inhabitant",
    quirk: "Ruined village overrun by Corruption. Mad druid collects Corruption samples. AHA researchers study from a distance.",
    sensoryImpressions: [
      "Black tar seeps from every surface, veined with iridescent purple",
      "The air burns the throat with an acrid chemical tang",
      "Silence — no birds, no insects, no spirits",
    ],
    knownSites: [],
  },
  {
    id: "settlement-ekmu",
    trouble: "Sunken village haunted by demon Slaathti; nakudama temple submerged and corrupted",
    quirk: "Sunken village graveyard with a corrupted nakudama temple. Demon Slaathti (giant eel) dwells in the underwater ruins.",
    sensoryImpressions: [
      "Bubbles rise from submerged structures visible through murky water",
      "A deep vibration from below — Slaathti moving in the depths",
      "Corrupted water gives off a faint phosphorescent glow at night",
    ],
    knownSites: [],
  },
  {
    id: "settlement-torf-bolders",
    trouble: "Missing student expedition to Polewater; Hakumon's ramen shop under vespoma attack; masters' volatile relationship straining",
    quirk: "Sword school built from a former hunting lodge. Students train by fighting actual Wetlands monsters. Masters Toraf ('The Door') and Boulder (ex-Ranger) barely tolerate each other.",
    sensoryImpressions: [
      "Master Toraf's bellowing echoes across the plains",
      "Students return from expeditions muddy and scratched but grinning",
      "Campfire smoke rises from Boulder's wilderness camp just outside",
    ],
    knownSites: [
      { name: "Training Tower", type: "guild_hall" },
      { name: "Boulder's Camp", type: "inn" },
    ],
  },
  {
    id: "settlement-tellu-scale",
    trouble: "Need passage through Fish Head territory to reach Lilywin ruins; stopwatch functions remain undecoded",
    quirk: "Nomadic sword school that never stops moving. Master Tellu trains students while walking. Carries a mysterious First Age stopwatch.",
    sensoryImpressions: [
      "Tent canvas flaps as the camp is struck and re-pitched daily",
      "The rhythmic scrape of practice swords accompanies marching feet",
      "Master Tellu's stopwatch ticks audibly in moments of silence",
    ],
    knownSites: [],
  },

  // === COASTAL HIGHLANDS ===
  {
    id: "settlement-opal-falls",
    trouble: "Water-powered elevator system needs constant maintenance; river spirit Din's moods affecting toll collection",
    quirk: "Built around the tallest waterfall on Obojima. Vertical industry powered by falling water. Wayla oversees river traffic and the original postal box honoring spirit Din.",
    sensoryImpressions: [
      "Thundering waterfall drowns out all conversation below",
      "Rainbow mist hangs permanently over the falls basin",
      "Water-powered lifts groan and clank as they ascend the cliff face",
    ],
    knownSites: [
      { name: "Wayla's River Office", type: "guild_hall" },
      { name: "First Postal Box (shrine to Din)", type: "temple" },
      { name: "Water Elevator Station", type: "market" },
    ],
  },
  {
    id: "settlement-broken-bird",
    trouble: "12 harpies in the control tower; missing Young Stewards; Plitsu secretly sabotaging Phin; dormant slime colony under the runway",
    quirk: "First Age airstrip with derelict aircraft. Phin lives in a hangar restoring 'the Menace.' Harpies dress as pilots. Pickle brine keeps them at bay.",
    sensoryImpressions: [
      "The sharp tang of pickle brine and aviation grease",
      "Harpies in flight jackets and goggles cackling from the control tower",
      "Wind whistling through the skeletal frames of rusting aircraft",
    ],
    knownSites: [
      { name: "Phin's Hangar", type: "blacksmith" },
      { name: "Harpy Control Tower", type: "guild_hall" },
      { name: "Cucumber Garden", type: "market" },
    ],
  },
  {
    id: "settlement-aha-hq",
    trouble: "Corrupted viperfish folk in flooded basement; researchers falling ill from Corruption exposure; spread too thin across dig sites",
    quirk: "19-level observatory on a promontory. Telescope, labs, archive, curio museum. Lonzo's radio picks up mysterious war dispatches. Corrupted fish folk secretly beneath.",
    sensoryImpressions: [
      "Telescope gears click as Lonzo charts stars through the dome",
      "The scratch of chronicler spirits' quills on scroll strips",
      "Faint static and garbled voices from Lonzo's First Age radio",
    ],
    knownSites: [
      { name: "The Observatory", type: "temple" },
      { name: "Archive & Curio Museum", type: "guild_hall" },
      { name: "Corruption Research Lab", type: "temple" },
    ],
  },

  // === OFFSHORE ===
  {
    id: "settlement-cdl-east",
    trouble: "Increased Corruption in nearby waters; supply runs becoming hazardous",
    quirk: "Eastern Mariners' Guild lodge, exposed to the worst of the Corruption's coastal effects.",
    sensoryImpressions: [
      "Dark-stained tideline marks where corruption reaches at high water",
      "Divers return with fewer specimens each expedition",
      "Watchfires burn through the night along the dock",
    ],
    knownSites: [
      { name: "Mariners' Lodge (East)", type: "guild_hall" },
    ],
  },
  {
    id: "settlement-cdl-west",
    trouble: "Lionfish King patrols limiting diving operations",
    quirk: "Western Mariners' Guild lodge near the Coral Castle.",
    sensoryImpressions: [
      "Diving bells hang from racks like bronze mushrooms",
      "Charts of the western Shallows cover every wall",
      "The distant shadow of the Coral Castle visible on clear days",
    ],
    knownSites: [
      { name: "Mariners' Lodge (West)", type: "guild_hall" },
    ],
  },
];
