import {Component, Property} from '@wonderlandengine/api';
import {CursorTarget} from '@wonderlandengine/components';

/**
 * target-collision
 */

export class TargetCollision extends Component {
    static TypeName = 'target-collision';
    static Properties = {
        manager: Property.object()
    };

    start() {
        this.hit = false;
                
        let cursorTarget = this.object.getComponent(CursorTarget);
        if (!cursorTarget) {
            cursorTarget = this.object.addComponent(CursorTarget);
        } 

        cursorTarget.onDown.add(this.onDown.bind(this));
    }

    onDown(_, cursor) {
        if (this.hit) return;
        this.onHit();
    }

    onHit() {
        if (this.hit) return;
        this.hit = true;
        
        const reactionTime = (performance.now() - this.object.startTime) / 1000;
        console.log('[TargetCollision] Reaction time:', reactionTime, 'Manager:', this.manager);
        
        if (this.manager) {
            this.manager.onTargetHit(this.object, reactionTime);
        } 
    }
}