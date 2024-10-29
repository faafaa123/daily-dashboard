"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = __importStar(require("three"));
// @ts-ignore
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const sun_1 = require("./classes/sun");
const moment_1 = __importDefault(require("moment"));
const moon_1 = require("./classes/moon");
const { app, BrowserWindow } = require('electron');
function createWindow() {
    // Erstelle ein neues Browserfenster im Vollbildmodus
    const win = new BrowserWindow({
        fullscreen: true, // Startet im Vollbild
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    // Lädt die HTML-Datei mit der Three.js-Szene
    win.loadFile('index.html');
    // Optional: DevTools automatisch öffnen
    // win.webContents.openDevTools();
}
app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});
let camera;
let controls;
let scene;
let renderer;
let theSun;
let theMoon;
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        scene = new THREE.Scene();
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        const aspect = window.innerWidth / window.innerHeight;
        const frustumSize = 100;
        camera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 0.1, 1000);
        camera.position.set(0, 100, 0);
        camera.lookAt(0, 0, 0);
        // Adding a flat plane
        let planeSize = 178;
        const geometry = new THREE.PlaneGeometry(planeSize, planeSize);
        const material = new THREE.MeshBasicMaterial({ color: 0x103D67, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = Math.PI / 2; // Rotate the plane to lie flat
        scene.add(plane);
        // show axis
        const axesHelper = new THREE.AxesHelper(5000);
        axesHelper.setColors('#fc0303', '#036ffc', '#03fc17');
        // scene.add(axesHelper);
        // setup orbitControls
        // controls = new OrbitControls(camera, renderer.domElement);
        // controls.enableDamping = true;
        // controls.dampingFactor = 0.25;
        // controls.screenSpacePanning = false;
        // controls.maxPolarAngle = Math.PI / 2;
        // controls.target = new THREE.Vector3(0,0,0)
        theSun = new sun_1.sun(scene);
        yield theSun.main();
        theMoon = new moon_1.moon(scene);
        yield theMoon.main();
        // CSS Overlay
        setInterval(updateClock, 1000);
        updateClock();
    });
}
function updateClock() {
    const uhrzeit = document.getElementById('uhrzeit');
    const datum = document.getElementById('datum');
    uhrzeit.textContent = (0, moment_1.default)().format('LT').toString();
    datum.textContent = (0, moment_1.default)().format('ll').toString();
    const sunset = document.getElementById('sunset');
    sunset.textContent = `Sonnenuntergang in ${theSun.daylightDuration.hours() - theSun.elapsedDaylight.hours()} Stunden`;
}
const clock = new THREE.Clock();
function animate(time) {
    requestAnimationFrame(animate);
    theSun.animateSun(time);
    render();
}
function render() {
    renderer.render(scene, camera);
}
init().then(() => {
    animate(clock.getDelta());
});
