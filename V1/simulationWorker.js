import * as THREE from 'three';
const G = 6.6743e-11;
const clock = new THREE.Clock();
const timeFactor = 2000000;
const maximumTimestep = 0.0001
var bodies = []

onmessage = (e) => {
    const type = e.data[0]; //0 == set bodies, 1 == get bodies
    if(type == 0) {
        bodies = e.data[1];
    } else if(type == 1){
        postMessage(bodies);
    }
};

function distanceBetween(v1, v2) {
    var dx = v1.x - v2.x;
    var dy = v1.y - v2.y;
    var dz = v1.z - v2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function vectorAdd(v1, v2) {
    var out = {x:0,y:0,z:0};
    out.x = v1.x + v2.x;
    out.y = v1.y + v2.y;
    out.z = v1.z + v2.z;
    return out;
}

function vectorMultiply(v1, x) {
    var out = {x:0,y:0,z:0};
    out.x = v1.x * x;
    out.y = v1.y * x;
    out.z = v1.z * x;
    return out;
}

var counter = 0;
var time = 0;
var channel = new MessageChannel();

function process() {

    let deltaTime = clock.getDelta();
    time += deltaTime;
    counter += 1;
    if(time >= 1) {
        //console.log("TargetSpeed: " + timeFactor + "x    CPU Speed: " + ((maximumTimestep / (time / counter)) > 1 ? timeFactor + "x " + Math.round((maximumTimestep / (time / counter))*100) + "% simulation quality" : (maximumTimestep / (time / counter)) * timeFactor + "x"));
        counter = 0;
        time = 0;
    }
    if(deltaTime > maximumTimestep) deltaTime = maximumTimestep; //To prevent time leaps, for example when tabbing out sometimes or when overloaded
    
    deltaTime *= timeFactor;
    for(let i = 0; i < bodies.length - 1; i++) {
        for(let j = i + 1; j < bodies.length; j++) {
            let sourceBody = bodies[j];
            let targetBody = bodies[i];
            if(!targetBody.majorCelestial && targetBody.groupID != sourceBody.groupID) continue;
            let F = (G*sourceBody.mass*targetBody.mass)/Math.pow(distanceBetween(targetBody.position,sourceBody.position),2);
            let direction = new THREE.Vector3().subVectors(targetBody.position,sourceBody.position).normalize();
            sourceBody.velocity = vectorAdd(sourceBody.velocity,direction.multiplyScalar((F/sourceBody.mass)*deltaTime));
            targetBody.velocity = vectorAdd(targetBody.velocity,direction.multiplyScalar((F/targetBody.mass)*deltaTime*-1));
        };
    }

    bodies.forEach(body => {
        body.position = vectorAdd(body.position,vectorMultiply(body.velocity,deltaTime));
    });
    setTimeout(process,0);
    //channel.port2.postMessage(null);// TODO: Add back for simulation quality but increased CPU usage
}
// https://stackoverflow.com/questions/18826570/settimeout0-vs-window-postmessage-vs-messageport-postmessage 
channel.port1.onmessage = function (ev) {
    process();
}
channel.port1.start();
channel.port2.start();
process();