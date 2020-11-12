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
  mySendButton.classList.add('sending');
  myCancelButton.classList.add('sending');
  // TODO: validate email
  postMessage({
    email: mEmail.value,
    message: mMsg.value
  });
}, false);

myCancelButton.addEventListener('click', () => {
  const mDir = (new URLSearchParams(window.location.search)).get('dir');

  if(!mDir) {
    window.location.replace('sessions.html');
  }

  window.location.replace(`result.html?dir=${mDir}`);
}, false);

function postMessage(data) {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://the-happy-app-api.herokuapp.com/message', true);
  //xhr.open('POST', 'http://localhost:5005/message', true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onreadystatechange = () => {
    if(xhr.readyState == 4 && xhr.status == 200) {
      console.log(xhr.responseText);
      myCancelButton.click();
    }
  }
  xhr.send(JSON.stringify(data));
}
