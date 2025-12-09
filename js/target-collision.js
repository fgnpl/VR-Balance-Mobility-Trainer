import {Component, Property} from '@wonderlandengine/api';
import {CursorTarget} from '@wonderlandengine/components';

/**
 * target-collision
 * Class to handle collisions with the spawned spheres
 */

export class TargetCollision extends Component {
    static TypeName = 'target-collision';
    static Properties = {
        manager: Property.object()
    };

    start() {
        this.hit = false;
        
        // Obtaining cursor component
        let cursorTarget = this.object.getComponent(CursorTarget);
        if (!cursorTarget) {
            cursorTarget = this.object.addComponent(CursorTarget);
        } 

        cursorTarget.onDown.add(this.onDown.bind(this));
    }

    // If sphere is clicked
    onDown(_, cursor) {
        if (this.hit) return;
        this.onHit();
    }

    onHit() {
        if (this.hit) return;
        this.hit = true;
        
        // Logging reaction time
        const reactionTime = (performance.now() - this.object.startTime) / 1000;
        console.log('[TargetCollision] Reaction time:', reactionTime, 'Manager:', this.manager);
        
        // Registering hit with manager
        if (this.manager) {
            this.manager.onTargetHit(this.object, reactionTime);
        } 
    }
}