const { contextBridge, ipcRenderer } = require('electron');



contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),

  tempFileCreate: (fileBuffer) => ipcRenderer.invoke('temp-file-create', fileBuffer),
  runGameFinder: (scriptName) => ipcRenderer.invoke("run-game-finder", scriptName),
  readJson: (jsonFilePath) => ipcRenderer.invoke("readjson", jsonFilePath),
  updateJson: (gameAssigner) => ipcRenderer.invoke("update-json", gameAssigner),
  savePerm: (filePath) => ipcRenderer.invoke("save-permenant", filePath),

  sendTaskCompleted: (message, arg=null) => {ipcRenderer.send('task-completed', [message, arg]);},
  readSignalMasksAdded: (callback) => {ipcRenderer.on('masks-added-signal', (event, message, imagePath) => callback(message, imagePath));},
  readSignalTabsAdded: (callback) => {ipcRenderer.on('tabs-added-signal', (event, message) => callback(message));},
  readSignalUpdateJson: (callback) => {ipcRenderer.on('update-json-signal', (event, message) => callback(message));},
});

