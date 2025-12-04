# Game Naming Correction - Quick Update

## Issue Identified
The two different games were incorrectly grouped together as "Deflect & Strike"

## Two Separate Games

### 1. **Deflect & Catch** (Bouncing Ball Game)
- **File:** `bouncing-ball.js`
- **Button:** `replay-button-catch.js`
- **Gameplay:** Hit flying balls with a bat
- **Also called:** Catch game, bouncing ball game

### 2. **Strike & React** (Reaction Time Game)
- **File:** `sphere-spawner.js` (component: `reaction-game`)
- **Button:** `replay-button-react.js`
- **Gameplay:** Click/strike targets that spawn and disappear
- **Also called:** React game, sphere spawner

## Changes Made

### Updated Files

1. **`js/game-selector.js`**
   - Added `reactManager` property (for sphere-spawner)
   - Added `startReactDrill()` method
   - Updated `stopDrills()` to handle react game
   - Status messages now correctly distinguish between games:
     - "Deflect & Catch: ON"
     - "Strike & React: ON"

2. **`js/sphere-spawner.js`**
   - Removed old UI properties (endPanel, resultText, statusText, panelVisibleLocation)
   - Added `gameSelector` property
   - Added `updateUI()` method
   - Now uses unified UI system (uiStatus, uiCue, uiStats)
   - Auto-finds Manager object if not linked

3. **`js/ui-plane-button.js`**
   - Split into two separate actions:
     - Case 5: "Start Deflect & Catch"
     - Case 6: "Start Strike & React"
   - Updated case numbers (Stop All Drills → 7, Show Report → 8)

4. **`js/ui-cursor-button.js`**
   - Split into two separate actions:
     - Case 5: "Start Deflect & Catch"
     - Case 6: "Start Strike & React"
   - Updated case numbers (Stop All Drills → 7, Show Report → 8)

## New Button Actions

Your UI buttons now have these options:

1. Tennis Environment
2. Football Environment
3. Gym Environment
4. Start Target Drill
5. **Start Deflect & Catch** ← Bouncing ball game
6. **Start Strike & React** ← Reaction/sphere game
7. Stop All Drills
8. Show Report

## Editor Setup Required

### On Manager Object (game-selector component):

**NEW Property to Link:**
- `reactManager` → Link to the object with `reaction-game` component (sphere spawner parent)

**Existing Properties:**
- `deflectManager` → Already linked to ball object with `bouncing-ball` component
- All other properties remain the same

### On Sphere Spawner Object (reaction-game component):

**Remove these properties:**
- ❌ `endPanel`
- ❌ `resultText`
- ❌ `statusText`
- ❌ `panelVisibleLocation`

**Optional property:**
- `gameSelector` → Can link to Manager or leave empty (auto-finds)

### Update Your Buttons:

If you have a button for the reaction game:
1. Remove `replay-button-react` component (if migrating to unified system)
2. Add `ui-plane-button` or `ui-cursor-button`
3. Set action to: **"Start Strike & React"**

## Game Behavior

### Deflect & Catch Game
When started:
- Status: "Deflect & Catch: ON"
- Cue: "Ready?" → "Ball 1 / 5"
- Stats: "Hits: 3 / 5"
- Final: "Final: 3 / 5 hits (60%)"

### Strike & React Game
When started:
- Status: "Strike & React: ON"
- Cue: "Click the targets!" → "Target 1 / 20"
- Stats: "Avg Time: 0.523s | Completed: 1"
- Final: "Avg: 0.512s | Fast: 0.234s | Slow: 0.891s | Total: 20"

## Backward Compatibility

Both old button systems still work:
- `replay-button-catch.js` - Still functional for deflect game
- `replay-button-react.js` - Still functional for react game
- Can migrate at your own pace

## Summary

✅ **Two distinct games properly separated**
- Deflect & Catch = Hit flying balls with bat
- Strike & React = Click spawning targets

✅ **Both integrated with unified UI**
- Both use uiStatus, uiCue, uiStats
- Consistent experience across all games

✅ **Clear naming throughout codebase**
- Comments clarify which file is which
- Button labels are descriptive

✅ **Easy to manage**
- All controls in one place
- Stop button works for both
- Consistent setup pattern

## Quick Test

1. Start Deflect & Catch → Ball spawns, bat active, hit counter works
2. Stop → Ball disappears
3. Start Strike & React → Spheres spawn randomly, click to dismiss
4. Stop → Spheres stop spawning
5. Both games update the same UI text components

---

**All files compile without errors!** ✅
