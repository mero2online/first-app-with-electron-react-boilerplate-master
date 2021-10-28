const {
  BrowserWindow,
  app,
  ipcMain,
  Notification,
  nativeTheme,
} = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: 'white',
    webPreferences: {
      nodeIntegration: false,
      worldSafeExecuteJavaScript: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'src/media/app.ico'),
  });

  win.loadFile('index.html');
  if (isDev) {
    win.webContents.openDevTools();
  }
}

if (isDev) {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
  });
}

app.whenReady().then(createWindow);

ipcMain.on('notify', (event, message) => {
  new Notification({ title: 'Notification', body: message }).show();
  event.reply('notify-reply', 'reply-from-notify');
});

ipcMain.handle('notify-two', (event, message) => {
  new Notification({ title: 'Notification', body: message }).show();
  return 'done';
});

ipcMain.handle('dark-mode:toggle', () => {
  if (nativeTheme.shouldUseDarkColors) {
    nativeTheme.themeSource = 'light';
  } else {
    nativeTheme.themeSource = 'dark';
  }
  return nativeTheme.shouldUseDarkColors;
});

ipcMain.handle('dark-mode:system', () => {
  nativeTheme.themeSource = 'system';
});
