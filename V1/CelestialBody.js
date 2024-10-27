import * as THREE from 'three';
export class CelestialBody {
    constructor(x, y, z, radius, mass, velocity, color) {
        this.position = new THREE.Vector3(x,y,z);
        this.radius = radius;
        this.mass = mass;
        this.velocity = velocity;
        this.color = color;
        //this.mesh = new THREE.Mesh(new THREE.SphereGeometry(radius,32,16), new THREE.MeshBasicMaterial({color:color, wireframe:true}));
        //this.trailmesh = new THREE.Mesh(new THREE.SphereGeometry(radius/3,32,16), new THREE.MeshBasicMaterial({color:color}));
        //this.trailmesh.layers.set(1);
    }

    //draw() {
        //this.mesh.position.set(this.position.x/15e9,this.position.y/15e9,this.position.z/15e9);
        //this.trailmesh.position.set(this.position.x/15e9,this.position.y/15e9,this.position.z/15e9);
    //}
}