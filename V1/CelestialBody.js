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
        this.ringMesh = new THREE.Mesh(new THREE.RingGeometry(47,50,32), new THREE.MeshBasicMaterial({color: name == "Jupiter" ? 0xff0000 : 0xffff00}));
        this.selectMesh = new THREE.Mesh(new THREE.CircleGeometry(50,8));
        //this.trailmesh = new THREE.Mesh(new THREE.SphereGeometry(radius/3,32,16), new THREE.MeshBasicMaterial({color:color}));
        //this.trailmesh.layers.set(1);

        this.mesh.name = name;
        this.selectMesh.name = name;
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
        //scene.add(this.selectMesh);
    }

    draw(camera) {
        //this.mesh.position.set(this.position.x/15e9,this.position.y/15e9,this.position.z/15e9);
        //this.trailmesh.position.set(this.position.x/15e9,this.position.y/15e9,this.position.z/15e9);
        this.ringMesh.setRotationFromQuaternion(camera.camera.quaternion);
        var scale = this.mesh.position.distanceTo(camera.camera.position) / 1000;
        this.ringMesh.scale.set(scale, scale, scale);
        this.ringMesh.position.set(this.mesh.position.x,this.mesh.position.y,this.mesh.position.z);
        this.selectMesh.position.set(this.ringMesh.position.x, this.ringMesh.position.y, this.ringMesh.position.z);
        this.selectMesh.scale.set(scale, scale, scale);
        this.selectMesh.setRotationFromQuaternion(camera.camera.quaternion);
    }
}