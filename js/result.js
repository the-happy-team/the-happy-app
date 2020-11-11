const { getAppPath } = require('electron').remote.app;
const { ipcRenderer } = require('electron');
const { readFileSync } = require('fs');

const pathJoin = require('path').join;
const moment = require('moment');

const myHappyButton = document.getElementById('my-happiest-button');
const mySadButton = document.getElementById('my-saddest-button');
const myContactButton = document.getElementById('my-contact-button');

window.onload = () => {
  ipcRenderer.send('restore-window');

  const mDir = (new URLSearchParams(window.location.search)).get('dir');

  if(!mDir) {
    window.location.replace('sessions.html');
  }

  const filePath = pathJoin(getAppPath(), 'feelings', mDir, 'feelings.json');
  window.feelings = JSON.parse(readFileSync(filePath, 'utf8'));

  const mDateDiv = document.getElementById('my-result-date');
  const mMsgDiv = document.getElementById('my-result-message');

  const feelingsCount = Object.keys(window.feelings.counter).reduce((s, e) => s + window.feelings.counter[e], 0);
  const happyCount = window.feelings.values.reduce((s, e) => s + e.happy, 0);
  const happyPercent = Math.round((happyCount / feelingsCount) * 100) || 0;

  const totalTimeSeconds = Math.ceil(window.feelings.duration.length / 10) * 10;
  const totalTimeMinutes = Math.ceil(window.feelings.duration.length / 60);
  const totalTime = (totalTimeSeconds > 59) ? `${totalTimeMinutes} minutes` : `${totalTimeSeconds} seconds`;

  mDateDiv.innerHTML = moment(mDir, 'YYYYMMDD_HHmmss').format('MMM Do, YYYY, HH:mm');
  mMsgDiv.innerHTML = `In ${totalTime} you were ${happyPercent}% happy`;
}


myHappyButton.addEventListener('click', () => {
  console.log('hi happy');
}, false);

mySadButton.addEventListener('click', () => {
  console.log('hi sad');
}, false);

myContactButton.addEventListener('click', () => {
  const mDir = (new URLSearchParams(window.location.search)).get('dir');

  if(!mDir) {
    window.location.replace('sessions.html');
  }
  window.location.replace(`contact.html?dir=${mDir}`);
}, false);
