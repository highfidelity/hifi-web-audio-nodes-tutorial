import * as THREE from 'three'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import { FontLoader } from 'three/addons/loaders/FontLoader.js';
// import helvetiker from 'three/examples/fonts/helvetiker_regular.typeface.json';
export default function setupscene (){
  const fontLoader = new FontLoader()

  fontLoader.load(
      '/fonts/helvetiker_regular.typeface.json',
      (font) =>
      {
          console.log('loaded')
      }
  )

  
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)
  const sizes = {
      width: window.innerWidth*0.7,
      height: window.innerHeight*0.9
  }
  const geometry = new THREE.BoxGeometry( 30, 20, 30 );
  const material = new THREE.MeshPhongMaterial( {
      color: 0xa0adaf,
      shininess: 10,
      specular: 0x111111,
      side: THREE.BackSide
  } );
  const pointer = new THREE.Mesh( 
    new THREE.ConeGeometry( 1, 2, 8 ), 
    new THREE.MeshStandardMaterial( {color: 0xffff00} )
  );
  pointer.position.set(0,-10,17)
  pointer.rotation.set(-Math.PI/2,0,0)
  const mesh = new THREE.Mesh( geometry, material );
  mesh.receiveShadow = true;
  scene.add( mesh,pointer );

  return {scene, sizes}
}