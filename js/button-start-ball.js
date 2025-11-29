import {Button3D} from './button-3d.js';

export class ButtonStartBall extends Button3D {
    static TypeName = 'button-start-ball';
    
    onPress() {
        super.onPress();
        const gs = this.engine.scene.findByName('Manager')[0]?.getComponent('game-selector');
        gs?.startBallDrill();
    }
}
