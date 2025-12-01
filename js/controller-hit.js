import {Component, Property} from '@wonderlandengine/api';

/**
 * controller-hit
 */
export class ControllerHit extends Component {
    static TypeName = 'controller-hit';
    /* Properties that are configurable in the editor */
    static Properties = {
        hand: Property.string('right'),
    };
    
    start() {
        console.log(`[ControllerHit] ${this.hand} controller initialized`);
        
        // Check for collision component
        const collision = this.object.getComponent('collision');
        if (!collision) {
            console.error(`[ControllerHit] ❌ ${this.hand} controller has NO collision component!`);
            console.error(`[ControllerHit] Add 'collision' component in editor for hits to work!`);
        } else {
            console.log(`[ControllerHit] ✅ ${this.hand} controller has collision component`);
        }
    }
    
    onCollisionEnter(other) {
        console.log(`[ControllerHit] 🔵 ${this.hand} collision DETECTED with:`, other.object?.name);
        console.log(`[ControllerHit] Other object has target-collision?`, other.object?.hasComponent('target-collision'));
        
        // Check if what the controller touched is a target
        if (other.object && other.object.hasComponent('target-collision')) {
            console.log(`[ControllerHit] 🎯 ${this.hand} hand hit a target!`);
            other.object.getComponent('target-collision').onHit(this.object);
        } else {
            console.log(`[ControllerHit] ${this.hand} hit non-target object`);
        }
    }
}

