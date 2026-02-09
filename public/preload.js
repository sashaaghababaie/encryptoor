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

  onLocked: (cb) => ipcRenderer.on("vault:locked", (_, reason) => cb(reason)),

  upsert: (item) => ipcRenderer.invoke("vault:upsert", item),

  remove: (itemId) => ipcRenderer.invoke("vault:remove", itemId),

  changePassword: (oldPass, newPass) =>
    ipcRenderer.invoke("vault:changePassword", oldPass, newPass),

  importByPath: (pass, filePath) =>
    ipcRenderer.invoke("vault:importByPath", pass, filePath),

  importByBuffer: (pass, buffer) => {
    const nodeBuffer = Buffer.from(buffer);

    return ipcRenderer.invoke(
      "vault:importByBuffer",
      pass,
      nodeBuffer,
    );
  },

  export: (useOldPass, currentPass, newPass) =>
    ipcRenderer.invoke(
      "vault:export",
      useOldPass,
      currentPass,
      newPass,
    ),

  checkForUpdates: async () => {
    return await ipcRenderer.invoke("update:check");
  },

  downloadUpdate: () => {
    return ipcRenderer.invoke("update:download");
  },

  cancelUpdateDownload: () => {
    return ipcRenderer.invoke("update:cancel");
  },

  onUpdateProgress: (cb) => {
    const handler = (_, data) => cb(data);
    ipcRenderer.on("update:progress", handler);
    return () => ipcRenderer.removeListener("update:progress", handler);
  },
});

// contextBridge.exposeInMainWorld("api", {
// examples
// init: async (e) => {
//   return ipcRenderer.invoke("init");
// },
// openChangeDiractory: async (args1, args2) => {
//   return ipcRenderer.invoke("openDialoge", args1, args2);
// },
// changeDirectory: async () => {
//   return ipcRenderer.invoke("changeDirectory");
// },
// });

// contextBridge.exposeInMainWorld("api", {
//   init: async () => await ipcRenderer.invoke("vault:init"),
//   encryptVault: async (passkey, data) =>
//     await ipcRenderer.invoke("vault:encrypt", passkey, data),
//   decryptVault: async (passkey) =>
//     await ipcRenderer.invoke("vault:decrypt", passkey),
//   exportVault: async (passkey, data) =>
//     await ipcRenderer.invoke("vault:export", passkey, data),
// });
