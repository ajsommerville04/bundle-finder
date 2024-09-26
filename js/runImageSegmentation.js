// Debugging: Check if the script is loaded
console.log('image-segmentation file loaded');

const runGameFinder = document.getElementById("runGameFinder");
const gameList = document.getElementById("gameslist");
const backgroundList = document.getElementById("backgroundlist")
const gameAssigner = document.getElementById("gameAssignerContainer");
const dropzone = document.getElementById("dropzone");

let maskData = {};


// Check if the runGameFinder is selected correctly
if (runGameFinder) {
    console.log('run-game-finder box found');
} else {
    console.error('run-game-finder box not found');
};

runGameFinder.addEventListener('click', async function() {
    console.log("run-button clicked")
    try {
        const imagesDirPath = await window.electronAPI.runGameFinder("find-all-masks");
        
        
        gameAssigner.classList.remove('hidden');
        console.log(imagesDirPath)
        maskData = await window.electronAPI.readJson(imagesDirPath + "mask_metadata.json")
        const background = maskData.background;
        const games = maskData.games;
        console.log(typeof background);

        Object.values(background).forEach(mask => {
            createTabDiv(mask, backgroundList); 
        });

        Object.values(games).forEach(mask => {
            createTabDiv(mask, gameList, true);  
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

function createTabDiv(mask, element, active=false) {
    const tab = document.createElement('div');
    tab.className = active ? 'tab active' : 'tab';
    tab.setAttribute('data-image', mask.filePath);
    tab.id = mask.name

    // Create buttons
    const button1 = document.createElement('button');
    button1.className = "tab-button";
    button1.textContent = '1';
    tab.appendChild(button1);

    // Create the container for text
    const textContainer = document.createElement('div');
    textContainer.className = 'text-container';
    textContainer.textContent = mask.name; // Or any relevant text
    tab.appendChild(textContainer);

    // Create additional buttons
    const button2 = document.createElement('button');
    button2.className = "tab-button";
    button2.textContent = '2';
    tab.appendChild(button2);

    const button3 = document.createElement('button');
    button3.className = "tab-button";
    button3.textContent = '3';
    tab.appendChild(button3);

    const button4 = document.createElement('button');
    button4.className = "tab-button";
    button4.textContent = '4';
    tab.appendChild(button4);

    element.appendChild(tab);
    tab.addEventListener('click', handleTabClick);

    const maskImage = document.createElement('img');
    maskImage.className = active ? 'maskImage': "maskImage hidden";
    maskImage.src = mask.filePath;
    maskImage.id = mask.name
    dropzone.appendChild(maskImage)
    maskImage.style.position = 'absolute'; 
}

function createButton(textContent, id) {
    const button = document.createElement('button');
    button.className = "tab-button";
    button.textContent = textContent
    button.id = id
    tab.appendChild(button)

}


