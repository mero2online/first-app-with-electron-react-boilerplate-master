const {
  BrowserWindow,
  app,
  ipcMain,
  Notification,
  nativeTheme,
} = require('electron');
const path = require('path');
const process = require('child_process');
const isDev = !app.isPackaged;
let win;

function createWindow() {
  win = new BrowserWindow({
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
  return 'Done';
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

ipcMain.handle('run-bat', () => {
  let batPath = path.join(__dirname, 'script.bat');
  let ls = process.spawn(batPath);
  ls.stdout.on('data', (data) => {
    win.webContents.send('fromMain', { loading: 'TRUE' });
    win.webContents.send('fromMain', { runBatStatus: 'Started' });
    const buf = Buffer.from(data, 'utf8').toString();
    console.log(buf);
  });
  ls.stderr.on('data', (data) => {
    const buf = Buffer.from(data, 'utf8').toString();
    console.log(buf);
  });
  ls.on('close', (code) => {
    if (code == 0) {
      console.log('Finished');
      win.webContents.send('fromMain', { runBatStatus: 'Finished' });
      win.webContents.send('fromMain', { loading: 'FALSE' });
    } else {
      console.log('EXIT CODE', code);
      win.webContents.send('fromMain', { runBatStatus: `EXIT CODE ${code}` });
    }
  });
});
