
document.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        const image = document.querySelector('.dropped-image');

        // Check if an image is loaded
        if (image && image.src) {
            console.log("SRC:", image.src)
            saveImage(image.src)
        } else {
            console.log("No image loaded to save.");
        }
    }
});

function saveImage(image_path) {
    window.electronAPI.savePerm(image_path)
}