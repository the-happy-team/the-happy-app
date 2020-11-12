const { ipcRenderer } = require('electron');
const { createTransport } = require('nodemailer');

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
  sendEmail(mEmail.value, mMsg.value);
}, false);

myCancelButton.addEventListener('click', () => {
  const mDir = (new URLSearchParams(window.location.search)).get('dir');

  if(!mDir) {
    window.location.replace('sessions.html');
  }

  window.location.replace(`result.html?dir=${mDir}`);
}, false);


function sendEmail(from, msg) {
  const smtpTransport = createTransport({
    host: 'mail.smtp2go.com',
    port: process.env.E_PRT,
    auth: {
      user: process.env.E_USR,
      pass: process.env.E_PSW
    }
  });

  const mailOptions = {
    from: `${process.env.E_USR}@smtp2go.com`,
    to: process.env.E_REC,
    replyTo: `${from}`,
    subject: '[THE-HAPPY-APP] contact',
    text: `${msg}`
  };

  smtpTransport.sendMail(mailOptions, (error, response) => {
    if(error) console.log(error);
    else myCancelButton.click();
  });
}
