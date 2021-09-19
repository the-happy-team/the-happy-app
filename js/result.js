const { dialog } = require('electron').remote;
const { getAppPath, getPath } = require('electron').remote.app;
const { ipcRenderer } = require('electron');
const { readFileSync, copyFileSync } = require('fs');

const pathJoin = require('path').join;
const pathResolve = require('path').resolve;
const moment = require('moment');

const { translate, getDateFormatString } = require('../js/translate');
const { saveCanvas } = require('../js/ioUtils');

const myHappyButton = document.getElementById('my-happiest-button');
const mySadButton = document.getElementById('my-saddest-button');
const myContactButton = document.getElementById('my-contact-button');

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x+r, y);
  this.arcTo(x+w, y,   x+w, y+h, r);
  this.arcTo(x+w, y+h, x,   y+h, r);
  this.arcTo(x,   y+h, x,   y,   r);
  this.arcTo(x,   y,   x+w, y,   r);
  this.closePath();
  return this;
}

function getEmotionPercent(e) {
  const feelingsCount = Object.keys(window.feelings.counter).reduce((s, e) => s + window.feelings.counter[e], 0);
  const eCount = window.feelings.values.reduce((s, v) => s + v[`${e}`], 0);
  const ePercent = Math.round((eCount / feelingsCount) * 100) || 0;
  return ePercent;
}

function getTotalTime() {
  const mPhrases = translate();

  const totalTimeSeconds = Math.ceil(window.feelings.duration.length / 10) * 10;
  const totalTimeMinutes = Math.ceil(window.feelings.duration.length / 60);

  const totalTime = (totalTimeSeconds > 59) ? `${totalTimeMinutes} ${mPhrases.minutes}` : `${totalTimeSeconds} ${mPhrases.seconds}`;

  return totalTime;
}

window.onload = () => {
  ipcRenderer.send('restore-window');
  const mDateFormat = getDateFormatString(moment);

  window.mDir = (new URLSearchParams(window.location.search)).get('dir');

  if(!window.mDir) {
    window.location.replace('sessions.html');
  }

  const filePath = pathJoin(getAppPath(), 'feelings', window.mDir, 'feelings.json');
  window.feelings = JSON.parse(readFileSync(filePath, 'utf8'));

  const mDateDiv = document.getElementById('my-result-date');
  const mMsgDiv = document.getElementById('my-result-message');

  const mPhrases = translate();
  const happyPercent = getEmotionPercent('happy');
  const totalTime = getTotalTime();

  mDateDiv.innerHTML = moment(window.mDir, 'YYYYMMDD_HHmmss').format(mDateFormat);
  mMsgDiv.innerHTML = `${mPhrases['in']} ${totalTime} ${mPhrases['you-were']} ${happyPercent}% ${mPhrases.happy}`;

  window.happyImg = new Image();
  window.sadImg = new Image();
  window.logoImg = new Image();

  window.happyImg.src = pathJoin(getAppPath(), 'feelings', window.mDir, `happy.png`);;
  window.sadImg.src = pathJoin(getAppPath(), 'feelings', window.mDir, `sad.png`);;
  window.logoImg.src = '../assets/images/logo.svg';
}

function saveEmotionImage(e) {
  const mTime = window.feelings.max[e].time.slice(0, -3);
  const outFileName = `${e}_${mTime.replace(/:/g, '')}.png`;
  const defaultPath = pathResolve(getPath('desktop'), outFileName);
  const userChosenPath = dialog.showSaveDialogSync({ defaultPath: defaultPath }) || null;
  const inFilePath = pathJoin(getAppPath(), 'feelings', window.mDir, `${e}.png`);

  if(userChosenPath) {
    copyFileSync(inFilePath, userChosenPath);
  }
}

function saveEmotionDashboard(e) {
  const dashboardCanvas = createDashboardCanvas(e);
  const mTime = window.feelings.max[e].time.slice(0, -3);
  const outFileName = `${e}_${mTime.replace(/:/g, '')}.png`;
  const defaultPath = pathResolve(getPath('desktop'), outFileName);
  const userChosenPath = dialog.showSaveDialogSync({ defaultPath: defaultPath }) || null;

  if(userChosenPath) {
    saveCanvas(dashboardCanvas, userChosenPath);
  }
}

function createDashboardCanvas(e) {
  const mPhrases = translate();
  const mDateFormat = getDateFormatString(moment);
  const totalTime = getTotalTime();
  const ePercent = getEmotionPercent(e);

  const mMsg = `${mPhrases['in']} ${totalTime} ${mPhrases['you-were']} ${ePercent}% ${mPhrases[e]}`;

  const mDashMsg = mPhrases[`dash-${e}`];
  const eTime = window.feelings.max[e].time.slice(0, -3);
  const mDate = moment(eTime, 'YYYYMMDD_HHmmss').format(mDateFormat);

  const colorHappy = getComputedStyle(document.documentElement).getPropertyValue('--color-happy');
  const colorText = getComputedStyle(document.documentElement).getPropertyValue('--color-text');
  const colorBgnd = getComputedStyle(document.documentElement).getPropertyValue('--color-bg');
  const bgColor = (e == 'sad') ? colorText : colorHappy;
  const txtColor = (e == 'sad') ? colorBgnd : colorText;

  const mMsgDiv = document.getElementById('my-result-message');
  const mFont = window.getComputedStyle(mMsgDiv).getPropertyValue('font-family');
  const mTextSize = 33;
  const mTextVertStart = 128;
  const mTextFromBottom = 150;

  const oCanvas = document.createElement('canvas');
  const context = oCanvas.getContext('2d');
  oCanvas.width = '1280';
  oCanvas.height = '1280';
  context.fillStyle = bgColor;
  context.fillRect(0, 0, oCanvas.width, oCanvas.height);

  context.font = `${mTextSize}px ${mFont}`;
  context.fillStyle = txtColor;
  context.textAlign = 'center';
  context.fillText(mMsg, oCanvas.width / 2, mTextVertStart);
  context.fillText(mDashMsg, oCanvas.width / 2, mTextVertStart + 1.33 * mTextSize);
  context.fillText(mDate, oCanvas.width / 2, oCanvas.height - mTextFromBottom);

  const mImg = window[`${e}Img`];
  const mImgDrawWidth = 0.97 * oCanvas.width;
  const mImgScaleRatio = mImgDrawWidth / mImg.width;
  const mImgDrawHeight = mImgScaleRatio * mImg.height;
  const mImgX = (oCanvas.width - mImgDrawWidth) / 2;
  const mImgY = (oCanvas.height - mImgDrawHeight) / 2;
  context.drawImage(mImg, mImgX, mImgY, mImgDrawWidth, mImgDrawHeight);

  const logoRectWidth = 70;
  const logoRectFromBottom = 0.6 * logoRectWidth;
  const logoRectX = (oCanvas.width - logoRectWidth) / 2;
  const logoRectY = oCanvas.height - logoRectFromBottom - logoRectWidth;
  const logoRectRadius = .1 * logoRectWidth;
  context.fillStyle = colorHappy;
  context.roundRect(logoRectX, logoRectY,
                    logoRectWidth, logoRectWidth,
                    logoRectRadius).fill();

  const mLogo = window.logoImg;
  const mLogoDrawWidth = 0.47 * logoRectWidth;
  const mLogoScaleRatio = mLogoDrawWidth / mLogo.width;
  const mLogoDrawHeight = mLogoScaleRatio * mLogo.height;
  const mLogoX = logoRectX + (logoRectWidth - mLogoDrawWidth) / 2;
  const mLogoY = logoRectY + (logoRectWidth - mLogoDrawHeight) / 2;
  context.drawImage(mLogo, mLogoX, mLogoY, mLogoDrawWidth, mLogoDrawHeight);

  return oCanvas;
}

myHappyButton.addEventListener('click', () => {
  saveEmotionDashboard('happy');
}, false);

mySadButton.addEventListener('click', () => {
  saveEmotionDashboard('sad');
}, false);

myContactButton.addEventListener('click', () => {
  window.location.replace(`contact.html?dir=${window.mDir}`);
}, false);
