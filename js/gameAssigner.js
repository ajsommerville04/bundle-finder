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
    console.log("merge function activated")
    // Select all primary containers
    const primaryContainers = document.querySelectorAll('.primaryContainer');
    const confirmDenyContainer = document.getElementById("confirm-deny-container")

    confirmDenyContainer.classList.remove("hidden")
    
    // Loop through each primary container to handle its tabs
    primaryContainers.forEach(primaryContainer => {
        // Get all tab containers within this primary container
        const tabContainers = Array.from(primaryContainer.querySelectorAll('.tab-container'));
        
        // Deactivate all tabs within the primary container
        deactivateAllTabs(tabContainers);

    });
    console.log('All tabs deactivated in primary container');

}