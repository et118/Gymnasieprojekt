import * as THREE from 'three';
export class CelestialBody {
    constructor(x, y, z, radius, mass, velocity, color) {
        this.position = new THREE.Vector3(x*15e9,y*15e9,z*15e9);
        this.radius = radius;
        this.mass = mass;
        this.velocity = velocity;
        this.mesh = new THREE.Mesh(new THREE.SphereGeometry(radius,32,16), new THREE.MeshBasicMaterial({color:color, wireframe:true}));
    }

    move(deltaTime) {
        //console.log(this.position);
        //console.log(this.velocity);
        //this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        this.mesh.position.set(this.position.x/15e9,this.position.y/15e9,this.position.z/15e9);
    }
}