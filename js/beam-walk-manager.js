import {Component, Property} from '@wonderlandengine/api';
import {vec3} from 'gl-matrix';

export class BeamWalkManager extends Component {
    static TypeName = 'beam-walk-manager';
    static Properties = {
        playerObject: Property.object(),
        beamWidth: Property.float(0.3),
        startPosition: Property.object(),
        endPosition: Property.object(),
        maxDistanceFromCenter: Property.float(0.5), // Increased from 0.15 to 0.5 (50cm tolerance)
        resetHeight: Property.float(-2.0),
        dataManager: Property.object(),
        statsText: Property.object(), // Text component to display live stats
        successRadius: Property.float(1.0), // Radius around end point to count as success
    };

    start() {
        this.running = false;
        this.totalBalanceDuration = 0;
        this.bestDuration = 0;
        this._currentRunStart = 0;
        
        // Movement tracking
        this.movementData = [];
        this.currentRunNumber = 0;
        this.totalFalls = 0;
        this.successfulRuns = 0;
        this.maxDistanceReached = 0;
        this.avgDeviation = 0;
        this.deviationSamples = [];
        
        // Debug: Check if statsText is assigned
        console.log('[BeamWalk] start() - statsText:', this.statsText);
        if (this.statsText) {
            console.log('[BeamWalk] statsText object found:', this.statsText.name);
            const textComp = this.statsText.getComponent('text');
            console.log('[BeamWalk] text component:', textComp);
        }
    }

    updateStats() {
        if (!this.statsText) {
            console.warn('[BeamWalk] statsText not assigned - check editor property');
            return;
        }
        
        const textComp = this.statsText.getComponent('text');
        if (!textComp) {
            console.warn('[BeamWalk] text component not found on:', this.statsText.name);
            console.warn('[BeamWalk] Available components:', this.statsText);
            return;
        }

        const currentRunTime = this.running 
            ? ((performance.now() - this._currentRunStart) / 1000).toFixed(2)
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
        console.log('[BeamWalk] Stats updated:', stats);
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
        this._currentRunStart = performance.now();
        this._resetToStart();
        this.updateStats();
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
        if (!this.running || !this.playerObject || !this.startPosition || !this.endPosition) return;
        
        const playerPos = this.playerObject.getPositionWorld();
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
            this._commitRun(false);
            this._resetToStart();
            this.currentRunNumber++;
            this._currentRunStart = performance.now();
            this.updateStats();
        } else {
            // still balancing - update total duration
            const currentRunDuration = performance.now() - this._currentRunStart;
            this.totalBalanceDuration += dt * 1000; // accumulate total time across all runs
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
        const pos = this.startPosition.getPositionWorld();
        this.playerObject.setPositionWorld(pos);
    }
}
