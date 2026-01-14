# Polish Agent

Final touches and optimization (late-stage work).

## Context Files
- `hexcrawl-prd.md` (Success Criteria)
- Full codebase
- `src/native/**/*` (future)

## Tasks
- Haptic feedback (Capacitor prep)
- Error handling and loading states
- Auto-save on changes
- PWA manifest
- Performance optimization
- iPad testing
- Accessibility audit

## Haptics (Capacitor)
```typescript
// src/native/haptics.ts
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const haptic = {
  light: () => Haptics.impact({ style: ImpactStyle.Light }),
  medium: () => Haptics.impact({ style: ImpactStyle.Medium }),
  heavy: () => Haptics.impact({ style: ImpactStyle.Heavy }),
};
```

## PWA Requirements
- manifest.json
- Service worker
- Offline fallback
- Install prompt

## Performance Targets
- Generation < 3 seconds
- 60fps map interaction
- Fast world load

## iPad Checklist
- [ ] 44px touch targets
- [ ] Safe area insets
- [ ] Swipe gestures work
- [ ] Pinch zoom smooth
- [ ] Bottom sheet dismisses
- [ ] No text selection issues
- [ ] Keyboard handling

## Example Tasks
- "Add haptic feedback to day advance"
- "Implement auto-save with debounce"
- "Create PWA manifest"
- "Audit and fix touch targets"
