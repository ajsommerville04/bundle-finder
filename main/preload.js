const { contextBridge, ipcRenderer } = require('electron');



contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),

  tempFileCreate: (fileBuffer) => ipcRenderer.invoke('temp-file-create', fileBuffer),
  runGameFinder: (scriptName) => ipcRenderer.invoke("run-game-finder", scriptName),
  runMergeMasks: (keyList, location) => ipcRenderer.invoke('merge-masks', keyList, location),
  runFindMaskInArea: (bbox) => ipcRenderer.invoke('find-games-in-area', bbox),
  readJson: (givenJsonPath = null) => ipcRenderer.invoke("readjson", givenJsonPath),
  updateJson: (gameAssigner) => ipcRenderer.invoke("update-json", gameAssigner),
  savePerm: () => ipcRenderer.invoke("save-permenant"),
  getFolderPath: () => ipcRenderer.invoke("get-folder-dir"),
  getJsonFile: () => ipcRenderer.invoke("get-json-file"),
  getAssetsFolder: () => ipcRenderer.invoke("get-assets-folder"),
  getAllVariables: () => ipcRenderer.invoke("get-all-variables"),
  setBackendAttributes: (folderDir, imagePath, jsonPath, uniqueHash, temp) => ipcRenderer.invoke("set-backend-attributes", [folderDir, imagePath, jsonPath, uniqueHash, temp]),


  sendTaskCompleted: (message, arg=null) => {ipcRenderer.send('task-completed', [message, arg]);},
  readSignalMasksAdded: (callback) => {ipcRenderer.on('masks-added-signal', (event, message) => callback(message));},
  readSignalTabsAdded: (callback) => {ipcRenderer.on('tabs-added-signal', (event, message) => callback(message));},
  readSignalUpdateJson: (callback) => {ipcRenderer.on('update-json-signal', (event, message) => callback(message));},
  readSignalAddUpdateTab: (callback) => {ipcRenderer.on('add-update-tab', (event, message) => callback(message))},
  resetGameAssigner: (callback) => {ipcRenderer.on('reset-tabs', (event, message) => callback(message))},
  tempLoadPossible: (callback) => {ipcRenderer.on('temp-load-possible', (event, message) => callback(message))},
});

