import { BrowserWindow, app, ipcMain, nativeTheme, systemPreferences, dialog } from "electron";
import path from "path"
import { execSync } from "child_process";
import { makeTreeNodes } from "./core/ui/treeView/treeProvider";
import fs from "fs";
import { terminalManager } from "./terminalManager";
import { SettingsManager } from "./core/settings/settingsManager";

let globalRoot: string = ".";
let selected: string = globalRoot

export const settingsManager = new SettingsManager();
settingsManager.open(path.join(app.getPath("appData"), "nq-studio", "settings.json"));
console.log(settingsManager.get("console", "fontFamily"));
const devMode = process.argv.includes("--devMode");
console.log("devMode: ", devMode);

let terminal: terminalManager;

function createBootstrap() {
    const win = new BrowserWindow({
        width: 600,
        height: 400,
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, "core", "preload.js"),
            devTools: devMode,
        },
        title: "NQ-Studio",
        icon: path.join("assets", "logo.png"),
    });

    terminal = new terminalManager(win);

    win.loadFile(path.join(__dirname, "main", "index.html"));
    win.maximize();
};


app.whenReady().then(() => {
    createBootstrap();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createBootstrap();
        }
    });
});


// api calls

// check if the system is in dark mode
ipcMain.handle("getTheme", async (_: any) => {
    const electronDark = nativeTheme.shouldUseDarkColors;
    let isDarkTheme;

    try {
        // add compatibility with GNOME
        const gnome = execSync(
            "gsettings get org.gnome.desktop.interface color-scheme"
        ).toString().trim();

        const gnomeDark = gnome.includes("prefer-dark");

        isDarkTheme = electronDark || gnomeDark;
    } catch {
        isDarkTheme = electronDark
    }

    const themeConfig = settingsManager.get("themes", "default");
    const darkTheme = settingsManager.get("themes", "dark", "theme");
    const lightTheme = settingsManager.get("themes", "light", "theme");
    console.log("themeConfig: ", themeConfig);
    console.log("isDarkTheme: ", isDarkTheme);
    console.log("darkTheme: ", JSON.stringify(darkTheme));
    console.log("lightTheme: ", JSON.stringify(lightTheme));

    if (themeConfig === "auto") {
        console.log("é auto!")
        if (isDarkTheme) return { theme: darkTheme, isDark: true };
        return { theme: lightTheme, isDark: false };
    } else {
        console.log("é custom!");
        return { theme: settingsManager.get("themes", themeConfig, "theme"), isDark: settingsManager.get("themes", themeConfig, "variant") === "dark" };
    }

});

ipcMain.handle("getAppPath", (_, name: "home" | "appData" | "assets" | "userData" | "sessionData" | "temp" | "exe" | "module" | "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos" | "recent" | "logs" | "crashDumps") => {
    return app.getPath(name);
});

ipcMain.handle("getAccentColor", (_event: any) => {
    return systemPreferences.getAccentColor();
});

ipcMain.handle("getTree", async (_event, dir: string) => {
    return await makeTreeNodes(dir);
});

ipcMain.handle("openFile", async (_event, file: string) => {
    return fs.readFileSync(file, "utf-8");
});

ipcMain.handle("getFileExt", (_event, file: string) => {
    return path.extname(file);
});

ipcMain.handle("saveFile", (_event, path: string, content: string) => {
    try {
        fs.promises.writeFile(path, content, "utf-8");
        return {
            success: true,
            error: null
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    };
});

ipcMain.handle("stat", async (_, filePath: string) => {
    const stat = fs.statSync(filePath);

    return {
        isDirectory: stat.isDirectory(),
        isFile: stat.isFile()
    }
});

ipcMain.handle("askDir", async () => {
    const result = await dialog.showOpenDialog({
        properties: ["openDirectory"],
    });

    // em caso de debug
    // console.log("resultado da API:");
    // console.log(result);

    if (result.canceled) {
        console.log("o user cancelou!");
        return null;
    }

    return result.filePaths[0];
});

ipcMain.handle("askInput", async (_, title: string, question: string) => {
    const askWin = new BrowserWindow({
        width: 300,
        height: 150,
        modal: true,
        // @ts-expect-error # IGNORE
        parent: BrowserWindow.getFocusedWindow(),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, "core", "ui", "ask", "input", "preload.js"),
            devTools: devMode,
        },
        autoHideMenuBar: true,
        title: title,
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
            `);

            askWin.setContentSize(size.width, size.height);
            }, 100);
    });

    return new Promise((resolve) => {
        ipcMain.once("ask-text-result", (_, value) => {
            resolve(value);
            askWin.close();
        });
        
        askWin.on("closed", () => {
            return null
        });
    }); 
});

ipcMain.handle("warn", (_, title: string, label: string) => {
    const warnWin = new BrowserWindow({
        width: 300,
        height: 150,
        modal: true,
        // @ts-expect-error # IGNORE
        parent: BrowserWindow.getFocusedWindow(),
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, "core", "ui", "warn", "preload.js"),
            devTools: devMode,
        },
        autoHideMenuBar: true,
    });

    warnWin.loadFile(path.join(__dirname, "core", "ui", "warn", "index.html"), {
        query: {label}
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
            return null
        });
    });
});

ipcMain.handle("askQuestion", async (_, title: string, question: string) =>{
    const askWin = new BrowserWindow({
        title: title,
        width: 300,
        height: 150,
        modal: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, "core", "ui", "ask", "button", "preload.js"),
            devTools: devMode,
        },
        autoHideMenuBar: true
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

ipcMain.handle("setRoot", (_event, root: string) => {
    globalRoot = root;
    console.log("novo root!");
});

ipcMain.handle("getRoot", () => {
    return globalRoot;
})

ipcMain.handle("setSelected", async (_, path: string) => {
    selected = path;
});

ipcMain.handle("getSelected", async () => {
    return selected;
});

ipcMain.handle("createDir", async (_, dirName: string, withGlobalPath: boolean) => {
    let finalPath = dirName
    if (withGlobalPath) {
        finalPath = path.join(globalRoot, dirName);
    }

    try {
        fs.mkdirSync(finalPath);
        return { success: true, error: null }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
});

ipcMain.handle("createFile", async (_, fileName: string, withGlobalPath: boolean) => {
    let finalPath = fileName;
    if (withGlobalPath) {
        finalPath = path.join(globalRoot, fileName);
    }

    try {
        fs.writeFileSync(finalPath, "", "utf-8");
        return { success: true, error: null }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
});

ipcMain.handle("removeDir", async (_, dirName: string) => {
    try {
        fs.rmdirSync(dirName)
        return { success: true, error: null }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
});

ipcMain.handle("removeFile", async (_, fileName: string) => {
    try {
        fs.rmSync(fileName)
        return { success: true, error: null }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
});


ipcMain.handle("openSetting", (_, path: string) => {
    return settingsManager.open(path);
});

ipcMain.handle("getSetting", (_, ...keys: string[]) => {
    return settingsManager.get(...keys);
});