import {Component, Property} from '@wonderlandengine/api';
import {vec3} from 'gl-matrix';

/**
 * BallCollision: Handles collision detection for thrown balls
 * Detects catches (low velocity) and deflects (high velocity)
 */
export class BallCollision extends Component {
    static TypeName = 'ball-collision';
    
    static Properties = {
        thrower: Property.object(),
        catchRadius: Property.float(0.15), // How close controller must be to catch
        deflectRadius: Property.float(0.20), // Slightly larger for deflection
        catchVelocityThreshold: Property.float(0.5), // Max controller velocity for catch
    };

    start() {
        this.handled = false;
        this.lastControllerPositions = {
            left: vec3.create(),
            right: vec3.create()
        };
        
        // Initialize last positions
        const leftCtrl = this.engine.scene.findByName('ControllerLeft')[0];
        const rightCtrl = this.engine.scene.findByName('ControllerRight')[0];
        
        if (leftCtrl) leftCtrl.getPositionWorld(this.lastControllerPositions.left);
        if (rightCtrl) rightCtrl.getPositionWorld(this.lastControllerPositions.right);
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

        // Check collision with controllers
        const leftCtrl = this.engine.scene.findByName('ControllerLeft')[0];
        const rightCtrl = this.engine.scene.findByName('ControllerRight')[0];

        const ballPos = this.object.getPositionWorld();

        // Check left controller
        if (leftCtrl) {
            const ctrlPos = leftCtrl.getPositionWorld();
            const distance = vec3.distance(ballPos, ctrlPos);
            
            // Calculate controller velocity
            const velocity = vec3.distance(ctrlPos, this.lastControllerPositions.left) / dt;
            vec3.copy(this.lastControllerPositions.left, ctrlPos);

            if (distance < this.catchRadius && velocity < this.catchVelocityThreshold) {
                this.onCatch(leftCtrl);
                return;
            } else if (distance < this.deflectRadius) {
                this.onDeflect(leftCtrl, velocity);
                return;
            }
        }

        // Check right controller
        if (rightCtrl) {
            const ctrlPos = rightCtrl.getPositionWorld();
            const distance = vec3.distance(ballPos, ctrlPos);
            
            // Calculate controller velocity
            const velocity = vec3.distance(ctrlPos, this.lastControllerPositions.right) / dt;
            vec3.copy(this.lastControllerPositions.right, ctrlPos);

            if (distance < this.catchRadius && velocity < this.catchVelocityThreshold) {
                this.onCatch(rightCtrl);
                return;
            } else if (distance < this.deflectRadius) {
                this.onDeflect(rightCtrl, velocity);
                return;
            }
        }
    }

    onCatch(controller) {
        if (this.handled) return;
        this.handled = true;

        console.log(`[BallCollision] Caught by ${controller.name}!`);
        
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
