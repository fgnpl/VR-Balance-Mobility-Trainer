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
        spawnZone: Property.object(), // Optional: Cube mesh object to define spawn boundaries
        maxTargets: Property.int(20),
        spawnInterval: Property.float(1.0), // seconds
        useColorMode: Property.bool(false),
        uiCueText: Property.object(),
        dataManager: Property.object(),
        targetLifetime: Property.float(1.0), // seconds - auto-respawn if not hit
        simultaneousTargets: Property.int(1), // number of targets to spawn at once
        statsText: Property.object(), // Text component to display stats
        // Material IDs - set these in the editor to match your scene materials
        yellowMaterialId: Property.int(25),
        pinkMaterialId: Property.int(22),
        greenMaterialId: Property.int(26),
    };
    
    start() {
        this.hitCount = 0;
        this.missCount = 0;
        this.reactionTimes = [];
        this.activeTargets = []; // Array to track multiple targets
        this.spherePrefab.active = false;

        // Three color system: yellow, pink, green with material IDs from properties
        this.colors = [
            {name: 'yellow', materialId: this.yellowMaterialId},
            {name: 'pink', materialId: this.pinkMaterialId},
            {name: 'green', materialId: this.greenMaterialId}
        ];
        this.currentCue = null;
        
        // Log material IDs for debugging
        console.log('[TargetManager] Material IDs - Yellow:', this.yellowMaterialId, 
                    'Pink:', this.pinkMaterialId, 'Green:', this.greenMaterialId);
        console.log('[TargetManager] simultaneousTargets:', this.simultaneousTargets);
        
        // Calculate spawn zone if provided
        if (this.spawnZone) {
            this._calculateSpawnZone();
        } else {
            console.warn('[TargetManager] No spawn zone set - using default curved area');
        }
        
        // Update initial stats
        this.updateStats();
        
        // DON'T spawn targets here - wait for startGame() to be called
        console.log('[TargetManager] Initialized - waiting for startGame()');
    }
    
    _calculateSpawnZone() {
        // Get the spawn zone mesh dimensions
        const mesh = this.spawnZone.getComponent('mesh');
        if (!mesh) {
            console.error('[TargetManager] Spawn zone has no mesh component!');
            return;
        }
        
        // Get world position and scale
        const pos = this.spawnZone.getPositionWorld();
        const scale = this.spawnZone.getScalingWorld();
        
        // Store spawn boundaries (assuming unit cube centered at origin)
        this.spawnBounds = {
            minX: pos[0] - scale[0] / 2,
            maxX: pos[0] + scale[0] / 2,
            minY: pos[1] - scale[1] / 2,
            maxY: pos[1] + scale[1] / 2,
            minZ: pos[2] - scale[2] / 2,
            maxZ: pos[2] + scale[2] / 2
        };
        
        console.log('[TargetManager] Spawn zone calculated:', this.spawnBounds);
    }

    updateStats() {
        if (!this.statsText) return;
        
        const textComp = this.statsText.getComponent('text');
        if (!textComp) return;

        const avgReactionTime = this.reactionTimes.length > 0 
            ? (this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length).toFixed(3)
            : '0.000';
        
        const accuracy = (this.hitCount + this.missCount) > 0
            ? ((this.hitCount / (this.hitCount + this.missCount)) * 100).toFixed(1)
            : '0.0';

        const stats = `STATS
Hits: ${this.hitCount} / ${this.maxTargets}
Misses: ${this.missCount}
Accuracy: ${accuracy}%
Avg RT: ${avgReactionTime}s
Active: ${this.activeTargets.length}`;

        textComp.text = stats;
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
        
        // Add to active targets array
        this.activeTargets.push(sphere);

        // Calculate spawn position
        let x, y, z;
        
        if (this.spawnBounds) {
            // Spawn within the defined cube zone
            x = this.spawnBounds.minX + Math.random() * (this.spawnBounds.maxX - this.spawnBounds.minX);
            y = this.spawnBounds.minY + Math.random() * (this.spawnBounds.maxY - this.spawnBounds.minY);
            z = this.spawnBounds.minZ + Math.random() * (this.spawnBounds.maxZ - this.spawnBounds.minZ);
            console.log('[TargetManager] Spawning in zone:', x, y, z);
        } else {
            // Fallback: Random position on curved rectangular surface
            x = (Math.random() - 0.5) * 7.5; // 1.5 * 5 = 7.5
            y = 1.5 + Math.random() * 2.5; // 0.5 * 5 = 2.5
            z = 2.0 + (Math.pow(x, 2) / 2); // Positive Z, in front of player
            console.log('[TargetManager] Spawning (no zone):', x, y, z);
        }

        sphere.setPositionWorld([x, y, z]);
        sphere.startTime = performance.now();

        // Color-coded mode: assign material tag and color
        if (this.useColorMode) {
            const colorObj = this.colors[Math.floor(Math.random() * this.colors.length)];
            sphere.colorTag = colorObj.name;
            
            // Update UI cue to tell which to hit
            this.currentCue = this.colors[Math.floor(Math.random() * this.colors.length)].name;
            const textComp = this.uiCueText?.getComponent('text');
            if (textComp) textComp.text = `Hit ${this.currentCue.toUpperCase()}`;
            
            // Set color by modifying the material's diffuseColor property
            const meshComp = sphere.getComponent('mesh');
            if (meshComp && meshComp.material) {
                try {
                    // Define RGB colors for each type
                    const colorMap = {
                        'yellow': [1.0, 1.0, 0.0, 1.0],  // Yellow
                        'pink': [1.0, 0.41, 0.71, 1.0],   // Hot Pink
                        'green': [0.0, 1.0, 0.0, 1.0]     // Green
                    };
                    
                    const colorRGBA = colorMap[colorObj.name];
                    if (colorRGBA) {
                        meshComp.material.diffuseColor = colorRGBA;
                        console.log(`[TargetManager] Set color to ${colorObj.name}:`, colorRGBA);
                    }
                } catch (e) {
                    console.error(`[TargetManager] Error setting color:`, e);
                }
            }
        }

        // Remove ball-collision if it exists (ball-collision is for ball-catching drill only)
        const ballCollision = sphere.getComponent('ball-collision');
        if (ballCollision) {
            console.log('[TargetManager] Removing ball-collision from target sphere (not needed for target drill)');
            ballCollision.destroy();
        }
        
        // Ensure collision component exists on the sphere
        let collision = sphere.getComponent('collision');
        if (!collision) {
            console.warn('[TargetManager] ⚠️ Target has no collision component! Adding one...');
            collision = sphere.addComponent('collision', {
                collider: 2, // Sphere collider
                extents: [0.15, 0.15, 0.15],
                group: 2
            });
        } else {
            console.log('[TargetManager] ✅ Target has collision component');
            console.log('[TargetManager] Collision settings:', {
                group: collision.group,
                collider: collision.collider,
                extents: collision.extents
            });
        }
        
        // Attach / reuse target-collision component (this is what targets need)
        let tc = sphere.getComponent('target-collision');
        if (!tc) {
            console.log('[TargetManager] Adding target-collision component');
            tc = sphere.addComponent('target-collision');
        }
        tc.manager = this;
        
        console.log('[TargetManager] Target spawned at:', sphere.getPositionWorld());
        console.log('[TargetManager] Active targets:', this.activeTargets.length, '/', this.simultaneousTargets);

        // Auto-respawn if not hit within targetLifetime
        sphere.timeoutId = setTimeout(() => {
            this.onTargetTimeout(sphere);
        }, this.targetLifetime * 1000);
    }

    onTargetTimeout(sphere) {
        // Check if sphere is still active (not hit yet)
        const index = this.activeTargets.indexOf(sphere);
        if (index === -1) return; // Already removed
        
        console.log('[TargetManager] Target timeout - respawning');
        
        // Remove from active targets
        this.activeTargets.splice(index, 1);
        
        // Count as a miss
        this.missCount++;
        
        // Destroy the missed target
        sphere.destroy();
        
        // Update stats display
        this.updateStats();
        
        // Spawn a new target to replace it
        this.spawnTarget();
    }

    onTargetHit(sphere, reactionTime) {
        // Clear the timeout since target was hit
        if (sphere.timeoutId) {
            clearTimeout(sphere.timeoutId);
            sphere.timeoutId = null;
        }

        // Remove from active targets
        const index = this.activeTargets.indexOf(sphere);
        if (index !== -1) {
            this.activeTargets.splice(index, 1);
        }

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

        // Update stats display
        this.updateStats();

        // Spawn a new target after the interval
        setTimeout(() => this.spawnTarget(), this.spawnInterval * 1000);
    }

    endGame() {
        console.log("Game over! Reaction times: ", this.reactionTimes);
        
        // Cleanup all active targets
        for (const target of this.activeTargets) {
            if (target.timeoutId) {
                clearTimeout(target.timeoutId);
            }
            target.destroy();
        }
        this.activeTargets = [];
        
        const dm = this.dataManager?.getComponent('data-manager');
        const report = dm?.getReport();
        if (report) console.log('[TargetManager] Report summary:', report);
    }

    startGame() {
        // Cleanup any existing targets first
        for (const target of this.activeTargets) {
            if (target.timeoutId) {
                clearTimeout(target.timeoutId);
            }
            target.destroy();
        }
        this.activeTargets = [];
        
        this.hitCount = 0;
        this.missCount = 0;
        this.reactionTimes = [];
        
        // Update stats display
        this.updateStats();
        
        // Spawn initial batch of targets
        for (let i = 0; i < this.simultaneousTargets; i++) {
            this.spawnTarget();
        }
    }
}

