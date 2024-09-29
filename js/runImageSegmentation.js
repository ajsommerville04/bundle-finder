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
            //console.log("Background:", mask)
        });

        Object.values(games).forEach(mask => {
            createTabDiv(mask, gameList, true);  
            //console.log("Games:", mask)
        });
        
    } catch (error) {
        console.error("Error running script and adding tabs", error)
    };
});

// Function to handle tab clicks
function handleTabClick(event) {
    // Add 'active' class to the clicked tab
    const tab = event.currentTarget.parentElement;
    const currentTabID = tab.id ;
    const currentMaskedImage = document.getElementById("img_" + currentTabID);
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
    const tabHeaderPrimary = document.createElement('div');
    const tabFolder = document.createElement('div');

    tabHeaderPrimary.className = active ? 'tab active' : 'tab';
    tabHeaderPrimary.setAttribute('data-image', mask.filePath);
    tabHeaderPrimary.id = mask.name;
     
    //tabHeader
    // Create dropdown button
    const dropdownButton = document.createElement('button');
    dropdownButton.className = "tab-button";
    dropdownButton.textContent = '>';
    dropdownButton.id = "tabButtonDropdown";
    tabHeaderPrimary.appendChild(dropdownButton);
    
    
    // Create the container for text
    const textContainer = document.createElement('div');
    textContainer.className = 'text-container';
    textContainer.textContent = mask.name;
    tabHeaderPrimary.appendChild(textContainer);
    tab.appendChild(tabHeaderPrimary)

    // tabFolder
    tabFolder.className = 'tab-folder hidden';
    mask.internal.forEach((maskInternal, index) => {
        const tabHeaderSecondary = document.createElement('div')
        tabHeaderSecondary.className = 'tab';
        tabHeaderSecondary.setAttribute('data-image', maskInternal.filePath);
        tabHeaderSecondary.id = mask.name + '@' + index;
        
        //tabHeader
        // Create dropdown button
        const dropdownButton = document.createElement('button');
        dropdownButton.className = "tab-button";
        dropdownButton.textContent = '>';
        dropdownButton.id = "tabButtonDropdown";
        dropdownButton.disabled = true;
        tabHeaderSecondary.appendChild(dropdownButton);
        
        
        // Create the container for text
        const textContainer = document.createElement('div');
        textContainer.className = 'text-container';
        textContainer.textContent = mask.name + '@' + index;
        tabHeaderSecondary.appendChild(textContainer);
        tabFolder.appendChild(tabHeaderSecondary);

        const maskImage = document.createElement('img');
        maskImage.className = "maskImage hidden";
        maskImage.src = maskInternal.filePath;
        maskImage.id = "img_" + mask.name + '@' + index;
        dropzone.appendChild(maskImage)
        maskImage.style.position = 'absolute';

        textContainer.addEventListener('click', handleTabClick);
    });

    tab.appendChild(tabFolder)
    element.appendChild(tab);

    textContainer.addEventListener('click', handleTabClick);
    dropdownButton.addEventListener("click", handleDropdownButtonClick);

    const maskImage = document.createElement('img');
    maskImage.className = active ? 'maskImage': "maskImage hidden";
    maskImage.src = mask.filePath;
    maskImage.id = "img_" + mask.name
    dropzone.appendChild(maskImage)
    maskImage.style.position = 'absolute'; 
}

function handleDropdownButtonClick(event) {
    // Get the parent 'tab' element
    const tab = event.currentTarget.parentElement.parentElement;
    
    // Find the 'tabFolder' inside the parent 'tab'
    const tabFolder = tab.querySelector('.tab-folder');

    // Toggle the 'hidden' class on the 'tabFolder'
    if (tabFolder.classList.contains('hidden')) {
        tabFolder.classList.remove('hidden');
        event.currentTarget.textContent = 'v';  // Change the dropdown button text to indicate it's expanded
    } else {
        tabFolder.classList.add('hidden');
        event.currentTarget.textContent = '>';  // Change the dropdown button text back to indicate it's collapsed
    }
}