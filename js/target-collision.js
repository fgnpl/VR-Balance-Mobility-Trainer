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
    }

    // Called by ControllerHit OR direct collision events if enabled
    onHit(controllerObject) {
        if (this.hit) return;
        this.hit = true;
        const reactionTime = (performance.now() - this.object.startTime) / 1000;
        this.manager?.onTargetHit(this.object, reactionTime);
    }

    // Optional direct collision handling (if controller objects collide with sphere)
    onCollisionEnter(other) {
        if (this.hit) return;
        // Accept collisions from controllers only
        const name = other.object?.name || '';
        if (name.startsWith('Controller')) {
            this.onHit(other.object);
        }
    }
}

