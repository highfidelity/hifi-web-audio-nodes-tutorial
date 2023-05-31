// Copies files into the /dist directory such that the tutorial can be run locally.
import fs from 'fs';
import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Copy tutorial files into /dist.
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}
const tutorialFiles = [
    'config.template.js',
    'index.html',
    'owl.wav',
    'thunder.wav',
    'tutorial.js'
];
tutorialFiles.forEach((file) => {
    const src = path.join(__dirname, '../tutorial', file);
    const dest = path.join(__dirname, '..', 'dist', file);
    if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true });
    }
    fs.copyFileSync(src, dest);
});

// Copy vendor files into /dist/vendor.
if (!fs.existsSync('dist/vendor')) {
    fs.mkdirSync('dist/vendor');
}
const vendorFiles = [
    'agora-rtc-sdk-ng/AgoraRTC_N-production.js',
    'hifi-audio-nodes/dist/hifi-audio-nodes.mjs',
    'hifi-audio-nodes/dist/hifi.wasm.js',
    'hifi-audio-nodes/dist/hifi.wasm.simd.js',
    'hifi-audio-nodes/dist/worker.js'
];
vendorFiles.forEach((file) => {
    const src = path.join(__dirname, '../node_modules', file);
    const dest = path.join(__dirname, '..', 'dist/vendor', file.slice(file.lastIndexOf('/')));
    if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true });
    }
    fs.copyFileSync(src, dest);
});
