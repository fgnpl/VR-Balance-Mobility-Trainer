# Unified UI System - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  uiStatus    │  │   uiCue      │  │  uiStats     │          │
│  │ (Text Obj)   │  │ (Text Obj)   │  │ (Text Obj)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         ▲                 ▲                  ▲                    │
│         │                 │                  │                    │
│         └─────────────────┼──────────────────┘                   │
│                           │                                       │
│  ┌────────────────────────────────────────────────────┐         │
│  │           UI BUTTONS (ui-plane-button)             │         │
│  │  ┌───────┐ ┌───────┐ ┌───────┐ ┌────────────┐    │         │
│  │  │Tennis │ │Target │ │ Beam  │ │Deflect Game│ ...│         │
│  │  └───┬───┘ └───┬───┘ └───┬───┘ └─────┬──────┘    │         │
│  │      │         │         │            │            │         │
│  └──────┼─────────┼─────────┼────────────┼────────────┘         │
│         │         │         │            │                       │
└─────────┼─────────┼─────────┼────────────┼───────────────────────┘
          │         │         │            │
          ▼         ▼         ▼            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GAME SELECTOR                               │
│                   (Central Controller)                           │
│                                                                   │
│  Methods:                                                        │
│  ├─ updateStatus(text)      → Updates uiStatus                  │
│  ├─ updateCue(text)          → Updates uiCue                    │
│  ├─ updateStats(text)        → Updates uiStats                  │
│  ├─ startTargetDrill()       → Starts target game               │
│  ├─ startBeamWalk()          → Starts beam walk                 │
│  ├─ startDeflectDrill()      → Starts deflect game              │
│  ├─ stopDrills()             → Stops all & clears UI            │
│  └─ showReport()             → Shows session report             │
│                                                                   │
│  References to:                                                  │
│  ├─ uiStatusText             ├─ targetManager                   │
│  ├─ uiCueText                ├─ beamWalkManager                 │
│  ├─ uiStatsText              ├─ deflectManager                  │
│  └─ dataManager              └─ (ball object)                   │
└────────────┬───────────┬─────────────────┬──────────────────────┘
             │           │                 │
             ▼           ▼                 ▼
    ┌────────────┐ ┌───────────┐  ┌──────────────┐
    │   TARGET   │ │   BEAM    │  │   DEFLECT    │
    │  MANAGER   │ │   WALK    │  │ (Ball Game)  │
    │            │ │  MANAGER  │  │              │
    │ ┌────────┐ │ │           │  │ ┌──────────┐ │
    │ │Spawns  │ │ │ Tracks   │  │ │Spawns    │ │
    │ │targets │ │ │ beam     │  │ │balls     │ │
    │ │        │ │ │ walking  │  │ │          │ │
    │ │Tracks  │ │ │          │  │ │Tracks    │ │
    │ │hits/   │ │ │          │  │ │bat hits  │ │
    │ │misses  │ │ │          │  │ │          │ │
    │ └────┬───┘ │ └──────────┘  │ └─────┬────┘ │
    │      │     │                 │       │      │
    │      │     │                 │       │      │
    └──────┼─────┘                 └───────┼──────┘
           │                               │
           │  Calls updateCue()            │  Calls updateCue()
           │        updateStats()          │        updateStats()
           │                               │
           └───────────────┬───────────────┘
                           │
                           ▼
                  ┌────────────────┐
                  │  GAME SELECTOR │
                  │ (updates UI)   │
                  └────────────────┘
```

## Data Flow Examples

### Starting Deflect Game:

```
1. User clicks "Start Deflect & Strike" button
   ↓
2. ui-plane-button detects click
   ↓
3. Calls game-selector.startDeflectDrill()
   ↓
4. game-selector:
   - Stops any running drills
   - Sets currentDrill = 'deflect'
   - Calls bouncing-ball.startGame()
   - Updates UI: 
     * uiStatus: "Deflect & Strike: ON"
     * uiCue: "Ready?"
     * uiStats: ""
   ↓
5. bouncing-ball:
   - Resets game state
   - Enables ball & bat physics
   - Spawns first ball
   - Calls updateUI() to show "Ball 1 / 5"
```

### Ball Hit During Game:

```
1. Physics detects ball-bat collision
   ↓
2. bouncing-ball.onCollision()
   - Increments hitCount
   - Calls updateUI()
   ↓
3. bouncing-ball.updateUI()
   - Gets game-selector reference
   - Calls gs.updateStats("Hits: 3 / 2")
   ↓
4. game-selector.updateStats()
   - Updates uiStatsText component
   ↓
5. User sees updated stats in UI
```

### Target Game Round:

```
1. game-selector.startTargetDrill() called
   ↓
2. target-manager.startGame()
   - Picks random target color
   - Calls updateCue("Hit YELLOW")
   ↓
3. target-manager.updateCue()
   - Gets game-selector reference
   - Calls gs.updateCue("Hit YELLOW")
   ↓
4. game-selector.updateCue()
   - Updates uiCueText component
   ↓
5. User sees "Hit YELLOW" in UI
   ↓
6. Target hit detected
   ↓
7. target-manager.updateStats()
   - Calculates accuracy, reaction time, etc.
   - Calls gs.updateStats("Round: 3/5 | Hits: 12...")
   ↓
8. User sees updated stats in real-time
```

## Old vs New Architecture

### OLD SYSTEM (Before):
```
Target Game → uiCueText (separate)
            → statsText (separate)

Beam Walk   → (no dedicated UI)

Deflect     → endPanel (with scoreText)
            → replay-button-catch (separate button)
            → Panel teleportation system
```

### NEW SYSTEM (After):
```
All Games → game-selector → uiCue
                          → uiStats  
                          → uiStatus

All Buttons → ui-plane-button → game-selector

Consistent, Centralized, Clean!
```

## Key Improvements

1. **Single Source of Truth**
   - All UI updates go through game-selector
   - No conflicting updates
   - Easy to debug

2. **Automatic Discovery**
   - Games auto-find Manager object
   - No need to manually link everything
   - Fallback system in place

3. **Clean State Management**
   - stopDrills() clears all UI
   - Each game updates its own stats
   - No leftover text from previous games

4. **Extensible**
   - Add new game? Just:
     * Create game component
     * Add startXxxGame() method to game-selector
     * Add button action to ui-plane-button
     * Done!
