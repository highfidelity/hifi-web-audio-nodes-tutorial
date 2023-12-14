import * as THREE from 'three'
import createTextGeometry from './textgeo.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
export default function setupscene (canvas){

  const scene = new THREE.Scene()
  const canva = canvas
  scene.background = new THREE.Color(0x000000)
  const sizes = {
    width: window.innerWidth*0.85,
    height: window.innerHeight,
}
  const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 10
scene.add(camera)
/**
 * Sizes
 */
const mouse = new THREE.Vector2()
window.addEventListener('mousemove',(event)=>
{
    mouse.x = event.clientX/sizes.width*2 - 1
    mouse.y = -(event.clientY/sizes.height*2 -1)
})
window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth*0.75
    sizes.height = window.innerHeight*0.9
    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * mouse
 */

// Controls
const controls = new OrbitControls(camera, canva)
controls.enableDamping = true
  
  createTextGeometry('X',scene,[14,-10,-15])
  createTextGeometry('Z',scene,[-15,9,-15])
  createTextGeometry('Y',scene,[-15,-10,14])
  const axis1 = new THREE.CylinderGeometry( 0.1, 0.1, 19, 15 ); 
  const axis2 = new THREE.CylinderGeometry( 0.1, 0.1, 29, 15 );
  const axis3 = new THREE.CylinderGeometry( 0.1, 0.1, 19, 15 );
  const axismaterial = new THREE.MeshBasicMaterial( {color: 0xffffff} ); 
  const cylinder1 = new THREE.Mesh( axis1, axismaterial ); 
  const cylinder2 = new THREE.Mesh( axis2, axismaterial );
  const cylinder3 = new THREE.Mesh( axis2, axismaterial );
  cylinder1.position.set(-15,-0.8,-15)
  cylinder2.rotation.set(0,0,Math.PI/2)
  cylinder2.position.set(-0.5,-10,-15)
  cylinder3.rotation.set(Math.PI/2,0,0)
  cylinder3.position.set(-15,-10,-0.5)
  scene.add( cylinder1,cylinder2,cylinder3 );


  const geometry = new THREE.BoxGeometry( 30, 20, 30 );
  const material = new THREE.MeshPhongMaterial( {
      color: 0xa0adaf,
      shininess: 10,
      specular: 0x111111,
      side: THREE.BackSide
  } );
  const pointer = new THREE.Mesh( 
    new THREE.ConeGeometry( 1, 2, 8 ), 
    new THREE.MeshStandardMaterial( {color: 0xffffff} )
  );
  pointer.position.set(0,-10,17)
  pointer.rotation.set(-Math.PI/2,0,0)
  const mesh = new THREE.Mesh( geometry, material );
  mesh.receiveShadow = true;
  scene.add( mesh,pointer );
  scene.add( new THREE.AmbientLight( 0x111122, 4 ) );
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;
  return {scene, sizes,camera, controls,mouse, renderer}
}