const {
  BrowserWindow,
  app,
  ipcMain,
  Notification,
  nativeTheme,
} = require('electron');
const path = require('path');
const process = require('child_process');
const fs = require('fs');

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

ipcMain.handle('check-file-exist', (event, fileName) => {
  let batPath = path.join(__dirname, `src/scripts/${fileName}`);

  if (fs.existsSync(batPath)) {
    console.log('Found file');
    return true;
  } else {
    console.log('Not Found file');
    return false;
  }
});

ipcMain.handle('delete-file', (event, fileName) => {
  let batPath = path.join(__dirname, `src/scripts/${fileName}`);

  fs.unlinkSync(batPath, function (err) {
    if (err) return console.log(err);
    console.log('file deleted successfully');
  });
  return 'deleted';
});

ipcMain.handle('save-script', (event, fileName, data) => {
  let scriptsPath = path.join(__dirname, 'src/scripts/');
  let batPath = path.join(__dirname, `src/scripts/${fileName}`);
  const finalData = data.replaceAll('{CURRENT_PATH}', scriptsPath);
  fs.writeFileSync(batPath, finalData);
  return 'saved';
});

// let batPath = path.join(__dirname, `src/scripts/${batFileName}`);
// `schtasks.exe /run /tn "${batFileName}"`
// `start-process powershell -argument ${batPath} -verb runas`;

ipcMain.handle('run-command', (event, command, shell) => {
  let scriptsPath = path.join(__dirname, 'src/scripts/');
  const finalCommand = command.replaceAll('{CURRENT_PATH}', scriptsPath);
  process.exec(finalCommand, { shell: shell }, (error, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    console.log(error);
  });
  return 'finished';
});

ipcMain.handle('run-script-file', (event, fileName, fileExtension) => {
  let batPath = path.join(__dirname, `src/scripts/${fileName}${fileExtension}`);
  let ls =
    fileExtension === '.ps1'
      ? process.spawn('powershell.exe', [batPath])
      : process.spawn(batPath);

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
