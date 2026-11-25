import { ipcRenderer } from "electron";

export const server = {
    /**
     * ## openHttpServer
     * Hosts a server using the specified `port`.
     * Normally used for HTML previews.
     * @param root - The directory to be hosted.
     * @param port - The server port. The default is automatic port.
     * @returns - The server URL.
     */
    openHttpServer(root: string, port: number = 0): Promise<string> {
        return ipcRenderer.invoke("server:openHttpServer", root, port);
    },

    /**
     * ## closeHttpServer
     * Closes the current server.
     * @returns - Nothing.
     */
    closeHttpServer(): Promise<void> {
        return ipcRenderer.invoke("server:closeHttpServer");
    },

    /**
     * ## getServerUrl
     * @returns - The server URL.
     */
    getServerUrl(): Promise<string> {
        return ipcRenderer.invoke("server:getHttpUrl");
    }
};