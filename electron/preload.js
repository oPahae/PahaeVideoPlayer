const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getOpenedFile: () => ipcRenderer.invoke('get-opened-file'),
  resolveVideoPath: (filePath) => ipcRenderer.invoke('resolve-video-path', filePath),
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  quitApp: () => ipcRenderer.send('quit-app'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  onOpenVideoFile: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on('open-video-file', listener);
    return () => ipcRenderer.removeListener('open-video-file', listener);
  },
  onFullscreenChanged: (callback) => {
    const listener = (event, value) => callback(value);
    ipcRenderer.on('fullscreen-changed', listener);
    return () => ipcRenderer.removeListener('fullscreen-changed', listener);
  }
});
