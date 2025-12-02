# Haptic Feedback Quick Reference

## Quick Start

```javascript
import { triggerHaptic, HapticPatterns } from './haptic-feedback.js';

// In any component:
triggerHaptic(controllerObject, HapticPatterns.BALL_CATCH);
```

## Common Patterns

### UI Interactions
```javascript
triggerHaptic(cursor.object, HapticPatterns.HOVER);        // 0.3, 20ms
triggerHaptic(cursor.object, HapticPatterns.BUTTON_DOWN);  // 0.8, 50ms
triggerHaptic(cursor.object, HapticPatterns.BUTTON_UP);    // 0.5, 30ms
```

### Ball Gameplay
```javascript
triggerHaptic(controller, HapticPatterns.BALL_CATCH);      // 0.6, 80ms - Soft
triggerHaptic(controller, HapticPatterns.BALL_DEFLECT);    // 0.9, 100ms - Strong
triggerHaptic(controller, HapticPatterns.BALL_HIT_BAT);    // 0.8, 100ms
```

### Beam Walk
```javascript
triggerHaptic(controller, HapticPatterns.BEAM_FALL);       // 1.0, 300ms - Alert!
triggerHaptic(controller, HapticPatterns.BEAM_SUCCESS);    // 0.5, 150ms - Yay!
triggerHaptic(controller, HapticPatterns.BEAM_WARNING);    // 0.4, 100ms - Careful
```

### Target Reactions
```javascript
triggerHaptic(cursor.object, HapticPatterns.TARGET_HIT);   // 0.7, 60ms
```

## Intensity Guide

| Level | Intensity | Use For |
|-------|-----------|---------|
| **Subtle** | 0.3-0.4 | Hover, warnings, ambient |
| **Medium** | 0.5-0.7 | Actions, hits, success |
| **Strong** | 0.8-1.0 | Impacts, alerts, failures |

## Duration Guide

| Duration | Use For |
|----------|---------|
| **20-50ms** | UI interactions, quick taps |
| **60-100ms** | Gameplay actions, standard feedback |
| **150-300ms** | Warnings, alerts, important events |

## Custom Haptics

```javascript
// Custom intensity (0.0-1.0) and duration (ms)
triggerHaptic(controller, 0.7, 100);
```

## Debug Mode

```javascript
// Enable debug logging (4th parameter)
triggerHaptic(controller, HapticPatterns.BALL_CATCH, null, true);
// Console: [Haptic] ✓ Pulse: 0.60 intensity, 80ms on right hand
```

## Both Controllers

```javascript
// Trigger on both controllers
if (this.leftController) {
    triggerHaptic(this.leftController, HapticPatterns.BEAM_FALL);
}
if (this.rightController) {
    triggerHaptic(this.rightController, HapticPatterns.BEAM_FALL);
}
```

## Implementation Examples

### Collision Detection
```javascript
onCollision(other) {
    if (other.object.name === 'Ball') {
        triggerHaptic(this.object, HapticPatterns.BALL_HIT_BAT);
    }
}
```

### Button Click
```javascript
onDown = (_, cursor) => {
    triggerHaptic(cursor.object, HapticPatterns.BUTTON_DOWN);
    // ... button logic
};
```

### Catch/Deflect Logic
```javascript
if (velocity < threshold) {
    // Slow = catch
    triggerHaptic(controller, HapticPatterns.BALL_CATCH);
} else {
    // Fast = deflect
    triggerHaptic(controller, HapticPatterns.BALL_DEFLECT);
}
```

## All Available Patterns

```javascript
HapticPatterns.HOVER
HapticPatterns.BUTTON_DOWN
HapticPatterns.BUTTON_UP
HapticPatterns.BALL_CATCH
HapticPatterns.BALL_DEFLECT
HapticPatterns.BALL_HIT_BAT
HapticPatterns.BALL_MISS
HapticPatterns.TARGET_HIT
HapticPatterns.TARGET_TIMEOUT
HapticPatterns.BEAM_FALL
HapticPatterns.BEAM_SUCCESS
HapticPatterns.BEAM_WARNING
HapticPatterns.GAME_START
HapticPatterns.GAME_END
HapticPatterns.LIGHT
HapticPatterns.MEDIUM
HapticPatterns.STRONG
```

## Throttling Example

```javascript
// Prevent haptic spam
if (performance.now() - this.lastHapticTime > 2000) {
    triggerHaptic(controller, HapticPatterns.BEAM_WARNING);
    this.lastHapticTime = performance.now();
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No vibration | Ensure in VR session, check console |
| Wrong controller vibrates | Check parent hierarchy |
| Too strong/weak | Adjust pattern intensity |
| Haptic spam | Add throttling |

## Best Practices

✅ **DO**:
- Use predefined patterns for consistency
- Keep most feedback under 0.8 intensity
- Throttle repeating events
- Provide visual feedback as well

❌ **DON'T**:
- Exceed 1.0 intensity (uncomfortable)
- Use very long durations (> 300ms)
- Spam haptics on every frame
- Rely solely on haptics for feedback

## Browser Support

- ✅ Meta Quest 2/3
- ✅ Pico 4
- ✅ PSVR 2
- ✅ Valve Index
- ⚠️ Fallback API for older devices

---

**Full Documentation**: See `docs/HAPTIC-FEEDBACK-SYSTEM.md`
