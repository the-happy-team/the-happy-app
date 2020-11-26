const { dialog } = require('electron').remote;
const { getAppPath, getPath } = require('electron').remote.app;
const { ipcRenderer } = require('electron');
const { readFileSync, copyFileSync } = require('fs');

const pathJoin = require('path').join;
const pathResolve = require('path').resolve;
const moment = require('moment');

const { translate, getDateFormatString } = require('../js/translate');

const myHappyButton = document.getElementById('my-happiest-button');
const mySadButton = document.getElementById('my-saddest-button');
const myContactButton = document.getElementById('my-contact-button');

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

  const feelingsCount = Object.keys(window.feelings.counter).reduce((s, e) => s + window.feelings.counter[e], 0);
  const happyCount = window.feelings.values.reduce((s, e) => s + e.happy, 0);
  const happyPercent = Math.round((happyCount / feelingsCount) * 100) || 0;

  const totalTimeSeconds = Math.ceil(window.feelings.duration.length / 10) * 10;
  const totalTimeMinutes = Math.ceil(window.feelings.duration.length / 60);

  const mPhrases = translate();
  const totalTime = (totalTimeSeconds > 59) ? `${totalTimeMinutes} ${mPhrases.minutes}` : `${totalTimeSeconds} ${mPhrases.seconds}`;

  mDateDiv.innerHTML = moment(window.mDir, 'YYYYMMDD_HHmmss').format(mDateFormat);
  mMsgDiv.innerHTML = `${mPhrases.in} ${totalTime} ${mPhrases['you-were']} ${happyPercent}% ${mPhrases.happy}`;
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

myHappyButton.addEventListener('click', () => {
  saveEmotionImage('happy');
}, false);

mySadButton.addEventListener('click', () => {
  saveEmotionImage('sad');
}, false);

myContactButton.addEventListener('click', () => {
  window.location.replace(`contact.html?dir=${window.mDir}`);
}, false);
