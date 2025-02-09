import * as THREE from 'three';

export class CelestialBody {
    constructor(x, y, z, radius, mass, velocityX, velocityY, velocityZ, color, name, groupID, majorCelestial) {
        this.position = {x: x, y: y, z: z};
        this.radius = radius;
        this.mass = mass;
        this.velocity = {x: velocityX, y: velocityY, z: velocityZ};
        this.color = color;
        this.name = name;
        this.groupID = groupID;
        this.majorCelestial = majorCelestial; //If it is a planet/sun and should affect all groups
        this.mesh = new THREE.Mesh(new THREE.SphereGeometry(radius/1e9/*radius/1e9TODO: Realistic size (but things might get too small then) */, 32, 16), new THREE.MeshBasicMaterial({color:color, wireframe:true, side:THREE.DoubleSide}));
        this.mesh.position.set(this.position.x/1e9,this.position.z/1e9,this.position.y/1e9); //Swapping z and y is intentional
        this.selected = false;

        let scale = this.majorCelestial ? 1 : 0.75;
        this.ringMesh = new THREE.Mesh(new THREE.RingGeometry(47 * scale,50 * scale,32), new THREE.MeshBasicMaterial({color: this.majorCelestial ? 0xffff00 : 0x0000ff}));
        this.selectMesh = new THREE.Mesh(new THREE.CircleGeometry(50 * scale,8));
        //TODO: Trail segments calculated based on orbit distance from MajorBody parent
        this.trailPoints = [new THREE.Vector3(this.position.x/1e9,this.position.z/1e9,this.position.y/1e9),new THREE.Vector3(this.position.x/1e9,this.position.z/1e9,this.position.y/1e9),new THREE.Vector3(this.position.x/1e9,this.position.z/1e9,this.position.y/1e9)];
        this.trailBuffer = new THREE.BufferGeometry();
        this.trailMesh = new THREE.Line(this.trailBuffer, new THREE.LineBasicMaterial({color:0xffffff, side:THREE.DoubleSide, linewidth: 5}))
        this.lastTrailPoints = 0;
        this.alwaysShowTrail = false;


        this.mesh.name = name;
        this.selectMesh.name = name;
    }

    updateRadius(radius) {
        this.mesh.scale.multiplyScalar(radius / this.radius);
        this.radius = radius;
    }

    getPhysicsData() {
        return {position: this.position, mass: this.mass, velocity: this.velocity, groupID: this.groupID, majorCelestial: this.majorCelestial};
    }

    setPhysicsData(data) {
        this.position = data.position;
        this.mass = data.mass;
        this.velocity = data.velocity;
        this.mesh.position.set(this.position.x/1e9,this.position.z/1e9,this.position.y/1e9);
        this.groupID = data.groupID;
        this.majorCelestial = data.majorCelestial;
    }

    addToScene(scene) {
        scene.add(this.mesh);
        scene.add(this.ringMesh);
        scene.add(this.trailMesh);
    }

    removeFromScene(scene) {
        scene.remove(this.mesh);
        scene.remove(this.ringMesh);
        scene.remove(this.trailMesh);
    }

    draw(camera, groupID) {
        if(this.selected) {
            this.ringMesh.material.color.setHex(0xff0000);
        } else {
            this.ringMesh.material.color.setHex(this.majorCelestial ? 0xffff00 : 0x0000ff);
        }
        this.trailPoints.pop();
        let angleBetweenPoints = this.trailPoints[this.trailPoints.length-1].clone().sub(this.trailPoints[this.trailPoints.length-2]).normalize().angleTo(new THREE.Vector3(this.position.x/1e9,this.position.z/1e9,this.position.y/1e9).clone().sub(this.trailPoints[this.trailPoints.length-1]).normalize())*180/Math.PI;
        if(angleBetweenPoints > 1 && this.trailPoints[this.trailPoints.length-1].clone().sub(new THREE.Vector3(this.position.x/1e9,this.position.z/1e9,this.position.y/1e9)).length() != 0) {
            this.trailPoints.push(new THREE.Vector3(this.position.x/1e9,this.position.z/1e9,this.position.y/1e9));
        }
        if(this.name == "Pluto" && this.trailPoints.length != this.lastTrailPoints) {
            //console.log(this.trailPoints.length);
            this.lastTrailPoints = this.trailPoints.length;
        }
        if(this.trailPoints.length == 360 && this.majorCelestial){// && (this.name == "Jupiter" || this.name == "Saturn" || this.name == "Uranus" || this.name == "Neptune" || this.name == "Pluto")) {
            let output = "\"" + this.name + "\":[";
            this.trailPoints.forEach((point) => {
                output += "{\"x\":"+point.x+",\"y\":" + point.y + ",\"z\":" + point.z + "},";
            });
            output += "]";
            //console.log(output);
        }
        this.trailPoints.push(new THREE.Vector3(this.position.x/1e9,this.position.z/1e9,this.position.y/1e9));
        if(this.majorCelestial || this.selected || this.alwaysShowTrail) {
            
            this.trailMesh.visible = true;
            this.trailBuffer.setFromPoints(this.trailPoints);
            this.trailMesh.updateWorldMatrix();
            this.trailMesh.geometry.computeBoundingSphere();
        } else {
            this.trailMesh.visible = false;
        }

        if(this.majorCelestial || this.groupID == groupID) {
            this.ringMesh.visible = true;
            this.selectMesh.visible = true;
            this.ringMesh.setRotationFromQuaternion(camera.camera.quaternion);
            var scale = this.mesh.position.distanceTo(camera.camera.position) / 1000;
            this.ringMesh.scale.set(scale, scale, scale);
            this.ringMesh.position.set(this.mesh.position.x,this.mesh.position.y,this.mesh.position.z);
            this.selectMesh.position.set(this.ringMesh.position.x, this.ringMesh.position.y, this.ringMesh.position.z);
            this.selectMesh.scale.set(scale, scale, scale);
            this.selectMesh.setRotationFromQuaternion(camera.camera.quaternion);    
        } else {
            this.ringMesh.visible = false;
            this.selectMesh.visible = false;
            this.selectMesh.scale.set(0,0,0);
        }
    }
}