# VR Cursor & Click Interaction Setup Guide

## Overview

This guide shows you how to set up **visible cursor rays** from VR controllers that allow you to **point and click** on UI buttons using the controller trigger.

When properly configured, you will see:
- ✅ Visible lines/rays extending from both VR controllers
- ✅ The ray changes appearance when hovering over clickable objects
- ✅ Clicking with the trigger button activates buttons

---

## Required Components

### For VR Controllers (ControllerLeft & ControllerRight)

Each controller needs a **`cursor`** component to enable raycasting and visual cursor rays.

### For Each UI Button

Each clickable button needs:
1. **`collision`** component - defines the clickable area
2. **`cursor-target`** component - enables cursor interaction
3. **`ui-cursor-button`** component - handles the button action

---

## Step-by-Step Setup in Wonderland Editor

### Part 1: Enable Cursor on VR Controllers

1. **Open your project in Wonderland Editor**

2. **Find ControllerRight in the scene hierarchy**

3. **Add the Cursor Component:**
   - Select `ControllerRight`
   - Click "Add Component"
   - Search for and add: **`cursor`**
   
4. **Configure the Cursor Component:**
   - **cursorObject**: Leave empty or create a small sphere/cone mesh to show the cursor dot
   - **handedness**: Select `right` (for right controller)
   - **rayCastMode**: `collision` (default - uses collision components for detection)
   - **cursorRayScalingAxis**: `2` (Z-axis - makes the ray extend forward)
   - **cursorRayObject**: This will hold the visual ray/line (see Part 2)
   
5. **Repeat for ControllerLeft:**
   - Select `ControllerLeft`
   - Add **`cursor`** component
   - Set **handedness**: `left`
   - Configure other settings the same way

### Part 2: Create Visible Cursor Rays

The cursor rays are the visible lines that extend from your controllers.

#### Option A: Using a Cylinder as the Ray (Recommended)

1. **Create a child object under ControllerRight:**
   - Right-click `ControllerRight` → Add Object → Empty Object
   - Name it: `CursorRay`

2. **Add a Mesh Component to CursorRay:**
   - Select `CursorRay`
   - Add Component → **`mesh`**
   - **mesh**: Select `Cylinder` (primitive)
   - **material**: Select a bright emissive material (white, cyan, or green works well)

3. **Position & Scale the Ray:**
   - **Transform**:
     - Position: `[0, 0, -2]` (extends 2 meters forward)
     - Rotation: `[90, 0, 0]` (rotates cylinder to point forward)
     - Scale: `[0.005, 2, 0.005]` (thin line, 2m long)

4. **Assign Ray to Cursor:**
   - Select `ControllerRight`
   - In the **`cursor`** component:
     - **cursorRayObject**: Drag the `CursorRay` object here

5. **Repeat for ControllerLeft:**
   - Create `CursorRay` child under `ControllerLeft`
   - Configure the same way
   - Assign to the left controller's cursor component

#### Option B: Using a Line Renderer (More Advanced)

If you prefer a thinner, shader-based line:
1. Create a custom material with an emissive shader
2. Use a thin quad or custom mesh
3. Assign to cursorRayObject as above

### Part 3: Setup UI Buttons for Cursor Interaction

For each button in your menu:

1. **Select the button object in hierarchy**

2. **Add Collision Component:**
   - Add Component → **`collision`**
   - **collider**: Select `box` or `sphere` 
   - Adjust the **extents** to match your button size
   - You should see a green outline showing the collision area

3. **Add Cursor-Target Component:**
   - Add Component → **`cursor-target`**
   - This allows the cursor to detect and interact with the button

4. **Add UI Cursor Button Component:**
   - Add Component → **`ui-cursor-button`**
   - **action**: Select the button action from dropdown (e.g., "Start Target Drill")
   - **debugMode**: `true` (enable for testing)

5. **Verify Setup:**
   - Your button should now have 3 components:
     - ✅ collision
     - ✅ cursor-target
     - ✅ ui-cursor-button

### Part 4: Adjust Cursor Appearance (Optional)

#### Create a Cursor Dot:

1. **Create a child object under ControllerRight:**
   - Name it: `CursorDot`

2. **Add a Mesh:**
   - Add Component → **`mesh`**
   - **mesh**: Select `Sphere` (primitive)
   - **material**: Bright emissive material
   - **Scale**: `[0.01, 0.01, 0.01]` (small dot)

3. **Assign to Cursor:**
   - Select `ControllerRight`
   - In **`cursor`** component:
     - **cursorObject**: Drag the `CursorDot` object here

4. **Repeat for ControllerLeft**

---

## Testing Your Setup

### In Editor (Play Mode):

1. **Build the project** (File → Build Project or Ctrl+B)

2. **Click the Play button** (you'll be in desktop mode)
   - Desktop testing won't show cursors properly
   - You need to test in VR

### On Meta Quest:

1. **Deploy to Quest:**
   - File → Deploy
   - Or upload to Wonderland Cloud

2. **Put on the headset**

3. **Look for the cursor rays:**
   - You should see lines extending from both controllers
   - Point at a UI button
   - The ray should change color/appearance when hovering
   - The button might highlight or respond

4. **Pull the trigger button to click**
   - The button's action should execute
   - Check console logs if debugMode is enabled

---

## Troubleshooting

### Problem: I don't see cursor rays

**Solutions:**
- ✅ Verify `cursorRayObject` is assigned in the cursor component
- ✅ Check that CursorRay mesh is active and has a visible material
- ✅ Ensure the cylinder is rotated and scaled correctly
- ✅ Try a brighter emissive material
- ✅ Check if the CursorRay object is a child of the controller

### Problem: Cursor rays are visible but buttons don't respond

**Solutions:**
- ✅ Verify buttons have **collision** components (you should see green outlines)
- ✅ Verify buttons have **cursor-target** components
- ✅ Check collision extents match the button size
- ✅ Enable debugMode on ui-cursor-button to see console logs
- ✅ Rebuild the project after making changes

### Problem: Cursor ray is too short/long

**Solution:**
- Adjust the **Scale** of the CursorRay object:
  - Scale Y controls the length: `[0.005, 5, 0.005]` for 5m ray
  - Also adjust Position Z: half of Scale Y (e.g., `[0, 0, -2.5]` for 5m)

### Problem: Cursor ray points in wrong direction

**Solution:**
- Adjust the **Rotation** of the CursorRay object:
  - Try `[90, 0, 0]` or `[-90, 0, 0]`
  - The cylinder should point along the controller's forward direction

### Problem: Buttons click multiple times

**Solution:**
- The `cursor-target` component has built-in click handling
- Make sure you're only using `onClick` events, not `onDown` repeatedly
- Add a cooldown if needed in your button component

### Problem: Ray doesn't change when hovering over buttons

**Solutions:**
- The cursor component has properties for hover materials
- In the cursor component on the controller:
  - **cursorRayActiveMaterial**: Set a different material for when hovering
  - Or adjust the default cursor behavior

---

## Example Scene Hierarchy

```
Scene Root
├── Player
│   ├── NonVrCamera (desktop)
│   ├── EyeLeft (VR)
│   ├── EyeRight (VR)
│   │
│   ├── ControllerRight
│   │   ├── Components:
│   │   │   ├── input (already exists)
│   │   │   ├── cursor (ADD THIS)
│   │   │       ├── handedness: right
│   │   │       ├── cursorObject: CursorDot
│   │   │       └── cursorRayObject: CursorRay
│   │   ├── CursorRay (child object)
│   │   │   ├── mesh (cylinder)
│   │   │   └── Transform: pos=[0,0,-2], rot=[90,0,0], scale=[0.005,2,0.005]
│   │   └── CursorDot (child object)
│   │       ├── mesh (sphere)
│   │       └── Scale: [0.01, 0.01, 0.01]
│   │
│   └── ControllerLeft
│       ├── Components:
│       │   ├── input (already exists)
│       │   ├── cursor (ADD THIS)
│       │       ├── handedness: left
│       │       ├── cursorObject: CursorDot
│       │       └── cursorRayObject: CursorRay
│       ├── CursorRay (child object)
│       └── CursorDot (child object)
│
├── UI Menu
│   ├── ButtonPlane_Tennis
│   │   ├── mesh (plane with texture)
│   │   ├── collision (box, extents match button)
│   │   ├── cursor-target (enables cursor interaction)
│   │   └── ui-cursor-button (action: Tennis Environment)
│   │
│   ├── ButtonPlane_StartTarget
│   │   ├── mesh
│   │   ├── collision
│   │   ├── cursor-target
│   │   └── ui-cursor-button (action: Start Target Drill)
│   │
│   └── ... (other buttons)
│
└── Manager
    └── game-selector (component)
```

---

## Tips & Best Practices

### Cursor Ray Appearance:

- **Color**: Use bright colors (white, cyan, green) for visibility
- **Emissive**: Enable emissive on the material so it glows
- **Length**: 2-5 meters is usually good for VR
- **Thickness**: Very thin (0.005) for a laser-like appearance

### Button Collision Setup:

- Make collision slightly larger than the visual button
- Use `box` collider for rectangular buttons
- Use `sphere` collider for circular buttons
- Test the green collision outline in editor

### Performance:

- The cursor component uses raycasting, which is performant
- Don't worry about having multiple buttons with collision
- Cursor raycasting in Wonderland Engine is optimized

### Visual Feedback:

- Consider adding hover effects to buttons:
  - Change material color on hover
  - Scale up slightly
  - Play a subtle sound
- Use the cursor-target events: `onHover`, `onUnhover`, `onClick`

---

## Differences from Distance-Based Buttons

| Feature | Distance-Based (old) | Cursor-Based (new) |
|---------|---------------------|-------------------|
| **Visual feedback** | None | Visible cursor ray |
| **Precision** | Must get very close | Point from distance |
| **VR-friendly** | Less intuitive | Standard VR interaction |
| **Trigger required** | No | Yes (pull trigger) |
| **Range** | Short (0.5m) | Long (2-5m) |
| **Setup complexity** | Simpler | More components needed |

---

## Migration from ui-plane-button to ui-cursor-button

If you're currently using `ui-plane-button`:

1. **Keep the old component** if you want distance-based as fallback
2. **Or replace it** with the new cursor-based system:
   - Remove `ui-plane-button` from buttons
   - Add `collision`, `cursor-target`, `ui-cursor-button` (as described above)
   - Add `cursor` to both controllers

Both systems can coexist if needed!

---

## Additional Resources

- Wonderland Engine Documentation: [Handling 3D Cursor Clicks](https://wonderlandengine.com/tutorials/handling-3d-cursor-clicks/)
- Component Reference: `cursor`, `cursor-target`, `collision`
- Your project: See `js/ui-cursor-button.js` for implementation

---

*Last Updated: December 1, 2025*
