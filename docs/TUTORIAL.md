# HiFi Spatial Audio Tutorial

This tutorial uses the High Fidelity Web Audio Nodes SDK and Agora RTC SDK to create a single page application that sends and
receives audio among app users. You will need an Agora account and project in order to run the app.

The app is hosted locally using Node.js and Express. Alternatively, you can host the app on your own Web server.

## 0: Prerequisites

**node** version 18 

**npm** version 8

https://nodejs.org/en/download/


## 1: Set up a development workspace

In a command prompt, create and change to a directory for the tutorial:
```
> mkdir spatial-audio-tutorial
> cd spatial-audio-tutorial
```

Initialize NPM to create a `package.json` file:
```
> npm init -y
```

Add the following line to `package.json`:
```
"type": "module",
```


## 2: Set up a local web server to host the single page application

Install Express to use as a local Web server:
```
> npm install express
```

Add a `server.js` file to the root directory with the following content:
```
import express from 'express';

const app = express();
const port = 8080;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Tutorial listening at: http://localhost:${port}`);
});
```

Run the Express server:
```
> node server.js
```

This hosts the app at [http://localhost:8080](http://localhost:8080). Load this URL into your Web browser and "Hello World!" 
should be displayed.

Alternatively, you can just create the tutorial's HTML and script files, below, and host them on your own Web server.


## 3: Serve an HTML page

Create a `/tutorial` directory for the app:
```
> mkdir tutorial
```

Add an `index.html` file in this directory with the following content:
```
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>HiFi Spatial Audio Tutorial</title>
</head>
<body>
    <p>HTML Hello World!</p>
</body>
</html>
```

Update `server.js` so that it serves the HTML file:
```
import express from 'express';
...
app.get('/', (req, res) => {
    //res.send('Hello World!');
    res.sendFile('index.html');
});
...
```

Now when you load the URL the page should display, "HTML Hello World!".


## 4: Install the Agora RTC SDK package

Install the Agora RTC SDK:
```
> npm install agora-rtc-sdk-ng
```

Add a `tutorial.js` file that references the Agora library.
Create the file in the `/tutorial` directory, with content:
```
import './vendor/AgoraRTC_N-production.js';  // AgoraRTC
/* global AgoraRTC */
```

This `import` statement creates a global `AgoraRTC` object for us to use.

Include this JavaScript file in the HTML page:
```
...
<body>
    <p>HTML Hello World!</p>
    <script type="module" src="tutorial.js"></script>
</body>
```

Add the following lines to `server.js` so that it serves the Agora library file:
```
import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/vendor/AgoraRTC_N-production.js', (req, res) => {
    res.sendFile(__dirname
        + '/node_modules/agora-rtc-sdk-ng/AgoraRTC_N-production.js');
});
```

Now, when you load the HTML file you should see a number of "Agora-SDK" messages in the browser console.


## 5: Transmit and receive standard audio using Agora RTC

### 5.1: Add "join" and "leave" UI

Add "join" and "leave" buttons to the HTML in place of the "hello world":
```
...
<body>
    <!--<p>HTML Hello World!</p>-->
    <button id="join">Join</button>
    <button id="leave" disabled>Leave</button>
    <script type="module" src="tutorial.js"></script>
</body>
```

Add event handlers for these buttons in `tutorial.js`:
```
const joinButton = document.getElementById('join');
const leaveButton = document.getElementById('leave');

joinButton.addEventListener('click', () => {
    console.log('join');
    joinButton.setAttribute('disabled', 'disabled');
    leaveButton.removeAttribute('disabled');
    joinChannel();
});

leaveButton.addEventListener('click', () => {
    console.log('leave');
    joinButton.removeAttribute('disabled');
    leaveButton.setAttribute('disabled', 'disabled');
    leaveChannel();
});

async function joinChannel() {
    console.log('join channel');
}

async function leaveChannel() {
    console.log('leave channel');
}
```

Now, when you click these buttons they should change between enabled and disabled and you should see appropriate messages in the
browser console.

### 5.2: Add methods that are called at page load and unload

Add load() and unload() methods and calls to them at the bottom of `tutorial.js`:
```
async function load() {
    console.log('load');
}

async function unload() {
    console.log('unload');
}

load();
window.addEventListener('beforeunload', unload);
```

Now, when you navigate to and away from the page you should see "load" and "unload" messages in the browser console.

### 5.3: Send the local user's microphone audio out to other users

Specify your Agora app ID in a `config.js` file in the `/tutorial` directory:
```
export const Config = {
    AGORA_APP_ID: 'your Agora app ID goes here'
};
```

Import that file in `tutorial.js`:
```
import { Config } from './config.js';
```

Create and destroy an Agora client in the `load()` and `unload()` methods:
```
let agoraClient;
let microphoneTrack;

async function load() {
    console.log('load');
    agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
}

async function unload() {
    console.log('unload');
    agoraClient = null;
}
```

Fill in the `joinChannel()` and `leaveChannel()` methods to send the local user's microphone, and update `unload()` to leave if connected:
```
const channel = 'my-channel-name';
let uid;
let isConnected = false;

async function joinChannel() {
    //console.log('join channel');
    microphoneTrack = await AgoraRTC.createMicrophoneAudioTrack();
    uid = await agoraClient.join(Config.AGORA_APP_ID, channel, null);
    await agoraClient.publish([microphoneTrack]);
    isConnected = true;
    console.log('Local user', uid, 'joined the channel');
}

async function leaveChannel() {
    //console.log('leave channel');
    await agoraClient.leave();
    microphoneTrack.close();
    microphoneTrack = null;
    isConnected = false;
    console.log('Local user', uid, 'left the channel');
}

async function unload() {
    console.log('unload');
    if (isConnected) {
        leaveChannel()
    }
    agoraClient = null;
}
```

Now, when you join and leave you should see messages about your local user and and ID in the browser console.

### 5.4: Play remote users' audio non-spatially for starters

Add Agora engine event handlers to play remote users' audio directly:
```
async function onUserPublished(user, mediaType) {
    await agoraClient.subscribe(user, mediaType);
    if (mediaType === 'audio') {
        user.audioTrack.play();
        console.log('Remote user', user.uid, 'joined the channel');
    }
}

function onUserUnpublished(user) {
    console.log('Remote user', user.uid, 'left the channel');
}

async function load() {
    ...
    agoraClient.on('user-published', onUserPublished);
    agoraClient.on('user-unpublished', onUserUnpublished);
}
```

Now, if you load the Web page in two browsers you should be able to converse between them when both have joined the channel.
This audio will not be spatial.


## 6: Install and import the HiFi Audio Nodes package

Enable the High Fidelity registry to be used by creating a file `.npmrc` in the root directory with the following content:
```
registry = https://npm.highfidelity.com/
```

Install the HiFi Audio Nodes package by running:
```
> npm install hifi-audio-nodes
```

Add the following line at the top of `tutorial.js` to use the HiFi Audio Nodes package:
```
import * as HiFiAudioNodes from './vendor/hifi-audio-nodes.mjs';
```

Note: The `HiFiAudioNodes` library must be imported before the Agora library because the HiFi library modifies 
`RTCPeerConnection`.

Add the following lines to `server.js` so that it serves the HiFi Audio Nodes library file:
```
app.get('/vendor/hifi-audio-nodes.mjs', (req, res) => {
    res.sendFile(__dirname
        + '/node_modules/hifi-audio-nodes/dist/hifi-audio-nodes.mjs');
});
```

Now, when you load the HTML file you should see the HiFi Audio Nodes version reported in the browser console.


## 7: Spatialize remote users' audio using HiFiAudioNodes

### 7.1: Create an `AudioContext` and `Audio` element upon first user gesture

The `AudioContext` and `Audio` element must be created immediately after a user gesture, not before, in order to prevent Safari
auto-play policy from breaking the audio pipeline.

The `Audio` element plus associated node is required for Safari < 16.4 / WebKit < 18616 in order to play local sounds spatially.

Create the `AudioContext` and `Audio` element in a `ensureAudioContext()` method:
```
let audioContext;
let audioElement;
let audioNode;

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
}
```

Call this method upon user gestures (just in `joinChannel()` for now):
```
async function joinChannel() {
    //console.log('join channel');
    await ensureAudioContext();
    ...
```

### 7.2: Delete the `AudioContext` and `Audio` element upon page unload

Delete the `AudioContext` and `Audio` element in a `deleteAudioContext()` method:
```
function deleteAudioContext() {
    if (!audioContext) {
        return;
    }

    console.log('delete audio context');

    audioElement.pause();
    audioElement.srcObject = null;
    audioElement = null;
    audioNode = null;

    audioContext.close();
    audioContext = null;
}
```

Call this method upon page unload:
```
function unload() {
    ...
    agoraClient = null;

    deleteAudioContext();
}
```

### 7.3: Create and destroy an HRTF environment as the local user joins and leaves

Serve the WASM and worker modules by adding the following to `server.js`:
```
app.get('/vendor/hifi.wasm.js', (req, res) => {
    res.sendFile(__dirname
        + '/node_modules/hifi-audio-nodes/dist/hifi.wasm.js');
});
app.get('/vendor/hifi.wasm.simd.js', (req, res) => {
    res.sendFile(__dirname
        + '/node_modules/hifi-audio-nodes/dist/hifi.wasm.simd.js');
});
app.get('/vendor/worker.js', (req, res) => {
    res.sendFile(__dirname
        + '/node_modules/hifi-audio-nodes/dist/worker.js');
});
```

Create and destroy an `HRTFOutput` node plus associated `Limiter`, ready to play remote users' audio:
```
let hrtfOutput;
let limiter;

async function ensureAudioContext() {
    ...

    await HiFiAudioNodes.setupHRTF(audioContext, null);

    hrtfOutput = new HiFiAudioNodes.HRTFOutput(audioContext);
    limiter = new HiFiAudioNodes.Limiter(audioContext);
    hrtfOutput.connect(limiter).connect(audioContext.destination);
}

function deleteAudioContext() {
    ...
    console.log('delete audio context');

    hrtfOutput.disconnect(limiter);
    limiter.disconnect(audioContext.destination);
    hrtfOutput = null;
    limiter = null;

    HiFiAudioNodes.shutdownHRTF();

    ...
}
```

### 7.4: Add and remove remote `HRTFInput` nodes as remote users join and leave

Add and remove nodes for remote users, randomly positioning the remote users' audio:
```
const hrtfInputs = new Map();

async function onUserPublished(user, mediaType) {
    await agoraClient.subscribe(user, mediaType);
    if (mediaType === 'audio') {
        //user.audioTrack.play();

        // Play remote user's audio spatially.
        const mediaStreamTrack = user.audioTrack.getMediaStreamTrack();
        const mediaStream = new MediaStream([mediaStreamTrack]);
        const sourceNode = audioContext.createMediaStreamSource(mediaStream);
        const hrtfInput = new HiFiAudioNodes.HRTFInput(audioContext);
        sourceNode.connect(hrtfInput).connect(hrtfOutput);
        hrtfInputs.set(user.uid, hrtfInput);

        // Randomly position remote user.
        const azimuth = Math.random() * 2 * Math.PI;
        const distance = 2.0;
        hrtfInput.setPosition(azimuth, distance);

        console.log('Remote user', user.uid, 'joined the channel');
    }
}

function onUserUnpublished(user) {
    if (hrtfInputs.has(user.uid)) {
        const hrtfInput = hrtfInputs.get(user.uid);
        hrtfInput.disconnect(hrtfOutput);
        hrtfInputs.delete(user.uid);
    }
    console.log('Remote user', user.uid, 'left the channel');
}
```

### 7.5: Remove remote users' inputs when the local user leaves or unloads the page

Remove remote users' inputs when the local user leaves:
```
async function leaveChannel() {
    //console.log('leave channel');
    await agoraClient.leave();

    for (const hrtfInput of hrtfInputs.values()) {
        hrtfInput.disconnect(hrtfOutput);
    }
    hrtfInputs.clear();

    ...
}
```

Now, when you converse between two browsers you should hear the audio spatially.


## 8: Add microphone features

### 8.1: Add a noise gate to the microphone input

This should replace the browser's built-in noise suppression.

Add noise gate threshold UI:
```
<p>Mic threshold: <input id="threshold" type="number" min="-96" max="0" value="-40" step="1" /></p>
```

Insert a NoiseGate node into the audio input path, replacing the default Agora microphone:
```
let microphoneStream;
let microphoneNode;
let noiseGate;
let gatedNode;

async function ensureAudioContext() {
    ...
    localHrtfInput.connect(hrtfOutput);

    microphoneStream = await navigator.mediaDevices.getUserMedia({
        audio: {
            echoCancellation: true,
            autoGainControl: false,
            noiseSuppression: false,
            sampleRate: 48000,
            channelCount: { exact: 1 }
        },
        video: false
    });

    microphoneNode = audioContext.createMediaStreamSource(microphoneStream);
    noiseGate = new HiFiAudioNodes.NoiseGate(audioContext);
    noiseGate.setThreshold(thresholdInput.value);
    gatedNode = audioContext.createMediaStreamDestination();
    microphoneNode.connect(noiseGate).connect(gatedNode);

    microphoneTrack = AgoraRTC.createCustomAudioTrack({
        mediaStreamTrack: gatedNode.stream.getAudioTracks()[0]
    });

    ...
}

function deleteAudioContext() {
    ...
    console.log('delete audio context');

    microphoneTrack.close();
    microphoneTrack = null;

    microphoneNode.disconnect(noiseGate);
    noiseGate.disconnect(gatedNode);
    microphoneStream = null;
    microphoneNode = null;
    noiseGate = null;
    gatedNode = null;

    ...
}

async function joinChannel() {
    ...
    //microphoneTrack = await AgoraRTC.createMicrophoneAudioTrack();
    ...
}

async function leaveChannel() {
    ...
    //microphoneTrack.close();
    //microphoneTrack = null;
}
```

Wire up the noise gate threshold UI:
```
const thresholdInput = document.getElementById('threshold');

thresholdInput.addEventListener('change', () => {
    onThresholdChange();
    console.log('Threshold changed:', thresholdInput.value);
});

function onThresholdChange() {
    const threshold = Math.max(-96, Math.min(thresholdInput.value, 0));
    thresholdInput.value = threshold;
    if (gatedNode) {
        noiseGate.setThreshold(threshold);
    }
}
```

### 8.2 Add the ability to mute the microphone

This uses the noise gate so that the audio stream continues to be sent, thus continuing to send any metadata.

Add mute UI:
```
<p><input id="mute" type="checkbox" /> Mute</p>
```

Wire up the mute UI:
```
const muteInput = document.getElementById('mute');

muteInput.addEventListener('change', () => {
    onMuteChange();
    console.log('Mute changed:', muteInput.checked);
});

function onMuteChange() {
    if (gatedNode) {
        noiseGate.setThreshold(muteInput.checked ? 0 : thresholdInput.value);
    }
}
```

Apply the mute state to other occurrences of the threshold being used:
```

function onThresholdChange() {
    ...
    if (gatedNode) {
        //noiseGate.setThreshold(threshold);
        noiseGate.setThreshold(muteInput.checked ? 0 : threshold);
    }
}

async function ensureAudioContext() {
    ...
    //noiseGate.setThreshold(thresholdInput.value);
    noiseGate.setThreshold(muteInput.checked ? 0 : thresholdInput.value);
    ...
}
```

Now, when you mute your microphone remote users should no longer hear you.


### 8.3: Add audio echo cancellation (AEC) option

AEC is automatically enabled up until now, but we may want to turn it off.

Add AEC UI:
```
<p><input id="aec" type="checkbox" /> AEC</p>
```

Wire up the AEC UI, taking into account a Chromium bug:
```
const aecInput = document.getElementById('aec');

aecInput.addEventListener('change', () => {
    onAecChange();
    console.log('AEC changed:', aecInput.checked);
});

async function onAecChange() {
    // Should use MediaStreamTrack.applyConstraints() to toggle AEC on/off but can't because there's a bug in Chrome.
    // https://bugs.chromium.org/p/chromium/issues/detail?id=796964
    // Instead, create a new microphone track with the desired AEC setting.
    if (microphoneStream) {
        microphoneNode.disconnect(noiseGate);
        const newMicrophoneStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: aecInput.checked,
                autoGainControl: false,
                noiseSuppression: false,
                sampleRate: 48000,
                channelCount: { exact: 1 }
            },
            video: false
        });
        microphoneNode.disconnect(noiseGate);
        microphoneNode = audioContext.createMediaStreamSource(newMicrophoneStream);
        microphoneNode.connect(noiseGate);
        microphoneStream = newMicrophoneStream;
    }
}
```

Apply the AEC state to other occurrences of a microphone stream being created:
```
async function ensureAudioContext() {
    ...
    microphoneStream = await navigator.mediaDevices.getUserMedia({
        audio: {
            //echoCancellation: true,
            echoCancellation: aecInput.checked,
            ...
```

Now, you should be able to turn AEC on and off.


## 9: Add local audio sources

The audio sources used in this example are created from sound files which are played in a loop. When using sound files it's best
to use 48kHz files to avoid Web Audio resampling them.

### 9.1: Play local audio spatially

This plays a WAV file as a local audio stream through the `HRTFOutput` node so that it is spatialized.

Add UI:
```
<p>
    Play local sounds:<br />
    <button id="stop-spatial" disabled>&#x23F8;</button>
    <button id="play-spatial" disabled>&#x23F5;</button>
    Spatial
</p>
```

Add event handlers for these buttons:
```
const playSpatialButton = document.getElementById('play-spatial');
const stopSpatialButton = document.getElementById('stop-spatial');

playSpatialButton.addEventListener('click', () => {
    console.log('play local spatial');
    playSpatialButton.setAttribute('disabled', 'disabled');
    stopSpatialButton.removeAttribute('disabled');
    playSpatial(true);
});

stopSpatialButton.addEventListener('click', () => {
    console.log('stop local spatial');
    playSpatialButton.removeAttribute('disabled');
    stopSpatialButton.setAttribute('disabled', 'disabled');
    playSpatial(false);
});

function playSpatial(play) {
    console.log('play spatial', play);
}
```

Load the audio file ready to play, and enable the "play" button:
```
let localSpatialFileBuffer;

async function loadSound(url) {
    const response = await fetch(url);
    return response.arrayBuffer();
}

async function loadSoundBuffers() {
    localSpatialFileBuffer = await loadSound('owl.wav');
    playSpatialButton.removeAttribute('disabled');
}

async function load() {
    ...

    loadSoundBuffers();  // Don't wait for this to complete.

    ...
}
```

Add an `HRTFInput` node to play the audio spatially:
```
let localHrtfInput;

async function ensureAudioContext() {
    ...
    hrtfOutput.connect(limiter).connect(audioContext.destination);

    localHrtfInput = new HiFiAudioNodes.HRTFInput(audioContext);
    localHrtfInput.connect(hrtfOutput);

    ...
}

function deleteAudioContext() {
    ...

    localHrtfInput.disconnect(hrtfOutput);
    localHrtfInput = null;

    hrtfOutput.disconnect(limiter);
    ...
}
```

Wire up the UI to play and stop playing, randomly positioning the audio:
```
let localSpatialSoundBuffer;
let localSpatialSound;

async function playSpatial(play) {
    //console.log('play spatial', play);
    if (play) {
        await ensureAudioContext();

        if (!localSpatialSoundBuffer) {
            localSpatialSoundBuffer = await audioContext.decodeAudioData(localSpatialFileBuffer);
        }

        localSpatialSound = new AudioBufferSourceNode(audioContext);
        localSpatialSound.buffer = localSpatialSoundBuffer;
        localSpatialSound.loop = true;
        localSpatialSound.connect(localHrtfInput);

        const azimuth = Math.random() * 2 * Math.PI;
        const distance = 4.0;
        localHrtfInput.setPosition(azimuth, distance);

        localSpatialSound.start();
    } else {
        localSpatialSound.stop();
        localSpatialSound.disconnect(localHrtfInput);
        localSpatialSound = null;
    }
}
```

Stop playing during unload:
```
function unload() {
    ...

    if (localSpatialSound) {
        playSpatial(false);
    }
    if (isConnected) {
        ...
}
```

Now, you should be able to hear the sound play spatially, at a different position each time you play it.

### 9.2: Play local audio non-spatially

This plays a WAV file as local audio stream through the Limiter node to preserve high dynamic range and AEC.

Add UI:
```
<p>
    ...
    Spatial<br />
    <button id="stop-non-spatial" disabled>&#x23F8;</button>
    <button id="play-non-spatial" disabled>&#x23F5;</button>
    Non-spatial
</p>
```

Add event handlers for these buttons:
```
const playNonSpatialButton = document.getElementById('play-non-spatial');
const stopNonSpatialButton = document.getElementById('stop-non-spatial');

playNonSpatialButton.addEventListener('click', () => {
    console.log('play local non-spatial');
    playNonSpatialButton.setAttribute('disabled', 'disabled');
    stopNonSpatialButton.removeAttribute('disabled');
    playNonSpatial(true);
});

stopNonSpatialButton.addEventListener('click', () => {
    console.log('stop local non-spatial');
    playNonSpatialButton.removeAttribute('disabled');
    stopNonSpatialButton.setAttribute('disabled', 'disabled');
    playNonSpatial(false);
});

async function playNonSpatial(play) {
    console.log('play non-spatial', play);
}
```

Load the audio file ready to play, and enable the "play" button:
```
let localNonSpatialFileBuffer;

async function loadSoundBuffers() {
    ...
    localNonSpatialFileBuffer = await loadSound('thunder.wav');
    playNonSpatialButton.removeAttribute('disabled');
}
```

Wire up the UI to play and stop playing non-spatially through the `Limiter`:
```
let localNonSpatialSoundBuffer;
let localNonSpatialSound;

async function playNonSpatial(play) {
    //console.log('play non-spatial', play);
    if (play) {
        await ensureAudioContext();

        if (!localNonSpatialSoundBuffer) {
            localNonSpatialSoundBuffer = await audioContext.decodeAudioData(localNonSpatialFileBuffer);
        }

        localNonSpatialSound = new AudioBufferSourceNode(audioContext);
        localNonSpatialSound.buffer = localNonSpatialSoundBuffer;
        localNonSpatialSound.loop = true;
        localNonSpatialSound.connect(limiter);
        localNonSpatialSound.start();
    } else {
        localNonSpatialSound.stop();
        localNonSpatialSound.disconnect(limiter);
        localNonSpatialSound = null;
    }
}
```

Stop playing during unload:
```
function unload() {
    ...

    if (localNonSpatialSound) {
        playNonSpatial(false);
    }
    if (localSpatialSound) {
        ...
}
```

Now, you should be able to hear the sound play non-spatially.


## 10: Add user audio positioning

The 2D positions and orientations of audio sources can be provided by including them in audio stream metadata for most browsers
(e.g., Chrome/Edge, Safari) but not all (e.g., Firefox). Alternatively, you can distribute user positions and orientations by
other means and similarly position the user audio.

### 10.1: Enable the "join" button only if meta data is supported

Modify the UI so that the "join" button is disabled by default and add a "not supported" message to display:
```
<button id="join" disabled>Join</button>
<button id="leave" disabled>Leave</button>
<span id="metadata-not-supported" style="display: none">Metadata not supported!</span>
```

Enable the "join" button or display the message per browser capabilities:
```
const isMetadataSupported = HiFiAudioNodes.isInlineMetadataSupported();

const metadataNotSupportedMessage = document.getElementById('metadata-not-supported');

if (isMetadataSupported) {
    joinButton.removeAttribute('disabled');
} else {
    console.log('Metadata not supported by this browser');
    metadataNotSupportedMessage.style.display = 'inline';
}
```

### 10.2: Set up audio positioning and metadata

Modify audio context set up:
```
function remoteUserPositionCallback(userID, x, y, o) {
}

async function ensureAudioContext() {
    ...
    //await HiFiAudioNodes.setupHRTF(audioContext, null);
    await HiFiAudioNodes.setupHRTF(audioContext, isMetadataSupported ? remoteUserPositionCallback : null);
    if (isMetadataSupported) {
        HiFiAudioNodes.enableInlineMetadata(true);
    }
    ...
```

Modify audio context tear down:
```
async function tearDownAudioContext() {
    ...
    //await HiFiAudioNodes.tearDownHRTF(audioContext);
    if (isMetadataSupported) {
        HiFiAudioNodes.shutdownHRTF();
    }
    ...
```

### 10.3: Send your position and orientation to other users

Add UI for setting your position and orientation:
```
<p>
    Position and orientation:
    x: <input id="x" type="number" min="-10" max="10" value="0" step="1" />
    y: <input id="y" type="number" min="-10" max="10" value="0" step="1" />
    o: <input id="o" type="number" min="-3.1416" max="3.1416" value="0" step="0.31416" />
</p>
```

Note: The position and orientation values are used for local spatial sound as well as user positioning.

Set up metadata encoding on the Agora client's `RTCRtpSender` once it has been created:
```
function getAudioSender() {
    const senders = agoraClient._p2pChannel.connection.peerConnection.getSenders();
    const sender = senders.find((e) => e.track?.kind === 'audio');
    return sender;
}

async function joinChannel() {
    ...
    await agoraClient.publish([microphoneTrack]);
    HiFiAudioNodes.setupSenderMetadata(getAudioSender());
    ...
}
```

Send your position and orientation to other users:
```
let position = { x: 0, y: 0, o: 0 };

async function ensureAudioContext() {
    ...
    hrtfOutput = new HiFiAudioNodes.HRTFOutput(audioContext);
    if (isMetadataSupported) {
        HiFiAudioNodes.enableInlineMetadata(true);
        hrtfOutput.setPosition(position);
    }
    ...
}

const xInput = document.getElementById('x');
const yInput = document.getElementById('y');
const oInput = document.getElementById('o');

xInput.addEventListener('change', () => {
    onLocalPositionChange();
});
yInput.addEventListener('change', () => {
    onLocalPositionChange();
});
oInput.addEventListener('change', () => {
    onLocalPositionChange();
});

function onLocalPositionChange() {
    position = {
        x: parseFloat(xInput.value),
        y: parseFloat(yInput.value),
        o: parseFloat(oInput.value)
    };
    console.log('Local position:', position.x, position.y, position.o);

    if (hrtfOutput) {
        if (isMetadataSupported) {
            hrtfOutput.setPosition(position);
        }
    }
}
```

### 10.4: Receive positions and orientations from other users and position relative to yourself

Set up metadata decoding for each remote user:
```
function getAudioReceiver(user) {
    if (!user.audioTrack) {
        return undefined;
    }
    const mediaStreamTrack = user.audioTrack.getMediaStreamTrack();
    const trackID = mediaStreamTrack.id;
    const receivers = agoraClient._p2pChannel.connection.peerConnection.getReceivers();
    const receiver = receivers.find(e => e.track?.id === trackID && e.track?.kind === 'audio');
    return receiver;
}

async function onUserPublished(user, mediaType) {
    ...
    // Receive metadata for remote user positioning.
    HiFiAudioNodes.setupReceiverMetadata(getAudioReceiver(user), user.uid);

    console.log('Remote user', user.uid, 'joined the channel');
    ...
}
```

Position remote users relative to yourself as their positions are received:
```
async function onUserPublished(user, mediaType) {
    ...
    // Randomly position remote user.
    //const azimuth = Math.random() * 2 * Math.PI;
    //const distance = 2.0;
    //hrtfInput.setPosition(azimuth, distance);

    // Augment remote user with initial position.
    hrtfInput.x = 0;
    hrtfInput.y = 0;
    hrtfInput.o = 0;
    ...
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
```

Position remote users relative to yourself as your position changes:
```
function onLocalPositionChange() {
    ...
    if (hrtfOutput) {
        ...
        for (const hrtfInput of hrtfInputs.values()) {
            updateRelativePosition(hrtfInput);
        }
    }
}
```

### 10.5: Update local spatial audio positioning as your position changes

Augment the local spatial audio input with its position and update relative to yours:
```
async function playSpatial(play) {
    ...
    //localHrtfInput.setPosition(azimuth, distance);
    localHrtfInput.x = position.x + distance * Math.sin(-azimuth);
    localHrtfInput.y = position.y + distance * Math.cos(-azimuth);
    updateRelativePosition(localHrtfInput);
    ...
}
```

Update the local spatial audio input position as your position changes:
```
function onLocalPositionChange() {
    ...
	if (hrtfOutput) {
		...
		updateRelativePosition(localHrtfInput);
        ...
	}
}
```
