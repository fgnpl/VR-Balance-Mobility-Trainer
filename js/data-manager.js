import {Component} from '@wonderlandengine/api';

/**
 * DataManager: central session storage for drills.
 * Attach once in scene (e.g., on a Manager object). Accessible via engine.scene.getComponent('data-manager').
 */
export class DataManager extends Component {
    static TypeName = 'data-manager';

    start() {
        this.resetSession();
    }

    resetSession() {
        this.session = {
            target: { reactionTimes: [], accuracy: { correct: 0, total: 0 } },
            beam: { runs: [], bestDuration: 0 },
        };
    }

    // Target drill
    addReactionTime(sec) {
        this.session.target.reactionTimes.push(sec);
    }
    addAccuracySample(isCorrect) {
        this.session.target.accuracy.total += 1;
        if (isCorrect) this.session.target.accuracy.correct += 1;
    }

    // Beam walk drill
    addBeamRun(durationSec) {
        this.session.beam.runs.push(durationSec);
        if (durationSec > this.session.beam.bestDuration) this.session.beam.bestDuration = durationSec;
    }

    // Aggregates
    getReport() {
        const rts = this.session.target.reactionTimes;
        const avg = rts.length ? rts.reduce((a,b)=>a+b,0)/rts.length : 0;
        const fastest = rts.length ? Math.min(...rts) : 0;
        const slowest = rts.length ? Math.max(...rts) : 0;
        const acc = this.session.target.accuracy;
        const accPct = acc.total ? (acc.correct/acc.total)*100 : 0;
        return {
            reaction: { average: avg, fastest, slowest, total: rts.length },
            accuracy: { correct: acc.correct, total: acc.total, percent: accPct },
            beam: { best: this.session.beam.bestDuration, runs: this.session.beam.runs.slice() },
        };
    }
}
