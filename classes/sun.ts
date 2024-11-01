import axios, { AxiosError, AxiosResponse } from 'axios';
import moment from 'moment';
import * as THREE from 'three';

export class sun {
    scene: THREE.Scene;

    latitude = 51.407785;
    longitude = 9.121936;

    apiUrl = `https://api.sunrise-sunset.org/json?lat=${this.latitude}&lng=${this.longitude}&date=${moment().format('YYYY-MM-DD').toString()}&formatted=0`;

    dummy_response: any = { "results": { "date": "2024-10-23", "sunrise": "7:27:17 AM", "sunset": "6:19:50 PM", "first_light": "5:58:05 AM", "last_light": "7:49:02 PM", "dawn": "7:00:07 AM", "dusk": "6:47:01 PM", "solar_noon": "12:53:34 PM", "golden_hour": "5:43:03 PM", "day_length": "10:52:33", "timezone": "America/New_York", "utc_offset": -240 }, "status": "OK" }

    sunset!: moment.Moment
    sunrise!: moment.Moment
    currentTime = moment()
    daylightDuration!: moment.Duration
    elapsedDaylight!: moment.Duration

    radius!: number
    disc!: THREE.Mesh;

    // Animation parameters
    duration: any
    startAtProgress: any
    startTime: any

    isDay!: boolean;
    moonMesh!: THREE.Mesh;
    moonlightDuration!: any;
    elapsedMoonlight!: moment.Duration


    constructor(
        scene: THREE.Scene,
    ) {
        this.scene = scene;
        console.log('api current day')
        console.log(this.apiUrl)
    }

    async main() {
        await axios.get(
            this.apiUrl
        ).then(async (result: AxiosResponse) => {
            const responseData: any = result.data;
            this.sunrise = moment(responseData.results.sunrise);
            this.sunset = moment(responseData.results.sunset);

            this.daylightDuration = moment.duration(this.sunset.diff(this.sunrise));

            if (this.currentTime.isAfter(this.sunrise) && this.currentTime.isBefore(this.sunset)) {// is day
                this.isDay = true;
                this.elapsedDaylight = moment.duration(this.currentTime.diff(this.sunrise));

                // Adding a circular disc
                this.radius = 10;
                const segments = 512;
                const circleGeometry = new THREE.CircleGeometry(this.radius, segments);
                const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xC58F05, side: THREE.DoubleSide });
                this.disc = new THREE.Mesh(circleGeometry, circleMaterial);
                this.disc.rotation.x = Math.PI / 2;
                this.disc.position.y = 1
                this.disc.position.x = -99
                this.disc.position.z = 20
                this.scene.add(this.disc);

                // 24 rays with a length of 10 units
                // this.addSunRays(this.disc, 24, 7);

                // Animation parameters
                this.duration = this.daylightDuration.asSeconds(); // in seconds
                this.startAtProgress = 1 - 2.73 * Math.pow(10, -8) * (this.daylightDuration.asMilliseconds() - this.elapsedDaylight.asMilliseconds())
                this.startTime = null;
            }
            else {  // is night
                this.isDay = false;
                const moonRadius = 10;
                const moonSegments = 512;
                const moonGeometry = new THREE.CircleGeometry(moonRadius, moonSegments);

                const moonTexture = new THREE.TextureLoader().load('./assets/moon.png');
                const moonMaterial = new THREE.MeshBasicMaterial({
                    map: moonTexture,
                    side: THREE.DoubleSide
                });

                this.moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
                this.moonMesh.position.y = 1;
                this.scene.add(this.moonMesh);

                this.moonMesh.rotation.x = Math.PI / 2;

                // this.daylightDuration = moment.duration(this.sunset.diff(this.sunrise));
                this.apiUrl = `https://api.sunrise-sunset.org/json?lat=${this.latitude}&lng=${this.longitude}&date=${moment().add(1, 'day').format('YYYY-MM-DD').toString()}&formatted=0`;
                await axios.get(
                    this.apiUrl
                ).then(async (result: AxiosResponse) => {
                    const responseData: any = result.data;
                    console.log('response next day')
                    console.log(responseData)
                // Animation parameters
                console.log(this.sunset)
                console.log(responseData.results.sunrise)
                this.moonlightDuration = moment.duration(moment(responseData.results.sunrise).diff(this.sunset))
                console.log('moon duration')
                console.log(this.moonlightDuration)
                this.elapsedMoonlight = moment.duration(moment().diff(moment(responseData.results.sunrise)));
                console.log('elapsedMoonLight')
                console.log(this.elapsedMoonlight)

                this.startAtProgress = 1.94 * Math.pow(10, -8) * (this.moonlightDuration.asMilliseconds() - this.elapsedMoonlight.asMilliseconds())
                console.log('this.startAtProgress')
                this.startAtProgress = 0.7
                console.log(this.startAtProgress)
                this.startTime = null;
                }).catch(async (error: any) => {
                    console.log(error);
                })
            }

        }).catch(async (error: AxiosError) => {
            console.log(error.response);
        })
    }

    addSunRays(disc: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material | THREE.Material[], THREE.Object3DEventMap>, numRays: number, length: number) {
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
                new THREE.Vector3(xEnd, 1, zEnd)      // End point of the ray
            ]);

            // Create and add the ray to the scene
            const ray = new THREE.Line(rayGeometry, rayMaterial);
            ray.rotation.x = Math.PI / 2;
            ray.position.z = -1;
            disc.add(ray);
        }
    }

    animateSun(time: number) {
        // Set start time on first frame
        if (!this.startTime) this.startTime = time;

        // Calculate elapsed time in seconds
        const elapsedTime = (time - this.startTime) / 1000; // Convert to seconds

        // Normalize elapsed time for the animation, starting at 30%
        const t = Math.min((elapsedTime / this.duration) + this.startAtProgress, 1); // Normalize to [0.3, 1]

        // Define control points for the Bezier curve
        const p0 = { x: -99, z: 20 }; // Start position
        const p1 = { x: 0, z: -70 };    // Peak position (control point)
        const p2 = { x: 99, z: 20 };   // End position

        // Calculate the current position on the curve
        const position = this.getBezierPoint(t, p0, p1, p2);
        this.disc.position.set(position.x, 1, position.z);

        // Stop animation if completed
        if (t >= 1) {
            console.log('Animation finished');
        }
    }

    animateMoon(time: number) {
        // Set start time on first frame
        if (!this.startTime) this.startTime = time;

        // Calculate elapsed time in seconds
        const elapsedTime = (time - this.startTime) / 1000; // Convert to seconds

        // Normalize elapsed time for the animation, starting at 30%
        const t = Math.min((elapsedTime / 21000) + this.startAtProgress, 1); // Normalize to [0.3, 1]

        // Define control points for the Bezier curve
        const p0 = { x: -99, z: 20 }; // Start position
        const p1 = { x: 0, z: -70 };    // Peak position (control point)
        const p2 = { x: 99, z: 20 };   // End position

        // Calculate the current position on the curve
        const position = this.getBezierPoint(t, p0, p1, p2);
        this.moonMesh.position.set(position.x, 1, position.z);
        // console.log(this.moonMesh.position)
        // Stop animation if completed
        if (t >= 1) {
            console.log('Animation finished');
        }
    }

    getBezierPoint(t: number, p0: { x: any; z: any; }, p1: { x: any; z: any; }, p2: { x: any; z: any; }) {
        const x = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
        const z = Math.pow(1 - t, 2) * p0.z + 2 * (1 - t) * t * p1.z + Math.pow(t, 2) * p2.z;
        return { x, z };
    }

}
