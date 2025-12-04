# Quick Fix: Make Cursor Rays Visible & Moving

## The Problem

You see no cursor rays from your VR controllers, and they don't move when you move the controllers.

---

## Most Likely Causes

### 1. Not Testing in VR Mode ⚠️ MOST COMMON
- Cursor rays only appear in **VR mode on Meta Quest**
- They won't appear on desktop in the editor
- Your cursors have `vr-mode-active-switch` component

**Fix:** Deploy to Meta Quest and test there!

### 2. Material Is Invisible/Transparent
- Ray mesh exists but material is wrong
- Material might be null, transparent, or black

**Fix:** Assign a bright emissive material

### 3. Scale Is Too Small
- Ray exists but is microscopic
- Scale Y might be 0.001 instead of 0.35

**Fix:** Increase scale Y value

---

## Quick Diagnostic (In Wonderland Editor)

### Step 1: Find the Ray Mesh Objects

1. Open scene hierarchy
2. Expand **TrackedSpace**
3. Find **CursorLeft** → expand it
4. Find **CursorRayLeft** → expand it  
5. Find **CursorRayMeshLeft** (or similar)

Repeat for **CursorRight** → **CursorRayRight** → **CursorRayMeshRight**

### Step 2: Check Each Ray Mesh

Select **CursorRayMeshLeft**, check Properties panel:

```
✅ Component: mesh
   ├── mesh: Should be Cylinder or similar (not null)
   └── material: Should be assigned (not null)

✅ Transform:
   ├── Scale: [~0.005, ~0.35, ~0.005]
   │          ↑ This Y value controls length
   └── Active: ✅ (checkbox checked)

✅ Parent: Should be CursorRayLeft or similar
```

### Step 3: Fix Material If Null/Wrong

If material is null or invisible:

1. Right-click in Resources → New → Material
2. Name it: `BrightCursorMaterial`
3. Configure:
   - **Pipeline:** Flat Opaque
   - **FlatColor:** Choose bright cyan `#00FFFF` or white `#FFFFFF`
   - **Alpha:** 1.0
4. Drag material onto **CursorRayMeshLeft** and **CursorRayMeshRight**

### Step 4: Fix Scale If Too Small

If Scale Y is < 0.1:

1. Select **CursorRayMeshLeft**
2. In Transform, change Scale Y to **0.35** or **0.5**
3. Repeat for **CursorRayMeshRight**

---

## Quick Fix Script (Add This Temporarily)

Add this to your scene to auto-fix common issues:

### Create: `js/cursor-fix.js`

```javascript
import {Component} from '@wonderlandengine/api';

export class CursorFix extends Component {
    static TypeName = 'cursor-fix';

    start() {
        console.log('[CursorFix] Checking and fixing cursor rays...');
        
        // Find ray mesh objects
        const rayMeshLeft = this.findRayMesh('CursorLeft');
        const rayMeshRight = this.findRayMesh('CursorRight');
        
        if (rayMeshLeft) this.fixRayMesh(rayMeshLeft, 'LEFT');
        if (rayMeshRight) this.fixRayMesh(rayMeshRight, 'RIGHT');
    }

    findRayMesh(cursorName) {
        const cursor = this.engine.scene.findByName(cursorName)[0];
        if (!cursor) return null;
        
        // Check cursor's children and grandchildren
        for (let child of cursor.children) {
            // Check if this child has mesh
            if (child.getComponent('mesh')) return child;
            
            // Check grandchildren
            for (let grandchild of child.children) {
                if (grandchild.getComponent('mesh')) return grandchild;
            }
        }
        
        return null;
    }

    fixRayMesh(rayMeshObj, side) {
        console.log(`[CursorFix] Fixing ray for ${side}...`);
        
        // Check scale
        const scale = rayMeshObj.getScalingLocal();
        if (scale[1] < 0.1) {
            console.log(`[CursorFix] Scale Y too small (${scale[1]}), fixing...`);
            rayMeshObj.setScalingLocal([0.005, 0.35, 0.005]);
        }
        
        // Ensure active
        if (!rayMeshObj.active) {
            console.log(`[CursorFix] Ray was inactive, activating...`);
            rayMeshObj.active = true;
        }
        
        console.log(`[CursorFix] ${side} ray fixed!`);
    }
}
```

### Register it in `js/index.js`:

```javascript
import {CursorFix} from './cursor-fix.js';
// ...
engine.registerComponent(CursorFix);
```

### Add to Manager object in editor

Then build and test!

---

## Expected Values for Cursor Rays

Based on your project structure:

### CursorRayMeshLeft:
```
Parent: CursorRayLeft (object 209)
Position: [~0, ~0.0002, 0]
Rotation: [0.707, 0, 0, 0.707] (90° rotation)
Scale: [0.005, 0.35, 0.005]
         ↑     ↑     ↑
       thin  length thin
```

### CursorRayMeshRight:
```
Parent: CursorRayRight (object 213)
Position: [~0, ~0.0002, 0]
Rotation: [0.707, 0, 0, 0.707]
Scale: [0.005, 0.35, 0.005]
```

---

## The Real Test: VR Mode

**Remember:** Cursor rays have `vr-mode-active-switch` component!

This means they **ONLY appear in VR mode**.

### To properly test:

1. ✅ Build project in Wonderland Editor (Ctrl+B)
2. ✅ Deploy to Meta Quest
3. ✅ Put on headset
4. ✅ Start VR session
5. ✅ Look at your hands/controllers
6. ✅ Should see bright lines!

### NOT WORKING: Testing on desktop
- ❌ Won't see rays in editor play mode
- ❌ Won't see rays on desktop monitor

---

## Alternative: Create Simple Test Rays

Want to see if rays work at all? Create simple test rays that are always visible:

### On ControllerRight:

1. Right-click **ControllerRight** → Add Object
2. Name it: **TestRay**
3. Add Component → **mesh**
   - mesh: Cylinder
   - material: (any bright material)
4. Set Transform:
   - Position: [0, 0, -1]
   - Rotation: [90, 0, 0]
   - Scale: [0.01, 2, 0.01]

5. **DO NOT** add vr-mode-active-switch

This ray should be visible even on desktop and will move with controller!

---

## Still Not Working?

### Use the Debug Component:

1. Add `cursor-debug.js` component to Manager object
2. Build and deploy
3. Open browser console (F12) on Quest
4. Look at debug output

The debug component will tell you:
- Are cursor objects found?
- Do they have mesh components?
- Are materials assigned?
- What are the scale values?

### Check These Files:

- [`VR-CURSOR-TROUBLESHOOTING.md`](VR-CURSOR-TROUBLESHOOTING.md) - Full troubleshooting guide
- [`VR-CURSOR-QUICK-SETUP.md`](VR-CURSOR-QUICK-SETUP.md) - Setup instructions

---

## Summary Checklist

- [ ] Testing on **Meta Quest** (not desktop)?
- [ ] VR mode is **actually active**?
- [ ] CursorRayMeshLeft/Right objects **exist**?
- [ ] They have **mesh** components?
- [ ] **Material** is assigned and bright?
- [ ] Scale Y is **0.35** or larger?
- [ ] Objects are **active** (not disabled)?
- [ ] Built and deployed **after making changes**?

---

*Most common issue: Testing on desktop instead of VR! Cursor rays only appear in VR mode on Quest.*
