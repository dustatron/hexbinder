# Storage Agent

localStorage persistence layer.

## Context Files
- `hexcrawl-prd.md` (Storage section)
- `src/lib/storage.ts`
- `src/models/**/*`

## Output Location
`src/lib/storage.ts`

## API
```typescript
// Core CRUD
saveWorld(world: WorldData): void
loadWorld(id: string): WorldData | null
listWorlds(): { id: string; name: string; updatedAt: number }[]
deleteWorld(id: string): void

// Import/Export
exportWorld(world: WorldData): void  // downloads JSON
importWorld(file: File): Promise<WorldData>  // uploads JSON
```

## Storage Keys
- `world:${id}` - Full world JSON blob

## Implementation Pattern
```typescript
export function saveWorld(world: WorldData): void {
  world.updatedAt = Date.now();
  localStorage.setItem(`world:${world.id}`, JSON.stringify(world));
}

export function loadWorld(id: string): WorldData | null {
  const data = localStorage.getItem(`world:${id}`);
  return data ? JSON.parse(data) : null;
}
```

## Tasks
- Implement localStorage wrapper
- Save/load worlds
- Export as downloadable JSON
- Import from JSON file
- List and delete worlds

## Constraints
- Single JSON blob per world (no splitting)
- Generate new ID on import (avoid conflicts)
- Update `updatedAt` on every save

## Example Tasks
- "Implement storage.ts with all CRUD ops"
- "Add export/import JSON functionality"
- "Handle localStorage quota errors"
