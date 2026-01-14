import { SeededRandom } from "./SeededRandom";

/**
 * 2D Point interface
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Triangle defined by three vertex indices
 */
export interface Triangle {
  a: number;
  b: number;
  c: number;
}

/**
 * Edge defined by two vertex indices
 */
export interface Edge {
  p1: number;
  p2: number;
}

/**
 * Voronoi cell (region) for a point
 */
export interface VoronoiCell {
  site: Point;
  siteIndex: number;
  vertices: Point[];
}

/**
 * Circumcircle of a triangle
 */
interface Circumcircle {
  center: Point;
  radiusSquared: number;
}

/**
 * Voronoi diagram generator using Delaunay triangulation via Bowyer-Watson algorithm.
 * Useful for organic region generation (town districts, territory boundaries, etc.)
 */
export class Voronoi {
  private points: Point[] = [];
  private triangles: Triangle[] = [];
  private superTriangleIndices: [number, number, number] = [-1, -1, -1];
  private bounds: { minX: number; minY: number; maxX: number; maxY: number };

  constructor(
    bounds: { minX: number; minY: number; maxX: number; maxY: number },
    private rng?: SeededRandom
  ) {
    this.bounds = bounds;
    this.initializeSuperTriangle();
  }

  /**
   * Create super-triangle that contains all possible points within bounds
   */
  private initializeSuperTriangle(): void {
    const { minX, minY, maxX, maxY } = this.bounds;
    const dx = maxX - minX;
    const dy = maxY - minY;
    const dmax = Math.max(dx, dy) * 2;
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    // Super-triangle vertices (far outside bounds)
    const p0: Point = { x: midX - dmax * 2, y: midY - dmax };
    const p1: Point = { x: midX, y: midY + dmax * 2 };
    const p2: Point = { x: midX + dmax * 2, y: midY - dmax };

    this.points.push(p0, p1, p2);
    this.superTriangleIndices = [0, 1, 2];
    this.triangles.push({ a: 0, b: 1, c: 2 });
  }

  /**
   * Calculate circumcircle of a triangle
   */
  private getCircumcircle(t: Triangle): Circumcircle {
    const p1 = this.points[t.a];
    const p2 = this.points[t.b];
    const p3 = this.points[t.c];

    const ax = p2.x - p1.x;
    const ay = p2.y - p1.y;
    const bx = p3.x - p1.x;
    const by = p3.y - p1.y;

    const d = 2 * (ax * by - ay * bx);

    // Handle degenerate case (collinear points)
    if (Math.abs(d) < 1e-10) {
      return {
        center: { x: p1.x, y: p1.y },
        radiusSquared: Infinity,
      };
    }

    const aSq = ax * ax + ay * ay;
    const bSq = bx * bx + by * by;

    const cx = p1.x + (by * aSq - ay * bSq) / d;
    const cy = p1.y + (ax * bSq - bx * aSq) / d;

    const dx = cx - p1.x;
    const dy = cy - p1.y;

    return {
      center: { x: cx, y: cy },
      radiusSquared: dx * dx + dy * dy,
    };
  }

  /**
   * Check if point is inside triangle's circumcircle
   */
  private isInCircumcircle(point: Point, triangle: Triangle): boolean {
    const circle = this.getCircumcircle(triangle);
    const dx = point.x - circle.center.x;
    const dy = point.y - circle.center.y;
    return dx * dx + dy * dy < circle.radiusSquared;
  }

  /**
   * Check if two edges are equal (order-independent)
   */
  private edgesEqual(e1: Edge, e2: Edge): boolean {
    return (
      (e1.p1 === e2.p1 && e1.p2 === e2.p2) ||
      (e1.p1 === e2.p2 && e1.p2 === e2.p1)
    );
  }

  /**
   * Add a point using Bowyer-Watson algorithm
   */
  addPoint(p: Point): number {
    const pointIndex = this.points.length;
    this.points.push(p);

    // Find all triangles whose circumcircle contains the new point
    const badTriangles: Triangle[] = [];
    const goodTriangles: Triangle[] = [];

    for (const t of this.triangles) {
      if (this.isInCircumcircle(p, t)) {
        badTriangles.push(t);
      } else {
        goodTriangles.push(t);
      }
    }

    // Find boundary edges of the cavity (edges not shared by bad triangles)
    const boundaryEdges: Edge[] = [];

    for (const t of badTriangles) {
      const edges: Edge[] = [
        { p1: t.a, p2: t.b },
        { p1: t.b, p2: t.c },
        { p1: t.c, p2: t.a },
      ];

      for (const edge of edges) {
        // Check if this edge is shared with another bad triangle
        let isShared = false;
        for (const other of badTriangles) {
          if (other === t) continue;
          const otherEdges: Edge[] = [
            { p1: other.a, p2: other.b },
            { p1: other.b, p2: other.c },
            { p1: other.c, p2: other.a },
          ];
          for (const oe of otherEdges) {
            if (this.edgesEqual(edge, oe)) {
              isShared = true;
              break;
            }
          }
          if (isShared) break;
        }

        if (!isShared) {
          boundaryEdges.push(edge);
        }
      }
    }

    // Create new triangles from boundary edges to new point
    const newTriangles: Triangle[] = [];
    for (const edge of boundaryEdges) {
      newTriangles.push({
        a: edge.p1,
        b: edge.p2,
        c: pointIndex,
      });
    }

    // Replace triangulation
    this.triangles = [...goodTriangles, ...newTriangles];

    return pointIndex;
  }

  /**
   * Add multiple random points within bounds
   */
  addRandomPoints(count: number): void {
    if (!this.rng) {
      throw new Error("SeededRandom required for random point generation");
    }

    const { minX, minY, maxX, maxY } = this.bounds;
    for (let i = 0; i < count; i++) {
      const x = this.rng.float(minX, maxX);
      const y = this.rng.float(minY, maxY);
      this.addPoint({ x, y });
    }
  }

  /**
   * Get the Delaunay triangles (excluding super-triangle vertices)
   */
  getTriangles(): Triangle[] {
    const [s0, s1, s2] = this.superTriangleIndices;
    return this.triangles.filter((t) => {
      return (
        t.a !== s0 &&
        t.a !== s1 &&
        t.a !== s2 &&
        t.b !== s0 &&
        t.b !== s1 &&
        t.b !== s2 &&
        t.c !== s0 &&
        t.c !== s1 &&
        t.c !== s2
      );
    });
  }

  /**
   * Get all points (excluding super-triangle vertices)
   */
  getPoints(): Point[] {
    return this.points.slice(3); // Skip first 3 (super-triangle)
  }

  /**
   * Get user point index (adjusted for super-triangle offset)
   */
  private getUserPointIndex(internalIndex: number): number {
    return internalIndex - 3;
  }

  /**
   * Get Voronoi cell polygons from circumcenters
   */
  getRegions(): VoronoiCell[] {
    const cells: VoronoiCell[] = [];
    const [s0, s1, s2] = this.superTriangleIndices;

    // Build adjacency: for each point, list triangles that contain it
    const pointTriangles: Map<number, Triangle[]> = new Map();

    for (const t of this.triangles) {
      for (const idx of [t.a, t.b, t.c]) {
        if (!pointTriangles.has(idx)) {
          pointTriangles.set(idx, []);
        }
        pointTriangles.get(idx)!.push(t);
      }
    }

    // For each user point (skip super-triangle vertices)
    for (let i = 3; i < this.points.length; i++) {
      const adjacentTriangles = pointTriangles.get(i) || [];

      // Skip if point touches super-triangle (infinite cell)
      const touchesSuperTriangle = adjacentTriangles.some(
        (t) =>
          t.a === s0 ||
          t.a === s1 ||
          t.a === s2 ||
          t.b === s0 ||
          t.b === s1 ||
          t.b === s2 ||
          t.c === s0 ||
          t.c === s1 ||
          t.c === s2
      );

      if (touchesSuperTriangle || adjacentTriangles.length < 3) {
        // Create clipped cell at boundary
        const clippedVertices = this.createClippedCell(i, adjacentTriangles);
        if (clippedVertices.length >= 3) {
          cells.push({
            site: this.points[i],
            siteIndex: this.getUserPointIndex(i),
            vertices: clippedVertices,
          });
        }
        continue;
      }

      // Get circumcenters as Voronoi vertices, clipped to bounds
      const { minX, minY, maxX, maxY } = this.bounds;
      const circumcenters: Point[] = adjacentTriangles.map((t) => {
        const cc = this.getCircumcircle(t).center;
        // Clip circumcenters to bounds to prevent wild stretching
        return {
          x: Math.max(minX, Math.min(maxX, cc.x)),
          y: Math.max(minY, Math.min(maxY, cc.y)),
        };
      });

      // Sort circumcenters in angular order around the site
      const site = this.points[i];
      circumcenters.sort((a, b) => {
        const angleA = Math.atan2(a.y - site.y, a.x - site.x);
        const angleB = Math.atan2(b.y - site.y, b.x - site.x);
        return angleA - angleB;
      });

      cells.push({
        site,
        siteIndex: this.getUserPointIndex(i),
        vertices: circumcenters,
      });
    }

    return cells;
  }

  /**
   * Create a clipped Voronoi cell for boundary points
   */
  private createClippedCell(
    pointIndex: number,
    triangles: Triangle[]
  ): Point[] {
    const { minX, minY, maxX, maxY } = this.bounds;
    const site = this.points[pointIndex];
    const [s0, s1, s2] = this.superTriangleIndices;

    // Get circumcenters of non-infinite triangles
    const vertices: Point[] = [];

    for (const t of triangles) {
      const touchesSuper =
        t.a === s0 ||
        t.a === s1 ||
        t.a === s2 ||
        t.b === s0 ||
        t.b === s1 ||
        t.b === s2 ||
        t.c === s0 ||
        t.c === s1 ||
        t.c === s2;

      if (!touchesSuper) {
        const cc = this.getCircumcircle(t).center;
        // Clip to bounds
        const clipped = {
          x: Math.max(minX, Math.min(maxX, cc.x)),
          y: Math.max(minY, Math.min(maxY, cc.y)),
        };
        vertices.push(clipped);
      }
    }

    // Add boundary corners if site is near boundary
    const margin = Math.min(maxX - minX, maxY - minY) * 0.1;
    if (site.x < minX + margin) vertices.push({ x: minX, y: site.y });
    if (site.x > maxX - margin) vertices.push({ x: maxX, y: site.y });
    if (site.y < minY + margin) vertices.push({ x: site.x, y: minY });
    if (site.y > maxY - margin) vertices.push({ x: site.x, y: maxY });

    // Sort by angle
    vertices.sort((a, b) => {
      const angleA = Math.atan2(a.y - site.y, a.x - site.x);
      const angleB = Math.atan2(b.y - site.y, b.x - site.x);
      return angleA - angleB;
    });

    return vertices;
  }

  /**
   * Lloyd relaxation: move each site to its cell centroid for smoother shapes
   */
  relax(iterations: number = 1): void {
    for (let iter = 0; iter < iterations; iter++) {
      const regions = this.getRegions();

      // Calculate centroid of each region
      const newPositions: Map<number, Point> = new Map();

      for (const region of regions) {
        if (region.vertices.length < 3) continue;

        const centroid = this.calculateCentroid(region.vertices);

        // Clamp to bounds
        const { minX, minY, maxX, maxY } = this.bounds;
        centroid.x = Math.max(minX, Math.min(maxX, centroid.x));
        centroid.y = Math.max(minY, Math.min(maxY, centroid.y));

        // Store with internal index (add 3 for super-triangle offset)
        newPositions.set(region.siteIndex + 3, centroid);
      }

      // Rebuild triangulation with new positions
      const oldPoints = this.points.slice(3); // Keep track of old order
      this.points = this.points.slice(0, 3); // Keep super-triangle
      this.triangles = [{ a: 0, b: 1, c: 2 }]; // Reset to super-triangle

      // Re-add points at new or original positions
      for (let i = 0; i < oldPoints.length; i++) {
        const internalIdx = i + 3;
        const newPos = newPositions.get(internalIdx);
        if (newPos) {
          this.addPoint(newPos);
        } else {
          this.addPoint(oldPoints[i]);
        }
      }
    }
  }

  /**
   * Calculate centroid of a polygon
   */
  private calculateCentroid(vertices: Point[]): Point {
    if (vertices.length === 0) {
      return { x: 0, y: 0 };
    }

    let cx = 0;
    let cy = 0;
    let signedArea = 0;

    for (let i = 0; i < vertices.length; i++) {
      const p0 = vertices[i];
      const p1 = vertices[(i + 1) % vertices.length];

      const a = p0.x * p1.y - p1.x * p0.y;
      signedArea += a;
      cx += (p0.x + p1.x) * a;
      cy += (p0.y + p1.y) * a;
    }

    signedArea /= 2;

    if (Math.abs(signedArea) < 1e-10) {
      // Degenerate polygon, use simple average
      const avgX = vertices.reduce((s, p) => s + p.x, 0) / vertices.length;
      const avgY = vertices.reduce((s, p) => s + p.y, 0) / vertices.length;
      return { x: avgX, y: avgY };
    }

    cx /= 6 * signedArea;
    cy /= 6 * signedArea;

    return { x: cx, y: cy };
  }

  /**
   * Get the nearest site to a point
   */
  findNearestSite(p: Point): { index: number; distance: number } | null {
    const userPoints = this.getPoints();
    if (userPoints.length === 0) return null;

    let minDist = Infinity;
    let minIndex = -1;

    for (let i = 0; i < userPoints.length; i++) {
      const dx = p.x - userPoints[i].x;
      const dy = p.y - userPoints[i].y;
      const dist = dx * dx + dy * dy;
      if (dist < minDist) {
        minDist = dist;
        minIndex = i;
      }
    }

    return { index: minIndex, distance: Math.sqrt(minDist) };
  }
}

/**
 * Create a Voronoi diagram with random points
 */
export function createVoronoiWithRandomPoints(
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
  pointCount: number,
  rng: SeededRandom,
  relaxIterations: number = 0
): Voronoi {
  const voronoi = new Voronoi(bounds, rng);
  voronoi.addRandomPoints(pointCount);

  if (relaxIterations > 0) {
    voronoi.relax(relaxIterations);
  }

  return voronoi;
}
