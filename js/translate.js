const { getAppPath } = require('electron').remote.app;
const { readFileSync } = require('fs');
const pathJoin = require('path').join;

function setLanguage(lang) {
  const filePath = pathJoin(getAppPath(), 'assets', 'locales', `${lang}.json`);
  const mPhrases = readFileSync(filePath, 'utf8');
  localStorage.setItem('language', lang);
  localStorage.setItem('phrases', mPhrases);
  translate();
}

function translate(force = false) {
  if((localStorage.getItem('language') === null) || (localStorage.getItem('phrases') === null) || force) {
    setLanguage(localStorage.getItem('language') || 'en');
  } else {
    const mPhrases = JSON.parse(localStorage.getItem('phrases'));
    document.querySelectorAll('[data-phrase]').forEach(e => {
      e.innerHTML = mPhrases[e.getAttribute('data-phrase')];
    });
  }
  return JSON.parse(localStorage.getItem('phrases'));
}

function getDateFormatString(momemnt) {
  if((localStorage.getItem('language') === null) || (localStorage.getItem('phrases') === null)) {
    setLanguage(localStorage.getItem('language') || 'en');
  }
  const mLanguage = localStorage.getItem('language');
  moment.locale(mLanguage);

  if(mLanguage === 'pt') {
    return 'D [de] MMMM, YYYY – h:mm A';
  } else {
    return 'MMMM Do, YYYY – h:mm A';
  }
}

module.exports = {
  setLanguage,
  getDateFormatString,
  translate
};
