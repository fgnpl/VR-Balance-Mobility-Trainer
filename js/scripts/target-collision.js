import {Component, Property} from '@wonderlandengine/api';

/**
 * target-collision
 */
export class TargetCollision extends Component {
    static TypeName = 'target-collision';
    /* Properties that are configurable in the editor */
    static Properties = {
        manager: Property.object()
    };

    start() {
        this.hit = false;
    }

    update() {
        if (this.hit) {
            return;
        }

        const spherePos = this.object.getPositionWorld();

        // VR Sticks
        const sticks = [
            this.engine.scene.getObjectByName("ControllerRight"),
            this.engine.scene.getObjectByName("ControllerLeft")
        ];

        // Checking if either stick is close enough to the target
        for (let stick of sticks) {
            if (!stick) {
                continue;
            }

            const stickPos = stick.getPositionWorld();
            const dx = spherePos[0] - stickPos[0];
            const dy = spherePos[1] - stickPos[1];
            const dz = spherePos[2] - stickPos[2];
            const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

            const radiusSphere = 0.2;
            const radiusStick = 0.15;
            const tolerance = 0.05;

            if (distance < radiusSphere + radiusStick + tolerance) {
                this.hit = true;
                const reactionTime = (performance.now() - this.object.startTime) / 1000;
                this.manager.onTargetHit(this.object, reactionTime)
            }

        }
    }

    onHit(controllerObject) {
        console.log("Target was hit by: ", controllerObject.name);
        this.object.active = false;
    }
}

