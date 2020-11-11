const { ipcRenderer } = require('electron');

const mySendButton = document.getElementById('my-send-button');
const myCancelButton = document.getElementById('my-cancel-button');

window.onload = () => {
  ipcRenderer.send('restore-window');

  const mEmail = document.getElementById('my-email');
  const mMsgDiv = document.getElementById('my-message');

}

mySendButton.addEventListener('click', () => {
  console.log('hi send');
}, false);

myCancelButton.addEventListener('click', () => {
  const mDir = (new URLSearchParams(window.location.search)).get('dir');

  if(!mDir) {
    window.location.replace('sessions.html');
  }

  window.location.replace(`result.html?dir=${mDir}`);
}, false);
