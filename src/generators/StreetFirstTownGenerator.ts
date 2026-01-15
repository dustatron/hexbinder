/**
 * StreetFirstTownGenerator.ts
 *
 * Generate a rough grid of streets, then place buildings along them.
 * Creates organic medieval town layouts (not perfect geometric patterns).
 */

import { nanoid } from "nanoid";
import type {
  SettlementSize,
  TownPoint,
  TownPolygon,
  TownStreet,
} from "~/models";
import { SeededRandom } from "./SeededRandom";

// === Configuration ===

const SIZE_CONFIG: Record<SettlementSize, {
  radius: number;
  mainStreets: number;      // Number of main streets
  crossStreets: number;     // Number of cross streets
  buildingWidth: { min: number; max: number };
  buildingDepth: { min: number; max: number };
  numLandmarks: number;
}> = {
  thorpe: {
    radius: 45,
    mainStreets: 1,
    crossStreets: 1,
    buildingWidth: { min: 8, max: 13 },
    buildingDepth: { min: 6, max: 10 },
    numLandmarks: 2,
  },
  hamlet: {
    radius: 65,
    mainStreets: 2,
    crossStreets: 2,
    buildingWidth: { min: 8, max: 14 },
    buildingDepth: { min: 6, max: 11 },
    numLandmarks: 3,
  },
  village: {
    radius: 90,
    mainStreets: 2,
    crossStreets: 3,
    buildingWidth: { min: 9, max: 15 },
    buildingDepth: { min: 7, max: 12 },
    numLandmarks: 4,
  },
  town: {
    radius: 120,
    mainStreets: 3,
    crossStreets: 4,
    buildingWidth: { min: 10, max: 16 },
    buildingDepth: { min: 8, max: 13 },
    numLandmarks: 8,
  },
  city: {
    radius: 160,
    mainStreets: 4,
    crossStreets: 5,
    buildingWidth: { min: 10, max: 18 },
    buildingDepth: { min: 8, max: 14 },
    numLandmarks: 12,
  },
};

// Landmark types for key locations
const LANDMARK_TYPES = [
  { name: "Temple", icon: "⛪" },
  { name: "Tavern", icon: "🍺" },
  { name: "Market", icon: "🏪" },
  { name: "Town Hall", icon: "🏛️" },
  { name: "Blacksmith", icon: "⚒️" },
  { name: "Inn", icon: "🛏️" },
  { name: "General Store", icon: "🏪" },
  { name: "Noble Estate", icon: "🏰" },
  // Duplicates for larger settlements
  { name: "Tavern", icon: "🍺" },
  { name: "Inn", icon: "🛏️" },
  { name: "Temple", icon: "⛪" },
  { name: "Market", icon: "🏪" },
];

// === Types ===

export interface PlacedBuilding {
  id: string;
  vertices: TownPoint[];
  type: "house" | "landmark";
  name?: string;
  icon?: string;
  locationId?: string;
}

interface Street {
  id: string;
  start: TownPoint;
  end: TownPoint;
  width: "main" | "side" | "alley";
}

interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

// === Helper Functions ===

function getBoundingBox(vertices: TownPoint[]): BoundingBox {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  for (const v of vertices) {
    minX = Math.min(minX, v.x);
    maxX = Math.max(maxX, v.x);
    minY = Math.min(minY, v.y);
    maxY = Math.max(maxY, v.y);
  }
  return { minX, maxX, minY, maxY };
}

function boxesOverlap(a: BoundingBox, b: BoundingBox, padding: number = 2): boolean {
  return !(
    a.maxX + padding < b.minX ||
    b.maxX + padding < a.minX ||
    a.maxY + padding < b.minY ||
    b.maxY + padding < a.minY
  );
}

function wouldOverlap(
  newVertices: TownPoint[],
  existingBuildings: PlacedBuilding[],
  padding: number = 2
): boolean {
  const newBox = getBoundingBox(newVertices);
  for (const building of existingBuildings) {
    const existingBox = getBoundingBox(building.vertices);
    if (boxesOverlap(newBox, existingBox, padding)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a point is too close to a line segment
 */
function pointToSegmentDistance(
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) {
    // Segment is a point
    return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  }

  // Project point onto line, clamping to segment
  let t = ((px - x1) * dx + (py - y1) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));

  const closestX = x1 + t * dx;
  const closestY = y1 + t * dy;

  return Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2);
}

/**
 * Check if building overlaps with any street
 * Uses proper line-to-box distance checking
 */
function overlapsStreet(
  vertices: TownPoint[],
  streets: Street[],
  excludeStreet?: Street
): boolean {
  const box = getBoundingBox(vertices);
  const centerX = (box.minX + box.maxX) / 2;
  const centerY = (box.minY + box.maxY) / 2;

  for (const street of streets) {
    // Skip the street this building is being placed along
    if (excludeStreet && street.id === excludeStreet.id) continue;

    // Get street corridor width based on type
    const halfWidth = street.width === "main" ? 5 : street.width === "side" ? 3.5 : 2.5;

    // Check distance from building center to street
    const dist = pointToSegmentDistance(
      centerX, centerY,
      street.start.x, street.start.y,
      street.end.x, street.end.y
    );

    // Building is too close to street
    const buildingRadius = Math.max(box.maxX - box.minX, box.maxY - box.minY) / 2;
    if (dist < halfWidth + buildingRadius + 2) {
      return true;
    }
  }
  return false;
}

/**
 * Create rectangle vertices at position with given angle
 */
function createRectangle(
  cx: number,
  cy: number,
  width: number,
  depth: number,
  angle: number
): TownPoint[] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const hw = width / 2;
  const hd = depth / 2;

  // Rotate rectangle corners
  return [
    { x: cx + cos * -hw - sin * -hd, y: cy + sin * -hw + cos * -hd },
    { x: cx + cos * hw - sin * -hd, y: cy + sin * hw + cos * -hd },
    { x: cx + cos * hw - sin * hd, y: cy + sin * hw + cos * hd },
    { x: cx + cos * -hw - sin * hd, y: cy + sin * -hw + cos * hd },
  ];
}

/**
 * Create L-shaped building vertices
 * Creates a proper L by defining 6 corners explicitly
 */
function createLShape(
  cx: number,
  cy: number,
  width: number,
  depth: number,
  angle: number,
  rng: SeededRandom
): TownPoint[] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const hw = width / 2;
  const hd = depth / 2;

  // Cut size for L shape (40-60% of each dimension)
  const cutW = hw * (0.4 + rng.next() * 0.2);
  const cutD = hd * (0.4 + rng.next() * 0.2);

  // Which corner to cut (0=top-left, 1=top-right, 2=bottom-right, 3=bottom-left)
  const cutCorner = rng.between(0, 3);

  // Define 6 points for L-shape based on which corner is cut
  // Points go clockwise starting from top-left
  let localPoints: { lx: number; ly: number }[];

  if (cutCorner === 0) {
    // Cut top-left corner
    localPoints = [
      { lx: -hw + cutW, ly: -hd },     // Start right of cut
      { lx: hw, ly: -hd },              // Top-right
      { lx: hw, ly: hd },               // Bottom-right
      { lx: -hw, ly: hd },              // Bottom-left
      { lx: -hw, ly: -hd + cutD },      // Up left side
      { lx: -hw + cutW, ly: -hd + cutD }, // Inner corner
    ];
  } else if (cutCorner === 1) {
    // Cut top-right corner
    localPoints = [
      { lx: -hw, ly: -hd },             // Top-left
      { lx: hw - cutW, ly: -hd },       // Left of cut
      { lx: hw - cutW, ly: -hd + cutD }, // Inner corner
      { lx: hw, ly: -hd + cutD },       // Down right side
      { lx: hw, ly: hd },               // Bottom-right
      { lx: -hw, ly: hd },              // Bottom-left
    ];
  } else if (cutCorner === 2) {
    // Cut bottom-right corner
    localPoints = [
      { lx: -hw, ly: -hd },             // Top-left
      { lx: hw, ly: -hd },              // Top-right
      { lx: hw, ly: hd - cutD },        // Down right side
      { lx: hw - cutW, ly: hd - cutD }, // Inner corner
      { lx: hw - cutW, ly: hd },        // Left of cut
      { lx: -hw, ly: hd },              // Bottom-left
    ];
  } else {
    // Cut bottom-left corner (cutCorner === 3)
    localPoints = [
      { lx: -hw, ly: -hd },             // Top-left
      { lx: hw, ly: -hd },              // Top-right
      { lx: hw, ly: hd },               // Bottom-right
      { lx: -hw + cutW, ly: hd },       // Right of cut
      { lx: -hw + cutW, ly: hd - cutD }, // Inner corner
      { lx: -hw, ly: hd - cutD },       // Up left side
    ];
  }

  // Rotate and translate points
  return localPoints.map(({ lx, ly }) => ({
    x: cx + cos * lx - sin * ly,
    y: cy + sin * lx + cos * ly,
  }));
}

/**
 * Create circular building (approximated as polygon)
 */
function createCircle(
  cx: number,
  cy: number,
  radius: number,
  numSides: number = 12
): TownPoint[] {
  const points: TownPoint[] = [];
  for (let i = 0; i < numSides; i++) {
    const angle = (i / numSides) * Math.PI * 2;
    points.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    });
  }
  return points;
}

/**
 * Create a square building
 */
function createSquare(
  cx: number,
  cy: number,
  size: number,
  angle: number
): TownPoint[] {
  return createRectangle(cx, cy, size, size, angle);
}

// === Main Generator ===

export interface StreetFirstOutput {
  center: TownPoint;
  radius: number;
  streets: TownStreet[];
  buildings: PlacedBuilding[];
  landmarks: PlacedBuilding[];
  plaza?: TownPolygon;
}

export function generateStreetFirstTown(
  size: SettlementSize,
  rng: SeededRandom
): StreetFirstOutput {
  const config = SIZE_CONFIG[size];
  const center: TownPoint = { x: 0, y: 0 };
  const radius = config.radius;

  const streets: Street[] = [];
  const allBuildings: PlacedBuilding[] = [];
  const landmarks: PlacedBuilding[] = [];

  // Town bounds (slightly irregular)
  const bounds = {
    minX: -radius * (0.9 + rng.next() * 0.2),
    maxX: radius * (0.9 + rng.next() * 0.2),
    minY: -radius * (0.9 + rng.next() * 0.2),
    maxY: radius * (0.9 + rng.next() * 0.2),
  };

  // === 1. Generate Main Streets (rough E-W lines) ===
  const mainStreetYs: number[] = [];
  for (let i = 0; i < config.mainStreets; i++) {
    const t = (i + 1) / (config.mainStreets + 1);
    const baseY = bounds.minY + (bounds.maxY - bounds.minY) * t;
    const y = baseY + (rng.next() - 0.5) * 20; // Add variation
    mainStreetYs.push(y);

    // Street doesn't go perfectly straight - add some wobble
    const wobble1 = (rng.next() - 0.5) * 15;
    const wobble2 = (rng.next() - 0.5) * 15;

    streets.push({
      id: nanoid(),
      start: { x: bounds.minX, y: y + wobble1 },
      end: { x: bounds.maxX, y: y + wobble2 },
      width: "main",
    });
  }

  // === 2. Generate Cross Streets (rough N-S lines) ===
  const crossStreetXs: number[] = [];
  for (let i = 0; i < config.crossStreets; i++) {
    const t = (i + 1) / (config.crossStreets + 1);
    const baseX = bounds.minX + (bounds.maxX - bounds.minX) * t;
    const x = baseX + (rng.next() - 0.5) * 20;
    crossStreetXs.push(x);

    const wobble1 = (rng.next() - 0.5) * 15;
    const wobble2 = (rng.next() - 0.5) * 15;

    streets.push({
      id: nanoid(),
      start: { x: x + wobble1, y: bounds.minY },
      end: { x: x + wobble2, y: bounds.maxY },
      width: i === Math.floor(config.crossStreets / 2) ? "main" : "side",
    });
  }

  // === 3. Add some side alleys ===
  const numAlleys = rng.between(2, 4);
  for (let i = 0; i < numAlleys; i++) {
    const isHorizontal = rng.next() > 0.5;
    if (isHorizontal && mainStreetYs.length >= 2) {
      // Alley between two main streets
      const idx = rng.between(0, mainStreetYs.length - 2);
      const y = (mainStreetYs[idx] + mainStreetYs[idx + 1]) / 2 + (rng.next() - 0.5) * 10;
      const startX = crossStreetXs.length > 0
        ? crossStreetXs[rng.between(0, crossStreetXs.length - 1)]
        : bounds.minX * 0.5;
      const endX = crossStreetXs.length > 1
        ? crossStreetXs[rng.between(0, crossStreetXs.length - 1)]
        : bounds.maxX * 0.5;

      if (Math.abs(endX - startX) > 20) {
        streets.push({
          id: nanoid(),
          start: { x: Math.min(startX, endX), y },
          end: { x: Math.max(startX, endX), y },
          width: "alley",
        });
      }
    } else if (!isHorizontal && crossStreetXs.length >= 2) {
      // Vertical alley
      const idx = rng.between(0, crossStreetXs.length - 2);
      const x = (crossStreetXs[idx] + crossStreetXs[idx + 1]) / 2 + (rng.next() - 0.5) * 10;
      const startY = mainStreetYs.length > 0
        ? mainStreetYs[rng.between(0, mainStreetYs.length - 1)]
        : bounds.minY * 0.5;
      const endY = mainStreetYs.length > 1
        ? mainStreetYs[rng.between(0, mainStreetYs.length - 1)]
        : bounds.maxY * 0.5;

      if (Math.abs(endY - startY) > 20) {
        streets.push({
          id: nanoid(),
          start: { x, y: Math.min(startY, endY) },
          end: { x, y: Math.max(startY, endY) },
          width: "alley",
        });
      }
    }
  }

  // Convert streets to waypoints format
  const outputStreets: TownStreet[] = streets.map(s => ({
    id: s.id,
    waypoints: [s.start, s.end],
    width: s.width,
  }));

  // === 4. Place Landmarks at intersections ===
  const availableLandmarkTypes = [...LANDMARK_TYPES];
  const intersections: TownPoint[] = [];

  // Find street intersections
  for (const mainY of mainStreetYs) {
    for (const crossX of crossStreetXs) {
      intersections.push({ x: crossX, y: mainY });
    }
  }

  // Also add positions along streets (not just intersections) for more landmark spots
  for (const street of streets) {
    const dx = street.end.x - street.start.x;
    const dy = street.end.y - street.start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    // Add midpoints along longer streets
    if (length > 80) {
      const midX = (street.start.x + street.end.x) / 2;
      const midY = (street.start.y + street.end.y) / 2;
      intersections.push({ x: midX, y: midY });
    }
  }

  // Shuffle intersections
  for (let i = intersections.length - 1; i > 0; i--) {
    const j = rng.between(0, i);
    [intersections[i], intersections[j]] = [intersections[j], intersections[i]];
  }

  // Place landmarks - try all quadrants for each position
  let landmarkTypeIndex = 0;
  for (const pos of intersections) {
    if (landmarks.length >= config.numLandmarks) break;
    if (landmarkTypeIndex >= availableLandmarkTypes.length) break;

    const lWidth = config.buildingWidth.max * 1.3;
    const lDepth = config.buildingDepth.max * 1.3;
    const angle = (rng.next() - 0.5) * 0.15;

    // Try all 4 quadrants around the intersection
    const quadrants = [0, 1, 2, 3];
    // Shuffle quadrants
    for (let i = quadrants.length - 1; i > 0; i--) {
      const j = rng.between(0, i);
      [quadrants[i], quadrants[j]] = [quadrants[j], quadrants[i]];
    }

    for (const quadrant of quadrants) {
      if (landmarks.length >= config.numLandmarks) break;
      if (landmarkTypeIndex >= availableLandmarkTypes.length) break;

      const offsetDist = 20 + rng.next() * 10;
      const offsetX = (quadrant === 0 || quadrant === 3 ? -1 : 1) * offsetDist;
      const offsetY = (quadrant < 2 ? -1 : 1) * offsetDist;

      const vertices = createRectangle(pos.x + offsetX, pos.y + offsetY, lWidth, lDepth, angle);

      // Check for overlap with existing landmarks only (buildings placed after)
      if (!wouldOverlap(vertices, landmarks, 4)) {
        const landmarkType = availableLandmarkTypes[landmarkTypeIndex];
        landmarkTypeIndex++;

        landmarks.push({
          id: nanoid(),
          vertices,
          type: "landmark",
          name: landmarkType.name,
          icon: landmarkType.icon,
          locationId: nanoid(),
        });
        break; // Move to next intersection after successful placement
      }
    }
  }

  // === 5. Place Buildings Along Streets ===
  // Denser packing for larger settlements
  const isDense = size === "town" || size === "city";
  const streetSetback = isDense ? 10 : 12;
  const buildingGap = isDense ? 2 : 4;

  for (const street of streets) {
    const dx = street.end.x - street.start.x;
    const dy = street.end.y - street.start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const streetAngle = Math.atan2(dy, dx);
    const perpAngle = streetAngle + Math.PI / 2;

    // Place buildings on both sides
    for (const side of [-1, 1]) {
      let dist = 15; // Start further from street start

      while (dist < length - 15) {
        const bWidth = rng.next() * (config.buildingWidth.max - config.buildingWidth.min) + config.buildingWidth.min;
        const bDepth = rng.next() * (config.buildingDepth.max - config.buildingDepth.min) + config.buildingDepth.min;

        // Position along street
        const t = dist / length;
        const streetX = street.start.x + dx * t;
        const streetY = street.start.y + dy * t;

        // Offset perpendicular to street - increased for clearance
        const offset = streetSetback + bDepth / 2;
        const bx = streetX + Math.cos(perpAngle) * offset * side;
        const by = streetY + Math.sin(perpAngle) * offset * side;

        // Building faces the street
        const buildingAngle = streetAngle + (rng.next() - 0.5) * 0.15;

        // Shape distribution: 40% rect, 30% square, 20% L-shape, 10% circle
        const shapeRoll = rng.next();
        let vertices: TownPoint[];
        if (shapeRoll < 0.1) {
          // Circle (rare) - use average of width/depth as radius
          const radius = (bWidth + bDepth) / 4;
          vertices = createCircle(bx, by, radius);
        } else if (shapeRoll < 0.3) {
          // L-shape
          vertices = createLShape(bx, by, bWidth, bDepth, buildingAngle, rng);
        } else if (shapeRoll < 0.6) {
          // Square
          const size = Math.min(bWidth, bDepth);
          vertices = createSquare(bx, by, size, buildingAngle);
        } else {
          // Rectangle
          vertices = createRectangle(bx, by, bWidth, bDepth, buildingAngle);
        }

        // Check overlap with buildings AND other streets (not the one we're placing along)
        // Tighter packing for towns/cities
        const overlapPadding = isDense ? 1.5 : 3;
        if (!wouldOverlap(vertices, [...allBuildings, ...landmarks], overlapPadding) &&
            !overlapsStreet(vertices, streets, street)) {
          allBuildings.push({
            id: nanoid(),
            vertices,
            type: "house",
          });
        }

        dist += bWidth + buildingGap + rng.next() * 5;
      }
    }
  }

  // === 6. Create Plaza at center intersection ===
  let plaza: TownPolygon | undefined;
  if (intersections.length > 0) {
    // Find the most central intersection
    const centralIntersection = intersections.reduce((best, curr) => {
      const bestDist = Math.sqrt(best.x ** 2 + best.y ** 2);
      const currDist = Math.sqrt(curr.x ** 2 + curr.y ** 2);
      return currDist < bestDist ? curr : best;
    });

    // Create a small plaza polygon at the intersection
    const plazaSize = 12;
    plaza = {
      vertices: [
        { x: centralIntersection.x - plazaSize, y: centralIntersection.y - plazaSize * 0.8 },
        { x: centralIntersection.x + plazaSize, y: centralIntersection.y - plazaSize * 0.8 },
        { x: centralIntersection.x + plazaSize, y: centralIntersection.y + plazaSize * 0.8 },
        { x: centralIntersection.x - plazaSize, y: centralIntersection.y + plazaSize * 0.8 },
      ],
    };
  }

  return {
    center,
    radius,
    streets: outputStreets,
    buildings: allBuildings,
    landmarks,
    plaza,
  };
}
