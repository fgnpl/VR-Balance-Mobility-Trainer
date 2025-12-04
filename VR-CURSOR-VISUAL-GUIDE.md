# VR Cursor Visual Setup Examples

This document provides visual examples and exact values for setting up VR cursors.

---

## Controller Cursor Component Settings

### ControllerRight - Cursor Component

```
Component: cursor
├── cursorObject: [Drag CursorDot object here]
├── cursorRayObject: [Drag CursorRay object here]
├── handedness: right
├── rayCastMode: collision
├── cursorRayScalingAxis: 2
└── Additional options (leave as default)
```

### ControllerLeft - Cursor Component

```
Component: cursor
├── cursorObject: [Drag CursorDot object here]
├── cursorRayObject: [Drag CursorRay object here]
├── handedness: left
├── rayCastMode: collision
├── cursorRayScalingAxis: 2
└── Additional options (leave as default)
```

---

## CursorRay Object Settings (Cylinder)

### Hierarchy Location
```
ControllerRight (or ControllerLeft)
└── CursorRay (child object)
```

### Components on CursorRay

#### mesh Component
```
Component: mesh
├── mesh: Cylinder (primitive)
├── material: [Select an emissive material]
└── active: true
```

#### Transform Values
```
Transform:
├── Position:
│   ├── X: 0
│   ├── Y: 0
│   └── Z: -2.0        (half the ray length)
│
├── Rotation:
│   ├── X: 90          (points cylinder forward)
│   ├── Y: 0
│   └── Z: 0
│
└── Scale:
    ├── X: 0.005       (very thin)
    ├── Y: 4.0         (4 meter ray length)
    └── Z: 0.005       (very thin)
```

**Note:** If you want a 2-meter ray:
- Position Z: -1.0
- Scale Y: 2.0

**For a 5-meter ray:**
- Position Z: -2.5
- Scale Y: 5.0

---

## CursorDot Object Settings (Sphere)

### Hierarchy Location
```
ControllerRight (or ControllerLeft)
└── CursorDot (child object)
```

### Components on CursorDot

#### mesh Component
```
Component: mesh
├── mesh: Sphere (primitive)
├── material: [Select an emissive material]
└── active: true
```

#### Transform Values
```
Transform:
├── Position:
│   ├── X: 0
│   ├── Y: 0
│   └── Z: 0           (at controller origin)
│
├── Rotation:
│   ├── X: 0
│   ├── Y: 0
│   └── Z: 0
│
└── Scale:
    ├── X: 0.01        (1cm diameter)
    ├── Y: 0.01
    └── Z: 0.01
```

---

## Button Setup Example

### Example: "Start Target Drill" Button

#### Hierarchy Location
```
UI Menu
└── ButtonPlane_StartTarget
```

#### Components on ButtonPlane_StartTarget

##### 1. mesh Component (for visuals)
```
Component: mesh
├── mesh: Plane (primitive) or custom model
├── material: [Your button texture/material]
└── active: true
```

##### 2. collision Component (for cursor detection)
```
Component: collision
├── collider: box
├── extents:
│   ├── X: 0.2         (button width in meters)
│   ├── Y: 0.1         (button height in meters)
│   └── Z: 0.01        (thin, just for raycasting)
├── group: 1
└── active: true
```

**Visual Check:** You should see a **green outline** in the editor showing the collision box.

##### 3. cursor-target Component
```
Component: cursor-target
└── (no properties to configure, just add it)
```

##### 4. ui-cursor-button Component
```
Component: ui-cursor-button
├── action: Start Target Drill    (select from dropdown)
└── debugMode: true                (enable for testing)
```

---

## Full Scene Hierarchy Example

```
YourScene
│
├── Player
│   ├── EyeLeft
│   ├── EyeRight
│   ├── NonVrCamera
│   │
│   ├── ControllerRight
│   │   ├── [Components]
│   │   │   ├── input (already exists)
│   │   │   └── cursor ⬅ ADD THIS
│   │   │       ├── cursorObject: → CursorDot
│   │   │       ├── cursorRayObject: → CursorRay
│   │   │       ├── handedness: right
│   │   │       └── rayCastMode: collision
│   │   │
│   │   ├── CursorRay ⬅ ADD THIS CHILD OBJECT
│   │   │   ├── mesh (Cylinder)
│   │   │   └── Transform: pos=[0,0,-2], rot=[90,0,0], scale=[0.005,4,0.005]
│   │   │
│   │   └── CursorDot ⬅ ADD THIS CHILD OBJECT
│   │       ├── mesh (Sphere)
│   │       └── Transform: scale=[0.01,0.01,0.01]
│   │
│   └── ControllerLeft
│       ├── [Components]
│       │   ├── input (already exists)
│       │   └── cursor ⬅ ADD THIS
│       │       ├── cursorObject: → CursorDot
│       │       ├── cursorRayObject: → CursorRay
│       │       ├── handedness: left
│       │       └── rayCastMode: collision
│       │
│       ├── CursorRay ⬅ ADD THIS CHILD OBJECT
│       └── CursorDot ⬅ ADD THIS CHILD OBJECT
│
├── UI Menu
│   ├── ButtonPlane_Tennis ⬅ CONFIGURE ALL BUTTONS LIKE THIS
│   │   ├── mesh (visual appearance)
│   │   ├── collision ⬅ ADD THIS
│   │   ├── cursor-target ⬅ ADD THIS
│   │   └── ui-cursor-button ⬅ ADD THIS (action: Tennis Environment)
│   │
│   ├── ButtonPlane_Football
│   │   ├── mesh
│   │   ├── collision ⬅ ADD THIS
│   │   ├── cursor-target ⬅ ADD THIS
│   │   └── ui-cursor-button ⬅ ADD THIS (action: Football Environment)
│   │
│   ├── ButtonPlane_Gym
│   │   └── ... (same pattern)
│   │
│   ├── ButtonPlane_StartTarget
│   │   └── ... (same pattern)
│   │
│   ├── ButtonPlane_StartBeam
│   │   └── ... (same pattern)
│   │
│   ├── ButtonPlane_StartBall
│   │   └── ... (same pattern)
│   │
│   ├── ButtonPlane_Stop
│   │   └── ... (same pattern)
│   │
│   └── ButtonPlane_Report
│       └── ... (same pattern)
│
└── Manager
    └── [Components]
        └── game-selector (already exists)
```

---

## Material Setup for Cursor Ray

### Creating an Emissive Material (Optional)

If you want a glowing cursor ray:

1. **Create new material in Wonderland Editor:**
   - Right-click in Resources → New → Material
   - Name it: `CursorRayMaterial`

2. **Configure Material:**
   - **Shader**: Choose a basic or unlit shader
   - **Color**: Set to bright color (e.g., cyan: #00FFFF)
   - **Emissive**: Enable if available
   - **Transparency**: You can make it semi-transparent (alpha: 0.8)

3. **Assign to CursorRay:**
   - Select `CursorRay` object
   - In `mesh` component, drag `CursorRayMaterial` to the material slot

---

## Button Collision Size Guidelines

Button collision should be slightly larger than the visual button for easier clicking:

| Button Size (visual) | Collision Extents | Notes |
|---------------------|-------------------|-------|
| Small (icon) | [0.1, 0.1, 0.01] | For small clickable icons |
| Medium (standard) | [0.2, 0.1, 0.01] | Typical button size |
| Large (prominent) | [0.3, 0.15, 0.01] | Large action buttons |
| Round button | Use sphere collider | Radius: 0.08-0.15 |

**Z-axis:** Keep very small (0.01) - buttons are flat planes!

---

## Testing the Cursor Ray Direction

If your cursor ray doesn't point forward:

### Try These Rotation Values:

```
Option 1: [90, 0, 0]     ← Most common
Option 2: [-90, 0, 0]
Option 3: [0, 90, 0]
Option 4: [0, -90, 0]
```

**How to test:**
1. Set rotation
2. Rebuild project (Ctrl+B)
3. Deploy to Quest
4. Check if ray points forward from controller

The correct rotation makes the cylinder extend along the controller's forward direction (where it naturally points when you hold it).

---

## Cursor Ray Color Suggestions

Choose bright, high-contrast colors:

| Color | Hex Code | Use Case |
|-------|----------|----------|
| Cyan | #00FFFF | Sci-fi, modern UI |
| White | #FFFFFF | Clean, minimal |
| Green | #00FF00 | Matrix-style, gaming |
| Blue | #0080FF | Professional, calm |
| Red | #FF0000 | Warning, danger actions |

**Pro Tip:** Use **cyan** or **white** for best visibility in most environments.

---

## Advanced: Hover Material Change

To make the cursor ray change color when hovering over buttons:

1. **Create a second material** (e.g., `CursorRayHoverMaterial` in orange/yellow)

2. **In the cursor component on the controller:**
   - Find property: **cursorRayActiveMaterial** (if available)
   - Assign the hover material

3. **Result:** Ray changes color when pointing at clickable objects

---

## Troubleshooting Visual Guide

### Problem: Can't See Cursor Ray

**Check:**
```
CursorRay Object
├── Is it active? ☑
├── Does it have mesh component? ☑
├── Is material assigned? ☑
├── Is material emissive/bright? ☑
└── Is cursorRayObject assigned in cursor component? ☑
```

### Problem: Ray Points Wrong Way

**Try Different Rotations:**
```
Current: [X, Y, Z]
Try: [90, 0, 0]   ← Rotate 90° on X-axis
Try: [-90, 0, 0]  ← Rotate -90° on X-axis
Try: [0, 90, 0]   ← Rotate 90° on Y-axis
```

### Problem: Buttons Don't Respond

**Check Each Button Has:**
```
ButtonObject
├── collision component? ☑
│   └── Green outline visible in editor? ☑
├── cursor-target component? ☑
└── ui-cursor-button component? ☑
    └── Action selected? ☑
```

---

## Example Code for Custom Cursor Events

If you want to add custom behavior (e.g., haptic feedback), you can extend the ui-cursor-button component:

```javascript
start() {
    this.target = this.object.getComponent('cursor-target');
    
    // On hover - button highlights
    this.target.onHover.add((_, cursor) => {
        console.log('Hovering over button');
        // Add visual feedback here
        // e.g., change button material, play sound
    });
    
    // On unhover - button returns to normal
    this.target.onUnhover.add(() => {
        console.log('No longer hovering');
        // Revert visual feedback
    });
    
    // On click - button action
    this.target.onClick.add(this._onClick.bind(this));
}
```

---

## Summary: What You Need

### Per Controller (2 total):
- ✅ `cursor` component
- ✅ `CursorRay` child object with cylinder mesh
- ✅ `CursorDot` child object with sphere mesh (optional)

### Per Button (8+ total):
- ✅ `collision` component
- ✅ `cursor-target` component
- ✅ `ui-cursor-button` component

### In Code:
- ✅ `ui-cursor-button.js` file created
- ✅ Component registered in `index.js`
- ✅ Project rebuilt

---

*Refer to VR-CURSOR-SETUP-GUIDE.md for step-by-step instructions*
