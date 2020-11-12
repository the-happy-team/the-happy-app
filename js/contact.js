const { ipcRenderer } = require('electron');

const { translate } = require('../js/translate');
const { post } = require('../js/ioUtils');

const mEmail = document.getElementById('my-email');
const mMsg = document.getElementById('my-message');
const mySendButton = document.getElementById('my-send-button');
const myCancelButton = document.getElementById('my-cancel-button');

window.onload = () => {
  ipcRenderer.send('restore-window');
  translate();
}

mySendButton.addEventListener('click', () => {
  mySendButton.classList.add('sending');
  myCancelButton.classList.add('sending');
  // TODO: validate email

  const postData = {
    email: mEmail.value,
    message: mMsg.value
  };

  post(postData, (res) => {
    console.log(res);
    myCancelButton.click();
  });
}, false);

myCancelButton.addEventListener('click', () => {
  const mDir = (new URLSearchParams(window.location.search)).get('dir');

  if(!mDir) {
    window.location.replace('sessions.html');
  }

  window.location.replace(`result.html?dir=${mDir}`);
}, false);
