const { getAppPath } = require('electron').remote.app;
const faceapi = require('face-api.js');
const path = require('path');
const moment = require('moment');

const CAM = {
  WIDTH: 1280,
  HEIGHT: 720
};

const DELAY = {
  SHORT: 1e3,
  LONG: 10e3
};

const drawOptions = {
  lineWidth: 10,
  boxColor: '#CDF400'
};

const faceapiOptions = new faceapi.SsdMobilenetv1Options({
  minConfidence: 0.6,
  maxResults: 100
});

window.loopID = 0;
window.camera = 0;

faceapi.env.monkeyPatch({
  Canvas: HTMLCanvasElement,
  Image: HTMLImageElement,
  ImageData: ImageData,
  Video: HTMLVideoElement,
  createCanvasElement: () => document.createElement('canvas'),
  createImageElement: () => document.createElement('img')
});

const loadNet = async () => {
  const detectionNet = faceapi.nets.ssdMobilenetv1;
  await detectionNet.load(path.join(getAppPath(), 'assets', 'weights'));
  await faceapi.loadFaceExpressionModel(path.join(getAppPath(), 'assets', 'weights'));
};

const initCamera = async (width, height) => {
  const video = document.getElementById('my-video');
  video.width = width / 3;
  video.height = height / 3;

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: 'user',
      width: width,
      height: height
    }
  });

  video.srcObject = stream;
  video.onloadedmetadata = () => {
    window.camera = video;
  };

  setupCanvases(CAM.WIDTH, CAM.HEIGHT);
  console.log('Camera was initialized');
};

const detectFace = async () => {
  if (!window.appRunning) return;

  await updateCanvases();
  const result = await faceapi.detectSingleFace(window.camera, faceapiOptions).withFaceExpressions();

  if(typeof result !== 'undefined') {
    const faceBox = new faceapi.draw.DrawBox(result.detection.box, drawOptions);
    const mTime = parseInt(moment().format('x'));

    drawBoxOnBwCanvas(faceBox);
    drawFaceOnScreenshot(result);
    updateFeelings(result);

    window.loopID = setTimeout(detectFace, DELAY.LONG);
  } else {
    window.loopID = setTimeout(detectFace, DELAY.SHORT);
  }
};

loadNet().then(() => {
  console.log('Network has loaded');
  initCamera(CAM.WIDTH, CAM.HEIGHT);
});

module.exports = { detectFace };
