import {Component, Property} from '@wonderlandengine/api';

/**
 * ball-physics
 * Handles ball movement, collision detection with controllers, and catch/deflect logic
 */

export class BallPhysics extends Component {
    static TypeName = 'ball-physics';
    static Properties = {
        manager: Property.object(),
        velocityX: Property.float(0.0),
        velocityY: Property.float(0.0),
        velocityZ: Property.float(0.0),
        gravity: Property.float(-9.8),
        ballRadius: Property.float(0.1),
        controllerRadius: Property.float(0.1),
        catchThreshold: Property.float(1.5), // max velocity to catch vs deflect
        bounceEnabled: Property.bool(false) // whether balls bounce off controllers
    };

    start() {
        this.velocity = [this.velocityX, this.velocityY, this.velocityZ];
        this.caught = false;
        this.deflected = false;
        
        // Find controllers
        this.controllers = [
            this.engine.scene.findByName("ControllerRight")[0],
            this.engine.scene.findByName("ControllerLeft")[0]
        ];

        // Track previous controller positions for velocity calculation
        this.prevControllerPositions = [null, null];
    }

    update(dt) {
        if (this.caught || this.deflected) {
            return;
        }

        // Apply gravity
        this.velocity[1] += this.gravity * dt;

        // Get current position
        const pos = this.object.getPositionWorld();

        // Check collision with controllers
        for (let i = 0; i < this.controllers.length; i++) {
            const controller = this.controllers[i];
            if (!controller) continue;

            const controllerPos = controller.getPositionWorld();
            
            const dx = pos[0] - controllerPos[0];
            const dy = pos[1] - controllerPos[1];
            const dz = pos[2] - controllerPos[2];
            const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

            if (distance < this.ballRadius + this.controllerRadius + 0.05) {
                this.handleCollision(controller, i, controllerPos);
                return;
            }

            // Store current position for next frame
            this.prevControllerPositions[i] = [...controllerPos];
        }

        // Update ball position
        const newPos = [
            pos[0] + this.velocity[0] * dt,
            pos[1] + this.velocity[1] * dt,
            pos[2] + this.velocity[2] * dt
        ];

        this.object.setPositionWorld(newPos);
    }

    handleCollision(controller, controllerIndex, controllerPos) {
        // Calculate controller velocity
        let controllerVelocity = [0, 0, 0];
        if (this.prevControllerPositions[controllerIndex]) {
            const prev = this.prevControllerPositions[controllerIndex];
            const dt = 1/60; // approximate frame time
            controllerVelocity = [
                (controllerPos[0] - prev[0]) / dt,
                (controllerPos[1] - prev[1]) / dt,
                (controllerPos[2] - prev[2]) / dt
            ];
        }

        const controllerSpeed = Math.sqrt(
            controllerVelocity[0]**2 + 
            controllerVelocity[1]**2 + 
            controllerVelocity[2]**2
        );

        // Determine if caught or deflected based on relative velocity
        const ballSpeed = Math.sqrt(
            this.velocity[0]**2 + 
            this.velocity[1]**2 + 
            this.velocity[2]**2
        );

        const relativeSpeed = Math.abs(ballSpeed - controllerSpeed);

        if (relativeSpeed < this.catchThreshold) {
            // Ball was caught (gentle contact)
            this.caught = true;
            this.manager.onBallCaught(this.object);
            console.log("Ball caught with relative speed:", relativeSpeed.toFixed(2));
        } else {
            // Ball was deflected (hard contact)
            this.deflected = true;
            
            if (this.bounceEnabled) {
                // Calculate bounce direction
                const ballPos = this.object.getPositionWorld();
                const normalX = ballPos[0] - controllerPos[0];
                const normalY = ballPos[1] - controllerPos[1];
                const normalZ = ballPos[2] - controllerPos[2];
                const normalLength = Math.sqrt(normalX**2 + normalY**2 + normalZ**2);

                // Reflect velocity
                const dotProduct = (
                    this.velocity[0] * normalX + 
                    this.velocity[1] * normalY + 
                    this.velocity[2] * normalZ
                ) / normalLength;

                this.velocity[0] = this.velocity[0] - 2 * dotProduct * normalX / normalLength;
                this.velocity[1] = this.velocity[1] - 2 * dotProduct * normalY / normalLength;
                this.velocity[2] = this.velocity[2] - 2 * dotProduct * normalZ / normalLength;

                // Add controller velocity for more realistic deflection
                this.velocity[0] += controllerVelocity[0] * 0.5;
                this.velocity[1] += controllerVelocity[1] * 0.5;
                this.velocity[2] += controllerVelocity[2] * 0.5;

                // Don't destroy yet - let it bounce away
                setTimeout(() => {
                    this.manager.onBallDeflected(this.object);
                }, 1000);
            } else {
                // Immediately remove deflected ball
                this.manager.onBallDeflected(this.object);
            }
            
            console.log("Ball deflected with relative speed:", relativeSpeed.toFixed(2));
        }
    }
}