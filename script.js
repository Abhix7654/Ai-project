// Get DOM elements
const videoElement = document.getElementById('videoElement');
const canvasElement = document.getElementById('canvasElement');
const ctx = canvasElement.getContext('2d');
let model;

// Store previous bounding boxes
let previousBoxes = [];
const smoothingFactor = 0.7; // Adjust the smoothing factor as needed (between 0 and 1)

// Function to access the camera
function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            videoElement.srcObject = stream;
        })
        .catch(err => {
            console.error('Error accessing the camera:', err);
        });
}

// Function to load the model
async function loadModel() {
    model = await cocoSsd.load();
    console.log('Model loaded successfully');
}

// Function to detect objects and draw bounding boxes
async function detectObjects() {
    const predictions = await model.detect(videoElement);
    console.log('Predictions:', predictions);
    drawBoxes(predictions);
    requestAnimationFrame(detectObjects);
}

// Function to draw bounding boxes on the canvas
function drawBoxes(predictions) {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    predictions.forEach((prediction, index) => {
        const smoothedBox = smoothBox(prediction.bbox, index);
        ctx.beginPath();
        ctx.rect(...smoothedBox);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'red';
        ctx.fillStyle = 'red';
        ctx.stroke();
        ctx.fillText(`${prediction.class}: ${Math.round(prediction.score * 100)}%`, smoothedBox[0], smoothedBox[1] > 10 ? smoothedBox[1] - 5 : 10);
    });
}

// Function to smooth bounding boxes using a weighted average
function smoothBox(currentBox, index) {
    if (previousBoxes[index]) {
        currentBox[0] = smoothingFactor * previousBoxes[index][0] + (1 - smoothingFactor) * currentBox[0];
        currentBox[1] = smoothingFactor * previousBoxes[index][1] + (1 - smoothingFactor) * currentBox[1];
        currentBox[2] = smoothingFactor * previousBoxes[index][2] + (1 - smoothingFactor) * currentBox[2];
        currentBox[3] = smoothingFactor * previousBoxes[index][3] + (1 - smoothingFactor) * currentBox[3];
    }
    previousBoxes[index] = [...currentBox];
    return currentBox;
}

// Function to start object detection
async function startDetection() {
    await loadModel();
    detectObjects();
}

// Initialize camera and start detection when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    startCamera();
    startDetection().catch(console.error);
});
