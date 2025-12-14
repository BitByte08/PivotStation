// Preload script for Electron
// This runs in renderer context with access to Node.js APIs

import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any IPC functions here as needed
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
});

// Expose IPC methods for update checking and installation
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    on: (channel: string, callback: (...args: any[]) => void) => {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    },
    invoke: (channel: string, ...args: any[]) => {
      return ipcRenderer.invoke(channel, ...args);
    },
  },
});
