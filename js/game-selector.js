import {Component, Property} from '@wonderlandengine/api';
import {vec3} from 'gl-matrix';

/**
 * GameSelector: central scene manager to choose environment and drills.
 */
export class GameSelector extends Component {
    static TypeName = 'game-selector';
    static Properties = {
        // Environment parents
        footballField: Property.object(),
        tennisCourt: Property.object(),
        gymFloor: Property.object(),
        defaultEnvironment: Property.enum(['football', 'tennis', 'gym'], 'football'),
        // Drill managers
        targetManager: Property.object(),
        beamWalkManager: Property.object(),
        deflectManager: Property.object(), 
        reactManager: Property.object(), 
        dataManager: Property.object(),
        // UI elements
        uiStatusText: Property.object(),
        uiCueText: Property.object(),
        uiStatsText: Property.object(),
        uiReportText: Property.object(),
    };

    start() {
        this.currentDrill = null; // 'target' | 'beam' | 'deflect' | 'react' | null
        this._lastStatus = '';
        this._lastCue = '';
        this._lastStats = '';
        this._lastReport = '';
        this.updateStatus('Select a drill');
        this.updateCue('');
        this.updateStats('');
        this.updateReport('');
        this._storeOriginalScales();
        this._applyDefaultEnvironment();
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

    updateCue(text) {
        if (this._lastCue === text) return;
        this._lastCue = text;
        
        if (this.uiCueText) {
            const textComp = this.uiCueText.getComponent('text');
            if (textComp) {
                textComp.text = text;
            }
        }
    }

    updateStats(text) {
        if (this._lastStats === text) return;
        this._lastStats = text;
        
        if (this.uiStatsText) {
            const textComp = this.uiStatsText.getComponent('text');
            if (textComp) {
                textComp.text = text;
            }
        }
    }

    updateReport(text) {
        if (this._lastReport === text) return;
        this._lastReport = text;
        
        if (this.uiReportText) {
            const textComp = this.uiReportText.getComponent('text');
            if (textComp) {
                textComp.text = text;
            }
        }
    }

    // Environment switching 
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
            this.updateStatus('Color React: ON');
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

    startDeflectDrill() {
        this.stopDrills();
        this.currentDrill = 'deflect';
        const mgr = this.deflectManager?.getComponent('bouncing-ball');
        if (mgr) {
            mgr.startGame?.();
            this.updateStatus('Deflect: ON');
            this.updateCue('Deflect with bat!');
            this.updateStats('');
        } else {
            this.updateStatus('Error: Deflect Manager not found');
        }
    }

    startReactDrill() {
        this.stopDrills();
        this.currentDrill = 'react';
        const mgr = this.reactManager?.getComponent('reaction-game');
        if (mgr) {
            mgr.startGame?.();
            this.updateStatus('Target Striking: ON');
            this.updateCue('Click the targets!');
            this.updateStats('');
        } else {
            this.updateStatus('Error: React Manager not found');
        }
    }

    stopDrills() {
        if (this.currentDrill === 'target') {
            const tm = this.targetManager?.getComponent('target-manager');
            tm?.endGame?.();
        } else if (this.currentDrill === 'beam') {
            const bm = this.beamWalkManager?.getComponent('beam-walk-manager');
            bm?.endDrill?.();
        } else if (this.currentDrill === 'deflect') {
            const dm = this.deflectManager?.getComponent('bouncing-ball');
            if (dm) {
                dm.gameRunning = false;
                dm.setGameComponentsActive?.(false);
            }
        } else if (this.currentDrill === 'react') {
            const rm = this.reactManager?.getComponent('reaction-game');
            if (rm) {
                rm.isGameActive = false;
                rm.currentTargetActive = false;
                if (rm.targetTemplate) {
                    rm.targetTemplate.active = false;
                }
            }
        }
        this.currentDrill = null;
        this.updateStatus('Drills stopped');
        this.updateCue('');
        this.updateStats('');
    }

    // Report
    showReport() {
        const dm = this.dataManager?.getComponent('data-manager');
        if (!dm) {
            this.updateReport('Error: No data available');
            return;
        }
        
        const r = dm.getReport();
        console.log('[GameSelector] Report data:', r); // Debug log
        
        // Build comprehensive report string
        let report = 'SESSION REPORT\n\n';
        let hasData = false;
        
        // Target Striking results - check for either reaction times or accuracy data
        if (r.reaction.total > 0 || r.accuracy.total > 0) {
            hasData = true;
            report += `Color Drill\n`;
            
            if (r.reaction.total > 0) {
                report += `  Targets Hit: ${r.reaction.total}\n`;
                report += `  Avg Reaction Time: ${r.reaction.average.toFixed(3)}s\n`;
                report += `  Fastest: ${r.reaction.fastest.toFixed(3)}s\n`;
                report += `  Slowest: ${r.reaction.slowest.toFixed(3)}s\n`;
            }
            
            if (r.accuracy.total > 0) {
                report += `  Accuracy: ${r.accuracy.percent.toFixed(1)}% (${r.accuracy.correct}/${r.accuracy.total})\n`;
            }
            report += '\n';
        }
        
        // Beam Walk results
        if (r.beam.runs.length > 0) {
            hasData = true;
            const avgBeam = r.beam.runs.reduce((a,b)=>a+b,0)/r.beam.runs.length;
            report += `Beam Walk\n`;
            report += `  Total Runs: ${r.beam.runs.length}\n`;
            report += `  Best Time: ${r.beam.best.toFixed(2)}s\n`;
            report += `  Average Time: ${avgBeam.toFixed(2)}s\n`;
            report += '\n';
        }
        
        // Deflect & Catch results
        if (r.deflect.gamesPlayed > 0) {
            hasData = true;
            report += `Deflect Drill\n`;
            report += `  Games Played: ${r.deflect.gamesPlayed}\n`;
            report += `  Total Balls: ${r.deflect.totalBalls}\n`;
            report += `  Total Hits: ${r.deflect.hits}\n`;
            report += `  Accuracy: ${r.deflect.accuracy.toFixed(1)}%\n`;
            report += '\n';
        }
        
        // Strike & React results
        if (r.react.total > 0) {
            hasData = true;
            report += `Target Striking\n`;
            report += `  Targets Hit: ${r.react.total}\n`;
            report += `  Avg Reaction Time: ${r.react.average.toFixed(3)}s\n`;
            report += `  Fastest: ${r.react.fastest.toFixed(3)}s\n`;
            report += `  Slowest: ${r.react.slowest.toFixed(3)}s\n`;
            report += '\n';
        }
        
        if (!hasData) {
            report = 'No data yet - complete some drills first!';
        }
        
        console.log(report);
        this.updateReport(report);
    }
}
