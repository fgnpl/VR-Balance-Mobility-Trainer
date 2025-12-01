# Button Configuration Visual Guide

## What You Have vs What You Need

### ✅ Your Current VR Cursor Setup (Already Complete!)

```
TrackedSpace
│
├── CursorLeft ✅
│   ├── [cursor] component ✅
│   ├── [input] ray left ✅
│   ├── [vr-mode-active-switch] ✅
│   └── CursorRayLeft ✅
│       └── CursorRayMeshLeft ✅
│
├── CursorRight ✅
│   ├── [cursor] component ✅
│   ├── [input] ray right ✅
│   ├── [vr-mode-active-switch] ✅
│   └── CursorRayRight ✅
│       └── CursorRayMeshRight ✅
│
├── ControllerLeft ✅
└── ControllerRight ✅
```

**Status: COMPLETE - No changes needed!**

---

### ⚠️ What Your Buttons Need (Only This!)

#### Before (Not Clickable):
```
UI Menu
└── ButtonPlane_Tennis
    └── [mesh] (visual only)
    
❌ Cannot be clicked
❌ Cursor rays go through it
❌ No interaction
```

#### After (Clickable):
```
UI Menu
└── ButtonPlane_Tennis
    ├── [mesh] (visual)
    ├── [collision] ⬅ ADD THIS (defines clickable area)
    ├── [cursor-target] ⬅ ADD THIS (enables cursor interaction)
    └── [ui-plane-button] ⬅ CONFIGURE THIS (action: Tennis Environment)
    
✅ Can be clicked with cursor rays
✅ Trigger button activates it
✅ Executes selected action
```

---

## Step-by-Step for ONE Button

### Example: Tennis Environment Button

1. **Select the button in Wonderland Editor hierarchy**
   ```
   Find: ButtonPlane_Tennis (or whatever your button is named)
   Click to select it
   ```

2. **Add Collision Component**
   ```
   Properties Panel:
   1. Click "Add Component"
   2. Search: collision
   3. Click to add
   
   Configure:
   ├── collider: box
   ├── extents:
   │   ├── X: 0.2  (button width in meters)
   │   ├── Y: 0.1  (button height in meters)
   │   └── Z: 0.01 (very thin!)
   └── group: 1
   
   Result: Green outline appears around button ✅
   ```

3. **Add Cursor-Target Component**
   ```
   Properties Panel:
   1. Click "Add Component"
   2. Search: cursor-target
   3. Click to add
   
   No configuration needed!
   ```

4. **Add or Configure ui-plane-button Component**
   ```
   Properties Panel:
   1. If not already added: Click "Add Component"
   2. Search: ui-plane-button
   3. Click to add (if needed)
   
   Configure:
   ├── action: Tennis Environment (select from dropdown)
   └── debugMode: true ✅
   ```

5. **Verify Button**
   ```
   Check that the button now has:
   ✅ mesh component (was already there)
   ✅ collision component (you added)
   ✅ cursor-target component (you added)
   ✅ ui-plane-button component (configured)
   
   ✅ Green outline visible in editor
   ```

---

## Collision Size Quick Reference

Match the extents to your button size:

```
Small Button (icon):
extents: [0.1, 0.1, 0.01]
┌─────┐
│ 10cm│
│ x   │ Z: 1cm thick
│ 10cm│
└─────┘

Medium Button (standard):
extents: [0.2, 0.1, 0.01]
┌──────────┐
│   20cm   │
│     x    │ Z: 1cm thick
│   10cm   │
└──────────┘

Large Button (prominent):
extents: [0.3, 0.15, 0.01]
┌───────────────┐
│     30cm      │
│       x       │ Z: 1cm thick
│     15cm      │
└───────────────┘
```

**Important:** Always keep Z very small (0.01) since buttons are flat planes!

---

## All 8 Buttons to Configure

Copy this process for each button:

```
1. ButtonPlane_Tennis
   └── Action: Tennis Environment
   
2. ButtonPlane_Football
   └── Action: Football Environment
   
3. ButtonPlane_Gym
   └── Action: Gym Environment
   
4. ButtonPlane_StartTarget
   └── Action: Start Target Drill
   
5. ButtonPlane_StartBeam
   └── Action: Start Beam Walk
   
6. ButtonPlane_StartBall
   └── Action: Start Ball Catching
   
7. ButtonPlane_Stop
   └── Action: Stop All Drills
   
8. ButtonPlane_Report
   └── Action: Show Report
```

*(Adjust button names to match your actual object names)*

---

## Visual: What Happens When You Click

### Before Button Configuration:
```
Controller → Cursor Ray → Button
                          (ray passes through)
                          ❌ Nothing happens
```

### After Button Configuration:
```
Controller → Cursor Ray → Button
                          └── [collision] detects ray
                          └── [cursor-target] receives event
                          └── [ui-cursor-button] executes action
                          ✅ Button activated!
```

---

## Wonderland Editor Screenshots Guide

### Where to Find Components:

1. **Scene Hierarchy** (Left panel)
   - Find your button object here
   - Click to select it

2. **Properties Panel** (Right panel)
   - Shows components on selected object
   - "Add Component" button at the top
   - Configure component properties here

3. **Viewport** (Center)
   - See the green collision outline
   - Verify button position

### Adding a Component:

```
Properties Panel (Right):
┌─────────────────────────────┐
│ ButtonPlane_Tennis          │
├─────────────────────────────┤
│ [+ Add Component]  ← CLICK  │
├─────────────────────────────┤
│ Search: collision           │
│ ├─ collision ← CLICK        │
│ ├─ cursor-target            │
│ └─ ui-cursor-button         │
└─────────────────────────────┘
```

---

## Testing Visual

### In VR - What You'll See:

```
Your View:
         Cursor Ray
Controller ═══════════════════►[Button]
           (visible line)      
           
When pointing at button:
Controller ═══════════════════►[Button]*
           (line/cursor changes)  ^
                                  Highlighted
                                  
When pulling trigger:
Controller ═══════════════════►[Button]
   CLICK!                       Activates!
           
Result:
✅ Environment switches
✅ Drill starts
✅ Action executes
```

---

## Final Checklist Per Button

For each button, verify:

```
ButtonPlane_[Name]
├── Components:
│   ├── ✅ mesh (was already there)
│   ├── ✅ collision (you added)
│   ├── ✅ cursor-target (you added)
│   └── ✅ ui-plane-button (configured)
│       └── ✅ action selected
│       └── ✅ debugMode: true
│
└── Visual Check:
    ├── ✅ Green outline visible in viewport
    └── ✅ Button positioned where player can reach
```

---

## Time per Button

- Find button in hierarchy: **10 sec**
- Add collision: **30 sec**
- Add cursor-target: **15 sec**
- Add ui-cursor-button: **30 sec**
- Verify setup: **15 sec**

**Total per button: ~1.5 minutes**
**8 buttons: ~12-15 minutes**

---

## After Configuring All Buttons

1. **Build**: Ctrl+B in Wonderland Editor
2. **Check console**: No errors
3. **Deploy**: To Meta Quest
4. **Test**: Put on headset, point at buttons, pull trigger
5. **Debug**: Check console logs (debugMode: true)

---

*Everything else is already done - just add 3 components to each button!*
