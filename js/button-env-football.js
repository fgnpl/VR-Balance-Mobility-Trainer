import { Button3D } from './button-3d.js';
export class ButtonEnvFootball extends Button3D { static TypeName = 'button-env-football'; onPress() { super.onPress(); const gs = this.engine.scene.findByName('Manager')[0]?.getComponent('game-selector'); gs?.showFootball(); } }
