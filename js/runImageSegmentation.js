// Debugging: Check if the script is loaded
console.log('image-segmentation file loaded');

const runGameFinder = document.getElementById("runGameFinder");

// Check if the runGameFinder is selected correctly
if (runGameFinder) {
    console.log('run-game-finder box found');
} else {
    console.error('run-game-finder box not found');
}

runGameFinder.addEventListener('click', function() {
    console.log("run-button clicked")
    window.electronAPI.runGameFinder("find-all-masks");
})