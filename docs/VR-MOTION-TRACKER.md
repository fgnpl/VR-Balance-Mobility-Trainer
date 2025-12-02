# VR Motion Tracker Component

## Overview
The VR Motion Tracker component records position, velocity, and acceleration data for the VR headset and both controllers. It saves each session's data to a JSON file that can be analyzed later.

## Features
- **Tracks 3 devices**: Headset, left controller, right controller
- **Records multiple metrics**:
  - Position (X, Y, Z coordinates)
  - Rotation (quaternion: X, Y, Z, W)
  - Velocity (vector + magnitude in m/s)
  - Acceleration (vector + magnitude in m/s²)
- **Configurable sampling rate**: Default 10Hz (100ms intervals)
- **Server-based storage**: JSON files saved to server's `motion-data/` folder
- **Automatic fallback**: Downloads to browser if server is unavailable
- **Session management**: Unique session IDs, start/end timestamps
- **Statistics**: Calculates max/average speed and acceleration per device

## Setup Instructions

### 1. Add Component to Scene
1. Select your **Manager** object (or create a new empty object)
2. Click **Add Component**
3. Select **vr-motion-tracker** from the list

### 2. Link Objects in Editor
Configure the following properties:
- **headObject**: Link your VR camera/head object (usually `EyeLeft` or `camera`)
- **leftController**: Link your left controller object
- **rightController**: Link your right controller object

### 3. Configure Settings
- **recordingInterval**: Time between samples in seconds (default: 0.1 = 10Hz)
  - Lower values = more data, larger files
  - Higher values = less data, smaller files
  - Recommended: 0.05-0.2 seconds
- **trackHead**: Enable/disable head tracking (default: true)
- **trackLeftController**: Enable/disable left controller tracking (default: true)
- **trackRightController**: Enable/disable right controller tracking (default: true)
- **autoStart**: Automatically start recording when VR loads (default: true)
- **debugMode**: Enable console logging every 5 seconds (default: false)

## Usage

### Automatic Recording (Default)
With `autoStart` enabled, recording begins automatically 1 second after the scene loads and continues until:
- You stop it manually
- The scene ends
- The component is destroyed

### Manual Control
To control recording programmatically from another component:

```javascript
// Get the motion tracker component
const tracker = this.engine.scene.findByName('Manager')[0]
    .getComponent('vr-motion-tracker');

// Start recording
tracker.startRecording();

// Stop recording (automatically saves to file)
tracker.stopRecording();

// Get current sample count
const count = tracker.getSampleCount();

// Clear all data without saving
tracker.clearSessionData();

// Get session data object
const data = tracker.getSessionData();
```

## Server Setup

**IMPORTANT**: Before using the motion tracker, you must start the Node.js server!

```bash
# Install dependencies (first time only)
npm install

# Start the server
npm start
```

The server will:
- Run on `http://localhost:3000`
- Save motion data to `./motion-data/` folder
- Serve the VR application from `./deploy/` folder

See [SERVER-SETUP.md](./SERVER-SETUP.md) for detailed server configuration.

## Output File Format

### Filename
Files are automatically saved to server: `motion-data/vr-motion-{sessionId}.json`
- Example: `motion-data/vr-motion-1733169600000-x7k9m2p.json`

### JSON Structure
```json
{
  "sessionId": "1733169600000-x7k9m2p",
  "startTime": "2025-12-02T14:30:00.123Z",
  "endTime": "2025-12-02T14:35:45.678Z",
  "samplingRate": 10,
  "devices": {
    "head": {
      "enabled": true,
      "samples": [
        {
          "time": 0.0,
          "position": { "x": 0.0, "y": 1.6, "z": 0.0 },
          "rotation": { "x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0 },
          "velocity": {
            "x": 0.0,
            "y": 0.0,
            "z": 0.0,
            "magnitude": 0.0
          },
          "acceleration": {
            "x": 0.0,
            "y": 0.0,
            "z": 0.0,
            "magnitude": 0.0
          }
        }
      ]
    },
    "leftController": {
      "enabled": true,
      "samples": [ /* ... */ ]
    },
    "rightController": {
      "enabled": true,
      "samples": [ /* ... */ ]
    }
  }
}
```

### Data Fields Explained
- **sessionId**: Unique identifier for this recording session
- **startTime**: ISO 8601 timestamp when recording started
- **endTime**: ISO 8601 timestamp when recording stopped
- **samplingRate**: Samples per second (Hz)
- **time**: Seconds since recording started
- **position**: World coordinates in meters
- **rotation**: Quaternion rotation (X, Y, Z, W components)
- **velocity**: Speed in meters per second (vector + magnitude)
- **acceleration**: Acceleration in meters per second² (vector + magnitude)

## Statistics

When saving, the component logs statistics to the console:

```
[VrMotionTracker] Session Statistics: {
  totalSamples: 3456,
  duration: 345.6,
  devices: {
    head: {
      enabled: true,
      sampleCount: 1152,
      maxSpeed: 2.34,
      avgSpeed: 0.45,
      maxAcceleration: 5.67,
      avgAcceleration: 0.89
    },
    leftController: { /* ... */ },
    rightController: { /* ... */ }
  }
}
```

## Data Analysis

### Example: Load and Analyze in Python
```python
import json
import numpy as np
import matplotlib.pyplot as plt

# Load the session data
with open('vr-motion-1733169600000-x7k9m2p.json', 'r') as f:
    data = json.load(f)

# Extract head velocity over time
head_samples = data['devices']['head']['samples']
times = [s['time'] for s in head_samples]
speeds = [s['velocity']['magnitude'] for s in head_samples]

# Plot head speed over time
plt.plot(times, speeds)
plt.xlabel('Time (s)')
plt.ylabel('Head Speed (m/s)')
plt.title('VR Head Movement Speed')
plt.show()

# Calculate average speed
avg_speed = np.mean(speeds)
print(f"Average head speed: {avg_speed:.2f} m/s")
```

### Example: Load and Analyze in JavaScript
```javascript
fetch('vr-motion-1733169600000-x7k9m2p.json')
  .then(response => response.json())
  .then(data => {
    // Get all head speed values
    const speeds = data.devices.head.samples
      .map(s => s.velocity.magnitude);
    
    // Calculate max speed
    const maxSpeed = Math.max(...speeds);
    console.log(`Max head speed: ${maxSpeed.toFixed(2)} m/s`);
    
    // Find moments of high acceleration (> 5 m/s²)
    const highAccel = data.devices.head.samples
      .filter(s => s.acceleration.magnitude > 5.0);
    console.log(`High acceleration events: ${highAccel.length}`);
  });
```

## Performance Considerations

### File Sizes
Approximate file sizes for a 5-minute session:
- **10Hz sampling (0.1s)**: ~1-2 MB per device
- **20Hz sampling (0.05s)**: ~2-4 MB per device
- **5Hz sampling (0.2s)**: ~0.5-1 MB per device

### Memory Usage
- Data is stored in memory during recording
- Longer sessions = more memory usage
- Recommended: Stop/save periodically for sessions > 10 minutes

### Sampling Rate Guidelines
- **Balance/gait analysis**: 10-20 Hz recommended
- **Quick movement tracking**: 20-50 Hz
- **General monitoring**: 5-10 Hz sufficient
- **Memory constrained**: 2-5 Hz minimum

## Integration with Game Selector

Add stop/save buttons to your UI by extending `game-selector.js`:

```javascript
// In game-selector.js
saveMotionData() {
    const tracker = this.object.getComponent('vr-motion-tracker');
    if (tracker) {
        tracker.stopRecording();
        tracker.startRecording(); // Start new session
        this.updateStatus('Motion data saved');
    }
}
```

Then add a button action in `ui-plane-button.js`:
```javascript
// Add to action enum: 'Save Motion Data'
// Add to switch statement:
case 8: // Save Motion Data
    if (gs.saveMotionData) {
        gs.saveMotionData();
    }
    break;
```

## Troubleshooting

### No data recorded
- Check that objects are linked in editor
- Verify tracking is enabled for each device
- Check console for warnings: `[VrMotionTracker] Setup warnings`

### Files not saving to server
- **Check server is running**: Navigate to `http://localhost:3000/api/health`
- **Check console logs**: Look for `[VrMotionTracker] Successfully saved to server`
- **Check server logs**: Look for `[Server] Motion data saved: filename.json`
- **Verify motion-data folder**: Check if `motion-data/` folder exists and is writable
- **Fallback activated**: If server unavailable, files download to browser instead

### High memory usage
- Reduce sampling rate (increase `recordingInterval`)
- Stop and save more frequently
- Disable tracking for unused devices

### Velocity/acceleration seems wrong
- First sample always has zero velocity/acceleration (no previous frame)
- Ensure objects are moving in world space, not just locally
- Check that the correct objects are linked (e.g., head, not Player root)

## Console Messages

### VR App (Browser Console)
Normal operation logs:
```
[VrMotionTracker] Initialized - Session ID: 1733169600000-x7k9m2p
[VrMotionTracker] Recording started at 2025-12-02T14:30:00.123Z
[VrMotionTracker] Recording... 100 total samples at 10.0s
[VrMotionTracker] Recording stopped. Duration: 345.60s
[VrMotionTracker] Session Statistics: {...}
[VrMotionTracker] Sending data to server...
[VrMotionTracker] Successfully saved to server: vr-motion-1733169600000-x7k9m2p.json
[VrMotionTracker] Server filepath: T:\GitHub\VR-Balance-Mobility-Trainer\motion-data\vr-motion-1733169600000-x7k9m2p.json
[VrMotionTracker] Session data saved to server: vr-motion-1733169600000-x7k9m2p.json
Total samples: 3456
```

### Server (Terminal)
Server logs when receiving data:
```
[Server] Motion data saved: vr-motion-1733169600000-x7k9m2p.json
[Server] Total samples: 3456
```

### Fallback Mode (if server unavailable)
```
[VrMotionTracker] Failed to send data to server: Failed to fetch
[VrMotionTracker] Falling back to browser download...
[VrMotionTracker] Fallback: Browser download initiated: vr-motion-1733169600000-x7k9m2p.json
```

## Advanced Usage

### Custom Export Format
Modify `_downloadJSON()` method to export CSV instead:

```javascript
_downloadCSV(filename, sessionData) {
    let csv = 'device,time,pos_x,pos_y,pos_z,vel_mag,accel_mag\n';
    
    for (const [device, data] of Object.entries(sessionData.devices)) {
        if (!data.enabled) continue;
        data.samples.forEach(s => {
            csv += `${device},${s.time},${s.position.x},${s.position.y},${s.position.z},`;
            csv += `${s.velocity.magnitude},${s.acceleration.magnitude}\n`;
        });
    }
    
    // Download CSV (similar to JSON download)
    const blob = new Blob([csv], { type: 'text/csv' });
    // ... rest of download code
}
```

### Real-time Analysis
Process data during recording:

```javascript
// Override _recordSample to add real-time processing
_recordSample(currentTime, dt) {
    // ... existing recording code ...
    
    // Real-time analysis
    const headSamples = this.sessionData.devices.head.samples;
    if (headSamples.length > 10) {
        const recentSamples = headSamples.slice(-10);
        const avgSpeed = recentSamples.reduce((sum, s) => 
            sum + s.velocity.magnitude, 0) / 10;
        
        if (avgSpeed > 2.0) {
            console.log('Warning: High head movement detected!');
        }
    }
}
```
