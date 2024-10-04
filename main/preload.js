const { contextBridge, ipcRenderer } = require('electron');



contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),

  tempFileCreate: (fileBuffer) => ipcRenderer.invoke('temp-file-create', fileBuffer),
  runGameFinder: (scriptName) => ipcRenderer.invoke("run-game-finder", scriptName),
  readJson: (jsonFilePath) => ipcRenderer.invoke("readjson", jsonFilePath),
  updateJson: (gameAssigner) => ipcRenderer.invoke("update-json", gameAssigner),
  savePerm: () => ipcRenderer.invoke("save-permenant"),
  getFolderPath: () => ipcRenderer.invoke("get-folder-dir"),
  getJsonFile: () => ipcRenderer.invoke("get-json-file"),
  getAssetsFolder: () => ipcRenderer.invoke("get-assets-folder"),
  setBackendAttributes: (folderDir, imagePath, jsonPath) => ipcRenderer.invoke("set-backend-attributes", [folderDir, imagePath, jsonPath]),

  sendTaskCompleted: (message, arg=null) => {ipcRenderer.send('task-completed', [message, arg]);},
  readSignalMasksAdded: (callback) => {ipcRenderer.on('masks-added-signal', (event, message) => callback(message));},
  readSignalTabsAdded: (callback) => {ipcRenderer.on('tabs-added-signal', (event, message) => callback(message));},
  readSignalUpdateJson: (callback) => {ipcRenderer.on('update-json-signal', (event, message) => callback(message));},
});

