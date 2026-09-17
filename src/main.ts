import { BrowserWindow, app, ipcMain, nativeTheme, systemPreferences, dialog, Menu, protocol } from "electron";
import path from "path"
import { terminalManager } from "./terminalManager";
import { settingsManager } from "./core/settings/settingsManager";
import { ServerManager } from "./core/serverManager";
import { MakefileParser } from "./core/makefileParser";

// API modules
import { ThemeHandler } from "./api/modules/theme";
import { SettingsManagerHandler, IDEHandler } from "./api/modules/IDE";
import { UtilsHandler } from "./api/modules/utils"
import { FilesystemHandler } from "./api/modules/filesystem"


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
const ideHandler = new IDEHandler();

console.log("-=- End of debug messages -=-\n")
const serverManager = new ServerManager();
const makefileParser = new MakefileParser();

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


ipcMain.handle("openDevTools", () => {
    win.webContents.openDevTools();
});