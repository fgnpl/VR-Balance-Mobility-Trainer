# Collision Groups Setup Guide

## Problem: Targets in ALL groups instead of ONE group

Your TargetSphere has all groups checked (0-7), which prevents proper collision detection.

---

## Quick Fix (2 minutes)

### Step 1: Fix TargetSphere Prefab

1. **In Wonderland Editor:**
   - Go to **Asset Browser** → **assets** folder
   - Find **TargetSphere** prefab
   - **Double-click** to open it (or right-click → Edit)

2. **In Properties Panel:**
   - Find the **collision** component
   - Look for the **groups** section (shows checkboxes 0-7)

3. **UNCHECK all boxes EXCEPT one:**
   ```
   ❌ 0 - static
   ✅ 1 - dynamic    ← Check ONLY this one
   ❌ 2 - ui
   ❌ 3 - nav
   ❌ 4 - player
   ❌ 5 - enemy
   ❌ 6 - group6
   ❌ 7 - group7
   ```

4. **Save the prefab:**
   - File → Save (or Ctrl+S)

---

### Step 2: Check Controller Groups

1. **In Scene Outline:**
   - Expand **Player** object
   - Find **ControllerLeft** (or similar name)

2. **In Properties Panel:**
   - Find the **collision** component
   - Look for the **groups** section

3. **Make sure controllers are in a DIFFERENT group:**
   ```
   ✅ 0 - static     ← Controllers should be in group 0
   ❌ 1 - dynamic    ← (or any OTHER group than targets)
   ❌ 2 - ui
   ❌ 3 - nav
   ❌ 4 - player
   ❌ 5 - enemy
   ❌ 6 - group6
   ❌ 7 - group7
   ```

4. **Repeat for ControllerRight**

---

### Step 3: Verify Collision Matrix

1. **Open Project Settings:**
   - Top menu → **File** → **Project Settings**
   - Click **Project Settings** tab

2. **Scroll to Physics section:**
   - Look for the collision groups (0-7)
   - You should see names: static, dynamic, ui, nav, player, enemy, group6, group7

3. **Check the collision matrix:**
   - The grid shows which groups can collide with each other
   - Make sure there's a checkbox between your controller group and target group
   - Example: If controllers are group 0 and targets are group 1, there should be a check at the intersection

---

## Summary of Correct Setup

```
✅ CORRECT:
Controllers:  Group 0 (static)
Targets:      Group 1 (dynamic)

❌ WRONG:
Targets: Groups 0, 1, 2, 3, 4, 5, 6, 7 (ALL checked)
```

---

## Visual Guide

### Before (WRONG) - TargetSphere:
```
groups:
  ✅ 0  ← Too many groups!
  ✅ 1
  ✅ 2
  ✅ 3
  ✅ 4
  ✅ 5
  ✅ 6
  ✅ 7
```

### After (CORRECT) - TargetSphere:
```
groups:
  ❌ 0
  ✅ 1  ← Only ONE group
  ❌ 2
  ❌ 3
  ❌ 4
  ❌ 5
  ❌ 6
  ❌ 7
```

---

## Testing

1. **After fixing the groups:**
   - Save all changes
   - Build project (Ctrl+B)
   - Deploy to Quest

2. **Test in VR:**
   - Start Target Drill
   - Try to hit a target with controller
   - Check console for collision messages

3. **Expected console output:**
   ```
   [ControllerHit] 🔵 right collision DETECTED with: TargetSphere
   [ControllerHit] Other object has target-collision? true
   [ControllerHit] 🎯 right hand hit a target!
   [TargetCollision] onHit called! hit: false
   [TargetCollision] Registering hit with manager, RT: 1.234
   ```

---

## Alternative: Use Different Groups

If you want to use different groups, that's fine! Just make sure:

**Option A:**
- Controllers: Group 0
- Targets: Group 1

**Option B:**
- Controllers: Group 4 (player)
- Targets: Group 5 (enemy)

**Option C:**
- Controllers: Group 2
- Targets: Group 6

The key rule: **Controllers and targets must be in DIFFERENT groups, and each object should be in only ONE group.**

---

## Why This Matters

PhysX collision groups work like this:

1. **Object's `groups` property** = Which collision group(s) this object belongs to
   - Should usually be **ONE group only**
   - Checking multiple groups can cause unexpected behavior

2. **Collision Matrix** (in Project Settings) = Which groups can collide with each other
   - Defines the relationships between groups
   - Both groups must be allowed to collide in this matrix

3. **Your current issue:**
   - TargetSphere is in ALL 8 groups at once
   - This confuses the physics engine
   - Fix: Put it in only ONE group

---

## Quick Checklist

```
□ Opened TargetSphere prefab
□ Found collision component
□ Unchecked all groups EXCEPT one (e.g., group 1)
□ Saved the prefab
□ Checked ControllerLeft is in a different group
□ Checked ControllerRight is in a different group
□ Verified collision matrix allows these groups to collide
□ Built project (Ctrl+B)
□ Tested collision in VR
```

---

**Expected time: 2 minutes** ⏱️

After this fix, your target collisions will work! 🎯
