import type {
  Faction,
  FactionAdvantage,
  AgendaGoal,
  FactionObstacle,
} from "~/models";

// Helper to build agenda goals with sequential order
function agenda(
  items: Array<{ description: string; targetType?: AgendaGoal["targetType"]; targetId?: string }>
): AgendaGoal[] {
  return items.map((item, i) => ({
    id: `ag-${i + 1}`,
    order: i + 1,
    description: item.description,
    status: "pending" as const,
    targetType: item.targetType,
    targetId: item.targetId,
  }));
}

// ============================================================
// 1. Mariners' Guild
// ============================================================

const marinersGuild: Faction = {
  id: "faction-obojima-mariners-guild",
  name: "Mariners' Guild",
  description:
    "Undersea explorers guild with four lodges at compass points. Led by Captain Clintock and his daughters Holly and Paloma. Locked in a decades-long blood feud with the Lionfish King over the Aquatic Stabilizer.",
  archetype: "mercantile",
  factionType: "guild",
  purpose: "Explore the deep ocean, find the Corruption's source, recover the Aquatic Stabilizer",
  scale: "regional",
  displayType: "Undersea explorers guild",
  traits: ["Tenacious", "Resourceful"],
  region: "Island-wide",
  headquartersId: "settlement-cdl-south",
  advantages: [
    { type: "apparatus", name: "The Pointue Submarine", description: "Damaged First Age submarine in drydock at the southern lodge" },
    { type: "specialization", name: "Deep-Water Expertise", description: "Diving suits, fish finder/sonar tech, deep-water expertise" },
    { type: "knowledge", name: "Corruption Research", description: "Corruption research samples and underwater survey data" },
    { type: "territory", name: "Four Lodges", description: "Four lodges at compass points give island-wide coastal presence" },
    { type: "artifact", name: "Navigation Beacons", description: "Salvaged First Age navigation beacons still pulsing with magic" },
  ] satisfies FactionAdvantage[],
  agenda: agenda([
    { description: "Gather enough Corruption samples from the Shallows to identify the source" },
    { description: "Convince AHA to share First Age submarine schematics for repair", targetType: "faction", targetId: "faction-obojima-aha" },
    { description: "Repair the Pointue's hull and navigation systems" },
    { description: "Recover the Aquatic Stabilizer from the Lionfish King's Doomspine", targetType: "item" },
    { description: "Launch a deep-water expedition to find the Corruption's origin point" },
  ]),
  obstacle: {
    type: "rival_faction",
    description:
      "The Aquatic Stabilizer is mounted on the Lionfish King's flagship Doomspine. Holly is the only engineer who can repair the sub, but she's at the northern lodge while the Pointue sits in drydock at the southern lodge — and the Lionfish King's patrols make transport between them extremely dangerous.",
    targetId: "faction-obojima-lionfish-king",
  } satisfies FactionObstacle,
  immediateObstacle: {
    type: "internal_conflict",
    description:
      "Paloma Clintock has been secretly infected with the Corruption from a fish folk dart. She hasn't told anyone and continues launching reckless solo raids. The infection is progressing.",
  },
  want: "The Aquatic Stabilizer. They'd also accept AHA's help reverse-engineering a replacement, but AHA wants underwater ruin access in return. Take down the Lionfish King.",
  tension:
    "Lionfish King sank the original Pointue and took the Stabilizer. Clintock got the King imprisoned in Uluwa. Decades-long blood feud. Neither will negotiate directly — players make ideal intermediaries.",
  // Legacy
  goals: [],
  methods: [],
  resources: [],
  relationships: [
    { factionId: "faction-obojima-lionfish-king", type: "hostile", reason: "Blood feud over the Aquatic Stabilizer" },
    { factionId: "faction-obojima-aha", type: "friendly", reason: "Natural partnership — competing priorities" },
    { factionId: "faction-obojima-crowsworn", type: "friendly", reason: "Corruption cure research" },
  ],
  territoryIds: [],
  influenceIds: [],
  leaderArchetype: "explorer",
  memberArchetype: "explorer",
  symbols: [],
  rumors: [],
  recruitmentHookIds: [],
  goalRumorIds: [],
  status: "active",
};

// ============================================================
// 2. The Lionfish King
// ============================================================

const lionfishKing: Faction = {
  id: "faction-obojima-lionfish-king",
  name: "The Lionfish King",
  description:
    "Self-proclaimed monarch of the Western Shallows. Pompous, vain fish folk ruler who commands an underwater kingdom from the Coral Castle. Desperately seeks royal legitimacy through a marriage alliance with a nakudama royal heir.",
  archetype: "monstrous",
  factionType: "tribe",
  purpose: "Legitimize his rule through royal marriage, destroy Captain Clintock, expand his territory",
  scale: "regional",
  displayType: "Underwater kingdom",
  traits: ["Grandiose", "Vain"],
  region: "Western Shallows (offshore)",
  headquartersId: "dungeon-coral-castle",
  advantages: [
    { type: "military", name: "Shallows Army", description: "Elite crab sentinels, barracuda warriors, fish folk pirates" },
    { type: "apparatus", name: "The Doomspine", description: "War barge with Aquatic Stabilizer mounted in stolen Pointue prow" },
    { type: "territory", name: "Coral Castle", description: "Underwater fortress in the Shallows" },
    { type: "knowledge", name: "Royal Lineages", description: "Two ancient tomes tracking the nakudama royal bloodline" },
    { type: "wealth", name: "Boombox the Octopus", description: "Crimson octopus that produces priceless magical ink" },
    { type: "influence", name: "King of the Shallows", description: "Self-proclaimed king, feared by coastal settlements" },
  ] satisfies FactionAdvantage[],
  agenda: agenda([
    { description: "Hire surface-dweller mercenaries to assassinate Holly Clintock", targetType: "npc" },
    { description: "Decipher the Royal Lineages to identify a living nakudama royal heir" },
    { description: "Locate the heir and arrange a marriage alliance (willing or not)", targetType: "npc" },
    { description: "Hold a coronation ceremony legitimizing his rule in the spirit realm" },
    { description: "Destroy Captain Clintock and sink whatever's left of his fleet", targetType: "npc" },
    { description: "Expand territory from the Shallows into coastal waters" },
  ]),
  obstacle: {
    type: "missing_knowledge",
    description:
      "The Royal Lineages are written in cryptic nakudama code. His wizard Sleethar has failed to crack it. He needs AHA's translation expertise but can't approach surface-dwellers openly. Venomous Rex's corrupted deep-sea fish folk encroach from the east, forcing him to fight on two fronts.",
    targetId: "faction-obojima-aha",
  },
  immediateObstacle: {
    type: "internal_conflict",
    description:
      "Bloodfin the Foul, his exiled captain, is being corrupted by the sea hag Slurpgill who is grooming Bloodfin to become a hag and defect to Venomous Rex. The King doesn't know about Slurpgill's involvement.",
  },
  want: "A scholar who can decipher the Royal Lineages. Would trade almost anything except the Aquatic Stabilizer or the octopus.",
  tension:
    "Has what Mariners' Guild desperately needs (Stabilizer). Needs what AHA has (translation). Dawn Blossom needs his octopus ink for currency. Venomous Rex pressures from the east. Some vassals are secretly friendly to Clintock's daughters.",
  goals: [],
  methods: [],
  resources: [],
  relationships: [
    { factionId: "faction-obojima-mariners-guild", type: "hostile", reason: "Blood feud — stole the Stabilizer" },
    { factionId: "faction-obojima-aha", type: "neutral", reason: "Needs their translation but can't ask openly" },
    { factionId: "faction-obojima-dawn-blossom", type: "neutral", reason: "Controls octopus ink Dawn Blossom needs" },
  ],
  territoryIds: [],
  influenceIds: [],
  leaderArchetype: "pirate",
  memberArchetype: "pirate",
  symbols: [],
  rumors: [],
  recruitmentHookIds: [],
  goalRumorIds: [],
  status: "active",
};

// ============================================================
// 3. Archaeologists, Historians & Archivists (AHA)
// ============================================================

const aha: Faction = {
  id: "faction-obojima-aha",
  name: "Archaeologists, Historians & Archivists",
  description:
    "Academic guild operating from a 19-level observatory in the southeastern Coastal Highlands. Maintains the island's largest First Age tech archive and field research teams at a dozen excavation sites. Spread dangerously thin.",
  archetype: "arcane",
  factionType: "guild",
  purpose: "Preserve and study First Age knowledge, research the Corruption, explore the Wandering Line subway network",
  scale: "major",
  displayType: "Academic guild",
  traits: ["Curious", "Cautious"],
  region: "Island-wide (dozen+ field sites), HQ in southeastern Coastal Highlands",
  headquartersId: "settlement-aha-hq",
  advantages: [
    { type: "knowledge", name: "First Age Archive", description: "Largest First Age tech archive — computers, floppy disks, arcade cabinets, radios, VHS tapes, cassette players" },
    { type: "specialization", name: "Translation Expertise", description: "Translation expertise for First Age languages and codes; deciphered much of First Age language" },
    { type: "alliance", name: "Field Research Network", description: "Field research teams at dozen+ excavation sites; ~20 staff at Yatamon library outpost; chronicler spirits" },
    { type: "territory", name: "Observatory HQ", description: "19-level observatory HQ with telescope, labs, archive, curio museum; Yatamon library outpost" },
    { type: "wealth", name: "First Age Stockpile", description: "First Age canned food stockpile, preserved artifacts, refurbished telescope" },
  ] satisfies FactionAdvantage[],
  agenda: agenda([
    { description: "Explore the ancient subway tunnels beneath Yatamon — Dr. Frond's dig is pushing deeper into the undercity", targetType: "location" },
    { description: "Discover where the Wandering Line goes and what its depot network connects to" },
    { description: "Research the Corruption — housing infected rangers, studying skeletonized fish, losing researchers to exposure" },
    { description: "Investigate the stellar anomaly — constellations have shifted, star movements are slowing" },
    { description: "Gain access to underwater ruins via Mariners' Guild submarine", targetType: "faction", targetId: "faction-obojima-mariners-guild" },
    { description: "Decode Lonzo's mysterious radio 'war dispatches'" },
    { description: "Find the Disappearing Mountain" },
  ]),
  obstacle: {
    type: "lack_of_resources",
    description:
      "Spread too thin. Field researchers falling ill from Corruption exposure. The most critical underwater ruins require the Mariners' Guild submarine, but the Guild demands Corruption research help first. Yatamon subway dig keeps hitting collapsed tunnels and dangerous creatures.",
  },
  immediateObstacle: {
    type: "powerful_enemy",
    description:
      "The flooded lowest levels of AHA headquarters have been discovered and occupied by corrupted viperfish folk loyal to Venomous Rex. They're actively looking for a way into the upper floors. AHA has no idea they're down there.",
  },
  want: "Underwater First Age ruin access (Mariners' Guild has it). The Royal Lineages (Lionfish King has them). Safe passage through subway tunnels. Answers about the Wandering Line depot network.",
  tension:
    "Natural partnership with Mariners' Guild but competing priorities. Could be kingmaker in the Lionfish King conflict. Krocius is secretly using Frond's dig to hunt for the Prison of Oghmai. Viperfish folk have infiltrated the flooded HQ basement.",
  goals: [],
  methods: [],
  resources: [],
  relationships: [
    { factionId: "faction-obojima-mariners-guild", type: "friendly", reason: "Natural partnership, competing priorities" },
    { factionId: "faction-obojima-lionfish-king", type: "neutral", reason: "Could trade translation services but would legitimize a tyrant" },
    { factionId: "faction-obojima-flying-phin", type: "neutral", reason: "Phin was once AHA, wants to keep airfield tech to himself" },
    { factionId: "faction-obojima-lom-salt", type: "friendly", reason: "Lom & Salt want metallurgy manuals from the archive" },
    { factionId: "faction-obojima-deep-current", type: "neutral", reason: "Krocius secretly steering digs toward Oghmai's prison" },
  ],
  territoryIds: [],
  influenceIds: [],
  leaderArchetype: "scholar",
  memberArchetype: "scholar",
  symbols: [],
  rumors: [],
  recruitmentHookIds: [],
  goalRumorIds: [],
  status: "active",
};

// ============================================================
// 4. Fish Head Coven
// ============================================================

const fishHeadCoven: Faction = {
  id: "faction-obojima-fish-head-coven",
  name: "Fish Head Coven",
  description:
    "The most powerful witch coven on Obojima, operating from the Witching Tower in the Gale Fields. Led by the Council of Three and Thirty. Seeks total monopoly over magical ingredient knowledge through the seven Almanac volumes.",
  archetype: "arcane",
  factionType: "cult",
  purpose: "Collect all seven Almanac volumes and achieve total monopoly over magical ingredient knowledge",
  scale: "major",
  displayType: "Most powerful witch coven",
  traits: ["Domineering", "Secretive"],
  region: "Gale Fields (HQ), island-wide influence",
  headquartersId: "settlement-witching-tower",
  advantages: [
    { type: "magic", name: "Almanac Volumes", description: "2 of 7 Almanac volumes (Gale Fields & Shallows), cassette tape spell scrolls" },
    { type: "apparatus", name: "Cassette Spellcasting", description: "First Age cassette players repurposed as spellcasting foci" },
    { type: "subterfuge", name: "Witch Network", description: "Dozens of affiliated witches embedded across island; chot-to spy statues in the Sanctum" },
    { type: "territory", name: "The Closed Fists", description: "Twin vaults: Northern = bulk ingredient stores guarded by urugama demons. Southern = most dangerous magic items, mushroom cage defenses" },
    { type: "knowledge", name: "The Sanctum", description: "Secret underground cavern with hundreds of chot-to statues storing spells, events, and ingredient recipes" },
    { type: "influence", name: "Coven Supremacy", description: "Most powerful coven — others defer or resent them. Help run the Witchery academy in Yatamon" },
  ] satisfies FactionAdvantage[],
  agenda: agenda([
    { description: "Locate the covens holding the remaining 5 Almanac volumes" },
    { description: "Acquire volumes through trade, trickery, or intimidation — starting with Cloud Cap's", targetType: "faction", targetId: "faction-obojima-cloud-cap-coven" },
    { description: "Obtain Spirit Coal from the Wandering Line's caboose for master recipes", targetType: "item" },
    { description: "Achieve total monopoly over magical ingredient knowledge on Obojima" },
    { description: "Discover what the Crawling Canopy is hiding — the Council of Kroo's territorial secrecy intrigues them", targetType: "faction", targetId: "faction-obojima-council-of-kroo" },
  ]),
  obstacle: {
    type: "rival_faction",
    description:
      "Every rival coven guards their Almanac volume with their lives. Direct theft risks open coven war. The Council must acquire them without uniting the other covens against them. The Crawling Canopy keeps evading their scouting parties.",
  },
  immediateObstacle: {
    type: "powerful_enemy",
    description:
      "Sorolu — an elder spirit of earth and vines in the Gale Fields — is suffering from an unknown malady, weakening the land magic the coven draws on. If Sorolu dies or turns demon, the hedgerow wards may fail.",
  },
  want: "The 5 remaining Almanac volumes. Spirit Coal from the Wandering Line. Access to the Crawling Canopy's secrets. Will trade cassette spell scrolls or favors but never their own volumes.",
  tension:
    "Every coven interaction colored by Almanac rivalry. Goro Goros' Mikiko is secretly a Fish Head apprentice. Council of Kroo keeps moving the Canopy to evade scouts. Tellu & Scale's heritage claim to Lilywin is a territorial threat. Dawn Blossom needs their ingredients.",
  goals: [],
  methods: [],
  resources: [],
  relationships: [
    { factionId: "faction-obojima-cloud-cap-coven", type: "rival", reason: "Pressuring for their Almanac volume" },
    { factionId: "faction-obojima-crowsworn", type: "rival", reason: "Almanac volume rivalry — demands a trade" },
    { factionId: "faction-obojima-council-of-kroo", type: "rival", reason: "Crawling Canopy territorial secrets" },
    { factionId: "faction-obojima-tellu-scale", type: "rival", reason: "Lilywin ruins access — territorial threat" },
    { factionId: "faction-obojima-dawn-blossom", type: "neutral", reason: "Economic dependency — ingredient supply" },
    { factionId: "faction-obojima-goro-goros", type: "neutral", reason: "Mikiko is secretly a Fish Head apprentice" },
  ],
  territoryIds: [],
  influenceIds: [],
  leaderArchetype: "witch",
  memberArchetype: "witch",
  symbols: [],
  rumors: [],
  recruitmentHookIds: [],
  goalRumorIds: [],
  status: "active",
};

// ============================================================
// 5. Courier Brigade
// ============================================================

const courierBrigade: Faction = {
  id: "faction-obojima-courier-brigade",
  name: "Courier Brigade",
  description:
    "Postal knights order headquartered in a First Age bank in Yatamon. Maintains island-wide delivery network with fish-mouth postal boxes in every settlement. Led by Postmaster General Miranda Escalante.",
  archetype: "military",
  factionType: "guild",
  purpose: "Maintain island-wide postal service, restore delivery to Corruption-cut eastern settlements, earn recognition as civil defense force",
  scale: "major",
  displayType: "Postal knights order",
  traits: ["Dutiful", "Stubborn"],
  region: "Island-wide",
  headquartersId: "settlement-yatamon",
  advantages: [
    { type: "territory", name: "Outpost Network", description: "Fort Harglo, Yatamon bank HQ, brigade halls and outposts in most towns. Maintains major roads across the Gale Fields" },
    { type: "military", name: "Postal Knights", description: "Elite postal knights with rapid-response squad, trained bird mounts. Every knight has a home anywhere on the island" },
    { type: "apparatus", name: "Flying Lantern & Vault", description: "First Age bank vault for package storage, the Flying Lantern hot air balloon, Toggle minecarts and water flume" },
    { type: "specialization", name: "Waxworks Division", description: "Dedicated arcane rogues for the most perilous deliveries — wax/fire enchantments" },
    { type: "knowledge", name: "Postal Intelligence", description: "Island-wide network — couriers see and hear everything. Fish-mouth postal boxes in every settlement" },
    { type: "influence", name: "Deliverance Through Delivery", description: "Unshakeable institutional creed. Sworn in through ceremonial oath" },
  ] satisfies FactionAdvantage[],
  agenda: agenda([
    { description: "Map safe routes through eastern corrupted territory using Ranger intel", targetType: "faction", targetId: "faction-obojima-rangers" },
    { description: "Acquire working First Age vehicles for faster dangerous-zone delivery" },
    { description: "Establish a fortified relay station in the Brackwater Wetlands", targetType: "location" },
    { description: "Restore full delivery service to Polewater and eastern settlements" },
    { description: "Earn formal recognition as Obojima's civil defense force" },
  ]),
  obstacle: {
    type: "rival_faction",
    description:
      "The Rangers have the territory maps and safe-passage knowledge the Brigade needs, but sharing intel means publicly admitting the eastern front is collapsing. Brackwater paths washed away by the tsunami.",
    targetId: "faction-obojima-rangers",
  },
  immediateObstacle: {
    type: "internal_conflict",
    description:
      "Imelda, a package thief in Yatamon, uses her spirit companion Choofi to raid unattended Brigade wagons. Gomber and Beeks are on her trail but she keeps evading them. Every stolen package undermines public trust.",
  },
  want: "Rangers' Corruption territory maps and safe-passage routes. Working First Age vehicles. Toraf & Boulder's combat-experienced students as route escorts. A way to reopen communication with Polewater.",
  tension:
    "Loosely allied with Rangers but strained by pride. Fort Harglo sits in Fish Head territory. Roads they maintain in the Gale Fields may trace ancient Lilywin streets — Tellu & Scale's claim could complicate road maintenance.",
  goals: [],
  methods: [],
  resources: [],
  relationships: [
    { factionId: "faction-obojima-rangers", type: "allied", reason: "Eastern Corruption front, mutual need" },
    { factionId: "faction-obojima-toraf-boulder", type: "friendly", reason: "Reinforcement requests" },
    { factionId: "faction-obojima-fish-head-coven", type: "neutral", reason: "Fort Harglo in Fish Head territory — non-aggression arrangement" },
  ],
  territoryIds: [],
  influenceIds: [],
  leaderArchetype: "courier",
  memberArchetype: "courier",
  symbols: [],
  rumors: [],
  recruitmentHookIds: [],
  goalRumorIds: [],
  status: "active",
};

// ============================================================
// 6. Cloud Cap Coven
// ============================================================

const cloudCapCoven: Faction = {
  id: "faction-obojima-cloud-cap-coven",
  name: "Cloud Cap Coven",
  description:
    "Reclusive mountain witch coven hidden on Mount Arbora. Originated from a mountaintop village where 'hunting for lightning' was common practice. Guards sacred spirit sanctuaries and unknowingly protects the approaches to Oghmai's prison.",
  archetype: "arcane",
  factionType: "cult",
  purpose: "Protect Mount Arbora's sacred spirit sanctuaries from encroachment, guard the Almanac volume, monitor the Corruption's spread to mountain waterways",
  scale: "local",
  displayType: "Mountain witch coven",
  traits: ["Vigilant", "Reclusive"],
  region: "Mount Arbora",
  advantages: [
    { type: "magic", name: "Almanac Volume", description: "1 of 7 Almanac volumes (Mount Arbora region) — jealously guarded" },
    { type: "specialization", name: "Mountain Herbs", description: "Rare high-altitude herbs and fungi found nowhere else; lightning-hunting tradition" },
    { type: "knowledge", name: "Spirit Pathways", description: "Deep knowledge of Mount Arbora's spirit pathways, sacred sites, and massive slope creatures" },
    { type: "territory", name: "Hidden Mountain HQ", description: "Hidden HQ in Obojima's most treacherous terrain — mists, crags, titanic creatures deter intruders" },
    { type: "subterfuge", name: "Nuharo/Grimcloak", description: "Nuharo embedded in the Graysteps as 'Grimcloak,' gathering intelligence from mountain travelers" },
  ] satisfies FactionAdvantage[],
  agenda: agenda([
    { description: "Protect Mount Arbora's sacred spirit sanctuaries from Lom & Salt's forge expansion", targetType: "faction", targetId: "faction-obojima-lom-salt" },
    { description: "Resist Fish Head Coven's escalating pressure to surrender their Almanac volume", targetType: "faction", targetId: "faction-obojima-fish-head-coven" },
    { description: "Monitor the Sky King's domain and the aeronaut craze from Sky Kite Valley" },
    { description: "Assess whether the Corruption threatens Mount Arbora's rivers and meltwater" },
    { description: "Maintain Nuharo's cover in the Graysteps and expand intelligence gathering" },
  ]),
  obstacle: {
    type: "rival_faction",
    description:
      "Squeezed from all sides. Fish Head pressures for the Almanac volume. Lom & Salt's forge expansion cuts through spirit sanctuaries. AHA wants mountain sacred site access. Rock Raley's Sky King expedition threatens to bring outsiders. Every faction wants something from Mount Arbora.",
  },
  immediateObstacle: {
    type: "powerful_enemy",
    description:
      "In the Graysteps, village elder Phent keeps a Corruption-tainted spirit captive and plans to release it as a demon in Toggle. Nuharo operates next door and has no idea. If Phent's demon escapes, Nuharo's cover could unravel and outsiders would demand access to Cloud Cap's sacred sites.",
  },
  want: "Fish Head to stop pressuring for the Almanac volume. Lom & Salt to respect spirit sanctuary boundaries. Outsiders to stay away from the Sky King's domain. Corruption intelligence for mountain waterways.",
  tension:
    "Fish Head's Almanac pressure is relentless. Lom & Salt trades sacred Guardian Sphere fragments to AHA — Cloud Cap considers this profane. The Deep Current seeks mountain access for unknown reasons. Rock Raley's Sky King expedition could bring chaos. Phent's demon scheme is a ticking bomb.",
  goals: [],
  methods: [],
  resources: [],
  relationships: [
    { factionId: "faction-obojima-fish-head-coven", type: "rival", reason: "Relentless pressure for the Almanac volume" },
    { factionId: "faction-obojima-lom-salt", type: "rival", reason: "Mount Arbora territorial — forge expansion into sacred ground" },
    { factionId: "faction-obojima-deep-current", type: "neutral", reason: "Deep Current seeks mountain access — Cloud Cap unknowingly guards Oghmai's prison" },
  ],
  territoryIds: [],
  influenceIds: [],
  leaderArchetype: "witch",
  memberArchetype: "witch",
  symbols: [],
  rumors: [],
  recruitmentHookIds: [],
  goalRumorIds: [],
  status: "active",
};

// ============================================================
// 7. Rangers of the Greenward Path
// ============================================================

const rangers: Faction = {
  id: "faction-obojima-rangers",
  name: "Rangers of the Greenward Path",
  description:
    "Ranger organization operating from outposts and camps across eastern Obojima. On the front lines against the Corruption. Many already infected. The most militarily exposed faction — they're losing.",
  archetype: "military",
  factionType: "militia",
  purpose: "Hold the eastern front against the Corruption, cure infected rangers, find the Corruption's origin",
  scale: "regional",
  displayType: "Ranger organization",
  traits: ["Grim", "Loyal"],
  region: "Eastern Obojima (Brackwater Wetlands, Shade Wood, eastern coastline)",
  advantages: [
    { type: "knowledge", name: "Corruption Maps", description: "Detailed maps of Corruption spread, firsthand knowledge of corrupted territory survival" },
    { type: "specialization", name: "Vaulter's Axe", description: "Signature ranger tool for Brackwater exploration. Field expertise in tracking and fighting Wetlands monsters" },
    { type: "alliance", name: "Military Alliances", description: "Alliance with Toraf & Boulder. Attempting supply runs to Polewater. Crowsworn coven is their closest magical ally" },
    { type: "knowledge", name: "Field Samples", description: "Field samples of corrupted flora and fauna. Rangers embedded at AHA labs providing live Corruption data" },
    { type: "influence", name: "Unwavering Conviction", description: "Will not abandon the eastern front regardless of cost" },
  ] satisfies FactionAdvantage[],
  agenda: agenda([
    { description: "Compare land Corruption samples with Mariners' Guild underwater samples", targetType: "faction", targetId: "faction-obojima-mariners-guild" },
    { description: "Identify common origin point or vulnerability in the Corruption" },
    { description: "Develop a field-deployable countermeasure (working with Crowsworn potions)", targetType: "faction", targetId: "faction-obojima-crowsworn" },
    { description: "Get relief supplies through to Polewater", targetType: "location" },
    { description: "Cure infected rangers before the disease becomes irreversible" },
    { description: "Push the Corruption boundary back from populated areas" },
  ]),
  obstacle: {
    type: "lack_of_resources",
    description:
      "The Rangers are losing. Many already infected — publicly admitting casualties could cause panic. Mariners' Guild has underwater samples they need but demands escorts in return. Spread impossibly thin: refugee camps, supply runs, AHA labs, and holding the Corruption boundary with dwindling healthy numbers.",
  },
  immediateObstacle: {
    type: "internal_conflict",
    description:
      "Tetsuri, a corrupted Ranger hiding in Toggle under a false identity, is hooked on Venomous Rex's stonefish venom and waiting to kidnap Holly Clintock. If he succeeds, the Pointue stays broken and the Corruption's source stays hidden.",
  },
  want: "Mariners' Guild underwater Corruption samples. Courier Brigade reinforcements and route escorts. Crowsworn's experimental potions. Healthy replacements.",
  tension:
    "Most urgent faction. Alliance with Toraf & Boulder is strong but both are exhausted. Crowsworn is their best magical ally but demands an Almanac volume trade. Tetsuri's betrayal will shake the Rangers' trust.",
  goals: [],
  methods: [],
  resources: [],
  relationships: [
    { factionId: "faction-obojima-courier-brigade", type: "allied", reason: "Eastern Corruption front, mutual need" },
    { factionId: "faction-obojima-toraf-boulder", type: "allied", reason: "Master Boulder is a former Ranger — military alliance" },
    { factionId: "faction-obojima-crowsworn", type: "allied", reason: "Closest magical ally" },
    { factionId: "faction-obojima-mariners-guild", type: "friendly", reason: "Need underwater samples, competing priorities" },
  ],
  territoryIds: [],
  influenceIds: [],
  leaderArchetype: "ranger",
  memberArchetype: "ranger",
  symbols: [],
  rumors: [],
  recruitmentHookIds: [],
  goalRumorIds: [],
  status: "active",
};

// ============================================================
// 8. Lom & Salt's College of Arms
// ============================================================

const lomSalt: Faction = {
  id: "faction-obojima-lom-salt",
  name: "Lom & Salt's College of Arms",
  description:
    "Oldest sword school on Obojima, cut into the mountainside on Mount Arbora's upper reaches. Tradition of swordsmanship AND swordsmithing dating to the early Nakudama Age. Every sword school master on the island carries one of their blades.",
  archetype: "military",
  factionType: "militia",
  purpose: "Forge a legendary blade by combining First Age alloys with traditional techniques, re-establish dominance over rival schools",
  scale: "local",
  displayType: "Oldest sword school",
  traits: ["Traditional", "Proud"],
  region: "Mount Arbora",
  headquartersId: "settlement-lom-salts",
  advantages: [
    { type: "apparatus", name: "Ancient Forge", description: "Forge heated by Mount Arbora's geothermal vents; secret sanctum forge for worthy students" },
    { type: "specialization", name: "Metal Selection System", description: "Swordsmanship AND swordsmithing tradition from the Second Age. Metal selection: cobalt, copper, lead, nickel, tungsten, zinc — each with unique properties" },
    { type: "influence", name: "Legendary Reputation", description: "Oldest martial institution. Every sword school master on the island carries one of their blades" },
    { type: "territory", name: "Remote Mountain Position", description: "Most remote school — the ascent itself serves as the first test" },
    { type: "knowledge", name: "Four Virtues", description: "Philosophical foundation: defense, aid, denial, restraint — 'A sword is a thing of terrible potential'" },
  ] satisfies FactionAdvantage[],
  agenda: agenda([
    { description: "Obtain First Age metallurgy manuals from AHA (airplane maintenance docs detail alloy compositions)", targetType: "faction", targetId: "faction-obojima-aha" },
    { description: "Acquire Spirit Coal from the Wandering Line's caboose for the forge", targetType: "item" },
    { description: "Combine First Age alloys with traditional techniques and glyph-folding methods from Toggle" },
    { description: "Forge a legendary blade worthy of the school's ancient reputation" },
    { description: "Present the blade at a grand tournament, re-establishing dominance over rival schools" },
  ]),
  obstacle: {
    type: "geographic",
    description:
      "The metallurgy manuals are split between AHA's archive and Broken Bird Airfield. AHA wants mountain sacred sites access in return — but Cloud Cap Coven controls that territory. Spirit Coal requires surviving the Coal Master's trial. Isolation that was once a strength now cuts them off from forming alliances.",
  },
  immediateObstacle: {
    type: "internal_conflict",
    description:
      "Air pirates on the western slope include Lom's former bandit associates who know her past. If word spreads that a respected swordmaster was once a raider, it undermines the school's moral authority — the very foundation of their philosophy.",
  },
  want: "First Age metallurgy manuals (AHA has them). Spirit Coal (Wandering Line). Collaboration with Toggle's forgemasters on glyph-folding. Cloud Cap Coven to acknowledge the school's ancient mountain claim.",
  tension:
    "Operating in Cloud Cap territory — forge expansion risks sacred ground. Canden & Moon's political ambitions threaten their prestige. Toraf & Boulder respects them but is consumed by the Corruption front. Tellu & Scale trained here and carry their blades.",
  goals: [],
  methods: [],
  resources: [],
  relationships: [
    { factionId: "faction-obojima-cloud-cap-coven", type: "rival", reason: "Mount Arbora territorial — forge expansion into sacred ground" },
    { factionId: "faction-obojima-aha", type: "friendly", reason: "Metallurgy knowledge trade" },
    { factionId: "faction-obojima-canden-moon", type: "neutral", reason: "Respects skill, questions substance" },
    { factionId: "faction-obojima-toraf-boulder", type: "friendly", reason: "Mutual respect between martial schools" },
    { factionId: "faction-obojima-tellu-scale", type: "friendly", reason: "Tellu & Scale trained here, carry their blades" },
  ],
  territoryIds: [],
  influenceIds: [],
  leaderArchetype: "swordmaster",
  memberArchetype: "swordmaster",
  symbols: [],
  rumors: [],
  recruitmentHookIds: [],
  goalRumorIds: [],
  status: "active",
};

// ============================================================
// 9. Canden & Moon's School
// ============================================================

const candenMoon: Faction = {
  id: "faction-obojima-canden-moon",
  name: "Canden & Moon's School",
  description:
    "The largest sword school on Obojima, occupying an ornate hexagonal structure in the heart of Yatamon. Emphasis on service — students bolster the city watch, escort AHA researchers, and handle monster threats.",
  archetype: "military",
  factionType: "militia",
  purpose: "Train warriors who serve Obojima through community service, maintain the school's spotless reputation",
  scale: "regional",
  displayType: "Largest sword school",
  traits: ["Disciplined", "Influential"],
  region: "Gift of Shuritashi (Yatamon)",
  headquartersId: "settlement-yatamon",
  advantages: [
    { type: "military", name: "Largest Student Body", description: "Most popular school — most Obojimans have 'at least spent a summer' here. Students bolster city watch and escort AHA researchers" },
    { type: "territory", name: "Yatamon Heart", description: "Prime hexagonal structure in Yatamon's heart with training ground, dormitory, community service hub" },
    { type: "influence", name: "Unblemished Reputation", description: "Tremendous political influence through wisdom and producing fine warriors. Universally well-regarded" },
    { type: "specialization", name: "The Inscrutable Sword", description: "Dance-like movements emphasizing swiftness — opponent never sure if attacking or defending" },
    { type: "knowledge", name: "Four Acts of Service", description: "Guard duty, judging contests, monster threats, and escorting AHA researchers into subway tunnels" },
  ] satisfies FactionAdvantage[],
  agenda: agenda([
    { description: "Address the Goro Goros problem — magical graffiti defaces the school publicly", targetType: "faction", targetId: "faction-obojima-goro-goros" },
    { description: "Demonstrate the school's value through expanded community service" },
    { description: "Win a decisive public tournament victory over a rival school" },
    { description: "Ensure the school's integrity remains unblemished as security deteriorates" },
    { description: "Fulfill Master Canden's vision: every student should serve Obojima, not just themselves" },
  ]),
  obstacle: {
    type: "rival_faction",
    description:
      "The Goro Goros' magical graffiti mocks them and resists removal. A violent crackdown would destroy their image of restraint. Meanwhile Toraf & Boulder is fighting and dying in the east — Canden & Moon's students have numbers but lack combat experience. Sending them to the front could be a massacre.",
    targetId: "faction-obojima-goro-goros",
  },
  immediateObstacle: {
    type: "powerful_enemy",
    description:
      "Students escorting AHA researchers into subway tunnels are encountering increasingly dangerous conditions. A student going missing or killed would force the masters to cut off AHA's escort arrangement, crippling Frond's dig.",
  },
  want: "Goro Goros to stop defacing the school. A rival school willing to accept a formal tournament challenge. Recognition of community service record. Safe subway passage for students.",
  tension:
    "Goro Goros' Mikiko is secretly a budding witch making pigment potions. Toraf & Boulder views the school as privileged and untested. Lom & Salt considers their emphasis on form over substance misguided. The subway escort missions make them AHA's most important local ally.",
  goals: [],
  methods: [],
  resources: [],
  relationships: [
    { factionId: "faction-obojima-goro-goros", type: "hostile", reason: "Street vs establishment — magical graffiti vandalism campaign" },
    { factionId: "faction-obojima-toraf-boulder", type: "neutral", reason: "Toraf & Boulder views them as privileged and untested" },
    { factionId: "faction-obojima-lom-salt", type: "neutral", reason: "Mutual respect, philosophical disagreement" },
    { factionId: "faction-obojima-aha", type: "friendly", reason: "Subway escort arrangement — informal but critical" },
  ],
  territoryIds: [],
  influenceIds: [],
  leaderArchetype: "swordmaster",
  memberArchetype: "guard",
  symbols: [],
  rumors: [],
  recruitmentHookIds: [],
  goalRumorIds: [],
  status: "active",
};

// ============================================================
// 10. Toraf & Boulder's School of Guts & Grit
// ============================================================

const torafBoulder: Faction = {
  id: "faction-obojima-toraf-boulder",
  name: "Toraf & Boulder's School of Guts & Grit",
  description:
    "Practical combat sword school on the southernmost point of the Pale Hills overlooking the Brackwater Wetlands. Field training IS the curriculum — even the greenest students go on expeditions. The most militarily exposed school.",
  archetype: "military",
  factionType: "militia",
  purpose: "Hold the Brackwater against the Corruption, train real fighters through field combat, protect refugees",
  scale: "local",
  displayType: "Practical combat sword school",
  traits: ["Battle-Hardened", "Blunt"],
  region: "Brackwater Wetlands / Pale Hills",
  headquartersId: "settlement-torf-bolders",
  advantages: [
    { type: "military", name: "Battle-Hardened Students", description: "Real combat experience against Wetlands monsters and Corruption. Field training IS the curriculum" },
    { type: "alliance", name: "Ranger Alliance", description: "Military alliance with Rangers — Master Boulder is a former Ranger and still holds his oath" },
    { type: "specialization", name: "The Striking Snake", description: "Three strikes from the same guard position, obscuring the target — developed to counter Brackwater monsters" },
    { type: "influence", name: "Unwavering Conviction", description: "Will not retreat from the eastern front. Previous masters died and summoned Toraf and Boulder as successors" },
    { type: "territory", name: "Pale Hills Tower", description: "Stone tower on the Pale Hills — natural watchtower and defensible position overlooking the Wetlands" },
  ] satisfies FactionAdvantage[],
  agenda: agenda([
    { description: "Hold the Brackwater against the Corruption's westward spread" },
    { description: "Send student expeditions to Polewater to help rebuild", targetType: "location" },
    { description: "Train enough students to rotate front-line shifts without burning out" },
    { description: "Secure uncorrupted fresh water — the Wetlands are being poisoned" },
    { description: "Get reinforcements from anywhere willing to fight" },
  ]),
  obstacle: {
    type: "lack_of_resources",
    description:
      "Asking for help means admitting the east is losing. Canden & Moon has numbers but their students lack combat experience. Rangers are their closest allies but both are exhausted. The previous masters died of a Wetlands sickness. The masters are NOT friends — bound only by mutual contempt for other schools.",
  },
  immediateObstacle: {
    type: "powerful_enemy",
    description:
      "Vespoma have overrun Hakumon's Ramen Shop. A student expedition to Polewater hasn't reported back. Boulder wants to go after the missing students but leaving the school undefended means trusting Toraf alone. Neither master trusts the other that far.",
  },
  want: "Courier Brigade soldiers. Canden & Moon students (trained up fast). Clean water. Crowsworn's Corruption-resistance potions. Missing student expedition returned safely.",
  tension:
    "Most militarily exposed faction. Respects Rangers but both are running on fumes. Contempt for Canden & Moon's privileged students. The masters' volatile relationship held together by necessity. Hakumon's crisis and missing Polewater expedition force them to divide already-thin resources.",
  goals: [],
  methods: [],
  resources: [],
  relationships: [
    { factionId: "faction-obojima-rangers", type: "allied", reason: "Master Boulder is a former Ranger — military alliance" },
    { factionId: "faction-obojima-courier-brigade", type: "friendly", reason: "Reinforcement requests" },
    { factionId: "faction-obojima-canden-moon", type: "neutral", reason: "Contempt for privileged, untested students" },
    { factionId: "faction-obojima-crowsworn", type: "friendly", reason: "Need their Corruption-resistance potions" },
  ],
  territoryIds: [],
  influenceIds: [],
  leaderArchetype: "swordmaster",
  memberArchetype: "guard",
  symbols: [],
  rumors: [],
  recruitmentHookIds: [],
  goalRumorIds: [],
  status: "active",
};

// ============================================================
// 11. Dawn Blossom Guild
// ============================================================

const dawnBlossom: Faction = {
  id: "faction-obojima-dawn-blossom",
  name: "Dawn Blossom Guild",
  description:
    "The secretive currency minting guild that controls Obojima's entire economy. Leadership identities hidden. Sole authority to mint Gold Flowers, Sea Petals, and Copper Buds. Maintains strict neutrality.",
  archetype: "mercantile",
  factionType: "guild",
  purpose: "Maintain currency stability and the island's monetary system",
  scale: "major",
  displayType: "Currency minting / economic guild",
  traits: ["Calculating", "Neutral"],
  region: "Island-wide influence",
  advantages: [
    { type: "wealth", name: "Currency Monopoly", description: "Sole authority to mint Gold Flowers, Sea Petals, and Copper Buds" },
    { type: "apparatus", name: "Coin-Pressing Machinery", description: "First Age coin-pressing machinery enchanted with spirit magic" },
    { type: "artifact", name: "Spirit Essence Vault", description: "Vault of pure spirit essence used in minting enchantments" },
    { type: "subterfuge", name: "Anonymous Leadership", description: "Leadership identities hidden — can't be pressured politically" },
    { type: "territory", name: "Economic Control", description: "Control the entire island's economy through currency supply" },
  ] satisfies FactionAdvantage[],
  agenda: agenda([
    { description: "Secure a reliable supply of crimson octopus ink from Lionfish King's octopus", targetType: "faction", targetId: "faction-obojima-lionfish-king" },
    { description: "Acquire rare ingredients from Fish Head Coven for new coin enchantment batches", targetType: "faction", targetId: "faction-obojima-fish-head-coven" },
    { description: "Collect working First Age vending machines to expand coin distribution" },
    { description: "Maintain currency stability despite Corruption disrupting eastern trade" },
    { description: "Prevent any faction from gaining enough power to threaten the monetary system" },
  ]),
  obstacle: {
    type: "rival_faction",
    description:
      "Dependent on two hostile factions for critical resources: the Lionfish King controls the only crimson octopus (ink source), and the Fish Head Coven controls magical ingredients for enchantments. Both leverage this dependency for favorable exchange rates.",
  },
  want: "Reliable octopus ink supply (Lionfish King). Coven ingredients (Fish Head). First Age vending machines. Will pay well and stay neutral — unless the money is threatened.",
  tension:
    "The invisible hand. Every faction needs their currency. Strict neutrality but could tip any conflict by withholding or flooding coin supply. Someone is counterfeiting.",
  goals: [],
  methods: [],
  resources: [],
  relationships: [
    { factionId: "faction-obojima-lionfish-king", type: "neutral", reason: "Economic dependency — octopus ink" },
    { factionId: "faction-obojima-fish-head-coven", type: "neutral", reason: "Economic dependency — magical ingredients" },
  ],
  territoryIds: [],
  influenceIds: [],
  leaderArchetype: "merchant",
  memberArchetype: "merchant",
  symbols: [],
  rumors: [],
  recruitmentHookIds: [],
  goalRumorIds: [],
  status: "active",
};

// ============================================================
// 12. Flying Phin's Airship Service
// ============================================================

const flyingPhin: Faction = {
  id: "faction-obojima-flying-phin",
  name: "Flying Phin's Airship Service",
  description:
    "One-man operation at the derelict Broken Bird Airfield. Phin, a former AHA member, has devoted his life to restoring a First Age aircraft called 'the Menace.' Harpies occupy the control tower. Unknown to Phin, a spirit named Plitsu is sabotaging his work.",
  archetype: "arcane",
  factionType: "guild",
  purpose: "Restore the Menace to powered flight, figure out who keeps stealing tools, achieve real aviation",
  scale: "local",
  displayType: "Aviation obsessive / airfield hermit",
  traits: ["Obsessive", "Resourceful"],
  region: "Coastal Highlands",
  headquartersId: "settlement-broken-bird",
  advantages: [
    { type: "apparatus", name: "Broken Bird Airfield", description: "Multiple First Age aircraft frames, 'the Menace' restoration, runway, two hangars of salvageable parts" },
    { type: "knowledge", name: "Airplane Plans", description: "Airplane plans stored in the harpy-occupied control tower. Phin's AHA background gives deep First Age mechanics knowledge" },
    { type: "specialization", name: "Flying Machine Mechanic", description: "One of the best flying machine mechanics on Obojima — even if results are limited" },
    { type: "territory", name: "Dangerous Airfield", description: "A rite of passage for Young Stewards, a destination for flight enthusiasts" },
  ] satisfies FactionAdvantage[],
  agenda: agenda([
    { description: "Get the Menace airworthy — restore it to sustained powered flight" },
    { description: "Figure out why tools keep disappearing (blames harpies — it's actually Plitsu)" },
    { description: "Retrieve the airplane plans from inside the harpy-occupied control tower" },
    { description: "Find spirits willing to power a biplane engine" },
    { description: "Achieve real flight — reach the Sky King's domain or the Vanishing Mountain" },
  ]),
  obstacle: {
    type: "powerful_enemy",
    description:
      "Everything conspires against flight. Plitsu secretly sabotages his work. Airplane plans locked in harpy territory. Powered flight requires multiple spirits in concert. A dormant slime colony beneath the runway would emerge if anything heavy trundles down the strip. And Rumble Hill (actually a Cat of Prodigious Size) would fixate on a flying machine.",
  },
  immediateObstacle: {
    type: "powerful_enemy",
    description:
      "Young Stewards snuck onto the airfield as a dare and haven't come back — believed in the harpies' clutches. Meanwhile, Bomber the harpy is approaching visitors offering information in exchange for help flying again.",
  },
  want: "His tools back (from Plitsu). The airplane plans from the control tower. Spirits willing to power the Menace. To be left alone to work.",
  tension:
    "Former AHA membership is a live connection — AHA wants airfield tech. Rock Raley's aviation craze is the competition. The harpies are an uneasy coexistence. Plitsu's sabotage is invisible to everyone.",
  goals: [],
  methods: [],
  resources: [],
  relationships: [
    { factionId: "faction-obojima-aha", type: "neutral", reason: "Former member — AHA wants airfield tech, Phin keeps it to himself" },
  ],
  territoryIds: [],
  influenceIds: [],
  leaderArchetype: "explorer",
  memberArchetype: "explorer",
  symbols: [],
  rumors: [],
  recruitmentHookIds: [],
  goalRumorIds: [],
  status: "active",
};

// ============================================================
// 13. Goro Goros
// ============================================================

const goroGoros: Faction = {
  id: "faction-obojima-goro-goros",
  name: "Goro Goros",
  description:
    "Youth street gang in Yatamon led by Tatsu. Known for elaborate magical graffiti that moves, whispers, and resists removal. Their power depends entirely on Mikiko, a secret Fish Head Coven apprentice who creates the magic ink.",
  archetype: "criminal",
  factionType: "syndicate",
  purpose: "Prove street magic is legitimate, humiliate Canden & Moon, be taken seriously as a real faction",
  scale: "local",
  displayType: "Youth street gang",
  traits: ["Defiant", "Creative"],
  region: "Gift of Shuritashi",
  headquartersId: "settlement-yatamon",
  advantages: [
    { type: "magic", name: "Magical Graffiti Ink", description: "Mikiko's creation — tags that move, whisper, and resist removal" },
    { type: "knowledge", name: "Subway Knowledge", description: "Intimate knowledge of Yatamon's underground First Age subway tunnels" },
    { type: "apparatus", name: "Magic Spray Paint", description: "Stash of First Age spray paint cans that amplify magical ink effects" },
    { type: "subterfuge", name: "Street Eyes", description: "Street-level eyes and ears across Yatamon's markets and alleys" },
    { type: "influence", name: "Folk Heroes", description: "Popular among Yatamon's working class" },
  ] satisfies FactionAdvantage[],
  agenda: agenda([
    { description: "Tag every Canden & Moon building with moving graffiti", targetType: "faction", targetId: "faction-obojima-canden-moon" },
    { description: "Acquire a cassette tape ward spell from Fish Head Coven to protect their tunnels", targetType: "faction", targetId: "faction-obojima-fish-head-coven" },
    { description: "Discover what's at the end of the sealed subway tunnels beneath Yatamon" },
    { description: "Prove street magic is as legitimate as coven witchery" },
    { description: "Be taken seriously as a real faction, not dismissed as delinquents" },
  ]),
  obstacle: {
    type: "internal_conflict",
    description:
      "Mikiko's double life. If Fish Head Coven discovers she's teaching magic to unlicensed street kids, they'll demand her return and punish the gang. The gang's power depends entirely on her ink — without Mikiko, they're just kids with spray paint.",
  },
  want: "A cassette tape ward spell (Fish Head has them). Canden & Moon publicly embarrassed. Recognition from any adult faction that they matter.",
  tension:
    "Mikiko's secret is a ticking bomb. Canden & Moon's Student Captain Reiko is hunting them. The sealed subway tunnels could connect to the Wandering Line — or something worse. Fish Head's spy may already suspect Mikiko.",
  goals: [],
  methods: [],
  resources: [],
  relationships: [
    { factionId: "faction-obojima-canden-moon", type: "hostile", reason: "Street vs establishment — vandalism campaign" },
    { factionId: "faction-obojima-fish-head-coven", type: "neutral", reason: "Mikiko is secretly a Fish Head apprentice" },
  ],
  territoryIds: [],
  influenceIds: [],
  leaderArchetype: "commoner",
  memberArchetype: "commoner",
  symbols: [],
  rumors: [],
  recruitmentHookIds: [],
  goalRumorIds: [],
  status: "active",
};

// ============================================================
// 14. Council of Kroo
// ============================================================

const councilOfKroo: Faction = {
  id: "faction-obojima-council-of-kroo",
  name: "Council of Kroo",
  description:
    "Four eccentric hermits living in tree houses in the Crawling Canopy — a mobile forest they can guide. Running 'cosmic calculations' on a First Age computer. May be sitting on the island's most significant discovery or its destruction.",
  archetype: "secret",
  factionType: "cult",
  purpose: "Complete cosmic calculations, determine what's buried beneath the Canopy, keep Fish Head Coven out",
  scale: "local",
  displayType: "Eccentric hermit council",
  traits: ["Eccentric", "Paranoid"],
  region: "Gale Fields (Crawling Canopy)",
  advantages: [
    { type: "apparatus", name: "First Age Computer", description: "Working First Age chunky computer used for 'cosmic calculations'" },
    { type: "knowledge", name: "Floppy Disk Keys", description: "Floppy disks that may be vault keys to something buried underground" },
    { type: "magic", name: "Canopy Control", description: "Control of the Crawling Canopy's movement — they guide the mobile forest" },
    { type: "territory", name: "Wicked Wizard Tavern", description: "Hidden meeting place inside the Canopy" },
    { type: "subterfuge", name: "Harmless Eccentrics", description: "Everyone dismisses them as harmless eccentrics" },
  ] satisfies FactionAdvantage[],
  agenda: agenda([
    { description: "Keep the Fish Head Coven's scouts out of the Crawling Canopy", targetType: "faction", targetId: "faction-obojima-fish-head-coven" },
    { description: "Complete the 'cosmic calculations' on the First Age computer" },
    { description: "Determine if the thing buried beneath the Canopy is a superweapon or just a very large machine" },
    { description: "If it's dangerous, ensure it stays buried forever" },
    { description: "If it's useful, figure out how to activate it without destroying the island" },
  ]),
  obstacle: {
    type: "rival_faction",
    description:
      "Fish Head Coven suspects the Canopy hides something valuable and sends regular scouting parties. The Council can move the forest to evade them, but each move disrupts the calculations and delays answers about what's buried below.",
    targetId: "faction-obojima-fish-head-coven",
  },
  want: "Fish Head Coven to leave them alone. More floppy disks (scattered across island). Someone who can actually program the computer.",
  tension:
    "Fish Head's interest is intensifying. If the buried thing is real, it could be the most significant discovery since the First Age. The Council is genuinely unsure if they're protecting the island or sitting on its destruction.",
  goals: [],
  methods: [],
  resources: [],
  relationships: [
    { factionId: "faction-obojima-fish-head-coven", type: "rival", reason: "Crawling Canopy territorial secrets" },
    { factionId: "faction-obojima-deep-current", type: "neutral", reason: "Floppy disk calculations may relate to Oghmai's seal" },
  ],
  territoryIds: [],
  influenceIds: [],
  leaderArchetype: "scholar",
  memberArchetype: "scholar",
  symbols: [],
  rumors: [],
  recruitmentHookIds: [],
  goalRumorIds: [],
  status: "active",
};

// ============================================================
// 15. Tellu & Scale's School of Blades
// ============================================================

const telluScale: Faction = {
  id: "faction-obojima-tellu-scale",
  name: "Tellu & Scale's School of Blades",
  description:
    "Nomadic sword school that migrates along the western coast, never stopping. Led by the ancient nakudama Master Tellu. Carries oral histories of pre-First Age Obojima that no written record preserves. Seeks to settle at the lost nakudama capital of Lilywin.",
  archetype: "military",
  factionType: "militia",
  purpose: "Reach the Lilywin ruins, discover the school's founding story, settle if claim holds",
  scale: "local",
  displayType: "Nomadic sword school",
  traits: ["Philosophical", "Restless"],
  region: "Western coast (Gift of Shuritashi)",
  headquartersId: "settlement-tellu-scale",
  advantages: [
    { type: "artifact", name: "First Age Stopwatch", description: "Master Tellu's heirloom stopwatch with mysterious undecoded functions" },
    { type: "knowledge", name: "Oral History", description: "Oral history of pre-First Age Obojima that no written record preserves" },
    { type: "specialization", name: "The Tempered Mind", description: "Unmatched philosophical sword training" },
    { type: "influence", name: "Nomadic Philosophy", description: "Nomadic philosophy that attracts devoted students" },
  ] satisfies FactionAdvantage[],
  agenda: agenda([
    { description: "Negotiate safe passage through Fish Head Coven territory in the Gale Fields", targetType: "faction", targetId: "faction-obojima-fish-head-coven" },
    { description: "Reach the Lilywin ruins — Tellu believes the lost nakudama capital holds the school's founding story", targetType: "location" },
    { description: "Decode the stopwatch's hidden functions (may require AHA or Council of Kroo's computer)" },
    { description: "Discover whether the school has a legitimate claim to Lilywin" },
    { description: "Settle at Lilywin if the claim holds — becoming the first sword school with ancient roots" },
  ]),
  obstacle: {
    type: "rival_faction",
    description:
      "Fish Head Coven controls the Gale Fields and won't grant passage without something in return. Tellu's nakudama heritage may give the school a legitimate claim to Lilywin that threatens Coven territorial dominance. The Coven would rather the ruins stay forgotten.",
    targetId: "faction-obojima-fish-head-coven",
  },
  want: "Passage through Gale Fields (Fish Head controls). Lilywin ruins access. Someone to decode the stopwatch (AHA or Council of Kroo). Their oral histories could be priceless to AHA.",
  tension:
    "Fish Head sees them as a territorial threat. AHA would trade anything for their oral histories. The stopwatch may be connected to whatever the Council of Kroo is computing. Canden & Moon sees a nomadic school settling down as validating a rival.",
  goals: [],
  methods: [],
  resources: [],
  relationships: [
    { factionId: "faction-obojima-fish-head-coven", type: "rival", reason: "Lilywin ruins access — territorial threat" },
    { factionId: "faction-obojima-aha", type: "neutral", reason: "Could trade oral histories for stopwatch decoding" },
    { factionId: "faction-obojima-lom-salt", type: "friendly", reason: "Trained here — both masters carry Lom & Salt blades" },
    { factionId: "faction-obojima-canden-moon", type: "rival", reason: "Settling at Lilywin would validate a rival" },
  ],
  territoryIds: [],
  influenceIds: [],
  leaderArchetype: "swordmaster",
  memberArchetype: "swordmaster",
  symbols: [],
  rumors: [],
  recruitmentHookIds: [],
  goalRumorIds: [],
  status: "active",
};

// ============================================================
// 16. The Crowsworn
// ============================================================

const crowsworn: Faction = {
  id: "faction-obojima-crowsworn",
  name: "The Crowsworn",
  description:
    "Witch coven in the Brackwater Wetlands, on the front lines of the Corruption. Led by Crow Mother Vex. Brewing experimental Corruption-resistance potions with a ~40% success rate. If they fall, the east's magical defense collapses.",
  archetype: "arcane",
  factionType: "cult",
  purpose: "Brew a reliable Corruption-resistance potion, deploy a mass countermeasure before the Corruption crosses the wetlands boundary",
  scale: "local",
  displayType: "Witch coven",
  traits: ["Desperate", "Resourceful"],
  region: "Brackwater Wetlands",
  advantages: [
    { type: "magic", name: "Almanac Volume", description: "1 of 7 Almanac volumes (Brackwater Wetlands region)" },
    { type: "specialization", name: "Corruption Potions", description: "Experimental Corruption-resistance potions (partially working, ~40% success rate)" },
    { type: "knowledge", name: "Crow Intelligence", description: "Network of crow familiars providing intelligence across eastern Obojima" },
    { type: "apparatus", name: "Propane Cauldrons", description: "First Age propane burners repurposed for rapid cauldron work" },
    { type: "alliance", name: "Ranger Alliance", description: "Closest magical ally to Rangers of the Greenward Path" },
  ] satisfies FactionAdvantage[],
  agenda: agenda([
    { description: "Obtain Mariners' Guild underwater Corruption samples (different strain than land)", targetType: "faction", targetId: "faction-obojima-mariners-guild" },
    { description: "Compare land and sea Corruption to identify a common vulnerability" },
    { description: "Brew a reliable Corruption-resistance potion" },
    { description: "Acquire Fish Head's Shallows Almanac volume for underwater ingredient knowledge", targetType: "faction", targetId: "faction-obojima-fish-head-coven" },
    { description: "Deploy a mass countermeasure before the Corruption crosses the wetlands boundary" },
  ]),
  obstacle: {
    type: "rival_faction",
    description:
      "Fish Head Coven has the Shallows Almanac volume describing underwater ingredients critical to the cure. They'll only trade for the Crowsworn's own Brackwater volume — giving it up means losing their regional foraging advantage at the worst possible time.",
    targetId: "faction-obojima-fish-head-coven",
  },
  want: "Mariners' Guild underwater Corruption samples. Fish Head's Shallows Almanac volume. Rangers' field data. Clean ingredients from uncorrupted land.",
  tension:
    "If they fall, the east's magical defense collapses. Brewer Thistle may already be partially corrupted. Fish Head's demand for a volume trade feels like extortion while the world burns. The Rangers trust them completely.",
  goals: [],
  methods: [],
  resources: [],
  relationships: [
    { factionId: "faction-obojima-rangers", type: "allied", reason: "Closest magical ally" },
    { factionId: "faction-obojima-mariners-guild", type: "friendly", reason: "Corruption cure research — need underwater samples" },
    { factionId: "faction-obojima-fish-head-coven", type: "rival", reason: "Almanac volume rivalry — extortionate trade demands" },
  ],
  territoryIds: [],
  influenceIds: [],
  leaderArchetype: "witch",
  memberArchetype: "witch",
  symbols: [],
  rumors: [],
  recruitmentHookIds: [],
  goalRumorIds: [],
  status: "active",
};

// ============================================================
// 17. The Deep Current
// ============================================================

const deepCurrent: Faction = {
  id: "faction-obojima-deep-current",
  name: "The Deep Current",
  description:
    "Shadow faction with cells embedded across other factions. No one knows the society exists. Seeks to locate and breach the Prison of Oghmai inside Mount Arbora, believing the demon emperor's power is key to nakudama restoration.",
  archetype: "secret",
  factionType: "cult",
  purpose: "Locate the Prison of Oghmai, break the seal, harness or free the demon emperor to restore nakudama greatness",
  scale: "regional",
  displayType: "Secret society (shadow faction)",
  traits: ["Patient", "Fanatical"],
  region: "Island-wide (hidden)",
  advantages: [
    { type: "subterfuge", name: "Embedded Agents", description: "Members hidden inside AHA and possibly other factions — no one knows the society exists" },
    { type: "knowledge", name: "Oghmai Texts", description: "Ancient nakudama texts describing Oghmai's imprisonment, the seal's construction, and the prison's general location" },
    { type: "territory", name: "Krocius's Access", description: "Krocius has direct access to AHA's dig and subway tunnel mapping" },
    { type: "influence", name: "True Belief", description: "Conviction that Oghmai's power is the key to nakudama restoration — willing to risk everything" },
  ] satisfies FactionAdvantage[],
  agenda: agenda([
    { description: "Use Krocius's position in AHA to map the subway tunnels beneath Yatamon", targetType: "faction", targetId: "faction-obojima-aha" },
    { description: "Locate the Wandering Line depot at the Prison of Oghmai inside Mount Arbora" },
    { description: "Recover or reconstruct the seal-breaking ritual from scattered nakudama texts" },
    { description: "Gain access to the Prison and harness Oghmai's power — or free him outright" },
    { description: "Restore nakudama to their former greatness using the demon emperor's might" },
  ]),
  obstacle: {
    type: "geographic",
    description:
      "The Prison is inside Mount Arbora but Cloud Cap Coven guards the sacred sites. The Wandering Line is unpredictable. Subway tunnels mostly collapsed. The seal was created by Shalwin's most powerful mages — breaking it may require knowledge or artifacts that no longer exist.",
  },
  want: "AHA's subway tunnel maps (Krocius is working on it). Wandering Line access. Cloud Cap's mountain spirit pathway maps. Council of Kroo's floppy disks. Ermina Flopfoot's Oghmai research.",
  tension:
    "If AHA discovers Krocius's true purpose, the operation collapses. Cloud Cap would declare war on anyone digging into the mountain. Council of Kroo may be sitting on something related. Lom & Salt's forge expansion could accidentally breach something. The biggest question: is the Corruption connected to Oghmai's imprisonment?",
  goals: [],
  methods: [],
  resources: [],
  relationships: [
    { factionId: "faction-obojima-aha", type: "neutral", reason: "Krocius secretly steering digs toward Oghmai's prison" },
    { factionId: "faction-obojima-cloud-cap-coven", type: "neutral", reason: "Mountain access conflict — Cloud Cap unknowingly guards the prison" },
    { factionId: "faction-obojima-council-of-kroo", type: "neutral", reason: "Floppy disk calculations may relate to the seal" },
  ],
  territoryIds: [],
  influenceIds: [],
  leaderArchetype: "scholar",
  memberArchetype: "shaman",
  symbols: [],
  rumors: [],
  recruitmentHookIds: [],
  goalRumorIds: [],
  status: "active",
};

// ============================================================
// Export
// ============================================================

export const OBOJIMA_FACTIONS: Faction[] = [
  marinersGuild,
  lionfishKing,
  aha,
  fishHeadCoven,
  courierBrigade,
  cloudCapCoven,
  rangers,
  lomSalt,
  candenMoon,
  torafBoulder,
  dawnBlossom,
  flyingPhin,
  goroGoros,
  councilOfKroo,
  telluScale,
  crowsworn,
  deepCurrent,
];
