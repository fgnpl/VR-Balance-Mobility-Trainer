# Quick Start: VR Motion Tracker with Server

Get motion tracking running in 3 simple steps!

## Step 1: Install Dependencies

Open PowerShell in your project folder and run:

```powershell
npm install
```

This installs Express and CORS packages needed for the server.

## Step 2: Start the Server

```powershell
npm start
```

You should see:
```
=================================
VR Balance Mobility Trainer Server
=================================
Server running on http://localhost:3000
Motion data saved to: T:\GitHub\VR-Balance-Mobility-Trainer\motion-data
=================================
```

**Keep this terminal window open!** The server needs to keep running.

## Step 3: Configure VR App in Editor

1. Open Wonderland Editor
2. Select your **Manager** object
3. Click **Add Component**
4. Select **vr-motion-tracker**
5. Link the required objects:
   - **headObject**: Your VR camera (EyeLeft or camera)
   - **leftController**: Left controller object
   - **rightController**: Right controller object
6. Save and build your project
7. Deploy to VR headset

## Step 4: Test It!

1. Put on your VR headset
2. Start the VR application
3. Wait 1 second (auto-recording starts)
4. Move around, use controllers
5. When done, exit VR or wait for auto-save

## Where Are My Files?

Files are saved to:
```
T:\GitHub\VR-Balance-Mobility-Trainer\motion-data\
```

Each file is named:
```
vr-motion-{timestamp}-{randomId}.json
```

Example: `vr-motion-1733169600000-x7k9m2p.json`

## Verify It's Working

### Check Server Logs
In your PowerShell terminal, you should see:
```
[Server] Motion data saved: vr-motion-1733169600000-x7k9m2p.json
[Server] Total samples: 3456
```

### Check Browser Console (in VR headset)
If you can access developer tools on your VR browser:
```
[VrMotionTracker] Recording started at 2025-12-02T14:30:00.123Z
[VrMotionTracker] Successfully saved to server: vr-motion-1733169600000-x7k9m2p.json
```

### Check Files
Open File Explorer:
```
T:\GitHub\VR-Balance-Mobility-Trainer\motion-data\
```

You should see `.json` files with motion tracking data.

## Common Issues

### "Server won't start"
**Error**: `Error: Cannot find module 'express'`

**Solution**: Run `npm install` first

---

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**: Port is already used, change it:
```powershell
$env:PORT=3001; npm start
```

### "No files are being saved"
1. **Check server is running** - Look for the server startup message
2. **Check motion-data folder exists** - It's created automatically
3. **Check VR app console** - Look for error messages
4. **Test server endpoint**:
   ```powershell
   curl http://localhost:3000/api/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

### "Fallback to browser download"
This means the VR app couldn't reach the server. Usually happens when:
- Server not running
- Wrong port
- Network issue

Files will download to browser's download folder instead.

## Next Steps

- [Full Documentation](./VR-MOTION-TRACKER.md)
- [Server Configuration](./SERVER-SETUP.md)
- [Data Analysis Examples](./VR-MOTION-TRACKER.md#data-analysis)

## Manual Control (Optional)

To control recording from your game:

```javascript
// Get tracker component
const tracker = this.engine.scene.findByName('Manager')[0]
    .getComponent('vr-motion-tracker');

// Start recording
tracker.startRecording();

// Stop and save
tracker.stopRecording();

// Get sample count
console.log(`Samples: ${tracker.getSampleCount()}`);
```

## Stopping Everything

1. **Stop VR app**: Exit VR application
2. **Stop server**: Press `Ctrl+C` in PowerShell terminal where server is running

## Accessing Saved Data

### View in Text Editor
Open any `.json` file in VS Code or Notepad:
```powershell
code motion-data/vr-motion-1733169600000-x7k9m2p.json
```

### Analyze with Python
```python
import json

# Load data
with open('motion-data/vr-motion-1733169600000-x7k9m2p.json') as f:
    data = json.load(f)

# Show head speed
for sample in data['devices']['head']['samples'][:5]:
    print(f"Time: {sample['time']:.2f}s, Speed: {sample['velocity']['magnitude']:.2f} m/s")
```

### List All Files via API
```powershell
curl http://localhost:3000/api/motion-data/list
```

## Production Deployment

For deploying to a remote server:

1. Copy project to server
2. Install dependencies: `npm install --production`
3. Install PM2: `npm install -g pm2`
4. Start with PM2: `pm2 start server.js --name vr-motion-server`
5. Save PM2 config: `pm2 save`
6. Setup auto-start: `pm2 startup`

See [SERVER-SETUP.md](./SERVER-SETUP.md#deployment) for details.

---

**That's it!** You now have VR motion tracking with server-side storage. 🎉
