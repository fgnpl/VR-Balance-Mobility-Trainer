# Deflect & Strike Games Setup Guide

## New Games Added

Two new ball-based games have been integrated:
- **Deflect Game**: Hit the bouncing balls with your bat to deflect them
- **Strike Game**: Strike the bouncing balls for points

Both games automatically spawn balls and track your hits.

---

## What Was Changed

### 1. **game-selector.js**
Added two new properties and methods:
- `deflectBall` - Object with bouncing-ball component (deflect game)
- `strikeBall` - Object with bouncing-ball component (strike game)
- `startDeflectGame()` - Starts the deflect game
- `startStrikeGame()` - Starts the strike game
- `_stopDeflectAndStrikeGames()` - Stops both games by deactivating them

### 2. **ui-plane-button.js**
Added two new actions to the enum:
- **Action 8**: "Start Deflect Game"
- **Action 9**: "Start Strike Game"

### 3. **index.js**
Registered 5 new components:
- `BatManager` - Handles bat collision with balls
- `BouncingBall` - Main game logic for bouncing ball games
- `ReplayButtonCatch` - Replay button for catch game
- `ReplayButtonReact` - Replay button for reaction game

---

## Editor Setup (5 minutes)

### Step 1: Create/Find Ball Game Objects

You should have two ball game objects in your scene:
1. **DeflectBall** - The bouncing ball for deflect game
2. **StrikeBall** - The bouncing ball for strike game

Each should have:
- `bouncing-ball` component
- `physx` component (for physics)
- `trail` component (for visual effect)

**Important:** Both objects should be **inactive by default** (unchecked in scene) so they don't start automatically.

---

### Step 2: Link Games to Manager

1. **Find Manager object** in Scene Outline
2. **Select Manager**
3. **In Properties Panel → game-selector component:**
   - Find `deflectBall` property
   - **Drag** your DeflectBall object to this property
   - Find `strikeBall` property
   - **Drag** your StrikeBall object to this property

You should see:
```
deflectBall: DeflectBall
strikeBall: StrikeBall
```

---

### Step 3: Configure UI Buttons

#### Option A: Create New Buttons

1. **Create two new button objects** (duplicate existing buttons)
2. **Name them:**
   - `button-start-deflect`
   - `button-start-strike`

3. **For button-start-deflect:**
   - Add/check `ui-plane-button` component
   - Set `action` dropdown to: **"Start Deflect Game"**
   - Make sure it has `cursor-target` component
   - Make sure it has `collision` component

4. **For button-start-strike:**
   - Add/check `ui-plane-button` component
   - Set `action` dropdown to: **"Start Strike Game"**
   - Make sure it has `cursor-target` component
   - Make sure it has `collision` component

#### Option B: Repurpose Existing Buttons

If you already created `button-start-deflect` and `button-start-strike`:
1. Select each button
2. Find the `ui-plane-button` component
3. Set the `action` dropdown to the appropriate game:
   - For deflect: **"Start Deflect Game"** (index 8)
   - For strike: **"Start Strike Game"** (index 9)

---

### Step 4: Configure BouncingBall Component

For each ball game object (DeflectBall and StrikeBall):

1. **Select the object**
2. **Find bouncing-ball component**
3. **Configure properties:**

```
maxSpawn: 5           (how many balls before game over)
minX: -0.5            (spawn area left)
maxX: 0.5             (spawn area right)
minY: 1.5             (spawn area bottom)
maxY: 2.5             (spawn area top)
spawnZ: -3.0          (how far in front of player)
minForceX: 50         (horizontal force range)
maxForceX: 100
minForceZ: 250        (forward force - how fast ball comes)
maxForceZ: 300

endPanel: (link to game over panel)
scoreText: (link to score text object)
panelVisiblePos: (location where panel appears)
```

---

### Step 5: Setup Bat

The bat object needs:
1. **bat-manager component** - handles collision with balls
2. **physx component** - for collision detection
3. **Name must be:** `Baseball Bat` (exact name, case-sensitive)

The `BouncingBall` component looks for collision with object named "Baseball Bat".

---

## Testing

### Quick Test Checklist:

```
□ Built project (Ctrl+B)
□ Deployed to Quest
□ Started Deflect Game from UI button
□ Ball spawns and flies toward player
□ Bat can hit the ball
□ Ball respawns after landing
□ Game over panel appears after maxSpawn hits
□ Started Strike Game from UI button
□ Same behavior for strike game
□ "Stop All Drills" button stops the games
```

### Console Verification:

**When button clicked:**
```
[UiPlaneButton] Button clicked: 8
[GameSelector] status: Ball Deflect: ON
```

**When ball spawns:**
```
Ball physics activated
```

**When bat hits ball:**
```
Bat hit
```

**When game over:**
```
Game over. Hits: 3
```

---

## How Games Work

### Game Flow:

1. **Start:** Button click → `startDeflectGame()` or `startStrikeGame()`
2. **Activation:** Ball object becomes active, `resetGame()` called
3. **Spawning:** Ball teleports to random position, gets launched with force
4. **Gameplay:** Player hits ball with bat, hit counter increases
5. **Respawn:** After ball lands and becomes still, respawns at new position
6. **Game Over:** After `maxSpawn` balls, game over panel appears
7. **Stop:** "Stop All Drills" deactivates the ball objects

### Automatic Prevention:

The games are designed to NOT auto-start:
- Both ball objects should be **inactive** in the scene
- `game-selector` calls `_stopDeflectAndStrikeGames()` on start
- Only UI button clicks can activate them

---

## Troubleshooting

### Problem: Game starts automatically on scene load

**Solution:**
1. Make sure DeflectBall and StrikeBall objects are **unchecked** (inactive) in scene
2. Rebuild project

### Problem: "Deflect Ball not found" error

**Solution:**
1. Check Manager has `deflectBall` property linked
2. Make sure the linked object has `bouncing-ball` component
3. Rebuild project

### Problem: Bat doesn't register hits

**Solution:**
1. Check bat object name is exactly `Baseball Bat`
2. Make sure bat has `bat-manager` component
3. Make sure bat has `physx` component with collision enabled
4. Check collision groups allow bat and ball to collide

### Problem: Ball doesn't respawn

**Solution:**
1. Check ball has `physx` component
2. Make sure `bouncing-ball.isStill()` is working (ball velocity = 0)
3. Check console for errors

### Problem: Game over panel doesn't appear

**Solution:**
1. Check `endPanel` property is linked in `bouncing-ball` component
2. Check `scoreText` property is linked
3. Check `panelVisiblePos` property is linked
4. Make sure text object has `text` component

---

## UI Button Action Reference

Complete list of actions (use dropdown in `ui-plane-button`):

| Index | Action Name | Method Called |
|-------|-------------|---------------|
| 0 | Tennis Environment | `gs.showTennis()` |
| 1 | Football Environment | `gs.showFootball()` |
| 2 | Gym Environment | `gs.showGym()` |
| 3 | Start Target Drill | `gs.startTargetDrill()` |
| 4 | Start Beam Walk | `gs.startBeamWalk()` |
| 5 | Start Ball Catching | `gs.startBallDrill()` |
| 6 | Stop All Drills | `gs.stopDrills()` |
| 7 | Show Report | `gs.showReport()` |
| 8 | **Start Deflect Game** | `gs.startDeflectGame()` ⭐ NEW |
| 9 | **Start Strike Game** | `gs.startStrikeGame()` ⭐ NEW |

---

## Architecture Summary

```
UI Button (ui-plane-button)
    ↓ click event
    ↓ action: 8 or 9
    ↓
Manager Object (game-selector)
    ↓ startDeflectGame() or startStrikeGame()
    ↓
DeflectBall/StrikeBall Object
    ↓ activate
    ↓ bouncing-ball.resetGame()
    ↓
Ball spawns, flies, lands, respawns
    ↓
Bat collision detected (bat-manager)
    ↓
Hit counter increments
    ↓
After maxSpawn: Game Over
```

---

**Setup Time: ~5 minutes** ⏱️

Build and test your new games! 🎯⚾
