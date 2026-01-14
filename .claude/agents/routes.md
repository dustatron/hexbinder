# Routes Agent

TanStack Router configuration.

## Context Files
- `hexcrawl-prd.md` (Information Architecture)
- `src/routes/**/*`

## Route Structure
```
/                      → WorldList (home)
/world/$worldId        → World view (hex map)
```

## File Structure
```
src/routes/
├── __root.tsx         # Root layout
├── index.tsx          # Home / WorldList
└── world.$worldId.tsx # World view
```

## Route Loaders
```typescript
// world.$worldId.tsx
export const Route = createFileRoute('/world/$worldId')({
  loader: ({ params }) => loadWorld(params.worldId),
  component: WorldView,
});
```

## Tasks
- Set up route structure
- Home route `/` (WorldList)
- World route `/world/$worldId` (HexMap)
- Handle navigation
- Add route loaders for world data
- 404 handling for missing worlds

## Patterns
- Use loaders to fetch world data
- Navigate with `useNavigate()`
- Params via `useParams()`
- Keep routes thin (logic in components)

## Example Tasks
- "Set up TanStack Router with home and world routes"
- "Add loader to fetch world data from localStorage"
- "Handle navigation from WorldList to World view"
