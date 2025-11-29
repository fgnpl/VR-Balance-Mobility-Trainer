import {Component, Property} from '@wonderlandengine/api';
import {vec3} from 'gl-matrix';

/**
 * BallThrower: Spawns balls at intervals that fly towards the player
 * Player must catch or deflect them with controllers
 */
export class BallThrower extends Component {
    static TypeName = 'ball-thrower';
    
    static Properties = {
        ballPrefab: Property.object(),
        playerObject: Property.object(),
        maxBalls: Property.int(15),
        spawnInterval: Property.float(2.0), // seconds between spawns
        ballSpeed: Property.float(3.0), // meters per second
        spawnRadius: Property.float(3.0), // distance from player to spawn
        spawnHeightMin: Property.float(1.0),
        spawnHeightMax: Property.float(2.5),
        dataManager: Property.object(),
    };

    start() {
        this.running = false;
        this.ballsThrown = 0;
        this.ballsCaught = 0;
        this.ballsDeflected = 0;
        this.ballsMissed = 0;
        this.activeBalls = [];
        this.nextSpawnTime = 0;
        
        if (this.ballPrefab) {
            this.ballPrefab.active = false;
        }
    }

    startDrill() {
        console.log('[BallThrower] Starting drill');
        this.running = true;
        this.ballsThrown = 0;
        this.ballsCaught = 0;
        this.ballsDeflected = 0;
        this.ballsMissed = 0;
        this.nextSpawnTime = 0;
        
        // Clear any existing balls
        this.activeBalls.forEach(ball => ball.destroy());
        this.activeBalls = [];
    }

    endDrill() {
        console.log('[BallThrower] Ending drill');
        this.running = false;
        
        // Clear all active balls
        this.activeBalls.forEach(ball => ball.destroy());
        this.activeBalls = [];
        
        const total = this.ballsCaught + this.ballsDeflected + this.ballsMissed;
        const accuracy = total > 0 ? ((this.ballsCaught + this.ballsDeflected) / total) * 100 : 0;
        
        console.log(`[BallThrower] Results - Caught: ${this.ballsCaught}, Deflected: ${this.ballsDeflected}, Missed: ${this.ballsMissed}, Accuracy: ${accuracy.toFixed(1)}%`);
        
        return {
            ballsThrown: this.ballsThrown,
            ballsCaught: this.ballsCaught,
            ballsDeflected: this.ballsDeflected,
            ballsMissed: this.ballsMissed,
            accuracy: accuracy
        };
    }

    update(dt) {
        if (!this.running || !this.playerObject) return;

        this.nextSpawnTime -= dt;
        
        // Spawn new ball if it's time and haven't reached max
        if (this.nextSpawnTime <= 0 && this.ballsThrown < this.maxBalls) {
            this.spawnBall();
            this.nextSpawnTime = this.spawnInterval;
        }

        // Update active balls and check for missed balls
        this.activeBalls = this.activeBalls.filter(ball => {
            if (!ball || !ball.active) return false;
            
            // Check if ball went too far behind player (missed)
            const ballPos = ball.getPositionWorld();
            const playerPos = this.playerObject.getPositionWorld();
            
            // If ball is more than 3 meters behind player, count as missed
            const behindDist = playerPos[2] - ballPos[2];
            if (behindDist > 3.0 || ballPos[1] < -1.0) {
                this.onBallMissed(ball);
                ball.destroy();
                return false;
            }
            
            return true;
        });

        // End drill if all balls thrown and none active
        if (this.ballsThrown >= this.maxBalls && this.activeBalls.length === 0) {
            this.endDrill();
        }
    }

    spawnBall() {
        if (!this.ballPrefab || !this.playerObject) return;

        const ball = this.ballPrefab.clone(this.object);
        ball.active = true;

        // Get player position
        const playerPos = this.playerObject.getPositionWorld();

        // Random spawn position around player
        const angle = Math.random() * Math.PI * 2; // Random angle
        const heightVariation = this.spawnHeightMin + Math.random() * (this.spawnHeightMax - this.spawnHeightMin);
        
        const spawnX = playerPos[0] + Math.cos(angle) * this.spawnRadius;
        const spawnY = heightVariation;
        const spawnZ = playerPos[2] + Math.sin(angle) * this.spawnRadius;

        ball.setPositionWorld([spawnX, spawnY, spawnZ]);
        ball.spawnTime = performance.now();

        // Calculate velocity towards player (aim slightly ahead for challenge)
        const direction = vec3.sub(vec3.create(), playerPos, [spawnX, spawnY, spawnZ]);
        vec3.normalize(direction, direction);
        vec3.scale(direction, direction, this.ballSpeed);
        
        ball.velocity = direction;
        ball.isCaught = false;
        ball.isDeflected = false;

        // Add ball-collision component
        let collision = ball.getComponent('ball-collision');
        if (!collision) {
            collision = ball.addComponent('ball-collision');
        }
        collision.thrower = this;

        this.activeBalls.push(ball);
        this.ballsThrown++;

        console.log(`[BallThrower] Ball ${this.ballsThrown} spawned at ${spawnX.toFixed(1)}, ${spawnY.toFixed(1)}, ${spawnZ.toFixed(1)}`);
    }

    onBallCaught(ball) {
        if (ball.isCaught || ball.isDeflected) return;
        ball.isCaught = true;
        this.ballsCaught++;
        
        // Log to data manager
        const dm = this.dataManager?.getComponent('data-manager');
        dm?.addBallResult('caught');
        
        console.log('[BallThrower] Ball caught!');
    }

    onBallDeflected(ball) {
        if (ball.isCaught || ball.isDeflected) return;
        ball.isDeflected = true;
        this.ballsDeflected++;
        
        // Log to data manager
        const dm = this.dataManager?.getComponent('data-manager');
        dm?.addBallResult('deflected');
        
        console.log('[BallThrower] Ball deflected!');
    }

    onBallMissed(ball) {
        if (ball.isCaught || ball.isDeflected) {
            return; // Already counted
        }
        this.ballsMissed++;
        
        // Log to data manager
        const dm = this.dataManager?.getComponent('data-manager');
        dm?.addBallResult('missed');
        
        console.log('[BallThrower] Ball missed!');
    }
}
