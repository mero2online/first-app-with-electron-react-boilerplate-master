const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  notificationApi: {
    sendNotification(message) {
      ipcRenderer.send('notify', message);
    },
    sendNotificationTwo(message) {
      return ipcRenderer.invoke('notify-two', message);
    },
  },
  batteryApi: {},
  filesApi: {},
});

ipcRenderer.on('notify-reply', (_, arg) => {
  console.log(arg);
  alert(arg);
});

contextBridge.exposeInMainWorld('darkMode', {
  toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
  system: () => ipcRenderer.invoke('dark-mode:system'),
});

contextBridge.exposeInMainWorld('api', {
  getPath: async (...args) =>
    await ipcRenderer.invoke('get-Path', ...args),
  checkFileExist: async (...args) =>
    await ipcRenderer.invoke('check-file-exist', ...args),
  deleteFile: async (...args) =>
    await ipcRenderer.invoke('delete-file', ...args),
  runScriptFile: async (...args) =>
    await ipcRenderer.invoke('run-script-file', ...args),
  saveScript: async (...args) =>
    await ipcRenderer.invoke('save-script', ...args),
  runCommand: async (...args) =>
    await ipcRenderer.invoke('run-command', ...args),
  receive: (channel, func) => {
    if (channel === 'fromMain') {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});
