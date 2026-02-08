const { ipcMain, BrowserWindow } = require("electron");
const { downloadUpdateWithProgress } = require("../api/update");
const {
  init,
  exportVault,
  createVault,
  unlockVault,
  upsertItem,
  requireSession,
  lockVault,
  changePassword,
  removeItem,
  requestCopyPassword,
  requestShowPassword,
  importVaultByFilePath,
  importVaultByBuffer,
} = require("../api/vault");

/**
 * IPC Handlers
 */
function handleIpcs() {
  ipcMain.handle("vault:init", (_) => {
    return init();
  });

  ipcMain.handle("vault:create", (_, pass, data) => {
    return createVault(pass, data);
  });

  ipcMain.handle("vault:unlock", (_, pass) => {
    return unlockVault(pass);
  });

  ipcMain.handle(
    "vault:export",
    (_, sessionId, useOldPass, oldPass, newPass) => {
      return exportVault(sessionId, useOldPass, oldPass, newPass);
    },
  );

  ipcMain.handle("vault:importByPath", (_, sessionId, pass, filePath) => {
    return importVaultByFilePath(sessionId, pass, filePath);
  });

  ipcMain.handle("vault:importByBuffer", (_, sessionId, pass, buffer) => {
    return importVaultByBuffer(sessionId, pass, buffer);
  });

  ipcMain.handle("vault:upsert", (_, sessionId, item) => {
    return upsertItem(sessionId, item);
  });

  ipcMain.handle("vault:remove", (_, sessionId, itemId) => {
    return removeItem(sessionId, itemId);
  });

  ipcMain.handle("vault:copyPassword", (_, sessionId, itemId) => {
    return requestCopyPassword(sessionId, itemId);
  });

  ipcMain.handle("vault:showPassword", (_, sessionId, itemId) => {
    return requestShowPassword(sessionId, itemId);
  });

  ipcMain.handle("vault:session", (_, sessionId) => {
    return requireSession(sessionId);
  });

  ipcMain.handle("vault:lock", () => {
    return lockVault();
  });

  ipcMain.handle("vault:changePassword", (_, oldPass, newPass) => {
    return changePassword(oldPass, newPass);
  });

  ipcMain.handle("update:download", async (e, meta) => {
    const win = BrowserWindow.fromWebContents(e.sender);
    return await downloadUpdateWithProgress(win, meta);
  });
}

module.exports = { handleIpcs };

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
