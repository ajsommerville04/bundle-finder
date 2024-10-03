const { spawn } = require('child_process');
const path = require('path')
const fs = require("fs")

//This may be temporary till i figure out the correct way to do this
let venv = `C:/Users/alex/Programming/python_venvs/ebay/Scripts/python.exe`;

function runScript(scriptName, imagePath) {
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
            jsonPath = path.join(path.dirname(imagePath), "mask_metadata.json")
            resolve(jsonPath);
        });
    });
}




module.exports = { runScript };