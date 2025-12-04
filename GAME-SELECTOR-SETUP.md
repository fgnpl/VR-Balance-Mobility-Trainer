# Game Selector Configuration Guide

## Issue: Drills Start But Don't Work

You're seeing status messages like "Target Striking: ON" but:
- ❌ Beam walk doesn't teleport you
- ❌ Targets don't spawn
- ❌ Balls don't throw

## Root Cause

The **Manager object** in your scene needs to have the drill manager objects linked in the `game-selector` component properties.

---

## Solution: Link Drill Managers in Editor

### Step 1: Find the Manager Object

1. Open Scene Outline in Wonderland Editor
2. Find object named **"Manager"**
3. Select it

### Step 2: Check game-selector Component

In the Properties panel, you should see **`game-selector`** component with these properties:

```
game-selector Component:
├── footballField: [Empty or linked to FootballField object]
├── tennisCourt: [Empty or linked to TennisCourt object]
├── gymFloor: [Empty or linked to GymFloor object]
├── defaultEnvironment: football/tennis/gym
├── targetManager: ⚠️ MUST LINK
├── beamWalkManager: ⚠️ MUST LINK
├── ballThrower: ⚠️ MUST LINK
├── dataManager: ⚠️ MUST LINK
└── uiStatusText: [Optional - for status display]
```

### Step 3: Find and Link Drill Manager Objects

You need to find these objects in your scene and link them:

#### Find Target Manager Object:
1. In Scene Outline, search for an object with **`target-manager`** component
2. Common names: "TargetManager", "Target Manager", "Targets", "Manager"
3. Drag this object to **targetManager** property in game-selector

#### Find Beam Walk Manager Object:
1. Search for object with **`beam-walk-manager`** component
2. Common names: "BeamWalkManager", "Beam Manager", "BeamWalk"
3. Drag to **beamWalkManager** property

#### Find Ball Thrower Object:
1. Search for object with **`ball-thrower`** component
2. Common names: "BallThrower", "Ball Manager", "Balls"
3. Drag to **ballThrower** property

#### Find Data Manager Object:
1. Search for object with **`data-manager`** component
2. Common names: "DataManager", "Data", "Stats"
3. Drag to **dataManager** property

---

## Quick Check: Are Managers Missing?

If you can't find these objects, they might not exist yet! You need to create them.

### Create Missing Managers:

#### 1. Create Target Manager (if missing):

```
1. Right-click in Scene Outline → Add Object
2. Name it: "TargetManager"
3. Add Component → target-manager
4. Configure properties:
   - spherePrefab: [Link to your target sphere prefab]
   - maxTargets: 20
   - spawnInterval: 1.0
   - simultaneousTargets: 1
```

#### 2. Create Beam Walk Manager (if missing):

```
1. Right-click in Scene Outline → Add Object
2. Name it: "BeamWalkManager"
3. Add Component → beam-walk-manager
4. Configure properties:
   - playerObject: [Link to Player object]
   - startPosition: [Link to beam start point]
   - endPosition: [Link to beam end point]
   - beamWidth: 0.3
```

#### 3. Create Ball Thrower (if missing):

```
1. Right-click in Scene Outline → Add Object
2. Name it: "BallThrower"
3. Add Component → ball-thrower
4. Configure properties:
   - ballPrefab: [Link to your ball prefab]
   - throwInterval: 2.0
   - throwSpeed: 5.0
```

#### 4. Create Data Manager (if missing):

```
1. Right-click in Scene Outline → Add Object
2. Name it: "DataManager"
3. Add Component → data-manager
4. No configuration needed
```

---

## Verification Steps

After linking all managers:

### 1. Check Console for Warnings

When you build and run, check the console (F12). You should NOT see:

```
❌ [GameSelector] Target Manager not linked!
❌ [GameSelector] Beam Walk Manager not linked!
❌ [GameSelector] Ball Thrower not linked!
❌ [GameSelector] Data Manager not linked!
```

If you see these warnings, the objects aren't linked properly.

### 2. Test Each Drill

**Target Drill:**
- Click "Start Target Drill" button
- Should see: "Target Striking: ON" status
- Should see: Pink spheres spawn in front of you
- Hit them with controllers
- Should see: Hit counter increases

**Beam Walk:**
- Click "Start Beam Walk" button
- Should see: "Beam Walk: ON" status
- Should see: You teleport to beam start position
- Walk along the beam
- Fall off = respawn at start

**Ball Catching:**
- Click "Start Ball Catching" button
- Should see: "Ball Catching: ON" status
- Should see: Balls thrown at you
- Catch or deflect them with controllers

---

## Debug Component

Add this to Manager to diagnose linking issues:

### Create: `js/game-selector-debug.js`

```javascript
import {Component, Property} from '@wonderlandengine/api';

export class GameSelectorDebug extends Component {
    static TypeName = 'game-selector-debug';

    start() {
        console.log('=== GAME SELECTOR DEBUG ===');
        
        const gs = this.object.getComponent('game-selector');
        if (!gs) {
            console.error('❌ No game-selector component on this object!');
            return;
        }

        console.log('✅ game-selector component found');
        console.log('');
        console.log('Checking linked objects:');
        console.log('  targetManager:', gs.targetManager ? `✅ Linked` : '❌ NOT LINKED');
        console.log('  beamWalkManager:', gs.beamWalkManager ? `✅ Linked` : '❌ NOT LINKED');
        console.log('  ballThrower:', gs.ballThrower ? `✅ Linked` : '❌ NOT LINKED');
        console.log('  dataManager:', gs.dataManager ? `✅ Linked` : '❌ NOT LINKED');
        
        console.log('');
        console.log('Checking components on linked objects:');
        
        if (gs.targetManager) {
            const tm = gs.targetManager.getComponent('target-manager');
            console.log('  target-manager component:', tm ? '✅ Found' : '❌ MISSING');
        }
        
        if (gs.beamWalkManager) {
            const bm = gs.beamWalkManager.getComponent('beam-walk-manager');
            console.log('  beam-walk-manager component:', bm ? '✅ Found' : '❌ MISSING');
        }
        
        if (gs.ballThrower) {
            const bt = gs.ballThrower.getComponent('ball-thrower');
            console.log('  ball-thrower component:', bt ? '✅ Found' : '❌ MISSING');
        }
        
        if (gs.dataManager) {
            const dm = gs.dataManager.getComponent('data-manager');
            console.log('  data-manager component:', dm ? '✅ Found' : '❌ MISSING');
        }
        
        console.log('');
        console.log('=== END DEBUG ===');
    }
}
```

### Register and Use:

1. Register in `js/index.js`:
   ```javascript
   import {GameSelectorDebug} from './game-selector-debug.js';
   engine.registerComponent(GameSelectorDebug);
   ```

2. Add to Manager object in editor
3. Build and check console

---

## Visual Guide: How Linking Should Look

```
Scene Hierarchy:

Manager
├── [Components]
│   ├── game-selector
│   │   ├── targetManager → TargetManager (drag from scene)
│   │   ├── beamWalkManager → BeamWalkManager (drag from scene)
│   │   ├── ballThrower → BallThrower (drag from scene)
│   │   └── dataManager → DataManager (drag from scene)
│   └── game-selector-debug (temporary, for testing)

TargetManager
└── [Components]
    └── target-manager
        └── spherePrefab → [Your target sphere object]

BeamWalkManager
└── [Components]
    └── beam-walk-manager
        ├── playerObject → Player
        ├── startPosition → [Beam start point]
        └── endPosition → [Beam end point]

BallThrower
└── [Components]
    └── ball-thrower
        └── ballPrefab → [Your ball object]

DataManager
└── [Components]
    └── data-manager
```

---

## Summary

1. **Find Manager object** in scene
2. **Select it** to see Properties panel
3. **Find game-selector component** properties
4. **Link the four manager objects:**
   - targetManager
   - beamWalkManager
   - ballThrower
   - dataManager
5. **Build and test** (Ctrl+B)
6. **Check console** for any remaining warnings

Once linked, drills should work properly!

---

## Additional Issues & Solutions

### Issue: Targets Don't Register Hits
See: **QUICK-COLLISION-FIX.md** for collision setup

### Issue: Beam Walk Doesn't Detect Falls
See: **COLLISION-FIXES.md** for VR head tracking fix

---

*The clicking works - now the drills just need to find their manager objects!*
