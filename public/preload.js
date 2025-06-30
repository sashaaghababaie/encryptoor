/* eslint-disable @typescript-eslint/no-namespace */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("api", {
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
});
