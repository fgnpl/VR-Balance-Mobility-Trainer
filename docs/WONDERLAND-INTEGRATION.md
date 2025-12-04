# Integration Explanation: Motion Tracker + Wonderland Engine

## Architecture Overview

Your project has two parts:

### 1. **Wonderland Engine App** (Client-Side)
- **File**: `app.js` (and compiled bundle in `deploy/`)
- **Runs in**: Browser / VR Headset
- **Does**: Renders VR scene, runs game logic, motion tracking component

### 2. **Node.js Server** (Backend)
- **File**: `server.js` 
- **Runs on**: Your PC/Server
- **Does**: Serves the Wonderland app + Saves motion data via API

## How They Work Together

```
┌─────────────────────────────────────────────┐
│  VR Headset (Quest 2)                       │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  Wonderland Engine App (app.js)       │ │
│  │  - Renders VR scene                   │ │
│  │  - Runs motion tracker component      │ │
│  │  - Records head + controller data     │ │
│  └─────────────────┬─────────────────────┘ │
│                    │                         │
└────────────────────┼─────────────────────────┘
                     │
                     │ HTTP POST
                     │ /api/save-motion-data
                     ↓
┌─────────────────────────────────────────────┐
│  PC/Server                                  │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  Node.js Server (server.js)           │ │
│  │  - Serves Wonderland app              │ │
│  │  - Receives motion data via API       │ │
│  │  - Saves to motion-data/*.json        │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  📁 motion-data/                            │
│     └── vr-motion-*.json (saved files)     │
└─────────────────────────────────────────────┘
```

## The Setup is Already Integrated!

The `server.js` I created **is** your Wonderland app server. It does two things:

1. **Serves your Wonderland app** from `deploy/` folder:
   ```javascript
   app.use(express.static('deploy')); // Serves index.html, app.js, etc.
   ```

2. **Provides API for motion data**:
   ```javascript
   app.post('/api/save-motion-data', ...); // Saves motion tracking data
   ```

## Development vs Production

### During Development (Wonderland Editor)

When you're developing in Wonderland Editor, you might use:
- Wonderland's **built-in dev server** (preview button)
- Or your own `server.js`

**If using Wonderland's dev server**, the motion tracker will:
- Try to save to `/api/save-motion-data`
- If that fails, fallback to browser download

**Solution**: Run `npm start` alongside Wonderland Editor to have the API available.

### In Production (Deployed)

When deployed, you **only use** `server.js`:
```bash
npm start
```

This serves your app AND handles motion data saving.

## Wonderland Editor Workflow

Here's the correct workflow:

### Option 1: Use server.js for Everything (Recommended)
```bash
# Terminal 1: Start your server
npm start

# Then in browser, navigate to:
http://localhost:3000

# This loads your Wonderland app AND has API available
```

### Option 2: Separate Dev Server + API Server
```bash
# Terminal 1: Start API server
npm start

# Terminal 2: Use Wonderland Editor's preview
# (Click preview button in Wonderland Editor)

# Motion tracker will connect to localhost:3000 API
```

## Configuration for Different Setups

If Wonderland's dev server runs on a different port, update the tracker:

### Current Code (Works for Same-Origin)
```javascript
// In vr-motion-tracker.js
const serverUrl = '/api/save-motion-data'; // Relative URL
```

### For Different Port (e.g., Wonderland on 8080, API on 3000)
```javascript
// In vr-motion-tracker.js
const serverUrl = 'http://localhost:3000/api/save-motion-data'; // Full URL
```

## Recommended Setup

**For simplest workflow:**

1. **Build your project** in Wonderland Editor (Build button)
2. **Files are copied** to `deploy/` folder
3. **Run server**: `npm start`
4. **Access app**: `http://localhost:3000`
5. **Motion data auto-saves** to `motion-data/`

This way, everything is served from one server and APIs just work!

## Quick Test

To verify it's working:

1. **Start server**:
   ```bash
   npm start
   ```

2. **Open browser**:
   ```
   http://localhost:3000
   ```

3. **Check console** (F12):
   ```
   [VrMotionTracker] Initialized - Session ID: ...
   [VrMotionTracker] Recording started
   ```

4. **After session ends**:
   ```
   [VrMotionTracker] Successfully saved to server: vr-motion-*.json
   ```

5. **Check folder**:
   ```bash
   ls motion-data/
   ```

## Files Explained

| File | Purpose | When Used |
|------|---------|-----------|
| `app.js` | Wonderland client app (source) | Development |
| `deploy/project-app.js` | Wonderland client app (built) | Production |
| `server.js` | Backend server + API | Always (dev & prod) |
| `js/vr-motion-tracker.js` | Motion tracking component | In VR app |
| `motion-data/*.json` | Saved session data | After recording |

## Summary

✅ **The integration is already complete!**

- `server.js` serves your Wonderland app
- Motion tracker component sends data to server API
- Server saves data to `motion-data/` folder

**Just run**: `npm start` and access `http://localhost:3000`

No additional integration needed - it's all connected! 🎉
