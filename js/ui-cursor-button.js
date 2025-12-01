import {Component, Property} from '@wonderlandengine/api';

/**
 * UI Cursor Button Component
 * 
 * This component handles button clicks via VR controller cursors (raycasting).
 * It replaces the distance-based ui-plane-button approach with proper cursor interaction.
 * 
 * REQUIRED SETUP:
 * 1. Attach this component to your button object
 * 2. Attach 'cursor-target' component to the same object
 * 3. Attach 'collision' component to the same object (for raycasting)
 * 4. Ensure your VR controllers have 'cursor' components with visible cursor rays
 * 
 * The cursor component on controllers will show a visible ray/line that points
 * at objects, and when you pull the trigger, it will click on cursor-target objects.
 */
export class UiCursorButton extends Component {
    static TypeName = 'ui-cursor-button';

    static Properties = {
        action: Property.enum(
            ['Tennis Environment', 'Football Environment', 'Gym Environment', 
             'Start Target Drill', 'Start Beam Walk', 'Start Ball Catching', 
             'Stop All Drills', 'Show Report'], 
            'Tennis Environment'
        ),
        debugMode: Property.bool(true),
    };

    start() {
        // Get the cursor-target component on this object
        this.target = this.object.getComponent('cursor-target');
        
        if (!this.target) {
            console.error('[UiCursorButton] cursor-target component not found on', this.object.name, '! Add cursor-target component in the editor.');
            return;
        }

        const collision = this.object.getComponent('collision');
        if (!collision) {
            console.warn('[UiCursorButton] No collision component found on', this.object.name, '. Cursor raycasting may not work. Add collision component in the editor.');
        }

        // Register click event
        this.target.onClick.add(this._onClick.bind(this));
        
        if (this.debugMode) {
            console.log(`[UiCursorButton] Initialized on ${this.object.name} with action: ${this.action}`);
            
            this.target.onHover.add(() => {
                console.log(`[UiCursorButton] Hover on button ${this.action}`);
            });

            this.target.onUnhover.add(() => {
                console.log(`[UiCursorButton] Unhover from button ${this.action}`);
            });
        }
    }

    _onClick(_, cursor) {
        if (this.debugMode) {
            console.log(`[UiCursorButton] Button clicked: ${this.action} by cursor:`, cursor?.object?.name || 'unknown');
        }

        const manager = this.engine.scene.findByName('Manager')[0];
        if (!manager) {
            console.warn('[UiCursorButton] Manager object not found');
            return;
        }

        const gs = manager.getComponent('game-selector');
        if (!gs) {
            console.warn('[UiCursorButton] game-selector component not found on Manager');
            return;
        }

        // Execute action based on dropdown selection
        switch (this.action) {
            case 0: // Tennis Environment
                if (gs.switchToTennis) gs.switchToTennis();
                break;
            case 1: // Football Environment
                if (gs.switchToFootball) gs.switchToFootball();
                break;
            case 2: // Gym Environment
                if (gs.switchToGym) gs.switchToGym();
                break;
            case 3: // Start Target Drill
                if (gs.startTargetDrill) gs.startTargetDrill();
                break;
            case 4: // Start Beam Walk
                if (gs.startBeamWalk) gs.startBeamWalk();
                break;
            case 5: // Start Ball Catching
                if (gs.startBallDrill) gs.startBallDrill();
                break;
            case 6: // Stop All Drills
                if (gs.stopAllDrills) gs.stopAllDrills();
                break;
            case 7: // Show Report
                if (gs.showReport) gs.showReport();
                break;
            default:
                console.warn(`[UiCursorButton] Unknown action: ${this.action}`);
        }
    }
}
