# Hexbinder

**[Try the demo](https://hexbinder.vercel.app/)**

A mobile-friendly hex sandbox tool for running improvised exploration games at the table. Name a world, pick a seed, and instantly get a fully populated hex crawl — terrain, settlements, dungeons, factions, NPCs, encounter tables, and a world calendar — all generated on the fly so you can run a session with zero prep.

Built for **Shadowdark RPG**. Designed for phones and tablets, works on desktop too.

## What It Does

You create a world by entering a name and an optional seed. Hexbinder procedurally generates:

- **Hex Map** — A spiral hex grid with varied terrain (forests, mountains, swamps, deserts, etc.), roads, rivers, and bridges. Tap any hex to explore its contents.
- **Settlements** — Villages, towns, and cities populated with NPCs, shops, tavern rumors, notice boards, and local hooks.
- **Dungeons** — Multi-room dungeon layouts with monsters, treasure, traps, and environmental details drawn from Shadowdark's rules.
- **Wilderness Lairs** — Bandit camps, cultist caves, witch huts, and other wilderness encounters tied to hex terrain.
- **Factions** — Organizations with goals, progress clocks, territory control, and named member NPCs that drive world events.
- **World Calendar** — A 28-day forecast of weather, faction activity, and random events to keep the world feeling alive between sessions.
- **Encounter Tables** — Per-hex 1d6 tables with monsters, NPCs, treasure, and omens ready to roll at the table.
- **Seeded Generation** — Every world is fully deterministic. Share a seed with another GM and they get the exact same world.

All data lives in your browser's localStorage — no accounts, no backend. Export/import JSON to back up or share worlds.

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
