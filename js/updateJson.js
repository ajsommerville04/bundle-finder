let folderDir = null;

window.electronAPI.readSignalUpdateJson(async (message) => {
    console.log("activation:", message)
    try {
        console.log("folderDir:", folderDir)
        const data = await extractTabData();  // Await the data extraction
        await window.electronAPI.updateJson(data);  // Await the updateJson call
    } catch (error) {
        console.error('Error during JSON update:', error); // Log any errors
    }
    });


async function extractTabData() {
    folderDir = await window.electronAPI.getFolderPath()
    console.log("Find this message",folderDir)
    const data = {
        background: {},
        games: {}
    };

    document.querySelectorAll('.primaryContainer').forEach((primaryContainer, index) => {
        let masksGroup = '';
        if (index === 0) {
            masksGroup = 'games';
        } else {
            masksGroup = 'background';
        }
        // Get all tab containers within this primary container
        const tabContainers = Array.from(primaryContainer.querySelectorAll('.tab-container')).filter(tab => {
            return !tab.closest('.tab-folder');
        });

        tabContainers.forEach(tabContainer => {
            // Find the tab and tab-folder within this tab-container
            const tab = tabContainer.querySelector('.tab');
            const tabFolder = tabContainer.querySelector('.tab-folder');
            
            const info = getContainerInfo(tab);
            info['internal'] = [];

            tabFolder.querySelectorAll('.tab-container').forEach(interalTabContainer => {
                const internalTab = interalTabContainer.querySelector('.tab')
                const interalInfo = getContainerInfo(internalTab);
                info['internal'].push(interalInfo)
            });
            data[masksGroup][tab.id] = info
        });
    });
    console.log(data);
    return data;
}

function getContainerInfo(tab) {
    const tabName = tab.id 
    console.log(tab.getAttribute('data-image'))
    const tabFilePath = stripBasePath(tab.getAttribute('data-image'));                  
    console.log("the tab file path is: ",tabFilePath)
    const tabDataArea = parseInt(tab.getAttribute('data-area'));                       
    const tabDataBbox = tab.getAttribute('data-bbox').split(',').map(Number);                      

    const info = {
    name: tabName,
    filePath: tabFilePath,
    area: tabDataArea,
    bbox: tabDataBbox
    }

    return info
}

function stripBasePath(fullPath) {
    // Remove the basePath from the fullPath
    const strippedPath = fullPath.replace(folderDir, '');
    return strippedPath;
}


