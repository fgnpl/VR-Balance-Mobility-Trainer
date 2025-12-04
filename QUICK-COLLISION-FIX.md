# Quick Setup: Controller Collisions

## Problem
- ❌ Targets don't register hits
- ❌ Beam walk doesn't detect falls

## Solution: 5-Minute Fix

---

## Step 1: Fix Controllers (2 minutes)

### ControllerLeft

1. **Select** ControllerLeft in Scene Outline
2. **Add collision component:**
   - Click "Add Component"
   - Type: `collision`
   - Settings:
     ```
     Collider: sphere
     Group: 1
     Extents: [0.05, 0.05, 0.05]
     ```

3. **Verify controller-hit component exists:**
   - Should see `controller-hit` in components list
   - If missing: Add Component → controller-hit
   - Settings:
     ```
     hand: left
     ```

### ControllerRight

1. **Select** ControllerRight
2. **Add collision component:**
   ```
   Collider: sphere
   Group: 1
   Extents: [0.05, 0.05, 0.05]
   ```

3. **Verify controller-hit:**
   ```
   hand: right
   ```

---

## Step 2: Fix Target Prefab (1 minute)

1. **Find SpherePrefab** in Scene Outline
   - Should be inactive (grayed out)
   - This is what TargetManager clones

2. **Select SpherePrefab**

3. **Add collision component:**
   ```
   Collider: sphere
   Group: 2
   Extents: [0.15, 0.15, 0.15]
   ```

---

## Step 3: Fix Beam Walk (1 minute)

1. **Find BeamWalkManager** object in Scene Outline

2. **Select it**

3. **Check beam-walk-manager component properties:**
   ```
   playerObject: Player (drag from scene)
   headObject: (leave empty - auto-finds)
   startPosition: [your beam start point]
   endPosition: [your beam end point]
   resetHeight: -2.0 (or -1.0 if you want faster detection)
   maxDistanceFromCenter: 1.0 (100cm tolerance - 2x increased)
   ```

**Note:** The component will automatically find the VR camera/head for you!

**Teleportation Fix:** The component now properly calculates the head offset from the Player root and compensates when teleporting, so your VR camera ends up exactly at the start position.

---

## Step 4: Test (1 minute)

1. **Build:** Press `Ctrl+B`
2. **Deploy to Quest**
3. **Put on headset**
4. **Test targets:**
   - Start Target Drill
   - Swing controller through pink spheres
   - Should see hit counter increase!

5. **Test beam walk:**
   - Start Beam Walk
   - Walk off the beam
   - Should teleport back to start!

---

## Troubleshooting

### Still not working?

**Add diagnostic component:**

1. Select ControllerLeft
2. Add Component → `collision-debug`
3. Settings:
   ```
   logName: ControllerLeft
   showEnter: ✓
   ```

4. Build and check console (F12)
5. Should see: "COLLISION ENTER!" when touching spheres

### No collisions detected?

Check Project Settings → Physics:
- ✅ PhysX enabled
- ✅ Collision groups 1 and 2 can collide

---

## Visual Checklist

```
ControllerLeft
├── ✅ collision (sphere, 0.05)
└── ✅ controller-hit (hand: left)

ControllerRight
├── ✅ collision (sphere, 0.05)
└── ✅ controller-hit (hand: right)

SpherePrefab
├── ✅ collision (sphere, 0.15)
├── ✅ mesh
└── (target-collision added automatically)

BeamWalkManager
└── ✅ beam-walk-manager
    ├── playerObject → Player
    ├── headObject → (empty, auto-find)
    ├── startPosition → [start point]
    ├── endPosition → [end point]
    ├── maxDistanceFromCenter → 1.0 (2x tolerance)
    └── resetHeight → -2.0
```

---

## That's it!

Build, deploy, and test. Your collisions should now work! 🎉

---

## Additional Guides

- **COLLISION-FIXES.md** - Detailed collision troubleshooting
- **TARGET-SPAWN-FIX.md** - Multiple target spawning & spawn zones
- **BEAM-TELEPORT-FIX.md** - VR teleportation fix
