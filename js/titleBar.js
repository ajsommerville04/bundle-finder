
document.getElementById('minimize').addEventListener('click', () => {
    window.electronAPI.minimizeWindow();
});

document.getElementById('maximize').addEventListener('click', () => {
    window.electronAPI.maximizeWindow();
});

document.getElementById('quit').addEventListener('click', () => {
    window.electronAPI.closeWindow();
});