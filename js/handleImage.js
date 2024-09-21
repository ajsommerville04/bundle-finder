// Debugging: Check if the script is loaded
console.log('handleImage file loaded');

const dropzoneBox = document.getElementById("dropzone");

// Check if the dropzoneBox is selected correctly
if (dropzoneBox) {
    console.log('Dropzone box found');
} else {
    console.error('Dropzone box not found');
}

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropzoneBox.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults (e) {
    e.preventDefault();
    e.stopPropagation();
}

// Add event listeners for drag and drop
dropzoneBox.addEventListener('dragenter', () => {
    dropzoneBox.classList.add('hover');
    console.log("file drag entered")
}, false);

dropzoneBox.addEventListener('dragleave', () => {
    dropzoneBox.classList.remove('hover');
}, false);

dropzoneBox.addEventListener('drop', handleDrop, false);

function handleDrop (e) {
    dropzoneBox.classList.remove('hover');

    const files = e.dataTransfer.files;
    console.log({files});
    if (files.length) {
        // only deals with single files not folders (would only take first item of folder)
        const file = files[0];
        if (file.type.startsWith('image/')) {
            //displays image on screen
            displayImage(file);
            //tempFilePath = fileHandler.tempFileCreate(file)
            //console.log("The temp file path:", tempFilePath)
            
        } else {
            clearDisplay();
            alert('Please drop an image file.');
        }
    }
}

function displayImage(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.classList.add('dropped-image'); // Add a class for styling
        //remove existing images
        dropzoneBox.innerHTML = '';
        dropzoneBox.appendChild(img);
    }
    reader.readAsDataURL(file);
    
}

function clearDisplay() {
    dropzoneBox.innerHTML = ''; // Remove image and button
    dropzoneBox.classList.remove('dropped-image'); // Revert to original drop zone style
}