const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    send: (channel, value) => ipcRenderer.send(channel, value),
})