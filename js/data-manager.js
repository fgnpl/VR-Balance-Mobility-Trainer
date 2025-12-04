import {Component} from '@wonderlandengine/api';

/**
 * DataManager: central session storage for drills.
 */
export class DataManager extends Component {
    static TypeName = 'data-manager';

    start() {
        this.resetSession();
    }

    resetSession() {
        this.session = {
            color: { reactionTimes: [], accuracy: { correct: 0, total: 0 } }, // Color-coded reactions game
            beam: { runs: [], bestDuration: 0 }, // Virtual beam game
            deflect: { totalBalls: 0, hits: 0, games: [] }, // Bouncing ball game
            react: { reactionTimes: [], totalTargets: 0 }, // Target striking game
        };
    }

    // Color-coded reactions drill
    addReactionTime(sec) {
        this.session.color.reactionTimes.push(sec);
    }
    addAccuracySample(isCorrect) {
        this.session.color.accuracy.total += 1;
        if (isCorrect) this.session.color.accuracy.correct += 1;
    }

    // Beam walk drill
    addBeamRun(durationSec) {
        this.session.beam.runs.push(durationSec);
        if (durationSec > this.session.beam.bestDuration) this.session.beam.bestDuration = durationSec;
    }

    // Deflect drill 
    addDeflectGame(totalBalls, hits) {
        this.session.deflect.totalBalls += totalBalls;
        this.session.deflect.hits += hits;
        this.session.deflect.games.push({ totalBalls, hits, accuracy: totalBalls > 0 ? (hits / totalBalls) * 100 : 0 });
    }

    // Target striking drill
    addReactTime(reactionTime) {
        this.session.react.reactionTimes.push(reactionTime);
        this.session.react.totalTargets += 1;
    }
    addReactSession(reactionTimes) {
        // Add multiple reaction times at once (from a completed session)
        reactionTimes.forEach(rt => {
            this.session.react.reactionTimes.push(rt);
            this.session.react.totalTargets += 1;
        });
    }

    // Aggregates
    getReport() {
        // Color reactions drill stats
        const rts = this.session.color.reactionTimes;
        const avg = rts.length ? rts.reduce((a,b)=>a+b,0)/rts.length : 0;
        const fastest = rts.length ? Math.min(...rts) : 0;
        const slowest = rts.length ? Math.max(...rts) : 0;
        const acc = this.session.color.accuracy;
        const accPct = acc.total ? (acc.correct/acc.total)*100 : 0;
        
        // Deflect drill stats
        const deflect = this.session.deflect;
        const deflectAccuracy = deflect.totalBalls > 0 ? (deflect.hits / deflect.totalBalls) * 100 : 0;
        
        // Target striking drill stats
        const reactTimes = this.session.react.reactionTimes;
        const reactAvg = reactTimes.length ? reactTimes.reduce((a,b)=>a+b,0)/reactTimes.length : 0;
        const reactFastest = reactTimes.length ? Math.min(...reactTimes) : 0;
        const reactSlowest = reactTimes.length ? Math.max(...reactTimes) : 0;
        
        return {
            reaction: { average: avg, fastest, slowest, total: rts.length },
            accuracy: { correct: acc.correct, total: acc.total, percent: accPct },
            beam: { best: this.session.beam.bestDuration, runs: this.session.beam.runs.slice() },
            deflect: { 
                totalBalls: deflect.totalBalls, 
                hits: deflect.hits, 
                accuracy: deflectAccuracy,
                gamesPlayed: deflect.games.length,
                games: deflect.games.slice()
            },
            react: {
                average: reactAvg,
                fastest: reactFastest,
                slowest: reactSlowest,
                total: reactTimes.length,
                times: reactTimes.slice()
            }
        };
    }
}
