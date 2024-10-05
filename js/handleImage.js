// Debugging: Check if the script is loaded
console.log('handleImage file loaded');

const dropzoneBox = document.getElementById("dropzone");
const originalGameAssigner = document.getElementById("gameAssignerContainer").innerHTML

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
}, false);

dropzoneBox.addEventListener('dragleave', () => {
    dropzoneBox.classList.remove('hover');
}, false);

dropzoneBox.addEventListener('drop', handleDrop, false);

function handleDrop (e) {
    clearDisplay();
    document.getElementById('gameAssignerContainer').innerHTML = originalGameAssigner;
    document.getElementById("gameAssignerContainer").classList.add("hidden")
    
    
    dropzoneBox.classList.remove('hover');

    const files = e.dataTransfer.files;
    console.log({files});
    if (files.length) {
        // only deals with single files not folders (would only take first item of folder)
        const file = files[0];
        if (file.type.startsWith('image/')) {
            //displays image on screen
            
            const backEndReader = new FileReader();
            backEndReader.onload = async (event) => {
                const fileBuffer = event.target.result; // This is an ArrayBuffer
                try {
                    //sends image to create tempfile
                    const [FilePath, foundJson, temp] = await window.electronAPI.tempFileCreate(fileBuffer);
                    displayImage(FilePath);
                    
                    console.log('Image file path found at: ', FilePath);
                    if (foundJson) {
                        await window.electronAPI.sendTaskCompleted('masks-added-signal');
                        document.getElementById("gameAssignerContainer").classList.remove('hidden');
                        console.log("masks added")
                    };
                    if (temp) {
                        console.log("This is a temp file send to add tab")
                        await window.electronAPI.sendTaskCompleted('add-update-tab')
                    };
                } catch (error) {
                    console.error('Error creating temporary file:', error);
                }
            };
            backEndReader.readAsArrayBuffer(file); // Read file as ArrayBuffer
        } else {
            console.error('No file selected');
            }
            
        } else {
            alert('Please drop an image file.');
        }
    }


function displayImage(tempFilePath) {
    const img = document.createElement('img');
    img.src = tempFilePath;
    img.classList.add('dropped-image');
    //remove existing images
    dropzoneBox.innerHTML = '';
    dropzoneBox.appendChild(img);
    
    
}

function clearDisplay() {
    dropzoneBox.innerHTML = ''; // Remove image and button
    dropzoneBox.classList.remove('dropped-image'); // Revert to original drop zone style
}