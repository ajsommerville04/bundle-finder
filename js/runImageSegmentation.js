// Debugging: Check if the script is loaded
console.log('image-segmentation file loaded');

const runGameFinder = document.getElementById("runGameFinder");
const gameList = document.getElementById("gameslist");
const gameAssigner = document.getElementById("gameAssignerContainer");
const dropzone = document.getElementById("dropzone")


// Check if the runGameFinder is selected correctly
if (runGameFinder) {
    console.log('run-game-finder box found');
} else {
    console.error('run-game-finder box not found');
}

runGameFinder.addEventListener('click', async function() {
    console.log("run-button clicked")
    try {
        const [files, imagesDirPath] = await window.electronAPI.runGameFinder("find-all-masks");
        
        if (!files || files.length === 0) {
            console.error("No files were generated or returned")
        return;
        }
        gameAssigner.classList.remove('hidden');
        files.forEach((file, index) => {
            const tab = document.createElement('div');
            tab.className = 'tab active';
            tab.setAttribute('data-image', imagesDirPath + file);
            const tabName = file.substring(0, file.lastIndexOf('.'))
            tab.id = 'file' + tabName
            tab.textContent = tabName; // Set tab text to the file name or relevant information
            gameList.appendChild(tab);
            tab.addEventListener('click', handleTabClick);

            const maskImage = document.createElement('img');
            maskImage.className = 'maskImage';
            maskImage.src = imagesDirPath + file;
            maskImage.id = 'file' + tabName
            dropzone.appendChild(maskImage)
            maskImage.style.position = 'absolute'; 
            maskImage.style.zIndex = 10 + index;

        });
    } catch (error) {
        console.error("Error running script and adding tabs", error)

    };
});

// Function to handle tab clicks
function handleTabClick(event) {
    // Add 'active' class to the clicked tab
    const tab = event.currentTarget;
    const currentTabID = tab.id ;
    const currentMaskedImage = document.getElementById(currentTabID);
     // If the tab already has the 'active' class, remove it (unactivate)
     if (tab.classList.contains('active')) {
        tab.classList.remove('active');
        currentMaskedImage.classList.add('hidden');


    } else {
        tab.classList.add('active');
        currentMaskedImage.classList.remove('hidden');
    }
}


