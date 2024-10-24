import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { sun } from './classes/sun';
import moment from 'moment';

let camera: THREE.OrthographicCamera;
let controls: any;
let scene: THREE.Scene;
let renderer: THREE.Renderer;

let theSun: sun
let duration: number
let startAtProgress: number
let startTime: number | null

async function init() {
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 100;
    camera = new THREE.OrthographicCamera(
        frustumSize * aspect / - 2,
        frustumSize * aspect / 2,
        frustumSize / 2,
        frustumSize / - 2,
        0.1,
        1000
    );
    camera.position.set(0, 100, 0);
    camera.lookAt(0, 0, 0);

    // Adding a flat plane
    let planeSize: number = 178;
    const geometry = new THREE.PlaneGeometry(planeSize, planeSize);
    const material = new THREE.MeshBasicMaterial({ color: 0x2574EB, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = Math.PI / 2; // Rotate the plane to lie flat
    scene.add(plane);

    // show axis
    const axesHelper = new THREE.AxesHelper(5000);
    axesHelper.setColors('#fc0303', '#036ffc', '#03fc17')
    // scene.add(axesHelper);

    // setup orbitControls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;
    // controls.target = new THREE.Vector3(0,0,0)

    theSun = new sun(scene);
    await theSun.main()

    // Animation parameters
    duration = theSun.daylightDuration.asSeconds(); // in seconds
    startAtProgress = 1 - 2.73 * Math.pow(10, -8) * (theSun.daylightDuration.asMilliseconds() - theSun.elapsedDaylight.asMilliseconds())
    startTime = null;

    setInterval(updateClock, 1000);

    updateClock();

    const moonRadius = 10;
    const moonSegments = 512;
    const moonGeometry = new THREE.CircleGeometry(moonRadius, moonSegments);

    const moonTexture = new THREE.TextureLoader().load('./assets/moon.png');
    const moonMaterial = new THREE.MeshBasicMaterial({
        map: moonTexture,
        side: THREE.DoubleSide
    });

    const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    moonMesh.position.y = 1;
    // scene.add(moonMesh);

    moonMesh.rotation.x = Math.PI / 2;

}

function updateClock() {
    const uhrzeit = document.getElementById('uhrzeit');
    const datum = document.getElementById('datum');
    uhrzeit!.textContent = moment().format('LT').toString();
    datum!.textContent = moment().format('ll').toString();

    const sunset = document.getElementById('sunset');
    sunset!.textContent = `Sonnenuntergang in ${theSun.daylightDuration.hours() - theSun.elapsedDaylight.hours()} Stunden`;
}

function getBezierPoint(t: number, p0: { x: any; z: any; }, p1: { x: any; z: any; }, p2: { x: any; z: any; }) {
    const x = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
    const z = Math.pow(1 - t, 2) * p0.z + 2 * (1 - t) * t * p1.z + Math.pow(t, 2) * p2.z;
    return { x, z };
}

const clock = new THREE.Clock();
function animate(time: number) {
    requestAnimationFrame(animate);
    // Set start time on first frame
    if (!startTime) startTime = time;

    // Calculate elapsed time in seconds
    const elapsedTime = (time - startTime) / 1000; // Convert to seconds

    // Normalize elapsed time for the animation, starting at 30%
    const t = Math.min((elapsedTime / duration) + startAtProgress, 1); // Normalize to [0.3, 1]

    // Define control points for the Bezier curve
    const p0 = { x: -99, z: 20 }; // Start position
    const p1 = { x: 0, z: -70 };    // Peak position (control point)
    const p2 = { x: 99, z: 20 };   // End position

    // Calculate the current position on the curve
    const position = getBezierPoint(t, p0, p1, p2);
    theSun.disc.position.set(position.x, 1, position.z);
    render()
    // Stop animation if completed
    if (t >= 1) {
        console.log('Animation finished');
    }
}

function render() {
    renderer.render(scene, camera);
}


init().then(() => {
    animate(clock.getDelta());
})