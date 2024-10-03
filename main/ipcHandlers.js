const { ipcMain, dialog } = require('electron');
const { tempFileCreate, readJson, updateJson, savePerm} = require('../js/modules/fileHandler.js')
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
    if (arg) {
      mainWindow.webContents.send(message, ["Task completed signal sending!!", arg]);
    } else {
      mainWindow.webContents.send(message, "Task completed signal sending!!");
    }
  });
}

function initializeIpcHandlersNonWindowEvent(appBasePath) {
  let folderPath = '';
  let imagePath = '';
  let jsonPath = null;

  //rename this to be more accurately describe what it does
  ipcMain.handle('temp-file-create', async (event, fileBuffer) => {
    try {
      [folderPath, imagePath, jsonPath] = await tempFileCreate(fileBuffer, appBasePath);
      return imagePath;
    } catch (error) {
      console.error('Error in temp-file-create handler', error)
    }
    
  });

  ipcMain.handle('run-game-finder', async (event, scriptName) => {
    //if json file not equal to null through an error

    console.log("Attempting to run game finder with tempFilePath:", FilePath);
    console.log("The script:", scriptName)
    if (!FilePath) {
      dialog.showErrorBox("Error", "No Image Selected");
      return;
    }
    try {
      const filePath = await runScript(scriptName, FilePath);
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
  ipcMain.handle("save-permenant", async (event, filePath) => {
    try {
      // Check if savePerm is async and await it
      filePath = await savePerm(filePath);
      console.log(filePath)

      // Return a success message (good practice for ipcMain.handle)
      return { success: true, message: "File saved permanently." };
    } catch (error) {
      console.error('Error saving file permenantly', error)
    }
  })

  
}

module.exports = { initializeIpcHandlers, initializeIpcHandlersNonWindowEvent };