const path = require("path");
const { app, BrowserWindow, powerMonitor, session } = require("electron");
const isDev = require("electron-is-dev");
const vaultEvents = require("../api/events");
const { handleIpcs } = require("../public/ipc");
const { lockVault } = require("../api/vault");

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // Another instance is already running
  if (!isDev) {
    app.quit();
  }
} else {
  // This is the first instance, handle second instance attempts
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // Focus the existing window instead
    const windows = BrowserWindow.getAllWindows();

    if (windows.length > 0) {
      const win = windows[0];

      // Restore if minimized
      if (win.isMinimized()) {
        win.restore();
      }

      // Focus the window
      win.focus();

      // win.webContents.send('app:already-running');
    }
  });
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
      width: 940,
      height: 660,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        enableRemoteModule: false,
        webSecurity: true,
        experimentalFeatures: false,
        disableBlinkFeatures: "Auxclick",
        navigateOnDragDrop: false,
      },
    });

    win.setTitle("Encryptoor");

    win.loadURL(
      isDev
        ? "http://localhost:3000"
        : `file://${path.join(__dirname, "../build/index.html")}`,
    );

    if (isDev) {
      win.webContents.openDevTools({ mode: "detach" });
    }

    vaultEvents.on("vault:locked", ({ reason }) => {
      if (!win || win.isDestroyed()) return;

      win.webContents.send("vault:locked", reason);
    });

    win.webContents.setWindowOpenHandler(() => {
      return { action: "deny" };
    });

    win.webContents.on("will-navigate", (e) => {
      e.preventDefault();
    });

    // app.on("browser-window-focus", () => {
    //   if (!win || win.isDestroyed()) return;

    //   win.webContents.send("ui:focus");
    // });

    // powerMonitor.on("resume", () => {
    //   if (!win || win.isDestroyed()) return;
    //   win.webContents.send("ui:focus");
    // });

    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;",
          ],
        },
      });
    });
  }

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // app.setName("Encryptoor");
  app.whenReady().then(() => {
    createWindow();

    const forbidden = ["--inspect", "--inspect-brk", "--remote-debugging-port"];
    if (process.argv.some((arg) => forbidden.includes(arg))) {
      app.quit();
    }
  });

  app.setName("Encryptoor");

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bars to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  process.on("uncaughtException", (err) => {
    lockVault("uncaughtException");

    app.exit(1);
  });

  app.on("before-quit", () => lockVault("quit"));

  app.on("will-quit", () => lockVault("quit"));

  app.on("browser-window-minimize", () => lockVault("minimize"));

  ["SIGINT", "SIGTERM"].forEach((sig) => {
    process.on(sig, () => {
      try {
        lockVault("signal");
        app.quit();
      } catch {
        app.exit(1); // fallback
      }
    });
  });

  if (!isDev) {
    app.on("web-contents-created", (_, contents) => {
      contents.on("devtools-opened", () => {
        lockVault("devtools not allowed");
        app.quit();
      });
    });
  }

  // not very user friendly
  // app.on("browser-window-blur", () => lockVault());

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      lockVault("on start");
    }
  });

  powerMonitor.on("suspend", () => lockVault("suspend"));

  powerMonitor.on("lock-screen", () => lockVault("lock-screen"));

  handleIpcs();
}
