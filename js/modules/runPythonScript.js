const { spawn } = require('child_process');

//This may be temporary till i figure out the correct way to do this
let venv = `C:/Users/alex/Programming/python_venvs/ebay/Scripts/python.exe`;

function runScript(scriptName, imagePath) {
    console.log(scriptName)
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
    });
}




module.exports = { runScript };