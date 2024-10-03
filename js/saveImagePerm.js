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
    const jsonFile = await window.electronAPI.getJsonFile()
    if (jsonFile !== null) {
        await window.electronAPI.sendTaskCompleted('update-json-signal')
    }
    await window.electronAPI.savePerm()
}