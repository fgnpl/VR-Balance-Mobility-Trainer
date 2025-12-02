import {Component, Property} from '@wonderlandengine/api';
import {vec3} from 'gl-matrix';
import {triggerHaptic, HapticPatterns} from './haptic-feedback.js';

/**
 * BallCollision: Handles collision detection for thrown balls
 * Detects catches (low velocity) and deflects (high velocity)
 */
export class BallCollision extends Component {
    static TypeName = 'ball-collision';
    
    static Properties = {
        thrower: Property.object(),
        catchRadius: Property.float(0.25), // How close controller must be to catch (increased for VR)
        deflectRadius: Property.float(0.35), // Slightly larger for deflection (increased for VR)
        catchVelocityThreshold: Property.float(0.8), // Max controller velocity for catch
        debugMode: Property.bool(false), // Enable debug logging
    };

    start() {
        this.handled = false;
        this.lastControllerPositions = {
            left: vec3.create(),
            right: vec3.create()
        };
        
        // Find controllers - check all possible left/right objects
        // Priority: HandLeft/Right (most accurate for catching), then ControllerLeft/Right
        this.leftController = this.engine.scene.findByName('HandLeft')[0] || 
                             this.engine.scene.findByName('ControllerLeft')[0];
        this.rightController = this.engine.scene.findByName('HandRight')[0] || 
                              this.engine.scene.findByName('ControllerRight')[0];
        
        // Debug: Log what we found
        console.log('[BallCollision] Left controller:', this.leftController?.name);
        console.log('[BallCollision] Right controller:', this.rightController?.name);
        
        if (!this.leftController || !this.rightController) {
            console.warn('[BallCollision] Controllers not found! Ball catching will not work.');
        }
        
        // Initialize last positions
        if (this.leftController) this.leftController.getPositionWorld(this.lastControllerPositions.left);
        if (this.rightController) this.rightController.getPositionWorld(this.lastControllerPositions.right);
    }

    update(dt) {
        if (this.handled) return;

        // Apply velocity to ball
        if (this.object.velocity) {
            const currentPos = this.object.getPositionWorld();
            const newPos = vec3.scaleAndAdd(
                vec3.create(),
                currentPos,
                this.object.velocity,
                dt
            );
            this.object.setPositionWorld(newPos);
        }

        // Use cached controller references
        const ballPos = this.object.getPositionWorld();
        
        // Debug: Log ball position every 30 frames
        if (this.debugMode) {
            if (!this.frameCount) this.frameCount = 0;
            this.frameCount++;
            if (this.frameCount % 30 === 0) {
                console.log(`[BallCollision] Ball pos: [${ballPos[0].toFixed(2)}, ${ballPos[1].toFixed(2)}, ${ballPos[2].toFixed(2)}]`);
            }
        }

        let minDist = 999;
        let closestController = 'none';

        // Check left controller
        if (this.leftController) {
            const ctrlPos = this.leftController.getPositionWorld();
            const distance = vec3.distance(ballPos, ctrlPos);
            
            if (distance < minDist) {
                minDist = distance;
                closestController = 'left';
            }
            
            // Calculate controller velocity
            const velocity = vec3.distance(ctrlPos, this.lastControllerPositions.left) / dt;
            vec3.copy(this.lastControllerPositions.left, ctrlPos);

            // Debug logging - show when controllers are relatively close
            if (this.debugMode && distance < 1.0) {
                console.log(`[BallCollision] LEFT - dist: ${distance.toFixed(3)}m, vel: ${velocity.toFixed(3)}m/s, catch<${this.catchRadius}, deflect<${this.deflectRadius}`);
            }

            if (distance < this.catchRadius && velocity < this.catchVelocityThreshold) {
                console.log(`[BallCollision] CATCH triggered! Left controller`);
                this.onCatch(this.leftController);
                return;
            } else if (distance < this.deflectRadius) {
                console.log(`[BallCollision] DEFLECT triggered! Left controller`);
                this.onDeflect(this.leftController, velocity);
                return;
            }
        } else if (this.debugMode && this.frameCount % 60 === 0) {
            console.warn('[BallCollision] No left controller found!');
        }

        // Check right controller
        if (this.rightController) {
            const ctrlPos = this.rightController.getPositionWorld();
            const distance = vec3.distance(ballPos, ctrlPos);
            
            if (distance < minDist) {
                minDist = distance;
                closestController = 'right';
            }
            
            // Calculate controller velocity
            const velocity = vec3.distance(ctrlPos, this.lastControllerPositions.right) / dt;
            vec3.copy(this.lastControllerPositions.right, ctrlPos);

            // Debug logging - show when controllers are relatively close
            if (this.debugMode && distance < 1.0) {
                console.log(`[BallCollision] RIGHT - dist: ${distance.toFixed(3)}m, vel: ${velocity.toFixed(3)}m/s, catch<${this.catchRadius}, deflect<${this.deflectRadius}`);
            }

            if (distance < this.catchRadius && velocity < this.catchVelocityThreshold) {
                console.log(`[BallCollision] CATCH triggered! Right controller`);
                this.onCatch(this.rightController);
                return;
            } else if (distance < this.deflectRadius) {
                console.log(`[BallCollision] DEFLECT triggered! Right controller`);
                this.onDeflect(this.rightController, velocity);
                return;
            }
        } else if (this.debugMode && this.frameCount % 60 === 0) {
            console.warn('[BallCollision] No right controller found!');
        }
        
        // Debug: Show closest distance periodically
        if (this.debugMode && this.frameCount % 30 === 0) {
            console.log(`[BallCollision] Closest: ${closestController} at ${minDist.toFixed(3)}m`);
        }
    }

    onCatch(controller) {
        if (this.handled) return;
        this.handled = true;

        console.log(`[BallCollision] Caught by ${controller.name}!`);
        
        // Trigger catch haptic feedback (soft, satisfying)
        triggerHaptic(controller, HapticPatterns.BALL_CATCH, null, this.debugMode);
        
        // Notify thrower
        const throwerComp = this.thrower?.getComponent('ball-thrower');
        throwerComp?.onBallCaught(this.object);

        // Make ball stick to controller briefly, then destroy
        this.object.velocity = [0, 0, 0];
        setTimeout(() => {
            if (this.object && this.object.active) {
                this.object.destroy();
            }
        }, 200);
    }

    onDeflect(controller, velocity) {
        if (this.handled) return;
        this.handled = true;

        console.log(`[BallCollision] Deflected by ${controller.name} (vel: ${velocity.toFixed(2)})!`);
        
        // Trigger deflect haptic feedback (strong impact)
        triggerHaptic(controller, HapticPatterns.BALL_DEFLECT, null, this.debugMode);
        
        // Notify thrower
        const throwerComp = this.thrower?.getComponent('ball-thrower');
        throwerComp?.onBallDeflected(this.object);

        // Change ball direction (bounce away)
        const ctrlPos = controller.getPositionWorld();
        const ballPos = this.object.getPositionWorld();
        const bounceDir = vec3.sub(vec3.create(), ballPos, ctrlPos);
        vec3.normalize(bounceDir, bounceDir);
        vec3.scale(bounceDir, bounceDir, 2.0); // Bounce speed
        
        this.object.velocity = bounceDir;

        // Destroy after a short time
        setTimeout(() => {
            if (this.object && this.object.active) {
                this.object.destroy();
            }
        }, 500);
    }

    // Also handle physics collisions if enabled
    onCollisionEnter(other) {
        if (this.handled) return;

        const name = other.object?.name || '';
        if (name.startsWith('Controller')) {
            // Treat physics collision as deflection
            this.onDeflect(other.object, 1.0);
        }
    }
}
