import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { sun } from './classes/sun';

let camera: THREE.OrthographicCamera;
let controls: any;
let scene: THREE.Scene;
let renderer: THREE.Renderer;
let mixer: THREE.AnimationMixer

async function init() {
    // setup scene and renderer
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Set up an OrthographicCamera
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 100;
    camera = new THREE.OrthographicCamera(
        frustumSize * aspect / - 2, // left
        frustumSize * aspect / 2,   // right
        frustumSize / 2,            // top
        frustumSize / - 2,          // bottom
        0.1,                        // near
        1000                        // far
    );
    camera.position.set(0, 100, 0); // Position the camera
    camera.lookAt(0, 0, 0); // Look at the center of the scene

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
    // controls.target = new THREE.Vector3(0,0,0)

    // setup light
    const hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.3);
    scene.add(hemiLight);
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 1).normalize();
    scene.add(light);

    // Adding a circular disc
    const radius = 10; // Radius of the disc
    const segments = 512; // Number of segments to approximate the circle
    const circleGeometry = new THREE.CircleGeometry(radius, segments);
    const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xC58F05, side: THREE.DoubleSide });
    const disc = new THREE.Mesh(circleGeometry, circleMaterial);
    disc.rotation.x = Math.PI / 2; // Rotate the disc to lie flat
    disc.position.y = 1
    disc.position.x = -99
    disc.position.z = 20
    scene.add(disc);

    let theSun = new sun();

    // Animation system setup
    // Define keyframe positions for movement
    const times = [0, 2, 4]; // Time points in seconds (0s, 3h, 6h)
    const values = [
        -99, 1, 20,  // Start position (left-bottom)
        0, 1, -30,     // Peak position (middle-top, 3 hours in)
        99, 1, 20    // End position (right-bottom, 6 hours in)
    ];

    // Create a VectorKeyframeTrack for the disc's position
    const positionTrack = new THREE.VectorKeyframeTrack('.position', times, values, THREE.InterpolateSmooth);

    // Create an AnimationClip to hold the track
    const clip = new THREE.AnimationClip('moveInArc', 4, [positionTrack]); // 6 hours = 21600 seconds

    // Set up the AnimationMixer and bind it to the disc
    mixer = new THREE.AnimationMixer(disc);
    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopRepeat, 100); // Animation plays once over 6 hours
    action.play(); // Start the animation

}

const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
        // Update the animation mixer on every frame
        const delta = clock.getDelta();
        mixer.update(delta);
    render()
}

function render() {
    renderer.render(scene, camera);

    // console.log('x' + camera.position.x)
    // console.log('y' + camera.position.y)
    // console.log('z' + camera.position.z)
}


init().then(() => {
    animate();
})