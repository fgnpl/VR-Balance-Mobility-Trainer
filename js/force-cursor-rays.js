import {Component} from '@wonderlandengine/api';

/**
 * Force Cursor Rays Visible
 * 
 * Emergency component to force cursor rays to be visible in VR.
 * Attach to Manager object if cursors still not visible after other fixes.
 */
export class ForceCursorRays extends Component {
    static TypeName = 'force-cursor-rays';

    start() {
        console.log('[ForceCursorRays] Starting cursor ray force-enable...');
        
        // Wait for scene to fully load
        setTimeout(() => this.enableRays(), 2000);
    }

    enableRays() {
        const cursors = ['CursorLeft', 'CursorRight'];
        
        for (const name of cursors) {
            const cursor = this.engine.scene.findByName(name)[0];
            if (!cursor) {
                console.error(`[ForceCursorRays] ${name} not found!`);
                continue;
            }
            
            console.log(`[ForceCursorRays] Processing ${name}...`);
            
            // Make cursor active
            cursor.active = true;
            
            // Get cursor component
            const cursorComp = cursor.getComponent('cursor');
            if (!cursorComp) {
                console.error(`[ForceCursorRays] ${name} has no cursor component!`);
                continue;
            }
            
            // Check ray object
            if (!cursorComp.cursorRayObject) {
                console.error(`[ForceCursorRays] ${name} has no cursorRayObject assigned!`);
                continue;
            }
            
            const ray = cursorComp.cursorRayObject;
            console.log(`[ForceCursorRays] Ray object: ${ray.name}`);
            
            // Force ray active
            ray.active = true;
            
            // Check mesh
            const mesh = ray.getComponent('mesh');
            if (!mesh) {
                console.error(`[ForceCursorRays] Ray object ${ray.name} has no mesh component!`);
                continue;
            }
            
            // Force mesh active
            mesh.active = true;
            
            // Check material
            if (!mesh.material) {
                console.error(`[ForceCursorRays] Ray mesh has no material!`);
            } else {
                console.log(`[ForceCursorRays] Ray material: ${mesh.material.name || 'unnamed'}`);
            }
            
            // Check scale
            const scale = ray.getScalingLocal();
            console.log(`[ForceCursorRays] Ray scale: [${scale[0]}, ${scale[1]}, ${scale[2]}]`);
            
            if (scale[1] < 0.1) {
                console.warn(`[ForceCursorRays] Ray Y-scale is very small (${scale[1]})! Setting to 10.0`);
                ray.setScalingLocal([scale[0], 10.0, scale[2]]);
            }
            
            console.log(`[ForceCursorRays] ✅ ${name} ray enabled and visible`);
        }
        
        console.log('[ForceCursorRays] Complete! Rays should be visible now.');
    }

    update(dt) {
        // Continuously ensure rays are visible (optional - remove if causing issues)
        // Uncomment if rays keep disappearing:
        /*
        const cursors = ['CursorLeft', 'CursorRight'];
        for (const name of cursors) {
            const cursor = this.engine.scene.findByName(name)[0];
            if (cursor) {
                const cursorComp = cursor.getComponent('cursor');
                if (cursorComp && cursorComp.cursorRayObject) {
                    cursorComp.cursorRayObject.active = true;
                }
            }
        }
        */
    }
}
