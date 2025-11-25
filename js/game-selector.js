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
        dataManager: Property.object(),
        // UI elements
        uiStatusText: Property.object(),
    };

    start() {
        this.currentDrill = null; // 'target' | 'beam' | null
        this.updateStatus('Select a drill');
        this._storeOriginalScales();
        this._applyDefaultEnvironment();
    }

    updateStatus(text) {
        if (this.uiStatusText) {
            const textComp = this.uiStatusText.getComponent('text');
            if (textComp) textComp.text = text; else console.log('[GameSelector] status:', text);
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
            // restart logic by calling a public method if exists, else re-running start behavior
            if (mgr.startGame) mgr.startGame(); else mgr.start();
            this.updateStatus('Target Striking: ON');
        }
    }

    startBeamWalk() {
        this.stopDrills();
        this.currentDrill = 'beam';
        const mgr = this.beamWalkManager?.getComponent('beam-walk-manager');
        if (mgr) {
            mgr.startDrill?.();
            this.updateStatus('Beam Walk: ON');
        }
    }

    stopDrills() {
        if (this.currentDrill === 'target') {
            const tm = this.targetManager?.getComponent('target-manager');
            tm?.endGame?.();
        } else if (this.currentDrill === 'beam') {
            const bm = this.beamWalkManager?.getComponent('beam-walk-manager');
            bm?.endDrill?.();
        }
        this.currentDrill = null;
        this.updateStatus('Drills stopped');
    }

    // Report
    showReport() {
        const dm = this.dataManager?.getComponent('data-manager');
        if (!dm) return;
        const r = dm.getReport();
        this.updateStatus(`AvgRT:${r.reaction.average.toFixed(2)}s Fast:${r.reaction.fastest.toFixed(2)}s Slow:${r.reaction.slowest.toFixed(2)}s Acc:${r.accuracy.percent.toFixed(0)}% BestBeam:${r.beam.best.toFixed(2)}s`);
    }
}
