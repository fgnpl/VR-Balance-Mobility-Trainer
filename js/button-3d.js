import { Component, Property } from '@wonderlandengine/api';
import { vec3 } from 'gl-matrix';

export class Button3D extends Component {
    static TypeName = 'button-3d';
    
    static Properties = {
        triggerDistance: Property.float(0.5),
        cooldownTime: Property.float(0.5),
        hoverScaleMultiplier: Property.float(1.2),
        pressScaleMultiplier: Property.float(0.85),
        debugMode: Property.bool(true),
        usePlayerForDesktop: Property.bool(true)
    };

    start() {
        this.leftController = this.engine.scene.findByName('ControllerLeft')[0];
        this.rightController = this.engine.scene.findByName('ControllerRight')[0];
        
        // Fallback for desktop: use Player or NonVrCamera
        if (this.usePlayerForDesktop && (!this.leftController || !this.rightController)) {
            this.playerObject = this.engine.scene.findByName('Player')[0];
            if (!this.playerObject) {
                this.playerObject = this.engine.scene.findByName('NonVrCamera')[0];
            }
            
            if (this.debugMode) {
                if (this.playerObject) {
                    console.log(`Button3D: Using desktop mode with ${this.playerObject.name}`);
                } else {
                    console.warn('Button3D: No controllers or Player/Camera found!');
                }
            }
        }
        
        this.isHovered = false;
        this.isPressed = false;
        this.cooldownTimer = 0.0;
        
        // Store original scale
        this.originalScale = vec3.create();
        this.object.getScalingLocal(this.originalScale);
        
        // Temp vectors
        this.buttonPos = vec3.create();
        this.controllerPos = vec3.create();
        this.tempScale = vec3.create();
        
        // Debug logging
        if (this.debugMode) {
            console.log(`Button3D: Initialized on ${this.object.name}`);
            console.log(`  Trigger Distance: ${this.triggerDistance}`);
            console.log(`  Hover Distance: ${this.triggerDistance * 2}`);
            console.log(`  Original Scale: [${this.originalScale[0].toFixed(2)}, ${this.originalScale[1].toFixed(2)}, ${this.originalScale[2].toFixed(2)}]`);
        }
        
        this.controllersWarningShown = false;
    }

    update(dt) {
        // Update cooldown
        if (this.cooldownTimer > 0) {
            this.cooldownTimer -= dt;
        }
        
        // Get button position
        this.object.getPositionWorld(this.buttonPos);
        
        // Check both controllers or player
        let closestDistance = Infinity;
        let closestControllerName = '';
        
        const objectsToCheck = [];
        if (this.leftController) objectsToCheck.push(this.leftController);
        if (this.rightController) objectsToCheck.push(this.rightController);
        if (this.playerObject && objectsToCheck.length === 0) {
            objectsToCheck.push(this.playerObject);
        }
        
        if (objectsToCheck.length === 0) {
            if (this.debugMode && !this.controllersWarningShown) {
                console.warn('Button3D: No controllers or player object found!');
                this.controllersWarningShown = true;
            }
            return;
        }
        
        for (const obj of objectsToCheck) {
            if (!obj) continue;
            
            obj.getPositionWorld(this.controllerPos);
            const distance = vec3.distance(this.buttonPos, this.controllerPos);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestControllerName = obj.name;
            }
        }
        
        // Determine button state
        const wasHovered = this.isHovered;
        const wasPressed = this.isPressed;
        
        this.isHovered = closestDistance < this.triggerDistance * 2;
        this.isPressed = closestDistance < this.triggerDistance;
        
        // Debug logging for state changes
        if (this.debugMode) {
            if (this.isHovered && !wasHovered) {
                console.log(`Button3D: HOVER ENTER - Distance: ${closestDistance.toFixed(3)}m (${closestControllerName})`);
            }
            if (!this.isHovered && wasHovered) {
                console.log(`Button3D: HOVER EXIT - Distance: ${closestDistance.toFixed(3)}m`);
            }
            if (this.isPressed && !wasPressed) {
                console.log(`Button3D: PRESS - Distance: ${closestDistance.toFixed(3)}m (${closestControllerName})`);
            }
        }
        
        // Trigger press event
        if (this.isPressed && !wasPressed && this.cooldownTimer <= 0) {
            this.onPress();
            this.cooldownTimer = this.cooldownTime;
        }
        
        // Update visual feedback
        this.updateVisuals();
    }

    updateVisuals() {
        if (this.isPressed) {
            vec3.scale(this.tempScale, this.originalScale, this.pressScaleMultiplier);
        } else if (this.isHovered) {
            vec3.scale(this.tempScale, this.originalScale, this.hoverScaleMultiplier);
        } else {
            vec3.copy(this.tempScale, this.originalScale);
        }
        
        this.object.setScalingLocal(this.tempScale);
    }

    onPress() {
        if (this.debugMode) {
            console.log('Button3D: Button pressed!');
        }
        // Override this in child classes or listen for custom events
    }
}
