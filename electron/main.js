const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.m4v', '.wmv'];
const isDev = !app.isPackaged;

let mainWindow = null;
let pendingFiles = [];

function isVideoFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return videoExtensions.includes(ext);
}

function extractFileArguments(argv) {
  const startIndex = isDev ? 2 : 1;
  const args = argv.slice(startIndex);
  return args
    .filter((arg) => arg && !arg.startsWith('-') && isVideoFile(arg))
    .map((arg) => path.resolve(arg));
}

function buildFileData(filePath) {
  return {
    path: filePath,
    url: pathToFileURL(filePath).href,
    name: path.basename(filePath)
  };
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: !isDev
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
  }

  mainWindow.on('enter-full-screen', () => {
    if (mainWindow) mainWindow.webContents.send('fullscreen-changed', true);
  });

  mainWindow.on('leave-full-screen', () => {
    if (mainWindow) mainWindow.webContents.send('fullscreen-changed', false);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', (event, argv) => {
    const files = extractFileArguments(argv);
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      if (files.length > 0) {
        mainWindow.webContents.send('open-video-file', { files: files.map(buildFileData) });
      }
    }
  });

  app.whenReady().then(() => {
    pendingFiles = extractFileArguments(process.argv);
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });

  ipcMain.handle('get-opened-file', () => {
    if (pendingFiles.length > 0) {
      const data = { files: pendingFiles.map(buildFileData) };
      pendingFiles = [];
      return data;
    }
    return null;
  });

  ipcMain.handle('resolve-video-path', (event, filePath) => {
    if (!filePath || !isVideoFile(filePath)) return null;
    return buildFileData(filePath);
  });

  ipcMain.handle('toggle-fullscreen', () => {
    if (!mainWindow) return false;
    const next = !mainWindow.isFullScreen();
    mainWindow.setFullScreen(next);
    return next;
  });

  ipcMain.on('quit-app', () => {
    app.quit();
  });

  ipcMain.on('minimize-window', () => {
    if (mainWindow) mainWindow.minimize();
  });
}
