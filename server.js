import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Support large motion data files
app.use(express.static('deploy')); // Serve the VR app

// Create motion-data directory if it doesn't exist
const MOTION_DATA_DIR = path.join(__dirname, 'motion-data');
fs.mkdir(MOTION_DATA_DIR, { recursive: true })
    .then(() => console.log('Motion data directory ready:', MOTION_DATA_DIR))
    .catch(err => console.error('Error creating motion data directory:', err));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Save motion tracking data
app.post('/api/save-motion-data', async (req, res) => {
    try {
        const motionData = req.body;
        
        // Validate data
        if (!motionData.sessionId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing sessionId' 
            });
        }

        // Generate filename
        const filename = `vr-motion-${motionData.sessionId}.json`;
        const filepath = path.join(MOTION_DATA_DIR, filename);

        // Save to file
        await fs.writeFile(filepath, JSON.stringify(motionData, null, 2), 'utf8');

        console.log(`[Server] Motion data saved: ${filename}`);
        console.log(`[Server] Total samples: ${
            (motionData.devices?.head?.samples?.length || 0) +
            (motionData.devices?.leftController?.samples?.length || 0) +
            (motionData.devices?.rightController?.samples?.length || 0)
        }`);

        res.json({ 
            success: true, 
            filename,
            filepath,
            message: 'Motion data saved successfully'
        });

    } catch (error) {
        console.error('[Server] Error saving motion data:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// List all saved motion data files
app.get('/api/motion-data/list', async (req, res) => {
    try {
        const files = await fs.readdir(MOTION_DATA_DIR);
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        
        // Get file stats
        const fileDetails = await Promise.all(
            jsonFiles.map(async (filename) => {
                const filepath = path.join(MOTION_DATA_DIR, filename);
                const stats = await fs.stat(filepath);
                return {
                    filename,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime
                };
            })
        );

        res.json({ 
            success: true, 
            files: fileDetails,
            count: fileDetails.length
        });

    } catch (error) {
        console.error('[Server] Error listing files:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Get specific motion data file
app.get('/api/motion-data/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        
        // Validate filename (security)
        if (!filename.match(/^vr-motion-[\w-]+\.json$/)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid filename format' 
            });
        }

        const filepath = path.join(MOTION_DATA_DIR, filename);
        const data = await fs.readFile(filepath, 'utf8');

        res.json({ 
            success: true, 
            data: JSON.parse(data) 
        });

    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ 
                success: false, 
                error: 'File not found' 
            });
        } else {
            console.error('[Server] Error reading file:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }
});

// Delete motion data file
app.delete('/api/motion-data/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        
        // Validate filename (security)
        if (!filename.match(/^vr-motion-[\w-]+\.json$/)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid filename format' 
            });
        }

        const filepath = path.join(MOTION_DATA_DIR, filename);
        await fs.unlink(filepath);

        console.log(`[Server] Deleted motion data: ${filename}`);

        res.json({ 
            success: true, 
            message: 'File deleted successfully' 
        });

    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ 
                success: false, 
                error: 'File not found' 
            });
        } else {
            console.error('[Server] Error deleting file:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }
});

// Export all motion data as ZIP (optional enhancement)
app.get('/api/motion-data/export/all', async (req, res) => {
    try {
        const files = await fs.readdir(MOTION_DATA_DIR);
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        
        if (jsonFiles.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'No motion data files found' 
            });
        }

        // For now, just return the list
        // TODO: Implement ZIP compression if needed
        res.json({ 
            success: true, 
            message: 'Use /api/motion-data/:filename to download individual files',
            files: jsonFiles
        });

    } catch (error) {
        console.error('[Server] Error exporting files:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`VR Balance Mobility Trainer Server`);
    console.log(`=================================`);
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Motion data saved to: ${MOTION_DATA_DIR}`);
    console.log(`=================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\nSIGINT received, shutting down gracefully...');
    process.exit(0);
});
