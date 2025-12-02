import { CollisionEventType, Component, Property } from '@wonderlandengine/api';

export class BouncingBall extends Component {
    static TypeName = 'bouncing-ball';
    
    // Configuration for where the ball can spawn and forces
    static Properties = {
        maxSpawn: Property.int(2),
        minX: Property.float(-0.5),
        maxX: Property.float(0.5),
        minY: Property.float(1.5),
        maxY: Property.float(2.5),
        spawnZ: Property.float(-3.0),
        minForceX: Property.float(50.0),
        maxForceX: Property.float(100.0),
        minForceZ: Property.float(250.0),
        maxForceZ: Property.float(300.0),

        // UI properties
        endPanel: Property.object(),        // Parent object (the panel)
        scoreText: Property.object(),       // Text object (child of the panel)
        panelVisiblePos: Property.object(), // Location object where panel should appear
        
        // Game Objects
        batObject: Property.object(),       // Reference to the Bat
    };

    init() {
        this.groundTimer = 0;
        this.nSpawned = 0;
        this.hitCount = 0;
        // Initialize a flag to prevent updates during spawn
        this.isSpawning = false;
        
        // Flag to ensure we only count one hit per air-time
        this.canRegisterHit = false;
        
        // State tracking
        this.gameRunning = false;

        // Coordinates for panel when hidden (Teleportation logic)
        this.hiddenPosition = [0, -50, 0];
    }

    start() {
        this.rigidBody = this.object.getComponent('physx');

        // 1. Initialize Game State: Disable Bat/Ball physics/mesh so they aren't active in the menu
        this.setGameComponentsActive(false);
        
        // 2. SHOW the panel at the start (Start Menu)
        if (this.endPanel) {
            this.endPanel.active = true;
            
            // Move panel to the visible position immediately
            if (this.panelVisiblePos) {
                this.endPanel.setPositionWorld(this.panelVisiblePos.getPositionWorld());
            }
        }

        // Optional: Set the text to something inviting for the start
        if (this.scoreText) {
            const textComp = this.scoreText.getComponent('text');
            if (textComp) {
                textComp.text = "Ready?";
            }
        }

        // NOTE: We do NOT call this.startGame() here. We wait for the button click.

        this.object.getComponent('physx').onCollision((type, other) => {
           if (type === CollisionEventType.Touch) { 
                this.onCollision(other);
           }
        })
    }

    /**
     * Dedicated function to start the game.
     * Called by resetGame() when the button is clicked.
     */
    startGame() {
        this.nSpawned = 0;
        this.hitCount = 0;
        this.isSpawning = false;
        this.gameRunning = true;

        // Teleport Panel away
        this.hideGameOverPanel();

        // Start the loop
        this.respawn();
        
        // Enable Bat and Ball visuals/physics
        this.setGameComponentsActive(true);
    }

    /**
     * Helper to toggle Mesh and PhysX components on Ball and Bat.
     */
    setGameComponentsActive(isActive) {
        // Toggle Ball Components
        const ballMesh = this.object.getComponent('mesh');
        const ballPhysx = this.object.getComponent('physx');
        const ballTrail = this.object.getComponent('trail');
        
        if(ballMesh) ballMesh.active = isActive;
        if(ballPhysx) ballPhysx.active = isActive;
        if(ballTrail) ballTrail.active = isActive;

        // Toggle Bat Components
        if (this.batObject) {
            const batMesh = this.batObject.getComponent('mesh');
            const batPhysx = this.batObject.getComponent('physx');
            
            if(batMesh) batMesh.active = isActive;
            if(batPhysx) batPhysx.active = isActive;
        }
    }

    onCollision(other) {
        if (other.object.name === 'Baseball Bat') {
            if (this.canRegisterHit) {
                console.log("Bat hit");
                this.hitCount++;
                this.canRegisterHit = false;
            }
        }
    }

    update(dt) {
        if (!this.gameRunning) return;
        if (this.isSpawning) return;

        if (this.isStill()) {
            this.canRegisterHit = false;
            this.groundTimer += dt;
            
            if (this.groundTimer >= 0.1) {
                const trail = this.object.getComponent('trail');
                if(trail) trail.active = false;
                
                this.respawn();
            }
        } else {
            this.groundTimer = 0;
        }
    }

    respawn() {                
        if (this.nSpawned >= this.maxSpawn) {
            this.showGameOver();
            return;
        }

        this.isSpawning = true;
        this.groundTimer = 0;
        this.canRegisterHit = false;

        const randomX = Math.random() * (this.maxX - this.minX) + this.minX;
        const randomY = Math.random() * (this.maxY - this.minY) + this.minY;

        this.rigidBody.kinematic = true;
        
        this.object.setPositionWorld([randomX, randomY, this.spawnZ]);
        
        const trail = this.object.getComponent('trail');
        if(trail) trail.active = true; 

        setTimeout(() => {
            if(this.rigidBody && this.gameRunning) {
                this.rigidBody.kinematic = false;
                this.applyRandomForce();
                this.isSpawning = false;
                this.canRegisterHit = true;
            }
        }, 100);

        this.nSpawned++;
    }

    applyRandomForce() {
        const randomForceX = (Math.random() * (this.maxForceX - this.minForceX) + this.minForceX) 
                           * (Math.random() < 0.5 ? -1 : 1);
        const randomForceZ = Math.random() * (this.maxForceZ - this.minForceZ) + this.minForceZ;
        this.rigidBody.addForce([randomForceX, 0, randomForceZ]);
    }

    // Logic for panel teleporting
    showGameOver() {
        console.log("Game over. Hits: " + this.hitCount);
        this.gameRunning = false;

        // Disable Bat and Ball physics/mesh so they don't interfere with UI
        this.setGameComponentsActive(false);
        
        if (this.scoreText) {
            const textComp = this.scoreText.getComponent('text');
            if (textComp) {
                textComp.text = `Hits: ${this.hitCount} / ${this.maxSpawn}`;
            }
        }

        // Teleport the panel from under the map to the visible position
        if (this.endPanel && this.panelVisiblePos) {
            this.endPanel.setPositionWorld(this.panelVisiblePos.getPositionWorld());
        }
    }

    hideGameOverPanel() {
        // Teleport the panel deep under the map
        if (this.endPanel) {
            this.endPanel.setPositionWorld(this.hiddenPosition);
        }
    }

    resetGame() {
        this.startGame();
    }

    isStill() {
        if(!this.rigidBody) return false;
        const v = this.rigidBody.linearVelocity;
        return (v[0] == 0 && v[1] == 0 && v[2] == 0);
    }
}