window.electronAPI.readSignalUpdateJson((message) => {
    console.log(message);

    
    window.electronAPI.updateJson(message)
    });