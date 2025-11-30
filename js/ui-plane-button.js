import {Component, Property} from '@wonderlandengine/api';

/**
 * Universal UI Plane Button Component
 * Attach this to any 2D plane button and select the action from the dropdown.
 * Uses cursor-target for proper click detection.
 * 
 * REQUIRED SETUP:
 * 1. Attach this component to your button object
 * 2. Attach 'cursor-target' component to the same object
 * 3. Attach 'collision' component to the same object (for raycasting)
 * 4. Ensure your controllers/camera have 'cursor' components
 */
export class UiPlaneButton extends Component {
    static TypeName = 'ui-plane-button';

    static Properties = {
        action: Property.enum(
            ['Tennis Environment', 'Football Environment', 'Gym Environment', 
             'Start Target Drill', 'Start Beam Walk', 'Start Ball Catching', 
             'Stop All Drills', 'Show Report'], 
            'Tennis Environment'
        ),
        debugMode: Property.bool(true),
        autoStartBeamDrill: Property.bool(false),
    };

    start() {
        // Auto-start beam drill after 3 seconds for testing
        if (this.autoStartBeamDrill) {
            console.log('[UiPlaneButton] Auto-starting beam drill in 3 seconds...');
            setTimeout(() => {
                console.log('[UiPlaneButton] Auto-starting beam drill NOW');
                this._startBeamDrill();
            }, 3000);
        }

        // Get the cursor-target component on this object
        this.target = this.object.getComponent('cursor-target');
        
        if (!this.target) {
            console.warn('[UiPlaneButton] cursor-target component not found on', this.object.name, '! Button clicks will not work. Make sure to add cursor-target component in the editor.');
            // Don't proceed with event registration
            this.enabled = false;
            return;
        }

        // Register click event - only if target exists
        try {
            this.target.onDown.add(this._onClick.bind(this));
            
            if (this.debugMode) {
                console.log(`[UiPlaneButton] Initialized with action: ${this.action}`);
                this.target.onHoverStart.add(() => {
                    console.log(`[UiPlaneButton] Hover start on button ${this.action}`);
                });
            }
        } catch (e) {
            console.error('[UiPlaneButton] Error registering events:', e);
        }
    }

    _startBeamDrill() {
        const manager = this.engine.scene.findByName('Manager')[0];
        if (!manager) {
            console.error('[UiPlaneButton] Manager object not found - cannot start beam drill');
            return;
        }

        const gs = manager.getComponent('game-selector');
        if (!gs) {
            console.error('[UiPlaneButton] game-selector component not found on Manager - cannot start beam drill');
            return;
        }

        if (gs.startBeamWalk) {
            console.log('[UiPlaneButton] Starting beam walk drill...');
            gs.startBeamWalk();
        } else {
            console.error('[UiPlaneButton] startBeamWalk method not found on game-selector');
        }
    }

    _onClick() {
        if (this.debugMode) {
            console.log(`[UiPlaneButton] Button clicked: ${this.action}`);
        }

        const manager = this.engine.scene.findByName('Manager')[0];
        if (!manager) {
            console.warn('[UiPlaneButton] Manager object not found');
            return;
        }

        const gs = manager.getComponent('game-selector');
        if (!gs) {
            console.warn('[UiPlaneButton] game-selector component not found on Manager');
            return;
        }

        // Handle different button types based on enum index
        switch(this.action) {
            case 0: // Tennis Environment
                if (gs.showTennis) {
                    gs.showTennis();
                } else {
                    console.warn('[UiPlaneButton] showTennis method not found');
                }
                break;
            
            case 1: // Football Environment
                if (gs.showFootball) {
                    gs.showFootball();
                } else {
                    console.warn('[UiPlaneButton] showFootball method not found');
                }
                break;
            
            case 2: // Gym Environment
                if (gs.showGym) {
                    gs.showGym();
                } else {
                    console.warn('[UiPlaneButton] showGym method not found');
                }
                break;

            case 3: // Start Target Drill
                if (gs.startTargetDrill) {
                    gs.startTargetDrill();
                } else {
                    console.warn('[UiPlaneButton] startTargetDrill method not found');
                }
                break;
            
            case 4: // Start Beam Walk
                if (gs.startBeamWalk) {
                    gs.startBeamWalk();
                } else {
                    console.warn('[UiPlaneButton] startBeamWalk method not found');
                }
                break;
            
            case 5: // Start Ball Catching
                if (gs.startBallDrill) {
                    gs.startBallDrill();
                } else {
                    console.warn('[UiPlaneButton] startBallDrill method not found');
                }
                break;

            case 6: // Stop All Drills
                if (gs.stopDrills) {
                    gs.stopDrills();
                } else {
                    console.warn('[UiPlaneButton] stopDrills method not found');
                }
                break;
            
            case 7: // Show Report
                if (gs.showReport) {
                    gs.showReport();
                } else {
                    console.warn('[UiPlaneButton] showReport method not found');
                }
                break;

            default:
                console.warn(`[UiPlaneButton] Unknown action: ${this.action}`);
        }
    }
}
