const { app, dialog } = require('electron').remote;
const { createWriteStream, writeFileSync } = require('fs');
const { setOutDir, getUris } = require('../js/ioUtils');
const { detectFace } = require('../js/detect');

const pathResolve = require('path').resolve;
const pathJoin = require('path').join;
const archiver = require('archiver');

window.appRunning = false;
window.photoCounter = 0;
window.feelingsCounter = {};

const snapshotCanvas = document.getElementById('my-snapshot');
const snapshotCanvasCtx = snapshotCanvas.getContext('2d');

const snapshotLbCanvas = document.getElementById('my-snapshot-labeled');
const snapshotLbCanvasCtx = snapshotLbCanvas.getContext('2d');

const snapshotBwCanvas = document.getElementById('my-snapshot-bw');
const snapshotBwCanvasCtx = snapshotBwCanvas.getContext('2d');

const screenshotCanvas = document.getElementById('my-screenshot');
const screenshotCanvasCtx = screenshotCanvas.getContext('2d');

const myCounterDiv = document.getElementById('my-photo-counter');

function resetPhotoCounter() {
  window.photoCounter = 0;
  myCounterDiv.innerHTML = `${(window.photoCounter)} fotos`;
}

function setupCanvases(width, height) {
  snapshotCanvas.width = width;
  snapshotCanvas.height = height;
  snapshotLbCanvas.width = width;
  snapshotLbCanvas.height = height;
  snapshotBwCanvas.width = width;
  snapshotBwCanvas.height = height;
}

function updateCanvases() {
  snapshotCanvasCtx.clearRect(0, 0, snapshotCanvas.width, snapshotCanvas.height);
  snapshotCanvasCtx.drawImage(window.camera, 0, 0);
  snapshotLbCanvasCtx.drawImage(snapshotCanvas, 0, 0);
  snapshotBwCanvasCtx.drawImage(snapshotCanvas, 0, 0);

  // TODO: get screenshot

  const idataSrc = snapshotBwCanvasCtx.getImageData(0, 0, snapshotBwCanvas.width, snapshotBwCanvas.height);
  const dataSrc = idataSrc.data;

  for(let i = 0; i < dataSrc.length; i += 4) {
    const luma = dataSrc[i + 0] * 0.2126 + dataSrc[i + 1] * 0.7152 + dataSrc[i + 2] * 0.0722;
    dataSrc[i + 0] = dataSrc[i + 1] = dataSrc[i + 2] = luma;
  }
  snapshotBwCanvasCtx.putImageData(idataSrc, 0, 0);
}

function clearCanvases() {
  snapshotCanvasCtx.clearRect(0, 0, snapshotCanvas.width, snapshotCanvas.height);
  snapshotLbCanvasCtx.clearRect(0, 0, snapshotLbCanvas.width, snapshotLbCanvas.height);
  snapshotBwCanvasCtx.clearRect(0, 0, snapshotBwCanvas.width, snapshotBwCanvas.height);
}

document.getElementById('my-camera-start-button').addEventListener('click', () => {
  window.appRunning = true;

  resetPhotoCounter();
  setOutDir();
  setTimeout(detectFace, 100);

  // TODO: with delay, redraw page
}, false);
