# Unified UI System Migration Guide

## Overview
This document explains the migration from separate UI systems to a unified, centralized UI system managed by `game-selector.js`.

## What Changed

### Before Migration
- Each game (Target Strike, Beam Walk, Deflect & Strike) had its own UI text components
- `replay-button-catch.js` was a separate button for the deflect game
- UI elements were scattered and inconsistent
- `bouncing-ball.js` managed its own panel and score text

### After Migration
- All games now use three unified UI text components: `uiStatus`, `uiCue`, and `uiStats`
- All game controls are accessible through the main UI panel with `ui-plane-button` or `ui-cursor-button`
- `game-selector.js` is the central controller for all games and UI updates
- Consistent UI experience across all drills

## Unified UI Components

### 1. **uiStatus** (Status Text)
- **Purpose:** Shows the current game state and general messages
- **Examples:**
  - "Select a drill"
  - "Target Striking: ON"
  - "Beam Walk: ON"
  - "Deflect & Strike: ON"
  - "Drills stopped"

### 2. **uiCue** (Cue/Instruction Text)
- **Purpose:** Shows real-time instructions and cues for the active game
- **Examples:**
  - Target Game: "Hit YELLOW"
  - Deflect Game: "Ball 1 / 5", "Game Over!"
  - Empty when no drill is active

### 3. **uiStats** (Statistics Text)
- **Purpose:** Shows real-time statistics for the active game
- **Examples:**
  - Target Game: "Round: 3/5 | Hits: 12 | Misses: 3 | Accuracy: 80% | Avg RT: 0.534s"
  - Deflect Game: "Hits: 3 / 5", "Final: 3 / 5 hits (60%)"
  - Empty when no drill is active

## Setup Instructions

### 1. Editor Setup (Wonderland Engine)

#### A. Manager Object Configuration
On your `Manager` object with the `game-selector` component:

**Required Properties:**
- `footballField` - Parent object for football environment
- `tennisCourt` - Parent object for tennis environment
- `gymFloor` - Parent object for gym environment
- `targetManager` - Object with `target-manager` component
- `beamWalkManager` - Object with `beam-walk-manager` component
- `deflectManager` - Object with `bouncing-ball` component (the ball object itself)
- `dataManager` - Object with `data-manager` component
- `uiStatusText` - Text object for status messages
- `uiCueText` - Text object for game cues/instructions
- `uiStatsText` - Text object for game statistics

#### B. UI Panel Buttons
For each button on your UI panel:

1. Attach `ui-plane-button` or `ui-cursor-button` component
2. Set the `action` property to desired function:
   - Tennis Environment
   - Football Environment
   - Gym Environment
   - Start Target Drill
   - Start Beam Walk
   - **Start Deflect & Strike** (NEW)
   - Stop All Drills
   - Show Report

#### C. Target Manager Updates
On your `target-manager` component:

**Removed Properties:**
- ❌ `uiCueText` (now uses game-selector)
- ❌ `statsText` (now uses game-selector)

**Optional Property:**
- `gameSelector` - If not set, will auto-find the Manager object

#### D. Bouncing Ball (Deflect Game) Updates
On your `bouncing-ball` component:

**Removed Properties:**
- ❌ `endPanel` (no longer needed)
- ❌ `scoreText` (now uses game-selector)
- ❌ `panelVisiblePos` (no longer needed)

**Optional Property:**
- `gameSelector` - If not set, will auto-find the Manager object

### 2. Files Modified

#### Core System Files
- ✅ `js/game-selector.js` - Added deflect drill support and unified UI methods
- ✅ `js/ui-plane-button.js` - Added "Start Deflect & Strike" button action
- ✅ `js/ui-cursor-button.js` - Added "Start Deflect & Strike" button action

#### Game Files
- ✅ `js/bouncing-ball.js` - Integrated with unified UI system
- ✅ `js/target-manager.js` - Updated to use unified UI methods

#### Deprecated Files
- ⚠️ `js/replay-button-catch.js` - No longer needed, can be removed

## Migration Steps

### Step 1: Update Wonderland Engine Scene
1. Open your project in Wonderland Engine Editor
2. Select the `Manager` object
3. In the `game-selector` component, add these new properties:
   - Link `deflectManager` to your ball object (with bouncing-ball component)
   - Link `uiCueText` to a text object in your UI
   - Link `uiStatsText` to a text object in your UI
4. Remove the old `endPanel` and related objects for the deflect game

### Step 2: Update UI Buttons
1. For any existing deflect game button:
   - Remove the `replay-button-catch` component
   - Add `ui-plane-button` or `ui-cursor-button` component
   - Set action to "Start Deflect & Strike"
2. Ensure all buttons are properly linked to the Manager

### Step 3: Update Target Manager
1. Select the object with `target-manager` component
2. Remove the `uiCueText` link (leave empty/null)
3. Remove the `statsText` link (leave empty/null)
4. Optionally link `gameSelector` to Manager (or leave empty for auto-find)

### Step 4: Update Bouncing Ball
1. Select the ball object with `bouncing-ball` component
2. Remove `endPanel`, `scoreText`, `panelVisiblePos` links
3. Optionally link `gameSelector` to Manager (or leave empty for auto-find)

### Step 5: Test Each Game
1. Start each game from the UI panel
2. Verify status messages appear in `uiStatus`
3. Verify cues appear in `uiCue`
4. Verify stats appear in `uiStats`
5. Test "Stop All Drills" button

## API Reference

### game-selector.js Methods

#### `updateStatus(text)`
Updates the status text component with general messages.
```javascript
this.updateStatus('Target Striking: ON');
```

#### `updateCue(text)`
Updates the cue text component with game-specific instructions.
```javascript
this.updateCue('Hit YELLOW');
```

#### `updateStats(text)`
Updates the stats text component with game statistics.
```javascript
this.updateStats('Round: 3/5 | Hits: 12 | Misses: 3');
```

#### `startDeflectDrill()`
Starts the deflect & strike game (bouncing ball).
```javascript
gs.startDeflectDrill();
```

#### `stopDrills()`
Stops all active drills and clears UI.
```javascript
gs.stopDrills();
```

## Benefits of Unified System

### 1. **Consistency**
- All games use the same UI components
- Uniform look and feel across all drills

### 2. **Maintainability**
- Single source of truth for UI updates
- Easier to modify UI layout
- Centralized game state management

### 3. **Flexibility**
- Easy to add new games
- Simple to modify UI text positions
- Consistent button behavior

### 4. **Simplified Setup**
- No need for separate panels per game
- Fewer objects to manage in the scene
- Clear property linking in editor

## Troubleshooting

### Issue: UI not updating
**Solution:** Check that `uiStatusText`, `uiCueText`, and `uiStatsText` are properly linked in the `game-selector` component.

### Issue: Deflect game not starting
**Solution:** Verify that `deflectManager` is linked to the ball object with the `bouncing-ball` component.

### Issue: Button not working
**Solution:** Ensure the button has either `ui-plane-button` or `ui-cursor-button` component, and the action enum is set correctly.

### Issue: Auto-find not working
**Solution:** Make sure your Manager object is named exactly "Manager" in the scene hierarchy.

## Future Enhancements

- Add data tracking for deflect game to `data-manager.js`
- Integrate deflect game statistics with "Show Report"
- Add visual feedback on UI buttons
- Add sound effects for game state changes

## Notes

- The old `replay-button-catch.js` system is deprecated but not removed for backward compatibility
- Games will auto-find the game-selector if not explicitly linked
- All games now properly clear UI when stopped
- The deflect game no longer uses teleporting panels
