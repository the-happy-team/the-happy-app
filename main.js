const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

const mDEBUG = process.env.DEBUG || false;

const WINDOW_SIZE = {
  BIG: {
    width: (mDEBUG) ? 800 : 300,
    height: 570
  },
  SMALL: {
    width: (mDEBUG) ? 800 : 300,
    height: 300
  }
}

function createWindow () {
    win = new BrowserWindow({
      width: WINDOW_SIZE.BIG.width,
      height: WINDOW_SIZE.BIG.height,
      resizable: (mDEBUG),
      fullScreenable: false,
      webPreferences: {
        nodeIntegration: true
      },
      icon: path.join(__dirname, 'icons', '256x256.png')
    });

    win.setMenu(null);

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'html', 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    if(mDEBUG) win.webContents.openDevTools();

    win.on('closed', () => {
        win = null
    });

    ipcMain.on('minimize-window', (event, arg) => {
        win.setSize(WINDOW_SIZE.SMALL.width, WINDOW_SIZE.SMALL.height, true);
    });
    ipcMain.on('restore-window', (event, arg) => {
        win.setSize(WINDOW_SIZE.BIG.width, WINDOW_SIZE.BIG.height, true);
    });
}

// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

app.on('window-all-closed', () => {
    app.quit();
});

app.on('activate', () => {
    if (win === null) {
      createWindow()
    }
});
