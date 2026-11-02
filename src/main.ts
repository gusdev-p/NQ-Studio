import { BrowserWindow, app, ipcMain, nativeTheme, systemPreferences } from "electron";
import path from "path"
import { terminalManager } from "./api/modules/terminalManager";
import { ServerManager } from "./core/serverManager";
import { MakefileParser } from "./core/makefileParser";

// API modules
import { ThemeHandler } from "./api/modules/theme";
import { SettingsManagerHandler, IDEHandler } from "./api/modules/IDE";
import { UtilsHandler } from "./api/modules/utils"
import { FilesystemHandler } from "./api/modules/filesystem"
import { IconsHandler } from "./api/modules/icons";
import { LSP } from "./api/modules/lsp";
import { LSPHandler } from "./api/modules/lspHandler";

// utils
import { settingsManager, SettingsManager } from "./core/settings/settingsManager";
import { execSync } from "child_process";
import { ThemeTemplate } from "./types/theme";

let win: BrowserWindow | null = null;

console.log("\n-=- debug messages -=-")

const devMode = process.argv.includes("--dev-mode") || process.argv.includes("-d");
const lspLogs = process.argv.includes("--lsp-logs") || process.argv.includes("-ll");

console.log("dev-mode: ", devMode);

if (typeof systemPreferences.getAccentColor === 'function') {
    if (systemPreferences.getAccentColor() !== "") {
        console.log("Accent color defined!")
    } else {
        console.log("Cant define the accent color :(")
    }
}

let themeHandler  :          ThemeHandler
let settingsManagerHandler : SettingsManagerHandler
let utilsHandler :           UtilsHandler
let filesystemHandler :      FilesystemHandler
let iconsHandler :           IconsHandler
let ideHandler :             IDEHandler
let lsp :                    LSP

function initAPI() {
    themeHandler = new ThemeHandler(devMode);
    settingsManagerHandler = new SettingsManagerHandler();
    utilsHandler = new UtilsHandler(devMode);
    filesystemHandler = new FilesystemHandler(devMode);
    iconsHandler = new IconsHandler(true)
    ideHandler = new IDEHandler(devMode);
    lsp = new LSP(lspLogs);
}

function deinitAPI() {
    themeHandler.unregister();
    settingsManagerHandler.unregister();
    utilsHandler.unregister();
    filesystemHandler.unregister();
    iconsHandler.unregister();
    ideHandler.unregister();
}

let lspHandler: LSPHandler;

console.log("-=- End of debug messages -=-\n")
const serverManager = new ServerManager();
const makefileParser = new MakefileParser();

let allowClose = false;

let terminal: terminalManager | null = null;

let backgroundColor: string = "222"

const stateManager = new SettingsManager(devMode);
stateManager.open(path.join(app.getPath("appData"), "nq-studio", "saves.json"));

function bootstrap() {
    // init the main API
    initAPI();

	// theme definition
    const electronDark = nativeTheme.shouldUseDarkColors;
    let darkTheme: boolean = false;
    try {
        const gnomeTheme = execSync("gsettings get org.gnome.desktop.interface color-scheme").toString().trim();
        const gnomeDark = gnomeTheme.includes("prefer-dark");

        darkTheme = electronDark || gnomeDark
    } catch {
        console.log("[LOG]: Can't execute theme check command :( Ignoring...");
    }

    const activeTheme = settingsManager.get("Themes", "Active Theme");

    switch (activeTheme) {
        case "Dark": {
            const theme = settingsManager.get("Themes", "Dark") as ThemeTemplate;

            if (!theme || theme.Variant !== "dark") {
                if (devMode) console.log(`[BOOTSTRAP ERROR]: can't set theme :( Variant: '${theme?.Variant}'`);
                return;
            }
            backgroundColor = theme.Theme["--backgroundColor"] ?? "#222";
            break;
        }

        case "Light": {
            const theme = settingsManager.get("Themes", "Light") as ThemeTemplate;

            if (!theme || theme.Variant !== "light") {
                if (devMode) console.log(`[BOOTSTRAP ERROR]: can't set theme :( Variant: '${theme?.Variant}'`);
                return;
            }
            backgroundColor = theme.Theme["--backgroundColor"] ?? "#bdbdbd";
            break;
        }

        case "auto": {
            const theme: ThemeTemplate =
                darkTheme == true
                    ? settingsManager.get("Themes", "Dark")
                    : settingsManager.get("Themes", "Light");
            
            if (!theme) {
                if (devMode) console.log(`[BOOTSTRAP ERROR]: can't set theme :(`);
                return;
            }
            backgroundColor = theme.Theme["--backgroundColor"] ?? "#222";
            break;
        }
    }
    if (devMode) console.log(`Bootstrap background theme set to: '${backgroundColor}'`)

	// root definition
	const oldRoot = stateManager.get("Opened Root");
    if (devMode) console.log("[BOOTSTRAP]: Root to open:",oldRoot);

    if (!oldRoot) return;
	ideHandler.globalRoot = oldRoot;
}


function createBootstrap() {
    allowClose = false;

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
        backgroundColor: backgroundColor,
        show: false
    });
    
    const window = win;
    
    window.on("close", (e) => {
        if (allowClose) return;
        
        e.preventDefault();
        
        console.log("[NQ]: Sending SHUTDOWN call...")
        window.webContents.send("nq:shutdown");
    });
    
    terminal = new terminalManager(window);

    window.webContents.once("did-finish-load", () => {
        console.log("[NQ]: did-finish-load triggered")
        
        console.log("[NQ]: Starting LSP (Language Server Protocol)...")
        lsp.start(window, "typescript", ideHandler.globalRoot);
        
        console.log("[NQ]: Sending BOOT call");
        window.webContents.send("nq:boot");
    });

    window.loadFile(path.join(__dirname, "main", "index.html"));

    window.once("ready-to-show", () => {
        window.show();
    });

    window.on("closed", () => {
        win = null;
        terminal = null;

        console.log("[NQ]: Window destroyed");
    });

    window.maximize();
    lspHandler = new LSPHandler(lspLogs, window, ideHandler.globalRoot);
    lspHandler.register();
};

async function reloadIDE() {
    if (!win) return;
    if (!terminal) return;

    console.log("[NQ]: Starting HARD reload...");

    stateManager.set("Opened Root", ideHandler.globalRoot);

    await lspHandler.lsp.stop()
    await lspHandler.unregister();

    terminal.delete();
    terminal.unregister();
    deinitAPI();

    allowClose = true;
    const oldWindow = win;

    oldWindow.once("closed", () => {
        console.log("[NQ]: Recreating IDE...");

        bootstrap();
        createBootstrap();
    });

    oldWindow.close();
}

app.whenReady().then(() => {
    bootstrap();
    createBootstrap();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            bootstrap();
            createBootstrap();
        }
    });
});

ipcMain.handle("nq:reload-now", async () => {
    console.log("[NQ]: Received RELOAD-NOW call");

    await reloadIDE();
});

ipcMain.handle("nq:shutdown-now", () => {
    console.log("[NQ]: Received SHUTDOWN-NOW call");

    if (!win) return;

    stateManager.set("Opened Root", ideHandler.globalRoot);

    allowClose = true;
    win.close();
});

ipcMain.handle("openDevTools", () => {
    if (!win) return;
    win.webContents.openDevTools();
});
