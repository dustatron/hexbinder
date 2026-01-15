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
import { generateStreetFirstTown, type PlacedBuilding } from "./StreetFirstTownGenerator";

// === Ward Block Parameters ===

/**
 * Parameters controlling building generation per ward type.
 * Based on watabou's district-specific layout approach.
 */
export interface BlockParams {
  gridRegularity: number;   // 0-1: organic to grid layout
  buildingDensity: number;  // 0-1: sparse to packed
  minBuildingSize: number;  // Min footprint area
  maxBuildingSize: number;  // Max footprint area
  alleyWidth: number;       // Gap between buildings (in units)
}

export const WARD_PARAMS: Record<WardType, BlockParams> = {
  market: {
    gridRegularity: 0.7,
    buildingDensity: 0.5,
    minBuildingSize: 80,    // MUCH larger buildings
    maxBuildingSize: 200,
    alleyWidth: 6,          // Wide alleys for visibility
  },
  residential: {
    gridRegularity: 0.5,
    buildingDensity: 0.45,
    minBuildingSize: 60,
    maxBuildingSize: 150,
    alleyWidth: 5,
  },
  slum: {
    gridRegularity: 0.2,
    buildingDensity: 0.55,
    minBuildingSize: 40,
    maxBuildingSize: 100,
    alleyWidth: 4,
  },
  craftsmen: {
    gridRegularity: 0.6,
    buildingDensity: 0.4,
    minBuildingSize: 100,
    maxBuildingSize: 250,
    alleyWidth: 8,
  },
  temple: {
    gridRegularity: 0.8,
    buildingDensity: 0.25,
    minBuildingSize: 200,
    maxBuildingSize: 500,
    alleyWidth: 12,
  },
  castle: {
    gridRegularity: 0.9,
    buildingDensity: 0.3,
    minBuildingSize: 180,
    maxBuildingSize: 600,
    alleyWidth: 10,
  },
  merchant: {
    gridRegularity: 0.7,
    buildingDensity: 0.45,
    minBuildingSize: 70,
    maxBuildingSize: 180,
    alleyWidth: 6,
  },
  tavern: {
    gridRegularity: 0.4,
    buildingDensity: 0.4,
    minBuildingSize: 60,
    maxBuildingSize: 160,
    alleyWidth: 5,
  },
  park: {
    gridRegularity: 0.3,
    buildingDensity: 0.08,
    minBuildingSize: 50,
    maxBuildingSize: 120,
    alleyWidth: 15,
  },
};

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
 * Generate points distributed across the area for ward seeds.
 * Uses golden angle for even distribution.
 */
export function generateSpiralPoints(
  nPoints: number,
  rng: SeededRandom
): TownPoint[] {
  const points: TownPoint[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5 degrees
  const startAngle = rng.next() * 2 * Math.PI;

  for (let i = 0; i < nPoints; i++) {
    // Sunflower seed pattern - more even distribution
    const angle = startAngle + i * goldenAngle;
    // Radius grows with sqrt for even area distribution
    const r = i === 0 ? 0 : Math.sqrt(i / nPoints) * 10 + rng.next() * 2;
    points.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
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
 * Inset a polygon by a fixed margin (for alleys between buildings)
 */
function insetPolygon(vertices: TownPoint[], margin: number): TownPoint[] {
  if (vertices.length < 3 || margin <= 0) return vertices;

  const centroid = polygonCentroid(vertices);
  return vertices.map((v) => {
    const dx = v.x - centroid.x;
    const dy = v.y - centroid.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < margin * 2) return v; // Too small to inset
    const scale = (dist - margin) / dist;
    return {
      x: centroid.x + dx * scale,
      y: centroid.y + dy * scale,
    };
  });
}

/**
 * Convert arbitrary polygon to inscribed rectangle.
 * Creates more realistic rectangular building footprints.
 */
function inscribeRectangle(vertices: TownPoint[], rng: SeededRandom): TownPoint[] {
  if (vertices.length < 3) return vertices;

  // Find bounding box
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  for (const v of vertices) {
    minX = Math.min(minX, v.x);
    maxX = Math.max(maxX, v.x);
    minY = Math.min(minY, v.y);
    maxY = Math.max(maxY, v.y);
  }

  // Inset the rectangle significantly from bounding box for visible gaps
  // Larger inset = more white space between buildings (watabou style)
  const inset = Math.min(maxX - minX, maxY - minY) * 0.25;
  minX += inset;
  maxX -= inset;
  minY += inset;
  maxY -= inset;

  // Add slight variation for organic feel
  const variation = (maxX - minX) * 0.05;
  const dx = (rng.next() - 0.5) * variation;
  const dy = (rng.next() - 0.5) * variation;

  return [
    { x: minX + dx, y: minY + dy },
    { x: maxX + dx, y: minY - dy },
    { x: maxX - dx, y: maxY - dy },
    { x: minX - dx, y: maxY + dy },
  ];
}

/**
 * Generate L-shaped building for larger lots
 */
function generateLShapedBuilding(vertices: TownPoint[], rng: SeededRandom): TownPoint[] {
  // Get bounding rectangle first
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  for (const v of vertices) {
    minX = Math.min(minX, v.x);
    maxX = Math.max(maxX, v.x);
    minY = Math.min(minY, v.y);
    maxY = Math.max(maxY, v.y);
  }

  const w = maxX - minX;
  const h = maxY - minY;

  // L-shape cuts out one corner
  const cutRatio = 0.3 + rng.next() * 0.2; // 30-50% of width/height
  const corner = rng.between(0, 3); // Which corner to cut

  const cx = minX + w * (corner % 2 === 0 ? cutRatio : 1 - cutRatio);
  const cy = minY + h * (corner < 2 ? cutRatio : 1 - cutRatio);

  // Generate L-shape vertices (6 points)
  switch (corner) {
    case 0: // Top-left
      return [
        { x: cx, y: minY }, { x: maxX, y: minY }, { x: maxX, y: maxY },
        { x: minX, y: maxY }, { x: minX, y: cy }, { x: cx, y: cy },
      ];
    case 1: // Top-right
      return [
        { x: minX, y: minY }, { x: cx, y: minY }, { x: cx, y: cy },
        { x: maxX, y: cy }, { x: maxX, y: maxY }, { x: minX, y: maxY },
      ];
    case 2: // Bottom-left
      return [
        { x: minX, y: minY }, { x: maxX, y: minY }, { x: maxX, y: maxY },
        { x: cx, y: maxY }, { x: cx, y: cy }, { x: minX, y: cy },
      ];
    default: // Bottom-right
      return [
        { x: minX, y: minY }, { x: maxX, y: minY }, { x: maxX, y: cy },
        { x: cx, y: cy }, { x: cx, y: maxY }, { x: minX, y: maxY },
      ];
  }
}

/**
 * Check if polygon has reasonable aspect ratio (not too elongated)
 */
function getAspectRatio(vertices: TownPoint[]): number {
  if (vertices.length < 3) return 1;

  // Find bounding box
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  for (const v of vertices) {
    minX = Math.min(minX, v.x);
    maxX = Math.max(maxX, v.x);
    minY = Math.min(minY, v.y);
    maxY = Math.max(maxY, v.y);
  }

  const width = maxX - minX;
  const height = maxY - minY;
  if (width === 0 || height === 0) return 1;

  return Math.max(width / height, height / width);
}

/**
 * Improved polygon split - cuts along shorter axis for better aspect ratios
 */
function splitPolygonImproved(
  vertices: TownPoint[],
  ratio: number,
  rng: SeededRandom
): [TownPoint[], TownPoint[]] | null {
  if (vertices.length < 3) return null;

  // Find bounding box to determine orientation
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  for (const v of vertices) {
    minX = Math.min(minX, v.x);
    maxX = Math.max(maxX, v.x);
    minY = Math.min(minY, v.y);
    maxY = Math.max(maxY, v.y);
  }

  const width = maxX - minX;
  const height = maxY - minY;

  // Cut perpendicular to longer axis (to create squarer pieces)
  const cutHorizontally = width > height;
  const cutPos = cutHorizontally
    ? minY + height * ratio
    : minX + width * ratio;

  const above: TownPoint[] = [];
  const below: TownPoint[] = [];

  for (let i = 0; i < vertices.length; i++) {
    const curr = vertices[i];
    const next = vertices[(i + 1) % vertices.length];

    const currVal = cutHorizontally ? curr.y : curr.x;
    const nextVal = cutHorizontally ? next.y : next.x;

    const currAbove = currVal >= cutPos;
    const nextAbove = nextVal >= cutPos;

    if (currAbove) {
      above.push(curr);
    } else {
      below.push(curr);
    }

    // Add intersection point if edge crosses cut line
    if (currAbove !== nextAbove) {
      const t = (cutPos - currVal) / (nextVal - currVal);
      const intersection: TownPoint = {
        x: curr.x + t * (next.x - curr.x),
        y: curr.y + t * (next.y - curr.y),
      };
      above.push(intersection);
      below.push(intersection);
    }
  }

  if (above.length < 3 || below.length < 3) return null;

  return [above, below];
}

/**
 * Recursively subdivide a ward polygon into buildings.
 * Improved algorithm for denser, more regular building layouts.
 *
 * 1. Inset ward boundary for street margin
 * 2. Cut along shorter axis for squarer buildings
 * 3. Recurse until area < minArea or aspect ratio is good
 * 4. Apply final inset to each building for alley gaps
 */
export function subdivideWard(
  polygon: TownPolygon,
  minArea: number,
  chaos: number,
  rng: SeededRandom
): TownBuilding[] {
  const buildings: TownBuilding[] = [];
  const alleyMargin = 8; // MUCH bigger gap between buildings

  // Inset the ward boundary first (creates street margin)
  const wardMargin = 8;
  const insetVertices = insetPolygon(polygon.vertices, wardMargin);

  const maxBuildings = 4; // Limit buildings per ward for clear visibility

  function subdivide(vertices: TownPoint[], depth: number): void {
    // Stop if we have enough buildings
    if (buildings.length >= maxBuildings) return;

    const area = polygonArea(vertices);
    const aspectRatio = getAspectRatio(vertices);

    // Base cases for creating a building - stop MUCH earlier
    const tooSmall = area < minArea;
    const goodShape = area < minArea * 2 && aspectRatio < 2;
    const tooDeep = depth > 2; // Max 4 subdivisions (2^2)
    const randomStop = rng.next() < 0.3 && area < minArea * 3; // Stop more often

    if (tooSmall || goodShape || tooDeep || randomStop) {
      // Generate building footprint from lot
      let buildingVertices: TownPoint[];

      // Larger buildings occasionally get L-shapes
      if (area > minArea * 5 && rng.next() < 0.15) {
        buildingVertices = generateLShapedBuilding(vertices, rng);
      } else {
        // Most buildings are rectangular
        buildingVertices = inscribeRectangle(vertices, rng);
      }

      // Apply final inset for alley gap
      buildingVertices = insetPolygon(buildingVertices, alleyMargin);
      const buildingArea = polygonArea(buildingVertices);

      // Only add if building is large enough
      if (buildingArea > minArea * 0.3 && buildingVertices.length >= 3) {
        buildings.push({
          id: nanoid(),
          shape: { vertices: buildingVertices },
          type: "house",
        });
      }
      return;
    }

    // Cut at slightly random ratio for variation
    const baseRatio = 0.4 + rng.next() * 0.2; // 0.4-0.6 for more even splits
    const split = splitPolygonImproved(vertices, baseRatio, rng);

    if (!split) {
      // Can't split, try to make a rectangular building
      let buildingVertices = inscribeRectangle(vertices, rng);
      buildingVertices = insetPolygon(buildingVertices, alleyMargin);
      if (polygonArea(buildingVertices) > minArea * 0.3) {
        buildings.push({
          id: nanoid(),
          shape: { vertices: buildingVertices },
          type: "house",
        });
      }
      return;
    }

    const [poly1, poly2] = split;

    // Recurse on both halves
    subdivide(poly1, depth + 1);
    subdivide(poly2, depth + 1);
  }

  subdivide(insetVertices, 0);
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
 * Generate an irregular boundary shape (not a perfect circle).
 * Uses perlin-like noise to create organic town outlines.
 */
function generateIrregularBoundary(
  center: TownPoint,
  baseRadius: number,
  numPoints: number,
  irregularity: number,
  rng: SeededRandom
): TownPoint[] {
  const vertices: TownPoint[] = [];

  // Generate random offsets for each angle segment
  const offsets: number[] = [];
  for (let i = 0; i < numPoints; i++) {
    offsets.push((rng.next() - 0.5) * 2 * irregularity);
  }

  // Smooth the offsets (simple averaging)
  const smoothed: number[] = [];
  for (let i = 0; i < numPoints; i++) {
    const prev = offsets[(i - 1 + numPoints) % numPoints];
    const curr = offsets[i];
    const next = offsets[(i + 1) % numPoints];
    smoothed.push((prev + curr * 2 + next) / 4);
  }

  // Generate boundary points
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const r = baseRadius * (1 + smoothed[i]);
    vertices.push({
      x: center.x + Math.cos(angle) * r,
      y: center.y + Math.sin(angle) * r,
    });
  }

  return vertices;
}

/**
 * Check if a point is inside a polygon (ray casting)
 */
function pointInPolygon(point: TownPoint, polygon: TownPoint[]): boolean {
  let inside = false;
  const n = polygon.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;

    if (((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Clip polygon to boundary using Sutherland-Hodgman algorithm (simplified)
 */
function clipPolygonToBoundary(
  polygon: TownPoint[],
  boundary: TownPoint[]
): TownPoint[] {
  if (polygon.length < 3) return polygon;

  // Simple approach: keep vertices inside, project outside vertices to boundary
  const result: TownPoint[] = [];
  const center = polygonCentroid(boundary);

  for (const v of polygon) {
    if (pointInPolygon(v, boundary)) {
      result.push(v);
    } else {
      // Project to nearest boundary point
      let minDist = Infinity;
      let nearest: TownPoint = v;

      for (let i = 0; i < boundary.length; i++) {
        const b1 = boundary[i];
        const b2 = boundary[(i + 1) % boundary.length];

        // Find closest point on edge
        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const t = Math.max(0, Math.min(1,
          ((v.x - b1.x) * dx + (v.y - b1.y) * dy) / (dx * dx + dy * dy)
        ));
        const proj = { x: b1.x + t * dx, y: b1.y + t * dy };
        const dist = Math.sqrt((v.x - proj.x) ** 2 + (v.y - proj.y) ** 2);

        if (dist < minDist) {
          minDist = dist;
          nearest = proj;
        }
      }

      result.push(nearest);
    }
  }

  return result.length >= 3 ? result : polygon;
}

/**
 * Generate organic ward shapes using Voronoi diagram.
 * Clips cells to irregular boundary for natural town outline.
 */
function generateVoronoiWards(
  nWards: number,
  center: TownPoint,
  radius: number,
  rng: SeededRandom
): TownPolygon[] {
  // Generate irregular town boundary
  const boundaryPoints = 16 + Math.floor(nWards / 2);
  const irregularity = 0.15 + rng.next() * 0.1; // 15-25% variation
  const townBoundary = generateIrregularBoundary(
    center, radius, boundaryPoints, irregularity, rng
  );

  // Create Voronoi with bounds slightly larger than town
  const bounds = {
    minX: center.x - radius * 1.3,
    minY: center.y - radius * 1.3,
    maxX: center.x + radius * 1.3,
    maxY: center.y + radius * 1.3,
  };

  const voronoi = new Voronoi(bounds, rng);

  // Add seed points - spiral pattern for more organic distribution
  const seedPoints = generateSpiralPoints(nWards, rng);

  // Scale and center the seed points
  const maxDist = Math.max(...seedPoints.map(p =>
    Math.sqrt(p.x * p.x + p.y * p.y)
  ));
  const scale = maxDist > 0 ? (radius * 0.7) / maxDist : 1;

  for (const sp of seedPoints) {
    voronoi.addPoint({
      x: center.x + sp.x * scale,
      y: center.y + sp.y * scale,
    });
  }

  // Relax for smoother cells
  voronoi.relax(2);

  // Get Voronoi regions and clip to town boundary
  const regions = voronoi.getRegions();
  const wards: TownPolygon[] = [];

  for (const region of regions) {
    if (region.vertices.length < 3) continue;

    // Check if region centroid is reasonably within town area
    const centroid = polygonCentroid(region.vertices);
    const distFromCenter = Math.sqrt(
      (centroid.x - center.x) ** 2 + (centroid.y - center.y) ** 2
    );

    // Include if centroid is within 120% of radius (allow some outside)
    if (distFromCenter > radius * 1.2) continue;

    // Clip region to town boundary
    const clipped = clipPolygonToBoundary(region.vertices, townBoundary);

    // Include if we have a valid polygon with sufficient area
    const area = polygonArea(clipped);
    if (clipped.length >= 3 && area > 50) {
      wards.push({ vertices: clipped });
    }
  }

  // Sort by distance from center (center wards first)
  wards.sort((a, b) => {
    const ca = polygonCentroid(a.vertices);
    const cb = polygonCentroid(b.vertices);
    const da = Math.sqrt((ca.x - center.x) ** 2 + (ca.y - center.y) ** 2);
    const db = Math.sqrt((cb.x - center.x) ** 2 + (cb.y - center.y) ** 2);
    return da - db;
  });

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

  // Use street-first generator for better town layouts
  const streetFirstResult = generateStreetFirstTown(size, rng);

  // Map landmark name to site type for matching
  const landmarkToSiteType: Record<string, SiteType> = {
    "Temple": "temple",
    "Tavern": "tavern",
    "Market": "market",
    "Town Hall": "guild_hall",
    "Blacksmith": "blacksmith",
    "Inn": "inn",
    "General Store": "general_store",
    "Noble Estate": "noble_estate",
  };

  // Track which sites have been assigned to landmarks
  const usedSiteIds = new Set<string>();

  // Convert PlacedBuilding to TownBuilding, linking landmarks to sites
  const convertLandmark = (b: PlacedBuilding): TownBuilding => {
    let siteId: string | undefined;

    // Try to match this landmark to a site by type
    if (b.name) {
      const expectedSiteType = landmarkToSiteType[b.name];
      const matchingSite = sites.find((s) =>
        !usedSiteIds.has(s.id) && (
          s.type === expectedSiteType ||
          s.name.toLowerCase().includes(b.name!.toLowerCase())
        )
      );
      if (matchingSite) {
        siteId = matchingSite.id;
        usedSiteIds.add(matchingSite.id);
      }
    }

    return {
      id: b.id,
      shape: { vertices: b.vertices },
      type: "landmark",
      siteId,
      name: b.name,
      icon: b.icon,
    };
  };

  const convertHouse = (b: PlacedBuilding): TownBuilding => ({
    id: b.id,
    shape: { vertices: b.vertices },
    type: "house",
  });

  // Convert all buildings - landmarks first so they get site priority
  const landmarkBuildings = streetFirstResult.landmarks.map(convertLandmark);
  const houseBuildings = streetFirstResult.buildings.map(convertHouse);
  const allBuildings = [...landmarkBuildings, ...houseBuildings];

  // Create bounding box for all buildings as ward shape
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  for (const b of allBuildings) {
    for (const v of b.shape.vertices) {
      minX = Math.min(minX, v.x);
      maxX = Math.max(maxX, v.x);
      minY = Math.min(minY, v.y);
      maxY = Math.max(maxY, v.y);
    }
  }

  // Pad the bounding box
  const padding = 10;
  minX -= padding;
  maxX += padding;
  minY -= padding;
  maxY += padding;

  const wardShape: TownPolygon = {
    vertices: [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY },
    ],
  };

  // Create a single ward containing all buildings
  const mainWard: TownWard = {
    id: nanoid(),
    type: "residential",
    shape: wardShape,
    buildings: allBuildings,
  };

  return {
    center: streetFirstResult.center,
    radius: streetFirstResult.radius,
    wards: [mainWard],
    wall: undefined,
    streets: streetFirstResult.streets,
    plaza: streetFirstResult.plaza,
  };
}

/**
 * Assign NPCs to buildings in a spatial settlement.
 * - Site owners/staff → assigned to their site's building (via siteId)
 * - Travelers (no siteId) → assigned to inn building
 * - Residents → assigned to house buildings
 */
export function assignNPCsToBuildings(
  settlement: {
    wards: TownWard[];
    sites: { id: string; type: SiteType; ownerId?: string; staffIds: string[] }[];
    npcIds: string[];
  },
  npcs: { id: string; siteId?: string }[]
): void {
  const allBuildings = settlement.wards.flatMap((w) => w.buildings);
  const houses = allBuildings.filter((b) => b.type === "house");
  const landmarks = allBuildings.filter((b) => b.type === "landmark");

  // Find inn building
  const innBuilding = landmarks.find((b) => b.siteId &&
    settlement.sites.find((s) => s.id === b.siteId && s.type === "inn")
  );

  // Build set of NPC IDs who work at a site
  const siteWorkerIds = new Set<string>();
  for (const site of settlement.sites) {
    if (site.ownerId) siteWorkerIds.add(site.ownerId);
    for (const staffId of site.staffIds) siteWorkerIds.add(staffId);
  }

  // Assign site workers to their building
  for (const building of landmarks) {
    if (!building.siteId) continue;
    const site = settlement.sites.find((s) => s.id === building.siteId);
    if (!site) continue;

    const workerIds: string[] = [];
    if (site.ownerId) workerIds.push(site.ownerId);
    workerIds.push(...site.staffIds);

    building.npcIds = workerIds;
  }

  // Get remaining NPCs (not assigned to sites)
  const settlementNpcIds = settlement.npcIds;
  const unassignedNpcIds = settlementNpcIds.filter((id) => !siteWorkerIds.has(id));

  // Check if NPC is a traveler (has siteId pointing to inn/tavern)
  const travelerIds: string[] = [];
  const residentIds: string[] = [];

  for (const npcId of unassignedNpcIds) {
    const npc = npcs.find((n) => n.id === npcId);
    if (npc?.siteId) {
      const site = settlement.sites.find((s) => s.id === npc.siteId);
      if (site && (site.type === "inn" || site.type === "tavern")) {
        travelerIds.push(npcId);
        continue;
      }
    }
    residentIds.push(npcId);
  }

  // Assign travelers to inn
  if (innBuilding && travelerIds.length > 0) {
    innBuilding.npcIds = [...(innBuilding.npcIds || []), ...travelerIds];
  }

  // Assign residents to houses (distribute evenly)
  if (houses.length > 0 && residentIds.length > 0) {
    for (let i = 0; i < residentIds.length; i++) {
      const house = houses[i % houses.length];
      if (!house.npcIds) house.npcIds = [];
      house.npcIds.push(residentIds[i]);
    }
  }
}

/**
 * Link sites to landmark buildings after sites are generated.
 * Call this when sites are generated separately from layout generation.
 */
export function linkSitesToBuildings(
  settlement: {
    wards: TownWard[];
    sites: { id: string; type: SiteType; name: string }[];
  }
): void {
  // Map building names to site types for matching
  const landmarkToSiteType: Record<string, SiteType> = {
    "Temple": "temple",
    "Tavern": "tavern",
    "Market": "market",
    "Town Hall": "guild_hall",
    "Blacksmith": "blacksmith",
    "Inn": "inn",
    "General Store": "general_store",
    "Noble Estate": "noble_estate",
  };

  // Map site type to expected icon for landmarks
  const siteTypeToIcon: Record<SiteType, string> = {
    temple: "⛪",
    tavern: "🍺",
    market: "🏪",
    guild_hall: "🏛️",
    blacksmith: "⚒️",
    inn: "🏨",
    general_store: "🏪",
    noble_estate: "🏰",
  };

  const usedSiteIds = new Set<string>();
  const allBuildings = settlement.wards.flatMap((w) => w.buildings);
  const landmarks = allBuildings.filter((b) => b.type === "landmark");

  for (const building of landmarks) {
    // Skip if already linked
    if (building.siteId) continue;

    // Try to match by building name to site type
    if (building.name) {
      const expectedSiteType = landmarkToSiteType[building.name];
      const matchingSite = settlement.sites.find((s) =>
        !usedSiteIds.has(s.id) && (
          s.type === expectedSiteType ||
          s.name.toLowerCase().includes(building.name!.toLowerCase())
        )
      );
      if (matchingSite) {
        building.siteId = matchingSite.id;
        building.icon = siteTypeToIcon[matchingSite.type];
        usedSiteIds.add(matchingSite.id);
      }
    }
  }
}

/** Map site type to ward type */
function getSiteWardType(siteType?: SiteType): WardType {
  if (!siteType) return "residential";
  const mapping: Partial<Record<SiteType, WardType>> = {
    temple: "temple",
    tavern: "tavern",
    inn: "tavern",
    blacksmith: "craftsmen",
    market: "market",
    general_store: "market",
    guild_hall: "merchant",
    noble_estate: "castle",
  };
  return mapping[siteType] ?? "residential";
}
