// Debugging: Check if the script is loaded
console.log('image-segmentation file loaded');

// Get necessary DOM elements
const runGameFinder = document.getElementById("runGameFinder");

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

        document.getElementById("gameAssignerContainer").classList.remove('hidden');
        
        //send signal here
        window.electronAPI.sendTaskCompleted("masks-added-signal", imagesDirPath);
    } catch (error) {
        console.error("Error running 'run' script", error);
    }
});












