import { BrowserWindow, ipcMain } from "electron";
import * as pty  from "node-pty";
import type { IPty } from "node-pty";
import { settingsManager } from "../../core/settings/settingsManager";

export class terminalManager {
    private pty: IPty | null = null;

    constructor (win: BrowserWindow) {
        console.log("-=- Terminal-manager boot! -=-");
        
        try {
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

            ipcMain.handle("terminal:cwdNew", (_, newCwd: string) => {
                this.changeCwd(newCwd);
            });

			ipcMain.handle("terminal:exec", (_, command: string) => {
				if (!command.endsWith("\n")) {
					command += "\n";
				}

				this.pty?.write(command);
			});
        } catch (e) {
            console.warn("[TERMINAL]: ", e);
        }
    }

    create(cwd: string, win: BrowserWindow) {
        this.pty?.kill();
        this.spawn(cwd, win);
    }

    private spawn(cwd: string, win: BrowserWindow) {
        const shell = 
            process.platform === "win32"
                ? settingsManager.get("Console", "Shell", "Windows")
                : settingsManager.get("Console", "Shell", "Linux");
        
        this.pty = pty.spawn(shell, [], {
            cwd,
            env: process.env,
            cols: 80,
            rows: 9
        });

        const currentPty = this.pty;

        currentPty.onData(data => {
            win.webContents.send("terminal:data", data);
        });

        currentPty.onExit(({exitCode, signal}) => {
            console.log("terminal killed :0", exitCode, signal);

            if (this.pty !== currentPty) return;

            this.pty = null;

            if (!win.isDestroyed()) {
                this.spawn(cwd, win);
            }
        })
    }

    changeCwd(newCwd: string) {
        if (!this.pty) return;

        const cdCommand =
            process.platform === "win32"
                ? `cd /d "${newCwd}"`
                : `cd ${newCwd}`;
        
        this.pty.write(cdCommand + "\n");
    }

    delete() {
        this.pty?.kill();
    }

    public unregister() {
        ipcMain.removeAllListeners("terminal:write");
        ipcMain.removeAllListeners("terminal:resize");
        ipcMain.removeHandler("terminal:create");
        ipcMain.removeHandler("terminal:cwdNew");
		ipcMain.removeHandler("terminal:exec");
    }
}