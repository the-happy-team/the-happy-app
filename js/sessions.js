const { getAppPath } = require('electron').remote.app;
const { ipcRenderer } = require('electron');
const { readdirSync, existsSync } = require('fs');

const pathJoin = require('path').join;
const moment = require('moment');

const { translate } = require('../js/translate');

const myDirectories = document.getElementById('my-sessions');

window.onload = () => {
  ipcRenderer.send('restore-window');
  const feelingsPath = pathJoin(getAppPath(), 'feelings');

  if(!existsSync(feelingsPath)) {
    window.location.replace('index.html');
  }

  const sessions = readdirSync(feelingsPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && existsSync(pathJoin(feelingsPath, dirent.name, 'feelings.json')))
  .map(dirent => (
    {
      name: dirent.name,
      path: pathJoin(feelingsPath, dirent.name),
      date: moment(dirent.name, 'YYYYMMDD_HHmmss').format('MMMM Do YYYY HH:mm')
    })
  );

  if(sessions.length < 1) {
    window.location.replace('camera.html');
  }

  sessions.forEach(s => {
    const mA = document.createElement('a');
    mA.innerHTML = s.date;
    mA.setAttribute('href', `result.html?dir=${s.name}`);
    mA.classList.add('sessions-button');
    mA.classList.add('sessions-session');
    myDirectories.appendChild(mA);
  });

  translate();
}
