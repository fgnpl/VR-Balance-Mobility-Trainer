# Target Spawning & Collision Fix Guide

## Issues Fixed

### 1. ❌ Only 1 Target Spawns (Even with simultaneousTargets = 4)
### 2. ❌ Collisions Still Don't Work
### 3. ✅ NEW: Spawn Targets Inside Cube Zone

---

## Issue 1: Only 1 Target Spawning

### Problem
You set `simultaneousTargets = 4` but only 1 target appears.

### Root Cause
The `start()` method was calling `spawnTarget()` immediately, but targets should only spawn when `startGame()` is explicitly called by the game-selector.

### Solution Applied
- ✅ Removed auto-spawn from `start()`
- ✅ Targets only spawn when `startGame()` is called
- ✅ Added console logging to track spawning

### What Changed
```javascript
// BEFORE (in start method):
for (let i = 0; i < this.simultaneousTargets; i++) {
    this.spawnTarget();  // ❌ Called too early!
}

// AFTER:
console.log('[TargetManager] Initialized - waiting for startGame()');
// Targets spawn when game-selector calls startGame()
```

---

## Issue 2: Collisions Not Working

### Diagnosis Tools Added

**Enhanced Logging in 3 Components:**

1. **controller-hit.js** - Now logs:
   - ✅ When controller initializes
   - ✅ If collision component exists
   - ✅ Every collision event
   - ✅ Target hit confirmations

2. **target-collision.js** - Now logs:
   - ✅ When target initializes
   - ✅ If collision component exists
   - ✅ All collision events
   - ✅ Hit registration process

3. **target-manager.js** - Now logs:
   - ✅ Number of simultaneous targets set
   - ✅ Auto-adds collision if missing
   - ✅ Active target count

### Console Output You Should See

**When controllers start:**
```
[ControllerHit] left controller initialized
[ControllerHit] ✅ left controller has collision component
[ControllerHit] right controller initialized
[ControllerHit] ✅ right controller has collision component
```

**When target spawns:**
```
[TargetManager] simultaneousTargets: 4
[TargetManager] ✅ Target has collision component
[TargetManager] Target spawned at: [x, y, z]
[TargetManager] Active targets: 1 / 4
...
[TargetManager] Active targets: 4 / 4
```

**When collision happens:**
```
[ControllerHit] left collision with: SpherePrefab(Clone)
[ControllerHit] 🎯 left hand hit a target!
[TargetCollision] onHit called! hit: false
[TargetCollision] Registering hit with manager, RT: 0.523
```

**If collision component missing:**
```
[ControllerHit] ❌ left controller has NO collision component!
[ControllerHit] Add 'collision' component in editor for hits to work!
```

---

## Issue 3: NEW FEATURE - Spawn Zone

### What It Does
Targets now spawn inside a cube mesh's dimensions instead of a random curved area.

### How to Set Up

#### Step 1: Create Spawn Zone Cube

1. **In Wonderland Editor:**
   - Right-click Scene Outline → Add Object
   - Name it: `TargetSpawnZone`

2. **Add Mesh Component:**
   - Add Component → `mesh`
   - Mesh: `PrimitiveCube` (or any mesh)
   - Material: Make it semi-transparent or wireframe (optional)

3. **Position and Scale the Cube:**
   - Position: Where you want targets to spawn
   - Scale: Define the spawn volume
   - Example:
     ```
     Position: [0, 2, 3] (in front of player)
     Scale: [4, 2, 2] (4m wide, 2m tall, 2m deep)
     ```

4. **Optional: Make it Invisible:**
   - Set material alpha to 0
   - Or disable mesh component after setup
   - Targets will still spawn in its volume

#### Step 2: Link to Target Manager

1. Select **TargetManager** object
2. Find `target-manager` component properties
3. Find **spawnZone** property
4. **Drag** TargetSpawnZone object to this property

#### Step 3: Test

1. Build (Ctrl+B)
2. Start Target Drill
3. Targets should spawn randomly **inside** the cube volume

### Console Output

**With spawn zone:**
```
[TargetManager] Spawn zone calculated: {
  minX: -2, maxX: 2,
  minY: 1, maxY: 3,
  minZ: 2, maxZ: 4
}
[TargetManager] Spawning in zone: 1.23, 2.45, 3.12
```

**Without spawn zone:**
```
[TargetManager] No spawn zone set - using default curved area
[TargetManager] Spawning (no zone): 2.34, 1.78, 3.45
```

---

## Complete Setup Checklist

### Controllers (Both Left & Right):

```
ControllerLeft
├── ✅ collision component
│   ├── Collider: sphere
│   ├── Group: 1
│   └── Extents: [0.05, 0.05, 0.05]
└── ✅ controller-hit component
    └── hand: left

ControllerRight
├── ✅ collision component
│   ├── Collider: sphere
│   ├── Group: 1
│   └── Extents: [0.05, 0.05, 0.05]
└── ✅ controller-hit component
    └── hand: right
```

### Target Manager:

```
TargetManager
└── ✅ target-manager component
    ├── spherePrefab → SpherePrefab
    ├── spawnZone → TargetSpawnZone (OPTIONAL)
    ├── maxTargets → 20
    ├── simultaneousTargets → 4 (or whatever you want)
    ├── spawnInterval → 1.0
    ├── targetLifetime → 1.0
    └── statsText → (optional text display)
```

### Spawn Zone (Optional):

```
TargetSpawnZone
├── ✅ mesh component (for dimensions)
│   └── Mesh: PrimitiveCube
├── Position: [where targets spawn]
└── Scale: [spawn volume size]
```

### Target Prefab:

```
SpherePrefab (inactive)
├── ✅ mesh component
├── ✅ collision component
│   ├── Collider: sphere
│   ├── Group: 2
│   └── Extents: [0.15, 0.15, 0.15]
└── (target-collision added by manager automatically)
```

---

## Troubleshooting

### Still Only 1 Target?

**Check Console:**
```
[TargetManager] simultaneousTargets: 4
[TargetManager] Active targets: 1 / 4
```

If you see only 1 active target, check:
1. Is `simultaneousTargets` property set to 4 in editor?
2. Did you save the scene after changing it?
3. Did you rebuild (Ctrl+B)?

### Collisions Still Not Working?

**Step 1: Check Console During Startup**

You should see:
```
✅ [ControllerHit] left controller has collision component
✅ [ControllerHit] right controller has collision component
✅ [TargetManager] Target has collision component
```

If you see:
```
❌ [ControllerHit] left controller has NO collision component!
```

**Solution:** Add collision component to controllers (see QUICK-COLLISION-FIX.md)

**Step 2: Check Console During Gameplay**

Wave controllers through targets. You should see:
```
[ControllerHit] left collision with: SpherePrefab(Clone)
```

If you see **nothing** when passing through targets:
- ❌ Physics not enabled in Project Settings
- ❌ Collision groups blocking each other
- ❌ Collision extents are 0

**Step 3: Check Console for Hit Registration**

When collision IS detected, you should see:
```
[ControllerHit] 🎯 left hand hit a target!
[TargetCollision] onHit called! hit: false
[TargetCollision] Registering hit with manager, RT: 0.523
```

If collision happens but no hit registration:
- Check if target has `target-collision` component
- Check if manager is linked

### Spawn Zone Not Working?

**Check Console:**
```
[TargetManager] Spawn zone calculated: {...}
```

If you see:
```
[TargetManager] No spawn zone set - using default curved area
```

**Solution:**
1. Verify TargetSpawnZone object exists
2. Verify it has a `mesh` component
3. Verify it's linked in TargetManager's `spawnZone` property
4. Rebuild (Ctrl+B)

---

## Quick Test Procedure

### 1. Build and Deploy
```
Ctrl+B in Wonderland Editor
Deploy to Quest
```

### 2. Check Browser Console
On PC, open chrome://inspect and connect to Quest

### 3. Look for These Messages

**Good signs:**
```
✅ [ControllerHit] left controller has collision component
✅ [TargetManager] simultaneousTargets: 4
✅ [TargetManager] Active targets: 4 / 4
✅ [ControllerHit] 🎯 left hand hit a target!
```

**Bad signs:**
```
❌ [ControllerHit] left controller has NO collision component!
❌ [TargetManager] Active targets: 1 / 4 (when you set 4)
❌ [TargetCollision] No manager set!
```

### 4. Test in VR

1. Start Target Drill
2. **You should see 4 targets** (or whatever simultaneousTargets is set to)
3. Swing controller through a target
4. Hit counter should increase
5. New target should spawn after `spawnInterval` seconds

---

## Summary of Changes

### Files Modified:

1. **js/target-manager.js**
   - Added `spawnZone` property
   - Removed auto-spawn from `start()`
   - Added spawn zone boundary calculation
   - Added collision auto-add if missing
   - Enhanced logging throughout

2. **js/controller-hit.js**
   - Added `start()` method with collision check
   - Enhanced logging for all collisions
   - Better error messages

3. **js/target-collision.js**
   - Enhanced logging in all methods
   - Better collision detection messages
   - Added collision component check

### New Features:

- ✅ Spawn zone support (spawn inside cube dimensions)
- ✅ Auto-add collision if missing
- ✅ Comprehensive debug logging
- ✅ Fixed simultaneous targets spawning
- ✅ Better error diagnostics

---

**Build with Ctrl+B and check the console to diagnose any issues!** 🎯
