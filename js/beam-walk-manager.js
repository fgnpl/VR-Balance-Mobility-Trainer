import {Component, Property} from '@wonderlandengine/api';
import {vec3} from 'gl-matrix';

export class BeamWalkManager extends Component {
    static TypeName = 'beam-walk-manager';
    static Properties = {
        playerObject: Property.object(),
        beamWidth: Property.float(0.3),
        startPosition: Property.object(),
        endPosition: Property.object(),
        maxDistanceFromCenter: Property.float(0.15),
        resetHeight: Property.float(-2.0),
        dataManager: Property.object(),
    };

    start() {
        this.running = false;
        this.totalBalanceDuration = 0;
        this.bestDuration = 0;
        this._currentRunStart = 0;
    }

    startDrill() {
        this.running = true;
        this.totalBalanceDuration = 0;
        this._currentRunStart = performance.now();
        this._resetToStart();
    }

    endDrill() {
        if (!this.running) return;
        this.running = false;
        
        // Commit final run if any time has elapsed
        const currentDur = performance.now() - this._currentRunStart;
        if (currentDur > 100) { // Only log if more than 100ms (to avoid accidental short runs)
            this._commitRun();
        }
        
        return { 
            totalBalanceDuration: this.totalBalanceDuration/1000, 
            bestDuration: this.bestDuration/1000 
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

        if (playerPos[1] < this.resetHeight || dist > this.maxDistanceFromCenter) {
            // fell off - commit the run and reset
            this._commitRun();
            this._resetToStart();
            this._currentRunStart = performance.now();
        } else {
            // still balancing - update total duration
            const currentRunDuration = performance.now() - this._currentRunStart;
            this.totalBalanceDuration += dt * 1000; // accumulate total time across all runs
        }
    }

    _commitRun() {
        const durSec = (performance.now() - this._currentRunStart) / 1000;
        if (durSec <= 0.1) return; // Ignore runs shorter than 100ms
        
        const dm = this.dataManager?.getComponent('data-manager');
        dm?.addBeamRun(durSec);
        
        if (durSec * 1000 > this.bestDuration) {
            this.bestDuration = durSec * 1000;
        }
        
        console.log(`[BeamWalk] Run completed: ${durSec.toFixed(2)}s`);
    }

    _resetToStart() {
        if (!this.playerObject || !this.startPosition) return;
        const pos = this.startPosition.getPositionWorld();
        this.playerObject.setPositionWorld(pos);
    }
}
