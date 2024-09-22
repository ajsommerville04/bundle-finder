
document.getElementById('minimize').addEventListener('click', () => {
    console.log("minimise clicked")
    window.electronAPI.minimizeWindow();
});

document.getElementById('maximize').addEventListener('click', () => {
    window.electronAPI.maximizeWindow();
});

document.getElementById('quit').addEventListener('click', () => {
    window.electronAPI.closeWindow();
});