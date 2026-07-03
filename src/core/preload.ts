import { contextBridge, ipcRenderer } from "electron";

export const nq = {
    getAccentColor: () => ipcRenderer.invoke("getAccentColor"),
    getTheme: () => ipcRenderer.invoke("getTheme"),
    getTree: (dir: string) => ipcRenderer.invoke("getTree", dir),
    setRoot: (root: string) => ipcRenderer.invoke("setRoot", root),
    getRoot: () => ipcRenderer.invoke("getRoot"),
    openFile: (file: string) => ipcRenderer.invoke("openFile", file),
    saveFile: (path: string, content: string) => ipcRenderer.invoke("saveFile", path, content),
    getFileExt: (file: string) => ipcRenderer.invoke("getFileExt", file),
    setSelected: (path: string) => ipcRenderer.invoke("setSelected", path),
    getSelected: () => ipcRenderer.invoke("getSelected"),
    askDir: () => ipcRenderer.invoke("askDir"),
    ask: (title: string, question: string) => ipcRenderer.invoke("askInput", title, question),
    askQuestion: (title: string, question: string) => ipcRenderer.invoke("askQuestion", title, question),
    warn: (title: string, label: string) => ipcRenderer.invoke("warn", title, label),
    createDir: (dirName: string, withGlobalPath: boolean) => ipcRenderer.invoke("createDir", dirName, withGlobalPath),
    createFile: (fileName: string, withGlobalPath: boolean) => ipcRenderer.invoke("createFile", fileName, withGlobalPath),
    removeDir: (dirName: string) => ipcRenderer.invoke("removeDir", dirName),
    removeFile: (fileName: string) => ipcRenderer.invoke("removeFile", fileName),
    stat: (filePath: string) => ipcRenderer.invoke("stat", filePath),
    openSetting: (path: string) => ipcRenderer.invoke("openSetting", path),
    getSetting: (...keys: string[]) => ipcRenderer.invoke("getSetting", ...keys),
    getDevMode: () => ipcRenderer.invoke("getDevMode"),
    getAppPath: (name: "home" | "appData" | "assets" | "userData" | "sessionData" | "temp" | "exe" | "module" | "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos" | "recent" | "logs" | "crashDumps") => ipcRenderer.invoke("getAppPath", name)
};

export const terminal = {
    create(cwd: string) {
        return ipcRenderer.invoke("terminal:create", cwd);
    },

    write(data: string) {
        ipcRenderer.send("terminal:write", data);
    },

    resize(cols: number, rows: number) {
        ipcRenderer.send("terminal:resize", cols, rows);
    },

    onData(callback: (data: string) => void) {
        ipcRenderer.on("terminal:data", (_, data) => {
            callback(data);
        });
    }
};


contextBridge.exposeInMainWorld("nq", nq);
contextBridge.exposeInMainWorld("terminal", terminal);