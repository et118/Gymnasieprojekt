import * as THREE from 'three';
const G = 6.6743e-11;
const clock = new THREE.Clock();
let targetTimeFactor = 1;
let maximumTimestep = 1; //1 second per frame
let bodies = []

onmessage = (e) => {
    const type = e.data[0]; //0 == set bodies,     1 == get bodies
                            //2 == setMaxTimestep, 3 == timeFactor
    if(type == 0) {
        bodies = e.data[1];
    } else if(type == 1){
        postMessage([averageTimestep,bodies]); //Send back bodies, and current simulation metrics
    } else if(type == 2) {
        maximumTimestep = e.data[1];
    } else if(type == 3) {
        targetTimeFactor = e.data[1];
    }
};

function distanceBetween(v1, v2) {
    let dx = v1.x - v2.x;
    let dy = v1.y - v2.y;
    let dz = v1.z - v2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function vectorAdd(v1, v2) {
    let out = {x:0,y:0,z:0};
    out.x = v1.x + v2.x;
    out.y = v1.y + v2.y;
    out.z = v1.z + v2.z;
    return out;
}

function vectorMultiply(v1, x) {
    let out = {x:0,y:0,z:0};
    out.x = v1.x * x;
    out.y = v1.y * x;
    out.z = v1.z * x;
    return out;
}

let counter = 0;
let time = [];
let averageTimestep = 0;
let channel = new MessageChannel();

function process() {
    let deltaTime = clock.getDelta();
    if(deltaTime == 0) {
        channel.port2.postMessage(null);
        return;
    }

    //Statistics for the GUI
    time.push(deltaTime);
    counter += 1;
    if(time.reduce((p,c)=>p+c,0) >= 0.1) {
        averageTimestep = time.sort((a,b)=>a-b)[Math.floor(time.length/2)];
        counter = 0;
        time = [];
    }
    
    deltaTime *= targetTimeFactor;
    if(deltaTime > maximumTimestep) deltaTime = maximumTimestep; //To prevent time leaps, for example when tabbing out sometimes or when overloaded

    //Apply new velocities
    for(let i = 0; i < bodies.length - 1; i++) {
        for(let j = i + 1; j < bodies.length; j++) {
            let sourceBody = bodies[j];
            let targetBody = bodies[i];
            if(!targetBody.majorCelestial && targetBody.groupID != sourceBody.groupID) continue; //Exclude moons from affecting planets other than their own
            //Calculate the force and direction of said force between the bodies
            let F = (G*sourceBody.mass*targetBody.mass)/Math.pow(distanceBetween(targetBody.position,sourceBody.position),2);
            let direction = new THREE.Vector3().subVectors(targetBody.position,sourceBody.position).normalize();
            //Apply new velocities while taking deltaTime into consideration
            sourceBody.velocity = vectorAdd(sourceBody.velocity,direction.multiplyScalar((F/sourceBody.mass)*deltaTime));
            targetBody.velocity = vectorAdd(targetBody.velocity,direction.multiplyScalar((F/targetBody.mass)*deltaTime*-1));
        };
    }
    //Step all bodies forward
    for(let i = 0; i < bodies.length; i++) {
        let body = bodies[i];
        body.position = vectorAdd(body.position,vectorMultiply(body.velocity,deltaTime));
    }

    //setTimeout(process,0); //Add for slower simulation speed
    channel.port2.postMessage(null);//Add for faster simulation speed but increased CPU usage
}
// https://stackoverflow.com/questions/18826570/settimeout0-vs-window-postmessage-vs-messageport-postmessage 
channel.port1.onmessage = function (ev) {
    process();
}
channel.port1.start();
channel.port2.start();
process();