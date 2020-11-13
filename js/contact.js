const { ipcRenderer } = require('electron');

const { translate } = require('../js/translate');
const { post } = require('../js/ioUtils');

const mEmail = document.getElementById('my-email');
const mMsg = document.getElementById('my-message');
const mySendButton = document.getElementById('my-send-button');
const myCancelButton = document.getElementById('my-cancel-button');
const myLoader = document.getElementById('my-loader-container');

function checkInputs() {
  if(mEmail.checkValidity() && mMsg.checkValidity()) {
    mySendButton.classList.remove('disable');
  } else {
    mySendButton.classList.add('disable');
  }
}

window.onload = () => {
  ipcRenderer.send('restore-window');
  translate();
  mMsg.addEventListener('keyup', checkInputs);
  mEmail.addEventListener('keyup', checkInputs);
  mEmail.addEventListener('blur', mEmail.reportValidity);
}

mySendButton.addEventListener('click', () => {
  mySendButton.classList.add('sending');
  myCancelButton.classList.add('sending');
  myLoader.classList.add('sending');

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
