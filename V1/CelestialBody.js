import * as THREE from 'three';

export class CelestialBody {
    constructor(x, y, z, radius, mass, velocityX, velocityY, velocityZ, color, name) {
        this.position = {x: x, y: y, z: z};
        this.radius = radius;
        this.mass = mass;
        this.velocity = {x: velocityX, y: velocityY, z: velocityZ};
        this.color = color;
        this.name = name;
        this.mesh = new THREE.Mesh(new THREE.SphereGeometry(8/*TODO: Realistic size (but things might get too small then) */, 32, 16), new THREE.MeshBasicMaterial({color:color, wireframe:true}));
        this.mesh.position.set(this.position.x/15e9,this.position.y/1e9,this.position.z/1e9);
        //this.trailmesh = new THREE.Mesh(new THREE.SphereGeometry(radius/3,32,16), new THREE.MeshBasicMaterial({color:color}));
        //this.trailmesh.layers.set(1);
    }

    getPhysicsData() {
        return {position: this.position, mass: this.mass, velocity: this.velocity};
    }

    setPhysicsData(data) {
        this.position = data.position;
        this.mass = data.mass;
        this.velocity = data.velocity;
        this.mesh.position.set(this.position.x/1e9,this.position.y/1e9,this.position.z/1e9);
    }

    addToScene(scene) {
        scene.add(this.mesh);
    }

    //draw() {
        //this.mesh.position.set(this.position.x/15e9,this.position.y/15e9,this.position.z/15e9);
        //this.trailmesh.position.set(this.position.x/15e9,this.position.y/15e9,this.position.z/15e9);
    //}
}