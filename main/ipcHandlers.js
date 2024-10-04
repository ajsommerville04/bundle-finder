const { ipcMain, dialog } = require('electron');
const { tempFileCreate, readJson, updateJson, saveTempToPermanant, getAssetsFolder} = require('../js/modules/fileHandler.js')
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
  let folderPath = null;
  let imagePath = null;
  let jsonPath = null;
  let fileSeperator = null;

  //rename this to be more accurately describe what it does
  ipcMain.handle('temp-file-create', async (event, fileBuffer) => {
    try {
      [folderPath, imagePath, jsonPath, fileSeperator] = await tempFileCreate(fileBuffer, appBasePath);
      if (jsonPath !== null) {
        jsonSignal = true
      } else {
        jsonSignal = false
      }
      return [imagePath, jsonSignal];
    } catch (error) {
      console.error('Error in temp-file-create handler', error)
    }
    
  });

  ipcMain.handle('run-game-finder', async (event, scriptName) => {
    let gameAssignerActive = null;
    //if json file not equal to null through an error
    if (imagePath === null) {
      dialog.showErrorBox("Error", "No Image Selected.\nEither select a previous image\nor drag and drop a new one")
      return;
    } else {
      console.log("Found image path:", imagePath);
      if (jsonPath === null) {
        console.log("The script:", scriptName);
        try {
          jsonPath = await runScript(scriptName, imagePath);
          gameAssignerActive = false;
        } catch (error) {
          console.error("Error running python script", error.message);
        }
      } else {
        gameAssignerActive = true;
        console.log("Masks of already been obtained for this image");
      }
    }
    return gameAssignerActive;
  });

  ipcMain.handle("readjson", async (event) => {
    try {
      console.log("attempting to read file", jsonPath)
      const data = readJson(jsonPath)
      return data
    } catch (error) {
      console.error('Error loading data:', error)
    }
  });

  ipcMain.handle("update-json", async (event, gameAssigner) => {
    try {
      updateJson(gameAssigner, jsonPath)
    } catch (error) {
      console.error('Error updating json')
    }
  });

  ipcMain.handle("save-permenant", async (event) => {
    try {
      [folderPath, imagePath, jsonPath] = await saveTempToPermanant(folderPath, appBasePath);
      console.log(folderPath)

      // Return a success message (good practice for ipcMain.handle)
      return { success: true, message: "File saved permanently." };
    } catch (error) {
      console.error('Error saving file permenantly', error);
    }
  });

  ipcMain.handle("get-folder-dir", (event) => {
    console.log(folderPath)
    return folderPath + fileSeperator;
  });

  ipcMain.handle("get-json-file", (event) => {
    console.log(jsonPath)
    return jsonPath;
  });

  ipcMain.handle("get-assets-folder", async (event) => {
    console.log("Assets function is firing correctly")
    return await getAssetsFolder(appBasePath)

  });

  
}

module.exports = { initializeIpcHandlers, initializeIpcHandlersNonWindowEvent };