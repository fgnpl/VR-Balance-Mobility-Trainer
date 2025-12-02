import {Component, Property} from '@wonderlandengine/api';
import {vec3, quat} from 'gl-matrix';

/**
 * VR Motion Tracker
 * Tracks position, velocity, and acceleration for VR headset and controllers.
 * Saves session data to JSON files.
 * 
 * SETUP:
 * 1. Attach to a manager object (e.g., the same object with game-selector)
 * 2. Link headObject (usually EyeLeft or camera)
 * 3. Link leftController and rightController objects
 * 4. Set recordingInterval (default 100ms = 10Hz sampling rate)
 * 5. Enable/disable tracking per device as needed
 */
export class VrMotionTracker extends Component {
    static TypeName = 'vr-motion-tracker';

    static Properties = {
        // Objects to track
        headObject: Property.object(),
        leftController: Property.object(),
        rightController: Property.object(),
        
        // Recording settings
        recordingInterval: Property.float(0.1), // Sample every 100ms (10Hz)
        trackHead: Property.bool(true),
        trackLeftController: Property.bool(true),
        trackRightController: Property.bool(true),
        
        // Auto-start recording when VR starts
        autoStart: Property.bool(true),
        
        // Debug logging
        debugMode: Property.bool(false),
    };

    init() {
        // Generate unique session ID
        this.sessionId = this._generateSessionId();
        
        // Session data storage
        this.sessionData = {
            sessionId: this.sessionId,
            startTime: null,
            endTime: null,
            samplingRate: 1.0 / this.recordingInterval,
            devices: {
                head: {
                    enabled: this.trackHead,
                    samples: []
                },
                leftController: {
                    enabled: this.trackLeftController,
                    samples: []
                },
                rightController: {
                    enabled: this.trackRightController,
                    samples: []
                }
            }
        };

        // Previous frame data for velocity/acceleration calculation
        this.prevData = {
            head: { position: vec3.create(), velocity: vec3.create(), time: 0 },
            leftController: { position: vec3.create(), velocity: vec3.create(), time: 0 },
            rightController: { position: vec3.create(), velocity: vec3.create(), time: 0 }
        };

        // Recording state
        this.isRecording = false;
        this.lastSampleTime = 0;
        this.sessionStartTime = 0;
        
        // Auto-save state
        this.lastAutoSaveTime = 0;
        this.autoSaveInterval = 1.0; // Save every 1 second
        this.isSaving = false; // Prevent concurrent saves

        console.log(`[VrMotionTracker] Initialized - Session ID: ${this.sessionId}`);
    }

    start() {
        this._validateSetup();

        if (this.autoStart) {
            // Start recording after a brief delay to ensure everything is initialized
            setTimeout(() => {
                this.startRecording();
            }, 1000);
        }
    }

    _validateSetup() {
        const warnings = [];
        
        if (this.trackHead && !this.headObject) {
            warnings.push('Head tracking enabled but headObject not linked');
        }
        if (this.trackLeftController && !this.leftController) {
            warnings.push('Left controller tracking enabled but leftController not linked');
        }
        if (this.trackRightController && !this.rightController) {
            warnings.push('Right controller tracking enabled but rightController not linked');
        }

        if (warnings.length > 0) {
            console.warn('[VrMotionTracker] Setup warnings:', warnings.join(', '));
        }
    }

    update(dt) {
        if (!this.isRecording) return;

        const currentTime = performance.now() / 1000.0; // Convert to seconds
        const timeSinceLastSample = currentTime - this.lastSampleTime;

        // Check if it's time to record a new sample
        if (timeSinceLastSample >= this.recordingInterval) {
            this._recordSample(currentTime, dt);
            this.lastSampleTime = currentTime;
        }

        // Auto-save every second
        const timeSinceLastSave = currentTime - this.lastAutoSaveTime;
        if (timeSinceLastSave >= this.autoSaveInterval) {
            this._autoSaveToServer();
            this.lastAutoSaveTime = currentTime;
        }
    }

    _recordSample(currentTime, dt) {
        const sessionTime = currentTime - this.sessionStartTime;

        // Track head
        if (this.trackHead && this.headObject) {
            const data = this._calculateMotionData('head', this.headObject, currentTime, dt);
            if (data) {
                this.sessionData.devices.head.samples.push({
                    time: sessionTime,
                    ...data
                });
            }
        }

        // Track left controller
        if (this.trackLeftController && this.leftController) {
            const data = this._calculateMotionData('leftController', this.leftController, currentTime, dt);
            if (data) {
                this.sessionData.devices.leftController.samples.push({
                    time: sessionTime,
                    ...data
                });
            }
        }

        // Track right controller
        if (this.trackRightController && this.rightController) {
            const data = this._calculateMotionData('rightController', this.rightController, currentTime, dt);
            if (data) {
                this.sessionData.devices.rightController.samples.push({
                    time: sessionTime,
                    ...data
                });
            }
        }

        if (this.debugMode && Math.floor(sessionTime) % 5 === 0 && sessionTime > 0) {
            // Log every 5 seconds
            const totalSamples = 
                this.sessionData.devices.head.samples.length +
                this.sessionData.devices.leftController.samples.length +
                this.sessionData.devices.rightController.samples.length;
            console.log(`[VrMotionTracker] Recording... ${totalSamples} total samples at ${sessionTime.toFixed(1)}s`);
        }
    }

    _calculateMotionData(deviceName, object, currentTime, dt) {
        const prev = this.prevData[deviceName];
        
        // Get current world position
        const position = vec3.create();
        object.getPositionWorld(position);

        // Get current rotation (quaternion)
        const rotation = quat.create();
        object.getRotationWorld(rotation);

        // Calculate velocity (m/s)
        const velocity = vec3.create();
        if (prev.time > 0) {
            const timeDelta = currentTime - prev.time;
            if (timeDelta > 0) {
                vec3.subtract(velocity, position, prev.position);
                vec3.scale(velocity, velocity, 1.0 / timeDelta);
            }
        }

        // Calculate acceleration (m/s²)
        const acceleration = vec3.create();
        if (prev.time > 0) {
            const timeDelta = currentTime - prev.time;
            if (timeDelta > 0) {
                vec3.subtract(acceleration, velocity, prev.velocity);
                vec3.scale(acceleration, acceleration, 1.0 / timeDelta);
            }
        }

        // Calculate scalar magnitudes
        const speed = vec3.length(velocity);
        const accelerationMagnitude = vec3.length(acceleration);

        // Store current data for next frame
        vec3.copy(prev.position, position);
        vec3.copy(prev.velocity, velocity);
        prev.time = currentTime;

        return {
            position: {
                x: parseFloat(position[0].toFixed(4)),
                y: parseFloat(position[1].toFixed(4)),
                z: parseFloat(position[2].toFixed(4))
            },
            rotation: {
                x: parseFloat(rotation[0].toFixed(4)),
                y: parseFloat(rotation[1].toFixed(4)),
                z: parseFloat(rotation[2].toFixed(4)),
                w: parseFloat(rotation[3].toFixed(4))
            },
            velocity: {
                x: parseFloat(velocity[0].toFixed(4)),
                y: parseFloat(velocity[1].toFixed(4)),
                z: parseFloat(velocity[2].toFixed(4)),
                magnitude: parseFloat(speed.toFixed(4))
            },
            acceleration: {
                x: parseFloat(acceleration[0].toFixed(4)),
                y: parseFloat(acceleration[1].toFixed(4)),
                z: parseFloat(acceleration[2].toFixed(4)),
                magnitude: parseFloat(accelerationMagnitude.toFixed(4))
            }
        };
    }

    startRecording() {
        if (this.isRecording) {
            console.warn('[VrMotionTracker] Already recording');
            return;
        }

        this.isRecording = true;
        this.sessionStartTime = performance.now() / 1000.0;
        this.lastSampleTime = this.sessionStartTime;
        this.lastAutoSaveTime = this.sessionStartTime;
        this.sessionData.startTime = new Date().toISOString();

        // Reset previous data
        this.prevData.head.time = 0;
        this.prevData.leftController.time = 0;
        this.prevData.rightController.time = 0;

        console.log('[VrMotionTracker] Recording started at', this.sessionData.startTime);
        console.log('[VrMotionTracker] Auto-saving every', this.autoSaveInterval, 'second(s)');
    }

    stopRecording() {
        if (!this.isRecording) {
            console.warn('[VrMotionTracker] Not currently recording');
            return;
        }

        this.isRecording = false;
        this.sessionData.endTime = new Date().toISOString();

        const duration = (performance.now() / 1000.0) - this.sessionStartTime;
        console.log(`[VrMotionTracker] Recording stopped. Duration: ${duration.toFixed(2)}s`);

        // Automatically save when stopping
        this.saveToFile();
    }

    async _autoSaveToServer() {
        if (this.isSaving) return; // Prevent concurrent saves
        
        this.isSaving = true;
        
        try {
            // Update end time for current state
            this.sessionData.endTime = new Date().toISOString();
            
            const serverUrl = '/api/save-motion-data';
            
            if (this.debugMode) {
                const sampleCount = this.getSampleCount();
                console.log(`[VrMotionTracker] Auto-saving... (${sampleCount} samples)`);
            }

            const response = await fetch(serverUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.sessionData)
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Unknown server error');
            }

        } catch (error) {
            console.error('[VrMotionTracker] Auto-save failed:', error.message);
            // Don't fallback to download for auto-save failures
        } finally {
            this.isSaving = false;
        }
    }

    async saveToFile() {
        const filename = `vr-motion-${this.sessionData.sessionId}.json`;

        // Calculate statistics
        const stats = this._calculateStatistics();
        console.log('[VrMotionTracker] Session Statistics:', stats);

        // Send to server
        await this._sendToServer(filename);

        console.log(`[VrMotionTracker] Session data saved to server: ${filename}`);
        console.log(`Total samples: ${stats.totalSamples}`);
    }

    _calculateStatistics() {
        const stats = {
            totalSamples: 0,
            duration: 0,
            devices: {}
        };

        // Calculate per-device statistics
        for (const [deviceName, deviceData] of Object.entries(this.sessionData.devices)) {
            if (!deviceData.enabled || deviceData.samples.length === 0) {
                stats.devices[deviceName] = { enabled: false };
                continue;
            }

            const samples = deviceData.samples;
            stats.totalSamples += samples.length;

            // Calculate max speed and acceleration
            let maxSpeed = 0;
            let maxAcceleration = 0;
            let avgSpeed = 0;
            let avgAcceleration = 0;

            samples.forEach(sample => {
                const speed = sample.velocity.magnitude;
                const accel = sample.acceleration.magnitude;
                
                if (speed > maxSpeed) maxSpeed = speed;
                if (accel > maxAcceleration) maxAcceleration = accel;
                
                avgSpeed += speed;
                avgAcceleration += accel;
            });

            avgSpeed /= samples.length;
            avgAcceleration /= samples.length;

            stats.devices[deviceName] = {
                enabled: true,
                sampleCount: samples.length,
                maxSpeed: parseFloat(maxSpeed.toFixed(4)),
                avgSpeed: parseFloat(avgSpeed.toFixed(4)),
                maxAcceleration: parseFloat(maxAcceleration.toFixed(4)),
                avgAcceleration: parseFloat(avgAcceleration.toFixed(4))
            };
        }

        // Calculate duration
        if (this.sessionData.startTime && this.sessionData.endTime) {
            const start = new Date(this.sessionData.startTime);
            const end = new Date(this.sessionData.endTime);
            stats.duration = (end - start) / 1000.0; // seconds
        }

        return stats;
    }

    async _sendToServer(filename) {
        try {
            // Determine server URL (use relative path for same origin)
            const serverUrl = '/api/save-motion-data';

            console.log(`[VrMotionTracker] Sending data to server...`);

            const response = await fetch(serverUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.sessionData)
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.success) {
                console.log(`[VrMotionTracker] Successfully saved to server: ${result.filename}`);
                console.log(`[VrMotionTracker] Server filepath: ${result.filepath}`);
            } else {
                throw new Error(result.error || 'Unknown server error');
            }

        } catch (error) {
            console.error('[VrMotionTracker] Failed to send data to server:', error);
            console.error('[VrMotionTracker] Falling back to browser download...');
            
            // Fallback to browser download if server fails
            this._downloadJSON(filename, JSON.stringify(this.sessionData, null, 2));
        }
    }

    _downloadJSON(filename, jsonData) {
        try {
            // Create a blob from the JSON data
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            // Create a temporary download link
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';

            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the URL
            setTimeout(() => URL.revokeObjectURL(url), 100);

            console.log(`[VrMotionTracker] Fallback: Browser download initiated: ${filename}`);
        } catch (error) {
            console.error('[VrMotionTracker] Failed to download file:', error);
            console.log('[VrMotionTracker] JSON data:', jsonData);
        }
    }

    _generateSessionId() {
        // Generate a unique session ID using timestamp and random string
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        return `${timestamp}-${random}`;
    }

    // Public API methods
    getSessionData() {
        return this.sessionData;
    }

    clearSessionData() {
        console.log('[VrMotionTracker] Clearing session data');
        this.sessionData.devices.head.samples = [];
        this.sessionData.devices.leftController.samples = [];
        this.sessionData.devices.rightController.samples = [];
        this.sessionData.sessionId = this._generateSessionId();
        this.sessionData.startTime = null;
        this.sessionData.endTime = null;
    }

    getSampleCount() {
        return (
            this.sessionData.devices.head.samples.length +
            this.sessionData.devices.leftController.samples.length +
            this.sessionData.devices.rightController.samples.length
        );
    }

    onDestroy() {
        // Auto-save if still recording when component is destroyed
        if (this.isRecording) {
            console.log('[VrMotionTracker] Component destroyed while recording, auto-saving...');
            this.stopRecording();
        }
    }
}
