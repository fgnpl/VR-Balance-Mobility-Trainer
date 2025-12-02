# VR Motion Tracker - Implementation Summary

## What Was Created

### 1. Server Infrastructure (`server.js`)
- **Express.js server** on port 3000
- **REST API** for saving/retrieving motion data
- **File storage** in `motion-data/` folder
- **CORS support** for cross-origin requests
- **Automatic directory creation**

### 2. VR Motion Tracker Component (`js/vr-motion-tracker.js`)
- **Real-time tracking** of head and both controllers
- **10Hz sampling rate** (configurable)
- **Position, rotation, velocity, acceleration** recording
- **Server-first approach** with browser download fallback
- **Session management** with unique IDs
- **Statistics calculation** (max/avg speed and acceleration)
- **Component registered** in `js/index.js`

### 3. Documentation
- **VR-MOTION-TRACKER.md**: Complete component documentation
- **SERVER-SETUP.md**: Detailed server configuration guide
- **MOTION-TRACKER-QUICKSTART.md**: 3-step quick start guide
- **motion-data/README.md**: Data folder explanation

### 4. Configuration Updates
- **package.json**: Added express, cors dependencies and npm scripts
- **.gitignore**: Added motion-data/ to ignore tracking data files

## How It Works

### Data Flow

```
VR Headset/Controllers
        ↓
  Motion Tracker Component (update() at 10Hz)
        ↓
  Calculate position, velocity, acceleration
        ↓
  Store in sessionData object
        ↓
  On stopRecording() or component destroy
        ↓
  POST to /api/save-motion-data
        ↓
  Server saves to motion-data/*.json
```

### File Structure

```
project/
├── server.js                          # Node.js server
├── package.json                       # Dependencies and scripts
├── js/
│   ├── vr-motion-tracker.js          # Main component
│   └── index.js                       # Component registration
├── motion-data/                       # Saved sessions (auto-created)
│   ├── README.md
│   └── vr-motion-*.json              # Session files
└── docs/
    ├── VR-MOTION-TRACKER.md          # Component docs
    ├── SERVER-SETUP.md                # Server docs
    └── MOTION-TRACKER-QUICKSTART.md  # Quick start
```

## Quick Start

1. **Install**: `npm install`
2. **Start Server**: `npm start`
3. **Add Component**: Attach `vr-motion-tracker` to Manager object in editor
4. **Link Objects**: Head, left controller, right controller
5. **Deploy & Test**: Files save to `motion-data/` folder

## Key Features

### ✅ Server-Side Storage
- Files saved to `motion-data/` folder on server
- No browser download prompts
- Easy access for batch analysis
- Centralized data collection

### ✅ Automatic Fallback
- If server unavailable, downloads to browser
- No data loss
- Works offline

### ✅ Comprehensive Tracking
- **Position**: World coordinates (X, Y, Z)
- **Rotation**: Quaternion (X, Y, Z, W)
- **Velocity**: m/s (vector + magnitude)
- **Acceleration**: m/s² (vector + magnitude)

### ✅ Smart Sampling
- Configurable rate (default 10Hz)
- Efficient memory usage
- Smooth performance

### ✅ Session Management
- Unique session IDs
- Start/end timestamps
- Sample count tracking
- Statistics calculation

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | Server health check |
| POST | `/api/save-motion-data` | Save session data |
| GET | `/api/motion-data/list` | List all files |
| GET | `/api/motion-data/:filename` | Get specific file |
| DELETE | `/api/motion-data/:filename` | Delete file |

## Data Format Example

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
            "x": 0.0, "y": 0.0, "z": 0.0,
            "magnitude": 0.0
          },
          "acceleration": {
            "x": 0.0, "y": 0.0, "z": 0.0,
            "magnitude": 0.0
          }
        }
      ]
    },
    "leftController": { "enabled": true, "samples": [...] },
    "rightController": { "enabled": true, "samples": [...] }
  }
}
```

## Configuration Options

### Component Properties
- `headObject`: VR camera/head object
- `leftController`: Left controller object
- `rightController`: Right controller object
- `recordingInterval`: Sample rate (default 0.1s = 10Hz)
- `trackHead`: Enable head tracking (default true)
- `trackLeftController`: Enable left controller (default true)
- `trackRightController`: Enable right controller (default true)
- `autoStart`: Auto-start recording (default true)
- `debugMode`: Console logging (default false)

### Server Settings
- `PORT`: Server port (default 3000)
- `MOTION_DATA_DIR`: Storage folder (default `./motion-data`)

## Performance

### File Sizes (5-minute session)
- **10Hz**: ~1-2 MB per device
- **20Hz**: ~2-4 MB per device
- **5Hz**: ~0.5-1 MB per device

### Memory Usage
- Data stored in memory during recording
- Released after saving
- Minimal impact on VR performance

## Use Cases

### Balance & Gait Analysis
Track head movement patterns during balance exercises:
- Head sway measurements
- Movement stability
- Recovery patterns after perturbations

### Rehabilitation Tracking
Monitor patient progress over multiple sessions:
- Compare session-to-session improvements
- Identify movement patterns
- Track recovery velocity

### Research Data Collection
Collect motion data from multiple participants:
- Centralized storage
- Easy export to analysis tools
- Consistent data format

### Controller Interaction Analysis
Study how users interact with VR environment:
- Controller movement patterns
- Reach distances
- Interaction speeds

## Next Steps

### Integration Ideas

1. **Add UI Button to Save Data**
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

2. **Real-time Feedback**
   ```javascript
   // Monitor head speed in real-time
   if (headSpeed > 2.0) {
       this.updateStatus('Warning: Moving too fast!');
   }
   ```

3. **Session Reports**
   ```javascript
   // Show statistics at end of drill
   const stats = tracker._calculateStatistics();
   this.updateStatus(`Max speed: ${stats.devices.head.maxSpeed.toFixed(2)} m/s`);
   ```

### Analysis Scripts

See documentation for Python and JavaScript examples for:
- Loading and parsing JSON files
- Calculating statistics
- Generating visualizations
- Comparing multiple sessions

## Troubleshooting

### Server Issues
- **Won't start**: Run `npm install` first
- **Port in use**: Change with `PORT=3001 npm start`
- **No files saved**: Check console logs and folder permissions

### VR App Issues
- **No data recorded**: Check objects are linked in editor
- **Fallback mode**: Server not running or unreachable
- **High memory**: Reduce sampling rate or enable fewer devices

## Security Notes

For production deployment, consider:
- API key authentication
- Rate limiting
- HTTPS only
- CORS restrictions
- Regular backups

See [SERVER-SETUP.md](./docs/SERVER-SETUP.md#security-considerations) for implementation details.

---

## Files Changed/Created

### New Files
- ✅ `server.js` - Node.js server
- ✅ `js/vr-motion-tracker.js` - Motion tracker component
- ✅ `motion-data/README.md` - Data folder documentation
- ✅ `docs/VR-MOTION-TRACKER.md` - Component documentation
- ✅ `docs/SERVER-SETUP.md` - Server setup guide
- ✅ `docs/MOTION-TRACKER-QUICKSTART.md` - Quick start guide

### Modified Files
- ✅ `package.json` - Added dependencies and scripts
- ✅ `js/index.js` - Registered VrMotionTracker component
- ✅ `.gitignore` - Added motion-data/ folder

### Auto-Generated
- ✅ `motion-data/` - Created by server on startup
- ✅ `motion-data/vr-motion-*.json` - Created during VR sessions

---

**Status**: ✅ Complete and ready to use!

**Test Command**: `npm start` then access VR app
