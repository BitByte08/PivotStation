import { app, BrowserWindow, session, protocol, globalShortcut } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Register custom protocol for serving static files
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  });

  // Set COOP/COEP headers for SharedArrayBuffer (required for ffmpeg.wasm)
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Cross-Origin-Opener-Policy': ['same-origin'],
        'Cross-Origin-Embedder-Policy': ['require-corp'],
      },
    });
  });

  if (isDev) {
    // In development, load from Next.js dev server
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, use custom protocol
    mainWindow.loadURL('app://./index.html');
  }

  // Register keyboard shortcuts for DevTools
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // F12 to toggle DevTools
    if (input.key === 'F12') {
      if (mainWindow?.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else {
        mainWindow?.webContents.openDevTools();
      }
    }
    // Ctrl+Shift+I (Windows/Linux) or Cmd+Option+I (Mac) to toggle DevTools
    if ((input.control || input.meta) && input.shift && input.key.toLowerCase() === 'i') {
      event.preventDefault();
      if (mainWindow?.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else {
        mainWindow?.webContents.openDevTools();
      }
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Register global shortcuts for DevTools (works even when window is not focused)
  globalShortcut.register('F12', () => {
    if (mainWindow) {
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else {
        mainWindow.webContents.openDevTools();
      }
    }
  });

  // Register custom protocol handler for production
  if (!isDev) {
    protocol.handle('app', async (request) => {
      const url = new URL(request.url);
      let filePath = url.pathname;
      
      console.log('[Protocol] Request URL:', request.url);
      console.log('[Protocol] Initial filePath:', filePath);
      
      // Remove leading slash on Windows
      if (filePath.startsWith('/')) {
        filePath = filePath.slice(1);
      }
      
      // Remove './' prefix if present
      if (filePath.startsWith('./')) {
        filePath = filePath.slice(2);
      }
      
      // Handle root path
      if (filePath === '' || filePath === '.') {
        filePath = 'index.html';
      }
      
      // Handle trailing slash for directory navigation (Next.js trailingSlash: true)
      // Remove trailing slash for path processing, we'll add index.html if it's a directory
      const hasTrailingSlash = filePath.endsWith('/');
      if (hasTrailingSlash && filePath !== '/') {
        filePath = filePath.slice(0, -1);
      }
      
      // Construct full path to the file in the out directory  
      const outDir = path.join(__dirname, '..', 'out');
      let fullPath = path.join(outDir, filePath);
      
      console.log('[Protocol] After normalization filePath:', filePath);
      console.log('[Protocol] Initial fullPath:', fullPath);
      
      // Check if path exists
      if (fs.existsSync(fullPath)) {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          // If it's a directory, look for index.html inside
          fullPath = path.join(fullPath, 'index.html');
        }
      } else {
        // File doesn't exist, try alternatives
        // 1. Try with .html extension
        if (!filePath.includes('.') && fs.existsSync(`${fullPath}.html`)) {
          fullPath = `${fullPath}.html`;
        }
        // 2. Try index.html in subdirectory (for trailing slash routes)
        else if (fs.existsSync(path.join(fullPath, 'index.html'))) {
          fullPath = path.join(fullPath, 'index.html');
        }
        // 3. Fallback to 404
        else if (!fs.existsSync(fullPath)) {
          fullPath = path.join(outDir, '404', 'index.html');
          if (!fs.existsSync(fullPath)) {
            fullPath = path.join(outDir, '404.html');
          }
        }
      }
      
      console.log('[Protocol] Final fullPath:', fullPath);
      console.log('[Protocol] File exists:', fs.existsSync(fullPath));
      
      // Read file and create response with COOP/COEP headers
      try {
        if (!fs.existsSync(fullPath)) {
          console.error('[Protocol] File not found:', fullPath);
          return new Response('Not Found', { 
            status: 404,
            headers: {
              'Content-Type': 'text/plain',
              'Cross-Origin-Opener-Policy': 'same-origin',
              'Cross-Origin-Embedder-Policy': 'require-corp',
            },
          });
        }
        
        const fileBuffer = fs.readFileSync(fullPath);
        const ext = path.extname(fullPath).toLowerCase();
        
        // Determine MIME type
        const mimeTypes: Record<string, string> = {
          '.html': 'text/html',
          '.js': 'application/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
          '.ico': 'image/x-icon',
          '.woff': 'font/woff',
          '.woff2': 'font/woff2',
          '.ttf': 'font/ttf',
          '.wasm': 'application/wasm',
        };
        const mimeType = mimeTypes[ext] || 'application/octet-stream';
        
        return new Response(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': mimeType,
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp',
          },
        });
      } catch (error) {
        console.error('[Protocol] Error reading file:', error);
        return new Response('Internal Server Error', { 
          status: 500,
          headers: {
            'Content-Type': 'text/plain',
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp',
          },
        });
      }
    });
  }

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Unregister all shortcuts when app quits
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
