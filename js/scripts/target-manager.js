import {Component, Property} from '@wonderlandengine/api';

/**
 * target-manager
 */

console.log("target-manager.js loaded");

export class TargetManager extends Component {
    static TypeName = 'target-manager';
    /* Properties that are configurable in the editor */
    static Properties = {
        spherePrefab: Property.object(),
        maxTargets: Property.int(20),
        spawnInterval: Property.float(1.0) // seconds
    };
    
    start() {
        this.hitCount = 0;
        this.reactionTimes = [];
        this.activeTarget = null;
        this.spherePrefab.active = false;

        this.spawnTarget();
    }

    spawnTarget() {
        // Ending game when the required number of spheres have been hit
        if (this.hitCount >= this.maxTargets) {
            this.endGame();
            return;
        }

        // Creating a new sphere using the prefab
        const sphere = this.spherePrefab.clone(this.object);
        sphere.active = true;
        this.activeTarget = sphere;

        // Random position on curved rectangular surface
        const x = (Math.random() - 0.5) * 1.5;
        const y = 1.5 + Math.random() * 0.5;
        const z = -1.5 - (Math.pow(x, 2) / 2);

        console.log("Target position:", x, y, z); 

        sphere.setPositionWorld([x, y, z]);
        sphere.startTime = performance.now();

        // Add collision component
        const collisionComp = sphere.addComponent('target-collision');
        collisionComp.manager = this;
        console.log("Spawned at:", sphere.getPositionWorld());
    }

    onTargetHit(sphere, reactionTime) {
        this.hitCount++;
        this.reactionTimes.push(reactionTime);

        sphere.destroy();

        setTimeout(() => this.spawnTarget(), this.spawnInterval * 1000);
    }

    endGame() {
        console.log("Game over! Reaction times: ", this.reactionTimes);
    }
}

