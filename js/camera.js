const { app, dialog } = require('electron').remote;
const { createWriteStream, writeFileSync, unlink } = require('fs');
const { setOutDir, getUris } = require('../js/ioUtils');
const { detectFace } = require('../js/detect');

const screenshot = require('screenshot-desktop');
const pathResolve = require('path').resolve;
const pathJoin = require('path').join;
const archiver = require('archiver');

window.appRunning = false;
window.photoCounter = 0;
window.feelingsCounter = {};

const snapshotCanvas = document.getElementById('my-snapshot');
const snapshotCanvasCtx = snapshotCanvas.getContext('2d');

const snapshotBwCanvas = document.getElementById('my-snapshot-bw');
const snapshotBwCanvasCtx = snapshotBwCanvas.getContext('2d');

const screenshotCanvas = document.getElementById('my-screenshot');
const screenshotCanvasCtx = screenshotCanvas.getContext('2d');

const myCameraPreview = document.getElementById('my-camera-preview-container');
const myStartButton = document.getElementById('my-camera-start-button');
const myStopButton = document.getElementById('my-camera-stop-button')
const myCounterDiv = document.getElementById('my-photo-counter');

function resetPhotoCounter() {
  window.photoCounter = 0;
  myCounterDiv.innerHTML = `${(window.photoCounter)} fotos`;
}

function setupCanvases(width, height) {
  snapshotCanvas.width = width;
  snapshotCanvas.height = height;
  snapshotBwCanvas.width = width;
  snapshotBwCanvas.height = height;
}

function clearCanvases() {
  snapshotCanvasCtx.clearRect(0, 0, snapshotCanvas.width, snapshotCanvas.height);
  snapshotBwCanvasCtx.clearRect(0, 0, snapshotBwCanvas.width, snapshotBwCanvas.height);
  screenshotCanvasCtx.clearRect(0, 0, screenshotCanvas.width, screenshotCanvas.height);
}

function updateScreenshotCanvas() {
  return screenshot({
    format: 'png',
    filename: `${getUris().outFilePath}_tmp_screenshot.png`
  }).then((imgPath) => {
    const mSreenShot = new Image();
    mSreenShot.onload = () => {
      screenshotCanvas.width = mSreenShot.width / 2;
      screenshotCanvas.height = mSreenShot.height / 2;
      screenshotCanvasCtx.drawImage(mSreenShot, 0, 0, screenshotCanvas.width, screenshotCanvas.height);
      unlink(imgPath, () => {});
    };
    mSreenShot.src = imgPath;
  });
}

function updateBwCanvas() {
  const idataSrc = snapshotCanvasCtx.getImageData(0, 0, snapshotCanvas.width, snapshotCanvas.height);
  const dataSrc = idataSrc.data;

  for(let i = 0; i < dataSrc.length; i += 4) {
    const luma = dataSrc[i + 0] * 0.2126 + dataSrc[i + 1] * 0.7152 + dataSrc[i + 2] * 0.0722;
    dataSrc[i + 0] = dataSrc[i + 1] = dataSrc[i + 2] = luma;
  }
  snapshotBwCanvasCtx.putImageData(idataSrc, 0, 0);
}

function updateCanvases() {
  clearCanvases();
  snapshotCanvasCtx.drawImage(window.camera, 0, 0);
  updateBwCanvas();
  return updateScreenshotCanvas();
}

function drawBoxOnBwCanvas(faceBox) {
  faceBox.draw(snapshotBwCanvas);
}

function drawFaceOnScreenshot(detectionResult) {
  const mbox = detectionResult.detection.box;
  const padding = 0.5 * mbox.width;
  const dims = {
    src: {},
    dst: {}
  };

  dims.src.x = mbox.x - padding;
  dims.src.y = mbox.y - padding;
  dims.src.width = mbox.width + 2 * padding;
  dims.src.height = mbox.height + 2 * padding;

  dims.dst.width = Math.min(dims.src.width, 0.2 * screenshotCanvas.width);
  dims.dst.height = dims.dst.width * dims.src.height / dims.src.width;
  dims.dst.x = 0.5 * (screenshotCanvas.width - dims.dst.width);
  dims.dst.y = 0.5 * (screenshotCanvas.height - dims.dst.height);

  screenshotCanvasCtx.drawImage(snapshotBwCanvas, dims.src.x, dims.src.y, dims.src.width, dims.src.height,
                                dims.dst.x, dims.dst.y, dims.dst.width, dims.dst.height);
}

myStartButton.addEventListener('click', () => {
  window.appRunning = true;

  myStartButton.classList.add('hide');
  myStopButton.classList.remove('hide');

  screenshotCanvas.classList.remove('hide');
  screenshotCanvas.classList.add('show');

  myCameraPreview.classList.add('hide');

  resetPhotoCounter();
  setOutDir();
  setTimeout(detectFace, 100);

  // TODO: with delay, redraw page
}, false);


myStopButton.addEventListener('click', () => {
  window.appRunning = false;
  clearCanvases();
  clearInterval(window.loopID);
  // TODO: with delay, go to next page
}, false);
