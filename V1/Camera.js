import * as THREE from 'three';
//import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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
    }

    setTarget(celestialBody) {
        this.target = celestialBody;
        this.cameraVelocity.set(celestialBody.velocity.x/1e9,celestialBody.velocity.z/1e9,celestialBody.velocity.y/1e9)
    }
    
    move(deltaTime) {
        if(this.target) { //Thank you so much https://www.reddit.com/r/threejs/comments/1chmjm5/making_orbitcontrols_lock_onto_an_object/?rdt=61444 
            let worldPos = new THREE.Vector3();
            this.target.mesh.getWorldPosition(worldPos);
            //worldPos.add(this.cameraVelocity.clone().multiplyScalar(-1));

            const futureTargetPos = worldPos.clone().add(this.cameraVelocity.clone().multiplyScalar(deltaTime));

            let direction = new THREE.Vector3();//new THREE.Vector3().subVectors(this.camera.position, futureTargetPos).normalize();
            this.camera.getWorldDirection(direction);

            let velocityTowardsCamera = this.cameraVelocity.dot(new THREE.Vector3().subVectors(this.target.mesh.position,this.camera.position).normalize());
            console.log(velocityTowardsCamera);
            let distance = this.camera.position.distanceTo(this.target.mesh.position);//When moving straight away from camera, the zoom distance increases. Create second camera like the weird site said.//Maybe save distance last frame and do something
            //let targetPosition = new THREE.Vector3().copy(worldPos).add(direction.multiplyScalar(-distance));
            let targetPosition = futureTargetPos.clone().add(direction.multiplyScalar(-distance));
            
            this.camera.position.lerp(targetPosition,0.8);
            this.orbitControls.target.lerp(worldPos,0.8);
        }
        this.orbitControls.update();
    }
}