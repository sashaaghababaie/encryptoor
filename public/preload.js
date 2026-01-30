/* eslint-disable @typescript-eslint/no-namespace */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("api", {
  init: () => ipcRenderer.invoke("vault:init"),
  getSession: (sessionId) => ipcRenderer.invoke("vault:session", sessionId),
  create: (pass, data) => ipcRenderer.invoke("vault:create", pass, data),
  unlock: (pass) => ipcRenderer.invoke("vault:unlock", pass),
  lock: () => ipcRenderer.invoke("vault:lock"),
  copy: (itemId) => ipcRenderer.invoke("vault:copyPassword", itemId),
  show: (itemId) => ipcRenderer.invoke("vault:showPassword", itemId),
  onLocked: (cb) => ipcRenderer.on("vault:locked", (_, reason) => cb(reason)),
  upsert: (sessionId, item) =>
    ipcRenderer.invoke("vault:upsert", sessionId, item),
  remove: (sessionId, itemId) =>
    ipcRenderer.invoke("vault:remove", sessionId, itemId),
  changePassword: (oldPass, newPass) =>
    ipcRenderer.invoke("vault:changePassword", oldPass, newPass),
  import: (sessionId, pass, filePath) =>
    ipcRenderer.invoke("vault:export", sessionId, pass, filePath),
  export: (sessionId, useOldPass, currentPass, newPass) =>
    ipcRenderer.invoke(
      "vault:export",
      sessionId,
      useOldPass,
      currentPass,
      newPass
    ),
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
