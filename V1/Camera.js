import * as THREE from 'three';
//import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class Camera {
    constructor(camera, renderer) {
        this.camera = camera;
        /*this.cameraMovement = new THREE.Vector3(0,0,0);
        this.cameraSpeed = 100;
        this.mousePosition = new THREE.Vector2(0,0);
        this.lastMousePosition = new THREE.Vector2(0,0);
        this.rightClickPressed = false;
        this.ePressed = false;
        this.qPressed = false;
        this.shiftKey = false;
        this.ctrlKey = false;*/
        
        this.orbitControls = new OrbitControls(this.camera, renderer.domElement);
        this.orbitControls.enableDamping = true;
        this.orbitControls.dampingFactor = 0.15;

        this.targetPosition = new THREE.Vector3();
        this.moveToTarget = false;
        this.keepAtDistance = 50;
        /*window.addEventListener("keydown", (event) => {
            if(event.key == "w") {this.cameraMovement.z = -1; event.preventDefault();}
            if(event.key == "a") {this.cameraMovement.x = -1; event.preventDefault();}
            if(event.key == "s") {this.cameraMovement.z = 1; event.preventDefault();}
            if(event.key == "d") {this.cameraMovement.x = 1; event.preventDefault();}
            if(event.key == " ") this.cameraMovement.y = 1;
            if(event.key == "c") this.cameraMovement.y = -1;
            if(event.key == "e") this.ePressed = true;
            if(event.key == "q") this.qPressed = true;
            this.shiftKey = event.shiftKey;
            this.ctrlKey = event.ctrlKey;
        }, true);
        window.addEventListener("keyup", (event) => {
            if(event.key == "w" && this.cameraMovement.z == -1) this.cameraMovement.z = 0;
            if(event.key == "a" && this.cameraMovement.x == -1) this.cameraMovement.x = 0;
            if(event.key == "s" && this.cameraMovement.z == 1) this.cameraMovement.z = 0;
            if(event.key == "d" && this.cameraMovement.x == 1) this.cameraMovement.x = 0;
            if(event.key == " " && this.cameraMovement.y == 1) this.cameraMovement.y = 0;
            if(event.key == "c" && this.cameraMovement.y == -1) this.cameraMovement.y = 0;
            if(event.key == "e") this.ePressed = false;
            if(event.key == "q") this.qPressed = false;
        });
        window.addEventListener("mousedown", (event) => {
            if(event.button == 2) {
                this.rightClickPressed = true;
                this.lastMousePosition.x = event.clientX;
                this.mousePosition.x = event.clientX;
                this.lastMousePosition.y = event.clientY;
                this.mousePosition.y = event.clientY;
            }
        });
        
        window.addEventListener("mousemove", (event) => {
            this.mousePosition.x += event.movementX;
            this.mousePosition.y += event.movementY;
        });
        
        window.addEventListener("mouseup", (event) => {
            if(event.button == 2) {
                this.rightClickPressed = false;
            }
        });*/
        
        document.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });
        
        document.addEventListener("pointermove", (event) => {
            //this.moveToTarget = false;
        });
        /*window.onblur = function() {
            this.rightClickPressed = false;
            this.cameraMovement = new THREE.Vector3(0,0,0);
            this.qPressed = false;
            this.ePressed = false;
        }*/
    }

    setTarget(celestialBody) {
        this.targetPosition = celestialBody.mesh.position.clone();
        this.orbitControls.target.set(this.targetPosition.x,this.targetPosition.y,this.targetPosition.z)
        this.moveToTarget = true;
        
        //TODO set this.keepAtDistance to match the radius of the celestial object
        
        
        //this.camera.position.set(celestialBody.mesh.position.x,celestialBody.mesh.position.y+50,celestialBody.mesh.position.z);
        //this.orbitControls.target.set(celestialBody.mesh.position.x,celestialBody.mesh.position.y,celestialBody.mesh.position.z);
    }

    move(deltaTime) {
        //this.camera.translateX(this.cameraSpeed * this.cameraMovement.x * deltaTime * (this.shiftKey == true ? 10 : 1) * (this.ctrlKey == true ? 50 : 1));
        //this.camera.translateY(this.cameraSpeed * this.cameraMovement.y * deltaTime * (this.shiftKey == true ? 10 : 1) * (this.ctrlKey == true ? 50 : 1));
        //this.camera.translateZ(this.cameraSpeed * this.cameraMovement.z * deltaTime * (this.shiftKey == true ? 10 : 1) * (this.ctrlKey == true ? 50 : 1));
        /*if((this.lastMousePosition.x != this.mousePosition.x || this.lastMousePosition.y != this.mousePosition.y) && this.rightClickPressed) {
           this.camera.rotateOnAxis(new THREE.Vector3(0,1,0), (this.lastMousePosition.x - this.mousePosition.x)*0.01);
            this.camera.rotateOnAxis(new THREE.Vector3(1,0,0), (this.lastMousePosition.y - this.mousePosition.y)*0.01);
            this.lastMousePosition.x = this.mousePosition.x;
            this.lastMousePosition.y = this.mousePosition.y;
        }
        if(this.ePressed) this.camera.rotateOnAxis(new THREE.Vector3(0,0,1), -2*deltaTime);
        if(this.qPressed) this.camera.rotateOnAxis(new THREE.Vector3(0,0,1), 2*deltaTime);
        */
        if(this.camera.position.distanceTo(this.targetPosition) < this.keepAtDistance) {
            this.moveToTarget = false;
        } else {
            if(this.moveToTarget) {
                this.camera.position.lerp(this.targetPosition, 0.1);
                ////let qm = new THREE.Quaternion();
                ////THREE.Quaternion.slerp(this.camera.quaternion, this.camera.quaternion, qm, 0.07);
                ////this.camera.quaternion = qm;
                ////this.camera.quaternion.normalize();
                //this.orbitControls.target.lerp(this.targetPosition,0.1);
                //this.camera.rotation.set(this.targetPosition.sub(this.camera.position).normalize())
            } else {
                //this.orbitControls.target.set(this.targetPosition.x,this.targetPosition.y,this.targetPosition.z)
            }
        }
        this.orbitControls.update();
    }
}