# Quick Guide: Spawn Zone Setup

## Create a Cube for Target Spawning

Targets will spawn randomly **inside** this cube's dimensions.

---

## Step 1: Create Cube Object (30 seconds)

1. **In Wonderland Editor:**
   - Right-click in Scene Outline
   - Click "Add Object"
   - Name it: `TargetSpawnZone`

---

## Step 2: Add Mesh (30 seconds)

1. **Select TargetSpawnZone**
2. **In Properties Panel:**
   - Click "Add Component"
   - Type: `mesh`
   - Press Enter

3. **Configure Mesh:**
   - Mesh: Select `PrimitiveCube`
   - Material: Any material (or leave default)

---

## Step 3: Position & Size (1 minute)

**Position the cube where you want targets:**

```
Example for targets in front of player:
Position:
  X: 0      (centered)
  Y: 2      (at head height)
  Z: 3      (3 meters in front)

Scale:
  X: 4      (4 meters wide)
  Y: 2      (2 meters tall)
  Z: 2      (2 meters deep)
```

**Visual result:**
- Targets will spawn randomly inside this 4m × 2m × 2m volume
- Volume is centered at [0, 2, 3]

---

## Step 4: Link to Target Manager (15 seconds)

1. **Select TargetManager** object in Scene Outline
2. **In Properties Panel:**
   - Find `target-manager` component
   - Find `spawnZone` property
   - **Drag** TargetSpawnZone from Scene Outline to this property

You should see: `spawnZone: TargetSpawnZone`

---

## Step 5: Optional - Make Cube Invisible

**Option A: Transparent Material**
- Create a material with alpha = 0
- Assign to TargetSpawnZone mesh

**Option B: Disable Mesh After Setup**
- Uncheck the `mesh` component checkbox
- Targets still spawn in the volume, but cube is invisible

**Option C: Keep Visible**
- Use a wireframe material
- Helps you visualize spawn area during testing

---

## Step 6: Test (1 minute)

1. **Build:** Ctrl+B
2. **Deploy** to Quest
3. **Start Target Drill**
4. **Observe:** Targets spawn inside the cube volume

---

## Example Configurations

### Configuration 1: In Front of Player
```
TargetSpawnZone
├── Position: [0, 2, 3]
├── Scale: [4, 2, 2]
└── Result: Wide horizontal spread
```

### Configuration 2: Side Practice
```
TargetSpawnZone
├── Position: [3, 2, 2]
├── Scale: [2, 3, 2]
└── Result: Tall vertical targets to the right
```

### Configuration 3: 360° Around Player
```
Create 4 spawn zones:
- Front: [0, 2, 3] Scale [4, 2, 2]
- Back: [0, 2, -3] Scale [4, 2, 2]
- Left: [-3, 2, 0] Scale [2, 2, 4]
- Right: [3, 2, 0] Scale [2, 2, 4]

(Assign different spawn zones to different target managers)
```

### Configuration 4: Floor Targets
```
TargetSpawnZone
├── Position: [0, 0.5, 2]
├── Scale: [3, 1, 2]
└── Result: Low targets for kicking/bending practice
```

---

## Console Verification

After setup, build and check console:

**Good output:**
```
[TargetManager] Spawn zone calculated: {
  minX: -2, maxX: 2,
  minY: 1, maxY: 3,
  minZ: 2, maxZ: 4
}
[TargetManager] Spawning in zone: 1.23, 2.45, 3.12
[TargetManager] Spawning in zone: -0.87, 2.11, 2.88
```

**If not working:**
```
[TargetManager] No spawn zone set - using default curved area
```

**Solution:** Re-check that:
1. TargetSpawnZone has mesh component
2. It's linked in TargetManager's spawnZone property
3. You rebuilt after linking (Ctrl+B)

---

## Tips

### Visualize During Development
Keep the cube visible with a semi-transparent material while testing. This helps you:
- See if targets are spawning in the right place
- Adjust size and position
- Understand the spawn volume

### Multiple Zones
You can create multiple spawn zones:
1. Create multiple cube objects
2. Create multiple target managers
3. Each manager uses a different zone
4. Different drills can have different spawn areas

### Spawn Area vs Safe Area
Make sure spawn zone is:
- ✅ Reachable by player's arms
- ✅ Not behind walls or obstacles
- ✅ Not inside the player (avoid Z < 1)
- ✅ Within VR play area boundaries

---

## Quick Checklist

```
□ Created TargetSpawnZone object
□ Added mesh component (PrimitiveCube)
□ Set Position (where targets spawn)
□ Set Scale (spawn volume size)
□ Linked to TargetManager's spawnZone property
□ Built project (Ctrl+B)
□ Tested in VR
□ Checked console for "Spawn zone calculated"
```

---

**Total Setup Time: ~3 minutes** ⏱️

Build and test! 🎯
