const { ipcMain, BrowserWindow } = require("electron");
const {
  downloadUpdateWithProgress,
  cancelUpdateDownload,
  checkForUpdates,
} = require("../api/update");
const {
  init,
  exportVault,
  createVault,
  unlockVault,
  upsertItem,
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

  ipcMain.handle("vault:unlock", (e, pass) => {
    return unlockVault(pass, e.sender.id);
  });

  ipcMain.handle(
    "vault:export",
    (e, useOldPass, oldPass, newPass) => {
      return exportVault(e.sender.id, useOldPass, oldPass, newPass);
    },
  );

  ipcMain.handle("vault:importByPath", (e, pass, filePath) => {
    return importVaultByFilePath(e.sender.id, pass, filePath);
  });

  ipcMain.handle("vault:importByBuffer", (e, pass, buffer) => {
    return importVaultByBuffer(e.sender.id, pass, buffer);
  });

  ipcMain.handle("vault:upsert", (e, item) => {
    return upsertItem(e.sender.id, item);
  });

  ipcMain.handle("vault:remove", (e, itemId) => {
    return removeItem(e.sender.id, itemId);
  });

  ipcMain.handle("vault:copyPassword", (e, itemId) => {
    return requestCopyPassword(e.sender.id, itemId);
  });

  ipcMain.handle("vault:showPassword", (e, itemId) => {
    return requestShowPassword(e.sender.id, itemId);
  });

  ipcMain.handle("vault:lock", () => {
    return lockVault();
  });

  ipcMain.handle("vault:changePassword", (_, oldPass, newPass) => {
    return changePassword(oldPass, newPass);
  });

  ipcMain.handle("update:check", async (_) => {
    return await checkForUpdates();
  });

  ipcMain.handle("update:download", async (e) => {
    const win = BrowserWindow.fromWebContents(e.sender);
    return await downloadUpdateWithProgress(win);
  });

  ipcMain.handle("update:cancel", async () => {
    return cancelUpdateDownload();
  });
}

module.exports = { handleIpcs };
