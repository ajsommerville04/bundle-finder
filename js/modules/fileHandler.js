const fs = require('fs');
const os = require('os');
const crypto = require('crypto')
const path = require('path');
const fse = require('fs-extra');

async function tempFileCreate(buffer, appBasePath) {
    let folderPath = '';
    let imagePath = '';
    let jsonFile = null;
    let temp = false

    //convert buffer to uint8array 
    const fileBuffer = Buffer.from(new Uint8Array(buffer));
    //generate unique hash key
    const uniqueHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    //check if theres a folder in assets that has name of hash key - set filePath = to this
    const assetsUniqueFolder = path.join(appBasePath, "assets", uniqueHash);
    if (fs.existsSync(assetsUniqueFolder)) {
        console.log("save found!!")
        folderPath = assetsUniqueFolder;
        //set imageFilePath to filepath + img.webp
        imagePath = path.join(assetsUniqueFolder, "img.webp");
        //check if theres a file in this folder with name mask_metadata.json
        const jsonFileCheck = path.join(assetsUniqueFolder, "mask_metadata.json");
        if (fs.existsSync(jsonFileCheck)) {
            // if there is set maskJson to this path
            // else maskJson is null
            jsonFile = jsonFileCheck;
        };
    } else {
        console.log("no save found")
        temp = true;
        const tempDir = os.tmpdir(); // Get the OS's temp directory
        folderPath = path.join(tempDir, 'basic-gui', uniqueHash);
        //make dir in temp dir for this image
        fs.mkdirSync(folderPath, { recursive: true });

        imagePath = path.join(folderPath, "img.webp");

        try {
            await fs.promises.writeFile(imagePath, fileBuffer);
        } catch (error) {
            console.error('Error writing final image file:', error);
            throw error;
        }   
    }
    return [folderPath, imagePath, jsonFile, path.sep, uniqueHash, temp];
}





function readJson(jsonFilePath) {
    const data = fs.readFileSync(jsonFilePath, "utf-8");
    return JSON.parse(data);
}

function updateJson(data, jsonPath) {
    console.log("Update Json", jsonPath);
    const jsonString = JSON.stringify(data, null, 4);
    fs.writeFile(jsonPath, jsonString, (err) => {
        if (err) {
            console.error('Error writing to JSON file:', err);
        } else {
            console.log('JSON file has been saved successfully!');
        }
    });
}

async function saveTempToPermanant(tempFolderPath, appFolderPath, json) {
    const uniqueDirName = path.basename(tempFolderPath);
    const newDir = path.join(appFolderPath, "assets", uniqueDirName)
    let jsonPath = null;
    // Check if the target directory already exists
    if (!fs.existsSync(newDir)) {
        fs.mkdirSync(newDir);
        console.log(`Created target directory at: ${newDir}`);
        // Now copy all contents from the temporary directory to the target directory
        await copyDirectory(tempFolderPath, newDir);
        deleteDirectoryRecursive(tempFolderPath);

        
        
        
    } else {
        console.log(`Directory already exists: ${newDir}. Json File saved`);
    } 
    if (json !== null) {
        jsonPath = path.join(newDir, "mask_metadata.json");
    }
    
    return [newDir, path.join(newDir, "img.webp"), jsonPath];
}

// Function to copy a directory recursively
async function copyDirectory(sourceDir, targetDir) {
    try {
        await fse.copy(sourceDir, targetDir);
        console.log(`Copied from ${sourceDir} to ${targetDir}`);
    } catch (err) {
        console.error('Error while copying directory:', err);
    }
}

function deleteDirectoryRecursive(dir) {
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach((file) => {
            const currentPath = path.join(dir, file);
            if (fs.lstatSync(currentPath).isDirectory()) {
                // Recursively delete subdirectory
                deleteDirectoryRecursive(currentPath);
            } else {
                // Delete file
                fs.unlinkSync(currentPath);
            }
        });
        fs.rmdirSync(dir); // Remove the empty directory
        console.log(`Deleted directory: ${dir}`);
    } else {
        console.log(`Directory not found: ${dir}`);
    }
}

function getAssetsFolder(appFolderPath, temp) {
    const assetsFolderPath = path.join(appFolderPath, "assets")
    const imageFolders = fs.readdirSync(assetsFolderPath).filter(item => {
        const itemPath = path.join(assetsFolderPath, item);
        return fs.statSync(itemPath).isDirectory();
    }).map(item => path.join(assetsFolderPath, item));
    //make array of a dictionary
    const returnFolder = [];
    imageFolders.forEach(folderPath => {
        const info = {};
        info['uniqueHash'] = path.basename(folderPath)
        info['jsonPath'] = path.join(folderPath, "mask_metadata.json")
        info['imagePath'] = path.join(folderPath, 'img.webp')
        info['folderPath'] = folderPath
        info['temp'] = false
        returnFolder.push(info)
    })
    console.log("this should be an array of objects", returnFolder)
    return returnFolder
}

function getSeperator() {
    return path.sep
}

module.exports = { tempFileCreate, readJson, updateJson, saveTempToPermanant, getAssetsFolder, getSeperator};