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
        deflectManager: Property.object(), // Bouncing ball game (catch/deflect)
        reactManager: Property.object(), // Reaction game (strike/click)
        dataManager: Property.object(),
        // Player/Camera
        player: Property.object(), // Reference to Player object for teleportation
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
        
        // Store initial player position for teleporting back
        if (!this.player) {
            this.player = this.engine.scene.findByName('Player')[0];
        }
        if (this.player) {
            this.initialPlayerPosition = vec3.clone(this.player.getPositionWorld());
            console.log('[GameSelector] Stored initial player position:', this.initialPlayerPosition);
        } else {
            console.warn('[GameSelector] Player object not found! Teleport will not work.');
            this.initialPlayerPosition = vec3.fromValues(-2.5, 0.0, 1.1575535);
        }
        
        this.updateStatus('Select a drill');
        this.updateCue('');
        this.updateStats('');
        this.updateReport('');
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
        if (!this.deflectManager) {
            console.warn('[GameSelector] Deflect Manager (bouncing ball) not linked!');
        }
        if (!this.reactManager) {
            console.warn('[GameSelector] React Manager (sphere spawner) not linked!');
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

    startDeflectDrill() {
        this.stopDrills();
        this.currentDrill = 'deflect';
        const mgr = this.deflectManager?.getComponent('bouncing-ball');
        if (mgr) {
            mgr.startGame?.();
            this.updateStatus('Deflect & Catch: ON');
            this.updateCue('Ready?');
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
            this.updateStatus('Strike & React: ON');
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
        
        // Teleport player back to initial position
        this.teleportPlayerToStart();
        
        this.currentDrill = null;
        this.updateStatus('Drills stopped');
        this.updateCue('');
        this.updateStats('');
    }
    
    teleportPlayerToStart() {
        if (!this.player) {
            this.player = this.engine.scene.findByName('Player')[0];
        }
        
        if (this.player && this.initialPlayerPosition) {
            this.player.setPositionWorld(this.initialPlayerPosition);
            console.log('[GameSelector] Teleported player to initial position:', this.initialPlayerPosition);
        } else {
            console.warn('[GameSelector] Cannot teleport - player or initial position not found');
        }
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
        
        let hasData = false;
        
        // Build individual game stat blocks (without emojis for better compatibility)
        const targetStats = (r.reaction.total > 0 || r.accuracy.total > 0) ? this._buildTargetStats(r) : null;
        const beamStats = (r.beam.runs.length > 0) ? this._buildBeamStats(r) : null;
        const deflectStats = (r.deflect.gamesPlayed > 0) ? this._buildDeflectStats(r) : null;
        const reactStats = (r.react.total > 0) ? this._buildReactStats(r) : null;
        
        hasData = targetStats || beamStats || deflectStats || reactStats;
        
        if (!hasData) {
            this.updateReport('No data yet - complete some drills first!');
            return;
        }
        
        // Build 2x2 grid layout with simple formatting
        const colWidth = 20; // characters per column
        const separator = ' | ';
        
        // Prepare columns
        const leftCol = [targetStats, beamStats].filter(s => s);
        const rightCol = [deflectStats, reactStats].filter(s => s);
        
        // Get lines from each column
        const leftLines = this._getColumnLines(leftCol, colWidth);
        const rightLines = this._getColumnLines(rightCol, colWidth);
        const maxLines = Math.max(leftLines.length, rightLines.length);
        
        // Build report header
        let report = '====== SESSION REPORT ======\n\n';
        
        // Build grid rows
        for (let i = 0; i < maxLines; i++) {
            const left = (leftLines[i] || '').padEnd(colWidth);
            const right = (rightLines[i] || '').padEnd(colWidth);
            report += left + separator + right + '\n';
        }
        
        console.log(report);
        this.updateReport(report);
    }
    
    _buildTargetStats(r) {
        const lines = ['TARGET DRILL', '------------'];
        if (r.reaction.total > 0) {
            lines.push(`Hits: ${r.reaction.total}`);
            lines.push(`RT: ${r.reaction.average.toFixed(2)}s`);
        }
        if (r.accuracy.total > 0) {
            lines.push(`Acc: ${r.accuracy.percent.toFixed(1)}%`);
        }
        return lines;
    }
    
    _buildBeamStats(r) {
        const avgBeam = r.beam.runs.reduce((a,b)=>a+b,0)/r.beam.runs.length;
        return [
            'BEAM WALK',
            '---------',
            `Runs: ${r.beam.runs.length}`,
            `Best: ${r.beam.best.toFixed(1)}s`,
            `Avg: ${avgBeam.toFixed(1)}s`
        ];
    }
    
    _buildDeflectStats(r) {
        return [
            'DEFLECT & CATCH',
            '---------------',
            `Games: ${r.deflect.gamesPlayed}`,
            `Balls: ${r.deflect.totalBalls}`,
            `Hits: ${r.deflect.hits}`,
            `Acc: ${r.deflect.accuracy.toFixed(1)}%`
        ];
    }
    
    _buildReactStats(r) {
        return [
            'STRIKE & REACT',
            '--------------',
            `Hits: ${r.react.total}`,
            `RT: ${r.react.average.toFixed(2)}s`,
            `Best: ${r.react.fastest.toFixed(2)}s`
        ];
    }
    
    _getColumnLines(blocks, colWidth) {
        const lines = [];
        for (let i = 0; i < blocks.length; i++) {
            const blockLines = blocks[i];
            for (const line of blockLines) {
                // Truncate if too long
                const truncated = line.length > colWidth ? line.substring(0, colWidth - 3) + '...' : line;
                lines.push(truncated);
            }
            if (i < blocks.length - 1) {
                lines.push(''); // Add spacing between blocks
            }
        }
        return lines;
    }
}
