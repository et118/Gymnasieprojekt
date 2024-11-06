import * as THREE from 'three';
export class Camera {
    constructor(camera) {
        this.camera = camera;
        this.cameraMovement = new THREE.Vector3(0,0,0);
        this.cameraSpeed = 10;
        this.mousePosition = new THREE.Vector2(0,0);
        this.lastMousePosition = new THREE.Vector2(0,0);
        this.rightClickPressed = false;
        this.ePressed = false;
        this.qPressed = false;
        this.shiftKey = false;
        this.ctrlKey = false;
        window.addEventListener("keydown", (event) => {
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
        });
        
        document.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });
        
        window.onblur = function() {
            this.rightClickPressed = false;
            this.cameraMovement = new THREE.Vector3(0,0,0);
            this.qPressed = false;
            this.ePressed = false;
        }
    }

    move(deltaTime) {
        this.camera.translateX(this.cameraSpeed * this.cameraMovement.x * deltaTime * (this.shiftKey == true ? 10 : 1) * (this.ctrlKey == true ? 50 : 1));
        this.camera.translateY(this.cameraSpeed * this.cameraMovement.y * deltaTime * (this.shiftKey == true ? 10 : 1) * (this.ctrlKey == true ? 50 : 1));
        this.camera.translateZ(this.cameraSpeed * this.cameraMovement.z * deltaTime * (this.shiftKey == true ? 10 : 1) * (this.ctrlKey == true ? 50 : 1));
        if((this.lastMousePosition.x != this.mousePosition.x || this.lastMousePosition.y != this.mousePosition.y) && this.rightClickPressed) {
            //camera.getWorldDirection(new THREE.Vector3()).applyAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2)
            this.camera.rotateOnAxis(new THREE.Vector3(0,1,0), (this.lastMousePosition.x - this.mousePosition.x)*0.01);
            this.camera.rotateOnAxis(new THREE.Vector3(1,0,0), (this.lastMousePosition.y - this.mousePosition.y)*0.01);
            this.lastMousePosition.x = this.mousePosition.x;
            this.lastMousePosition.y = this.mousePosition.y;
        }
        if(this.ePressed) this.camera.rotateOnAxis(new THREE.Vector3(0,0,1), -2*deltaTime);
        if(this.qPressed) this.camera.rotateOnAxis(new THREE.Vector3(0,0,1), 2*deltaTime);
    }
}