import {Component, Object, Property} from '@wonderlandengine/api';
import {vec3} from 'gl-matrix';

/**
 * A tiny scale vector to effectively hide an object.
 */
const HIDDEN_SCALE = [0.0000001, 0.0000001, 0.0000001];

/**
 * Manages the visibility of multiple environment objects by changing their
 * scale, ensuring only one is visible at a time.
 *
 * Add this component to a "Manager" object. Then, in the editor properties,
 * drag your environment parent objects (FootballField, TennisCourt, GymFloor)
 * into their respective slots.
 *
 * You can then call the public methods (e.g., showTennisCourt()) from
 * other scripts (like UI buttons) to change the active environment.
 */
export class EnvironmentSwitcher extends Component {
    static TypeName = 'environment-switcher';
    static Properties = {
        /** The parent object for the Football Field environment */
        footballField: Property.object(null), // Default to null
        /** The parent object for the Tennis Court environment */
        tennisCourt: Property.object(null), // Default to null
        /** The parent object for the Gym Floor environment */
        gymFloor: Property.object(null), // Default to null
        /** Which environment to show by default when the scene loads */
        defaultEnvironment: Property.enum(['football', 'tennis', 'gym'], 'football'),
    };

    /** Store the original scales of the environments */
    originalScales = {
        football: vec3.create(),
        tennis: vec3.create(),
        gym: vec3.create()
    };

    start() {
        // --- Store Original Scales & Check Links ---
        if (this.footballField) {
            vec3.copy(this.originalScales.football, this.footballField.scalingLocal);
        } else {
            console.warn('EnvironmentSwitcher: "Football Field" object is not linked in the editor properties.');
            vec3.set(this.originalScales.football, 1, 1, 1); // Default to 1,1,1
        }
        if (this.tennisCourt) {
            vec3.copy(this.originalScales.tennis, this.tennisCourt.scalingLocal);
        } else {
            console.warn('EnvironmentSwitcher: "Tennis Court" object is not linked in the editor properties.');
            vec3.set(this.originalScales.tennis, 1, 1, 1); // Default to 1,1,1
        }
        if (this.gymFloor) {
            vec3.copy(this.originalScales.gym, this.gymFloor.scalingLocal);
        } else {
            console.warn('EnvironmentSwitcher: "Gym Floor" object is not linked in the editor properties.');
            vec3.set(this.originalScales.gym, 1, 1, 1); // Default to 1,1,1
        }

        // Set the initial visible environment based on the 'defaultEnvironment' property
        if (this.defaultEnvironment === 0) { // 'football'
            this.showFootballField();
        } else if (this.defaultEnvironment === 1) { // 'tennis'
            this.showTennisCourt();
        } else if (this.defaultEnvironment === 2) { // 'gym'
            this.showGymFloor();
        }
    }

    /**
     * Activates the Football Field and deactivates the others.
     */
    showFootballField() {
        console.log("Attempting to show Football Field...");

        if (this.footballField) {
            this.footballField.setScalingLocal(this.originalScales.football);
        } else {
            console.error('EnvironmentSwitcher: Cannot show "Football Field", object is not linked.');
        }

        if (this.tennisCourt) {
            this.tennisCourt.setScalingLocal(HIDDEN_SCALE);
        } else {
            console.error('EnvironmentSwitcher: Cannot hide "Tennis Court", object is not linked.');
        }

        if (this.gymFloor) {
            this.gymFloor.setScalingLocal(HIDDEN_SCALE);
        } else {
            console.error('EnvironmentSwitcher: Cannot hide "Gym Floor", object is not linked.');
        }
    }

    /**
     * Activates the Tennis Court and deactivates the others.
     */
    showTennisCourt() {
        console.log("Attempting to show Tennis Court...");

        if (this.footballField) {
            this.footballField.setScalingLocal(HIDDEN_SCALE);
        } else {
            console.error('EnvironmentSwitcher: Cannot hide "Football Field", object is not linked.');
        }

        if (this.tennisCourt) {
            this.tennisCourt.setScalingLocal(this.originalScales.tennis);
        } else {
            console.error('EnvironmentSwitcher: Cannot show "Tennis Court", object is not linked.');
        }

        if (this.gymFloor) {
            this.gymFloor.setScalingLocal(HIDDEN_SCALE);
        } else {
            console.error('EnvironmentSwitcher: Cannot hide "Gym Floor", object is not linked.');
        }
    }

    /**
     * Activates the Gym Floor and deactivates the others.
     */
    showGymFloor() {
        console.log("Attempting to show Gym Floor...");
        
        if (this.footballField) {
            this.footballField.setScalingLocal(HIDDEN_SCALE);
        } else {
            console.error('EnvironmentSwitcher: Cannot hide "Football Field", object is not linked.');
        }

        if (this.tennisCourt) {
            this.tennisCourt.setScalingLocal(HIDDEN_SCALE);
        } else {
            console.error('EnvironmentSwitcher: Cannot hide "Tennis Court", object is not linked.');
        }

        if (this.gymFloor) {
            this.gymFloor.setScalingLocal(this.originalScales.gym);
        } else {
            console.error('EnvironmentSwitcher: Cannot show "Gym Floor", object is not linked.');
        }
    }
}

