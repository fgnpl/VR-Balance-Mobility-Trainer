# VR Cursor Setup - Quick Guide for Your Project

## ✅ What You Already Have

Your project already has a professional cursor setup:
- ✅ **CursorLeft** object with cursor component
- ✅ **CursorRight** object with cursor component
- ✅ Cursor ray objects (CursorRayLeft, CursorRayRight)
- ✅ Input components configured (ray left, ray right)

**Your cursor rays should already be visible in VR!**

> **⚠️ IMPORTANT:** If you don't see cursor rays or they don't move:
> - **Must test on Meta Quest** (not desktop!)
> - See [`VR-CURSOR-QUICK-FIX.md`](VR-CURSOR-QUICK-FIX.md) for immediate fixes
> - See [`VR-CURSOR-TROUBLESHOOTING.md`](VR-CURSOR-TROUBLESHOOTING.md) for detailed diagnostics

---

## ⚠️ What You Need to Do

Since your cursors are already set up, you **only need to configure your UI buttons** to be clickable.

### For Each Button (8 buttons total):

1. **Add collision component:**
   - Select the button in Wonderland Editor
   - Add Component → **`collision`**
   - Set **collider**: `box`
   - Set **extents** to match button size (e.g., `[0.2, 0.1, 0.01]`)
   - You should see a green outline

2. **Add cursor-target component:**
   - Still on the button
   - Add Component → **`cursor-target`**
   - No configuration needed

3. **Configure ui-plane-button component:**
   - If not already added: Add Component → **`ui-plane-button`**
   - Select **action** from dropdown (e.g., "Start Target Drill")
   - Set **debugMode**: `true` (for testing)

**Note:** Your `ui-plane-button` component already supports cursor interaction! It just needs `collision` and `cursor-target` components to work with the VR cursors.

---

## Your Scene Structure

```
TrackedSpace (205)
├── CursorLeft (126) ✅ Already exists
│   ├── cursor component ✅
│   ├── input (ray left) ✅
│   └── CursorRayLeft (209) ✅
│
├── CursorRight (212) ✅ Already exists
│   ├── cursor component ✅
│   ├── input (ray right) ✅
│   └── CursorRayRight (213) ✅
│
├── ControllerLeft (130) ✅ Already exists
└── ControllerRight (129) ✅ Already exists

UI Menu
├── Button 1 ⚠️ NEEDS: collision + cursor-target (+ ui-plane-button if not added)
├── Button 2 ⚠️ NEEDS: collision + cursor-target (+ ui-plane-button if not added)
├── Button 3 ⚠️ NEEDS: collision + cursor-target (+ ui-plane-button if not added)
└── ... (etc.)
```

---

## Quick Action Checklist

### Buttons to Configure:

For each of these buttons, add 3 components:

- [ ] Tennis Environment Button
  - [ ] collision
  - [ ] cursor-target
  - [ ] ui-plane-button (action: Tennis Environment)

- [ ] Football Environment Button
  - [ ] collision
  - [ ] cursor-target
  - [ ] ui-plane-button (action: Football Environment)

- [ ] Gym Environment Button
  - [ ] collision
  - [ ] cursor-target
  - [ ] ui-plane-button (action: Gym Environment)

- [ ] Start Target Drill Button
  - [ ] collision
  - [ ] cursor-target
  - [ ] ui-plane-button (action: Start Target Drill)

- [ ] Start Beam Walk Button
  - [ ] collision
  - [ ] cursor-target
  - [ ] ui-plane-button (action: Start Beam Walk)

- [ ] Start Ball Catching Button
  - [ ] collision
  - [ ] cursor-target
  - [ ] ui-plane-button (action: Start Ball Catching)

- [ ] Stop All Drills Button
  - [ ] collision
  - [ ] cursor-target
  - [ ] ui-plane-button (action: Stop All Drills)

- [ ] Show Report Button
  - [ ] collision
  - [ ] cursor-target
  - [ ] ui-plane-button (action: Show Report)

---

## Collision Size Reference

Use these extents for the collision component based on your button size:

| Button Size | Collision Extents |
|-------------|------------------|
| Small | `[0.1, 0.1, 0.01]` |
| Medium | `[0.2, 0.1, 0.01]` |
| Large | `[0.3, 0.15, 0.01]` |

**Remember:** The Z-axis should be very small (0.01) since buttons are flat!

---

## Testing

### After configuring buttons:

1. **Build project** (Ctrl+B in Wonderland Editor)
2. **Deploy to Meta Quest**
3. **Test in VR:**
   - ✅ You should see cursor rays from both hands
   - ✅ Point at a button
   - ✅ Pull trigger to click
   - ✅ Button action executes

### ⚠️ If cursor rays aren't visible or don't move:

**READ THIS:** [`VR-CURSOR-TROUBLESHOOTING.md`](VR-CURSOR-TROUBLESHOOTING.md) for detailed fixes!

**Quick checks:**
- Are you testing **on Meta Quest** (not desktop)?
- Check CursorRayMeshLeft and CursorRayMeshRight objects:
  - Do they have mesh components?
  - Are materials bright/visible (not transparent)?
  - Is scale Y around 0.35 (visible)?
- Are cursors parented correctly in hierarchy?
- Is VR mode actually active?

---

## Estimated Time

Since your cursors are already set up:
- **Per button configuration**: ~2 minutes
- **8 buttons total**: ~15 minutes
- **Build & test**: ~3 minutes

**Total: ~20 minutes**

---

## Why This Works

Your existing setup:
- **CursorLeft/Right** objects already cast rays and detect collisions
- They already have the `cursor` component configured
- They already respond to trigger button input
- **ui-plane-button** component already supports cursor-target events!

You just need to:
- **Make buttons clickable** by adding collision shapes
- **Enable cursor interaction** with cursor-target component
- **Configure button actions** with ui-plane-button component (if not already added)

---

## Need More Details?

See the full documentation:
- `VR-CURSOR-SETUP-GUIDE.md` - Detailed instructions
- `VR-CURSOR-VISUAL-GUIDE.md` - Exact values and examples
- `VR-CURSOR-CHECKLIST.md` - Verification checklist

---

## ✅ Buttons Click But Drills Don't Work?

If buttons click but drills don't spawn targets/teleport/throw balls:

**See:** [`GAME-SELECTOR-SETUP.md`](GAME-SELECTOR-SETUP.md) - Link drill managers in the Manager object!

---

*Your project already has professional VR cursor setup! Just configure the buttons and you're done!*
