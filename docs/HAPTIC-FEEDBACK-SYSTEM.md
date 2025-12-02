# Comprehensive Haptic Feedback System

## Overview

A centralized haptic feedback system has been implemented across the VR Balance & Mobility Trainer application to provide tactile feedback for all major user interactions. The system uses the WebXR Gamepad API with predefined patterns optimized for different interaction types.

## Implementation Summary

### New Files
- **`js/haptic-feedback.js`** - Centralized haptic utility with predefined patterns

### Modified Files
- **`js/bat-manager.js`** - Haptics when bat hits balls
- **`js/ball-collision.js`** - Haptics for catching and deflecting balls
- **`js/beam-walk-manager.js`** - Haptics for falls, success, and warnings
- **`js/replay-button-catch.js`** - Haptics for button interactions
- **`js/replay-button-react.js`** - Haptics for button interactions
- **`js/sphere-spawner.js`** - Haptics for target hits and hovers

## Haptic Patterns

### Pattern Definitions

All patterns are defined in `HapticPatterns` with optimized intensity (0.0-1.0) and duration (ms):

| Pattern | Intensity | Duration | Use Case |
|---------|-----------|----------|----------|
| `HOVER` | 0.3 | 20ms | Light touch/hover over UI |
| `BUTTON_DOWN` | 0.8 | 50ms | Button press |
| `BUTTON_UP` | 0.5 | 30ms | Button release |
| `BALL_CATCH` | 0.6 | 80ms | Successfully catch ball |
| `BALL_DEFLECT` | 0.9 | 100ms | Hard deflect/hit ball |
| `BALL_HIT_BAT` | 0.8 | 100ms | Bat collision with ball |
| `BALL_MISS` | 0.4 | 150ms | Missed catch (softer, longer) |
| `TARGET_HIT` | 0.7 | 60ms | Hit reaction target |
| `TARGET_TIMEOUT` | 0.3 | 200ms | Target timeout warning |
| `BEAM_FALL` | 1.0 | 300ms | Fell off beam (strong alert) |
| `BEAM_SUCCESS` | 0.5 | 150ms | Reached beam end |
| `BEAM_WARNING` | 0.4 | 100ms | Getting too far from center |
| `GAME_START` | 0.6 | 100ms | Game state start |
| `GAME_END` | 0.7 | 150ms | Game state end |
| `LIGHT` | 0.3 | 40ms | Generic light feedback |
| `MEDIUM` | 0.6 | 80ms | Generic medium feedback |
| `STRONG` | 1.0 | 120ms | Generic strong feedback |

## UX Design Principles

### 1. **Intensity Hierarchy**
- **Light (0.3-0.4)**: Subtle feedback for hover, warnings, ambient cues
- **Medium (0.5-0.7)**: Confirmatory feedback for actions, hits, catches
- **Strong (0.8-1.0)**: Important events, impacts, alerts

### 2. **Duration Guidelines**
- **Quick (20-50ms)**: UI interactions, hovers, light touches
- **Standard (60-100ms)**: Gameplay actions, hits, catches
- **Long (150-300ms)**: Alerts, warnings, important state changes

### 3. **Contextual Feedback**
- **Success actions** → Moderate intensity, satisfying duration
- **Failure/Warning** → Longer duration, lower intensity (avoid punishment feel)
- **Impacts** → High intensity, short to medium duration
- **UI Navigation** → Low intensity, very short duration

## Implementation Details

### Basic Usage

```javascript
import { triggerHaptic, HapticPatterns } from './haptic-feedback.js';

// Using predefined pattern
triggerHaptic(controllerObject, HapticPatterns.BALL_CATCH);

// Custom intensity and duration
triggerHaptic(controllerObject, 0.7, 100);

// With debug logging
triggerHaptic(controllerObject, HapticPatterns.TARGET_HIT, null, true);
```

### Automatic Controller Detection

The system automatically searches the parent hierarchy for input components:

```javascript
// Works with bat object (searches for parent controller)
triggerHaptic(this.object, HapticPatterns.BALL_HIT_BAT);

// Works with cursor object from button events
triggerHaptic(cursor.object, HapticPatterns.BUTTON_DOWN);

// Works with direct controller reference
triggerHaptic(this.leftController, HapticPatterns.BALL_CATCH);
```

## Feature-by-Feature Breakdown

### 1. Bat Collisions (`bat-manager.js`)
- **Trigger**: When bat hits sphere
- **Pattern**: `BALL_HIT_BAT` (0.8 intensity, 100ms)
- **UX**: Strong, satisfying feedback for successful hit
- **Note**: Automatically finds controller via parent hierarchy

### 2. Ball Catching (`ball-collision.js`)
#### Successful Catch
- **Trigger**: Controller near ball, low velocity
- **Pattern**: `BALL_CATCH` (0.6 intensity, 80ms)
- **UX**: Soft, satisfying grab sensation

#### Deflect
- **Trigger**: Controller near ball, high velocity
- **Pattern**: `BALL_DEFLECT` (0.9 intensity, 100ms)
- **UX**: Strong impact feeling for aggressive deflection

### 3. Beam Walk (`beam-walk-manager.js`)
#### Fall Detection
- **Trigger**: Player falls off beam or goes too far
- **Pattern**: `BEAM_FALL` (1.0 intensity, 300ms)
- **Controllers**: Both left and right
- **UX**: Strong alert to clearly communicate failure

#### Success
- **Trigger**: Player reaches end of beam
- **Pattern**: `BEAM_SUCCESS` (0.5 intensity, 150ms)
- **Controllers**: Both left and right
- **UX**: Celebratory, satisfying completion feedback

#### Warning
- **Trigger**: Getting near edge (70% of max distance)
- **Pattern**: `BEAM_WARNING` (0.4 intensity, 100ms)
- **Controllers**: Both left and right
- **Throttle**: Once per 2 seconds (prevents spam)
- **UX**: Gentle reminder without being annoying

### 4. Button Interactions (`replay-button-*.js`)
#### Hover
- **Trigger**: Cursor enters button area
- **Pattern**: `HOVER` (0.3 intensity, 20ms)
- **UX**: Subtle confirmation of hover state

#### Press Down
- **Trigger**: Button press
- **Pattern**: `BUTTON_DOWN` (0.8 intensity, 50ms)
- **UX**: Satisfying click feedback

#### Release
- **Trigger**: Button release
- **Pattern**: `BUTTON_UP` (0.5 intensity, 30ms)
- **UX**: Confirmation of release

### 5. Target Reactions (`sphere-spawner.js`)
#### Target Hit
- **Trigger**: Player hits reaction target
- **Pattern**: `TARGET_HIT` (0.7 intensity, 60ms)
- **UX**: Quick, satisfying confirmation

#### Target Hover
- **Trigger**: Cursor hovers over target
- **Pattern**: `HOVER` (0.3 intensity, 20ms)
- **UX**: Subtle indication of aimability

## Testing & Configuration

### Debug Mode
Enable debug logging in components:
```javascript
// In Wonderland Editor, set debugMode property to true
// Console will show:
// [Haptic] ✓ Pulse: 0.80 intensity, 100ms on right hand
```

### Browser Compatibility
- **Primary API**: `gamepad.hapticActuators[0].pulse()` (modern)
- **Fallback**: `gamepad.vibrationActuator.playEffect()` (older)
- **Supported Devices**: Meta Quest 2/3, Pico 4, PSVR 2, Valve Index

### Testing Checklist
- [ ] Bat hits ball → Medium-strong vibration
- [ ] Catch ball with slow hand → Soft vibration
- [ ] Deflect ball with fast hand → Strong vibration
- [ ] Fall off beam → Very strong, long vibration (both hands)
- [ ] Reach beam end → Satisfying success vibration (both hands)
- [ ] Near beam edge → Gentle warning (throttled)
- [ ] Button hover → Very subtle pulse
- [ ] Button click → Clear click feedback
- [ ] Hit reaction target → Quick confirmation

## Performance Considerations

### Non-Blocking
All haptic calls are non-blocking and won't affect frame rate.

### Error Handling
- Gracefully degrades if haptics unavailable
- Safe to call even when not in VR session
- Won't crash if controllers not found

### Throttling
- Beam warnings throttled to once per 2 seconds
- Prevents haptic fatigue from continuous triggers

## Accessibility Notes

### Intensity Considerations
- **Never exceed 1.0 intensity** - can be uncomfortable
- **Keep most feedback < 0.8** - reserve strong vibrations for important events
- **Provide visual alternatives** - haptics enhance but shouldn't be sole feedback

### Duration Guidelines
- **Avoid very long vibrations** - can be fatiguing/uncomfortable
- **Maximum 300ms for warnings** - longer durations should be rare
- **Keep UI feedback short** - 20-50ms for responsiveness

### Frequency Considerations
- **Throttle repeating events** - prevent haptic spam
- **Distinct patterns for different events** - aids recognition
- **Test with actual users** - haptic preferences vary

## Future Enhancements

### Potential Additions
1. **Custom patterns per game mode** - Different feels for different drills
2. **Intensity scaling** - Based on impact force, distance, etc.
3. **User preferences** - Allow users to adjust intensity globally
4. **Achievement haptics** - Special patterns for milestones
5. **Directional cues** - Different patterns for left vs right

### Pattern Ideas
```javascript
// Not yet implemented - examples for future
COMBO_HIT: { intensity: 0.9, duration: 50 },  // Multiple hits in sequence
PERFECT_CATCH: { intensity: 0.7, duration: 120 }, // Centered catch
NEAR_MISS: { intensity: 0.4, duration: 80 },  // Almost caught
POWER_UP: { intensity: 0.6, duration: 200 },  // Collect power-up
COUNTDOWN: { intensity: 0.5, duration: 100 }, // Game countdown tick
```

## Troubleshooting

### No Haptics in VR
1. Check browser console for errors
2. Verify in VR session (haptics only work in WebXR)
3. Enable `debugMode` to see detailed logs
4. Test on known-compatible device (Quest 2/3)

### Weak/Strong Vibrations
- Adjust pattern intensity values in `haptic-feedback.js`
- Different devices have different vibration motors
- Test on target hardware

### Haptics Feel Random
- Check parent hierarchy (bat must be child of controller)
- Verify controller objects are correctly linked
- Enable debug mode to see which hand is triggering

## Code Reference

### Main API
```javascript
// File: js/haptic-feedback.js

// Trigger with pattern
triggerHaptic(object, HapticPatterns.PATTERN_NAME);

// Trigger with custom values
triggerHaptic(object, intensity, duration);

// With debug logging
triggerHaptic(object, pattern, null, true);
```

### Pattern Access
```javascript
import { HapticPatterns } from './haptic-feedback.js';

// All patterns available as object properties
HapticPatterns.BALL_CATCH
HapticPatterns.BUTTON_DOWN
HapticPatterns.BEAM_FALL
// etc.
```

## Summary

The haptic feedback system provides:
✅ **Consistency** - Centralized patterns across all interactions
✅ **UX-Optimized** - Intensity and duration tuned for each use case
✅ **Robust** - Automatic controller detection, fallbacks, error handling
✅ **Accessible** - Thoughtful intensities, throttling, and durations
✅ **Maintainable** - Single source of truth for all haptic patterns
✅ **Debuggable** - Optional logging for testing and troubleshooting

The system significantly enhances immersion and provides clear, comfortable tactile feedback for all major interactions in the VR training application.
