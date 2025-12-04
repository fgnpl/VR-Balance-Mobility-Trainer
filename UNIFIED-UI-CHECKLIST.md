# Unified UI Setup Checklist

Use this checklist to ensure everything is properly configured in your Wonderland Engine scene.

## ✅ Phase 1: Manager Object Setup

- [ ] **Locate Manager Object**
  - Find the object named "Manager" in your scene
  - If it doesn't exist, create one

- [ ] **game-selector Component Configuration**
  - [ ] Link `footballField` to football environment parent object
  - [ ] Link `tennisCourt` to tennis environment parent object
  - [ ] Link `gymFloor` to gym environment parent object
  - [ ] Link `targetManager` to object with target-manager component
  - [ ] Link `beamWalkManager` to object with beam-walk-manager component
  - [ ] Link `deflectManager` to ball object (with bouncing-ball component)
  - [ ] Link `dataManager` to object with data-manager component
  - [ ] Link `uiStatusText` to your status text object ⭐ NEW
  - [ ] Link `uiCueText` to your cue/instruction text object ⭐ NEW
  - [ ] Link `uiStatsText` to your statistics text object ⭐ NEW
  - [ ] Set `defaultEnvironment` (football/tennis/gym)

## ✅ Phase 2: UI Text Objects Setup

- [ ] **Create/Locate UI Text Objects**
  - [ ] Status Text Object exists
  - [ ] Cue Text Object exists
  - [ ] Stats Text Object exists
  - [ ] All three have `text` components attached
  - [ ] All three are visible and positioned correctly

- [ ] **Text Object Properties**
  - [ ] Font size is readable
  - [ ] Text alignment is set (usually center or left)
  - [ ] Default text is set (optional, will be overwritten)

## ✅ Phase 3: UI Buttons Setup

For each button in your UI panel:

### Button 1: Tennis Environment
- [ ] Has `ui-plane-button` or `ui-cursor-button` component
- [ ] Has `cursor-target` component
- [ ] Has `collision` component
- [ ] Action set to: `Tennis Environment`

### Button 2: Football Environment
- [ ] Has `ui-plane-button` or `ui-cursor-button` component
- [ ] Has `cursor-target` component
- [ ] Has `collision` component
- [ ] Action set to: `Football Environment`

### Button 3: Gym Environment
- [ ] Has `ui-plane-button` or `ui-cursor-button` component
- [ ] Has `cursor-target` component
- [ ] Has `collision` component
- [ ] Action set to: `Gym Environment`

### Button 4: Start Target Drill
- [ ] Has `ui-plane-button` or `ui-cursor-button` component
- [ ] Has `cursor-target` component
- [ ] Has `collision` component
- [ ] Action set to: `Start Target Drill`

### Button 5: Start Beam Walk
- [ ] Has `ui-plane-button` or `ui-cursor-button` component
- [ ] Has `cursor-target` component
- [ ] Has `collision` component
- [ ] Action set to: `Start Beam Walk`

### Button 6: Start Deflect & Strike ⭐ NEW
- [ ] Has `ui-plane-button` or `ui-cursor-button` component
- [ ] Has `cursor-target` component
- [ ] Has `collision` component
- [ ] Action set to: `Start Deflect & Strike`

### Button 7: Stop All Drills
- [ ] Has `ui-plane-button` or `ui-cursor-button` component
- [ ] Has `cursor-target` component
- [ ] Has `collision` component
- [ ] Action set to: `Stop All Drills`

### Button 8: Show Report
- [ ] Has `ui-plane-button` or `ui-cursor-button` component
- [ ] Has `cursor-target` component
- [ ] Has `collision` component
- [ ] Action set to: `Show Report`

## ✅ Phase 4: Game Components Update

### Target Manager
- [ ] Locate object with `target-manager` component
- [ ] **REMOVE** or clear `uiCueText` property (leave empty)
- [ ] **REMOVE** or clear `statsText` property (leave empty)
- [ ] Optionally link `gameSelector` to Manager (or leave empty for auto-find)
- [ ] Verify other properties (spherePrefab, spawnZone, etc.) are still linked

### Beam Walk Manager
- [ ] Verify it's linked to game-selector's `beamWalkManager` property
- [ ] All other properties remain as configured

### Bouncing Ball (Deflect Game)
- [ ] Locate ball object with `bouncing-ball` component
- [ ] **REMOVE** or clear `endPanel` property
- [ ] **REMOVE** or clear `scoreText` property
- [ ] **REMOVE** or clear `panelVisiblePos` property
- [ ] Optionally link `gameSelector` to Manager (or leave empty for auto-find)
- [ ] Verify `batObject` is still linked
- [ ] Verify spawn and force properties are configured

## ✅ Phase 5: Cleanup Old System

- [ ] **Remove Old Deflect Button (if exists)**
  - [ ] Find button with `replay-button-catch` component
  - [ ] Remove the component OR delete the button object
  - [ ] Replaced with new unified button

- [ ] **Remove Old Deflect Panel (if exists)**
  - [ ] Find panel that was used for deflect game end screen
  - [ ] Can be deleted or kept for other purposes
  - [ ] Not needed for UI anymore

- [ ] **Remove Old Text Objects (if separate)**
  - [ ] Old target game statsText (if separate from unified UI)
  - [ ] Old target game uiCueText (if separate from unified UI)
  - [ ] Keep if reusing for unified system!

## ✅ Phase 6: Testing

### Test Environment Switching
- [ ] Click "Tennis Environment" → Environment changes
- [ ] Click "Football Environment" → Environment changes
- [ ] Click "Gym Environment" → Environment changes
- [ ] uiStatus shows: "Select a drill"

### Test Target Drill
- [ ] Click "Start Target Drill"
- [ ] uiStatus shows: "Target Striking: ON"
- [ ] uiCue shows: "Hit [COLOR]" (YELLOW/PINK/GREEN)
- [ ] uiStats shows: "Round: X/Y | Hits: X | Misses: X..."
- [ ] Click "Stop All Drills"
- [ ] All UI text clears appropriately

### Test Beam Walk
- [ ] Click "Start Beam Walk"
- [ ] uiStatus shows: "Beam Walk: ON"
- [ ] Game functions correctly
- [ ] Click "Stop All Drills"
- [ ] UI clears

### Test Deflect & Strike ⭐ NEW
- [ ] Click "Start Deflect & Strike"
- [ ] uiStatus shows: "Deflect & Strike: ON"
- [ ] uiCue shows: "Ready?" then "Ball 1 / X"
- [ ] uiStats shows: "Hits: X / Y"
- [ ] Ball and bat appear and are active
- [ ] Hit ball with bat → hit counter increases
- [ ] After all balls → uiCue shows "Game Over!"
- [ ] uiStats shows: "Final: X / Y hits (Z%)"
- [ ] Click "Stop All Drills"
- [ ] Ball and bat disappear
- [ ] UI clears

### Test Stop Button
- [ ] Start any drill
- [ ] Click "Stop All Drills"
- [ ] Drill stops
- [ ] uiStatus shows: "Drills stopped"
- [ ] uiCue clears
- [ ] uiStats clears

### Test Report
- [ ] Complete some drills
- [ ] Click "Show Report"
- [ ] uiStatus shows report summary
- [ ] Console shows detailed report

## ✅ Phase 7: Final Verification

- [ ] **No Console Errors**
  - Open browser console (F12)
  - Check for any JavaScript errors
  - All warnings addressed

- [ ] **Performance Check**
  - VR performance is smooth
  - No lag when switching games
  - UI updates instantly

- [ ] **Visual Check**
  - All text is readable
  - UI positioned correctly
  - No overlapping elements
  - Buttons respond to hover/click

- [ ] **Code Review**
  - All files saved
  - Project rebuilds without errors
  - Deploy folder updated (if applicable)

## 🎉 Success Criteria

Your unified UI system is ready when:

- ✅ All three games start from the same UI panel
- ✅ All games use the same three text components (status, cue, stats)
- ✅ Stop button works for all games
- ✅ No old separate panels or buttons remain
- ✅ UI updates in real-time during gameplay
- ✅ No console errors
- ✅ Clean, organized code structure

## 📚 Documentation Reference

If you need help with any step:

- **UNIFIED-UI-SUMMARY.md** - Quick overview
- **UNIFIED-UI-MIGRATION.md** - Detailed setup guide
- **UNIFIED-UI-ARCHITECTURE.md** - System architecture diagrams

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| UI not updating | Check text object links in game-selector |
| Button not working | Verify cursor-target and collision components |
| Game not starting | Check manager references (deflectManager, etc.) |
| Old panel still shows | Delete old endPanel objects |
| Auto-find fails | Manager object must be named "Manager" |

## 📝 Notes

- Keep `replay-button-catch.js` file for now (backward compatibility)
- Can delete later once everything is confirmed working
- Document any custom modifications you make
- Consider version control before major changes

---

**Checklist Version:** 1.0  
**Last Updated:** December 4, 2025  
**Compatible With:** Wonderland Engine 1.x
