const fileContainer = document.getElementById("listGamesBundleImages");
const dropzoneBox = document.getElementById('dropzone');
const originalGameAssigner = document.getElementById("gameAssignerContainer").innerHTML

if (fileContainer) {
    console.log("Found fileContainer");
} else {
    console.log("Cant find fileContainer");
}

window.onload = loadFiles();

async function loadFiles() {
    console.log("File Loading activated");
    const folderObjectsArray = await window.electronAPI.getAssetsFolder();

    folderObjectsArray.forEach(folderObject => {
        addTab(folderObject)
    });
}

async function clickFile(e) {
    const currentFileTab = e.currentTarget;
    console.log("Clicked filetab:", currentFileTab.id);
    const isDisabled = currentFileTab.getAttribute('disabled') !== null;
    console.log(isDisabled);
    if (isDisabled) {
        console.log("cant reactivate this tab")
        return;
    };

    document.getElementById('gameAssignerContainer').innerHTML = originalGameAssigner;
    document.getElementById("gameAssignerContainer").classList.add("hidden")

    const fileTabs = fileContainer.querySelectorAll('fileTab');
    fileTabs.forEach(fileTab => {
        fileTab.removeAttribute('disabled');
        if (fileTab.classList.contains('active'))
            fileTab.classList.remove('active');
    })
    

    currentFileTab.classList.add('active');
    currentFileTab.setAttribute('disabled', true);

    const imagePath = currentFileTab.getAttribute('imagePath')
    const jsonPath = currentFileTab.getAttribute('jsonPath')
    try {
        await window.electronAPI.setBackendAttributes(currentFileTab.getAttribute('folderPath'), imagePath, jsonPath, currentFileTab.id, currentFileTab.getAttribute('temp'));
    } catch (err) {
        console.error("couldnt set attribute", err)
    }
    document.getElementById('gameAssignerContainer').classList.remove('hidden')
    const img = document.createElement('img');
    img.src = imagePath;
    img.classList.add('dropped-image');
    //remove existing images
    dropzoneBox.innerHTML = '';
    dropzoneBox.appendChild(img);
    if (jsonPath !== null) {
        await window.electronAPI.sendTaskCompleted('masks-added-signal');
    }
}

window.electronAPI.readSignalAddUpdateTab(async (message) => {
    console.log(message)
    console.log("Its been activated")
    const varObject = await window.electronAPI.getAllVariables()
    console.log("var object", varObject)
    const currentTabs = fileContainer.querySelectorAll("fileTab") 
    const tabIds = Array.from(currentTabs).map(tab => tab.id);
    if (!tabIds.includes(varObject.uniqueHash)) {
        addTab(varObject, true)
    } else {
        console.log("for updating tabs")
        const tab = document.getElementById(varObject.uniqueHash)
        if (tab.getAttribute('temp') !== varObject.temp) {
            updateTab(tab, varObject)
        }


    }
});

function addTab(object, new_tab=false) {
    const fileTab = document.createElement('fileTab');
    fileTab.className = 'fileTab';
    fileTab.id = object.uniqueHash;
    fileTab.setAttribute('folderPath', object.folderPath);
    fileTab.setAttribute('imagePath', object.imagePath);
    fileTab.setAttribute('jsonPath', object.jsonPath);
    fileTab.setAttribute('temp', object.temp)
    
    fileTab.textContent = object.uniqueHash;
    fileContainer.appendChild(fileTab)

    //add handle click for fileTabs
    fileTab.addEventListener("click", clickFile);
    if (new_tab) {
        fileTab.classList.add('active');
        fileTab.setAttribute('disabled', true);
    }
}

function updateTab(tab, object) {
    console.log("folder path", object.folderPath)
    console.log("image path", object.imagePath)
    console.log("json path", object.jsonPath)
    console.log("temp", object.temp)

    tab.setAttribute('folderPath', object.folderPath);
    tab.setAttribute('imagePath', object.imagePath);
    tab.setAttribute('jsonPath', object.jsonPath);
    tab.setAttribute('temp', object.temp)
}