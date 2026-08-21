import { SideBar } from "./ui/sidebar.js";
import { mainSideBar } from "./ui/mainSideBar.js";
import { terminalView } from "./ui/terminal/terminalView.js";
import { SecondarySideBar } from "./ui/secondaryBar.js";
import { FileBar } from "./ui/fileBar.js";
import "./monacoSetup.js";
import * as monaco from "monaco-editor";
import { buildMonacoTheme } from "./themes.js";

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
document.body.style.gap = "4px";

let side_bar: SideBar;
let nqeditor: nqEditor;
let secondary_side_bar: SecondarySideBar;
let fileBar: FileBar;
let terminalVisible = true

const filesToNotOpen = [".jpg", ".png", ".jpeg"];

let isDark: boolean;

export class nqEditor {
    private editor!: monaco.editor.IStandaloneCodeEditor;
    public filePath!: string;
    public fileContent!: string;

    constructor () {
        this.init()
    }

    async init() {
        const themeName = await setEditorTheme();

        this.editor = monaco.editor.create(document.getElementById("editor")!, {
            value: "// Welcome to NQ-Studio!\n// Open a directory or create a new project to begin!\n",
            language: "javascript",
            theme: themeName,
            automaticLayout: true,
        });
        this.fileContent = "";
        this.filePath = "";
    }

    setContent(content: string, path: string) {
        console.log("conteúdo definido!")
        this.editor.setValue(content)
        this.filePath = path;
        console.log("arquivo: ", this.fileContent);
        console.log("path: ", this.filePath);
    }

    setLanguage(language: string) {
        console.log("--- setLanguage ---")
        console.log("linguagem definida!")
        const model = this.editor.getModel()
        if (model) monaco.editor.setModelLanguage(model, language);
    }

    toLanguage(language: string): string {
        console.log("--- toLanguage ---")
        //console.log("pegando linguagem!")
        if (language === ".js" || language === ".mjs" || language === ".cjs") return "javascript";
        if (language === ".html") return "html";
        if (language === ".css") return "css";
        if (language === ".json") return "json";
        if (language === ".md") return "markdown";
        return "plaintext";
    }

    async applyTheme() {
        const themeName = await setEditorTheme();
        monaco.editor.setTheme(themeName);
    }

    get file_path() {
        return this.filePath
    }

    get file_content() {
        return this.editor.getValue()
    }

}

async function setEditorTheme(): Promise<string> {
    const settingsPath = await window.nq.getAppPath("appData") + "/nq-studio/themes.json";
    const themeToMount = await window.nq.getSetting("editor", "defaultTheme");
    const configRoot = JSON.parse(await window.nq.openFile(settingsPath));

    const resolvedKey = themeToMount === "auto"
        ? (isDark ? "dark": "light")
        : themeToMount;
    
    const config = configRoot[resolvedKey];
    const themeName = `nq-${resolvedKey}`;

    monaco.editor.defineTheme(themeName, buildMonacoTheme(config));
    return themeName;
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

async function prepareTheme() {
    document.body.style.background = "var(--backgroundColor, #1c1c1c)";
};

async function initUI() {

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
    logoSrc.src = await window.nq.resolvePath("assets/logo.png");
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

    const fileMenu = document.createElement("div");
    fileMenu.id = "fileMenu";
    fileMenu.className = "dropdown";
    fileMenu.style.position = "absolute";
    fileMenu.style.top = "100%";
    fileMenu.style.left = "0";
    fileMenu.style.display = "none";
    fileMenu.style.background = "#333";
    fileMenu.style.border = "1px solid #666";
    fileMenu.style.minWidth = "180px";
    fileMenu.style.zIndex = "1000";

    const createProjectBtn = document.createElement("button");
    createProjectBtn.id = "createProjectButton";
    createProjectBtn.innerText = "Create Project.";

    fileMenu.appendChild(createProjectBtn)

    fileBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        fileMenu.style.display =
            fileMenu.style.display === "block" ? "none": "block";
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
    
    const devMenu = document.createElement("div");
    devMenu.id = "devMenu";
    devMenu.className = "dropdown";
    devMenu.style.position = "absolute";
    devMenu.style.top = "100%";
    devMenu.style.left = "0";
    devMenu.style.display = "none";
    devMenu.style.background = "#333";
    devMenu.style.border = "1px solid #666";
    devMenu.style.minWidth = "180px";
    devMenu.style.zIndex = "1000";

    const devToolsBtn = document.createElement("button");
    devToolsBtn.id = "devToolsButton";
    devToolsBtn.innerText = "Open dev tools.";
    devToolsBtn.onclick = () => {
        document.dispatchEvent(new CustomEvent("toggleDevTools"));
    }
    
    devMenu.appendChild(devToolsBtn)
    
    devBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        devMenu.style.display =
        devMenu.style.display === "block" ? "none": "block";
    });
    
    const devContainer = document.createElement("div");
    devContainer.style.position = "relative";
    
    fileContainer.appendChild(fileBtn);
    fileContainer.appendChild(fileMenu);
    devContainer.appendChild(devBtn);
    devContainer.appendChild(devMenu);

    topBar.appendChild(logoSrc),
    topBar.appendChild(fileContainer);
    topBar.appendChild(devContainer);

    const root = document.createElement("div");
    root.id = "root";
    root.style.display = "flex";
    root.style.width = "100%";
    root.style.maxWidth = "100%";
    root.style.flex = "1";
    root.style.minHeight = "0";
    root.style.overflow = "hidden";
    root.style.boxSizing = "border-box";

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
    main.style.margin = "0 8px 0 8px";
    main.style.boxSizing = "border-box";

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

    const terminal = document.createElement("div");
    terminal.id = "terminal";
    terminal.style.height = "200px";
    terminal.style.background = "black"
    terminal.style.display = "flex";
    terminal.style.flexDirection = "column";

    const terminalResizer = document.createElement("div");
    terminalResizer.id = "terminalResizer"
    terminalResizer.style.width = "100%";
    terminalResizer.style.height = "5px";
    terminalResizer.style.background = "#333"
    terminalResizer.style.flexShrink = "0";
    
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

    const downBar = document.createElement("div");
    downBar.id = "downBar"
    downBar.style.height = "30px";
    downBar.style.flexShrink = "0";
    downBar.style.background = "var(--surfaceColor, #3c3c3c)";
    downBar.style.border = "solid 2px var(--borderColor, #666)"
    downBar.style.marginTop = "8px";
    downBar.style.borderRadius = "8px";

    main.appendChild(editor);
    main.appendChild(terminal);
    main.appendChild(downBar);

    
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

async function initListeners() {
    document.addEventListener("treeView", async () => {
        console.log(await window.nq.getRoot());
        side_bar.defineTreeView(await window.nq.getRoot());
    })
    // TODO: adicionar um check pra ver se é imagem!
    document.addEventListener("fileOpened", async (e: any) => {
        // properties
        const fileContent = e.detail.content;
        const fileType = e.detail.type;
        const filePath = e.detail.path;
        const fileName = await window.nq.getFileName(filePath);

        // debug
        console.log("arquivo aberto!");
        console.log("conteúdo: ", fileContent);
        console.log("tipo: ", fileType);
        console.log("nome do arquivo: ", fileName);

        let found = false;
        filesToNotOpen.forEach((ext) => {
            if (ext == fileType) {
                found = true;
            }
        });

        if (found) {
            console.log("é imagem!")
            if (!secondary_side_bar.isOpen()) secondary_side_bar.show(window.innerWidth * 0.4);
            secondary_side_bar.setImagePreview(filePath);
        } else {
            nqeditor.setContent(fileContent, filePath);
            const type = nqeditor.toLanguage(fileType);
            nqeditor.setLanguage(type);
            fileBar.appendFile({fileName: fileName, filePath: filePath, fileType: fileType});
        }
    });

    document.addEventListener("keydown", async (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === "s") {
            e.preventDefault()
            console.log("pedido de arquivo pra ser salvo!");
            const result = await window.nq.saveFile(nqeditor.file_path, String(nqeditor.file_content))
            if (result.success) {
                console.log("arquivo salvo!")
                if (secondary_side_bar.isOpen()) {
                    document.dispatchEvent(new CustomEvent("reloadHTML"));
                }
            }
        }
    });

    document.addEventListener("openRoot", async (e: any) => {
        await window.nq.setRoot(e.detail.path);
        await window.terminal.changeCwd(e.detail.path);
        console.log("pedido de troca de root!");
        console.log(e.detail.path);
        await side_bar.defineTreeView(e.detail.path);
        await window.nq.initNqDir();
    });

    document.addEventListener("updateTree", async () => {
        await side_bar.defineTreeView(await window.nq.getRoot());
    });

    document.addEventListener("openSecondarySideBar", () =>{
        if (!secondary_side_bar.isOpen()) secondary_side_bar.show(150);
    });

    document.addEventListener("hideSecondarySideBar", () => {
        secondary_side_bar.hide();
    });

    document.addEventListener("htmlPreview", (e: any) => {
        const html = e.detail.path;

        if (!secondary_side_bar.isOpen()) secondary_side_bar.show(344);
        secondary_side_bar.setHTMlPreview(html);
    });

    document.addEventListener("server:htmlPreview", async (e: any) => {
        await window.server.closeHttpServer();
        const url = await window.server.openHttpServer(await window.nq.getRoot());
        if (!secondary_side_bar.isOpen()) secondary_side_bar.show(344);
        secondary_side_bar.setHTMlPreview(await window.nq.joinPath(url, e.detail.path));
    });

    document.addEventListener("server:openInBrowser", async (e: any) => {
        await window.server.closeHttpServer();
        const url = await window.server.openHttpServer(await window.nq.getRoot());

        await window.nq.openInBrowser(await window.nq.joinPath(url, e.detail.path));
    });

    document.addEventListener("markdownPreview", async (e: any) => {
        if (!secondary_side_bar.isOpen()) secondary_side_bar.show(window.innerWidth * 0.4);
        secondary_side_bar.setMarkDownPreview(e.detail.path);
    });

    document.addEventListener("parseMakefile", async () => {
        const parsed = await window.make.parse(await window.nq.resolvePath(await window.nq.getRoot(), "Makefile"));
        console.log("parsed: ", parsed);
        side_bar.defineMakefileView(parsed);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    setTimeout(async () => {
        await initTheme();
        await prepareTheme();
        await initUI();
        await initListeners();
        await side_bar.defineTreeView(await window.nq.getRoot());
    }, 0.3)
})
