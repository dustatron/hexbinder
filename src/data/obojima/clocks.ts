/**
 * Obojima faction progress clocks.
 * Source: obojima/reference/FACTIONS.md
 *
 * One clock per faction tracking their primary agenda/threat.
 * All start at 0 filled — GM advances them during play.
 */

import type { Clock } from "~/models";

export const OBOJIMA_CLOCKS: Clock[] = [
  // === Mariners' Guild ===
  {
    id: "clock-mariners-pointue",
    name: "Repair the Pointue",
    description:
      "The Mariners' Guild works to repair their submarine. Requires Holly + southern lodge access + AHA schematics + Aquatic Stabilizer recovery.",
    segments: 6,
    filled: 0,
    ownerId: "faction-obojima-mariners-guild",
    ownerType: "faction",
    trigger: { type: "event", events: ["Holly reaches southern lodge", "AHA shares schematics", "Stabilizer recovered"] },
    consequences: [
      { description: "Pointue launches deep-water expedition to find Corruption source", type: "event" },
    ],
    visible: true,
    paused: false,
  },

  // === Lionfish King ===
  {
    id: "clock-lionfish-legitimacy",
    name: "The Lionfish King's Coronation",
    description:
      "The Lionfish King seeks to decipher the Royal Lineages, find a nakudama royal heir, and arrange a marriage to legitimize his rule.",
    segments: 6,
    filled: 0,
    ownerId: "faction-obojima-lionfish-king",
    ownerType: "faction",
    trigger: { type: "event", events: ["Royal Lineages deciphered", "Heir located", "Marriage arranged"] },
    consequences: [
      { description: "Lionfish King gains legitimate royal status — fish folk unite under him", type: "state_change" },
    ],
    visible: false,
    paused: false,
  },

  // === AHA ===
  {
    id: "clock-aha-basement-breach",
    name: "Viperfish Breach AHA HQ",
    description:
      "Corrupted viperfish folk in AHA's flooded basement levels are searching for a way into the upper floors. AHA doesn't know they're there.",
    segments: 4,
    filled: 0,
    ownerId: "faction-obojima-aha",
    ownerType: "faction",
    trigger: { type: "time", daysPerTick: 7 },
    consequences: [
      { description: "Viperfish breach AHA labs — Corruption specimens and infected rangers exposed", type: "event" },
    ],
    visible: false,
    paused: false,
  },

  // === Fish Head Coven ===
  {
    id: "clock-fishhead-almanac",
    name: "Almanac Monopoly",
    description:
      "Fish Head Coven works to acquire remaining 5 Almanac volumes from rival covens through trade, trickery, or intimidation.",
    segments: 8,
    filled: 0,
    ownerId: "faction-obojima-fish-head-coven",
    ownerType: "faction",
    trigger: { type: "event", events: ["Volume acquired"] },
    consequences: [
      { description: "Fish Head Coven achieves total magical ingredient monopoly on Obojima", type: "state_change" },
    ],
    visible: true,
    paused: false,
  },

  {
    id: "clock-sorolu-decay",
    name: "Sorolu's Decline",
    description:
      "Elder spirit Sorolu is suffering from an unknown malady. If it dies or turns demon, Fish Head domain loses its spiritual anchor and hedgerow wards may fail.",
    segments: 4,
    filled: 0,
    ownerId: "faction-obojima-fish-head-coven",
    ownerType: "faction",
    trigger: { type: "time", daysPerTick: 10 },
    consequences: [
      { description: "Sorolu turns demon — Fish Head hedgerow wards collapse, domain exposed", type: "event" },
    ],
    visible: false,
    paused: false,
  },

  // === Courier Brigade ===
  {
    id: "clock-brigade-eastern-routes",
    name: "Restore Eastern Delivery",
    description:
      "Courier Brigade maps safe routes through corrupted territory to restore service to Polewater and eastern settlements.",
    segments: 6,
    filled: 0,
    ownerId: "faction-obojima-courier-brigade",
    ownerType: "faction",
    trigger: { type: "event", events: ["Ranger intel acquired", "Relay station built", "Safe route mapped"] },
    consequences: [
      { description: "Full postal service restored to eastern Obojima", type: "state_change" },
    ],
    visible: true,
    paused: false,
  },

  // === Cloud Cap Coven ===
  {
    id: "clock-phent-demon",
    name: "Phent's Demon Scheme",
    description:
      "Village elder Phent in the Graysteps keeps a Corruption-tainted spirit captive, prodding it toward madness. Plans to release the resulting demon in Toggle.",
    segments: 4,
    filled: 0,
    ownerId: "faction-obojima-cloud-cap-coven",
    ownerType: "faction",
    trigger: { type: "time", daysPerTick: 5 },
    consequences: [
      { description: "Demon released in Toggle — panic, spirit backlash, Nuharo's cover at risk", type: "event" },
    ],
    visible: false,
    paused: false,
  },

  // === Rangers ===
  {
    id: "clock-corruption-spread",
    name: "Corruption Advances West",
    description:
      "The Corruption boundary creeps westward through the Brackwater Wetlands toward populated areas. Rangers fight to hold the line.",
    segments: 8,
    filled: 1,
    ownerId: "faction-obojima-rangers",
    ownerType: "faction",
    trigger: { type: "time", daysPerTick: 5 },
    consequences: [
      { description: "Corruption crosses wetlands boundary into Gale Fields — island-wide crisis", type: "event" },
    ],
    visible: true,
    paused: false,
  },

  {
    id: "clock-tetsuri-kidnap",
    name: "Tetsuri's Betrayal",
    description:
      "Corrupted Ranger Tetsuri hides in Toggle under a false identity, waiting for Holly Clintock to arrive so he can kidnap her for Venomous Rex.",
    segments: 4,
    filled: 0,
    ownerId: "faction-obojima-rangers",
    ownerType: "faction",
    trigger: { type: "event", events: ["Holly travels to Toggle", "Tetsuri gains trust"] },
    consequences: [
      { description: "Holly kidnapped — Pointue repair impossible, Corruption research stalls", type: "event" },
    ],
    visible: false,
    paused: true,
  },

  // === Lom & Salt ===
  {
    id: "clock-lom-legendary-blade",
    name: "Forge the Legendary Blade",
    description:
      "Lom & Salt work to combine First Age alloys with traditional techniques to forge a legendary blade for a grand tournament.",
    segments: 6,
    filled: 0,
    ownerId: "faction-obojima-lom-salt",
    ownerType: "faction",
    trigger: { type: "event", events: ["Metallurgy manuals obtained", "Spirit Coal acquired", "Glyph-folding learned"] },
    consequences: [
      { description: "Legendary blade presented at tournament — Lom & Salt re-established as supreme", type: "event" },
    ],
    visible: true,
    paused: false,
  },

  // === Canden & Moon ===
  {
    id: "clock-subway-danger",
    name: "Subway Tunnel Collapse",
    description:
      "Students escorting AHA researchers into Yatamon's subway tunnels face increasingly dangerous conditions as the dig pushes deeper.",
    segments: 4,
    filled: 0,
    ownerId: "faction-obojima-canden-moon",
    ownerType: "faction",
    trigger: { type: "time", daysPerTick: 7 },
    consequences: [
      { description: "Student killed in tunnels — Canden & Moon cuts off AHA escort, dig crippled", type: "event" },
    ],
    visible: false,
    paused: false,
  },

  // === Toraf & Boulder ===
  {
    id: "clock-polewater-expedition",
    name: "Missing Polewater Expedition",
    description:
      "A student expedition sent to help rebuild Polewater hasn't reported back. The Corruption-warped creatures in the Wetlands grow more dangerous.",
    segments: 4,
    filled: 1,
    ownerId: "faction-obojima-toraf-boulder",
    ownerType: "faction",
    trigger: { type: "time", daysPerTick: 3 },
    consequences: [
      { description: "Expedition confirmed lost — Toraf & Boulder morale shattered, Boulder leaves to search alone", type: "event" },
    ],
    visible: true,
    paused: false,
  },

  // === Dawn Blossom ===
  {
    id: "clock-counterfeiting",
    name: "Counterfeiting Crisis",
    description:
      "Someone is counterfeiting Gold Flowers. Dawn Blossom seeks to find and stop the counterfeiter before currency confidence collapses.",
    segments: 4,
    filled: 0,
    ownerId: "faction-obojima-dawn-blossom",
    ownerType: "faction",
    trigger: { type: "time", daysPerTick: 10 },
    consequences: [
      { description: "Counterfeit coins flood market — economic panic, trade routes disrupted", type: "event" },
    ],
    visible: false,
    paused: false,
  },

  // === Flying Phin ===
  {
    id: "clock-phin-menace",
    name: "The Menace Takes Flight",
    description:
      "Phin works to restore the Menace aircraft — but Plitsu sabotages every attempt, the harpies guard the plans, and slime lurks beneath the runway.",
    segments: 6,
    filled: 0,
    ownerId: "faction-obojima-flying-phin",
    ownerType: "faction",
    trigger: { type: "event", events: ["Tools recovered from Plitsu", "Plans retrieved from tower", "Spirits recruited"] },
    consequences: [
      { description: "The Menace achieves sustained flight — awakens Rumble Hill (giant cat)", type: "event" },
    ],
    visible: true,
    paused: false,
  },

  // === Goro Goros ===
  {
    id: "clock-mikiko-exposed",
    name: "Mikiko's Secret",
    description:
      "Mikiko secretly uses Fish Head Coven potion knowledge to make magic ink for the Goro Goros. Discovery by the Coven would be catastrophic.",
    segments: 4,
    filled: 0,
    ownerId: "faction-obojima-goro-goros",
    ownerType: "faction",
    trigger: { type: "event", events: ["Coven spy reports suspicious activity", "Ink analyzed by a witch"] },
    consequences: [
      { description: "Fish Head Coven demands Mikiko's return — Goro Goros lose magic ink, gang powerless", type: "event" },
    ],
    visible: false,
    paused: false,
  },

  // === Council of Kroo ===
  {
    id: "clock-cosmic-calculations",
    name: "The Cosmic Calculations",
    description:
      "Council of Kroo runs computations on their First Age computer to determine what's buried beneath the Crawling Canopy.",
    segments: 8,
    filled: 2,
    ownerId: "faction-obojima-council-of-kroo",
    ownerType: "faction",
    trigger: { type: "event", events: ["New floppy disk found", "Calculation completes"] },
    consequences: [
      { description: "Truth revealed — superweapon or ancient machine beneath the Canopy", type: "event" },
    ],
    visible: true,
    paused: false,
  },

  // === Tellu & Scale ===
  {
    id: "clock-lilywin-pilgrimage",
    name: "Pilgrimage to Lilywin",
    description:
      "Tellu & Scale negotiate passage through Fish Head territory to reach the lost nakudama capital of Lilywin.",
    segments: 6,
    filled: 0,
    ownerId: "faction-obojima-tellu-scale",
    ownerType: "faction",
    trigger: { type: "event", events: ["Fish Head passage negotiated", "Lilywin located", "Claim validated"] },
    consequences: [
      { description: "Tellu & Scale settles at Lilywin — first sword school with ancient roots", type: "state_change" },
    ],
    visible: true,
    paused: false,
  },

  // === Crowsworn ===
  {
    id: "clock-corruption-cure",
    name: "Corruption Cure Research",
    description:
      "Crowsworn brew experimental Corruption-resistance potions. Current success rate ~40%. Need underwater samples and Fish Head's Shallows Almanac.",
    segments: 6,
    filled: 1,
    ownerId: "faction-obojima-crowsworn",
    ownerType: "faction",
    trigger: { type: "event", events: ["Underwater samples obtained", "Almanac volume acquired", "Breakthrough achieved"] },
    consequences: [
      { description: "Reliable Corruption-resistance potion — eastern front stabilized", type: "state_change" },
    ],
    visible: true,
    paused: false,
  },

  // === Deep Current ===
  {
    id: "clock-oghmai-prison",
    name: "Unsealing Oghmai's Prison",
    description:
      "The Deep Current works through Krocius inside AHA to map subway tunnels toward Mount Arbora and the Prison of Oghmai.",
    segments: 8,
    filled: 1,
    ownerId: "faction-obojima-deep-current",
    ownerType: "faction",
    trigger: { type: "event", events: ["Tunnel route mapped", "Seal ritual recovered", "Mountain access gained"] },
    consequences: [
      { description: "Oghmai freed or his power harnessed — island-shaking catastrophe or salvation", type: "event" },
    ],
    visible: false,
    paused: false,
  },

  // === Bloodfin / Slurpgill ===
  {
    id: "clock-slurpgill-coven",
    name: "Slurpgill's Hag Coven",
    description:
      "Sea hag Slurpgill grooms Bloodfin to become a hag and start a coven. If successful, a new underwater threat emerges allied with Venomous Rex.",
    segments: 4,
    filled: 0,
    ownerId: "faction-obojima-lionfish-king",
    ownerType: "faction",
    trigger: { type: "time", daysPerTick: 7 },
    consequences: [
      { description: "Bloodfin transforms into a hag — new coven allied with Venomous Rex threatens northern waters", type: "event" },
    ],
    visible: false,
    paused: false,
  },

  // === Paloma's Corruption ===
  {
    id: "clock-paloma-corruption",
    name: "Paloma's Secret Infection",
    description:
      "Paloma Clintock was infected with Corruption from a fish folk dart. She hasn't told anyone and continues launching reckless solo raids.",
    segments: 4,
    filled: 1,
    ownerId: "faction-obojima-mariners-guild",
    ownerType: "faction",
    trigger: { type: "time", daysPerTick: 5 },
    consequences: [
      { description: "Paloma succumbs to Corruption — devastating blow to Mariners' Guild and Captain Clintock", type: "event" },
    ],
    visible: false,
    paused: false,
  },
];
