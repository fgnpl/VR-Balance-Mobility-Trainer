import {Button3D} from './button-3d.js';
export class ButtonEnvGym extends Button3D { static TypeName='button-env-gym'; onPress(){ super.onPress(); const gs=this.engine.scene.findByName('Manager')[0]?.getComponent('game-selector'); gs?.showGym(); }}
