import {Component, Property} from '@wonderlandengine/api';
import {TargetBehavior} from './target-behavior.js';

/**
 * target-manager
 * Manages the target striking mini-game: spawns targets, tracks hits, logs reaction times
 */

export class TargetManager extends Component {
    static TypeName = 'target-manager';
    
    static Properties = {
        targetPrefab: Property.object(),
        totalTargets: Property.int(20),
        spawnDelay: Property.float(1.5), // seconds between targets
        surfaceWidth: Property.float(2.0), // width of spawn area
        surfaceHeight: Property.float(1.0), // height of spawn area
        surfaceCenterY: Property.float(1.5), // center height
        surfaceDistance: Property.float(2.0) // distance from player
    };
    
    init() {
        console.log("TargetManager initialized");
    }
    
    start() {
        console.log("TargetManager started");
        
        // Game state
        this.targetsSpawned = 0;
        this.targetsHit = 0;
        this.reactionTimes = [];
        this.currentTarget = null;
        
        // Hide the prefab
        if (this.targetPrefab) {
            this.targetPrefab.active = false;
            console.log("Target prefab hidden");
        } else {
            console.error("ERROR: No target prefab assigned!");
            return;
        }
        
        // Spawn first target
        this.spawnNextTarget();
    }
    
    spawnNextTarget() {
        // Check if game is complete
        if (this.targetsSpawned >= this.totalTargets) {
            console.log("All targets spawned, waiting for final hit...");
            return;
        }
        
        this.targetsSpawned++;
        
        // Create target from prefab
        const target = this.targetPrefab.clone(this.object);
        target.active = true;
        this.currentTarget = target;
        
        // Calculate random position on curved surface
        // X: horizontal spread
        const x = (Math.random() - 0.5) * this.surfaceWidth;
        
        // Y: vertical spread
        const y = this.surfaceCenterY + (Math.random() - 0.5) * this.surfaceHeight;
        
        // Z: curved depth based on X position (parabolic curve)
        const curveFactor = 0.3; // controls how curved the surface is
        const z = -this.surfaceDistance - (x * x * curveFactor);
        
        target.setPositionWorld([x, y, z]);
        
        // Record spawn time
        target.spawnTime = performance.now();
        
        // Add behavior component
        const behavior = target.addComponent(TargetBehavior);
        behavior.manager = this;
        
        console.log(`Target ${this.targetsSpawned}/${this.totalTargets} spawned at [${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}]`);
    }
    
    onTargetHit(target, reactionTime) {
        this.targetsHit++;
        this.reactionTimes.push(reactionTime);
        
        console.log(`Target hit! Reaction time: ${reactionTime.toFixed(3)}s`);
        console.log(`Progress: ${this.targetsHit}/${this.targetsSpawned} hit`);
        
        // Destroy the target
        target.destroy();
        this.currentTarget = null;
        
        // Check if game is complete
        if (this.targetsSpawned >= this.totalTargets) {
            this.endGame();
        } else {
            // Schedule next target
            setTimeout(() => {
                this.spawnNextTarget();
            }, this.spawnDelay * 1000);
        }
    }
    
    endGame() {
        console.log("\nGAME COMPLETE");
        console.log(`Total targets: ${this.totalTargets}`);
        console.log(`Targets hit: ${this.targetsHit}`);
        console.log(`Accuracy: ${((this.targetsHit / this.totalTargets) * 100).toFixed(1)}%`);
        
        if (this.reactionTimes.length > 0) {
            const sum = this.reactionTimes.reduce((a, b) => a + b, 0);
            const avg = sum / this.reactionTimes.length;
            const min = Math.min(...this.reactionTimes);
            const max = Math.max(...this.reactionTimes);
            
            console.log(`\nReaction Times:`);
            console.log(`Average: ${avg.toFixed(3)}s`);
            console.log(`Fastest: ${min.toFixed(3)}s`);
            console.log(`Slowest: ${max.toFixed(3)}s`);
            console.log(`All times:`, this.reactionTimes.map(t => t.toFixed(3)));
        }
        
    }
    
    update(dt) {
        // Add timeout for missed targets
        if (this.currentTarget) {
            const target = this.currentTarget;
            const timeAlive = (performance.now() - target.spawnTime) / 1000;
            
            // If target is alive for more than 10 seconds, consider it missed
            if (timeAlive > 10.0) {
                console.log("Target missed (timeout)");
                target.destroy();
                this.currentTarget = null;
                
                if (this.targetsSpawned >= this.totalTargets) {
                    this.endGame();
                } else {
                    setTimeout(() => {
                        this.spawnNextTarget();
                    }, this.spawnDelay * 1000);
                }
            }
        }
    }
}