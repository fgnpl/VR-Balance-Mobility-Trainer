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
    spawnInterval: Property.float(1.0), // seconds
    useColorMode: Property.bool(false),
    uiCueText: Property.object(),
    dataManager: Property.object(),
    };
    
    start() {
        this.hitCount = 0;
        this.reactionTimes = [];
        this.activeTarget = null;
        this.spherePrefab.active = false;

    this.colors = ['red','green'];
    this.currentCue = null;
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

        // Color-coded mode: assign material tag
        if (this.useColorMode) {
            const color = this.colors[Math.floor(Math.random()*this.colors.length)];
            sphere.colorTag = color;
            // Update UI cue to tell which to hit
            this.currentCue = this.colors[Math.floor(Math.random()*this.colors.length)];
            const textComp = this.uiCueText?.getComponent('text');
            if (textComp) textComp.text = `Hit ${this.currentCue.toUpperCase()}`;
            // Optionally change material by name if available
            const matComp = sphere.getComponent('mesh');
            const mat = matComp?.material;
            if (mat && mat.setColor) {
                if (color === 'red') mat.setColor([1,0,0,1]); else mat.setColor([0,1,0,1]);
            }
        }

    // Attach / reuse target-collision component
    let tc = sphere.getComponent('target-collision');
    if (!tc) tc = sphere.addComponent('target-collision');
    tc.manager = this;
    console.log("Spawned at:", sphere.getPositionWorld());
    }

    onTargetHit(sphere, reactionTime) {
        this.hitCount++;
        this.reactionTimes.push(reactionTime);

        // DataManager logging
        const dm = this.dataManager?.getComponent('data-manager');
        dm?.addReactionTime(reactionTime);
        if (this.useColorMode) {
            const correct = sphere.colorTag === this.currentCue;
            dm?.addAccuracySample(!!correct);
        }

        sphere.destroy();

        setTimeout(() => this.spawnTarget(), this.spawnInterval * 1000);
    }

    endGame() {
        console.log("Game over! Reaction times: ", this.reactionTimes);
        const dm = this.dataManager?.getComponent('data-manager');
        const report = dm?.getReport();
        if (report) console.log('[TargetManager] Report summary:', report);
    }

    startGame() {
        this.hitCount = 0;
        this.reactionTimes = [];
        this.activeTarget = null;
        this.spawnTarget();
    }
}

