import * as monaco from "monaco-editor";
import "../../monacoSetup.js";
import { setEditorTheme } from "../../renderer.js";

export class nqEditor {
    private editor!: monaco.editor.IStandaloneCodeEditor;
    public filePath!: string;
    public fileContent!: string;
    private settingContent = false;

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

        this.editor.onDidChangeModelContent(() => {
            if (this.settingContent) return;

            document.dispatchEvent(new CustomEvent("fileModified", {
                detail: {
                    path: this.filePath
                }
            }));
        });
    }

    setContent(content: string, path: string) {
        this.settingContent = true;

        console.log("conteúdo definido!")
        this.editor.setValue(content)
        this.filePath = path;
        console.log("arquivo: ", this.fileContent);
        console.log("path: ", this.filePath);

        this.settingContent = false;
    }

    getContent(): string {
        return this.editor.getValue();
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

}