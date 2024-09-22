const fs = require('fs');
const os = require('os');
const crypto = require('crypto')
const path = require('path');


function tempFileCreate(file) {
    // Store the image temporarily
    console.log(file)
    const tempDir = os.tmpdir(); // Get the OS's temp directory
    const appTempDir = path.join(tempDir, 'basic-gui')
    const tempTempFilePath = path.join(tempDir, file.name);
    
    // Read the file and write it to a temporary location
    
    saveImage(file, tempTempFilePath)
    const tempFilePath = createUniqueDirectory(tempTempFilePath, appTempDir)
    const tempFile = path.join(tempFilePath, "img.webp")
    saveImage(file, tempFile)

    fs.unlink(tempTempFilePath, (err) => {
        if (err) {
            console.error(`Error deleting temp file: ${err.message}`);
        } else {
            console.log('Temporary file deleted');
        }
    });



    return tempFile
}

function saveImage(file, tempFileName) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const buffer = Buffer.from(new Uint8Array(event.target.result));
        fs.writeFile(tempFileName, buffer, (err) => {
            if (err) {
                console.error('Error writing temp temp file:', err);
            } else {
                console.log('Temporary Temporary file saved:', tempFileName);
            }
        });
    };
    reader.readAsArrayBuffer(file); // Read file as array buffer

}

function generateImageHash(imagePath) {
    try {
        const imageBuffer = fs.readFileSync(imagePath);  // Read the image file into a buffer

        // Create a hash of the image using SHA-256 (or MD5, SHA-1, etc.)
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

module.exports = { tempFileCreate };