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
exports.sun = void 0;
const axios_1 = __importDefault(require("axios"));
const moment_1 = __importDefault(require("moment"));
const THREE = __importStar(require("three"));
class sun {
    constructor(scene) {
        this.latitude = 51.407785;
        this.longitude = 9.121936;
        this.apiUrl = `https://api.sunrise-sunset.org/json?lat=${this.latitude}&lng=${this.longitude}&formatted=0`;
        this.dummy_response = { "results": { "date": "2024-10-23", "sunrise": "7:27:17 AM", "sunset": "6:19:50 PM", "first_light": "5:58:05 AM", "last_light": "7:49:02 PM", "dawn": "7:00:07 AM", "dusk": "6:47:01 PM", "solar_noon": "12:53:34 PM", "golden_hour": "5:43:03 PM", "day_length": "10:52:33", "timezone": "America/New_York", "utc_offset": -240 }, "status": "OK" };
        this.currentTime = (0, moment_1.default)();
        this.scene = scene;
    }
    main() {
        return __awaiter(this, void 0, void 0, function* () {
            yield axios_1.default.get(this.apiUrl).then((result) => __awaiter(this, void 0, void 0, function* () {
                const responseData = result.data;
                this.sunrise = (0, moment_1.default)(responseData.results.sunrise);
                this.sunset = (0, moment_1.default)(responseData.results.sunset);
                this.daylightDuration = moment_1.default.duration(this.sunset.diff(this.sunrise));
                if (this.currentTime.isAfter(this.sunrise) && this.currentTime.isBefore(this.sunset)) {
                    this.elapsedDaylight = moment_1.default.duration(this.currentTime.diff(this.sunrise));
                }
                // Adding a circular disc
                this.radius = 10;
                const segments = 512;
                const circleGeometry = new THREE.CircleGeometry(this.radius, segments);
                const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xC58F05, side: THREE.DoubleSide });
                this.disc = new THREE.Mesh(circleGeometry, circleMaterial);
                this.disc.rotation.x = Math.PI / 2;
                this.disc.position.y = 1;
                this.disc.position.x = -99;
                this.disc.position.z = 20;
                this.scene.add(this.disc);
                // 24 rays with a length of 10 units
                // this.addSunRays(this.disc, 24, 7);
                // Animation parameters
                this.duration = this.daylightDuration.asSeconds(); // in seconds
                this.startAtProgress = 1 - 2.73 * Math.pow(10, -8) * (this.daylightDuration.asMilliseconds() - this.elapsedDaylight.asMilliseconds());
                this.startTime = null;
            })).catch((error) => __awaiter(this, void 0, void 0, function* () {
                console.log(error.response);
            }));
        });
    }
    addSunRays(disc, numRays, length) {
        const rayMaterial = new THREE.LineBasicMaterial({ color: 0xC58F05 });
        for (let i = 0; i < numRays; i++) {
            const angle = (i / numRays) * Math.PI * 2; // Evenly spaced angles around the circle
            // Start of the ray (at the edge of the disc)
            const xStart = this.radius * Math.cos(angle);
            const zStart = this.radius * Math.sin(angle);
            // End of the ray (extending outward from the disc)
            const xEnd = (this.radius + length) * Math.cos(angle);
            const zEnd = (this.radius + length) * Math.sin(angle);
            // Create geometry for the ray
            const rayGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(xStart, 1, zStart), // Start point of the ray
                new THREE.Vector3(xEnd, 1, zEnd) // End point of the ray
            ]);
            // Create and add the ray to the scene
            const ray = new THREE.Line(rayGeometry, rayMaterial);
            ray.rotation.x = Math.PI / 2;
            ray.position.z = -1;
            disc.add(ray);
        }
    }
    animateSun(time) {
        // Set start time on first frame
        if (!this.startTime)
            this.startTime = time;
        // Calculate elapsed time in seconds
        const elapsedTime = (time - this.startTime) / 1000; // Convert to seconds
        // Normalize elapsed time for the animation, starting at 30%
        const t = Math.min((elapsedTime / this.duration) + this.startAtProgress, 1); // Normalize to [0.3, 1]
        // Define control points for the Bezier curve
        const p0 = { x: -99, z: 20 }; // Start position
        const p1 = { x: 0, z: -70 }; // Peak position (control point)
        const p2 = { x: 99, z: 20 }; // End position
        // Calculate the current position on the curve
        const position = this.getBezierPoint(t, p0, p1, p2);
        this.disc.position.set(position.x, 1, position.z);
        // Stop animation if completed
        if (t >= 1) {
            console.log('Animation finished');
        }
    }
    getBezierPoint(t, p0, p1, p2) {
        const x = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
        const z = Math.pow(1 - t, 2) * p0.z + 2 * (1 - t) * t * p1.z + Math.pow(t, 2) * p2.z;
        return { x, z };
    }
}
exports.sun = sun;
