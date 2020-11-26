const { ipcRenderer } = require('electron');
const { createWriteStream, writeFileSync, unlink } = require('fs');
const { setOutDir, getUris, saveCanvasEmotion, post } = require('../js/ioUtils');
const { detectFace } = require('../js/detect');
const { translate } = require('../js/translate');

const screenshot = require('screenshot-desktop');
const pathResolve = require('path').resolve;
const pathJoin = require('path').join;

const moment = require('moment');

window.appRunning = false;
window.appStartTime = 0;
window.appStopTime = 0;

window.photoCounter = 0;

window.feelings = {
  counter: {},
  min: {},
  max: {},
  values: [],
  duration: {}
};

const snapshotCanvas = document.getElementById('my-snapshot');
const snapshotCanvasCtx = snapshotCanvas.getContext('2d');

const snapshotBwCanvas = document.getElementById('my-snapshot-bw');
const snapshotBwCanvasCtx = snapshotBwCanvas.getContext('2d');

const screenshotCanvas = document.getElementById('my-screenshot');
const screenshotCanvasCtx = screenshotCanvas.getContext('2d');

const appContainer = document.getElementById('my-camera-container');
const myCameraPreview = document.getElementById('my-camera-preview-container');
const myCameraWrapper = document.getElementById('my-camera-wrapper');
const myStartButton = document.getElementById('my-camera-start-button');
const myStopButton = document.getElementById('my-camera-stop-button');
const myLoader = document.getElementById('my-loader-container');
const myText = document.getElementById('my-camera-text');
const myCounter = document.getElementById('my-photo-counter');

function resetPhotoCounter() {
  window.photoCounter = 0;
  myCounter.innerHTML = `${(window.photoCounter)} fotos`;
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

function updateFeelings(detectionResult) {
  myLoader.classList.remove('sending');
  myStopButton.classList.remove('hide');

  const mExpression = Object.keys(detectionResult.expressions).reduce((a, b) => {
    return (detectionResult.expressions[a] > detectionResult.expressions[b]) ? a : b;
  }, -1);

  console.log(mExpression);
  const mDate = moment().format('YYYY-MM-DD_HH:mm:ss');
  const mtime = Math.floor(Date.now() / 1000);

  if(!(mExpression in window.feelings.counter)) {
    window.feelings.counter[mExpression] = 0;
  }
  window.feelings.counter[mExpression] += 1;

  window.feelings.values.push({
    ...detectionResult.expressions,
    time: mtime
  });

  Object.keys(detectionResult.expressions).forEach(e => {
    if(!(e in window.feelings.min)) {
      window.feelings.min[e] = {
        time: mDate,
        value: detectionResult.expressions[e]
      };
    } else if(detectionResult.expressions[e] < window.feelings.min[e].value) {
      window.feelings.min[e] = {
        time: mDate,
        value: detectionResult.expressions[e]
      };
    }

    if(!(e in window.feelings.max)) {
      window.feelings.max[e] = {
        time: mDate,
        value: detectionResult.expressions[e]
      };
    } else if(detectionResult.expressions[e] > window.feelings.max[e].value) {
      window.feelings.max[e] = {
        time: mDate,
        value: detectionResult.expressions[e]
      };
    }
  });

  ['happy', 'sad'].forEach(e => {
    if(window.feelings.max[e].value === detectionResult.expressions[e]) {
      saveCanvasEmotion(screenshotCanvas, e, 'top');
    }

    if(mExpression === e) {
      saveCanvasEmotion(screenshotCanvas, e);
    }
  });
}

window.onload = () => {
  ipcRenderer.send('restore-window');
  translate();
}

myStartButton.addEventListener('click', () => {
  window.appRunning = true;
  window.appStartTime = Math.floor(Date.now() / 1000);

  myStartButton.classList.add('remove');
  setTimeout(() => {
    myStopButton.classList.remove('remove');
    myLoader.classList.add('sending');
  }, 500);

  appContainer.classList.add('running');
  myCameraPreview.classList.add('hide');
  myCameraWrapper.classList.add('grow');
  myText.classList.add('hide');

  resetPhotoCounter();
  setOutDir();
  setTimeout(detectFace, 100);

  ipcRenderer.send('minimize-window');
}, false);

myStopButton.addEventListener('click', () => {
  myStopButton.classList.add('sending');
  myLoader.classList.add('sending');

  window.appRunning = false;
  window.appStopTime = Math.floor(Date.now() / 1000);
  window.feelings.duration = {
    start: window.appStartTime,
    stop: window.appStopTime,
    length: (window.appStopTime - window.appStartTime)
  };

  clearCanvases();
  clearInterval(window.loopID);

  const feelings = JSON.stringify(window.feelings);
  const postData = { feelings };

  writeFileSync(pathJoin(getUris().outDirPath, 'feelings.json'), feelings);
  post(postData, (res) => {
    console.log(res);
    window.location.replace(`result.html?dir=${getUris().outDirName}`);
  });
}, false);
