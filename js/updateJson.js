window.electronAPI.readSignalUpdateJson((message) => {
    console.log("message ting bob", message)
    const data = extractTabData()


    
    window.electronAPI.updateJson(data)
    });

function extractTabData() {
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
    const tabFilePath = tab.getAttribute('data-image');                  
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

