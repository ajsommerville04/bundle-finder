let stateImageContainer;
let stateGameAssignerContainer;
let isDrawing = false;
let startX, startY;
let endX, endY;
let imgOriginalWidth, imgOriginalHeight;
let rectangleOriginalWidth, rectangleOriginalHeight;
let aspectRatio;



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
            imageContainer.innerHTML = '';

            //create div to house the image and the rect
            const divImage = document.createElement('div');
            divImage.className = 'imageHouser'
            divImage.id = 'imageHouser'


            // Create new image element
            const img = document.createElement('img');
            img.src = currentVar.imagePath;
            
            img.classList.add('dropped-image');
            img.id = "targetImage";
            img.draggable = false;

            img.onload = function() {
                aspectRatio = getAspectRatio(img);  // Pass the img element
                console.log("Aspect Ratio: ", aspectRatio);
            };

            // Remove existing images
            
            divImage.appendChild(img);

            // Create the selection rectangle
            const rect = document.createElement('div');
            rect.className = "selection-rectangle";
            rect.id = 'choosingRectangle'; 
            divImage.appendChild(rect); 

            imageContainer.appendChild(divImage)

            

            // Event listeners for mouse actions
            img.addEventListener('mousedown', setupMouseDown);
            img.addEventListener('mouseup', setupMouseUp);
            img.addEventListener('mousemove', setupMouseMove);


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
    endX = event.clientX - rect.left;  // Get current mouse position
    endY = event.clientY - rect.top;

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

async function handleConfirm() {
    const element = document.getElementById("imageHouser");
    const currentWidth = element.offsetWidth;
    const currentHeight = element.offsetHeight;
    const currentAspectRatio = parseFloat((currentWidth/currentHeight).toFixed(2));
    const constraintMultiplier = parseFloat((imgOriginalWidth/currentWidth).toFixed(2));
    let newStartX, newStartY, newEndX, newEndY; 

    newStartX = Math.round(startX * constraintMultiplier);
    newEndX = Math.round(endX * constraintMultiplier);

    if (currentAspectRatio === aspectRatio) {
        newStartY = Math.round(startY * constraintMultiplier);
        newEndY = Math.round(endY * constraintMultiplier);
    } else {
        const actualHeight = imgOriginalHeight/constraintMultiplier;
        const getOverlap = (currentHeight - actualHeight)/2;

        startY = startY - getOverlap;
        endY = endY - getOverlap;

        if (startY < 0 || startY > actualHeight || endY < 0 || endY > actualHeight) {
            alert("rectangle outside of image")
            return;
        } 
        //alter Y coordinates to account 
        newStartY = Math.round(startY * constraintMultiplier);
        newEndY = Math.round(endY * constraintMultiplier);
    }

    const bbox = [newStartX, newStartY, newEndX, newEndY];

    const result = await window.electronAPI.runFindMaskInArea(bbox);
    
    if (!result === 'success') {
        return;
    }
    
    // Reset to previous state
    gameAssignerContainer.innerHTML = stateGameAssignerContainer;
    imageContainer.innerHTML = stateImageContainer;
}

function handleCancel() {
    gameAssignerContainer.innerHTML = stateGameAssignerContainer;
    imageContainer.innerHTML = stateImageContainer;
}

function getAspectRatio(image) {
    if (image && image.complete) {
        imgOriginalWidth = image.naturalWidth;  // Get the natural width of the image
        imgOriginalHeight = image.naturalHeight; // Get the natural height of the image

        return parseFloat((imgOriginalWidth / imgOriginalHeight).toFixed(2));
    } else {
        console.error("Image is not loaded yet.");
        return null;  // Return null if the image is not ready

    }
};