import { settingsManager } from "../../core/settings/settingsManager";
import path from "path";
import fs from "fs";
import { ipcMain, dialog, BrowserWindow, shell } from "electron";
import { MakefileParser } from "../../core/makefileParser";

const makefileParser = new MakefileParser();

export class SettingsManagerHandler {
    constructor() {
        ipcMain.handle("openSetting", (_, settingPath: string) => {
            return settingsManager.open(settingPath);
        });

        ipcMain.handle("getSetting", (_, ...keys: string[]) => {
            return settingsManager.get(...keys);
        });
    }
}

export class IDEHandler {
    private verbose: boolean;
    public globalRoot! : string;
    public selected! : string;

    constructor(verbose: boolean = false) {
        this.globalRoot = path.resolve(".");
        this.verbose = verbose;
        this.init();
    }

    private async init() {
        ipcMain.handle("askDir", async () => {
            const result = await dialog.showOpenDialog({
                properties: ["openDirectory"],
            });

            if (result.canceled) {
                this.verbose ? console.log("[ASK_DIR]: user canceled") : null;
                return null;
            }

            return result.filePaths[0];
        });

        ipcMain.handle("askInput", async (_, title: string, question: string) => {
            const focusedWindow = BrowserWindow.getFocusedWindow();

            const askWin = new BrowserWindow({
                width: 300,
                height: 150,
                modal: true,
                ...(focusedWindow && { parent: focusedWindow }),
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true,
                    preload: path.join(__dirname, "core", "ui", "ask", "input", "preload.js"),
                    devTools: false,
                },
                autoHideMenuBar: true,
                title: title,
                icon: path.join(__dirname, "assets", "logo.png"),
            });

            askWin.loadFile(path.join(__dirname, "core", "ui", "ask", "input", "index.html"), {
                query: { question }
            });

            askWin.webContents.on("did-finish-load", async () => {
                setTimeout(async () => {
                    const size = await askWin.webContents.executeJavaScript(`
                        ({
                            width: document.documentElement.scrollWidth,
                            height: document.documentElement.scrollHeight
                        })
                    `)

                    askWin.setContentSize(size.width, size.height);
                }, 100);
            });
            
            return new Promise((resolve) => {
                ipcMain.once("ask-text-result", (_, value) => {
                    resolve(value);
                    askWin.close();
                });

                askWin.on("closed", () => {
                    return null;
                });
            });
        });

        ipcMain.handle("warn", (_, title: string, label: string) => {
            const focusedWindow = BrowserWindow.getFocusedWindow();

            const warnWin = new BrowserWindow({
                width: 300,
                height: 150,
                modal: true,
                ...(focusedWindow && { parent: focusedWindow }),
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true,
                    preload: path.join(__dirname, "core", "ui", "warn", "preload.js"),
                    devTools: false
                },
                autoHideMenuBar: true,
                title: title,
                icon: path.join(__dirname, "assets", "logo.png"),
            });

            warnWin.loadFile(path.join(__dirname, "core", "ui", "warn", "index.html"), {
                query: { label }
            });

            warnWin.webContents.on("did-finish-load", async () => {
                setTimeout(async () => {
                    const size = await warnWin.webContents.executeJavaScript(`
                        ({
                            width: document.documentElement.scrollWidth,
                            height: document.documentElement.scrollHeight
                        })    
                    `);

                    warnWin.setContentSize(size.width, size.height);
                }, 100);
            });

            return new Promise((resolve) => {
                ipcMain.on("warn-win-response", (_, value) => {
                    resolve(value);
                    warnWin.close();
                });

                warnWin.on("closed", () => {
                    return null;
                });
            });
        });

        ipcMain.handle("askQuestion", async (_, title: string, question: string) => {
            const focusedWindow = BrowserWindow.getFocusedWindow();

            const askWin = new BrowserWindow({
                width: 300,
                height: 150,
                modal: true,
                ...(focusedWindow && { parent: focusedWindow }),
                webPreferences: {
                    contextIsolation: true,
                    nodeIntegration: false,
                    preload: path.join(__dirname, "core", "ui", "ask", "button", "preload.js"),
                    devTools: false,
                },
                autoHideMenuBar: true,
                title: title,
                icon: path.join(__dirname, "assets", "logo.png"),
            });

            askWin.loadFile(path.join(__dirname, "core", "ui", "ask", "button", "index.html"), {
                query: { question }
            });
        
            askWin.webContents.on("did-finish-load", async () => {
                setTimeout(async () => {
                    const size = await askWin.webContents.executeJavaScript(`
                        ({
                            width: document.documentElement.scrollWidth,
                            height: document.documentElement.scrollHeight
                        })
                    `);
        
                    askWin.setContentSize(size.width, size.height);
                }, 100);
            });
        
            return new Promise((resolve) => {
                ipcMain.once("ask-button-response", (_, value) => {
                    resolve(value);
                    askWin.close();
                });
        
                askWin.on("closed", () => {
                    return null
                });
            });
        });


        ipcMain.handle("setRoot", (_, root: string) => {
            this.globalRoot = root;
            this.verbose ? console.log("[SET_ROOT]: new root defined:", root) : null;
        });

        ipcMain.handle("getRoot", () => {
            return this.globalRoot;
        });

        ipcMain.handle("setSelected", (_, path: string) => {
            this.selected = path;
        });

        ipcMain.handle("getSelected", () => {
            return this.selected;
        });

        ipcMain.handle("initNqDir", async () => {
            if (fs.existsSync(path.resolve(this.globalRoot, ".nq", "settings.json"))) {
                return;
            }

            try {
                fs.mkdirSync(path.resolve(this.globalRoot, ".nq"), { recursive: true });
                fs.writeFileSync(path.resolve(this.globalRoot, ".nq", "settings.json"), JSON.stringify({}, null, 4), "utf-8");
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

        ipcMain.handle("getLocalProperty", async (_, key: string) => {
            if (!fs.existsSync(path.resolve(this.globalRoot, ".nq", "settings.json"))) {
                return undefined;
            }

            const content = JSON.parse(fs.readFileSync(path.resolve(this.globalRoot, ".nq", "settings.json"), "utf-8"));
            
            return content[key];
        });

        ipcMain.handle("setLocalProperty", (_, key: string, value: any) => {
            if (!fs.existsSync(path.resolve(this.globalRoot, ".nq", "settings.json"))) {
                return {
                    success: false,
                    error: "No .nq directory found."
                };
            }

            const content = JSON.parse(fs.readFileSync(path.resolve(this.globalRoot, ".nq", "settings.json"), "utf-8"));

            content[key] = value;

            try {
                fs.writeFileSync(path.resolve(this.globalRoot, ".nq", "settings.json"), JSON.stringify(content, null, 4), "utf-8");
                return {
                    success: true,
                    error: null
                };
            } catch (e) {
                return {
                    success: true,
                    error: e instanceof Error ? e.message : "Unknown error."
                };
            }
        });

        ipcMain.handle("openInBrowser", async (_, url: string) => {
            await shell.openExternal(url);
        });

        ipcMain.handle("make:parse", async (_, filePath: string) => {
            return await makefileParser.parse(filePath);
        });

    }
}