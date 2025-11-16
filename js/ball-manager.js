import {Component, Property} from '@wonderlandengine/api';
import {BallPhysics} from './ball-physics.js';

/**
 * ball-manager
 * Manages spawning balls at random speeds and angles for the catch mini-game
 */

console.log("ball-manager.js loaded");

export class BallManager extends Component {
    static TypeName = 'ball-manager';
    static Properties = {
        ballPrefab: Property.object(),
        maxBalls: Property.int(30),
        spawnInterval: Property.float(2.0), // seconds between spawns
        minSpeed: Property.float(2.0),
        maxSpeed: Property.float(6.0),
        spawnDistance: Property.float(5.0), // distance from player
        spawnHeight: Property.float(1.5) // average spawn height
    };
    
    start() {
        this.ballsSpawned = 0;
        this.ballsCaught = 0;
        this.ballsDeflected = 0;
        this.ballsMissed = 0;
        this.activeBalls = [];
        
        this.ballPrefab.active = false;
        
        // Start spawning balls
        this.scheduleNextBall();
        
        console.log("Ball Manager started");
    }

    scheduleNextBall() {
        if (this.ballsSpawned >= this.maxBalls) {
            // Check if game should end (all balls spawned and none active)
            this.checkGameEnd();
            return;
        }

        setTimeout(() => {
            this.spawnBall();
            this.scheduleNextBall();
        }, this.spawnInterval * 1000);
    }

    spawnBall() {
        this.ballsSpawned++;
        
        // Create new ball
        const ball = this.ballPrefab.clone(this.object);
        ball.active = true;
        this.activeBalls.push(ball);

        // Random spawn position (in front of player, slightly randomized)
        const angleVariation = (Math.random() - 0.5) * Math.PI / 3; // about 30 degrees
        const heightVariation = (Math.random() - 0.5) * 1.0; // about 0.5m
        
        const spawnX = Math.sin(angleVariation) * this.spawnDistance;
        const spawnY = this.spawnHeight + heightVariation;
        const spawnZ = -Math.cos(angleVariation) * this.spawnDistance;

        ball.setPositionWorld([spawnX, spawnY, spawnZ]);

        // Random velocity toward player (with some variation)
        const speed = this.minSpeed + Math.random() * (this.maxSpeed - this.minSpeed);
        const targetX = (Math.random() - 0.5) * 2.0; // Target area in front of player
        const targetY = 1.2 + (Math.random() - 0.5) * 0.8;
        const targetZ = -0.5;

        const dirX = targetX - spawnX;
        const dirY = targetY - spawnY;
        const dirZ = targetZ - spawnZ;
        const length = Math.sqrt(dirX*dirX + dirY*dirY + dirZ*dirZ);

        const velocityX = (dirX / length) * speed;
        const velocityY = (dirY / length) * speed;
        const velocityZ = (dirZ / length) * speed;

        // Add physics component
        const physicsComp = ball.addComponent(BallPhysics, {
            manager: this,
            velocityX: velocityX,
            velocityY: velocityY,
            velocityZ: velocityZ
        });

        console.log(`Ball ${this.ballsSpawned} spawned at:`, [spawnX, spawnY, spawnZ], 
                    "velocity:", [velocityX, velocityY, velocityZ]);
    }

    onBallCaught(ball) {
        this.ballsCaught++;
        this.removeBall(ball);
        console.log(`Ball caught! Total caught: ${this.ballsCaught}`);
    }

    onBallDeflected(ball) {
        this.ballsDeflected++;
        this.removeBall(ball);
        console.log(`Ball deflected! Total deflected: ${this.ballsDeflected}`);
    }

    onBallMissed(ball) {
        this.ballsMissed++;
        this.removeBall(ball);
        console.log(`Ball missed! Total missed: ${this.ballsMissed}`);
    }

    removeBall(ball) {
        const index = this.activeBalls.indexOf(ball);
        if (index > -1) {
            this.activeBalls.splice(index, 1);
        }
        ball.destroy();
        
        this.checkGameEnd();
    }

    checkGameEnd() {
        if (this.ballsSpawned >= this.maxBalls && this.activeBalls.length === 0) {
            this.endGame();
        }
    }

    endGame() {
        const total = this.ballsCaught + this.ballsDeflected + this.ballsMissed;
        const catchRate = (this.ballsCaught / total * 100).toFixed(1);
        const deflectRate = (this.ballsDeflected / total * 100).toFixed(1);
        const missRate = (this.ballsMissed / total * 100).toFixed(1);

        console.log("GAME OVER");
        console.log(`Total balls: ${total}`);
        console.log(`Caught: ${this.ballsCaught} (${catchRate}%)`);
        console.log(`Deflected: ${this.ballsDeflected} (${deflectRate}%)`);
        console.log(`Missed: ${this.ballsMissed} (${missRate}%)`);
    }

    update(dt) {
        // Clean up any balls that have fallen too far or gone too far away
        for (let i = this.activeBalls.length - 1; i >= 0; i--) {
            const ball = this.activeBalls[i];
            const pos = ball.getPositionWorld();
            
            // Remove if fallen below ground or gone too far
            if (pos[1] < -1.0 || Math.abs(pos[2]) > 10.0) {
                this.onBallMissed(ball);
            }
        }
    }
}