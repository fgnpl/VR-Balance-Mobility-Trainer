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
        
        console.log('[TargetCollision] Starting on object:', this.object.name);
        
        // Skip audio component - it doesn't exist in this Wonderland Engine version
        // this.soundSource = this.object.addComponent('audio-source', {
        //     src: 'sfx/click.wav', 
        //     spatial: true
        // });

        let cursorTarget = this.object.getComponent(CursorTarget);
        if (!cursorTarget) {
            console.log('[TargetCollision] No cursor-target found, adding one');
            cursorTarget = this.object.addComponent(CursorTarget);
        } else {
            console.log('[TargetCollision] cursor-target already exists');
        }

        cursorTarget.onDown.add(this.onDown.bind(this));
        console.log('[TargetCollision] Registered onDown callback');
    }

    onDown(_, cursor) {
        console.log('[TargetCollision] onDown called! Hit status:', this.hit);
        if (this.hit) return;
        
        // Skip audio playback - component doesn't exist
        // if (this.soundSource) this.soundSource.play();

        this.onHit();
    }

    onHit() {
        console.log('[TargetCollision] onHit called! Manager:', this.manager);
        if (this.hit) return;
        this.hit = true;
        
        const reactionTime = (performance.now() - this.object.startTime) / 1000;
        console.log('[TargetCollision] Reaction time:', reactionTime, 'Manager:', this.manager);
        
        if (this.manager) {
            this.manager.onTargetHit(this.object, reactionTime);
        } else {
            console.error('[TargetCollision] No manager set!');
        }
    }
}