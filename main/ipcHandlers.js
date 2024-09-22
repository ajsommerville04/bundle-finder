const { ipcMain } = require('electron');
const { tempFileCreate } = require('../js/modules/fileHandler.js')

function initializeIpcHandlers(mainWindow) {
  ipcMain.on('minimize-window', () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
  });

  ipcMain.on('maximize-window', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on('close-window', () => {
    if (mainWindow) {
      mainWindow.close();
    }
  });


}

function initializeIpcHandlersNonWindowEvent() {
  ipcMain.handle('temp-file-create', async (event, file) => {
    console.log('file:', file)
    try {
      const result = await tempFileCreate(file);
      return result;
    } catch (error) {
      console.error('Error in temp-file-create handler', error)
    }
    
  });
}

module.exports = { initializeIpcHandlers, initializeIpcHandlersNonWindowEvent };