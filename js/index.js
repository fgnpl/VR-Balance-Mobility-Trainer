/**
 * /!\ This file is auto-generated.
 *
 * This is the entry point of your standalone application.
 *
 * There are multiple tags used by the editor to inject code automatically:
 *     - `wle:auto-imports:start` and `wle:auto-imports:end`: The list of import statements
 *     - `wle:auto-register:start` and `wle:auto-register:end`: The list of component to register
 */

/* wle:auto-imports:start */
import {AudioListener} from '@wonderlandengine/components';
import {Cursor} from '@wonderlandengine/components';
import {FingerCursor} from '@wonderlandengine/components';
import {HandTracking} from '@wonderlandengine/components';
import {MouseLookComponent} from '@wonderlandengine/components';
import {PlayerHeight} from '@wonderlandengine/components';
import {TeleportComponent} from '@wonderlandengine/components';
import {VrModeActiveSwitch} from '@wonderlandengine/components';
<<<<<<< HEAD
import {BallManager} from './ball-manager.js';
import {BallPhysics} from './ball-physics.js';
import {TargetBehavior} from './target-behavior.js';
import {TargetManager} from './target-manager.js';
=======
import {WasdControlsComponent} from '@wonderlandengine/components';
import {ControllerHit} from './scripts/controller-hit.js';
import {EnvironmentSwitcher} from './scripts/environment-switcher.js';
import {HeadBob} from './scripts/head-bob.js';
import {TargetCollision} from './scripts/target-collision.js';
import {TargetManager} from './scripts/target-manager.js';
>>>>>>> parent of f723fc5 (Refactor game logic: add managers and update prefabs)
/* wle:auto-imports:end */

export default function(engine) {
/* wle:auto-register:start */
engine.registerComponent(AudioListener);
engine.registerComponent(Cursor);
engine.registerComponent(FingerCursor);
engine.registerComponent(HandTracking);
engine.registerComponent(MouseLookComponent);
engine.registerComponent(PlayerHeight);
engine.registerComponent(TeleportComponent);
engine.registerComponent(VrModeActiveSwitch);
<<<<<<< HEAD
engine.registerComponent(BallManager);
engine.registerComponent(BallPhysics);
engine.registerComponent(TargetBehavior);
=======
engine.registerComponent(WasdControlsComponent);
engine.registerComponent(ControllerHit);
engine.registerComponent(EnvironmentSwitcher);
engine.registerComponent(HeadBob);
engine.registerComponent(TargetCollision);
>>>>>>> parent of f723fc5 (Refactor game logic: add managers and update prefabs)
engine.registerComponent(TargetManager);
/* wle:auto-register:end */
}
