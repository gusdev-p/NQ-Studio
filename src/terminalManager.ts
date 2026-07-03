import { BrowserWindow, ipcMain } from "electron";
import * as pty  from "node-pty";
import type { IPty } from "node-pty";
import { settingsManager } from "./main";

export class terminalManager {
    private pty: IPty | null = null;

    constructor (win: BrowserWindow) {
        
        ipcMain.handle("terminal:create", (_, cwd: string) => {
            this.create(cwd, win);
            return true;
        });

        ipcMain.on("terminal:write", (_, data) => {
            this.pty?.write(data);
        });

        ipcMain.on("terminal:resize", (_, cols, rows) => {
            this.pty?.resize(cols, rows);
        });
    }

    create(cwd: string, win: BrowserWindow) {
        console.log(pty);
        this.pty?.kill();
        
        const shell =
            process.platform === "win32"
                ? settingsManager.get("console", "windows", "shell")
                : settingsManager.get("console", "linux", "shell");
        
        this.pty = pty.spawn(shell, [], {
                    cwd: cwd,
                    env: process.env,
                    cols: 80,
                    rows: 9,
                });
        
        this.pty.onData(data => {
            win.webContents.send("terminal:data", data);
        });
    }
}