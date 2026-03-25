import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 350,
    height: 520, 
    transparent: true,
    frame: false,
    alwaysOnTop: false,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // For simpler integration in this widget
    },
  });

  win.loadURL('http://localhost:5173');
}

// IPC Listeners
ipcMain.on('window-close', () => {
  app.quit();
});

ipcMain.on('window-minimize', () => {
  if (win) win.minimize();
});

ipcMain.on('window-resize', (event, { width, height }) => {
  if (win) win.setSize(width, height, true);
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
