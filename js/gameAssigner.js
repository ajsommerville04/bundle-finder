let isMergeActive = false;
let selectedTabs = [];
// In another renderer file
window.electronAPI.onGameFinderStatus((message) => {
    console.log(message); // This will log "Game finder task has been completed!"
    // You can perform other actions based on this signal here

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
    if (isMergeActive) {
        const clickedTab = event.currentTarget.parentElement; // Get the clicked tab
        console.log(event.currentTarget.parentElement)
        const tabId = clickedTab.id;

        // Check if tab is already selected
        if (!selectedTabs.includes(tabId)) {
            selectedTabs.push(tabId); // Add tab to selection
            clickedTab.classList.add('selected'); // Highlight selected tab visually
            console.log(`Tab ${tabId} selected for merge`);
        } else {
            selectedTabs.remove(tabId)
            clickedTab.classList.remove('selected'); // Highlight selected tab visually
            console.log(`Tab ${tabId} removed for merge`);
        }
    }
}

// Function to handle confirm button click
function handleConfirm() {
    console.log("Confirmed");
    isMergeActive = false;
    // Add your logic here
    cleanup();
    console.log("processing merge", selectedTabs)
}

// Function to handle cancel button click
function handleCancel() {
    console.log("Cancelled");
    selectedTabs = [];
    // Add your logic here
    cleanup();
    isMergeActive = false;
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
}

