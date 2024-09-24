const { contextBridge, ipcRenderer } = require('electron');



contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),

  tempFileCreate: (fileName, fileBuffer) => ipcRenderer.invoke('temp-file-create', [fileName, fileBuffer]),
  runGameFinder: (scriptName) => ipcRenderer.invoke("run-game-finder", scriptName)
});

