# 📊 VR Motion Tracker - Complete Setup Guide

## Overview

The VR Motion Tracker records position, velocity, and acceleration data for the VR headset and both controllers. All data is automatically saved to the server for easy analysis.

---

## 🚀 Quick Setup (3 Steps)

### 1️⃣ Install Dependencies
```powershell
npm install
```

### 2️⃣ Start Server
```powershell
npm start
```

Keep this running! You should see:
```
=================================
VR Balance Mobility Trainer Server
=================================
Server running on http://localhost:3000
Motion data saved to: T:\GitHub\VR-Balance-Mobility-Trainer\motion-data
=================================
```

### 3️⃣ Configure in Editor
1. Open Wonderland Editor
2. Select **Manager** object
3. Add Component → **vr-motion-tracker**
4. Link objects:
   - **headObject** → Your VR camera (EyeLeft/camera)
   - **leftController** → Left controller object
   - **rightController** → Right controller object
5. Save, build, deploy

**Done!** Motion data will automatically save to `motion-data/` folder.

---

## 📁 Where Files Are Saved

**Server Folder:**
```
T:\GitHub\VR-Balance-Mobility-Trainer\motion-data\
```

**Filename Format:**
```
vr-motion-{timestamp}-{randomId}.json
```

Example: `vr-motion-1733169600000-x7k9m2p.json`

---

## ✅ Testing

### Test Server API
```powershell
npm test
```

This runs automated tests to verify:
- ✅ Server is running
- ✅ Data can be saved
- ✅ Files can be listed
- ✅ Files can be retrieved

### Manual Server Test
```powershell
curl http://localhost:3000/api/health
```

Should return:
```json
{"status":"ok","timestamp":"2025-12-02T14:30:00.123Z"}
```

---

## 📊 What Data Is Recorded

For each device (head, left controller, right controller):

### Position
- X, Y, Z coordinates in meters (world space)

### Rotation
- Quaternion (X, Y, Z, W)

### Velocity
- X, Y, Z components (m/s)
- Magnitude (m/s)

### Acceleration
- X, Y, Z components (m/s²)
- Magnitude (m/s²)

### Sampling Rate
- Default: 10 Hz (100ms intervals)
- Configurable: 5-50 Hz recommended

---

## 🔧 Configuration

### Component Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| headObject | Object | - | VR camera/head |
| leftController | Object | - | Left controller |
| rightController | Object | - | Right controller |
| recordingInterval | Float | 0.1 | Seconds between samples |
| trackHead | Bool | true | Enable head tracking |
| trackLeftController | Bool | true | Enable left tracking |
| trackRightController | Bool | true | Enable right tracking |
| autoStart | Bool | true | Auto-start recording |
| debugMode | Bool | false | Console logging |

### Server Settings

Change port (if 3000 is in use):
```powershell
$env:PORT=3001; npm start
```

---

## 💾 Accessing Data

### View Files in Explorer
```powershell
explorer motion-data
```

### List Files via API
```powershell
curl http://localhost:3000/api/motion-data/list
```

### Get Specific File
```powershell
curl http://localhost:3000/api/motion-data/vr-motion-1733169600000-x7k9m2p.json
```

### Delete File
```powershell
curl -X DELETE http://localhost:3000/api/motion-data/vr-motion-1733169600000-x7k9m2p.json
```

---

## 📈 Data Analysis Examples

### Python
```python
import json
import numpy as np

# Load session
with open('motion-data/vr-motion-1733169600000-x7k9m2p.json') as f:
    data = json.load(f)

# Analyze head movement
samples = data['devices']['head']['samples']
speeds = [s['velocity']['magnitude'] for s in samples]

print(f"Average speed: {np.mean(speeds):.2f} m/s")
print(f"Max speed: {np.max(speeds):.2f} m/s")
```

### JavaScript/Node.js
```javascript
const fs = require('fs');

// Load all sessions
const files = fs.readdirSync('./motion-data');
const sessions = files
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(`./motion-data/${f}`)));

console.log(`Total sessions: ${sessions.length}`);

// Calculate statistics
sessions.forEach(session => {
    const samples = session.devices.head.samples.length;
    console.log(`${session.sessionId}: ${samples} samples`);
});
```

---

## 🎮 Manual Control (Optional)

Control recording from your game code:

```javascript
// Get tracker
const tracker = this.engine.scene.findByName('Manager')[0]
    .getComponent('vr-motion-tracker');

// Start recording
tracker.startRecording();

// Stop and save
tracker.stopRecording();

// Check status
console.log(`Recording: ${tracker.isRecording}`);
console.log(`Samples: ${tracker.getSampleCount()}`);
```

---

## 🚨 Troubleshooting

### Server Won't Start

**Error:** `Cannot find module 'express'`
```powershell
npm install
```

**Error:** `EADDRINUSE: address already in use`
```powershell
$env:PORT=3001; npm start
```

### Files Not Saving

1. **Check server is running**
   ```powershell
   curl http://localhost:3000/api/health
   ```

2. **Check console logs** (VR browser and server terminal)

3. **Check motion-data folder exists**
   ```powershell
   ls motion-data
   ```

4. **Test server API**
   ```powershell
   npm test
   ```

### Fallback to Browser Download

If you see this message:
```
[VrMotionTracker] Falling back to browser download...
```

It means:
- Server not running, OR
- Network issue, OR
- Wrong server URL

Files will download to browser instead (Meta Quest: `/sdcard/Download/`).

---

## 📚 Full Documentation

- **Quick Start**: [MOTION-TRACKER-QUICKSTART.md](./MOTION-TRACKER-QUICKSTART.md)
- **Component Docs**: [VR-MOTION-TRACKER.md](./VR-MOTION-TRACKER.md)
- **Server Setup**: [SERVER-SETUP.md](./SERVER-SETUP.md)
- **Implementation Summary**: [MOTION-TRACKER-SUMMARY.md](./MOTION-TRACKER-SUMMARY.md)

---

## 🔒 Production Deployment

For deploying to remote server:

1. **Copy to server**
   ```bash
   scp -r . user@server:/path/to/app/
   ```

2. **Install on server**
   ```bash
   ssh user@server
   cd /path/to/app/
   npm install --production
   ```

3. **Use PM2 for persistence**
   ```bash
   npm install -g pm2
   pm2 start server.js --name vr-motion-server
   pm2 save
   pm2 startup
   ```

See [SERVER-SETUP.md](./SERVER-SETUP.md#deployment) for details.

---

## 📊 File Size Estimates

For a 5-minute VR session:

| Sampling Rate | Size per Device | Total (3 devices) |
|---------------|-----------------|-------------------|
| 5 Hz (0.2s)   | ~0.5 MB         | ~1.5 MB           |
| 10 Hz (0.1s)  | ~1 MB           | ~3 MB             |
| 20 Hz (0.05s) | ~2 MB           | ~6 MB             |
| 50 Hz (0.02s) | ~5 MB           | ~15 MB            |

**Recommendation**: 10-20 Hz for balance/gait analysis

---

## 🎯 Use Cases

✅ **Balance Training**
- Track head sway during exercises
- Measure stability improvements
- Analyze recovery patterns

✅ **Gait Analysis**
- Monitor walking patterns
- Track step characteristics
- Measure movement quality

✅ **Rehabilitation**
- Long-term progress tracking
- Session-to-session comparisons
- Patient performance reports

✅ **Research Data**
- Multi-participant studies
- Controlled experiments
- Standardized data format

---

## 🛠️ Advanced Features

### Real-time Monitoring
```javascript
// In your component's update()
const tracker = this.trackerComponent;
if (tracker.isRecording) {
    const sampleCount = tracker.getSampleCount();
    if (sampleCount % 100 === 0) {
        console.log(`Recorded ${sampleCount} samples`);
    }
}
```

### Custom Save Triggers
```javascript
// Save on drill completion
onDrillComplete() {
    const tracker = this.getTrackerComponent();
    tracker.stopRecording(); // Saves automatically
    tracker.startRecording(); // Start new session
}
```

### Statistics Integration
```javascript
// Show stats in UI
const tracker = this.getTrackerComponent();
const stats = tracker._calculateStatistics();
this.updateStatus(
    `Max Speed: ${stats.devices.head.maxSpeed.toFixed(2)} m/s`
);
```

---

## ✅ What's Included

### Files Created
- ✅ `server.js` - Express server with REST API
- ✅ `js/vr-motion-tracker.js` - Motion tracking component
- ✅ `test-server.js` - Automated API tests
- ✅ `motion-data/` - Data storage folder
- ✅ Complete documentation (4 guides)

### Files Modified
- ✅ `package.json` - Dependencies and scripts
- ✅ `js/index.js` - Component registration
- ✅ `.gitignore` - Ignore motion-data files

### Ready to Use
- ✅ No additional configuration needed
- ✅ Auto-creates directories
- ✅ Automatic fallback to browser
- ✅ Error handling included

---

## 🎉 You're All Set!

1. **Start server**: `npm start`
2. **Build VR app**: Use Wonderland Editor
3. **Deploy & test**: Files auto-save to `motion-data/`
4. **Analyze data**: Use Python, JavaScript, or any JSON tool

**Need help?** Check the documentation or console logs for detailed error messages.
