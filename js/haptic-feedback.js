/**
 * Centralized haptic feedback system for VR controllers
 * 
 * Provides consistent haptic feedback across the VR application with
 * predefined intensity and duration settings for different interaction types.
 * 
 * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/hapticActuators
 */


export const HapticPatterns = {
    // Light touch/hover feedback (subtle)
    HOVER: { intensity: 0.3, duration: 20 },
    
    // Button click feedback (quick, medium)
    BUTTON_DOWN: { intensity: 0.8, duration: 50 },
    BUTTON_UP: { intensity: 0.5, duration: 30 },
    
    // Ball interactions
    BALL_CATCH: { intensity: 0.6, duration: 80 },      // Soft catch
    BALL_DEFLECT: { intensity: 0.9, duration: 100 },   // Hard deflect
    BALL_HIT_BAT: { intensity: 0.8, duration: 100 },   // Bat hit
    BALL_MISS: { intensity: 0.4, duration: 150 },      // Missed catch (longer, softer)
    
    // Target interactions
    TARGET_HIT: { intensity: 0.7, duration: 60 },      // Successfully hit target
    TARGET_TIMEOUT: { intensity: 0.3, duration: 200 }, // Target timed out (warning)
    
    // Beam walk events
    BEAM_FALL: { intensity: 1.0, duration: 300 },      // Fell off beam (strong, long)
    BEAM_SUCCESS: { intensity: 0.5, duration: 150 },   // Reached end successfully
    BEAM_WARNING: { intensity: 0.4, duration: 100 },   // Getting too far from center
    
    // Game state changes
    GAME_START: { intensity: 0.6, duration: 100 },
    GAME_END: { intensity: 0.7, duration: 150 },
    
    // Generic feedback levels
    LIGHT: { intensity: 0.3, duration: 40 },
    MEDIUM: { intensity: 0.6, duration: 80 },
    STRONG: { intensity: 1.0, duration: 120 },
};

/**
 * Trigger haptic feedback on a controller
 * 
 * @param {Object} controllerObject - Wonderland object with input component (or cursor object)
 * @param {number|Object} intensityOrPattern - Either a number (0.0-1.0) or a HapticPattern object
 * @param {number} duration - Duration in milliseconds (optional if using pattern)
 * @param {boolean} debugMode - Enable console logging
 */
export function triggerHaptic(controllerObject, intensityOrPattern = 0.5, duration = 50, debugMode = false) {
    if (!controllerObject) {
        if (debugMode) console.warn('[Haptic] No controller object provided');
        return;
    }

    // Handle pattern objects
    let intensity, actualDuration;
    if (typeof intensityOrPattern === 'object') {
        intensity = intensityOrPattern.intensity;
        actualDuration = intensityOrPattern.duration;
        if (debugMode) {
            const patternName = Object.keys(HapticPatterns).find(
                key => HapticPatterns[key] === intensityOrPattern
            ) || 'CUSTOM';
            console.log(`[Haptic] Using pattern: ${patternName}`);
        }
    } else {
        intensity = intensityOrPattern;
        actualDuration = duration;
    }

    // Clamp intensity
    intensity = Math.max(0.0, Math.min(1.0, intensity));

    try {
        // Try to get input component directly
        let inputComponent = controllerObject.getComponent('input');
        
        // If not found, might be a cursor object - search parent hierarchy
        if (!inputComponent) {
            inputComponent = findInputComponent(controllerObject);
        }

        if (!inputComponent) {
            if (debugMode) console.warn('[Haptic] No input component found');
            return;
        }

        const xrInputSource = inputComponent.xrInputSource;
        if (!xrInputSource) {
            if (debugMode) console.warn('[Haptic] Not in VR session');
            return;
        }

        const gamepad = xrInputSource.gamepad;
        if (!gamepad) {
            if (debugMode) console.warn('[Haptic] No gamepad available');
            return;
        }

        // Primary API: hapticActuators (modern)
        if (gamepad.hapticActuators && gamepad.hapticActuators.length > 0) {
            gamepad.hapticActuators[0].pulse(intensity, actualDuration);
            
            if (debugMode) {
                console.log(`[Haptic] Pulse: ${intensity.toFixed(2)} intensity, ${actualDuration}ms on ${inputComponent.handedness} hand`);
            }
        }
        // Fallback API: vibrationActuator (older devices)
        else if (gamepad.vibrationActuator) {
            gamepad.vibrationActuator.playEffect('dual-rumble', {
                startDelay: 0,
                duration: actualDuration,
                weakMagnitude: intensity,
                strongMagnitude: intensity
            });
            
            if (debugMode) {
                console.log(`[Haptic] Vibration (fallback): ${intensity.toFixed(2)} intensity, ${actualDuration}ms`);
            }
        } else {
            if (debugMode) console.warn('[Haptic] No haptic actuators available');
        }

    } catch (error) {
        console.error('[Haptic] Error triggering feedback:', error);
    }
}

/**
 * Recursively search up the parent hierarchy for an input component
 */
function findInputComponent(obj) {
    if (!obj) return null;
    
    const input = obj.getComponent('input');
    if (input) return input;
    
    const parent = obj.parent;
    if (parent) {
        return findInputComponent(parent);
    }
    
    return null;
}
