# Cursor and Cursor Ray Not Visible in VR - DIAGNOSIS & FIX

## 🔍 Issues Found

### 1. **CRITICAL: Missing Component Registration**
The `UiCursorButton` and `CursorDebug` components are **NOT registered in index.js**.

**Files affected:**
- `js/ui-cursor-button.js` - Not registered
- `js/cursor-debug.js` - Not registered

**Impact:** These components will never run, even if attached in the editor.

---

### 2. **Potential Cursor Ray Visibility Issues**

Based on the code analysis, the cursor rays may be invisible due to:

#### A. **VrModeActiveSwitch Component**
- The cursor objects likely have `vr-mode-active-switch` component
- This component toggles objects between VR and desktop mode
- If configured incorrectly, cursors might be hidden in VR

#### B. **Ray Object Scale**
- The `cursor-debug.js` checks for ray scale Y < 0.01
- If the ray mesh scale is too small, it will be invisible

#### C. **Missing cursorRayObject Assignment**
- The Cursor component needs a `cursorRayObject` property set
- If this is null, no ray will be visible

#### D. **Ray Material/Mesh Not Assigned**
- The ray object needs both a mesh component AND a material
- Missing material or mesh = invisible ray

---

## ✅ FIX STEPS

### Step 1: Register Missing Components

**Edit `js/index.js`:**

Add these imports:
```javascript
import {UiCursorButton} from './ui-cursor-button.js';
import {CursorDebug} from './cursor-debug.js';
```

Add these registrations:
```javascript
engine.registerComponent(UiCursorButton);
engine.registerComponent(CursorDebug);
```

### Step 2: Check Cursor Setup in Editor

For **CursorLeft** and **CursorRight** objects:

1. **Cursor Component:**
   - ✅ Verify `cursorRayObject` property is assigned (should point to a child object like "CursorRayLeft")
   - ✅ Set `cursorRayScalingAxis` to Y (vertical scaling)
   - ✅ Set `cursorRayScaleValue` to a reasonable value (e.g., 10.0)

2. **VrModeActiveSwitch Component:**
   - ✅ Set `vrMode` to true (enable in VR)
   - ✅ Set `nonVRMode` to false (disable in desktop)

3. **Input Component:**
   - ✅ Set `type` to "left" or "right" controller

### Step 3: Check Ray Object Setup

For the **CursorRayLeft** and **CursorRayRight** objects (children of cursor objects):

1. **Mesh Component:**
   - ✅ Assign a mesh (usually "PrimitiveCube" or "PrimitiveCylinder")
   - ✅ Assign a material with visible color (e.g., white, cyan, or emissive)

2. **Transform:**
   - ✅ Scale: [0.01, 10.0, 0.01] (thin ray, 10 units long)
   - ✅ Position: [0, 5, 0] (offset forward from controller)

3. **Active State:**
   - ✅ Make sure the object is active (not disabled)

### Step 4: Debug with CursorDebug Component

1. Attach `cursor-debug` component to the **Manager** object
2. Build and deploy to VR
3. Open browser console (F12 in Quest Browser)
4. Check the debug output for issues

---

## 🐛 Common Problems & Solutions

### Problem: "Cursor rays are invisible but cursor clicks work"
**Solution:** 
- Check ray object scale (should be visible, e.g., Y=10)
- Check ray material is assigned and has visible color
- Check ray mesh is assigned

### Problem: "Cursor rays visible in desktop but not VR"
**Solution:**
- Check `vr-mode-active-switch` component settings
- Make sure `vrMode` is set to true

### Problem: "No cursor rays and clicks don't work"
**Solution:**
- Register `UiCursorButton` in index.js
- Add `cursor-target` components to all buttons
- Add `collision` components to all buttons

### Problem: "Cursor debug component doesn't run"
**Solution:**
- Register `CursorDebug` in index.js
- Rebuild and redeploy

---

## 📋 Quick Checklist

- [ ] Register `UiCursorButton` in index.js
- [ ] Register `CursorDebug` in index.js
- [ ] Verify CursorLeft/Right have Cursor component with cursorRayObject assigned
- [ ] Verify CursorLeft/Right have vr-mode-active-switch with vrMode=true
- [ ] Verify ray objects have mesh + material assigned
- [ ] Verify ray objects have reasonable scale (e.g., [0.01, 10, 0.01])
- [ ] All buttons have cursor-target component
- [ ] All buttons have collision component
- [ ] Rebuild project after changes
- [ ] Test in VR with browser console open

---

## 🔧 Manual Ray Visibility Script (Emergency Fix)

If cursors still don't work, add this temporary component to force ray visibility:

```javascript
// force-cursor-rays.js
import {Component} from '@wonderlandengine/api';

export class ForceCursorRays extends Component {
    static TypeName = 'force-cursor-rays';

    start() {
        setTimeout(() => {
            const cursors = ['CursorLeft', 'CursorRight'];
            
            for (const name of cursors) {
                const cursor = this.engine.scene.findByName(name)[0];
                if (cursor) {
                    const cursorComp = cursor.getComponent('cursor');
                    if (cursorComp && cursorComp.cursorRayObject) {
                        const ray = cursorComp.cursorRayObject;
                        ray.active = true;
                        
                        const mesh = ray.getComponent('mesh');
                        if (mesh) {
                            mesh.active = true;
                            console.log(`[ForceCursorRays] Enabled ${name} ray`);
                        }
                    }
                }
            }
        }, 1000);
    }
}
```

Register this component and attach it to Manager object as a last resort.

---

## 📝 Notes

- The Wonderland Engine `Cursor` component handles ray visibility automatically
- Ray visibility is controlled by the `cursorRayScalingAxis` property
- When cursor is active, the ray scales up; when inactive, it scales down
- Make sure the ray's base scale is large enough to be visible when scaled
