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

const util = require('util');
const execProm = util.promisify(process.exec);
const { dialog } = require('electron');

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
      enableRemoteModule: true,
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
    ignored: path.join(__dirname, 'src', 'scripts'),
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

ipcMain.handle('get-Path', async() => {
  const path = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  console.log(path);
  return path;
});

ipcMain.handle('check-file-exist', async (event, fileName) => {
  let batPath = path.join(__dirname, `src/scripts/${fileName}`);

  if (fs.existsSync(batPath)) {
    console.log('Found file');
    return true;
  } else {
    console.log('Not Found file');
    return false;
  }
});

ipcMain.handle('delete-file', async (event, fileName) => {
  console.log('delete-file');
  let batPath = path.join(__dirname, `src/scripts/${fileName}`);

  await fs.promises.unlink(batPath, async (err) => {
    if (err) return console.log(err);
    console.log('file deleted successfully');
  });
  return 'deleted';
});

ipcMain.handle('save-script', async (event, fileName, data) => {
  console.log('Save-script');
  let scriptsPath = path.join(__dirname, 'src/scripts/');
  let batPath = path.join(__dirname, `src/scripts/${fileName}`);
  const finalData = data.replaceAll('{CURRENT_PATH}', scriptsPath);
  await fs.promises.writeFile(batPath, finalData);
  return 'saved';
});

// let batPath = path.join(__dirname, `src/scripts/${batFileName}`);
// `schtasks.exe /run /tn "${batFileName}"`
// `start-process powershell -argument ${batPath} -verb runas`;

ipcMain.handle('run-command', async (event, command, shell) => {
  let scriptsPath = path.join(__dirname, 'src/scripts/');
  const finalCommand = command.replaceAll('{CURRENT_PATH}', scriptsPath);

  let result;
  try {
    result = await execProm(finalCommand, { shell: shell });
  } catch (err) {
    result = err;
  }

  return result;
});

ipcMain.handle('run-script-file', async (event, fileName, fileExtension) => {
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
    win.webContents.send('fromMain', { runBatStatus: `ERROR ${buf}` });
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
