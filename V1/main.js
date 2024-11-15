import * as THREE from 'three';
import { CelestialBody } from './CelestialBody';
import { Camera } from './Camera';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { RenderPass } from 'three/examples/jsm/Addons.js';
import { AfterimagePass } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/examples/jsm/Addons.js';
import * as SolarSystem from './SolarSystem.js'
/*
    https://en.wikipedia.org/wiki/Barnes%E2%80%93Hut_simulation    //For the asteroid fields
    https://en.wikipedia.org/wiki/Fast_multipole_method
*/
//TODO Gui with lil-gui
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
const perspectiveCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 50000 );
const camera = new Camera(perspectiveCamera, renderer);
const renderScenePass = new RenderPass(scene,camera.camera);
//const afterImagePass = new AfterimagePass();
const trailComposer = new EffectComposer(renderer);
const clock = new THREE.Clock();
const stats = new Stats();
const raycaster = new THREE.Raycaster();
raycaster.layers.enableAll();

function initThreeJS() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    renderer.clear();
    //afterImagePass.uniforms["damp"].value = 0.975;
    trailComposer.addPass(renderScenePass);
    //trailComposer.addPass(afterImagePass);
    stats.showPanel(0);
    perspectiveCamera.position.y = 5000;
    perspectiveCamera.position.x = 1000;
    perspectiveCamera.rotateX(-Math.PI/2); //looking downwards
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(stats.dom);
    window.addEventListener('resize', onWindowResize, false);
}
initThreeJS();

function onWindowResize() {
    renderer.height = window.innerHeight;
    renderer.width = window.innerWidth;
    camera.camera.aspect = window.innerWidth / window.innerHeight;
    camera.camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
    
}

function sendBodiesToWorker(bodies, worker) {
    var rawPhysicsData = [];
    bodies.forEach(body => {
        rawPhysicsData.push(body.getPhysicsData());
    });
    worker.postMessage([0,rawPhysicsData]);
}

const simulationWorker = new Worker("simulationWorker.js", {type:"module"});
var bodies = SolarSystem.createCelestialBodies(scene);
//var bodies = [new CelestialBody(0, 0, 0, 2, 1.9884e30, new THREE.Vector3(0,0,0), 0xf0e816),
//              new CelestialBody(150e9, 0, 0, 1, 5.97219e24, new THREE.Vector3(0,0,30000), 0x1541ed)];

//var meshes = [new THREE.Mesh(new THREE.SphereGeometry(bodies[0].radius,32,16), new THREE.MeshBasicMaterial({color:bodies[0].color, wireframe:true})),new THREE.Mesh(new THREE.SphereGeometry(bodies[1].radius,32,16), new THREE.MeshBasicMaterial({color:bodies[1].color, wireframe:true}))];
sendBodiesToWorker(bodies, simulationWorker);
simulationWorker.onmessage = (e) => {
    for(var i = 0; i < e.data.length; i++) {
        bodies[i].setPhysicsData(e.data[i]);
    }
}

var bottomPlane = new THREE.Mesh(new THREE.PlaneGeometry(10000,10000,1000,1000), new THREE.MeshBasicMaterial( {color:0xffffff, wireframe:true}))
bottomPlane.rotateOnAxis(new THREE.Vector3(1,0,0),Math.PI/2);
var xHelperArrow = new THREE.ArrowHelper(new THREE.Vector3(10000,0,0),new THREE.Vector3(10,0,0), 10000, 0xf51e0f); //RED
var yHelperArrow = new THREE.ArrowHelper(new THREE.Vector3(0,10000,0),new THREE.Vector3(10,0,0), 10000, 0x4cf50f); //GREEN
var zHelperArrow = new THREE.ArrowHelper(new THREE.Vector3(0,0,10000),new THREE.Vector3(10,0,0), 10000, 0x0f4cf5); //BLUE
//scene.add(bottomPlane);
scene.add(xHelperArrow);
scene.add(yHelperArrow);
scene.add(zHelperArrow);
//scene.add(meshes[0]);
//scene.add(meshes[1]);

let targetName = "";
window.addEventListener("pointerup", (event) => {
    
    let pointer = new THREE.Vector2();
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    let meshes = [];
    bodies.forEach(body => {
        body.mesh.updateWorldMatrix();
        body.selectMesh.updateWorldMatrix();
        meshes.push(body.mesh);
        meshes.push(body.selectMesh);
    });

    raycaster.setFromCamera(pointer,camera.camera);
    let intersects = raycaster.intersectObjects(meshes, false);
    if(intersects.length > 0) {
        targetName = intersects[0].object.name;
    } //TODO Make sure there is a pointerdown event first
});

function render() {
    stats.begin();
    var deltaTime = clock.getDelta();
    requestAnimationFrame(render);
    for(var i = 0; i < bodies.length; i++) {
        bodies[i].draw(camera);
    }
    if(targetName != "") {
        camera.setTarget(bodies.find((b) => b.name == targetName));
    }
    camera.move(deltaTime);

    simulationWorker.postMessage([1]);
    renderer.clear();
    //camera.layers.set(1);
    //trailComposer.render(scene,camera);
    renderer.clearDepth();
    perspectiveCamera.layers.set(0);
    renderer.render(scene,perspectiveCamera);

    //var deltaTime = clock.getDelta();
    //camera.move(deltaTime);
    
    //moveCelestialBodies(celestialBodies, deltaTime*10000000);
    stats.end();
}
render();
//This thread handles the rendering and storing all the meshes
//The webworker works on the gravitational results and pushes back
//a list of positional values (and maybe velocities)

/*
const G = 6.6743e-11;
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);
const scene = new THREE.Scene();
const clock = new THREE.Clock();
const camera = new Camera();
const renderer = new THREE.WebGLRenderer({antialias:true, preserveDrawingBuffer:true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.autoClear = false;
renderer.clear();
document.body.appendChild( renderer.domElement );

var bottomPlane = new THREE.Mesh(new THREE.PlaneGeometry(100,100,100,100), new THREE.MeshBasicMaterial( {color:0xffffff, wireframe:true}))
var sun = new CelestialBody(0, 0, 0, 2, 1.9884e30, new THREE.Vector3(0,0,0), 0xf0e816);
var earth = new CelestialBody(10, 0, 0, 1, 5.97219e24, new THREE.Vector3(0,0,30000), 0x1541ed);
var earth2 = new CelestialBody(7, 0, 0, 1, 5.97219e24, new THREE.Vector3(0,0,30000), 0x1541ed);

var velocityArrow = new THREE.ArrowHelper(earth.velocity.clone().normalize(), new THREE.Vector3(earth.position.x/15e9,earth.position.y/15e9,earth.position.z/15e9), 5, 0xdb12ac);
scene.add(bottomPlane);
scene.add(sun.mesh);
scene.add(earth.mesh);
scene.add(earth.trailmesh);
scene.add(earth2.mesh);
scene.add(earth2.trailmesh);
scene.add(velocityArrow);
bottomPlane.rotateOnAxis(new THREE.Vector3(1,0,0),Math.PI/2);
camera.camera.position.y = 15;
camera.camera.rotateX(-Math.PI/2);
var celestialBodies = [sun,earth,earth2];


const renderScene = new RenderPass(scene,camera.camera);
const afterImagePass = new AfterimagePass();
afterImagePass.uniforms["damp"].value = 0.975;
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(afterImagePass);


function onNewFrame() {
    stats.begin();
    requestAnimationFrame(onNewFrame);
    renderer.clear();

    camera.camera.layers.set(1);
    composer.render(scene,camera.camera);
    
    renderer.clearDepth();
    camera.camera.layers.set(0);
    renderer.render(scene,camera.camera);

    var deltaTime = clock.getDelta();
    camera.move(deltaTime);
    
    //
    moveCelestialBodies(celestialBodies, deltaTime*10000000);
    velocityArrow.setDirection(earth.velocity.clone());
    velocityArrow.setLength(5);
    velocityArrow.position.copy(new THREE.Vector3(earth.position.x/15e9,earth.position.y/15e9,earth.position.z/15e9));
    //
    stats.end();
    
}

onNewFrame();

function moveCelestialBodies(bodies, deltaTime) {
    bodies.forEach(sourceBody => {
        bodies.forEach(targetBody => {
            if(targetBody == sourceBody) return;
            var F = (G*sourceBody.mass*targetBody.mass)/Math.pow(targetBody.position.distanceTo(sourceBody.position),2);
            sourceBody.velocity.add(new THREE.Vector3().subVectors(targetBody.position,sourceBody.position).normalize().multiplyScalar((F/sourceBody.mass)*deltaTime));
            });
    });

    bodies.forEach(body => {
        body.position.add(body.velocity.clone().multiplyScalar(deltaTime));
        body.draw();
    });
}*/