/**
 * TownLayoutEngine.ts
 * Generates spatial layouts for settlements using Voronoi diagrams.
 * Creates organic ward distributions, buildings, walls, and streets.
 */

import { nanoid } from "nanoid";
import type {
  SettlementSize,
  SettlementSite,
  SiteType,
  TownPoint,
  TownPolygon,
  TownWard,
  TownWall,
  TownStreet,
  TownBuilding,
  WardType,
} from "~/models";
import { WARD_COUNTS } from "~/models";
import { SeededRandom } from "./SeededRandom";
import { Voronoi } from "./Voronoi";

// === Site to Ward Type Mapping ===

export const SITE_TO_WARD: Partial<Record<SiteType | string, WardType>> = {
  // Core mappings from requirements
  tavern: "tavern",
  inn: "tavern",
  temple: "temple",
  shrine: "temple",
  market: "market",
  blacksmith: "craftsmen",
  armorer: "craftsmen",
  fletcher: "craftsmen",
  general_store: "merchant",
  stables: "merchant",
  town_hall: "castle",
  barracks: "castle",
  jail: "castle",
  // Additional SiteType mappings
  guild_hall: "craftsmen",
  noble_estate: "castle",
};

// === Helper Functions ===

/**
 * Generate points in a spiral pattern for organic ward distribution
 */
export function generateSpiralPoints(
  nPoints: number,
  rng: SeededRandom
): TownPoint[] {
  const sa = rng.next() * 2 * Math.PI;
  const points: TownPoint[] = [];
  // Tighter spiral: smaller radius growth for more compact distribution
  for (let i = 0; i < nPoints; i++) {
    const a = sa + Math.sqrt(i) * 3; // Reduced from 5 to 3 for tighter spiral
    const r = i === 0 ? 0 : 5 + i * (1.5 + rng.next() * 0.5); // Reduced scale
    points.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
  }
  return points;
}

/**
 * Calculate area of a polygon using shoelace formula
 */
function polygonArea(vertices: TownPoint[]): number {
  if (vertices.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    area += vertices[i].x * vertices[j].y;
    area -= vertices[j].x * vertices[i].y;
  }
  return Math.abs(area) / 2;
}

/**
 * Calculate centroid of a polygon
 */
function polygonCentroid(vertices: TownPoint[]): TownPoint {
  if (vertices.length === 0) return { x: 0, y: 0 };
  const cx = vertices.reduce((s, p) => s + p.x, 0) / vertices.length;
  const cy = vertices.reduce((s, p) => s + p.y, 0) / vertices.length;
  return { x: cx, y: cy };
}

/**
 * Clip polygon vertices to a circular boundary and remove spiky protrusions.
 * 1. Clip vertices outside radius to circle edge
 * 2. Remove vertices that create sharp spikes (angle < threshold)
 */
function clipPolygonToCircle(
  vertices: TownPoint[],
  center: TownPoint,
  radius: number
): TownPoint[] {
  if (vertices.length < 3) return vertices;

  // First pass: clip to circle
  const clipped = vertices.map((v) => {
    const dx = v.x - center.x;
    const dy = v.y - center.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > radius) {
      const scale = radius / dist;
      return {
        x: center.x + dx * scale,
        y: center.y + dy * scale,
      };
    }
    return { ...v };
  });

  // Second pass: remove spiky vertices (sharp angles pointing outward)
  const smoothed: TownPoint[] = [];
  const minAngle = Math.PI * 0.25; // 45 degrees minimum internal angle

  for (let i = 0; i < clipped.length; i++) {
    const prev = clipped[(i - 1 + clipped.length) % clipped.length];
    const curr = clipped[i];
    const next = clipped[(i + 1) % clipped.length];

    // Calculate vectors
    const v1x = prev.x - curr.x;
    const v1y = prev.y - curr.y;
    const v2x = next.x - curr.x;
    const v2y = next.y - curr.y;

    // Calculate angle between vectors
    const dot = v1x * v2x + v1y * v2y;
    const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
    const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);

    if (mag1 > 0.001 && mag2 > 0.001) {
      const cosAngle = dot / (mag1 * mag2);
      const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));

      // Check if this vertex is at the boundary and forms a spike
      const distFromCenter = Math.sqrt(
        (curr.x - center.x) ** 2 + (curr.y - center.y) ** 2
      );
      const isAtBoundary = distFromCenter > radius * 0.95;

      // Remove spiky vertices at boundary
      if (isAtBoundary && angle < minAngle) {
        continue; // Skip this vertex
      }
    }

    smoothed.push(curr);
  }

  // Ensure we have at least 3 vertices
  return smoothed.length >= 3 ? smoothed : clipped;
}

/**
 * Find the longest edge of a polygon and return its index
 */
function findLongestEdge(vertices: TownPoint[]): number {
  let maxLen = 0;
  let maxIdx = 0;
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    const dx = vertices[j].x - vertices[i].x;
    const dy = vertices[j].y - vertices[i].y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > maxLen) {
      maxLen = len;
      maxIdx = i;
    }
  }
  return maxIdx;
}

/**
 * Split a polygon along a line perpendicular to its longest edge
 */
function splitPolygon(
  vertices: TownPoint[],
  ratio: number
): [TownPoint[], TownPoint[]] | null {
  if (vertices.length < 3) return null;

  const edgeIdx = findLongestEdge(vertices);
  const nextIdx = (edgeIdx + 1) % vertices.length;

  // Get edge points
  const p1 = vertices[edgeIdx];
  const p2 = vertices[nextIdx];

  // Find the cut point on this edge
  const cutPoint1: TownPoint = {
    x: p1.x + (p2.x - p1.x) * ratio,
    y: p1.y + (p2.y - p1.y) * ratio,
  };

  // Find opposite edge (roughly)
  const oppEdgeIdx =
    (edgeIdx + Math.floor(vertices.length / 2)) % vertices.length;
  const oppNextIdx = (oppEdgeIdx + 1) % vertices.length;
  const p3 = vertices[oppEdgeIdx];
  const p4 = vertices[oppNextIdx];

  const cutPoint2: TownPoint = {
    x: p3.x + (p4.x - p3.x) * (1 - ratio),
    y: p3.y + (p4.y - p3.y) * (1 - ratio),
  };

  // Build two polygons
  const poly1: TownPoint[] = [];
  const poly2: TownPoint[] = [];

  // First polygon: from edge start to cut1, then cut2, then back
  for (let i = nextIdx; i !== oppNextIdx; i = (i + 1) % vertices.length) {
    poly1.push(vertices[i]);
  }
  poly1.push(cutPoint2);
  poly1.push(cutPoint1);

  // Second polygon: the rest
  for (let i = oppNextIdx; i !== nextIdx; i = (i + 1) % vertices.length) {
    poly2.push(vertices[i]);
  }
  poly2.push(cutPoint1);
  poly2.push(cutPoint2);

  // Validate polygons have enough vertices
  if (poly1.length < 3 || poly2.length < 3) return null;

  return [poly1, poly2];
}

// === Ward Type Assignment ===

/**
 * Assign ward types based on settlement sites
 * 1. First ward (center) -> "market" for plaza
 * 2. Match sites to wards based on SITE_TO_WARD
 * 3. Fill remaining with weighted random: residential (50%), craftsmen (30%), slum (20%)
 */
export function assignWardTypes(
  wards: TownWard[],
  sites: SettlementSite[],
  rng: SeededRandom
): void {
  if (wards.length === 0) return;

  // First ward (center) is always market for plaza
  wards[0].type = "market";

  // Track which wards have been assigned
  const assignedWards = new Set<number>([0]);

  // Match sites to wards based on SITE_TO_WARD mapping
  for (const site of sites) {
    const wardType = SITE_TO_WARD[site.type];
    if (!wardType) continue;

    // Find an unassigned ward
    for (let i = 1; i < wards.length; i++) {
      if (!assignedWards.has(i)) {
        wards[i].type = wardType;
        wards[i].siteId = site.id;
        assignedWards.add(i);
        break;
      }
    }
  }

  // Fill remaining wards with weighted random types
  // Using explicit entries to avoid Record<WardType, number> requirement
  const fillerTable = {
    entries: [
      { value: "residential" as WardType, weight: 50 },
      { value: "craftsmen" as WardType, weight: 30 },
      { value: "slum" as WardType, weight: 20 },
    ],
  };

  for (let i = 0; i < wards.length; i++) {
    if (!assignedWards.has(i)) {
      wards[i].type = rng.pickWeighted(fillerTable);
    }
  }
}

// === Building Subdivision ===

/**
 * Recursively subdivide a ward polygon into buildings
 * 1. Find longest edge of polygon
 * 2. Cut perpendicular at random ratio (0.3-0.7)
 * 3. Recurse until area < minArea
 * 4. Skip some cuts randomly (creates alleys)
 */
export function subdivideWard(
  polygon: TownPolygon,
  minArea: number,
  chaos: number,
  rng: SeededRandom
): TownBuilding[] {
  const buildings: TownBuilding[] = [];

  function subdivide(vertices: TownPoint[]): void {
    const area = polygonArea(vertices);

    // Base case: area is small enough for a building
    if (area < minArea) {
      buildings.push({
        id: nanoid(),
        shape: { vertices: [...vertices] },
        type: "house",
      });
      return;
    }

    // Randomly skip some cuts to create alleys/variation
    if (rng.next() < chaos * 0.3) {
      buildings.push({
        id: nanoid(),
        shape: { vertices: [...vertices] },
        type: "house",
      });
      return;
    }

    // Cut at random ratio between 0.3 and 0.7
    const ratio = 0.3 + rng.next() * 0.4;
    const split = splitPolygon(vertices, ratio);

    if (!split) {
      // Can't split, make it a building
      buildings.push({
        id: nanoid(),
        shape: { vertices: [...vertices] },
        type: "house",
      });
      return;
    }

    const [poly1, poly2] = split;

    // Recurse on both halves
    subdivide(poly1);
    subdivide(poly2);
  }

  subdivide(polygon.vertices);
  return buildings;
}

// === Wall Generation ===

/**
 * Find the outer vertices that form the perimeter of all wards
 */
function findOuterPerimeter(wards: TownWard[]): TownPoint[] {
  // Collect all vertices
  const allVertices: TownPoint[] = [];
  for (const ward of wards) {
    allVertices.push(...ward.shape.vertices);
  }

  if (allVertices.length === 0) return [];

  // Find centroid of all wards
  const center = polygonCentroid(allVertices);

  // Find the outermost vertices by distance from center
  // Sort by angle and keep the furthest per angle bucket
  const buckets: Map<number, TownPoint> = new Map();
  const bucketSize = Math.PI / 16; // 32 angle buckets

  for (const v of allVertices) {
    const angle = Math.atan2(v.y - center.y, v.x - center.x);
    const bucket = Math.floor((angle + Math.PI) / bucketSize);
    const dist = Math.sqrt((v.x - center.x) ** 2 + (v.y - center.y) ** 2);

    const existing = buckets.get(bucket);
    if (!existing) {
      buckets.set(bucket, v);
    } else {
      const existingDist = Math.sqrt(
        (existing.x - center.x) ** 2 + (existing.y - center.y) ** 2
      );
      if (dist > existingDist) {
        buckets.set(bucket, v);
      }
    }
  }

  // Sort by angle and return
  const perimeter = Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, v]) => v);

  return perimeter;
}

/**
 * Build defensive wall around inner wards
 * 1. Find outer circumference vertices of all inner wards
 * 2. Select 2-4 gate positions (spread around perimeter)
 * 3. Place towers at non-gate vertices
 */
export function buildWall(
  innerWards: TownWard[],
  rng: SeededRandom
): TownWall {
  const perimeter = findOuterPerimeter(innerWards);

  if (perimeter.length === 0) {
    return {
      shape: { vertices: [] },
      gates: [],
      towers: [],
    };
  }

  // Expand perimeter slightly for wall
  const center = polygonCentroid(perimeter);
  const expandedPerimeter = perimeter.map((v) => {
    const dx = v.x - center.x;
    const dy = v.y - center.y;
    const scale = 1.1; // 10% larger
    return {
      x: center.x + dx * scale,
      y: center.y + dy * scale,
    };
  });

  // Select 2-4 gate positions (spread around perimeter)
  const numGates = rng.between(2, 4);
  const gates: TownPoint[] = [];
  const gateIndices: Set<number> = new Set();

  for (let i = 0; i < numGates; i++) {
    const targetAngle = (i / numGates) * 2 * Math.PI + rng.next() * 0.3;
    let bestIdx = 0;
    let bestDiff = Infinity;

    for (let j = 0; j < expandedPerimeter.length; j++) {
      const v = expandedPerimeter[j];
      const angle = Math.atan2(v.y - center.y, v.x - center.x);
      let diff = Math.abs(angle - targetAngle + Math.PI);
      diff = Math.min(diff, 2 * Math.PI - diff);
      if (diff < bestDiff && !gateIndices.has(j)) {
        bestDiff = diff;
        bestIdx = j;
      }
    }

    gateIndices.add(bestIdx);
    gates.push(expandedPerimeter[bestIdx]);
  }

  // Place towers at non-gate vertices
  const towers: TownPoint[] = [];
  for (let i = 0; i < expandedPerimeter.length; i++) {
    if (!gateIndices.has(i)) {
      // Add tower at every 2-3 vertices
      if (rng.next() < 0.4) {
        towers.push(expandedPerimeter[i]);
      }
    }
  }

  return {
    shape: { vertices: expandedPerimeter },
    gates,
    towers,
  };
}

// === Street Generation ===

/**
 * Build streets from gates to town center
 * 1. For each gate, create a street path to center
 * 2. Use ward vertices as waypoints
 * 3. Assign width based on importance (main for gate roads)
 */
export function buildStreets(
  gates: TownPoint[],
  center: TownPoint,
  wards: TownWard[],
  rng: SeededRandom
): TownStreet[] {
  const streets: TownStreet[] = [];

  // Collect ward vertices as potential waypoints
  const wardVertices: TownPoint[] = [];
  for (const ward of wards) {
    wardVertices.push(...ward.shape.vertices);
  }

  // Create a main street from each gate to center
  for (const gate of gates) {
    const waypoints: TownPoint[] = [gate];

    // Find intermediate waypoints (ward vertices near the line to center)
    const dx = center.x - gate.x;
    const dy = center.y - gate.y;
    const totalDist = Math.sqrt(dx * dx + dy * dy);

    // Find 1-3 waypoints along the path
    const numWaypoints = rng.between(1, 3);
    const usedWaypoints: TownPoint[] = [];

    for (let w = 0; w < numWaypoints; w++) {
      const targetT = (w + 1) / (numWaypoints + 1);
      const targetX = gate.x + dx * targetT;
      const targetY = gate.y + dy * targetT;

      // Find nearest ward vertex to this target point
      let bestVertex: TownPoint | null = null;
      let bestDist = Infinity;

      for (const v of wardVertices) {
        const vdx = v.x - targetX;
        const vdy = v.y - targetY;
        const dist = Math.sqrt(vdx * vdx + vdy * vdy);

        // Check not already used
        const isUsed = usedWaypoints.some(
          (uv) => uv.x === v.x && uv.y === v.y
        );

        if (dist < bestDist && dist < totalDist * 0.3 && !isUsed) {
          bestDist = dist;
          bestVertex = v;
        }
      }

      if (bestVertex) {
        usedWaypoints.push(bestVertex);
      }
    }

    // Sort waypoints by distance from gate
    usedWaypoints.sort((a, b) => {
      const da = Math.sqrt((a.x - gate.x) ** 2 + (a.y - gate.y) ** 2);
      const db = Math.sqrt((b.x - gate.x) ** 2 + (b.y - gate.y) ** 2);
      return da - db;
    });

    waypoints.push(...usedWaypoints);
    waypoints.push(center);

    streets.push({
      id: nanoid(),
      waypoints,
      width: "main", // Gate roads are main streets
    });
  }

  return streets;
}

// === Input/Output Types ===

export interface TownLayoutInput {
  size: SettlementSize;
  sites: SettlementSite[];
}

export interface TownLayoutOutput {
  center: TownPoint;
  radius: number;
  wards: TownWard[];
  wall?: TownWall;
  streets: TownStreet[];
  plaza?: TownPolygon;
}

// === Main Generation Function ===

/**
 * Generate radial ward shapes (pie-slice sectors) for circular towns.
 * This creates naturally circular town boundaries.
 */
function generateRadialWards(
  nWards: number,
  center: TownPoint,
  radius: number,
  rng: SeededRandom
): TownPolygon[] {
  const wards: TownPolygon[] = [];

  // Determine layout based on ward count
  // For small counts: single ring
  // For larger counts: inner core + outer ring
  const hasInnerCore = nWards > 6;
  const innerRadius = hasInnerCore ? radius * 0.4 : 0;
  const coreWards = hasInnerCore ? Math.min(5, Math.floor(nWards * 0.3)) : 1;
  const outerWards = nWards - coreWards;

  // Generate inner core wards (smaller central area)
  if (hasInnerCore && coreWards > 1) {
    const coreAngleStep = (2 * Math.PI) / coreWards;
    for (let i = 0; i < coreWards; i++) {
      const startAngle = i * coreAngleStep + rng.next() * 0.1;
      const endAngle = (i + 1) * coreAngleStep + rng.next() * 0.1;

      // Create pie slice from center to inner radius
      const vertices: TownPoint[] = [
        { x: center.x, y: center.y },
      ];

      // Add arc points
      const arcSteps = 3;
      for (let j = 0; j <= arcSteps; j++) {
        const angle = startAngle + (endAngle - startAngle) * (j / arcSteps);
        vertices.push({
          x: center.x + Math.cos(angle) * innerRadius,
          y: center.y + Math.sin(angle) * innerRadius,
        });
      }

      wards.push({ vertices });
    }
  } else if (coreWards === 1) {
    // Single central plaza (circle approximation)
    const vertices: TownPoint[] = [];
    const circleSteps = 8;
    for (let i = 0; i < circleSteps; i++) {
      const angle = (i / circleSteps) * 2 * Math.PI;
      vertices.push({
        x: center.x + Math.cos(angle) * innerRadius,
        y: center.y + Math.sin(angle) * innerRadius,
      });
    }
    wards.push({ vertices });
  }

  // Generate outer ring wards
  const outerAngleStep = (2 * Math.PI) / outerWards;
  for (let i = 0; i < outerWards; i++) {
    const startAngle = i * outerAngleStep + rng.next() * 0.05;
    const endAngle = (i + 1) * outerAngleStep - rng.next() * 0.05;

    // Create ring segment from inner to outer radius
    const vertices: TownPoint[] = [];

    // Inner arc (from inner radius)
    const arcSteps = 3;
    for (let j = 0; j <= arcSteps; j++) {
      const angle = startAngle + (endAngle - startAngle) * (j / arcSteps);
      const r = hasInnerCore ? innerRadius : radius * 0.15;
      vertices.push({
        x: center.x + Math.cos(angle) * r,
        y: center.y + Math.sin(angle) * r,
      });
    }

    // Outer arc (from outer radius, reversed)
    for (let j = arcSteps; j >= 0; j--) {
      const angle = startAngle + (endAngle - startAngle) * (j / arcSteps);
      vertices.push({
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius,
      });
    }

    wards.push({ vertices });
  }

  return wards;
}

/**
 * Generate a complete town layout with wards, buildings, walls, and streets
 *
 * Process:
 * 1. Get ward count from WARD_COUNTS[size]
 * 2. hasWalls = size === "town" || size === "city"
 * 3. Generate radial ward shapes for circular towns
 * 4. Assign ward types based on sites
 * 5. Subdivide wards into buildings
 * 6. Build wall if hasWalls
 * 7. Build streets from gates to center
 * 8. Return { center, radius, wards, wall, streets, plaza }
 */
export function generateTownLayout(
  settlement: TownLayoutInput,
  rng: SeededRandom
): TownLayoutOutput {
  const { size, sites } = settlement;

  // 1. Get ward count from size
  const nWards = WARD_COUNTS[size];

  // 2. Calculate town radius based on size
  const baseRadius = 30 + nWards * 3;
  const townRadius = baseRadius * (0.9 + rng.next() * 0.2);
  const center: TownPoint = { x: 0, y: 0 };

  // 4. Generate radial ward shapes
  const wardShapes = generateRadialWards(nWards, center, townRadius, rng);

  // 5. Create ward objects
  const wards: TownWard[] = wardShapes.map((shape) => ({
    id: nanoid(),
    type: "residential" as WardType,
    shape,
    buildings: [],
  }));

  // 6. Assign ward types based on sites
  assignWardTypes(wards, sites, rng);

  // 7. Subdivide wards into buildings
  const minBuildingArea = size === "city" ? 50 : size === "town" ? 80 : 120;
  const chaos = size === "city" ? 0.2 : size === "town" ? 0.3 : 0.4;

  for (const ward of wards) {
    ward.buildings = subdivideWard(ward.shape, minBuildingArea, chaos, rng);
  }

  // 8. Create entry points for streets (no walls)
  const numEntries = rng.between(3, 5);
  const gates: TownPoint[] = [];
  for (let i = 0; i < numEntries; i++) {
    const angle = (i / numEntries) * 2 * Math.PI + rng.next() * 0.3;
    gates.push({
      x: center.x + Math.cos(angle) * townRadius,
      y: center.y + Math.sin(angle) * townRadius,
    });
  }

  // 9. Build streets from entry points to center
  const streets = buildStreets(gates, center, wards, rng);

  // 10. Create plaza from center ward
  const plaza: TownPolygon | undefined =
    wards.length > 0 ? { vertices: [...wards[0].shape.vertices] } : undefined;

  return {
    center,
    radius: townRadius,
    wards,
    wall: undefined, // No walls
    streets,
    plaza,
  };
}
