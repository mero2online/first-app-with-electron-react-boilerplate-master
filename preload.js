const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  notificationApi: {
    sendNotification(message) {
      ipcRenderer.send('notify', message);
    },
    sendNotificationTwo(message) {
     return ipcRenderer.invoke('notify-two', message);
    }
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
