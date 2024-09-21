const { app, BrowserWindow } = require('electron');
const path = require('path');
const { initializeIpcHandlers } = require('./ipcHandlers');

let mainWindow;

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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});