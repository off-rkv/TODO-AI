const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true, // ✅ ADD THIS
      contextIsolation: false, // ✅ ADD THIS
      preload: path.join(__dirname, "preload.js"), // Optional
    },
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
  });

  mainWindow.loadFile("pages/index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
