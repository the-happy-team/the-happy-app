const { getAppPath } = require('electron').remote.app;
const { ipcRenderer } = require('electron');
const { existsSync, readdirSync } = require('fs');

const { translate, setLanguage } = require('../js/translate');

const pathJoin = require('path').join;

window.onload = () => {
  ipcRenderer.send('restore-window');
  translate(true);

  document.querySelectorAll('[data-language]').forEach(b => {
    b.addEventListener('click', () => {
      setLanguage(b.getAttribute('data-language'));
    }, false);
  });

  const feelingsPath = pathJoin(getAppPath(), 'feelings');
  const indexButton = document.getElementById('my-index-button-link');

  if((!existsSync(feelingsPath)) ||
     (readdirSync(feelingsPath).filter(fn => !fn.startsWith('.')).length < 1)) {
    indexButton.setAttribute('href', './camera.html');
  }
}
