import { contextBridge, ipcRenderer } from "electron";
import { nq } from "../api/preload/nq";
import { terminal } from "../api/preload/terminal"
import { server } from "../api/preload/server"
import { make } from "../api/preload/make"
import { lsp } from "../api/preload/lsp"
import { windowManager } from "../api/preload/windowManager"

const newNQ = {
    ...nq,
    terminal,
    server,
    make,
    lsp,
    windowManager
};

contextBridge.exposeInMainWorld("nq", newNQ);
