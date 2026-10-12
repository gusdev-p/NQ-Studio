import { ipcMain, app } from "electron";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

/*
NQ-Studio Filesystem API.

    Part of the main api as a module, responsible
for all functions that involves files or directories,
example: create a file, delete a file and etc...

*/
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

        ipcMain.handle("saveFile", async (_, filePath: string, content: string) => {
            try {
                fs.writeFileSync(filePath, content, "utf-8");

                if (this.verbose) {
                    const savedContent = await fs.promises.readFile(filePath, "utf-8");

                    console.log("[SAVE DEBUG]", {
                        path: filePath,
                        expectedLength: content.length,
                        savedLength: savedContent.length,
                        matches: savedContent === content
                    });
                    
                    console.log("[SAVE] Path:", filePath);
                    console.log("[SAVE] Absolute:", path.isAbsolute(filePath));
                    console.log("[SAVE] Exists:", fs.existsSync(filePath));
                    console.log("[FileSystem]: Saved:", filePath);
                }

                return {
                    success: true,
                    error: null
                };
            } catch (error) {
                console.error("[FileSystem]: Failed to save:", filePath, error);
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


        ipcMain.handle("relativePath", async (_, rootPath: string, toRelativePath: string) => {
            return path.relative(rootPath, toRelativePath);
        });

        ipcMain.handle("toUri", async (_, path: string) => {
            return pathToFileURL(path).toString();
        });
    }
}