import { basicSetup, EditorView } from "codemirror";
import { EditorState, Compartment, type Extension, EditorSelection } from "@codemirror/state";
import { keymap, hoverTooltip } from "@codemirror/view";
import { indentLess, indentMore } from "@codemirror/commands";
import { setDiagnostics, type Diagnostic } from "@codemirror/lint";
import { autocompletion, acceptCompletion, completionStatus, type Completion } from "@codemirror/autocomplete";
import { indentUnit } from "@codemirror/language";

import hljs from "highlight.js/lib/common";
import { showMinimap } from "@replit/codemirror-minimap";

import { marked } from "marked";
import DOMPurify from "dompurify";

import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { jsonc } from "@platformos/lang-jsonc";
import { makefile } from "codemirror-lang-makefile";

import { fileTabs, setEditorTheme } from "../../renderer";
import { ChangeLanguage, FileModified } from "../../../events/editor";
import { TabOpen } from "../../../events/tabs";

type LSPType = "typescript" | "css" | "html" | "json";

let create = (v:EditorView) => {
    const dom = document.createElement("div");
    return { dom };
}

export class nqEditor {
    private view!: EditorView;
    public filePath = "";
    public ready: Promise<void>;
    private version = 1;

    private themeCompartment = new Compartment();
    private languageCompartment = new Compartment();
    private themeExt: Extension = [];

    private autoSaveTimer?: ReturnType<typeof setTimeout> | undefined;

    private lspType: LSPType | null = null;
    private lspOpenRequest = 0;

    private minimapCompartment = new Compartment();
    private minimapGutters: Record<number, string> = {};

    constructor() {
        this.ready = this.init();
    }

    public buildState(doc: string): EditorState {
        return EditorState.create({
            doc,
            extensions: [
                basicSetup,
                indentUnit.of("\t"),
                this.minimapCompartment.of(
                    showMinimap.compute(["doc"], () => ({
                        create,
                        displayText: "blocks",
                        showOverlay: "always",
                        gutters: []
                    }))
                ),
                keymap.of([
                    {
                        key: "Tab",
                        run: (view) => {
                            if (completionStatus(view.state) === "active") {
                                return acceptCompletion(view);
                            }

                            return indentMore(view);
                        }
                    },
                    {
                        key: "Shift-Tab",
                        run: indentLess
                    },
                    {
                        key: "Shift-F12",
                        run: () => {
                            void this.jumpToReference();
                            return true;
                        }
                    }
                ]),
                autocompletion({
                    activateOnTyping: true,
                    activateOnTypingDelay: 50,
                    selectOnOpen: true,
                    override: [
                        async (context) => {
                            const word = context.matchBefore(/[\w$]+/);

                            if (!context.explicit && !word) {
                                return null;
                            }

                            if (!this.lspType || !this.filePath) {
                                return null;
                            }

                            console.log("[CM]: Requesting completion...");

                            const line = context.state.doc.lineAt(context.pos);
                            const character = context.pos - line.from;

                            const result = await window.lsp.completion(
                                this.filePath,
                                line.number - 1,
                                character,
                                this.lspType
                            );

                            console.log("[CM]: Completion result:", result);

                            if (!result) return null;

                            const items = Array.isArray(result)
                                ? result
                                : result.items;

                            if (!items?.length) return null;

                            return {
                                from: word?.from ?? context.pos,
                                options: items.map((item: any) => ({
                                    label: item.label,
                                    type: ({
                                        2: "variable",
                                        3: "function",
                                        4: "class",
                                        6: "variable",
                                        7: "class",
                                        10: "property",
                                        14: "keyword"
                                    } as Record<number, string>)[item.kind] ?? "text",
                                    detail: item.detail,
                                    info: item.documentation?.value ?? item.documentation,
                                    apply: (
                                        view: EditorView,
                                        _: Completion,
                                        from: number,
                                        to: number
                                    ) => {
                                        const toOffset = (position: any) =>
                                            view.state.doc.line(position.line + 1).from
                                            + position.character;

                                        const range = item.textEdit?.range
                                            ?? item.textEdit?.replace;

                                        const changes = [
                                            {
                                                from: range ? toOffset(range.start) : from,
                                                to: range ? toOffset(range.end) : to,
                                                insert: item.textEdit?.newText
                                                    ?? item.insertText
                                                    ?? item.label
                                            },
                                            ...(item.additionalTextEdits ?? []).map((edit: any) => ({
                                                from: toOffset(edit.range.start),
                                                to: toOffset(edit.range.end),
                                                insert: edit.newText
                                            }))
                                        ];

                                        view.dispatch({ changes });
                                    }
                                }))
                            };
                        }
                    ]
                }),
                hoverTooltip(async (view, pos) => {
                  if (!this.filePath) return null;

                  const line = view.state.doc.lineAt(pos);
                  const character = pos - line.from;

                  if (!this.filePath || !this.lspType) return null;

                  const result = await window.lsp.hover(
                    this.filePath,
                    line.number - 1,
                    character,
                    this.lspType
                  );

                  if (!result?.contents) return null;

                  const contents = result.contents;

                  let text: string;

                  if (typeof contents === "string") {
                    text = contents;
                  } else if (Array.isArray(contents)) {
                    text = contents.map((item: any) => {
                      typeof item === "string"
                        ? item
                        : item.language
                          ? `${item.language}\n${item.value}`
                          : item.value
                    }).join("\n\n");
                  } else {
                    text = contents.value ?? "";
                  }

                  if (!text) return null;

                  const html = await marked.parse(text);

                  console.log("[LSP HOVER]: markdown raw:", text);
                  console.log("[LSP HOVER]: markdown to html:", html);

                  const sanitized = DOMPurify.sanitize(html);

                  return {
                    pos,
                    create() {
                      const dom = document.createElement("div");

                      dom.className = "nq-lsp-hover";
                      dom.innerHTML = sanitized;

                      dom.querySelectorAll("pre code").forEach((block) => {
                       const code = block as HTMLElement;

                        console.log("Linguagem pra highlight:", code.className);
                        console.log("é suportado?", hljs.getLanguage("typescript"));

                        hljs.highlightElement(code);

                        console.log("Novo code:", code.innerHTML);
                      });

                      dom.querySelectorAll("a").forEach((block) => {
                        const a = block as HTMLAnchorElement;

                        a.addEventListener("click", (e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            window.nq.openInBrowser(a.href);
                        });
                      });

                      console.log("resultado:", dom.innerHTML);

                      return { dom };
                    }
                  }
                }),
                this.languageCompartment.of([]),
                this.themeCompartment.of(this.themeExt),
                // linter(() => []),
                EditorView.updateListener.of(async (update) => {
                    if (!update.docChanged) return;

                    this.version++;

                    const text = update.state.doc.toString();

                    if (this.filePath && this.lspType) {
                        window.lsp.change(
                            this.filePath,
                            this.version,
                            text,
                            this.lspType
                        );
                    }

                    const autoSave = await window.nq.getSetting("Editor", "Auto Save");
                    const autoSaveDelay = await window.nq.getSetting("Editor", "Auto Save Delay");

                    console.log(autoSave, autoSaveDelay);

                    if (this.autoSaveTimer) {
                        clearTimeout(this.autoSaveTimer);
                        this.autoSaveTimer = undefined;
                    }

                    if (autoSave && autoSaveDelay !== null) {
                        const targetPath = this.filePath;
                        const targetText = text;

                        this.autoSaveTimer = setTimeout(async () => {
                            try {
                                if (!targetPath) return;

                                const result = await window.nq.saveFile(
                                    targetPath,
                                    targetText
                                );

                                if (!result.success) {
                                    console.error(
                                        "[Auto Save]: Failed:",
                                        targetPath,
                                        result.error
                                    );
                                    return;
                                }

                                console.log("[Auto Save]: Saved:", targetPath);
                                fileTabs.setModified(targetPath, false);
                            } catch (e) {
                                console.error("[Auto Save]: Error:", e);
                            } finally {
                                this.autoSaveTimer = undefined;
                            }
                        }, autoSaveDelay);
                    }
                    
                    FileModified(this.filePath);
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

    async jumpToReference(pos = this.view.state.selection.main.head) {
        if (!this.filePath || !this.lspType) return;

        const line = this.view.state.doc.lineAt(pos);
        const character = pos - line.from;

        const result = await window.lsp.definition(
            this.filePath,
            line.number - 1,
            character,
            this.lspType
        );

        if (!result) return;

        const location = Array.isArray(result) ? result[0] : result;

        if (!location) return;

        const uri: string | undefined = location.targetUri ?? location.uri;

        const range = location.targetSelectionRange ?? location.range;

        if (!uri || !range) return;

        const targetPath = decodeURIComponent(new URL(uri).pathname);

        await fileTabs.addFile(targetPath, targetPath);
        TabOpen(targetPath, this.filePath, targetPath);

        if (targetPath !== this.filePath) {
            await new Promise<void>((resolve) => {
                const check = () => {
                    if (this.filePath === targetPath) {
                        resolve();
                        return;
                    }

                    requestAnimationFrame(check);
                };

                check();
            });
        }

        this.goToLine(
            range.start.line + 1,
            range.start.character + 1
        );
    }

    setContent(content: string, path: string) {
        this.filePath = path;
        this.version = 1;

        this.view.setState(this.buildState(content));

        const ext = path.substring(path.lastIndexOf("."));
        const fileName = path.substring(path.lastIndexOf("/") + 1);
        
        this.setLanguage(this.toLanguage(ext, fileName));

        const type = this.toLSPType(path);
        const request = ++this.lspOpenRequest;

        this.lspType = type;

        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
            this.autoSaveTimer = undefined;
        }

        void this.activateLSP(path, content, type, request);
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
            jsonc: jsonc(),
            markdown: markdown(),
            makefile: makefile(),
        } as Record<string, Extension>)[language] ?? [];

        this.view.dispatch({
            effects: this.languageCompartment.reconfigure(ext),
        });

        ChangeLanguage(language);
    }

    toLanguage(ext: string, fileName: string): string {
        if ([".js", ".mjs", ".cjs"].includes(ext)) return "javascript";
        if ([".ts", ".mts", ".cts"].includes(ext)) return "typescript";
        if (ext === ".html") return "html";
        if (ext === ".css") return "css";
        if (ext === ".json") return "json";
        if (ext === ".jsonc") return "jsonc";
        if (ext === ".md") return "markdown";
        if (fileName.toLowerCase() === "makefile") return "makefile";
        return "plaintext";
    }

    goToLine(line: number, column: number) {
      const lineInfo = this.view.state.doc.line(line);

      const pos = Math.min(
        lineInfo.from + column - 1,
        lineInfo.to
      );

      this.view.dispatch({
        selection: EditorSelection.cursor(pos),
        effects: EditorView.scrollIntoView(pos, {
          y: "center"
        })
      });

      this.view.focus();
    }

    async applyTheme() {
        this.themeExt = await setEditorTheme();
        this.view.dispatch({
            effects: this.themeCompartment.reconfigure(this.themeExt),
        });
    }

    setDiagnostics(diagnostics: any[]) {
        const result: Diagnostic[] = [];
        const gutters: Record<number, string> = {};

        for (const diagnostic of diagnostics) {
            const startLine = diagnostic.range.start.line + 1;
            const endLine = diagnostic.range.end.line + 1;

            const start = this.view.state.doc.line(startLine);
            const end = this.view.state.doc.line(endLine);

            const from = start.from + diagnostic.range.start.character;
            const to = end.from + diagnostic.range.end.character;

            const color =
                diagnostic.severity === 1 ? "#FF4444" :
                diagnostic.severity === 2 ? "#FFAA00" :
                "#4488FF";

            const priority = {
                "#4488FF": 1,
                "#FFAA00": 2,
                "#FF4444": 3
            };

            if (!gutters[startLine] || priority[color as keyof typeof priority] > priority[gutters[startLine] as keyof typeof priority]) {
                gutters[startLine] = color;
            }

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

        this.setMinimapGutters(gutters);

        this.view.dispatch(
            setDiagnostics(
                this.view.state,
                result
            )
        );
    }

    public setMinimapGutters(gutters: Record<number, string>) {
        this.minimapGutters = gutters;

        this.view.dispatch({
            effects: this.minimapCompartment.reconfigure(
                showMinimap.compute(["doc"], () => ({
                    create,
                    displayText: "blocks",
                    showOverlay: "always",
                    gutters: [this.minimapGutters]
                }))
            )
        })
    }

    private toLSPType(path: string): LSPType | null {
        const ext = path.substring(path.lastIndexOf("."));

        if ([".js", ".mjs", ".cjs", ".ts", ".mts", ".cts"].includes(ext)) {
            return "typescript";
        }

        if (ext === ".html") {
            return "html";
        }

        if (ext === ".css") {
            return "css";
        }

        if ([".json", ".jsonc"].includes(ext)) {
            return "json"
        }

        return null;
    }

    private async activateLSP(path: string, content: string, type: LSPType | null, request: number) {
        if (!type) {
            await window.lsp.kill();
            return;
        }

        if (request !== this.lspOpenRequest) return;

        const ext = path.substring(path.lastIndexOf("."));

        const languageId =
            type === "html" ? "html" :
            type === "css" ? "css" :
            type === "json" && ext === ".jsonc" ? "jsonc" :
            type === "json" ? "json" :
            [".ts", ".mts", ".cts"].includes(ext) ? "typescript" :
            "javascript";
        

        console.log(`[LSP OPEN]:`, path, languageId, type);
        
        await window.lsp.open(path, content, languageId, type);
    }
}
