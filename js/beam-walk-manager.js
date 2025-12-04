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
        maxDistanceFromCenter: Property.float(1.0), 
        resetHeight: Property.float(-2.0),
        dataManager: Property.object(),
        statsText: Property.object(), // Text component to display live stats
        successRadius: Property.float(1.0), // Radius around end point to count as success
        // Controller references for haptic feedback
        leftController: Property.object(),
        rightController: Property.object(),
    };

    start() {
        this.running = false;
        this.totalBalanceDuration = 0;
        this.bestDuration = 0;
        this.currentRunStart = 0;
        
        // Movement tracking
        this.movementData = [];
        this.currentRunNumber = 0;
        this.totalFalls = 0;
        this.successfulRuns = 0;
        this.maxDistanceReached = 0;
        this.avgDeviation = 0;
        this.deviationSamples = [];
        this.lastWarningTime = 0; // For throttling warning haptics
        
        textComp = this.statsText.getComponent('text');
    }
    
    updateStats() {
        
        const textComp = this.statsText.getComponent('text');

        const currentRunTime = this.running 
            ? ((performance.now() - this.currentRunStart) / 1000).toFixed(2)
            : '0.00';
        
        const avgDev = this.deviationSamples.length > 0
            ? (this.deviationSamples.reduce((a, b) => a + b, 0) / this.deviationSamples.length).toFixed(3)
            : '0.000';

        const totalTime = (this.totalBalanceDuration / 1000).toFixed(2);
        const bestTime = (this.bestDuration / 1000).toFixed(2);

        const stats = `BEAM WALK STATS
            Run #: ${this.currentRunNumber}
            Current: ${currentRunTime}s
            Total Time: ${totalTime}s
            Best Run: ${bestTime}s
            Success: ${this.successfulRuns}
            Falls: ${this.totalFalls}
            Max Dist: ${this.maxDistanceReached.toFixed(2)}m
            Avg Dev: ${avgDev}m`;

        textComp.text = stats;
    }

    startDrill() {
        this.running = true;
        this.totalBalanceDuration = 0;
        this.currentRunNumber = 1;
        this.totalFalls = 0;
        this.successfulRuns = 0;
        this.maxDistanceReached = 0;
        this.deviationSamples = [];
        this.movementData = [];
        this.currentRunStart = performance.now();
        this.resetToStart();
        this.updateStats();
    }

    endDrill() {
        if (!this.running) return;
        this.running = false;
        
        // Commit final run if any time has elapsed
        const currentDur = performance.now() - this.currentRunStart;
        if (currentDur > 100) { // Only log if more than 100ms (to avoid accidental short runs)
            this.commitRun();
        }
        
        
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
        if (!this.running || !this.playerObject || !this.startPosition || !this.endPosition) return;
        
        // Use head position for XZ tracking (lateral movement) and Y (fall detection)
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
            // Player reached the end
            this.successfulRuns++;
            
            // Haptic feedback for success
            this.triggerBothControllers(HapticPatterns.BEAM_SUCCESS);
            
            this.commitRun(true);
            this.resetToStart();
            this.currentRunNumber++;
            this.currentRunStart = performance.now();
            this.updateStats();
            return;
        }

        if (playerPos[1] < this.resetHeight || dist > this.maxDistanceFromCenter) {
            // Fell off - commit the run and reset
            this.totalFalls++;
            
            // Haptic feedback for falling 
            this.triggerBothControllers(HapticPatterns.BEAM_FALL);
            
            this.commitRun(false);
            this.resetToStart();
            this.currentRunNumber++;
            this.currentRunStart = performance.now();
            this.updateStats();
        } else {
            // Still balancing - update total duration
            const currentRunDuration = performance.now() - this.currentRunStart;
            this.totalBalanceDuration += dt * 1000; // Accumulate total time across all runs
            
            // Warning haptic if getting close to edge (throttled to once per 2 seconds)
            const warningThreshold = this.maxDistanceFromCenter * 0.7; // 70% of max distance
            const now = performance.now();
            if (dist > warningThreshold && now - this.lastWarningTime > 2000) {
                this.triggerBothControllers(HapticPatterns.BEAM_WARNING);
                this.lastWarningTime = now;
            }
        }
    }

    commitRun(isSuccess = false) {
        const durSec = (performance.now() - this.currentRunStart) / 1000;
        if (durSec <= 0.1) return; // Ignore runs shorter than 100ms
        
        const dm = this.dataManager?.getComponent('data-manager');
        dm?.addBeamRun(durSec);
        
        if (durSec * 1000 > this.bestDuration) {
            this.bestDuration = durSec * 1000;
        }
        
        const status = isSuccess ? 'SUCCESS' : 'FALL';
        console.log(`[BeamWalk] Run completed: ${durSec.toFixed(2)}s - ${status}`);
    }

    resetToStart() {
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
            
            this.playerObject.setPositionWorld(adjustedPos);
        } else {
            // Fallback: no head tracking, just teleport the player root
            this.playerObject.setPositionWorld(startPos);
        }
    }

    /**
     * Trigger haptic feedback on both controllers
     */
    triggerBothControllers(pattern) {
        if (this.leftController) {
            triggerHaptic(this.leftController, pattern);
        }
        if (this.rightController) {
            triggerHaptic(this.rightController, pattern);
        }
    }
}
