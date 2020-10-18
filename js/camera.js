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
  screenshot({
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
  updateScreenshotCanvas();
}

myStartButton.addEventListener('click', () => {
  window.appRunning = true;

  myStartButton.classList.add('hide');
  myStopButton.classList.remove('hide');

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
