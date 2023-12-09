import * as THREE from 'three'

import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
// export default function createboundingbox(the_scene) {
//   const surfacefront = new THREE.Mesh(
//       new THREE.PlaneGeometry(20, 15),
//       new THREE.MeshPhongMaterial({color: '#FFFBE4'}),
//   )
//   surfacefront.position.z = -5
//   const surfaceleft = new THREE.Mesh(
//       new THREE.PlaneGeometry(15, 15),
//       new THREE.MeshPhongMaterial({ color: '#F3EFD9' })
//   )
//   surfaceleft.position.x = -10
//   surfaceleft.position.z = 2.5
//   surfaceleft.rotation.y = Math.PI / 2
//   const surfaceright = new THREE.Mesh(
//       new THREE.PlaneGeometry(15, 15),
//       new THREE.MeshPhongMaterial({ color: '#F3EFD9' })
//   )
//   surfaceright.position.x = 10
//   surfaceright.position.z = 2.5
//   surfaceright.rotation.y = -Math.PI / 2
//   const surfacetop = new THREE.Mesh(
//       new THREE.PlaneGeometry(20, 15),
//       new THREE.MeshBasicMaterial({ color: '#FFDAB9' })
//   )
//   surfacetop.position.y = 7.5
//   surfacetop.position.z = 2.5
//   surfacetop.rotation.x = Math.PI / 2
//   const surfacebottom = new THREE.Mesh(
//       new THREE.PlaneGeometry(20, 15),
//       new THREE.MeshBasicMaterial({ color: '#FFDAB9' })
//   )
//   surfacebottom.position.y = -7.5
//   surfacebottom.position.z = 2.5
//   surfacebottom.rotation.x = -Math.PI / 2

//   RectAreaLightUniformsLib.init();

//   const light = new THREE.AmbientLight( 0xA700D0, 0.2 ); // soft white light
//   const rectLight1 = new THREE.RectAreaLight( 0xff0000, 5, 4, 10 );
// 				rectLight1.position.set( - 8, 0, -5 );
//         // rectLight1.rotation.y = Math.PI;
//         rectLight1.lookAt( 0, 0, 0 );
//   const rectLight2 = new THREE.RectAreaLight( 0x00ff00, 5, 4, 10 );
// 				rectLight2.position.set( 0, 5, -5 );
//         rectLight2.lookAt( 0, 0, 0 );
// 	const rectLight3 = new THREE.RectAreaLight( 0x0000ff, 5, 4, 10 );
// 				rectLight3.position.set( 8, 0, -5 );
//         rectLight3.lookAt( 0, 0, 0 );
//   const rectLight4 = new THREE.RectAreaLight( 0xffffff, 2, 4, 10 );
// 				rectLight4.position.set( 0, 0, 5 );
//         rectLight4.lookAt( 0, 0, 0 );
// 	// the_scene.add( rectLight1,rectLight2,rectLight3,rectLight4 );
//   // the_scene.add( new RectAreaLightHelper( rectLight1 ) );
// 	// the_scene.add( new RectAreaLightHelper( rectLight2 ) );
// 	// the_scene.add( new RectAreaLightHelper( rectLight3 ) );
//   // the_scene.add( light ); 
//   // the_scene.add(surfacefront,surfaceleft,surfaceright,surfacetop,surfacebottom)
// }
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

  const intensity = 5;

  const light = new THREE.PointLight( color, intensity, 20 );
  light.castShadow = true;
  light.shadow.bias = - 0.005; // reduces self-shadowing on double-sided objects

  let geometry = new THREE.SphereGeometry( 0.3, 12, 6 );
  let material = new THREE.MeshBasicMaterial( { color: color } );
  material.color.multiplyScalar( intensity );
  let sphere = new THREE.Mesh( geometry, material );
  sphere.position.z = - 10;
  light.add( sphere );

  const texture = new THREE.CanvasTexture( generateTexture() );
  texture.magFilter = THREE.NearestFilter;
  texture.wrapT = THREE.RepeatWrapping;
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.set( 1, 4.5 );

  geometry = new THREE.SphereGeometry( 2, 32, 8 );
  material = new THREE.MeshPhongMaterial( {
      side: THREE.DoubleSide,
      alphaMap: texture,
      alphaTest: 0.5
  } );
  sphere = new THREE.Mesh( geometry, material );
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        light.add( sphere );

        return light;
}