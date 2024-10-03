const fs = require('fs');
const os = require('os');
const crypto = require('crypto')
const path = require('path');
const { fileURLToPath } = require('url');
const fse = require('fs-extra');

let jsonFilePathMem = ''


async function tempFileCreate(filename, buffer) {
    // Store the image temporarily
    console.log(filename);
    const tempDir = os.tmpdir(); // Get the OS's temp directory
    const appTempDir = path.join(tempDir, 'basic-gui');
    
    // Ensure the appTempDir exists
    if (!fs.existsSync(appTempDir)) {
        fs.mkdirSync(appTempDir, { recursive: true });
    }

    const tempTempFilePath = path.join(tempDir, filename);
    
    // Convert buffer to a Buffer instance
    const fileBuffer = Buffer.from(new Uint8Array(buffer));

    // Write the temporary file
    try {
        await fs.promises.writeFile(tempTempFilePath, fileBuffer);
    } catch (error) {
        console.error('Error writing temporary file:', error);
        throw error; // Handle error as needed
    }

    // Create a unique directory and get its path
    const tempFilePath = createUniqueDirectory(tempTempFilePath, appTempDir);
    const tempFile = path.join(tempFilePath, "img.webp");

    // Write the final image file to the unique directory
    try {
        await fs.promises.writeFile(tempFile, fileBuffer);
    } catch (error) {
        console.error('Error writing final image file:', error);
        throw error; // Handle error as needed
    }

    // Delete the temporary file
    fs.unlink(tempTempFilePath, (err) => {
        if (err) {
            console.error(`Error deleting temp file: ${err.message}`);
        } else {
            console.log('Temporary file deleted');
        }
    });

    return tempFile; // Return the path of the final image file
}

function generateImageHash(imagePath) {
    try {
        const imageBuffer = fs.readFileSync(imagePath);  // Read the image file into a buffer
        // Create a hash of the image using SHA-256
        const hash = crypto.createHash('sha256').update(imageBuffer).digest('hex');
        return hash;
    } catch (error) {
        console.error('Error generating hash:', error);
    }
}

// Function to create a unique directory based on the image hash
function createUniqueDirectory(imagePath, baseDir) {
    try {
        // Generate a hash from the image
        const hash = generateImageHash(imagePath);

        // Create the directory path
        const uniqueDir = path.join(baseDir, hash);

        // Ensure the directory exists
        fs.mkdirSync(uniqueDir, { recursive: true });

        console.log(`Directory created: ${uniqueDir}`);
        return uniqueDir;
    } catch (error) {
        console.error('Error creating directory:', error);
    }
}

function readJson(jsonFilePath) {
    jsonFilePathMem = jsonFilePath
    const data = fs.readFileSync(jsonFilePath, "utf-8");
    return JSON.parse(data);
}

function updateJson(data) {
    console.log("Update Json", jsonFilePathMem);
    const jsonString = JSON.stringify(data, null, 4);
    fs.writeFile(jsonFilePathMem, jsonString, (err) => {
        if (err) {
            console.error('Error writing to JSON file:', err);
        } else {
            console.log('JSON file has been saved successfully!');
        }
    });
}

async function savePerm(image_path) {
    const full_temp_dir_name = fileURLToPath(path.dirname(image_path));
    const uniqueDirName = path.basename(full_temp_dir_name);
    const assetsFolderPath = ensureAssetsFolder();
    console.log(assetsFolderPath);
    console.log("+ ", uniqueDirName);

    // Create the unique directory inside the assets folder
    const targetDir = path.join(assetsFolderPath, uniqueDirName);
    const new_image_path = path.join(targetDir, "img.webp");

    // Check if the target directory already exists
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
        console.log(`Created target directory at: ${targetDir}`);
        // Now copy all contents from the temporary directory to the target directory
        await copyDirectory(full_temp_dir_name, targetDir);
        deleteDirectoryRecursive(full_temp_dir_name);
        
        
    } else {
        console.log(`Directory already exists: ${targetDir}`);
    } 
    return new_image_path;

    
    

}

function ensureAssetsFolder() {
    // Get the base path of your app (in Electron, use app.getAppPath() for the app path)
    const appBasePath = path.resolve(__dirname, '../../'); // or app.getAppPath() if in Electron

    // Create the assets folder path
    const assetsFolderPath = path.join(appBasePath, 'assets');

    // Check if the assets folder exists
    if (!fs.existsSync(assetsFolderPath)) {
        // If it doesn't exist, create the assets folder
        fs.mkdirSync(assetsFolderPath);
        console.log(`Created 'assets' folder at: ${assetsFolderPath}`);
    } else {
        console.log(`'assets' folder already exists at: ${assetsFolderPath}`);
    }

    // Return the assets folder path for further use
    return assetsFolderPath;
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

module.exports = { tempFileCreate, readJson, updateJson, savePerm};