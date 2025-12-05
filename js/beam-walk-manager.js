import {Component, Property} from '@wonderlandengine/api';
import {vec3} from 'gl-matrix';
import {triggerHaptic, HapticPatterns} from './haptic-feedback.js';

export class BeamWalkManager extends Component {
    static TypeName = 'beam-walk-manager';
    static Properties = {
        playerObject: Property.object(),
        headObject: Property.object(), // VR camera/head for Y position checking
        beamWidth: Property.float(0.3),
        startPosition: Property.object(),
        endPosition: Property.object(),
        maxDistanceFromCenter: Property.float(1.0), // Increased to 1.0m (100cm tolerance)
        resetHeight: Property.float(-2.0),
        dataManager: Property.object(),
        gameSelector: Property.object(), // Reference to game-selector for unified UI
        statsText: Property.object(), // Text component to display live stats (legacy, prefer gameSelector)
        successRadius: Property.float(1.0), // Radius around end point to count as success
        // Controller references for haptic feedback
        leftController: Property.object(),
        rightController: Property.object(),
    };

    start() {
        this.running = false;
        this.totalBalanceDuration = 0;
        this.bestDuration = 0;
        this._currentRunStart = 0;
        
        // Auto-find head if not set (look for ViewComponent or player-height)
        if (!this.headObject && this.playerObject) {
            console.log('[BeamWalk] Searching for head/camera object...');
            this._findHeadObject(this.playerObject);
        }
        
        // Auto-find controllers if not set
        if (!this.leftController) {
            this.leftController = this.engine.scene.findByName('HandLeft')[0] || 
                                  this.engine.scene.findByName('ControllerLeft')[0];
        }
        if (!this.rightController) {
            this.rightController = this.engine.scene.findByName('HandRight')[0] || 
                                   this.engine.scene.findByName('ControllerRight')[0];
        }
        
        // Movement tracking
        this.movementData = [];
        this.currentRunNumber = 0;
        this.totalFalls = 0;
        this.successfulRuns = 0;
        this.maxDistanceReached = 0;
        this.avgDeviation = 0;
        this.deviationSamples = [];
        this.lastWarningTime = 0; // For throttling warning haptics
        
        // Get game selector reference if not provided
        if (!this.gameSelector) {
            const manager = this.engine.scene.findByName('Manager')[0];
            if (manager) {
                this.gameSelector = manager.getComponent('game-selector');
                console.log('[BeamWalk] Auto-found game-selector');
            }
        }
        
        // Debug: Check if statsText is assigned
        console.log('[BeamWalk] start() - statsText:', this.statsText);
        console.log('[BeamWalk] start() - gameSelector:', this.gameSelector);
        if (this.statsText) {
            console.log('[BeamWalk] statsText object found:', this.statsText.name);
            const textComp = this.statsText.getComponent('text');
            console.log('[BeamWalk] text component:', textComp);
        }
        
        if (this.headObject) {
            console.log('[BeamWalk] Head object set:', this.headObject.name);
        } else {
            console.warn('[BeamWalk] No head object - will use playerObject for fall detection (may not work in VR!)');
        }
    }
    
    _findHeadObject(parent) {
        // Recursively search for object with ViewComponent (camera)
        const children = parent.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (child.getComponent('view')) {
                this.headObject = child;
                console.log('[BeamWalk] Auto-found head object:', child.name);
                return;
            }
            // Recurse
            this._findHeadObject(child);
        }
    }

    updateStats() {
        const currentRunTime = this.running 
            ? ((performance.now() - this._currentRunStart) / 1000).toFixed(2)
            : '0.00';
        
        const avgDev = this.deviationSamples.length > 0
            ? (this.deviationSamples.reduce((a, b) => a + b, 0) / this.deviationSamples.length).toFixed(3)
            : '0.000';

        const totalTime = (this.totalBalanceDuration / 1000).toFixed(2);
        const bestTime = (this.bestDuration / 1000).toFixed(2);

        // Concise stats for unified UI (game-selector)
        const conciseStats = `Run #${this.currentRunNumber} | Current: ${currentRunTime}s | Best: ${bestTime}s | Success: ${this.successfulRuns} | Falls: ${this.totalFalls}`;

        // Detailed stats for legacy statsText
        const detailedStats = `BEAM WALK STATS
Run #: ${this.currentRunNumber}
Current: ${currentRunTime}s
Total Time: ${totalTime}s
Best Run: ${bestTime}s
Success: ${this.successfulRuns}
Falls: ${this.totalFalls}
Max Dist: ${this.maxDistanceReached.toFixed(2)}m
Avg Dev: ${avgDev}m`;

        // Update unified UI (via game-selector)
        const gs = this.gameSelector?.getComponent?.('game-selector') || this.gameSelector;
        if (gs && gs.updateStats) {
            gs.updateStats(conciseStats);
        }
        
        // ALSO update legacy statsText (show in both places)
        if (this.statsText) {
            const textComp = this.statsText.getComponent('text');
            if (textComp) {
                textComp.text = detailedStats;
            }
        }
    }

    startDrill() {
        console.log('[BeamWalk] startDrill() called');
        console.log('[BeamWalk] playerObject:', this.playerObject?.name);
        console.log('[BeamWalk] headObject:', this.headObject?.name);
        console.log('[BeamWalk] startPosition:', this.startPosition?.name);
        console.log('[BeamWalk] endPosition:', this.endPosition?.name);
        console.log('[BeamWalk] statsText:', this.statsText?.name);
        
        if (!this.playerObject) {
            console.error('[BeamWalk] ERROR: playerObject not set! Cannot start drill.');
            return;
        }
        if (!this.startPosition || !this.endPosition) {
            console.error('[BeamWalk] ERROR: Start or End position not set!');
            return;
        }
        
        this.running = true;
        this.totalBalanceDuration = 0;
        this.currentRunNumber = 1;
        this.totalFalls = 0;
        this.successfulRuns = 0;
        this.maxDistanceReached = 0;
        this.deviationSamples = [];
        this.movementData = [];
        this._currentRunStart = performance.now();
        this._resetToStart();
        this.updateStats();
        
        console.log('[BeamWalk] Drill started successfully! running=', this.running);
    }

    endDrill() {
        if (!this.running) return;
        this.running = false;
        
        // Commit final run if any time has elapsed
        const currentDur = performance.now() - this._currentRunStart;
        if (currentDur > 100) { // Only log if more than 100ms (to avoid accidental short runs)
            this._commitRun();
        }
        
        // Log complete movement data summary
        console.log('[BeamWalk] Complete Movement Data:');
        console.log(`Total Runs: ${this.currentRunNumber}`);
        console.log(`Successful Runs: ${this.successfulRuns}`);
        console.log(`Total Falls: ${this.totalFalls}`);
        console.log(`Max Distance: ${this.maxDistanceReached.toFixed(2)}m`);
        console.log(`Movement Samples: ${this.movementData.length}`);
        console.log('Detailed Data:', this.movementData);
        
        this.updateStats();
        
        return { 
            totalBalanceDuration: this.totalBalanceDuration/1000, 
            bestDuration: this.bestDuration/1000,
            movementData: this.movementData,
            successfulRuns: this.successfulRuns,
            totalFalls: this.totalFalls,
            maxDistanceReached: this.maxDistanceReached,
            avgDeviation: this.deviationSamples.length > 0 
                ? this.deviationSamples.reduce((a, b) => a + b, 0) / this.deviationSamples.length 
                : 0
        };
    }

    update(dt) {
        if (!this.running) return;
        
        if (!this.playerObject || !this.startPosition || !this.endPosition) {
            if (this.running) {
                console.warn('[BeamWalk] Missing required objects in update! playerObject:', !!this.playerObject, 'start:', !!this.startPosition, 'end:', !!this.endPosition);
            }
            return;
        }
        
        // Use head position for XZ tracking (lateral movement) and Y (fall detection)
        // This is critical for VR where the player's head moves independently
        const trackingObject = this.headObject || this.playerObject;
        const playerPos = trackingObject.getPositionWorld();
        
        const a = this.startPosition.getPositionWorld();
        const b = this.endPosition.getPositionWorld();
        const ab = vec3.sub(vec3.create(), b, a);
        const ap = vec3.sub(vec3.create(), playerPos, a);
        const t = Math.max(0, Math.min(1, vec3.dot(ap, ab) / vec3.dot(ab, ab)));
        const closest = vec3.scaleAndAdd(vec3.create(), a, ab, t);
        const lateral = vec3.sub(vec3.create(), playerPos, closest);
        lateral[1] = 0; // ignore Y
        const dist = vec3.length(lateral);

        // Track movement data
        const beamLength = vec3.length(ab);
        const distanceAlongBeam = t * beamLength;
        
        // Update max distance reached
        if (distanceAlongBeam > this.maxDistanceReached) {
            this.maxDistanceReached = distanceAlongBeam;
        }
        
        // Sample deviation every frame
        this.deviationSamples.push(dist);
        
        // Log detailed movement data
        this.movementData.push({
            time: performance.now(),
            position: [playerPos[0], playerPos[1], playerPos[2]],
            distanceFromCenter: dist,
            distanceAlongBeam: distanceAlongBeam,
            runNumber: this.currentRunNumber
        });

        // Update stats display more frequently for real-time feedback
        this.updateStats();

        // Check if player reached the end successfully
        const distToEnd = vec3.distance(playerPos, b);
        if (distToEnd <= this.successRadius) {
            // Success! Player reached the end
            console.log('[BeamWalk] SUCCESS! Reached end of beam');
            this.successfulRuns++;
            
            // Haptic feedback: Success! (both controllers)
            this._triggerBothControllers(HapticPatterns.BEAM_SUCCESS);
            
            this._commitRun(true);
            this._resetToStart();
            this.currentRunNumber++;
            this._currentRunStart = performance.now();
            this.updateStats();
            return;
        }

        if (playerPos[1] < this.resetHeight || dist > this.maxDistanceFromCenter) {
            // fell off - commit the run and reset
            console.log('[BeamWalk] FALL detected');
            this.totalFalls++;
            
            // Haptic feedback: Fall warning (strong, both controllers)
            this._triggerBothControllers(HapticPatterns.BEAM_FALL);
            
            this._commitRun(false);
            this._resetToStart();
            this.currentRunNumber++;
            this._currentRunStart = performance.now();
            this.updateStats();
        } else {
            // still balancing - update total duration
            const currentRunDuration = performance.now() - this._currentRunStart;
            this.totalBalanceDuration += dt * 1000; // accumulate total time across all runs
            
            // Warning haptic if getting close to edge (throttled to once per 2 seconds)
            const warningThreshold = this.maxDistanceFromCenter * 0.7; // 70% of max distance
            const now = performance.now();
            if (dist > warningThreshold && now - this.lastWarningTime > 2000) {
                this._triggerBothControllers(HapticPatterns.BEAM_WARNING);
                this.lastWarningTime = now;
            }
        }
    }

    _commitRun(isSuccess = false) {
        const durSec = (performance.now() - this._currentRunStart) / 1000;
        if (durSec <= 0.1) return; // Ignore runs shorter than 100ms
        
        const dm = this.dataManager?.getComponent('data-manager');
        dm?.addBeamRun(durSec);
        
        if (durSec * 1000 > this.bestDuration) {
            this.bestDuration = durSec * 1000;
        }
        
        const status = isSuccess ? 'SUCCESS' : 'FALL';
        console.log(`[BeamWalk] Run completed: ${durSec.toFixed(2)}s - ${status}`);
    }

    _resetToStart() {
        if (!this.playerObject || !this.startPosition) return;
        
        const startPos = this.startPosition.getPositionWorld();
        const trackingObject = this.headObject || this.playerObject;
        
        // In VR, the head is offset from the Player root
        // We need to calculate the offset and compensate
        if (this.headObject) {
            // Get current positions
            const currentPlayerPos = this.playerObject.getPositionWorld();
            const currentHeadPos = this.headObject.getPositionWorld();
            
            // Calculate the XZ offset (keep Y offset as-is for player height)
            const offsetX = currentHeadPos[0] - currentPlayerPos[0];
            const offsetZ = currentHeadPos[2] - currentPlayerPos[2];
            
            // Set player position compensating for head offset
            // This makes the head end up at startPos
            const adjustedPos = [
                startPos[0] - offsetX,
                startPos[1], // Use start position Y
                startPos[2] - offsetZ
            ];
            
            console.log('[BeamWalk] Teleporting - Head offset:', [offsetX, 0, offsetZ]);
            console.log('[BeamWalk] Target head pos:', startPos);
            console.log('[BeamWalk] Setting player to:', adjustedPos);
            
            this.playerObject.setPositionWorld(adjustedPos);
        } else {
            // Fallback: no head tracking, just teleport the player root
            console.log('[BeamWalk] Teleporting player (no head offset) to:', startPos);
            this.playerObject.setPositionWorld(startPos);
        }
    }

    /**
     * Trigger haptic feedback on both controllers
     */
    _triggerBothControllers(pattern) {
        if (this.leftController) {
            triggerHaptic(this.leftController, pattern);
        }
        if (this.rightController) {
            triggerHaptic(this.rightController, pattern);
        }
    }
}