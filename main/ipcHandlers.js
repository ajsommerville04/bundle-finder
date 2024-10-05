const { ipcMain, dialog } = require('electron');
const { tempFileCreate, readJson, updateJson, saveTempToPermanant, getAssetsFolder, getSeperator} = require('../js/modules/fileHandler.js')
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
      console.log("no arg activated")
      mainWindow.webContents.send(message, "Task completed signal sending!!");
    }
  });
}

function initializeIpcHandlersNonWindowEvent(appBasePath) {
  let folderPath = null;
  let imagePath = null;
  let jsonPath = null;
  let uniqueHash = null;
  let temp = null;
  let fileSeperator = null;

  //rename this to be more accurately describe what it does
  ipcMain.handle('temp-file-create', async (event, fileBuffer) => {
    try {
      [folderPath, imagePath, jsonPath, fileSeperator, uniqueHash, temp] = await tempFileCreate(fileBuffer, appBasePath);
      if (jsonPath !== null) {
        jsonSignal = true
      } else {
        jsonSignal = false
      }
      return [imagePath, jsonSignal, temp];
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
          const result = await runScript(scriptName, imagePath);
          console.log("This is before its updated", jsonPath)
          jsonPath = result;
          console.log("This is after I update json", jsonPath)
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
      temp = false;
      const result = await saveTempToPermanant(folderPath, appBasePath, jsonPath);
      [folderPath, imagePath, jsonPath] = result;
      console.log("should update folder path", folderPath)

      
    } catch (error) {
      console.error('Error saving file permenantly', error);
    }
  });
  //depeciated
  ipcMain.handle("get-folder-dir", (event) => {
    return folderPath + fileSeperator;
  });

  ipcMain.handle("get-json-file", (event) => {
    return jsonPath;
  });

  //new function 
  ipcMain.handle("get-all-variables", (event) => {
    const info = {
      folderPath: folderPath,
      imagePath: imagePath,
      jsonPath: jsonPath,
      uniqueHash: uniqueHash,
      temp: temp, 
    }
    return info;
  })

  ipcMain.handle("get-assets-folder", async (event) => {
    console.log("Assets function is firing correctly")
    fileSeperator = getSeperator()
    return await getAssetsFolder(appBasePath, temp)

  });

  ipcMain.handle("set-backend-attributes", async (event, [newFolderPath, newImagePath, newJsonPath, newUniqueHash, newTemp]) => {
    folderPath = newFolderPath;
    imagePath = newImagePath;
    jsonPath = newJsonPath;
    uniqueHash = newUniqueHash;
    temp = newTemp;
    return;
  }); 

  
}

module.exports = { initializeIpcHandlers, initializeIpcHandlersNonWindowEvent };