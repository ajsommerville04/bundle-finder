let stateImageContainer;
let stateGameAssignerContainer;
let isDrawing = false;
let startX, startY;
let imgOriginalWidth, imgOriginalHeight;
let rectangleOriginalWidth, rectangleOriginalHeight;

const imageContainer = document.getElementById("dropzone");
const gameAssignerContainer = document.getElementById("gameAssignerContainer");

document.addEventListener('keydown', async function (event) {
    if (event.ctrlKey && event.key === 'o') {
        event.preventDefault();
        console.log("something should happen");

        const image = document.querySelector('.dropped-image');

        // Check if an image is loaded
        if (image && image.src) {
            console.log("This will activate find masks from area");

            // Save current state
            stateImageContainer = imageContainer.innerHTML;
            stateGameAssignerContainer = gameAssignerContainer.innerHTML;

            // Reset containers
            await window.electronAPI.sendTaskCompleted('reset-tabs');

            const currentVar = await window.electronAPI.getAllVariables();

            // Create new image element
            const img = document.createElement('img');
            img.src = currentVar.imagePath;
            img.classList.add('dropped-image');
            img.id = "targetImage";
            img.draggable = false;

            // Remove existing images
            imageContainer.innerHTML = '';
            imageContainer.appendChild(img);

            // Create the selection rectangle
            const rect = document.createElement('div');
            rect.className = "selection-rectangle";
            rect.id = 'choosingRectangle'; 
            img.appendChild(rect); 

            // Event listeners for mouse actions
            img.addEventListener('mousedown', setupMouseDown);
            img.addEventListener('mouseup', setupMouseUp);
            img.addEventListener('mousemove', setupMouseMove);

            window.addEventListener('resize', handleResize);

            document.getElementById("confirm-deny-container").classList.remove("hidden");
            document.getElementById('confirm-btn').addEventListener('click', handleConfirm);
            document.getElementById('deny-btn').addEventListener('click', handleCancel);
        } else {
            console.log("No image loaded.");
        }
    }
});

// Function to handle mouse down
function setupMouseDown(event) {
    const image = document.getElementById('targetImage');
    const rect = image.getBoundingClientRect();
    startX = event.clientX - rect.left;  // X position relative to the image
    startY = event.clientY - rect.top;   // Y position relative to the image
    isDrawing = true; // Start drawing
}

// Function to handle mouse move
function setupMouseMove(event) {
    if (!isDrawing) return;

    const image = document.getElementById('targetImage');
    const rectangle = document.getElementById('choosingRectangle');
    const rect = image.getBoundingClientRect();
    const endX = event.clientX - rect.left;  // Get current mouse position
    const endY = event.clientY - rect.top;

    // Set the rectangle's position and size dynamically as mouse moves
    const width = endX - startX;
    const height = endY - startY;

    rectangle.style.left = `${Math.min(startX, endX)}px`;
    rectangle.style.top = `${Math.min(startY, endY)}px`;
    rectangle.style.width = `${Math.abs(width)}px`;
    rectangle.style.height = `${Math.abs(height)}px`;
}

// Function to handle mouse up
function setupMouseUp() {
    isDrawing = false; // Stop drawing
}

function handleResize() {
    const image = document.getElementById('targetImage');
    const rectangle = document.getElementById('choosingRectangle');
    const imgRect = image.getBoundingClientRect();

    // Adjust rectangle size and position based on the new image dimensions
    if (isDrawing) {
        const newWidth = rectangle.offsetWidth * (imgRect.width / imgOriginalWidth);
        const newHeight = rectangle.offsetHeight * (imgRect.height / imgOriginalHeight);
        const newLeft = rectangle.offsetLeft * (imgRect.width / imgOriginalWidth);
        const newTop = rectangle.offsetTop * (imgRect.height / imgOriginalHeight);

        rectangle.style.width = `${newWidth}px`;
        rectangle.style.height = `${newHeight}px`;
        rectangle.style.left = `${newLeft}px`;
        rectangle.style.top = `${newTop}px`;
    }

    // Update original dimensions to current dimensions
    imgOriginalWidth = imgRect.width;
    imgOriginalHeight = imgRect.height;
}


function handleConfirm() {
    alert("Will send out signal with variables");
    
    // Reset to previous state
    gameAssignerContainer.innerHTML = stateGameAssignerContainer;
    imageContainer.innerHTML = stateImageContainer;
}

function handleCancel() {
    gameAssignerContainer.innerHTML = stateGameAssignerContainer;
    imageContainer.innerHTML = stateImageContainer;
}