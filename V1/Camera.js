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
        this.reachedTarget = true;
    }

    setTarget(celestialBody) {
        this.target = celestialBody.mesh;
        this.reachedTarget = false;
    }
    
    move(deltaTime) {
        if(!this.reachedTarget) { //Thank you so much https://www.reddit.com/r/threejs/comments/1chmjm5/making_orbitcontrols_lock_onto_an_object/?rdt=61444 
            let worldPos = new THREE.Vector3();
            this.target.getWorldPosition(worldPos);

            let direction = new THREE.Vector3();
            this.camera.getWorldDirection(direction);

            let distance = this.camera.position.distanceTo(this.target.position); //When moving straight away from camera, the zoom distance increases. Create second camera like the weird site said.
            //Maybe save distance last frame and do something
            let targetPosition = new THREE.Vector3().copy(worldPos).add(direction.multiplyScalar(-distance));
            this.camera.position.lerp(targetPosition,0.1);
            this.orbitControls.target.lerp(worldPos,0.1);
            if(this.camera.position.distanceTo(targetPosition) > 1) {
                this.reachedTarget = true;
            }
        }
        this.orbitControls.update();
    }
}