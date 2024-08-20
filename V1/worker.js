import Stats from 'three/examples/jsm/libs/stats.module.js';
const stats = new Stats();
stats.begin();
var F = G*(sun.mass*earth.mass)/sun.position.distanceToSquared(earth.position);
var sunAcceleartion = (earth.position.clone().sub(sun.position)).normalize().multiplyScalar((F/sun.mass));
var earthAcceleration = (sun.position.clone().sub(earth.position)).normalize().multiplyScalar((F/earth.mass));
earth.position.add(earth.velocity.add(earthAcceleration.multiplyScalar(deltaTime*0.5)).multiplyScalar(deltaTime));
earth.velocity.add(earthAcceleration.multiplyScalar(deltaTime));

stats.end();