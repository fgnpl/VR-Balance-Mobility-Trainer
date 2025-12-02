# Quick Reference: Haptic Feedback for Bat Collisions

## ✅ What Was Added

Haptic feedback (controller vibration) when the baseball bat hits balls.

## 🎮 How to Configure

### In Wonderland Editor:

1. **Select the bat object** (e.g., "Baseball Bat")

2. **Find bat-manager component**

3. **Set properties**:
   ```
   hapticIntensity: 0.8    (vibration strength: 0.0-1.0)
   hapticDuration: 100     (duration in milliseconds)
   debugMode: false        (set true for testing)
   ```

4. **Verify hierarchy**:
   ```
   Controller (has 'input' component)
     └── ... (any parents)
         └── Baseball Bat (has bat-manager)
   ```

## 🎯 Recommended Settings

### Normal Hit
```
hapticIntensity: 0.8
hapticDuration: 100
```

### Soft Touch
```
hapticIntensity: 0.4
hapticDuration: 50
```

### Hard Impact
```
hapticIntensity: 1.0
hapticDuration: 150
```

## 🧪 Testing

### Enable Debug Mode
```
debugMode: true
```

### Expected Console Output
```
[BatManager] Haptic feedback triggered: 0.8 intensity, 100ms
```

### Test in VR
1. Enter VR mode
2. Grab bat with controller
3. Hit a ball
4. Feel vibration!

## 🔧 Troubleshooting

### No Vibration?

**Check 1**: Is bat under a controller?
```
Controller (needs 'input' component)
  └── Bat
```

**Check 2**: Console warnings?
```
[BatManager] No input component found...
```
→ Fix: Move bat under controller object

**Check 3**: Are you in VR mode?
- Haptics only work in actual VR session
- Won't work in desktop preview

### Too Strong/Weak?

Adjust `hapticIntensity`:
- Too strong → reduce to 0.5-0.7
- Too weak → increase to 0.9-1.0

## 📋 Properties Reference

| Property | Range | Default | Effect |
|----------|-------|---------|--------|
| hapticIntensity | 0.0-1.0 | 0.8 | Vibration strength |
| hapticDuration | 1-500ms | 100 | How long it vibrates |
| debugMode | true/false | false | Show console logs |

## 💡 Tips

✅ **DO**:
- Use 0.6-1.0 for ball impacts
- Keep duration 50-150ms
- Test on actual VR headset

❌ **DON'T**:
- Use very low intensity (< 0.3)
- Use very long duration (> 300ms)
- Trigger too frequently

## 🔗 Related Components

The same haptic system is already used in:
- `sphere-spawner.js` (target hitting)
- `replay-button-catch.js` (button press)

## 📊 Browser Support

| Device | Support |
|--------|---------|
| Meta Quest 2 | ✅ Full |
| Meta Quest 3 | ✅ Full |
| Pico 4 | ✅ Full |
| PSVR 2 | ✅ Full |

## 🚀 Ready to Use!

No code changes needed. Just configure properties in editor and build!

---

See [HAPTIC-FEEDBACK.md](./HAPTIC-FEEDBACK.md) for detailed documentation.
