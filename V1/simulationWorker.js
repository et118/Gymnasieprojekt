import * as THREE from 'three';
const G = 6.6743e-11;
const clock = new THREE.Clock();
const timeFactor = 2000000;
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

    var deltaTime = clock.getDelta();
    if(deltaTime > 0.001) deltaTime = 0.001; //To prevent time leaps, for example when tabbing out sometimes
    time += deltaTime;
    counter += 1;
    if(time >= 1) {
        console.log(counter);
        counter = 0;
        time = 0;
    }
    deltaTime *= timeFactor;
    bodies.forEach(sourceBody => {
        bodies.forEach(targetBody => {
            if(targetBody == sourceBody) return;
            //Den andra targetBody loopen borde minska i med 1 per gång för att halvera beräkningarna.
            var F = (G*sourceBody.mass*targetBody.mass)/Math.pow(distanceBetween(targetBody.position,sourceBody.position),2);
            sourceBody.velocity = vectorAdd(sourceBody.velocity,new THREE.Vector3().subVectors(targetBody.position,sourceBody.position).normalize().multiplyScalar((F/sourceBody.mass)*deltaTime));
            });
    });

    bodies.forEach(body => {
        body.position = vectorAdd(body.position,vectorMultiply(body.velocity,deltaTime));
    });
    setTimeout(process,0);
    //channel.port2.postMessage(null);// TODO: Add back for simulation quality
}
// https://stackoverflow.com/questions/18826570/settimeout0-vs-window-postmessage-vs-messageport-postmessage 
channel.port1.onmessage = function (ev) {
    process();
}
channel.port1.start();
channel.port2.start();
process();