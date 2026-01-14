# Scaffold Agent

Project setup and template configuration.

## Context Files
- `hexcrawl-prd.md` (Tech Stack, Phase 0 Setup)
- `package.json`
- `vite.config.ts`
- `tailwind.config.ts`

## Base Template
Using react-tanstarter, stripped down:
```bash
npx gitpick dotnize/react-tanstarter hexcrawl
```

## Keep
- React 19 + React Compiler
- TanStack Start + Router + Query
- Tailwind + shadcn/ui
- Vite

## Remove
- better-auth (no auth for MVP)
- drizzle-orm, @libsql/client
- postgres
- docker-compose.yml

## Add
```bash
pnpm add honeycomb-grid @use-gesture/react framer-motion nanoid date-fns zod
```

## Tasks
- Clone/strip tanstarter template
- Configure Tailwind, shadcn/ui
- Set up folder structure per PRD
- Install dependencies
- Verify `pnpm dev` works

## Folder Structure
```
src/
├── routes/
├── components/
│   ├── hex-map/
│   ├── locations/
│   └── timeline/
├── generators/
├── models/
├── lib/
├── hooks/
└── stores/
```

## Example Tasks
- "Set up project from tanstarter template"
- "Remove auth and database deps"
- "Configure shadcn/ui dark theme"
- "Verify dev server runs"
