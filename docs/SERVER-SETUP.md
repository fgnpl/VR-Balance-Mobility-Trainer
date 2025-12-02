# VR Motion Tracker Server Setup

This guide explains how to set up and run the Node.js server to save VR motion tracking data.

## Prerequisites

- Node.js (v14 or higher) installed on your server/PC
- npm (comes with Node.js)

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

   This installs:
   - `express` - Web server framework
   - `cors` - Cross-Origin Resource Sharing support

2. **Verify Installation**
   ```bash
   npm list
   ```

## Running the Server

### Option 1: Using npm script
```bash
npm start
```

### Option 2: Direct node command
```bash
node server.js
```

### Option 3: Development mode (auto-restart on changes)
```bash
npm install -g nodemon
nodemon server.js
```

## Server Details

- **Port**: 3000 (default, configurable via PORT environment variable)
- **Motion Data Directory**: `./motion-data/`
- **Static Files**: Serves VR app from `./deploy/` directory

### Starting Server Output
```
=================================
VR Balance Mobility Trainer Server
=================================
Server running on http://localhost:3000
Motion data saved to: T:\GitHub\VR-Balance-Mobility-Trainer\motion-data
=================================
```

## API Endpoints

### 1. Health Check
- **GET** `/api/health`
- Returns server status and timestamp
- Example response:
  ```json
  {
    "status": "ok",
    "timestamp": "2025-12-02T14:30:00.123Z"
  }
  ```

### 2. Save Motion Data
- **POST** `/api/save-motion-data`
- Body: Complete session JSON data
- Returns:
  ```json
  {
    "success": true,
    "filename": "vr-motion-1733169600000-x7k9m2p.json",
    "filepath": "T:\\GitHub\\VR-Balance-Mobility-Trainer\\motion-data\\vr-motion-1733169600000-x7k9m2p.json",
    "message": "Motion data saved successfully"
  }
  ```

### 3. List All Files
- **GET** `/api/motion-data/list`
- Returns list of all saved motion data files
- Example response:
  ```json
  {
    "success": true,
    "files": [
      {
        "filename": "vr-motion-1733169600000-x7k9m2p.json",
        "size": 1234567,
        "created": "2025-12-02T14:30:00.000Z",
        "modified": "2025-12-02T14:35:45.000Z"
      }
    ],
    "count": 1
  }
  ```

### 4. Get Specific File
- **GET** `/api/motion-data/:filename`
- Example: `/api/motion-data/vr-motion-1733169600000-x7k9m2p.json`
- Returns the complete motion data JSON

### 5. Delete File
- **DELETE** `/api/motion-data/:filename`
- Deletes the specified motion data file
- Returns:
  ```json
  {
    "success": true,
    "message": "File deleted successfully"
  }
  ```

## File Storage

### Location
All motion tracking data is saved to:
```
<project-root>/motion-data/
```

### Filename Format
```
vr-motion-{timestamp}-{randomId}.json
```

Example: `vr-motion-1733169600000-x7k9m2p.json`

### File Structure
Each file contains:
- Session metadata (ID, timestamps, sampling rate)
- Device data (head, left controller, right controller)
- Position, rotation, velocity, acceleration samples

## Accessing Saved Files

### From Server Console
When data is saved, you'll see:
```
[Server] Motion data saved: vr-motion-1733169600000-x7k9m2p.json
[Server] Total samples: 3456
```

### From File System
Navigate to the `motion-data` folder:
```bash
cd motion-data
ls -la  # Linux/Mac
dir     # Windows
```

### Via API
```bash
# List all files
curl http://localhost:3000/api/motion-data/list

# Get specific file
curl http://localhost:3000/api/motion-data/vr-motion-1733169600000-x7k9m2p.json

# Delete file
curl -X DELETE http://localhost:3000/api/motion-data/vr-motion-1733169600000-x7k9m2p.json
```

## Configuration

### Change Port
```bash
# Windows
set PORT=8080 && npm start

# Linux/Mac
PORT=8080 npm start
```

### Change Motion Data Directory
Edit `server.js`:
```javascript
const MOTION_DATA_DIR = path.join(__dirname, 'custom-folder-name');
```

## VR App Configuration

The VR motion tracker component automatically sends data to the server at:
```
/api/save-motion-data
```

No configuration needed in the VR app if running on the same server!

### If Server is on Different Machine
The component will automatically fallback to browser download if server is unreachable.

## Security Considerations

### For Production Use

1. **Add Authentication**
   ```javascript
   // In server.js
   const apiKey = process.env.API_KEY || 'your-secret-key';
   
   app.use('/api', (req, res, next) => {
       if (req.headers['x-api-key'] !== apiKey) {
           return res.status(401).json({ error: 'Unauthorized' });
       }
       next();
   });
   ```

2. **Rate Limiting**
   ```bash
   npm install express-rate-limit
   ```
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
       windowMs: 15 * 60 * 1000, // 15 minutes
       max: 100 // limit each IP to 100 requests per windowMs
   });
   
   app.use('/api/', limiter);
   ```

3. **HTTPS Only**
   Use a reverse proxy (nginx, Apache) with SSL certificate

4. **Restrict CORS**
   ```javascript
   app.use(cors({
       origin: 'https://your-vr-app-domain.com'
   }));
   ```

## Troubleshooting

### Server won't start
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Port 3000 is already in use. Change port:
```bash
PORT=3001 npm start
```

### Files not saving
**Check**:
1. Server is running: `curl http://localhost:3000/api/health`
2. Directory permissions: Server needs write access to project folder
3. Console logs for error messages

### VR app can't reach server
**Check**:
1. Server is running on same machine/network
2. Firewall allows connections on port 3000
3. Browser console for CORS errors
4. Network tab in browser dev tools

### Large files causing issues
**Solution**: Increase JSON body limit in `server.js`:
```javascript
app.use(express.json({ limit: '100mb' })); // Increase from 50mb
```

## Data Analysis

### Python Example
```python
import json
import os

# Load all session files
data_dir = 'motion-data'
sessions = []

for filename in os.listdir(data_dir):
    if filename.endswith('.json'):
        with open(os.path.join(data_dir, filename)) as f:
            sessions.append(json.load(f))

print(f"Loaded {len(sessions)} sessions")

# Analyze first session
session = sessions[0]
head_speeds = [s['velocity']['magnitude'] 
               for s in session['devices']['head']['samples']]
print(f"Average head speed: {sum(head_speeds)/len(head_speeds):.2f} m/s")
```

### JavaScript Example
```javascript
const fs = require('fs');
const path = require('path');

// Load all sessions
const dataDir = './motion-data';
const files = fs.readdirSync(dataDir);

const sessions = files
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(
        fs.readFileSync(path.join(dataDir, f), 'utf8')
    ));

console.log(`Loaded ${sessions.length} sessions`);

// Analyze sessions
sessions.forEach(session => {
    const totalSamples = 
        session.devices.head.samples.length +
        session.devices.leftController.samples.length +
        session.devices.rightController.samples.length;
    
    console.log(`Session ${session.sessionId}: ${totalSamples} samples`);
});
```

## Deployment

### Deploy to Cloud Server

1. **Copy files to server**
   ```bash
   scp -r . user@server:/path/to/app/
   ```

2. **Install dependencies on server**
   ```bash
   ssh user@server
   cd /path/to/app/
   npm install --production
   ```

3. **Run with PM2 (process manager)**
   ```bash
   npm install -g pm2
   pm2 start server.js --name vr-motion-server
   pm2 save
   pm2 startup
   ```

4. **Setup reverse proxy (nginx)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Monitoring

### View Logs
```bash
# If using PM2
pm2 logs vr-motion-server

# If running directly
node server.js 2>&1 | tee server.log
```

### Check Disk Space
```bash
# Check motion-data folder size
du -sh motion-data/

# Count files
ls motion-data/*.json | wc -l
```

### Auto-cleanup Old Files
Add to `server.js`:
```javascript
// Delete files older than 30 days
const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

fs.readdir(MOTION_DATA_DIR, (err, files) => {
    files.forEach(file => {
        const filepath = path.join(MOTION_DATA_DIR, file);
        fs.stat(filepath, (err, stats) => {
            if (stats.mtime.getTime() < thirtyDaysAgo) {
                fs.unlink(filepath, () => 
                    console.log(`Deleted old file: ${file}`)
                );
            }
        });
    });
});
```
