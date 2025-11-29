# VR Balance & Mobility Trainer - Quick Reference

## 🎮 Component Quick Reference

### Core Components (Attach to "Manager" object)
| Component | Purpose | Key Properties |
|-----------|---------|----------------|
| `data-manager` | Session data storage | None (auto) |
| `game-selector` | Drill orchestration | All managers, environments, UI text |

### Drill Managers
| Component | Purpose | Key Properties |
|-----------|---------|----------------|
| `target-manager` | Reaction time drill | spherePrefab, maxTargets, dataManager |
| `beam-walk-manager` | Balance drill | playerObject, startPos, endPos, dataManager |
| `ball-thrower` | Ball catching drill | ballPrefab, playerObject, maxBalls, dataManager |

### UI Buttons (Attach to 3D button meshes)
| Component | Action |
|-----------|--------|
| `button-start-target` | Start target striking |
| `button-start-beam` | Start beam walk |
| `button-start-ball` | Start ball catching |
| `button-stop-drills` | Stop current drill |
| `button-show-report` | Display session stats |
| `button-env-football` | Switch to football field |
| `button-env-tennis` | Switch to tennis court |
| `button-env-gym` | Switch to gym floor |

### Auto-Attached Components
| Component | Auto-Attached To | By |
|-----------|------------------|-----|
| `target-collision` | Each spawned target | TargetManager |
| `ball-collision` | Each spawned ball | BallThrower |

---

## 📊 Data Tracked Per Drill

### Target Striking
- ✅ Reaction times (seconds)
- ✅ Average/Fastest/Slowest times
- ✅ Total hits
- ✅ Accuracy (color mode)

### Beam Walk
- ✅ Balance duration per run
- ✅ Best duration
- ✅ Number of runs
- ✅ Average duration

### Ball Catching
- ✅ Balls caught
- ✅ Balls deflected
- ✅ Balls missed
- ✅ Success rate %

---

## 🔌 Required Links in Editor

### GameSelector Properties:
```
footballField    → Environment parent object
tennisCourt      → Environment parent object  
gymFloor         → Environment parent object
targetManager    → Object with target-manager
beamWalkManager  → Object with beam-walk-manager
ballThrower      → Object with ball-thrower
dataManager      → Manager object (self-reference)
uiStatusText     → Text component for status
```

### TargetManager Properties:
```
spherePrefab  → Target sphere prefab
dataManager   → Manager object
uiCueText     → Text for color cues (optional)
```

### BeamWalkManager Properties:
```
playerObject  → Player rig
startPosition → Beam start marker
endPosition   → Beam end marker
dataManager   → Manager object
```

### BallThrower Properties:
```
ballPrefab    → Ball prefab (sphere/mesh)
playerObject  → Player rig
dataManager   → Manager object
```

---

## 🎯 Common Code Snippets

### Get GameSelector Reference:
```javascript
const gs = this.engine.scene.findByName('Manager')[0]
    ?.getComponent('game-selector');
```

### Get DataManager Reference:
```javascript
const dm = this.engine.scene.findByName('Manager')[0]
    ?.getComponent('data-manager');
```

### Start a Drill:
```javascript
gs.startTargetDrill();  // Target striking
gs.startBeamWalk();     // Beam walk
gs.startBallDrill();    // Ball catching
```

### Stop All Drills:
```javascript
gs.stopDrills();
```

### Get Report:
```javascript
const report = dm.getReport();
console.log(report);
/*
{
  reaction: { average, fastest, slowest, total },
  accuracy: { correct, total, percent },
  beam: { best, runs[] },
  ball: { caught, deflected, missed, total, successRate }
}
*/
```

### Switch Environment:
```javascript
gs.showFootball();
gs.showTennis();
gs.showGym();
```

---

## ⚙️ Common Property Values

### Button3D:
```
triggerDistance: 0.5          // Press distance (m)
cooldownTime: 0.5             // Anti-double-press (s)
hoverScaleMultiplier: 1.2     // Hover size
pressScaleMultiplier: 0.85    // Press size
debugMode: true               // Console logging
```

### TargetManager:
```
maxTargets: 20                // Targets before end
spawnInterval: 1.0            // Seconds between spawns
useColorMode: false           // Enable accuracy tracking
```

### BeamWalkManager:
```
maxDistanceFromCenter: 0.15   // Fall threshold (m)
resetHeight: -2.0             // Fall detection Y
```

### BallThrower:
```
maxBalls: 15                  // Balls before end
spawnInterval: 2.0            // Seconds between spawns
ballSpeed: 3.0                // m/s
spawnRadius: 3.0              // Distance from player (m)
spawnHeightMin: 1.0           // Min Y position
spawnHeightMax: 2.5           // Max Y position
```

### BallCollision:
```
catchRadius: 0.15             // Catch detection (m)
deflectRadius: 0.20           // Deflect detection (m)
catchVelocityThreshold: 0.5   // Max speed for catch (m/s)
```

---

## 🐛 Troubleshooting Checklist

- [ ] All components registered in `js/index.js`?
- [ ] Component TypeNames match between file and registration?
- [ ] GameSelector properties linked in editor?
- [ ] Drill manager properties linked (prefabs, player, etc.)?
- [ ] Button components attached to 3D objects?
- [ ] Manager object named "Manager" (case-sensitive)?
- [ ] VR controllers named "ControllerLeft" and "ControllerRight"?
- [ ] Player object named "Player"?
- [ ] DataManager attached to Manager object?
- [ ] Project rebuilt after code changes?

---

## 📁 File Structure

```
js/
├── index.js                     ← Register components here!
├── data-manager.js              ← Session data storage
├── game-selector.js             ← Drill orchestration
├── environment-switcher.js      ← Environment toggling
├── target-manager.js            ← Target drill
├── target-collision.js          ← Target interaction
├── beam-walk-manager.js         ← Balance drill
├── ball-thrower.js              ← Ball drill spawner
├── ball-collision.js            ← Ball interaction
├── button-3d.js                 ← Base button class
├── button-start-target.js       ← Start target button
├── button-start-beam.js         ← Start beam button
├── button-start-ball.js         ← Start ball button
├── button-stop-drills.js        ← Stop button
├── button-show-report.js        ← Report button
├── button-env-football.js       ← Football env button
├── button-env-tennis.js         ← Tennis env button
├── button-env-gym.js            ← Gym env button
├── controller-hit.js            ← VR collision handler
└── head-bob.js                  ← Camera bob effect
```

---

## 🎨 Creating Prefabs

### Target Sphere:
1. Create sphere mesh (radius ~0.2m)
2. Add material (color changeable for color mode)
3. Optionally add physics collider
4. Save as prefab
5. Link to TargetManager's `spherePrefab`

### Ball Prefab:
1. Create sphere mesh (radius ~0.1-0.15m)
2. Add material
3. Optionally add physics collider
4. Save as prefab
5. Link to BallThrower's `ballPrefab`

### Button Mesh:
1. Create 3D shape (cube, cylinder, custom mesh)
2. Add material
3. Position in scene at reachable location
4. Attach appropriate button-* component
5. No prefab needed (stays in scene)

---

## 🎯 Testing Workflow

1. **Desktop Testing:**
   - Use WASD to move Player
   - Mouse to look around
   - Walk close to buttons to "press" them
   - Controller interactions simulated via distance

2. **VR Testing:**
   - Build and deploy to Quest
   - Use hand controllers to interact
   - Distance-based button pressing
   - Full 6DOF tracking

3. **Console Monitoring:**
   - Open browser console (F12)
   - Watch for component logs
   - Check for errors/warnings
   - View performance data

---

*Print this page for quick reference while developing!*
