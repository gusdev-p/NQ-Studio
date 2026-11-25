import { ipcRenderer } from "electron";

export const make = {
    parse(filePath: string): Promise<any> {
        return ipcRenderer.invoke("make:parse", filePath)
    }
}