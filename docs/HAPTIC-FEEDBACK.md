# Haptic Feedback Implementation - Bat Collision

## Overview

Added haptic feedback (controller vibration) when the baseball bat collides with balls in the VR environment. This provides tactile feedback to enhance the user's sense of impact and immersion.

## Implementation Details

### Modified File: `js/bat-manager.js`

#### New Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `hapticIntensity` | Float | 0.8 | Vibration strength (0.0 = no vibration, 1.0 = maximum) |
| `hapticDuration` | Float | 100 | Duration of vibration in milliseconds |
| `debugMode` | Bool | false | Enable console logging for debugging |

#### How It Works

```javascript
1. Bat collides with ball (Sphere)
       ↓
2. onCollision() triggered
       ↓
3. Play collision sound
       ↓
4. Find controller input component
       ↓
5. Access gamepad.hapticActuators
       ↓
6. Trigger pulse(intensity, duration)
       ↓
7. Controller vibrates!
```

### Component Hierarchy

The bat must be a child of a controller object that has an `input` component:

```
Controller (has input component)
  └── Hand Model
      └── Bat (has bat-manager component)
          └── Collision shape (physx)
```

The `bat-manager` automatically searches up the parent hierarchy to find the input component.

## WebXR Haptic API

### Primary API (Modern)
```javascript
gamepad.hapticActuators[0].pulse(intensity, duration)
```
- **intensity**: 0.0 to 1.0 (vibration strength)
- **duration**: milliseconds

### Fallback API (Older devices)
```javascript
gamepad.vibrationActuator.playEffect('dual-rumble', {
    startDelay: 0,
    duration: 100,
    weakMagnitude: 0.8,
    strongMagnitude: 0.8
})
```

### Browser Support

| API | Quest 2 | Quest 3 | PSVR 2 | Notes |
|-----|---------|---------|--------|-------|
| `hapticActuators` | ✅ Yes | ✅ Yes | ✅ Yes | Preferred, widely supported |
| `vibrationActuator` | ✅ Yes | ✅ Yes | ❌ No | Fallback for older devices |

## Configuration in Wonderland Editor

### 1. Select Bat Object
Find the bat object in your scene hierarchy (e.g., "Baseball Bat")

### 2. Configure bat-manager Component
Set the properties:

- **hapticIntensity**: `0.8` (80% strength)
  - Lower values = gentler feedback
  - Higher values = stronger feedback
  - Recommended: 0.6 - 1.0 for impacts

- **hapticDuration**: `100` (100ms)
  - Short duration = quick tap
  - Long duration = sustained vibration
  - Recommended: 50-150ms for ball hits

- **debugMode**: `false`
  - Enable to see console logs
  - Useful for troubleshooting

### 3. Verify Hierarchy
Ensure the bat is a descendant of a controller:
```
LeftController (or RightController)
  └── ... (any intermediate objects)
      └── Baseball Bat
```

## Testing

### Enable Debug Mode
Set `debugMode: true` in the component properties.

### Expected Console Output
```
[BatManager] Haptic feedback triggered: 0.8 intensity, 100ms
```

### If No Haptics:
Check console for warnings:
```
[BatManager] No input component found in parent hierarchy. Haptic feedback disabled.
```

This means the bat is not properly connected to a controller.

## Customization Examples

### Soft Touch
```javascript
hapticIntensity: 0.3
hapticDuration: 50
```
Use for: Gentle collisions, training mode

### Strong Impact
```javascript
hapticIntensity: 1.0
hapticDuration: 150
```
Use for: Hard hits, dramatic feedback

### Quick Tap
```javascript
hapticIntensity: 0.8
hapticDuration: 30
```
Use for: Rapid feedback, multiple quick hits

### Long Rumble
```javascript
hapticIntensity: 0.6
hapticDuration: 300
```
Use for: Special events, sustained contact

## Advanced Usage

### Variable Intensity Based on Impact

Modify `onCollision()` to calculate intensity from velocity:

```javascript
onCollision(other) {
    if (other.object.name === 'Sphere') {
        // Get collision velocity (if available from physx)
        const velocity = other.velocity || 1.0;
        
        // Scale haptic intensity based on velocity
        const originalIntensity = this.hapticIntensity;
        this.hapticIntensity = Math.min(velocity * 0.5, 1.0);
        
        this.soundSource.play();
        this.triggerHapticFeedback();
        
        // Restore original intensity
        this.hapticIntensity = originalIntensity;
    }
}
```

### Different Feedback for Different Objects

```javascript
onCollision(other) {
    const objectName = other.object.name;
    
    if (objectName === 'Sphere') {
        this.hapticIntensity = 0.8;
        this.hapticDuration = 100;
        this.triggerHapticFeedback();
    } else if (objectName === 'HeavyBall') {
        this.hapticIntensity = 1.0;
        this.hapticDuration = 200;
        this.triggerHapticFeedback();
    }
}
```

## Troubleshooting

### Issue: No Vibration

**Check 1**: Controller connection
```javascript
// Enable debugMode and check console
debugMode: true
```

Look for: `[BatManager] Haptic feedback triggered`

**Check 2**: Object hierarchy
```
Controller (must have 'input' component)
  └── ... 
      └── Bat (has bat-manager)
```

**Check 3**: Browser support
- Meta Quest Browser: ✅ Supported
- Firefox Reality: ✅ Supported  
- Chrome (desktop VR): ✅ Supported

### Issue: Vibration Too Weak

**Solution 1**: Increase intensity
```javascript
hapticIntensity: 1.0  // Maximum strength
```

**Solution 2**: Increase duration
```javascript
hapticDuration: 200   // Longer vibration
```

### Issue: Vibration Too Strong

**Solution**: Reduce intensity
```javascript
hapticIntensity: 0.5  // 50% strength
```

### Issue: Console Errors

**Error**: `Cannot read property 'hapticActuators' of undefined`

**Cause**: Controller not in XR session

**Solution**: This is normal before entering VR. Ignore if it only appears on page load.

## Performance Considerations

### CPU Impact
- ✅ Minimal - single API call
- ✅ No continuous computation
- ✅ Event-driven (only on collision)

### Frame Rate
- ✅ No impact - haptics run on separate thread
- ✅ Non-blocking operation

### Battery Usage
- ⚠️ Minimal increase (vibration motor)
- ⚠️ High-intensity + long duration = more battery drain
- ✅ Recommended settings have negligible impact

## Best Practices

### DO ✅
- Use intensities between 0.6-1.0 for impacts
- Keep durations under 200ms for most feedback
- Test on actual VR hardware (not simulator)
- Provide option to disable haptics (accessibility)

### DON'T ❌
- Don't use continuous vibration (drains battery, annoying)
- Don't use very low intensities (< 0.3) - users won't feel it
- Don't trigger too frequently (< 50ms apart) - feels glitchy
- Don't forget fallback for older API

## Accessibility

Consider adding a user setting to adjust or disable haptics:

```javascript
// In game settings
hapticStrength: 0.0 // 0 = off, 0.5 = medium, 1.0 = full

// In bat-manager
triggerHapticFeedback() {
    const adjustedIntensity = this.hapticIntensity * globalSettings.hapticStrength;
    gamepad.hapticActuators[0].pulse(adjustedIntensity, this.hapticDuration);
}
```

Some users may:
- Have sensitivity to vibrations
- Find haptics distracting
- Want to conserve battery

## References

- [MDN: Gamepad.hapticActuators](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/hapticActuators)
- [MDN: GamepadHapticActuator](https://developer.mozilla.org/en-US/docs/Web/API/GamepadHapticActuator)
- [Timmy Kokke: Controller Haptics in WebXR](https://timmykokke.com/blog/2022/2022-03-14-controller-haptics-in-webxr/)
- [W3C GamePad Extensions](https://w3c.github.io/gamepad/extensions.html)

## Summary

✅ **Haptic feedback added** to bat collisions  
✅ **Configurable** intensity and duration  
✅ **Automatic** controller detection  
✅ **Fallback** support for older devices  
✅ **Debug mode** for troubleshooting  
✅ **Production ready** with error handling  

**Status**: Ready to use! Configure properties in Wonderland Editor and test in VR.
