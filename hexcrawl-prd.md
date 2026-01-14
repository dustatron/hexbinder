# Hexcrawl — Product Requirements Document

## Overview

Hexcrawl is a procedural sandbox generator and campaign management tool for tabletop RPG Game Masters. It generates interconnected hex maps, settlements, dungeons, NPCs, factions, and adventure hooks, then tracks world state over time including faction clocks, weather, and scheduled events.

**Target Platform:** iPad (primary), Web (secondary)
**Tech Approach:** PWA with Capacitor for native deployment
**Rule System:** Shadowdark RPG (with system-agnostic architecture for future expansion)

---

## Core Concepts

### World
A complete campaign setting containing hex map, locations, NPCs, factions, hooks, and timeline. Users can have multiple worlds. Each world has a seed for deterministic regeneration.

### Hex Map
Grid of hexes with terrain types. Hexes contain locations (settlements, dungeons, landmarks, wilderness sites).

### Locations
Places players can visit. Two primary types:
- **Settlements:** Towns/villages with sites (tavern, temple, market), NPCs, rumors, and notice boards
- **Dungeons:** Explorable multi-room structures with encounters, treasure, hazards, and secrets

### NPCs
Characters defined by archetype (commoner, bandit, witch, etc.) rather than full stat blocks. Stats resolve at render time based on selected rule system.

### Factions
Organizations with goals, relationships, territory, and clocks. Faction interactions drive hooks and world events.

### Hooks
Adventure connections linking NPCs, locations, and factions. Consist of rumor (what players hear) and truth (what's actually happening).

### World Clock
Master timeline tracking days, seasons, weather, moon phases, and scheduled events.

### Faction Clocks
Progress tracks toward faction goals. Tick based on time or events. Trigger consequences when filled.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 + React Compiler |
| Meta-framework | TanStack Start |
| Build | Vite |
| Language | TypeScript (strict) |
| Styling | Tailwind + CSS variables |
| Components | shadcn/ui (Radix primitives + Tailwind) |
| State | Zustand |
| Server State | TanStack Query |
| Routing | TanStack Router |
| Storage | localStorage + JSON export/import |
| Forms | TanStack Form + Zod |
| Tables | TanStack Table |
| Native | Capacitor 5 (future) |
| Hex Rendering | Honeycomb (hex grid library) + SVG |
| Gestures | @use-gesture/react |
| IDs | nanoid |
| Dates | date-fns |
| Animation | Framer Motion |

### Storage: Local-First JSON

**Why this approach:**
- Zero backend complexity
- Works offline by default
- Easy to debug (human-readable JSON)
- Export/import for backup and sharing
- Can migrate to database later if needed

**Implementation:**
```typescript
// src/lib/storage.ts

// World stored as single JSON blob
interface WorldData {
  id: string;
  name: string;
  seed: string;
  createdAt: number;
  updatedAt: number;
  state: WorldState;
  hexes: Hex[];
  edges: HexEdge[];
  locations: Location[];
  npcs: NPC[];
  factions: Faction[];
  hooks: Hook[];
  clocks: Clock[];
}

// Save to localStorage
export function saveWorld(world: WorldData): void {
  world.updatedAt = Date.now();
  localStorage.setItem(`world:${world.id}`, JSON.stringify(world));
}

// Load from localStorage
export function loadWorld(id: string): WorldData | null {
  const data = localStorage.getItem(`world:${id}`);
  return data ? JSON.parse(data) : null;
}

// List all saved worlds
export function listWorlds(): { id: string; name: string; updatedAt: number }[] {
  return Object.keys(localStorage)
    .filter(k => k.startsWith('world:'))
    .map(k => {
      const world = JSON.parse(localStorage.getItem(k)!);
      return { id: world.id, name: world.name, updatedAt: world.updatedAt };
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

// Delete world
export function deleteWorld(id: string): void {
  localStorage.removeItem(`world:${id}`);
}

// Export as downloadable JSON file
export function exportWorld(world: WorldData): void {
  const blob = new Blob([JSON.stringify(world, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${world.name.toLowerCase().replace(/\s+/g, '-')}.hexcrawl.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Import from JSON file
export function importWorld(file: File): Promise<WorldData> {
  return file.text().then(text => {
    const world = JSON.parse(text) as WorldData;
    // Generate new ID to avoid conflicts
    world.id = nanoid();
    world.updatedAt = Date.now();
    saveWorld(world);
    return world;
  });
}
```

**Client setup:**
```typescript
// src/lib/db/index.ts
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client);
```

---

## MVP Scope (Vertical Slice)

### In Scope
- Single world creation with seed
- 7x7 hex map generation
- Terrain generation (6 terrain types)
- One settlement (village-sized) with:
  - 4-6 sites (tavern, inn, temple, blacksmith, market)
  - 4-6 notable NPCs with archetypes
  - 3-5 rumors
  - 2-3 notice board postings
- One dungeon (small, 6-10 rooms) with:
  - Room connections
  - Encounters
  - Treasure
  - 1-2 magic items
  - Hooks back to settlement
- Two factions with:
  - Goals
  - Relationships to each other
  - One clock each
- World clock with:
  - Day tracking
  - Weather generation
  - Season tracking
- Hex map UI with tap-to-view location
- Location detail views
- Day advancement with clock ticking
- Local storage persistence

### Out of Scope (Future)
- AI content extraction
- Multiple worlds
- Sharing/collaboration
- Convex sync
- Content pools / custom theming
- Full dungeon map visualization
- NPC/location editing
- Checkpoint/time travel
- App Store deployment

---

## Information Architecture

```
App
├── World List (future)
│
└── World View
    ├── Hex Map (default view)
    │   └── Location Panel (slide up on hex tap)
    │       ├── Settlement View
    │       │   ├── Overview (description, mood, trouble)
    │       │   ├── Sites List
    │       │   │   └── Site Detail
    │       │   ├── NPCs List
    │       │   │   └── NPC Detail
    │       │   ├── Rumors
    │       │   └── Notice Board
    │       │
    │       └── Dungeon View
    │           ├── Overview (theme, size, status)
    │           ├── Room List / Map
    │           │   └── Room Detail
    │           ├── Encounters
    │           └── Treasure
    │
    ├── Timeline View
    │   ├── World Clock (current day, weather, moon)
    │   ├── Faction Clocks
    │   ├── Upcoming Events
    │   └── Event Log
    │
    └── Factions View
        ├── Faction List
        └── Faction Detail
            ├── Goals
            ├── Relationships
            ├── Territory
            └── Clock
```

---

## Data Models (Core)

### World
```typescript
interface World {
  id: string;
  name: string;
  seed: string;
  theme: string;
  ruleSystem: RuleSystem;
  createdAt: number;
  updatedAt: number;
}
```

### WorldState
```typescript
interface WorldState {
  id: string;
  worldId: string;
  day: number;
  season: Season;
  year: number;
  weather: WeatherState;
  moonPhase: MoonPhase;
}
```

### Hex
```typescript
interface Hex {
  coord: HexCoord;
  terrain: TerrainType;
  locationId?: string;
}

type HexCoord = { q: number; r: number };

type TerrainType = 
  | "plains" 
  | "forest" 
  | "hills" 
  | "mountains" 
  | "water" 
  | "swamp";
```

### HexEdge
```typescript
interface HexEdge {
  from: HexCoord;
  to: HexCoord;
  type: EdgeType;
}

type EdgeType = "road" | "river" | "trail" | "bridge";
```

### HexMap
```typescript
interface HexMap {
  hexes: Hex[];
  edges: HexEdge[];
}
```

### Location
```typescript
interface Location {
  id: string;
  name: string;
  type: "settlement" | "dungeon" | "landmark" | "wilderness";
  description: string;
  hexCoord: HexCoord;
  factionId?: string;
  tags: string[];
}
```

### Settlement
```typescript
interface Settlement extends Location {
  type: "settlement";
  size: SettlementSize;
  population: number;
  governmentType: GovernmentType;
  economyBase: EconomyType[];
  mood: SettlementMood;
  trouble: string;
  quirk: string;
  sites: SettlementSite[];
  npcIds: string[];
  rumors: Rumor[];
  notices: Notice[];
  defenses: DefenseLevel;
}

type SettlementSize = "thorpe" | "hamlet" | "village" | "town" | "city";
```

### SettlementSite
```typescript
interface SettlementSite {
  id: string;
  name: string;
  type: SiteType;
  description: string;
  ownerId?: string;
  staffIds: string[];
  quirk?: string;
  secret?: string;
  services: SiteService[];
  rumorSource: boolean;
  noticeBoard: boolean;
}

type SiteType = 
  | "tavern" 
  | "inn" 
  | "temple" 
  | "blacksmith" 
  | "general_store" 
  | "market"
  | "guild_hall"
  | "noble_estate";
```

### Dungeon
```typescript
interface Dungeon extends Location {
  type: "dungeon";
  size: DungeonSize;
  theme: DungeonTheme;
  depth: number;
  rooms: DungeonRoom[];
  connections: RoomConnection[];
  entranceRoomId: string;
  bossEncounterId?: string;
  magicItems: MagicItem[];
  cleared: boolean;
  linkedHookIds: string[];
}

type DungeonSize = "lair" | "small" | "medium" | "large" | "megadungeon";

type DungeonTheme = 
  | "tomb" 
  | "cave" 
  | "temple" 
  | "mine" 
  | "fortress" 
  | "sewer";
```

### DungeonRoom
```typescript
interface DungeonRoom {
  id: string;
  name: string;
  description: string;
  type: RoomType;
  size: RoomSize;
  encounters: Encounter[];
  treasure: TreasureEntry[];
  features: RoomFeature[];
  hazards: Hazard[];
  secrets: RoomSecret[];
  explored: boolean;
}
```

### NPC
```typescript
interface NPC {
  id: string;
  name: string;
  description: string;
  archetype: CreatureArchetype;
  threatLevel: ThreatLevel;
  variants?: string[];
  factionId?: string;
  factionRole?: FactionRole;
  locationId?: string;
  wants: string;
  secret?: string;
  status: "alive" | "dead" | "missing" | "unknown";
  tags: string[];
}

type CreatureArchetype = 
  | "commoner" 
  | "bandit" 
  | "guard" 
  | "knight"
  | "assassin"
  | "witch" 
  | "priest"
  | "noble"
  | "merchant";

type ThreatLevel = 1 | 2 | 3 | 4 | 5;
```

### Faction
```typescript
interface Faction {
  id: string;
  name: string;
  description: string;
  archetype: FactionArchetype;
  scale: "local" | "regional" | "major";
  goals: FactionGoal[];
  methods: string[];
  resources: string[];
  relationships: FactionRelationship[];
  headquartersId?: string;
  territoryIds: string[];
  influenceIds: string[];
  leaderArchetype: CreatureArchetype;
  memberArchetype: CreatureArchetype;
  symbols: string[];
  rumors: string[];
  status: "active" | "destroyed" | "disbanded" | "underground";
}

type FactionArchetype = 
  | "criminal" 
  | "religious" 
  | "political" 
  | "mercantile"
  | "military" 
  | "arcane" 
  | "tribal" 
  | "monstrous" 
  | "secret";
```

### Clock
```typescript
interface Clock {
  id: string;
  name: string;
  description: string;
  segments: number;
  filled: number;
  ownerId?: string;
  trigger: ClockTrigger;
  consequences: ClockConsequence[];
  visible: boolean;
  paused: boolean;
  completedAt?: number;
}

type ClockTrigger = 
  | { type: "time"; daysPerTick: number }
  | { type: "event"; events: string[] }
  | { type: "manual" };
```

### Hook
```typescript
interface Hook {
  id: string;
  rumor: string;
  truth: string;
  involvedNpcIds: string[];
  involvedLocationIds: string[];
  involvedFactionIds: string[];
  reward?: string;
  danger?: string;
  status: "available" | "active" | "completed" | "failed" | "expired";
  discoveredAt?: number;
  completedAt?: number;
}
```

### Weather
```typescript
interface WeatherState {
  condition: WeatherCondition;
  temperature: Temperature;
  wind: WindLevel;
  visibility: Visibility;
  duration: number;
}

type WeatherCondition = 
  | "clear" 
  | "cloudy" 
  | "overcast" 
  | "rain_light"
  | "rain_heavy" 
  | "storm" 
  | "thunderstorm" 
  | "fog"
  | "snow_light" 
  | "snow_heavy" 
  | "blizzard";

type Season = "spring" | "summer" | "autumn" | "winter";
type MoonPhase = "new" | "waxing" | "full" | "waning";
```

### Stat Resolution
```typescript
type RuleSystem = "shadowdark" | "osr" | "5e" | "cairn";

interface StatResolver {
  system: RuleSystem;
  resolve(
    archetype: CreatureArchetype, 
    threatLevel: ThreatLevel, 
    variants?: string[]
  ): StatBlock;
}

interface StatBlock {
  system: RuleSystem;
  display: string; // formatted for rendering
}
```

---

## Generator Architecture

### Seeded Random
All generation uses seeded RNG for deterministic output. Same seed = same world.

```typescript
class SeededRandom {
  constructor(seed: string);
  next(): number;                          // 0-1
  between(min: number, max: number): number;
  pick<T>(table: WeightedTable<T>): T;
  sample<T>(arr: T[], n: number): T[];
  shuffle<T>(arr: T[]): T[];
}

interface WeightedTable<T> {
  entries: { weight: number; value: T }[];
}
```

### Hex Grid Library: Honeycomb

Using [Honeycomb](https://abbekeultjes.nl/honeycomb/) for hex math and grid management.

**Why Honeycomb:**
- TypeScript native
- Handles all hex coordinate systems (axial, cube, offset)
- Built-in traversal, neighbors, distance, line-of-sight
- Lightweight (~8kb gzipped)
- Works with any rendering (we use SVG)

**Usage pattern:**

```typescript
import { defineHex, Grid, rectangle, Orientation } from 'honeycomb-grid';

// Define hex type with custom properties
const Tile = defineHex({
  dimensions: 50,                         // hex size in pixels
  orientation: Orientation.POINTY,        // pointy-top hexes
});

// Create grid
const grid = new Grid(Tile, rectangle({ width: 7, height: 7 }));

// Access hex by axial coordinates
const hex = grid.getHex({ q: 2, r: 3 });

// Get neighbors
const neighbors = grid.traverse(hex).neighbors();

// Convert to pixel coordinates for SVG
const { x, y } = hex.toPoint();
```

**Coordinate system:** Axial (q, r) - simplest for storage and generation.

**Rendering approach:**
```typescript
// SVG polygon points for a hex
function hexPoints(hex: Hex): string {
  return hex.corners
    .map(({ x, y }) => `${x},${y}`)
    .join(' ');
}

// React component
function HexTile({ hex, terrain, onClick }) {
  const { x, y } = hex.toPoint();
  return (
    <polygon
      points={hexPoints(hex)}
      fill={terrainColors[terrain]}
      onClick={() => onClick(hex)}
    />
  );
}
```

### Hex Map Rendering

Using SVG + @use-gesture/react + framer-motion for pan/zoom.

**Render order (back to front):**
1. Terrain fills (hex polygons)
2. Rivers (curved blue paths)
3. Roads (dashed brown paths)
4. Bridges (solid paths over river crossings)
5. Hex borders (thin outlines)
6. Location icons (settlement/dungeon markers)
7. Selection highlight

**Edge rendering:**
```typescript
const edgeStyles = {
  road: { stroke: '#92400e', strokeWidth: 4, strokeDasharray: '8,4' },
  river: { stroke: '#3b82f6', strokeWidth: 6, strokeLinecap: 'round' },
  trail: { stroke: '#78716c', strokeWidth: 2, strokeDasharray: '4,4' },
  bridge: { stroke: '#92400e', strokeWidth: 6 },
};

function HexEdge({ from, to, type, grid }) {
  const p1 = grid.getHex(from).toPoint();
  const p2 = grid.getHex(to).toPoint();
  
  // Rivers curve, roads are straight
  const d = type === 'river'
    ? `M ${p1.x} ${p1.y} Q ${(p1.x + p2.x) / 2 + 15} ${(p1.y + p2.y) / 2 + 15} ${p2.x} ${p2.y}`
    : `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
  
  return <path d={d} fill="none" {...edgeStyles[type]} />;
}
```

**Gesture handling:**
```typescript
import { useGesture } from '@use-gesture/react';
import { motion, useMotionValue } from 'framer-motion';

function HexMap({ hexes, edges, onHexClick }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  
  const bind = useGesture({
    onDrag: ({ offset: [ox, oy] }) => {
      x.set(ox);
      y.set(oy);
    },
    onPinch: ({ offset: [s] }) => {
      scale.set(Math.min(Math.max(s, 0.5), 2));
    },
  }, {
    drag: { from: () => [x.get(), y.get()] },
    pinch: { from: () => [scale.get()] },
  });
  
  return (
    <svg {...bind()} style={{ touchAction: 'none' }}>
      <motion.g style={{ x, y, scale }}>
        {/* render layers */}
      </motion.g>
    </svg>
  );
}
```

### Generation Pipeline
```
Seed
  ↓
Generate Hex Terrain
  ↓
Generate Rivers (flow from mountains/hills to water)
  ↓
Generate Factions (2)
  ↓
Establish Faction Relationships
  ↓
Place Settlements on Hexes
  ↓
Generate Roads (connect all settlements)
  ↓
Generate Settlement Sites
  ↓
Generate Settlement NPCs
  ↓
Generate Settlement Rumors/Notices
  ↓
Place Dungeon on Hex
  ↓
Generate Dungeon Rooms
  ↓
Connect Rooms
  ↓
Place Encounters & Treasure
  ↓
Generate Magic Items
  ↓
Generate Dungeon Hooks
  ↓
Link Dungeon Hooks to Settlement
  ↓
Generate Faction Clocks
  ↓
Initialize World Clock & Weather
  ↓
Complete WorldState
```

### Road Generation Rules
- All settlements of size "village" or larger are connected by roads
- Roads take shortest path, preferring plains > hills > forest > swamp
- Roads avoid mountains and water
- If road must cross river, place bridge edge
- Trails connect smaller settlements (thorpe, hamlet) to nearest road

---

## UI/UX Requirements

### General
- 44px minimum touch targets
- Safe area insets for notch/home indicator
- Dark theme (stone-900 background)
- Haptic feedback on key interactions
- Swipe gestures for navigation
- Pull-to-refresh where appropriate

### Hex Map View
- Hex grid fills screen
- Pinch to zoom (0.5x - 2x)
- Pan to scroll
- Tap hex to select
- Selected hex highlights
- Location icons on hexes
- Bottom sheet slides up with location details
- Current weather/day shown in header

### Location Panel
- Slides up from bottom (60% height default, expandable)
- Drag handle to resize
- Swipe down to dismiss
- Tab navigation for sections (Overview, Sites, NPCs, Rumors)
- Cards for each item
- Tap card for detail view

### Timeline View
- Current date prominent
- Weather icon + description
- Moon phase indicator
- +1 Day / +7 Days buttons
- Faction clocks as visual segments
- Upcoming events list
- Collapsible event log

### Stat Blocks
- Shadowdark format:
  ```
  BANDIT
  AC 12, HP 6, MV near
  STR +1, DEX +1, CON +0, INT +0, WIS +0, CHA +0
  AL C, LV 1
  Shortsword +2 (1d6)
  ```
- Compact, scannable
- Copy-to-clipboard option

---

## Key Dependencies

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-query": "^5.x",
    "@tanstack/react-router": "^1.x",
    "@tanstack/react-form": "^0.x",
    "@tanstack/react-table": "^8.x",
    "@tanstack/start": "^1.x",
    "@use-gesture/react": "^10.x",
    "zustand": "^4.x",
    "honeycomb-grid": "^4.x",
    "nanoid": "^5.x",
    "date-fns": "^3.x",
    "framer-motion": "^11.x",
    "zod": "^3.x",
    "class-variance-authority": "^0.7.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "lucide-react": "^0.x"
  },
  "devDependencies": {
    "vite": "^6.x",
    "tailwindcss": "^3.x",
    "typescript": "^5.x",
    "@types/react": "^19.x",
    "@types/react-dom": "^19.x"
  }
}
```

---

## File Structure

```
hexcrawl/
├── src/
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── index.tsx             # World list / home
│   │   └── world.$worldId.tsx    # World view (hex map)
│   │
│   ├── components/
│   │   ├── hex-map/
│   │   │   ├── HexMap.tsx
│   │   │   ├── HexTile.tsx
│   │   │   └── HexEdge.tsx
│   │   ├── locations/
│   │   │   ├── LocationPanel.tsx
│   │   │   ├── SettlementView.tsx
│   │   │   └── DungeonView.tsx
│   │   ├── timeline/
│   │   │   ├── WorldClock.tsx
│   │   │   └── FactionClocks.tsx
│   │   ├── world-list/
│   │   │   ├── WorldList.tsx
│   │   │   └── WorldCard.tsx
│   │   └── ui/                   # shadcn components
│   │
│   ├── generators/
│   │   ├── SeededRandom.ts
│   │   ├── HexMapGenerator.ts
│   │   ├── SettlementGenerator.ts
│   │   ├── DungeonGenerator.ts
│   │   ├── FactionGenerator.ts
│   │   ├── WeatherGenerator.ts
│   │   ├── HookGenerator.ts
│   │   └── tables/
│   │
│   ├── models/
│   │   ├── index.ts              # All type exports
│   │   ├── world.ts
│   │   ├── hex.ts
│   │   ├── location.ts
│   │   ├── settlement.ts
│   │   ├── dungeon.ts
│   │   ├── npc.ts
│   │   ├── faction.ts
│   │   ├── hook.ts
│   │   ├── clock.ts
│   │   └── stats/
│   │       ├── archetypes.ts
│   │       └── shadowdark.ts
│   │
│   ├── lib/
│   │   ├── storage.ts            # localStorage + JSON export/import
│   │   ├── hex-utils.ts          # Honeycomb grid setup
│   │   └── utils.ts              # cn() helper etc
│   │
│   ├── hooks/
│   │   ├── useWorld.ts
│   │   ├── useWorlds.ts
│   │   └── useGenerator.ts
│   │
│   └── stores/
│       └── ui-store.ts           # Zustand for UI state
│
├── public/
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```
│   │   │   └── queries/              # Query functions
│   │   ├── auth/                     # Better Auth config
│   │   ├── hex-utils.ts              # Honeycomb setup
│   │   └── utils.ts                  # shadcn cn() helper
│   │
│   ├── native/
│   │   ├── haptics.ts
│   │   └── storage.ts
│   │
│   └── utils/
│       ├── hex-math.ts
│       └── format.ts
│
├── public/
├── capacitor.config.ts
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Success Criteria (MVP)

1. User can generate a new world with a seed
2. Hex map displays with terrain colors
3. Tapping hex with location shows location panel
4. Settlement displays sites, NPCs, rumors, notices
5. Dungeon displays rooms, encounters, treasure
6. NPCs show resolved Shadowdark stat blocks
7. World clock shows current day and weather
8. Advancing day updates weather and ticks clocks
9. Faction clocks display and update correctly
10. World persists in local storage across sessions
11. Same seed regenerates identical world
12. Works smoothly on iPad (Safari PWA)

---

## Future Roadmap

### Phase 2: Content & Customization
- AI content extraction from PDFs/markdown
- Custom content pools
- Theme system (Obojima, classic fantasy, etc.)
- World editing (add/modify locations, NPCs)

### Phase 3: Campaign Management
- Checkpoint/save states
- Time scrubbing
- Session notes
- GM screen view

### Phase 4: Multi-World & Sharing
- Multiple worlds per user
- Convex backend sync
- Share codes
- Read-only player view

### Phase 5: App Store
- Capacitor native build
- iOS App Store deployment
- Offline-first enhancements
- Native file import/export

---

# User Stories

## Epic 1: World Generation

### US-1.1: Create World
**As a** GM
**I want to** create a new world with a seed
**So that** I have a unique sandbox to run my campaign

**Acceptance Criteria:**
- Can enter a world name
- Can enter or generate random seed
- World generates hex map, settlement, dungeon, factions
- Generation completes in < 3 seconds
- World is saved to local storage

### US-1.2: Deterministic Generation
**As a** GM
**I want** the same seed to produce the same world
**So that** I can recreate or share my world

**Acceptance Criteria:**
- Given same seed, all generated content is identical
- Hex positions, location names, NPC names, room layouts all match

### US-1.3: View Generated Hex Map
**As a** GM
**I want to** see the generated hex map
**So that** I understand the geography of my world

**Acceptance Criteria:**
- Hex grid displays correctly
- Each terrain type has distinct color
- Hexes with locations show icon
- Map can be panned
- Map can be zoomed

---

## Epic 2: Settlement Exploration

### US-2.1: View Settlement Overview
**As a** GM
**I want to** see a settlement's key details at a glance
**So that** I can quickly reference it during play

**Acceptance Criteria:**
- Shows name, size, population
- Shows current mood and trouble
- Shows quirk/unique feature
- Shows controlling faction if any

### US-2.2: Browse Settlement Sites
**As a** GM
**I want to** see all sites in a settlement
**So that** I know what locations players can visit

**Acceptance Criteria:**
- Lists all sites (tavern, temple, etc.)
- Each shows name, type, owner
- Tapping site shows detail view
- Detail shows services, quirk, secret

### US-2.3: View Settlement NPCs
**As a** GM
**I want to** see notable NPCs in a settlement
**So that** I have characters for players to interact with

**Acceptance Criteria:**
- Lists all notable NPCs
- Shows name, role/archetype, location
- Tapping NPC shows detail
- Detail shows description, wants, secret
- Detail shows resolved stat block

### US-2.4: Read Rumors
**As a** GM
**I want to** see rumors available in a settlement
**So that** I can share them with players as hooks

**Acceptance Criteria:**
- Lists all rumors
- Shows which are true/false (GM info)
- Shows where rumor can be heard
- Links to related hooks if any

### US-2.5: View Notice Board
**As a** GM
**I want to** see posted jobs/notices
**So that** I have ready-made quests for players

**Acceptance Criteria:**
- Lists all notices
- Shows title, description, reward
- Shows who posted it
- Shows notice type (bounty, escort, etc.)

---

## Epic 3: Dungeon Exploration

### US-3.1: View Dungeon Overview
**As a** GM
**I want to** see dungeon key details
**So that** I understand what players will face

**Acceptance Criteria:**
- Shows name, theme, size
- Shows number of rooms, depth
- Shows cleared/uncleared status
- Lists magic items present

### US-3.2: Browse Dungeon Rooms
**As a** GM
**I want to** see all rooms in a dungeon
**So that** I can run the exploration

**Acceptance Criteria:**
- Lists rooms in logical order
- Shows room name, type, connections
- Tapping room shows detail
- Detail shows description, size
- Shows encounters, treasure, hazards

### US-3.3: View Room Encounters
**As a** GM
**I want to** see encounters in a dungeon room
**So that** I know what creatures are present

**Acceptance Criteria:**
- Lists creatures with count
- Shows behavior (hostile/neutral/negotiable)
- Shows resolved stat blocks
- Can mark encounter defeated

### US-3.4: View Room Treasure
**As a** GM
**I want to** see treasure in a room
**So that** I know what players can find

**Acceptance Criteria:**
- Lists all treasure entries
- Shows coins, gems, items
- Magic items show full details
- Can mark treasure looted

### US-3.5: View Dungeon Hooks
**As a** GM
**I want to** see hooks connected to a dungeon
**So that** I understand how it ties to settlements

**Acceptance Criteria:**
- Lists hooks that reference dungeon
- Shows rumor and truth
- Links to involved NPCs/locations

---

## Epic 4: Faction Management

### US-4.1: View Factions
**As a** GM
**I want to** see all factions in my world
**So that** I understand the political landscape

**Acceptance Criteria:**
- Lists all factions
- Shows name, archetype, scale
- Shows status (active/destroyed/etc.)
- Shows current clock progress

### US-4.2: View Faction Details
**As a** GM
**I want to** see faction goals and relationships
**So that** I can roleplay faction NPCs accurately

**Acceptance Criteria:**
- Shows description, goals, methods
- Shows relationships to other factions
- Shows territory and influence
- Shows associated NPCs

### US-4.3: View Faction Clock
**As a** GM
**I want to** see faction clock progress
**So that** I know what's about to happen

**Acceptance Criteria:**
- Shows clock segments visually
- Shows current filled vs total
- Shows what happens when complete
- Shows trigger type (time/event/manual)

---

## Epic 5: World Clock & Time

### US-5.1: View Current Date
**As a** GM
**I want to** see the current in-game date
**So that** players know what day it is

**Acceptance Criteria:**
- Shows day number
- Shows season
- Shows formatted date (if calendar system defined)

### US-5.2: View Current Weather
**As a** GM
**I want to** see today's weather
**So that** I can describe conditions to players

**Acceptance Criteria:**
- Shows weather condition (clear, rain, storm, etc.)
- Shows temperature
- Shows wind level
- Shows any travel effects

### US-5.3: View Moon Phase
**As a** GM
**I want to** see the current moon phase
**So that** I can use it for atmosphere and events

**Acceptance Criteria:**
- Shows moon phase (new, waxing, full, waning)
- Visual representation

### US-5.4: Advance Time
**As a** GM
**I want to** advance the calendar by days
**So that** time passes and clocks progress

**Acceptance Criteria:**
- +1 Day button advances one day
- +7 Days button advances one week
- Weather updates
- Moon phase updates
- Season changes if appropriate
- Faction clocks tick
- Scheduled events fire

### US-5.5: View Upcoming Events
**As a** GM
**I want to** see what's coming up
**So that** I can foreshadow and prepare

**Acceptance Criteria:**
- Lists events in next 7-14 days
- Shows weather forecast
- Shows when clocks will tick
- Warns if clock is about to complete

---

## Epic 6: Stat Blocks

### US-6.1: View NPC Stats
**As a** GM
**I want to** see NPC stat blocks in Shadowdark format
**So that** I can run combat quickly

**Acceptance Criteria:**
- Stats display in Shadowdark format
- AC, HP, MV on first line
- Ability modifiers on second line
- Alignment and Level on third line
- Attacks and abilities listed
- Compact, readable format

### US-6.2: View Monster Stats
**As a** GM
**I want to** see encounter creature stats
**So that** I can run dungeon combat

**Acceptance Criteria:**
- Same format as NPC stats
- Grouped by encounter
- Shows count of each creature type

---

## Epic 7: Persistence

### US-7.1: Auto-Save World
**As a** GM
**I want** my world to save automatically
**So that** I don't lose my work

**Acceptance Criteria:**
- World state saves after any change
- Saves to IndexedDB
- No manual save button needed
- Shows save indicator

### US-7.2: Load World on Launch
**As a** GM
**I want** my world to load when I open the app
**So that** I can continue where I left off

**Acceptance Criteria:**
- Last active world loads on launch
- All state restored (day, weather, clocks)
- No data loss between sessions

---

## Epic 8: Mobile/iPad Experience

### US-8.1: Touch-Friendly Interface
**As a** GM using an iPad
**I want** large, easy-to-tap targets
**So that** I can use the app comfortably

**Acceptance Criteria:**
- All interactive elements ≥ 44px
- Adequate spacing between targets
- No accidental taps

### US-8.2: Swipe Navigation
**As a** GM using an iPad
**I want** to navigate with swipes
**So that** the app feels native

**Acceptance Criteria:**
- Swipe down dismisses panels
- Swipe between tabs/sections
- Gesture feedback

### US-8.3: Safe Areas
**As a** GM using an iPad
**I want** content to avoid notch/home indicator
**So that** nothing is obscured

**Acceptance Criteria:**
- Content respects safe area insets
- No overlap with system UI

### US-8.4: Haptic Feedback
**As a** GM using an iPad
**I want** haptic feedback on key actions
**So that** interactions feel responsive

**Acceptance Criteria:**
- Light haptic on button tap
- Medium haptic on day advance
- Haptic on clock tick

---

# Claude Code Agents

Specialized agents for different aspects of development. Organized by tier based on usage frequency.

---

## Tier 1: Primary Agents (Use Most Often)

### Agent: Frontend
**Purpose:** React component development, UI implementation, all visual work
**Context:** 
- React 19 docs, hooks patterns
- shadcn/ui component library
- Tailwind CSS utilities
- framer-motion animations
- @use-gesture/react
- PRD UI/UX requirements section

**Strengths:** 
- Component architecture and composition
- Custom hooks
- State management (Zustand, TanStack Query)
- Styling and responsive design
- Animations and transitions
- Touch interactions and gestures
- Accessibility

**Use For:**
- Building any React component
- Fixing UI bugs
- Styling issues
- Adding new views/screens
- Implementing interactions
- Animation work
- Component refactoring

**Example Prompts:**
- "Build the HexMap component that renders a 7x7 hex grid with terrain colors"
- "Create a bottom sheet component using shadcn Sheet that slides up when tapping a hex"
- "Add pinch-to-zoom gesture to the map using @use-gesture"
- "Style the WorldList cards to match the dark theme"

---

### Agent: Generator
**Purpose:** Procedural content generation algorithms
**Context:**
- PRD generator architecture section
- SeededRandom spec
- Weighted tables
- Settlement/dungeon/NPC generation rules

**Strengths:**
- Deterministic random algorithms
- Data structure generation
- Procedural content pipelines
- Game design logic

**Use For:**
- SeededRandom implementation
- Terrain generation
- Settlement generation
- Dungeon generation
- NPC/faction generation
- Hook/rumor generation
- Weather systems

**Example Prompts:**
- "Implement SeededRandom class with pick() and sample() methods"
- "Create terrain generator that produces varied 7x7 hex grids"
- "Build settlement generator that creates sites, NPCs, and rumors"

---

## Tier 2: Setup Agents (Use Early in Project)

### Agent: Scaffold
**Purpose:** Project setup and template configuration
**Context:** PRD tech stack, tanstarter template structure
**Tasks:**
- Clone and strip tanstarter template
- Configure Tailwind, shadcn/ui
- Set up folder structure
- Install dependencies
- Verify dev server runs

### Agent: Models
**Purpose:** TypeScript interfaces and data structures
**Context:** PRD data models section, WorldData interface
**Tasks:**
- Create all TypeScript interfaces in `src/models/`
- Define WorldData, Hex, Location, NPC, Faction, etc.
- Ensure type consistency across codebase
- Add Zod schemas for validation if needed

### Agent: Storage
**Purpose:** localStorage persistence layer
**Context:** PRD storage strategy, export/import requirements
**Tasks:**
- Implement `src/lib/storage.ts`
- Save/load worlds to localStorage
- Export world as downloadable JSON
- Import world from JSON file
- List and delete worlds

### Agent: Routes
**Purpose:** TanStack Router configuration
**Context:** TanStack Router docs, PRD information architecture
**Tasks:**
- Set up route structure
- Home route `/` (WorldList)
- World route `/world/$worldId` (HexMap)
- Handle navigation between routes
- Add route loaders for world data

---

## Tier 3: Feature Agents (Use for Specific Features)

### Agent: HexMap
**Purpose:** Hex grid math and utilities (not React components)
**Context:** Honeycomb docs, hex coordinate systems
**Tasks:**
- Set up Honeycomb grid in `src/lib/hex-utils.ts`
- Hex coordinate conversions
- Neighbor calculations
- Pathfinding utilities
- Distance calculations

*Note: For React components, use Frontend agent*

### Agent: Timeline
**Purpose:** World clock logic and time advancement
**Context:** PRD timeline section, clock mechanics
**Tasks:**
- Day advancement logic
- Weather generation on advance
- Clock tick calculations
- Event scheduling
- Season/moon phase logic

*Note: For UI components, use Frontend agent*

---

## Tier 4: Polish Agents (Use Late in Project)

### Agent: Polish
**Purpose:** Final touches and optimization
**Context:** Full codebase, PRD success criteria
**Tasks:**
- Add haptic feedback (prep for Capacitor)
- Error handling and loading states
- Auto-save on changes
- PWA manifest
- Performance optimization
- iPad testing

---

## Agent Selection Guide

| Task | Agent |
|------|-------|
| Any React component | **Frontend** |
| Styling/CSS | **Frontend** |
| Animations | **Frontend** |
| Touch gestures | **Frontend** |
| UI bugs | **Frontend** |
| Procedural generation | **Generator** |
| Random algorithms | **Generator** |
| Content tables | **Generator** |
| Project setup | Scaffold |
| TypeScript types | Models |
| localStorage | Storage |
| Routing | Routes |
| Hex math utilities | HexMap |
| Time/clock logic | Timeline |
| Final polish | Polish |

---

# Development Phases

## Phase 0: Proof of Concept (First Priority)

**Goal:** Hex map on screen, tap hex, see location detail. Save/load worlds locally.

### Template
Using [react-tanstarter](https://github.com/dotnize/react-tanstarter) as base, stripped down.

**Keep:**
- React 19 + React Compiler
- TanStack Start + Router + Query
- Tailwind + shadcn/ui
- Vite

**Remove:**
- Better Auth (no auth for MVP)
- Drizzle ORM (using localStorage)
- PostgreSQL / Turso
- Docker config

**Add:**
- honeycomb-grid
- @use-gesture/react
- framer-motion

### Step 0.1: Project Setup
- [ ] Clone tanstarter template: `npx gitpick dotnize/react-tanstarter hexcrawl`
- [ ] Remove auth: delete `src/lib/auth/`, `src/routes/auth/`, auth middleware
- [ ] Remove database: delete `src/lib/db/`, `drizzle.config.ts`
- [ ] Remove `docker-compose.yml`
- [ ] Clean `package.json`: remove `better-auth`, `drizzle-orm`, `postgres`, `@libsql/client`
- [ ] Add dependencies: `pnpm add honeycomb-grid @use-gesture/react framer-motion nanoid`
- [ ] Verify dev server runs: `pnpm dev`

### Step 0.2: Storage Layer
- [ ] Create `src/lib/storage.ts` (localStorage wrapper)
- [ ] Implement: `saveWorld`, `loadWorld`, `listWorlds`, `deleteWorld`
- [ ] Implement: `exportWorld` (download JSON), `importWorld` (upload JSON)
- [ ] Create `src/models/index.ts` with TypeScript interfaces

```typescript
// src/lib/storage.ts
import { nanoid } from 'nanoid';
import type { WorldData } from '@/models';

export function saveWorld(world: WorldData): void {
  world.updatedAt = Date.now();
  localStorage.setItem(`world:${world.id}`, JSON.stringify(world));
}

export function loadWorld(id: string): WorldData | null {
  const data = localStorage.getItem(`world:${id}`);
  return data ? JSON.parse(data) : null;
}

export function listWorlds(): { id: string; name: string; updatedAt: number }[] {
  return Object.keys(localStorage)
    .filter(k => k.startsWith('world:'))
    .map(k => {
      const world = JSON.parse(localStorage.getItem(k)!);
      return { id: world.id, name: world.name, updatedAt: world.updatedAt };
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function deleteWorld(id: string): void {
  localStorage.removeItem(`world:${id}`);
}

export function exportWorld(world: WorldData): void {
  const blob = new Blob([JSON.stringify(world, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${world.name.toLowerCase().replace(/\s+/g, '-')}.hexcrawl.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importWorld(file: File): Promise<WorldData> {
  const text = await file.text();
  const world = JSON.parse(text) as WorldData;
  world.id = nanoid(); // new ID to avoid conflicts
  world.updatedAt = Date.now();
  saveWorld(world);
  return world;
}
```

### Step 0.3: Mock Data
- [ ] Create `src/data/mock-world.ts` with hardcoded test world
- [ ] 7x7 hex grid with varied terrain
- [ ] 2 locations: one settlement, one dungeon

```typescript
// src/data/mock-world.ts
import { nanoid } from 'nanoid';
import type { WorldData } from '@/models';

export function createMockWorld(): WorldData {
  return {
    id: nanoid(),
    name: 'Test World',
    seed: 'test-seed-123',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    state: {
      day: 1,
      season: 'spring',
      year: 1,
      weather: { condition: 'clear', temperature: 'mild', wind: 'breeze' },
      moonPhase: 'waxing',
    },
    hexes: [
      { q: 0, r: 0, terrain: 'plains', locationId: 'loc-1' },
      { q: 1, r: 0, terrain: 'forest' },
      { q: 2, r: 0, terrain: 'hills', locationId: 'loc-2' },
      { q: -1, r: 1, terrain: 'water' },
      { q: 0, r: 1, terrain: 'plains' },
      { q: 1, r: 1, terrain: 'forest' },
      { q: 2, r: 1, terrain: 'mountains' },
      // ... more hexes for 7x7 grid
    ],
    edges: [],
    locations: [
      {
        id: 'loc-1',
        name: 'Millhaven',
        type: 'settlement',
        description: 'A quiet farming village troubled by recent livestock deaths.',
        hexQ: 0,
        hexR: 0,
      },
      {
        id: 'loc-2',
        name: 'Thornwood Barrow',
        type: 'dungeon',
        description: 'Ancient burial mound. Locals avoid it after dark.',
        hexQ: 2,
        hexR: 0,
      },
    ],
    npcs: [],
    factions: [],
    hooks: [],
    clocks: [],
  };
}
```

### Step 0.4: Hex Map Display
- [ ] Create `src/lib/hex-utils.ts` (Honeycomb grid setup)
- [ ] Create `src/components/hex-map/HexMap.tsx` (SVG container)
- [ ] Create `src/components/hex-map/HexTile.tsx` (polygon component)
- [ ] Load world from localStorage (or create mock if none exists)
- [ ] 7x7 grid renders with terrain colors

### Step 0.5: Gestures
- [ ] Add pan gesture (drag to scroll map)
- [ ] Add pinch zoom gesture (0.5x - 2x)
- [ ] Add tap to select hex
- [ ] Selected hex shows highlight stroke

### Step 0.6: Location Panel
- [ ] Add shadcn Sheet component: `pnpm ui add sheet`
- [ ] Create `src/components/location-panel/LocationPanel.tsx`
- [ ] Tap hex with location → Sheet slides up from bottom
- [ ] Sheet shows location name + description
- [ ] Tap hex without location → Sheet shows terrain type
- [ ] Swipe down or tap outside to dismiss

### Step 0.7: World Management
- [ ] Create home route `/` showing list of saved worlds
- [ ] "New World" button creates mock world and navigates to it
- [ ] "Export" button downloads world as JSON
- [ ] "Import" button loads world from JSON file
- [ ] "Delete" button removes world from localStorage

### Success Criteria (Phase 0)
- [ ] App loads without errors
- [ ] Home page shows list of saved worlds
- [ ] Can create a new world
- [ ] 7x7 hex grid visible with colored terrain
- [ ] Can pan the map by dragging
- [ ] Can zoom with pinch gesture
- [ ] Tapping a hex selects it (visual highlight)
- [ ] Tapping hex with location opens bottom sheet
- [ ] Sheet shows location name and description
- [ ] Sheet dismisses on swipe down
- [ ] Can export world as JSON file
- [ ] Can import world from JSON file
- [ ] World persists in localStorage across page reloads

### What's Deferred to Later Phases
- Generators (procedural settlements, dungeons, NPCs)
- Roads and rivers
- World clock / weather advancement
- Factions and clocks
- Full location detail views (sites, NPCs, rumors)
- Capacitor native build
- Authentication
- Cloud sync

---

## Phase 1: Foundation (Week 1)
- [ ] TypeScript interfaces for all entities (complete models/)
- [ ] SeededRandom class
- [ ] WeightedTable utility
- [ ] Hex math utilities (Honeycomb wrappers)
- [ ] Basic world generator (terrain only)

## Phase 2: Generators (Week 1-2)
- [ ] Hex terrain generator
- [ ] River generator (mountain/hill → water flow)
- [ ] Faction generator (2 factions)
- [ ] Faction relationship generator
- [ ] Settlement placement
- [ ] Road generator (connect settlements via pathfinding)
- [ ] Bridge placement (road crosses river)
- [ ] Settlement site generator
- [ ] NPC generator
- [ ] Rumor/notice generator
- [ ] Dungeon room generator
- [ ] Dungeon connection generator
- [ ] Encounter generator
- [ ] Treasure generator
- [ ] Magic item generator
- [ ] Hook generator
- [ ] Faction clock generator
- [ ] Weather generator
- [ ] World assembly (full pipeline)

## Phase 3: Hex Map UI (Week 2)
- [ ] Hex grid component (SVG)
- [ ] Terrain coloring
- [ ] River rendering (curved paths)
- [ ] Road rendering (dashed paths)
- [ ] Bridge rendering
- [ ] Location icons
- [ ] Pan gesture (@use-gesture)
- [ ] Pinch zoom gesture
- [ ] Hex selection highlight
- [ ] Header with day/weather

## Phase 4: Location Views (Week 3)
- [ ] Bottom sheet panel component
- [ ] Settlement overview
- [ ] Sites list and detail
- [ ] NPCs list and detail
- [ ] Stat block component
- [ ] Rumors list
- [ ] Notices list
- [ ] Dungeon overview
- [ ] Rooms list and detail
- [ ] Encounters display
- [ ] Treasure display

## Phase 5: Timeline & Clocks (Week 3-4)
- [ ] Timeline view layout
- [ ] World clock display
- [ ] Weather display
- [ ] Moon phase display
- [ ] Day advance buttons
- [ ] Faction clocks display
- [ ] Clock tick logic
- [ ] Upcoming events list
- [ ] Event log

## Phase 6: Polish & Persistence (Week 4)
- [ ] Auto-save logic
- [ ] Load on launch
- [ ] New world flow
- [ ] Haptic integration
- [ ] Animation/transitions
- [ ] Error handling
- [ ] iPad testing
- [ ] PWA manifest
- [ ] Capacitor build test

---

# Appendix

## Terrain Colors
| Terrain | Color |
|---------|-------|
| Plains | amber-200 |
| Forest | green-600 |
| Hills | amber-400 |
| Mountains | stone-500 |
| Water | blue-400 |
| Swamp | green-800 |

## Icon Mapping
| Location Type | Icon |
|---------------|------|
| Settlement | 🏘️ or building icon |
| Dungeon | ⚔️ or skull icon |
| Landmark | 🗿 or monument icon |
| Wilderness | 🌲 or tree icon |

## Shadowdark Stat Format
```
NAME
AC ##, HP ##, MV movement
STR +#, DEX +#, CON +#, INT +#, WIS +#, CHA +#
AL X, LV #
Attack +# (damage) [special]
Ability description
```
