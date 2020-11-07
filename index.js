const { app, BrowserWindow } = require("electron");

function startWindow() {
  const main = new BrowserWindow({
    width: 985,
    height: 560,
    minWidth: 985,
    minHeight: 560,
    webPreferences: {
      // devTools: false,
      nodeIntegration: true,
      enableRemoteModule: true
    },
    transparent: true,
    backgroundColor: 'transparent',
    icon: 'icon.png',
    fullscreenable: false,
    autoHideMenuBar: true
  });

  main.loadFile('index.html');
}

app.whenReady().then(() => {
  startWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) startWindow();
  })
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});