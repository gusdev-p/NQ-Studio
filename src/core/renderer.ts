import { SideBar } from "./ui/sidebar.js";
import { mainSideBar } from "./ui/mainSideBar.js";
import { terminalView } from "./ui/terminal/terminalView.js";
import { SecondarySideBar } from "./ui/secondaryBar.js";
import { FileBar } from "./ui/fileBar.js";
import { nqEditor } from "./ui/renderer/nqEditor.js";
import { FileTabs } from "./ui/fileTabs.js";
import { Extension } from "@codemirror/state";
import { buildCMTheme } from "./cmTheme.js";
import { PropertiesTabManager, type PropertiesTabType } from "../api/modules/propertiesTabManager.js";
import { NotificationManager, NotificationType } from "./ui/notify/notificationManager.js";
import { parse } from "jsonc-parser"

import { initListeners } from "../main/script.js";
import { DownBar } from "./ui/downBar.js";
import { TreeViewManager } from "./ui/treeView/treeViewManager.js";

console.log("-=- renderer boot! -=-")

document.documentElement.style.height = "100%";
document.documentElement.style.overflow = "hidden";
document.body.style.height = "100vh";
document.body.style.margin = "0";
document.body.style.display = "flex";
document.body.style.flexDirection = "column";
document.body.style.overflow = "hidden";
document.body.style.width = "100vw";
document.body.style.maxWidth = "100vw";

export let side_bar: SideBar;
export let nqeditor: nqEditor;
export let secondary_side_bar: SecondarySideBar;
export let fileBar: FileBar;
export let fileTabs: FileTabs;
export let downBar: DownBar;
export let treeView: TreeViewManager;
export let notificationManager: NotificationManager
let terminalVisible = true

const propertiesTab = new PropertiesTabManager(document.body);

let isDark: boolean;

export async function setEditorTheme(): Promise<Extension> {
    const settingsPath = await window.nq.joinPath(await window.nq.getAppPath("appData"), "nq-studio", "themes.json");
    const themeToMount = await window.nq.getSetting("Editor", "Default Theme");
    const configRoot = parse(await window.nq.openFile(settingsPath));

    const resolvedKey = themeToMount === "auto"
        ? (isDark ? "dark" : "light")
        : themeToMount;
    
    return buildCMTheme(configRoot[resolvedKey]);
}

async function initTheme() {
    const themeRoot = await window.nq.getTheme();
    const theme = themeRoot.theme

    isDark = themeRoot.isDark

    if ("--accentColor" in theme) {
        ;
    } else {
        theme["--accentColor"] = await window.nq.getAccentColor();
    }

    Object.entries(theme).forEach(([key, value]: [string, any]) => {
        document.body.style.setProperty(key, value);
        console.log("definido: ", key, value);
    });
};

async function initTreeView() {
    treeView = new TreeViewManager(await window.nq.getRoot(), propertiesTab);
}

async function initUI() {
    document.body.style.background = "var(--backgroundColor)";

    const windowFont = await window.nq.getSetting("UI", "Font");
    
    if (windowFont === "auto") {
        document.body.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"
    } else {
        document.body.style.fontFamily = windowFont;
    }

    // topbar
    const topBar = document.createElement("div");
    topBar.id = "topBar";
    topBar.style.display = "flex";
    topBar.style.width = "100%";
    topBar.style.maxWidth = "100%";
    topBar.style.height = "48px";
    topBar.style.boxSizing = "border-box";
    topBar.style.padding = "8px";
    topBar.style.gap = "4px";
    topBar.style.flexShrink = "0";
    topBar.style.alignItems = "center"

    // logo
    const logoSrc = document.createElement("img");
    logoSrc.id = "LogoSrc";
    logoSrc.src = await window.nq.resolvePath(await window.nq.getAppAsar(), "assets", "logo.png");
    logoSrc.style.maxWidth = "100px";
    logoSrc.style.maxHeight = "30px"

    // file section
    const fileBtn = document.createElement("button");
    fileBtn.id = "fileButton";
    fileBtn.innerText = "File";
    fileBtn.style.background = "var(--onSurfaceColor)";
    fileBtn.style.color = "var(--fontColor)";
    fileBtn.style.border = "none";
    fileBtn.style.borderRadius = "3px";

    const fileButtons: PropertiesTabType = {
        name: "File",
        buttons: [
            {
                name: "Create New Project.",
                type: "button",
                worker: () => {}
            }
        ]
    }

    fileBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        propertiesTab.addPropertiesTab(fileButtons, e);
    });

    const fileContainer = document.createElement("div");
    fileContainer.style.position = "relative";

    
    // dev tools button
    const devBtn = document.createElement("button");
    devBtn.id = "devButton";
    devBtn.innerText = "Dev";
    devBtn.style.background = "var(--onSurfaceColor)";
    devBtn.style.color = "var(--fontColor)";
    devBtn.style.border = "none";
    devBtn.style.borderRadius = "3px";
    
    const devButtons: PropertiesTabType = {
        name: "Developer Options:",
        buttons: [
            {
                name: "Open DevTools.",
                type: "button",
                worker: async () => {
                    await window.nq.openDevTools();
                }
            }
        ]
    }
    
    
    devBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        propertiesTab.addPropertiesTab(devButtons, e);
    });
    
    const devContainer = document.createElement("div");
    devContainer.style.position = "relative";
    
    fileContainer.appendChild(fileBtn);
    devContainer.appendChild(devBtn);

    topBar.appendChild(logoSrc),
    topBar.appendChild(fileContainer);
    topBar.appendChild(devContainer);

    const root = document.createElement("div");
    root.id = "root";
    root.style.display = "flex";
    root.style.width = "calc(100% - 10px)";
    root.style.height = "100%";
    root.style.boxSizing = "border-box";
    root.style.overflow = "hidden";
    root.style.gap = "3px";
    root.style.margin = "3px 5px";

    new mainSideBar(root);

    side_bar = new SideBar(root);

    const main = document.createElement("div");
    main.id = "main";
    main.style.display = "flex";
    main.style.flexDirection = "column";
    main.style.width = "100%";
    main.style.maxWidth = "100%";
    main.style.height = "100%";
    main.style.minHeight = "0";
    main.style.overflow = "hidden";
    main.style.boxSizing = "border-box";
    main.style.gap = "3px";

    const editor = document.createElement("div");
    editor.id = "editor";
    editor.style.flex = "1";
    editor.style.height = "100%";
    editor.style.width = "100%";
    editor.style.maxWidth = "100%";
    editor.style.borderRadius = "8px";
    editor.style.overflow = "hidden";
    editor.style.minHeight = "0";
    editor.style.background = "var(--backgroundColor, #222)";
    editor.style.boxSizing = "border-box";
    editor.style.border = "1px solid var(--borderColor)";
    editor.style.position = "relative";

    const terminal = document.createElement("div");
    terminal.id = "terminal";
    terminal.style.height = "200px";
    terminal.style.background = "black"
    terminal.style.display = "flex";
    terminal.style.flexDirection = "column";
    terminal.style.overflow = "hidden";
    terminal.style.borderRadius = "8px";
    terminal.style.border = "1px solid var(--borderColor)";

    const terminalResizer = document.createElement("div");
    terminalResizer.id = "terminalResizer"
    terminalResizer.style.width = "100%";
    terminalResizer.style.height = "5px";
    terminalResizer.style.background = "var(--surfaceColor)"
    terminalResizer.style.flexShrink = "0";
    terminalResizer.style.color = "var(--fontColor)";
    terminalResizer.style.display = "flex";
    terminalResizer.style.justifyContent = "center";
    terminalResizer.style.alignItems = "center";
    
    terminal.appendChild(terminalResizer);

    const terminalContent = document.createElement("div");
    terminalContent.id = "terminalContent"
    terminalContent.style.height = "100%";
    terminalContent.style.width = "100%";
    terminalContent.style.overflow = "hidden";
    terminalContent.style.minHeight = "0";
    terminalContent.style.position = "relative";

    const terminalMain = new terminalView(terminalContent);

    terminal.appendChild(terminalContent);

    terminalResizer.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const maxHeight = window.innerHeight * 0.5
        const minHeight = 200;
        document.body.style.cursor = "row-resize";
        const terminalRect = terminal.getBoundingClientRect();

        const startY = e!.clientY;
        const startHeight = terminalRect.height;

        const move = (e: MouseEvent) => {
            const delta = e.clientY - startY;

            const newHeight = Math.min(
                maxHeight,
                Math.max(minHeight, startHeight - delta)
            );

            terminal.style.height = `${newHeight}px`;

            terminalMain.fit();
        };

        const stop = () => {
            document.removeEventListener("mousemove", move),
            document.removeEventListener("mouseup", stop);
            document.body.style.userSelect = "";
            document.body.style.cursor = "";
        };

        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", stop);
    });

    document.addEventListener("toggleTerminal", () => {
        terminalVisible = !terminalVisible

        if (terminalVisible) {
            terminal.style.display = "";
        } else {
            terminal.style.display = "none";
        }
    });

    

    fileTabs = new FileTabs(main);

    main.appendChild(editor);
    main.appendChild(terminal);
    downBar = new DownBar(main);
    notificationManager = new NotificationManager(editor);

    const notification: NotificationType = {
        title: "NQ-Studio",
        message: "Welcome Back!",
        type: "info"
    }
      
    notificationManager.notify(notification)

    const workspace = document.createElement("div");
    workspace.id = "workspace"
    workspace.style.display = "flex";
    workspace.style.flex = "1";
    workspace.style.width = "100%";
    workspace.style.maxWidth = "100%";
    workspace.style.minWidth = "0";
    workspace.style.overflow = "hidden";
    
    workspace.appendChild(main);
    secondary_side_bar = new SecondarySideBar(workspace);
    secondary_side_bar.hide();

    root.appendChild(workspace);

    document.body.appendChild(topBar);
    fileBar = new FileBar(document.body)
    document.body.appendChild(root);
    
    nqeditor = new nqEditor();
    
}

document.addEventListener("DOMContentLoaded", async () => {
    setTimeout(async () => {
        await initTheme();
        await initUI();
        await initListeners();
        await initTreeView();
    }, 0.3);
});
