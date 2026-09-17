import { ipcMain, app } from "electron";
import path from "path";
import { makeTreeNodes } from "../../core/ui/treeView/treeProvider";

export class UtilsHandler {
    private verbose: boolean;

    constructor(verbose: boolean) {
        this.verbose = verbose;
        this.init();
    }

    private async init() {
        ipcMain.handle("getAppPath", (_, name: "home" | "appData" | "assets" | "userData" | "sessionData" | "temp" | "exe" | "module" | "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos" | "recent" | "logs" | "crashDumps") => {
            return app.getPath(name);
        });

        ipcMain.handle("getTree", async (_, dir: string) => {
            return await makeTreeNodes(dir);
        });

        ipcMain.handle("getFileExt", (_, file: string) => {
            return path.extname(file);
        });

        ipcMain.handle("getFileName", async (_, filePath: string) => {
            const splitPath = filePath.split("/");

            let result;
            for (const p of splitPath) {
                result = p
            };

            return result;
        });

        ipcMain.handle("joinPath", (_, ...paths: string[]) => {
            return path.join(...paths);
        });

        ipcMain.handle("getDirname", (_, pathToCheck: string) => {
            return path.dirname(pathToCheck);
        });

        ipcMain.handle("resolvePath", (_, ...pathToResolve: string[]) => {
            return path.resolve(...pathToResolve);
        });
    }
}