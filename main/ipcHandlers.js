const { ipcMain, dialog } = require('electron');
const { tempFileCreate, readJson, updateJson } = require('../js/modules/fileHandler.js')
const { runScript } = require('../js/modules/runPythonScript.js')

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

  ipcMain.on('task-completed', (event, [message, arg]) => {
    console.log(`Task completed: ${message}`);
    console.log("the arg recieved is", arg)
    if (arg) {
      console.log("activated correct one")
      mainWindow.webContents.send(message, ["Task completed signal sending!!", arg]);
    } else {
      console.log("activated wrong one")
      mainWindow.webContents.send(message, "Task completed signal sending!!");
    }
  });
}

function initializeIpcHandlersNonWindowEvent() {
  let tempFilePath;

  ipcMain.handle('temp-file-create', async (event, [filename, fileBuffer]) => {
    try {
      tempFilePath = await tempFileCreate(filename, fileBuffer);
      return tempFilePath;
    } catch (error) {
      console.error('Error in temp-file-create handler', error)
    }
    
  });

  ipcMain.handle('run-game-finder', async (event, scriptName) => {
    console.log("Attempting to run game finder with tempFilePath:", tempFilePath);
    console.log("The script:", scriptName)
    if (!tempFilePath) {
      dialog.showErrorBox("Error", "No Image Selected");
      return;
    }
    try {
      const filePath = await runScript(scriptName, tempFilePath);
      return filePath
    } catch (error) {
      console.error("Error running python script", error.message);
    }
  });

  ipcMain.handle("readjson", async (event, jsonFilePath) => {
    try {
      const data = readJson(jsonFilePath)
      return data
    } catch (error) {
      console.error('Error loading data:', error)
    }
  })

  ipcMain.handle("update-json", async (event, gameAssigner) => {
    try {
      updateJson(gameAssigner)
    } catch (error) {
      console.error('Error updating json')
    }
  })
}

module.exports = { initializeIpcHandlers, initializeIpcHandlersNonWindowEvent };