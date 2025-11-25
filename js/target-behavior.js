import {Component, Property} from '@wonderlandengine/api';

/**
 * target-behavior
 * Handles collision detection between VR controllers and targets
 */

export class TargetBehavior extends Component {
    static TypeName = 'target-behavior';
    
    static Properties = {
        manager: Property.object(),
        targetRadius: Property.float(0.15), // radius of target sphere
        controllerRadius: Property.float(0.08), // radius of controller tip
        hitTolerance: Property.float(0.05) // extra collision buffer
    };
    
    init() {
        console.log("TargetBehavior initialized");
    }
    
    start() {
        this.isHit = false;
        
        // Try to find controllers in the scene
        this.controllers = this.findControllers();
        
        if (this.controllers.length === 0) {
            console.warn("WARNING: No VR controllers found in scene");
            console.warn("Expected objects named 'ControllerLeft' or 'ControllerRight'");
        } 
    }
    
    findControllers() {
        const leftController = this.engine.scene.findByName('ControllerLeft')[0];
        const rightController = this.engine.scene.findByName('ControllerRight')[0];
        
        console.log('Controllers found:', leftController ? 'Left found' : 'Left not found', 
                                        rightController ? 'Right found' : 'Right not found');
        
        return [leftController, rightController].filter(c => c); // Filter out any null/undefined
    }
    
    update(dt) {
        // Skip if already hit
        if (this.isHit) {
            return;
        }
        
        // Get target position
        const targetPos = this.object.getPositionWorld();
        
        // Check collision with each controller
        for (const controller of this.controllers) {
            if (!controller || !controller.active) {
                continue;
            }
            
            const controllerPos = controller.getPositionWorld();
            
            // Calculate distance between target and controller
            const dx = targetPos[0] - controllerPos[0];
            const dy = targetPos[1] - controllerPos[1];
            const dz = targetPos[2] - controllerPos[2];
            const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
            
            // Check if collision occurred
            const collisionDistance = this.targetRadius + this.controllerRadius + this.hitTolerance;
            
            if (distance < collisionDistance) {
                this.handleHit();
                return;
            }
        }
    }
    
    handleHit() {
        this.isHit = true;
        
        // Calculate reaction time
        const reactionTime = (performance.now() - this.object.spawnTime) / 1000;
        
        // Notify manager
        if (this.manager && this.manager.onTargetHit) {
            this.manager.onTargetHit(this.object, reactionTime);
        } else {
            console.error("ERROR: Manager not set or onTargetHit not found");
        }
    }
}