import { Component, InputComponent, MeshComponent, Property } from '@wonderlandengine/api';
import { CursorTarget, AudioSource } from '@wonderlandengine/components';
import { BouncingBall } from './bouncing-ball.js'; 

/**
 * Helper function for haptics 
 */
export function hapticFeedback(object, strength, duration) {
    const input = object.getComponent(InputComponent);
    if (input && input.xrInputSource) {
        const gamepad = input.xrInputSource.gamepad;
        if (gamepad && gamepad.hapticActuators)
            gamepad.hapticActuators[0].pulse(strength, duration);
    }
}

export class ReplayButtonCatch extends Component {
    static TypeName = 'replay-button-catch';
    static Properties = {
        // Object that has the BouncingBall component
        gameController: Property.object(),
        // Material to apply when hover 
        hoverMaterial: Property.material(),
    };

    static onRegister(engine) {
        engine.registerComponent(AudioSource);
        engine.registerComponent(CursorTarget);
    }

    init() {
        this.returnPos = new Float32Array(3);
    }

    start() {
        this.mesh = this.object.getComponent(MeshComponent);
        this.defaultMaterial = this.mesh ? this.mesh.material : null;
        this.object.getPositionLocal(this.returnPos);

        // Setup cursor target for interaction
        this.target = this.object.getComponent(CursorTarget) || this.object.addComponent(CursorTarget);

        // Audio setup
        this.soundClick = this.object.addComponent(AudioSource, { src: 'sfx/click.wav', spatial: true });
        this.soundUnClick = this.object.addComponent(AudioSource, { src: 'sfx/unclick.wav', spatial: true });
    }

    onActivate() {
        this.target.onHover.add(this.onHover);
        this.target.onUnhover.add(this.onUnhover);
        this.target.onDown.add(this.onDown);
        this.target.onUp.add(this.onUp);
    }

    onDeactivate() {
        this.target.onHover.remove(this.onHover);
        this.target.onUnhover.remove(this.onUnhover);
        this.target.onDown.remove(this.onDown);
        this.target.onUp.remove(this.onUp);
    }

    onHover = (_, cursor) => {
        if (this.mesh && this.hoverMaterial) {
            this.mesh.material = this.hoverMaterial;
        }
        if (cursor.type === 'finger-cursor') {
            this.onDown(_, cursor);
        }
        hapticFeedback(cursor.object, 0.5, 50);
    };

    onDown = (_, cursor) => {
        this.soundClick.play();
        this.object.setPositionLocal([0.0, -0.1, 0.0]); // Visual press down
        hapticFeedback(cursor.object, 1.0, 20);

        // Game reset logic
        if (this.gameController) {
            const ballLogic = this.gameController.getComponent(BouncingBall);
            if (ballLogic) {
                // This will trigger startGame() in the ball logic
                ballLogic.resetGame();
            } else {
                console.warn("ReplayButton: No BouncingBall component found on gameController object");
            }
        }
    };

    onUp = (_, cursor) => {
        this.soundUnClick.play();
        this.object.setPositionLocal(this.returnPos); // Return to original pos
        hapticFeedback(cursor.object, 0.7, 20);
    };

    onUnhover = (_, cursor) => {
        if (this.mesh && this.defaultMaterial) {
            this.mesh.material = this.defaultMaterial;
        }
        if (cursor.type === 'finger-cursor') {
            this.onUp(_, cursor);
        }
        hapticFeedback(cursor.object, 0.3, 50);
    };
}