let isMergeActive = false;
let location = null;
let selectedTabs = [];
// In another renderer file
window.electronAPI.readSignalTabsAdded((message) => {
    //console.log(message); 
    const selectDeselectButtons = document.querySelectorAll('.select-deselect-btn');

    selectDeselectButtons.forEach(btn => {
        console.log("Button Found:",btn);
        btn.addEventListener('click', function() {
            const gameAssignerList = btn.parentElement.parentElement;
            const primaryContainer = gameAssignerList.querySelector('.primaryContainer');
            checkAndUpdateTabs(primaryContainer)
            
        })
    })

    document.addEventListener('keydown', function(event) {
        // Check if Ctrl + Shift + L is pressed
        if (event.ctrlKey && event.key.toLowerCase() === 'l') {
            event.preventDefault(); // Prevent any default behavior
            mergeFunction(); // Call your custom function
        }
    });
    
});

function checkAndUpdateTabs(primaryContainer) {
    const tabContainers = Array.from(primaryContainer.querySelectorAll('.tab-container')).filter(tab => {
        return !tab.closest('.tab-folder'); // Exclude tabs inside a tab folder
    });
    // Check if all tabs are active
    const allActive = Array.from(tabContainers).every(tab => {
        return tab.querySelector('.tab').classList.contains('active');
    });

    // Toggle activation
    if (allActive) {
        deactivateAllTabs(tabContainers);
    } else {
        activateAllTabs(tabContainers);
    }
};

// Function to activate all tabs
function activateAllTabs(tabContainers) {
    tabContainers.forEach(tab => {
        const tabHeader = tab.querySelector('.tab');

        tabHeader.classList.add('active');

        const maskImage = document.getElementById(`img_${tabHeader.id}`);
        if (maskImage) {
            maskImage.classList.remove('hidden'); // Show mask image
        }
    });
}

// Function to deactivate all tabs
function deactivateAllTabs(tabContainers) {
    tabContainers.forEach(tab => {
        const tabHeader = tab.querySelector('.tab');

        tabHeader.classList.remove('active');

        const maskImage = document.getElementById(`img_${tabHeader.id}`);
        if (maskImage) {
            maskImage.classList.add('hidden'); // Hide mask image
        }
    });
}

function mergeFunction() {
    console.log("merge function activated");
    isMergeActive = true;

    const gameAssigner = document.getElementById("gameAssignerContainer")
    console.log(gameAssigner)
    
    window.electronAPI.sendTaskCompleted('update-json-signal')

    
    // Select all primary containers
    const primaryContainers = document.querySelectorAll('.primaryContainer'); 
    // Loop through each primary container to handle its tabs
    primaryContainers.forEach(primaryContainer => {
        // Get all tab containers within this primary container
        const tabContainers = Array.from(primaryContainer.querySelectorAll('.tab-container'));
        
        // Deactivate all tabs within the primary container
        deactivateAllTabs(tabContainers);
        addHandleTabClick(tabContainers);
    });
    console.log('All tabs deactivated in primary container');
    // Clear the selected tabs if the function is reactivated
    selectedTabs = [];
    
    document.querySelector('.confirmDenyButtons').classList.remove('hidden');
    document.getElementById('confirm-btn').addEventListener('click', handleConfirm);
    document.getElementById('deny-btn').addEventListener('click', handleCancel);
}

function addHandleTabClick(tabContainers) {
    tabContainers.forEach(tab => {
        const tabHeader = tab.querySelector('.text-container');
        tabHeader.addEventListener("click", handleTabClick)
    });
}


// Function to handle tab clicks when merge mode is active
function handleTabClick(event) {
    console.log("This is the current location", location)
    if (isMergeActive) {
        const clickedTab = event.currentTarget.parentElement; // Get the clicked tab
        console.log(event.currentTarget.parentElement)
        const tabId = clickedTab.id;

        const possibleLocation = event.currentTarget.parentElement.parentElement.parentElement.id;
        console.log("this should be an ID", possibleLocation)
        // Determine if the possible location has gamesList or backgroundList
        if (possibleLocation === "gameslist") {
            if (location === "background") {
                // Confirm the switch from background to games
                const confirmSwitch = confirm("You are currently in 'background'. Do you want to switch to 'games'?");
                if (confirmSwitch) {
                    location = "games"; // Switch location to games
                } else {
                    return;
                }
            } else {
                location = "games"; // Set location to games if not already set
                
            }
        } else if (possibleLocation === "backgroundlist") {
            if (location === "games") {
                // Confirm the switch from games to background
                const confirmSwitch = confirm("You are currently in 'games'. Do you want to switch to 'background'?");
                if (confirmSwitch) {
                    location = "background"; // Switch location to background
                } else {
                    return;
                }
            } else {
                location = "background"; // Set location to background if not already set
            }
        }

        // Check if tab is already selected
        if (!selectedTabs.includes(tabId)) {
            selectedTabs.push(tabId); // Add tab to selection
            clickedTab.classList.add('selected'); // Highlight selected tab visually
            console.log(`Tab ${tabId} selected for merge`);
        } else {
            selectedTabs.pop(tabId)
            clickedTab.classList.remove('selected'); // Highlight selected tab visually
            console.log(`Tab ${tabId} removed for merge`);
        }
    }
}

// Function to handle confirm button click
async function handleConfirm() {
    console.log("Confirmed sending merge signal");
    try {
        await window.electronAPI.runMergeMasks(selectedTabs, location)
        await window.electronAPI.sendTaskCompleted('reset-tabs')
        const currentVar = await window.electronAPI.getAllVariables()
        console.log("the current variables are", currentVar)
        await window.electronAPI.sendTaskCompleted('masks-added-signal');
    } catch (err) {
        console.error("Theres a problem sending merge request", err)
    }
    cleanup();
}

// Function to handle cancel button click
function handleCancel() {
    console.log("Cancelled");
    selectedTabs = [];
    cleanup();
    
    
}

// Function to cleanup after action
function cleanup() {
    //remove selected
    document.querySelectorAll('.tab.selected').forEach(tab => {
        tab.classList.remove('selected'); 
    });
    //remove active tabs
    document.querySelectorAll('.primaryContainer').forEach(primaryContainer => {
        // Get all tab containers within this primary container
        const tabContainers = Array.from(primaryContainer.querySelectorAll('.tab-container'));
        
        // Deactivate all tabs within the primary container
        deactivateAllTabs(tabContainers);
    });

    // Remove event listeners
    document.getElementById('confirm-btn').removeEventListener('click', handleConfirm);
    document.getElementById('deny-btn').removeEventListener('click', handleCancel);

    // Hide buttons
    document.querySelector('.confirmDenyButtons').classList.add('hidden');
    location = null
    isMergeActive = false;
}



