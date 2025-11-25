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
        const dur = this.totalBalanceDuration;
        if (dur > this.bestDuration) this.bestDuration = dur;
        const dm = this.dataManager?.getComponent('data-manager');
        dm?.addBeamRun(dur/1000);
        return { totalBalanceDuration: dur/1000, bestDuration: this.bestDuration/1000 };
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
            // fell off
            this._commitRun();
            this._resetToStart();
            this._currentRunStart = performance.now();
        } else {
            // still balancing
            this.totalBalanceDuration = performance.now() - this._currentRunStart;
        }
    }

    _commitRun() {
        const dm = this.dataManager?.getComponent('data-manager');
        const durSec = (performance.now() - this._currentRunStart)/1000;
        if (durSec > 0) dm?.addBeamRun(durSec);
        if (durSec*1000 > this.bestDuration) this.bestDuration = durSec*1000;
    }

    _resetToStart() {
        if (!this.playerObject || !this.startPosition) return;
        const pos = this.startPosition.getPositionWorld();
        this.playerObject.setPositionWorld(pos);
    }
}
