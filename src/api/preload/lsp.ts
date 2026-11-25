import { ipcRenderer } from "electron";

export type LSPType = "typescript" | "html" | "css" | "json";

export const lsp = {
    open(path: string, text: string, languageId: string, type: LSPType = "typescript") {
        ipcRenderer.send("lsp:open", path, text, languageId, type);
    },

    change(path:string, version: number, text: string, type: LSPType = "typescript") {
        ipcRenderer.send("lsp:change", path, version, text, type);
    },

    completion(path: string, line: number, character: number, type: LSPType = "typescript") {
        return ipcRenderer.invoke("lsp:completion", path, line, character, type);
    },

    hover(path: string, line: number, character: number, type: LSPType = "typescript") {
        return ipcRenderer.invoke("lsp:hover", path, line, character, type);
    },

    definition(path: string, line: number, character: number, type: LSPType = "typescript") {
        return ipcRenderer.invoke("lsp:definition", path, line, character, type);
    },

    onDiagnostics(callback: (uri: string, diagnostics: any[]) => void | Promise<void>) {
        ipcRenderer.on("lsp:diagnostics", (_, uri, diagnostics) => {
            callback(uri, diagnostics);
        });
    },

    kill(type?: LSPType) {
        return ipcRenderer.invoke("lsp:kill", type);
    }
}