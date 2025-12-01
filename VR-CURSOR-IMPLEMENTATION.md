# Implementation Steps for VR Cursor Click System

## Overview
This document provides the exact implementation steps to enable VR controller cursor clicks in Wonderland Engine.

---

## Phase 1: Code Setup ✅ COMPLETE

### Files Created:
- [x] `js/ui-cursor-button.js` - New cursor-based button component
- [x] Component imported in `js/index.js`
- [x] Component registered in `js/index.js`

### What the Code Does:
- Listens for `onClick` events from `cursor-target` component
- Executes button actions (switch environment, start drills, etc.)
- Provides debug logging for troubleshooting

---

## Phase 2: Wonderland Editor Setup (YOU NEED TO DO THIS)

### Step 1: Add Cursor Component to Controllers

#### On ControllerRight:
1. Open `project.wlp` in Wonderland Editor
2. Navigate to: `Player → ControllerRight`
3. Click "Add Component" → Search for **`cursor`**
4. Configure cursor component:
   - **handedness**: `right`
   - **rayCastMode**: `collision`
   - **cursorRayScalingAxis**: `2`

#### On ControllerLeft:
1. Navigate to: `Player → ControllerLeft`
2. Add **`cursor`** component
3. Configure:
   - **handedness**: `left`
   - **rayCastMode**: `collision`
   - **cursorRayScalingAxis**: `2`

### Step 2: Create Visual Cursor Rays

#### For ControllerRight:

1. **Create CursorRay child object:**
   - Right-click `ControllerRight` → Add Object
   - Name: `CursorRay`

2. **Add mesh to CursorRay:**
   - Select `CursorRay`
   - Add Component → **`mesh`**
   - **mesh**: `Cylinder` (primitive)
   - **material**: Select a bright/emissive material (white, cyan, etc.)

3. **Set Transform:**
   ```
   Position: [0, 0, -2]
   Rotation: [90, 0, 0]
   Scale: [0.005, 4, 0.005]
   ```

4. **Link to cursor component:**
   - Select `ControllerRight`
   - In the `cursor` component:
   - **cursorRayObject**: Drag `CursorRay` object here

#### For ControllerLeft:
- Repeat the exact same process for `ControllerLeft`

### Step 3: Add Optional Cursor Dot (Recommended)

#### For each controller:

1. **Create CursorDot child object:**
   - Right-click controller → Add Object
   - Name: `CursorDot`

2. **Add mesh:**
   - Select `CursorDot`
   - Add Component → **`mesh`**
   - **mesh**: `Sphere` (primitive)
   - **material**: Bright/emissive material

3. **Set Scale:**
   ```
   Scale: [0.01, 0.01, 0.01]
   ```

4. **Link to cursor:**
   - Select controller
   - In `cursor` component:
   - **cursorObject**: Drag `CursorDot` object here

### Step 4: Configure UI Buttons

For EACH button in your menu (repeat for all buttons):

1. **Add collision component:**
   - Select button object (e.g., `ButtonPlane_Tennis`)
   - Add Component → **`collision`**
   - **collider**: `box`
   - **extents**: Adjust to match button size (e.g., `[0.2, 0.1, 0.01]`)
   - You should see a **green outline** in the editor

2. **Add cursor-target component:**
   - Still on the button object
   - Add Component → **`cursor-target`**
   - No configuration needed

3. **Add or replace ui-cursor-button component:**
   
   **Option A - Add alongside existing:**
   - Add Component → **`ui-cursor-button`**
   - Keep existing `ui-plane-button` if present
   
   **Option B - Replace old system:**
   - Remove `ui-plane-button` component
   - Add Component → **`ui-cursor-button`**

4. **Configure ui-cursor-button:**
   - **action**: Select from dropdown (e.g., "Start Target Drill")
   - **debugMode**: `true` (for testing)

### Step 5: Verify Scene Structure

Check that your hierarchy looks like this:

```
Player
├── ControllerRight
│   ├── [Components]
│   │   ├── input ✓ (already exists)
│   │   └── cursor ← YOU ADDED THIS
│   ├── CursorRay ← YOU ADDED THIS
│   │   └── mesh (cylinder)
│   └── CursorDot ← OPTIONAL
│       └── mesh (sphere)
│
└── ControllerLeft
    ├── [Components]
    │   ├── input ✓ (already exists)
    │   └── cursor ← YOU ADDED THIS
    ├── CursorRay ← YOU ADDED THIS
    └── CursorDot ← OPTIONAL

UI Menu
├── ButtonPlane_Tennis
│   ├── collision ← YOU ADDED THIS
│   ├── cursor-target ← YOU ADDED THIS
│   └── ui-cursor-button ← YOU ADDED THIS
│
├── ButtonPlane_Football
│   ├── collision ← YOU ADDED THIS
│   ├── cursor-target ← YOU ADDED THIS
│   └── ui-cursor-button ← YOU ADDED THIS
│
└── ... (repeat for all buttons)
```

---

## Phase 3: Build & Deploy

### Build the Project:
1. In Wonderland Editor: **File → Build Project** (or Ctrl+B)
2. Wait for build to complete
3. Check console for any errors

### Deploy to Meta Quest:
1. Connect Meta Quest to PC via USB or use Wonderland Cloud
2. Deploy the build
3. Put on headset and test

---

## Phase 4: Testing

### What You Should See:
- ✅ Visible rays extending from both controllers
- ✅ Rays are bright and clearly visible
- ✅ When pointing at a button, the cursor changes (if configured)
- ✅ Pulling trigger clicks the button
- ✅ Button action executes (environment changes, drill starts, etc.)

### Debug Testing:
1. Check browser console (F12) for logs:
   - Button initialization messages
   - Hover/unhover messages
   - Click messages

2. If something doesn't work:
   - Refer to `VR-CURSOR-CHECKLIST.md`
   - Check troubleshooting in `VR-CURSOR-SETUP-GUIDE.md`

---

## Quick Reference: Button List to Configure

Apply collision + cursor-target + ui-cursor-button to these objects:

- [ ] ButtonPlane_Tennis (action: Tennis Environment)
- [ ] ButtonPlane_Football (action: Football Environment)
- [ ] ButtonPlane_Gym (action: Gym Environment)
- [ ] ButtonPlane_StartTarget (action: Start Target Drill)
- [ ] ButtonPlane_StartBeam (action: Start Beam Walk)
- [ ] ButtonPlane_StartBall (action: Start Ball Catching)
- [ ] ButtonPlane_Stop (action: Stop All Drills)
- [ ] ButtonPlane_Report (action: Show Report)

*(Adjust names based on your actual button object names)*

---

## Estimated Time

- **Controller setup** (both): 5 minutes
- **Cursor ray creation**: 5 minutes
- **Button configuration** (8 buttons): 15 minutes
- **Build & deploy**: 3 minutes
- **Testing**: 5 minutes

**Total: ~30 minutes**

---

## Success Criteria

You've successfully implemented VR cursor clicks when:

1. ✅ You can see bright laser rays from both controllers in VR
2. ✅ The rays extend forward from the controllers (not pointing weird directions)
3. ✅ When you point at a button, something happens (cursor changes, button highlights)
4. ✅ Pulling the trigger clicks the button
5. ✅ The button's action executes correctly
6. ✅ All buttons work with both controllers
7. ✅ No console errors related to cursor or buttons

---

## Need Help?

Refer to these documents in order:

1. **Quick overview**: `VR-CURSOR-SUMMARY.md`
2. **Detailed setup**: `VR-CURSOR-SETUP-GUIDE.md`
3. **Visual examples**: `VR-CURSOR-VISUAL-GUIDE.md`
4. **Verification**: `VR-CURSOR-CHECKLIST.md`

---

## Next Steps After Implementation

Once working, you can:
- Adjust cursor ray length (change `CursorRay` scale Y)
- Change cursor ray color (use different material)
- Add hover effects to buttons (use cursor-target events)
- Add haptic feedback on click
- Create additional clickable objects beyond buttons

---

*Implementation Guide - December 1, 2025*
