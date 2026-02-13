/* eslint-disable @typescript-eslint/no-namespace */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("api", {
  init: () => ipcRenderer.invoke("vault:init"),

  create: (pass, data) => ipcRenderer.invoke("vault:create", pass, data),

  unlock: (pass) => ipcRenderer.invoke("vault:unlock", pass),

  lock: () => ipcRenderer.invoke("vault:lock"),

  copy: (itemId) => ipcRenderer.invoke("vault:copyPassword", itemId),

  show: (itemId) => ipcRenderer.invoke("vault:showPassword", itemId),

  onLocked: (cb) => {
    const handler = (_, reason) => cb(reason);
    ipcRenderer.on("vault:locked", handler);
    return () => ipcRenderer.removeListener("vault:locked", handler);
  },

  upsert: (item) => ipcRenderer.invoke("vault:upsert", item),

  remove: (itemId) => ipcRenderer.invoke("vault:remove", itemId),

  changePassword: (oldPass, newPass) =>
    ipcRenderer.invoke("vault:changePassword", oldPass, newPass),

  importByPath: (pass, filePath) =>
    ipcRenderer.invoke("vault:importByPath", pass, filePath),

  importByBuffer: (pass, buffer) => {
    return ipcRenderer.invoke("vault:importByBuffer", pass, buffer);
  },

  export: (useOldPass, currentPass, newPass) =>
    ipcRenderer.invoke("vault:export", useOldPass, currentPass, newPass),

  checkForUpdates: async () => await ipcRenderer.invoke("update:check"),

  downloadUpdate: () => ipcRenderer.invoke("update:download"),

  showDownloadedFile: () => ipcRenderer.invoke("update:showFile"),

  cancelUpdateDownload: () => ipcRenderer.invoke("update:cancel"),

  onUpdateProgress: (cb) => {
    const handler = (_, data) => cb(data);
    ipcRenderer.on("update:progress", handler);
    return () => ipcRenderer.removeListener("update:progress", handler);
  },
});
