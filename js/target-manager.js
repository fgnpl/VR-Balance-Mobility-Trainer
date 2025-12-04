import {Component, Property} from '@wonderlandengine/api';
import {CursorTarget} from '@wonderlandengine/components';

/**
 * target-manager
 */
export class TargetManager extends Component {
    static TypeName = 'target-manager';
    /* Properties that are configurable in the editor */
    static Properties = {
        spherePrefab: Property.object(),
        spawnZone: Property.object(), // cube mesh object to define spawn boundaries
        maxTargets: Property.int(5),
        spawnInterval: Property.float(1.0), // seconds delay before respawning
        dataManager: Property.object(),
        targetLifetime: Property.float(1.5), // seconds - auto-respawn if not hit
        simultaneousTargets: Property.int(5), // number of targets to spawn at once
        // material IDs 
        yellowMaterialId: Property.int(25),
        pinkMaterialId: Property.int(22),
        greenMaterialId: Property.int(26),
        // Game selector for unified UI
        gameSelector: Property.object(),
    };
    
    start() {
        this.hitCount = 0;
        this.missCount = 0;
        this.cycleCount = 0; // Track total rounds played
        this.reactionTimes = [];
        this.activeTargets = []; 
        this.spherePrefab.active = false;
        this.roundActive = false;

        // Three color system: yellow, pink, green with material IDs from properties
        this.colors = [
            {name: 'yellow', materialId: this.yellowMaterialId},
            {name: 'pink', materialId: this.pinkMaterialId},
            {name: 'green', materialId: this.greenMaterialId}
        ];
        this.currentCue = null;
        
        console.log('[TargetManager] Material IDs - Yellow:', this.yellowMaterialId, 
                    'Pink:', this.pinkMaterialId, 'Green:', this.greenMaterialId);
        
        // Get game selector reference if not provided
        if (!this.gameSelector) {
            const manager = this.engine.scene.findByName('Manager')[0];
            if (manager) {
                this.gameSelector = manager.getComponent('game-selector');
            }
        }
        
        this.calculateSpawnZone();
        this.updateStats();
        
        console.log('[TargetManager] Initialized, waiting for startGame()');
    }
    
    calculateSpawnZone() {
        const mesh = this.spawnZone.getComponent('mesh');
        const pos = this.spawnZone.getPositionWorld();
        const scale = this.spawnZone.getScalingWorld();
        
        this.spawnBounds = {
            minX: pos[0] - scale[0] / 2,
            maxX: pos[0] + scale[0] / 2,
            minY: pos[1] - scale[1] / 2,
            maxY: pos[1] + scale[1] / 2,
            minZ: pos[2] - scale[2] / 2,
            maxZ: pos[2] + scale[2] / 2
        };
    }

    updateStats() {
        const avgReactionTime = this.reactionTimes.length > 0 
            ? (this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length).toFixed(3)
            : '0.000';
        
        const accuracy = (this.hitCount + this.missCount) > 0
            ? ((this.hitCount / (this.hitCount + this.missCount)) * 100).toFixed(1)
            : '0.0';

        // Statistics for the game
        const stats = `Round: ${this.cycleCount}/${this.maxTargets} | Hits: ${this.hitCount} | Misses: ${this.missCount} | Accuracy: ${accuracy}% | Avg RT: ${avgReactionTime}s`;

        // Update unified UI
        const gs = this.gameSelector?.getComponent?.('game-selector') || this.gameSelector;
        if (gs) {
            gs.updateStats?.(stats);
        }
    }

    updateCue(text) {
        const gs = this.gameSelector?.getComponent?.('game-selector') || this.gameSelector;
        if (gs) {
            gs.updateCue?.(text);
        }
    }

    startGame() {
        this.clearRound();
        
        this.hitCount = 0;
        this.missCount = 0;
        this.cycleCount = 0; // Reset cycle count
        this.reactionTimes = [];
        
        this.updateStats();
        
        // Start the first cycle
        this.startRound();
    }

    startRound() {
        // Stop the game if we have reached the max number of cycles (trials)
        if (this.cycleCount >= this.maxTargets) {
            this.endGame();
            return;
        }

        this.cycleCount++; // Increment cycle count at start of round
        this.updateStats(); // Update UI to show new round number

        this.roundActive = true;
        this.activeTargets = [];

        // Pick the target color for this round
        const targetColorObj = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.currentCue = targetColorObj.name;

        // Update UI cue
        this.updateCue(`Hit ${this.currentCue.toUpperCase()}`);

        // Prepare color batch (1 correct, rest distractors)
        let batchColors = [];
        batchColors.push(this.currentCue);

        const distractors = this.colors.filter(c => c.name !== this.currentCue);

        for (let i = 1; i < this.simultaneousTargets; i++) {
            const distColor = distractors[Math.floor(Math.random() * distractors.length)].name;
            batchColors.push(distColor);
        }

        // Shuffle
        batchColors.sort(() => Math.random() - 0.5);

        // Spawn spheres
        for (let i = 0; i < this.simultaneousTargets; i++) {
            this.spawnSphere(batchColors[i]);
        }
        
        console.log(`[TargetManager] Round ${this.cycleCount} Started. Target: ${this.currentCue}`);
    }

    spawnSphere(colorName) {
        const sphere = this.spherePrefab.clone(this.object);
        sphere.active = true;
        
        this.activeTargets.push(sphere);

        const x = this.spawnBounds.minX + Math.random() * (this.spawnBounds.maxX - this.spawnBounds.minX);
        const y = this.spawnBounds.minY + Math.random() * (this.spawnBounds.maxY - this.spawnBounds.minY);
        const z = this.spawnBounds.minZ + Math.random() * (this.spawnBounds.maxZ - this.spawnBounds.minZ);

        sphere.setPositionWorld([x, y, z]);
        sphere.startTime = performance.now();
        sphere.colorTag = colorName;

        const meshComp = sphere.getComponent('mesh');
        if (meshComp && meshComp.material) {
            const colorMap = {
                    'yellow': [1.0, 1.0, 0.0, 1.0],
                    'pink': [1.0, 0.41, 0.71, 1.0],
                    'green': [0.0, 1.0, 0.0, 1.0]
            };
            const colorRGBA = colorMap[colorName];
            if (colorRGBA) {
                meshComp.material = meshComp.material.clone();
                meshComp.material.diffuseColor = colorRGBA;
            }
        }

        let tc = sphere.getComponent('target-collision');
        if (!tc) {
            console.log('[TargetManager] No target-collision found, adding one');
            tc = sphere.addComponent('target-collision');
        } else {
            console.log('[TargetManager] target-collision already exists on sphere');
        }
        tc.manager = this;
        console.log('[TargetManager] Set manager on target-collision, manager is:', this);
        
        sphere.timeoutId = setTimeout(() => {
            this.onTargetTimeout(sphere);
        }, this.targetLifetime * 1000);
    }

    onTargetTimeout(sphere) {
        if (!this.roundActive) return;

        console.log('[TargetManager] Time run out - Resetting cycle');
        
        this.roundActive = false;
        
        // Timeout counts as a miss
        this.missCount++;
        this.updateStats();

        this.clearRound();
        this.startRound();
    }

    onTargetHit(sphere, reactionTime) {
        if (!this.roundActive) return;
        
        this.roundActive = false; 

        const isCorrectColor = sphere.colorTag === this.currentCue;
        
        const dm = this.dataManager?.getComponent('data-manager');
        dm?.addReactionTime(reactionTime);
        dm?.addAccuracySample(isCorrectColor);

        if (isCorrectColor) {
            console.log('[TargetManager] Correct Hit!');
            this.hitCount++;
            this.reactionTimes.push(reactionTime);
        } else {
            console.log('[TargetManager] Wrong Color Hit!');
            this.missCount++;
        }

        this.updateStats();
        
        // Defer destruction to next frame to prevent Cursor memory error
        setTimeout(() => {
            this.clearRound();
        }, 0);

        setTimeout(() => {
            this.startRound();
        }, this.spawnInterval * 1000);
    }

    clearRound() {
        for (const target of this.activeTargets) {
            if (target.timeoutId) clearTimeout(target.timeoutId);
            target.destroy();
        }
        this.activeTargets = [];
    }

    endGame() {
        console.log("Game over! Finished cycles: ", this.cycleCount);
        this.clearRound();
        
        const dm = this.dataManager?.getComponent('data-manager');
        const report = dm?.getReport();
        if (report) console.log('[TargetManager] Report summary:', report);
    }
}