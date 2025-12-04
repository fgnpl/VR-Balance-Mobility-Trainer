import {Component, Object, Property} from '@wonderlandengine/api';
import {vec3} from 'gl-matrix';

/**
 * Applies a "head bob" (camera shake) effect when the player is moving.
 *
 * INSTRUCTIONS:
 * 1. Attach this component to your 'NonVrCamera' object.
 * 2. Set the 'Player Object' property to point to your main 'Player' object
 * (the one that has the 'wasd-controls' component on it).
 * 3. Adjust frequency and amount to your liking.
 */
export class HeadBob extends Component {
    static TypeName = 'head-bob';
    static Properties = {
        /** The Player object that has the wasd-controls component */
        playerObject: Property.object(),
        /** How fast the bobbing effect is (e.g., 10.0) */
        bobFrequency: Property.float(10.0),
        /** How much the camera bobs up and down (e.g., 0.03) */
        bobAmount: Property.float(0.03),
        /** A small value to ignore tiny movements and stop bobbing */
        epsilon: Property.float(0.001)
    };

    start() {
        // Store the initial local position of the camera.
        // We will add the bob offset to this original position.
        this.initialLocalPosition = vec3.create();
        this.object.getTranslationLocal(this.initialLocalPosition);

        // Store the player's last position to check for movement
        this.lastPlayerPosition = vec3.create();
        if(this.playerObject) {
            this.playerObject.getTranslationWorld(this.lastPlayerPosition);
        }

        this.bobTime = 0;
    }

    update(dt) {
        if (!this.playerObject) {
            // A check to make sure the property is set in the editor
            if(this.engine.frame % 60 === 0) { // Log once per second
                 console.warn('HeadBob: "Player Object" property is not set.');
            }
            return;
        }

        // Get current player position
        const currentPlayerPosition = vec3.create();
        this.playerObject.getTranslationWorld(currentPlayerPosition);

        // Check if the player has moved on the XZ plane (ignoring jumping)
        const deltaX = this.lastPlayerPosition[0] - currentPlayerPosition[0];
        const deltaZ = this.lastPlayerPosition[2] - currentPlayerPosition[2];
        const distanceMoved = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ);

        let bobOffset = 0;
        if (distanceMoved > this.epsilon) {
            // Player is moving
            // Update the bobTime based on frequency and delta time
            this.bobTime += dt * this.bobFrequency;
            
            // Calculate the bob offset using a sine wave
            // This creates the smooth up-and-down motion
            bobOffset = Math.sin(this.bobTime) * this.bobAmount;
        } else {
            // Player is not moving, reset bob time so it starts fresh next time
            this.bobTime = 0;
            // You could also smoothly return to center, but a hard stop is simplest
        }

        // Apply the bob offset to the camera's initial local position
        const newLocalPosition = vec3.create();
        vec3.copy(newLocalPosition, this.initialLocalPosition);
        
        // The bob is applied to the Y-axis (up and down)
        newLocalPosition[1] += bobOffset; 

        // Set the new local position for this frame
        this.object.setTranslationLocal(newLocalPosition);

        // Update last player position for the next frame's check
        vec3.copy(this.lastPlayerPosition, currentPlayerPosition);
    }
}
