import axios, { AxiosError, AxiosResponse } from 'axios';
import moment from 'moment';
import * as THREE from 'three';

export class moon {
    scene: THREE.Scene;

    latitude = 51.407785;
    longitude = 9.121936;

    apiKey = 'f20a85592ff24d84ae3fc7e32897d932'
    apiUrl = `https://api.ipgeolocation.io/astronomy?apiKey=${this.apiKey}&lat=${this.latitude}&long=${this.longitude}`;

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
            const moonrise = moment(responseData.moonrise, "HH:mm:ss");
            const moonset = moment(responseData.moonset, "HH:mm:ss");

            console.log(moonrise)
            console.log(moonset)


        }).catch(async (error: AxiosError) => {
            console.log(error.response);
        })

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
        this.scene.add(moonMesh);

        moonMesh.rotation.x = Math.PI / 2;
    }

}