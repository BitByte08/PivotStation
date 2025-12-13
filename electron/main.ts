// ... existing imports
import { autoUpdater } from 'electron-updater';
import { ipcMain } from 'electron'; 

// ... existing code

function createWindow() {
  // ... existing window creation code

  // Auto-updater events
  autoUpdater.on('update-available', () => {
    mainWindow?.webContents.send('update-available');
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow?.webContents.send('update-downloaded');
  });

  autoUpdater.on('error', (err) => {
    console.error('Auto-updater error:', err);
  });
  
  // Check for updates once window is ready and not in dev (unless forced)
  mainWindow.once('ready-to-show', () => {
      mainWindow?.show();
      if (!isDev) {
        autoUpdater.checkForUpdatesAndNotify();
      }
  });

  // ... 
}

// IPC handlers for manual check and install
ipcMain.handle('check-for-updates', async () => {
    if (isDev) {
        console.log('Skipping update check in dev mode');
        return null;
    }
    return autoUpdater.checkForUpdates();
});

ipcMain.handle('quit-and-install', () => {
    autoUpdater.quitAndInstall();
});


app.whenReady().then(() => {
    // ...


