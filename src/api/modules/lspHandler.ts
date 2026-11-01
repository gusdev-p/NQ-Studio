import { LSP, type LSPType } from "./lsp";
import { BrowserWindow, ipcMain, ipcRenderer } from "electron";

export class LSPHandler {
    public lsp!: LSP;
    constructor(private verbose: boolean = false, private win: BrowserWindow, private root: string) {}
    
    public register() {
        this.lsp = new LSP(this.verbose);

        if (!this.lsp) {
            console.log("[LSP]: Can't init the LSP...");
            return;
        }

        ipcMain.on("lsp:open", async (_, path: string, text: string, languageId: string, type: LSPType = "typescript") => {
            await this.lsp.switchTo(this.win, type, this.root);

            this.lsp.openFile(path, text, languageId, type);
        });

        ipcMain.on("lsp:change", (_, path: string, version: number, text: string, type: LSPType = "typescript") => {
            this.lsp.changeFile(path, version, text, type);
        });

        ipcMain.handle("lsp:completion", async (_, path: string, line: number, character: number, type: LSPType = "typescript") => {
            return await this.lsp.completion(path, line, character, type);
        });

        ipcMain.handle("lsp:hover", async (_, path: string, line: number, character: number, type: LSPType = "typescript") => {
            return await this.lsp.hover(path, line, character, type);
        });

        ipcMain.handle("lsp:definition", async (_, path: string, line: number, character: number, type: LSPType = "typescript") => {
            return this.lsp.definition(path, line, character, type);
        });

        ipcMain.handle("lsp:kill", (_, type?: LSPType) => {
            this.lsp.stop(type);
        });
    }

    public unregister() {
        ipcMain.removeAllListeners("lsp:open");
        ipcMain.removeAllListeners("lsp:change");
        ipcMain.removeHandler("lsp:completion");
        ipcMain.removeHandler("lsp:hover");
        ipcMain.removeHandler("lsp:definition");
        ipcMain.removeHandler("lsp:kill");
    }
}