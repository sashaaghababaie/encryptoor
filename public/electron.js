// ./public/electron.js
const path = require("path");
const { app, BrowserWindow } = require("electron");
const isDev = require("electron-is-dev");
const vaultEvents = require("../src/api/events");
const { handleIpcs } = require("../public/ipc");

function createWindow() {
  const win = new BrowserWindow({
    // frame: false,
    // titleBarStyle: "hidden",
    // titleBarOverlay: {
    //   color: "#2f3241",
    //   symbolColor: "#74b1be",
    //   height: 30,
    // },
    title: "Encryptoor",
    width: 920,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      enableRemoteModule: false,
    },
  });

  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }

  vaultEvents.on("vault:locked", ({ reason }) => {
    if (!win || win.isDestroyed()) return;

    win.webContents.send("vault:locked", reason);
  });

  // win.setTitle("Encryptoor");
}

// app.setName("Encryptoor");

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bars to stay active until the user quits
// explicitly with Cmd + Q.

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

handleIpcs();
