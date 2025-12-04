# VR Cursor Setup Quick Checklist

Use this checklist to quickly verify your VR cursor setup is complete.

---

## ✅ Controller Setup Checklist

### For BOTH ControllerLeft AND ControllerRight:

- [ ] Controller object exists in scene hierarchy
- [ ] **`cursor`** component added to controller
- [ ] Cursor component configured:
  - [ ] **handedness** set correctly (`left` or `right`)
  - [ ] **rayCastMode** set to `collision`
  - [ ] **cursorRayScalingAxis** set to `2` (Z-axis)

### Cursor Ray Visual (for each controller):

- [ ] Child object created (e.g., `CursorRay`)
- [ ] `CursorRay` has **`mesh`** component
  - [ ] Mesh type: `Cylinder`
  - [ ] Material: Bright/emissive material assigned
  - [ ] Transform:
    - [ ] Position: `[0, 0, -2]`
    - [ ] Rotation: `[90, 0, 0]`
    - [ ] Scale: `[0.005, 2, 0.005]`
- [ ] `CursorRay` assigned to cursor's **cursorRayObject** property

### Cursor Dot (optional but recommended):

- [ ] Child object created (e.g., `CursorDot`)
- [ ] `CursorDot` has **`mesh`** component
  - [ ] Mesh type: `Sphere`
  - [ ] Material: Bright/emissive
  - [ ] Scale: `[0.01, 0.01, 0.01]`
- [ ] `CursorDot` assigned to cursor's **cursorObject** property

---

## ✅ UI Button Setup Checklist

### For EACH clickable button:

- [ ] Button object exists with visible mesh
- [ ] **`collision`** component added
  - [ ] Collision shape selected (box/sphere)
  - [ ] Extents adjusted to match button size
  - [ ] Green outline visible in editor
- [ ] **`cursor-target`** component added
- [ ] **`ui-cursor-button`** component added
  - [ ] **action** selected from dropdown
  - [ ] **debugMode** enabled for testing

---

## ✅ Scene Requirements

- [ ] Manager object exists in scene
- [ ] Manager has **`game-selector`** component
- [ ] Both controllers named exactly:
  - [ ] `ControllerLeft`
  - [ ] `ControllerRight`

---

## ✅ Code/Build Checklist

- [ ] `UiCursorButton` component created in `js/ui-cursor-button.js`
- [ ] Component imported in `js/index.js`
- [ ] Component registered in `js/index.js`
- [ ] Project rebuilt (Ctrl+B or File → Build)
- [ ] No build errors in console

---

## ✅ Testing Checklist

### Desktop Testing (Limited):
- [ ] Play mode works without errors
- [ ] Console shows button initialization logs

### VR Testing (Meta Quest):
- [ ] Deployed to device or Wonderland Cloud
- [ ] Headset shows cursor rays from both controllers
- [ ] Rays are visible and correct length
- [ ] Pointing at button changes cursor appearance
- [ ] Trigger button clicks the button
- [ ] Button action executes correctly
- [ ] No repeated/double clicks

---

## 🐛 Common Issues Quick Fix

| Issue | Quick Fix |
|-------|-----------|
| No cursor rays visible | Check cursorRayObject assignment |
| Rays point wrong way | Adjust CursorRay rotation to [90,0,0] |
| Buttons don't respond | Add collision component to buttons |
| Buttons click randomly | Increase collision precision, check extents |
| Ray too short/long | Adjust CursorRay scale Y value |
| Double-clicking | Check for duplicate event listeners |

---

## 📋 Minimum Working Setup

**Absolute minimum to test:**

1. One controller with:
   - cursor component
   - cursorRayObject assigned

2. One button with:
   - collision component
   - cursor-target component
   - ui-cursor-button component

3. Rebuild project

---

*See VR-CURSOR-SETUP-GUIDE.md for detailed instructions*
