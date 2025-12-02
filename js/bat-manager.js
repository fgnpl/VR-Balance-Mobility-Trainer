import {CollisionEventType, Component, Property} from '@wonderlandengine/api';

/**
 * bat-manager
 */
export class BatManager extends Component {
    static TypeName = 'bat-manager';
    /* Properties that are configurable in the editor */
    static Properties = {

    };

    start() {
        this.soundSource = this.object.addComponent('audio-source', {src: 'sfx/click.wav', spatial: true});

        // Physx collision
        this.object.getComponent('physx').onCollision((type, other) => {
            // onCollision begin
            if (type === CollisionEventType.Touch) {
                this.onCollision(other);
            }
        })
    }

    onCollision(other) {
        if (other.object.name === 'Sphere') {
            this.soundSource.play();
        }
    }
}