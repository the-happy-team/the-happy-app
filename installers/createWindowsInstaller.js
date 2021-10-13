const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
  .then(createWindowsInstaller)
  .catch((error) => {
    console.error(error.message || error)
    process.exit(1)
  })

function getInstallerConfig () {
  console.log('creating windows installer')
  const rootPath = path.join('./')
  const outPath = path.join(rootPath, 'release')

  return Promise.resolve({
    appDirectory: path.join(outPath, 'the-happy-app-win32-ia32/'),
    authors: 'The Happy Team',
    noMsi: true,
    outputDirectory: path.join(outPath, 'the-happy-app-windows-installer'),
    exe: 'the-happy-app.exe',
    setupExe: 'TheHappyAppInstaller.exe',
    setupIcon: path.join(rootPath, 'icons', 'Happy.ico')
  })
}
