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
        debugMode: Property.bool(false),       // Enable console logging
    };

    start() {
        this.soundSource = this.object.addComponent('audio-source', {src: 'sfx/click.wav', spatial: true});

        // Physx collision
        this.object.getComponent('physx').onCollision((type, other) => {
            // onCollision begin
            if (type === CollisionEventType.Touch) {
                this.onCollision(other);
            }
        });
    }

    onCollision(other) {
        if (other.object.name === 'Sphere') {
            // Play collision sound
            this.soundSource.play();
            
            // Trigger haptic feedback on controller using centralized system
            triggerHaptic(this.object, HapticPatterns.BALL_HIT_BAT, null, this.debugMode);
        }
    }
}