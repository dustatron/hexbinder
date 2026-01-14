# Timeline Agent

World clock logic and time advancement (NOT React components).

## Context Files
- `hexcrawl-prd.md` (Clock, Weather, WorldState)
- `src/generators/WeatherGenerator.ts`
- `src/models/clock.ts`

## WorldState
```typescript
interface WorldState {
  day: number;
  season: Season;
  year: number;
  weather: WeatherState;
  moonPhase: MoonPhase;
}
```

## Clock System
```typescript
interface Clock {
  id: string;
  segments: number;
  filled: number;
  trigger: ClockTrigger;
  consequences: ClockConsequence[];
}

type ClockTrigger =
  | { type: "time"; daysPerTick: number }
  | { type: "event"; events: string[] }
  | { type: "manual" };
```

## Advance Day Logic
```typescript
function advanceDay(state: WorldState, clocks: Clock[]): {
  state: WorldState;
  clocks: Clock[];
  events: WorldEvent[];
} {
  // 1. Increment day
  // 2. Check season change (every 90 days?)
  // 3. Update moon phase (8-day cycle)
  // 4. Generate new weather
  // 5. Tick time-based clocks
  // 6. Check for clock completions
  // 7. Fire scheduled events
}
```

## Tasks
- Day advancement logic
- Weather generation on advance
- Clock tick calculations
- Event scheduling
- Season/moon phase logic

## Note
For UI components (WorldClock.tsx, FactionClocks.tsx), use **Frontend agent**.

## Example Tasks
- "Implement advanceDay function"
- "Create weather transition logic"
- "Build clock tick system"
- "Add moon phase calculation"
