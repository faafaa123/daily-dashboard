import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { sun } from './classes/sun';
import moment from 'moment';
import { moon } from './classes/moon';


let camera: THREE.OrthographicCamera;
let controls: any;
let scene: THREE.Scene;
let renderer: THREE.Renderer;

let theSun: sun
let theMoon: moon

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
    const material = new THREE.MeshBasicMaterial({ color: 0x103D67, side: THREE.DoubleSide });
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
    controls.target = new THREE.Vector3(0,0,0)

    theSun = new sun(scene);
    await theSun.main()

    // theMoon = new moon(scene)
    // await theMoon.main()

    // CSS Overlay
    setInterval(updateClock, 1000);
    updateClock();

}

function updateClock() {
    const uhrzeit = document.getElementById('uhrzeit');
    const datum = document.getElementById('datum');
    uhrzeit!.textContent = moment().format('LT').toString();
    datum!.textContent = moment().format('ll').toString();

    // const sunset = document.getElementById('sunset');
    // sunset!.textContent = `Sonnenuntergang in ${theSun.daylightDuration.hours() - theSun.elapsedDaylight.hours()} Stunden`;
}

const clock = new THREE.Clock();

function animate(time: number) {
    requestAnimationFrame(animate);
    if (theSun.isDay) {
        theSun.animateSun(time)
    } else {
        theSun.animateMoon(time)
    }
    render()
}

function render() {
    renderer.render(scene, camera);
}

init().then(() => {
    animate(clock.getDelta());
})