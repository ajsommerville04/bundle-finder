const { app, BrowserWindow } = require('electron');
const path = require('path');
const { initializeIpcHandlers, initializeIpcHandlersNonWindowEvent } = require('./ipcHandlers');
const os = require('os')
const fs = require('fs')


let mainWindow;
let cleanupDone = false;

initializeIpcHandlersNonWindowEvent()

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: "Test",
        width: 1000,
        height: 800,
        minHeight: 650,
        minWidth: 600,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,  // Enable Node.js integration
            contextIsolation: true, // Disable context isolation
          }
    });

    mainWindow.loadFile(path.join(__dirname, '..', 'html', 'mainpage.html'));
}

app.whenReady().then(() => {
  createMainWindow();
  initializeIpcHandlers(mainWindow);
});

app.once('before-quit', () => {
  if (cleanupDone) return;
  try {
    const dirPath = path.join(os.tmpdir(), 'basic-gui');  // Your temp directory
    if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log('Temp directory removed successfully.');
        cleanupDone = true
        app.quit();
    } else {
        console.log('Temp directory does not exist.');
        cleanupDone = false
        app.quit();
        
    }
} catch (err) {
    console.error('Failed to remove temp directory:', err);
    process.exit(1);  // Optionally exit if it's critical
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});