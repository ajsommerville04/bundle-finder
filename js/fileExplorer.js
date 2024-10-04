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
        const fileTab = document.createElement('fileTab');
        fileTab.className = 'fileTab';
        fileTab.id = folderObject.uniqueHash;
        fileTab.setAttribute('folderPath', folderObject.dirPath);
        fileTab.setAttribute('imagePath', folderObject.imagePath);
        fileTab.setAttribute('jsonPath', folderObject.jsonPath);
        
        fileTab.textContent = folderObject.uniqueHash;
        fileContainer.appendChild(fileTab)

        //add handle click for fileTabs
        fileTab.addEventListener("click", clickFile);
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
    try {
        await window.electronAPI.setBackendAttributes(currentFileTab.getAttribute('folderPath'), imagePath, currentFileTab.getAttribute('jsonPath'));
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

    await window.electronAPI.sendTaskCompleted('masks-added-signal');
    
    
}