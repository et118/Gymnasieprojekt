import * as THREE from 'three';
//import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { OrbitControls, sharedVariables } from './custom-addons/OrbitControls';
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
            console.log(guiElements);
            for(let guiElement of guiElements) {
                if(guiElement.contains(event.target)) {
                    return;
                }
            }
            this.desiredDistance *= event.deltaY == 100 ? 1.05 : 0.95;
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
            //worldPos.add(this.cameraVelocity.clone().multiplyScalar(-1));
            const futureTargetPos = worldPos.clone().add(this.cameraVelocity.clone().multiplyScalar(deltaTime));

            let direction = new THREE.Vector3();//new THREE.Vector3().subVectors(this.camera.position, futureTargetPos).normalize();
            this.camera.getWorldDirection(direction);

            //let velocityTowardsCamera = this.cameraVelocity.dot(new THREE.Vector3().subVectors(this.target.mesh.position,this.camera.position).normalize());
            
            let distance = this.desiredDistance;//this.camera.position.distanceTo(this.target.mesh.position);//When moving straight away from camera, the zoom distance increases. Create second camera like the weird site said.//Maybe save distance last frame and do something
            //let targetPosition = new THREE.Vector3().copy(worldPos).add(direction.multiplyScalar(-distance));
            let targetPosition = futureTargetPos.clone().add(direction.multiplyScalar(-distance));
            
            let speed = distance > 1 ? 0.25 : 0.25 + Math.min(0.75,1-distance);
            
            this.camera.position.lerp(targetPosition,speed);
            this.orbitControls.target.lerp(worldPos,speed);
        }
        this.orbitControls.update();
    }
}