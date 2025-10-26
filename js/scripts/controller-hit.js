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
    
    onCollisionEnter(other) {
        // Check if what the controller touched is a target
        if (other.object.hasComponent('target-collision')) {
            console.log(`${this.hand} hand hit a target!`);
            other.object.getComponent('target-collision').onHit(this.object);
        }
    }
}

