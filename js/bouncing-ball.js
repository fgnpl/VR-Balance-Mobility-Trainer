import { CollisionEventType, Component, Property } from '@wonderlandengine/api';

export class BouncingBall extends Component {
    static TypeName = 'bouncing-ball';
    
    // Configuration for where the ball can spawn and forces
    static Properties = {
        maxSpawn: Property.int(2),
        minX: Property.float(-0.5),
        maxX: Property.float(0.5),
        minY: Property.float(4),
        maxY: Property.float(5),
        spawnZ: Property.float(-5.0),
        minForceX: Property.float(50.0),
        maxForceX: Property.float(80.0),
        minForceZ: Property.float(150.0),
        maxForceZ: Property.float(200.0),

        // Game objects
        batObject: Property.object(),       // Reference to the bat
        
        // Game selector for unified UI
        gameSelector: Property.object(),
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
    }

    start() {
        this.rigidBody = this.object.getComponent('physx');

        // Initialize game State: disable bat/ball physics/mesh so they aren't active in the menu
        this.setGameComponentsActive(false);
        
        // Get game selector reference
        if (!this.gameSelector) {
            const manager = this.engine.scene.findByName('Manager')[0];
            if (manager) {
                this.gameSelector = manager.getComponent('game-selector');
            }
        }

        this.object.getComponent('physx').onCollision((type, other) => {
           if (type === CollisionEventType.Touch) { 
                this.onCollision(other);
           }
        })
    }
    
    updateUI() {
        const gs = this.gameSelector?.getComponent?.('game-selector') || this.gameSelector;
        if (gs) {
            gs.updateCue?.(`Ball ${this.nSpawned} / ${this.maxSpawn}`);
            gs.updateStats?.(`Hits: ${this.hitCount} / ${this.nSpawned}`);
        }
    }

    // Dedicated function to start the game
    // Called by game-selector when the button is clicked
    startGame() {
        // Make sure components are hidden before starting
        this.setGameComponentsActive(false);
        
        setTimeout(() => {
            this.nSpawned = 0;
            this.hitCount = 0;
            this.isSpawning = false;
            this.gameRunning = true;

            // Enable bat and ball visuals/physics
            this.setGameComponentsActive(true);

            // Update UI
            this.updateUI();

            // Start the loop
            this.respawn();
        }, 1000);
    }

    // Helper to toggle mesh and physx components on the ball and bat
    setGameComponentsActive(isActive) {
        // Toggle ball components
        const ballMesh = this.object.getComponent('mesh');
        const ballPhysx = this.object.getComponent('physx');
        const ballTrail = this.object.getComponent('trail');
        
        if(ballMesh) ballMesh.active = isActive;
        if(ballPhysx) ballPhysx.active = isActive;
        // Toggle bat components
        if (this.batObject) {
            const batMesh = this.batObject.getComponent('mesh');
            const batPhysx = this.batObject.getComponent('physx');
            
            if(batMesh) batMesh.active = isActive;
            if(batPhysx) batPhysx.active = isActive;
            this.batObject.active = isActive;
        }
        if(ballTrail) ballTrail.active = isActive;
    }

    // Registering hits with the baseball bats
    onCollision(other) {
        if (other.object.name === 'Baseball Bat') {
            if (this.canRegisterHit) {
                console.log("Bat hit");
                this.hitCount++;
                this.canRegisterHit = false;
                this.updateUI();
            }
        }
    }

    // Constant game motion tracking
    update(dt) {
        if (!this.gameRunning) return;
        if (this.isSpawning) return;

        if (this.isStill()) {
            this.groundTimer += dt;
            
            // If the ball is on the ground, respawn
            if (this.groundTimer >= 0.1) {
                this.canRegisterHit = false;
                const trail = this.object.getComponent('trail');
                if(trail) trail.active = false;
                
                this.respawn();
            }
        } else {
            this.groundTimer = 0;
        }
    }

    respawn() {       
        // If max number of spawns exceeded, game is over         
        if (this.nSpawned >= this.maxSpawn) {
            this.showGameOver();
            return;
        }

        this.isSpawning = true;
        this.groundTimer = 0;
        this.canRegisterHit = false;

        // Generating random coordinates
        const randomX = Math.random() * (this.maxX - this.minX) + this.minX;
        const randomY = Math.random() * (this.maxY - this.minY) + this.minY;

        // Setting to true for the ball to not fall under gravity
        this.rigidBody.kinematic = true;
        
        this.object.setPositionWorld([randomX, randomY, this.spawnZ]);
        
        // Spawning after small delay to avoid physics jitter
        setTimeout(() => {
            if(this.rigidBody && this.gameRunning) {
                this.rigidBody.kinematic = false;
                this.applyRandomForce();
                this.isSpawning = false;
                this.canRegisterHit = true;
            }
        }, 100);
        const trail = this.object.getComponent('trail');
        if(trail) trail.active = true; 

        this.nSpawned++;
        this.updateUI();
    }

    // Calculating and applying random force to the ball for it to fly towards the player
    applyRandomForce() {
        const randomForceX = (Math.random() * (this.maxForceX - this.minForceX) + this.minForceX) 
                           * (Math.random() < 0.5 ? -1 : 1);
        const randomForceZ = Math.random() * (this.maxForceZ - this.minForceZ) + this.minForceZ;
        this.rigidBody.addForce([randomForceX, 0, randomForceZ]);
    }

    showGameOver() {
        console.log("Game over. Hits: " + this.hitCount);
        this.gameRunning = false;

        // Disable bat and ball physics/mesh so they don't interfere with UI
        this.setGameComponentsActive(false);
        
        // Save data to data manager
        const manager = this.engine.scene.findByName('Manager')[0];
        if (manager) {
            const dm = manager.getComponent('data-manager');
            if (dm) {
                dm.addDeflectGame(this.maxSpawn, this.hitCount);
            }
        }
        
        // Update UI with final results
        const gs = this.gameSelector?.getComponent?.('game-selector') || this.gameSelector;
        if (gs) {
            const accuracy = this.maxSpawn > 0 ? ((this.hitCount / this.maxSpawn) * 100).toFixed(0) : 0;
            gs.updateStatus?.('Deflect: COMPLETE');
            gs.updateCue?.('Game Over!');
            gs.updateStats?.(`Final: ${this.hitCount} / ${this.maxSpawn} hits (${accuracy}%)`);
        }
    }

    resetGame() {
        this.startGame();
    }

    // Checking if the velocity is zero (works experimentally even with float numbers)
    isStill() {
        if(!this.rigidBody) return false;
        const v = this.rigidBody.linearVelocity;
        return (v[0] == 0 && v[1] == 0 && v[2] == 0);
    }
}