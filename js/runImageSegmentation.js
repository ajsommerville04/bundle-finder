// Debugging: Check if the script is loaded
console.log('image-segmentation file loaded');

// Get necessary DOM elements
const runGameFinder = document.getElementById("runGameFinder");
const gameList = document.getElementById("gameslist");
const backgroundList = document.getElementById("backgroundlist");
const gameAssigner = document.getElementById("gameAssignerContainer");
const dropzone = document.getElementById("dropzone");

let maskData = {};

// Ensure runGameFinder is selected
if (runGameFinder) {
    console.log('run-game-finder box found');
} else {
    console.error('run-game-finder box not found');
}

// Event listener for the runGameFinder button
runGameFinder.addEventListener('click', async function() {
    console.log("run-button clicked");
    try {
        const imagesDirPath = await window.electronAPI.runGameFinder("find-all-masks");

        gameAssigner.classList.remove('hidden');
        
        maskData = await window.electronAPI.readJson(imagesDirPath + "mask_metadata.json");
        const background = maskData.background;
        const games = maskData.games;

        // Populate background and games
        populateTabs(background, backgroundList);
        populateTabs(games, gameList, true);

        //HERE send signal when this is done
        window.electronAPI.sendTaskCompleted('Game finder task completed');

    } catch (error) {
        console.error("Error running script and adding tabs", error);
    }
});

// Function to populate tabs
function populateTabs(data, element, active = false) {
    Object.values(data).forEach(mask => {
        createTabDiv(mask, element, active);
    });
}

// Function to create a tab div and its associated folder
function createTabDiv(mask, element, active = false) {
    const tab = document.createElement('div');
    tab.className = 'tab-container'
    tab.draggable = true
    tab.id = `tab_${mask.name}`
    tab.addEventListener('dragstart', handleDragStart);

    const tabHeaderPrimary = createTabHeader(mask, active);
    const tabFolder = createTabFolder(mask);

    tab.appendChild(tabHeaderPrimary);
    tab.appendChild(tabFolder);
    element.appendChild(tab);

    // Create the main mask image
    createMaskImage(mask, dropzone, active);
}

// Function to create tab header
function createTabHeader(mask, active, secondary=false) {
    const tabHeader = document.createElement('div');
    tabHeader.className = active ? 'tab active' : 'tab';
    tabHeader.setAttribute('data-image', mask.filePath);
    tabHeader.setAttribute('data-area', mask.area);
    tabHeader.setAttribute('data-bbox', mask.bbox)
    tabHeader.id = mask.name;

    // Dropdown button
    const dropdownButton = createButton('>', 'tab-button', 'tabButtonDropdown', secondary);
    tabHeader.appendChild(dropdownButton);
    dropdownButton.addEventListener('click', handleDropdownButtonClick);

    // Text container
    const textContainer = document.createElement('div');
    textContainer.className = 'text-container';
    textContainer.textContent = mask.name;
    tabHeader.appendChild(textContainer);
    textContainer.addEventListener('click', handleTabClick);

    // Delete button
    const deleteButton = createButton('X', 'tab-delete-button', `tab-delete-button_${mask.name}`);
    tabHeader.appendChild(deleteButton);
    deleteButton.addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent triggering the tab click
        const confirmDelete = confirm(`Are you sure you want to delete the tab "${mask.name}"?`);
        if (confirmDelete) {
            deleteTab(mask.name); // Call delete function if confirmed
        }

    });

    return tabHeader;
}

// Function to create tab folder
function createTabFolder(mask) {
    const tabFolder = document.createElement('div');
    tabFolder.className = 'tab-folder hidden'; // Initially hidden

    mask.internal.forEach((maskInternal) => {
        const secondaryTab = document.createElement('div')
        secondaryTab.className = 'tab-container'
        secondaryTab.draggable = true
        secondaryTab.id = `tab_${maskInternal.name}`
        secondaryTab.addEventListener('dragstart', handleDragStart);

        const tabHeaderSecondary = createTabHeader(maskInternal, false, true);
        const insideTabFolder = document.createElement('div')
        insideTabFolder.className = "tab-folder hidden"

        secondaryTab.appendChild(tabHeaderSecondary);
        secondaryTab.appendChild(insideTabFolder)

        tabFolder.appendChild(secondaryTab)

        // Create the internal mask image
        createMaskImage(maskInternal, dropzone);
    });

    return tabFolder;
}

// Helper function to create buttons
function createButton(text, className, id, disabled = false) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = className;
    button.id = id;
    if (disabled) button.disabled = true;
    return button;
}

// Function to create mask images
function createMaskImage(mask, parent, active = false) {
    const maskImage = document.createElement('img');
    maskImage.className = active ? 'maskImage' : 'maskImage hidden';
    maskImage.src = mask.filePath;
    maskImage.id = `img_${mask.name}`;
    maskImage.style.position = 'absolute';
    parent.appendChild(maskImage);
}

// Function to handle tab clicks
function handleTabClick(event) {
    const tab = event.currentTarget.parentElement;
    const currentTabID = tab.id;
    const currentMaskedImage = document.getElementById(`img_${currentTabID}`);

    // Toggle active class and mask image visibility
    if (tab.classList.contains('active')) {
        tab.classList.remove('active');
        currentMaskedImage.classList.add('hidden');
    } else {
        tab.classList.add('active');
        currentMaskedImage.classList.remove('hidden');
    }
}

// Function to handle dropdown button clicks
function handleDropdownButtonClick(event) {
    const tab = event.currentTarget.parentElement.parentElement;
    const tabFolder = tab.querySelector('.tab-folder');

    // Toggle visibility of the folder and change the dropdown button symbol
    if (tabFolder.classList.contains('hidden')) {
        tabFolder.classList.remove('hidden');
        event.currentTarget.textContent = 'v';
    } else {
        tabFolder.classList.add('hidden');
        event.currentTarget.textContent = '>';
    }
}

gameList.addEventListener('dragover', handleDragOver);
gameList.addEventListener('drop', handleDrop);

backgroundList.addEventListener('dragover', handleDragOver);
backgroundList.addEventListener('drop', handleDrop);

function handleDragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.id);
}

function handleDragOver(event) {
    event.preventDefault();  
}

function handleDrop(event) {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain'); // Retrieve the dragged tab's ID
    const draggedElement = document.getElementById(id);

    if (draggedElement) {
        // Get the element under the mouse during the drop
        const dropTarget = document.elementFromPoint(event.clientX, event.clientY);

        // Check if the drop target is a folder
        const isFolder = dropTarget && dropTarget.closest('.tab-folder');

        // Check if the drop target is a tab or primary container
        const isTab = dropTarget && dropTarget.closest('.tab-container');
        const isPrimaryContainer = dropTarget && dropTarget.closest('.primaryContainer');

        // If the drop target is a folder, append the dragged element inside the folder
        if (isFolder) {
            const folderElement = dropTarget.closest('.tab-folder');
            folderElement.appendChild(draggedElement); // Add tab to folder
            ifPrimaryContainer(folderElement.className, draggedElement);
        } 
        // If the drop target is another tab in the primary container
        else if (isTab && dropTarget !== draggedElement) {
            const dropTargetContainer = dropTarget.closest('.tab-container').parentNode;
            ifPrimaryContainer(dropTargetContainer.className, draggedElement);

            // Insert the dragged element before the drop target tab
            dropTargetContainer.insertBefore(draggedElement, dropTarget.closest('.tab-container'));
        } 
        // If the drop target is the primary container itself (not a tab)
        else if (isPrimaryContainer) {
            event.currentTarget.appendChild(draggedElement); // Add tab to primary container
            ifPrimaryContainer(event.currentTarget.className, draggedElement);
            console.log('Dropped tab into the primary container');
        } 
        else {
            console.log('No valid drop target found');
        }
    } else {
        console.error('Dragged element not found');
    }
}  

function ifPrimaryContainer(className, draggedTab) {
    // Find the specific tab header within the dragged tab
    const tabHeader = draggedTab.querySelector('.tab');

    if (tabHeader) {
        // Now find the dropdown button specifically inside the tab header
        const dropdownButton = tabHeader.querySelector('.tab-button');

        if (dropdownButton) {
            console.log('Dropdown button found in the dragged tab header:', dropdownButton);
            if (className === "primaryContainer") {
                dropdownButton.disabled = false
            } else {
                dropdownButton.disabled = true
            }
        
        } else {
            console.log('Dropdown button not found in the tab header');
        }
    } else {
        console.log('Tab header not found in the dragged element');
    }

    
    
}

function deleteTab(tabName) {
    const tabToDelete = document.getElementById(`tab_${tabName}`);
    const maskImageToDelete = document.getElementById(`img_${tabName}`);

    if (tabToDelete) {
        tabToDelete.remove(); 
        console.log(`Tab ${tabName} deleted`);
    } else {
        console.error(`Tab ${tabName} not found`);
    }

    if (maskImageToDelete) {
        maskImageToDelete.remove(); 
        console.log(`Mask image for ${tabName} deleted`);
    }
}






