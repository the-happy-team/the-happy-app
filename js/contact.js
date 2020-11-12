const { ipcRenderer } = require('electron');

const { translate } = require('../js/translate');

const mEmail = document.getElementById('my-email');
const mMsg = document.getElementById('my-message');
const mySendButton = document.getElementById('my-send-button');
const myCancelButton = document.getElementById('my-cancel-button');

window.onload = () => {
  ipcRenderer.send('restore-window');
  translate();
}

mySendButton.addEventListener('click', () => {
  console.log(mEmail.value + ' ' + mMsg.value);
  mySendButton.classList.add('sending');
  myCancelButton.classList.add('sending');
  setTimeout(() => myCancelButton.click(), 1000);
}, false);

myCancelButton.addEventListener('click', () => {
  const mDir = (new URLSearchParams(window.location.search)).get('dir');

  if(!mDir) {
    window.location.replace('sessions.html');
  }

  window.location.replace(`result.html?dir=${mDir}`);
}, false);
