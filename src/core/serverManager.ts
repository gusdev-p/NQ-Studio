import express from "express";
import http from "http";
import { ipcMain } from "electron";

/**
 * ## Server Manager
 * Base class for host servers,
 * 
 * one class can host only one server.
 */
export class ServerManager {
    private app!: express.Express;
    private server!: http.Server;
    private url!: string;

    constructor() {
        console.log("-=- Server-manager boot! -=-")

        ipcMain.handle("server:openHttpServer", (_, root: string, port: number = 0) => {
            return this.start(root, port);
        });

        ipcMain.handle("server:closeHttpServer", () => {
            return this.stop();
        });

        ipcMain.handle("server:getHttpUrl", () => {
            return this.getUrl;
        });
    }

    /**
     * ## start
     * Hosts a server using the specified `port` and the `root`.
     * Normally used for HTML previews.
     * @param root - The directory to be hosted (ex: src).
     * @param port - The port (ex: 3000) the default is automatic.
     * @returns The server URL.
     */
    start(root: string, port: number = 0): Promise<string> {

        if (this.server?.listening) {
            return Promise.resolve(this.url);
        }

        this.app = express();
        this.app.use(express.static(root));

        return new Promise((resolve, reject) => {
            this.server = this.app.listen(port, () => {
                const address = this.server.address();

                if (address === null || typeof address === "string") {
                    reject("can't get the server port!");
                    return;
                }

                this.url = `http://localhost:${address.port}`;
                resolve(this.url);
            });

            this.server.on("error", reject);
        });
    }

    /**
     * ## stop
     * Stops the server.
     * @returns Nothing.
     */
    stop(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.server) return resolve();
            this.server.close((err) => {
                if (!err) {
                    this.url = "";
                    this.server = undefined as any;
                }

                err ? reject(err) : resolve();
            });
        });
    }

    /**
     * ## isServerRunning
     * Checks if the server is already running
     * @returns - A boolean value meaning if the server is running.
     */
    isServerRunning(): Promise<boolean> {
        return Promise.resolve(this.server.listening)
    }

    /**
     * ## getUrl
     * Returns the server URL.
     * @returns The server URL.
     */
    get getUrl() {
        return this.url;
    }
}