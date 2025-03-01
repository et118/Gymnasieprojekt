import * as THREE from 'three';
//import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { OrbitControls, sharedVariables } from './lib/OrbitControls';
//import { OrbitControls, scale } from 'three/addons/controls/OrbitControls.js';

export class Camera {
    constructor(camera, renderer) {
        this.camera = camera;
        this.orbitControls = new OrbitControls(this.camera, renderer.domElement);
        this.orbitControls.enableDamping = true;
        this.orbitControls.dampingFactor = 0.15;
        this.orbitControls.zoomToCursor = true;
        this.target = null;
        this.cameraVelocity = new THREE.Vector3();
        this.desiredDistance = 50;

        //Hijacking zooming from OrbitControls. [et118] on changed places
        this.lastScale = 1;
        this.orbitControls.enablePan = false;
        addEventListener("wheel", (event) => { //Small fix for using mouse scroll wheel instead of touchpad
            let guiElements = document.querySelectorAll(".lil-gui.root.allow-touch-styles.autoPlace");
            for(let guiElement of guiElements) {
                if(guiElement.contains(event.target)) {
                    return;
                }
            }
            console.log(event.deltaY);
            this.desiredDistance *= event.deltaY > 0 ? 1.05 : 0.95;
        })
    }

    setTarget(celestialBody) {
        this.target = celestialBody;
        this.cameraVelocity.set(celestialBody.velocity.x/1e9,celestialBody.velocity.z/1e9,celestialBody.velocity.y/1e9)
    }
    
    move(deltaTime) {
        if(sharedVariables.scale != this.lastScale) {
            this.desiredDistance *= (sharedVariables.scale * sharedVariables.scale * sharedVariables.scale);
            this.lastScale = sharedVariables.scale;
        }
        if(this.target) { //Thank you so much https://www.reddit.com/r/threejs/comments/1chmjm5/making_orbitcontrols_lock_onto_an_object/?rdt=61444 
            let worldPos = new THREE.Vector3();
            this.target.mesh.getWorldPosition(worldPos);
            const futureTargetPos = worldPos.clone().add(this.cameraVelocity.clone().multiplyScalar(deltaTime));

            let direction = new THREE.Vector3();
            this.camera.getWorldDirection(direction);

            let targetPosition = futureTargetPos.clone().add(direction.multiplyScalar(-this.desiredDistance));
            
            let speed = this.desiredDistance > 1 ? 0.25 : 0.25 + Math.min(0.75,1-this.desiredDistance);
            
            this.camera.position.lerp(targetPosition,speed);
            this.orbitControls.target.lerp(worldPos,speed);
        }
        this.orbitControls.update();
    }
}