import { ipcRenderer } from "electron";

export const terminal = {
    create(cwd: string) {
        return ipcRenderer.invoke("terminal:create", cwd);
    },

    write(data: string) {
        ipcRenderer.send("terminal:write", data);
    },

	kill() {
		ipcRenderer.invoke("terminal:killActive");
	},

    resize(cols: number, rows: number) {
        ipcRenderer.send("terminal:resize", cols, rows);
    },

    onData(callback: (data: string) => void) {
        ipcRenderer.on("terminal:data", (_, data) => {
            callback(data);
        });
    },

    executeInTerminal(command: string) {
        ipcRenderer.invoke("terminal:exec", command);
    },

    changeCwd(newCwd: string) {
        ipcRenderer.invoke("terminal:cwdNew", newCwd);
    }
};