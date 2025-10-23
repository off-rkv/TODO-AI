const { BrowserWindow } = require("@electron/remote");

document.addEventListener("DOMContentLoaded", function () {
  const currentWindow = BrowserWindow.getFocusedWindow();

  // Red - Close
  document.querySelector(".light.red").addEventListener("click", () => {
    currentWindow.close();
  });

  // Yellow - Minimize
  document.querySelector(".light.yellow").addEventListener("click", () => {
    currentWindow.minimize();
  });

  // Green - Maximize/Restore
  document.querySelector(".light.green").addEventListener("click", () => {
    if (currentWindow.isMaximized()) {
      currentWindow.restore();
    } else {
      currentWindow.maximize();
    }
  });
});
