const { contextBridge, ipcRenderer } = require('electron');



contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),

  tempFileCreate: (fileName, fileBuffer) => ipcRenderer.invoke('temp-file-create', [fileName, fileBuffer]),
  runGameFinder: (scriptName) => ipcRenderer.invoke("run-game-finder", scriptName),
  readJson: (jsonFilePath) => ipcRenderer.invoke("readjson", jsonFilePath),
  updateJson: (gameAssigner) => ipcRenderer.invoke("update-json", gameAssigner),

  //rename these to be more accurate to description
  sendTaskCompleted: (message) => {ipcRenderer.send('task-completed', message);},
  onGameFinderStatus: (callback) => {ipcRenderer.on('game-finder-status', (event, message) => callback(message));},

  //For updating json file
  sendSignalUpdateJson: (message) => {ipcRenderer.send('update-json-signal', message);},
  readSignalUpdateJson: (callback) => {ipcRenderer.on('update-json-send-signal', (event, message) => callback(message));},
});

