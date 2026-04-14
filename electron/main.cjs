const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: 'Statistical Grading System',
    icon: path.join(__dirname, '../public/icon.png'),
    backgroundColor: '#0f172a',
    show: false, // Don't show until ready to avoid white flash
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false
    },
    titleBarStyle: 'default',
    frame: true,
  });

  // Remove default menu for cleaner look
  Menu.setApplicationMenu(null);

  if (isDev) {
    const port = process.env.VITE_PORT || 5173;
    win.loadURL(`http://localhost:${port}`);
    // win.webContents.openDevTools({ mode: 'detach' }); // Uncomment for debug
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window only when fully loaded (prevents white flash)
  win.once('ready-to-show', () => {
    win.show();
    win.focus();
  });

  win.on('closed', () => {
    app.quit();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
