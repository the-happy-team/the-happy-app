const { ipcRenderer } = require('electron');

const { translate, setLanguage } = require('../js/translate');

window.onload = () => {
  ipcRenderer.send('restore-window');
  document.querySelectorAll('[data-language]').forEach(b => {
    b.addEventListener('click', () => {
      setLanguage(b.getAttribute('data-language'));
    }, false);
  });
}
