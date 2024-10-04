
const fileContainer = document.getElementById("listGamesBundleImages");
const checker = fileContainer.checkVisibility();
console.log("the visibility is: ", checker);

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
        fileTab.setAttribute('folderPath', folderObject.dirPath);
        fileTab.setAttribute('imagePath', folderObject.imagePath);
        fileTab.setAttribute('jsonPath', folderObject.jsonPath);
        fileTab.textContent = folderObject.uniqueHash;
        fileContainer.appendChild(fileTab)

        //add handle click for fileTabs
    });
}