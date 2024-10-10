
let folderDir;

window.electronAPI.tempLoadPossible(([message]) => {
    console.log("loading json possible masks");
    console.log(message);
    loadJson()
});

async function loadJson() {
    const varObject = await window.electronAPI.getAllVariables()

    console.log(varObject);

    //Temporary set file path
    const tempfilePath =  'C:\\Users\\alex\\AppData\\Local\\Temp\\';
    folderDir = tempfilePath + varObject.seperator + 'basic-gui' + varObject.seperator + varObject.uniqueHash + varObject.seperator
    const jsonFilePath = folderDir  + 'possible_mask_metadata.json';

    const receivedData = await window.electronAPI.readJson(jsonFilePath);
    console.log("this should be an object from the json file", receivedData);

    for (let key in receivedData) {
        createTabHeader(key, receivedData[key])
    }
};

function createTabHeader(name, mask) {
    const tabHeader = document.createElement('div');
    tabHeader.className = 'tab';
    tabHeader.setAttribute('data-image', folderDir + mask.filePath);
    tabHeader.setAttribute('data-area', mask.area);
    tabHeader.setAttribute('data-bbox', mask.bbox)
    tabHeader.id = name;

    // Dropdown button
    const dropdownButton = createButton('✓', '', 'confirm-btn', false);
    tabHeader.appendChild(dropdownButton);
    

    // Text container
    const textContainer = document.createElement('div');
    textContainer.className = 'text-container';
    textContainer.textContent = mask.name;
    textContainer.addEventListener('click', handleTabClick);

    tabHeader.appendChild(textContainer);
    createMaskImage(name, mask)
    document.getElementById('possible-masks-container').appendChild(tabHeader)


}

function createMaskImage(name, mask, active = false) {
    const maskImage = document.createElement('img');
    const dropzone = document.getElementById("dropzone")
    maskImage.className = active ? 'maskImage' : 'maskImage hidden';
    maskImage.draggable = false;
    maskImage.src = folderDir + mask.filePath;
    maskImage.id = `img_${name}`;
    maskImage.style.position = 'absolute';
    dropzone.appendChild(maskImage);
}

function createButton(text, className, id, disabled = false) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = className;
    button.id = id;
    if (disabled) button.disabled = true;
    return button;
}

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