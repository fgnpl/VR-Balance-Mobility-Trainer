import {Button3D} from './button-3d.js';
export class ButtonStopDrills extends Button3D { static TypeName='button-stop-drills'; onPress(){ super.onPress(); const gs=this.engine.scene.findByName('Manager')[0]?.getComponent('game-selector'); gs?.stopDrills(); }}
