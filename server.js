import express from 'express';
import path from 'path';
import url from 'url';

const app = express();
const port = 8080;

app.use(express.static('tutorial'));

app.get('/', (req, res) => {
    //res.send('Hello World!');
    res.sendFile('index.html');
});

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/vendor/AgoraRTC_N-production.js', (req, res) => {
    res.sendFile(__dirname
        + '/node_modules/agora-rtc-sdk-ng/AgoraRTC_N-production.js');
});
app.get('/vendor/hifi-audio-nodes.mjs', (req, res) => {
    res.sendFile(__dirname
        + '/node_modules/hifi-audio-nodes/dist/hifi-audio-nodes.mjs');
});
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

app.listen(port, () => {
  console.log(`Tutorial listening at: http://localhost:${port}`);
});
