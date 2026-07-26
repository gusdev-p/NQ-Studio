import { BrowserWindow, app, ipcMain, nativeTheme, systemPreferences, dialog, Menu, protocol } from "electron";
import path from "path"
import { execSync } from "child_process";
import { makeTreeNodes } from "./core/ui/treeView/treeProvider";
import fs from "fs";
import { terminalManager } from "./terminalManager";
import { SettingsManager } from "./core/settings/settingsManager";

// NOTE: mudar isso pra releases
let globalRoot: string = "/home/gustavo/Projetos/NQ-Studio";
let selected: string = globalRoot

export const settingsManager = new SettingsManager();
settingsManager.open(path.join(app.getPath("appData"), "nq-studio", "settings.json"));
console.log(settingsManager.get("console", "fontFamily"));
const devMode = process.argv.includes("--devMode");
console.log("devMode: ", devMode);
if (typeof systemPreferences.getAccentColor === 'function') {
    console.log(systemPreferences.getAccentColor());
    console.log("foi a cor!")
}

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
            webviewTag: true,
        },
        title: "NQ-Studio",
        icon: path.join("assets", "logo.png"),
    });

    //Menu.setApplicationMenu(null);

    terminal = new terminalManager(win);

    win.loadFile(path.join(__dirname, "main", "index.html"));
    win.maximize();
};

protocol.registerSchemesAsPrivileged([
    { scheme: "app", privileges: { standard: true, secure: true, supportFetchAPI: true } }
]);

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
        icon: path.join(__dirname, "assets", "logo.png")
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
        icon: path.join(__dirname, "assets", "logo.png")
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

ipcMain.handle("askQuestion", async (_, title: string, question: string) => {
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
        autoHideMenuBar: true,
        icon: path.join(__dirname, "assets", "logo.png")
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

ipcMain.handle("exists", (_, path: string) => {
    return fs.existsSync(path);
});

ipcMain.handle("getFileName", async (_, path: string) => {
    const splitPath = path.split("/");

    let result;
    for (const p of splitPath) {
        result = p
    };

    return result
});

ipcMain.handle("renameFile", async (_, pathToMove: string, name: string) => {
    const dir = path.dirname(pathToMove)
    const target = path.join(dir, name);

    try {
        await fs.copyFileSync(pathToMove, target);
        await fs.unlinkSync(pathToMove);
        return { success: true, error: null };
    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message: String(e) }
    }
});

ipcMain.handle("openSetting", (_, path: string) => {
    return settingsManager.open(path);
});

ipcMain.handle("getSetting", (_, ...keys: string[]) => {
    return settingsManager.get(...keys);
});

ipcMain.handle("joinPath", (_, ...paths: string[]) => {
    return path.join(...paths);
});

ipcMain.handle("getDirname", (_, pathToCheck: string) => {
    return path.dirname(pathToCheck);
});

ipcMain.handle("resolvePath", (_, ...pathToResolve: string[]) => {
    return path.resolve(...pathToResolve)
});