import { BrowserWindow, app, ipcMain, systemPreferences } from "electron";
import path from "path"
import { terminalManager } from "./terminalManager";
import { ServerManager } from "./core/serverManager";
import { MakefileParser } from "./core/makefileParser";

// API modules
import { ThemeHandler } from "./api/modules/theme";
import { SettingsManagerHandler, IDEHandler } from "./api/modules/IDE";
import { UtilsHandler } from "./api/modules/utils"
import { FilesystemHandler } from "./api/modules/filesystem"
import { IconsHandler } from "./api/modules/icons";


let win: BrowserWindow
console.log("\n-=- debug messages -=-")
const devMode = process.argv.includes("--dev-mode") || process.argv.includes("-d");
console.log("dev-mode: ", devMode);
if (typeof systemPreferences.getAccentColor === 'function') {
    console.log("Accent color: ", systemPreferences.getAccentColor());
    if (systemPreferences.getAccentColor() !== "") {
        console.log("Accent color defined!")
    } else {
        console.log("Cant define the accent color :(")
    }
}
const themeHandler = new ThemeHandler();
const settingsManagerHandler = new SettingsManagerHandler();
const utilsHandler = new UtilsHandler(devMode);
const filesystemHandler = new FilesystemHandler();
const iconsHandler = new IconsHandler(true);
const ideHandler = new IDEHandler();

console.log("-=- End of debug messages -=-\n")
const serverManager = new ServerManager();
const makefileParser = new MakefileParser();

let allowClose = false;

let terminal: terminalManager;

function createBootstrap() {
    win = new BrowserWindow({
        width: 600,
        height: 400,
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, "core", "preload.js"),
            devTools: devMode,
            webviewTag: true,
            sandbox: devMode ? false : true,
        },
        title: "NQ-Studio",
        icon: path.join("assets", "logo.png"),
    });

    const window = win;

    window.on("close", (e) => {
        if (allowClose) return;

        e.preventDefault();

        console.log("[NQ]: Sending SHUTDOWN call...")
        window.webContents.send("nq:shutdown");
    });

    ipcMain.handle("nq:shutdown-now", () => {
        console.log("[NQ]: Received SHUTDOWN-NOW call")
        allowClose = true;
        window.close();
    });

    terminal = new terminalManager(window);

    window.webContents.once("did-finish-load", () => {
        console.log("[NQ]: did-finish-load triggered")
        console.log("[NQ]: Sending BOOT call");
        window.webContents.send("nq:boot");
    });

    window.loadFile(path.join(__dirname, "main", "index.html"));
    window.maximize();
};

app.whenReady().then(() => {
    createBootstrap();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createBootstrap();
        }
    });
});

ipcMain.handle("openDevTools", () => {
    win.webContents.openDevTools();
});