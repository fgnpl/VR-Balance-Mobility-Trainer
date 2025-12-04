import {CollisionEventType, Component, Property} from '@wonderlandengine/api';
import {triggerHaptic, HapticPatterns} from './haptic-feedback.js';

/**
 * bat-manager
 * 
 * Handles bat collisions with balls and provides haptic feedback to the controller.
 */
export class BatManager extends Component {
    static TypeName = 'bat-manager';
    
    static Properties = {
        debugMode: Property.bool(true),       // Enable console logging (set to true for debugging)
    };

    start() {
        // Skip audio component - it doesn't exist in this Wonderland Engine version
        // this.soundSource = this.object.addComponent('audio-source', {src: 'sfx/click.wav', spatial: true});

        // Physx collision
        this.object.getComponent('physx').onCollision((type, other) => {
            // onCollision begin
            if (type === CollisionEventType.Touch) {
                this.onCollision(other);
            }
        });
        
        if (this.debugMode) {
            console.log('[BatManager] Initialized on object:', this.object.name);
        }
    }

    onCollision(other) {
        if (other.object.name === 'Sphere') {
            if (this.debugMode) {
                console.log('[BatManager] Ball collision detected!');
            }
            
            // Skip audio playback - component doesn't exist
            // if (this.soundSource) this.soundSource.play();
            
            // Trigger haptic feedback on controller using centralized system
            // Pass the bat object - triggerHaptic will search up the hierarchy for the input component
            triggerHaptic(this.object, HapticPatterns.BALL_HIT_BAT, null, this.debugMode);
        }
    }
}