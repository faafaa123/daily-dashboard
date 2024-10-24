import axios, { AxiosError, AxiosResponse } from 'axios';
import moment from 'moment';
import * as THREE from 'three';

export class moon {

    constructor() {

    }

    main() {
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

}