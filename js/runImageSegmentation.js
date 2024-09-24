// Debugging: Check if the script is loaded
console.log('image-segmentation file loaded');

const runGameFinder = document.getElementById("runGameFinder");
const gameAssigner = document.getElementById("gameslist")

// Check if the runGameFinder is selected correctly
if (runGameFinder) {
    console.log('run-game-finder box found');
} else {
    console.error('run-game-finder box not found');
}

runGameFinder.addEventListener('click', async function() {
    console.log("run-button clicked")
    try {
        const files = await window.electronAPI.runGameFinder("find-all-masks");
        
        if (!files || files.length === 0) {
            console.error("No files were generated or returned")
        return;
        }
        console.log("files", files)
        files.forEach(file => {
            console.log("file:", file)
            const tab = document.createElement('div');
            tab.className = 'tab';
            tab.textContent = file.substring(0, file.lastIndexOf('.')); // Set tab text to the file name or relevant information
            gameAssigner.appendChild(tab);
            tab.addEventListener('click', handleTabClick);
        });
    } catch (error) {
        console.error("Error running script and adding tabs", error)

    };
});

// Function to handle tab clicks
function handleTabClick(event) {
    // Add 'active' class to the clicked tab
    const tab = event.currentTarget;
     // If the tab already has the 'active' class, remove it (unactivate)
     if (tab.classList.contains('active')) {
        tab.classList.remove('active');
    } else {
        tab.classList.add('active');
    }
}


