import { ipcMain, app } from "electron";
import fs from "fs";
import path from "path";

export class FilesystemHandler {
    private verbose: boolean;

    constructor(verbose: boolean = false) {
        this.verbose = verbose;
        this.init();
    }

    private async init() {
        ipcMain.handle("openFile", async (_, file: string) => {
            return fs.readFileSync(file, "utf-8");
        });

        ipcMain.handle("saveFile", (_, path: string, content: string) => {
            try {
                fs.promises.writeFile(path, content, "utf-8");
                return {
                    success: true,
                    error: null
                };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : "Unknown error."
                };
            };
        });

        ipcMain.handle("stat", async (_, filePath: string) => {
            const stat = fs.statSync(filePath);

            return {
                isDirectory: stat.isDirectory(),
                isFile: stat.isFile()
            };
        });

        ipcMain.handle("createDir", async (_, dirName: string) => {
            try {
                fs.mkdirSync(dirName);
                return {
                    success: true,
                    error: null
                }
            } catch (e) {
                return {
                    success: false,
                    error: e instanceof Error ? e.message : "Unknown error."
                };
            }
        });

        ipcMain.handle("createFile", async (_, filepath: string) => {
            try {
                fs.writeFileSync(filepath, "", "utf-8");
                return {
                    success: true,
                    error: null
                }
            } catch (e) {
                return {
                    success: false,
                    error: e instanceof Error ? e.message : "Unknown error."
                };
            }
        });

        ipcMain.handle("removeDir", async (_, dirName: string) => {
            try {
                fs.rmdirSync(dirName)
                return {
                    success: true,
                    error: null
                };
            } catch (e) {
                return {
                    success: false,
                    error: e instanceof Error ? e.message : "Unknown error."
                };
            }
        });

        ipcMain.handle("removeFile", async (_, fileName: string) => {
            try {
                fs.rmSync(fileName);
                return {
                    success: true,
                    error: null
                };
            } catch (e) {
                return {
                    success: false,
                    error: e instanceof Error ? e.message : "Unknown error."
                };
            }
        });

        ipcMain.handle("exists", (_, filePath: string) => {
            return fs.existsSync(filePath);
        });

        ipcMain.handle("renameFile", async (_, pathToMove: string, name: string) => {
            const dir = path.dirname(pathToMove);
            const target = path.join(dir, name);

            try {
                fs.renameSync(pathToMove, target);
                return {
                    success: true,
                    error: null
                };
            } catch (e) {
                return {
                    success: false,
                    error: e instanceof Error ? e.message : "Unknown error."
                };
            }
        });
    }
}