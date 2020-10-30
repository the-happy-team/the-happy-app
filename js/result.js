const { getAppPath } = require('electron').remote.app;
const { ipcRenderer } = require('electron');
const { readFileSync } = require('fs');
const pathJoin = require('path').join;

window.onload = () => {
  ipcRenderer.send('restore-window');

  const mDir = (new URLSearchParams(window.location.search)).get('dir');

  if (mDir) {
    const filePath = pathJoin(getAppPath(), mDir, 'feelings.json');
    window.feelings = JSON.parse(readFileSync(filePath, 'utf8'));
  }
}
