import { CelestialBody } from "./CelestialBody";

export function createCelestialBodies(scene) {
    var bodies = [
        new CelestialBody(0, 0, 0, 695.7e6, 1988400e24, 0, 0, 0, 0xf0e816, "Sun"), ////https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html 
        new CelestialBody(149e9, 0, 0, 6.371e6, 5.9722e24, 0, 0, 29780, 0x1541ed, "Earth") //https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html 
    ];
    bodies.forEach(body => {
        body.addToScene(scene);
    });
    return bodies;
}