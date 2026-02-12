import { writeFileSync } from 'fs';

// Hex layout based on the actual Obojima map
// Pointy-top axial coords: screen_x = sqrt(3)*(q + r/2), screen_y = 1.5*r
// Island is portrait-oriented, so q shifts left as r increases to stay centered

const hexes = [
  // r=-6: Far North offshore
  { q: 2, r: -6, terrain: "water", desc: "Northern Deep — open ocean north of the island." },
  { q: 3, r: -6, terrain: "water", desc: "Sunken Town & Underwater Depot — submerged ruins visible through clear water.", loc: "dungeon-sunken-town" },

  // r=-5: North coast
  { q: 1, r: -5, terrain: "water", desc: "NW Shallows — coral reefs and shallow waters." },
  { q: 2, r: -5, terrain: "hills", desc: "Northern coastal settlement. A small port at the island's northern tip.", loc: "settlement-durrin" },
  { q: 3, r: -5, terrain: "water", desc: "NE Shallows — rocky coastline with tide pools." },

  // r=-4: Upper North
  { q: 0, r: -4, terrain: "hills", desc: "NW coast — Coastal Divers' Lodge North, Water Clock, and Pixie Boat anchorage.", loc: "settlement-cdl-north" },
  { q: 1, r: -4, terrain: "forest", desc: "Sweeping valley with enormous kites riding thermal winds.", loc: "settlement-sky-kite" },
  { q: 2, r: -4, terrain: "mountains", desc: "Upper slopes of Mount Arbora. Jumaga's Roost and the Ledge of Offering.", loc: "settlement-jumaga-roost" },
  { q: 3, r: -4, terrain: "hills", desc: "Chisuay's Teahouse — elegant teahouse run by a dashing oni sorcerer.", loc: "settlement-chisuay" },
  { q: 4, r: -4, terrain: "water", desc: "NE coast — rocky cliffs above churning waters." },

  // r=-3: North interior
  { q: -1, r: -3, terrain: "water", desc: "NW coast — Island of Hmug visible offshore." },
  { q: 0, r: -3, terrain: "forest", desc: "Kuroki Village — forest settlement near the mountain.", loc: "settlement-kuroki" },
  { q: 1, r: -3, terrain: "hills", desc: "Lom & Salt's College of Arms — training grounds on the hillside." },
  { q: 2, r: -3, terrain: "hills", desc: "Hogstone Hot Springs — healing hamlet around natural hot springs.", loc: "settlement-hogstone" },
  { q: 3, r: -3, terrain: "mountains", desc: "Toggle — smithing hamlet on Mount Arbora's eastern slope. Opu Opu Spring nearby.", loc: "settlement-toggle" },
  { q: 4, r: -3, terrain: "hills", desc: "Toraf & Boulder's School of Guts & Grit — martial training academy.", loc: "settlement-toraf-boulder" },
  { q: 5, r: -3, terrain: "hills", desc: "Coastal Divers' Lodge East — NE coast outpost of the Mariners' Guild.", loc: "settlement-cdl-east" },

  // r=-2: North-Center
  { q: -3, r: -2, terrain: "water", desc: "Western coast — forested cliffs above the ocean." },
  { q: -2, r: -2, terrain: "forest", desc: "Uluwa / Ferry Crossing — the Spirit Market, a twilight bazaar.", loc: "settlement-uluwa" },
  { q: -1, r: -2, terrain: "forest", desc: "Matango Village — mushroom-obsessed village. Five fungal factions.", loc: "settlement-matango" },
  { q: 0, r: -2, terrain: "forest", desc: "Dense forest wilderness between Matango and the Graysteps." },
  { q: 1, r: -2, terrain: "mountains", desc: "The Graysteps — grey stone village on Mount Arbora's western slope.", loc: "settlement-graysteps" },
  { q: 2, r: -2, terrain: "forest", desc: "Forested foothills — transition zone between mountains and wetlands." },
  { q: 3, r: -2, terrain: "swamp", desc: "Goodie Mart — provisions outpost at the edge of Brackwater Wetlands.", loc: "settlement-goodie-mart" },
  { q: 4, r: -2, terrain: "forest", desc: "Gobo Village — settlement in the eastern forests.", loc: "settlement-gobo" },
  { q: 5, r: -2, terrain: "water", desc: "Eastern coast — mangrove-lined shore." },

  // r=-1: Center-North
  { q: -3, r: -1, terrain: "water", desc: "Western deep — Island of Hmug and open ocean." },
  { q: -2, r: -1, terrain: "forest", desc: "Sheep Dragon Grazing Grounds — pastoral meadows in the western forest." },
  { q: -1, r: -1, terrain: "hills", desc: "Wooded hills — wilderness between western settlements." },
  { q: 0, r: -1, terrain: "plains", desc: "The Way Gate & Amak Shurak — ancient waypoint at the island's crossroads." },
  { q: 1, r: -1, terrain: "hills", desc: "Rolling foothills — wilderness between mountains and wetlands." },
  { q: 2, r: -1, terrain: "swamp", desc: "Roa Kala — sacred grove of the Kohdoi dara.", loc: "settlement-roa-kala" },
  { q: 3, r: -1, terrain: "swamp", desc: "Hakumon's Ramen Shop — legendary ramen in the wetlands.", loc: "settlement-hakumon" },
  { q: 4, r: -1, terrain: "swamp", desc: "Ten Wheels Grove — ancient grove in Brackwater Wetlands." },
  { q: 5, r: -1, terrain: "swamp", desc: "Polewater Village & The Sally Sue — stilts village, closest to Corruption.", loc: "settlement-polewater" },

  // r=0: Center (widest)
  { q: -4, r: 0, terrain: "water", desc: "The Coral Castle — Lionfish King's underwater fortress.", loc: "dungeon-coral-castle" },
  { q: -3, r: 0, terrain: "hills", desc: "Coastal Divers' Lodge West — western coast outpost.", loc: "settlement-cdl-west" },
  { q: -2, r: 0, terrain: "hills", desc: "Okiri Village — quiet farming hamlet with shepherds and slingers.", loc: "settlement-okiri" },
  { q: -1, r: 0, terrain: "plains", desc: "Fort Harglo — Courier Brigade fortress at the crossroads.", loc: "settlement-fort-harglo" },
  { q: 0, r: 0, terrain: "plains", desc: "Witching Tower — Fish Head Coven compound with four Gatehouses.", loc: "settlement-witching-tower" },
  { q: 1, r: 0, terrain: "plains", desc: "North & East Gatehouse area — Witching Tower outer defenses." },
  { q: 2, r: 0, terrain: "hills", desc: "River Master's Tower — overlooks the eastern rivers." },
  { q: 3, r: 0, terrain: "forest", desc: "Shade Wood & Whispering Forest — dense, eerie woodland." },
  { q: 4, r: 0, terrain: "forest", desc: "Ekmu Village — settlement at the edge of the eastern forest.", loc: "settlement-ekmu" },
  { q: 5, r: 0, terrain: "water", desc: "Eastern coast — New Moon Lagoon and coastal waters." },

  // r=1: Center-South
  { q: -4, r: 1, terrain: "water", desc: "SW coast — rocky waters and fishing grounds." },
  { q: -3, r: 1, terrain: "hills", desc: "Crak Caves — cave system in the western hills.", loc: "dungeon-crak-caves" },
  { q: -2, r: 1, terrain: "hills", desc: "SW interior wilderness — scrubby hills and goat paths." },
  { q: -1, r: 1, terrain: "plains", desc: "South Gatehouse & West Gatehouse area — southern Witching Tower defenses." },
  { q: 0, r: 1, terrain: "hills", desc: "Opal Falls — cascading waterfalls from the highland plateau.", loc: "settlement-opal-falls" },
  { q: 1, r: 1, terrain: "hills", desc: "Broken Bird Airfield — First Age airfield ruins.", loc: "settlement-broken-bird" },
  { q: 2, r: 1, terrain: "hills", desc: "Crumbled Hut — mysterious ruins in the Coastal Highlands." },
  { q: 3, r: 1, terrain: "forest", desc: "SE forest wilderness — dense canopy and hidden trails." },
  { q: 4, r: 1, terrain: "water", desc: "SE coast — highland cliffs above the ocean." },

  // r=2: South
  { q: -4, r: 2, terrain: "water", desc: "SW coast — open waters south of Tidewater." },
  { q: -3, r: 2, terrain: "hills", desc: "Tidewater — sandy coastal village. Tower of Glass holds the Pearl of Rongol.", loc: "settlement-tidewater" },
  { q: -2, r: 2, terrain: "forest", desc: "Lake Ellior area — forested lowlands around a shimmering lake." },
  { q: -1, r: 2, terrain: "forest", desc: "Temple of Shoom — ancient nakudama ziggurat in dense jungle.", loc: "dungeon-temple-of-shoom" },
  { q: 0, r: 2, terrain: "plains", desc: "Southern fields — open grassland approaching the coast." },
  { q: 1, r: 2, terrain: "hills", desc: "AHA Headquarters — observatory and research campus.", loc: "settlement-aha-hq" },
  { q: 2, r: 2, terrain: "water", desc: "SE waters — Cloud Depot visible on the horizon." },

  // r=3: Far South
  { q: -3, r: 3, terrain: "water", desc: "SW coast — fishing waters south of Tidewater." },
  { q: -2, r: 3, terrain: "hills", desc: "Yatamon — largest city on Obojima. Spirit trolleys, undercity below.", loc: "settlement-yatamon" },
  { q: -1, r: 3, terrain: "hills", desc: "Coastal Divers' Lodge South — southern coast outpost.", loc: "settlement-cdl-south" },
  { q: 0, r: 3, terrain: "water", desc: "Southern coast — surf breaks against dark volcanic rock." },

  // r=4: Southern waters
  { q: -2, r: 4, terrain: "water", desc: "Southern Shallows — Lionfish King patrols these waters." },
  { q: -1, r: 4, terrain: "water", desc: "Southern Deep — the Venomous Rex's corrupted forces." },
];

// Build hex array
const hexArray = hexes.map(h => {
  const hex = { coord: { q: h.q, r: h.r }, terrain: h.terrain, description: h.desc };
  if (h.loc) hex.locationId = h.loc;
  return hex;
});

// Settlement helper
const s = (id, name, coord, desc, size, pop, tags = []) => ({
  id, name, type: "settlement", settlementType: "human", hexCoord: coord,
  description: desc, tags, size, population: pop,
  governmentType: "council", economyBase: ["trade"], mood: "welcoming",
  trouble: "TBD", quirk: "TBD", defenses: "none",
  sites: [], npcIds: [], rumors: [], notices: []
});

const locations = [
  s("settlement-durrin", "Durrin", {q:2,r:-5}, "Northern coastal settlement at the island's tip.", "thorpe", 30, ["coastal","north"]),
  s("settlement-cdl-north", "Coastal Divers' Lodge (North)", {q:0,r:-4}, "NW coast outpost. Water Clock and Pixie Boat nearby.", "thorpe", 20, ["coastal","mariners"]),
  s("settlement-sky-kite", "Sky Kite Valley", {q:1,r:-4}, "Second largest settlement. Enormous kites, barges, aeronauts.", "town", 1800, ["town","kites"]),
  s("settlement-jumaga-roost", "Jumaga's Roost", {q:2,r:-4}, "Climbing settlement near the elder sky salamander's lair.", "thorpe", 30, ["mountains","climbing"]),
  s("settlement-chisuay", "Chisuay's Teahouse", {q:3,r:-4}, "Elegant teahouse run by an oni sorcerer. Awakened fossa staff.", "thorpe", 25, ["teahouse","oni"]),
  s("settlement-kuroki", "Kuroki Village", {q:0,r:-3}, "Forest village near the mountain.", "village", 300, ["forest","village"]),
  s("settlement-hogstone", "Hogstone Hot Springs", {q:2,r:-3}, "Healing hamlet around natural hot springs.", "hamlet", 200, ["hot-springs","healing"]),
  s("settlement-toggle", "Toggle", {q:3,r:-3}, "Smithing hamlet. Dara masters forge unique alloys. Opu Opu Spring nearby.", "hamlet", 120, ["smithing","dara"]),
  s("settlement-toraf-boulder", "Toraf & Boulder's School of Guts & Grit", {q:4,r:-3}, "Martial training academy in the hills.", "thorpe", 40, ["training","martial"]),
  s("settlement-cdl-east", "Coastal Divers' Lodge (East)", {q:5,r:-3}, "NE coast outpost of the Mariners' Guild.", "thorpe", 15, ["coastal","mariners"]),
  s("settlement-uluwa", "Uluwa (Spirit Market)", {q:-2,r:-2}, "Twilight bazaar where spirits and mortals trade. Ferry Crossing.", "village", 500, ["market","spirits"]),
  s("settlement-matango", "Matango Village", {q:-1,r:-2}, "Mushroom village. Five fungal factions compete for Truffle Prince.", "village", 400, ["mushrooms","forest"]),
  s("settlement-graysteps", "The Graysteps", {q:1,r:-2}, "Grey stone village on Mount Arbora's western slope.", "hamlet", 100, ["mountains","watchers"]),
  s("settlement-goodie-mart", "Goodie Mart", {q:3,r:-2}, "Provisions outpost at the Brackwater edge. Subway station.", "thorpe", 30, ["provisions","swamp"]),
  s("settlement-gobo", "Gobo Village", {q:4,r:-2}, "Eastern forest settlement.", "village", 200, ["forest","east"]),
  s("settlement-roa-kala", "Roa Kala", {q:2,r:-1}, "Sacred grove of the Kohdoi dara.", "hamlet", 80, ["dara","sacred"]),
  s("settlement-hakumon", "Hakumon's Ramen Shop", {q:3,r:-1}, "Legendary ramen in the wetlands. Oni chef.", "thorpe", 30, ["ramen","oni"]),
  s("settlement-polewater", "Polewater Village", {q:5,r:-1}, "Stilts village in Brackwater. Closest to the Corruption. Sally Sue nearby.", "village", 350, ["wetlands","stilts"]),
  s("settlement-cdl-west", "Coastal Divers' Lodge (West)", {q:-3,r:0}, "Western coast outpost of the Mariners' Guild.", "thorpe", 20, ["coastal","mariners"]),
  s("settlement-okiri", "Okiri Village", {q:-2,r:0}, "Quiet farming hamlet. Shepherds, slingers, Miss Lindley fixes anything.", "hamlet", 150, ["farming","pastoral"]),
  s("settlement-fort-harglo", "Fort Harglo", {q:-1,r:0}, "Courier Brigade fortress at the crossroads.", "hamlet", 80, ["fort","courier-brigade"]),
  s("settlement-witching-tower", "Witching Tower (Fish Head Coven)", {q:0,r:0}, "Fish Head Coven compound. Council of Three and Thirty. Four Gatehouses.", "village", 300, ["witches","coven"]),
  s("settlement-ekmu", "Ekmu Village", {q:4,r:0}, "Settlement at the eastern forest edge.", "village", 150, ["forest","east"]),
  s("settlement-opal-falls", "Opal Falls", {q:0,r:1}, "Cascading waterfalls from the highland plateau.", "village", 250, ["waterfalls","highlands"]),
  s("settlement-broken-bird", "Broken Bird Airfield", {q:1,r:1}, "First Age airfield ruins. Spirit Plitsu guards.", "thorpe", 10, ["ruins","first-age"]),
  s("settlement-tidewater", "Tidewater", {q:-3,r:2}, "Sandy coastal village. Tower of Glass holds the Pearl of Rongol.", "village", 300, ["coastal","pearl"]),
  s("settlement-aha-hq", "AHA Headquarters", {q:1,r:2}, "Observatory and research campus. The Asloh triumvirate.", "hamlet", 60, ["observatory","scholars"]),
  s("settlement-yatamon", "Yatamon", {q:-2,r:3}, "Largest city on Obojima. Spirit trolleys, detective agencies, undercity.", "city", 5000, ["city","capital"]),
  s("settlement-cdl-south", "Coastal Divers' Lodge (South)", {q:-1,r:3}, "Southern coast outpost.", "thorpe", 20, ["coastal","mariners"]),

  // Dungeons
  {
    id: "dungeon-sunken-town", name: "Sunken Town & Underwater Depot", type: "dungeon",
    hexCoord: {q:3,r:-6}, description: "Submerged ruins north of the island.",
    tags: ["underwater","ruins"], size: "medium", theme: "temple", depth: 2, cleared: false,
    gridWidth: 40, gridHeight: 40, rooms: [], passages: [], entranceRoomId: ""
  },
  {
    id: "dungeon-coral-castle", name: "The Coral Castle", type: "dungeon",
    hexCoord: {q:-4,r:0}, description: "Lionfish King's underwater fortress.",
    tags: ["underwater","fortress"], size: "large", theme: "fortress", depth: 3, cleared: false,
    gridWidth: 60, gridHeight: 60, rooms: [], passages: [], entranceRoomId: ""
  },
  {
    id: "dungeon-crak-caves", name: "Crak Caves", type: "dungeon",
    hexCoord: {q:-3,r:1}, description: "Cave system in the western hills.",
    tags: ["caves","western"], size: "medium", theme: "cave", depth: 2, cleared: false,
    gridWidth: 40, gridHeight: 40, rooms: [], passages: [], entranceRoomId: ""
  },
  {
    id: "dungeon-temple-of-shoom", name: "Temple of Shoom", type: "dungeon",
    hexCoord: {q:-1,r:2}, description: "Ancient nakudama ziggurat. Midwives above, Voraro feeds below.",
    tags: ["large","temple","nakudama"], size: "large", theme: "temple", depth: 3, cleared: false,
    gridWidth: 60, gridHeight: 60, rooms: [], passages: [], entranceRoomId: ""
  },
];

// Edges: roads, trails (Wandering Line), rivers
const edges = [
  // Roads: Yatamon hub
  { from: {q:-2,r:3}, to: {q:-1,r:2}, type: "road" },  // Yatamon → Shoom area
  { from: {q:-2,r:3}, to: {q:-3,r:2}, type: "road" },  // Yatamon → Tidewater
  { from: {q:-2,r:3}, to: {q:-1,r:3}, type: "road" },  // Yatamon → CDL South
  // Roads: central spine
  { from: {q:-2,r:0}, to: {q:-1,r:0}, type: "road" },  // Okiri → Fort Harglo
  { from: {q:-1,r:0}, to: {q:0,r:0}, type: "road" },   // Fort Harglo → Witching Tower
  { from: {q:-2,r:0}, to: {q:-1,r:-2}, type: "road" },  // Okiri → Matango
  // Roads: eastern
  { from: {q:5,r:-1}, to: {q:4,r:0}, type: "road" },   // Polewater → Ekmu
  { from: {q:0,r:1}, to: {q:1,r:2}, type: "road" },    // Opal Falls → AHA HQ

  // Wandering Line (spirit train trail): Yatamon → Sky Kite
  { from: {q:-2,r:3}, to: {q:-1,r:2}, type: "trail" },  // Yatamon → Shoom
  { from: {q:-1,r:2}, to: {q:-1,r:1}, type: "trail" },  // → South Gate area
  { from: {q:-1,r:1}, to: {q:0,r:0}, type: "trail" },   // → Witching Tower
  { from: {q:0,r:0}, to: {q:0,r:-1}, type: "trail" },   // → Way Gate
  { from: {q:0,r:-1}, to: {q:1,r:-2}, type: "trail" },  // → Graysteps
  { from: {q:1,r:-2}, to: {q:2,r:-3}, type: "trail" },  // → Hogstone
  { from: {q:2,r:-3}, to: {q:1,r:-4}, type: "trail" },  // → Sky Kite

  // Rivers from Mount Arbora
  { from: {q:2,r:-4}, to: {q:1,r:-2}, type: "river" },  // Mountain → Graysteps
  { from: {q:1,r:-2}, to: {q:0,r:-2}, type: "river" },  // → western forest
  { from: {q:0,r:-2}, to: {q:-1,r:-2}, type: "river" }, // → Matango
  { from: {q:2,r:-4}, to: {q:3,r:-3}, type: "river" },  // Mountain → Toggle (east)
  { from: {q:3,r:-3}, to: {q:3,r:-2}, type: "river" },  // → Goodie Mart
  { from: {q:3,r:-2}, to: {q:3,r:-1}, type: "river" },  // → Hakumon's
  { from: {q:3,r:-1}, to: {q:5,r:-1}, type: "river" },  // → Polewater
];

const world = {
  id: "world-obojima-v2",
  name: "Obojima (Preview)",
  seed: "321536",
  ruleset: "shadowdark",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  state: {
    day: 1, season: "spring", year: 1,
    weather: { condition: "clear", temperature: "warm", tempLow: 68, tempHigh: 82, wind: "breeze" },
    moonPhase: "waxing", calendar: [], forecastEndDay: 0, visitedHexIds: []
  },
  hexes: hexArray,
  edges,
  locations,
  dwellings: [],
  npcs: [],
  factions: [],
  significantItems: [],
  hooks: [],
  clocks: []
};

writeFileSync(
  new URL('./obojima_preview.hexbinder.json', import.meta.url),
  JSON.stringify(world, null, 2)
);

console.log(`Generated ${hexArray.length} hexes, ${locations.length} locations, ${edges.length} edges`);
console.log(`Land: ${hexArray.filter(h => h.terrain !== 'water').length}, Water: ${hexArray.filter(h => h.terrain === 'water').length}`);
