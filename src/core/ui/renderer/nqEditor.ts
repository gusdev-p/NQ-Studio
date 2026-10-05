import { basicSetup, EditorView } from "codemirror";
import { EditorState, Compartment, type Extension } from "@codemirror/state";
import { keymap, hoverTooltip, type Tooltip } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { linter, setDiagnostics, type Diagnostic } from "@codemirror/lint";
import { autocompletion, CompletionContext } from "@codemirror/autocomplete";

import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { setEditorTheme } from "../../renderer";

export class nqEditor {
    private view!: EditorView;
    public filePath = "";
    public ready: Promise<void>;
    private version = 1;

    private themeCompartment = new Compartment();
    private languageCompartment = new Compartment();
    private themeExt: Extension = [];

    constructor() {
        this.ready = this.init();
    }

    public buildState(doc: string): EditorState {
        return EditorState.create({
            doc,
            extensions: [
                basicSetup,
                keymap.of([indentWithTab]),
                autocompletion({
                    override: [
                        async (context) => {
                            const line = context.state.doc.lineAt(context.pos);

                            const lineText = line.text;
                            const character = context.pos - line.from;

                            console.log("[CM]: Requesting completion...");

                            const result = await window.lsp.completion(
                                this.filePath,
                                line.number - 1,
                                character
                            );

                            console.log("[CM]: Completion result:", result);

                            if (!result) return null;

                            const items = Array.isArray(result)
                                ? result
                                : result.items;
                            
                                return {
                                    from: context.matchBefore(/\w*/)?.from ?? context.pos,
                                    options: items.map((item: any) => ({
                                        label: item.label,
                                        type: item.kind === 3 ? "function" : "variable",
                                        detail: item.detail,
                                        info: item.documentation
                                    }))
                                };
                        }
                    ]
                }),
                this.languageCompartment.of([]),
                this.themeCompartment.of(this.themeExt),
                linter(() => []),
                EditorView.updateListener.of((update) => {
                    if (!update.docChanged) return;

                    this.version++;

                    const text = update.state.doc.toString();

                    document.dispatchEvent(new CustomEvent("fileModified", {
                        detail: {
                            path: this.filePath
                        }
                    }));

                    if (this.filePath) {
                        window.lsp.change(
                            this.filePath,
                            this.version,
                            text
                        );
                    }
                }),
            ],
        });
    }

    async init() {
        this.themeExt = await setEditorTheme();

        this.view = new EditorView({
            parent: document.getElementById("editor")!,
            state: this.buildState(
                "// Welcome to NQ-Studio!\n// Open a directory of create a new project to begin!"
            ),
        });

        this.setLanguage("javascript");
        this.filePath = "";

        window.lsp.onDiagnostics(async (uri, diagnostics) => {
            if (!this.filePath) return;

            const currentUri = await window.nq.pathToUri(this.filePath);

            if (uri !== currentUri) return;

            this.setDiagnostics(diagnostics);
        });
    }

    setContent(content: string, path: string) {
        this.filePath = path;
        this.version = 1;

        this.view.setState(this.buildState(content));

        if (path) {
            window.lsp.open(
                this.filePath,
                content,
                this.toLanguage(
                    path.substring(path.lastIndexOf("."))
                )
            );
        }
    }

    getContent(): string {
        return this.view.state.doc.toString();
    }

    setLanguage(language: string) {
        const ext: Extension = ({
            javascript: javascript(),
            typescript: javascript({
                typescript: true
            }),
            html: html(),
            css: css(),
            json: json(),
            markdown: markdown(),
        } as Record<string, Extension>)[language] ?? [];

        this.view.dispatch({
            effects: this.languageCompartment.reconfigure(ext),
        });
    }

    toLanguage(ext: string): string {
        if ([".js", ".mjs", ".cjs"].includes(ext)) return "javascript";
        if ([".ts", ".mts", ".cts"].includes(ext)) return "typescript";
        if (ext === ".html") return "html";
        if (ext === ".css") return "css";
        if (ext === ".json") return "json";
        if (ext === ".md") return "markdown";
        return "plaintext";
    }

    async applyTheme() {
        this.themeExt = await setEditorTheme();
        this.view.dispatch({
            effects: this.themeCompartment.reconfigure(this.themeExt),
        });
    }

    setDiagnostics(diagnostics: any[]) {
        const result: Diagnostic[] = [];

        for (const diagnostic of diagnostics) {
            const startLine = diagnostic.range.start.line + 1;
            const endLine = diagnostic.range.end.line + 1;

            const start = this.view.state.doc.line(startLine);
            const end = this.view.state.doc.line(endLine);

            const from = start.from + diagnostic.range.start.character;
            const to = end.from + diagnostic.range.end.character;

            result.push({
                from,
                to,
                severity:
                    diagnostic.severity === 1
                        ? "error"
                        : diagnostic.severity === 2
                            ? "warning"
                            : "info",
                message: diagnostic.message
            });
        }

        this.view.dispatch(
            setDiagnostics(
                this.view.state,
                result
            )
        );
    }

    private getHoverText(result: any): string {
        const contents = result.contents;

        if (!contents) return "";

        if (typeof contents === "string") return contents;

        if (Array.isArray(contents)) {
            return contents.map((item: any) => {
                if (typeof item === "string") return item;

                return item.value ?? "";
            }).join("\n\n");
        }

        if (contents.value) return contents.value;

        return "";
    }
}