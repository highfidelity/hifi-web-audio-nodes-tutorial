import * as THREE from 'three'
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

function generateTexture() {

  const canvas = document.createElement( 'canvas' );
  canvas.width = 2;
  canvas.height = 2;

  const context = canvas.getContext( '2d' );
  context.fillStyle = 'white';
  context.fillRect( 0, 1, 2, 1 );

  return canvas;

}

export default function createLight( color ) {

  const intensity = 4;

  const light = new THREE.PointLight( color, intensity, 17.5 );
  light.castShadow = true;
  light.shadow.bias = - 0.01; // reduces self-shadowing on double-sided objects

  let geometry = new THREE.SphereGeometry( 0.3, 12, 6 );
  let material = new THREE.MeshBasicMaterial( { color: color } );
  material.color.multiplyScalar( intensity );
  let sphere = new THREE.Mesh( geometry, material );
  sphere.position.z = - 10;
  // light.add( sphere );

  const texture = new THREE.CanvasTexture( generateTexture() );
  texture.magFilter = THREE.NearestFilter;
  texture.wrapT = THREE.RepeatWrapping;
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.set( 1, 6.5 );

  geometry = new THREE.SphereGeometry( 1.5, 32, 8 );
  material = new THREE.MeshPhongMaterial( {
      side: THREE.DoubleSide,
      alphaMap: texture,
      alphaTest: 0.5
  } );
  sphere = new THREE.Mesh( geometry, material );
        sphere.castShadow = true;
        // sphere.receiveShadow = true;
        //set the sphere randomly rotate
        sphere.rotation.x = Math.random() * 2 * Math.PI;
        sphere.rotation.y = Math.random() * 2 * Math.PI;
        sphere.rotation.z = Math.random() * 2 * Math.PI;

        light.add( sphere );

  return light;
}