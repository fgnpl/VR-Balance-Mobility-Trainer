import { Component, Property, InputComponent } from '@wonderlandengine/api';
import { CursorTarget } from '@wonderlandengine/components'; 
import { triggerHaptic, HapticPatterns } from './haptic-feedback.js';

export class ReactionGame extends Component {
    static TypeName = 'reaction-game';
    static Properties = {
        spawnArea: Property.object(),
        targetTemplate: Property.object(),
        statusText: Property.object(), 
        maxTargets: Property.int(20),
        timeoutDuration: Property.float(10.0),

        // UI references
        endPanel: Property.object(),       
        resultText: Property.object(),
        
        // Where should the panel appear when the game ends/starts?
        panelVisibleLocation: Property.object() 
    };

    init() {
        // Coordinates for panel when hidden
        this.hiddenPosition = [0, -50, 0];
        this.isGameActive = false;
    }

    start() {
        this.textComponent = this.statusText.getComponent('text');
        this.resultTextComponent = this.resultText.getComponent('text');

        this.score = 0;
        this.targetsSpawned = 0;
        this.reactionTimes = [];
        this.isGameActive = false; // Game starts inactive
        this.currentTimer = 0;
        this.currentTargetActive = false;

        // Setup game target
        this.cursorTargetComp = this.targetTemplate.getComponent(CursorTarget);
        if(!this.cursorTargetComp) {
            this.cursorTargetComp = this.targetTemplate.addComponent(CursorTarget);
        }

        // --- CHANGE: SHOW PANEL AT START ---
        if (this.endPanel) {
            this.endPanel.active = true;
            // Move the panel to the visible location immediately
            if (this.panelVisibleLocation) {
                const pos = this.panelVisibleLocation.getTranslationWorld([]);
                this.endPanel.setTranslationWorld(pos);
            }
        }

        // Set initial text
        if (this.resultTextComponent) {
            this.resultTextComponent.text = "Ready?";
        }

        // Ensure target is hidden initially
        if (this.targetTemplate) {
            this.targetTemplate.active = false;
        }

        // Note: We do NOT call spawnNextTarget() here. We wait for button click.
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
        console.log("Starting game...");

        // Hide the panel
        this.hideGameOverPanel();

        // Reset variables
        this.score = 0;
        this.targetsSpawned = 0;
        this.reactionTimes = [];
        this.isGameActive = true;
        this.currentTimer = 0;
        this.currentTargetActive = false;

        // Start spawning
        this.spawnNextTarget();
    }

    spawnNextTarget() {
        if (this.targetsSpawned >= this.maxTargets) {
            this.endGame();
            return;
        }

        this.targetsSpawned++;
        this.updateText(`Target: ${this.targetsSpawned}/${this.maxTargets}`);

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
        this.spawnNextTarget();
    }

    handleTimeout() {
        this.reactionTimes.push(this.timeoutDuration); 
        this.targetTemplate.active = false;
        this.currentTargetActive = false;
        this.spawnNextTarget();
    }

    endGame() {
        this.isGameActive = false;
        this.currentTargetActive = false;
        this.targetTemplate.active = false;

        const total = this.reactionTimes.reduce((a, b) => a + b, 0);
        const avg = total / (this.reactionTimes.length || 1);

        // Update the text before moving it 
        if (this.resultTextComponent) {
            this.resultTextComponent.text = `Avg. Time: ${avg.toFixed(3)}s`;
        }
            
        // Move the panel to the desired location
        if (this.endPanel && this.panelVisibleLocation) {
            const pos = this.panelVisibleLocation.getTranslationWorld([]);
            this.endPanel.setTranslationWorld(pos);
        }
    }

    hideGameOverPanel() {
        // Teleport the panel deep under the map
        if (this.endPanel) {
            this.endPanel.setPositionWorld(this.hiddenPosition);
        }
    }

    // Called by the button
    resetGame() {
        this.startGame();
    }

    updateText(msg) {
        if (this.textComponent) this.textComponent.text = msg;
    }
}