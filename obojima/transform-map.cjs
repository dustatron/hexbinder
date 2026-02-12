#!/usr/bin/env node
/**
 * Obojima Map Transformation Script
 *
 * 1. 2x scales all hex/location/edge coordinates
 * 2. Fills gap hexes between land hexes with blended terrain
 * 3. Applies regional terrain corrections per GEOGRAPHY.md
 * 4. Adds more mountain hexes around Mount Arbora
 * 5. Adds missing locations (Glittering Depot, Prison of Oghmai, Sally Sue)
 * 6. Regenerates water border (2 rings)
 * 7. Fixes known issues (Durrin→Dorrin rename, terrain corrections)
 */

const fs = require('fs');
const path = require('path');

const INPUT = path.join(__dirname, 'obojima_preview.hexbinder.json');
const OUTPUT = path.join(__dirname, 'obojima_preview.hexbinder.json');

const data = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));

// ─── Helpers ──────────────────────────────────────────────────────────

const key = (q, r) => `${q},${r}`;
const parse = (k) => { const [q, r] = k.split(',').map(Number); return { q, r }; };

// Pointy-top hex neighbor directions (matching hexbinder's hex-utils.ts)
const HEX_DIRS = [
  { q: 1, r: 0 },   // East
  { q: 1, r: -1 },  // Northeast
  { q: 0, r: -1 },  // Northwest
  { q: -1, r: 0 },  // West
  { q: -1, r: 1 },  // Southwest
  { q: 0, r: 1 },   // Southeast
];

function neighbors(q, r) {
  return HEX_DIRS.map(d => ({ q: q + d.q, r: r + d.r }));
}

// Axial hex distance
function hexDistance(a, b) {
  const dq = a.q - b.q;
  const dr = a.r - b.r;
  return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));
}

// Convert axial to approximate cartesian for region detection
function toXY(q, r) {
  const x = q + r * 0.5;
  const y = r * (Math.sqrt(3) / 2);
  return { x, y };
}

// ─── Step 1: Identify land vs water hexes ─────────────────────────────

// Find hexes that have locations on them (some water hexes have locations)
const hexesWithLocations = new Set();
data.hexes.forEach(h => {
  if (h.locationId) hexesWithLocations.add(key(h.coord.q, h.coord.r));
});

// Water hexes that have locations need special treatment
const waterLocationHexes = data.hexes.filter(
  h => h.terrain === 'water' && h.locationId
);
const landHexes = data.hexes.filter(h => h.terrain !== 'water');

console.log(`Input: ${data.hexes.length} hexes (${landHexes.length} land, ${data.hexes.length - landHexes.length} water)`);
console.log(`Water hexes with locations: ${waterLocationHexes.map(h => h.locationId).join(', ')}`);
console.log(`Locations: ${data.locations.length}`);
console.log(`Edges: ${data.edges.length}`);

// ─── Step 2: Scale coordinates by 2x ─────────────────────────────────

function scale(coord) {
  return { q: coord.q * 2, r: coord.r * 2 };
}

// Scale land hexes
const scaledLand = landHexes.map(h => ({
  ...h,
  coord: scale(h.coord),
}));

// Scale water-location hexes (Sunken Town, Coral Castle, Temple of Shoom)
const scaledWaterLocs = waterLocationHexes.map(h => ({
  ...h,
  coord: scale(h.coord),
}));

// Build land hex lookup
const landMap = new Map();
scaledLand.forEach(h => landMap.set(key(h.coord.q, h.coord.r), h));

console.log(`\nAfter 2x scaling: ${landMap.size} land hexes`);

// ─── Step 3: Fill gap hexes between scaled land hexes ─────────────────

const TERRAIN_BLEND = {
  'hills+mountains': 'hills',
  'forest+mountains': 'hills',
  'mountains+plains': 'hills',
  'mountains+swamp': 'hills',
  'forest+hills': 'forest',
  'forest+plains': 'forest',
  'hills+plains': 'hills',
  'hills+swamp': 'swamp',
  'forest+swamp': 'swamp',
  'plains+swamp': 'swamp',
  'desert+hills': 'desert',
  'desert+mountains': 'hills',
  'desert+plains': 'desert',
  'desert+forest': 'hills',
  'desert+swamp': 'plains',
};

function blendTerrain(t1, t2) {
  if (t1 === t2) return t1;
  const pair = [t1, t2].sort().join('+');
  return TERRAIN_BLEND[pair] || t1;
}

// Description pools per terrain
const DESCRIPTIONS = {
  plains: [
    'Tall grass sways in the constant wind.',
    'Open grassland stretches to the horizon.',
    'Rolling meadow with scattered wildflowers.',
    'Windswept plain with well-worn game trails.',
    'Flat expanse of sun-bleached grass.',
  ],
  forest: [
    'Dense woodland with towering canopy.',
    'Old-growth forest — moss-covered trunks and ferns.',
    'Deep woods — dappled light on the forest floor.',
    'Thick forest — birdsong and rustling leaves.',
    'Ancient trees crowd together, branches interlocking overhead.',
  ],
  hills: [
    'Rolling hills with scattered boulders.',
    'Gentle hills — worn paths between ridgelines.',
    'Grassy hillside with good vantage points.',
    'Hilly terrain — wildflowers dot the slopes.',
    'Rocky hills rising and falling in gentle waves.',
  ],
  mountains: [
    'Steep volcanic slopes — thin air and loose scree.',
    'Craggy mountain terrain — treacherous footing.',
    'High mountain pass between jagged peaks.',
    'Rocky cliff faces and narrow ledges.',
    'Snow-dusted peaks pierce the clouds above.',
  ],
  swamp: [
    'Soggy wetland — standing water between tufts of marsh grass.',
    'Murky swamp — gnarled trees rise from brackish water.',
    'Boggy ground squelches underfoot.',
    'Mist-shrouded wetland with thick reeds.',
    'Stagnant pools reflect a grey sky.',
  ],
  water: [
    'Coastal waters — waves lap against the shore.',
    'Open water — the sea stretches to the horizon.',
    'Ocean waters — the tide pulls steadily.',
    'Deep water — dark currents below the surface.',
    'Coastal shallows — sand and coral visible below.',
  ],
  desert: [
    'Arid scrubland dotted with steaming vents.',
    'Mineral-rich earth in vivid reds and yellows.',
    'Dry, cracked ground with geothermal fissures.',
    'Sun-baked terrain with patches of hardy scrub.',
    'Barren slope near a bubbling hot spring.',
  ],
};

// Regional description overrides
const REGION_DESCRIPTIONS = {
  land_of_hot_water: [
    'Arid scrubland dotted with steaming vents.',
    'Mineral-rich earth in vivid reds and yellows. Hot air shimmers.',
    'Dry hillside with geothermal cracks. Sulfur scent lingers.',
    'Barren slope near a bubbling hot spring.',
    'Sun-baked terrain with patches of hardy scrub.',
  ],
  gale_fields: [
    'Vast grasslands — uncommonly tall grass sways in constant wind.',
    'Sweeping plain of tall grass. Courier Brigade road markers visible.',
    'Windswept grassland — the Gale Fields stretch endlessly.',
    'Open plain with grass tall enough to hide a standing person.',
    'Rolling grassland under a wide sky. Wind never stops.',
  ],
  brackwater_wetlands: [
    'Soggy wetland — mist clings to the ground.',
    'Brackish water pools between twisted mangroves.',
    'Muddy wetland — the air smells of decay and salt.',
    'Swampy lowland. Stilts would be wise here.',
    'Corrupted wetland — dark tendrils creep through the muck.',
  ],
  coastal_highlands: [
    'Elevated plateau — rocky terrain rises toward sea cliffs.',
    'Craggy highland with wind-carved rock formations.',
    'High ground overlooking the distant ocean.',
    'Hardy plateau scrub clings to the rocky soil.',
    'Cliff-edge terrain — the sea roars far below.',
  ],
};

let descIdx = 0;
function pickDescription(terrain, region) {
  const pool = REGION_DESCRIPTIONS[region] || DESCRIPTIONS[terrain] || DESCRIPTIONS.plains;
  descIdx = (descIdx + 1) % pool.length;
  return pool[descIdx];
}

// Find gaps: for each pair of land hexes that were originally adjacent (now 2 apart),
// add a midpoint hex
const gapHexes = new Map();

scaledLand.forEach(h => {
  for (const dir of HEX_DIRS) {
    const nq = h.coord.q + dir.q * 2;
    const nr = h.coord.r + dir.r * 2;
    const nk = key(nq, nr);

    if (landMap.has(nk)) {
      const midQ = h.coord.q + dir.q;
      const midR = h.coord.r + dir.r;
      const mk = key(midQ, midR);

      if (!landMap.has(mk) && !gapHexes.has(mk)) {
        const neighbor = landMap.get(nk);
        const terrain = blendTerrain(h.terrain, neighbor.terrain);
        gapHexes.set(mk, {
          coord: { q: midQ, r: midR },
          terrain,
          description: '', // Will be filled after region assignment
        });
      }
    }
  }
});

console.log(`Gap hexes filled: ${gapHexes.size}`);

// Merge gap hexes into land map
gapHexes.forEach((h, k) => landMap.set(k, h));

console.log(`Total land hexes after gap fill: ${landMap.size}`);

// ─── Step 4: Define regions and assign terrain corrections ────────────

// Compute island center from land hexes
let sumQ = 0, sumR = 0, count = 0;
landMap.forEach(h => { sumQ += h.coord.q; sumR += h.coord.r; count++; });
const centerQ = sumQ / count;
const centerR = sumR / count;
const center = toXY(centerQ, centerR);

// Auto-detect Mount Arbora peak from mountain hexes
let mtSumQ = 0, mtSumR = 0, mtCount = 0;
landMap.forEach(h => {
  if (h.terrain === 'mountains') {
    mtSumQ += h.coord.q;
    mtSumR += h.coord.r;
    mtCount++;
  }
});
const MT_ARBORA = mtCount > 0
  ? { q: Math.round(mtSumQ / mtCount), r: Math.round(mtSumR / mtCount) }
  : { q: Math.round(centerQ), r: Math.round(centerR - 4) }; // Fallback: center-north
const mtArboraXY = toXY(MT_ARBORA.q, MT_ARBORA.r);

console.log(`\nIsland center: q=${centerQ.toFixed(1)}, r=${centerR.toFixed(1)}`);
console.log(`Mount Arbora peak: q=${MT_ARBORA.q}, r=${MT_ARBORA.r}`);

function getRegion(q, r) {
  const dist = hexDistance({ q, r }, MT_ARBORA);

  // Mount Arbora zone: within ~3 hex of peak
  if (dist <= 3) return 'mount_arbora';

  const { x, y } = toXY(q, r);
  const dx = x - center.x;
  const dy = y - center.y;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  // Land of Hot Water: north of Mount Arbora, above center
  if (r < MT_ARBORA.r - 2 && q > -4) return 'land_of_hot_water';

  // Brackwater Wetlands: eastern side
  if (q > 10 || (q > 6 && angle > -60 && angle < 30)) return 'brackwater_wetlands';

  // Coastal Highlands: southeastern corner
  if (r > 0 && q > 0 && angle > 30 && angle < 120) return 'coastal_highlands';

  // Gift of Shuritashi: western side (largest region)
  if (q < -2 || (q < 2 && angle > 100) || (q < 0 && angle < -100)) return 'gift_of_shuritashi';

  // Gale Fields: central plains
  return 'gale_fields';
}

// Apply terrain corrections by region
let terrainChanges = 0;
landMap.forEach((h, k) => {
  const region = getRegion(h.coord.q, h.coord.r);
  const oldTerrain = h.terrain;

  switch (region) {
    case 'mount_arbora': {
      const dist = hexDistance(h.coord, MT_ARBORA);
      if (dist <= 1 && h.terrain !== 'mountains') {
        // Inner ring: mountains
        h.terrain = 'mountains';
      } else if (dist === 2 && h.terrain === 'plains') {
        // Outer ring: hills (foothills)
        h.terrain = 'hills';
      } else if (dist === 3 && h.terrain === 'swamp') {
        h.terrain = 'forest'; // No swamp on mountain slopes
      }
      break;
    }
    case 'land_of_hot_water':
      // Arid geothermal region — use desert terrain
      if (h.terrain === 'forest') h.terrain = 'desert';
      if (h.terrain === 'swamp') h.terrain = 'desert';
      if (h.terrain === 'plains') h.terrain = 'desert';
      break;
    case 'gale_fields':
      // Plains/grassland — convert forests to plains
      if (h.terrain === 'forest') h.terrain = 'plains';
      if (h.terrain === 'swamp') h.terrain = 'plains';
      break;
    case 'brackwater_wetlands':
      // Swampy — convert most terrain to swamp
      if (h.terrain === 'forest' || h.terrain === 'plains') h.terrain = 'swamp';
      break;
    case 'coastal_highlands':
      // Hilly plateau
      if (h.terrain === 'plains' || h.terrain === 'swamp') h.terrain = 'hills';
      break;
    case 'gift_of_shuritashi':
      // Mix of hills and forest is correct, just fix swamp
      if (h.terrain === 'swamp') h.terrain = 'forest';
      break;
  }

  // Update description for gap hexes or terrain-changed hexes
  if (!h.description || h.terrain !== oldTerrain) {
    h.description = pickDescription(h.terrain, region);
  }

  if (h.terrain !== oldTerrain) terrainChanges++;
});

console.log(`Terrain corrections applied: ${terrainChanges}`);

// Print region distribution
const regionCounts = {};
landMap.forEach(h => {
  const region = getRegion(h.coord.q, h.coord.r);
  regionCounts[region] = (regionCounts[region] || 0) + 1;
});
console.log('\nRegion distribution:');
Object.entries(regionCounts).sort((a, b) => b[1] - a[1]).forEach(([r, c]) => {
  console.log(`  ${r}: ${c} hexes`);
});

// Print terrain distribution
const terrainCounts = {};
landMap.forEach(h => {
  terrainCounts[h.terrain] = (terrainCounts[h.terrain] || 0) + 1;
});
console.log('\nTerrain distribution:');
Object.entries(terrainCounts).sort((a, b) => b[1] - a[1]).forEach(([t, c]) => {
  console.log(`  ${t}: ${c} hexes`);
});

// ─── Step 5: Scale locations ──────────────────────────────────────────

const scaledLocations = data.locations.map(loc => ({
  ...loc,
  hexCoord: scale(loc.hexCoord),
}));

// Fix Durrin → Dorrin rename
const dorrinLoc = scaledLocations.find(l => l.id === 'settlement-durrin');
if (dorrinLoc) {
  dorrinLoc.name = 'Dorrin';
  dorrinLoc.description = 'Village of Rockwinders on Mount Arbora\'s western slopes. Guides and traders.';
  dorrinLoc.tags = ['mountains', 'guides', 'rockwinders'];
  console.log('\nRenamed Durrin → Dorrin');
}

// Also update the hex that references it
landMap.forEach(h => {
  if (h.locationId === 'settlement-durrin') {
    h.description = 'Dorrin — Rockwinder village on Mount Arbora\'s western slopes.';
  }
});

// ─── Step 6: Add missing locations (skip if already present) ─────────

const existingLocIds = new Set(scaledLocations.map(l => l.id));
const newLocations = [];
const newHexes = [];

// Find Toggle's current (scaled) position for relative placement
const toggleLoc = scaledLocations.find(l => l.name === 'Toggle');
const toggleQ = toggleLoc ? toggleLoc.hexCoord.q : MT_ARBORA.q + 2;
const toggleR = toggleLoc ? toggleLoc.hexCoord.r : MT_ARBORA.r;

// Find Polewater's current (scaled) position
const polewaterLoc = scaledLocations.find(l => l.name && l.name.includes('Polewater'));
const polewaterQ = polewaterLoc ? polewaterLoc.hexCoord.q : 20;
const polewaterR = polewaterLoc ? polewaterLoc.hexCoord.r : -4;

// Glittering Depot — forgotten mine near Toggle (east slope of Mt Arbora)
const glitteringCoord = { q: toggleQ + 2, r: toggleR };
if (!existingLocIds.has('dungeon-glittering-depot')) {
  if (!landMap.has(key(glitteringCoord.q, glitteringCoord.r))) {
    landMap.set(key(glitteringCoord.q, glitteringCoord.r), {
      coord: glitteringCoord,
      terrain: 'mountains',
      description: 'Entrance to a long-forgotten mine. Gem-encrusted caverns below.',
      locationId: 'dungeon-glittering-depot',
    });
  } else {
    const hex = landMap.get(key(glitteringCoord.q, glitteringCoord.r));
    hex.locationId = 'dungeon-glittering-depot';
    hex.description = 'Entrance to a long-forgotten mine. Gem-encrusted caverns below.';
  }
  newLocations.push({
    id: 'dungeon-glittering-depot',
    name: 'Glittering Depot',
    type: 'dungeon',
    hexCoord: glitteringCoord,
    description: 'A long-forgotten mine near Toggle. Center of a tunnel maze with gem-encrusted caverns and monster lairs.',
    tags: ['mine', 'first-age', 'wandering-line'],
    dungeonSize: 'medium',
    dungeonTheme: 'mine',
    depth: 3,
    rooms: [],
    connections: [],
    entranceRoomId: '',
    npcIds: [],
  });
}

// Prison of Oghmai — center of Mount Arbora
if (!existingLocIds.has('dungeon-prison-oghmai')) {
  const oghmaCoord = { ...MT_ARBORA };
  const peakHex = landMap.get(key(oghmaCoord.q, oghmaCoord.r));
  let finalOghmaCoord = oghmaCoord;
  if (peakHex && !peakHex.locationId) {
    peakHex.locationId = 'dungeon-prison-oghmai';
    peakHex.description = 'The peak of Mount Arbora. Deep within lies the Prison of Oghmai.';
  } else {
    const altCoord = { q: MT_ARBORA.q + 1, r: MT_ARBORA.r };
    finalOghmaCoord = altCoord;
    if (!landMap.has(key(altCoord.q, altCoord.r))) {
      landMap.set(key(altCoord.q, altCoord.r), {
        coord: altCoord,
        terrain: 'mountains',
        description: 'The peak of Mount Arbora. Deep within lies the Prison of Oghmai.',
        locationId: 'dungeon-prison-oghmai',
      });
    } else {
      const h = landMap.get(key(altCoord.q, altCoord.r));
      if (!h.locationId) {
        h.locationId = 'dungeon-prison-oghmai';
        h.description = 'The peak of Mount Arbora. Deep within lies the Prison of Oghmai.';
      }
    }
  }
  newLocations.push({
    id: 'dungeon-prison-oghmai',
    name: 'Prison of Oghmai',
    type: 'dungeon',
    hexCoord: finalOghmaCoord,
    description: 'Deep within Mount Arbora. Holds Oghmai, demon emperor of the nakudama, imprisoned since the Second Age.',
    tags: ['mountain', 'prison', 'nakudama', 'demon'],
    dungeonSize: 'large',
    dungeonTheme: 'temple',
    depth: 5,
    rooms: [],
    connections: [],
    entranceRoomId: '',
    npcIds: [],
  });
}

// Sally Sue — beached shipwreck ~1 mile north of Polewater
const sallyCoord = { q: polewaterQ, r: polewaterR - 2 };
if (!existingLocIds.has('landmark-sally-sue')) {
  if (!landMap.has(key(sallyCoord.q, sallyCoord.r))) {
    scaledWaterLocs.push({
      coord: sallyCoord,
      terrain: 'water',
      description: 'Sally Sue — a 100-foot shipwreck beached in sand and tree limbs.',
      locationId: 'landmark-sally-sue',
    });
  } else {
    const h = landMap.get(key(sallyCoord.q, sallyCoord.r));
    h.locationId = 'landmark-sally-sue';
    h.description = 'Sally Sue — a 100-foot shipwreck beached in sand and tree limbs.';
  }
  newLocations.push({
    id: 'landmark-sally-sue',
    name: 'Sally Sue',
    type: 'landmark',
    hexCoord: sallyCoord,
    description: 'Beached 100-foot shipwreck buried in sand and tree limbs on a debris-strewn beach, ~1 mile north of Polewater.',
    tags: ['shipwreck', 'beach', 'brackwater'],
    sites: [],
    npcIds: [],
  });
}

console.log(`\nAdded ${newLocations.length} new locations: ${newLocations.map(l => l.name).join(', ')}`);

// ─── Step 7: Scale edges ─────────────────────────────────────────────

const scaledEdges = data.edges.map(e => ({
  ...e,
  from: scale(e.from),
  to: scale(e.to),
}));

console.log(`Scaled ${scaledEdges.length} edges`);

// ─── Step 8: Generate water border (2 rings) ─────────────────────────

// Remove any land hexes that should be water (Temple of Shoom, etc.)
scaledWaterLocs.forEach(wh => {
  const wk = key(wh.coord.q, wh.coord.r);
  if (landMap.has(wk)) {
    console.log(`  Removing land hex at (${wh.coord.q},${wh.coord.r}) — replacing with water for ${wh.locationId}`);
    landMap.delete(wk);
  }
});

// Collect all land + water-location hex keys
const allLandKeys = new Set(landMap.keys());
scaledWaterLocs.forEach(h => allLandKeys.add(key(h.coord.q, h.coord.r)));

const waterBorder = new Map();

// Ring 1: immediate neighbors of land that aren't land
allLandKeys.forEach(k => {
  const { q, r } = parse(k);
  neighbors(q, r).forEach(n => {
    const nk = key(n.q, n.r);
    if (!allLandKeys.has(nk) && !waterBorder.has(nk)) {
      waterBorder.set(nk, {
        coord: { q: n.q, r: n.r },
        terrain: 'water',
        description: pickDescription('water', null),
      });
    }
  });
});

const ring1Size = waterBorder.size;
const ring1Keys = new Set(waterBorder.keys());

// Ring 2: neighbors of ring 1 that aren't land or ring 1
ring1Keys.forEach(k => {
  const { q, r } = parse(k);
  neighbors(q, r).forEach(n => {
    const nk = key(n.q, n.r);
    if (!allLandKeys.has(nk) && !ring1Keys.has(nk) && !waterBorder.has(nk)) {
      waterBorder.set(nk, {
        coord: { q: n.q, r: n.r },
        terrain: 'water',
        description: pickDescription('water', null),
      });
    }
  });
});

console.log(`\nWater border: ${waterBorder.size} hexes (ring1: ${ring1Size}, ring2: ${waterBorder.size - ring1Size})`);

// Ensure water hexes exist for Sunken Town, Coral Castle, Temple of Shoom
// These may already be in waterBorder or need to be added
scaledWaterLocs.forEach(wh => {
  const wk = key(wh.coord.q, wh.coord.r);
  if (waterBorder.has(wk)) {
    // Update existing water hex with location data
    const existing = waterBorder.get(wk);
    existing.locationId = wh.locationId;
    existing.description = wh.description;
  } else if (!allLandKeys.has(wk)) {
    // Add as standalone water hex
    waterBorder.set(wk, wh);
  }
  // If it's in allLandKeys, it's already handled
});

// For Sunken Town at (12,-24) — this is far offshore, we need to ensure
// there's a path of water hexes to it. Add any missing hexes in between.
const sunkenTown = scaledWaterLocs.find(h => h.locationId === 'dungeon-sunken-town');
if (sunkenTown) {
  const stk = key(sunkenTown.coord.q, sunkenTown.coord.r);
  if (!waterBorder.has(stk)) {
    // Need to add water hexes bridging to Sunken Town
    // Find the nearest water border hex
    let nearestDist = Infinity;
    let nearestCoord = null;
    waterBorder.forEach((h, k) => {
      const d = hexDistance(h.coord, sunkenTown.coord);
      if (d < nearestDist) {
        nearestDist = d;
        nearestCoord = h.coord;
      }
    });

    if (nearestCoord) {
      // Fill water hexes from nearest border to Sunken Town
      let cur = { ...nearestCoord };
      for (let i = 0; i < nearestDist + 1; i++) {
        const ck = key(cur.q, cur.r);
        if (!waterBorder.has(ck) && !allLandKeys.has(ck)) {
          waterBorder.set(ck, {
            coord: { q: cur.q, r: cur.r },
            terrain: 'water',
            description: 'Deep water — dark currents below the surface.',
            ...(cur.q === sunkenTown.coord.q && cur.r === sunkenTown.coord.r
              ? { locationId: sunkenTown.locationId } : {}),
          });
        }
        // Step toward sunken town
        const dq = sunkenTown.coord.q - cur.q;
        const dr = sunkenTown.coord.r - cur.r;
        // Pick the direction that gets closest
        let bestDir = null;
        let bestDist = Infinity;
        for (const dir of HEX_DIRS) {
          const nq = cur.q + dir.q;
          const nr = cur.r + dir.r;
          const d = hexDistance({ q: nq, r: nr }, sunkenTown.coord);
          if (d < bestDist) {
            bestDist = d;
            bestDir = dir;
          }
        }
        if (bestDir) {
          cur = { q: cur.q + bestDir.q, r: cur.r + bestDir.r };
        } else break;
      }
    }
  }
}

// Same for Coral Castle at (-16, 0) — far offshore west
const coralCastle = scaledWaterLocs.find(h => h.locationId === 'dungeon-coral-castle');
if (coralCastle) {
  const cck = key(coralCastle.coord.q, coralCastle.coord.r);
  if (!waterBorder.has(cck)) {
    let nearestDist = Infinity;
    let nearestCoord = null;
    waterBorder.forEach((h) => {
      const d = hexDistance(h.coord, coralCastle.coord);
      if (d < nearestDist) {
        nearestDist = d;
        nearestCoord = h.coord;
      }
    });
    if (nearestCoord) {
      let cur = { ...nearestCoord };
      for (let i = 0; i < nearestDist + 1; i++) {
        const ck = key(cur.q, cur.r);
        if (!waterBorder.has(ck) && !allLandKeys.has(ck)) {
          waterBorder.set(ck, {
            coord: { q: cur.q, r: cur.r },
            terrain: 'water',
            description: 'Open ocean — endless blue waters.',
            ...(cur.q === coralCastle.coord.q && cur.r === coralCastle.coord.r
              ? { locationId: coralCastle.locationId } : {}),
          });
        }
        let bestDir = null;
        let bestDist = Infinity;
        for (const dir of HEX_DIRS) {
          const d = hexDistance(
            { q: cur.q + dir.q, r: cur.r + dir.r },
            coralCastle.coord
          );
          if (d < bestDist) { bestDist = d; bestDir = dir; }
        }
        if (bestDir) cur = { q: cur.q + bestDir.q, r: cur.r + bestDir.r };
        else break;
      }
    }
  }
}

// ─── Step 9: Assemble final output ────────────────────────────────────

const allHexes = [
  ...landMap.values(),
  ...waterBorder.values(),
];

// Deduplicate (shouldn't be needed but safety check)
const hexSet = new Map();
allHexes.forEach(h => {
  const k = key(h.coord.q, h.coord.r);
  if (!hexSet.has(k)) hexSet.set(k, h);
});

// Ensure every location has a hex at its coordinates
const allLocations = [...scaledLocations, ...newLocations];
allLocations.forEach(loc => {
  const lk = key(loc.hexCoord.q, loc.hexCoord.r);
  if (!hexSet.has(lk)) {
    // Determine terrain from location type
    const isWaterLoc = scaledWaterLocs.some(wh => wh.locationId === loc.id);
    const terrain = isWaterLoc ? 'water' : (loc.type === 'dungeon' ? 'hills' : 'hills');
    const desc = isWaterLoc
      ? `${loc.name} — ${loc.description || 'Submerged ruins visible through clear water.'}`
      : `${loc.name} — ${loc.description || ''}`;
    hexSet.set(lk, {
      coord: { q: loc.hexCoord.q, r: loc.hexCoord.r },
      terrain,
      description: desc,
      locationId: loc.id,
    });
    console.log(`  Created missing hex for "${loc.name}" at (${loc.hexCoord.q},${loc.hexCoord.r}) [${terrain}]`);
  }
});

// For offshore locations, fill water hexes between them and the nearest existing hex
function fillWaterBridge(targetCoord) {
  let cur = { ...targetCoord };
  // Walk toward center of island until we hit an existing hex
  const path = [{ ...cur }];
  for (let i = 0; i < 20; i++) {
    let bestDir = null;
    let bestDist = Infinity;
    for (const dir of HEX_DIRS) {
      const nq = cur.q + dir.q;
      const nr = cur.r + dir.r;
      const nk = key(nq, nr);
      if (hexSet.has(nk)) return; // Connected!
      const d = Math.abs(nq - centerQ) + Math.abs(nr - centerR);
      if (d < bestDist) { bestDist = d; bestDir = dir; }
    }
    if (!bestDir) break;
    cur = { q: cur.q + bestDir.q, r: cur.r + bestDir.r };
    const ck = key(cur.q, cur.r);
    if (hexSet.has(ck)) return; // Connected!
    hexSet.set(ck, {
      coord: { q: cur.q, r: cur.r },
      terrain: 'water',
      description: 'Open water — the sea stretches to the horizon.',
    });
  }
}

// Bridge offshore locations
scaledWaterLocs.forEach(wh => {
  fillWaterBridge(wh.coord);
});
// Bridge Sally Sue too
fillWaterBridge(sallyCoord);

const finalHexes = [...hexSet.values()];
const finalLocations = allLocations;

// Verify all location hex coords have matching hexes
const hexKeySet = new Set(finalHexes.map(h => key(h.coord.q, h.coord.r)));
let missingHexes = 0;
finalLocations.forEach(loc => {
  const lk = key(loc.hexCoord.q, loc.hexCoord.r);
  if (!hexKeySet.has(lk)) {
    console.warn(`WARNING: Location "${loc.name}" at (${loc.hexCoord.q},${loc.hexCoord.r}) has no matching hex!`);
    missingHexes++;
  }
});

// Verify all hexes with locationId have matching locations
const locIdSet = new Set(finalLocations.map(l => l.id));
finalHexes.forEach(h => {
  if (h.locationId && !locIdSet.has(h.locationId)) {
    console.warn(`WARNING: Hex at (${h.coord.q},${h.coord.r}) references missing location "${h.locationId}"`);
  }
});

// Check for adjacent settlements
let adjacentPairs = 0;
const locationHexes = finalHexes.filter(h => h.locationId);
for (let i = 0; i < locationHexes.length; i++) {
  for (let j = i + 1; j < locationHexes.length; j++) {
    if (hexDistance(locationHexes[i].coord, locationHexes[j].coord) === 1) {
      adjacentPairs++;
      const loc1 = finalLocations.find(l => l.id === locationHexes[i].locationId);
      const loc2 = finalLocations.find(l => l.id === locationHexes[j].locationId);
      console.warn(`Adjacent: ${loc1?.name || '?'} ↔ ${loc2?.name || '?'}`);
    }
  }
}

const output = {
  ...data,
  hexes: finalHexes,
  locations: finalLocations,
  edges: scaledEdges,
  updatedAt: Date.now(),
};

// Summary
const landCount = finalHexes.filter(h => h.terrain !== 'water').length;
const waterCount = finalHexes.filter(h => h.terrain === 'water').length;

console.log(`\n═══ FINAL OUTPUT ═══`);
console.log(`Total hexes: ${finalHexes.length} (${landCount} land, ${waterCount} water)`);
console.log(`Locations: ${finalLocations.length}`);
console.log(`Edges: ${scaledEdges.length}`);
console.log(`Adjacent settlement pairs: ${adjacentPairs}`);
console.log(`Missing hex warnings: ${missingHexes}`);

// Coordinate bounds
let minQ = Infinity, maxQ = -Infinity, minR = Infinity, maxR = -Infinity;
finalHexes.forEach(h => {
  minQ = Math.min(minQ, h.coord.q);
  maxQ = Math.max(maxQ, h.coord.q);
  minR = Math.min(minR, h.coord.r);
  maxR = Math.max(maxR, h.coord.r);
});
console.log(`Coordinate bounds: q=[${minQ}, ${maxQ}], r=[${minR}, ${maxR}]`);
console.log(`Map span: ${maxQ - minQ + 1} cols × ${maxR - minR + 1} rows`);

fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2));
console.log(`\nWritten to ${OUTPUT}`);
