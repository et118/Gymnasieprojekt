import * as THREE from 'three';
import { CelestialBody } from './celestialBody';
import { Camera } from './Camera';
import Stats from 'three/examples/jsm/libs/stats.module.js';
/*
    https://en.wikipedia.org/wiki/Barnes%E2%80%93Hut_simulation    //For the asteroid fields
    https://en.wikipedia.org/wiki/Fast_multipole_method
*/
const G = 6.6743e-11;
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);
const scene = new THREE.Scene();
const clock = new THREE.Clock();
const camera = new Camera();
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( onNewFrame );
document.body.appendChild( renderer.domElement );


var bottomPlane = new THREE.Mesh(new THREE.PlaneGeometry(100,100,100,100), new THREE.MeshBasicMaterial( {color:0xffffff, wireframe:true}))
var sun = new CelestialBody(0, 0, 0, 2, 1.9884e30, new THREE.Vector3(0,0,0), 0xf0e816);
var earth = new CelestialBody(10, 0, 0, 1, 5.97219e24, new THREE.Vector3(0,0,29784), 0x1541ed);
scene.add(bottomPlane);
scene.add(sun.mesh);
scene.add(earth.mesh);
bottomPlane.rotateOnAxis(new THREE.Vector3(1,0,0),Math.PI/2);
camera.camera.position.y = 15;
camera.camera.rotateX(-Math.PI/2);
var deltaTime = 0;
earth.move(0);
var one = false;
function onNewFrame() {
    
    deltaTime = clock.getDelta();
    camera.move(deltaTime);
    earth.move(1000000);
    //sun.move(deltaTime);
    //deltaTime);
    /*if(!one) {
        one = true;
        console.log(F);
        console.log(sun.mass*earth.mass);
        console.log(sun.position);
        console.log(earth.position);
        console.log(sun.position.distanceToSquared(earth.position));
        console.log(sun.position.distanceTo(earth.position));
    }*/
	renderer.render( scene, camera.camera );
  
    
}

const worker = new Worker("worker.js");
onmessage = (e) => {
    
}
/*while(true) {
    stats.begin();
    var F = G*(sun.mass*earth.mass)/sun.position.distanceToSquared(earth.position);
    var sunAcceleartion = (earth.position.clone().sub(sun.position)).normalize().multiplyScalar((F/sun.mass));
    var earthAcceleration = (sun.position.clone().sub(earth.position)).normalize().multiplyScalar((F/earth.mass));
    earth.position.add(earth.velocity.add(earthAcceleration.multiplyScalar(deltaTime*0.5)).multiplyScalar(deltaTime));
    earth.velocity.add(earthAcceleration.multiplyScalar(deltaTime));
    
    stats.end();
}
*/