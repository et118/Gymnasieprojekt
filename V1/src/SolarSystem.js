import { CelestialBody } from "./CelestialBody";
import * as THREE from 'three';

//Taken at timestamp 2024-01-01 00:00
export function createCelestialBodies(scene) {
    let bodies = [
        new CelestialBody(-1.191989205285392E+09, -4.347654370292560E+08, 3.146124454779254E+07, 695700E+03, 1988410E+24, 8.441016159655652E+00, -1.221912155158748E+01, -7.918737699351246E-02, 0xf0e816, "Sun", 0, true),
        new CelestialBody(-4.227610797568034E+10, 2.953899410451555E+10, 6.249351652770508E+09, 2439.4E+03, 3.302E+23, -3.864898908767687E+04, -3.735110987200028E+04, 4.943644151005024E+02, 0xe7e8ec, "Mercury", 1, true),
        new CelestialBody(-1.081907314450878E+11, -1.189049058816830E+10, 6.048049571687455E+09, 6051.84E+03, 48.685E+23, 3.521901293154280E+03, -3.498977541526820E+04, -6.831705083215418E+02, 0xa57c1b, "Venus", 2, true),
        new CelestialBody(-2.600298246493929E+10, 1.445600958366426E+11, 2.324604087693989E+07, 6371.01E+03, 5.97219E+24, -2.983302263902714E+04, -5.138481408411204E+03, 1.105037462794778E+00, 0x287ab8, "Earth", 3, true),
        new CelestialBody(-4.507776377907523E+10, -2.175196919117816E+11, -3.441546040035352E+09, 3389.92E+03, 6.4171E+23, 2.467035556744491E+04, -2.734379283528958E+03, -6.620610977463190E+02, 0x451804, "Mars", 4, true),
        new CelestialBody(5.213788684191694E+11, 5.313921173350976E+11, -1.386927161426872E+10, 69911E+03, 1.89818722E+27, -9.472749551232376E+03, 9.769723278798496E+03, 1.713482687627850E+02, 0xf2cb5e, "Jupiter", 5, true),
        new CelestialBody(1.344601253411938E+12, -5.563641832485545E+11, -4.386116485125002E+10, 58232E+03, 5.6834E+26, 3.154738329638970E+03, 8.905697033811052E+03, -2.800174164245637E+02, 0xe2bf7d, "Saturn", 6, true),
        new CelestialBody(1.834522305517283E+12, 2.288456660822787E+12, -1.526719613667381E+10, 25362E+03, 86.813E+24, -5.363387289952575E+03, 3.942149642675445E+03, 8.415630332487223E+01, 0x93cdf1, "Uranus", 7, true),
        new CelestialBody(4.463254657936563E+12, -2.683505989444137E+11, -9.733437553053553E+10, 24624E+03, 102.409E+24, 2.902850778685768E+02, 5.457722901299887E+03, -1.190809629226703E+02, 0x4b70dd, "Neptune", 8, true),
        new CelestialBody(2.573383393538842E+12, -4.539031297840591E+12, -2.586735994012043E+11, 1188.3E+03, 1.397E+22, 4.852904330630173E+03, 1.470330245973855E+03, -1.568836034354255E+03, 0x808080, "Pluto", 9, true)
        //new CelestialBody(0, 0, 0, 695.7e6, 1988400e24, 0, 0, 0, 0xf0e816, "Sun"), 
        //new CelestialBody(149e9, 0, 0, 6.371e6, 5.9722e24, 0, 0, 29780, 0x1541ed, "Earth") 
    ];
    //From presimulated orbits
    
    //const moons = getMoonBodies();
    //bodies = bodies.concat(moons);
    bodies.forEach(body => {
        body.addToScene(scene);
    });
    return bodies;
}

export function createMoonBodies(scene) {
    const moons = getMoonBodies();
    moons.forEach(moon => {
        moon.addToScene(scene);
    });
    return moons;
}

function getMoonBodies() {
    const request = new XMLHttpRequest();
    request.open("GET", "/moons.json", false);
    request.send();
    const data = JSON.parse(request.responseText);
    
    return Object.entries(data).map(([key, value]) => {
        let groupID = 0;
        if (key == 301) groupID = 3;
        if (key >= 401 && key < 403) groupID = 4;
        if ((key >= 501 && key < 573) || (key >= 55501 && key < 55524)) groupID = 5;
        if ((key >= 601 && key < 667) || (key == 65067 || key == 65070 || key == 65077 || key == 65079 || key == 65081 || key == 65082 || key == 65084) || (key >= 65085 && key < 65099) || (key >= 65100 && key < 655158)) groupID = 6;
        if ((key >= 701 && key < 728) || (key == 75051)) groupID = 7;
        if ((key >= 801 && key < 815) || (key == 85051 || key == 85052)) groupID = 8;
        if ((key >= 901 && key < 906)) groupID = 9;
        return new CelestialBody(value.x, value.y, value.z, value.radius, value.mass, value.xV, value.yV, value.zV, 0xff0000, value.name, groupID, false);
    });
}
/*getCelestialBodyFromHorizons(499);
function getCelestialBodyFromHorizons(target) {
    let body;
    let url = "https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=%27TARGETBODY%27&OBJ_DATA=%27YES%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27VECTORS%27&CENTER=%27500@0%27&START_TIME=%27STARTTIME%27&STOP_TIME=%27ENDTIME%27&STEP_SIZE=%271%20min%27&VEC_TABLE=%272%27&VEC_LABELS=%27NO%27&CSV_FORMAT=%27YES%27";
    url = url.replace("TARGETBODY", target);
    url = url.replace("STARTTIME", "2024-01-01%2000:00");
    url = url.replace("ENDTIME", "2024-01-01%2000:01");
    fetch(url, {mode:"no-cors"})
              .then((response) => response.json())
              .then((json) => {
                console.log(json);
              });
}*/