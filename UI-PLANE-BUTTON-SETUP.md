# UI Plane Button Setup Guide

## Component: `ui-plane-button`

This is a universal button component that can be attached to any 2D plane UI element. It handles all button interactions by selecting an action from a **dropdown menu**.

---

## How to Set Up in Wonderland Editor

### 1. For Each Plane Button:
1. Select the plane object in the scene hierarchy
2. Add Component → `ui-plane-button`
3. Select the desired action from the **`action`** dropdown
4. Optionally enable `debugMode` for console logging

---

## Available Actions (Dropdown Options)

### Environment Buttons:
| Dropdown Option | Action |
|-----------------|--------|
| `Tennis Environment` | Switch to tennis court environment |
| `Football Environment` | Switch to football field environment |
| `Gym Environment` | Switch to gym floor environment |

### Drill Start Buttons:
| Dropdown Option | Action |
|-----------------|--------|
| `Start Target Drill` | Start target striking drill |
| `Start Beam Walk` | Start beam walk drill |
| `Start Ball Catching` | Start ball catching drill |

### Control Buttons:
| Dropdown Option | Action |
|-----------------|--------|
| `Stop All Drills` | Stop all active drills |
| `Show Report` | Display session report |

---

## Example Setup

If you have 8 plane buttons in your scene:

1. **Tennis Button Plane**
   - Component: `ui-plane-button`
   - action: `Tennis Environment` (dropdown)

2. **Football Button Plane**
   - Component: `ui-plane-button`
   - action: `Football Environment` (dropdown)

3. **Gym Button Plane**
   - Component: `ui-plane-button`
   - action: `Gym Environment` (dropdown)

4. **Start Target Button Plane**
   - Component: `ui-plane-button`
   - action: `Start Target Drill` (dropdown)

5. **Start Beam Button Plane**
   - Component: `ui-plane-button`
   - action: `Start Beam Walk` (dropdown)

6. **Start Ball Button Plane**
   - Component: `ui-plane-button`
   - action: `Start Ball Catching` (dropdown)

7. **Stop Button Plane**
   - Component: `ui-plane-button`
   - action: `Stop All Drills` (dropdown)

8. **Report Button Plane**
   - Component: `ui-plane-button`
   - action: `Show Report` (dropdown)

---

## Requirements & Setup for Clickable Buttons

### For Each Plane Button Object:

1. **Add a Mesh Component** (if not already present)
   - Your plane needs a visible mesh

2. **Add the UI Plane Button Component**
   - Add Component → `ui-plane-button`
   - Select the desired action from dropdown
   - Adjust `triggerDistance` if needed (default: 0.5m)
   - Enable `debugMode` to see click logs

3. **Scene Requirements:**
   - A "Manager" object with `game-selector` component must exist
   - Controllers/Player object must be named correctly (see below)

### Quick Checklist per Button:
- ✅ Mesh component (for visibility)
- ✅ ui-plane-button component
- ✅ Action selected from dropdown
- ✅ Position button where player can reach it

### ⚠️ NO LONGER NEEDED:
- ~~Collision component~~ (not required!)
- ~~Cursor-target component~~ (not required!)
- ~~Cursor on controllers/camera~~ (not required!)

### After Setup:
- Rebuild the project in Wonderland Editor
- Test in play mode (desktop) or deploy to Quest

---

## Step-by-Step Visual Guide

### Creating a Clickable Plane Button (SIMPLIFIED):

```
1. Create a Plane Object
   └── Add Mesh Component (Primitive: Plane)

2. Add Button Logic
   └── Component: ui-plane-button
       ├── action: [Select from dropdown]
       ├── triggerDistance: 0.5 (meters to trigger)
       ├── cooldownTime: 0.5 (prevent double-press)
       └── debugMode: true (for testing)

3. Position in Scene
   └── Place where player can reach/see it
   └── Within 0.5m of player's path for easy clicking
```

### How It Works:
- **Distance-Based Detection**: Button triggers when player/controller gets within `triggerDistance`
- **VR Mode**: Uses ControllerLeft or ControllerRight position
- **Desktop Mode**: Uses Player or NonVrCamera position
- **No collision or cursor components needed!**

### Required Objects in Scene:
```
For VR:
├── ControllerLeft (standard VR setup)
└── ControllerRight (standard VR setup)

For Desktop:
├── Player (with wasd-controls)
OR
└── NonVrCamera (camera object)
```

---

## Debugging

Set `debugMode: true` on any button to see console logs when:
- The button is initialized
- The button is clicked
- Any errors occur

---

## Troubleshooting

### Button Not Clicking?

**Check these in order:**

1. **Enable debugMode on the button**
   - Set `debugMode: true` on the ui-plane-button component
   - Check browser console (F12) for logs:
     - Initialization message (controllers/player found?)
     - Distance/click messages when you get close

2. **Check object names in scene (CASE-SENSITIVE!):**
   - VR: `ControllerLeft` and `ControllerRight`
   - Desktop: `Player` or `NonVrCamera`
   - If names don't match, buttons won't work!

3. **Is the button positioned within reach?**
   - Default trigger distance is 0.5 meters
   - Walk/move close to the button (within arm's reach)
   - Increase `triggerDistance` if needed (try 1.0 or 1.5)

4. **Is the Manager object present?**
   - Check scene hierarchy for "Manager" object (case-sensitive)
   - Verify it has the `game-selector` component

5. **Did you rebuild the project?**
   - After adding/changing components, rebuild
   - File → Build Project or Ctrl+B

6. **Check console for errors:**
   - "Controllers found: false, false" = VR controllers not named correctly
   - "Player found: false" = No Player or NonVrCamera object
   - "Manager object not found" = No "Manager" in scene

### Common Issues:

| Problem | Solution |
|---------|----------|
| Button doesn't respond to clicks | Enable debugMode, check console for object detection |
| "Controllers found: false, false" | Rename VR controllers to `ControllerLeft` and `ControllerRight` |
| "Player found: false" | Ensure object is named `Player` or `NonVrCamera` |
| "Manager object not found" | Create object named "Manager" with `game-selector` component |
| Button triggers too early/late | Adjust `triggerDistance` property (default: 0.5m) |
| Button clicks multiple times | Increase `cooldownTime` (default: 0.5s) |

---

## VR Support

The component automatically supports both:
- **Desktop**: Distance-based (walk close to button)
- **VR**: Distance-based (move controller close to button)

### How Distance Detection Works:
- When your controller/player gets within `triggerDistance` (default: 0.5m), the button triggers
- No need to "click" - just get close!
- Perfect for VR and desktop modes
- Visual feedback: Set button size appropriately so players know where to approach

---

## Component Properties Reference

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `action` | enum | Tennis Environment | The action to trigger (dropdown selection) |
| `triggerDistance` | float | 0.5 | Distance in meters to trigger button |
| `cooldownTime` | float | 0.5 | Seconds before button can be pressed again |
| `debugMode` | bool | true | Enable console logging for troubleshooting |

---

*Last Updated: November 30, 2025*
