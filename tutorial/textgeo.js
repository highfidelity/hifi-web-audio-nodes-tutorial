import * as THREE from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

export default function createTextGeometry(contents,scene,position){
  const fontLoader = new FontLoader()
  const font = fontLoader.load(
      './static/font/helvetiker_regular.typeface.json',
      (font) =>
      {
        const textGeometry = new TextGeometry(
          contents,
          {
              font: font,
              size: 1,
              height: 0.2,
              curveSegments: 12,
              bevelEnabled: true,
              bevelThickness: 0.03,
              bevelSize: 0.02,
              bevelOffset: 0,
              bevelSegments: 5
          }
      )
      const textMaterial = new THREE.MeshBasicMaterial()
      const text = new THREE.Mesh(textGeometry, textMaterial)
      text.position.set(position[0],position[1],position[2])
      scene.add(text)
      }
  )
}
