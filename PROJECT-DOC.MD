Midterm Report VR Balance & Mobility Trainer for Athletes
Anastasia Gaynullina, Aigerim Amirgali, Remzi Ayberk Cimen

1.	Introduction
There is an increasing number of sport-related injuries across different sports, with more that 3.5 million children in the US suffering from sports-related injuries annually [1]. In 2024, 4.4 million people were treated in emergency rooms for the same type of injuries [2]. Lack of proper training is one of the reasons why we can see this trend. Traditional methods for developing crucial skills like mobility, stability and reaction time are often inefficient. For many athletes, the way to improve might seem blurry because training drills are repetitive and not engaging. In addition, the progress relies just on the coach's eye rather than quantifiable data. In sports where precision and balance are needed, this sort of deficiency might hinder development. 
Existing physical equipment for reflex and mobility training, such as reaction lights, is expensive and requires space. These systems cannot be adapted to different sport environments, lack proper feedback needed for further improvement and have a high cost. Moreover, many intense mobility and balance drills place athletes at risk of injury, such as sprain or fall. All of this happens because the environment is not safely controlled.
The purpose of this project is to address the need for engaging, data-driven and accessible mobility and reflex exercises. We aim to use Virtual Reality (VR) to create a training tool in the immersive environment.
Our project that is developed for Meta Quest 2 using the Wonderland Engine will have these functionalities:
Analytical training modules that simulate high-pressure scenarios needed to improve balance and reaction time
Post-session feedback that will come after tracking and analyzing athletes’ movement and reflex time
Accessibility due to providing cheaper alternative with the ability to customize virtual training environments
The solution’s scope is tied to hardware Meta Quest 2. It tracks only head and hands, so we cannot get any data on full body movements. Therefore, software will consider the body as stable all the time, which might not be true and also might make the data not as reliable. Despite this, our project focuses on measurable and improvable skills that usually require good head and hands coordination, so this issue is manageable.


2.	Problem Definition and Objectives
The problem our project focuses on is the inefficiency of traditional mobility training for athletes. This stems from several issues: the lack of engaging and analytically measured training, repetitive drills that fail to hold focus, and the difficulty of quantifying performance without captured data. Athletes also risk injury during intense drills in uncontrolled environments.

Another limitation is the high cost and low flexibility of existing training equipment and coaching. Systems like reaction training lights are expensive, lack customization, and provide limited feedback beyond simple reaction time. They cannot analyze movement, stability, or long-term performance trends.

This program aims to solve the problems defined above. Our objectives are, first, tracking and analyzing the physical movement & reflex data of athletes under simulated circumstances, and secondly, assisting athletes to increase their stability & mobility by giving feedback using their data.

To achieve this, our primary objective is to develop a VR application using the Meta Quest 2 and Wonderland Engine. The specific objectives for the software are:

To create a central user menu: our program will have a main menu to allow the user to choose between different exercises.
To enable customization: the user will be able to change the environment with a selector (e.g., football field, tennis court) to make the training more specific to their sport.
To implement balance tracking and reflex analysis (reaction time, balance duration).
To provide feedback by providing post-session analysis, allowing athletes to see their progress over time.

(Anticipated) constraints:
We anticipate several constraints for this solution. Our hardware (Meta Quest 2) tracks the head and hands, not the user's feet or full body. This means we must infer balance and stability from headset and controller data, which is an approximation. The virtual environment also cannot provide the physical, haptic feedback of a real-world drill. Finally, our scope is limited by the Wonderland Engine's capabilities and our use of royalty-free 3D models and sounds.

3.	Implementation Details 
The project uses Wonderland Engine (Javascript-based) for VR deployment on the Meta Quest 2. So far we have worked on establishing the technical foundation and designing and testing initial mini-game mechanics. 
We first set up the development environment:
Installed and configured Wonderland Engine on all of our systems. Also confirmed that the default project builds correctly on the Meta Quest 2 headset. 
Set up a GitHub repository for collaborative work and created a folder structure that separates assets (/models, /audio, /textures) and the game code itself (/algorithms, /ui, /scripts).
Established local testing within a browser for faster iteration before we deploy to the Quest 2. 
Tested the connection between Javascript logic and the VR controller input to make sure the code can actually respond to physical movements of the Quest 2 controllers (position and collision events are registered correctly). 

Then, we implemented an early prototype for one of the planned exercises:  
Target striking (reflex drill):
Implemented a spawn system that generates colored spheres at random intervals and positions around the player. 
Each sphere disappears when hit by a VR stick. 
The difference between the spawn and hit time is logged and output in the console as the reaction time (will be later visualized in a UI panel as well).

Target striking code overview:
1. target-manager.js 
This component manages the spawning of target spheres and tracks player performance. The main features are:
Spawning targets. A prefab sphere is cloned at random positions on a curved rectangular surface using spawnTarget(). Positions are generated with slight randomness.
Tracking hits and reaction times. The manager stores the number of targets hit (hitCount) and the time taken to hit each (reactionTimes).
Controlling game flow. After hitting a target, the sphere is destroyed and a new target is spawned after a configurable interval. The game ends when the maximum number of targets (maxTargets) is reached.
Example snippet:
const sphere = this.spherePrefab.clone(this.object);
sphere.active = true;
this.activeTarget = sphere;
sphere.setPositionWorld([x, y, z]);
sphere.startTime = performance.now();        
const collisionComp = sphere.addComponent('target-collision');
collisionComp.manager = this;

2. target-collision.js
This component handles collision detection between spheres and VR controllers:
Continuously checks the distance between the target sphere and each controller.
Marks the sphere as “hit” if the distance is within the combined radii plus a tolerance.
Notifies the TargetManager of the hit and calculates the reaction time.
Example snippet:
if (distance < radiusSphere + radiusStick + tolerance) {
this.hit = true;
    const reactionTime = (performance.now() - this.object.startTime) / 1000;
      this.manager.onTargetHit(this.object, reactionTime)
}

3. controller-hit.js
This component is attached to each VR controller and detects collisions with target spheres:
On collision, it calls the onHit() method of the target-collision component.
Logs which controller (left or right hand) hit the target for debugging purposes.
Example snippet:
if (other.object.hasComponent('target-collision')) {
other.object.getComponent('target-collision').onHit(this.object);
}

We also did some work on the visual design and assets part:
Preliminary placeholders for the beam and spheres were created using primitive shapes. 
Audio (hit sound, balance alert) for the mini-game prototypes has been sourced from royalty-free sound libraries and tested in the engines. 
Collected links to some 3D assets that we plan to use in our mini-games. 

Assets collected so far:
These are the 3D models that will be used for the virtual beam walk and other games [3]:
1.   	Balance beam model

2.   	Training environment 1 – football field

3.   	Training environment 2 – tennis court

4.   	Training environment 3 – gym floor

These is the 3D model that will be used for Target striking game [3]:
Target – tennis ball (will be colored differently)
 
(All files of 3D models and audio files for the target striking and virtual beam walk mini-games can be found at https://drive.google.com/drive/folders/1uOA3kfeVfosJhwoD3FIujEZw4pMDmFJZ?usp=drive_link).

4.	Progress till date and the Remaining Work
Progress till date:
Development environment fully configured (Wonderland Engine + Meta Quest 2 integration).
Repository structure established with a division of asset-based and algorithmic work. 
Implemented initial logic prototypes for two training drills (beam walk and target striking). 
Verified controller input tracking, collision detection, time-based event logging.
Basic 3D models and placeholder audio integrated.
Test run on Quest 2 confirmed stable build environment and functional controller inputs.

Remaining work:
Expand mini-game set to include:
Virtual beam walk:
Catch the ball: balls thrown at unpredictable speeds/angles to be caught or deflected with the sticks.
Color-coded reactions: only hit or dodge certain colors/shapes that appear suddenly.
Develop a data tracking and feedback panel (aggregating reaction time, balance duration, accuracy).
Implement UI dashboard for progress visualization.
Replace placeholder shapes with finalized 3D assets and environment models.
Conduct testing sessions and collect user feedback. 

5.	Contribution Summary
Our team consists of two gameplay designers (responsible for algorithms, functionality, testing) and one UI/UX designer (responsible for visual design, 3D assets, user interface development). This is how the work has been dividing between the three of us so far:
Gameplay designer 1 (Anastasia)
Configured GitHub repository.
Designed and implemented the target striking prototype (random target spawning system, collision detection, reaction-time logging mechanism).
Conducted testing to ensure proper controller input recognition within the VR environment.
Gameplay designer 2 (Ayberk)
Tested and confirmed that the default project builds correctly on the headset.
Conducted testing sessions to measure the performance of the implemented drills. 
UI/UX designer (Aigerim)
Sourced references and links to potential 3D assets to replace primitive placeholders in the final version.
Assisted in testing spatial layout of the balance and reflex drills. 

Remaining work division:
Gameplay designer 1 (Anastasia)
Implement the “catch the ball” mini-game with a focus on realistic motion paths and interaction responses.
Lead development of the data tracking and analytics system, integrating the analytics data output with the upcoming UI dashboard.
Gameplay designer 2 (Ayberk)
Develop the virtual beam walk prototype (collision detection, balance duration tracking, reset trigger logic).
Implement the color-coded reactions module with logic for selective hits/dodges.
UI/UX designer (Aigerim)
Replace placeholder shapes with finalized 3D models and textures across all drills.
Design and implement the in-game feedback and progress visualization interface (data tracking panel and dashboard).
Conduct user experience testing and collect user feedback once all the gameplay prototypes are complete. 

6.	References
Hopkins Medicine. Sports injury statistics: https://www.hopkinsmedicine.org/health/conditions-and-diseases/sports-injuries/sports-injury-statistics
NSC Injury  Facts. Sports and recreational injuries: https://injuryfacts.nsc.org/home-and-community/safety-topics/sports-and-recreational-injuries/ 
Wonderland Engine Documentation: https://wonderlandengine.com/docs
Mozilla Developer Network (MDN) JavaScript Reference: https://developer.mozilla.org
Three.js Fundamentals (for 3D concepts and math): https://threejsfundamentals.org
Sketchfab for 3D models: https://sketchfab.com/feed 
Audio website: https://pixabay.com/ 

7. Appendix (full code)
Target striking:
target-manager.js
import {Component, Property} from '@wonderlandengine/api';


/**
 * target-manager
 */


console.log("target-manager.js loaded");


export class TargetManager extends Component {
    static TypeName = 'target-manager';
    /* Properties that are configurable in the editor */
    static Properties = {
        spherePrefab: Property.object(),
        maxTargets: Property.int(20),
        spawnInterval: Property.float(1.0) // seconds
    };
   
    start() {
        this.hitCount = 0;
        this.reactionTimes = [];
        this.activeTarget = null;
        this.spherePrefab.active = false;


        this.spawnTarget();
    }


    spawnTarget() {
        // Ending game when the required number of spheres have been hit
        if (this.hitCount >= this.maxTargets) {
            this.endGame();
            return;
        }


        // Creating a new sphere using the prefab
        const sphere = this.spherePrefab.clone(this.object);
        sphere.active = true;
        this.activeTarget = sphere;


        // Random position on curved rectangular surface
        const x = (Math.random() - 0.5) * 1.5;
        const y = 1.5 + Math.random() * 0.5;
        const z = -1.5 - (Math.pow(x, 2) / 2);


        console.log("Target position:", x, y, z);


        sphere.setPositionWorld([x, y, z]);
        sphere.startTime = performance.now();


        // Add collision component
        const collisionComp = sphere.addComponent('target-collision');
        collisionComp.manager = this;
        console.log("Spawned at:", sphere.getPositionWorld());
    }


    onTargetHit(sphere, reactionTime) {
        this.hitCount++;
        this.reactionTimes.push(reactionTime);


        sphere.destroy();


        setTimeout(() => this.spawnTarget(), this.spawnInterval * 1000);
    }


    endGame() {
        console.log("Game over! Reaction times: ", this.reactionTimes);
    }
}
target-collision.js
import {Component, Property} from '@wonderlandengine/api';


/**
 * target-collision
 */
export class TargetCollision extends Component {
    static TypeName = 'target-collision';
    /* Properties that are configurable in the editor */
    static Properties = {
        manager: Property.object()
    };


    start() {
        this.hit = false;
    }


    update() {
        if (this.hit) {
            return;
        }


        const spherePos = this.object.getPositionWorld();


        // VR Sticks
        const sticks = [
            this.engine.scene.getObjectByName("ControllerRight"),
            this.engine.scene.getObjectByName("ControllerLeft")
        ];


        // Checking if either stick is close enough to the target
        for (let stick of sticks) {
            if (!stick) {
                continue;
            }


            const stickPos = stick.getPositionWorld();
            const dx = spherePos[0] - stickPos[0];
            const dy = spherePos[1] - stickPos[1];
            const dz = spherePos[2] - stickPos[2];
            const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);


            const radiusSphere = 0.2;
            const radiusStick = 0.15;
            const tolerance = 0.05;


            if (distance < radiusSphere + radiusStick + tolerance) {
                this.hit = true;
                const reactionTime = (performance.now() - this.object.startTime) / 1000;
			
                this.manager.onTargetHit(this.object, reactionTime)
            }


        }
    }


    onHit(controllerObject) {
        console.log("Target was hit by: ", controllerObject.name);
        this.object.active = false;
    }
}
controller-hit.js
import {Component, Property} from '@wonderlandengine/api';


/**
 * controller-hit
 */
export class ControllerHit extends Component {
    static TypeName = 'controller-hit';
    /* Properties that are configurable in the editor */
    static Properties = {
        hand: Property.string('right'),
    };
   
    onCollisionEnter(other) {
        // Check if what the controller touched is a target
        if (other.object.hasComponent('target-collision')) {
            console.log(`${this.hand} hand hit a target!`);
            other.object.getComponent('target-collision').onHit(this.object);
        }
    }
}

