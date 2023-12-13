//NEW-3: 
//1. detects objects, detects depth, detects captions. 
//2. whenever it detects a person, it plays footsteps.
//3. detection limit= 5. 
//it tries to find the most similar sound to both object detection+caption.
//I think this is the most accurate version of our caption detection code. I added an additional "general caption detection" that looks at the whole image, in addition to the cropped frame captions.



import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.9.0';
import soundMap from './SoundMap.js'; 


env.allowLocalModels = false;


const status = document.getElementById('status');
const fileUpload = document.getElementById('file-upload');
const imageContainer = document.getElementById('image-container');
const buttonsContainer = document.createElement('div'); 
document.body.appendChild(buttonsContainer);


status.textContent = 'Loading models...';
const detectionModel = await pipeline('object-detection', 'Xenova/detr-resnet-50');
const depthModel = await pipeline('depth-estimation', 'Xenova/dpt-hybrid-midas');
const imageCaptioningModel = await pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning');
const featureExtractor = await pipeline('feature-extraction', 'Xenova/gte-small');


status.textContent = 'Ready';

//this function is necessary for finding the similarity
function cos_sim(a, b) {
    let dotproduct = 0;
    let mA = 0;
    let mB = 0;
    for (let i = 0; i < a.length; i++) {
        dotproduct += (a[i] * b[i]);
        mA += (a[i] * a[i]);
        mB += (b[i] * b[i]);
    }
    mA = Math.sqrt(mA);
    mB = Math.sqrt(mB);
    return (dotproduct) / ((mA) * (mB));
}

const normalizedSoundNames = Object.keys(soundMap).map(soundName => soundName.replace(/[_-]/g, ' '));

// Create a reverse map from normalized names to original names
const reverseSoundMap = {};
normalizedSoundNames.forEach((normalized, index) => {
    reverseSoundMap[normalized] = Object.keys(soundMap)[index];
});


function preprocessText(text) {
    return text.replace(/[_-]/g, ' ').toLowerCase(); 
}


async function findMostSimilarSound(caption,label) {
    let highestScore = -1; // or maybe -Infinity for initial lowest score
    let mostSimilarSound = null;



    // Preprocess caption 
    const processedCaption = preprocessText(caption);
    const processedLabel = preprocessText(label);

    const captionFeatures = await featureExtractor([processedCaption], { pooling: 'mean', normalize: true });
    const labelFeatures = await featureExtractor([processedLabel], { pooling : 'mean', normalize: false });


    for (const soundName of normalizedSoundNames) {
        // Preprocess sound name
        const processedSoundName = preprocessText(soundName);
        

        try {
            const soundNameFeatures = await featureExtractor([processedSoundName], { pooling: 'mean', normalize: false });
            const score = cos_sim(captionFeatures[0].data, soundNameFeatures[0].data);
            const scoreCaption = cos_sim(captionFeatures[0].data, soundNameFeatures[0].data);
            const scoreLabel = cos_sim(labelFeatures[0].data, soundNameFeatures[0].data);
            //this step was confusing.
            const combinedScore = (scoreCaption * 0.01 + scoreLabel * 0.99);
            //const combinedScore = Math.min(scoreCaption, scoreLabel);

            if (combinedScore > highestScore) {
                highestScore = combinedScore;
                mostSimilarSound = soundName;
            }
        } catch (error) {
            console.error(`Error processing sound: ${soundName}`, error);
        }
    }

    mostSimilarSound = reverseSoundMap[mostSimilarSound] || mostSimilarSound;

    return mostSimilarSound;
}


let allSoundKeys = [];

// Function to create and display sound buttons
function createSoundButton(soundName) {

    const soundKey = soundName.replace(/ /g, '_');
    allSoundKeys.push(soundKey);

    const button = document.createElement('button');
    button.textContent = soundName;
    button.onclick = () => playSound(soundName.replace(/ /g, '_'));
    buttonsContainer.appendChild(button);

    button.className = 'control-button';
    buttonsContainer.appendChild(button);
}

// //playing all sounds sequentially
// async function playAllSounds() {
//     for (const soundKey of allSoundKeys) {
//         await playSound(soundKey);
//     }
// }


// // Function to play a sound
// function playSound(soundKey) {
//     const audio = new Audio(soundMap[gf4soundKey]);
//     audio.play();
//     console.log(`Playing Sound: ${soundKey}`);
// }

function playSound(soundKey) {
    return new Promise(resolve => {
        const audio = new Audio(soundMap[soundKey]);
        audio.play();
        console.log(`Playing Sound: ${soundKey}`);
        audio.onended = resolve; 
    });
}

function playAllSounds() {
    allSoundKeys.forEach(soundKey => {
        const audio = new Audio(soundMap[soundKey]);
        audio.play();
    })
}

document.getElementById('play-all').addEventListener('click', playAllSounds);

const footstepsSoundKey = 'footsteps'

fileUpload.addEventListener('change', async function (e) {
    try {
        let results = new Map();
        const file = e.target.files[0];
        if (!file) {
            return;
        }

        buttonsContainer.innerHTML = ''
        imageContainer.innerHTML = '';

        const reader = new FileReader();


        reader.onload = async function (e2) {
            try {
                const image = new Image();
                image.src = e2.target.result;

                image.onload = async function () {
                    imageContainer.appendChild(image);
                    image.style.position = 'relative';

                    const generalCaptionResponse = await imageCaptioningModel(image.src);
                    const generalCaption = generalCaptionResponse[0].generated_text || 'No caption available';
                    console.log('General Caption:', generalCaption);
                    
                    // Find the most similar sound for the general caption
                    let generalSound = await findMostSimilarSound(generalCaption, "");

                    generalSound = reverseSoundMap[generalSound] || generalSound;

                    if (generalSound && !allSoundKeys.includes(generalSound)) {
                        createSoundButton(generalSound);
                        allSoundKeys.push(generalSound);
                    }                    

                    // Object detection
                    status.textContent = 'Detecting objects...';
                    const objects = await detectionModel(image.src, { threshold: 0.5, percentage: true });
                    console.log('Object Detection Complete:', objects);

                    // Depth estimation
                    status.textContent = 'Estimating depth...';
                    const depthData = await depthModel(image.src);
                    console.log('Depth Estimation Complete:', depthData);

                    const maxObjects = 5;
                    const selectedSounds = new Set(); // Track the sounds that have been selected
                    let objectCount = 0;

                    // Process each detected object, ensuring unique sounds
                    status.textContent = 'Analyzing...';

                    let personDetected = false;

                    for (let i = 0; i < objects.length && objectCount < maxObjects; i++) {
                        const { box, label } = objects[i];

                        if (label.toLowerCase().includes('person')){
                            personDetected = true;
                        }

                        // Calculate x, y, z coordinates for logging
                        const { xmax, xmin, ymax, ymin } = box;
                        const x = (xmin + xmax) / 2;
                        const y = (ymin + ymax) / 2;
                        const z = calculateZ(depthData.depth, box);

                        // Call image captioning model for this bounding box
                        const croppedImage = cropImage(image, box);
                        const captionResponse = await imageCaptioningModel(croppedImage);
                        const captionText = captionResponse[0].generated_text || 'No caption available';

                        const mostSimilarSound = await findMostSimilarSound(captionText, label);

                        // Log x, y, z coordinates and caption text to the console
                        // console.log(`Object ${i + 1}: X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}, Z: ${z}, Sound: ${mostSimilarSound}`);
                        let result = new Map();
                        result.set('x', x.toFixed(2));
                        result.set('y', y.toFixed(2));
                        result.set('z', z);
                        result.set('sound', mostSimilarSound);
                        // let result = "X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}, Z: ${z}, Sound: ${mostSimilarSound}";
                        results.set(i, result)
                        console.log(result);
                        // Check if the sound is unique and create a button if it is
                        if (!selectedSounds.has(mostSimilarSound)) {
                            createSoundButton(mostSimilarSound);
                            selectedSounds.add(mostSimilarSound);
                            objectCount++;
                        }

                        if (personDetected && !allSoundKeys.includes(footstepsSoundKey)) {
                            allSoundKeys.push(footstepsSoundKey);
                            createSoundButton('footsteps');
                        }
                    }

                    reader.readAsDataURL(file);
                };
            } catch (err) {
                console.error('Error in processing:', err);
                status.textContent = 'Error in processing.';
            }
        };
    } catch (err) {
        console.error('Error on file upload:', err);
        status.textContent = 'Error on file upload.';
    }
});


//function to crop an image based on the bounding box
function cropImage(image, box) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = Math.round((box.xmax - box.xmin) * image.width);
    const height = Math.round((box.ymax - box.ymin) * image.height);
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(
        image,
        Math.round(box.xmin * image.width),
        Math.round(box.ymin * image.height),
        width,
        height,
        0,
        0,
        width,
        height
    );
    return canvas.toDataURL();
}

// Function to calculate z (depth) based on depth estimation
function calculateZ(depthData, box) {
    if (!depthData || !box) {
        return '0.72';
    }

    const xCenter = (box.xmin + box.xmax) / 2;
    const yCenter = (box.ymin + box.ymax) / 2;

    const xPixel = Math.round(xCenter * depthData.width);
    const yPixel = Math.round(yCenter * depthData.height);

    if (
        isNaN(xCenter) ||
        isNaN(yCenter) ||
        xPixel < 0 ||
        xPixel >= depthData.width ||
        yPixel < 0 ||
        yPixel >= depthData.height
    ) {
        return '0.72';
    }

    const zValue = depthData.data[yPixel * depthData.width + xPixel];

    if (isNaN(zValue)) {
        return '0.72';
    }


    // Example: Normalize to [0, 1]
    const minDepth = 0;
    const maxDepth = 255;
    const normalizedZ = (zValue - minDepth) / (maxDepth - minDepth);

    return normalizedZ.toFixed(2);
}



