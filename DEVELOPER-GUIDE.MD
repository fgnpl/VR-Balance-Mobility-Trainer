# VR Balance & Mobility Trainer - Developer Guide

## 🏗️ Architecture Overview

### Component Hierarchy

```
Scene Root
├── Manager (Central Controller)
│   ├── data-manager (session storage)
│   └── game-selector (drill orchestration)
│
├── Environments
│   ├── FootballField (parent object)
│   ├── TennisCourt (parent object)
│   └── GymFloor (parent object)
│
├── Drill Managers
│   ├── TargetManager Object
│   │   └── target-manager component
│   │       └── SpherePrefab (cloned for targets)
│   ├── BeamWalkManager Object
│   │   └── beam-walk-manager component
│   │       ├── StartPosition marker
│   │       └── EndPosition marker
│   └── BallThrower Object
│       └── ball-thrower component
│           └── BallPrefab (cloned for balls)
│
├── Player Rig
│   ├── Player (wasd-controls)
│   └── NonVrCamera (mouse-look, head-bob)
│
├── VR Controllers
│   ├── ControllerLeft (controller-hit)
│   └── ControllerRight (controller-hit)
│
└── UI Buttons (3D meshes)
    ├── StartTargetButton (button-start-target)
    ├── StartBeamButton (button-start-beam)
    ├── StartBallButton (button-start-ball)
    ├── StopButton (button-stop-drills)
    ├── ReportButton (button-show-report)
    ├── FootballButton (button-env-football)
    ├── TennisButton (button-env-tennis)
    └── GymButton (button-env-gym)
```

---

## 📦 Component Documentation

### Core Systems

#### **DataManager** (`data-manager.js`)
**Purpose:** Central storage for all session performance data

**Attach To:** Manager object (singleton)

**Properties:** None (auto-managed)

**Public Methods:**
```javascript
// Reset all session data
resetSession()

// Target Drill
addReactionTime(seconds)        // Log a reaction time
addAccuracySample(isCorrect)    // Log accuracy (true/false)

// Beam Walk Drill
addBeamRun(durationSeconds)     // Log a balance run duration

// Ball Catching Drill
addBallResult(result)           // result = 'caught' | 'deflected' | 'missed'

// Get comprehensive report
getReport() // Returns: { reaction, accuracy, beam, ball }
```

**Data Structure:**
```javascript
{
  target: { 
    reactionTimes: [0.5, 0.6, 0.4, ...],
    accuracy: { correct: 8, total: 10 }
  },
  beam: { 
    runs: [3.2, 5.1, 2.8, ...],
    bestDuration: 5.1 
  },
  ball: { 
    caught: 5, 
    deflected: 3, 
    missed: 2, 
    total: 10 
  }
}
```

---

#### **GameSelector** (`game-selector.js`)
**Purpose:** Orchestrates environment switching and drill lifecycle

**Attach To:** Manager object (singleton)

**Properties:**
- `footballField` (object) - Football environment parent
- `tennisCourt` (object) - Tennis environment parent
- `gymFloor` (object) - Gym environment parent
- `defaultEnvironment` (enum) - 'football' | 'tennis' | 'gym'
- `targetManager` (object) - Object with target-manager component
- `beamWalkManager` (object) - Object with beam-walk-manager component
- `ballThrower` (object) - Object with ball-thrower component
- `dataManager` (object) - Object with data-manager component
- `uiStatusText` (object) - Text object for status display

**Public Methods:**
```javascript
// Environment switching
showFootball()
showTennis()
showGym()

// Drill control
startTargetDrill()
startBeamWalk()
startBallDrill()
stopDrills()

// Reporting
showReport()

// UI updates
updateStatus(text)
```

**Usage Example:**
```javascript
const gs = this.engine.scene.findByName('Manager')[0]
    .getComponent('game-selector');
gs.showFootball();
gs.startTargetDrill();
```

---

#### **EnvironmentSwitcher** (`environment-switcher.js`)
**Purpose:** Hides/shows environments by scaling

**Attach To:** Manager object OR separate controller object

**Properties:**
- `footballField` (object)
- `tennisCourt` (object)
- `gymFloor` (object)
- `defaultEnvironment` (enum)

**How It Works:**
- Stores original scales of all environments
- Hides by scaling to `[0.0000001, 0.0000001, 0.0000001]`
- Shows by restoring original scale
- Only one environment visible at a time

---

### Drill Components

#### **TargetManager** (`target-manager.js`)
**Purpose:** Spawns targets for reaction time training

**Properties:**
- `spherePrefab` (object) - Prefab to clone for targets
- `maxTargets` (int) - Total targets before ending (default: 20)
- `spawnInterval` (float) - Seconds between spawns (default: 1.0)
- `useColorMode` (bool) - Enable color-coded accuracy tracking
- `uiCueText` (object) - Text to show "Hit GREEN" etc.
- `dataManager` (object) - DataManager reference

**Public Methods:**
```javascript
startGame()  // Begin spawning targets
endGame()    // Stop and cleanup
```

**How It Works:**
1. Clones `spherePrefab` at random positions
2. Attaches `target-collision` component to each
3. Tracks spawn time on each target
4. On hit: calculates reaction time, logs to DataManager
5. Spawns next target after `spawnInterval`
6. Ends when `maxTargets` reached

**Color Mode:**
- Randomly assigns 'red' or 'green' to each target
- Shows UI cue: "Hit GREEN"
- Tracks accuracy: correct color hit vs total hits

---

#### **TargetCollision** (`target-collision.js`)
**Purpose:** Detects when controller hits a target

**Attached To:** Each spawned target sphere (auto-attached by TargetManager)

**Properties:**
- `manager` (object) - Reference to TargetManager (auto-set)

**How It Works:**
- Listens for `onCollisionEnter` from physics engine
- Checks if collision is with a Controller object
- Calls `manager.onTargetHit()` with reaction time
- Marks itself as hit to prevent double-counting

---

#### **BeamWalkManager** (`beam-walk-manager.js`)
**Purpose:** Tracks player balance while walking on virtual beam

**Properties:**
- `playerObject` (object) - Player rig to track
- `beamWidth` (float) - Unused (replaced by maxDistanceFromCenter)
- `startPosition` (object) - Beam start marker
- `endPosition` (object) - Beam end marker
- `maxDistanceFromCenter` (float) - Max lateral distance before fall (default: 0.15m)
- `resetHeight` (float) - Y position that triggers fall (default: -2.0m)
- `dataManager` (object) - DataManager reference

**Public Methods:**
```javascript
startDrill()  // Begin tracking
endDrill()    // Stop and return results
```

**How It Works:**
1. Projects player position onto beam centerline
2. Calculates lateral distance from centerline
3. If distance > `maxDistanceFromCenter` OR y < `resetHeight`: FALL!
4. On fall: log run duration, reset player to start
5. Tracks cumulative balance time and best run

**Math:**
```javascript
// Vector projection to find closest point on beam
beam_vector = endPos - startPos
player_offset = playerPos - startPos
t = dot(player_offset, beam_vector) / dot(beam_vector, beam_vector)
closest_point = startPos + (beam_vector * clamp(t, 0, 1))
lateral_distance = length(playerPos - closest_point) // XZ only
```

---

#### **BallThrower** (`ball-thrower.js`)
**Purpose:** Spawns balls that fly towards player

**Properties:**
- `ballPrefab` (object) - Prefab to clone for balls
- `playerObject` (object) - Player to target
- `maxBalls` (int) - Total balls before ending (default: 15)
- `spawnInterval` (float) - Seconds between spawns (default: 2.0)
- `ballSpeed` (float) - Velocity in m/s (default: 3.0)
- `spawnRadius` (float) - Distance from player to spawn (default: 3.0)
- `spawnHeightMin` (float) - Min Y position (default: 1.0)
- `spawnHeightMax` (float) - Max Y position (default: 2.5)
- `dataManager` (object) - DataManager reference

**Public Methods:**
```javascript
startDrill()  // Begin spawning balls
endDrill()    // Stop and return results
onBallCaught(ball)     // Called by BallCollision
onBallDeflected(ball)  // Called by BallCollision
onBallMissed(ball)     // Internal when ball passes player
```

**How It Works:**
1. Spawns ball at random position around player (cylindrical coords)
2. Calculates velocity vector towards player
3. Attaches `ball-collision` component to each ball
4. Tracks ball as "active"
5. Removes ball from active list when:
   - Caught (destroyed after 200ms)
   - Deflected (destroyed after 500ms with bounce)
   - Missed (went 3m behind player or below y=-1)
6. Ends when all balls thrown and none active

---

#### **BallCollision** (`ball-collision.js`)
**Purpose:** Detects catch vs deflect based on controller velocity

**Attached To:** Each spawned ball (auto-attached by BallThrower)

**Properties:**
- `thrower` (object) - Reference to BallThrower (auto-set)
- `catchRadius` (float) - Distance for catch detection (default: 0.15m)
- `deflectRadius` (float) - Distance for deflect detection (default: 0.20m)
- `catchVelocityThreshold` (float) - Max controller speed for catch (default: 0.5 m/s)

**How It Works:**
1. Each frame: applies ball velocity to move ball
2. Tracks last controller positions to calculate velocity
3. For each controller:
   - If distance < `catchRadius` AND velocity < threshold: **CATCH**
   - If distance < `deflectRadius`: **DEFLECT**
4. On catch: ball stops, sticks briefly, then destroyed
5. On deflect: ball bounces away, destroyed after 500ms
6. Calls appropriate `thrower` methods

---

### UI Components

#### **Button3D** (`button-3d.js`)
**Purpose:** Base class for all 3D interactive buttons

**Properties:**
- `triggerDistance` (float) - Press distance (default: 0.5m)
- `cooldownTime` (float) - Prevent double-press (default: 0.5s)
- `hoverScaleMultiplier` (float) - Scale on hover (default: 1.2)
- `pressScaleMultiplier` (float) - Scale on press (default: 0.85)
- `debugMode` (bool) - Console logging (default: true)
- `usePlayerForDesktop` (bool) - Use Player object if no VR (default: true)

**How It Works:**
- Finds VR controllers OR Player/Camera object
- Each frame: calculates distance to button
- States:
  - Hover: distance < triggerDistance * 2
  - Press: distance < triggerDistance
- Visual feedback: scales button based on state
- Cooldown prevents rapid re-presses

**To Create Custom Button:**
```javascript
import {Button3D} from './button-3d.js';

export class MyButton extends Button3D {
    static TypeName = 'my-button';
    
    onPress() {
        super.onPress(); // Optional logging
        // Your code here
        const gs = this.engine.scene.findByName('Manager')[0]
            .getComponent('game-selector');
        gs.startTargetDrill();
    }
}
```

---

#### **Button Variants**
All extend `Button3D` and override `onPress()`:

- **ButtonStartTarget** - Calls `gs.startTargetDrill()`
- **ButtonStartBeam** - Calls `gs.startBeamWalk()`
- **ButtonStartBall** - Calls `gs.startBallDrill()`
- **ButtonStopDrills** - Calls `gs.stopDrills()`
- **ButtonShowReport** - Calls `gs.showReport()`
- **ButtonEnvFootball** - Calls `gs.showFootball()`
- **ButtonEnvTennis** - Calls `gs.showTennis()`
- **ButtonEnvGym** - Calls `gs.showGym()`

---

### Utility Components

#### **ControllerHit** (`controller-hit.js`)
**Purpose:** Physics-based collision detection for VR controllers

**Attach To:** ControllerLeft and ControllerRight objects

**Properties:**
- `hand` (string) - 'left' or 'right'

**How It Works:**
- Uses Wonderland's physics collision system
- `onCollisionEnter(other)` fires when collision detected
- If other object has `target-collision`, calls its `onHit()` method

**Note:** TargetCollision also does manual distance checking, so this provides redundancy.

---

#### **HeadBob** (`head-bob.js`)
**Purpose:** Camera shake effect for desktop walking

**Attach To:** NonVrCamera object

**Properties:**
- `playerObject` (object) - Player rig to monitor
- `bobFrequency` (float) - Speed of bob (default: 10.0)
- `bobAmount` (float) - Height of bob (default: 0.03m)
- `epsilon` (float) - Movement threshold (default: 0.001m)

**How It Works:**
- Tracks player movement on XZ plane (ignoring Y)
- If moving: applies sine wave to camera Y position
- Creates realistic head bob during walking
- Resets when player stops

---

## 🎯 Adding a New Drill

### Step-by-Step Guide:

**1. Create the Drill Manager Component:**

```javascript
// js/my-drill-manager.js
import {Component, Property} from '@wonderlandengine/api';

export class MyDrillManager extends Component {
    static TypeName = 'my-drill-manager';
    
    static Properties = {
        dataManager: Property.object(),
        // Add your properties...
    };

    start() {
        this.running = false;
        // Initialize state...
    }

    startDrill() {
        console.log('[MyDrill] Starting');
        this.running = true;
        // Setup drill...
    }

    endDrill() {
        console.log('[MyDrill] Ending');
        this.running = false;
        
        // Log to DataManager
        const dm = this.dataManager?.getComponent('data-manager');
        dm?.addMyDrillData(/* ... */);
        
        return { /* summary stats */ };
    }

    update(dt) {
        if (!this.running) return;
        // Drill logic...
    }
}
```

**2. Add to DataManager:**

In `data-manager.js`:
```javascript
resetSession() {
    this.session = {
        // ...existing...
        myDrill: { score: 0, attempts: 0 },
    };
}

addMyDrillData(data) {
    // Store data...
}

getReport() {
    // ...existing...
    return {
        // ...existing...
        myDrill: { /* stats */ },
    };
}
```

**3. Add to GameSelector:**

In `game-selector.js`:
```javascript
static Properties = {
    // ...existing...
    myDrillManager: Property.object(),
};

startMyDrill() {
    this.stopDrills();
    this.currentDrill = 'my-drill';
    const mgr = this.myDrillManager?.getComponent('my-drill-manager');
    if (mgr) {
        mgr.startDrill();
        this.updateStatus('My Drill: ON');
    }
}

stopDrills() {
    // ...existing cases...
    else if (this.currentDrill === 'my-drill') {
        const md = this.myDrillManager?.getComponent('my-drill-manager');
        md?.endDrill();
    }
    // ...
}
```

**4. Create Button:**

```javascript
// js/button-start-my-drill.js
import {Button3D} from './button-3d.js';

export class ButtonStartMyDrill extends Button3D {
    static TypeName = 'button-start-my-drill';
    
    onPress() {
        super.onPress();
        const gs = this.engine.scene.findByName('Manager')[0]
            ?.getComponent('game-selector');
        gs?.startMyDrill();
    }
}
```

**5. Register Components:**

In `js/index.js`:
```javascript
import {MyDrillManager} from './my-drill-manager.js';
import {ButtonStartMyDrill} from './button-start-my-drill.js';

// ...
engine.registerComponent(MyDrillManager);
engine.registerComponent(ButtonStartMyDrill);
```

**6. Setup in Editor:**
- Create object with `my-drill-manager` component
- Link to GameSelector's `myDrillManager` property
- Create button with `button-start-my-drill` component

---

## 🐛 Debugging Tips

### Console Logging
All components have extensive console.log statements:
```javascript
console.log('[ComponentName] Event description', data);
```

Enable `debugMode` on Button3D components for distance logging.

### Common Issues

**"Component not found"**
- Check component is registered in `index.js`
- Verify TypeName matches between file and registration
- Rebuild project in Wonderland Editor

**"Manager not linked"**
- Check GameSelector properties in editor
- Ensure object names match (e.g., "Manager")
- Use `findByName` carefully (case-sensitive)

**"Drill won't start"**
- Check drill manager has startDrill() method
- Verify dataManager is linked
- Check console for error messages

**Collision not working:**
- Verify physics components attached
- Check collision layers/masks
- Try increasing detection radii
- Ensure controllers have colliders

---

## 📝 Code Style Guidelines

### Component Structure:
```javascript
import {Component, Property} from '@wonderlandengine/api';

export class MyComponent extends Component {
    static TypeName = 'my-component';
    
    static Properties = {
        myProperty: Property.object(),
    };

    start() {
        // Initialization
    }

    update(dt) {
        // Frame logic
    }

    // Public methods
    myMethod() {
        // ...
    }

    // Private methods (prefix with _)
    _helperMethod() {
        // ...
    }
}
```

### Naming Conventions:
- **Components:** PascalCase (e.g., `TargetManager`)
- **TypeNames:** kebab-case (e.g., `'target-manager'`)
- **Methods:** camelCase (e.g., `startDrill()`)
- **Private methods:** camelCase with _ prefix (e.g., `_resetState()`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `HIDDEN_SCALE`)

### Best Practices:
- Always check for null/undefined before accessing properties
- Use optional chaining: `obj?.method()`
- Log important events to console
- Clean up resources in endDrill/destroy methods
- Document complex math/logic with comments

---

## 🚀 Building & Deployment

### Development:
1. Open project in Wonderland Engine Editor
2. Make changes to `.js` files
3. Editor auto-reloads on save
4. Test in browser preview

### Building for Quest 2:
1. In editor: Project > Package
2. Select "Android (Quest)"
3. Build creates `.apk` file
4. Sideload to Quest via SideQuest

### Web Deployment:
1. In editor: Project > Package
2. Select "Web"
3. Upload `deploy/` folder to web server
4. Accessible via browser (including Quest browser)

---

## 📚 Resources

**Wonderland Engine:**
- Docs: https://wonderlandengine.com/docs
- API Reference: https://wonderlandengine.com/api/
- Forum: https://wonderlandengine.com/community/

**gl-matrix (Vector Math):**
- Docs: https://glmatrix.net/docs/

**Meta Quest Development:**
- Developer Hub: https://developer.oculus.com/

---

*Last Updated: November 29, 2025*
