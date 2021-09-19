const { getAppPath } = require('electron').remote.app;
const { writeFile, mkdirSync } = require('fs');

const pathJoin = require('path').join;
const moment = require('moment');

const mDate = moment().format('YYYY-MM-DD');
const outInfo = {};

function setOutDir() {
  outInfo.outDirName = mDate + '_' + moment().format('HHmmss');
  outInfo.outDirPath = pathJoin(getAppPath(), 'feelings', outInfo.outDirName);
  mkdirSync(pathJoin(outInfo.outDirPath, 'happy'), { recursive: true });
  mkdirSync(pathJoin(outInfo.outDirPath, 'sad'), { recursive: true });
}

function getUris(emotion) {
  emotion = emotion || '';
  outInfo.outFileName = moment().format('YYYYMMDD_HHmmss');
  outInfo.outFilePath = pathJoin(outInfo.outDirPath, emotion, outInfo.outFileName);
  return outInfo;
}

function processBase64Image(dataString) {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  } else {
    return {
      type: matches[1],
      data: new Buffer(matches[2], 'base64')
    };
  }
}

function saveCanvas(canvas, outFile) {
  const imageBuffer = processBase64Image(canvas.toDataURL('image/png'));
  writeFile(outFile, imageBuffer.data, 'binary', (err) => {
    if(err) console.log(err);
  });
}

function saveCanvasEmotion(canvas, emotion, top) {
  const outFile = top ? pathJoin(getUris().outDirPath, `${emotion}.png`) : `${getUris(emotion).outFilePath}.png`;
  saveCanvas(canvas, outFile);
}

function post(data, cb) {
  const endpoint = data.hasOwnProperty('feelings') ? 'feelings' : 'message';

  //const url = `http://localhost:5005/${endpoint}`;
  const url = `https://the-happy-app-api.herokuapp.com/${endpoint}`;
  const xhr = new XMLHttpRequest();

  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = () => {
    if(xhr.readyState == 4 && xhr.status == 200) {
      if(cb) cb(xhr.responseText);
    }
  }
  xhr.send(JSON.stringify(data));
}

module.exports = {
  setOutDir,
  getUris,
  saveCanvas,
  saveCanvasEmotion,
  post
};
