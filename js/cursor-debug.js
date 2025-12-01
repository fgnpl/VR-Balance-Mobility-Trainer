import {Component} from '@wonderlandengine/api';

/**
 * Cursor Debug Helper
 * 
 * Add this component to any object to diagnose cursor ray issues.
 * It will log cursor information to the console.
 * 
 * To use:
 * 1. Add this component to Manager or any active object
 * 2. Build and deploy
 * 3. Check browser console (F12) for debug output
 */
export class CursorDebug extends Component {
    static TypeName = 'cursor-debug';

    start() {
        console.log('=== CURSOR DEBUG START ===');
        
        // Wait a bit for scene to fully load
        setTimeout(() => this.checkCursors(), 2000);
    }

    checkCursors() {
        console.log('\n=== Checking Cursor Setup ===');
        
        // Find cursor objects
        const cursorLeft = this.engine.scene.findByName('CursorLeft')[0];
        const cursorRight = this.engine.scene.findByName('CursorRight')[0];
        
        console.log('CursorLeft found:', !!cursorLeft);
        console.log('CursorRight found:', !!cursorRight);
        
        if (cursorLeft) {
            this.debugCursor(cursorLeft, 'LEFT');
        } else {
            console.error('❌ CursorLeft object not found!');
        }
        
        if (cursorRight) {
            this.debugCursor(cursorRight, 'RIGHT');
        } else {
            console.error('❌ CursorRight object not found!');
        }
        
        // Check controllers
        const controllerLeft = this.engine.scene.findByName('ControllerLeft')[0];
        const controllerRight = this.engine.scene.findByName('ControllerRight')[0];
        
        console.log('\n=== Controllers ===');
        console.log('ControllerLeft found:', !!controllerLeft);
        console.log('ControllerRight found:', !!controllerRight);
        
        if (controllerLeft) {
            const pos = controllerLeft.getPositionWorld();
            console.log('ControllerLeft position:', pos);
        }
        
        if (controllerRight) {
            const pos = controllerRight.getPositionWorld();
            console.log('ControllerRight position:', pos);
        }
        
        console.log('\n=== Check Complete ===');
        console.log('If rays not visible, see VR-CURSOR-TROUBLESHOOTING.md');
    }

    debugCursor(cursorObj, side) {
        console.log(`\n--- Cursor ${side} ---`);
        
        // Check components
        const cursorComp = cursorObj.getComponent('cursor');
        const inputComp = cursorObj.getComponent('input');
        const vrSwitch = cursorObj.getComponent('vr-mode-active-switch');
        
        console.log(`Has cursor component: ${!!cursorComp}`);
        console.log(`Has input component: ${!!inputComp}`);
        console.log(`Has vr-mode-active-switch: ${!!vrSwitch}`);
        
        if (cursorComp) {
            console.log(`cursorRayObject set: ${cursorComp.cursorRayObject !== null}`);
            
            if (cursorComp.cursorRayObject) {
                const rayObj = cursorComp.cursorRayObject;
                console.log(`Ray object name: ${rayObj.name}`);
                console.log(`Ray object active: ${rayObj.active}`);
                
                // Check for mesh in ray or children
                this.checkRayMesh(rayObj);
            } else {
                console.error(`❌ No cursorRayObject assigned!`);
            }
        }
        
        if (inputComp) {
            console.log(`Input type: ${inputComp.type || 'unknown'}`);
        }
        
        // Check position
        const pos = cursorObj.getPositionWorld();
        console.log(`Position: [${pos[0].toFixed(3)}, ${pos[1].toFixed(3)}, ${pos[2].toFixed(3)}]`);
        
        // Check parent
        const parent = cursorObj.parent;
        console.log(`Parent: ${parent ? parent.name : 'null'}`);
    }

    checkRayMesh(rayObj) {
        console.log(`\nChecking ray mesh hierarchy:`);
        
        // Check ray object itself
        const rayMesh = rayObj.getComponent('mesh');
        if (rayMesh) {
            console.log(`✅ Ray object has mesh component`);
            console.log(`  Material: ${rayMesh.material ? rayMesh.material.name || 'unnamed' : 'NULL'}`);
            console.log(`  Mesh: ${rayMesh.mesh ? 'assigned' : 'NULL'}`);
        } else {
            console.log(`Ray object no mesh, checking children...`);
        }
        
        // Check children
        const children = rayObj.children;
        console.log(`Ray object has ${children.length} children`);
        
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            console.log(`  Child ${i}: ${child.name}`);
            
            const childMesh = child.getComponent('mesh');
            if (childMesh) {
                console.log(`    ✅ Has mesh component`);
                console.log(`    Material: ${childMesh.material ? childMesh.material.name || 'unnamed' : 'NULL'}`);
                console.log(`    Active: ${child.active}`);
                
                const scale = child.getScalingLocal();
                console.log(`    Scale: [${scale[0].toFixed(4)}, ${scale[1].toFixed(4)}, ${scale[2].toFixed(4)}]`);
                
                if (scale[1] < 0.01) {
                    console.warn(`    ⚠️ Scale Y is very small (${scale[1]}), ray might be invisible!`);
                }
            }
        }
    }

    update(dt) {
        // Optional: continuously log cursor positions
        // Uncomment to debug tracking in real-time
        /*
        const cursorLeft = this.engine.scene.findByName('CursorLeft')[0];
        if (cursorLeft) {
            const pos = cursorLeft.getPositionWorld();
            console.log('CursorLeft:', pos);
        }
        */
    }
}
