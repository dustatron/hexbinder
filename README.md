# Hexbinder

Procedural sandbox generator for tabletop RPG GMs. Generates hex maps, settlements, dungeons, NPCs, factions, and tracks world state over time.

Built for **Shadowdark RPG**. Optimized for iPad, works on web.

## Features

- **Hex Map Generation** - Spiral terrain with roads, rivers, bridges
- **Settlements** - Villages, towns, cities with NPCs, shops, rumors, notices
- **Dungeons** - Room-by-room layouts with monsters, treasure, traps
- **Wilderness Lairs** - Bandit hideouts, cultist caves, witch huts, etc.
- **Factions** - Goals, clocks, territory, member NPCs
- **World Calendar** - 28-day event forecasting, weather, faction activity
- **Encounter Tables** - 1d6 tables with monster/NPC/treasure/omen results
- **Seeded Generation** - Same seed = identical world, shareable

## Quick Start

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm check` | Format, lint, type check |

## Tech Stack

- React 19 + React Compiler
- TanStack Start/Router/Query
- Vite 8, TypeScript, Tailwind 4
- Honeycomb (hex math)
- Framer Motion, @use-gesture/react
- localStorage (no backend)

## Project Structure

```
src/
├── routes/              # TanStack Router pages
├── components/
│   ├── hex-map/         # Map rendering, tiles, edges
│   ├── encounter-table/ # Shared encounter tables
│   └── location-detail/ # Settlement/dungeon/faction views
├── generators/          # Procedural generation
├── models/              # TypeScript types
└── lib/                 # Utilities, storage, monsters
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | World list, create new |
| `/world/$worldId` | Hex map view |
| `/world/$worldId/hex/$q/$r` | Hex detail page |
| `/world/$worldId/location/$locationId` | Location detail |
| `/world/$worldId/faction/$factionId` | Faction detail |
| `/atlas/$worldId` | World atlas, calendar, factions |

## Reference Data

`shadowdark-reference/` contains Shadowdark RPG JSON:
- `monsters.json` - Monster stats for encounters
- `spells.json`, `equipment.json`, `magic-items.json`

## Storage

All data in localStorage. Export/import JSON for backup.

```
world:${id} -> WorldData JSON blob
```

## License

Private project.
