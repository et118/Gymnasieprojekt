import * as THREE from 'three';
import { GUI } from "lil-gui";
import { Camera } from './Camera.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import * as SolarSystem from './SolarSystem.js'
/*
    https://en.wikipedia.org/wiki/Barnes%E2%80%93Hut_simulation    //For the asteroid fields
    https://en.wikipedia.org/wiki/Fast_multipole_method
*/
/*
Deadline task list:
1. Make orbits not rely on framerate
2. Pre-compute orbits
3. Refactor all code
4. Show current date
*/

//Global Variables
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({antialias:true});
const perspectiveCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.001, 50000 );
const camera = new Camera(perspectiveCamera, renderer);
const guiStats = new GUI();
const guiCelestials = new GUI();
const guiControlPanel = new GUI();
const clock = new THREE.Clock();
const stats = new Stats();
const raycaster = new THREE.Raycaster();
raycaster.layers.enableAll();

let maximumTimeStep = 1; //1 second steps
let targetTimeFactor = 1; //Target speed
let averageTimestep = 0; //How long each simulation frame takes

function initThreeJS() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    renderer.clear();
    stats.showPanel(0);
    perspectiveCamera.position.z = 5000;
    perspectiveCamera.position.x = 1000;
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
    let rawPhysicsData = [];
    bodies.forEach(body => {
        rawPhysicsData.push(body.getPhysicsData());
    });
    worker.postMessage([0,rawPhysicsData]);
}

//Setting up simulation thread and giving it data
const simulationWorker = new Worker(new URL("./simulationWorker.js", import.meta.url), {type:"module"});
let bodies = SolarSystem.createCelestialBodies(scene);
bodies = bodies.concat(SolarSystem.createMoonBodies(scene));
sendBodiesToWorker(bodies, simulationWorker);
simulationWorker.postMessage([2, maximumTimeStep]);
simulationWorker.postMessage([3, targetTimeFactor]);
simulationWorker.onmessage = (e) => {
    averageTimestep = e.data[0];
    //console.log(simulationTimestep);
    for(let i = 0; i < e.data[1].length; i++) { //TODO: Interpolation so they don't lag
        bodies[i].setPhysicsData(e.data[1][i]);
    }
}

/*var bottomPlane = new THREE.Mesh(new THREE.PlaneGeometry(10000,10000,1000,1000), new THREE.MeshBasicMaterial( {color:0xffffff, wireframe:true}))
bottomPlane.rotateOnAxis(new THREE.Vector3(1,0,0),Math.PI/2);
var xHelperArrow = new THREE.ArrowHelper(new THREE.Vector3(10000,0,0),new THREE.Vector3(10,0,0), 10000, 0xf51e0f); //RED
var yHelperArrow = new THREE.ArrowHelper(new THREE.Vector3(0,10000,0),new THREE.Vector3(10,0,0), 10000, 0x4cf50f); //GREEN
var zHelperArrow = new THREE.ArrowHelper(new THREE.Vector3(0,0,10000),new THREE.Vector3(10,0,0), 10000, 0x0f4cf5); //BLUE
scene.add(xHelperArrow);
scene.add(yHelperArrow);
scene.add(zHelperArrow);*/

//Planet stats GUI
let targetName = "Sun";
let targetCelestial = bodies.find((b) => b.name == targetName);
let options = {
    name: targetCelestial.name,
    groupID: targetCelestial.groupID,
    majorCelestial: targetCelestial.majorCelestial,
    mass: targetCelestial.mass,
    radius: targetCelestial.radius
}
guiStats.title("Stats");
guiStats.add(options, "name").listen().disable();
guiStats.add(options, "groupID").listen().onChange(value => {options.groupID = value;});
guiStats.add(options, "majorCelestial").listen().onChange(value => {options.majorCelestial = value;});
guiStats.add(options, "mass").listen().onChange(value => {options.mass = value;});
guiStats.add(options, "radius").listen().onChange(value => {options.radius = value;});

//Planet selector GUI
guiCelestials.title("Celestials");
guiCelestials.domElement.id = "guiCelestials";
document.getElementById("celestialsDiv").appendChild(guiCelestials.domElement);
guiCelestials.addFolder("Sun").open(false);
guiCelestials.addFolder("Mercury").open(false);
guiCelestials.addFolder("Venus").open(false);
guiCelestials.addFolder("Earth").open(false);
guiCelestials.addFolder("Mars").open(false);
guiCelestials.addFolder("Jupiter").open(false);
guiCelestials.addFolder("Saturn").open(false);
guiCelestials.addFolder("Uranus").open(false);
guiCelestials.addFolder("Neptune").open(false);
guiCelestials.addFolder("Pluto").open(false);

bodies.forEach((body) => {
    if(!body.majorCelestial) {
        let celestial = "Sun";
        if(body.groupID == 1) celestial = "Mercury";
        if(body.groupID == 2) celestial = "Venus";
        if(body.groupID == 3) celestial = "Earth";
        if(body.groupID == 4) celestial = "Mars";
        if(body.groupID == 5) celestial = "Jupiter";
        if(body.groupID == 6) celestial = "Saturn";
        if(body.groupID == 7) celestial = "Uranus";
        if(body.groupID == 8) celestial = "Neptune";
        if(body.groupID == 9) celestial = "Pluto";
        guiCelestials.folders.forEach((folder) => {
            if(folder._title == celestial) {
                folder.addFolder(body.name).open(false);
            } 
        });
    }
});

guiCelestials.onOpenClose( changedGUI => {
    guiCelestials.folders.forEach((folder) => {
        if(folder._title != changedGUI._title) {
            folder.open(false);
        }
    });
    if(!changedGUI._closed) {
        targetCelestial.selected = false;
        targetName = changedGUI._title;
        targetCelestial = bodies.find((b) => b.name == targetName);
        targetCelestial.selected = true;
        options.groupID = targetCelestial.groupID;
        options.majorCelestial = targetCelestial.majorCelestial;
        options.mass = targetCelestial.mass;
        options.radius = targetCelestial.radius;
        options.name = targetCelestial.name;
    }
} );

//Control panel GUI
guiControlPanel.title("Control Panel");
guiControlPanel.domElement.id = "guiControlPanel";
document.getElementById("controlPanelDiv").appendChild(guiControlPanel.domElement);
guiControlPanel.add({enableMoons:true},"enableMoons").name("Enable Moons").listen().onChange(value => {
    if(value) {
        bodies.forEach(body => {
            body.removeFromScene(scene);
        });
        
        bodies = SolarSystem.createCelestialBodies(scene);
        bodies = bodies.concat(SolarSystem.createMoonBodies(scene));
        sendBodiesToWorker(bodies, simulationWorker);
    } else {
        console.log(bodies.length);
        bodies.forEach(body => {
            body.removeFromScene(scene);
        });
        bodies = SolarSystem.createCelestialBodies(scene);
        
        console.log(bodies.length);
        sendBodiesToWorker(bodies, simulationWorker);
    }
});
guiControlPanel.add({enableOrbits:true},"enableOrbits").name("Enable Moon Orbits").setValue(false).listen().onChange(value => {
    bodies.forEach(body => {
        if(!body.majorCelestial) {
            body.alwaysShowTrail = value;
        }
    })
});
guiControlPanel.add({maximumTimeStep:1},"maximumTimeStep",1,10000, 1).name("Maximum Time Step").listen().onChange(value => {
    maximumTimeStep = value;
    simulationWorker.postMessage([2, maximumTimeStep]);
    document.getElementById("MaximumTimeStep").getElementsByTagName("span")[0].innerText = timeToUnits(maximumTimeStep).replace("/s","");
    });
guiControlPanel.$children.insertBefore(document.getElementById("timeFactorLabel"), guiControlPanel.$children.childNodes[0]);
guiControlPanel.$children.insertBefore(document.getElementById("timeFactorBar"), guiControlPanel.$children.childNodes[0]);
document.getElementsByClassName("controller number hasSlider")[0].getElementsByClassName("widget")[0].getElementsByTagName("input")[0].insertAdjacentElement("afterend",document.getElementById("MaximumTimeStep"))
//Time Factor Controller
//simulationTimestep = the milliseconds that each simulation step takes
//maximumTimestep = the cap that each frame has
//timeFactor = how many times real time speed the simulation runs at

//maximumTimestep * timeFactor = highest possible timestep (Ex. 4 days means the planets jump to their new location every 4 days) //TODO: Show next to MaximumTimestep slider to give some real value

/*
I wanna run the simulation at 100x real speed.
Therefore timeFactor is 100;
MaximumTimestep is set at 0.0001;
Therefore the highest timestep in the simulation is 100*0.0001 = 0.01 = 1 millisecond
But the cpu is probably good enough to make the timestep even smaller, and therefore increase the quality

Now i want to run the simulation at 20.000.000x speed.
Therefore timeFactor is 20.000.000
MaximumTimestep is still 0.0001;
Therefore the highest possible timestep in the simulation is 20000000*0.0001 = 2000 = 33.33 minutes
The cpu will most likely be limited and reach the highest possible timestep

To make it work i think i will have to change MaximumTimestep to apply after timeFactor * deltatime and be in the form of (maximum time passed per tick)
If that is the case then another example again:

Running the simulation at target 20.000.000x speed
Therefore timeFactor is 20.000.000
MaximumTimestep is 1 second  = 1
Let's say deltaTime is 0.05 seconds
Then the wanted timestep is 0.05 * 20.000.000 = 1.000.000 = 11.5d
But we have a limit of 1 second, so the actual speed of the simulation is: (1 / 1.000.000) * 20.000.000 = 20x speedup

Goals: 
1. Change from the weird timeFactor * capped deltatime, to a cap(timeFactor * deltaTime)
2. Change maximumTimestep to be the amount of Time that a simulation step can max take
3. Start working on the sliders.
*/
function timeToUnits(time) {
    let prefix = "sec/s";
    if (time >= 60) {
        prefix = "min/s";
        time /= 60;
    }
    if(time >= 60) {
        prefix = "hour/s";
        time /= 60;
    }
    if(time >= 24 && prefix == "hour/s") {
        prefix = "day/s";
        time /= 24;
    }
    if(time >= 365) {
        prefix = "year/s";
        time /= 365;
    }
    return time.toFixed(1) + prefix;
}

function updateTimeFactorController() {
    let currentSpeed = (maximumTimeStep / (averageTimestep));
    document.getElementById("timeFactorLimitBar").style.width = 100 * ((Math.log10(currentSpeed)) / (Math.log10(31556926))) + "%";

    document.getElementById("maxTimePin").getElementsByTagName("span")[0].textContent = timeToUnits(currentSpeed);
    //console.log(currentSpeed);

    //targetTimeFactor = 0 - 220
    let value = document.getElementById("timeFactorPin").style.left.split("px")[0] - 25;
    if(targetTimeFactor != Math.pow(10,(value/220) * Math.log10(31556926))) {
        targetTimeFactor = Math.pow(10,(value/220) * Math.log10(31556926));
        simulationWorker.postMessage([3, targetTimeFactor]);
    }

    document.getElementById("timeFactorPin").getElementsByTagName("span")[0].textContent = timeToUnits(targetTimeFactor);
}



//Clicking on planets
let clickStartTime = 0;
let startDragX = 0;
let startDragY = 0;
window.addEventListener("pointerdown", (event) => {
    clickStartTime = performance.now();
    startDragX = event.clientX;
    startDragY = event.clientY;
});

window.addEventListener("pointerup", (event) => { //200ms maximum and 10px distance minimum
    if(performance.now() - clickStartTime <= 200 && Math.hypot(event.clientX - startDragX, event.clientY - startDragY) <= 10) {
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
            targetCelestial.selected = false;
            targetName = intersects[0].object.name;
            targetCelestial = bodies.find((b) => b.name == targetName);
            if(!bodies.find((b) => b.name == intersects[0].object.name).majorCelestial) { //Prioritize major celestial when selecting
                for(let i = 0; i < intersects.length; i++) {
                    if(bodies.find((b) => b.name == intersects[i].object.name).majorCelestial) {
                        targetName = intersects[i].object.name;
                        targetCelestial = bodies.find((b) => b.name == targetName);
                        
                        break;
                    }
                }
            }
            console.log(targetCelestial.alwaysShowTrail);
            targetCelestial.selected = true;
            options.groupID = targetCelestial.groupID;
            options.majorCelestial = targetCelestial.majorCelestial;
            options.mass = targetCelestial.mass;
            options.radius = targetCelestial.radius;
            options.name = targetCelestial.name;
        }
    }
});
//Main loop
function render() {
    stats.begin();
    let deltaTime = clock.getDelta();
    requestAnimationFrame(render);
    updateTimeFactorController();
    for(let i = 0; i < bodies.length; i++) {
        bodies[i].draw(camera, targetCelestial.groupID);
    }
    if(targetName != "") {
        if(options.name == targetName && (options.groupID != targetCelestial.groupID || options.majorCelestial != targetCelestial.majorCelestial || options.mass != targetCelestial.mass || options.radius != targetCelestial.radius)) {
            console.log("UPDATING DATA");
            targetCelestial.groupID = options.groupID;
            targetCelestial.majorCelestial = options.majorCelestial;
            targetCelestial.mass = options.mass;
            targetCelestial.updateRadius(options.radius);
            for(let i = 0; i < bodies.length; i++) {
                if(bodies[i].name == targetName) {
                    bodies[i] = targetCelestial;
                }
            }
            sendBodiesToWorker(bodies,simulationWorker);
        }
        camera.setTarget(targetCelestial);
        
        
    }
    camera.move(deltaTime);

    simulationWorker.postMessage([1]);
    renderer.clear();
    renderer.clearDepth();
    renderer.render(scene,perspectiveCamera);

    stats.end();
}
render();