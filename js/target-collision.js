import {Component, Property} from '@wonderlandengine/api';

/**
 * target-collision
 * Simplified: rely on engine collision callbacks instead of manual per-frame distance checks.
 */
export class TargetCollision extends Component {
    static TypeName = 'target-collision';
    static Properties = {
        manager: Property.object()
    };

    start() {
        this.hit = false;
        // Cache start time if prefab didn't get it yet; TargetManager sets it on spawn.
        if (!this.object.startTime) this.object.startTime = performance.now();
        
        console.log('[TargetCollision] Initialized on:', this.object.name);
        
        // Check for collision component
        const collision = this.object.getComponent('collision');
        if (!collision) {
            console.error('[TargetCollision] ❌ Target has NO collision component!');
        } else {
            console.log('[TargetCollision] ✅ Target has collision component');
        }
    }

    // Called by ControllerHit OR direct collision events if enabled
    onHit(controllerObject) {
        console.log('[TargetCollision] onHit called! hit:', this.hit);
        if (this.hit) {
            console.log('[TargetCollision] Already hit, ignoring');
            return;
        }
        this.hit = true;
        const reactionTime = (performance.now() - this.object.startTime) / 1000;
        console.log('[TargetCollision] Registering hit with manager, RT:', reactionTime);
        
        if (!this.manager) {
            console.error('[TargetCollision] ❌ No manager set!');
            return;
        }
        
        this.manager.onTargetHit(this.object, reactionTime);
    }

    // Optional direct collision handling (if controller objects collide with sphere)
    onCollisionEnter(other) {
        console.log('[TargetCollision] onCollisionEnter with:', other.object?.name);
        if (this.hit) {
            console.log('[TargetCollision] Already hit');
            return;
        }
        // Accept collisions from controllers only
        const name = other.object?.name || '';
        console.log('[TargetCollision] Checking if controller:', name);
        if (name.includes('Controller') || name.includes('controller')) {
            console.log('[TargetCollision] 🎯 Controller collision detected!');
            this.onHit(other.object);
        } else {
            console.log('[TargetCollision] Not a controller');
        }
    }
}

