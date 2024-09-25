const { spawn } = require('child_process');
const path = require('path')
const fs = require("fs")

//This may be temporary till i figure out the correct way to do this
let venv = `C:/Users/alex/Programming/python_venvs/ebay/Scripts/python.exe`;

function runScript(scriptName, imagePath) {
    console.log(scriptName)
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn( venv, [`C:/Users/alex/Programming/Projects/basic-gui/python/${scriptName}.py`, imagePath]);
        pythonProcess.stdout.on('data', (data) => {
            const message = data.toString().trim();
            console.log(`stdout: ${message}`);
        
            //send progress updates from here
        });
        
        // Capture stderr (error output)
        pythonProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
        
        // Detect when the Python process ends
        pythonProcess.on('close', (code) => {
            console.log(`Python process exited with code ${code}`);
            const gameImgFiles = path.join(path.dirname(imagePath), 'mask-bin');
            const fileSeparator = path.sep;
            const basePath = gameImgFiles + fileSeparator

            fs.readdir(gameImgFiles, (err, files) => {
                if (err) {
                    return console.error('Unable to read directory: ' + err);
                }

                // Natural sort comparison function
                function naturalCompare(a, b) {
                    const regex = /(\d+)|(\D+)/g;
                    const aParts = a.match(regex);
                    const bParts = b.match(regex);

                    for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
                        const aPart = aParts[i];
                        const bPart = bParts[i];

                        if (!isNaN(aPart) && !isNaN(bPart)) {
                            const numA = parseInt(aPart, 10);
                            const numB = parseInt(bPart, 10);
                            if (numA !== numB) return numA - numB;
                        } else if (aPart !== bPart) {
                            return aPart.localeCompare(bPart);
                        }
                    }

                    return aParts.length - bParts.length;
                }

                

                sortedFiles = files.sort(naturalCompare);
                resolve([sortedFiles, basePath]);
            });
        });
    });
}




module.exports = { runScript };