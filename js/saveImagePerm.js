document.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        const image = document.querySelector('.dropped-image');

        // Check if an image is loaded
        if (image && image.src) {
            saveImage()
        } else {
            console.log("No image loaded to save.");
        }
    }
});

async function saveImage() {
    console.log("Before getJsonFile")
    const jsonFile = await window.electronAPI.getJsonFile();
    console.log("get json file", jsonFile)
    if (jsonFile !== null) {
        await window.electronAPI.sendTaskCompleted('update-json-signal');
    }
    console.log("before savePerm")
    await window.electronAPI.savePerm();
    console.log("Before sendTaskComplete add update tab")
    await window.electronAPI.sendTaskCompleted('add-update-tab');
}