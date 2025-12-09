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
import {CursorTarget} from '@wonderlandengine/components';
import {FingerCursor} from '@wonderlandengine/components';
import {HandTracking} from '@wonderlandengine/components';
import {MouseLookComponent} from '@wonderlandengine/components';
import {PlayerHeight} from '@wonderlandengine/components';
import {Trail} from '@wonderlandengine/components';
import {VrModeActiveSwitch} from '@wonderlandengine/components';
<<<<<<< HEAD
import {WasdControlsComponent} from '@wonderlandengine/components';
import {BatManager} from './bat-manager.js';
import {BeamWalkManager} from './beam-walk-manager.js';
import {BouncingBall} from './bouncing-ball.js';
import {DataManager} from './data-manager.js';
import {GameSelector} from './game-selector.js';
import {HeadBob} from './head-bob.js';
import {ReactionGame} from './sphere-spawner.js';
import {TargetCollision} from './target-collision.js';
import {TargetManager} from './target-manager.js';
import {UiPlaneButton} from './ui-plane-button.js';
import {VrMotionTracker} from './vr-motion-tracker.js';
=======
<<<<<<< HEAD
<<<<<<< HEAD
import {BallManager} from './ball-manager.js';
import {BallPhysics} from './ball-physics.js';
import {TargetBehavior} from './target-behavior.js';
import {TargetManager} from './target-manager.js';
=======
import {WasdControlsComponent} from '@wonderlandengine/components';
import {HeadBob} from './scripts/head-bob.js';
<<<<<<< HEAD
import {TargetCollision} from './scripts/target-collision.js';
import {TargetManager} from './scripts/target-manager.js';
>>>>>>> parent of f723fc5 (Refactor game logic: add managers and update prefabs)
=======
>>>>>>> parent of 3454228 (Remove HeadBob component from editor bundle)
=======
import {WasdControlsComponent} from '@wonderlandengine/components';
import {ControllerHit} from './scripts/controller-hit.js';
import {EnvironmentSwitcher} from './scripts/environment-switcher.js';
import {HeadBob} from './scripts/head-bob.js';
import {TargetCollision} from './scripts/target-collision.js';
import {TargetManager} from './scripts/target-manager.js';
>>>>>>> parent of f723fc5 (Refactor game logic: add managers and update prefabs)
>>>>>>> 68f6094687044fff7e4045639a1df966a690f498
/* wle:auto-imports:end */

export default function(engine) {
/* wle:auto-register:start */
engine.registerComponent(AudioListener);
engine.registerComponent(Cursor);
engine.registerComponent(CursorTarget);
engine.registerComponent(FingerCursor);
engine.registerComponent(HandTracking);
engine.registerComponent(MouseLookComponent);
engine.registerComponent(PlayerHeight);
engine.registerComponent(Trail);
engine.registerComponent(VrModeActiveSwitch);
<<<<<<< HEAD
engine.registerComponent(WasdControlsComponent);
engine.registerComponent(BatManager);
engine.registerComponent(BeamWalkManager);
engine.registerComponent(BouncingBall);
engine.registerComponent(DataManager);
engine.registerComponent(GameSelector);
engine.registerComponent(HeadBob);
engine.registerComponent(ReactionGame);
engine.registerComponent(TargetCollision);
engine.registerComponent(TargetManager);
engine.registerComponent(UiPlaneButton);
engine.registerComponent(VrMotionTracker);
=======
<<<<<<< HEAD
engine.registerComponent(BallManager);
engine.registerComponent(BallPhysics);
engine.registerComponent(TargetBehavior);
=======
engine.registerComponent(WasdControlsComponent);
<<<<<<< HEAD
engine.registerComponent(HeadBob);
<<<<<<< HEAD
engine.registerComponent(TargetCollision);
>>>>>>> parent of f723fc5 (Refactor game logic: add managers and update prefabs)
=======
engine.registerComponent(ControllerHit);
engine.registerComponent(EnvironmentSwitcher);
engine.registerComponent(HeadBob);
engine.registerComponent(TargetCollision);
>>>>>>> parent of f723fc5 (Refactor game logic: add managers and update prefabs)
engine.registerComponent(TargetManager);
=======
>>>>>>> parent of 3454228 (Remove HeadBob component from editor bundle)
>>>>>>> 68f6094687044fff7e4045639a1df966a690f498
/* wle:auto-register:end */


}
