# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hexbinder is a procedural sandbox generator and campaign management tool for tabletop RPG GMs. Generates hex maps, settlements, dungeons, NPCs, factions, and tracks world state over time.

**Status:** Pre-implementation (PRD complete, no codebase yet)
**Platform:** iPad (primary), Web (secondary)
**Rule System:** Shadowdark RPG

## Task Tracking (Beads)

Use `bd` (Beads) for task management instead of TodoWrite. Git-backed, stored in `.beads/`.

**Install:** `npm install -g @beads/bd` or `brew install steveyegge/beads/bd`

**Initialize project tasks:** `./scripts/init-beads-tasks.sh`

```bash
bd ready              # show unblocked tasks
bd create "Title"     # new task
bd create "Title" -p 0  # priority-zero task
bd dep add <child> <parent>  # link dependency
bd show <id>          # task details
bd close <id>         # mark complete
```

Task IDs are hash-based (e.g., `bd-a1b2`). Supports hierarchy: `bd-a3f8.1.1`

**Workflow:** Check `bd ready` before starting work. Create tasks for multi-step features. Use deps to track blockers.

## Commands (Expected)

```bash
pnpm dev         # start dev server
pnpm build       # production build
pnpm preview     # preview production build
```

## Tech Stack

- React 19 + React Compiler
- TanStack Start/Router/Query/Form
- Vite, TypeScript (strict), Tailwind, shadcn/ui
- Zustand (state), Zod (validation)
- Honeycomb (hex math), @use-gesture/react, Framer Motion
- localStorage + JSON export/import (no backend)

## Project Setup (Phase 0)

Base template: `npx gitpick dotnize/react-tanstarter hexcrawl`

Remove: better-auth, drizzle-orm, postgres, @libsql/client, docker-compose
Add: honeycomb-grid, @use-gesture/react, framer-motion, nanoid

## Architecture

```
src/
├── routes/           # TanStack Router pages
├── components/       # React components
│   ├── hex-map/      # Hex grid rendering
│   ├── locations/    # Settlement/dungeon views
│   └── timeline/     # World clock/factions
├── generators/       # Procedural generation (SeededRandom, terrain, settlements, dungeons)
├── models/           # TypeScript interfaces
├── lib/              # Utilities (storage.ts, hex-utils.ts)
├── hooks/            # Custom React hooks
└── stores/           # Zustand stores
```

## Key Patterns

**Seeded Generation:** All procedural content uses deterministic seeded random for reproducibility. Same seed = same world.

**Storage:** localStorage with `world:${id}` keys. WorldData is a single JSON blob containing all hexes, locations, NPCs, factions, clocks.

**Hex Coordinates:** Axial (q,r) system via Honeycomb library.

## Agent Selection

| Task | Agent |
|------|-------|
| React components, UI, styling, animations, gestures | Frontend |
| Procedural generation, random algorithms, content tables | Generator |
| Project setup, deps | Scaffold |
| TypeScript interfaces | Models |
| localStorage persistence | Storage |
| TanStack Router config | Routes |
| Hex math utilities | HexMap |
| Time/clock logic | Timeline |

## Reference Data

`shadowdark-reference/` contains Shadowdark RPG JSON data (monsters, spells, equipment, magic-items) and markdown rule references for generators.

## Core Entities

World, Hex, Location (settlement/dungeon/landmark/wilderness), NPC, Faction, Clock, Hook, Weather

See `hexcrawl-prd.md` for complete data models and generator specs.
