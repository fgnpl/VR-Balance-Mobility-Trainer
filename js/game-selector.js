import {Component, Property} from '@wonderlandengine/api';
import {vec3} from 'gl-matrix';

/**
 * GameSelector: central scene manager to choose environment and drills.
 * Wire properties in editor to the EnvironmentSwitcher and drill managers.
 */
export class GameSelector extends Component {
    static TypeName = 'game-selector';
    static Properties = {
        // Environment parents
        footballField: Property.object(),
        tennisCourt: Property.object(),
        gymFloor: Property.object(),
        defaultEnvironment: Property.enum(['football','tennis','gym'],'football'),
        // Drill managers
        targetManager: Property.object(),
        beamWalkManager: Property.object(),
        ballThrower: Property.object(),
        dataManager: Property.object(),
        // UI elements
        uiStatusText: Property.object(),
    };

    start() {
        this.currentDrill = null; // 'target' | 'beam' | 'ball' | null
        this._lastStatus = '';
        this.updateStatus('Select a drill');
        this._storeOriginalScales();
        this._applyDefaultEnvironment();
        this._validateSetup();
    }

    _validateSetup() {
        // Validate required objects are linked
        if (!this.footballField && !this.tennisCourt && !this.gymFloor) {
            console.warn('[GameSelector] No environment objects linked!');
        }
        if (!this.targetManager) {
            console.warn('[GameSelector] Target Manager not linked!');
        }
        if (!this.beamWalkManager) {
            console.warn('[GameSelector] Beam Walk Manager not linked!');
        }
        if (!this.ballThrower) {
            console.warn('[GameSelector] Ball Thrower not linked!');
        }
        if (!this.dataManager) {
            console.warn('[GameSelector] Data Manager not linked!');
        }
    }

    updateStatus(text) {
        if (this._lastStatus === text) return;
        this._lastStatus = text;
        
        if (this.uiStatusText) {
            const textComp = this.uiStatusText.getComponent('text');
            if (textComp) {
                textComp.text = text;
            } else {
                console.log('[GameSelector] status:', text);
            }
        } else {
            console.log('[GameSelector] status:', text);
        }
    }

    // ----- Environment Switching Logic -----
    _storeOriginalScales() {
        this._orig = {
            football: vec3.fromValues(1,1,1),
            tennis: vec3.fromValues(1,1,1),
            gym: vec3.fromValues(1,1,1)
        };
        if (this.footballField) vec3.copy(this._orig.football, this.footballField.scalingLocal);
        if (this.tennisCourt) vec3.copy(this._orig.tennis, this.tennisCourt.scalingLocal);
        if (this.gymFloor) vec3.copy(this._orig.gym, this.gymFloor.scalingLocal);
        this._hidden = [0.0000001,0.0000001,0.0000001];
    }

    _applyDefaultEnvironment() {
        if (this.defaultEnvironment === 0) this.showFootball();
        else if (this.defaultEnvironment === 1) this.showTennis();
        else if (this.defaultEnvironment === 2) this.showGym();
    }

    showFootball() {
        if (this.footballField) this.footballField.setScalingLocal(this._orig.football);
        if (this.tennisCourt) this.tennisCourt.setScalingLocal(this._hidden);
        if (this.gymFloor) this.gymFloor.setScalingLocal(this._hidden);
    }
    showTennis() {
        if (this.footballField) this.footballField.setScalingLocal(this._hidden);
        if (this.tennisCourt) this.tennisCourt.setScalingLocal(this._orig.tennis);
        if (this.gymFloor) this.gymFloor.setScalingLocal(this._hidden);
    }
    showGym() {
        if (this.footballField) this.footballField.setScalingLocal(this._hidden);
        if (this.tennisCourt) this.tennisCourt.setScalingLocal(this._hidden);
        if (this.gymFloor) this.gymFloor.setScalingLocal(this._orig.gym);
    }

    // Drills
    startTargetDrill() {
        this.stopDrills();
        this.currentDrill = 'target';
        const mgr = this.targetManager?.getComponent('target-manager');
        if (mgr) {
            if (mgr.startGame) mgr.startGame(); else mgr.start();
            this.updateStatus('Target Striking: ON');
        } else {
            this.updateStatus('Error: Target Manager not found');
        }
    }

    startBeamWalk() {
        this.stopDrills();
        this.currentDrill = 'beam';
        const mgr = this.beamWalkManager?.getComponent('beam-walk-manager');
        if (mgr) {
            mgr.startDrill?.();
            this.updateStatus('Beam Walk: ON');
        } else {
            this.updateStatus('Error: Beam Manager not found');
        }
    }

    startBallDrill() {
        this.stopDrills();
        this.currentDrill = 'ball';
        const mgr = this.ballThrower?.getComponent('ball-thrower');
        if (mgr) {
            mgr.startDrill?.();
            this.updateStatus('Ball Catching: ON');
        } else {
            this.updateStatus('Error: Ball Thrower not found');
        }
    }

    stopDrills() {
        if (this.currentDrill === 'target') {
            const tm = this.targetManager?.getComponent('target-manager');
            tm?.endGame?.();
        } else if (this.currentDrill === 'beam') {
            const bm = this.beamWalkManager?.getComponent('beam-walk-manager');
            bm?.endDrill?.();
        } else if (this.currentDrill === 'ball') {
            const bt = this.ballThrower?.getComponent('ball-thrower');
            bt?.endDrill?.();
        }
        this.currentDrill = null;
        this.updateStatus('Drills stopped');
    }

    // Report
    showReport() {
        const dm = this.dataManager?.getComponent('data-manager');
        if (!dm) {
            this.updateStatus('Error: No data available');
            return;
        }
        
        const r = dm.getReport();
        
        // Build comprehensive report string
        let report = '=== SESSION REPORT ===\n';
        
        // Target Striking results
        if (r.reaction.total > 0) {
            report += `TARGET: Hits:${r.reaction.total} AvgRT:${r.reaction.average.toFixed(2)}s Fast:${r.reaction.fastest.toFixed(2)}s Slow:${r.reaction.slowest.toFixed(2)}s `;
            if (r.accuracy.total > 0) {
                report += `Acc:${r.accuracy.percent.toFixed(0)}% `;
            }
            report += '\n';
        }
        
        // Beam Walk results
        if (r.beam.runs.length > 0) {
            report += `BEAM: Runs:${r.beam.runs.length} Best:${r.beam.best.toFixed(2)}s Avg:${(r.beam.runs.reduce((a,b)=>a+b,0)/r.beam.runs.length).toFixed(2)}s\n`;
        }
        
        // Ball Catching results
        if (r.ball.total > 0) {
            report += `BALL: Caught:${r.ball.caught} Deflected:${r.ball.deflected} Missed:${r.ball.missed} Success:${r.ball.successRate.toFixed(0)}%\n`;
        }
        
        if (r.reaction.total === 0 && r.beam.runs.length === 0 && r.ball.total === 0) {
            report = 'No data yet - complete some drills first!';
        }
        
        console.log(report);
        this.updateStatus(report.replace(/\n/g, ' | '));
    }
}
