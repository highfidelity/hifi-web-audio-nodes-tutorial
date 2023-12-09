import * as HiFiAudioNodes from './vendor/hifi-audio-nodes.mjs';
import './vendor/AgoraRTC_N-production.js';  // AgoraRTC

//3d
// import './style.css'
import * as THREE from 'three'

// import typefaceFont from 'three/examples/fonts/helvetiker_regular.typeface.json';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
// import * as dat from 'lil-gui'
import createLight from './scene.js';
import setupscene from './basicscene.js';

let position = { x: 0, y: 0, o: 0 };
let position0 = { x: -4.5, y: 0.95, z: 0.5 };
let position1 = { x: 0, y: -2.25, z: -1 };
let position2 = { x: 0.5, y: -0.75, z: 0 };
// let scene, sizes;

// Canvas
const canvas = document.querySelector('canvas.webgl')
const {scene, sizes} = setupscene()



const object1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#00ff00' })
)
object1.position.x = position0.x
object1.position.y = position0.y
object1.position.z = position0.z

const object2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#00ff00' })
)
object2.position.x = position1.x
object2.position.y = position1.y
object2.position.z = position1.z
const object3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#000050' })
)
object3.position.x = position2.x
object3.position.y = position2.y
object3.position.z = position2.z


scene.add(object1, object2, object3)
scene.add( new THREE.AmbientLight( 0x111122, 5 ) );




let pointLight, pointLight2;
pointLight = createLight( 0xCD6AE5 );
scene.add( pointLight );

pointLight.rotation.x = 1.16;
pointLight2 = createLight( 0xff8888 );
scene.add( pointLight2 );


/**
 * raycaster
 */
const raycaster = new THREE.Raycaster()
// const rayorigin = new THREE.Vector3(-3,0,0)
// const raydirection = new THREE.Vector3(10,0,0)
// raydirection.normalize()

// raycaster.set(rayorigin,raydirection)

// const intersect = raycaster.intersectObjects([object1,object2,object3])
//console.log(intersect)


/**
 * Sizes
 */


window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

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

const mouse = new THREE.Vector2()

window.addEventListener('mousemove',(event)=>
{
    mouse.x = event.clientX/sizes.width*2 - 1
    mouse.y = -(event.clientY/sizes.height*2 -1)
    //console.log(mouse.x)
})


var startplay0 = false;
var stopplay0 = false;
var count0 = 0;

var startplay1= false;
var stopplay1 = false;
var count1 = 0;

var startplay2= false;
var stopplay2 = false;
var count2 = 0;

let localSpatialFileBuffer0;
let localSpatialFileBuffer1;
let localSpatialFileBuffer2;

let localSpatialSoundBuffer0;
let localSpatialSoundBuffer1;
let localSpatialSoundBuffer2;
//当检测到click时,首先判定 currentintersect的长度是否为0/或其他,然后判定是哪个object
window.addEventListener('click',() =>{
    //version1 to do
    if(currentintersect)
    {
        if(currentintersect.object === object1)
        {
            console.log('click1')
            count0 += 1;
            if (count0 % 2 == 1) {
                startplay0 = true;
            }
            else {
                stopplay0 = true;
            }
        }
        if(currentintersect.object === object2)
        {
            console.log('click0')
            count1 += 1;
            if (count1 % 2 == 1) {
                startplay1 = true;
            }
            else {
                stopplay1 = true;
            }
        }
        if(currentintersect.object === object3)
        {
            console.log('click3')
            count2 += 1;
            if (count2 % 2 == 1) {
                startplay2 = true;
            }
            else {
                stopplay2 = true;
            }
        }
    }
})



/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 10
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;
/**
 * Animate
 */
const clock = new THREE.Clock()

let currentintersect = null
let voiceEventIndex = [[startplay0,'start',localSpatialSoundBuffer0, localSpatialFileBuffer0]]

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    //animate objects
    object1.position.x = position0.x
    object1.position.z = -position0.y
    object1.position.y = position0.z

    object2.position.x = position1.x
    object2.position.z = -position1.y
    object2.position.y = position1.z

    object3.position.x = position2.x
    object3.position.z = -position2.y
    object3.position.y = position2.z
    // object1.position.y = Math.sin(elapsedTime*0.5) * 1.5
    // object2.position.y = Math.sin(elapsedTime*0.8) * 1.5
    // object3.position.y = Math.sin(elapsedTime*0.3) * 1.5

    //cast a ray
    raycaster.setFromCamera(mouse,camera)

    const objectstotest = [object1,object2,object3]
    const intersects = raycaster.intersectObjects(objectstotest)

    // for(const object of objectstotest)
    // {
    //     object.material.color.set('#ff0000')
    // }
    object1.material.color.set('#ff0000')
    object2.material.color.set('#F0E7D8')
    object3.material.color.set('#3F238F')

    for(const intersect of intersects){
        intersect.object.material.color.set('#0000ff')
        //console.log(intersect.object)
    }
    
    if(intersects.length)
    {   
        //且如果currentintersect里本来没有东西(就是刚刚还没有)
        if(currentintersect ==null)
        {
            console.log('mouse enter')
        }
        //把intersect队列的第一个设置为currentintersect(现在currentintersect里有东西了)
        currentintersect = intersects[0]
        
    }
    //如果intersect这个队列为0
    else
    {
        //且currentintersct不为0(就是刚刚还有东西来着)
        if(currentintersect)
        {
            console.log('mouse leave')
        }
        //(现在没了)
        currentintersect = null 
    }

    // Update controls
    controls.update()
    // Render
    renderer.render(scene, camera)
    
    if (startplay0) {
        playanyway(localSpatialSoundBuffer0, localSpatialFileBuffer0, 0)
        startplay0= false;
    }

    if (stopplay0) {
        stopanyway(localSpatialSoundBuffer0, localSpatialFileBuffer0,0)
        stopplay0 = false;
    }

    if (startplay1) {
        playanyway(localSpatialSoundBuffer1, localSpatialFileBuffer1, 1)
        startplay1 = false;
    }

    if (stopplay1) {
        stopanyway(localSpatialSoundBuffer1, localSpatialFileBuffer1, 1)
        stopplay1 = false;
    }

    if (startplay2) {
        playanyway(localSpatialSoundBuffer2, localSpatialFileBuffer2, 2)
        startplay2 = false;
    }

    if (stopplay2) {
        stopanyway(localSpatialSoundBuffer2, localSpatialFileBuffer2, 2)
        stopplay2 = false;
    }

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
// const scene = new THREE.Scene()
// console.log(scene)
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// const renderer = new THREE.WebGLRenderer();
// renderer.setSize( window.innerWidth, window.innerHeight );
// document.body.appendChild( renderer.domElement );


// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

// camera.position.z = 5;

// function animate() {
// 	requestAnimationFrame( animate );
//     cube.rotation.x += 0.01;
//     cube.rotation.y += 0.01;
// 	renderer.render( scene, camera );
// }
// animate();
//3d

let audioContext;
const hrtfInputs = new Map();
let localHrtfInput;
let hrtfOutput;
let limiter;
let audioElement;
let audioNode;
const isMetadataSupported = HiFiAudioNodes.isInlineMetadataSupported();



async function ensureAudioContext() {
    if (audioContext) {
        return;
    }
    console.log('start audio context');
    audioContext = new AudioContext({ sampleRate: 48000 });
    // For local spatial sounds on Safari < 16.4 / WebKit < 18616.
    audioNode = audioContext.createMediaStreamDestination();
    audioElement = new Audio();
    audioElement.srcObject = audioNode.stream;
    audioElement.play();

    //await HiFiAudioNodes.setupHRTF(audioContext, null);
    await HiFiAudioNodes.setupHRTF(audioContext, isMetadataSupported ? remoteUserPositionCallback : null);
    hrtfOutput = new HiFiAudioNodes.HRTFOutput(audioContext);
    if (isMetadataSupported) {
        HiFiAudioNodes.enableInlineMetadata(true);
        hrtfOutput.setPosition(position1);
    }
    limiter = new HiFiAudioNodes.Limiter(audioContext);
    hrtfOutput.connect(limiter).connect(audioContext.destination);

    localHrtfInput = new HiFiAudioNodes.HRTFInput(audioContext);
    localHrtfInput.connect(hrtfOutput);
    localSpatialSoundBuffer0 = await audioContext.decodeAudioData(localSpatialFileBuffer0);
    localSpatialSoundBuffer1 = await audioContext.decodeAudioData(localSpatialFileBuffer1);
    localSpatialSoundBuffer2 = await audioContext.decodeAudioData(localSpatialFileBuffer2);
    console.log('localSpatialSoundBuffer0',localSpatialSoundBuffer0 )
    
}

function deleteAudioContext() {
    if (!audioContext) {
        return;
    }

    console.log('delete audio context');

    localHrtfInput.disconnect(hrtfOutput);
    localHrtfInput = null;

    hrtfOutput.disconnect(limiter);
    limiter.disconnect(audioContext.destination);
    hrtfOutput = null;
    limiter = null;

    HiFiAudioNodes.shutdownHRTF();

    audioElement.pause();
    audioElement.srcObject = null;
    audioElement = null;
    audioNode = null;

    audioContext.close();
    audioContext = null;
}


const xInput0 = document.getElementById('x1');
const yInput0 = document.getElementById('y1');
const zInput0 = document.getElementById('z1');
const xInput1 = document.getElementById('x2');
const yInput1 = document.getElementById('y2');
const zInput1 = document.getElementById('z2');
const xInput2 = document.getElementById('x3');
const yInput2 = document.getElementById('y3');
const zInput2 = document.getElementById('z3');



xInput0.addEventListener('change', () => {
    onLocalPositionChange();
});
yInput0.addEventListener('change', () => {
    onLocalPositionChange();
});
zInput0.addEventListener('change', () => {
    onLocalPositionChange();
})
xInput1.addEventListener('change', () => {
    onLocalPositionChange();
});
yInput1.addEventListener('change', () => {
    onLocalPositionChange();
});
zInput1.addEventListener('change', () => {
    onLocalPositionChange();
})
xInput2.addEventListener('change', () => {
    onLocalPositionChange();
});
yInput2.addEventListener('change', () => {
    onLocalPositionChange();
});
zInput2.addEventListener('change', () => {
    onLocalPositionChange();
})
// oInput1.addEventListener('change', () => {
//     onLocalPositionChange();
// });


function onLocalPositionChange() {
    position0 = {
        x: parseFloat(xInput0.value),
        y: parseFloat(yInput0.value),
        z: parseFloat(zInput0.value)
    };
    position1 = {
        x: parseFloat(xInput1.value),
        y: parseFloat(yInput1.value),
        z: parseFloat(zInput1.value)
    };
    position2 = {
        x: parseFloat(xInput2.value),
        y: parseFloat(yInput2.value),
        z: parseFloat(zInput2.value)
    };
    console.log('Local position1:', position1, 'Local position2:', position2, 'Local position0:', position0);
    // updatehrtfoutputposition1(position1)
    // updatehrtfoutputposition2(position2)
    // updatehrtfoutputposition0(position0)
    }




function updatehrtfoutputposition1(pos) {
    if (hrtfOutput) {
        if (isMetadataSupported) {
            hrtfOutput.setPosition(pos);
        }
    }
}

function updateRelativePosition(hrtfInput) {
    const dx = hrtfInput.x - position.x;
    const dy = hrtfInput.y - position.y;

    const distanceSquared = dx * dx + dy * dy;
    const distance = Math.sqrt(distanceSquared);
    const angle = (distanceSquared < 1e-30) ? 0.0 : Math.atan2(dx, dy);
    let azimuth = angle - position.o;
    azimuth = azimuth - 2 * Math.PI * Math.floor((azimuth + Math.PI) / (2 * Math.PI));

    hrtfInput.setPosition(azimuth, distance);
}

function remoteUserPositionCallback(userID, x, y, o) {
    const hrtfInput = hrtfInputs.get(userID);
    if (hrtfInput && (x !== hrtfInput.x || y !== hrtfInput.y || o !== hrtfInput.o)) {
        console.log('User', userID, 'position', x, y, o);
        hrtfInput.x = x;
        hrtfInput.y = y;
        hrtfInput.o = o;
        updateRelativePosition(hrtfInput);
    }
}

// const playSpatialButton = document.getElementById('play-spatial');
// const stopSpatialButton = document.getElementById('stop-spatial');
// change the click to spacebar to play the sound

// playSpatialButton.addEventListener('click', () => {
//     console.log('play local spatial');
//     playanyway0()
// });

// stopSpatialButton.addEventListener('click', () => {
//     console.log('stop local spatial');
//     stopanyway0()
// });

// async function playanyway0() {
//     console.log('play local spatial');
//     playSpatialButton.setAttribute('disabled', 'disabled');
//     stopSpatialButton.removeAttribute('disabled');
//     playspatial(true, localSpatialSoundBuffer0, localSpatialFileBuffer0);
// }
// async function stopanyway0() {
//     console.log('play local spatial');
//     playSpatialButton.removeAttribute('disabled');
//     stopSpatialButton.setAttribute('disabled', 'disabled');
//     playSpatial_0(false);
// }

// async function playanyway1() {
//     console.log('play local spatial');
//     playSpatialButton.setAttribute('disabled', 'disabled');
//     stopSpatialButton.removeAttribute('disabled');
//     playSpatial_1(true);
// }
// async function stopanyway1() {
//     console.log('play local spatial');
//     playSpatialButton.removeAttribute('disabled');
//     stopSpatialButton.setAttribute('disabled', 'disabled');
//     playSpatial_1(false);
// }

async function playanyway(localspatialsound, localspatialfile, positionindex) {
    console.log('play anyway');
    // playSpatialButton.setAttribute('disabled', 'disabled');
    // stopSpatialButton.removeAttribute('disabled');
    playspatial(true, localspatialsound, localspatialfile, positionindex);
}
async function stopanyway(localspatialsound, localspatialfile, positionindex) {
    console.log('play anyway');
    // playSpatialButton.setAttribute('disabled', 'disabled');
    // stopSpatialButton.removeAttribute('disabled');
    playspatial(false, localspatialsound, localspatialfile, positionindex);
}

let localSpatialSound;


async function loadSound(url) {
    const response = await fetch(url);
    return response.arrayBuffer();
}

async function loadSoundBuffers0() {
    localSpatialFileBuffer0 = await loadSound('car.wav');
    console.log('localSpatialFileBuffer0',localSpatialFileBuffer0 )
    // playSpatialButton.removeAttribute('disabled');
}
async function loadSoundBuffers1() {
    localSpatialFileBuffer1 = await loadSound('dog.wav');
    // playSpatialButton.removeAttribute('disabled');
}
async function loadSoundBuffers2() {
    localSpatialFileBuffer2 = await loadSound('walk.wav');
    // playSpatialButton.removeAttribute('disabled');
}

async function playspatial(play, soundbuffer, filebuffer, positionindex){
    if (play) {
        await ensureAudioContext();
        let currentposition;
        if (positionindex == 0) {
            currentposition = position0;}
        else if (positionindex == 1) {
            currentposition = position1;}
        else if (positionindex == 2) {
            currentposition = position2;
        }
        localSpatialSound = new AudioBufferSourceNode(audioContext);
        localSpatialSound.buffer = soundbuffer;
        localSpatialSound.loop = true;
        localSpatialSound.connect(localHrtfInput);

        const azimuth = Math.random() * 2 * Math.PI;
        const distance = 5;
        localHrtfInput.setPosition(azimuth, distance);
        localHrtfInput.x = currentposition.x
        localHrtfInput.y = currentposition.y
        // localHrtfInput.x = position.x + distance * Math.sin(-azimuth);
        // localHrtfInput.y = position.y + distance * Math.cos(-azimuth);
        // localHrtfInput.o = position.z
        console.log(localHrtfInput);
        updateRelativePosition(localHrtfInput);
        localSpatialSound.start();
    } else {
        localSpatialSound.stop();
        localSpatialSound.disconnect(localHrtfInput);
        localSpatialSound = null;
    }
}

async function load() {
    console.log('load');
    loadSoundBuffers0(); 
    loadSoundBuffers1() // Don't wait for this to complete.
    loadSoundBuffers2();
}

function unload() {
    console.log('unload');

    if (localSpatialSound) {
        playspatial(false,None,None);
        playspatial(false,None,None);
    }

    deleteAudioContext();
}

load();
window.addEventListener('beforeunload', unload); 

