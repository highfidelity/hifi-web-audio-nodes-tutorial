import * as THREE from 'three'
export default function createSphere(the_scene, color, init_position) {
    const geometry = new THREE.SphereGeometry( 1.4, 32, 32 );
    const material = new THREE.MeshBasicMaterial( {color: color} );
    const sphere = new THREE.Mesh( geometry, material );
    sphere.position.x = init_position.x;
    sphere.position.y = init_position.y;
    sphere.position.z = init_position.z;
    the_scene.add( sphere );
    return sphere;
}