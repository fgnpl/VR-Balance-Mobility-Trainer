import {Component, Property} from '@wonderlandengine/api';

/**
 * collision-debug
 * 
 * Attach to any object to debug collision events.
 * Shows when collisions are detected and what objects are colliding.
 */
export class CollisionDebug extends Component {
    static TypeName = 'collision-debug';
    static Properties = {
        logName: Property.string('CollisionDebug'),
        showEnter: Property.bool(true),
        showExit: Property.bool(false),
    };

    start() {
        console.log(`[${this.logName}] Collision debug active on:`, this.object.name);
        
        // Check if object has collision component
        const collision = this.object.getComponent('collision');
        if (!collision) {
            console.error(`[${this.logName}] ❌ NO COLLISION COMPONENT on ${this.object.name}!`);
            console.error(`[${this.logName}] Add a 'collision' component in the editor for physics to work!`);
        } else {
            console.log(`[${this.logName}] ✅ Collision component found`);
            console.log(`[${this.logName}] Collision settings:`, {
                collider: collision.collider,
                group: collision.group,
                extents: collision.extents
            });
        }
        
        // List all components on this object
        console.log(`[${this.logName}] Components on ${this.object.name}:`);
        const components = this.object.getComponents();
        components.forEach(comp => {
            console.log(`  - ${comp.type}`);
        });
    }

    onCollisionEnter(other) {
        if (!this.showEnter) return;
        
        console.log(`[${this.logName}] 🔴 COLLISION ENTER!`);
        console.log(`  This object: ${this.object.name}`);
        console.log(`  Other object: ${other.object?.name || 'unknown'}`);
        console.log(`  Other components:`, other.object?.getComponents().map(c => c.type));
    }

    onCollisionExit(other) {
        if (!this.showExit) return;
        
        console.log(`[${this.logName}] 🔵 COLLISION EXIT`);
        console.log(`  This object: ${this.object.name}`);
        console.log(`  Other object: ${other.object?.name || 'unknown'}`);
    }
}
