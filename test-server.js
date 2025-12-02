// Test script for VR Motion Tracker Server
// Run with: node test-server.js

const testServerAPI = async () => {
    const BASE_URL = 'http://localhost:3000';
    
    console.log('=================================');
    console.log('VR Motion Tracker Server Test');
    console.log('=================================\n');

    // Test 1: Health Check
    console.log('Test 1: Health Check');
    try {
        const response = await fetch(`${BASE_URL}/api/health`);
        const data = await response.json();
        console.log('✅ Server is running');
        console.log('   Status:', data.status);
        console.log('   Timestamp:', data.timestamp);
    } catch (error) {
        console.log('❌ Server is not running');
        console.log('   Make sure to start server with: npm start');
        return;
    }

    // Test 2: Save Motion Data
    console.log('\nTest 2: Save Motion Data');
    const testData = {
        sessionId: `test-${Date.now()}`,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        samplingRate: 10,
        devices: {
            head: {
                enabled: true,
                samples: [
                    {
                        time: 0.0,
                        position: { x: 0.0, y: 1.6, z: 0.0 },
                        rotation: { x: 0.0, y: 0.0, z: 0.0, w: 1.0 },
                        velocity: { x: 0.0, y: 0.0, z: 0.0, magnitude: 0.0 },
                        acceleration: { x: 0.0, y: 0.0, z: 0.0, magnitude: 0.0 }
                    },
                    {
                        time: 0.1,
                        position: { x: 0.1, y: 1.6, z: 0.0 },
                        rotation: { x: 0.0, y: 0.1, z: 0.0, w: 0.995 },
                        velocity: { x: 1.0, y: 0.0, z: 0.0, magnitude: 1.0 },
                        acceleration: { x: 10.0, y: 0.0, z: 0.0, magnitude: 10.0 }
                    }
                ]
            },
            leftController: { enabled: true, samples: [] },
            rightController: { enabled: true, samples: [] }
        }
    };

    try {
        const response = await fetch(`${BASE_URL}/api/save-motion-data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Test data saved successfully');
            console.log('   Filename:', result.filename);
            console.log('   Path:', result.filepath);
        } else {
            console.log('❌ Failed to save data');
            console.log('   Error:', result.error);
        }
    } catch (error) {
        console.log('❌ Error saving data:', error.message);
    }

    // Test 3: List Files
    console.log('\nTest 3: List Files');
    try {
        const response = await fetch(`${BASE_URL}/api/motion-data/list`);
        const data = await response.json();
        
        if (data.success) {
            console.log(`✅ Found ${data.count} file(s)`);
            data.files.forEach(file => {
                console.log(`   - ${file.filename} (${(file.size / 1024).toFixed(2)} KB)`);
            });
        } else {
            console.log('❌ Failed to list files');
        }
    } catch (error) {
        console.log('❌ Error listing files:', error.message);
    }

    // Test 4: Get Specific File
    console.log('\nTest 4: Get Specific File');
    try {
        const listResponse = await fetch(`${BASE_URL}/api/motion-data/list`);
        const listData = await listResponse.json();
        
        if (listData.files.length > 0) {
            const filename = listData.files[0].filename;
            const response = await fetch(`${BASE_URL}/api/motion-data/${filename}`);
            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Successfully retrieved file');
                console.log('   Session ID:', data.data.sessionId);
                console.log('   Sampling Rate:', data.data.samplingRate);
                const totalSamples = 
                    data.data.devices.head.samples.length +
                    data.data.devices.leftController.samples.length +
                    data.data.devices.rightController.samples.length;
                console.log('   Total Samples:', totalSamples);
            }
        } else {
            console.log('⚠️  No files to retrieve');
        }
    } catch (error) {
        console.log('❌ Error retrieving file:', error.message);
    }

    console.log('\n=================================');
    console.log('All tests completed!');
    console.log('=================================');
};

// Run tests
testServerAPI().catch(console.error);
