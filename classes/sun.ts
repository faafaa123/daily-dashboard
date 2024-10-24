import axios, { AxiosError, AxiosResponse } from 'axios';
import moment from 'moment';
import * as THREE from 'three';

export class sun {
    scene: THREE.Scene;

    latitude = 51.407785;
    longitude = 9.121936;

    apiUrl = `https://api.sunrise-sunset.org/json?lat=${this.latitude}&lng=${this.longitude}&formatted=0`;

    dummy_response: any = { "results": { "date": "2024-10-23", "sunrise": "7:27:17 AM", "sunset": "6:19:50 PM", "first_light": "5:58:05 AM", "last_light": "7:49:02 PM", "dawn": "7:00:07 AM", "dusk": "6:47:01 PM", "solar_noon": "12:53:34 PM", "golden_hour": "5:43:03 PM", "day_length": "10:52:33", "timezone": "America/New_York", "utc_offset": -240 }, "status": "OK" }

    sunset: moment.Moment
    sunrise: moment.Moment
    currentTime = moment().subtract(10, 'hours');
    daylightDuration: moment.Duration
    elapsedDaylight: moment.Duration

    radius: number
    disc: THREE.Mesh;

    constructor(
        scene: THREE.Scene,
    ) {
        this.scene = scene;
    }

    async main() {
        await axios.get(
            this.apiUrl
        ).then(async (result: AxiosResponse) => {
            const responseData: any = result.data;
            this.sunrise = moment(responseData.results.sunrise);
            this.sunset = moment(responseData.results.sunset);

            this.daylightDuration = moment.duration(this.sunset.diff(this.sunrise));

            if (this.currentTime.isAfter(this.sunrise) && this.currentTime.isBefore(this.sunset)) {
                this.elapsedDaylight = moment.duration(this.currentTime.diff(this.sunrise));
            }

        }).catch(async (error: AxiosError) => {
            console.log(error.response);
        })

        // Adding a circular disc
        this.radius = 10;
        const segments = 512;
        const circleGeometry = new THREE.CircleGeometry(this.radius, segments);
        const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xFFDF22, side: THREE.DoubleSide });
        this.disc = new THREE.Mesh(circleGeometry, circleMaterial);
        this.disc.rotation.x = Math.PI / 2;
        this.disc.position.y = 1
        this.disc.position.x = -99
        this.disc.position.z = 20
        this.scene.add(this.disc);

        this.addSunRays(this.disc, 24, 7); // 24 rays with a length of 10 units
    }

    addSunRays(disc, numRays, length) {
        const rayMaterial = new THREE.LineBasicMaterial({ color: 0xFFDF22 });

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

}
