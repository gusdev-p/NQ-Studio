import { ipcRenderer } from "electron";

export const windowManager = {
	/**
	* ## Maximize
	* Maximizes the window.
	*/
	maximize(): Promise<void> {
		return ipcRenderer.invoke("window:maximize");
	},

	/**
	* ## Restore
	* Restores the window.
	*/
	restore(): Promise<void> {
		return ipcRenderer.invoke("window:restore");
	},

	/**
	* ## Minimize
	* Minimizes the window
	*/
	minimize(): Promise<void> {
		return ipcRenderer.invoke("window:minimize");
	},

	/**
	* ## Is maximized
	* Return a boolean value that means if the window is maximized.
	*/
	isMaximized(): Promise<boolean> {
		return ipcRenderer.invoke("window:maximized");
	},

	/**
	* ## Is minimized
	* Return a boolean value that means if the window is minimized.
	*/
	isMinimized(): Promise<boolean> {
		return ipcRenderer.invoke("window:minimized");
	},

    /**
     * ## Shutdown
     * Try to shutdown the IDE peacefully.
     */
    shutdown() {
        return ipcRenderer.invoke("window:shutdown");
    }
}