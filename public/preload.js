/* eslint-disable @typescript-eslint/no-namespace */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { ipcRenderer, contextBridge } = require("electron");

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

contextBridge.exposeInMainWorld("api", {
  init: async () => await ipcRenderer.invoke("vault:init"),
  encryptVault: async (passkey, data) =>
    await ipcRenderer.invoke("vault:encrypt", passkey, data),
  decryptVault: async (passkey) =>
    await ipcRenderer.invoke("vault:decrypt", passkey),
});
