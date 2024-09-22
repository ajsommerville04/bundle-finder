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
            const backEndReader = new FileReader();
            backEndReader.onload = async (event) => {
                const fileBuffer = event.target.result; // This is an ArrayBuffer
                try {
                    const tempFilePath = await window.electronAPI.tempFileCreate(file.name, fileBuffer);
                    console.log('Temporary file created at:', tempFilePath);
                } catch (error) {
                    console.error('Error creating temporary file:', error);
                }
            };
            backEndReader.readAsArrayBuffer(file); // Read file as ArrayBuffer
        } else {
            console.error('No file selected');
            }
            
        } else {
            clearDisplay();
            alert('Please drop an image file.');
        }
    }


function displayImage(file) {
    const frontEndReader = new FileReader();
    frontEndReader.onload = function (e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.classList.add('dropped-image'); // Add a class for styling
        //remove existing images
        dropzoneBox.innerHTML = '';
        dropzoneBox.appendChild(img);
    }
    frontEndReader.readAsDataURL(file);
    
}

function clearDisplay() {
    dropzoneBox.innerHTML = ''; // Remove image and button
    dropzoneBox.classList.remove('dropped-image'); // Revert to original drop zone style
}