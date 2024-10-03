const { app, BrowserWindow } = require('electron');
const path = require('path');
const { initializeIpcHandlers, initializeIpcHandlersNonWindowEvent } = require('./ipcHandlers');
const os = require('os')
const fs = require('fs')


let mainWindow;
let cleanupDone = false;
const appBasePath = app.getAppPath();

initializeIpcHandlersNonWindowEvent(appBasePath)

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minHeight: 650,
        minWidth: 900,
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
  //ensures theres an assets folder when creating lanuching app for first time
  ensureAssetsFolder()
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

function ensureAssetsFolder() {
  // Create the assets folder path
  const assetsFolderPath = path.join(appBasePath, 'assets');

  // Check if the assets folder exists
  if (!fs.existsSync(assetsFolderPath)) {
      // If it doesn't exist, create the assets folder
      fs.mkdirSync(assetsFolderPath);
      console.log(`Created 'assets' folder at: ${assetsFolderPath}`);
  } else {
      console.log(`'assets' folder already exists at: ${assetsFolderPath}`);
  }
}