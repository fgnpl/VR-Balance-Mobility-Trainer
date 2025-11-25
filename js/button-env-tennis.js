import {Button3D} from './button-3d.js';
export class ButtonEnvTennis extends Button3D { static TypeName='button-env-tennis'; onPress(){ super.onPress(); const gs=this.engine.scene.findByName('Manager')[0]?.getComponent('game-selector'); gs?.showTennis(); }}
