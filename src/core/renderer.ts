import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { SideBar } from "./ui/sidebar.js";
import { mainSideBar } from "./ui/mainSideBar.js";
import { Compartment, Extension } from "@codemirror/state";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { terminalView } from "./ui/terminal/terminalView.js";
import { tags as t } from "@lezer/highlight";
import { createTheme } from "thememirror";

document.documentElement.style.height = "100%";
document.body.style.height = "100vh";
document.body.style.margin = "0";
document.body.style.display = "flex";

let side_bar: SideBar;
let nqeditor: nqEditor;

let isDark: boolean;

const languageConf = new Compartment();


const tagMap = {
    comment: t.comment,
    variableName: t.variableName,
    string: [t.string, t.special(t.brace)],
    number: t.number,
    bool: t.bool,
    null: t.null,
    keyword: t.keyword,
    operator: t.operator,
    className: t.className,
    definitionTypeName: t.definition(t.typeName),
    typeName: t.typeName,
    angleBracket: t.angleBracket,
    tagName: t.tagName,
    attributeName: t.attributeName
};

export class nqEditor {
    private editor!: EditorView;
    public filePath!: string;
    public fileContent!: string;

    constructor () {
        this.init()
    }

    async init() {
        this.editor = new EditorView({
            doc: `// Welcome to NQ-Sudio!
// Open a directory or create a project to begin!
`,
            extensions: [
                basicSetup,
                languageConf.of(javascript()),
                await setEditorTheme()
            ],
            parent: document.getElementById("editor")!
        });
        this.fileContent = "";
        this.filePath = "";
    }

    setContent(content: string, path: string) {
        this.editor.dispatch({
            changes: {
                from: 0,
                to: this.editor.state.doc.length,
                insert: content
            }
        });
        this.filePath = path;
        console.log("arquivo: ", this.fileContent);
        console.log("path: ", this.filePath);
    }

    setLanguage(languageExtension: Extension) {
        this.editor.dispatch({
            effects: languageConf.reconfigure(languageExtension),
        })
    }

    toLanguage(language: string): Extension {
        if (language === ".js" || language === ".mjs" || language === ".cjs") {
            return javascript();
        }
        
        if (language === ".json") {
            return json();
        }

        if (language === ".html") {
            return html();
        }

        if (language === ".css") {
            return css();
        }

        return [];
    }

    get file_path() {
        return this.filePath
    }

    get file_content() {
        return this.editor.state.doc
    }
}

async function setEditorTheme() {
    const settingsPath = await window.nq.getAppPath("appData") + "/nq-studio/themes.json";
    const themeToMount = await window.nq.getSetting("editor", "defaultTheme");
    const configRoot = JSON.parse(await window.nq.openFile(settingsPath));
    if (themeToMount === "auto") {
        switch (isDark) {
            case true: {
                const config = configRoot.dark;

                const styles = Object.entries(config.styles).map(([key, color]) => ({
                    tag: tagMap[key as keyof typeof tagMap],
                    color: color as string
                }));

                const theme = createTheme({
                    variant: config.variant,
                    settings: config.settings,
                    styles
                });

                return theme;
            };
            case false: {
                const config = configRoot.light;

                const styles = Object.entries(config.styles).map(([key, color]) => ({
                    tag: tagMap[key as keyof typeof tagMap],
                    color: color as string
                }));

                const theme = createTheme({
                    variant: config.variant,
                    settings: config.settings,
                    styles
                });

                return theme;
            }
        }
    } else {
        const config = configRoot[themeToMount];

        const styles = Object.entries(config.styles).map(([key, color]) => ({
            tag: tagMap[key as keyof typeof tagMap],
            color: color as string
        }));

        const theme = createTheme({
            variant: config.variant,
            settings: config.settings,
            styles
        });

        return theme;
    }
}

async function initTheme() {
    const themeRoot = await window.nq.getTheme();
    const theme = themeRoot.theme

    isDark = themeRoot.isDark

    Object.entries(theme).forEach(([key, value]: [string, any]) => {
        document.body.style.setProperty(key, value);
        console.log("definido: ", key, value);
    });
};

async function prepareTheme() {
    document.body.style.background = "var(--backgroundColor, #1c1c1c)";
};

async function initUI() {
    new mainSideBar(document.body);

    side_bar = new SideBar(document.body);

    const main = document.createElement("div");
    main.id = "main";
    main.style.display = "flex";
    main.style.flexDirection = "column";
    main.style.flex = "1";
    main.style.margin = "0 8px 0 8px";

    const editor = document.createElement("div");
    editor.id = "editor";
    editor.style.flex = "1";
    editor.style.borderRadius = "8px";
    editor.style.overflow = "hidden";
    editor.style.overflowY = "auto";
    editor.style.minHeight = "0";
    editor.style.background = "var(--backgroundColor, #222)";

    const terminal = document.createElement("div");
    terminal.id = "terminal";
    terminal.style.height = "200px";
    terminal.style.background = "black"
    terminal.style.display = "flex";
    terminal.style.flexDirection = "column";
    //terminal.style.borderRadius = "20px";

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

    document.body.appendChild(main);

    nqeditor = new nqEditor();
}

async function initListeners() {
    document.addEventListener("treeView", async () => {
        console.log(window.nq.getRoot());
        side_bar.defineTreeView(await window.nq.getRoot());
    })
    // TODO: adicionar um check pra ver se é imagem!
    document.addEventListener("fileOpened", (e: any) => {
        const fileContent = e.detail.content;
        const fileType = e.detail.type;
        const filePath = e.detail.path;
        console.log("arquivo aberto!");
        console.log("conteúdo: ", fileContent);
        console.log("tipo: ", fileType);
        nqeditor.setContent(fileContent,filePath);
        nqeditor.setLanguage(nqeditor.toLanguage(fileType));
    });

    document.addEventListener("keydown", async (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === "s") {
            e.preventDefault()
            console.log("pedido de arquivo pra ser salvo!");
            const result = await window.nq.saveFile(nqeditor.file_path, String(nqeditor.file_content))
            if (result.success) {
                console.log("arquivo salvo!")
            }
        }
    });

    document.addEventListener("openRoot", async (e: any) => {
        await window.nq.setRoot(e.detail.path);
        await window.terminal.create(e.detail.path);
        //console.log("pedido de troca de root!");
        console.log(e.detail.path);
        await side_bar.defineTreeView(e.detail.path);
    });

    document.addEventListener("updateTree", async () => {
        await side_bar.defineTreeView(await window.nq.getRoot());
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    await initTheme();
    prepareTheme();
	initUI();
    initListeners();
    await side_bar.defineTreeView(".");
})
