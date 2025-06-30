// ./public/electron.js
const path = require("path");
const { ipcMain, app, BrowserWindow, dialog } = require("electron");
const isDev = require("electron-is-dev");

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  // win.loadFile("index.html");
  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }
}

const dbPath = isDev ? "desktop" : "userData";
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

// ipcMain handlers

//examples
// ipcMain.handle("init", async (event) => {
//   return await init(app.getPath(dbPath));
// });

// ipcMain.handle("openChangeDiractory", async (e) => {
//   let response = await dialog.showOpenDialog({ properties: ["openDirectory"] });
//   if (response.canceled) return { success: false };
//   const _path = response.filePaths[0];
//   return await someapi(app.getPath(dbPath), _path);
// });

// ipcMain.handle("openDialoge", async (e, arg1, arg2) => {
//   let response = dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow(), {
//     type: "question",
//     buttons: ["No", "Yes"],
//     title: "Confirm",
//     message: `${arg1}`,
//   });
//   if (response == 1) {
//     e.preventDefault();
//     return await someapi(app.getPath(dbPath), arg2);
//   }
// });
