import { BrowserWindow, ipcMain } from "electron";

export class WindowManager {

	constructor(private verbose: boolean, public mainWindow: BrowserWindow) {
		this.register();
	}
	
	public register() {
		ipcMain.handle("window:maximize", (e) => {
			this.mainWindow.maximize();
		});

		ipcMain.handle("window:restore", (e) => {
			this.mainWindow.unmaximize();
		});

		ipcMain.handle("window:minimize", (e) => {
			this.mainWindow.minimize();
		});

		ipcMain.handle("window:maximized", (e) => {
			return this.mainWindow.isMaximized()
		});

		ipcMain.handle("window:minimized", (e) => {
			return this.mainWindow.isMinimized();
		});

		ipcMain.handle("window:shutdown", (e) => {
			this.mainWindow.webContents.send("nq:shutdown");
		})
	}

	public unregister() {
		ipcMain.removeHandler("window:maximize");
		ipcMain.removeHandler("window:restore");
		ipcMain.removeHandler("window.minimize");
		ipcMain.removeHandler("window:maximized");
		ipcMain.removeHandler("window:minimized");
		ipcMain.removeHandler("window:shutdown");
	}
}