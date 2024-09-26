const fs = require('fs');
const os = require('os');
const crypto = require('crypto')
const path = require('path');


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
    const data = fs.readFileSync(jsonFilePath, "utf-8");
    return JSON.parse(data);
}

module.exports = { tempFileCreate, readJson };