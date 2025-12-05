import { Component, Property, InputComponent } from '@wonderlandengine/api';
import { CursorTarget } from '@wonderlandengine/components'; 
import { triggerHaptic, HapticPatterns } from './haptic-feedback.js';

export class ReactionGame extends Component {
    static TypeName = 'reaction-game';
    static Properties = {
        spawnArea: Property.object(),
        targetTemplate: Property.object(),
        maxTargets: Property.int(20),
        timeoutDuration: Property.float(10.0),
        
        // Game selector for unified UI
        gameSelector: Property.object(),
    };

    init() {
        this.isGameActive = false;
    }

    start() {
        this.score = 0;
        this.targetsSpawned = 0;
        this.reactionTimes = [];
        this.isGameActive = false; // Game starts inactive
        this.currentTimer = 0;
        this.currentTargetActive = false;

        // Get game selector reference
        if (!this.gameSelector) {
            const manager = this.engine.scene.findByName('Manager')[0];
            if (manager) {
                this.gameSelector = manager.getComponent('game-selector');
            }
        }

        // Setup game target
        this.cursorTargetComp = this.targetTemplate.getComponent(CursorTarget);
        if(!this.cursorTargetComp) {
            this.cursorTargetComp = this.targetTemplate.addComponent(CursorTarget);
        }

        // Ensure target is hidden initially
        if (this.targetTemplate) {
            this.targetTemplate.active = false;
        }
    }

    updateUI() {
        const gs = this.gameSelector?.getComponent?.('game-selector') || this.gameSelector;
        if (gs) {
            gs.updateCue?.(`Target ${this.targetsSpawned} / ${this.maxTargets}`);
            
            if (this.reactionTimes.length > 0) {
                const total = this.reactionTimes.reduce((a, b) => a + b, 0);
                const avg = total / this.reactionTimes.length;
                gs.updateStats?.(`Avg Time: ${avg.toFixed(3)}s | Completed: ${this.reactionTimes.length}`);
            }
        }
    }

    onActivate() {
        if (this.cursorTargetComp) {
            this.cursorTargetComp.onDown.add(this.onTargetDown);
            this.cursorTargetComp.onHover.add(this.onTargetHover);
        }
    }

    onDeactivate() {
        if (this.cursorTargetComp) {
            this.cursorTargetComp.onDown.remove(this.onTargetDown);
            this.cursorTargetComp.onHover.remove(this.onTargetHover);
        }
    }

    update(dt) {
        if (!this.isGameActive || !this.currentTargetActive) return;

        this.currentTimer += dt;
        if (this.currentTimer >= this.timeoutDuration) {
            this.handleTimeout();
        }
    }

    onTargetDown = (_, cursor) => {
        if (!this.currentTargetActive) return;
        triggerHaptic(cursor.object, HapticPatterns.TARGET_HIT);
        this.onTargetHit();
    };

    onTargetHover = (_, cursor) => {
        if (!this.currentTargetActive) return;
        triggerHaptic(cursor.object, HapticPatterns.HOVER);
    };

    /**
     * Dedicated function to start the game
     */
    startGame() {
        console.log("[ReactionGame] Starting game...");

        // Reset variables
        this.score = 0;
        this.targetsSpawned = 0;
        this.reactionTimes = [];
        this.isGameActive = true;
        this.currentTimer = 0;
        this.currentTargetActive = false;

        // Update UI
        this.updateUI();

        // Start spawning
        this.spawnNextTarget();
    }

    spawnNextTarget() {
        if (this.targetsSpawned >= this.maxTargets) {
            this.endGame();
            return;
        }

        this.targetsSpawned++;
        this.updateUI();

        const rangeX = this.spawnArea.scalingWorld[0]; 
        const rangeY = this.spawnArea.scalingWorld[1];

        const randX = (Math.random() - 0.5) * 2 * rangeX;
        const randY = (Math.random() - 0.5) * 2 * rangeY;

        this.targetTemplate.setTranslationWorld(this.spawnArea.getTranslationWorld([]));
        this.targetTemplate.translateObject([randX, randY, 0.1]); 

        this.targetTemplate.active = true;
        this.currentTargetActive = true;
        this.currentTimer = 0; 
        this.sphereStartTime = Date.now() / 1000; 
    }

    onTargetHit() {
        const hitTime = Date.now() / 1000;
        const reactionTime = hitTime - this.sphereStartTime;
        this.reactionTimes.push(reactionTime);
        this.targetTemplate.active = false;
        this.currentTargetActive = false;
        this.updateUI();
        this.spawnNextTarget();
    }

    handleTimeout() {
        this.reactionTimes.push(this.timeoutDuration); 
        this.targetTemplate.active = false;
        this.currentTargetActive = false;
        this.spawnNextTarget();
    }

    endGame() {
        console.log("[ReactionGame] Game complete!");
        this.isGameActive = false;
        this.currentTargetActive = false;
        this.targetTemplate.active = false;

        const total = this.reactionTimes.reduce((a, b) => a + b, 0);
        const avg = total / (this.reactionTimes.length || 1);
        const fastest = this.reactionTimes.length ? Math.min(...this.reactionTimes) : 0;
        const slowest = this.reactionTimes.length ? Math.max(...this.reactionTimes) : 0;

        // Save data to data manager
        const manager = this.engine.scene.findByName('Manager')[0];
        if (manager) {
            const dm = manager.getComponent('data-manager');
            if (dm && this.reactionTimes.length > 0) {
                dm.addReactSession(this.reactionTimes);
            }
        }

        // Update UI with final results
        const gs = this.gameSelector?.getComponent?.('game-selector') || this.gameSelector;
        if (gs) {
            gs.updateStatus?.('Target Strike: COMPLETE');
            gs.updateCue?.('Game Over!');
            gs.updateStats?.(`Avg: ${avg.toFixed(3)}s | Fast: ${fastest.toFixed(3)}s | Slow: ${slowest.toFixed(3)}s | Total: ${this.reactionTimes.length}`);
        }
    }

    // Called by the button (for backward compatibility)
    resetGame() {
        this.startGame();
    }
}