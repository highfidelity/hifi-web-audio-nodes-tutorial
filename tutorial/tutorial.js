import * as HiFiAudioNodes from './vendor/hifi-audio-nodes.mjs';

import './vendor/AgoraRTC_N-production.js';  // AgoraRTC
/* global AgoraRTC */

import { Config } from './config.js';


let agoraClient;
const channel = 'my-channel-name';
let uid;
let microphoneTrack;
let isConnected = false;
let audioContext;
let microphoneStream;
let microphoneNode;
let noiseGate;
let gatedNode;
const hrtfInputs = new Map();
let localHrtfInput;
let hrtfOutput;
let limiter;
let audioElement;
let audioNode;
const isMetadataSupported = HiFiAudioNodes.isInlineMetadataSupported();
let position = { x: 0, y: 0, o: 0 };


async function ensureAudioContext() {
    //  The AudioContext and Audio element must be created immediately after a user gesture in order to prevent Safari auto-play
    //  policy from breaking the audio pipeline.

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
        hrtfOutput.setPosition(position);
    }
    limiter = new HiFiAudioNodes.Limiter(audioContext);
    hrtfOutput.connect(limiter).connect(audioContext.destination);

    localHrtfInput = new HiFiAudioNodes.HRTFInput(audioContext);
    localHrtfInput.connect(hrtfOutput);

    microphoneStream = await navigator.mediaDevices.getUserMedia({
        audio: {
            //echoCancellation: true,
            echoCancellation: aecInput.checked,
            autoGainControl: false,
            noiseSuppression: false,
            sampleRate: 48000,
            channelCount: { exact: 1 }
        },
        video: false
    });

    microphoneNode = audioContext.createMediaStreamSource(microphoneStream);
    noiseGate = new HiFiAudioNodes.NoiseGate(audioContext);
    //noiseGate.setThreshold(parseFloat(thresholdInput.value));
    noiseGate.setThreshold(muteInput.checked ? 0 : parseFloat(thresholdInput.value));
    gatedNode = audioContext.createMediaStreamDestination();
    microphoneNode.connect(noiseGate).connect(gatedNode);

    microphoneTrack = AgoraRTC.createCustomAudioTrack({
        mediaStreamTrack: gatedNode.stream.getAudioTracks()[0]
    });
}

function deleteAudioContext() {
    if (!audioContext) {
        return;
    }

    console.log('delete audio context');

    microphoneTrack.close();
    microphoneTrack = null;

    microphoneNode.disconnect(noiseGate);
    noiseGate.disconnect(gatedNode);
    microphoneStream = null;
    microphoneNode = null;
    noiseGate = null;
    gatedNode = null;

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
    //console.log('join channel');
    await ensureAudioContext();
    //microphoneTrack = await AgoraRTC.createMicrophoneAudioTrack();
    uid = await agoraClient.join(Config.AGORA_APP_ID, channel, null);
    await agoraClient.publish([microphoneTrack]);

    HiFiAudioNodes.setupSenderMetadata(getAudioSender());

    isConnected = true;
    console.log('Local user', uid, 'joined the channel');
}

async function leaveChannel() {
    //console.log('leave channel');
    await agoraClient.leave();
    //microphoneTrack.close();
    //microphoneTrack = null;

    for (const hrtfInput of hrtfInputs.values()) {
        hrtfInput.disconnect(hrtfOutput);
    }
    hrtfInputs.clear();

    isConnected = false;
    console.log('Local user', uid, 'left the channel');
}

function getAudioSender() {
    const senders = agoraClient._p2pChannel.connection.peerConnection.getSenders();
    const sender = senders.find((e) => e.track?.kind === 'audio');
    return sender;
}

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
        //const azimuth = Math.random() * 2 * Math.PI;
        //const distance = 2.0;
        //hrtfInput.setPosition(azimuth, distance);

        // Augment remote user with initial position.
        hrtfInput.x = 0;
        hrtfInput.y = 0;
        hrtfInput.o = 0;

        // Receive metadata for remote user positioning.
        HiFiAudioNodes.setupReceiverMetadata(getAudioReceiver(user), user.uid);

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


const thresholdInput = document.getElementById('threshold');
const muteInput = document.getElementById('mute');
const aecInput = document.getElementById('aec');

thresholdInput.addEventListener('change', () => {
    onThresholdChange();
    console.log('Threshold changed:', thresholdInput.value);
});

muteInput.addEventListener('change', () => {
    onMuteChange();
    console.log('Mute changed:', muteInput.checked);
});

aecInput.addEventListener('change', () => {
    onAecChange();
    console.log('AEC changed:', aecInput.checked);
});

function onThresholdChange() {
    const threshold = Math.max(-96, Math.min(parseFloat(thresholdInput.value), 0));
    thresholdInput.value = String(threshold);
    if (gatedNode) {
        //noiseGate.setThreshold(threshold);
        noiseGate.setThreshold(muteInput.checked ? 0 : threshold);
    }
}

function onMuteChange() {
    if (gatedNode) {
        noiseGate.setThreshold(muteInput.checked ? 0 : parseFloat(thresholdInput.value));
    }
 }

 async function onAecChange() {
    // Should use MediaStreamTrack.applyConstraints() to toggle AEC on/off but can't because there's a bug in Chrome.
    // https://bugs.chromium.org/p/chromium/issues/detail?id=796964
    // Instead, create a new microphone track with the desired AEC setting.
    if (microphoneStream) {
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


const metadataNotSupportedMessage = document.getElementById('metadata-not-supported');
const xInput = document.getElementById('x');
const yInput = document.getElementById('y');
const oInput = document.getElementById('o');

if (isMetadataSupported) {
    joinButton.removeAttribute('disabled');
} else {
    console.log('Metadata not supported by this browser');
    metadataNotSupportedMessage.style.display = 'inline';
}

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
        updateRelativePosition(localHrtfInput);
        for (const hrtfInput of hrtfInputs.values()) {
            updateRelativePosition(hrtfInput);
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


const playSpatialButton = document.getElementById('play-spatial');
const stopSpatialButton = document.getElementById('stop-spatial');
const playNonSpatialButton = document.getElementById('play-non-spatial');
const stopNonSpatialButton = document.getElementById('stop-non-spatial');

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

let localSpatialFileBuffer;
let localSpatialSoundBuffer;
let localSpatialSound;
let localNonSpatialFileBuffer;
let localNonSpatialSoundBuffer;
let localNonSpatialSound;

async function loadSound(url) {
    const response = await fetch(url);
    return response.arrayBuffer();
}

async function loadSoundBuffers() {
    localSpatialFileBuffer = await loadSound('owl.wav');
    playSpatialButton.removeAttribute('disabled');

    localNonSpatialFileBuffer = await loadSound('thunder.wav');
    playNonSpatialButton.removeAttribute('disabled');
}

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
        //localHrtfInput.setPosition(azimuth, distance);
        localHrtfInput.x = position.x + distance * Math.sin(-azimuth);
        localHrtfInput.y = position.y + distance * Math.cos(-azimuth);
        updateRelativePosition(localHrtfInput);

        localSpatialSound.start();
    } else {
        localSpatialSound.stop();
        localSpatialSound.disconnect(localHrtfInput);
        localSpatialSound = null;
    }
}

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


async function load() {
    console.log('load');

    loadSoundBuffers();  // Don't wait for this to complete.

    agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    agoraClient.on('user-published', onUserPublished);
    agoraClient.on('user-unpublished', onUserUnpublished);
}

function unload() {
    console.log('unload');

    if (localNonSpatialSound) {
        playNonSpatial(false);
    }
    if (localSpatialSound) {
        playSpatial(false);
    }
    if (isConnected) {
        leaveChannel()
    }

    agoraClient = null;

    deleteAudioContext();
}

load();
window.addEventListener('beforeunload', unload);
