import * as HiFiAudioNodes from './vendor/hifi-audio-nodes.mjs';
import './vendor/AgoraRTC_N-production.js';  // AgoraRTC

//3d
// import './style.css'
import * as THREE from 'three'

// import typefaceFont from 'three/examples/fonts/helvetiker_regular.typeface.json';

// import * as dat from 'lil-gui'
import createLight from './scene.js';
import setupscene from './basicscene.js';
import createSphere from './createsphere.js';
import soundMap from './SoundMap.js';
import setupButtons from './setupButtons.js';
//data input

console.log(localStorage.getItem('results'))
let demo_map = {'laughing':(0.49,0.58,0.23)}
let names = ['glass_breaking','frog','dog','laughing','baby']

function getaudiobyname(name){
    let sound = soundMap[name]
    return sound
}


let position = { x: 0, y: 0, o: 0 };
let position0 = { x: -4.5, y: 0.95, z: 0.5 };
let position1 = { x: 0, y: -2.25, z: -1 };
let position2 = { x: 0.5, y: -0.75, z: 0 };
let position3 = { x: 0, y: 0, z: 0 };
let position4 = { x: 1, y: 2, z: 3 };
//some stable variable 
let color0= '#bea6f5', color1 = '#1363DF', color2 = '#f5e595', color3 = '#E966A0', color4 = '#00FFCA';
//all about the 2d interfaces =
const { xInput0,yInput0,zInput0,
        xInput1,yInput1,zInput1,
        xInput2,yInput2,zInput2,
        xInput3,yInput3,zInput3,
        xInput4,yInput4,zInput4 } = setupButtons(document,names);
let changecounter = document.getElementById('counter');
let oldcounter = 0;

//all about the 3d setup
const canvas = document.querySelector('canvas.webgl')
const {scene, sizes, camera, controls, mouse, renderer} = setupscene(canvas)
let object0,object1,object2,object3,object4;
object0 = createSphere(scene, color0, position0)
object1 = createSphere(scene, color1, position1)
object2 = createSphere(scene, color2, position2)
object3 = createSphere(scene, color3, position3)
object4 = createSphere(scene, color4, position4)
let pointLight0,pointLight1,pointLight2,pointLight3,pointLight4;
pointLight0 = createLight( color0 );
pointLight1 = createLight( color1 );
pointLight2 = createLight( color2 );
pointLight3 = createLight( color3 );
pointLight4 = createLight( color4 );
scene.add( object0,object1,object2,object3,object4 )
scene.add( pointLight0,pointLight1,pointLight2,pointLight3,pointLight4 );
// raycaster
const raycaster = new THREE.Raycaster()


// audio set up
let startplay = [false,false,false,false,false]
let stopplay = [false,false,false,false,false]
let count = [0,0,0,0,0]

let localSpatialFileBuffer0;
let localSpatialFileBuffer1;
let localSpatialFileBuffer2;
let localSpatialFileBuffer3;
let localSpatialFileBuffer4;

let localSpatialSoundBuffer0;
let localSpatialSoundBuffer1;
let localSpatialSoundBuffer2;
let localSpatialSoundBuffer3;
let localSpatialSoundBuffer4;

// 3D interaction
function controlclick(currentintersect) {
    for (let i = 0; i < 5; i++) {
        if (currentintersect.object === eval('object' + i)) {
            console.log('click' + i)
            count[i] += 1;
            if (count[i] % 2 == 1) {
                startplay[i] = true;
            }
            else {
                stopplay[i] = true;
            }
        }
    }
}

window.addEventListener('click',() =>{
    if(currentintersect){controlclick(currentintersect)}
})

const clock = new THREE.Clock()
let currentintersect = null

function resetposition() {
    for (let i = 0; i < 5; i++) {
        let light = eval('pointLight' + i)
        let theobject = eval('object' + i)
        let theposition = eval('position' + i)
        light.position.x = theposition.x
        light.position.z = -theposition.y
        light.position.y = theposition.z
        theobject.position.x = theposition.x
        theobject.position.z = -theposition.y
        theobject.position.y = theposition.z
        theobject.material.color.set(eval('color' + i))
}}
function contorlplayorstop() {
    for (let i=0; i<5; i++) {
        let thelocalSpatialFileBuffer = eval('localSpatialFileBuffer' + i)
        let thelocalSpatialSoundBuffer = eval('localSpatialSoundBuffer' + i)
        if (startplay[i]) {
            playanyway(thelocalSpatialSoundBuffer, thelocalSpatialFileBuffer, i)
            startplay[i] = false;
            console.log(thelocalSpatialFileBuffer)
        }
        if (stopplay[i]) {
            stopanyway(thelocalSpatialSoundBuffer, thelocalSpatialFileBuffer, i)
            stopplay[i] = false;
            console.log(stopplay[i])
        }
    }
}
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
    position3 = {
        x: parseFloat(xInput3.value),
        y: parseFloat(yInput3.value),
        z: parseFloat(zInput3.value)
    };
    position4 = {
        x: parseFloat(xInput4.value),
        y: parseFloat(yInput4.value),
        z: parseFloat(zInput4.value)
    };
}

const tick = () =>
{
    if (oldcounter != changecounter.value) {
        oldcounter = changecounter.value;
        onLocalPositionChange();
    }
    const elapsedTime = clock.getElapsedTime()

    resetposition()

    raycaster.setFromCamera(mouse,camera)

    const objectstotest = [object1,object2,object3,object4,object0]
    const intersects = raycaster.intersectObjects(objectstotest)
    
    for(const intersect of intersects){
        intersect.object.material.color.set('#ff0000')
    }

    if(intersects.length){   
        currentintersect = intersects[0]
    } else {
        currentintersect = null 
    }

    controls.update()
    renderer.render(scene, camera)
    
    contorlplayorstop()
    window.requestAnimationFrame(tick)
}
tick()


// _____________________________________________________
// ________________FROM HERE____________________________
// __________is all about audio operation_______________
// audio context set up
let audioContext;
const hrtfInputs = new Map();
let localHrtfInput0;
let localHrtfInput1;
let localHrtfInput2;
let localHrtfInput3;
let localHrtfInput4;
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

    localHrtfInput0 = new HiFiAudioNodes.HRTFInput(audioContext);
    localHrtfInput1 = new HiFiAudioNodes.HRTFInput(audioContext);
    localHrtfInput2 = new HiFiAudioNodes.HRTFInput(audioContext);
    localHrtfInput3 = new HiFiAudioNodes.HRTFInput(audioContext);
    localHrtfInput4 = new HiFiAudioNodes.HRTFInput(audioContext);
    localHrtfInput0.connect(hrtfOutput);
    localHrtfInput1.connect(hrtfOutput);
    localHrtfInput2.connect(hrtfOutput);
    localHrtfInput3.connect(hrtfOutput);
    localHrtfInput4.connect(hrtfOutput);
    localSpatialSoundBuffer0 = await audioContext.decodeAudioData(localSpatialFileBuffer0);
    localSpatialSoundBuffer1 = await audioContext.decodeAudioData(localSpatialFileBuffer1);
    localSpatialSoundBuffer2 = await audioContext.decodeAudioData(localSpatialFileBuffer2);
    localSpatialSoundBuffer3 = await audioContext.decodeAudioData(localSpatialFileBuffer3);
    localSpatialSoundBuffer4 = await audioContext.decodeAudioData(localSpatialFileBuffer4);
}

function deleteAudioContext() {
    if (!audioContext) {
        return;
    }

    console.log('delete audio context');

    localHrtfInput.disconnect(hrtfOutput);
    localHrtfInput = null;

    localHrtfInput1.disconnect(hrtfOutput);
    localHrtfInput1 = null;

    localHrtfInput2.disconnect(hrtfOutput);
    localHrtfInput2 = null;

    localHrtfInput3.disconnect(hrtfOutput);
    localHrtfInput3 = null;

    localHrtfInput4.disconnect(hrtfOutput);
    localHrtfInput4 = null;

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



async function playanyway(localspatialsound, localspatialfile, positionindex) {
    console.log('play anyway');
    playspatial(true, localspatialsound, localspatialfile, positionindex);
}
async function stopanyway(localspatialsound, localspatialfile, positionindex) {
    console.log('play anyway');
    playspatial(false, localspatialsound, localspatialfile, positionindex);
}

let localSpatialSound;


async function loadSound(url) {
    const response = await fetch(url);
    return response.arrayBuffer();
}

async function loadSoundBuffers() {
    console.log("sound4",soundMap[names[0]])
    localSpatialFileBuffer0 = await loadSound(soundMap[names[0]]);
    localSpatialFileBuffer1 = await loadSound(soundMap[names[1]]);
    localSpatialFileBuffer2 = await loadSound(soundMap[names[2]]);
    localSpatialFileBuffer3 = await loadSound(soundMap[names[3]]);
    localSpatialFileBuffer4 = await loadSound(soundMap[names[4]]);
}
async function loadSoundBuffers1() {
    
}
async function loadSoundBuffers2() {
    
}
async function loadSoundBuffers3() {
    
}
async function loadSoundBuffers4() {
    
}

async function playspatial(play, soundbuffer, filebuffer, positionindex){
    if (play) {
        await ensureAudioContext();
        localSpatialSound = new AudioBufferSourceNode(audioContext);
        localSpatialSound.buffer = soundbuffer;
        localSpatialSound.loop = true;
        let currentposition;
        if (positionindex == 0) {
            localSpatialSound.connect(localHrtfInput0);
            currentposition = position0;
            const azimuth = Math.random() * 2 * Math.PI;
            const distance = 5;
            localHrtfInput0.setPosition(azimuth, distance);
            localHrtfInput0.x = currentposition.x
            localHrtfInput0.y = currentposition.y
            updateRelativePosition(localHrtfInput0);
            localSpatialSound.start();
        }
        else if (positionindex == 1) {
            currentposition = position1;
            localSpatialSound.connect(localHrtfInput1);
            const azimuth = Math.random() * 2 * Math.PI;
            const distance = 5;
            localHrtfInput1.setPosition(azimuth, distance);
            localHrtfInput1.x = currentposition.x
            localHrtfInput1.y = currentposition.y
            updateRelativePosition(localHrtfInput1);
            localSpatialSound.start();}
        else if (positionindex == 2) {
            currentposition = position2;
            localSpatialSound.connect(localHrtfInput2);
            const azimuth = Math.random() * 2 * Math.PI;
            const distance = 5;
            localHrtfInput2.setPosition(azimuth, distance);
            localHrtfInput2.x = currentposition.x
            localHrtfInput2.y = currentposition.y
            updateRelativePosition(localHrtfInput2);
            localSpatialSound.start();
        }
        else if (positionindex == 3) {
            currentposition = position3;
            localSpatialSound.connect(localHrtfInput3);
            const azimuth = Math.random() * 2 * Math.PI;
            const distance = 5;
            localHrtfInput3.setPosition(azimuth, distance);
            localHrtfInput3.x = currentposition.x
            localHrtfInput3.y = currentposition.y
            console.log(localHrtfInput3);
            updateRelativePosition(localHrtfInput3);
            localSpatialSound.start();
        }
        else if (positionindex == 4) {
            currentposition = position4;
            localSpatialSound.connect(localHrtfInput4);
            const azimuth = Math.random() * 2 * Math.PI;
            const distance = 5;
            localHrtfInput4.setPosition(azimuth, distance);
            localHrtfInput4.x = currentposition.x
            localHrtfInput4.y = currentposition.y
            updateRelativePosition(localHrtfInput4);
            localSpatialSound.start();
        }


    } else {
        localSpatialSound.stop();
        if (positionindex == 0) {
            localSpatialSound.disconnect(localHrtfInput0);
        }
        else if (positionindex == 1) {
            localSpatialSound.disconnect(localHrtfInput1);
        }
        else if (positionindex == 2) {
            localSpatialSound.disconnect(localHrtfInput2);
        }
        else if (positionindex == 3) {
            localSpatialSound.disconnect(localHrtfInput3);
        }
        else if (positionindex == 4) {
            localSpatialSound.disconnect(localHrtfInput4);
        }
        localSpatialSound = null;
    }
}

async function load() {
    console.log('load');
    loadSoundBuffers(); 
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





// function controlplay() {
//     for (let i = 0; i < 5; i++) {
//         let start = eval('startplay' + i)
//         let stop = eval('stopplay' + i)
//         let thelocalSpatialSoundBuffer = eval('localSpatialSoundBuffer' + i)
//         let thelocalSpatialFileBuffer = eval('localSpatialFileBuffer' + i)
//         if (start) {
//             start.value = false;
//             console.log(start)
//         }
//         if (stop == true) {
//             // stopanyway(thelocalSpatialSoundBuffer, thelocalSpatialFileBuffer, i)
//             // stop = false;
//             // console.log(stop)
//         }
//     }
// }


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