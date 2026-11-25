import { ipcRenderer } from "electron";

export const git = {
    isRepository(): Promise<boolean> {
        return ipcRenderer.invoke("git:isRepo")
    },

    init() {
        return ipcRenderer.invoke("git:init")
    },

    status() {
        return ipcRenderer.invoke("git:status")
    },

    add(files: string | string[]) {
        return ipcRenderer.invoke("git:add", files)
    },

    commit(message: string) {
        return ipcRenderer.invoke("git:commit", message)
    },

    log() {
        return ipcRenderer.invoke("git:log")
    },

    branches() {
        return ipcRenderer.invoke("git:branches")
    },

    push() {
        return ipcRenderer.invoke("git:push")
    },

    pull() {
        return ipcRenderer.invoke("git:pull")
    },
}