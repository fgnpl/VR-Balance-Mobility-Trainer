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
            ball: { caught: 0, deflected: 0, missed: 0, total: 0 },
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

    // Ball catching drill
    addBallResult(result) {
        this.session.ball.total += 1;
        if (result === 'caught') {
            this.session.ball.caught += 1;
        } else if (result === 'deflected') {
            this.session.ball.deflected += 1;
        } else if (result === 'missed') {
            this.session.ball.missed += 1;
        }
    }

    // Aggregates
    getReport() {
        const rts = this.session.target.reactionTimes;
        const avg = rts.length ? rts.reduce((a,b)=>a+b,0)/rts.length : 0;
        const fastest = rts.length ? Math.min(...rts) : 0;
        const slowest = rts.length ? Math.max(...rts) : 0;
        const acc = this.session.target.accuracy;
        const accPct = acc.total ? (acc.correct/acc.total)*100 : 0;
        
        const ball = this.session.ball;
        const ballSuccessRate = ball.total ? ((ball.caught + ball.deflected) / ball.total) * 100 : 0;
        
        return {
            reaction: { average: avg, fastest, slowest, total: rts.length },
            accuracy: { correct: acc.correct, total: acc.total, percent: accPct },
            beam: { best: this.session.beam.bestDuration, runs: this.session.beam.runs.slice() },
            ball: { 
                caught: ball.caught, 
                deflected: ball.deflected, 
                missed: ball.missed, 
                total: ball.total,
                successRate: ballSuccessRate 
            },
        };
    }
}
