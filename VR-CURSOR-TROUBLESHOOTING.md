# VR Cursor Troubleshooting - Rays Not Moving

## Problem: Cursor Rays Don't Move with Controllers

You've reported that the cursor rays don't move with the VR controllers. This is a **parenting and input configuration issue**.

---

## Root Cause

Your cursor objects are currently:
- **Parented to TrackedSpace** (not the controllers)
- Using **"ray left"/"ray right"** input (which provides hand tracking ray origin)
- This means they stay in place instead of following the controllers

---

## Solution Options

### Option A: Keep Current Setup (Input-Driven Rays) ✅ RECOMMENDED

The cursors are designed to use XR input system's ray positioning. This is actually correct for hand tracking and controller rays in WebXR.

**What might be wrong:**
1. The cursor rays might not have visible materials
2. The scale might be too small
3. VR mode might not be active

**Fix:**

1. **Check Cursor Ray Visibility in Wonderland Editor:**
   - Find `CursorRayMeshLeft` and `CursorRayMeshRight` objects
   - Make sure they have **mesh** components
   - Make sure **material** is bright/emissive (not transparent)
   - Check the **scale** - should be visible (Y-axis around 0.35)

2. **Verify VR Mode is Active:**
   - Cursors have `vr-mode-active-switch` component
   - They only activate in VR mode
   - Test on Meta Quest, not desktop!

3. **Check Material Settings:**
   - Material should be **unlit** or **emissive**
   - Color should be bright (white, cyan, green)
   - Alpha should be 1.0 (fully opaque)

---

### Option B: Reparent Cursors to Controllers (Manual Fix)

If you want the cursors to be children of the controllers:

**In Wonderland Editor:**

1. **Move CursorLeft:**
   - Drag `CursorLeft` object
   - Drop it onto `ControllerLeft` (make it a child)
   - Change input type from "ray left" to "hand left" in the cursor component

2. **Move CursorRight:**
   - Drag `CursorRight` object
   - Drop it onto `ControllerRight` (make it a child)
   - Change input type from "ray right" to "hand right" in the cursor component

3. **Adjust Position:**
   - Select each cursor
   - Set local position to `[0, 0, 0]` (at controller origin)

---

## Quick Diagnostic Checklist

### Are you testing in VR?
- [ ] Testing on Meta Quest (not desktop)?
- [ ] VR mode is active?
- [ ] Controllers are being tracked?

### Check Cursor Ray Mesh Objects:

**CursorRayMeshLeft (object 209 or child):**
- [ ] Has mesh component?
- [ ] Material assigned?
- [ ] Material is visible (not transparent)?
- [ ] Scale Y is around 0.35 (visible length)?
- [ ] Active in hierarchy?

**CursorRayMeshRight (object 213 or child):**
- [ ] Has mesh component?
- [ ] Material assigned?
- [ ] Material is visible (not transparent)?
- [ ] Scale Y is around 0.35 (visible length)?
- [ ] Active in hierarchy?

### Check Cursor Components:

**CursorLeft:**
- [ ] Has `cursor` component?
- [ ] Has `input` component (type: "ray left")?
- [ ] Has `vr-mode-active-switch` component?
- [ ] `cursorRayObject` points to correct object (209)?

**CursorRight:**
- [ ] Has `cursor` component?
- [ ] Has `input` component (type: "ray right")?
- [ ] Has `vr-mode-active-switch` component?
- [ ] `cursorRayObject` points to correct object (213)?

---

## Testing Steps

### 1. Desktop Test (Limited):
```
In Wonderland Editor:
1. Select CursorRayMeshLeft
2. Check if mesh component exists
3. Check material assignment
4. Look at viewport - is the mesh visible at all?
```

### 2. VR Test (Full):
```
1. Build project (Ctrl+B)
2. Deploy to Meta Quest
3. Put on headset
4. Enter VR mode
5. Look at your controllers
6. Look around the scene for any visible rays
```

---

## Common Issues & Fixes

### Issue 1: Rays Never Visible (Even in VR)

**Cause:** Material is transparent or missing

**Fix:**
```
1. In Wonderland Editor, find CursorRayMeshLeft/Right
2. Select the object
3. Check mesh component → material property
4. If null/empty, assign a material
5. Edit material:
   - Make it unlit or emissive
   - Set color to bright (e.g., #00FFFF cyan)
   - Set alpha to 1.0
```

### Issue 2: Rays Visible But Don't Move

**Cause:** VR mode not active, or incorrect input type

**Fix:**
```
Option 1 - Ensure VR Mode:
- Test on Quest, not desktop
- Enter VR session properly

Option 2 - Reparent to Controllers:
- Make CursorLeft/Right children of ControllerLeft/Right
- Change input type to match controller input
```

### Issue 3: Rays Are Tiny/Invisible

**Cause:** Scale too small

**Fix:**
```
1. Select CursorRayMeshLeft/Right
2. Check Scale property
3. Increase Y-axis scale to 0.35 or higher
4. X and Z should be ~0.005 (thin line)
```

### Issue 4: Controllers Work But No Rays

**Cause:** vr-mode-active-switch prevents activation

**Fix:**
```
1. Check if CursorLeft/Right have vr-mode-active-switch
2. Verify VR session is properly initiated
3. Try temporarily removing vr-mode-active-switch to test
```

---

## Quick Material Setup

If your cursor rays have no material or wrong material:

### Create a Bright Cursor Material:

1. **In Wonderland Editor:**
   - Right-click in Resources → New → Material
   - Name it: `CursorRayMaterial`

2. **Configure Material:**
   - **Pipeline:** Flat Opaque or Unlit
   - **FlatColor** or **BaseColor**: `#00FFFF` (cyan) or `#FFFFFF` (white)
   - **Alpha**: 1.0 (fully opaque)
   - Save

3. **Assign to Rays:**
   - Select `CursorRayMeshLeft`
   - In mesh component, drag `CursorRayMaterial` to material slot
   - Repeat for `CursorRayMeshRight`

---

## Expected Behavior

### When Working Correctly:

**In VR (Meta Quest):**
- 👀 You see two bright lines extending from your hands
- 🎮 Lines move as you move controllers
- 👉 Lines point where controllers point
- 🎯 Lines can hit objects and trigger interactions

**Current State (Not Working):**
- ❌ No visible lines
- ❌ Or lines exist but don't move

---

## Debug Console Output

Enable debug mode and check console:

```javascript
// Add this temporarily to ui-plane-button for testing
start() {
    console.log('[DEBUG] Checking cursors...');
    const cursorLeft = this.engine.scene.findByName('CursorLeft')[0];
    const cursorRight = this.engine.scene.findByName('CursorRight')[0];
    
    console.log('[DEBUG] CursorLeft:', cursorLeft ? 'Found' : 'NOT FOUND');
    console.log('[DEBUG] CursorRight:', cursorRight ? 'Found' : 'NOT FOUND');
    
    if (cursorLeft) {
        const cursorComp = cursorLeft.getComponent('cursor');
        console.log('[DEBUG] CursorLeft has cursor component:', !!cursorComp);
    }
}
```

---

## Alternative: Create New Cursor Rays from Scratch

If the existing setup is too complex, you can create new visible rays:

### Quick Ray Setup:

1. **Create child under ControllerRight:**
   ```
   Right-click ControllerRight → Add Object → Name: "VisualRay"
   ```

2. **Add mesh to VisualRay:**
   ```
   - Add Component → mesh
   - Mesh: Cylinder (primitive)
   - Material: Bright/emissive material
   ```

3. **Set Transform:**
   ```
   Position: [0, 0, -1]
   Rotation: [90, 0, 0]
   Scale: [0.01, 2, 0.01]
   ```

4. **Test:**
   - This ray should now be visible and move with controller
   - Repeat for ControllerLeft

---

## Next Steps

1. **Verify in Editor:**
   - Check if CursorRayMesh objects have visible meshes
   - Look for material assignments
   - Check scale values

2. **Test in VR:**
   - Build and deploy
   - Put on Quest
   - Look at controllers in VR
   - Try different angles

3. **Report Back:**
   - Do you see ANY geometry where rays should be?
   - Are controllers tracking properly?
   - Is VR mode activating?

---

## Material ID Reference

Your project uses:
- Material "128" for cursor rays (check what this material is)
- Mesh "10" for the ray mesh (cylinder)

Check Material 128 in your project:
- Is it visible?
- Is it emissive?
- What color is it?

---

*Cursor rays not moving usually means parenting issue or VR mode not active. Check these first!*
