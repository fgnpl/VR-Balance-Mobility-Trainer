# Collision Troubleshooting Guide

## Issues Fixed

### 1. ❌ Beam Walk: Player Falls Not Detected in VR
### 2. ❌ Targets: No Collision When Hitting Spheres

---

## Issue 1: Beam Walk Fall Detection

### Problem
The beam-walk-manager was checking the **Player root object's Y position**, but in VR, the actual player height comes from the **VR headset/camera**, which is a child object that moves independently.

### Solution Applied
Updated `beam-walk-manager.js` to:
1. Added `headObject` property to track the VR camera/head
2. Auto-finds the head object (searches for object with 'view' component)
3. Uses head position for fall detection instead of root Player position

### Configuration in Editor

**Option A: Let it Auto-Find (Recommended)**
1. Select BeamWalkManager object
2. Set `playerObject` → Player
3. Leave `headObject` empty
4. Set `maxDistanceFromCenter` → 1.0 (increased 2x tolerance)
5. Component will automatically find the camera/head child

**Option B: Manual Setup**
1. Select BeamWalkManager object
2. Set `playerObject` → Player
3. Set `headObject` → EyeLeft (or NonVrCamera, or whatever has the camera)
4. Set `maxDistanceFromCenter` → 1.0
5. This gives more control but requires finding the right object

### How It Works Now

```
Player (root)
└── EyeLeft (camera/head) ← This is what we track now!
    └── View component
```

The head moves up and down in VR when you:
- Crouch
- Jump
- Fall through the floor

The beam manager now correctly detects when **your head** goes below `resetHeight` (default: -2.0).

---

## Issue 2: Target Collision Not Working

### Problem
When hitting target spheres with controllers, nothing happens because:
1. Controllers might not have collision components
2. Controllers might not have `controller-hit` component
3. Targets might not have collision components
4. Physics collision groups might not be configured

### Collision Chain Requirements

For a hit to register, this chain must work:

```
Controller (VR Hand)
├── collision component (physx box/sphere)
├── controller-hit component
└── onCollisionEnter() → detects target

Target Sphere
├── collision component (physx sphere)
├── target-collision component
└── onHit() → registers hit with manager
```

### Fix Checklist

#### ✅ Step 1: Controllers Need Collision

**Check ControllerLeft:**
1. Select ControllerLeft in Scene Outline
2. In Properties panel, check for **collision** component
3. If missing, click "Add Component" → collision
4. Settings:
   - Collider: `sphere` or `box`
   - Group: `1` (or any group)
   - Extents: `[0.05, 0.05, 0.05]` (5cm radius)

**Check ControllerRight:**
1. Same as above for ControllerRight

#### ✅ Step 2: Controllers Need controller-hit Component

**ControllerLeft:**
1. Select ControllerLeft
2. Check for **controller-hit** component
3. If missing: Add Component → controller-hit
4. Settings:
   - hand: `left`

**ControllerRight:**
1. Select ControllerRight
2. Check for **controller-hit** component
3. If missing: Add Component → controller-hit
4. Settings:
   - hand: `right`

#### ✅ Step 3: Target Prefab Needs Collision

**Important:** The target spheres are spawned from a prefab, so fix the prefab!

1. Find the **SpherePrefab** object (or whatever you named it)
2. Make sure it's inactive (so it doesn't appear in scene)
3. Select it
4. Check for **collision** component:
   - If missing: Add Component → collision
   - Collider: `sphere`
   - Group: `2` (different from controllers)
   - Extents: `[0.15, 0.15, 0.15]` (15cm radius to match sphere size)

5. Check for **target-collision** component:
   - Should already exist (TargetManager adds it at spawn)
   - If missing, it's auto-added by TargetManager

#### ✅ Step 4: Enable Physics in Project

1. In Wonderland Editor, go to **Project Settings**
2. Check **Physics** section
3. Make sure physx is enabled

---

## Diagnostic Component: collision-debug

Use this to see what's happening with collisions.

### Already Registered
The `collision-debug` component is now registered in `js/index.js`.

### How to Use

**Test Controller Collisions:**
1. Select ControllerLeft in Scene Outline
2. Add Component → collision-debug
3. Settings:
   - logName: `ControllerLeft`
   - showEnter: ✓
   - showExit: (optional)
4. Build and run (Ctrl+B)
5. Check console (F12) - should see collision messages

**Test Target Collisions:**
1. Select SpherePrefab (the target prefab)
2. Add Component → collision-debug
3. Settings:
   - logName: `Target`
   - showEnter: ✓
4. Build and run
5. When spheres spawn, they'll log collisions

### Console Output

**Good output:**
```
[ControllerLeft] Collision debug active on: ControllerLeft
[ControllerLeft] ✅ Collision component found
[ControllerLeft] 🔴 COLLISION ENTER!
  This object: ControllerLeft
  Other object: SpherePrefab(Clone)
  Other components: ["mesh", "collision", "target-collision"]
```

**Bad output (no collision component):**
```
[ControllerLeft] ❌ NO COLLISION COMPONENT on ControllerLeft!
[ControllerLeft] Add a 'collision' component in the editor for physics to work!
```

---

## Testing Procedure

### 1. Test Controllers First

1. Add collision-debug to both controllers
2. Build (Ctrl+B) and deploy to Quest
3. Put on headset
4. Wave controllers around
5. Check browser console on PC (connect Quest via USB)

If you don't see collision component messages, controllers aren't set up correctly.

### 2. Test Target Spawning

1. Start Target Drill
2. Check console - should see:
   ```
   [TargetManager] Spawned at: [x, y, z]
   Target position: x y z
   ```

If spheres don't appear, check:
- Is SpherePrefab assigned in TargetManager?
- Is SpherePrefab set to active=false initially?

### 3. Test Target Collisions

1. Add collision-debug to SpherePrefab
2. Start Target Drill
3. Move controller through a sphere
4. Check console for "COLLISION ENTER" messages

If no collision messages:
- ❌ Missing collision component on controller or target
- ❌ Collision groups might be blocking each other
- ❌ Physics not enabled in project

### 4. Test Hit Registration

When collision IS detected but hits don't register:

Check `controller-hit.js` console logs:
```javascript
console.log(`${this.hand} hand hit a target!`);
```

If this appears but hit count doesn't increase:
- Check if target-collision.onHit() is called
- Check if target.hit is already true (duplicate hit prevention)
- Check if manager is linked properly

---

## Common Issues

### "I see spheres but can't hit them"

**Diagnosis:**
- Spheres spawn ✓
- Controllers visible ✓
- No collision happening ✗

**Solution:**
1. Controllers missing collision component
2. Add collision to both ControllerLeft and ControllerRight
3. Make sure collision extents aren't 0

### "Collisions detected but no hit count"

**Diagnosis:**
- Console shows "COLLISION ENTER" ✓
- Console shows "hand hit a target!" ✓
- Hit count stays 0 ✗

**Solution:**
1. Check if target has target-collision component
2. Check if target-collision.manager is set
3. Check if TargetManager.onTargetHit() is called:
   ```javascript
   // Add to target-collision.js onHit():
   console.log('[TargetCollision] onHit called, manager:', this.manager);
   ```

### "Controller passes through spheres"

**Diagnosis:**
- Both have collision components ✓
- No collision events firing ✗

**Solution:**
1. Check collision groups - make sure they can collide
2. Collision groups 1 and 2 should collide by default
3. In Project Settings → Physics, check collision matrix
4. Make sure extents aren't 0 or too small

### "Beam walk: I fall through floor but don't respawn"

**Diagnosis:**
- Beam walk drill started ✓
- Fall below floor ✓
- No teleport back ✗

**Solution:**
1. Check console for "[BeamWalk] FALL detected"
2. If not appearing:
   - headObject not set → Manager will auto-find it
   - resetHeight too low (default -2.0, try -1.0)
3. Check if startPosition is linked in BeamWalkManager
4. Check console: "[BeamWalk] Head object set: EyeLeft"
5. Check console for teleport messages: "[BeamWalk] Teleporting - Head offset: [x, 0, z]"

**New Fix (v2):**
The component now calculates the VR head offset from the Player root and compensates during teleportation. Your camera will now properly appear at the start position after a fall!

Console logs to look for:
- `[BeamWalk] Head offset:` - Shows XZ offset compensation
- `[BeamWalk] Target head pos:` - Where your head should end up
- `[BeamWalk] Setting player to:` - Adjusted player position

---

## Quick Reference

### Required Components

**ControllerLeft & ControllerRight:**
- ✅ collision (sphere/box, extents ~0.05)
- ✅ controller-hit (hand: left/right)

**SpherePrefab (Target):**
- ✅ collision (sphere, extents ~0.15)
- ✅ mesh (with material)
- ✅ target-collision (auto-added by TargetManager)

**BeamWalkManager Object:**
- ✅ beam-walk-manager component
  - playerObject → Player
  - headObject → (leave empty for auto-find)
  - startPosition → beam start point
  - endPosition → beam end point

---

## Build and Test

1. Make changes in Wonderland Editor
2. **Ctrl+B** to build
3. Deploy to Quest
4. Open browser console (F12) on PC
5. Connect Quest via USB and check **chrome://inspect** for device logs

---

## Summary of Changes

### Files Modified:
1. **js/beam-walk-manager.js**
   - Added `headObject` property
   - Added auto-find head logic
   - Uses head position instead of player root for fall detection

2. **js/collision-debug.js** (NEW)
   - Diagnostic component for debugging collisions
   - Shows collision events in console
   - Lists all components on objects

3. **js/index.js**
   - Registered CollisionDebug component

### Editor Configuration Required:
1. Add collision components to controllers
2. Add controller-hit components to controllers
3. Verify SpherePrefab has collision component
4. Optional: Add collision-debug for testing

---

**Next Steps:**
1. ✅ Add collision to controllers
2. ✅ Add controller-hit to controllers
3. ✅ Verify target prefab has collision
4. ✅ Build and test!
